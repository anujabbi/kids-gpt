
import { MessageSquare, Trash2 } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  folderId?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  isCollapsed: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isInFolder?: boolean;
}

export function ConversationList({
  conversations,
  activeConversation,
  isCollapsed,
  onSelectConversation,
  onDeleteConversation,
  isInFolder = false
}: ConversationListProps) {
  const { currentTheme } = useTheme();

  return (
    <>
      {conversations.map((conversation) => (
        <SidebarMenuItem key={conversation.id}>
          <SidebarMenuButton
            isActive={activeConversation === conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`group w-full ${isInFolder ? 'p-2' : 'p-3'} rounded-lg transition-colors`}
            style={{
              backgroundColor: activeConversation === conversation.id 
                ? currentTheme.colors.primary + '20' 
                : 'transparent',
              color: activeConversation === conversation.id 
                ? currentTheme.colors.text.accent 
                : currentTheme.colors.text.primary
            }}
          >
            <MessageSquare 
              className={isInFolder ? "h-3 w-3" : "h-4 w-4"} 
              style={{ color: currentTheme.colors.text.secondary }}
            />
            {!isCollapsed && (
              <span className={`flex-1 ${isInFolder ? 'text-xs' : 'text-sm'} truncate text-left`}>
                {conversation.title}
              </span>
            )}
          </SidebarMenuButton>
          {!isCollapsed && (
            <SidebarMenuAction
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
              className="hover:bg-opacity-20"
              style={{ 
                color: currentTheme.colors.text.secondary,
                backgroundColor: 'transparent'
              }}
              showOnHover
            >
              <Trash2 className="h-3 w-3" />
            </SidebarMenuAction>
          )}
        </SidebarMenuItem>
      ))}
    </>
  );
}
