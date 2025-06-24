
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Clear selected file for now (Stage 2 - selection and preview, not processing)
      clearSelectedFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type (images only for Stage 2)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return false;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    setSelectedFile(file);
    
    // Create preview URL for image
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
    
    // Clear the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    clearSelectedFile();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0]; // Only take the first file for now
      validateAndSetFile(file);
    }
  };

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-white p-4">
      <div className="mx-auto max-w-4xl">
        {/* Selected file preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-start gap-3">
              {/* Image thumbnail */}
              {filePreviewUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={filePreviewUrl}
                    alt={selectedFile.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                </div>
              )}
              
              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(selectedFile.size / 1024)}KB • {selectedFile.type.split('/')[1].toUpperCase()}
                </div>
              </div>
              
              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div 
            className={`flex items-end gap-2 bg-white border rounded-xl shadow-sm transition-all ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50 shadow-md' 
                : 'border-gray-300 focus-within:border-gray-400 focus-within:shadow-md'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center z-10 border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">Drop your image here</p>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaperclipClick}
              className={`m-2 transition-colors ${
                selectedFile 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedFile 
                  ? "Add a message with your image..." 
                  : "Message ChatGPT or drag & drop an image..."
              }
              className="flex-1 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-32 min-h-[40px]"
              disabled={disabled}
              rows={1}
            />
            
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className="m-2 bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-300"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </form>
      </div>
    </div>
  );
}
