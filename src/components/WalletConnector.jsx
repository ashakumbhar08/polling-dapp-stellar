import { useWallet } from '../context/WalletContext.jsx'
import styles from './WalletConnector.module.css'

function truncate(address) {
  if (!address) return ''
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export default function WalletConnector() {
  const { publicKey, isConnected, connect, disconnect } = useWallet()

  if (isConnected && publicKey) {
    return (
      <div className={styles.wrapper}>
        <button className={styles.addressPill} title={publicKey} onClick={disconnect}>
          <span className={styles.dot} />
          {truncate(publicKey)}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.connectBtn} onClick={connect}>
        Connect Wallet
      </button>
    </div>
  )
}
