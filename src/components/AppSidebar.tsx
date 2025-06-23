import { Plus, MessageSquare, Trash2 } from "lucide-react";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface AppSidebarProps {
  onNewChat: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function AppSidebar({
  onNewChat,
  conversations,
  activeConversation,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="bg-gray-900 text-white border-r-0">
      <SidebarHeader className="p-4 border-b border-gray-700">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">KidsGPT</h2>
            </div>
            <Button
              onClick={onNewChat}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New chat
            </Button>
          </>
        )}
        {isCollapsed && (
          <div className="space-y-2">
            <Button
              onClick={onNewChat}
              size="icon"
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-gray-400 px-2">
              Conversations
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className="h-full">
              <SidebarMenu className="px-2">
                {conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      isActive={activeConversation === conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`group w-full p-3 rounded-lg transition-colors ${
                        activeConversation === conversation.id
                          ? 'bg-gray-700'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      {!isCollapsed && (
                        <span className="flex-1 text-sm truncate text-left">
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
                        className="text-gray-400 hover:text-red-400"
                        showOnHover
                      >
                        <Trash2 className="h-3 w-3" />
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400">
            KidsGPT Clone by Lovable
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
