
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  validateFile, 
  validateFiles, 
  convertFileToAttachment, 
  formatFileSize, 
  cleanupFileUrl,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE 
} from '../fileUtils'

describe('fileUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validateFile', () => {
    it('validates file size correctly', () => {
      const validFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFile(validFile)
      
      expect(result.isValid).toBe(true)
    })

    it('rejects files that are too large', () => {
      const largeFile = new File(['x'.repeat(MAX_FILE_SIZE + 1)], 'large.txt', { type: 'text/plain' })
      const result = validateFile(largeFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('rejects unsupported file types', () => {
      const unsupportedFile = new File(['content'], 'test.exe', { type: 'application/exe' })
      const result = validateFile(unsupportedFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('accepts supported image types', () => {
      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFile(imageFile)
      
      expect(result.isValid).toBe(true)
    })

    it('accepts supported document types', () => {
      const pdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(pdfFile)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateFiles', () => {
    it('validates multiple files correctly', () => {
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      ]
      const result = validateFiles(files)
      
      expect(result.isValid).toBe(true)
    })

    it('rejects when total size exceeds limit', () => {
      const largeFiles = [
        new File(['x'.repeat(MAX_TOTAL_SIZE / 2 + 1)], 'large1.txt', { type: 'text/plain' }),
        new File(['x'.repeat(MAX_TOTAL_SIZE / 2 + 1)], 'large2.txt', { type: 'text/plain' })
      ]
      const result = validateFiles(largeFiles)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Total file size is too large')
    })
  })

  describe('convertFileToAttachment', () => {
    it('converts file to attachment correctly', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const attachment = convertFileToAttachment(file)
      
      expect(attachment).toMatchObject({
        name: 'test.jpg',
        type: 'image/jpeg',
        size: file.size,
        url: 'blob:mock-url',
        previewUrl: 'blob:mock-url'
      })
      expect(attachment.id).toBeDefined()
    })

    it('sets previewUrl only for images', () => {
      const textFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const attachment = convertFileToAttachment(textFile)
      
      expect(attachment.previewUrl).toBeUndefined()
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('formats with decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })
  })

  describe('cleanupFileUrl', () => {
    it('revokes blob URLs', () => {
      const mockRevoke = vi.fn()
      global.URL.revokeObjectURL = mockRevoke
      
      cleanupFileUrl('blob:test-url')
      
      expect(mockRevoke).toHaveBeenCalledWith('blob:test-url')
    })

    it('handles non-blob URLs safely', () => {
      const mockRevoke = vi.fn()
      global.URL.revokeObjectURL = mockRevoke
      
      cleanupFileUrl('https://example.com/image.jpg')
      
      expect(mockRevoke).not.toHaveBeenCalled()
    })

    it('handles null/undefined URLs safely', () => {
      const mockRevoke = vi.fn()
      global.URL.revokeObjectURL = mockRevoke
      
      cleanupFileUrl('')
      cleanupFileUrl(null as any)
      cleanupFileUrl(undefined as any)
      
      expect(mockRevoke).not.toHaveBeenCalled()
    })

    it('handles revoke errors gracefully', () => {
      const mockRevoke = vi.fn().mockImplementation(() => {
        throw new Error('Revoke failed')
      })
      global.URL.revokeObjectURL = mockRevoke
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      expect(() => cleanupFileUrl('blob:test-url')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to revoke blob URL:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })
})
