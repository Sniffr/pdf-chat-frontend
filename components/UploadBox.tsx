'use client'

import { useState, useCallback } from 'react'

interface UploadBoxProps {
  onExtracted: (text: string, meta: { wordCount: number; pageCount: number }) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

const ALLOWED_TYPES = ['.pdf', '.docx', '.pptx']

export default function UploadBox({ onExtracted, loading, setLoading }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const handleFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Unsupported file type. Please use: ${ALLOWED_TYPES.join(', ')}`)
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum size is 20MB.')
      return
    }

    setError(null)
    setLoading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()
      onExtracted(data.text, {
        wordCount: data.word_count,
        pageCount: data.page_count
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [backendUrl, onExtracted, setLoading])

  const handleUrlSubmit = useCallback(async () => {
    const url = urlInput.trim()
    if (!url) return

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a full URL starting with http:// or https://')
      return
    }

    setError(null)
    setLoading(true)
    setFileName(url)

    try {
      const formData = new FormData()
      formData.append('url', url)

      const response = await fetch(`${backendUrl}/url`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed with status ${response.status}`)
      }

      const data = await response.json()
      onExtracted(data.text, {
        wordCount: data.word_count,
        pageCount: data.page_count
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [urlInput, backendUrl, onExtracted, setLoading])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (loading) {
    return (
      <div
        data-testid="upload-box"
        style={{
          width: '100%',
          padding: '60px 40px',
          border: '2px dashed var(--border)',
          borderRadius: '12px',
          textAlign: 'center',
          background: 'var(--surface)',
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--text)', fontWeight: '500' }}>Processing your document...</p>
        {fileName && (
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.875rem' }}>
            {fileName}
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* File upload area */}
      <div
        data-testid="upload-box"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: '100%',
          padding: '40px',
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '12px',
          textAlign: 'center',
          background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          accept=".pdf,.docx,.pptx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            background: 'var(--bg)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p style={{ color: 'var(--text)', fontWeight: '600', fontSize: '1.125rem', marginBottom: '8px' }}>
            Drag & drop your document here
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            PDF, DOCX, or PPTX — max 20MB
          </p>
        </label>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* URL input */}
      <div style={{
        padding: '20px',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        background: 'var(--surface)',
      }}>
        <p style={{ color: 'var(--text)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '12px' }}>
          Paste a URL to chat with a webpage
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="https://example.com/article"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            style={{
              padding: '10px 20px',
              background: urlInput.trim() ? 'var(--primary)' : 'var(--border)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: urlInput.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
            }}
          >
            Fetch
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}