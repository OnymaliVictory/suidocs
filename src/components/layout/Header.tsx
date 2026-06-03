import { Bell, Menu, Search, X, Settings, Moon, Sun } from 'lucide-react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { useStore } from '../../store/useStore'
import { useTheme } from '../../hooks/useTheme'
import { shortAddr } from '../../lib/sui'
import { cn } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useState } from 'react'

interface HeaderProps { onMenuToggle?: () => void }

export function Header({ onMenuToggle }: HeaderProps) {
  const account = useCurrentAccount()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const documents = useStore((s) => s.documents)
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? documents.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : []

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80">
      <div className="flex items-center gap-3 h-16 px-4 lg:px-6">

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer lg:hidden"
          onClick={() => navigate('/')}
        >
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Scrivault</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(!!e.target.value) }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              placeholder="Search documents…"
              className="w-full pl-9 pr-3 py-2 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-colors"
            />
          </div>
          {searchOpen && filtered.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card-lg overflow-hidden z-50">
              {filtered.slice(0, 5).map((d) => (
                <button
                  key={d.id}
                  onClick={() => { navigate(`/doc/${d.id}`); setQuery(''); setSearchOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-xs font-bold shrink-0">
                    {d.mimeType.split('/')[1]?.slice(0, 3).toUpperCase() ?? 'DOC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.name}</p>
                    <p className="text-xs text-slate-500 truncate">{d.blobId.slice(0, 20)}…</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 lg:flex-none" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Wallet Connect */}
          <div className="[&_.wkit-button]:!rounded-xl [&_.wkit-button]:!h-9 [&_.wkit-button]:!text-sm [&_.wkit-button]:!font-medium [&_.wkit-button]:!px-4 [&_.wkit-button]:!bg-primary-600 [&_.wkit-button]:!text-white [&_.wkit-button]:hover:!bg-primary-700 [&_.wkit-button]:!border-0 [&_.wkit-button]:!shadow-sm">
            <ConnectButton connectText={account ? shortAddr(account.address) : 'Connect Wallet'} />
          </div>
        </div>
      </div>
    </header>
  )
}
