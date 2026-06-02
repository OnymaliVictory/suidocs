import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Docs'    },
  { to: '/upload',    icon: Upload,          label: 'Upload'  },
  { to: '/settings',  icon: Settings,        label: 'Settings'},
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/80 sm:hidden pb-safe">
      <div className="flex items-stretch h-16">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn('p-1.5 rounded-xl transition-colors', isActive && 'bg-primary-50 dark:bg-primary-900/30')}>
                  <Icon className="w-5 h-5" />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
