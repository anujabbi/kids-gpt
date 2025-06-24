
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import { validateFiles, formatFileSize, cleanupFileUrl, convertFileToAttachment } from "@/utils/fileUtils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadProgress } from "./FileUploadProgress";
import { FileAttachment } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileAttachment[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const { currentTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, uploadProgress, isUploading } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && selectedFiles.length === 0 && attachments.length === 0) return;
    
    let finalAttachments = [...attachments];
    
    // Upload any pending files
    if (selectedFiles.length > 0) {
      try {
        const uploadedFiles = await uploadFiles(selectedFiles);
        finalAttachments = [...finalAttachments, ...uploadedFiles];
      } catch (error) {
        // Error handling is done in useFileUpload hook
        return;
      }
    }

    onSendMessage(message, finalAttachments.length > 0 ? finalAttachments : undefined);
    setMessage("");
    
    // Clean up file URLs and reset selection
    selectedFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      cleanupFileUrl(url);
    });
    attachments.forEach(attachment => {
      if (attachment.previewUrl) {
        cleanupFileUrl(attachment.previewUrl);
      }
    });
    
    setSelectedFiles([]);
    setAttachments([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files before adding
    const validation = validateFiles(files);
    if (!validation.isValid) {
      toast({
        title: "File Selection Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Convert files to attachments for preview
    const newAttachments = files.map(convertFileToAttachment);
    setSelectedFiles(prev => [...prev, ...files]);
    setAttachments(prev => [...prev, ...newAttachments]);
    
    toast({
      title: "Files Selected",
      description: `${files.length} file${files.length > 1 ? 's' : ''} selected successfully.`,
    });
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index] || null;
    const attachmentToRemove = attachments[index] || null;
    
    if (fileToRemove) {
      const url = URL.createObjectURL(fileToRemove);
      cleanupFileUrl(url);
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
    
    if (attachmentToRemove) {
      if (attachmentToRemove.previewUrl) {
        cleanupFileUrl(attachmentToRemove.previewUrl);
      }
      setAttachments(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "File Removed",
        description: `"${attachmentToRemove.name}" has been removed.`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const totalFiles = Math.max(selectedFiles.length, attachments.length);

  return (
    <div 
      className="border-t p-4"
      style={{ 
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.border 
      }}
    >
      {/* Upload progress indicator */}
      {isUploading && uploadProgress.length > 0 && (
        <div className="mb-3">
          <FileUploadProgress progress={uploadProgress} />
        </div>
      )}

      {/* File attachments preview */}
      {totalFiles > 0 && (
        <div className="mb-3 space-y-2">
          <div 
            className="text-sm font-medium"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Attached Files ({totalFiles})
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text.primary
                }}
              >
                <span className="truncate max-w-32">{attachment.name}</span>
                <span 
                  className="text-xs"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  ({formatFileSize(attachment.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-32 pr-12 resize-none"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text.primary
            }}
            disabled={disabled || isUploading}
          />
          
          {/* File attachment button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-2 h-8 w-8 p-0"
            style={{ color: currentTheme.colors.text.secondary }}
            disabled={disabled || isUploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,text/*,application/pdf,.doc,.docx,audio/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={(!message.trim() && totalFiles === 0) || disabled || isUploading}
          className="h-11"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: 'white'
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
