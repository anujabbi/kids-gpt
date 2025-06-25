
import { Message } from '@/types/chat';
import { getSystemPrompt } from '@/utils/systemPrompts';

export interface OpenAIResponse {
  response: string;
  homeworkScore: number;
}

export class OpenAIService {
  private getApiKey(): string {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found. Please add your API key in Settings.");
    }
    return apiKey;
  }

  private async convertBlobToBase64(blobUrl: string): Promise<string> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      throw new Error('Failed to process image attachment');
    }
  }

  private async formatMessagesForOpenAI(messages: Message[]): Promise<any[]> {
    return Promise.all(messages.map(async msg => {
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
              content[0].text += `\n\n[Image attachment: ${attachment.name} - Could not process for vision analysis]`;
            }
          } else {
            content[0].text += `\n\n[Attached file: ${attachment.name} (${attachment.type}, ${(attachment.size / 1024).toFixed(1)}KB)]`;
          }
        }

        return { role: msg.role, content };
      } else {
        return { role: msg.role, content: msg.content };
      }
    }));
  }

  async generateResponse(messages: Message[]): Promise<OpenAIResponse> {
    const apiKey = this.getApiKey();
    
    try {
      const userAge = localStorage.getItem("user_age");
      const systemMessage = {
        role: "system" as const,
        content: getSystemPrompt(userAge || undefined)
      };

      const openAIMessages = await this.formatMessagesForOpenAI(messages);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemMessage, ...openAIMessages],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      
      // Import homework detection here to avoid circular imports
      const { analyzeHomeworkMisuse } = await import('@/services/homeworkDetectionService');
      const lastUserMessage = messages[messages.length - 1];
      const homeworkScore = await analyzeHomeworkMisuse(lastUserMessage?.content || "", aiResponse);
      
      return { response: aiResponse, homeworkScore };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();
