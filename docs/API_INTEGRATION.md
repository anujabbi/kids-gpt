# API Integration Documentation

## OpenAI Service

The OpenAI service handles all AI-powered functionality including chat responses and image generation.

### Configuration

```typescript
// Key settings for OpenAI integration
const DEFAULT_MODEL = 'gpt-4o';
const IMAGE_MODEL = 'dall-e-3';
```

### Key Functions

#### `generateChatCompletion`
Sends messages to OpenAI API and returns AI responses.

**Parameters:**
- `messages`: Array of message objects
- `options`: Optional configuration options
  - `model`: OpenAI model to use
  - `temperature`: Creativity level (0.0-1.0)
  - `systemPrompt`: Custom instructions for the AI

#### `generateImage`
Creates AI-generated images from text prompts.

**Parameters:**
- `prompt`: Text description of desired image
- `options`: Optional configuration
  - `size`: Image dimensions
  - `quality`: Image quality level
  - `style`: Visual style preference

## Supabase Integration

Handles authentication, database operations, and file storage.

### Auth Methods

- `signIn`: Email/password authentication
- `signUp`: New user registration with role selection
- `signOut`: User logout and session cleanup

### Database Tables

- `profiles`: User information and preferences
- `conversations`: Chat history and metadata
- `messages`: Individual message content
- `personality_profiles`: User interests and learning preferences
- `families`: Family grouping and management

### Storage Buckets

- `profile_images`: User avatar storage
- `attachments`: File attachments for messages
- `generated_images`: AI-generated images

## PostHog Analytics Integration

Tracks user behavior and provides analytics for the parent dashboard.

### Event Tracking

- `conversation_started`: When a new conversation begins
- `message_sent`: When a user sends a message
- `homework_detected`: When homework content is detected
- `image_generated`: When an AI image is created
- `file_uploaded`: When a file is attached to a message

### User Properties

- `user_role`: "child" or "parent"
- `age_range`: Age bracket for child users
- `interests`: Array of user interests
- `usage_frequency`: How often the user accesses the app

## File Upload Service

Manages file attachments for messages.

### Supported File Types

- Images: PNG, JPEG, GIF
- Documents: PDF, DOCX, TXT
- Other: CSV, JSON

### Upload Process

1. File selected by user
2. Client-side validation (type, size)
3. Secure upload URL generated
4. File uploaded to storage bucket
5. File metadata stored with message

## Homework Detection Service

Analyzes messages to detect homework questions and guide appropriate responses.

### Detection Approach

- Pattern matching for homework indicators
- Topic classification
- Question complexity assessment

### Response Strategy

For detected homework:
1. Focus on explaining concepts
2. Ask guiding questions
3. Break down problem into steps
4. Encourage independent thinking
