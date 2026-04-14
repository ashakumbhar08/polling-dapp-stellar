# Stellar Live Poll dApp

A decentralized polling application built on the Stellar Testnet. Users connect a Stellar wallet, cast votes on-chain through a Soroban smart contract, and see results update in real time via Horizon SSE.

Built for the Stellar Level 2 Developer Challenge.

## Overview

This project demonstrates end-to-end Soroban smart contract integration with a React frontend. It covers multi-wallet support, on-chain transaction flows, real-time data streaming, and a complete transaction status lifecycle from build to confirmation.

## Features

- Multi-wallet connection via a single modal (Freighter, xBull, Albedo, Lobstr)
- On-chain voting through Soroban contract invocations
- Real-time vote count updates via Horizon SSE with 5-second fallback polling
- Full transaction status tracking: BUILDING → SIGNING → SUBMITTING → PENDING → SUCCESS / FAILED
- Mapped error messages for user rejection, insufficient balance, and duplicate votes
- Live vote history feed with links to Stellar Expert
- Poll creation form (UI-ready)
- Wallet session auto-reconnect on page refresh
- Responsive layout for mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Wallet Integration | @creit.tech/stellar-wallets-kit |
| Blockchain SDK | @stellar/stellar-sdk v13 |
| Smart Contract | Soroban (Rust), Stellar Testnet |
| Real-time Updates | Horizon SSE (EventSource) |
| Styling | CSS Modules |

## Project Structure

```
src/
├── components/
│   ├── WalletConnector.jsx       # Connect / disconnect wallet
│   ├── PollHistory/
│   │   └── PollHistory.jsx       # Live vote history feed
│   └── CreatePoll/
│       └── CreatePoll.jsx        # Poll creation form
├── context/
│   ├── WalletContext.jsx         # Wallet state and connection logic
│   └── PollContext.jsx           # Poll state and vote transaction flow
└── utils/
    ├── contract.js               # All Soroban contract interactions
    ├── horizon.js                # Horizon SSE and fallback polling
    ├── config.js                 # Environment variable access
    └── format.js                 # Address, timestamp, and percentage helpers
```

## Setup

1. Clone the repository

```bash
git clone https://github.com/your-username/stellar-live-poll.git
cd stellar-live-poll
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root

```env
VITE_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

If `VITE_CONTRACT_ID` is not set, the app will show a configuration warning instead of the poll UI.

4. Start the development server

```bash
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

## Contract Details

| Field | Value |
|---|---|
| Network | Stellar Testnet |
| Contract Address | `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Deploy Transaction Hash | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| Soroban RPC URL | `https://soroban-testnet.stellar.org` |

## How It Works

1. Click "Connect Wallet" to open the wallet modal and select a supported wallet
2. The active poll loads with current vote counts fetched via Soroban simulation (read-only, no fee)
3. Select an option to activate the submit button
4. Submitting builds a Soroban invocation XDR, sends it to your wallet for signing, then broadcasts it to the network
5. A status banner tracks each stage of the transaction in real time
6. On success, a confirmation banner appears with a link to the transaction on Stellar Expert
7. Vote bars update automatically as Horizon SSE delivers new ledger events
8. Your vote is added to the Recent Votes feed immediately after confirmation
9. Clicking your address disconnects the wallet and resets all state

## Wallet Support

| Wallet | Type | Status |
|---|---|---|
| Freighter | Browser extension | Supported |
| xBull | Browser extension | Supported |
| Albedo | Web-based signer | Supported |
| Lobstr | Mobile + extension | Supported |

## Screenshots

| View | File |
|---|---|
| Wallet connection modal | `screenshots/wallet-modal.png` |
| Active poll with vote bars | `screenshots/poll-voting.png` |
| Transaction pending state | `screenshots/tx-pending.png` |
| Vote confirmed with tx hash | `screenshots/tx-success.png` |
| Poll history feed | `screenshots/poll-history.png` |

## Future Improvements

- [ ] Connect the Create Poll form to the `create_poll` contract function
- [ ] Support multiple concurrent polls with a poll selector
- [ ] Add close-poll UI for the poll creator
- [ ] Load full poll history from Horizon transaction records on mount
- [ ] Add a Mainnet deployment option with an environment toggle
- [ ] Write unit and integration tests for contract utility functions
- [ ] Add WalletConnect support for additional mobile wallets

## License

[MIT](LICENSE)

## Acknowledgements

- [Stellar Development Foundation](https://stellar.org) — Stellar network, Soroban, and the Level 2 Developer Challenge
- [Soroban Documentation](https://developers.stellar.org/docs/smart-contracts) — smart contract development reference
- [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) by Creit Tech — multi-wallet modal
- [Horizon API](https://developers.stellar.org/api/horizon) — real-time transaction streaming
