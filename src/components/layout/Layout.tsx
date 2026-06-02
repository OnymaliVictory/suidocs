import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ToastContainer } from '../ui/ToastContainer'
import { cn } from '../../lib/utils'

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onMenuToggle={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 h-full animate-slide-up">
              <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 min-w-0 pb-20 sm:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <ToastContainer />
    </div>
  )
}
