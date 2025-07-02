import { Conversation, Folder, Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

export class ConversationService {
  async loadConversations(): Promise<Conversation[]> {
    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          folder_id,
          messages (
            id,
            content,
            role,
            created_at,
            attachments,
            generated_image,
            homework_misuse_score
          )
        `)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Failed to load conversations:', conversationsError);
        return [];
      }

      return conversationsData?.map((conv: any) => ({
        id: conv.id,
        title: conv.title,
        timestamp: new Date(conv.created_at),
        folderId: conv.folder_id,
        messages: conv.messages?.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
          attachments: msg.attachments,
          generatedImage: msg.generated_image,
          homeworkMisuseScore: msg.homework_misuse_score,
        })) || []
      })) || [];
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  async loadFolders(): Promise<Folder[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load folders:', error);
        return [];
      }

      return data?.map((folder: any) => ({
        id: folder.id,
        name: folder.name,
        timestamp: new Date(folder.created_at)
      })) || [];
    } catch (error) {
      console.error('Failed to load folders:', error);
      return [];
    }
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          title: conversation.title,
          folder_id: conversation.folderId,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to save conversation:', error);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: message.content,
          role: message.role,
          attachments: message.attachments || null,
          generated_image: message.generatedImage || null,
          homework_misuse_score: message.homeworkMisuseScore || null,
        });

      if (error) {
        console.error('Failed to save message:', error);
      }

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }

  async createConversation(folderId?: string): Promise<Conversation> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return this.createLocalConversation(folderId);
      }

      const newConversation = {
        title: "New conversation",
        folder_id: folderId,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert(newConversation)
        .select()
        .single();

      if (error) {
        console.error('Failed to create conversation:', error);
        // Fallback to local creation
        return this.createLocalConversation(folderId);
      }

      return {
        id: data.id,
        title: data.title,
        timestamp: new Date(data.created_at),
        messages: [],
        folderId: data.folder_id,
      };
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return this.createLocalConversation(folderId);
    }
  }

  private createLocalConversation(folderId?: string): Conversation {
    const id = Date.now().toString();
    return {
      id,
      title: "New conversation",
      timestamp: new Date(),
      messages: [],
      folderId,
    };
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete conversation:', error);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  updateConversationTitle(conversation: Conversation, content: string): string {
    if (conversation.messages.length === 0) {
      return content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }
    return conversation.title;
  }

  async createFolder(name: string): Promise<Folder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          id: Date.now().toString(),
          name,
          timestamp: new Date(),
        };
      }

      const { data, error } = await supabase
        .from('conversation_folders')
        .insert({ 
          name,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create folder:', error);
        // Fallback to local creation
        return {
          id: Date.now().toString(),
          name,
          timestamp: new Date(),
        };
      }

      return {
        id: data.id,
        name: data.name,
        timestamp: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Failed to create folder:', error);
      return {
        id: Date.now().toString(),
        name,
        timestamp: new Date(),
      };
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    try {
      // First, move conversations out of the folder
      await supabase
        .from('conversations')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      // Then delete the folder
      const { error } = await supabase
        .from('conversation_folders')
        .delete()
        .eq('id', folderId);

      if (error) {
        console.error('Failed to delete folder:', error);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_folders')
        .update({ name: newName })
        .eq('id', folderId);

      if (error) {
        console.error('Failed to rename folder:', error);
      }
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  }
}

export const conversationService = new ConversationService();
