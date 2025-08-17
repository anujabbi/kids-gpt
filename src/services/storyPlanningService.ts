import { openAIService } from './openAIService';
import { StoryPlan, ComicStyle } from '@/types/comic';

export class StoryPlanningService {
  async generateStoryPlan(storyIdea: string, comicStyle: ComicStyle): Promise<StoryPlan | null> {
    const styleContext = this.getStyleContext(comicStyle);
    
    const prompt = `Create a funny 3-panel comic about: ${storyIdea}

Art Style: {{${styleContext}}}

Requirements:
- 3 panels with SAME characters and setting throughout
- Panel 1: Setup, Panel 2: Development, Panel 3: Punchline  
- Kid-friendly humor with dialogue in each panel
- Characters must look identical in all panels
- ALL visual descriptions must include the art style

JSON format:
{
  "title": "Comic title (max 40 chars)",
  "characters": [
    {
      "name": "Character name",
      "description": "Personality and role (2-3 sentences)",
      "visualDescription": "{{${styleContext}}} Detailed physical appearance for consistency: body type, height, facial features, hair, clothing, distinctive features (4-5 sentences)"
    }
  ],
  "panels": [
    {
      "panel": 1,
      "image_prompt": "{{${styleContext}}} Detailed scene with exact character descriptions in specific setting. Include positioning, expressions, and background details.",
      "dialogue": "Character name says: 'Dialogue here' (max 12 words)",
      "panel_type": "establishing_shot"
    },
    {
      "panel": 2,
      "image_prompt": "{{${styleContext}}} Same scene continuing with same characters. Show development while maintaining visual consistency.",
      "dialogue": "Character name says: 'Response dialogue' (max 12 words)",
      "panel_type": "medium_shot"
    },
    {
      "panel": 3,
      "image_prompt": "{{${styleContext}}} Same scene conclusion with same characters. Visual punchline with exaggerated expressions.",
      "dialogue": "Character name says: 'Punchline dialogue' (max 12 words)",
      "panel_type": "close_up"
    }
  ]
}

Make it hilarious for kids with physical comedy and silly situations.`;

    try {
      const result = await openAIService.extractStructuredData(prompt);
      return result as StoryPlan;
    } catch (error) {
      console.error('Failed to generate story plan:', error);
      return null;
    }
  }

  private getStyleContext(comicStyle: ComicStyle): string {
    switch (comicStyle) {
      case 'cartoon':
        return 'Style: Bright, colorful cartoon style with simple, bold lines and vibrant colors. Child-friendly and fun, reminiscent of popular animated shows for kids.';
      case 'ghibli':
        return 'Style: Beautiful, soft illustration in Studio Ghibli animation style. Use gentle colors, dreamy atmosphere, detailed backgrounds with magical, whimsical feeling.';
      case 'superhero':
        return 'Style: Bold, dynamic comic book style with dramatic poses, strong contrasts, and heroic proportions. Use vibrant colors and action-oriented composition.';
      default:
        return 'Style: Professional comic book illustration style.';
    }
  }
}

export const storyPlanningService = new StoryPlanningService();