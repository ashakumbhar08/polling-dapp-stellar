/**
 * PollContext — manages active poll state, vote counts, and the voting flow.
 * Transaction status UI is handled in Phase 5; here we expose txStatus/txHash/txError
 * so TransactionStatus can consume them later.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useWallet } from './WalletContext.jsx'
import {
  buildVoteTransaction,
  submitSignedTransaction,
  simulateGetResults,
  simulateHasVoted,
} from '../utils/contract.js'
import { subscribeToContractEvents } from '../utils/horizon.js'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { NETWORK_PASSPHRASE, CONTRACT_ID } from '../utils/config.js'

// Transaction state machine values
export const TxStatus = {
  IDLE: 'IDLE',
  BUILDING: 'BUILDING',
  SIGNING: 'SIGNING',
  SUBMITTING: 'SUBMITTING',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
}

const PollContext = createContext(null)

export function PollProvider({ children }) {
  const { publicKey, isConnected } = useWallet()

  // Active poll metadata — set externally (e.g. from App or a poll loader)
  const [activePoll, setActivePoll] = useState(null)

  // Vote counts array — one entry per option
  const [voteCounts, setVoteCounts] = useState([])

  // Whether the connected wallet has already voted
  const [hasVoted, setHasVoted] = useState(false)

  // Whether the poll is closed
  const [isClosed, setIsClosed] = useState(false)

  // Loading flag for async operations
  const [isLoading, setIsLoading] = useState(false)

  // Transaction status tracking
  const [txStatus, setTxStatus] = useState(TxStatus.IDLE)
  const [txHash, setTxHash] = useState(null)
  const [txError, setTxError] = useState(null)

  // ------------------------------------------------------------------
  // Fetch results + hasVoted whenever poll or wallet changes
  // ------------------------------------------------------------------
  const refreshResults = useCallback(async (pollId) => {
    if (pollId == null) return
    try {
      const counts = await simulateGetResults(pollId)
      setVoteCounts(counts)
    } catch (err) {
      console.error('simulateGetResults error:', err)
    }
  }, [])

  const refreshHasVoted = useCallback(async (pollId, address) => {
    if (pollId == null || !address) return
    try {
      const voted = await simulateHasVoted(pollId, address)
      setHasVoted(voted)
    } catch (err) {
      console.error('simulateHasVoted error:', err)
    }
  }, [])

  useEffect(() => {
    if (!activePoll) return
    refreshResults(activePoll.id)
  }, [activePoll, refreshResults])

  useEffect(() => {
    if (!activePoll || !publicKey) {
      setHasVoted(false)
      return
    }
    refreshHasVoted(activePoll.id, publicKey)
  }, [activePoll, publicKey, refreshHasVoted])

  // ------------------------------------------------------------------
  // Real-time: SSE subscription + visibilitychange re-fetch
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!activePoll || !isConnected) return

    // onUpdate: called by SSE on each new ledger event
    const onUpdate = () => refreshResults(activePoll.id)

    const cleanup = subscribeToContractEvents(CONTRACT_ID, onUpdate)

    // Re-fetch immediately when tab regains focus
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        refreshResults(activePoll.id)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cleanup()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [activePoll, isConnected, refreshResults])

  // ------------------------------------------------------------------
  // castVote — full BUILD → SIGN → SUBMIT flow
  // ------------------------------------------------------------------
  const castVote = useCallback(
    async (pollId, optionIndex) => {
      if (!isConnected || !publicKey) return
      if (hasVoted || isClosed) return

      // Reset any previous tx state
      setTxStatus(TxStatus.IDLE)
      setTxHash(null)
      setTxError(null)

      try {
        // 1. BUILD
        setTxStatus(TxStatus.BUILDING)
        setIsLoading(true)
        const xdr = await buildVoteTransaction(publicKey, pollId, optionIndex)

        // 2. SIGN via wallet
        setTxStatus(TxStatus.SIGNING)
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
        })

        // 3. SUBMIT
        setTxStatus(TxStatus.SUBMITTING)
        setTxStatus(TxStatus.PENDING)
        const { hash } = await submitSignedTransaction(signedTxXdr)

        // 4. SUCCESS
        setTxHash(hash)
        setTxStatus(TxStatus.SUCCESS)

        // Optimistic update — mark as voted immediately
        setHasVoted(true)

        // Refresh actual counts from chain
        await refreshResults(pollId)
      } catch (err) {
        const msg = mapError(err)
        setTxError(msg)
        setTxStatus(TxStatus.FAILED)
        console.error('castVote error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, publicKey, hasVoted, isClosed, refreshResults]
  )

  // ------------------------------------------------------------------
  // Error mapping (spec-defined)
  // ------------------------------------------------------------------
  function mapError(err) {
    const msg = err?.message ?? String(err)
    if (/user.*closed|rejected|cancel/i.test(msg)) return 'Transaction cancelled by user'
    if (/op_underfunded/i.test(msg)) return 'Insufficient XLM for transaction fees'
    if (/already_voted/i.test(msg)) return 'You have already voted in this poll'
    if (/timeout|network/i.test(msg)) return 'Network error — please try again'
    return msg || 'An unexpected error occurred'
  }

  return (
    <PollContext.Provider
      value={{
        activePoll,
        setActivePoll,
        voteCounts,
        hasVoted,
        isClosed,
        setIsClosed,
        isLoading,
        txStatus,
        txHash,
        txError,
        castVote,
        refreshResults,
        resetTxStatus: () => {
          setTxStatus(TxStatus.IDLE)
          setTxHash(null)
          setTxError(null)
        },
      }}
    >
      {children}
    </PollContext.Provider>
  )
}

export function usePoll() {
  const ctx = useContext(PollContext)
  if (!ctx) throw new Error('usePoll must be used inside PollProvider')
  return ctx
}
