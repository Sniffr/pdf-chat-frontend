'use client'

import { useState } from 'react'
import UploadBox from '@/components/UploadBox'
import ChatWindow from '@/components/ChatWindow'

interface DocumentMeta {
  wordCount: number
  pageCount: number
}

type Phase = 'landing' | 'chat'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [documentText, setDocumentText] = useState<string>('')
  const [documentMeta, setDocumentMeta] = useState<DocumentMeta>({ wordCount: 0, pageCount: 0 })

  const handleExtracted = (text: string, meta: DocumentMeta) => {
    setDocumentText(text)
    setDocumentMeta(meta)
    setPhase('chat')
  }

  const handleReset = () => {
    setDocumentText('')
    setDocumentMeta({ wordCount: 0, pageCount: 0 })
    setPhase('landing')
  }

  if (phase === 'chat' && documentText) {
    return (
      <div data-testid="chat-window" style={{ minHeight: '100vh', padding: '20px' }}>
        <ChatWindow
          documentText={documentText}
          documentMeta={documentMeta}
          onReset={handleReset}
        />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg)'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '600px', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text)' }}>
          Understand Any PDF in Seconds
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          No credit card required. Unlimited questions. Cited answers.
        </p>

        {/* Feature List */}
        <ul style={{ listStyle: 'none', marginBottom: '40px', textAlign: 'left' }}>
          <li style={{ padding: '8px 0', color: 'var(--text)' }}>
            <span style={{ marginRight: '12px' }}>1.</span>
            Upload any PDF document
          </li>
          <li style={{ padding: '8px 0', color: 'var(--text)' }}>
            <span style={{ marginRight: '12px' }}>2.</span>
            Ask questions in plain English
          </li>
          <li style={{ padding: '8px 0', color: 'var(--text)' }}>
            <span style={{ marginRight: '12px' }}>3.</span>
            Get cited answers with page references
          </li>
        </ul>
      </div>

      {/* Upload Section */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <UploadBox
          onExtracted={handleExtracted}
          loading={false}
          setLoading={() => {}}
        />
      </div>

      {/* Pricing */}
      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Pay what you want — starting at $1/month
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '80px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        width: '100%',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        ChatJimny — Powered by Featherless AI
      </footer>
    </div>
  )
}