'use client'

import { useState } from 'react'

interface Citation {
  page: number
  text: string
}

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export default function ChatBubble({ role, content, citations }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [copiedSources, setCopiedSources] = useState(false)
  const isUser = role === 'user'

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleCopySources = () => {
    if (citations && citations.length > 0) {
      const sourcesText = citations.map(c => `Page ${c.page}: "${c.text}"`).join('\n')
      navigator.clipboard.writeText(sourcesText)
      setCopiedSources(true)
      setTimeout(() => setCopiedSources(false), 1500)
    }
  }

  return (
    <div
      data-testid="chat-bubble"
      className={role}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: '16px',
          background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
          color: isUser ? '#ffffff' : 'var(--text)',
        }}
      >
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{content}</p>

        {!isUser && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              onClick={handleCopyContent}
              style={{
                fontSize: '11px',
                background: 'none',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            {citations && citations.length > 0 && (
              <button
                onClick={handleCopySources}
                style={{
                  fontSize: '11px',
                  background: 'none',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                {copiedSources ? '✓ Copied' : 'Copy sources'}
              </button>
            )}
          </div>
        )}

        {citations && citations.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              fontSize: '0.75rem',
              color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
            }}
          >
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Sources:</p>
            {citations.map((citation, index) => (
              <p key={index} style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: '500' }}>Page {citation.page}:</span>{' '}
                <span style={{ fontStyle: 'italic' }}>"{citation.text}"</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}