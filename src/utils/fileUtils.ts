
import { FileAttachment } from '@/types/chat';

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'text/plain',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported for "${file.name}".`
    };
  }

  return { isValid: true };
};

export const validateFiles = (files: File[]): FileValidationResult => {
  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `Total file size is too large. Maximum total size is ${formatFileSize(MAX_TOTAL_SIZE)}.`
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};

export const convertFileToAttachment = (file: File): FileAttachment => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const blobUrl = URL.createObjectURL(file);
  
  return {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    url: blobUrl,
    previewUrl: file.type.startsWith('image/') ? blobUrl : undefined,
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const cleanupFileUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke blob URL:', error);
    }
  }
};
