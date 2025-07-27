# Environment and Configuration

## Required Environment Variables

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_HOST=api.openai.com
VITE_POSTHOG_HOST=app.posthog.com
VITE_POSTHOG_KEY=your-posthog-key
```

## Configuration Files

### `vite.config.ts`
Contains build configuration including:
- Development server settings
- Path aliases
- Plugin configuration
- Build optimization settings
- Environment variable handling

### `tailwind.config.ts`
Defines theme settings including:
- Color palette
- Typography
- Component styling
- Dark mode configuration
- Custom animations

### `tsconfig.json`
TypeScript compiler settings:
- Target ECMAScript version
- Module resolution strategy
- Type checking rules
- Path aliases
- Strict type checking options

## Feature Flags and Configuration

You can configure various application features by modifying the appropriate environment variables or configuration files:

### OpenAI Configuration
- Model selection
- Temperature settings
- Maximum token limits
- Image generation quality

### Supabase Configuration
- Database table structures
- Storage bucket policies
- Authentication settings
- Row-level security policies

### UI Configuration
- Theme color schemes
- Default theme preference
- Font settings
- Animation toggles

## Security Configuration

### Content Filtering
- Profanity filter settings
- Topic blocking rules
- Image safety filters

### Authentication
- Password requirements
- Session duration
- Multi-factor authentication settings
- Account recovery options

### Data Privacy
- Data retention policies
- User data anonymization
- Analytics data collection consent

## Development Environment Setup

1. Clone the repository
2. Install dependencies with `npm install` or `bun install`
3. Create a `.env.local` file with the required environment variables
4. Start the development server with `npm run dev`

## Production Deployment

### Build Configuration
- Static site generation settings
- Optimization settings
- Asset handling
- Environment variable injection

### Hosting Options
- Vercel deployment
- Netlify configuration
- Self-hosted options
- Docker containerization
