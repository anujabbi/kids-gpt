
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

export const useChildConversations = (childId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.role === 'parent' && childId) {
      loadChildConversations();
    } else {
      setConversations([]);
      setChild(null);
      setActiveConversation(null);
      setLoading(false);
    }
  }, [user, profile, childId]);

  const loadChildConversations = async () => {
    setLoading(true);
    try {
      const { conversations: allConversations, children } = 
        await conversationService.loadChildrenConversations();
      
      const targetChild = children.find(c => c.id === childId);
      const childConversations = allConversations.filter(conv => conv.userId === childId);
      
      setChild(targetChild || null);
      setConversations(childConversations);
      
      // Set first conversation as active if exists
      if (childConversations.length > 0 && !activeConversation) {
        setActiveConversation(childConversations[0].id);
      }
    } catch (error) {
      console.error('Failed to load child conversations:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load child's conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation);
  };

  return {
    conversations,
    child,
    activeConversation,
    loading,
    setActiveConversation,
    getCurrentConversation,
    refreshData: loadChildConversations,
  };
};
