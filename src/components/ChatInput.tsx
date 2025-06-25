
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X, Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import { validateFiles, formatFileSize, cleanupFileUrl, convertFileToAttachment } from "@/utils/fileUtils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadProgress } from "./FileUploadProgress";
import { ImageGenerationDialog } from "./ImageGenerationDialog";
import { FileAttachment } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileAttachment[]) => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onImageGenerated, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const { currentTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, uploadProgress, isUploading } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;

    // Send the message with attachments (don't clean up URLs yet - let the message component handle cleanup)
    onSendMessage(message, attachments.length > 0 ? attachments : undefined);
    setMessage("");
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
    setAttachments(prev => [...prev, ...newAttachments]);
    
    toast({
      title: "Files Selected",
      description: `${files.length} file${files.length > 1 ? 's' : ''} selected successfully.`,
    });
  };

  const removeFile = (index: number) => {
    const attachmentToRemove = attachments[index];
    
    if (attachmentToRemove) {
      // Clean up URLs when removing files
      cleanupFileUrl(attachmentToRemove.url);
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
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          <div 
            className="text-sm font-medium"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Attached Files ({attachments.length})
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
            className="min-h-[44px] max-h-32 pr-20 resize-none"
            style={{ 
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text.primary
            }}
            disabled={disabled || isUploading}
          />
          
          {/* Action buttons */}
          <div className="absolute right-2 top-2 flex gap-1">
            {/* Image generation button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageDialog(true)}
              className="h-8 w-8 p-0"
              style={{ color: currentTheme.colors.text.secondary }}
              disabled={disabled || isUploading}
              title="Generate Image"
            >
              <Palette className="h-4 w-4" />
            </Button>
            
            {/* File attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 p-0"
              style={{ color: currentTheme.colors.text.secondary }}
              disabled={disabled || isUploading}
              title="Attach File"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
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
          disabled={(!message.trim() && attachments.length === 0) || disabled || isUploading}
          className="h-11"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: 'white'
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <ImageGenerationDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onImageGenerated={onImageGenerated}
      />
    </div>
  );
}
