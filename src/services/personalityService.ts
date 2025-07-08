
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
        });

      if (error) {
        console.error('Failed to save personality profile:', error);
      }
    } catch (error) {
      console.error('Failed to save personality profile:', error);
    }
  }

  async extractAndSaveFromQuizConversation(messages: any[]): Promise<void> {
    console.log('Extracting personality data from quiz conversation...');
    
    // Initialize data structures
    const interests: string[] = [];
    const hobbies: string[] = [];
    const readingPreferences: string[] = [];
    let personalityDescription = '';
    let dreamJob = '';
    let quizSummary = '';

    // Find the final summary message from the assistant
    const summaryMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => 
        msg.content.toLowerCase().includes('amazing and unique') ||
        msg.content.toLowerCase().includes('based on your answers') ||
        (msg.content.toLowerCase().includes('personality') && msg.content.length > 200)
      );

    if (summaryMessage) {
      quizSummary = summaryMessage.content;
    }

    // Extract answers to the 5 specific questions by analyzing user responses
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    // Question 1: Interests - look for responses after "interested in" or "spark your curiosity"
    const interestsAnswer = this.findAnswerAfterQuestion(messages, ['interested in', 'spark your curiosity', 'excited to learn']);
    if (interestsAnswer) {
      interests.push(...this.extractKeywords(interestsAnswer, [
        'science', 'math', 'art', 'music', 'sports', 'reading', 'writing', 'animals', 'nature',
        'space', 'dinosaurs', 'cooking', 'drawing', 'painting', 'dancing', 'singing', 'games',
        'technology', 'computers', 'history', 'geography', 'languages', 'crafts', 'building'
      ]));
    }

    // Question 2: Hobbies - look for responses after "hobbies" or "free time"
    const hobbiesAnswer = this.findAnswerAfterQuestion(messages, ['hobbies', 'free time', 'love to do']);
    if (hobbiesAnswer) {
      hobbies.push(...this.extractKeywords(hobbiesAnswer, [
        'reading', 'drawing', 'painting', 'playing', 'soccer', 'basketball', 'swimming', 'dancing',
        'singing', 'music', 'cooking', 'baking', 'gardening', 'crafts', 'building', 'puzzles',
        'video games', 'board games', 'collecting', 'hiking', 'biking', 'skateboarding'
      ]));
    }

    // Question 3: Personality description - look for responses after "describe you" or "kind of person"
    const personalityAnswer = this.findAnswerAfterQuestion(messages, ['describe you', 'kind of person', 'what are you like']);
    if (personalityAnswer) {
      personalityDescription = personalityAnswer;
    }

    // Question 4: Reading preferences - look for responses after "read about" or "books"
    const readingAnswer = this.findAnswerAfterQuestion(messages, ['read about', 'types of books', 'stories']);
    if (readingAnswer) {
      readingPreferences.push(...this.extractKeywords(readingAnswer, [
        'adventure', 'mystery', 'fantasy', 'science fiction', 'animals', 'nature', 'history',
        'biography', 'comic books', 'graphic novels', 'poetry', 'fairy tales', 'humor', 'sports',
        'science', 'art', 'music', 'cooking', 'travel', 'friendship', 'family'
      ]));
    }

    // Question 5: Dream job - look for responses after "dream job" or "when you grow up"
    const dreamJobAnswer = this.findAnswerAfterQuestion(messages, ['dream job', 'when you grow up', 'want to be']);
    if (dreamJobAnswer) {
      dreamJob = dreamJobAnswer;
    }

    console.log('Extracted personality data:', {
      interests,
      hobbies,
      personalityDescription,
      readingPreferences,
      dreamJob,
      quizSummary: quizSummary ? 'Found' : 'Not found'
    });

    await this.savePersonalityProfile({
      interests,
      hobbies,
      personalityDescription,
      readingPreferences,
      dreamJob,
      quizSummary,
    });
  }

  private findAnswerAfterQuestion(messages: any[], questionKeywords: string[]): string {
    for (let i = 0; i < messages.length - 1; i++) {
      const currentMessage = messages[i];
      const nextMessage = messages[i + 1];
      
      if (currentMessage.role === 'assistant' && nextMessage.role === 'user') {
        const questionText = currentMessage.content.toLowerCase();
        const hasKeyword = questionKeywords.some(keyword => questionText.includes(keyword));
        
        if (hasKeyword) {
          return nextMessage.content;
        }
      }
    }
    return '';
  }

  private extractKeywords(text: string, keywords: string[]): string[] {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => lowerText.includes(keyword));
  }
}

export const personalityService = new PersonalityService();
