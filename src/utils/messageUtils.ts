
import { Message, FileAttachment } from '@/types/chat';

export const createUserMessage = (content: string, attachments?: FileAttachment[]): Message => {
  return {
    id: Date.now().toString(),
    content,
    role: 'user',
    timestamp: new Date(),
    attachments,
  };
};

export const createAssistantMessage = (content: string, homeworkScore?: number): Message => {
  return {
    id: (Date.now() + 1).toString(),
    content,
    role: 'assistant',
    timestamp: new Date(),
    homeworkMisuseScore: homeworkScore,
  };
};

export const getLastUserMessage = (messages: Message[]): Message | undefined => {
  return messages.filter(msg => msg.role === 'user').pop();
};
