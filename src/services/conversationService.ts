import { supabase } from '@/integrations/supabase/client';
import { Conversation, Folder, Message } from '@/types/chat';

export class ConversationService {
  async loadConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }

    return data.map(conv => ({
      id: conv.id,
      title: conv.title,
      messages: conv.messages?.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        attachments: msg.attachments as any,
        generatedImage: msg.generated_image as any,
        homeworkMisuseScore: msg.homework_misuse_score,
      })) || [],
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
      userId: conv.user_id,
      folderId: conv.folder_id || undefined,
      type: (conv.type as 'regular' | 'personality-quiz') || 'regular',
      timestamp: new Date(conv.created_at),
    }));
  }

  async loadChildrenConversations(): Promise<{ conversations: Conversation[], children: Array<{ id: string, full_name: string, profile_image_type: string, custom_profile_image_url?: string }> }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { conversations: [], children: [] };

    // First get the current user's profile to check if they're a parent
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, family_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'parent') {
      return { conversations: [], children: [] };
    }

    // Get all children in the family
    const { data: children, error: childrenError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_image_type, custom_profile_image_url')
      .eq('family_id', profile.family_id)
      .eq('role', 'child');

    if (childrenError) {
      console.error('Failed to load children:', childrenError);
      return { conversations: [], children: [] };
    }

    if (!children || children.length === 0) {
      return { conversations: [], children: children || [] };
    }

    // Get all conversations for these children
    const childIds = children.map(child => child.id);
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (*)
      `)
      .in('user_id', childIds)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      console.error('Failed to load children conversations:', conversationsError);
      return { conversations: [], children: children || [] };
    }

    const conversations = (conversationsData || []).map(conv => ({
      id: conv.id,
      title: conv.title,
      messages: conv.messages?.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        attachments: msg.attachments as any,
        generatedImage: msg.generated_image as any,
        homeworkMisuseScore: msg.homework_misuse_score,
      })) || [],
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
      userId: conv.user_id,
      folderId: conv.folder_id || undefined,
      type: (conv.type as 'regular' | 'personality-quiz') || 'regular',
      timestamp: new Date(conv.created_at),
    }));

    return { 
      conversations, 
      children: children || [] 
    };
  }

  async loadFolders(): Promise<Folder[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversation_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load folders:', error);
      return [];
    }

    return data.map(folder => ({
      id: folder.id,
      name: folder.name,
      timestamp: new Date(folder.created_at),
    }));
  }

  async createConversation(folderId?: string, type: 'regular' | 'personality-quiz' = 'regular'): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const title = type === 'personality-quiz' ? 'Personality Quiz' : 'New Chat';

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title,
        folder_id: folderId,
        type,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }

    return {
      id: data.id,
      title: data.title,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      userId: data.user_id,
      folderId: data.folder_id || undefined,
      type: (data.type as 'regular' | 'personality-quiz') || 'regular',
      timestamp: new Date(data.created_at),
    };
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({
        title: conversation.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    if (error) {
      console.error('Failed to save conversation:', error);
      throw error;
    }
  }

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: message.content,
        role: message.role,
        attachments: message.attachments as any,
        generated_image: message.generatedImage as any,
        homework_misuse_score: message.homeworkMisuseScore,
      });

    if (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    // First delete all messages
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', id);

    if (messagesError) {
      console.error('Failed to delete messages:', messagesError);
      throw messagesError;
    }

    // Then delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  async createFolder(name: string): Promise<Folder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversation_folders')
      .insert({
        user_id: user.id,
        name,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      timestamp: new Date(data.created_at),
    };
  }

  async deleteFolder(folderId: string): Promise<void> {
    // First, move all conversations out of the folder
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ folder_id: null })
      .eq('folder_id', folderId);

    if (updateError) {
      console.error('Failed to update conversations:', updateError);
      throw updateError;
    }

    // Then delete the folder
    const { error } = await supabase
      .from('conversation_folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_folders')
      .update({ name: newName })
      .eq('id', folderId);

    if (error) {
      console.error('Failed to rename folder:', error);
      throw error;
    }
  }

  updateConversationTitle(conversation: Conversation, newMessageContent: string): string {
    if (conversation.messages.length === 0) {
      // First message, use it to create a title
      return newMessageContent.slice(0, 50) + (newMessageContent.length > 50 ? '...' : '');
    }
    return conversation.title;
  }
}

export const conversationService = new ConversationService();
