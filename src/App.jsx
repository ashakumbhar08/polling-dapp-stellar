import { useEffect } from 'react'
import { HAS_CONTRACT } from './utils/config.js'
import { usePoll } from './context/PollContext.jsx'
import WalletConnector from './components/WalletConnector.jsx'
import PollCard from './components/PollCard.jsx'
import TransactionStatus from './components/TransactionStatus.jsx'
import styles from './App.module.css'

// Demo poll — replace with real contract data in Phase 4 (CreatePollForm)
const DEMO_POLL = {
  id: 0,
  question: 'What is your favourite Stellar wallet?',
  options: ['Freighter', 'xBull', 'Albedo', 'Lobstr'],
  creator: '',
}

function SetupWarning() {
  return (
    <div className={styles.setupWarning}>
      <strong>⚠️ Setup Required</strong>
      <p>
        <code>VITE_CONTRACT_ID</code> is not set. Add it to your{' '}
        <code>.env</code> file and restart the dev server.
      </p>
    </div>
  )
}

function PollApp() {
  const { setActivePoll } = usePoll()

  // Load demo poll on mount
  useEffect(() => {
    setActivePoll(DEMO_POLL)
  }, [setActivePoll])

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Stellar Live Poll</h1>
        <WalletConnector />
      </header>
      <PollCard />
      <TransactionStatus />
    </>
  )
}

export default function App() {
  if (!HAS_CONTRACT) {
    return (
      <main className={styles.main}>
        <SetupWarning />
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <PollApp />
    </main>
  )
}
