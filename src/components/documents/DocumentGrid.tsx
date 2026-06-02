import { Search, SlidersHorizontal, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'
import { SuiDocument } from '../../types'
import { DocumentCard } from './DocumentCard'
import { EmptyState } from '../ui/Primitives'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'

type FilterStatus = 'all' | 'ready' | 'minting' | 'uploading' | 'error'
type SortBy = 'newest' | 'oldest' | 'name' | 'size'

interface DocumentGridProps {
  documents: SuiDocument[]
  onShare?: (doc: SuiDocument) => void
  onDelete?: (doc: SuiDocument) => void
}

export function DocumentGrid({ documents, onShare, onDelete }: DocumentGridProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const filtered = useMemo(() => {
    let list = [...documents]

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.blobId.includes(q))
    }

    if (filterStatus !== 'all') {
      list = list.filter((d) => d.status === filterStatus)
    }

    switch (sortBy) {
      case 'newest': list.sort((a, b) => b.createdAt - a.createdAt); break
      case 'oldest': list.sort((a, b) => a.createdAt - b.createdAt); break
      case 'name':   list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'size':   list.sort((a, b) => b.size - a.size); break
    }

    return list
  }, [documents, query, filterStatus, sortBy])

  const statusFilters: { value: FilterStatus; label: string }[] = [
    { value: 'all',      label: 'All'       },
    { value: 'ready',    label: 'On-chain'  },
    { value: 'minting',  label: 'Minting'   },
    { value: 'uploading',label: 'Uploading' },
    { value: 'error',    label: 'Errors'    },
  ]

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or blob ID…"
            className="w-full pl-9 pr-3 py-2 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="size">Largest first</option>
        </select>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
              filterStatus === value
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            {label}
            {value === 'all' && (
              <span className={cn('ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]',
                filterStatus === 'all' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              )}>{documents.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title={query ? 'No documents match your search' : 'No documents yet'}
          description={query ? 'Try a different search term.' : 'Upload your first document to get started.'}
          action={
            !query ? (
              <Button onClick={() => navigate('/upload')}>Upload a Document</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onShare={onShare}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
