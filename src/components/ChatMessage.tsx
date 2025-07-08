
import { User, Rocket } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/chat";
import { FileAttachmentDisplay } from "./FileAttachmentDisplay";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { HomeworkScoreBadge } from "./HomeworkScoreBadge";
import { ProfileImageDisplay } from "./ProfileImageDisplay";
import { ImagePrintButton } from "./ImagePrintButton";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const isUser = message.role === 'user';

  return (
    <div 
      className="flex gap-4 p-6"
      style={{ 
        backgroundColor: isUser ? 'transparent' : currentTheme.colors.surface 
      }}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback 
          className="p-0 overflow-hidden"
          style={{ 
            backgroundColor: 'transparent'
          }}
        >
          <ProfileImageDisplay 
            userId={isUser ? user?.id : undefined}
            isUser={isUser}
            size="md"
            className="w-full h-full"
          />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2 text-left">
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

        {/* Generated image */}
        {message.generatedImage && (
          <div className="mb-3">
            <div 
              className="text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              Generated Image: {message.generatedImage.prompt}
            </div>
            <img
              src={message.generatedImage.url}
              alt={message.generatedImage.prompt}
              className="w-1/2 h-auto rounded-lg border"
              style={{ borderColor: currentTheme.colors.border }}
              loading="lazy"
            />
            <div className="mt-2">
              <ImagePrintButton 
                imageUrl={message.generatedImage.url}
                imageName={message.generatedImage.prompt}
              />
            </div>
          </div>
        )}
        
        <MarkdownRenderer content={message.content} />

        {/* Homework Misuse Score - only show for assistant messages */}
        {!isUser && typeof message.homeworkMisuseScore === 'number' && (
          <div className="mt-3">
            <HomeworkScoreBadge score={message.homeworkMisuseScore} />
          </div>
        )}
      </div>
    </div>
  );
}
