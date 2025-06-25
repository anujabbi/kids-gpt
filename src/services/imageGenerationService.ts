
import { openAIService } from './openAIService';

export interface ImageGenerationParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

export class ImageGenerationService {
  private getApiKey(): string {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found. Please add your API key in Settings.");
    }
    return apiKey;
  }

  async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    const apiKey = this.getApiKey();
    
    // Add kid-friendly prompt enhancement
    const enhancedPrompt = this.enhancePromptForKids(params.prompt);
    
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: params.size || '1024x1024',
          quality: params.quality || 'standard',
          style: params.style || 'vivid',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error("No image URL received from OpenAI");
      }

      return {
        url: imageUrl,
        prompt: enhancedPrompt,
        timestamp: new Date(),
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
