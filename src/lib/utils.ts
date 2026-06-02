import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(ts))
}

export function formatDateShort(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(ts))
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

/** Return a colour class name based on file mime type */
export function getMimeColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'text-pink-500'
  if (mimeType.startsWith('video/')) return 'text-purple-500'
  if (mimeType.startsWith('audio/')) return 'text-yellow-500'
  if (mimeType.includes('pdf')) return 'text-red-500'
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'text-orange-500'
  if (mimeType.startsWith('text/')) return 'text-teal-600'
  return 'text-slate-500'
}

export function getMimeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/json': 'JSON',
    'text/plain': 'TXT',
    'text/markdown': 'MD',
    'text/html': 'HTML',
    'text/csv': 'CSV',
    'image/png': 'PNG',
    'image/jpeg': 'JPG',
    'image/gif': 'GIF',
    'image/webp': 'WEBP',
    'image/svg+xml': 'SVG',
    'video/mp4': 'MP4',
    'audio/mpeg': 'MP3',
    'application/zip': 'ZIP',
  }
  return map[mimeType] ?? mimeType.split('/')[1]?.toUpperCase() ?? 'FILE'
}

export function getMimeBg(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'bg-pink-50 dark:bg-pink-950/30'
  if (mimeType.startsWith('video/')) return 'bg-purple-50 dark:bg-purple-950/30'
  if (mimeType.includes('pdf')) return 'bg-red-50 dark:bg-red-950/30'
  if (mimeType.includes('json') || mimeType.includes('xml')) return 'bg-orange-50 dark:bg-orange-950/30'
  if (mimeType.startsWith('text/')) return 'bg-teal-50 dark:bg-teal-950/30'
  return 'bg-slate-50 dark:bg-slate-800/50'
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function isTextReadable(mimeType: string): boolean {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml'
  )
}
