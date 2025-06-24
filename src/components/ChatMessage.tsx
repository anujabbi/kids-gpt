
import { User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/contexts/ThemeContext";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { currentTheme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <div 
      className={`flex gap-4 p-6`}
      style={{ 
        backgroundColor: isUser ? 'transparent' : currentTheme.colors.surface 
      }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback 
          className="text-white"
          style={{ 
            backgroundColor: isUser ? currentTheme.colors.primary : currentTheme.colors.secondary || currentTheme.colors.primary 
          }}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div 
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {isUser ? 'You' : 'KidsGPT'}
        </div>
        <div className="prose prose-sm max-w-none leading-relaxed">
          <ReactMarkdown
            components={{
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                return isInline ? (
                  <code 
                    className="px-1 py-0.5 rounded text-sm" 
                    style={{ 
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text.primary
                    }}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              },
              p: ({ children }) => (
                <p 
                  className="mb-2 last:mb-0"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul 
                  className="list-disc list-inside mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol 
                  className="list-decimal list-inside mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li 
                  className="mb-1"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </li>
              ),
              h1: ({ children }) => (
                <h1 
                  className="text-xl font-bold mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 
                  className="text-lg font-semibold mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 
                  className="text-base font-medium mb-2"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote 
                  className="pl-4 italic mb-2 border-l-4"
                  style={{ 
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.secondary
                  }}
                >
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong 
                  className="font-semibold"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em 
                  className="italic"
                  style={{ color: currentTheme.colors.text.secondary }}
                >
                  {children}
                </em>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
