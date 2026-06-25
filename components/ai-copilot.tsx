"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCopilotStore, type CopilotMessage } from '@/store/use-copilot-store'
import { useAuthStore } from '@/store/use-auth-store'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react'

function MessageBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      <div
        className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-muted text-foreground rounded-tl-md'
        }`}
      >
        {message.isStreaming && !message.content ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            {renderMarkdown(message.content)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null

  // Simple markdown rendering for bold, bullet points, and tables
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Bold text
    line = line.replace(/\*\*(.*?)\*\*/g, '⟨BOLD⟩$1⟨/BOLD⟩')

    // Check for table rows
    if (line.startsWith('|') && line.endsWith('|')) {
      // Skip separator rows
      if (line.match(/^\|[\s-|]+\|$/)) continue

      const cells = line.split('|').filter(Boolean).map((c) => c.trim())
      const isHeader = i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-|]+\|$/)

      elements.push(
        <div key={i} className={`flex gap-3 py-1 ${isHeader ? 'font-semibold border-b border-border/50' : ''}`}>
          {cells.map((cell, j) => (
            <span key={j} className="flex-1 text-xs">
              {renderInlineMarkdown(cell)}
            </span>
          ))}
        </div>
      )
      continue
    }

    // Bullet points
    if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5">
          <span className="text-primary mt-1 shrink-0">•</span>
          <span>{renderInlineMarkdown(line.slice(2))}</span>
        </div>
      )
      continue
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5">
          <span className="text-muted-foreground shrink-0">{numberedMatch[1]}.</span>
          <span>{renderInlineMarkdown(numberedMatch[2])}</span>
        </div>
      )
      continue
    }

    // Regular line
    elements.push(
      <div key={i} className={line === '' ? 'h-2' : ''}>
        {renderInlineMarkdown(line)}
      </div>
    )
  }

  return <>{elements}</>
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/⟨BOLD⟩|⟨\/BOLD⟩/)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

const SUGGESTED_PROMPTS = [
  'Who has the highest workload?',
  "Summarize today's attendance",
  'Which tasks are overdue?',
  'Is anyone at risk of burnout?',
  'Show productivity scores',
  'Which department has the most leave requests?',
]

export function AICopilot() {
  const {
    isOpen,
    messages,
    isLoading,
    togglePanel,
    closePanel,
    sendMessage,
    clearMessages,
    setContext,
  } = useCopilotStore()
  const { user, employee } = useAuthStore()
  const pathname = usePathname()
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Update context when page/user changes
  useEffect(() => {
    setContext({
      currentPage: pathname,
      employeeId: employee?.id || null,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : null,
      role: user?.role || null,
    })
  }, [pathname, employee, user, setContext])

  // Keyboard shortcut: Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        togglePanel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestion = (prompt: string) => {
    setInput('')
    sendMessage(prompt)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePanel}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-2xl shadow-violet-500/25 flex items-center justify-center hover:shadow-violet-500/40 transition-shadow"
            aria-label="Open AI Copilot"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`fixed z-50 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col ${
              isExpanded
                ? 'inset-4 md:inset-8'
                : 'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 left-4 md:left-auto md:bottom-6 md:right-6 md:w-[420px] h-[500px] md:h-[600px] max-h-[75vh] md:max-h-[80vh]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gradient-to-r from-violet-500/10 via-blue-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">SOMS Copilot</h3>
                  <p className="text-[10px] text-muted-foreground">
                    AI Workplace Assistant • <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Ctrl+J</kbd>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={closePanel}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pt-8 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-violet-500" />
                  </div>
                  <h4 className="font-semibold text-base mb-1">How can I help?</h4>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
                    Ask me anything about your workplace — tasks, attendance, teams, or productivity.
                  </p>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-[320px]">
                    {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestion(prompt)}
                        className="text-left text-xs px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted hover:border-primary/20 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-3 bg-background/50">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask SOMS Copilot..."
                  rows={1}
                  className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground max-h-32 min-h-[40px]"
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  )
}
