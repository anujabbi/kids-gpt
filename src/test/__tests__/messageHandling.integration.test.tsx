
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '@/components/ChatInput'
import { ChatMessage } from '@/components/ChatMessage'
import { mockUserMessage, mockFileAttachment } from '@/test/mockData'

describe('Message Handling Integration', () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('handles complete message flow with text', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    // Type and send message
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'Hello, this is a test message')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, this is a test message', undefined)
    
    // Render the message that would be created
    rerender(
      <div>
        <ChatInput onSendMessage={mockOnSendMessage} />
        <ChatMessage message={mockUserMessage} />
      </div>
    )
    
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument()
  })

  it('handles message flow with file attachments', async () => {
    const user = userEvent.setup()
    
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    // Add file attachment
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      await user.upload(fileInput, file)
    }
    
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
    
    // Type message and send
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'Here is an image')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    expect(mockOnSendMessage).toHaveBeenCalledWith(
      'Here is an image',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test.jpg',
          type: 'image/jpeg'
        })
      ])
    )
  })

  it('handles message display with attachments', () => {
    const messageWithAttachment = {
      ...mockUserMessage,
      content: 'Here is an image for you',
      attachments: [mockFileAttachment]
    }
    
    render(<ChatMessage message={messageWithAttachment} />)
    
    expect(screen.getByText('Here is an image for you')).toBeInTheDocument()
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument()
    expect(screen.getByText('(100 KB)')).toBeInTheDocument()
  })

  it('validates file attachments before sending', async () => {
    const user = userEvent.setup()
    
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    // Try to upload an unsupported file type
    const unsupportedFile = new File(['exe content'], 'virus.exe', { type: 'application/exe' })
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      await user.upload(fileInput, unsupportedFile)
    }
    
    // Should show error and not add the file
    await waitFor(() => {
      expect(screen.queryByText('virus.exe')).not.toBeInTheDocument()
    })
  })

  it('cleans up attachments after sending', async () => {
    const user = userEvent.setup()
    const mockRevoke = vi.fn()
    global.URL.revokeObjectURL = mockRevoke
    
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    // Add file attachment
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      await user.upload(fileInput, file)
    }
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
    
    // Send message
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'Message with file')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    // Attachments should be cleared from input
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
  })
})
