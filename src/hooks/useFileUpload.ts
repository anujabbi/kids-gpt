
import { useState, useCallback } from 'react';
import { FileAttachment } from '@/types/chat';
import { fileUploadService, UploadProgress } from '@/services/fileUploadService';
import { validateFiles } from '@/utils/fileUtils';
import { toast } from '@/hooks/use-toast';

export interface UseFileUploadResult {
  uploadFiles: (files: File[]) => Promise<FileAttachment[]>;
  uploadProgress: UploadProgress[];
  isUploading: boolean;
  clearProgress: () => void;
}

export function useFileUpload(): UseFileUploadResult {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: File[]): Promise<FileAttachment[]> => {
    // Validate files before upload
    const validation = validateFiles(files);
    if (!validation.isValid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive",
      });
      throw new Error(validation.error);
    }

    setIsUploading(true);
    setUploadProgress([]);

    try {
      const uploadedFiles = await fileUploadService.uploadFiles(files, (progress) => {
        setUploadProgress(progress);
      });

      toast({
        title: "Upload Complete",
        description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully.`,
      });

      return uploadedFiles;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 2000);
    }
  }, []);

  const clearProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  return {
    uploadFiles,
    uploadProgress,
    isUploading,
    clearProgress,
  };
}
