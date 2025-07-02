
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { UserProfileSection } from "@/components/sidebar/UserProfileSection";
import { CreateFolderDialog } from "@/components/sidebar/CreateFolderDialog";
import { FolderSection } from "@/components/sidebar/FolderSection";
import { ConversationList } from "@/components/sidebar/ConversationList";
import { useAuth } from "@/contexts/AuthContext";

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
  userId?: string;
  child?: {
    id: string;
    full_name: string;
    profile_image_type: string;
    custom_profile_image_url?: string;
  };
}

interface Folder {
  id: string;
  name: string;
  timestamp: Date;
}

interface AppSidebarProps {
  onNewChat: (folderId?: string) => void;
  conversations: Conversation[];
  folders: Folder[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
}

export function AppSidebar({
  onNewChat,
  conversations,
  folders,
  activeConversation,
  onSelectConversation,
  onDeleteConversation,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const { currentTheme } = useTheme();
  const { profile } = useAuth();
  const isCollapsed = state === "collapsed";
  const isParentView = profile?.role === 'parent' && conversations.some(c => c.child);
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const rootConversations = conversations.filter(conv => !conv.folderId);

  return (
    <Sidebar 
      className="border-r-0"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        color: currentTheme.colors.text.primary,
        borderColor: currentTheme.colors.border
      }}
    >
      <SidebarHeader 
        className="p-4 border-b"
        style={{ borderColor: currentTheme.colors.border }}
      >
        {!isCollapsed && (
          <>
            <UserProfileSection isCollapsed={isCollapsed} />

            {!isParentView && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => onNewChat()}
                  className="flex-1 border"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New chat
                </Button>
                <CreateFolderDialog onCreateFolder={onCreateFolder} />
              </div>
            )}
          </>
        )}
        {isCollapsed && (
          <div className="space-y-2">
            <UserProfileSection isCollapsed={isCollapsed} />
            
            {!isParentView && (
              <>
                <Button
                  onClick={() => onNewChat()}
                  size="icon"
                  className="border"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <CreateFolderDialog onCreateFolder={onCreateFolder} isIconOnly />
              </>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel 
              className="px-2"
              style={{ color: currentTheme.colors.text.secondary }}
            >
              {isParentView ? "Children's Conversations" : "Conversations"}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className="h-full">
              <SidebarMenu className="px-2">
                {/* Folders - only show for non-parent view */}
                {!isParentView && folders.map((folder) => (
                  <FolderSection
                    key={folder.id}
                    folder={folder}
                    isExpanded={expandedFolders.has(folder.id)}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleFolder(folder.id)}
                    onNewChat={onNewChat}
                    onRename={onRenameFolder}
                    onDelete={onDeleteFolder}
                  >
                    <ConversationList
                      conversations={conversations.filter(conv => conv.folderId === folder.id)}
                      activeConversation={activeConversation}
                      isCollapsed={isCollapsed}
                      onSelectConversation={onSelectConversation}
                      onDeleteConversation={onDeleteConversation}
                      isInFolder
                    />
                  </FolderSection>
                ))}

                {/* Root conversations */}
                <ConversationList
                  conversations={rootConversations}
                  activeConversation={activeConversation}
                  isCollapsed={isCollapsed}
                  onSelectConversation={onSelectConversation}
                  onDeleteConversation={onDeleteConversation}
                  showChildNames={isParentView}
                />
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter 
        className="p-4 border-t"
        style={{ borderColor: currentTheme.colors.border }}
      >
        {!isCollapsed && (
          <div 
            className="text-xs"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            Created by ZenAI
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
