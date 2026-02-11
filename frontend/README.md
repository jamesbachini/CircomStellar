# Frontend Demo (React)

A standalone React frontend for the Groth16 Soroban verifier demo.

## Features

- In-browser proof generation using `snarkjs` and Circom artifacts
- Editable `proof_hex` and `public_hex` fields
- Contract verification against testnet contract:
  - `CBAK5KBSEQTYSCT2ONHEZOUXY7MFNB4JZ36WG7C23QALEKEFNWLXHEPL`
- Quick tamper actions to show failed verification behavior

## Setup

1. Copy env template and edit values:

```bash
cp .env.example .env
```

2. Install and run:

```bash
npm install
npm run dev
```

## Env Vars

- `VITE_CONTRACT_ID`: Soroban contract ID
- `VITE_SOURCE_SECRET`: Testnet secret key (used as source account)
- `VITE_SOURCE_PUBLIC`: Optional fallback source account for read-only verification
- `VITE_RPC_URL`: Soroban RPC URL
- `VITE_NETWORK_PASSPHRASE`: Network passphrase

## Notes

- This is a tutorial/demo UI. Never use production secrets in frontend code.
- `proof_hex`/`public_hex` are serialized exactly for the verifier contract's byte interface.
