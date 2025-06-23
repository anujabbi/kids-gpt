
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-transparent' : 'bg-gray-50'}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium text-gray-900">
          {isUser ? 'You' : 'ChatGPT'}
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {message.content.split('\n').map((line, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
