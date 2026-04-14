import styles from './PollHistory.module.css'

/** Shorten wallet: GABC…XYZ */
function shortWallet(addr) {
  if (!addr || addr.length < 8) return addr
  return `${addr.slice(0, 4)}…${addr.slice(-3)}`
}

/** Shorten tx hash: a1b2c3…f9 */
function shortHash(hash) {
  if (!hash || hash.length < 10) return hash
  return `${hash.slice(0, 6)}…${hash.slice(-2)}`
}

/** Relative timestamp */
function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 10)  return 'just now'
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const EXPLORER = 'https://stellar.expert/explorer/testnet/tx'

export default function PollHistory({ votes = [] }) {
  return (
    <div className={styles.card}>
        {votes.length === 0 ? (
          <div className={styles.empty}>
            {/* Clock icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#2e2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p className={styles.emptyTitle}>No votes yet</p>
            <p className={styles.emptySub}>Votes will appear here after you participate.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {votes.map((vote, i) => (
              <li
                key={vote.id}
                className={`${styles.row} ${i === 0 && vote._new ? styles.rowNew : ''}`}
              >
                {/* Left: wallet + option */}
                <div className={styles.left}>
                  <span className={styles.wallet}>{shortWallet(vote.wallet)}</span>
                  <span className={styles.option}>{vote.option}</span>
                </div>

                {/* Right: tx hash + time */}
                <div className={styles.right}>
                  <a
                    className={styles.txLink}
                    href={`${EXPLORER}/${vote.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortHash(vote.txHash)}
                  </a>
                  <span className={styles.time}>{relativeTime(vote.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
  )
}
