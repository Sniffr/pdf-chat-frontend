'use client'

import { useState, useCallback } from 'react'

interface UploadBoxProps {
  onExtracted: (text: string, meta: { wordCount: number; pageCount: number }) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export default function UploadBox({ onExtracted, loading, setLoading }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file')
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
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
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
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p style={{ color: 'var(--text)', fontWeight: '500' }}>Processing your PDF...</p>
        {fileName && (
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.875rem' }}>
            {fileName}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      data-testid="upload-box"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: '100%',
        padding: '60px 40px',
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
        accept=".pdf"
        onChange={handleFileSelect}
        style={{
          display: 'none',
        }}
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
          Drag & drop your PDF here
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          or click to browse — PDF files only, max 20MB
        </p>
      </label>

      {error && (
        <div style={{
          marginTop: '16px',
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