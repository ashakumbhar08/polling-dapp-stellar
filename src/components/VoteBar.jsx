import styles from './VoteBar.module.css'

/**
 * VoteBar — animated percentage bar for a single poll option.
 * Props:
 *   label      {string}  — option text
 *   votes      {number}  — vote count for this option
 *   totalVotes {number}  — total votes across all options
 *   isWinner   {boolean} — highlight as leading option
 */
export default function VoteBar({ label, votes, totalVotes, isWinner }) {
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0

  return (
    <div className={`${styles.wrapper} ${isWinner ? styles.winner : ''}`}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>
          {votes} <span className={styles.pct}>({pct}%)</span>
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
