# Development Guide

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Start development server: `npm run dev`

## Development Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes following the coding standards
3. Test your changes locally
4. Commit with descriptive messages
5. Push your branch and create a pull request

## Common Development Tasks

### Adding a New Component

1. Create the component file in the appropriate directory
2. Define the component's props interface
3. Implement the component with proper TypeScript types
4. Export the component
5. Update index files if needed

Example:
```typescript
// src/components/NewFeature.tsx
import React from 'react';
import { ThemedComponent } from './ThemedComponent';
import { useTheme } from '@/contexts/ThemeContext';

interface NewFeatureProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export function NewFeature({ 
  title,
  description,
  onAction
}: NewFeatureProps) {
  const { currentTheme } = useTheme();
  
  return (
    <ThemedComponent variant="surface">
      <h3 className="text-xl font-bold">{title}</h3>
      {description && <p className="mt-2">{description}</p>}
      {onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Take Action
        </button>
      )}
    </ThemedComponent>
  );
}
```

### Adding a New API Integration

1. Create a new service class in the `/services` directory
2. Implement methods for API interactions
3. Add proper error handling and types
4. Export a singleton instance of the service

Example:
```typescript
// src/services/newApiService.ts
import { supabase } from '@/integrations/supabase';

interface ApiResponse {
  id: string;
  name: string;
  data: Record<string, any>;
}

export class NewApiService {
  private baseUrl = 'https://api.example.com';
  
  async fetchData(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/data/${id}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }
  
  async createData(data: Omit<ApiResponse, 'id'>): Promise<ApiResponse> {
    // Implementation
  }
}

export const newApiService = new NewApiService();
```

### Adding a New Page

1. Create the page component in the `/pages` directory
2. Add the route in `App.tsx`
3. Implement authentication protection if needed
4. Add navigation links to the new page

Example:
```typescript
// src/pages/NewFeaturePage.tsx
import React from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ThemedComponent } from '@/components/ThemedComponent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function NewFeaturePage() {
  return (
    <ProtectedRoute>
      <ThemedComponent variant="background" className="min-h-screen">
        <AppHeader />
        <main className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">New Feature</h1>
          {/* Page content */}
        </main>
      </ThemedComponent>
    </ProtectedRoute>
  );
}

// Add to App.tsx routes
<Route path="/new-feature" element={<NewFeaturePage />} />
```

## Working with Supabase

### Database Operations

```typescript
// Fetch data example
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// Insert data example
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column1: value1, column2: value2 }])
  .select();
```

### Authentication

```typescript
// Sign up a new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      role: 'child',
      name: 'User Name',
    },
  },
});

// Sign in a user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

## Working with OpenAI

### Chat Completion

```typescript
const response = await openAIService.generateChatCompletion([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userMessage },
]);

// Handle the response
if (response) {
  // Process successful response
} else {
  // Handle error
}
```

### Image Generation

```typescript
const image = await imageGenerationService.generateImage(
  prompt,
  { size: '1024x1024', quality: 'standard' }
);

// Save image reference
const { data, error } = await supabase
  .from('generated_images')
  .insert({
    user_id: userId,
    prompt: prompt,
    image_url: image.url,
  })
  .select();
```

## Performance Optimization

- Use React.memo for components that render often but rarely change
- Implement virtualized lists for long message histories
- Optimize image loading with proper sizing and lazy loading
- Use debounce for search inputs and other frequent user interactions

## Debugging Tips

- Use the React Developer Tools browser extension
- Check the browser console for errors
- Set up logging for key operations
- Use breakpoints in the browser debugger or VS Code
