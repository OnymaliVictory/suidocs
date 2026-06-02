export type NetworkType = 'testnet' | 'mainnet'

export type DocStatus = 'uploading' | 'minting' | 'ready' | 'error'

export interface SuiDocument {
  id: string           // local UUID
  blobId: string       // Walrus blob ID
  nftObjectId?: string // Sui NFT object ID (after minting)
  txDigest?: string    // Sui transaction digest
  name: string
  mimeType: string
  size: number         // bytes
  createdAt: number    // unix timestamp ms
  owner: string        // Sui wallet address
  status: DocStatus
  sharedWith: string[] // Sui addresses
  textContent?: string // extracted text (for text files)
  tags?: string[]
  errorMsg?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isStreaming?: boolean
}

export interface AppSettings {
  anthropicApiKey: string
  tatumApiKey: string
  network: NetworkType
  packageId: string
  walrusPublisher: string
  walrusAggregator: string
  theme: 'light' | 'dark' | 'system'
}

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

export interface UploadProgress {
  stage: 'idle' | 'reading' | 'uploading' | 'minting' | 'done' | 'error'
  walrusProgress: number   // 0–100
  mintingProgress: number  // 0–100
  blobId?: string
  nftObjectId?: string
  txDigest?: string
  error?: string
}
