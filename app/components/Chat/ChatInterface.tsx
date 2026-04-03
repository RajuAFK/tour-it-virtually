'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'framer-motion'

// ── Chat hook ─────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const [windowWidth, setWindowWidth] = useState(1280)
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 }) // % within element
  const [hovered, setHovered] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai' }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  // Chat becomes "active" (moves right) the moment user types or messages exist
  const isActive = input.length > 0 || messages.length > 0

  // Window width for positioning
  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  // Cursor position for border glow
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  // ── Position calculation ───────────────────────────────────────────────
  // Idle: centered at bottom  Active: anchored bottom-right
  const IDLE_WIDTH = Math.min(560, windowWidth - 48)
  const ACTIVE_WIDTH = Math.min(400, windowWidth - 48)
  const PANEL_HEIGHT = 220 // approx 20vh on 1080p

  const idleLeft = Math.max(24, (windowWidth - IDLE_WIDTH) / 2)
  const activeLeft = windowWidth - ACTIVE_WIDTH - 24

  // ── Border gradient (cursor-following glow) ───────────────────────────
  const borderGradient = hovered
    ? `radial-gradient(circle at ${cursorPos.x}% ${cursorPos.y}%, #ec4899 0%, #818cf8 35%, rgba(200,210,255,0.35) 65%)`
    : 'rgba(200, 210, 255, 0.25)'

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
        // Gradient border wrapper
        background: borderGradient,
        padding: '1.5px',
      }}
    >
      {/* Inner white glass card */}
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
          flexDirection: 'column',
          transition: 'border-radius 0.3s, box-shadow 0.2s',
        }}
      >
        {/* Messages area — only visible when active */}
        {isActive && (
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
            {messages.length === 0 && isActive ? (
              <p style={{ color: 'rgba(100,116,139,0.6)', fontSize: 12, textAlign: 'center', paddingTop: 8 }}>
                Ask me anything about destinations…
              </p>
            ) : (
              messages.map((msg) => (
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
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #6366f1, #ec4899)'
                        : 'rgba(241,245,249,1)',
                      color: msg.role === 'user' ? '#fff' : '#334155',
                    }}
                  >
                    {msg.parts.map((part, i) =>
                      part.type === 'text' ? (
                        <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Streaming dots */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 12px', borderRadius: '14px 14px 14px 4px', background: 'rgba(241,245,249,1)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        style={{
                          width: 5, height: 5, borderRadius: '50%',
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

        {/* Input row */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: isActive ? '8px 10px' : '0 8px',
            height: 52,
            flexShrink: 0,
            borderTop: isActive && messages.length > 0 ? '1px solid rgba(226,232,240,0.8)' : 'none',
          }}
        >
          {/* Globe icon */}
          <div style={{ fontSize: 18, flexShrink: 0, opacity: 0.7 }}>🌐</div>

          <input
            ref={inputRef}
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

          {/* Send button */}
          {(input.trim() || isStreaming) && (
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              style={{
                width: 32, height: 32,
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
              onMouseEnter={(e) => { if (input.trim() && !isStreaming) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Bounce keyframe */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </motion.div>
  )
}
