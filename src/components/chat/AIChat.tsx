import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, Copy, CheckCheck } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { SuiDocument, ChatMessage } from '../../types'
import { streamDocumentChat } from '../../lib/ai'
import { useStore } from '../../store/useStore'
import { Button } from '../ui/Button'
import { cn, timeAgo } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'

const STARTER_QUESTIONS = [
  'Summarise this document',
  'What are the key points?',
  'Explain this in simple terms',
  'What action items can I extract?',
]

interface AIChatProps { doc: SuiDocument }

export function AIChat({ doc }: AIChatProps) {
  const settings = useStore((s) => s.settings)
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return
    setError(null)

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: text.trim(), timestamp: Date.now() }
    const assistantId = uuidv4()
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    await streamDocumentChat(
      doc,
      [...messages, userMsg],
      settings.anthropicApiKey,
      (delta) => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: m.content + delta } : m)
        )
      },
      () => {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m))
        setIsStreaming(false)
      },
      (err) => {
        setError(err)
        // Remove BOTH the placeholder assistant message AND the user message that
        // triggered it. If only assistantMsg is removed, the history has consecutive
        // user messages, which Anthropic's API rejects — breaking every subsequent call.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id))
        setIsStreaming(false)
      }
    )
  }, [messages, isStreaming, doc, settings.anthropicApiKey])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const hasApiKey = !!settings.anthropicApiKey

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ai-100 dark:bg-ai-900/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-ai-600 dark:text-ai-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Document AI</p>
            <p className="text-[10px] text-slate-400">Powered by Claude</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* No API key warning */}
      {!hasApiKey && (
        <div className="m-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Anthropic API key required</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Add your key in <button className="underline" onClick={() => navigate('/settings')}>Settings</button> to enable AI chat.</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ai-50 dark:bg-ai-900/30 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-ai-500" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ask me anything about this document</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mb-5">Powered by Claude via Anthropic API</p>
            {hasApiKey && (
              <div className="grid grid-cols-1 gap-2 w-full">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 hover:border-ai-300 dark:hover:border-ai-700 hover:bg-ai-50 dark:hover:bg-ai-900/20 hover:text-ai-700 dark:hover:text-ai-300 transition-all duration-150"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onCopy={() => copyMessage(msg.id, msg.content)}
            copied={copiedId === msg.id}
          />
        ))}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey ? 'Ask about this document… (Enter to send)' : 'Add API key in Settings to chat'}
            disabled={!hasApiKey || isStreaming}
            rows={1}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ai-500/40 focus:border-ai-400 resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-h-32 leading-relaxed"
            style={{ overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden' }}
          />
          <Button
            variant="ai"
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || !hasApiKey}
            loading={isStreaming}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1.5 text-center">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}

function MessageBubble({ msg, onCopy, copied }: { msg: ChatMessage; onCopy: () => void; copied: boolean }) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-ai-100 dark:bg-ai-900/40'
      )}>
        {isUser
          ? <User className="w-3 h-3 text-primary-600 dark:text-primary-400" />
          : <Bot className="w-3 h-3 text-ai-600 dark:text-ai-400" />
        }
      </div>
      <div className={cn('group flex-1 max-w-[85%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm ml-auto'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm',
          msg.isStreaming && 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-ai-500'
        )}>
          {msg.content || (msg.isStreaming ? '' : '…')}
        </div>
        <div className={cn('flex items-center gap-2 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-slate-400">{timeAgo(msg.timestamp)}</span>
          {!isUser && !msg.isStreaming && msg.content && (
            <button onClick={onCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {copied ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
