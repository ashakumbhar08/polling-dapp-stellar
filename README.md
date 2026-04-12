# Stellar Live Poll dApp

A decentralised live polling application built on the Stellar Testnet using Soroban smart contracts. Users connect a Stellar wallet, cast votes on-chain, and see results update in real-time via Horizon SSE.

---

## Features

- Multi-wallet support via StellarWalletsKit (Freighter, xBull, Albedo, Lobstr)
- On-chain voting through a deployed Soroban `PollContract`
- Real-time vote count updates via Horizon SSE with 5-second fallback polling
- Full transaction status tracking: Building → Signing → Submitting → Pending → Success / Failed
- Mapped error messages for user rejection, insufficient balance, and duplicate votes
- Auto-reconnect wallet on page refresh
- Tab-focus re-fetch via `visibilitychange`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Wallet | @creit.tech/stellar-wallets-kit |
| Blockchain SDK | @stellar/stellar-sdk v13 |
| Smart Contract | Soroban (Rust) |
| Network | Stellar Testnet |
| Styling | CSS Modules |

---

## Prerequisites

- Node.js ≥ 18
- A Stellar Testnet wallet (Freighter recommended for testing)
- A deployed `PollContract` on Stellar Testnet

---

## Installation

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_CONTRACT_ID=<your_deployed_contract_address>
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

> If `VITE_CONTRACT_ID` is missing, the app shows a setup warning instead of the poll UI.

---

## Running Locally

```bash
npm run dev
```

Opens at `http://localhost:5173`

---

## Contract Details

| Field | Value |
|---|---|
| Contract Address | `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Deploy Tx Hash | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| Network | Stellar Testnet |

> Replace the placeholders above with your actual deployed contract address and deploy transaction hash.

---

## How It Works

1. **Connect Wallet** — Click "Connect Wallet" to open the StellarWalletsKit modal and select Freighter, xBull, Albedo, or Lobstr
2. **View Poll** — The active poll loads with current vote counts fetched via Soroban simulation
3. **Cast Vote** — Click an option to trigger the full transaction flow:
   - `BUILDING` — constructs the Soroban invocation XDR
   - `SIGNING` — opens wallet popup for signature
   - `SUBMITTING` — broadcasts to Testnet
   - `PENDING` — polls Horizon every 3 seconds for confirmation
   - `SUCCESS` — displays tx hash with Stellar Expert link
4. **Real-time Updates** — Horizon SSE streams new transactions; vote bars animate on every update
5. **Disconnect** — Clears all wallet state and resets voted flags

---

## Wallet Support

| Wallet | Type |
|---|---|
| Freighter | Browser extension |
| xBull | Browser extension |
| Albedo | Web-based signer |
| Lobstr | Mobile + extension |

---

## Error Handling

| Error | Message Shown |
|---|---|
| User closes wallet popup | "Transaction cancelled by user" |
| Insufficient XLM | "Insufficient XLM for transaction fees" |
| Already voted | "You have already voted in this poll" |
| Network timeout | "Network error — please try again" |

---

## Demo

Live Demo: `https://your-demo-link.vercel.app`

---

## Screenshots

> Add screenshots to a `/screenshots` folder and update paths below.

- `screenshots/wallet-modal.png` — Wallet connection modal
- `screenshots/poll-voting.png` — Active poll with vote bars
- `screenshots/tx-pending.png` — Transaction pending state
- `screenshots/tx-success.png` — Vote confirmed with tx hash link

---

## Smart Contract Functions

| Function | Type | Description |
|---|---|---|
| `create_poll(question, options, creator)` | Write | Creates a new poll, returns `poll_id` |
| `cast_vote(poll_id, option_index, voter)` | Write | Records a vote; errors if already voted or poll closed |
| `get_results(poll_id)` | Read (sim) | Returns vote counts per option |
| `close_poll(poll_id, caller)` | Write | Closes poll; errors if caller ≠ creator |
| `has_voted(poll_id, address)` | Read (sim) | Returns whether address has voted |

---

## Project Structure

```
src/
  components/
    WalletConnector.jsx     # Connect/disconnect wallet button
    PollCard.jsx            # Poll question + vote buttons
    VoteBar.jsx             # Animated percentage bar per option
    TransactionStatus.jsx   # Tx state banner (Building → Success/Failed)
    CreatePollForm.jsx      # Admin-only poll creation form
    PollHistory.jsx         # Past votes feed
  context/
    WalletContext.jsx       # publicKey, walletType, connect, disconnect
    PollContext.jsx         # activePoll, voteCounts, castVote, tx state machine
  utils/
    contract.js             # All Soroban contract calls
    horizon.js              # Horizon SSE subscription + fallback polling
    config.js               # Centralised env var access
    format.js               # Address truncation, timestamp, percentage helpers
```

---

## Future Improvements

- Poll creation UI (CreatePollForm) wired to contract
- Poll history feed from Horizon transaction history
- Multiple concurrent polls
- Mainnet deployment
