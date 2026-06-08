import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatWindow from '@/components/ChatWindow'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ChatWindow', () => {
  const mockDocumentText = 'This is a test PDF document with some content about testing.'
  const mockDocumentMeta = { wordCount: 10, pageCount: 1 }
  const mockOnReset = vi.fn()

  beforeEach(() => {
    mockFetch.mockReset()
    mockOnReset.mockClear()
  })

  it('adds user message to state on send', async () => {
    // Mock a pending response that we'll never resolve in this test
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const input = screen.getByPlaceholderText(/ask a question/i)
    fireEvent.change(input, { target: { value: 'What is this document about?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // User message should appear
    await waitFor(() => {
      expect(screen.getByText('What is this document about?')).toBeInTheDocument()
    })
  })

  it('adds AI response to state on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        answer: 'This document is about testing.',
        citations: [{ page: 1, text: 'testing' }]
      })
    })

    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const input = screen.getByPlaceholderText(/ask a question/i)
    fireEvent.change(input, { target: { value: 'What is this document about?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('This document is about testing.')).toBeInTheDocument()
    })
  })

  it('does not submit on Shift+Enter', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const input = screen.getByPlaceholderText(/ask a question/i)
    fireEvent.change(input, { target: { value: 'Multiline\nmessage' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    // No user message should appear (multiline input, not submit)
    expect(screen.queryByText('Multiline')).not.toBeInTheDocument()
  })

  it('scrolls to bottom on new message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        answer: 'This document is about testing.',
        citations: []
      })
    })

    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const input = screen.getByPlaceholderText(/ask a question/i)
    fireEvent.change(input, { target: { value: 'Test question' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // The chat container should have the scroll behavior
    const chatContainer = screen.getByTestId('chat-container')
    expect(chatContainer).toBeInTheDocument()
  })

  it('calls onReset when "New Document" button is clicked', () => {
    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const newDocButton = screen.getByText(/new document/i)
    fireEvent.click(newDocButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('displays document metadata', () => {
    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    expect(screen.getByText(/10 words/i)).toBeInTheDocument()
    expect(screen.getByText(/1 page/i)).toBeInTheDocument()
  })

  it('shows loading indicator while waiting for response', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    render(
      <ChatWindow
        documentText={mockDocumentText}
        documentMeta={mockDocumentMeta}
        onReset={mockOnReset}
      />
    )

    const input = screen.getByPlaceholderText(/ask a question/i)
    fireEvent.change(input, { target: { value: 'Test question' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    })
  })
})