# Tasks: Stellar Live Poll dApp

## Phase 1: Project Setup and Configuration

- [x] 1.1 Initialize Vite + React 18 project
  - Run `npm create vite@latest . -- --template react` in the workspace root
  - Verify `package.json` has `react` and `react-dom` ^18

- [x] 1.2 Install all required dependencies
  - Install: `@stellar/stellar-wallets-kit`, `@stellar/stellar-sdk`, `soroban-client`
  - Install dev deps: `vite`, `@vitejs/plugin-react`
  - Verify `npm install` completes with no errors

- [x] 1.3 Configure `vite.config.js`
  - Add `define: { global: 'globalThis' }` to Vite config
  - Add `resolve.alias` for `buffer` → `buffer/`
  - Add `optimizeDeps.include` for `buffer`

- [x] 1.4 Create `.env` file
  - Add `VITE_CONTRACT_ID=` (empty placeholder)
  - Add `VITE_HORIZON_URL=https://horizon-testnet.stellar.org`
  - Add `VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015`
  - Add `.env` to `.gitignore`

- [x] 1.5 Create `src/utils/config.js`
  - Export `CONTRACT_ID`, `HORIZON_URL`, `NETWORK_PASSPHRASE` from `import.meta.env`
  - Export `HAS_CONTRACT` boolean flag for setup warning detection

- [x] 1.6 Scaffold folder structure
  - Create `src/components/` directory with placeholder files for all 6 components
  - Create `src/context/` directory with `WalletContext.jsx` and `PollContext.jsx` stubs
  - Create `src/utils/` with `contract.js`, `horizon.js`, `format.js`, `config.js` stubs

- [x] 1.7 Set up `src/index.css` with CSS variables
  - Define color, spacing, and typography CSS custom properties
  - Import in `main.jsx`

- [x] 1.8 Create `src/main.jsx` and `src/App.jsx`
  - `main.jsx`: render `<App />` wrapped in both context providers
  - `App.jsx`: render setup warning when `HAS_CONTRACT` is false, otherwise render main layout

## Phase 2: Wallet Integration

- [x] 2.1 Implement `src/context/WalletContext.jsx`
  - Instantiate `StellarWalletsKit` with all 4 wallet modules
  - Provide `publicKey`, `walletType`, `kitInstance`, `isConnected` via context
  - Implement `connect()`, `disconnect()` functions
  - Implement auto-reconnect check on mount

- [x] 2.2 Implement `src/components/WalletConnector.jsx`
  - Render "Connect Wallet" button that calls `connect()` from `useWallet()`
  - Display truncated public key when connected
  - Render "Disconnect" button when connected

## Phase 3: Smart Contract Integration

- [x] 3.1 Implement `src/utils/contract.js` — read functions
  - Implement `simulateGetResults(pollId)` using Soroban RPC simulation
  - Implement `simulateHasVoted(pollId, address)` using Soroban RPC simulation

- [x] 3.2 Implement `src/utils/contract.js` — write functions
  - Implement `buildVoteTransaction(publicKey, pollId, optionIndex)`
  - Implement `submitSignedTransaction(signedXDR)` with finality polling
  - Implement `buildCreatePollTransaction(publicKey, question, options)`
  - Implement `buildClosePollTransaction(publicKey, pollId)`

## Phase 4: Poll UI

- [x] 4.1 Implement `src/context/PollContext.jsx`
  - Provide `activePoll`, `voteCounts`, `hasVoted`, `isLoading`, `isClosed`
  - Provide `txStatus`, `txHash`, `txError`
  - Implement `castVote(pollId, optionIndex)` using full tx state machine
  - Implement `createPoll(question, options)`
  - Implement `closePoll(pollId)`
  - Subscribe to SSE on mount, unsubscribe on unmount

- [x] 4.2 Implement `src/components/VoteBar.jsx`
  - Accept `label`, `votes`, `totalVotes`, `isWinner` props
  - Render percentage bar with CSS transition animation
  - Highlight winning option

- [x] 4.3 Implement `src/components/PollCard.jsx`
  - Render question, options list with `VoteBar` per option
  - Disable vote buttons when `hasVoted` or `isClosed`
  - Show close poll button for poll creator only

- [ ] 4.4 Implement `src/components/CreatePollForm.jsx`
  - Manage local state for question and options array
  - Validate: question non-empty, 2–4 non-empty options
  - Call `PollContext.createPoll` on submit
  - Disable submit while `isLoading`

## Phase 5: Transaction Status

- [x] 5.1 Implement `src/components/TransactionStatus.jsx`
  - Map each `TxStatus` to message and icon
  - Show Stellar Expert link when `txHash` is set
  - Auto-dismiss after 5 seconds on `SUCCESS`
  - Show error with dismiss button on `FAILED`

## Phase 6: Real-time Updates

- [x] 6.1 Implement `src/utils/horizon.js`
  - Implement `subscribeToContractEvents(contractId, onUpdate)`
  - Open `EventSource` to Horizon SSE transactions endpoint
  - Parse and filter relevant contract events
  - Implement auto-reconnect on error (3-second delay)
  - Implement `unsubscribeAll()` to close all active sources

## Phase 7: Poll History

- [ ] 7.1 Implement `src/utils/format.js`
  - Export `truncateAddress(address)` — shorten G... key for display
  - Export `formatTimestamp(isoString)` — human-readable date/time
  - Export `calculatePercentage(votes, total)` — safe division returning 0–100

- [ ] 7.2 Implement `src/components/PollHistory.jsx`
  - Fetch 20 most recent transactions for contract from Horizon on mount
  - Display in reverse chronological order
  - Show loading skeleton while fetching
  - Use `config.js` for `CONTRACT_ID` and `HORIZON_URL`
