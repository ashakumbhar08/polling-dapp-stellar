# PollContract — Soroban Smart Contract

This directory contains the Soroban smart contract for the Stellar Live Poll dApp.

## Structure

```
poll_contract/
├── contracts/
│   └── poll/          # PollContract source
│       └── src/
│           ├── lib.rs
│           └── test.rs
├── Cargo.toml
└── Cargo.lock
```

## Contract Functions

| Function | Type | Description |
|---|---|---|
| `create_poll(question, options, creator)` | Write | Creates a new poll, returns `poll_id` |
| `cast_vote(poll_id, option_index, voter)` | Write | Records a vote; errors if already voted or poll closed |
| `get_results(poll_id)` | Read | Returns vote counts per option |
| `close_poll(poll_id, caller)` | Write | Closes poll; errors if caller is not creator |
| `has_voted(poll_id, address)` | Read | Returns whether an address has voted |

## Build

```bash
stellar contract build
```

## Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/poll.wasm \
  --network testnet \
  --source <your_account>
```

After deploying, copy the contract address into your `.env` file as `VITE_CONTRACT_ID`.
