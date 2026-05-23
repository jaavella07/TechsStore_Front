import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, X, Send, MessageSquare } from 'lucide-react'
import { agentApi } from '@/api/agent'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: '👋 ¡Hola! Soy EmilyTech, la asistente de TechsStore. Pregúntame sobre productos, recomendaciones o el estado de tus pedidos. 🛒',
  timestamp: new Date(),
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-text-dim block"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agentOffline, setAgentOffline] = useState(false)
  const [threadId, setThreadId] = useState<string | undefined>(undefined)
  const [isHovered, setIsHovered] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  async function send() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const data = await agentApi.chat({ message: text, thread_id: threadId })
      setThreadId(data.thread_id)
      const botMsg: ChatMessage = { role: 'assistant', content: data.response, timestamp: new Date() }
      setMessages((m) => [...m, botMsg])
      setAgentOffline(false)
    } catch {
      setAgentOffline(true)
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: '😔 En este momento no puedo atenderte, intenta más tarde.',
        timestamp: new Date(),
      }
      setMessages((m) => [...m, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="fixed bottom-6 left-6 z-90">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' as const }}
            className="absolute bottom-[5.5rem] left-0 w-96 h-[32rem] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-cyan-dim flex items-center justify-center">
                  <Bot className="size-5 text-cyan" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text leading-none">EmilyTech Assistant</p>
                  <p className={cn('text-[10px] mt-0.5 font-medium', agentOffline ? 'text-red-500' : 'text-green-400')}>
                    {agentOffline ? '● Offline' : '● Online'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-text transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  {msg.role === 'assistant' && (
                    <div className="size-6 rounded-full bg-cyan-dim flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-3.5 text-cyan" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-cyan text-bg rounded-tr-none'
                        : 'bg-surface-2 text-text rounded-tl-none',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="size-6 rounded-full bg-cyan-dim flex items-center justify-center shrink-0">
                    <Bot className="size-3.5 text-cyan" />
                  </div>
                  <div className="bg-surface-2 rounded-xl rounded-tl-none px-3 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-end gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escribe un mensaje…"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-cyan placeholder:text-text-dim outline-none resize-none"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isLoading}
                  className="size-7 rounded-lg bg-cyan text-bg flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-text-dim text-center mt-1.5">
                Enter para enviar · Shift+Enter para nueva línea
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip on hover (only when panel is closed) */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[5rem] bottom-2 bg-surface border border-cyan-border rounded-xl px-3.5 py-2.5 shadow-xl whitespace-nowrap pointer-events-none"
          >
            <p className="text-xs font-semibold text-cyan leading-none mb-0.5">Soy EmilyTech</p>
            <p className="text-[11px] text-text-muted">¿En qué puedo ayudarte?</p>
            {/* Arrow pointing left */}
            <span className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 size-3 bg-surface border-l border-b border-cyan-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Abrir chat con EmilyTech"
        className={cn(
          'size-16 rounded-full shadow-2xl flex items-center justify-center transition-colors',
          isOpen ? 'bg-surface border-2 border-cyan-border' : 'bg-cyan',
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6 text-text" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="size-7 text-bg" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
