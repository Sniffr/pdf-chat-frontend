'use client'

import { useState, useEffect, useRef } from 'react'
import ChatBubble from './ChatBubble'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ page: number; text: string }>
}

interface ChatWindowProps {
  documentText: string
  documentMeta: { wordCount: number; pageCount: number }
  onReset: () => void
}

export default function ChatWindow({ documentText, documentMeta, onReset }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_text: documentText,
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.detail || `Chat failed with status ${response.status}`
        throw new Error(message)
      }

      const data = await response.json()

      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || []
      }])
    } catch (err) {
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Failed to get response. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      height: 'calc(100vh - 40px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        borderRadius: '12px 12px 0 0',
      }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text)' }}>
            Chat with your PDF
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {documentMeta.wordCount.toLocaleString()} words · {documentMeta.pageCount} page{documentMeta.pageCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onReset}
          style={{
            padding: '8px 16px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          New Document
        </button>
      </div>

      {/* Messages */}
      <div
        data-testid="chat-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: 'var(--bg)',
        }}
      >
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
              Ask a question about your PDF
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              I&apos;ll answer based on the document content with citations
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            role={message.role}
            content={message.content}
            citations={message.citations}
          />
        ))}

        {loading && (
          <div data-testid="loading-indicator" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 0',
            color: 'var(--text-muted)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'var(--primary)',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              background: 'var(--primary)',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both 0.16s',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              background: 'var(--primary)',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out both 0.32s',
            }} />
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderRadius: '0 0 12px 12px',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your PDF..."
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '1rem',
              resize: 'none',
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--text)',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              maxHeight: '120px',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            style={{
              padding: '12px 24px',
              background: input.trim() && !loading ? 'var(--primary)' : 'var(--border)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
            }}
          >
            Send
          </button>
        </div>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '8px',
          textAlign: 'center',
        }}>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}