# Circom Groth16 Proof Verification on Stellar (Soroban)

This repo is a minimal, functional tutorial demo that shows:

- A simple Circom circuit (`a * b = c`)
- A Soroban contract that verifies Groth16 proofs on-chain
- A single script that builds/deploys on Stellar testnet, creates a proof, and verifies it on-chain
- A React frontend which can also be used to generate proofs and verify on-chain

## Files

- Circuit: `circuits/multiplier2.circom`
- Soroban verifier contract: `contract/src/lib.rs`
- Proof setup artifacts: `proving/multiplier2_final.zkey`, `proving/witness.wtns`
- JSON-to-bytes converter for Soroban args: `tools/circom_to_soroban_hex/src/main.rs`
- End-to-end script: `demo.sh`
- React frontend: `frontend/`

## Prerequisites

- `stellar` CLI configured with identity `james`
- Rust toolchain + `wasm32v1-none`
- Node.js + npm

## Run

```bash
./demo.sh
```

Optional env vars:

- `NETWORK` (default: `testnet`)
- `SOURCE` (default: `james`)

Example:

```bash
NETWORK=testnet SOURCE=james ./demo.sh
```
