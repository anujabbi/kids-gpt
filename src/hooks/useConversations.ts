
import { useState, useEffect } from 'react';
import { Conversation, Folder, Message } from '@/types/chat';
import { conversationService } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear data when user logs out
      setConversations([]);
      setFolders([]);
      setActiveConversation(null);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conversationsData, foldersData] = await Promise.all([
        conversationService.loadConversations(),
        conversationService.loadFolders()
      ]);
      
      setConversations(conversationsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  const createNewConversation = async (folderId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create conversations.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newConv = await conversationService.createConversation(folderId);
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv.id);
      return newConv;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Error creating conversation",
        description: "Failed to create a new conversation. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const addMessageToConversation = async (conversationId: string, message: Message) => {
    try {
      // Save message to database
      await conversationService.saveMessage(conversationId, message);
      
      // Update local state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = { 
            ...conv, 
            messages: [...conv.messages, message],
            title: conversationService.updateConversationTitle(conv, message.content)
          };
          
          // Save updated conversation title to database
          conversationService.saveConversation(updatedConv);
          
          return updatedConv;
        }
        return conv;
      }));
    } catch (error) {
      console.error('Failed to add message:', error);
      toast({
        title: "Error saving message",
        description: "Failed to save your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await conversationService.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (activeConversation === id) {
        setActiveConversation(null);
      }
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast({
        title: "Error deleting conversation",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createFolder = async (name: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create folders.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newFolder = await conversationService.createFolder(name);
      setFolders(prev => [newFolder, ...prev]);
      toast({
        title: "Folder created",
        description: `Folder "${name}" has been created.`,
      });
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast({
        title: "Error creating folder",
        description: "Failed to create the folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await conversationService.deleteFolder(folderId);
      
      // Update local state - move conversations out of folder
      setConversations(prev => prev.map(conv => 
        conv.folderId === folderId 
          ? { ...conv, folderId: undefined }
          : conv
      ));
      
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast({
        title: "Folder deleted",
        description: "The folder has been removed and conversations moved to root.",
      });
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast({
        title: "Error deleting folder",
        description: "Failed to delete the folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      await conversationService.renameFolder(folderId, newName);
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName }
          : folder
      ));
      toast({
        title: "Folder renamed",
        description: `Folder has been renamed to "${newName}".`,
      });
    } catch (error) {
      console.error('Failed to rename folder:', error);
      toast({
        title: "Error renaming folder",
        description: "Failed to rename the folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    conversations,
    folders,
    activeConversation,
    loading,
    setActiveConversation,
    getCurrentConversation,
    createNewConversation,
    addMessageToConversation,
    deleteConversation,
    createFolder,
    deleteFolder,
    renameFolder,
  };
};
