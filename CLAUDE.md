# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KidsGPT is an AI-powered learning platform for children aged 5-12. It provides personalized AI chat experiences with parental oversight, homework guidance (not direct answers), and creative features like image generation and comic creation.

## Commands

```bash
npm run dev        # Start development server (port 8080)
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Git Workflow

When making changes, always follow this workflow:
1. Create a new feature branch (`git checkout -b feature/your-feature-name`)
2. Make changes and commit on that branch
3. Push the branch to remote
4. Create a Pull Request to merge into `main`

Never commit directly to `main`.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + SWC
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI API (chat completions, image generation)
- **Analytics**: PostHog

### Directory Structure
```
src/
  components/     # React components
    ui/           # shadcn/ui base components
    sidebar/      # Chat sidebar components
  contexts/       # AuthContext, ThemeContext
  hooks/          # Custom hooks (useConversations, useFileUpload, etc.)
  pages/          # Route pages (Index, Auth, Settings, ParentDashboard, etc.)
  services/       # API services (openAIService, conversationService, etc.)
  types/          # TypeScript interfaces (chat.ts, comic.ts)
  utils/          # Helpers (systemPrompts.ts, fileUtils.ts, etc.)
  integrations/   # Supabase client
supabase/
  functions/      # Edge functions
  migrations/     # Database migrations
```

### Key Patterns

**Context Providers**: App wrapped in `QueryClientProvider > ThemeProvider > AuthProvider > TooltipProvider`

**Role-Based Routes**: Uses `ProtectedRoute` with `requireRole` prop for parent/child access control

**Service Singletons**: Services export class instances (e.g., `export const openAIService = new OpenAIService()`)

**Theming**: Use `ThemedComponent` wrapper for consistent theme application

### Data Flow
1. Supabase Auth manages sessions and user profiles (with `role: 'parent' | 'child'`)
2. Family API keys stored in Supabase, with localStorage fallback
3. AI requests go through `openAIService` with child-safe system prompts from `utils/systemPrompts.ts`
4. Conversations and messages stored in Supabase
5. User age stored in localStorage for age-appropriate responses

### Important Services
- `openAIService.ts`: Handles all OpenAI API calls with family API key management
- `conversationService.ts`: CRUD for chat conversations
- `homeworkDetectionService.ts`: Analyzes messages for homework misuse
- `imageGenerationService.ts`: AI image generation with kid-safe prompts
- `comicService.ts`: Comic creation and publishing

### Child Safety
- System prompts in `utils/systemPrompts.ts` enforce age-appropriate content
- Homework detection encourages learning over direct answers
- Safety protocol for detecting concerning content
- Parent dashboard for monitoring child activity

## Import Alias

Use `@/` for src directory imports: `import { Button } from "@/components/ui/button"`
