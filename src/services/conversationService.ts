
import { Conversation, Folder, Message } from '@/types/chat';

export class ConversationService {
  private readonly CONVERSATIONS_KEY = 'kidsgpt_conversations';
  private readonly FOLDERS_KEY = 'kidsgpt_folders';

  loadConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.CONVERSATIONS_KEY);
      if (stored) {
        const conversations = JSON.parse(stored);
        return conversations.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    return [];
  }

  loadFolders(): Folder[] {
    try {
      const stored = localStorage.getItem(this.FOLDERS_KEY);
      if (stored) {
        const folders = JSON.parse(stored);
        return folders.map((folder: any) => ({
          ...folder,
          timestamp: new Date(folder.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
    return [];
  }

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  saveFolders(folders: Folder[]): void {
    try {
      localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error('Failed to save folders:', error);
    }
  }

  createConversation(folderId?: string): Conversation {
    const id = Date.now().toString();
    return {
      id,
      title: "New conversation",
      timestamp: new Date(),
      messages: [],
      folderId,
    };
  }

  updateConversationTitle(conversation: Conversation, content: string): string {
    if (conversation.messages.length === 0) {
      return content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }
    return conversation.title;
  }

  createFolder(name: string): Folder {
    return {
      id: Date.now().toString(),
      name,
      timestamp: new Date(),
    };
  }
}

export const conversationService = new ConversationService();
