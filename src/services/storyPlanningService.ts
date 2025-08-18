import { openAIService } from './openAIService';
import { StoryPlan, ComicStyle } from '@/types/comic';
import { buildStorylinePrompt } from '@/prompts/storylinePrompts';
import { COMIC_STYLES } from '@/utils/comicPrompts';

export class StoryPlanningService {
  async generateStoryPlan(storyIdea: string, comicStyle: ComicStyle): Promise<StoryPlan | null> {
    const styleConfig = COMIC_STYLES[comicStyle];
    
    const prompt = buildStorylinePrompt({
      storyIdea,
      style: styleConfig.promptTemplate
    });

    try {
      const result = await openAIService.extractStructuredData(prompt);
      return result as StoryPlan;
    } catch (error) {
      console.error('Failed to generate story plan:', error);
      return null;
    }
  }

}

export const storyPlanningService = new StoryPlanningService();