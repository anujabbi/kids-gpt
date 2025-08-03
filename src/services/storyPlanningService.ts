import { openAIService } from './openAIService';
import { StoryPlan, ComicStyle } from '@/types/comic';

export class StoryPlanningService {
  async generateStoryPlan(storyIdea: string, comicStyle: ComicStyle): Promise<StoryPlan | null> {
    const styleContext = this.getStyleContext(comicStyle);
    
    const prompt = `Create a professional 3-panel vertical comic strip about: ${storyIdea}.

${styleContext}

Follow comic industry best practices:
- Panel 1: Setup/introduction
- Panel 2: Development/conflict  
- Panel 3: Punchline/resolution
- Use proper comic typography and speech bubble conventions
- Keep captions concise (max 20 words)
- Ensure visual continuity between panels
- Make it engaging and age-appropriate for children

Respond with a JSON object containing:
{
  "title": "Professional comic title (max 50 characters)",
  "panels": [
    {
      "panel": 1,
      "image_prompt": "Detailed prompt for professional comic illustration with proper composition, clear focal points, and comic art style",
      "caption": "Speech or caption text following comic conventions",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 2, 
      "image_prompt": "Second panel prompt maintaining visual continuity with panel 1",
      "caption": "Development dialogue or narration",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 3,
      "image_prompt": "Final panel prompt delivering the punchline or resolution", 
      "caption": "Punchline or concluding text",
      "panel_type": "establishing_shot|close_up|medium_shot"
    }
  ]
}

Make it engaging and professional. Each panel should have proper visual hierarchy and clear storytelling purpose.

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`;

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