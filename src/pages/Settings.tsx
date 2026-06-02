import {
  Key, Zap, Globe, Trash2, Moon, Sun, Monitor,
  ArrowLeft, CheckCircle, ExternalLink, Eye, EyeOff, Save
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { useStore } from '../store/useStore'
import { AppSettings } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Primitives'
import { Badge } from '../components/ui/Primitives'
import { shortAddr } from '../lib/sui'
import { useToast } from '../hooks/useToast'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

export default function Settings() {
  const navigate = useNavigate()
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const documents = useStore((s) => s.documents)
  const toast = useToast()
  const { theme, setTheme } = useTheme()

  const [form, setForm] = useState<AppSettings>({ ...settings })
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [showTatumKey, setShowTatumKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  function handleSave() {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast.success('Settings saved!')
  }

  function handleClearData() {
    if (!clearConfirm) { setClearConfirm(true); return }
    useStore.getState().documents.forEach((d) => useStore.getState().removeDocument(d.id))
    toast.info('Local data cleared')
    setClearConfirm(false)
  }

  const themeOptions = [
    { value: 'light',  icon: Sun,     label: 'Light' },
    { value: 'dark',   icon: Moon,    label: 'Dark'  },
    { value: 'system', icon: Monitor, label: 'System'},
  ] as const

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure API keys, network, and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Wallet ── */}
        <Section icon={Globe} title="Connected Wallet">
          {account ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">SUI</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">{shortAddr(account.address)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">Connected</span>
                  </div>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => disconnect()}>Disconnect</Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-500">No wallet connected. <button onClick={() => navigate('/')} className="text-primary-600 dark:text-primary-400 font-medium underline">Connect one →</button></p>
            </div>
          )}
        </Section>

        {/* ── API Keys ── */}
        <Section icon={Key} title="API Keys">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Anthropic API Key"
                placeholder="sk-ant-…"
                type={showAnthropicKey ? 'text' : 'password'}
                value={form.anthropicApiKey}
                onChange={(e) => setForm((f) => ({ ...f, anthropicApiKey: e.target.value }))}
                hint="Required for AI chat. Get yours at console.anthropic.com"
              />
              <button
                type="button"
                onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Tatum API Key"
                placeholder="Your Tatum API key"
                type={showTatumKey ? 'text' : 'password'}
                value={form.tatumApiKey}
                onChange={(e) => setForm((f) => ({ ...f, tatumApiKey: e.target.value }))}
                hint="Required for mainnet Sui RPC. Get yours free at dashboard.tatum.io"
              />
              <button
                type="button"
                onClick={() => setShowTatumKey(!showTatumKey)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showTatumKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <a href="https://dashboard.tatum.io" target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Get Tatum key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Section>

        {/* ── Network ── */}
        <Section icon={Zap} title="Network">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Sui Network</p>
              <div className="grid grid-cols-2 gap-2">
                {(['testnet', 'mainnet'] as const).map((net) => (
                  <button
                    key={net}
                    onClick={() => setForm((f) => ({ ...f, network: net }))}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
                      form.network === net
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', form.network === net ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600')} />
                    <span className="capitalize">{net}</span>
                    {net === 'mainnet' && <Badge variant="primary" className="ml-auto text-[10px]">Tatum</Badge>}
                    {net === 'testnet' && <Badge variant="outline" className="ml-auto text-[10px]">Free</Badge>}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Smart Contract Package ID"
              placeholder="0x…"
              value={form.packageId}
              onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}
              hint="Paste the deployed Move contract package ID to enable NFT minting."
            />

            <Input
              label="Walrus Publisher URL"
              value={form.walrusPublisher}
              onChange={(e) => setForm((f) => ({ ...f, walrusPublisher: e.target.value }))}
            />

            <Input
              label="Walrus Aggregator URL"
              value={form.walrusAggregator}
              onChange={(e) => setForm((f) => ({ ...f, walrusAggregator: e.target.value }))}
            />
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section icon={Sun} title="Appearance">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setForm((f) => ({ ...f, theme: value })) }}
                  className={cn(
                    'flex flex-col items-center gap-2 px-3 py-3 rounded-xl border text-xs font-medium transition-all duration-150',
                    theme === value
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Save button ── */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          variant={saved ? 'secondary' : 'primary'}
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>

        {/* ── Danger zone ── */}
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-5">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</p>
          <p className="text-xs text-red-600 dark:text-red-500 mb-4">
            Clear all {documents.length} document(s) from local storage. Walrus blobs and NFTs are <strong>not</strong> affected.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearData}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {clearConfirm ? 'Click again to confirm' : 'Clear Local Data'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
