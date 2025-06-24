import { User, Rocket, FileImage, FileVideo, FileAudio, FileText, File } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/contexts/ThemeContext";
import { Message, FileAttachment } from "@/types/chat";
import { formatFileSize } from "@/utils/fileUtils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  if (fileType.includes('text') || fileType.includes('pdf')) return FileText;
  return File;
};

const FileAttachmentDisplay = ({ attachment }: { attachment: FileAttachment }) => {
  const { currentTheme } = useTheme();
  const FileIcon = getFileIcon(attachment.type);
  const isImage = attachment.type.startsWith('image/');

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border max-w-xs"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border 
      }}
    >
      {isImage && attachment.previewUrl ? (
        <img 
          src={attachment.previewUrl} 
          alt={attachment.name}
          className="w-12 h-12 object-cover rounded"
          onLoad={() => console.log('Image loaded successfully:', attachment.name)}
          onError={(e) => {
            console.error('Image failed to load:', attachment.previewUrl, attachment.name);
            // Hide the broken image and show the file icon instead
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const iconDiv = target.nextElementSibling as HTMLElement;
            if (iconDiv) {
              iconDiv.style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      <div 
        className={`w-12 h-12 flex items-center justify-center rounded ${isImage && attachment.previewUrl ? 'hidden' : ''}`}
        style={{ backgroundColor: currentTheme.colors.primary }}
      >
        <FileIcon className="w-6 h-6 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div 
          className="text-sm font-medium truncate"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {attachment.name}
        </div>
        <div 
          className="text-xs"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          {formatFileSize(attachment.size)}
        </div>
      </div>
    </div>
  );
};

export function ChatMessage({ message }: ChatMessageProps) {
  const { currentTheme } = useTheme();
  const isUser = message.role === 'user';

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'bg-green-500';
    if (score <= 40) return 'bg-green-400';
    if (score <= 60) return 'bg-yellow-500';
    if (score <= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 20) return 'Educational';
    if (score <= 40) return 'Mostly Learning';
    if (score <= 60) return 'Mixed';
    if (score <= 80) return 'Likely Homework';
    return 'Homework Copying';
  };

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
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Rocket 
              className="h-4 w-4" 
              style={{ color: currentTheme.colors.text.primary }}
            />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div 
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.text.primary }}
        >
          {isUser ? 'You' : 'KidsGPT'}
        </div>
        
        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-3">
            {message.attachments.map((attachment) => (
              <FileAttachmentDisplay key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
        
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

        {/* Homework Misuse Score - only show for assistant messages */}
        {!isUser && typeof message.homeworkMisuseScore === 'number' && (
          <div className="mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`text-white text-xs ${getScoreColor(message.homeworkMisuseScore)}`}
                >
                  Homework Misuse Score: {message.homeworkMisuseScore}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div className="font-medium">{getScoreLabel(message.homeworkMisuseScore)}</div>
                  <div className="text-gray-600 mt-1">
                    {message.homeworkMisuseScore <= 20 && "This response encourages learning and critical thinking."}
                    {message.homeworkMisuseScore > 20 && message.homeworkMisuseScore <= 40 && "This response is mostly educational with some direct information."}
                    {message.homeworkMisuseScore > 40 && message.homeworkMisuseScore <= 60 && "This response has mixed educational and direct answer content."}
                    {message.homeworkMisuseScore > 60 && message.homeworkMisuseScore <= 80 && "This response may be providing homework help with minimal learning."}
                    {message.homeworkMisuseScore > 80 && "This response appears to be providing direct homework answers."}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
