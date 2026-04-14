# 🗳️ Stellar Live Poll dApp

> A decentralized polling application on the Stellar Testnet — connect your wallet, cast a vote on-chain, and watch results update in real time.

Built for the **Stellar Level 2 Developer Challenge**, this dApp demonstrates end-to-end Soroban smart contract integration with a modern React frontend, multi-wallet support, and live vote streaming via Horizon SSE.

## Features

- 🔗 **Multi-wallet connection** — Freighter, xBull, Albedo, and Lobstr via a single modal
- 🗳️ **On-chain voting** — votes are submitted as Soroban contract invocations on Stellar Testnet
- 📡 **Real-time results** — Horizon SSE streams new transactions; vote bars animate on every update
- 🔄 **Transaction status flow** — BUILDING → SIGNING → SUBMITTING → PENDING → SUCCESS / FAILED
- ❌ **Error handling** — user rejected, insufficient XLM balance, already voted, network timeout
- 📜 **Poll History** — live, append-only feed of recent votes with Stellar Expert links
- ➕ **Create Poll UI** — compose a new poll question and options (UI-ready)
- 🔁 **Auto-reconnect** — wallet session restored on page refresh via localStorage
- 📱 **Responsive layout** — works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Wallet Integration | @creit.tech/stellar-wallets-kit |
| Blockchain SDK | @stellar/stellar-sdk v13 (Soroban) |
| Smart Contract | Soroban (Rust), deployed on Stellar Testnet |
| Real-time Updates | Horizon SSE (`EventSource`) |
| Styling | CSS Modules |
| Network | Stellar Testnet |

## Project Structure

```
src/
├── components/
│   ├── WalletConnector.jsx       # Connect / disconnect wallet button
│   ├── PollHistory/
│   │   └── PollHistory.jsx       # Live vote history feed
│   └── CreatePoll/
│       └── CreatePoll.jsx        # Poll creation form (UI-only)
├── context/
│   ├── WalletContext.jsx         # publicKey, connect, disconnect, auto-reconnect
│   └── PollContext.jsx           # activePoll, voteCounts, castVote, tx state machine
└── utils/
    ├── contract.js               # All Soroban contract calls
    ├── horizon.js                # Horizon SSE subscription + fallback polling
    ├── config.js                 # Centralised environment variable access
    └── format.js                 # Address truncation, timestamp, percentage helpers
```

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/stellar-live-poll.git
cd stellar-live-poll
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the project root:

```env
VITE_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

> If `VITE_CONTRACT_ID` is missing or empty, the app displays a setup warning instead of the poll UI.

4. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Contract Details

| Field | Value |
|---|---|
| Network | Stellar Testnet |
| Contract Address | `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Deploy Transaction Hash | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Soroban RPC URL | `https://soroban-testnet.stellar.org` |

## How It Works

1. **Connect Wallet** — click "Connect Wallet" to open the StellarWalletsKit modal and select from Freighter, xBull, Albedo, or Lobstr
2. **View Active Poll** — the current poll loads with live vote counts fetched via Soroban simulation (no fee)
3. **Select an Option** — click any option card to highlight your choice; the submit button activates
4. **Submit Vote** — the app builds a Soroban invocation XDR, requests your wallet signature, then broadcasts the transaction
5. **Track Status** — a status banner cycles through BUILDING → SIGNING → SUBMITTING → PENDING in real time
6. **Confirmation** — on SUCCESS, a green banner appears with a clickable link to the transaction on Stellar Expert
7. **Live Results** — Horizon SSE streams new ledger events; vote bars animate to updated percentages within seconds
8. **Poll History** — your vote is appended to the Recent Votes feed immediately; past votes load from Horizon on mount
9. **Disconnect** — clicking your address pill clears all wallet state and resets voted flags

## Wallet Support

| Wallet | Type | Status |
|---|---|---|
| Freighter | Browser extension | ✅ Supported |
| xBull | Browser extension | ✅ Supported |
| Albedo | Web-based signer | ✅ Supported |
| Lobstr | Mobile + extension | ✅ Supported |

## Screenshots

| View | Screenshot |
|---|---|
| Wallet connection modal | `screenshots/wallet-modal.png` |
| Active poll with vote bars | `screenshots/poll-voting.png` |
| Transaction pending state | `screenshots/tx-pending.png` |
| Vote confirmed with tx hash | `screenshots/tx-success.png` |
| Poll history feed | `screenshots/poll-history.png` |

## Future Improvements

- [ ] Wire `CreatePoll` form to the Soroban `create_poll` contract function
- [ ] Support multiple concurrent polls with a poll selector
- [ ] Add poll expiry / close-poll UI for the poll creator
- [ ] Persist poll history across sessions using Horizon transaction history endpoint
- [ ] Deploy to Stellar Mainnet with environment toggle
- [ ] Add unit and integration tests for contract utility functions
- [ ] Implement WalletConnect support for mobile wallets

## License

[MIT](LICENSE)

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) — for the Stellar network, Soroban, and the Level 2 Developer Challenge
- [Soroban Documentation](https://developers.stellar.org/docs/smart-contracts) — smart contract development guides
- [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) by Creit Tech — multi-wallet modal integration
- [Horizon API](https://developers.stellar.org/api/horizon) — real-time SSE transaction streaming
