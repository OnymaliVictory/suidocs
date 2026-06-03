import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SuiDocument, AppSettings, ToastItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  tatumApiKey: '',
  network: 'testnet',
  packageId: '',
  walrusPublisher: 'https://publisher.walrus-testnet.walrus.space',
  walrusAggregator: 'https://aggregator.walrus-testnet.walrus.space',
  theme: 'system',
}

interface AppState {
  documents: SuiDocument[]
  settings: AppSettings
  toasts: ToastItem[]
  sidebarOpen: boolean

  // Document actions
  addDocument: (doc: SuiDocument) => void
  updateDocument: (id: string, patch: Partial<SuiDocument>) => void
  removeDocument: (id: string) => void
  getDocument: (id: string) => SuiDocument | undefined

  // Settings actions
  updateSettings: (patch: Partial<AppSettings>) => void

  // Toast actions
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void

  // UI
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      documents: [],
      settings: DEFAULT_SETTINGS,
      toasts: [],
      sidebarOpen: false,

      addDocument: (doc) =>
        set((s) => ({ documents: [doc, ...s.documents] })),

      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      getDocument: (id) => get().documents.find((d) => d.id === id),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addToast: (toast) => {
        const id = uuidv4()
        const duration = toast.duration ?? 4000
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'scrivault-storage',
      partialize: (s) => ({ documents: s.documents, settings: s.settings }),
    }
  )
)
