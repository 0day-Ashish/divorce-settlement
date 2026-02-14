<div align="center">

# ⚖️ Divorce Settlement Tracker

### Privacy-Preserving Settlement Compliance on the Midnight Network

![Midnight Network](https://img.shields.io/badge/Blockchain-Midnight%20Network-6C3AED?style=for-the-badge)
![Compact](https://img.shields.io/badge/Language-Compact-00B4D8?style=for-the-badge)
![ZK Proofs](https://img.shields.io/badge/Privacy-Zero%20Knowledge%20Proofs-10B981?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Deployed%20on%20Preprod-success?style=for-the-badge)

<br />

**Divorcing parties can track compliance with settlement terms on-chain — while keeping amounts, conditions, and sensitive details completely hidden from public court records.**

[Getting Started](#-getting-started) · [Smart Contract](#-smart-contract) · [Features](#-features) · [Deployment](#-deployed-smart-contract)

</div>

---

## 📸 Preview

![Divorce Settlement Tracker](public/image.png)

---

## 📖 Project Description

**Divorce Settlement Tracker** is a decentralized application (dApp) built on the [Midnight Network](https://midnight.network/) that brings **privacy** to divorce settlement compliance.

In traditional systems, settlement agreements are filed in court — exposing sensitive financial details, asset information, and personal terms to public records. This project solves that problem using **zero-knowledge proofs (ZKPs)**, allowing both parties to prove they've complied with settlement terms **without revealing any of the underlying data**.

> 🔐 **Think of it like this:** Both parties can say _"Yes, I've done what I agreed to"_ — and the blockchain can verify it — without anyone ever seeing _what_ they agreed to.

---

## 🤔 What Does It Do?

The dApp provides a simple, three-step workflow for tracking divorce settlement compliance:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Step 1 │  Party A privately confirms compliance               │
│          │  → ZK proof generated (details stay hidden)          │
│          │                                                      │
│   Step 2 │  Party B privately confirms compliance               │
│          │  → ZK proof generated (details stay hidden)          │
│          │                                                      │
│   Step 3 │  Either party finalizes the settlement               │
│          │  → On-chain status updated to "Settled" ✓            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

1. **Party A** calls `confirmByPartyA()` with a private proof of compliance — the proof is never stored or visible on-chain
2. **Party B** independently calls `confirmByPartyB()` with their own private proof
3. Once both parties have confirmed, anyone can call `finalizeSettlement()` to mark the case as complete
4. The blockchain only records _whether_ each party confirmed and _whether_ the settlement is done — **never the terms, amounts, or conditions**

---

## ✨ Features

| Feature                        | Description                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| 🔒 **Full Privacy**            | Settlement terms, financial amounts, and conditions are never revealed on-chain |
| 🛡️ **Zero-Knowledge Proofs**   | Compliance is verified cryptographically without exposing the underlying data   |
| ⚡ **Dual-Party Confirmation** | Both parties must independently confirm before settlement can be finalized      |
| 🌐 **On-Chain Verification**   | All confirmations are recorded immutably on the Midnight blockchain             |
| 🖥️ **Interactive CLI**         | Easy-to-use terminal interface for deploying and interacting with contracts     |
| 🏗️ **Multi-Network Support**   | Deploy to Local, Preview, or Preprod testnets                                   |
| 📦 **Monorepo Architecture**   | Clean separation of contract, CLI, and frontend packages                        |

---

## 🚀 Deployed Smart Contract

The contract is **live and verified** on the Midnight **Preprod** testnet:

|                         |                                                                    |
| ----------------------- | ------------------------------------------------------------------ |
| 📍 **Contract Address** | `822abc2d9740bb00f93861e7d9e804a48c2beb16c04d1c17f7f0ca0b8479695f` |
| 🌐 **Network**          | Preprod Testnet                                                    |
| 📅 **Deployed At**      | February 14, 2026                                                  |
| 🔗 **Indexer**          | `https://indexer.preprod.midnight.network`                         |
| 🖧 **Node RPC**          | `https://rpc.preprod.midnight.network`                             |

---

## 🛠️ Tech Stack

| Component      | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| Smart Contract | [Compact](https://docs.midnight.network/) (Midnight's ZK-native language) |
| Blockchain     | [Midnight Network](https://midnight.network/)                             |
| ZK Proving     | Halo2-based ZK Circuits                                                   |
| Frontend       | React + Vite                                                              |
| CLI            | TypeScript + ts-node                                                      |
| Wallet         | Midnight Wallet SDK (HD, Shielded, Unshielded, Dust)                      |
| Build System   | Turborepo + npm workspaces                                                |

---

## 📁 Project Structure

```
divorce-settlement-tracker/
│
├── divorce-settlement-contract/     # 📜 Smart contract package
│   ├── src/
│   │   ├── divorce.compact          #    The Compact smart contract
│   │   ├── witnesses.ts             #    Private state definitions
│   │   ├── index.ts                 #    Contract exports
│   │   └── managed/divorce/         #    Compiled ZK artifacts (circuits, keys)
│   └── package.json
│
├── divorce-settlement-cli/          # 💻 CLI & deployment tools
│   ├── src/
│   │   ├── deploy.ts                #    Interactive deployment script
│   │   ├── api.ts                   #    Contract interaction functions
│   │   ├── cli.ts                   #    Terminal UI for settlement actions
│   │   ├── common-types.ts          #    TypeScript type definitions
│   │   └── config.ts                #    Network configurations
│   └── package.json
│
├── frontend-vite-react/             # 🌐 React frontend
├── package.json                     # 📦 Root workspace config
└── turbo.json                       # ⚙️  Turborepo config
```

---

## 📜 Smart Contract

The contract is written in **Compact** — Midnight's ZK-native smart contract language. It exposes **3 circuits**:

| Circuit                              | What It Does                                                       |
| ------------------------------------ | ------------------------------------------------------------------ |
| `confirmByPartyA(proofOfCompliance)` | Party A privately proves they've met settlement terms              |
| `confirmByPartyB(proofOfCompliance)` | Party B privately proves they've met settlement terms              |
| `finalizeSettlement()`               | Finalizes the settlement (requires both parties to have confirmed) |

### On-Chain State (Public Ledger)

| Field             | Type      | Meaning                              |
| ----------------- | --------- | ------------------------------------ |
| `isSettled`       | `Uint<8>` | `0` = ongoing, `1` = finalized       |
| `partyAConfirmed` | `Uint<8>` | `0` = not confirmed, `1` = confirmed |
| `partyBConfirmed` | `Uint<8>` | `0` = not confirmed, `1` = confirmed |

### What's Private vs Public

| ✅ Public (on-chain)      | 🔒 Private (never revealed)   |
| ------------------------- | ----------------------------- |
| Whether Party A confirmed | The compliance proof data     |
| Whether Party B confirmed | Settlement terms & conditions |
| Whether it's finalized    | Financial amounts & assets    |
| Contract address          | Party identities              |

---

## 🏁 Getting Started

### Prerequisites

| Tool                                                            | Version | Purpose            |
| --------------------------------------------------------------- | ------- | ------------------ |
| [Node.js](https://nodejs.org/)                                  | v18+    | Runtime            |
| [npm](https://www.npmjs.com/)                                   | v10+    | Package manager    |
| [Docker](https://docs.docker.com/get-docker/)                   | Latest  | Proof server       |
| [Git LFS](https://git-lfs.com/)                                 | Latest  | Large ZK key files |
| [Compact](https://docs.midnight.network/relnotes/compact-tools) | Latest  | Contract compiler  |

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/divorce-settlement-tracker.git
cd divorce-settlement-tracker
npm install
```

### Step 2 — Compile the Contract

```bash
cd divorce-settlement-contract
npm run compact
```

> This generates ZK circuits, proving keys, and TypeScript bindings in `src/managed/divorce/`.

### Step 3 — Build Everything

```bash
# From project root
npm run build
```

### Step 4 — Start the Proof Server

```bash
cd divorce-settlement-cli
npm run ps-undeployed    # Local network
# or: npm run ps-preview  # Preview testnet
```

### Step 5 — Deploy the Contract

```bash
cd divorce-settlement-cli
npm run deploy
```

You'll be prompted to:

1. Pick a network (Local / Preview / Preprod)
2. Enter a wallet seed
3. Wait for sync + funds
4. Deploy!

The contract address is saved to `deployment.json`.

### Step 6 — Interact via CLI

```bash
npm run tui-undeployed   # Local
npm run tui-preview      # Preview testnet
npm run tui-preprod      # Preprod testnet
```

The terminal UI lets you:

- 🚀 Deploy or join a settlement contract
- ✅ Confirm compliance as Party A or Party B
- 🏁 Finalize the settlement
- 📊 View settlement status

### Step 7 — Launch the Frontend

```bash
# From project root
npm run dev:frontend
```

---

## 🌐 Network Configuration

| Network     | Indexer                                    | Node RPC                               | Proof Server            |
| ----------- | ------------------------------------------ | -------------------------------------- | ----------------------- |
| **Local**   | `http://127.0.0.1:8088`                    | `http://127.0.0.1:9944`                | `http://127.0.0.1:6300` |
| **Preview** | `https://indexer.preview.midnight.network` | `https://rpc.preview.midnight.network` | `http://127.0.0.1:6300` |
| **Preprod** | `https://indexer.preprod.midnight.network` | `https://rpc.preprod.midnight.network` | `http://127.0.0.1:6300` |

> 💡 The proof server always runs locally via Docker, regardless of which network you deploy to.

---

## 📋 Available Scripts

| Script                   | Where | What It Does                  |
| ------------------------ | ----- | ----------------------------- |
| `npm run compact`        | Root  | Compile all Compact contracts |
| `npm run build`          | Root  | Build all packages            |
| `npm run dev:frontend`   | Root  | Start React dev server        |
| `npm run deploy`         | CLI   | Deploy contract (interactive) |
| `npm run tui-undeployed` | CLI   | CLI on local network          |
| `npm run tui-preview`    | CLI   | CLI on Preview testnet        |
| `npm run tui-preprod`    | CLI   | CLI on Preprod testnet        |

---

## ⚠️ Known Issues

- The **arm64 Docker image** of the proof server has a known bug
- **Workaround:** Use the Bricktower proof server image: `bricktowers/proof-server:6.1.0-alpha.6`

---

## 📄 License

This project is licensed under **Apache-2.0**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ on [Midnight Network](https://midnight.network/)**

_Privacy-preserving smart contracts powered by zero-knowledge proofs_

⭐ Star this repo if you found it useful!

</div>
