import { useState } from 'react'
import { useWallet } from './context/WalletContext.jsx'
import WalletConnector from './components/WalletConnector.jsx'
import PollHistory from './components/PollHistory/PollHistory.jsx'
import CreatePoll from './components/CreatePoll/CreatePoll.jsx'
import styles from './App.module.css'

const POLL = {
  question: 'What is your favourite Stellar wallet?',
  options: ['Freighter', 'xBull', 'Albedo', 'Lobstr'],
  totalVotes: 128,
}

const FAKE_COUNTS = [52, 31, 28, 17]
const FAKE_TOTAL  = FAKE_COUNTS.reduce((a, b) => a + b, 0)

const now = Date.now()
const MOCK_VOTES = [
  {
    id: 'mock-1',
    wallet: 'GBXLT7QXKZJKJV3QWERTY7ABCDEF1234567890ABCDEF',
    option: 'Freighter',
    txHash: 'a3f9c12e8b4d7f0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    timestamp: now - 2 * 60 * 1000,
    _new: false,
  },
  {
    id: 'mock-2',
    wallet: 'GDYUL5QXKZJKJV3QWERTY7ABCDEF1234567890ABCDEF',
    option: 'xBull',
    txHash: 'b7e2d45f9c1a3e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b',
    timestamp: now - 5 * 60 * 1000,
    _new: false,
  },
  {
    id: 'mock-3',
    wallet: 'GCPQR8QXKZJKJV3QWERTY7ABCDEF1234567890ABCDEF',
    option: 'Lobstr',
    txHash: 'c1a4b7d0e3f6a9c2b5e8d1f4a7c0b3e6d9f2a5c8b1e4d7f0a3c6b9e2d5f8a1c4',
    timestamp: now - 8 * 60 * 1000,
    _new: false,
  },
]

export default function App() {
  const { isConnected, publicKey } = useWallet()
  const [selected, setSelected] = useState(null)
  const [voted, setVoted]       = useState(null)
  const [votes, setVotes]       = useState(MOCK_VOTES)

  const hasVoted  = voted !== null
  const canSubmit = selected !== null && !hasVoted && isConnected

  function pct(idx) {
    return Math.round((FAKE_COUNTS[idx] / FAKE_TOTAL) * 100)
  }

  function handleSubmit() {
    if (!canSubmit) return
    setVoted(selected)
    const newEntry = {
      id: `vote-${Date.now()}`,
      wallet: publicKey ?? 'GUNKNOWN000000000000000000000000000000000000000',
      option: POLL.options[selected],
      txHash: `pending_${Date.now()}`,
      timestamp: Date.now(),
      _new: true,
    }
    setVotes((prev) => [newEntry, ...prev])
  }

  function handleCreatePoll(pollData) {
    console.log('New poll composed:', pollData)
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandName}>Stellar Live Poll</span>
        </div>
        <WalletConnector />
      </header>

      {/* Content */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Section: Active Poll */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Active Poll</span>
              <span className={styles.sectionRule} />
            </div>

            <div className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.livePill}>
                  <span className={styles.liveDot} />
                  LIVE
                </div>
                <span className={styles.meta}>
                  {POLL.totalVotes + (hasVoted ? 1 : 0)} votes · Poll open
                </span>
              </div>

              <h2 className={styles.question}>{POLL.question}</h2>

              <div className={styles.options}>
                {POLL.options.map((option, idx) => {
                  const isSelected = selected === idx
                  const isVoted    = voted === idx
                  const percentage = pct(idx)
                  const disabled   = !isConnected || hasVoted

                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-pressed={isSelected || isVoted}
                      className={[
                        styles.option,
                        isSelected && !hasVoted ? styles.optionSelected : '',
                        isVoted               ? styles.optionVoted    : '',
                        disabled              ? styles.optionDisabled : '',
                      ].join(' ')}
                      onClick={() => { if (!disabled) setSelected(idx) }}
                      onKeyDown={(e) => {
                        if (!disabled && (e.key === 'Enter' || e.key === ' ')) setSelected(idx)
                      }}
                    >
                      <span className={styles.radio}>
                        {(isSelected || isVoted) && <span className={styles.radioDot} />}
                      </span>

                      <div className={styles.optionBody}>
                        <div className={styles.optionLabelRow}>
                          <span className={`${styles.optionLabel} ${(isSelected || isVoted) ? styles.optionLabelActive : ''}`}>
                            {option}
                          </span>
                          {hasVoted && (
                            <span className={styles.optionPct}>{percentage}%</span>
                          )}
                        </div>

                        {hasVoted && (
                          <div className={styles.barTrack}>
                            <div
                              className={`${styles.barFill} ${isVoted ? styles.barFillVoted : ''}`}
                              style={{ '--bar-pct': `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {isConnected ? (
                <button
                  className={[
                    styles.actionBtn,
                    canSubmit ? styles.actionBtnActive : '',
                    hasVoted  ? styles.actionBtnVoted  : '',
                  ].join(' ')}
                  disabled={!canSubmit && !hasVoted}
                  onClick={handleSubmit}
                >
                  {hasVoted
                    ? 'Vote cast'
                    : selected !== null
                      ? 'Submit vote'
                      : 'Select an option to vote'}
                </button>
              ) : (
                <div className={styles.noWalletNotice}>
                  Connect your wallet to participate in this poll
                </div>
              )}
            </div>
          </section>

          {/* Section: Recent Votes */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Recent Votes</span>
              <span className={styles.sectionRule} />
            </div>
            <PollHistory votes={votes} />
          </section>

          {/* Section: Create Poll */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Create Poll</span>
              <span className={styles.sectionRule} />
            </div>
            <CreatePoll
              disabled={!isConnected}
              onCreatePoll={handleCreatePoll}
            />
          </section>

        </div>
      </main>

    </div>
  )
}
