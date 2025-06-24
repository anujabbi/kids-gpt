
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/testUtils'
import { ChatMessage } from '../ChatMessage'
import { 
  mockUserMessage, 
  mockAssistantMessage, 
  mockMessageWithAttachment,
  mockMessageWithMultipleAttachments 
} from '@/test/mockData'

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage message={mockUserMessage} />)
    
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText(mockUserMessage.content)).toBeInTheDocument()
  })

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={mockAssistantMessage} />)
    
    expect(screen.getByText('KidsGPT')).toBeInTheDocument()
    expect(screen.getByText(mockAssistantMessage.content)).toBeInTheDocument()
  })

  it('displays file attachments', () => {
    render(<ChatMessage message={mockMessageWithAttachment} />)
    
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument()
    expect(screen.getByText('(100 KB)')).toBeInTheDocument()
  })

  it('displays multiple file attachments', () => {
    render(<ChatMessage message={mockMessageWithMultipleAttachments} />)
    
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument()
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('(100 KB)')).toBeInTheDocument()
    expect(screen.getByText('(200 KB)')).toBeInTheDocument()
  })

  it('handles image load error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<ChatMessage message={mockMessageWithAttachment} />)
    
    const image = screen.getByRole('img')
    // Simulate image load error
    image.dispatchEvent(new Event('error'))
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Image failed to load:', 
      mockMessageWithAttachment.attachments![0].previewUrl,
      mockMessageWithAttachment.attachments![0].name
    )
    
    consoleSpy.mockRestore()
  })

  it('renders markdown content correctly', () => {
    const messageWithMarkdown = {
      ...mockUserMessage,
      content: '# Heading\n\nThis is **bold** text and *italic* text.'
    }
    
    render(<ChatMessage message={messageWithMarkdown} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading')
    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('applies correct styling for user vs assistant messages', () => {
    const { rerender } = render(<ChatMessage message={mockUserMessage} />)
    
    // User message should have transparent background
    const userContainer = screen.getByText('You').closest('[class*="flex gap-4 p-6"]')
    expect(userContainer).toHaveStyle({ backgroundColor: 'transparent' })
    
    rerender(<ChatMessage message={mockAssistantMessage} />)
    
    // Assistant message should have surface background (this will be set by theme)
    const assistantContainer = screen.getByText('KidsGPT').closest('[class*="flex gap-4 p-6"]')
    expect(assistantContainer).toBeInTheDocument()
  })
})
