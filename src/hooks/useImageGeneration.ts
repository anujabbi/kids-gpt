
import { useState } from 'react';
import { imageGenerationService, ImageGenerationParams, GeneratedImage } from '@/services/imageGenerationService';
import { toast } from '@/hooks/use-toast';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (params: ImageGenerationParams): Promise<GeneratedImage | null> => {
    setIsGenerating(true);
    
    try {
      const result = await imageGenerationService.generateImage(params);
      toast({
        title: "Image Generated",
        description: "Your image has been created successfully!",
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate image. Please try again.";
      toast({
        title: "Image Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImage,
    isGenerating,
  };
};
