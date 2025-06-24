
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Clear selected file for now (Stage 1 - just selection, not processing)
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only for Stage 1)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    // Clear the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-white p-4">
      <div className="mx-auto max-w-4xl">
        {/* Selected file display */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
            <div className="flex-1 text-sm text-gray-700">
              📎 {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
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
              placeholder={selectedFile ? "Message with attachment..." : "Message ChatGPT..."}
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
