import { ComicStyle, PanelType } from '@/types/comic';

export interface StorylinePromptVariables {
  storyIdea: string;
  style: string;
}

export interface PanelPromptVariables {
  style: string;
  shotType: string;
  sceneDescription: string;
  characterDescriptions?: string;
}

export const STORYLINE_GENERATION_PROMPT = `Create a funny 3-panel comic about: {{storyIdea}}

Art Style: {{style}}

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
      "visualDescription": "{{style}} Detailed physical appearance for consistency: body type, height, facial features, hair, clothing, distinctive features (4-5 sentences)"
    }
  ],
  "panels": [
    {
      "panel": 1,
      "image_prompt": "{{style}} Detailed scene with exact character descriptions in specific setting. Include positioning, expressions, and background details.",
      "dialogue": "Character name says: 'Dialogue here' (max 12 words)",
      "panel_type": "establishing_shot"
    },
    {
      "panel": 2,
      "image_prompt": "{{style}} Same scene continuing with same characters. Show development while maintaining visual consistency.",
      "dialogue": "Character name says: 'Response dialogue' (max 12 words)",
      "panel_type": "medium_shot"
    },
    {
      "panel": 3,
      "image_prompt": "{{style}} Same scene conclusion with same characters. Visual punchline with exaggerated expressions.",
      "dialogue": "Character name says: 'Punchline dialogue' (max 12 words)",
      "panel_type": "close_up"
    }
  ]
}

Make it hilarious for kids with physical comedy and silly situations.`;

export const PANEL_GENERATION_PROMPT = `Comic panel: {{style}}

Panel Type: {{shotType}}

Scene: {{sceneDescription}}

{{#if characterDescriptions}}
CHARACTER CONSISTENCY REQUIREMENTS - MAINTAIN EXACT VISUAL IDENTITY:
{{characterDescriptions}}

CRITICAL: Each character must maintain IDENTICAL distinguishing features across all panels:
- Exact facial structure, eye color, hair style and color
- Same body proportions, height, build
- Identical clothing, accessories, and distinctive markings
- Consistent pose style and expression patterns
- Same lighting and art style as established
{{/if}}

CRITICAL: Maintain complete visual consistency with previous panels - same characters, same setting, same lighting, same style. Only expressions and positioning should change to show story progression.`;

export function buildStorylinePrompt(variables: StorylinePromptVariables): string {
  return STORYLINE_GENERATION_PROMPT
    .replace(/{{storyIdea}}/g, variables.storyIdea)
    .replace(/{{style}}/g, variables.style);
}

export function buildPanelPrompt(variables: PanelPromptVariables): string {
  let prompt = PANEL_GENERATION_PROMPT
    .replace(/{{style}}/g, variables.style)
    .replace(/{{shotType}}/g, variables.shotType)
    .replace(/{{sceneDescription}}/g, variables.sceneDescription);

  // Handle optional character descriptions
  if (variables.characterDescriptions) {
    prompt = prompt
      .replace(/{{#if characterDescriptions}}/g, '')
      .replace(/{{\/if}}/g, '')
      .replace(/{{characterDescriptions}}/g, variables.characterDescriptions);
  } else {
    // Remove the conditional block if no character descriptions
    prompt = prompt.replace(/{{#if characterDescriptions}}[\s\S]*?{{\/if}}/g, '');
  }

  return prompt;
}

export function getShotTypeInstructions(panelType: PanelType): string {
  switch (panelType) {
    case 'establishing_shot':
      return 'Wide establishing shot showing the scene and environment, setting the context and mood.';
    case 'close_up':
      return 'Close-up shot focusing on character expressions, emotions, or important details.';
    case 'medium_shot':
      return 'Medium shot showing characters and their immediate surroundings, balancing character and environment.';
    default:
      return 'Well-composed shot with proper framing and clear storytelling purpose.';
  }
}