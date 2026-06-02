import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, Settings, FileText, Github, X, ChevronRight } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useStore } from '../../store/useStore'
import { shortAddr } from '../../lib/sui'
import { cn } from '../../lib/utils'

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload Doc'  },
  { to: '/settings',  icon: Settings,        label: 'Settings'    },
]

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const account = useCurrentAccount()
  const documents = useStore((s) => s.documents)
  const navigate = useNavigate()

  const ready = documents.filter((d) => d.status === 'ready').length
  const total = documents.length

  return (
    <aside className={cn(
      'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/80',
      mobile ? 'w-72' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => { navigate('/'); onClose?.() }}
        >
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-none">SuiDocs</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-none mt-0.5">on Walrus + Sui</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Storage</p>
          <div className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Documents</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">On Walrus</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">{ready}</span>
            </div>
            {total > 0 && (
              <div className="pt-1">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${total ? (ready / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent docs */}
        {documents.length > 0 && (
          <div className="mt-4">
            <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider">Recent</p>
            <ul className="space-y-0.5">
              {documents.slice(0, 4).map((doc) => (
                <li key={doc.id}>
                  <NavLink
                    to={`/doc/${doc.id}`}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 group',
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom: wallet */}
      {account && (
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-primary-300 dark:border-primary-700 flex items-center justify-center shrink-0">
              <span className="text-primary-600 dark:text-primary-400 text-[10px] font-bold">SUI</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono truncate">{shortAddr(account.address)}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600">Connected</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-600">
          <span>Built for Tatum × Walrus</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
            <Github className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  )
}
