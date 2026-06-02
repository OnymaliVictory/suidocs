import { cn } from '../../lib/utils'

// ─── Spinner ────────────────────────────────────────────────────────────────
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string }
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const s = { sm: 'h-4 w-4 border-[2px]', md: 'h-6 w-6 border-2', lg: 'h-8 w-8 border-[3px]' }
  return (
    <span className={cn('inline-block rounded-full border-current border-t-transparent animate-spin', s[size], className)} />
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'ai' | 'outline'
interface BadgeProps { variant?: BadgeVariant; className?: string; children: React.ReactNode }
export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    primary:  'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300',
    success:  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    warning:  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    danger:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    ai:       'bg-ai-100 dark:bg-ai-900/40 text-ai-700 dark:text-ai-300',
    outline:  'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-slate-200 dark:border-slate-700/80', className)} />
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { className?: string; children: React.ReactNode; onClick?: () => void }
export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-card',
        onClick && 'cursor-pointer hover:shadow-card-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Kbd ──────────────────────────────────────────────────────────────────────
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
      {children}
    </kbd>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-slate-300 dark:text-slate-700 mb-4 [&>svg]:w-12 [&>svg]:h-12">{icon}</div>
      <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</p>
      {description && <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
}
export function Input({ label, hint, error, leftIcon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{leftIcon}</span>
        )}
        <input
          className={cn(
            'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600',
            'px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors',
            leftIcon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400/50 focus:border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}
export function Textarea({ label, hint, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600',
          'px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors resize-none',
          className
        )}
        {...props}
      />
      {hint && <p className="text-xs text-slate-500 dark:text-slate-500">{hint}</p>}
    </div>
  )
}
