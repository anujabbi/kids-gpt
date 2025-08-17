// Comic Strip Generation Prompt Templates
import { ComicStyle } from '@/types/comic';

export interface ComicStyleConfig {
  name: string;
  description: string;
  emoji: string;
  promptTemplate: string;
}

export const COMIC_STYLES: Record<ComicStyle, ComicStyleConfig> = {
  cartoon: {
    name: 'Cartoon',
    description: 'Bright, simple, kid-style art',
    emoji: '🖍️',
    promptTemplate: 'Create a colorful, cheerful cartoon-style illustration with simple, bold lines and bright colors. The art style should be child-friendly, fun, and reminiscent of popular animated shows for kids.'
  },
  ghibli: {
    name: 'Studio Ghibli',
    description: 'Soft, dreamy, cinematic animation look',
    emoji: '🌸',
    promptTemplate: 'Create a beautiful, soft illustration in the style of Studio Ghibli animation. Use gentle colors, dreamy atmosphere, and detailed backgrounds with a magical, whimsical feeling.'
  },
  superhero: {
    name: 'Superhero',
    description: 'Bold, graphic-novel style with dramatic flair',
    emoji: '🦸',
    promptTemplate: 'Create a bold, dynamic comic book style illustration with dramatic poses, strong contrasts, and heroic proportions. Use vibrant colors and action-oriented composition.'
  },
  simple: {
    name: 'Simple Handdrawn',
    description: 'Clean, minimalist line art style',
    emoji: '✏️',
    promptTemplate: 'Create a simple, clean hand-drawn illustration with minimal lines and basic shapes. The style should be like a child\'s drawing - simple, innocent, and charming with basic colors.'
  },
  stick_figures: {
    name: 'Stick Figures',
    description: 'Hand-drawn black and white stick figure style',
    emoji: '🖊️',
    promptTemplate: 'Create a hand-drawn black and white stick figure illustration. Use simple line art with basic stick figure characters - circles for heads, straight lines for bodies and limbs. Keep it minimal, clean, and charming like a child\'s doodle in black ink on white paper.'
  }
};

export interface PanelPrompt {
  prompt: string;
  caption: string;
}

export function generateProfessionalImagePrompt(
  imagePrompt: string, 
  panelType: string,
  style: ComicStyle,
  panelNumber: number,
  characterDescriptions?: string,
  dialogue?: string
): string {
  console.log('generateProfessionalImagePrompt called with:');
  console.log('- imagePrompt:', imagePrompt);
  console.log('- characterDescriptions:', characterDescriptions);
  
  const styleConfig = COMIC_STYLES[style];
  const panelTypeInstr = getPanelTypeInstructions(panelType);
  
  // Build comprehensive prompt with character and setting details
  let basePrompt = `Comic panel ${panelNumber}/3: ${styleConfig.promptTemplate}
  
Panel Type: ${panelTypeInstr}
  
Scene: ${imagePrompt}`;
  
  // Add detailed character descriptions for consistency
  if (characterDescriptions) {
    basePrompt += `

CHARACTER CONSISTENCY REQUIREMENTS:
${characterDescriptions.substring(0, 1200)}
Ensure these characters appear EXACTLY as described with identical visual features, clothing, and proportions.`;
  }
  
  // Add dialogue with proper formatting
  if (dialogue) {
    basePrompt += `

DIALOGUE: Include speech bubble with text: "${dialogue}"`;
  }
  
  // Add continuity instructions
  basePrompt += `

CRITICAL: Maintain complete visual consistency with previous panels - same characters, same setting, same lighting, same style. Only expressions and positioning should change to show story progression.`;

  const finalPrompt = basePrompt;
  
  console.log('Final generated prompt:', finalPrompt);
  
  // Ensure we stay under the limit while preserving important details
  return finalPrompt.length > 4000 ? finalPrompt.substring(0, 4000) + '...' : finalPrompt;
}

function getPanelTypeInstructions(panelType: string): string {
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

export function enhancePromptWithCharacterConsistency(
  basePrompt: string, 
  characterDescription: string,
  generationId?: string
): string {
  let enhancedPrompt = basePrompt;
  
  if (characterDescription) {
    enhancedPrompt += ` The main character should be: ${characterDescription}`;
  }
  
  if (generationId) {
    enhancedPrompt += ` [Reference generation ID: ${generationId} for character consistency]`;
  }
  
  return enhancedPrompt;
}

export function extractCharacterDescription(imagePrompt: string): string {
  // Simple extraction of character details from the prompt
  // This could be enhanced with AI in the future
  const characterKeywords = [
    'character', 'person', 'boy', 'girl', 'child', 'hero', 'superhero',
    'animal', 'cat', 'dog', 'dinosaur', 'dragon', 'robot', 'alien'
  ];
  
  const words = imagePrompt.toLowerCase().split(' ');
  const characterWords = words.filter(word => 
    characterKeywords.some(keyword => word.includes(keyword))
  );
  
  return characterWords.join(' ') || 'main character';
}