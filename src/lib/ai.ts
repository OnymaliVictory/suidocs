import { SuiDocument, ChatMessage } from '../types'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

function buildSystemPrompt(doc: SuiDocument): string {
  return `You are an intelligent document assistant for SuiDocs, a decentralised document platform built on Sui blockchain and Walrus storage.

You are currently helping the user analyse and understand a document with these details:
- Name: ${doc.name}
- Type: ${doc.mimeType}
- Size: ${formatBytes(doc.size)}
- Stored on Walrus with Blob ID: ${doc.blobId}
- Created: ${new Date(doc.createdAt).toLocaleString()}
- Status: ${doc.status}
${doc.nftObjectId ? `- Sui NFT Object ID: ${doc.nftObjectId}` : ''}
${doc.txDigest ? `- Mint Transaction: ${doc.txDigest}` : ''}
${doc.textContent ? `\nDocument Content:\n---\n${doc.textContent.slice(0, 8000)}\n---` : '\n[This file type cannot be previewed inline. You can answer questions about the document metadata above.]'}

Be helpful, concise, and professional. If you cannot answer something from the content provided, say so clearly. You can explain Walrus and Sui concepts when relevant.`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export interface StreamChunk {
  delta: string
  done: boolean
}

/**
 * Stream a response from Anthropic API for document Q&A.
 * Calls the callback with each text delta as it arrives.
 */
export async function streamDocumentChat(
  doc: SuiDocument,
  messages: ChatMessage[],
  apiKey: string,
  onDelta: (delta: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  if (!apiKey) {
    onError('No Anthropic API key found. Please add it in Settings.')
    return
  }

  const anthropicMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: buildSystemPrompt(doc),
        stream: true,
        messages: anthropicMessages,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      onError(err?.error?.message ?? `API error ${response.status}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) { onError('Stream not available'); return }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        try {
          const event = JSON.parse(data)
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            onDelta(event.delta.text)
          }
        } catch { /* skip malformed events */ }
      }
    }

    onDone()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    onError(message)
  }
}

/** One-shot (non-streaming) call — used as fallback for environments without streaming. */
export async function askDocumentQuestion(
  doc: SuiDocument,
  messages: ChatMessage[],
  apiKey: string
): Promise<string> {
  if (!apiKey) throw new Error('No Anthropic API key configured.')

  const anthropicMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(doc),
      messages: anthropicMessages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}
