import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Spinner } from './Primitives'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 select-none shrink-0 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-sm hover:shadow-glow',
      secondary:
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 focus:ring-primary-500 shadow-card hover:shadow-card-md',
      ghost:
        'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
      danger:
        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-400 shadow-sm',
      ai:
        'bg-ai-600 hover:bg-ai-700 active:bg-ai-800 text-white focus:ring-ai-500 shadow-sm hover:shadow-glow-ai',
    }

    const sizes = {
      sm:   'text-xs px-3 py-1.5 h-8',
      md:   'text-sm px-4 py-2 h-9',
      lg:   'text-base px-6 py-2.5 h-11',
      icon: 'p-2 h-9 w-9',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" className={variant === 'primary' || variant === 'ai' || variant === 'danger' ? 'text-white' : undefined} />
        ) : leftIcon}
        {size !== 'icon' && children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
