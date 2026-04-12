import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { StellarWalletsKit, Networks, KitEventType } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo'
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr'

// Initialise the kit once — static class, no instance needed
StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new LobstrModule(),
  ],
})

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null)
  const [walletType, setWalletType] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Auto-reconnect: kit persists activeAddress + selectedModuleId in localStorage
  useEffect(() => {
    async function tryAutoReconnect() {
      try {
        const { address } = await StellarWalletsKit.getAddress()
        if (address) {
          setPublicKey(address)
          setWalletType(StellarWalletsKit.selectedModule?.productId ?? null)
          setIsConnected(true)
        }
      } catch {
        // No previously connected wallet — silent fail
      }
    }
    tryAutoReconnect()
  }, [])

  // Keep React state in sync with kit state changes (e.g. wallet extension events)
  useEffect(() => {
    const unsub = StellarWalletsKit.on(KitEventType.STATE_UPDATED, ({ payload }) => {
      if (payload.address) {
        setPublicKey(payload.address)
        setIsConnected(true)
      }
    })
    const unsubDisconnect = StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
      setPublicKey(null)
      setWalletType(null)
      setIsConnected(false)
    })
    return () => {
      unsub()
      unsubDisconnect()
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      const { address } = await StellarWalletsKit.authModal()
      setPublicKey(address)
      setWalletType(StellarWalletsKit.selectedModule?.productId ?? null)
      setIsConnected(true)
    } catch (err) {
      // User closed modal or rejected — not an error worth surfacing
      if (err?.code !== -1) console.error('Wallet connect error:', err)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect()
    setPublicKey(null)
    setWalletType(null)
    setIsConnected(false)
  }, [])

  return (
    <WalletContext.Provider
      value={{ publicKey, walletType, isConnected, kit: StellarWalletsKit, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider')
  return ctx
}
