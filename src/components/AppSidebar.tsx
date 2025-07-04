
import {
  Sidebar,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarContent } from "./sidebar/SidebarContent";
import { AppSidebarProps } from "./sidebar/types";

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
        isCollapsed={isCollapsed}
        isParentView={isParentView}
        onNewChat={onNewChat}
        onCreateFolder={onCreateFolder}
      />

      <SidebarContent
        conversations={conversations}
        folders={folders}
        activeConversation={activeConversation}
        isCollapsed={isCollapsed}
        isParentView={isParentView}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
        onNewChat={onNewChat}
        onRenameFolder={onRenameFolder}
        onDeleteFolder={onDeleteFolder}
      />

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
