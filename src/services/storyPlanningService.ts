import { openAIService } from './openAIService';
import { StoryPlan, ComicStyle } from '@/types/comic';

export class StoryPlanningService {
  async generateStoryPlan(storyIdea: string, comicStyle: ComicStyle): Promise<StoryPlan | null> {
    const styleContext = this.getStyleContext(comicStyle);
    
    const prompt = `Create a hilarious and engaging 3-panel vertical comic strip about: ${storyIdea}.

${styleContext}

Follow comic industry best practices:
- Panel 1: Setup/introduction - establish characters and situation
- Panel 2: Development/conflict - build tension or introduce problem
- Panel 3: Punchline/resolution - deliver the funny payoff
- Use proper comic typography and speech bubble conventions
- Include funny dialogues and character interactions in each panel
- Make it genuinely funny and engaging for children
- Keep dialogues snappy and entertaining (max 15 words per speech bubble)
- Ensure visual continuity between panels with consistent characters
- Characters should have expressive faces and body language
- Include humor that kids will understand and laugh at
- When dialogue exists, specify exactly who is speaking (e.g., "The dinosaur chef says:", "Captain Donut exclaims:")

Respond with a JSON object containing:
{
  "title": "Professional comic title (max 50 characters)",
  "panels": [
    {
      "panel": 1,
      "image_prompt": "Detailed prompt for professional comic illustration with proper composition, clear focal points, and comic art style. Include character expressions and setting details",
      "dialogue": "Character name says: 'Funny dialogue or speech bubble text' (max 15 words, specify who speaks)",
      "caption": "Optional narration or sound effects if needed",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 2, 
      "image_prompt": "Second panel prompt maintaining visual continuity with panel 1, showing character reactions and developing the situation",
      "dialogue": "Character name says: 'Continuation dialogue that builds the comedy' (max 15 words, specify who speaks)",
      "caption": "Optional narration or sound effects",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 3,
      "image_prompt": "Final panel prompt delivering the visual punchline with exaggerated character expressions and reactions", 
      "dialogue": "Character name says: 'Punchline dialogue that delivers the funny payoff' (max 15 words, specify who speaks)",
      "caption": "Optional narration or sound effects for comic effect",
      "panel_type": "establishing_shot|close_up|medium_shot"
    }
  ]
}

Make it hilarious and engaging for children. Each panel should have proper visual hierarchy, clear storytelling purpose, and genuine humor. Focus on physical comedy, silly situations, unexpected twists, and character reactions that kids will find funny.

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