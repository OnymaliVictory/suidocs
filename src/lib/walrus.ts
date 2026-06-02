import { AppSettings } from '../types'

export interface WalrusUploadResult {
  blobId: string
  suiObjectId?: string
  endEpoch?: number
  cost?: number
  alreadyExisted: boolean
}

/**
 * Upload any file blob to Walrus decentralised storage.
 * Returns the permanent blobId to store on-chain.
 */
export async function uploadToWalrus(
  file: File,
  settings: AppSettings,
  onProgress?: (pct: number) => void
): Promise<WalrusUploadResult> {
  const publisher = settings.walrusPublisher || 'https://publisher.walrus-testnet.walrus.space'
  const url = `${publisher}/v1/blobs?epochs=5`

  const arrayBuffer = await file.arrayBuffer()
  onProgress?.(20)

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: arrayBuffer,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(`Walrus upload failed (${response.status}): ${text}`)
  }

  onProgress?.(80)
  const json = await response.json()
  onProgress?.(100)

  // Walrus returns either newlyCreated or alreadyCertified
  if (json.newlyCreated) {
    const obj = json.newlyCreated.blobObject
    return {
      blobId: obj.blobId,
      suiObjectId: obj.id,
      endEpoch: obj.storage?.endEpoch,
      alreadyExisted: false,
    }
  }

  if (json.alreadyCertified) {
    return {
      blobId: json.alreadyCertified.blobId,
      endEpoch: json.alreadyCertified.endEpoch,
      alreadyExisted: true,
    }
  }

  throw new Error('Unexpected Walrus response: ' + JSON.stringify(json))
}

/**
 * Retrieve a blob from Walrus by its blobId.
 * Returns a Blob that can be used to create an object URL.
 */
export async function retrieveFromWalrus(
  blobId: string,
  settings: AppSettings
): Promise<Blob> {
  const aggregator = settings.walrusAggregator || 'https://aggregator.walrus-testnet.walrus.space'
  const url = `${aggregator}/v1/blobs/${blobId}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Walrus retrieval failed (${response.status})`)
  }
  return response.blob()
}

/**
 * Get a direct URL to view/download a blob via the aggregator.
 */
export function getWalrusUrl(blobId: string, settings: AppSettings): string {
  const aggregator = settings.walrusAggregator || 'https://aggregator.walrus-testnet.walrus.space'
  return `${aggregator}/v1/blobs/${blobId}`
}

/**
 * Try to extract readable text from a file (text files, Markdown, etc.)
 */
export async function extractTextContent(file: File): Promise<string | undefined> {
  const textTypes = [
    'text/plain', 'text/markdown', 'text/csv', 'text/html',
    'application/json', 'application/xml', 'text/xml',
  ]
  if (!textTypes.some((t) => file.type.startsWith(t)) && !file.name.endsWith('.md')) {
    return undefined
  }
  try {
    return await file.text()
  } catch {
    return undefined
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
