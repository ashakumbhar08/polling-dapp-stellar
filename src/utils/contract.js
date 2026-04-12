/**
 * contract.js — All Soroban PollContract interactions.
 * No contract logic lives outside this file.
 */
import {
  rpc,
  TransactionBuilder,
  Networks,
  Operation,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk'
import { CONTRACT_ID, NETWORK_PASSPHRASE } from './config.js'

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------
const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org'
export const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false })

// Base fee in stroops (0.0001 XLM)
const BASE_FEE = '100'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal TransactionBuilder for a given source account */
async function loadAccount(publicKey) {
  return server.getAccount(publicKey)
}

/** Wrap a contract call as an invokeContractFunction operation */
function contractOp(functionName, args) {
  return Operation.invokeContractFunction({
    contract: CONTRACT_ID,
    function: functionName,
    args,
  })
}

// ---------------------------------------------------------------------------
// Read-only (simulation) calls
// ---------------------------------------------------------------------------

/**
 * simulateGetResults(pollId) → number[]
 * Returns vote count per option as a plain JS number array.
 */
export async function simulateGetResults(pollId) {
  // We need any valid account to build the tx — use a well-known testnet account
  // that always exists, or fall back to a dummy if none provided.
  const sourceAccount = await server.getAccount(
    'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN' // testnet friendbot funded
  ).catch(() => null)

  if (!sourceAccount) throw new Error('Cannot load source account for simulation')

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contractOp('get_results', [nativeToScVal(pollId, { type: 'u32' })]))
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`)
  }

  // result is a Vec<u64> — scValToNative converts to BigInt[], map to Number
  const raw = simResult.result?.retval
  if (!raw) return []
  const native = scValToNative(raw)
  return Array.isArray(native) ? native.map(Number) : []
}

/**
 * simulateHasVoted(pollId, address) → boolean
 */
export async function simulateHasVoted(pollId, address) {
  const sourceAccount = await server.getAccount(address)

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contractOp('has_voted', [
        nativeToScVal(pollId, { type: 'u32' }),
        new Address(address).toScVal(),
      ])
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`)
  }

  const raw = simResult.result?.retval
  if (!raw) return false
  return Boolean(scValToNative(raw))
}

// ---------------------------------------------------------------------------
// Write calls (build XDR → wallet signs → submit)
// ---------------------------------------------------------------------------

/**
 * buildVoteTransaction(publicKey, pollId, optionIndex) → base64 XDR string
 * Builds a prepared (fee-bumped, footprint-set) transaction ready for signing.
 */
export async function buildVoteTransaction(publicKey, pollId, optionIndex) {
  const sourceAccount = await loadAccount(publicKey)

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contractOp('cast_vote', [
        nativeToScVal(pollId, { type: 'u32' }),
        nativeToScVal(optionIndex, { type: 'u32' }),
        new Address(publicKey).toScVal(),
      ])
    )
    .setTimeout(30)
    .build()

  // prepareTransaction sets the Soroban footprint and resource fees
  const prepared = await server.prepareTransaction(tx)
  return prepared.toXDR()
}

/**
 * buildCreatePollTransaction(publicKey, question, options) → base64 XDR string
 */
export async function buildCreatePollTransaction(publicKey, question, options) {
  const sourceAccount = await loadAccount(publicKey)

  const optionsScVal = xdr.ScVal.scvVec(
    options.map((o) => nativeToScVal(o, { type: 'string' }))
  )

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contractOp('create_poll', [
        nativeToScVal(question, { type: 'string' }),
        optionsScVal,
        new Address(publicKey).toScVal(),
      ])
    )
    .setTimeout(30)
    .build()

  const prepared = await server.prepareTransaction(tx)
  return prepared.toXDR()
}

/**
 * buildClosePollTransaction(publicKey, pollId) → base64 XDR string
 */
export async function buildClosePollTransaction(publicKey, pollId) {
  const sourceAccount = await loadAccount(publicKey)

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contractOp('close_poll', [
        nativeToScVal(pollId, { type: 'u32' }),
        new Address(publicKey).toScVal(),
      ])
    )
    .setTimeout(30)
    .build()

  const prepared = await server.prepareTransaction(tx)
  return prepared.toXDR()
}

/**
 * submitSignedTransaction(signedXDR) → { hash: string }
 * Submits a signed XDR and polls until SUCCESS or FAILED.
 */
export async function submitSignedTransaction(signedXDR) {
  const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk')
  const tx = TB.fromXDR(signedXDR, NETWORK_PASSPHRASE)

  const sendResult = await server.sendTransaction(tx)

  if (sendResult.status === 'ERROR') {
    throw new Error(sendResult.errorResult?.result().results()[0]?.tr()?.invokeHostFunctionResult()?.toString() ?? 'Transaction submission failed')
  }

  const hash = sendResult.hash

  // Poll for finality (max 30s, every 3s)
  const MAX_ATTEMPTS = 10
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    const result = await server.getTransaction(hash)

    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return { hash }
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed: ${hash}`)
    }
    // NOT_FOUND → still pending, keep polling
  }

  throw new Error('Transaction confirmation timeout')
}
