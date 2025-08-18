import { useState } from 'react';
import { imageGenerationService } from '@/services/imageGenerationService';
import { ComicPanel, ComicCharacter } from '@/types/comic';
import { generateProfessionalImagePrompt } from '@/utils/comicPrompts';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useComicPanelGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile } = useAuth();

  const generatePanelWithReferences = async (
    panel: ComicPanel,
    panelIndex: number,
    characters: ComicCharacter[],
    comicStyle: string,
    previousPanelGenerationId?: string,
    skipEnhancement?: boolean
  ): Promise<ComicPanel | null> => {
    console.log('generatePanelWithReferences called for panel', panelIndex);
    setIsGenerating(true);
    
    try {
      // Build referenced image IDs
      const referencedImageIds: string[] = [];
      
      // Add character generation IDs for consistency
      characters.forEach(character => {
        if (character.generationId) {
          referencedImageIds.push(character.generationId);
        }
      });
      
      // Add previous panel ID for scene continuity (except for first panel)
      if (previousPanelGenerationId && panelIndex > 0) {
        referencedImageIds.push(previousPanelGenerationId);
      }

      // Generate enhanced prompt or use existing
      let enhancedPrompt;
      
      if (skipEnhancement) {
        // Use the prompt directly (it's already enhanced)
        enhancedPrompt = panel.prompt;
      } else {
        // Generate enhanced prompt with detailed character descriptions
        const characterDescriptions = characters
          .map(char => {
            const details = [
              `NAME: ${char.name}`,
              `APPEARANCE: ${char.visualDescription}`,
              `PERSONALITY: ${char.description || 'Main character'}`
            ];
            return details.join(' | ');
          })
          .join('\n');

        console.log('Character descriptions:', characterDescriptions);

        enhancedPrompt = generateProfessionalImagePrompt(
          panel.prompt,
          panel.panelType,
          comicStyle as any,
          panelIndex + 1,
          characterDescriptions,
          panel.dialogue
        );
      }

      console.log('Enhanced prompt:', enhancedPrompt);

      // Generate image with references
      const result = await imageGenerationService.generateImage(
        {
          prompt: enhancedPrompt,
          size: '1024x1024',
          quality: 'high',
          style: 'vivid'
        },
        profile?.family_id || undefined
      );

      const updatedPanel: ComicPanel = {
        ...panel,
        imageUrl: result.url,
        generationId: result.generationId,
        referencedImageIds: referencedImageIds.length > 0 ? referencedImageIds : undefined,
        dialogue: panel.dialogue, // Explicitly preserve dialogue
      };

      toast({
        title: "Panel Generated",
        description: `Panel ${panelIndex + 1} has been created with character consistency!`,
      });

      return updatedPanel;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate panel.";
      toast({
        title: "Panel Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllPanels = async (
    panels: ComicPanel[],
    characters: ComicCharacter[],
    comicStyle: string
  ): Promise<ComicPanel[]> => {
    setIsGenerating(true);
    const generatedPanels: ComicPanel[] = [];
    let previousGenerationId: string | undefined;
    
    try {
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const generated = await generatePanelWithReferences(
          panel,
          i,
          characters,
          comicStyle,
          previousGenerationId
        );
        
        if (generated) {
          generatedPanels.push(generated);
          previousGenerationId = generated.generationId;
        } else {
          generatedPanels.push(panel); // Keep original if generation failed
        }
        
        // Small delay between generations to avoid rate limiting
        if (i < panels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return generatedPanels;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePanelWithReferences,
    generateAllPanels,
    isGenerating,
  };
};