import { openAIService } from './openAIService';
import { StoryPlan, ComicStyle } from '@/types/comic';

export class StoryPlanningService {
  async generateStoryPlan(storyIdea: string, comicStyle: ComicStyle): Promise<StoryPlan | null> {
    const styleContext = this.getStyleContext(comicStyle);
    
    const prompt = `Create a hilarious and engaging 3-panel vertical comic strip about: ${storyIdea}.

${styleContext}

CRITICAL REQUIREMENTS FOR CHARACTER AND SETTING CONSISTENCY:
- ALL panels must feature the EXACT SAME characters with identical visual appearance
- ALL panels must take place in the SAME setting/location with consistent environmental details
- Panel 1: Setup scene - establish the characters, setting, and initial situation in detail
- Panel 2: Development - continue the SAME scene with the SAME characters, showing progression/conflict
- Panel 3: Punchline - conclude the SAME scene with the SAME characters delivering the funny payoff

Follow comic industry best practices:
- Use proper comic typography and speech bubble conventions
- Include funny dialogues and character interactions in each panel
- Make it genuinely funny and engaging for children
- Keep dialogues snappy and entertaining (max 15 words per speech bubble)
- Ensure absolute visual continuity between panels with identical characters and settings
- Characters should have expressive faces and body language that evolve across panels
- Include humor that kids will understand and laugh at
- When dialogue exists, specify exactly who is speaking (e.g., "The dinosaur chef says:", "Captain Donut exclaims:")

Respond with a JSON object containing:
{
  "title": "Professional comic title (max 50 characters)",
  "characters": [
    {
      "name": "Character name",
      "description": "Detailed personality, traits, mannerisms, voice, age, role in story, quirks, and how they interact with others (3-4 sentences)",
      "visualDescription": "EXTREMELY DETAILED physical appearance for consistency: exact body type and size, precise height, specific facial features (eye color, nose shape, mouth), exact hair (color, style, length, texture), complete clothing description (colors, patterns, accessories), distinctive markings or features, typical posture and expressions. Be hyper-specific about every visual detail to ensure identical appearance across all panels (6-7 sentences)"
    }
  ],
  "panels": [
    {
      "panel": 1,
      "image_prompt": "DETAILED establishing shot showing [EXACT CHARACTER DESCRIPTIONS] in [SPECIFIC SETTING WITH ENVIRONMENTAL DETAILS]. Include precise character positioning, facial expressions, and complete scene context. Describe lighting, background elements, props, and atmosphere in detail for consistency.",
      "dialogue": "Character name says: 'Funny dialogue or speech bubble text' (max 15 words, specify who speaks)",
      "caption": "Optional narration or sound effects if needed",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 2, 
      "image_prompt": "CONTINUE THE EXACT SAME SCENE with the [SAME CHARACTER DESCRIPTIONS] in the [SAME SETTING]. Show character reactions and situation development while maintaining identical character appearance and environmental details from panel 1. Include precise positioning changes and expressions.",
      "dialogue": "Character name says: 'Continuation dialogue that builds the comedy' (max 15 words, specify who speaks)",
      "caption": "Optional narration or sound effects",
      "panel_type": "establishing_shot|close_up|medium_shot"
    },
    {
      "panel": 3,
      "image_prompt": "CONCLUDE THE SAME SCENE with the [SAME CHARACTER DESCRIPTIONS] in the [SAME SETTING]. Deliver visual punchline with exaggerated expressions while maintaining complete character and environmental consistency from previous panels. Include final positioning and comedic visual elements.", 
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