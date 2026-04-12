import { useWallet } from '../context/WalletContext.jsx'
import styles from './WalletConnector.module.css'

/** Shorten a Stellar public key for display: GABC…WXYZ */
function truncate(address) {
  if (!address) return ''
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export default function WalletConnector() {
  const { publicKey, isConnected, connect, disconnect } = useWallet()

  if (isConnected && publicKey) {
    return (
      <div className={styles.wrapper}>
        <span className={styles.address} title={publicKey}>
          {truncate(publicKey)}
        </span>
        <button className={styles.btnDisconnect} onClick={disconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.btnConnect} onClick={connect}>
        Connect Wallet
      </button>
    </div>
  )
}
