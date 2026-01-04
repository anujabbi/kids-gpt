import { supabase } from '@/integrations/supabase/client';
import { ComicStyle } from '@/types/comic';

interface GeminiImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface GeminiTextPart {
  text: string;
}

type GeminiPart = GeminiImagePart | GeminiTextPart;

interface GeminiResponse {
  candidates: {
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }[];
}

const STYLE_PROMPTS: Record<ComicStyle, string> = {
  cartoon: 'colorful, cheerful cartoon style with bold outlines, expressive characters, bright saturated colors, Disney/Pixar inspired',
  ghibli: 'beautiful, soft Studio Ghibli anime style with gentle colors, detailed backgrounds, whimsical atmosphere, hand-painted look',
  superhero: 'bold, dynamic comic book superhero style with dramatic poses, strong shadows, action lines, Marvel/DC inspired',
  simple: 'simple, clean hand-drawn style with minimal details, cute characters, soft pastel colors, children\'s book illustration'
};

class GeminiImageService {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly model = 'gemini-2.0-flash-exp'; // Using experimental model with image generation

  /**
   * Get the Gemini API key from family settings or localStorage
   */
  private async getApiKey(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single();

        if (profile?.family_id) {
          const { data: family } = await supabase
            .from('families')
            .select('gemini_api_key')
            .eq('id', profile.family_id)
            .single();

          if (family?.gemini_api_key) {
            return family.gemini_api_key;
          }
        }
      }
    } catch (error) {
      console.error('Failed to get family Gemini API key:', error);
    }

    // Fallback to localStorage
    return localStorage.getItem('gemini_api_key');
  }

  /**
   * Convert an image URL to base64 for Gemini API
   */
  private async urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/png';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ data: base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Extract base64 image from Gemini response
   */
  private extractImageFromResponse(response: GeminiResponse): string | null {
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  }

  /**
   * Generate a character portrait image
   */
  async generateCharacter(
    name: string,
    visualDescription: string,
    style: ComicStyle
  ): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('No Gemini API key available. Please ask a parent to set up the API key in settings.');
    }

    const stylePrompt = STYLE_PROMPTS[style];
    const prompt = `Create a character portrait illustration in ${stylePrompt}.

Character: ${name}
Appearance: ${visualDescription}

Requirements:
- Full body character portrait on a simple background
- Clear, distinctive features that can be recognized across multiple images
- Friendly, kid-appropriate appearance
- High quality, consistent art style
- The character should be memorable and easy to identify`;

    const response = await fetch(
      `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png'
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Gemini API error:', error);
      throw new Error(this.getErrorMessage(response.status, error));
    }

    const data: GeminiResponse = await response.json();
    const imageDataUrl = this.extractImageFromResponse(data);

    if (!imageDataUrl) {
      throw new Error('No image generated. Please try again.');
    }

    return imageDataUrl;
  }

  /**
   * Generate a comic panel with character image references for consistency
   */
  async generatePanel(
    scenePrompt: string,
    characterImages: string[],
    style: ComicStyle,
    panelNumber: number,
    totalPanels: number,
    previousPanelImage?: string
  ): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('No Gemini API key available. Please ask a parent to set up the API key in settings.');
    }

    const stylePrompt = STYLE_PROMPTS[style];

    // Build the content parts array
    const parts: GeminiPart[] = [];

    // Add the main prompt
    const textPrompt = `Create comic panel ${panelNumber} of ${totalPanels} in ${stylePrompt}.

Scene: ${scenePrompt}

CRITICAL REQUIREMENTS:
- The characters in this panel MUST look EXACTLY like the reference character images provided below
- Maintain their exact appearance: face, hair, clothing, colors, and distinctive features
- Keep the same art style throughout
- This is panel ${panelNumber} of ${totalPanels}, so ${panelNumber === 1 ? 'establish the scene clearly' : panelNumber === totalPanels ? 'bring the story to a satisfying conclusion' : 'continue the story naturally'}
- Kid-friendly, colorful, and engaging
- Clear composition suitable for a comic panel
${previousPanelImage ? '- Maintain visual continuity with the previous panel (also provided as reference)' : ''}

The reference images of the characters are provided below. Make sure the characters in the generated panel look identical to these references.`;

    parts.push({ text: textPrompt });

    // Add character reference images
    for (const charImage of characterImages) {
      try {
        const { data, mimeType } = await this.urlToBase64(charImage);
        parts.push({
          inlineData: { mimeType, data }
        });
      } catch (error) {
        console.warn('Failed to convert character image to base64:', error);
      }
    }

    // Add previous panel for continuity (if provided)
    if (previousPanelImage) {
      try {
        const { data, mimeType } = await this.urlToBase64(previousPanelImage);
        parts.push({
          inlineData: { mimeType, data }
        });
      } catch (error) {
        console.warn('Failed to convert previous panel to base64:', error);
      }
    }

    const response = await fetch(
      `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png'
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Gemini API error:', error);
      throw new Error(this.getErrorMessage(response.status, error));
    }

    const data: GeminiResponse = await response.json();
    const imageDataUrl = this.extractImageFromResponse(data);

    if (!imageDataUrl) {
      throw new Error('No image generated. Please try again.');
    }

    return imageDataUrl;
  }

  /**
   * Edit/regenerate a panel with specific instructions
   */
  async editPanel(
    currentPanelImage: string,
    editInstructions: string,
    characterImages: string[],
    style: ComicStyle
  ): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('No Gemini API key available. Please ask a parent to set up the API key in settings.');
    }

    const stylePrompt = STYLE_PROMPTS[style];
    const parts: GeminiPart[] = [];

    // Add edit instructions
    parts.push({
      text: `Edit this comic panel with the following changes: ${editInstructions}

Style: ${stylePrompt}

IMPORTANT:
- Keep the characters looking exactly like the reference images provided
- Maintain the same overall art style
- Only make the requested changes
- Keep it kid-friendly and colorful`
    });

    // Add current panel
    try {
      const { data, mimeType } = await this.urlToBase64(currentPanelImage);
      parts.push({ inlineData: { mimeType, data } });
    } catch (error) {
      throw new Error('Failed to process current panel image');
    }

    // Add character references
    for (const charImage of characterImages) {
      try {
        const { data, mimeType } = await this.urlToBase64(charImage);
        parts.push({ inlineData: { mimeType, data } });
      } catch (error) {
        console.warn('Failed to convert character image:', error);
      }
    }

    const response = await fetch(
      `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['image', 'text'],
            responseMimeType: 'image/png'
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(this.getErrorMessage(response.status, error));
    }

    const data: GeminiResponse = await response.json();
    const imageDataUrl = this.extractImageFromResponse(data);

    if (!imageDataUrl) {
      throw new Error('No image generated. Please try again.');
    }

    return imageDataUrl;
  }

  /**
   * Convert base64 data URL to Blob for storage upload
   */
  dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mimeType });
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(status: number, error: any): string {
    if (status === 429) {
      return "Too many requests! Please wait a moment and try again.";
    }
    if (status === 401 || status === 403) {
      return "There's an issue with the API key. Please ask a parent to check the Gemini API key in settings.";
    }
    if (status === 400) {
      const message = error?.error?.message || '';
      if (message.includes('safety')) {
        return "The image couldn't be generated due to safety guidelines. Try a different description!";
      }
      return "There was an issue with the request. Please try again with a different description.";
    }
    return "Something went wrong generating the image. Please try again!";
  }
}

export const geminiImageService = new GeminiImageService();
