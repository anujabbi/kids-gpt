
import { useState, useEffect } from 'react';
import { conversationService } from '@/services/conversationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChildSummary {
  id: string;
  full_name: string;
  profile_image_type: string;
  custom_profile_image_url?: string;
  conversationCount: number;
  lastInteraction: Date | null;
}

export const useChildSummary = () => {
  const [childSummaries, setChildSummaries] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.role === 'parent') {
      loadChildSummaries();
    } else {
      setChildSummaries([]);
      setLoading(false);
    }
  }, [user, profile]);

  const loadChildSummaries = async () => {
    setLoading(true);
    try {
      const { conversations, children } = await conversationService.loadChildrenConversations();
      
      const summaries: ChildSummary[] = children.map(child => {
        const childConversations = conversations.filter(conv => conv.userId === child.id);
        const lastInteraction = childConversations.length > 0 
          ? new Date(Math.max(...childConversations.map(conv => 
              Math.max(...conv.messages.map(msg => msg.timestamp.getTime()))
            )))
          : null;

        return {
          id: child.id,
          full_name: child.full_name,
          profile_image_type: child.profile_image_type,
          custom_profile_image_url: child.custom_profile_image_url,
          conversationCount: childConversations.length,
          lastInteraction
        };
      });

      setChildSummaries(summaries);
    } catch (error) {
      console.error('Failed to load child summaries:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load children's summary data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    childSummaries,
    loading,
    refreshData: loadChildSummaries,
  };
};
