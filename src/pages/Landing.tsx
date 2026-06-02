import { ArrowRight, Shield, Brain, Zap, Globe, Lock, ChevronRight, FileText, Cpu, Database } from 'lucide-react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Primitives'
import { ToastContainer } from '../components/ui/ToastContainer'
import { useTheme } from '../hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

const features = [
  {
    icon: Database,
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/30',
    title: 'Walrus Decentralised Storage',
    desc: 'Every file you upload is stored as a permanent, tamper-proof blob on Walrus — no AWS, no GCP, no single point of failure.',
  },
  {
    icon: Shield,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    title: 'Sui NFT Ownership',
    desc: 'Your document ownership is recorded as a Move NFT on Sui. Transfer access, revoke permissions, or sell your content — you\'re in control.',
  },
  {
    icon: Brain,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    title: 'AI Document Intelligence',
    desc: 'Ask questions about any document in your vault. Claude reads your Walrus-stored files and answers intelligently via Tatum MCP.',
  },
]

const steps = [
  { n: '01', title: 'Connect wallet', desc: 'Sign in with any Sui-compatible wallet. No account needed — your wallet IS your identity.' },
  { n: '02', title: 'Upload to Walrus', desc: 'Drag & drop your file. It\'s stored as a permanent decentralised blob on the Walrus network.' },
  { n: '03', title: 'Mint your NFT', desc: 'A Sui Move smart contract mints a Document NFT linked to your Walrus blob ID.' },
  { n: '04', title: 'Chat with AI', desc: 'Ask questions, get summaries, extract insights — all without leaving your vault.' },
]

const stats = [
  { label: 'Walrus Epochs Stored', value: '5+' },
  { label: 'Sui Network', value: 'Mainnet' },
  { label: 'AI Model', value: 'Claude 4' },
  { label: 'Files Supported', value: '20+' },
]

export default function Landing() {
  const account = useCurrentAccount()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  if (account) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">SuiDocs</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="[&_button]:!rounded-xl [&_button]:!h-9 [&_button]:!text-sm [&_button]:!font-medium [&_button]:!px-4 [&_button]:!bg-primary-600 [&_button]:!text-white [&_button]:hover:!bg-primary-700 [&_button]:!border-0 [&_button]:!shadow-sm">
              <ConnectButton connectText="Connect Wallet" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary-100/60 dark:from-primary-900/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="primary" className="mb-6 py-1.5 px-4 text-xs font-semibold">
            <Zap className="w-3 h-3" /> Built for Tatum × Walrus Hackathon
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Your documents,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600">
              permanently yours
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload files to Walrus decentralised storage, mint ownership NFTs on Sui, and chat with an AI that can read your documents — all from a single vault.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="[&_button]:!rounded-xl [&_button]:!h-11 [&_button]:!text-base [&_button]:!font-semibold [&_button]:!px-8 [&_button]:!bg-primary-600 [&_button]:!text-white [&_button]:hover:!bg-primary-700 [&_button]:!border-0 [&_button]:!shadow-md">
              <ConnectButton connectText="Connect Wallet to Start" />
            </div>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 h-11 px-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-base hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              View on GitHub <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-16">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">Three pillars of SuiDocs</h2>
            <p className="text-slate-500 dark:text-slate-400">Walrus storage + Sui ownership + AI intelligence — working together.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-card hover:shadow-card-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">How it works</h2>
            <p className="text-slate-500 dark:text-slate-400">From upload to AI-powered vault in under a minute.</p>
          </div>
          <div className="space-y-6">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="flex items-start gap-5 group">
                <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-100 dark:border-primary-800 flex items-center justify-center shrink-0 font-bold text-primary-600 dark:text-primary-400 text-sm">
                  {n}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
                {i < steps.length - 1 && <ChevronRight className="hidden sm:block w-5 h-5 text-slate-300 dark:text-slate-700 mt-3 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to own your documents?</h2>
          <p className="text-primary-200 mb-8">Connect your Sui wallet and start uploading. It takes 30 seconds.</p>
          <div className="[&_button]:!rounded-xl [&_button]:!h-12 [&_button]:!text-base [&_button]:!font-semibold [&_button]:!px-10 [&_button]:!bg-white [&_button]:!text-primary-700 [&_button]:hover:!bg-primary-50 [&_button]:!border-0 [&_button]:!shadow-lg inline-block">
            <ConnectButton connectText="Get Started — Free" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-600">
          <p>SuiDocs — Built for the Tatum × Walrus Hackathon 2025</p>
          <div className="flex items-center gap-4">
            <a href="https://walrus.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Walrus</a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Sui</a>
            <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">Tatum</a>
          </div>
        </div>
      </footer>
      <ToastContainer />
    </div>
  )
}
