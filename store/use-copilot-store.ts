"use client"

import { create } from 'zustand'

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  isStreaming?: boolean
}

interface CopilotContext {
  currentPage: string
  employeeId: string | null
  employeeName: string | null
  role: string | null
}

interface CopilotState {
  isOpen: boolean
  messages: CopilotMessage[]
  isLoading: boolean
  context: CopilotContext

  // Actions
  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  setContext: (context: Partial<CopilotContext>) => void
  addMessage: (message: Omit<CopilotMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, content: string) => void
  setMessageStreaming: (id: string, isStreaming: boolean) => void
  setLoading: (isLoading: boolean) => void
  clearMessages: () => void
  sendMessage: (content: string) => Promise<void>
}

export const useCopilotStore = create<CopilotState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  context: {
    currentPage: '',
    employeeId: null,
    employeeName: null,
    role: null,
  },

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),

  setContext: (context) =>
    set((state) => ({ context: { ...state.context, ...context } })),

  addMessage: (message) => {
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newMessage: CopilotMessage = {
      ...message,
      id,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({ messages: [...state.messages, newMessage] }))
    return id
  },

  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    }))
  },

  setMessageStreaming: (id, isStreaming) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming } : m
      ),
    }))
  },

  setLoading: (isLoading) => set({ isLoading }),

  clearMessages: () => set({ messages: [] }),

  sendMessage: async (content: string) => {
    const state = get()
    if (state.isLoading) return

    // Add user message
    state.addMessage({ role: 'user', content })

    // Add placeholder assistant message
    const assistantId = state.addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    set({ isLoading: true })

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: state.context,
          history: state.messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          get().updateMessage(assistantId, fullContent)
        }
      } else {
        // Fallback for non-streaming
        const data = await response.json()
        fullContent = data.response || 'I could not process that request.'
        get().updateMessage(assistantId, fullContent)
      }

      get().setMessageStreaming(assistantId, false)
    } catch (error) {
      get().updateMessage(
        assistantId,
        'Sorry, I encountered an error. Please try again.'
      )
      get().setMessageStreaming(assistantId, false)
    } finally {
      set({ isLoading: false })
    }
  },
}))
