import { usePoll } from '../context/PollContext.jsx'
import { useWallet } from '../context/WalletContext.jsx'
import VoteBar from './VoteBar.jsx'
import styles from './PollCard.module.css'

export default function PollCard() {
  const { activePoll, voteCounts, hasVoted, isClosed, isLoading, castVote } = usePoll()
  const { isConnected } = useWallet()

  if (!activePoll) return null

  const totalVotes = voteCounts.reduce((sum, v) => sum + v, 0)
  const maxVotes = Math.max(...voteCounts, 0)

  // Buttons are disabled when: not connected, already voted, poll closed, or tx in flight
  const buttonsDisabled = !isConnected || hasVoted || isClosed || isLoading

  function getDisabledReason() {
    if (!isConnected) return 'Connect wallet to vote'
    if (isClosed) return 'This poll is closed'
    if (hasVoted) return 'You have already voted'
    return null
  }

  const disabledReason = getDisabledReason()

  return (
    <div className={styles.card}>
      <h2 className={styles.question}>{activePoll.question}</h2>

      {disabledReason && (
        <p className={styles.hint}>{disabledReason}</p>
      )}

      <div className={styles.options}>
        {activePoll.options.map((option, idx) => {
          const isVoted = hasVoted && activePoll.votedIndex === idx
          const isWinner = voteCounts[idx] === maxVotes && maxVotes > 0

          return (
            <div key={idx} className={styles.optionRow}>
              <button
                className={`${styles.optionBtn} ${isVoted ? styles.voted : ''}`}
                disabled={buttonsDisabled}
                onClick={() => castVote(activePoll.id, idx)}
              >
                {isLoading && !hasVoted ? '…' : option}
              </button>
              <VoteBar
                label={option}
                votes={voteCounts[idx] ?? 0}
                totalVotes={totalVotes}
                isWinner={isWinner}
              />
            </div>
          )
        })}
      </div>

      <p className={styles.totalVotes}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} total</p>
    </div>
  )
}
