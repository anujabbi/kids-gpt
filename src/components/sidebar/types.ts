
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
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

export interface Folder {
  id: string;
  name: string;
  timestamp: Date;
}

export interface AppSidebarProps {
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
