import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadBox from '@/components/UploadBox'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('UploadBox', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('shows loading state during upload', async () => {
    // Mock a slow upload that never resolves (or we test loading state before resolution)
    let resolveUpload: (value: unknown) => void
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve
    })

    mockFetch.mockImplementation(() => uploadPromise as never)

    const onExtracted = vi.fn()
    const setLoading = vi.fn()

    render(
      <UploadBox
        onExtracted={onExtracted}
        loading={true}
        setLoading={setLoading}
      />
    )

    // When loading, should show loading indicator
    expect(screen.getByText(/processing/i)).toBeInTheDocument()
  })

  it('shows error on failed upload', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Upload failed'))

    const onExtracted = vi.fn()
    const setLoading = vi.fn()

    render(
      <UploadBox
        onExtracted={onExtracted}
        loading={false}
        setLoading={setLoading}
      />
    )

    // Find and click the hidden file input via the upload area
    const dropZone = screen.getByTestId('upload-box')
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    // Create a mock file
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
  })

  it('renders drag-and-drop zone with click to browse', () => {
    const onExtracted = vi.fn()
    const setLoading = vi.fn()

    render(
      <UploadBox
        onExtracted={onExtracted}
        loading={false}
        setLoading={setLoading}
      />
    )

    expect(screen.getByTestId('upload-box')).toBeInTheDocument()
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
    expect(screen.getByText(/PDF, DOCX, or PPTX/i)).toBeInTheDocument()
  })

  it('calls onExtracted on successful upload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        text: 'This is extracted PDF text',
        word_count: 5,
        page_count: 1
      })
    })

    const onExtracted = vi.fn()
    const setLoading = vi.fn()

    render(
      <UploadBox
        onExtracted={onExtracted}
        loading={false}
        setLoading={setLoading}
      />
    )

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [mockFile] } })

    await waitFor(() => {
      expect(onExtracted).toHaveBeenCalledWith(
        'This is extracted PDF text',
        { wordCount: 5, pageCount: 1 }
      )
    })
  })
})