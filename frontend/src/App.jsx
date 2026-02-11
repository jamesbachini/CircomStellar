import { useMemo, useState } from "react";
import * as snarkjs from "snarkjs";
import { cleanHex, proofToHex, publicSignalsToHex } from "./lib/snarkHex";
import { verifyProofOnSoroban } from "./lib/stellarVerify";

const envSecret = import.meta.env.VITE_SOURCE_SECRET || "";

const DEFAULTS = {
  contractId:
    import.meta.env.VITE_CONTRACT_ID ||
    "CBAK5KBSEQTYSCT2ONHEZOUXY7MFNB4JZ36WG7C23QALEKEFNWLXHEPL",
  sourceSecret: envSecret.includes("REPLACE_WITH") ? "" : envSecret,
  sourcePublicKey: import.meta.env.VITE_SOURCE_PUBLIC || "",
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase:
    import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
};

function multiplyOrZero(a, b) {
  try {
    return (BigInt(a) * BigInt(b)).toString();
  } catch {
    return "0";
  }
}

export default function App() {
  const [a, setA] = useState("3");
  const [b, setB] = useState("11");

  const [proofHex, setProofHex] = useState("");
  const [publicHex, setPublicHex] = useState("");
  const [publicSignals, setPublicSignals] = useState([]);

  const [contractId, setContractId] = useState(DEFAULTS.contractId);
  const [sourceSecret, setSourceSecret] = useState(DEFAULTS.sourceSecret);
  const [sourcePublicKeyInput, setSourcePublicKeyInput] = useState(DEFAULTS.sourcePublicKey);
  const [rpcUrl, setRpcUrl] = useState(DEFAULTS.rpcUrl);
  const [networkPassphrase, setNetworkPassphrase] = useState(DEFAULTS.networkPassphrase);

  const [busyGenerate, setBusyGenerate] = useState(false);
  const [busyVerify, setBusyVerify] = useState(false);
  const [message, setMessage] = useState("Generate a Groth16 proof, then verify it against Soroban testnet.");
  const [verifyResult, setVerifyResult] = useState(null);
  const [sourcePublicKey, setSourcePublicKey] = useState("");

  const predictedOutput = useMemo(() => multiplyOrZero(a, b), [a, b]);

  async function onGenerateProof(e) {
    e.preventDefault();
    setBusyGenerate(true);
    setVerifyResult(null);
    try {
      const input = { a: a.trim(), b: b.trim() };
      const { proof, publicSignals: pub } = await snarkjs.groth16.fullProve(
        input,
        "/circuits/multiplier2.wasm",
        "/proving/multiplier2_final.zkey"
      );

      const nextProofHex = proofToHex(proof);
      const nextPublicHex = publicSignalsToHex(pub);

      setProofHex(nextProofHex);
      setPublicHex(nextPublicHex);
      setPublicSignals(pub);
      setMessage(`Proof generated for a=${input.a}, b=${input.b}. Public output c=${pub[0]}.`);
    } catch (err) {
      setMessage(`Proof generation failed: ${err.message || String(err)}`);
    } finally {
      setBusyGenerate(false);
    }
  }

  function onCorruptProof() {
    if (!proofHex) return;
    const c = cleanHex(proofHex);
    if (c.length < 2) return;
    const head = c.slice(0, c.length - 2);
    const tail = c.slice(c.length - 2);
    const flipped = (parseInt(tail, 16) ^ 0x01).toString(16).padStart(2, "0");
    setProofHex(head + flipped);
    setMessage("Proof hex mutated. Verification should now fail or revert.");
  }

  function onCorruptPublicSignal() {
    if (!publicHex) return;
    const c = cleanHex(publicHex);
    if (c.length < 2) return;
    const head = c.slice(0, c.length - 2);
    const tail = c.slice(c.length - 2);
    const bumped = (parseInt(tail, 16) + 1).toString(16).slice(-2).padStart(2, "0");
    setPublicHex(head + bumped);
    setMessage("Public hex mutated. Verification should now return false.");
  }

  async function onVerifyProof(e) {
    e.preventDefault();
    setBusyVerify(true);
    setVerifyResult(null);

    try {
      const result = await verifyProofOnSoroban({
        rpcUrl,
        networkPassphrase,
        contractId,
        sourceSecret,
        sourcePublicKey: sourcePublicKeyInput,
        proofHex,
        publicHex,
      });

      setSourcePublicKey(result.sourcePublicKey);
      setVerifyResult(result.verified);
      setMessage(
        result.verified
          ? "Contract verification returned true."
          : "Contract verification returned false (expected after edits)."
      );
    } catch (err) {
      setMessage(`Verification failed: ${err.message || String(err)}`);
    } finally {
      setBusyVerify(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />

      <main className="container">
        <header className="hero">
          <p className="eyebrow">CIRCOM + SNARKJS + GROTH16 + STELLAR</p>
          <h1>Circom x Stellar</h1>
          <p className="subtitle">
            Generate a zero-knowledge proof in-browser and verify against a live verifier contract on Stellar.
          </p>
        </header>

        <section className="panel-grid">
          <article className="panel">
            <h2>1. Generate Proof</h2>
            <form onSubmit={onGenerateProof} className="stack">
              <div className="field-row">
                <label>
                  Private input a
                  <input value={a} onChange={(e) => setA(e.target.value)} inputMode="numeric" required />
                </label>
                <label>
                  Private input b
                  <input value={b} onChange={(e) => setB(e.target.value)} inputMode="numeric" required />
                </label>
              </div>

              <div className="pill">Predicted public output c = {predictedOutput}</div>

              <button type="submit" className="btn btn-primary" disabled={busyGenerate}>
                {busyGenerate ? "Generating..." : "Generate Proof"}
              </button>
            </form>

            <div className="stack">
              <label>
                Proof hex (editable)
                <textarea
                  value={proofHex}
                  onChange={(e) => setProofHex(e.target.value)}
                  placeholder="Generated proof hex appears here"
                  rows={6}
                />
              </label>

              <label>
                Public signals hex (editable)
                <textarea
                  value={publicHex}
                  onChange={(e) => setPublicHex(e.target.value)}
                  placeholder="Generated public hex appears here"
                  rows={4}
                />
              </label>

              <div className="row-actions">
                <button type="button" className="btn btn-ghost" onClick={onCorruptProof}>
                  Flip Last Proof Byte
                </button>
                <button type="button" className="btn btn-ghost" onClick={onCorruptPublicSignal}>
                  Bump Public Signal
                </button>
                <span className="muted">Current public signal: {publicSignals[0] ?? "n/a"}</span>
              </div>
            </div>
          </article>

          <article className="panel">
            <h2>2. Verify On Soroban Testnet</h2>
            <form onSubmit={onVerifyProof} className="stack">
              <label>
                Contract ID
                <input value={contractId} onChange={(e) => setContractId(e.target.value)} required />
              </label>

              <label>
                Source secret key (testnet)
                <input
                  type="password"
                  value={sourceSecret}
                  onChange={(e) => setSourceSecret(e.target.value)}
                />
              </label>

              <label>
                Source public key (fallback for read-only verify)
                <input
                  value={sourcePublicKeyInput}
                  onChange={(e) => setSourcePublicKeyInput(e.target.value)}
                />
              </label>

              <div className="field-row">
                <label>
                  RPC URL
                  <input value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} required />
                </label>
                <label>
                  Network passphrase
                  <input
                    value={networkPassphrase}
                    onChange={(e) => setNetworkPassphrase(e.target.value)}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={busyVerify || !proofHex || !publicHex}
              >
                {busyVerify ? "Verifying..." : "Verify Proof"}
              </button>
            </form>

            <div className="result-box">
              <p>{message}</p>
              {sourcePublicKey && <p className="muted">Source account: {sourcePublicKey}</p>}
              {verifyResult !== null && (
                <p className={verifyResult ? "ok" : "bad"}>
                  verifier.verify(...) =&gt; {String(verifyResult)}
                </p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
