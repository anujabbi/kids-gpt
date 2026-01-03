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
- **AI**: OpenAI API (chat completions, image generation via DALL-E 3)
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

### Routes & Authentication

| Route | Component | Access |
|-------|-----------|--------|
| `/auth` | Auth | Public |
| `/` | Index (Chat) | Protected |
| `/settings` | Settings | Protected |
| `/parent-dashboard` | ParentDashboard | Parent only |
| `/child-chat/:childId` | ChildChatPage | Parent only |
| `/my-page` | PersonalizedPage | Child only |
| `/comic` | Comic | Child only |
| `/publishedComic/:id` | PublishedComic | Public |

`ProtectedRoute` component handles auth checks and role-based redirects.

### Key Patterns

**Context Providers**: App wrapped in `QueryClientProvider > ThemeProvider > AuthProvider > TooltipProvider`

**Role-Based Routes**: Uses `ProtectedRoute` with `requireRole` prop for parent/child access control

**Service Singletons**: Services export class instances (e.g., `export const openAIService = new OpenAIService()`)

**Theming**: Use `ThemedComponent` wrapper or `useTheme()` hook for consistent theme application

### Theme System

7 built-in themes defined in `ThemeContext.tsx`:
- Default (Green), Ocean Blue, **Purple Rain** (default), Pink Blossom, Cherry Red, Sunset Orange, Dark Mode

Colors applied via CSS variables (`--theme-primary`, `--theme-surface`, etc.) set dynamically on document root. Theme persisted to localStorage.

### Personality System

Located in `personalityService.ts` and `utils/systemPrompts.ts`:

1. Child takes 10-question AI-driven quiz (conversation type: `'personality-quiz'`)
2. AI extracts structured data: interests, hobbies, learning style, personality traits, dream job, reading preferences
3. Profile saved to `personality_profiles` table
4. System prompts personalized based on profile
5. Chat suggestions generated from profile in `utils/personalizedSuggestions.ts`

### Comic Feature

Located in `pages/Comic.tsx`, `services/comicService.ts`, `services/storyPlanningService.ts`:

1. Child enters story idea + selects art style (cartoon, ghibli, superhero, simple)
2. `storyPlanningService` generates story plan with characters and panel descriptions
3. Character images generated for consistency across panels
4. Each panel generated via DALL-E 3 with enhanced prompts from `utils/comicPrompts.ts`
5. Panels editable with dialogue; comics can be published and shared

### Database Tables

Key tables in Supabase:
- `profiles` - User data with role (parent/child), family_id, age
- `families` - Family groups with 6-char join codes
- `conversations` - Chat sessions (type: regular or personality-quiz)
- `messages` - Chat messages with attachments, generated images, homework scores
- `personality_profiles` - Quiz results and personality data
- `comics` - Created comics with panels stored as JSONB
- `family_api_keys` - Per-family OpenAI API keys

### Important Services

- `openAIService.ts`: Chat completions with family API key management, structured data extraction
- `conversationService.ts`: CRUD for conversations and folders
- `personalityService.ts`: Quiz extraction and profile management
- `imageGenerationService.ts`: DALL-E 3 image generation
- `comicService.ts`: Comic creation, panel regeneration, publishing
- `storyPlanningService.ts`: AI story planning for comics
- `homeworkDetectionService.ts`: Analyzes messages for homework misuse (returns 0-1 score)

### Data Flow
1. Supabase Auth manages sessions and user profiles (with `role: 'parent' | 'child'`)
2. Family API keys stored in Supabase, with localStorage fallback
3. AI requests go through `openAIService` with child-safe system prompts from `utils/systemPrompts.ts`
4. Conversations and messages stored in Supabase
5. User age stored in localStorage for age-appropriate responses

### Child Safety
- System prompts in `utils/systemPrompts.ts` enforce age-appropriate content
- Homework detection encourages learning over direct answers
- Safety protocol for detecting concerning content
- Parent dashboard for monitoring child activity

## Import Alias

Use `@/` for src directory imports: `import { Button } from "@/components/ui/button"`
