
import { ChatMessage } from "./ChatMessage";
import { Message } from "@/types/chat";
import { useTheme } from "@/contexts/ThemeContext";
import { ProfileImageDisplay } from "./ProfileImageDisplay";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const { currentTheme } = useTheme();

  return (
    <div className="pb-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isTyping && (
        <div 
          className="flex gap-4 p-6"
          style={{ backgroundColor: currentTheme.colors.surface }}
        >
          <div className="h-8 w-8 shrink-0">
            <ProfileImageDisplay 
              isUser={false}
              size="md"
              className="w-full h-full"
            />
          </div>
          <div className="flex-1">
            <div 
              className="text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.primary }}
            >
              KidsGPT
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
