
import { Message, FileAttachment } from '@/types/chat'

export const mockFileAttachment: FileAttachment = {
  id: 'test-file-1',
  name: 'test-image.jpg',
  type: 'image/jpeg',
  size: 102400,
  url: 'blob:mock-url-1',
  previewUrl: 'blob:mock-url-1',
}

export const mockTextFileAttachment: FileAttachment = {
  id: 'test-file-2',
  name: 'document.pdf',
  type: 'application/pdf',
  size: 204800,
  url: 'blob:mock-url-2',
}

export const mockUserMessage: Message = {
  id: 'msg-1',
  content: 'Hello, this is a test message',
  role: 'user',
  timestamp: new Date('2024-01-01T12:00:00Z'),
}

export const mockAssistantMessage: Message = {
  id: 'msg-2',
  content: 'Hello! How can I help you today?',
  role: 'assistant',
  timestamp: new Date('2024-01-01T12:01:00Z'),
}

export const mockMessageWithAttachment: Message = {
  id: 'msg-3',
  content: 'Here is an image for you',
  role: 'user',
  timestamp: new Date('2024-01-01T12:02:00Z'),
  attachments: [mockFileAttachment],
}

export const mockMessageWithMultipleAttachments: Message = {
  id: 'msg-4',
  content: 'Multiple files attached',
  role: 'user',
  timestamp: new Date('2024-01-01T12:03:00Z'),
  attachments: [mockFileAttachment, mockTextFileAttachment],
}
