// Comic Strip Generation Prompt Templates

export type ComicStyle = 'cartoon' | 'ghibli' | 'superhero';

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

export function generateComicPrompts(storyIdea: string, style: ComicStyle): PanelPrompt[] {
  const styleConfig = COMIC_STYLES[style];
  const basePrompt = styleConfig.promptTemplate;

  return [
    {
      prompt: `${basePrompt} Panel 1 of a 3-panel comic: Setting up the story - ${storyIdea}. Show the main character(s) in their initial situation or environment.`,
      caption: 'Once upon a time...'
    },
    {
      prompt: `${basePrompt} Panel 2 of a 3-panel comic: The middle/action - ${storyIdea}. Show the main event or conflict happening with the same character(s) from panel 1.`,
      caption: 'Then something happened...'
    },
    {
      prompt: `${basePrompt} Panel 3 of a 3-panel comic: The resolution/ending - ${storyIdea}. Show how things end or the outcome with the same character(s) from panels 1 and 2.`,
      caption: 'And in the end...'
    }
  ];
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