import { Plus, Database, Shield, TrendingUp, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useStore } from '../store/useStore'
import { DocumentGrid } from '../components/documents/DocumentGrid'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Primitives'
import { Badge } from '../components/ui/Primitives'
import { SuiDocument } from '../types'
import { formatBytes } from '../lib/utils'
import { shortAddr } from '../lib/sui'
import { isValidSuiAddress } from '../lib/sui'
import { useToast } from '../hooks/useToast'

export default function Dashboard() {
  const account = useCurrentAccount()
  const navigate = useNavigate()
  const toast = useToast()
  const documents = useStore((s) => s.documents)
  const removeDocument = useStore((s) => s.removeDocument)
  const updateDocument = useStore((s) => s.updateDocument)

  const [shareDoc, setShareDoc] = useState<SuiDocument | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<SuiDocument | null>(null)
  const [shareAddress, setShareAddress] = useState('')
  const [shareError, setShareError] = useState('')

  if (!account) {
    navigate('/')
    return null
  }

  const totalSize = documents.reduce((sum, d) => sum + d.size, 0)
  const readyCount = documents.filter((d) => d.status === 'ready').length
  const sharedCount = documents.filter((d) => d.sharedWith.length > 0).length

  const stats = [
    { icon: Database, label: 'Total Documents', value: documents.length, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
    { icon: Shield,   label: 'On Walrus',       value: readyCount,       color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { icon: Share2,   label: 'Shared',          value: sharedCount,      color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-900/30' },
    { icon: TrendingUp, label: 'Storage Used',  value: formatBytes(totalSize), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  ]

  function handleShare(doc: SuiDocument) {
    setShareDoc(doc)
    setShareAddress('')
    setShareError('')
  }

  function handleConfirmShare() {
    if (!shareDoc) return
    if (!isValidSuiAddress(shareAddress)) {
      setShareError('Enter a valid Sui address (0x + 64 hex chars)')
      return
    }
    if (shareDoc.sharedWith.includes(shareAddress)) {
      setShareError('Already shared with this address')
      return
    }
    updateDocument(shareDoc.id, { sharedWith: [...shareDoc.sharedWith, shareAddress] })
    toast.success('Document shared!', `Shared with ${shareAddress.slice(0, 10)}…`)
    setShareDoc(null)
  }

  function handleDelete(doc: SuiDocument) { setDeleteDoc(doc) }
  function handleConfirmDelete() {
    if (!deleteDoc) return
    removeDocument(deleteDoc.id)
    toast.info('Document removed', 'The document has been removed from your vault. Walrus blob remains.')
    setDeleteDoc(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-mono text-slate-700 dark:text-slate-300">{shortAddr(account.address)}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/upload')} leftIcon={<Plus className="w-4 h-4" />}>
          Upload Doc
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
          </div>
        ))}
      </div>

      {/* Document grid */}
      <DocumentGrid
        documents={documents}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      {/* Share Modal */}
      <Modal
        open={!!shareDoc}
        onClose={() => setShareDoc(null)}
        title="Share Document"
        description="Grant another Sui wallet access to this document."
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">Document</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{shareDoc?.name}</p>
          </div>
          <Input
            label="Recipient Sui Address"
            placeholder="0x…"
            value={shareAddress}
            onChange={(e) => { setShareAddress(e.target.value); setShareError('') }}
            error={shareError}
          />
          {shareDoc && shareDoc.sharedWith.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Already shared with</p>
              <div className="space-y-1">
                {shareDoc.sharedWith.map((addr) => (
                  <div key={addr} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{shortAddr(addr)}</span>
                    <button
                      onClick={() => { updateDocument(shareDoc.id, { sharedWith: shareDoc.sharedWith.filter((a) => a !== addr) }) }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShareDoc(null)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConfirmShare} leftIcon={<Share2 className="w-4 h-4" />}>Share</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        title="Remove Document"
        description="This removes the document from your vault. The Walrus blob remains on-chain."
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <p className="text-xs text-red-500 font-medium mb-1">Warning</p>
            <p className="text-sm text-red-700 dark:text-red-400">This only removes the document from your local vault. The Walrus blob and NFT remain on-chain and cannot be deleted.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteDoc(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleConfirmDelete}>Remove</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
