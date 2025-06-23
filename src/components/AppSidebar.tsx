
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
    <Sidebar className="bg-gray-900 text-white border-r-0">
      <SidebarHeader className="p-4 border-b border-gray-700">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">KidsGPT</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onNewChat()}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
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
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
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
            <SidebarGroupLabel className="text-gray-400 px-2">
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
                        className="group w-full p-3 rounded-lg transition-colors hover:bg-gray-800"
                      >
                        {expandedFolders.has(folder.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <Folder className="h-4 w-4 text-gray-400" />
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
                                className="h-6 text-sm bg-gray-700 border-gray-600"
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
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
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
                            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400 hover:bg-gray-700"
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
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
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
                                className={`group w-full p-2 rounded-lg transition-colors ${
                                  activeConversation === conversation.id
                                    ? 'bg-gray-700'
                                    : 'hover:bg-gray-800'
                                }`}
                              >
                                <MessageSquare className="h-3 w-3 text-gray-400" />
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
                                  className="text-gray-400 hover:text-red-400"
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
