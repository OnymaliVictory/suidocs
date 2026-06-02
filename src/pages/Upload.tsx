import { ArrowLeft, Upload as UploadIcon, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UploadZone } from '../components/upload/UploadZone'
import { Button } from '../components/ui/Button'
import { useStore } from '../store/useStore'

export default function Upload() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const hasContract = settings.packageId && settings.packageId !== '0x' + '0'.repeat(64)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upload Document</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Store permanently on Walrus, optionally mint a Sui NFT
          </p>
        </div>
      </div>

      {/* Info banner — no contract */}
      {!hasContract && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">NFT minting disabled</p>
            <p className="text-amber-600 dark:text-amber-400 mt-0.5">
              No smart contract package ID configured. Documents will be stored on Walrus only.{' '}
              <button onClick={() => navigate('/settings')} className="underline font-medium">Add it in Settings →</button>
            </p>
          </div>
        </div>
      )}

      {/* How it works — mini timeline */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { step: '1', title: 'Upload to Walrus', desc: 'File stored as a permanent decentralised blob' },
          { step: '2', title: 'Mint on Sui',       desc: 'Document NFT records your ownership on-chain' },
          { step: '3', title: 'Chat with AI',      desc: 'Ask questions about your document with Claude' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-card">
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold shrink-0">
              {step}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <UploadZone />
    </div>
  )
}
