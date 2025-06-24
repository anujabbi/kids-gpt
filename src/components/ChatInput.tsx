
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import { validateFiles, formatFileSize, cleanupFileUrl } from "@/utils/fileUtils";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { currentTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && selectedFiles.length === 0) return;
    
    // Validate files if any are selected
    if (selectedFiles.length > 0) {
      const validation = validateFiles(selectedFiles);
      if (!validation.isValid) {
        toast({
          title: "File Upload Error",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    onSendMessage(message, selectedFiles.length > 0 ? selectedFiles : undefined);
    setMessage("");
    
    // Clean up file URLs and reset selection
    selectedFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      cleanupFileUrl(url);
    });
    setSelectedFiles([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFiles(prev => [...prev, ...files]);
    
    toast({
      title: "Files Selected",
      description: `${files.length} file${files.length > 1 ? 's' : ''} selected successfully.`,
    });
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const url = URL.createObjectURL(fileToRemove);
    cleanupFileUrl(url);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "File Removed",
      description: `"${fileToRemove.name}" has been removed.`,
    });
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
      {/* File attachments preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          <div 
            className="text-sm font-medium"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Attached Files ({selectedFiles.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{ 
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text.primary
                }}
              >
                <span className="truncate max-w-32">{file.name}</span>
                <span 
                  className="text-xs"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  ({formatFileSize(file.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-4 w-4 p-0 hover:bg-red-100"
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
            disabled={disabled}
          />
          
          {/* File attachment button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-2 h-8 w-8 p-0"
            style={{ color: currentTheme.colors.text.secondary }}
            disabled={disabled}
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
          disabled={(!message.trim() && selectedFiles.length === 0) || disabled}
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
