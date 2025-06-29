
import { Message } from '@/types/chat';
import { getSystemPrompt } from '@/utils/systemPrompts';
import { familyApiKeyService } from './familyApiKeyService';

export interface OpenAIResponse {
  response: string;
  homeworkScore: number;
}

export class OpenAIService {
  private async getApiKey(familyId?: string): Promise<string> {
    // First, try to get family API key if familyId is provided
    if (familyId) {
      console.log('Attempting to get family API key for family:', familyId);
      const familyApiKey = await familyApiKeyService.getFamilyApiKey(familyId);
      if (familyApiKey) {
        console.log('Using family API key');
        return familyApiKey;
      }
    }
    
    // Fall back to localStorage API key
    const localApiKey = localStorage.getItem("openai_api_key");
    if (localApiKey) {
      console.log('Using local API key');
      return localApiKey;
    }
    
    throw new Error("OpenAI API key not found. Please add your API key in Settings or ask your parent to set the family API key.");
  }

  private async convertBlobToBase64(blobUrl: string): Promise<string> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      throw new Error('Failed to process image attachment');
    }
  }

  private async formatMessagesForOpenAI(messages: Message[]): Promise<any[]> {
    const formattedMessages = [];
    
    for (const msg of messages) {
      if (msg.attachments && msg.attachments.length > 0) {
        const content: any[] = [{ type: "text", text: msg.content }];

        for (const attachment of msg.attachments) {
          if (attachment.type.startsWith('image/')) {
            try {
              const base64Data = await this.convertBlobToBase64(attachment.url);
              content.push({
                type: "image_url",
                image_url: { url: base64Data }
              });
            } catch (error) {
              console.error('Failed to process image:', error);
              const sizeKB = (attachment.size / 1024).toFixed(1);
              content[0].text += `\n\n[Image attachment: ${attachment.name} - Could not process for vision analysis]`;
            }
          } else {
            const sizeKB = (attachment.size / 1024).toFixed(1);
            content[0].text += `\n\n[Attached file: ${attachment.name} (${attachment.type}, ${sizeKB}KB)]`;
          }
        }

        formattedMessages.push({ role: msg.role, content });
      } else {
        formattedMessages.push({ role: msg.role, content: msg.content });
      }
    }
    
    return formattedMessages;
  }

  async generateResponse(messages: Message[], familyId?: string): Promise<OpenAIResponse> {
    const apiKey = await this.getApiKey(familyId);
    console.log('Generating OpenAI response...');
    
    try {
      const userAgeString = localStorage.getItem("user_age");
      const userAge = userAgeString ? Number(userAgeString) : undefined;
      
      const systemMessage = {
        role: "system" as const,
        content: getSystemPrompt(userAge)
      };

      const openAIMessages = await this.formatMessagesForOpenAI(messages);
      console.log('Formatted messages for OpenAI:', openAIMessages.length);

      const requestBody = {
        model: "gpt-4o-mini",
        messages: [systemMessage, ...openAIMessages],
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      // Import homework detection here to avoid circular imports
      const { analyzeHomeworkMisuse } = await import('@/services/homeworkDetectionService');
      const lastUserMessage = messages[messages.length - 1];
      const homeworkScore = await analyzeHomeworkMisuse(lastUserMessage?.content || "", aiResponse);
      
      console.log('OpenAI response generated successfully');
      return { response: aiResponse, homeworkScore };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();
