import {
  ArrowLeft, ExternalLink, Copy, CheckCheck, Share2, Download,
  FileText, CheckCircle, AlertCircle, Clock, Loader2,
  MessageSquare, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { AIChat } from '../components/chat/AIChat'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Primitives'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Primitives'
import { retrieveFromWalrus, getWalrusUrl } from '../lib/walrus'
import { explorerUrl, shortAddr, isValidSuiAddress } from '../lib/sui'
import {
  formatBytes, formatDate, getMimeColor, getMimeLabel, getMimeBg,
  copyToClipboard, isTextReadable, cn
} from '../lib/utils'
import { useToast } from '../hooks/useToast'

export default function DocumentView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const doc = useStore((s) => s.documents.find((d) => d.id === id))
  const settings = useStore((s) => s.settings)
  const updateDocument = useStore((s) => s.updateDocument)

  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareAddr, setShareAddr] = useState('')
  const [shareError, setShareError] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const [infoExpanded, setInfoExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!doc) return
    if (doc.mimeType.startsWith('image/') && doc.blobId) {
      const url = getWalrusUrl(doc.blobId, settings)
      setImageUrl(url)
    }
  }, [doc?.blobId, doc?.mimeType, settings])

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">Document not found</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</Button>
      </div>
    )
  }

  async function handleCopy(value: string, field: string) {
    await copyToClipboard(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
    toast.success('Copied!')
  }

  // TS: doc is guaranteed non-null here (early return above handles undefined)
  const safeDoc = doc!

  async function handleDownload() {
    if (!safeDoc.blobId) return
    setDownloading(true)
    try {
      const blob = await retrieveFromWalrus(safeDoc.blobId, settings)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = safeDoc.name; a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!', safeDoc.name)
    } catch (err: unknown) {
      toast.error('Download failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDownloading(false)
    }
  }

  function handleShare() { setShareOpen(true); setShareAddr(''); setShareError('') }
  function handleConfirmShare() {
    if (!isValidSuiAddress(shareAddr)) { setShareError('Enter a valid Sui address'); return }
    if (safeDoc.sharedWith.includes(shareAddr)) { setShareError('Already shared'); return }
    updateDocument(safeDoc.id, { sharedWith: [...safeDoc.sharedWith, shareAddr] })
    toast.success('Shared!', `Access granted to ${shortAddr(shareAddr)}`)
    setShareOpen(false)
  }

  const statusMap = {
    ready:     { label: 'On Walrus',  variant: 'success' as const, icon: CheckCircle },
    uploading: { label: 'Uploading',  variant: 'warning' as const, icon: Loader2    },
    minting:   { label: 'Minting',    variant: 'ai'      as const, icon: Loader2    },
    error:     { label: 'Error',      variant: 'danger'  as const, icon: AlertCircle},
  }
  const st = statusMap[doc.status]
  const StatusIcon = st.icon

  const metaRows = [
    { label: 'Walrus Blob ID', value: doc.blobId, mono: true, copyable: true, link: doc.blobId ? `${settings.walrusAggregator}/v1/blobs/${doc.blobId}` : undefined },
    { label: 'NFT Object ID',  value: doc.nftObjectId ?? '—', mono: true, copyable: !!doc.nftObjectId, link: doc.nftObjectId ? explorerUrl(settings.network, 'object', doc.nftObjectId) : undefined },
    { label: 'Tx Digest',      value: doc.txDigest ?? '—', mono: true, copyable: !!doc.txDigest, link: doc.txDigest ? explorerUrl(settings.network, 'tx', doc.txDigest) : undefined },
    { label: 'Owner',          value: shortAddr(doc.owner), mono: true, copyable: false },
    { label: 'File Size',      value: formatBytes(doc.size), mono: false, copyable: false },
    { label: 'Created',        value: formatDate(doc.createdAt), mono: false, copyable: false },
    { label: 'MIME Type',      value: doc.mimeType, mono: true, copyable: false },
    { label: 'Shared With',    value: doc.sharedWith.length ? `${doc.sharedWith.length} address${doc.sharedWith.length > 1 ? 'es' : ''}` : 'Nobody', mono: false, copyable: false },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* ─── Left / main panel ─────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Doc header */}
        <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className={cn('w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0', getMimeBg(doc.mimeType))}>
            <FileText className={cn('w-5 h-5', getMimeColor(doc.mimeType))} />
            <span className={cn('text-[8px] font-bold leading-none mt-0.5', getMimeColor(doc.mimeType))}>{getMimeLabel(doc.mimeType)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant={st.variant} className="gap-1 text-[10px]">
                <StatusIcon className={cn('w-3 h-3', (doc.status === 'uploading' || doc.status === 'minting') && 'animate-spin')} />
                {st.label}
              </Badge>
              {doc.nftObjectId && <Badge variant="primary" className="text-[10px]">NFT</Badge>}
              <span className="text-xs text-slate-400 hidden sm:inline">{formatBytes(doc.size)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleDownload} loading={downloading} leftIcon={<Download className="w-3.5 h-3.5" />} className="hidden sm:inline-flex">
              Download
            </Button>
            <Button variant="secondary" size="sm" onClick={handleShare} leftIcon={<Share2 className="w-3.5 h-3.5" />} className="hidden sm:inline-flex">
              Share
            </Button>
            {/* Mobile: chat toggle */}
            <Button
              variant={chatOpen ? 'primary' : 'secondary'}
              size="sm"
              className="lg:hidden"
              onClick={() => setChatOpen(!chatOpen)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              AI Chat
            </Button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Mobile actions */}
          <div className="flex gap-2 sm:hidden">
            <Button variant="secondary" className="flex-1" size="sm" onClick={handleDownload} loading={downloading} leftIcon={<Download className="w-3.5 h-3.5" />}>Download</Button>
            <Button variant="secondary" className="flex-1" size="sm" onClick={handleShare} leftIcon={<Share2 className="w-3.5 h-3.5" />}>Share</Button>
          </div>

          {/* Image preview */}
          {doc.mimeType.startsWith('image/') && imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4">
              <img src={imageUrl} alt={doc.name} className="max-w-full max-h-80 object-contain rounded-xl" />
            </div>
          )}

          {/* Text preview */}
          {doc.textContent && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Preview</p>
                <button onClick={() => handleCopy(doc.textContent!, 'content')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {copiedField === 'content' ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                {doc.textContent.slice(0, 4000)}{doc.textContent.length > 4000 ? '\n\n… (truncated)' : ''}
              </pre>
            </div>
          )}

          {/* Metadata card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-card overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setInfoExpanded(!infoExpanded)}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Document Details</span>
              </div>
              {infoExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {infoExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {metaRows.map(({ label, value, mono, copyable, link }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 w-28">{label}</span>
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className={cn('text-xs truncate text-slate-700 dark:text-slate-300', mono && 'font-mono')}>
                        {value || '—'}
                      </span>
                      {copyable && value && value !== '—' && (
                        <button onClick={() => handleCopy(value, label)} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          {copiedField === label ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {link && (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-400 hover:text-primary-500 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {doc.status === 'error' && doc.errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Upload failed</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{doc.errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right / AI chat panel ─────────────────────────────── */}
      <div className={cn(
        'lg:w-96 xl:w-[420px] shrink-0 border-l border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 flex flex-col',
        // Mobile: show as overlay/sheet when open
        'fixed lg:relative inset-0 lg:inset-auto z-30 lg:z-auto transition-transform duration-300 lg:transform-none',
        chatOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0',
        'lg:flex'
      )}>
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Chat</p>
          <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">Close ✕</button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <AIChat doc={doc} />
        </div>
      </div>

      {/* Mobile chat backdrop */}
      {chatOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/30 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
      )}

      {/* Share modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share Document" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-0.5">Document</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
          </div>
          <Input label="Recipient Sui Address" placeholder="0x…" value={shareAddr} onChange={(e) => { setShareAddr(e.target.value); setShareError('') }} error={shareError} />
          {doc.sharedWith.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Shared with</p>
              {doc.sharedWith.map((a) => (
                <div key={a} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 mb-1">
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{shortAddr(a)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConfirmShare} leftIcon={<Share2 className="w-4 h-4" />}>Grant Access</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
