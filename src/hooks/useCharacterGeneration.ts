import { useState } from 'react';
import { imageGenerationService } from '@/services/imageGenerationService';
import { ComicCharacter } from '@/types/comic';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useCharacterGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile } = useAuth();

  const generateCharacterImage = async (character: ComicCharacter): Promise<ComicCharacter | null> => {
    setIsGenerating(true);
    
    try {
      const prompt = `Character portrait: ${character.name} - ${character.visualDescription}. High quality character design, clear features, consistent style for comic book.`;
      
      const result = await imageGenerationService.generateImage(
        {
          prompt,
          size: '1024x1024',
          quality: 'hd',
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

  const generateAllCharacters = async (characters: ComicCharacter[]): Promise<ComicCharacter[]> => {
    setIsGenerating(true);
    const generatedCharacters: ComicCharacter[] = [];
    
    try {
      for (const character of characters) {
        const generated = await generateCharacterImage(character);
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