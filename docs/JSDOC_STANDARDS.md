# JSDoc Documentation Standards

## Overview

Use JSDoc comments to document components, functions, and types. This will provide better code insights both for developers and for GitHub Copilot.

## Component Documentation

```typescript
/**
 * A component that displays a personalized greeting based on user profile.
 * 
 * @component
 * @example
 * ```tsx
 * <PersonalizedGreeting userName="Alex" userAge={9} />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.userName - The user's display name
 * @param {number} props.userAge - The user's age (5-12)
 * @param {boolean} [props.showAnimation=true] - Whether to show the welcome animation
 * @returns {JSX.Element} Personalized greeting component
 */
export function PersonalizedGreeting({ 
  userName, 
  userAge, 
  showAnimation = true 
}: PersonalizedGreetingProps) {
  // Implementation
}
```

## Hook Documentation

```typescript
/**
 * Custom hook to manage file uploads to storage.
 * 
 * @hook
 * @example
 * ```tsx
 * const { uploadFile, uploadProgress, isUploading } = useFileUpload();
 * 
 * const handleFileSelect = async (file: File) => {
 *   const url = await uploadFile(file, 'attachments');
 *   console.log('Uploaded to:', url);
 * };
 * ```
 * 
 * @returns {Object} File upload utilities and state
 * @property {(file: File, bucket: string) => Promise<string>} uploadFile - Function to upload a file
 * @property {number} uploadProgress - Current upload progress (0-100)
 * @property {boolean} isUploading - Whether an upload is in progress
 * @property {() => void} cancelUpload - Function to cancel the current upload
 */
export function useFileUpload() {
  // Implementation
}
```

## Interface/Type Documentation

```typescript
/**
 * Represents a message in a conversation.
 * 
 * @interface Message
 * @property {string} id - Unique identifier for the message
 * @property {'user' | 'assistant'} role - Who sent the message
 * @property {string} content - The message text content
 * @property {Date} timestamp - When the message was sent
 * @property {FileAttachment[]} [attachments] - Optional file attachments
 * @property {GeneratedImage} [generatedImage] - Optional AI-generated image
 * @property {number} [homeworkMisuseScore] - Score indicating likelihood of homework misuse (0-100)
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  generatedImage?: GeneratedImage;
  homeworkMisuseScore?: number;
}
```

## Service Documentation

```typescript
/**
 * Service for interacting with the OpenAI API.
 * 
 * @class OpenAIService
 */
export class OpenAIService {
  /**
   * Generate a chat completion using the OpenAI API.
   * 
   * @async
   * @param {Message[]} messages - Array of conversation messages
   * @param {Object} [options] - Optional configuration
   * @param {string} [options.model='gpt-4o'] - The model to use
   * @param {number} [options.temperature=0.7] - Creativity level (0.0-1.0)
   * @param {string} [options.systemPrompt] - Custom system instructions
   * @returns {Promise<Message|null>} - The generated message or null if there was an error
   * @throws {Error} If API request fails
   */
  async generateChatCompletion(
    messages: Message[],
    options?: {
      model?: string;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<Message | null> {
    // Implementation
  }
}
```

## Utility Function Documentation

```typescript
/**
 * Formats a chat message with proper markdown and handles special content.
 * 
 * @function formatMessage
 * @param {string} content - Raw message content
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.sanitize=true] - Whether to sanitize HTML
 * @param {boolean} [options.highlightCode=true] - Whether to highlight code blocks
 * @returns {string} Formatted message content
 */
export function formatMessage(
  content: string,
  options = { sanitize: true, highlightCode: true }
): string {
  // Implementation
}
```

## Context Provider Documentation

```typescript
/**
 * Provider for theme-related functionality.
 * Manages theme selection, dark mode, and custom theme settings.
 * 
 * @component
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider component
 */
export function ThemeProvider({ 
  children 
}: ThemeProviderProps) {
  // Implementation
}
```

## Event Handler Documentation

```typescript
/**
 * Handles file upload selection from the file input.
 * Validates file type and size before starting upload.
 * 
 * @function handleFileSelect
 * @param {React.ChangeEvent<HTMLInputElement>} event - File input change event
 * @returns {Promise<void>}
 */
const handleFileSelect = async (
  event: React.ChangeEvent<HTMLInputElement>
): Promise<void> => {
  // Implementation
};
```

## Enum Documentation

```typescript
/**
 * User roles within the application.
 * 
 * @enum {string}
 */
export enum UserRole {
  /** Child user with restricted capabilities */
  CHILD = 'child',
  
  /** Parent user with monitoring capabilities */
  PARENT = 'parent',
  
  /** Administrative user with full system access */
  ADMIN = 'admin',
}
```

## Constants Documentation

```typescript
/**
 * Configuration for OpenAI API requests.
 * 
 * @constant
 * @type {Object}
 */
export const OPENAI_CONFIG = {
  /** Default model for chat completions */
  DEFAULT_MODEL: 'gpt-4o',
  
  /** Model for image generation */
  IMAGE_MODEL: 'dall-e-3',
  
  /** Default creativity level */
  DEFAULT_TEMPERATURE: 0.7,
  
  /** Maximum tokens for child responses */
  MAX_TOKENS: 1000,
};
```
