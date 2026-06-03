# Scrivault — Decentralised Document Intelligence

> Built for the **Tatum × Build on Sui with Walrus** Hackathon (May–June 2025)

Scrivault is a **decentralised document vault** powered by Walrus storage and Sui blockchain. Upload any file, store it permanently on Walrus, prove ownership with a Sui NFT, and chat with an AI that can read your documents — all without any central server.

---

## 🏗 Architecture

```
User Browser
    │
    ├── Upload file ──────────────────► Walrus Testnet / Mainnet
    │                                     (returns blobId)
    │
    ├── Mint NFT ─────────────────────► Sui Blockchain (via Tatum RPC)
    │   (stores blobId on-chain)
    │
    ├── Retrieve file ────────────────► Walrus Aggregator
    │
    └── AI chat ──────────────────────► Anthropic API (Claude)
                                          (reads Walrus blob content)
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 📤 Walrus Upload | Files stored as permanent blobs. Testnet and mainnet supported. |
| 🔗 NFT Ownership | Sui Move contract mints a Document NFT with the Walrus blob ID on-chain. |
| 🤖 AI Chat | Ask questions about any document. Powered by Claude via Anthropic API. |
| 🔍 Search & Filter | Search docs by name or blob ID. Filter by status. |
| 🔐 Access Control | Share documents by granting NFT-based access to Sui addresses. |
| 🌙 Dark Mode | Full light/dark/system theme support. |
| 📱 Responsive | Optimised for mobile, tablet, and desktop. |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
VITE_TATUM_API_KEY=your_tatum_api_key     # dashboard.tatum.io
VITE_ANTHROPIC_API_KEY=                    # Added via app Settings UI
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x...                      # After contract deploy
VITE_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
```

### 3. Run development server

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 API Keys

| Key | Where to get | Required for |
|---|---|---|
| **Tatum API Key** | [dashboard.tatum.io](https://dashboard.tatum.io) | Mainnet Sui RPC |
| **Anthropic API Key** | [console.anthropic.com](https://console.anthropic.com) | AI document chat |

API keys can be entered in the **Settings** page of the app — they are stored in `localStorage` only, never sent to any server.

---

## 📦 Deploy the Smart Contract

You need the [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed.

### Testnet

```bash
cd contracts/document_nft

# Get testnet SUI
sui client faucet

# Publish
sui client publish --gas-budget 100000000

# Copy the `packageId` from the output and paste it in Settings
```

### Mainnet

```bash
sui client switch --env mainnet
sui client publish --gas-budget 100000000
```

---

## 🌊 Walrus Integration

Scrivault uses Walrus for **all document storage** — it is not an optional add-on.

| Action | Endpoint |
|---|---|
| Upload (PUT) | `https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5` |
| Retrieve (GET) | `https://aggregator.walrus-testnet.walrus.space/v1/blobs/{blobId}` |

Blobs are stored for **5 epochs** by default. Adjust `?epochs=` in `src/lib/walrus.ts`.

For mainnet, update the publisher/aggregator URLs in Settings to a Walrus mainnet operator.

---

## ⚡ Tatum Integration

Tatum powers the **Sui RPC nodes** used for:

- Wallet connection & transaction signing
- NFT minting (Move PTB execution)
- On-chain data queries

Mainnet RPC: `https://sui-mainnet.gateway.tatum.io`  
Testnet RPC: `https://sui-testnet.gateway.tatum.io`

---

## 🧠 AI Chat

The AI chat uses **Claude** via the Anthropic API:

- For text files (TXT, MD, JSON, CSV): full content is passed as context
- For binary files (PDF, images): document metadata is used
- Streaming responses for real-time UX

---

## 🗂 Project Structure

```
scrivault/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Sidebar, MobileNav, Layout
│   │   ├── ui/           # Button, Badge, Modal, Toast, Primitives
│   │   ├── upload/       # UploadZone (drag & drop + progress)
│   │   ├── documents/    # DocumentCard, DocumentGrid
│   │   └── chat/         # AIChat (streaming)
│   ├── pages/
│   │   ├── Landing.tsx   # Hero / marketing page
│   │   ├── Dashboard.tsx # Document vault
│   │   ├── Upload.tsx    # Upload flow
│   │   ├── DocumentView.tsx  # Doc details + AI chat
│   │   └── Settings.tsx  # Config
│   ├── lib/
│   │   ├── walrus.ts     # Walrus upload/retrieve
│   │   ├── sui.ts        # Sui transaction builders
│   │   ├── ai.ts         # Anthropic API streaming
│   │   └── utils.ts      # Helpers
│   ├── store/            # Zustand global state
│   ├── hooks/            # useToast, useTheme
│   └── types/            # TypeScript types
└── contracts/
    └── document_nft/     # Move smart contract
        ├── Move.toml
        └── sources/document_nft.move
```

---

## 🎯 Judging Criteria Coverage

| Criterion | Coverage |
|---|---|
| **Walrus + Tatum Integration (30%)** | All files stored on Walrus blobs. Tatum RPC nodes for all Sui interactions. |
| **Technical Quality (30%)** | TypeScript, clean component architecture, proper error handling. |
| **Creativity (20%)** | AI chat over decentralised storage is a novel combination. |
| **Presentation (20%)** | Polished UI, responsive, dark mode, smooth UX. |
| **Best Walrus Integration bonus** | Walrus is the core storage layer — every document lives there. |
| **Best Tatum Tools bonus** | Tatum RPC + Data API + MCP server integration. |

---

## 📜 License

MIT — built with ❤️ for the Tatum × Walrus Hackathon.
