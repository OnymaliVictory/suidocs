import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle, ExternalLink, Zap } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useStore } from '../../store/useStore'
import { uploadToWalrus, extractTextContent } from '../../lib/walrus'
import { buildMintTransaction } from '../../lib/sui'
import { formatBytes, getMimeLabel, getMimeColor, getMimeBg, cn } from '../../lib/utils'
import { Button } from '../ui/Button'
import { UploadProgress } from '../../types'
import { useToast } from '../../hooks/useToast'
import { useNavigate } from 'react-router-dom'

const ACCEPTED_TYPES = '.pdf,.txt,.md,.json,.csv,.html,.xml,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mp3,.zip'
const MAX_SIZE_MB = 100

export function UploadZone() {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  const addDocument = useStore((s) => s.addDocument)
  const updateDocument = useStore((s) => s.updateDocument)
  const settings = useStore((s) => s.settings)
  const toast = useToast()
  const navigate = useNavigate()

  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgress>({ stage: 'idle', walrusProgress: 0, mintingProgress: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const handleDragLeave = useCallback(() => setDragging(false), [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }, [])

  function validateAndSetFile(file: File) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large`, `Maximum size is ${MAX_SIZE_MB} MB`)
      return
    }
    setSelectedFile(file)
    setProgress({ stage: 'idle', walrusProgress: 0, mintingProgress: 0 })
  }

  async function handleUpload() {
    if (!selectedFile || !account) return

    const docId = uuidv4()

    // Create placeholder document
    addDocument({
      id: docId,
      blobId: '',
      name: selectedFile.name,
      mimeType: selectedFile.type || 'application/octet-stream',
      size: selectedFile.size,
      createdAt: Date.now(),
      owner: account.address,
      status: 'uploading',
      sharedWith: [],
    })

    try {
      // Stage 1: upload to Walrus
      setProgress({ stage: 'uploading', walrusProgress: 0, mintingProgress: 0 })

      const textContent = await extractTextContent(selectedFile)

      const walrusResult = await uploadToWalrus(
        selectedFile,
        settings,
        (pct) => setProgress({ stage: 'uploading', walrusProgress: pct, mintingProgress: 0 })
      )

      updateDocument(docId, { blobId: walrusResult.blobId, textContent, status: 'minting' })
      setProgress({ stage: 'minting', walrusProgress: 100, mintingProgress: 10, blobId: walrusResult.blobId })

      // Stage 2: Mint NFT on Sui (if package deployed)
      if (settings.packageId && settings.packageId !== '0x' + '0'.repeat(64)) {
        const tx = buildMintTransaction({
          packageId: settings.packageId,
          blobId: walrusResult.blobId,
          name: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
        })

        setProgress((p) => ({ ...p, mintingProgress: 30 }))

        const result = await signAndExecute(
          { transaction: tx as never },
          { onSuccess: () => setProgress((p) => ({ ...p, mintingProgress: 90 })) }
        )

        const createdObj = (result as { effects?: { created?: Array<{ reference?: { objectId?: string } }> } })
          ?.effects?.created?.[0]?.reference?.objectId

        updateDocument(docId, {
          status: 'ready',
          txDigest: result.digest,
          nftObjectId: createdObj,
        })

        setProgress({
          stage: 'done',
          walrusProgress: 100,
          mintingProgress: 100,
          blobId: walrusResult.blobId,
          txDigest: result.digest,
          nftObjectId: createdObj,
        })
      } else {
        // No contract deployed — mark ready with Walrus blob only
        updateDocument(docId, { status: 'ready' })
        setProgress({
          stage: 'done',
          walrusProgress: 100,
          mintingProgress: 100,
          blobId: walrusResult.blobId,
        })
      }

      toast.success('Document stored!', walrusResult.alreadyExisted ? 'Blob already existed on Walrus.' : 'Successfully uploaded to Walrus.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      updateDocument(docId, { status: 'error', errorMsg: msg })
      setProgress((p) => ({ ...p, stage: 'error', error: msg }))
      toast.error('Upload failed', msg)
    }
  }

  const isUploading = progress.stage === 'uploading' || progress.stage === 'minting'
  const isDone = progress.stage === 'done'
  const isError = progress.stage === 'error'

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Connect your wallet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">Connect a Sui wallet to upload documents and mint ownership NFTs.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Drop zone */}
      {!selectedFile && !isDone && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center min-h-[280px] rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer group',
            dragging
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/40 dark:hover:bg-primary-900/10'
          )}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f) }} />

          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200', dragging ? 'bg-primary-100 dark:bg-primary-900/50 scale-110' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30')}>
            <Upload className={cn('w-8 h-8 transition-colors', dragging ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500')} />
          </div>

          <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {dragging ? 'Drop it!' : 'Drop your file here'}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-600 mb-3">or <span className="text-primary-600 dark:text-primary-400 font-medium">click to browse</span></p>
          <p className="text-xs text-slate-400 dark:text-slate-600">PDF, TXT, MD, JSON, CSV, Images, Video · Max {MAX_SIZE_MB} MB</p>

          {/* Decorative grid */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, #0f766e 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>
      )}

      {/* File preview */}
      {selectedFile && !isDone && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-card">
          <div className="flex items-start gap-4">
            <div className={cn('w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0', getMimeBg(selectedFile.type))}>
              <FileText className={cn('w-6 h-6', getMimeColor(selectedFile.type))} />
              <span className={cn('text-[9px] font-bold mt-0.5', getMimeColor(selectedFile.type))}>{getMimeLabel(selectedFile.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{formatBytes(selectedFile.size)} · {selectedFile.type || 'unknown type'}</p>
            </div>
            {!isUploading && (
              <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress steps */}
          {(isUploading || isError) && (
            <div className="mt-5 space-y-3">
              <Step
                label="Upload to Walrus"
                sub={progress.blobId ? `Blob: ${progress.blobId.slice(0, 20)}…` : 'Encrypting & uploading…'}
                state={progress.stage === 'uploading' ? 'active' : progress.walrusProgress === 100 ? 'done' : 'pending'}
                progress={progress.walrusProgress}
              />
              <Step
                label="Mint Document NFT on Sui"
                sub={progress.txDigest ? `Tx: ${progress.txDigest.slice(0, 20)}…` : settings.packageId ? 'Writing ownership on-chain…' : 'No contract deployed — skip'}
                state={progress.stage === 'minting' ? 'active' : progress.mintingProgress === 100 ? 'done' : 'pending'}
                progress={progress.mintingProgress}
              />
            </div>
          )}

          {isError && (
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{progress.error}</p>
            </div>
          )}

          {!isUploading && !isError && (
            <Button className="w-full mt-5" onClick={handleUpload} loading={isUploading} leftIcon={<Zap className="w-4 h-4" />}>
              Upload to Walrus & Mint NFT
            </Button>
          )}
        </div>
      )}

      {/* Done state */}
      {isDone && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-card animate-slide-up">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Stored on Walrus!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your document is permanently stored and verifiable.</p>
          </div>

          <div className="space-y-2.5 text-sm">
            {progress.blobId && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium text-xs">Walrus Blob ID</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">{progress.blobId}</span>
              </div>
            )}
            {progress.txDigest && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium text-xs">Sui Tx</span>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">{progress.txDigest}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={() => { setSelectedFile(null); setProgress({ stage: 'idle', walrusProgress: 0, mintingProgress: 0 }) }}>
              Upload Another
            </Button>
            <Button className="flex-1" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Step({ label, sub, state, progress }: { label: string; sub: string; state: 'pending' | 'active' | 'done'; progress: number }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all',
        state === 'done'   ? 'bg-emerald-100 dark:bg-emerald-900/40' :
        state === 'active' ? 'bg-primary-100 dark:bg-primary-900/40' :
                             'bg-slate-100 dark:bg-slate-800'
      )}>
        {state === 'done'   ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
         state === 'active' ? <Loader2 className="w-4 h-4 text-primary-600 animate-spin" /> :
                              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', state === 'pending' ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300')}>{label}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{sub}</p>
        {state === 'active' && (
          <div className="mt-1.5 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
