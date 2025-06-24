
import { FileAttachment } from '@/types/chat';

export const convertFileToAttachment = (file: File): FileAttachment => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const previewUrl = URL.createObjectURL(file);
  
  return {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    url: previewUrl, // For now, use the preview URL as the main URL
    previewUrl,
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
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
