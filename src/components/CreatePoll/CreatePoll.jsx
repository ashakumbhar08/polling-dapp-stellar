import { useState } from 'react'
import styles from './CreatePoll.module.css'

const OPTION_LABELS = ['Option 1', 'Option 2', 'Option 3', 'Option 4']

export default function CreatePoll({ onCreatePoll, disabled = false }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState(['', '', '', ''])

  const filledOptions = options.filter((o) => o.trim() !== '')
  const canCreate = question.trim() !== '' && filledOptions.length >= 2

  function handleOption(idx, val) {
    setOptions((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  function handleCreate() {
    if (!canCreate || disabled) return
    onCreatePoll?.({ question: question.trim(), options: options.map((o) => o.trim()) })
    setQuestion('')
    setOptions(['', '', '', ''])
  }

  return (
    <div className={styles.card}>
        {/* No-wallet overlay notice */}
        {disabled && (
          <div className={styles.noWalletNotice}>
            Connect your wallet to create a poll
          </div>
        )}

        <div className={disabled ? styles.formDisabled : styles.form}>
          {/* Question */}
          <div className={styles.field}>
            <input
              className={styles.input}
              type="text"
              placeholder="Ask a question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Options 2×2 grid */}
          <div className={styles.optionsGrid}>
            {OPTION_LABELS.map((label, idx) => (
              <div key={idx} className={styles.field}>
                <label className={styles.label}>{label}</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={label}
                  value={options[idx]}
                  onChange={(e) => handleOption(idx, e.target.value)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            className={`${styles.createBtn} ${canCreate && !disabled ? styles.createBtnActive : ''}`}
            disabled={!canCreate || disabled}
            onClick={handleCreate}
          >
            Create Poll
          </button>
        </div>
      </div>
  )
}
