# Repository Guidelines

## Project Structure & Module Organization
- `circuits/`: Circom source circuits (currently `multiplier2.circom`).
- `proving/`: proving artifacts and sample inputs (`.zkey`, `.wtns`, `input.json`).
- `contract/`: Soroban verifier contract (`contract/src/lib.rs`).
- `tools/circom_to_soroban_hex/`: Rust CLI that converts `snarkjs` JSON outputs to Soroban-ready hex.
- `frontend/`: Vite + React demo UI (`frontend/src`, static proof assets in `frontend/public`).
- `build/`: generated runtime artifacts (`proof.json`, `public.json`, hex outputs). Treat as disposable.

## Build, Test, and Development Commands
- `./demo.sh`: end-to-end flow (build contract, deploy to testnet, generate proof, verify on-chain).
- `cargo check --workspace`: compile-check all Rust crates quickly.
- `cargo test --workspace`: run Rust tests (currently minimal; also useful as a compile gate).
- `cargo run -p circom-to-soroban-hex -- <vk|proof|public> <json-file>`: encode proof inputs for contract calls.
- `cd frontend && npm install && npm run dev`: run the frontend locally.
- `cd frontend && npm run build`: production frontend build.

## Coding Style & Naming Conventions
- Rust: 4-space indentation, `snake_case` for functions/variables, `PascalCase` for types, `SCREAMING_SNAKE_CASE` for constants.
- React/JS: 2-space indentation, `PascalCase` components (`App.jsx`), `camelCase` helpers (`verifyProofOnSoroban`).
- Keep module names descriptive and aligned with function (`snarkHex.js`, `stellarVerify.js`).
- Run `cargo fmt --all` before opening a PR.

## Testing Guidelines
- Primary validation is integration-style: run `./demo.sh` and confirm final `true` verification output.
- For frontend changes, run `cd frontend && npm run build` to catch compile/runtime issues.
- When adding Rust tests, keep them near the module with `#[cfg(test)]` and clear behavior-oriented names.

## Commit & Pull Request Guidelines
- History is currently minimal (`Initial commit`), so follow concise imperative commit subjects (e.g., `Add proof hex validation in frontend`).
- Keep commits scoped to one concern (contract logic, tooling, or frontend).
- PRs should include: purpose, key changes, verification steps run, and any testnet assumptions (`NETWORK`, `SOURCE`, contract ID).

## Security & Configuration Tips
- Never commit real secrets. Use `frontend/.env.example` as the template.
- Treat `VITE_SOURCE_SECRET` as test-only; prefer disposable accounts for demos.
