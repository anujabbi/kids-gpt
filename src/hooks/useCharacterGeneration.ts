import { useState } from 'react';
import { imageGenerationService } from '@/services/imageGenerationService';
import { ComicCharacter, ComicStyle } from '@/types/comic';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { COMIC_STYLES } from '@/utils/comicPrompts';
import { buildCharacterPrompt } from '@/prompts/characterPrompts';

export const useCharacterGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile } = useAuth();

  const generateCharacterImage = async (character: ComicCharacter, comicStyle: ComicStyle): Promise<ComicCharacter | null> => {
    setIsGenerating(true);
    
    try {
      const styleConfig = COMIC_STYLES[comicStyle];
      const prompt = buildCharacterPrompt({
        style: styleConfig.promptTemplate,
        characterName: character.name,
        characterDescription: character.visualDescription
      });
      
      const result = await imageGenerationService.generateImage(
        {
          prompt,
          size: '1024x1024',
          quality: 'high',
          style: 'vivid'
        },
        profile?.family_id || undefined
      );

      const updatedCharacter: ComicCharacter = {
        ...character,
        generatedImageUrl: result.url,
        generationId: result.generationId,
      };

      toast({
        title: "Character Generated",
        description: `${character.name}'s image has been created!`,
      });

      return updatedCharacter;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate character image.";
      toast({
        title: "Character Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllCharacters = async (characters: ComicCharacter[], comicStyle: ComicStyle): Promise<ComicCharacter[]> => {
    setIsGenerating(true);
    const generatedCharacters: ComicCharacter[] = [];
    
    try {
      for (const character of characters) {
        const generated = await generateCharacterImage(character, comicStyle);
        if (generated) {
          generatedCharacters.push(generated);
        } else {
          generatedCharacters.push(character); // Keep original if generation failed
        }
      }
      
      return generatedCharacters;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCharacterImage,
    generateAllCharacters,
    isGenerating,
  };
};