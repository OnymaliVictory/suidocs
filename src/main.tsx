import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit'
import { SuiClient, SuiHTTPTransport, getFullnodeUrl } from '@mysten/sui/client'
import '@mysten/dapp-kit/dist/index.css'
import './index.css'
import App from './App'

const TATUM_KEY = (import.meta as { env?: Record<string, string> }).env?.VITE_TATUM_API_KEY ?? ''

// ── Sui Network Config ─────────────────────────────────────────
const { networkConfig } = createNetworkConfig({
  testnet: { url: 'https://sui-testnet.gateway.tatum.io' },
  mainnet: { url: 'https://sui-mainnet.gateway.tatum.io' },
})

/** Inject the Tatum x-api-key header into every RPC call made by dapp-kit */
function createTatumClient(_network: string, config: { url: string }) {
  if (TATUM_KEY) {
    return new SuiClient({
      transport: new SuiHTTPTransport({
        url: config.url,
        rpc: { headers: { 'x-api-key': TATUM_KEY } },
      }),
    })
  }
  return new SuiClient({ url: getFullnodeUrl('testnet') })
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet" createClient={createTatumClient}>
        <WalletProvider autoConnect>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
