
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '../ChatInput'

const mockOnSendMessage = vi.fn()

describe('ChatInput', () => {
  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('renders input elements correctly', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(textarea, 'Hello world')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', undefined)
  })

  it('sends message when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Hello world{enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', undefined)
  })

  it('does not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Hello world{shift}{enter}')
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('disables send button when message is empty', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when message has content', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(textarea, 'Hello')
    
    expect(sendButton).not.toBeDisabled()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    
    await user.type(textarea, 'Hello world')
    await user.click(screen.getByRole('button', { name: /send/i }))
    
    expect(textarea).toHaveValue('')
  })

  it('handles file attachment selection', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      await user.upload(fileInput, file)
    }
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('removes file attachment when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByRole('textbox').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    if (fileInput) {
      await user.upload(fileInput, file)
    }
    
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)
    
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled />)
    
    const textarea = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })
})
