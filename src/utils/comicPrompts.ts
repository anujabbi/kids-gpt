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
  characterDescription?: string,
  dialogue?: string
): string {
  const styleConfig = COMIC_STYLES[style];
  
  // Base professional comic specifications
  const professionalSpecs = `Create a professional comic panel illustration following industry standards:
- Comic book art style with clear line work and proper visual hierarchy
- Professional composition with proper focal points and visual flow
- High contrast for readability with comic book color palette
- Safe areas for text (avoid edges, 16px margins for important elements)
- Bold, clear line weights (2-4px for main elements)
- Consistent lighting and perspective
- Panel ${panelNumber} of 3 in a cohesive comic strip`;

  // Panel type specific instructions
  const panelInstructions = getPanelTypeInstructions(panelType);
  
  // Style-specific enhancement
  const styleEnhancement = `${styleConfig.promptTemplate}`;
  
  // Character consistency
  const characterConsistency = characterDescription 
    ? `Maintain visual consistency with this character description: ${characterDescription}`
    : 'Ensure character design consistency if characters appear';

  // Add dialogue if provided
  const dialogueInstruction = dialogue 
    ? `Include a speech bubble with the text: "${dialogue}". The speech bubble should be comic book style with clear, readable text and proper placement that doesn't obscure important visual elements.`
    : '';

  return `${professionalSpecs}

${panelInstructions}

${styleEnhancement}

Scene Description: ${imagePrompt}

${dialogueInstruction}

${characterConsistency}

Professional comic book illustration, high quality, detailed, engaging composition.`;
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