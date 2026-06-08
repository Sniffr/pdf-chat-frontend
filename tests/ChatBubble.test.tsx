import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatBubble from '@/components/ChatBubble'

describe('ChatBubble', () => {
  it('right-aligns user bubbles', () => {
    render(
      <ChatBubble
        role="user"
        content="This is a user message"
      />
    )

    const bubble = screen.getByTestId('chat-bubble')
    expect(bubble).toHaveClass('user')
    expect(bubble.style.justifyContent).toBe('flex-end')
  })

  it('left-aligns assistant bubbles', () => {
    render(
      <ChatBubble
        role="assistant"
        content="This is an assistant message"
      />
    )

    const bubble = screen.getByTestId('chat-bubble')
    expect(bubble).toHaveClass('assistant')
    expect(bubble.style.justifyContent).toBe('flex-start')
  })

  it('displays message content', () => {
    render(
      <ChatBubble
        role="user"
        content="Hello, this is a test message"
      />
    )

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument()
  })

  it('shows citations for assistant messages', () => {
    const citations = [
      { page: 3, text: 'Important quote from page 3' },
      { page: 5, text: 'Another quote from page 5' }
    ]

    render(
      <ChatBubble
        role="assistant"
        content="Based on the document, here is my answer."
        citations={citations}
      />
    )

    // Use getAllByText since there can be multiple matches
    expect(screen.getAllByText(/page 3/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/page 5/i).length).toBeGreaterThan(0)
  })

  it('does not show citations for user messages', () => {
    render(
      <ChatBubble
        role="user"
        content="User message without citations"
      />
    )

    expect(screen.queryByText(/sources/i)).not.toBeInTheDocument()
  })

  it('renders assistant message with different styling', () => {
    render(
      <ChatBubble
        role="assistant"
        content="AI response here"
      />
    )

    const bubble = screen.getByTestId('chat-bubble')
    expect(bubble).toHaveClass('assistant')
  })
})