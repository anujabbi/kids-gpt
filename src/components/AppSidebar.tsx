import { Plus, MessageSquare, Trash2, Folder, FolderPlus, Edit2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState } from "react";
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
  const isCollapsed = state === "collapsed";
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (editingFolderName.trim()) {
      onRenameFolder(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const startRenaming = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
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
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-lg font-semibold"
                style={{ color: currentTheme.colors.text.primary }}
              >
                KidsGPT
              </h2>
            </div>
            <div className="flex gap-2">
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
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="border"
                    style={{
                      backgroundColor: currentTheme.colors.secondary,
                      color: currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border
                    }}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new folder to organize your conversations.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      }
                    }}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>Create Folder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="space-y-2">
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
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="border"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border
                  }}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new folder to organize your conversations.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder();
                    }
                  }}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              Conversations
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className="h-full">
              <SidebarMenu className="px-2">
                {/* Folders */}
                {folders.map((folder) => (
                  <div key={folder.id} className="mb-2">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => toggleFolder(folder.id)}
                        className="group w-full p-3 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: currentTheme.colors.text.primary
                        }}
                      >
                        {expandedFolders.has(folder.id) ? (
                          <ChevronDown 
                            className="h-4 w-4" 
                            style={{ color: currentTheme.colors.text.secondary }}
                          />
                        ) : (
                          <ChevronRight 
                            className="h-4 w-4" 
                            style={{ color: currentTheme.colors.text.secondary }}
                          />
                        )}
                        <Folder 
                          className="h-4 w-4" 
                          style={{ color: currentTheme.colors.text.secondary }}
                        />
                        {!isCollapsed && (
                          <span className="flex-1 text-sm truncate text-left">
                            {editingFolderId === folder.id ? (
                              <Input
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                onBlur={() => handleRenameFolder(folder.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRenameFolder(folder.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingFolderId(null);
                                    setEditingFolderName("");
                                  }
                                }}
                                className="h-6 text-sm"
                                style={{
                                  backgroundColor: currentTheme.colors.background,
                                  borderColor: currentTheme.colors.border,
                                  color: currentTheme.colors.text.primary
                                }}
                                autoFocus
                              />
                            ) : (
                              folder.name
                            )}
                          </span>
                        )}
                      </SidebarMenuButton>
                      {!isCollapsed && (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => onNewChat(folder.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-opacity-20"
                            style={{ 
                              color: currentTheme.colors.text.secondary,
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenaming(folder);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-opacity-20"
                            style={{ 
                              color: currentTheme.colors.text.secondary,
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFolder(folder.id);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-opacity-20"
                            style={{ 
                              color: currentTheme.colors.text.secondary,
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </SidebarMenuItem>
                    
                    {/* Conversations in folder */}
                    {expandedFolders.has(folder.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {conversations
                          .filter(conv => conv.folderId === folder.id)
                          .map((conversation) => (
                            <SidebarMenuItem key={conversation.id}>
                              <SidebarMenuButton
                                isActive={activeConversation === conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className="group w-full p-2 rounded-lg transition-colors"
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
                                  className="h-3 w-3" 
                                  style={{ color: currentTheme.colors.text.secondary }}
                                />
                                {!isCollapsed && (
                                  <span className="flex-1 text-xs truncate text-left">
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
                      </div>
                    )}
                  </div>
                ))}

                {/* Root conversations (not in folders) */}
                {rootConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      isActive={activeConversation === conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className="group w-full p-3 rounded-lg transition-colors"
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
                        className="h-4 w-4" 
                        style={{ color: currentTheme.colors.text.secondary }}
                      />
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
