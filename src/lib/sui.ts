import { SuiClient, SuiHTTPTransport, getFullnodeUrl } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { AppSettings } from '../types'

const TATUM_MAINNET = 'https://sui-mainnet.gateway.tatum.io'
const TATUM_TESTNET = 'https://sui-testnet.gateway.tatum.io'

/** Build a SuiClient using Tatum RPC (with API key header) or public fallback. */
export function buildSuiClient(settings: AppSettings): SuiClient {
  const { network, tatumApiKey } = settings

  const tatumUrl = network === 'mainnet' ? TATUM_MAINNET : TATUM_TESTNET

  if (tatumApiKey) {
    // Pass the Tatum API key via x-api-key header — required for authenticated RPC
    return new SuiClient({
      transport: new SuiHTTPTransport({
        url: tatumUrl,
        rpc: { headers: { 'x-api-key': tatumApiKey } },
      }),
    })
  }

  // No key — fall back to public endpoint (testnet only; mainnet public is rate-limited)
  return new SuiClient({ url: getFullnodeUrl(network) })
}

export interface MintDocumentNFTParams {
  packageId: string
  blobId: string
  name: string
  mimeType: string
  fileSize: number
}

/**
 * Construct a PTB (Programmable Transaction Block) that calls
 * suidocs::document_nft::mint_document on the deployed package.
 */
export function buildMintTransaction(params: MintDocumentNFTParams): Transaction {
  const tx = new Transaction()
  const { packageId, blobId, name, mimeType, fileSize } = params

  tx.moveCall({
    target: `${packageId}::document_nft::mint_document`,
    arguments: [
      tx.pure.string(blobId),
      tx.pure.string(name),
      tx.pure.string(mimeType),
      tx.pure.u64(fileSize),
      tx.pure.u64(Date.now()),
    ],
  })

  return tx
}

/**
 * Construct a PTB that calls suidocs::document_nft::share_document.
 */
export function buildShareTransaction(
  packageId: string,
  nftObjectId: string,
  recipientAddress: string
): Transaction {
  const tx = new Transaction()

  tx.moveCall({
    target: `${packageId}::document_nft::share_document`,
    arguments: [
      tx.object(nftObjectId),
      tx.pure.address(recipientAddress),
    ],
  })

  return tx
}

/** Shorten a Sui address / object ID for display. */
export function shortAddr(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2 + 2) return addr
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
}

/** Build Sui Explorer URL for a txDigest or objectId. */
export function explorerUrl(
  network: 'testnet' | 'mainnet',
  type: 'tx' | 'object' | 'address',
  value: string
): string {
  const base =
    network === 'mainnet'
      ? 'https://suivision.xyz'
      : 'https://testnet.suivision.xyz'
  const path = type === 'tx' ? 'txblock' : type === 'object' ? 'object' : 'account'
  return `${base}/${path}/${value}`
}

/** Validate a Sui address (basic hex check). */
export function isValidSuiAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(addr)
}
