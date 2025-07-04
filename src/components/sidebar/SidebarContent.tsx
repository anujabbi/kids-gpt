
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarContent as SidebarContentBase,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { FolderSection } from "./FolderSection";
import { ConversationList } from "./ConversationList";
import { Conversation, Folder } from "./types";

interface SidebarContentProps {
  conversations: Conversation[];
  folders: Folder[];
  activeConversation: string | null;
  isCollapsed: boolean;
  isParentView: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: (folderId?: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function SidebarContent({
  conversations,
  folders,
  activeConversation,
  isCollapsed,
  isParentView,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onRenameFolder,
  onDeleteFolder,
}: SidebarContentProps) {
  const { currentTheme } = useTheme();
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
    <SidebarContentBase>
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
    </SidebarContentBase>
  );
}
