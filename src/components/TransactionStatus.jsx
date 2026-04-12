import { useEffect } from 'react'
import { usePoll, TxStatus } from '../context/PollContext.jsx'
import styles from './TransactionStatus.module.css'

const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet/tx'

const STATE_CONFIG = {
  [TxStatus.BUILDING]:   { icon: '⚙️',  label: 'Building transaction…' },
  [TxStatus.SIGNING]:    { icon: '✍️',  label: 'Waiting for wallet signature…' },
  [TxStatus.SUBMITTING]: { icon: '📡',  label: 'Submitting to network…' },
  [TxStatus.PENDING]:    { icon: '⏳',  label: 'Waiting for confirmation…' },
  [TxStatus.SUCCESS]:    { icon: '✅',  label: 'Vote confirmed!' },
  [TxStatus.FAILED]:     { icon: '❌',  label: 'Transaction failed' },
}

export default function TransactionStatus() {
  const { txStatus, txHash, txError, resetTxStatus } = usePoll()

  // Auto-dismiss SUCCESS after 5 seconds
  useEffect(() => {
    if (txStatus !== TxStatus.SUCCESS) return
    const timer = setTimeout(() => resetTxStatus(), 5000)
    return () => clearTimeout(timer)
  }, [txStatus, resetTxStatus])

  if (txStatus === TxStatus.IDLE) return null

  const config = STATE_CONFIG[txStatus]
  const isActive = txStatus !== TxStatus.SUCCESS && txStatus !== TxStatus.FAILED
  const isSuccess = txStatus === TxStatus.SUCCESS
  const isFailed = txStatus === TxStatus.FAILED

  return (
    <div
      className={`${styles.banner} ${isSuccess ? styles.success : ''} ${isFailed ? styles.failed : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon}>{config.icon}</span>

      <div className={styles.body}>
        <span className={styles.label}>
          {config.label}
          {isActive && <span className={styles.dots} aria-hidden="true" />}
        </span>

        {isSuccess && txHash && (
          <a
            className={styles.link}
            href={`${EXPLORER_BASE}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Stellar Expert ↗
          </a>
        )}

        {isFailed && txError && (
          <span className={styles.error}>{txError}</span>
        )}
      </div>

      {(isSuccess || isFailed) && (
        <button
          className={styles.dismiss}
          onClick={resetTxStatus}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}
