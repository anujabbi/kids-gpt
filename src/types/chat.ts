
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  generatedImage?: GeneratedImage;
  homeworkMisuseScore?: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  folderId?: string;
  type?: 'regular' | 'personality-quiz';
}

export interface ConversationFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

export interface PersonalityProfile {
  id: string;
  userId: string;
  interests: string[];
  favoriteColors: string[];
  hobbies: string[];
  learningStyle: string;
  personalityTraits: Record<string, any>;
  quizSummary: string;
  personalityDescription: string;
  readingPreferences: string[];
  dreamJob: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface ImageGenerationResult {
  url: string;
  prompt: string;
}
