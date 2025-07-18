import { supabase } from '@/integrations/supabase/client';
import { PersonalityProfile } from '@/types/chat';
import { openAIService } from '@/services/openAIService';

export class PersonalityService {
  async getPersonalityProfile(userId: string): Promise<PersonalityProfile | null> {
    try {
      const { data, error } = await supabase
        .from('personality_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load personality profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        interests: data.interests || [],
        favoriteColors: data.favorite_colors || [],
        hobbies: data.hobbies || [],
        learningStyle: data.learning_style || '',
        personalityTraits: (data.personality_traits as Record<string, any>) || {},
        quizSummary: data.quiz_summary || '',
        personalityDescription: data.personality_description || '',
        readingPreferences: data.reading_preferences || [],
        dreamJob: data.dream_job || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Failed to load personality profile:', error);
      return null;
    }
  }

  async savePersonalityProfile(profile: Partial<PersonalityProfile>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('personality_profiles')
        .upsert({
          user_id: user.id,
          interests: profile.interests,
          favorite_colors: profile.favoriteColors,
          hobbies: profile.hobbies,
          learning_style: profile.learningStyle,
          personality_traits: profile.personalityTraits,
          quiz_summary: profile.quizSummary,
          personality_description: profile.personalityDescription,
          reading_preferences: profile.readingPreferences,
          dream_job: profile.dreamJob,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Failed to save personality profile:', error);
      }
    } catch (error) {
      console.error('Failed to save personality profile:', error);
    }
  }

  async extractPersonalityWithAI(messages: any[]): Promise<Partial<PersonalityProfile>> {
    console.log('=== AI-POWERED PERSONALITY EXTRACTION ===');
    console.log('Using OpenAI to extract personality data from conversation...', {
      messageCount: messages.length,
      userMessages: messages.filter(msg => msg.role === 'user').length,
      assistantMessages: messages.filter(msg => msg.role === 'assistant').length
    });

    try {
      // Create the extraction prompt
      const extractionPrompt = `You are analyzing a conversation between an AI and a child taking a personality quiz. Extract personality information and return it as valid JSON.

REQUIRED JSON FORMAT:
{
  "interests": ["array of interests/topics the child is curious about"],
  "hobbies": ["array of activities they enjoy doing"],
  "learning_style": "how they prefer to learn (visual, hands-on, listening, etc.)",
  "personality_traits": {
    "extroverted": boolean,
    "introverted": boolean,
    "creative": boolean,
    "analytical": boolean,
    "adventurous": boolean,
    "caring": boolean,
    "curious": boolean,
    "energetic": boolean
  },
  "dream_job": "their future career aspiration",
  "reading_preferences": ["specific book series, authors, or genres they mentioned"],
  "personality_description": "a brief description of their personality based on their responses",
  "quiz_summary": "a summary of what you learned about this child"
}

EXTRACTION GUIDELINES:
- Extract from both direct answers AND conversational context
- Include specific titles, series names, or proper nouns when mentioned
- For reading preferences, look for specific book series (like "Dog Man", "Wings of Fire"), authors, or detailed genre preferences
- For dream jobs, look for any career aspirations, even if creative or unusual (like "rocketship pilot")
- Use child-friendly language in all extracted data
- If information is unclear, make reasonable interpretations based on context
- Set personality traits to true only if there's clear evidence in the conversation
- Include interests that show curiosity or excitement in their responses

CONVERSATION TO ANALYZE:

${messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}`;

      // Use the new structured extraction method
      const extractedData = await openAIService.extractStructuredData(extractionPrompt);

      console.log('=== EXTRACTED PERSONALITY DATA ===');
      console.log('Parsed data:', extractedData);

      // Validate and clean the extracted data
      const personalityProfile: Partial<PersonalityProfile> = {
        interests: Array.isArray(extractedData.interests) ? extractedData.interests.filter(Boolean) : [],
        hobbies: Array.isArray(extractedData.hobbies) ? extractedData.hobbies.filter(Boolean) : [],
        learningStyle: extractedData.learning_style || '',
        personalityTraits: extractedData.personality_traits || {},
        dreamJob: extractedData.dream_job || '',
        readingPreferences: Array.isArray(extractedData.reading_preferences) ? extractedData.reading_preferences.filter(Boolean) : [],
        personalityDescription: extractedData.personality_description || '',
        quizSummary: extractedData.quiz_summary || '',
      };

      console.log('Final cleaned personality profile:', personalityProfile);
      return personalityProfile;

    } catch (error) {
      console.error('AI extraction failed:', error);
      
      // Fallback to basic extraction if AI fails
      console.log('Falling back to basic extraction...');
      return this.basicFallbackExtraction(messages);
    }
  }

  private basicFallbackExtraction(messages: any[]): Partial<PersonalityProfile> {
    console.log('Using basic fallback extraction');
    
    // Simple fallback - just extract user responses and create basic profile
    const userResponses = messages.filter(msg => msg.role === 'user').map(msg => msg.content);
    const combinedText = userResponses.join(' ').toLowerCase();
    
    // Find the final AI summary
    const summaryMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => {
        const content = msg.content.toLowerCase();
        return content.includes('amazing and unique') || 
               content.includes('based on your answers') ||
               content.length > 200;
      });

    return {
      interests: [],
      hobbies: [],
      learningStyle: '',
      personalityTraits: {},
      dreamJob: '',
      readingPreferences: [],
      personalityDescription: combinedText.slice(0, 200),
      quizSummary: summaryMessage?.content || '',
    };
  }

  async extractAndSaveFromSequentialQuiz(messages: any[]): Promise<void> {
    console.log('=== STARTING AI-POWERED EXTRACTION ===');
    console.log('Processing quiz conversation with AI extraction...', {
      messageCount: messages.length
    });
    
    try {
      // Use AI to extract personality data
      const extractedData = await this.extractPersonalityWithAI(messages);
      
      console.log('=== SAVING EXTRACTED DATA ===');
      console.log('Data to save:', extractedData);
      
      // Save the extracted data
      await this.savePersonalityProfile(extractedData);
      
      console.log('Personality extraction and save completed successfully');
    } catch (error) {
      console.error('Failed to extract and save personality data:', error);
    }
  }

  async extractAndSaveFromQuizConversation(messages: any[]): Promise<void> {
    return this.extractAndSaveFromSequentialQuiz(messages);
  }

  async reprocessExistingQuiz(conversationId: string): Promise<void> {
    try {
      console.log('Reprocessing quiz conversation:', conversationId);
      
      // Fetch conversation messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch conversation messages:', error);
        return;
      }

      if (!messages || messages.length === 0) {
        console.log('No messages found for conversation');
        return;
      }

      console.log(`Found ${messages.length} messages, reprocessing...`);
      await this.extractAndSaveFromSequentialQuiz(messages);
      console.log('Quiz reprocessing complete');
    } catch (error) {
      console.error('Failed to reprocess quiz:', error);
    }
  }
}

export const personalityService = new PersonalityService();
