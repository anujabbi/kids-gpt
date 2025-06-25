
import { useState, useEffect } from 'react';
import { Conversation, Folder, Message } from '@/types/chat';
import { conversationService } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    setConversations(conversationService.loadConversations());
    setFolders(conversationService.loadFolders());
  }, []);

  // Save conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      conversationService.saveConversations(conversations);
    }
  }, [conversations]);

  // Save folders when they change
  useEffect(() => {
    if (folders.length > 0) {
      conversationService.saveFolders(folders);
    }
  }, [folders]);

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  const createNewConversation = (folderId?: string) => {
    const newConv = conversationService.createConversation(folderId);
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    return newConv;
  };

  const addMessageToConversation = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, message],
            title: conversationService.updateConversationTitle(conv, message.content)
          }
        : conv
    ));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed.",
    });
  };

  const createFolder = (name: string) => {
    const newFolder = conversationService.createFolder(name);
    setFolders(prev => [newFolder, ...prev]);
    toast({
      title: "Folder created",
      description: `Folder "${name}" has been created.`,
    });
  };

  const deleteFolder = (folderId: string) => {
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
  };

  const renameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, name: newName }
        : folder
    ));
    toast({
      title: "Folder renamed",
      description: `Folder has been renamed to "${newName}".`,
    });
  };

  return {
    conversations,
    folders,
    activeConversation,
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
