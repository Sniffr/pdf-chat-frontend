import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '@/app/page'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('Page', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('shows landing phase initially', () => {
    render(<Page />)

    expect(screen.getByText(/understand any pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/no credit card/i)).toBeInTheDocument()
  })

  it('transitions from landing to chat on successful upload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        text: 'This is extracted PDF text',
        word_count: 100,
        page_count: 5
      })
    })

    render(<Page />)

    // Find the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    // Should transition to chat phase
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    })
  })

  it('resets to landing on "New Document" button click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        text: 'This is extracted PDF text',
        word_count: 100,
        page_count: 5
      })
    })

    render(<Page />)

    // First upload a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    // Wait for chat phase
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument()
    })

    // Click "New Document" button
    const newDocButton = screen.getByText(/new document/i)
    fireEvent.click(newDocButton)

    // Should be back to landing
    await waitFor(() => {
      expect(screen.getByText(/understand any pdf/i)).toBeInTheDocument()
    })
  })

  it('displays feature list on landing page', () => {
    render(<Page />)

    expect(screen.getByText(/upload any pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/ask questions/i)).toBeInTheDocument()
    expect(screen.getByText(/get cited answers/i)).toBeInTheDocument()
  })

  it('displays pricing information', () => {
    render(<Page />)

    expect(screen.getByText(/pay what you want/i)).toBeInTheDocument()
  })
})