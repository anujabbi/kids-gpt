# KidsGPT Architecture

## Overview

KidsGPT follows a modern React application architecture with TypeScript for type safety. The application uses Supabase for backend services and integrates with OpenAI for AI functionality.

## Core Components

### Context Providers
- `AuthContext`: Manages authentication state, user profiles, and roles
- `ThemeContext`: Handles theming and visual customization

### Service Modules
- `openAIService`: Interacts with OpenAI API
- `conversationService`: Manages chat conversations and history
- `familyApiKeyService`: Handles API key management for families
- `personalityService`: Manages user personality profiles
- `imageGenerationService`: Handles AI image generation
- `analyticsService`: Tracks user behaviors and provides insights

### Pages
- `Auth`: User authentication (sign-in/sign-up)
- `Index`: Main chat interface
- `ChildChatPage`: Parent view of child's conversations
- `ParentDashboard`: Analytics and management for parents
- `PersonalizedPage`: Custom content based on personality profile
- `Settings`: User and application configuration

### Key Components
- `ChatInput`: Message composition with file upload support
- `MessageList`: Displays conversation history
- `ChildSummaryCard`: Shows insights about child's activity
- `MarkdownRenderer`: Formats AI responses with proper styling

## Data Flow

1. User authentication via Supabase Auth
2. User profile and preferences stored in Supabase database
3. Conversations processed through OpenAI with custom system prompts
4. Messages and attachments stored in Supabase 
5. Analytics events captured by PostHog

## Directory Structure

```
src/
  components/       # Reusable UI components
    ui/             # Base UI components from shadcn/ui
    sidebar/        # Sidebar related components
  contexts/         # React context providers
  hooks/            # Custom React hooks
  integrations/     # External service integrations
  lib/              # Utility functions
  pages/            # Main application pages
  services/         # API services
  types/            # TypeScript type definitions
  utils/            # Helper utilities
```

## Authentication Flow

1. User accesses the application
2. If no session exists, redirect to Auth page
3. User signs in with email/password or creates account
4. On successful authentication:
   - For children: Redirect to main chat interface or personalization wizard
   - For parents: Redirect to parent dashboard
5. Session management handled by Supabase client

## State Management

The application uses a combination of:
- React Context API for global state (auth, theme)
- Local component state using useState and useReducer
- Custom hooks to encapsulate business logic and API calls
