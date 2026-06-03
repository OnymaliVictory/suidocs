import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import '@mysten/dapp-kit/dist/index.css'
import './index.css'
import App from './App'

// ── Sui Network Config (Tatum RPC endpoints) ───────────────────
// The API key is injected per-request inside buildSuiClient (src/lib/sui.ts).
// dapp-kit uses these URLs for wallet connection; actual app transactions
// go through buildSuiClient which attaches the x-api-key header.
const { networkConfig } = createNetworkConfig({
  testnet: { url: 'https://sui-testnet.gateway.tatum.io' },
  mainnet: { url: 'https://sui-mainnet.gateway.tatum.io' },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
