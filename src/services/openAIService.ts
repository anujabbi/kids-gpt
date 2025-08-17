import { Message, PersonalityProfile } from '@/types/chat';
import { getSystemPrompt, getPersonalityQuizSystemPrompt } from '@/utils/systemPrompts';
import { analyzeHomeworkMisuse } from './homeworkDetectionService';
import { familyApiKeyService } from './familyApiKeyService';
import { supabase } from '@/integrations/supabase/client';

class OpenAIService {
  private async getApiKey(): Promise<string | null> {
    try {
      // Get current user's family_id from their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.family_id) {
          const familyApiKey = await familyApiKeyService.getFamilyApiKey(profile.family_id);
          if (familyApiKey) {
            return familyApiKey;
          }
        }
      }
    } catch (error) {
      console.error('Failed to get family API key:', error);
    }
    
    // Fallback to localStorage API key if family key not available
    const localApiKey = localStorage.getItem('openai_api_key');
    return localApiKey;
  }

  async extractStructuredData(prompt: string): Promise<any | null> {
    const apiKey = await this.getApiKey();
    
    if (!apiKey) {
      console.error('No OpenAI API key available for structured data extraction');
      throw new Error('No OpenAI API key available');
    }

    try {
      console.log('Making structured data extraction request to OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { 
              role: 'system', 
              content: 'You are a data extraction assistant. You must respond only with valid JSON data according to the requested format. Do not include any explanatory text, markdown formatting, or anything other than the raw JSON object.'
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          max_completion_tokens: 2000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(`OpenAI rate limit exceeded. Please wait a moment and try again.`);
        }
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const extractedContent = data.choices[0]?.message?.content;
      
      if (!extractedContent) {
        throw new Error('No content received from OpenAI');
      }

      console.log('Raw OpenAI extraction response:', extractedContent);

      // Parse the JSON response
      try {
        const parsedData = JSON.parse(extractedContent);
        console.log('Successfully parsed structured data:', parsedData);
        return parsedData;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        console.error('Response content was:', extractedContent);
        throw new Error(`OpenAI response was not valid JSON: ${parseError.message}`);
      }

    } catch (error) {
      console.error('Structured data extraction failed:', error);
      throw error;
    }
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
      
      // Get user age from localStorage if available
      const userAge = localStorage.getItem('user_age') ? parseInt(localStorage.getItem('user_age')!) : undefined;
      
      // Get appropriate system prompt
      let systemPrompt: string;
      if (conversationType === 'personality-quiz') {
        // For sequential quiz, we can try to determine question number from context
        const quizQuestionNumber = this.estimateQuizProgress(messages);
        systemPrompt = getPersonalityQuizSystemPrompt(undefined, quizQuestionNumber, 10);
      } else {
        systemPrompt = getSystemPrompt(userAge, undefined, personalityProfile);
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
          model: 'gpt-5-mini-2025-08-07',
          messages: openAIMessages,
          max_completion_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(`OpenAI rate limit exceeded. Please wait a moment and try again.`);
        } else if (response.status === 401) {
          throw new Error(`OpenAI API key is invalid. Please check your API key settings.`);
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      // Check for homework misuse after getting the AI response
      let homeworkScore: number | undefined;
      if (conversationType === 'regular') {
        homeworkScore = await analyzeHomeworkMisuse(lastMessage.content, aiResponse);
      }

      return {
        response: aiResponse,
        homeworkScore: homeworkScore
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      const errorMessage = error instanceof Error ? error.message : "I'm having trouble right now. Please try again in a moment.";
      return {
        response: `I'm sorry, ${errorMessage}`
      };
    }
  }

  private estimateQuizProgress(messages: Message[]): number {
    // Count user responses to estimate which question we're on
    const userResponses = messages.filter(msg => msg.role === 'user').length;
    return Math.min(userResponses + 1, 10); // Cap at 10 questions
  }
}

export const openAIService = new OpenAIService();
