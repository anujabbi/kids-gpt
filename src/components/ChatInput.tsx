
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="m-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ChatGPT..."
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
        </form>
      </div>
    </div>
  );
}
