"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Hash, Plus, Search, Send, Paperclip, Smile, AtSign,
  Users, Lock, Settings, MoreHorizontal, Phone, Video,
  Pin, MessageSquare,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data

interface Channel {
  id: string
  name: string
  type: 'public' | 'private' | 'dm'
  members: number
  unread: number
  lastMessage: string
  lastMessageTime: string
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  reactions?: { emoji: string; count: number }[]
  isPinned?: boolean
}

const []: Channel[] = [
  { id: 'ch1', name: 'general', type: 'public', members: 8, unread: 3, lastMessage: 'Welcome to the new SOMS chat!', lastMessageTime: '10:30 AM' },
  { id: 'ch2', name: 'engineering', type: 'public', members: 4, unread: 0, lastMessage: 'Pipeline build #234 passed ✅', lastMessageTime: '9:45 AM' },
  { id: 'ch3', name: 'design', type: 'public', members: 3, unread: 1, lastMessage: 'New mockups uploaded to Figma', lastMessageTime: '11:15 AM' },
  { id: 'ch4', name: 'hr-announcements', type: 'public', members: 8, unread: 0, lastMessage: 'Updated WFH policy effective July 1', lastMessageTime: 'Yesterday' },
  { id: 'ch5', name: 'project-alpha', type: 'private', members: 5, unread: 2, lastMessage: 'Sprint review scheduled for Friday', lastMessageTime: '2:00 PM' },
  { id: 'ch6', name: 'Sarah Chen', type: 'dm', members: 2, unread: 0, lastMessage: 'Can you review the design tokens?', lastMessageTime: '3:30 PM' },
  { id: 'ch7', name: 'Mike Johnson', type: 'dm', members: 2, unread: 1, lastMessage: 'Let me check the deployment logs', lastMessageTime: '4:15 PM' },
]

const []: ChatMessage[] = [
  { id: 'm1', senderId: 'e1', senderName: 'Admin User', content: '👋 Welcome to the #general channel! This is the new SOMS internal chat system. Feel free to share updates, ask questions, and collaborate with your team.', timestamp: '2026-06-20T08:00:00Z', isPinned: true },
  { id: 'm2', senderId: 'e2', senderName: 'Priya Sharma', content: 'Exciting! Great to have a built-in chat system. Reminder: the updated WFH policy is now live on the HR portal. Please review it before July 1st.', timestamp: '2026-06-20T08:15:00Z', reactions: [{ emoji: '👍', count: 4 }, { emoji: '✅', count: 2 }] },
  { id: 'm3', senderId: 'e5', senderName: 'Mike Johnson', content: 'The CI/CD pipeline for the main branch is now green. All tests passing. 🎉', timestamp: '2026-06-20T09:30:00Z', reactions: [{ emoji: '🎉', count: 3 }] },
  { id: 'm4', senderId: 'e4', senderName: 'Sarah Chen', content: 'Design review for the new dashboard components is at 10 AM in the Apollo room. @John can you prep the prototype?', timestamp: '2026-06-20T09:45:00Z' },
  { id: 'm5', senderId: 'e3', senderName: 'John Doe', content: 'On it! I\'ll have the interactive prototype ready. Also sharing a preview of the updated color palette — let me know what you think.', timestamp: '2026-06-20T10:00:00Z' },
  { id: 'm6', senderId: 'e7', senderName: 'Alice Wong', content: 'Just pushed the API integration tests. Coverage is now at 87%. Working on the edge cases for pagination next.', timestamp: '2026-06-20T10:30:00Z', reactions: [{ emoji: '🔥', count: 2 }] },
  { id: 'm7', senderId: 'e8', senderName: 'Bob Martinez', content: 'Quick heads up — I\'m waiting on DBA approval for the schema migration. Should have it by EOD. Will keep everyone posted.', timestamp: '2026-06-20T10:45:00Z' },
]

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState('ch1')
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeChannel = ([] as any[]).find((c) => c.id === selectedChannel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChannel])

  const filteredChannels = ([] as any[]).filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-8rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex h-full rounded-2xl border border-border overflow-hidden bg-card">
        {/* Channel Sidebar */}
        <div className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">Messages</h2>
              <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full h-8 bg-muted rounded-lg pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Channel List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Channels</p>
              {filteredChannels.filter((c) => c.type !== 'dm').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                    selectedChannel === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {channel.type === 'private' ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="flex-1 text-left truncate text-xs font-medium">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}

              <p className="px-2 py-1 mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Messages</p>
              {filteredChannels.filter((c) => c.type === 'dm').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                    selectedChannel === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="flex-1 text-left truncate text-xs font-medium">{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              {activeChannel?.type === 'dm' ? null : (
                <Hash className="w-4 h-4 text-muted-foreground" />
              )}
              <h3 className="text-sm font-semibold">{activeChannel?.name}</h3>
              <Badge variant="secondary" className="text-[10px]">
                <Users className="w-3 h-3 mr-1" />
                {activeChannel?.members}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Pin className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-4">
              {([] as any[]).map((msg) => (
                <div key={msg.id} className="flex gap-3 group">
                  <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                    <AvatarFallback className="text-xs">
                      {msg.senderName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      {msg.isPinned && (
                        <Badge variant="outline" className="text-[10px] py-0">
                          <Pin className="w-3 h-3 mr-0.5" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-0.5 leading-relaxed">{msg.content}</p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {msg.reactions.map((r: any, i: number) => (
                          <button
                            key={i}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-xs transition-colors"
                          >
                            <span>{r.emoji}</span>
                            <span className="text-muted-foreground">{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-0.5">
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2 bg-muted rounded-xl p-2">
              <button className="p-2 rounded-lg hover:bg-background text-muted-foreground shrink-0">
                <Paperclip className="w-4 h-4" />
              </button>
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message #${activeChannel?.name || 'general'}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none py-2 placeholder:text-muted-foreground min-h-[36px] max-h-32"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                }}
              />
              <button className="p-2 rounded-lg hover:bg-background text-muted-foreground shrink-0">
                <AtSign className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-background text-muted-foreground shrink-0">
                <Smile className="w-4 h-4" />
              </button>
              <Button size="sm" className="shrink-0 rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
