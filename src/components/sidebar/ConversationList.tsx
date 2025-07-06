
import { MessageSquare, Trash2 } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { ProfileImageDisplay } from "@/components/ProfileImageDisplay";

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
  child?: {
    id: string;
    full_name: string;
    profile_image_type: string;
    custom_profile_image_url?: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  isCollapsed: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isInFolder?: boolean;
  showChildNames?: boolean;
}

export function ConversationList({
  conversations,
  activeConversation,
  isCollapsed,
  onSelectConversation,
  onDeleteConversation,
  isInFolder = false,
  showChildNames = false
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
                : currentTheme.colors.background + ' !important',
              color: activeConversation === conversation.id 
                ? `${currentTheme.colors.text.accent} !important`
                : `${currentTheme.colors.text.primary} !important`
            }}
          >
            <MessageSquare 
              className={isInFolder ? "h-3 w-3" : "h-4 w-4"} 
              style={{ 
                color: `${currentTheme.colors.text.secondary} !important` 
              }}
            />
            {!isCollapsed && (
              <div className="flex-1 flex items-center gap-2">
                {showChildNames && conversation.child && (
                  <div className="flex items-center gap-1">
                    <ProfileImageDisplay
                      userId={conversation.child.id}
                      isUser={false}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <span 
                      className={`text-xs truncate`}
                      style={{ 
                        color: `${currentTheme.colors.text.secondary} !important` 
                      }}
                    >
                      {conversation.child.full_name}:
                    </span>
                  </div>
                )}
                <span 
                  className={`${isInFolder ? 'text-xs' : 'text-sm'} truncate text-left`}
                  style={{
                    color: activeConversation === conversation.id 
                      ? `${currentTheme.colors.text.accent} !important`
                      : `${currentTheme.colors.text.primary} !important`
                  }}
                >
                  {conversation.title}
                </span>
              </div>
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
                color: `${currentTheme.colors.text.secondary} !important`,
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
