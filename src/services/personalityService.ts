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

  async extractAndSaveFromSequentialQuiz(messages: any[]): Promise<void> {
    console.log('Extracting personality data from sequential quiz conversation...');
    
    // Initialize data structures
    const interests: string[] = [];
    const hobbies: string[] = [];
    const readingPreferences: string[] = [];
    let personalityDescription = '';
    let dreamJob = '';
    let quizSummary = '';
    let learningStyle = '';

    // Find the final summary message from the assistant
    const summaryMessage = messages
      .filter(msg => msg.role === 'assistant')
      .reverse()
      .find(msg => {
        const content = msg.content.toLowerCase();
        return (
          content.includes('amazing and unique') ||
          content.includes('based on your answers') ||
          content.includes('here\'s what i learned about you') ||
          (content.includes('personality') && content.length > 200) ||
          (content.includes('you are someone who') && content.includes('based on') && content.length > 150)
        );
      });

    if (summaryMessage) {
      quizSummary = summaryMessage.content;
    }

    // Extract answers from user responses throughout the conversation
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    console.log(`Processing ${userMessages.length} user responses and ${assistantMessages.length} assistant messages`);

    // Analyze each user response in context of the assistant question that preceded it
    for (let i = 0; i < userMessages.length; i++) {
      const userResponse = userMessages[i].content.toLowerCase();
      
      // Find the assistant message that came before this user response
      const precedingAssistant = assistantMessages.find(msg => 
        new Date(msg.timestamp) < new Date(userMessages[i].timestamp)
      );
      
      if (precedingAssistant) {
        const questionContext = precedingAssistant.content.toLowerCase();
        
        // Question 1: Interests
        if (questionContext.includes('interested in') || questionContext.includes('spark your curiosity') || questionContext.includes('question 1')) {
          interests.push(...this.extractKeywords(userResponse, [
            'science', 'math', 'art', 'music', 'sports', 'reading', 'writing', 'animals', 'nature',
            'space', 'dinosaurs', 'cooking', 'drawing', 'painting', 'dancing', 'singing', 'games',
            'technology', 'computers', 'history', 'geography', 'languages', 'crafts', 'building',
            'robots', 'coding', 'movies', 'books', 'stories', 'adventure', 'mystery'
          ]));
        }
        
        // Question 2: Hobbies
        if (questionContext.includes('hobbies') || questionContext.includes('free time') || questionContext.includes('love to do')) {
          hobbies.push(...this.extractKeywords(userResponse, [
            'reading', 'drawing', 'painting', 'playing', 'soccer', 'basketball', 'swimming', 'dancing',
            'singing', 'music', 'cooking', 'baking', 'gardening', 'crafts', 'building', 'puzzles',
            'video games', 'board games', 'collecting', 'hiking', 'biking', 'skateboarding', 'running',
            'chess', 'lego', 'origami', 'photography', 'writing', 'journaling'
          ]));
        }
        
        // Question 3: Personality traits
        if (questionContext.includes('describe you') || questionContext.includes('kind of person') || questionContext.includes('personality')) {
          personalityDescription += (personalityDescription ? ' ' : '') + userResponse;
        }
        
        // Question 4: Reading preferences
        if (questionContext.includes('read about') || questionContext.includes('books') || questionContext.includes('stories')) {
          readingPreferences.push(...this.extractKeywords(userResponse, [
            'adventure', 'mystery', 'fantasy', 'science fiction', 'animals', 'nature', 'history',
            'biography', 'comic books', 'graphic novels', 'poetry', 'fairy tales', 'humor', 'sports',
            'science', 'art', 'music', 'cooking', 'travel', 'friendship', 'family', 'magic', 'dragons'
          ]));
        }
        
        // Question 5: Dream job
        if (questionContext.includes('dream job') || questionContext.includes('when you grow up') || questionContext.includes('want to be')) {
          if (!dreamJob) dreamJob = userResponse;
        }
        
        // Additional questions: Learning style
        if (questionContext.includes('learn') && (questionContext.includes('how') || questionContext.includes('way') || questionContext.includes('style'))) {
          learningStyle += (learningStyle ? ' ' : '') + userResponse;
        }
      }
    }

    // Clean up and deduplicate arrays
    const uniqueInterests = [...new Set(interests)];
    const uniqueHobbies = [...new Set(hobbies)];
    const uniqueReadingPrefs = [...new Set(readingPreferences)];

    console.log('Extracted personality data from sequential quiz:', {
      interests: uniqueInterests,
      hobbies: uniqueHobbies,
      personalityDescription: personalityDescription || 'Not provided',
      readingPreferences: uniqueReadingPrefs,
      dreamJob: dreamJob || 'Not provided',
      learningStyle: learningStyle || 'Not provided',
      quizSummary: quizSummary ? 'Found' : 'Not found'
    });

    await this.savePersonalityProfile({
      interests: uniqueInterests,
      hobbies: uniqueHobbies,
      personalityDescription: personalityDescription || '',
      readingPreferences: uniqueReadingPrefs,
      dreamJob: dreamJob || '',
      learningStyle: learningStyle || '',
      quizSummary,
    });
  }

  async extractAndSaveFromQuizConversation(messages: any[]): Promise<void> {
    return this.extractAndSaveFromSequentialQuiz(messages);
  }

  private extractKeywords(text: string, keywords: string[]): string[] {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => lowerText.includes(keyword));
  }
}

export const personalityService = new PersonalityService();
