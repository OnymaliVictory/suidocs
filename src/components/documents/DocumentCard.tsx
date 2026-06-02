import { FileText, Download, Eye, Share2, Trash2, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { SuiDocument } from '../../types'
import { Badge } from '../ui/Primitives'
import { formatBytes, formatDateShort, getMimeColor, getMimeLabel, getMimeBg, truncate } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { shortAddr } from '../../lib/sui'
import { cn } from '../../lib/utils'

interface DocumentCardProps {
  doc: SuiDocument
  onShare?: (doc: SuiDocument) => void
  onDelete?: (doc: SuiDocument) => void
}

const statusConfig = {
  uploading: { label: 'Uploading',  color: 'warning', icon: Loader2,      spin: true  },
  minting:   { label: 'Minting',    color: 'ai',      icon: Loader2,      spin: true  },
  ready:     { label: 'On-chain',   color: 'success', icon: CheckCircle,  spin: false },
  error:     { label: 'Error',      color: 'danger',  icon: AlertCircle,  spin: false },
} as const

export function DocumentCard({ doc, onShare, onDelete }: DocumentCardProps) {
  const navigate = useNavigate()
  const { status, name, mimeType, size, createdAt, blobId, nftObjectId } = doc
  const cfg = statusConfig[status]
  const StatusIcon = cfg.icon

  return (
    <div
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-card hover:shadow-card-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => navigate(`/doc/${doc.id}`)}
    >
      {/* Top strip / preview */}
      <div className={cn('h-24 flex items-center justify-center relative', getMimeBg(mimeType))}>
        <div className={cn('flex flex-col items-center gap-1.5', getMimeColor(mimeType))}>
          <FileText className="w-10 h-10" />
          <span className="text-xs font-bold tracking-wide opacity-80">{getMimeLabel(mimeType)}</span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge variant={cfg.color as 'success' | 'warning' | 'danger' | 'ai'} className="gap-1">
            <StatusIcon className={cn('w-3 h-3', cfg.spin && 'animate-spin')} />
            {cfg.label}
          </Badge>
        </div>

        {/* NFT badge */}
        {nftObjectId && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="primary" className="text-[10px]">NFT</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate mb-0.5">{name}</h3>
        <p className="text-xs text-slate-400 dark:text-slate-600 mb-3">{formatDateShort(createdAt)} · {formatBytes(size)}</p>

        {/* Blob ID */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 mb-3">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 truncate">{blobId ? truncate(blobId, 28) : 'Pending…'}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions row */}
        <div
          className="flex items-center gap-1 -mx-1 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => navigate(`/doc/${doc.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {onShare && (
            <button
              onClick={() => onShare(doc)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-ai-600 dark:hover:text-ai-400 hover:bg-ai-50 dark:hover:bg-ai-900/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(doc)}
              className="flex items-center justify-center p-1.5 rounded-lg text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
