'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

interface ChatInterfaceProps {
  onActiveChange?: (active: boolean) => void
}

interface ThreadMeta {
  id: string
  title: string
  updatedAt: number
  messageCount: number
  preview: string
}

function createThreadId() {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getThreadTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === 'user')
  const firstText = firstUserMessage?.parts.find((part) => part.type === 'text')

  if (!firstText || !('text' in firstText)) return 'New thread'

  return firstText.text.length > 28 ? `${firstText.text.slice(0, 28)}…` : firstText.text
}

function getThreadPreview(messages: UIMessage[]) {
  const latest = [...messages].reverse().find((message) => message.role === 'assistant' || message.role === 'user')
  const latestText = latest?.parts.find((part) => part.type === 'text')

  if (!latestText || !('text' in latestText)) return 'No messages yet'

  return latestText.text.length > 42 ? `${latestText.text.slice(0, 42)}…` : latestText.text
}

function formatThreadTime(timestamp: number) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

interface ThreadSessionProps {
  active: boolean
  threadId: string
  onActivityChange: (threadId: string, active: boolean) => void
  onMetaChange: (threadId: string, messages: UIMessage[]) => void
}

function ThreadSession({ active, threadId, onActivityChange, onMetaChange }: ThreadSessionProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({ api: '/api/ai' }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  const isThreadActive = isStreaming || messages.length > 0

  useEffect(() => {
    onActivityChange(threadId, isThreadActive)
  }, [isThreadActive, onActivityChange, threadId])

  useEffect(() => {
    onMetaChange(threadId, messages)
  }, [messages, onMetaChange, threadId])

  useEffect(() => {
    if (active && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [active, messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <div
      style={{
        display: active ? 'flex' : 'none',
        flex: 1,
        minHeight: 0,
        flexDirection: 'column',
      }}
    >
      {isThreadActive && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '88%',
                  padding: '6px 10px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 12,
                  lineHeight: 1.5,
                  background:
                    msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #ec4899)'
                      : 'rgba(241,245,249,1)',
                  color: msg.role === 'user' ? '#fff' : '#334155',
                }}
              >
                {msg.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
                      {part.text}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'rgba(241,245,249,1)',
                }}
              >
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#818cf8',
                        display: 'inline-block',
                        animation: `bounce 1.2s ${delay}ms ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: isThreadActive ? '8px 10px' : '0 8px',
          height: 52,
          flexShrink: 0,
          borderTop: isThreadActive && messages.length > 0 ? '1px solid rgba(226,232,240,0.8)' : 'none',
        }}
      >
        <div style={{ fontSize: 18, flexShrink: 0, opacity: 0.7 }}>🌐</div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about destinations, plan a trip…"
          disabled={isStreaming}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#1e293b',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />

        {(input.trim() || isStreaming) && (
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: input.trim() && !isStreaming ? 1 : 0.4,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isStreaming) e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </form>
    </div>
  )
}

export default function ChatInterface({ onActiveChange }: ChatInterfaceProps) {
  const [windowWidth, setWindowWidth] = useState(1280)
  const [hovered, setHovered] = useState(false)
  const cursorX = useMotionValue(50)
  const cursorY = useMotionValue(50)
  const borderGradient = useMotionTemplate`radial-gradient(circle at ${cursorX}% ${cursorY}%, #ec4899 0%, #818cf8 35%, rgba(200,210,255,0.35) 65%)`
  const [historyOpen, setHistoryOpen] = useState(false)
  const [threads, setThreads] = useState<ThreadMeta[]>([
    { id: createThreadId(), title: 'New thread', updatedAt: Date.now(), messageCount: 0, preview: 'No messages yet' },
  ])
  const [activeThreadId, setActiveThreadId] = useState(() => threads[0].id)
  const [threadActivity, setThreadActivity] = useState<Record<string, boolean>>({})

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [activeThreadId, threads],
  )

  const isActive = Boolean(activeThread && threadActivity[activeThread.id])

  useEffect(() => {
    onActiveChange?.(isActive)
  }, [isActive, onActiveChange])

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    cursorX.set(((e.clientX - rect.left) / rect.width) * 100)
    cursorY.set(((e.clientY - rect.top) / rect.height) * 100)
  }, [cursorX, cursorY])

  const handleActivityChange = useCallback((threadId: string, active: boolean) => {
    setThreadActivity((current) => ({ ...current, [threadId]: active }))
  }, [])

  const handleMetaChange = useCallback((threadId: string, messages: UIMessage[]) => {
    setThreads((current) =>
      current
        .map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                title: getThreadTitle(messages),
                preview: getThreadPreview(messages),
                updatedAt: Date.now(),
                messageCount: messages.length,
              }
            : thread,
        )
        .sort((a, b) => {
          if (a.id === activeThreadId) return -1
          if (b.id === activeThreadId) return 1
          return b.updatedAt - a.updatedAt
        }),
    )
  }, [activeThreadId])

  const handleNewThread = () => {
    const threadId = createThreadId()
    const nextThread: ThreadMeta = {
      id: threadId,
      title: 'New thread',
      updatedAt: Date.now(),
      messageCount: 0,
      preview: 'No messages yet',
    }
    setThreads((current) => [nextThread, ...current])
    setActiveThreadId(threadId)
    setHistoryOpen(false)
  }

  const IDLE_WIDTH = Math.min(560, windowWidth - 48)
  const ACTIVE_WIDTH = Math.min(420, windowWidth - 48)
  const PANEL_HEIGHT = 360
  const idleLeft = Math.max(24, (windowWidth - IDLE_WIDTH) / 2)
  const activeLeft = windowWidth - ACTIVE_WIDTH - 24

  const idleBorderRadius = 28
  const activeBorderRadius = 20

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        left: isActive ? activeLeft : idleLeft,
        width: isActive ? ACTIVE_WIDTH : IDLE_WIDTH,
        height: isActive ? PANEL_HEIGHT : 52,
        borderRadius: isActive ? activeBorderRadius : idleBorderRadius,
      }}
      transition={{ type: 'spring', damping: 32, stiffness: 280 }}
      style={{
        position: 'fixed',
        bottom: 24,
        zIndex: 50,
        background: hovered ? borderGradient : 'rgba(200, 210, 255, 0.25)',
        padding: '1.5px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: isActive ? activeBorderRadius - 1.5 : idleBorderRadius - 1.5,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          boxShadow: hovered
            ? '0 8px 40px rgba(129, 140, 248, 0.2), 0 2px 12px rgba(0,0,0,0.12)'
            : '0 4px 24px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          display: 'flex',
          position: 'relative',
          transition: 'border-radius 0.3s, box-shadow 0.2s',
        }}
      >
        {isActive && historyOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background: 'rgba(248,250,252,0.98)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderBottom: '1px solid rgba(226,232,240,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>Threads</div>
              <button
                onClick={() => setHistoryOpen(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '999px',
                  border: 'none',
                  background: 'rgba(226,232,240,0.9)',
                  color: '#334155',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: '12px 12px 10px',
                borderBottom: '1px solid rgba(226,232,240,0.9)',
              }}
            >
              <button
                onClick={handleNewThread}
                style={{
                  width: '100%',
                  border: 'none',
                  borderRadius: 14,
                  padding: '10px 12px',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + New thread
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {threads.map((thread) => {
                const isSelected = thread.id === activeThreadId
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id)
                      setHistoryOpen(false)
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      textAlign: 'left',
                      padding: '10px 10px 9px',
                      borderRadius: 14,
                      background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                      boxShadow: isSelected ? 'inset 0 0 0 1px rgba(99,102,241,0.16)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{thread.title}</div>
                    <div
                      style={{
                        fontSize: 11,
                        lineHeight: 1.35,
                        color: 'rgba(71,85,105,0.78)',
                        marginBottom: 6,
                      }}
                    >
                      {thread.preview}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(100,116,139,0.75)' }}>
                      <span>{thread.messageCount} msgs</span>
                      <span>{formatThreadTime(thread.updatedAt)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {isActive && (
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 3,
                width: 32,
                height: 32,
                borderRadius: '999px',
                border: '1px solid rgba(226,232,240,0.95)',
                background: 'rgba(248,250,252,0.95)',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
              }}
              aria-label="Open thread history"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </button>
          )}

          {threads.map((thread) => (
            <ThreadSession
              key={thread.id}
              active={thread.id === activeThreadId}
              threadId={thread.id}
              onActivityChange={handleActivityChange}
              onMetaChange={handleMetaChange}
            />
          ))}

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </motion.div>
  )
}
