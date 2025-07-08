
import { Message, PersonalityProfile } from '@/types/chat';
import { getSystemPrompt, getPersonalityQuizSystemPrompt } from '@/utils/systemPrompts';
import { homeworkDetectionService } from './homeworkDetectionService';
import { familyApiKeyService } from './familyApiKeyService';

class OpenAIService {
  private async getApiKey(): Promise<string | null> {
    try {
      const familyApiKey = await familyApiKeyService.getFamilyApiKey();
      if (familyApiKey) {
        return familyApiKey;
      }
    } catch (error) {
      console.error('Failed to get family API key:', error);
    }
    return null;
  }

  async generateResponse(
    messages: Message[], 
    conversationType: 'regular' | 'personality-quiz' = 'regular',
    personalityProfile?: PersonalityProfile | null
  ): Promise<{ response: string; homeworkScore?: number } | null> {
    const apiKey = await this.getApiKey();
    
    if (!apiKey) {
      console.error('No OpenAI API key available');
      return {
        response: "I'm sorry, but I need an OpenAI API key to help you. Please ask a parent to set up the API key in the settings."
      };
    }

    try {
      const lastMessage = messages[messages.length - 1];
      
      // Check for homework misuse
      const homeworkScore = await homeworkDetectionService.analyzeMessage(lastMessage.content);
      
      // Get appropriate system prompt
      let systemPrompt: string;
      if (conversationType === 'personality-quiz') {
        systemPrompt = getPersonalityQuizSystemPrompt();
      } else {
        systemPrompt = getSystemPrompt(undefined, personalityProfile);
      }

      // Prepare messages for OpenAI
      const openAIMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAIMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      return {
        response: aiResponse,
        homeworkScore: homeworkScore
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        response: "I'm sorry, I'm having trouble right now. Please try again in a moment."
      };
    }
  }
}

export const openAIService = new OpenAIService();
