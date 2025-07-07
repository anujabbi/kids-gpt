
import { supabase } from '@/integrations/supabase/client';
import { PersonalityProfile } from '@/types/chat';

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
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to save personality profile:', error);
      }
    } catch (error) {
      console.error('Failed to save personality profile:', error);
    }
  }

  async extractAndSaveFromQuizConversation(messages: any[]): Promise<void> {
    // Extract personality data from quiz conversation messages
    const interests: string[] = [];
    const favoriteColors: string[] = [];
    const hobbies: string[] = [];
    let learningStyle = '';
    const personalityTraits: Record<string, any> = {};
    let quizSummary = '';

    // Find the final summary message from the assistant
    const summaryMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => msg.content.toLowerCase().includes('personality') || 
                   msg.content.toLowerCase().includes('summary') ||
                   msg.content.toLowerCase().includes('amazing and unique'));

    if (summaryMessage) {
      quizSummary = summaryMessage.content;
    }

    // Simple extraction logic - in a real app, you might use more sophisticated NLP
    messages.forEach(msg => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        
        // Extract colors
        const colorWords = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'black', 'white', 'rainbow'];
        colorWords.forEach(color => {
          if (content.includes(color) && !favoriteColors.includes(color)) {
            favoriteColors.push(color);
          }
        });

        // Extract common interests/hobbies
        const interestWords = ['reading', 'drawing', 'painting', 'soccer', 'basketball', 'swimming', 'dancing', 'singing', 'music', 'art', 'science', 'math', 'games', 'video games', 'pets', 'animals'];
        interestWords.forEach(interest => {
          if (content.includes(interest) && !interests.includes(interest)) {
            interests.push(interest);
          }
        });
      }
    });

    await this.savePersonalityProfile({
      interests,
      favoriteColors,
      hobbies,
      learningStyle,
      personalityTraits,
      quizSummary,
    });
  }
}

export const personalityService = new PersonalityService();
