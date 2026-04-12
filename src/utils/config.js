export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? ''
export const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'
export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015'

/** True when the contract address is configured */
export const HAS_CONTRACT = Boolean(CONTRACT_ID)
