
import { useState } from 'react';
import { openAIService } from '@/services/openAIService';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { personalityService } from '@/services/personalityService';

export const useOpenAI = () => {
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  const generateResponse = async (
    messages: Message[], 
    conversationType?: 'regular' | 'personality-quiz'
  ) => {
    if (!messages.length) return null;

    setIsTyping(true);
    
    try {
      // Fetch personality profile if user exists and it's not a personality quiz
      let personalityProfile = null;
      if (user && conversationType !== 'personality-quiz') {
        personalityProfile = await personalityService.getPersonalityProfile(user.id);
      }

      const result = await openAIService.generateResponse(
        messages, 
        conversationType,
        personalityProfile
      );
      
      return result;
    } catch (error) {
      console.error('Failed to generate response:', error);
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
