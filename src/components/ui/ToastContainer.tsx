import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ToastItem } from '../../types'
import { cn } from '../../lib/utils'

const icons = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900',
  error:   'border-red-200 dark:border-red-800 bg-white dark:bg-slate-900',
  info:    'border-primary-200 dark:border-primary-800 bg-white dark:bg-slate-900',
  warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900',
}

const iconStyles = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  info:    'text-primary-500',
  warning: 'text-amber-500',
}

function ToastRow({ toast }: { toast: ToastItem }) {
  const removeToast = useStore((s) => s.removeToast)
  const Icon = icons[toast.type]

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-2xl border shadow-card-lg min-w-[280px] max-w-sm animate-slide-in-right',
      styles[toast.type]
    )}>
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts)
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none [&>*]:pointer-events-auto">
      {toasts.map((t) => <ToastRow key={t.id} toast={t} />)}
    </div>
  )
}
