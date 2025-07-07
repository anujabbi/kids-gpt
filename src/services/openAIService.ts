
import { Message } from '@/types/chat';
import { getSystemPrompt, getPersonalityQuizSystemPrompt } from '@/utils/systemPrompts';
import { supabase } from '@/integrations/supabase/client';

export interface OpenAIResponse {
  response: string;
  homeworkScore?: number;
}

class OpenAIService {
  private async getFamilyApiKey(familyId?: string): Promise<string | null> {
    if (!familyId) return null;
    
    try {
      const { data, error } = await supabase
        .from('families')
        .select('openai_api_key')
        .eq('id', familyId)
        .single();

      if (error || !data?.openai_api_key) {
        console.log('No family API key found, falling back to default');
        return null;
      }

      return data.openai_api_key;
    } catch (error) {
      console.error('Failed to fetch family API key:', error);
      return null;
    }
  }

  async generateResponse(
    messages: Message[], 
    familyId?: string, 
    conversationType: 'regular' | 'personality-quiz' = 'regular'
  ): Promise<OpenAIResponse> {
    try {
      // Get API key (family key takes precedence)
      const familyApiKey = await this.getFamilyApiKey(familyId);
      const apiKey = familyApiKey || import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please set up your API key in family settings.');
      }

      // Get user profile for personalized system prompt
      const { data: { user } } = await supabase.auth.getUser();
      let userName = '';
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        userName = profile?.full_name || '';
      }

      // Choose system prompt based on conversation type
      const systemPrompt = conversationType === 'personality-quiz' 
        ? getPersonalityQuizSystemPrompt(userName)
        : getSystemPrompt(userName);

      // Convert messages to OpenAI format
      const openAIMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
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
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      // Only check for homework in regular conversations
      let homeworkScore;
      if (conversationType === 'regular') {
        // Simple homework detection placeholder - can be enhanced later
        const homeworkKeywords = ['homework', 'assignment', 'test', 'exam', 'quiz'];
        const hasHomeworkKeywords = homeworkKeywords.some(keyword => 
          messages[messages.length - 1]?.content.toLowerCase().includes(keyword)
        );
        homeworkScore = hasHomeworkKeywords ? 0.8 : 0.1;
      }

      return {
        response: assistantResponse,
        homeworkScore,
      };
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();
