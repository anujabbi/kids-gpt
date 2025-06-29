
import { useState } from 'react';
import { Message } from '@/types/chat';
import { openAIService, OpenAIResponse } from '@/services/openAIService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useOpenAI = () => {
  const [isTyping, setIsTyping] = useState(false);
  const { profile } = useAuth();

  const generateResponse = async (messages: Message[]): Promise<OpenAIResponse | null> => {
    setIsTyping(true);
    
    try {
      const result = await openAIService.generateResponse(messages, profile?.family_id || undefined);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsTyping(false);
    }
  };

  return {
    generateResponse,
    isTyping,
  };
};
