
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

  async extractAndSaveFromSequentialQuiz(messages: any[]): Promise<void> {
    console.log('=== ENHANCED PERSONALITY EXTRACTION ===');
    console.log('Extracting personality data from sequential quiz conversation...', {
      messageCount: messages.length,
      userMessages: messages.filter(msg => msg.role === 'user').length,
      assistantMessages: messages.filter(msg => msg.role === 'assistant').length
    });
    
    // Initialize data structures
    const interests: string[] = [];
    const hobbies: string[] = [];
    const readingPreferences: string[] = [];
    let personalityDescription = '';
    let dreamJob = '';
    let quizSummary = '';
    let learningStyle = '';
    const personalityTraits: Record<string, any> = {};

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

    console.log('Found summary message:', !!summaryMessage);

    if (summaryMessage) {
      quizSummary = summaryMessage.content;
      // Extract additional data from the summary
      this.extractFromSummary(summaryMessage.content, {
        interests, hobbies, readingPreferences, personalityTraits, learningStyle, dreamJob
      });
    }

    // Process user responses with enhanced extraction
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    
    console.log(`Processing ${userMessages.length} user responses and ${assistantMessages.length} assistant messages`);

    // Enhanced question-by-question analysis
    for (let i = 0; i < userMessages.length; i++) {
      const userResponse = userMessages[i].content;
      const questionNumber = i + 1;
      
      console.log(`Processing Question ${questionNumber}: "${userResponse}"`);
      
      // Find the assistant question that preceded this response
      const precedingAssistant = this.findPrecedingQuestion(userMessages[i], assistantMessages);
      
      if (precedingAssistant) {
        const questionContext = precedingAssistant.content.toLowerCase();
        this.extractByQuestionPattern(questionNumber, questionContext, userResponse, {
          interests, hobbies, readingPreferences, personalityDescription, dreamJob, learningStyle, personalityTraits
        });
      } else {
        // Fallback: extract by question number or content pattern
        this.extractByFallbackPattern(questionNumber, userResponse, {
          interests, hobbies, readingPreferences, personalityDescription, dreamJob, learningStyle, personalityTraits
        });
      }
    }

    // Clean up and deduplicate arrays
    const uniqueInterests = [...new Set(interests.filter(Boolean))];
    const uniqueHobbies = [...new Set(hobbies.filter(Boolean))];
    const uniqueReadingPrefs = [...new Set(readingPreferences.filter(Boolean))];

    // Enhance personality description if needed
    if (!personalityDescription && Object.keys(personalityTraits).length > 0) {
      personalityDescription = this.generatePersonalityDescription(personalityTraits);
    }

    const extractedData = {
      interests: uniqueInterests,
      hobbies: uniqueHobbies,
      personalityDescription: personalityDescription || '',
      readingPreferences: uniqueReadingPrefs,
      dreamJob: dreamJob || '',
      learningStyle: learningStyle || '',
      personalityTraits,
      quizSummary,
    };

    console.log('=== EXTRACTION RESULTS ===');
    console.log('Final extracted personality data:', extractedData);

    await this.savePersonalityProfile(extractedData);
  }

  private findPrecedingQuestion(userMessage: any, assistantMessages: any[]): any | null {
    const userTimestamp = new Date(userMessage.created_at || userMessage.timestamp);
    return assistantMessages.find(msg => {
      const assistantTimestamp = new Date(msg.created_at || msg.timestamp);
      return assistantTimestamp < userTimestamp;
    });
  }

  private extractByQuestionPattern(
    questionNumber: number, 
    questionContext: string, 
    userResponse: string,
    data: any
  ): void {
    const response = userResponse.toLowerCase();
    
    // Enhanced question pattern matching
    if (questionNumber === 1 || questionContext.includes('interested in') || questionContext.includes('spark your curiosity')) {
      data.interests.push(...this.extractWithEnhancedKeywords(response, this.getInterestKeywords()));
    } else if (questionNumber === 2 || questionContext.includes('hobbies') || questionContext.includes('free time') || questionContext.includes('love to do')) {
      data.hobbies.push(...this.extractWithEnhancedKeywords(response, this.getHobbyKeywords()));
    } else if (questionNumber === 3 || questionContext.includes('describe you') || questionContext.includes('kind of person') || questionContext.includes('personality')) {
      data.personalityDescription += (data.personalityDescription ? ' ' : '') + userResponse;
      this.extractPersonalityTraits(userResponse, data.personalityTraits);
    } else if (questionNumber === 4 || questionContext.includes('read about') || questionContext.includes('books') || questionContext.includes('stories')) {
      data.readingPreferences.push(...this.extractWithEnhancedKeywords(response, this.getReadingKeywords()));
    } else if (questionNumber === 5 || questionContext.includes('dream job') || questionContext.includes('when you grow up') || questionContext.includes('want to be')) {
      if (!data.dreamJob) data.dreamJob = userResponse;
    } else if (questionContext.includes('learn') && (questionContext.includes('how') || questionContext.includes('way') || questionContext.includes('style'))) {
      data.learningStyle += (data.learningStyle ? ' ' : '') + userResponse;
    }
  }

  private extractByFallbackPattern(questionNumber: number, userResponse: string, data: any): void {
    // Fallback extraction based on typical quiz order
    switch (questionNumber) {
      case 1:
        data.interests.push(...this.extractWithEnhancedKeywords(userResponse.toLowerCase(), this.getInterestKeywords()));
        break;
      case 2:
        data.hobbies.push(...this.extractWithEnhancedKeywords(userResponse.toLowerCase(), this.getHobbyKeywords()));
        break;
      case 3:
        data.personalityDescription += (data.personalityDescription ? ' ' : '') + userResponse;
        this.extractPersonalityTraits(userResponse, data.personalityTraits);
        break;
      case 4:
        data.readingPreferences.push(...this.extractWithEnhancedKeywords(userResponse.toLowerCase(), this.getReadingKeywords()));
        break;
      case 5:
        if (!data.dreamJob) data.dreamJob = userResponse;
        break;
      case 6:
        data.learningStyle += (data.learningStyle ? ' ' : '') + userResponse;
        break;
    }
  }

  private extractFromSummary(summary: string, data: any): void {
    const summaryLower = summary.toLowerCase();
    
    // Extract additional interests from summary
    data.interests.push(...this.extractWithEnhancedKeywords(summaryLower, this.getInterestKeywords()));
    
    // Extract hobbies from summary
    data.hobbies.push(...this.extractWithEnhancedKeywords(summaryLower, this.getHobbyKeywords()));
    
    // Extract reading preferences
    data.readingPreferences.push(...this.extractWithEnhancedKeywords(summaryLower, this.getReadingKeywords()));
    
    // Extract learning style indicators
    const learningPatterns = ['visual', 'hands-on', 'listening', 'reading', 'doing', 'watching', 'practicing'];
    const foundLearningStyles = learningPatterns.filter(pattern => summaryLower.includes(pattern));
    if (foundLearningStyles.length > 0) {
      data.learningStyle = foundLearningStyles.join(', ');
    }
    
    // Extract dream job if mentioned
    const jobMatches = summary.match(/(?:want to be|dream.*?(?:job|career)|when.*grow up).*?([a-z]+(?:\s+[a-z]+)*)/gi);
    if (jobMatches && !data.dreamJob) {
      data.dreamJob = jobMatches[0];
    }
  }

  private extractWithEnhancedKeywords(text: string, keywords: string[]): string[] {
    const found: string[] = [];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    }
    return found;
  }

  private extractPersonalityTraits(response: string, traits: Record<string, any>): void {
    const responseLower = response.toLowerCase();
    
    // Common personality trait patterns
    const traitPatterns = {
      extroverted: ['outgoing', 'social', 'talkative', 'friendly', 'love meeting people'],
      introverted: ['quiet', 'shy', 'prefer alone', 'small groups', 'thoughtful'],
      creative: ['creative', 'artistic', 'imaginative', 'love art', 'drawing', 'music'],
      analytical: ['logical', 'like puzzles', 'math', 'science', 'problem solving'],
      adventurous: ['adventurous', 'love exploring', 'trying new things', 'brave'],
      caring: ['kind', 'helpful', 'caring', 'love animals', 'help others'],
      curious: ['curious', 'ask questions', 'love learning', 'want to know'],
      energetic: ['energetic', 'active', 'love sports', 'running', 'moving'],
    };
    
    for (const [trait, patterns] of Object.entries(traitPatterns)) {
      if (patterns.some(pattern => responseLower.includes(pattern))) {
        traits[trait] = true;
      }
    }
  }

  private generatePersonalityDescription(traits: Record<string, any>): string {
    const activeTraits = Object.keys(traits).filter(key => traits[key]);
    if (activeTraits.length === 0) return '';
    
    return `Someone who is ${activeTraits.join(', ')}`;
  }

  private getInterestKeywords(): string[] {
    return [
      'science', 'math', 'art', 'music', 'sports', 'reading', 'writing', 'animals', 'nature',
      'space', 'dinosaurs', 'cooking', 'drawing', 'painting', 'dancing', 'singing', 'games',
      'technology', 'computers', 'history', 'geography', 'languages', 'crafts', 'building',
      'robots', 'coding', 'movies', 'books', 'stories', 'adventure', 'mystery', 'gardening',
      'plants', 'flowers', 'garden', 'ocean', 'sea', 'fish', 'birds', 'insects', 'weather',
      'cars', 'trains', 'planes', 'rockets', 'magic', 'fantasy', 'superheroes'
    ];
  }

  private getHobbyKeywords(): string[] {
    return [
      'reading', 'drawing', 'painting', 'playing', 'soccer', 'basketball', 'swimming', 'dancing',
      'singing', 'music', 'cooking', 'baking', 'gardening', 'crafts', 'building', 'puzzles',
      'video games', 'board games', 'collecting', 'hiking', 'biking', 'skateboarding', 'running',
      'chess', 'lego', 'origami', 'photography', 'writing', 'journaling', 'yoga', 'martial arts',
      'tennis', 'volleyball', 'baseball', 'football', 'climbing', 'skating', 'skiing'
    ];
  }

  private getReadingKeywords(): string[] {
    return [
      'adventure', 'mystery', 'fantasy', 'science fiction', 'animals', 'nature', 'history',
      'biography', 'comic books', 'graphic novels', 'poetry', 'fairy tales', 'humor', 'sports',
      'science', 'art', 'music', 'cooking', 'travel', 'friendship', 'family', 'magic', 'dragons',
      'princesses', 'knights', 'pirates', 'aliens', 'robots', 'dinosaurs', 'ocean', 'space'
    ];
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
