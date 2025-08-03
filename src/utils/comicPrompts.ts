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
  const styleConfig = COMIC_STYLES[style];
  
  // Keep it concise to stay under 4000 character limit
  const basePrompt = `Comic panel ${panelNumber}/3: ${styleConfig.promptTemplate} ${imagePrompt}`;
  
  // Add character descriptions (truncated if too long)
  const characters = characterDescriptions 
    ? ` Characters: ${characterDescriptions.substring(0, 500)}` 
    : '';
  
  // Add dialogue if provided
  const dialogueText = dialogue 
    ? ` Include speech bubble: "${dialogue}"` 
    : '';

  const finalPrompt = basePrompt + characters + dialogueText;
  
  // Ensure we stay under the limit
  return finalPrompt.length > 3800 ? finalPrompt.substring(0, 3800) + '...' : finalPrompt;
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