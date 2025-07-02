
import { useState, useEffect } from 'react';
import { Conversation } from '@/types/chat';
import { conversationService } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChildProfile {
  id: string;
  full_name: string;
  profile_image_type: string;
  custom_profile_image_url?: string;
}

export const useParentConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.role === 'parent') {
      loadChildrenData();
    } else {
      setConversations([]);
      setChildren([]);
      setActiveConversation(null);
      setLoading(false);
    }
  }, [user, profile]);

  const loadChildrenData = async () => {
    setLoading(true);
    try {
      const { conversations: childConversations, children: childrenData } = 
        await conversationService.loadChildrenConversations();
      
      setConversations(childConversations);
      setChildren(childrenData);
    } catch (error) {
      console.error('Failed to load children data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your children's conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  const getChildForConversation = (conversation: Conversation) => {
    return children.find(child => child.id === (conversation as any).userId);
  };

  return {
    conversations,
    children,
    activeConversation,
    loading,
    setActiveConversation,
    getCurrentConversation,
    getChildForConversation,
    refreshData: loadChildrenData,
  };
};
