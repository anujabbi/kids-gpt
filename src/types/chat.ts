
export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  previewUrl?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: FileAttachment[];
  generatedImage?: GeneratedImage;
  homeworkMisuseScore?: number;
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  folderId?: string;
  userId?: string;
  child?: {
    id: string;
    full_name: string;
    profile_image_type: string;
    custom_profile_image_url?: string;
  };
}

export interface Folder {
  id: string;
  name: string;
  timestamp: Date;
}
