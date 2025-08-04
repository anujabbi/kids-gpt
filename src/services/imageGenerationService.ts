
import { familyApiKeyService } from './familyApiKeyService';

export interface ImageGenerationParams {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'high' | 'medium' | 'low' | 'auto';
  referenced_image_ids?: string[];
  output_format?: 'png' | 'jpeg' | 'webp';
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
  generationId?: string;
  base64?: string;
}

export class ImageGenerationService {
  private async getApiKey(familyId?: string): Promise<string> {
    // First, try to get family API key if familyId is provided
    if (familyId) {
      console.log('Attempting to get family API key for image generation:', familyId);
      const familyApiKey = await familyApiKeyService.getFamilyApiKey(familyId);
      if (familyApiKey) {
        console.log('Using family API key for image generation');
        return familyApiKey;
      }
    }
    
    // Fall back to localStorage API key
    const localApiKey = localStorage.getItem("openai_api_key");
    if (localApiKey) {
      console.log('Using local API key for image generation');
      return localApiKey;
    }
    
    throw new Error("OpenAI API key not found. Please add your API key in Settings or ask your parent to set the family API key.");
  }

  async generateImage(params: ImageGenerationParams, familyId?: string): Promise<GeneratedImage> {
    const apiKey = await this.getApiKey(familyId);
    
    // Add kid-friendly prompt enhancement
    const enhancedPrompt = this.enhancePromptForKids(params.prompt);
    
    try {
      const requestBody: any = {
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: params.size || '1024x1024',
        quality: params.quality || 'auto',
        output_format: params.output_format || 'png',
      };

      if (params.referenced_image_ids && params.referenced_image_ids.length > 0) {
        requestBody.referenced_image_ids = params.referenced_image_ids;
      }

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const imageData = data.data[0];
      
      if (!imageData) {
        throw new Error("No image data received from OpenAI");
      }

      // gpt-image-1 returns base64 data, not URL
      const base64 = imageData.b64_json;
      const generationId = imageData.revised_prompt_id || data.id;
      
      if (!base64) {
        throw new Error("No image data received from OpenAI");
      }

      // Convert base64 to data URL
      const imageUrl = `data:image/${params.output_format || 'png'};base64,${base64}`;

      return {
        url: imageUrl,
        prompt: enhancedPrompt,
        timestamp: new Date(),
        generationId,
        base64,
      };
    } catch (error) {
      console.error("Image Generation Error:", error);
      throw error;
    }
  }

  private enhancePromptForKids(prompt: string): string {
    // Add kid-friendly enhancements and safety measures
    const kidFriendlyPrefix = "Create a colorful, cheerful, and age-appropriate illustration of ";
    const kidFriendlySuffix = ". Make it fun, positive, and suitable for children.";
    
    return kidFriendlyPrefix + prompt + kidFriendlySuffix;
  }
}

export const imageGenerationService = new ImageGenerationService();
