# Requirements: Stellar Live Poll dApp

## 1. Project Setup and Configuration

### User Stories

**1.1** As a developer, I want a Vite + React 18 project scaffold so that I have a modern, fast development environment.

**1.2** As a developer, I want all required dependencies installed (`@stellar/stellar-wallets-kit`, `@stellar/stellar-sdk`, `soroban-client`, `react`, `react-dom`) so that Stellar and Soroban integrations are available.

**1.3** As a developer, I want `vite.config.js` to include `global: 'globalThis'` and a `buffer` alias so that Stellar SDK browser polyfills work correctly.

**1.4** As a developer, I want environment variables defined in `.env` (`VITE_CONTRACT_ID`, `VITE_HORIZON_URL`, `VITE_NETWORK_PASSPHRASE`) so that network configuration is externalized from code.

**1.5** As a developer, I want all env vars accessed exclusively through `src/utils/config.js` so that configuration is centralized and never inlined.

**1.6** As a developer, I want CSS custom properties (variables) defined in `src/index.css` so that the design system is consistent and themeable.

**1.7** As a user, I want to see a clear setup warning in the UI when `VITE_CONTRACT_ID` is missing so that I know the app is not fully configured.

### Acceptance Criteria

- `npm install` completes with no errors
- `npm run dev` starts the dev server on `localhost:5173`
- `vite.config.js` defines `define: { global: 'globalThis' }` and resolves `buffer` to `buffer/`
- `.env` file exists with all three variables (values may be empty for `VITE_CONTRACT_ID`)
- `src/utils/config.js` is the single source of truth for all env var access
- When `VITE_CONTRACT_ID` is empty or undefined, the UI renders a visible setup warning component
- Folder structure matches: `src/components/`, `src/context/`, `src/utils/`, `src/App.jsx`, `src/main.jsx`

---

## 2. Wallet Integration

### User Stories

**2.1** As a user, I want to connect my Stellar wallet (Freighter, xBull, Albedo, or LOBSTR) from a single modal so that I can authenticate with the dApp.

**2.2** As a user, I want my wallet connection to persist on page refresh (when the wallet allows) so that I don't have to reconnect every time.

**2.3** As a user, I want to disconnect my wallet and have all state reset so that I can switch accounts or log out cleanly.

**2.4** As a developer, I want the connected `publicKey`, `walletType`, `kitInstance`, and `isConnected` flag available globally via `useWallet()` so that any component can access wallet state.

### Acceptance Criteria

- `StellarWalletsKit` is instantiated with `FREIGHTER`, `XBULL`, `ALBEDO`, and `LOBSTR` modules
- Clicking "Connect Wallet" opens the StellarWalletsKit modal
- After wallet approval, `publicKey` and `walletType` are stored in `WalletContext`
- `useWallet()` hook returns `{ publicKey, walletType, kitInstance, isConnected }`
- Disconnecting clears all wallet state and resets `PollContext` voted flags
- On load, the app checks if a previously connected wallet is still available and auto-reconnects

---

## 3. Smart Contract Integration

### User Stories

**3.1** As a user, I want to create a poll by submitting a question and options to the `PollContract` so that others can vote on it.

**3.2** As a user, I want to cast a vote on an active poll so that my choice is recorded on-chain.

**3.3** As a user, I want to view live vote results fetched from the contract so that I can see the current standings.

**3.4** As a poll creator, I want to close my poll so that no further votes can be cast.

**3.5** As a developer, I want all Soroban contract calls isolated in `src/utils/contract.js` so that contract interaction logic is not scattered across components.

### Acceptance Criteria

- `contract.js` exports: `buildVoteTransaction`, `simulateGetResults`, `simulateHasVoted`, `submitSignedTransaction`
- `create_poll`, `cast_vote`, `get_results`, `close_poll`, `has_voted` are all wrapped in `contract.js`
- `buildVoteTransaction` returns a valid base64 XDR string ready for wallet signing
- `simulateGetResults` returns an array of vote counts without mutating on-chain state
- `simulateHasVoted` returns a boolean without mutating on-chain state
- `submitSignedTransaction` returns `{ hash, status }` and throws on network error

---

## 4. Poll UI

### User Stories

**4.1** As a user, I want to see the active poll's question and options with visual vote bars so that I can understand the current results at a glance.

**4.2** As a user, I want to click a vote option and have my vote submitted via the transaction flow so that my choice is recorded.

**4.3** As a user, I want to create a new poll with a question and 2–4 options so that I can start a new vote.

**4.4** As a user, I want vote buttons to be disabled after I've voted or when the poll is closed so that I cannot vote twice.

### Acceptance Criteria

- `PollCard` renders question, options, and a `VoteBar` per option
- `VoteBar` displays the correct percentage and animates on update
- `CreatePollForm` validates: question non-empty, 2–4 non-empty options
- Vote buttons are disabled when `hasVoted === true` or `isClosed === true`
- `PollContext` exposes: `activePoll`, `voteCounts`, `hasVoted`, `isLoading`, `isClosed`

---

## 5. Transaction Flow

### User Stories

**5.1** As a user, I want to see the current status of my transaction (building, signing, submitting, pending, success, failed) so that I know what is happening.

**5.2** As a user, I want to see a link to Stellar Expert when my transaction succeeds so that I can verify it on-chain.

**5.3** As a user, I want the success status to auto-dismiss after 5 seconds so that the UI doesn't stay cluttered.

### Acceptance Criteria

- `TransactionStatus` component maps each `TxStatus` value to a human-readable message
- `txHash` is displayed as a Stellar Expert link when available
- Status auto-dismisses 5 seconds after reaching `SUCCESS`
- `txStatus` transitions only forward: `IDLE → BUILDING → SIGNING → SUBMITTING → PENDING → SUCCESS | FAILED`
- `txError` is shown with a dismiss button on `FAILED`

---

## 6. Real-time Updates

### User Stories

**6.1** As a user, I want vote counts to update automatically when new votes are cast so that I see live results without refreshing.

**6.2** As a developer, I want SSE subscriptions to automatically reconnect on error so that the live feed is resilient.

**6.3** As a developer, I want all SSE logic isolated in `src/utils/horizon.js` so that event streaming is not mixed with UI code.

### Acceptance Criteria

- `horizon.js` exports `subscribeToContractEvents(contractId, onUpdate)` and `unsubscribeAll()`
- `subscribeToContractEvents` opens an `EventSource` to Horizon's transactions SSE endpoint
- `onUpdate` is called for each new relevant contract transaction
- On SSE error, the subscription closes and retries after 3 seconds
- `unsubscribeAll()` closes all active `EventSource` connections with no leaks
- `PollContext` calls `unsubscribeAll()` on component unmount

---

## 7. Poll History

### User Stories

**7.1** As a user, I want to see a feed of recent poll activity (creations and votes) so that I can review past interactions.

### Acceptance Criteria

- `PollHistory` fetches the 20 most recent transactions for the contract from Horizon on mount
- Transactions are displayed in reverse chronological order
- A loading skeleton is shown while fetching
- The component uses `VITE_CONTRACT_ID` and `VITE_HORIZON_URL` from `config.js`
