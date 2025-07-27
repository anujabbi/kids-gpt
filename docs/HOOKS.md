# Custom Hooks Reference

## Authentication Hooks

### `useAuth`
Provides user authentication state and methods.

```typescript
const { user, profile, loading, signIn, signUp, signOut } = useAuth();
```

**Returns:**
- `user`: Current authenticated user or null
- `profile`: User profile data
- `loading`: Authentication loading state
- `signIn`: Function to authenticate user
- `signUp`: Function to create new user
- `signOut`: Function to log out current user

## Theme Hooks

### `useTheme`
Manages application theme settings.

```typescript
const { currentTheme, setTheme, themes, isDarkMode, toggleDarkMode } = useTheme();
```

**Returns:**
- `currentTheme`: Current theme object
- `setTheme`: Function to change theme
- `themes`: Available theme options
- `isDarkMode`: Whether dark mode is active
- `toggleDarkMode`: Function to toggle dark/light mode

## Conversation Management

### `useConversations`
Handles chat conversation data.

```typescript
const {
  conversations,
  currentConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  setCurrentConversation,
  isLoading
} = useConversations();
```

**Returns:**
- `conversations`: Array of conversation objects
- `currentConversation`: Currently selected conversation
- `createConversation`: Function to start new conversation
- `updateConversation`: Function to modify conversation
- `deleteConversation`: Function to remove conversation
- `setCurrentConversation`: Function to change active conversation
- `isLoading`: Loading state

### `useOpenAI`
Manages OpenAI API interactions.

```typescript
const {
  generateCompletion,
  streamingCompletion,
  abortCompletion,
  isGenerating
} = useOpenAI();
```

**Returns:**
- `generateCompletion`: Function to get AI response
- `streamingCompletion`: Function to stream AI response
- `abortCompletion`: Function to cancel generation
- `isGenerating`: Whether generation is in progress

## Child-Specific Hooks

### `useChildSummary`
Gets activity summaries for children.

```typescript
const { summary, isLoading, refreshSummary } = useChildSummary(childId);
```

**Parameters:**
- `childId`: ID of child to get summary for

**Returns:**
- `summary`: Activity summary data
- `isLoading`: Loading state
- `refreshSummary`: Function to update summary data

### `useParentAnalytics`
Provides analytics data for parent dashboard.

```typescript
const {
  activityData,
  topicData,
  learningPatterns,
  isLoading
} = useParentAnalytics(childId);
```

**Parameters:**
- `childId`: Optional ID to filter for specific child

**Returns:**
- `activityData`: Usage statistics
- `topicData`: Topics discussed
- `learningPatterns`: Learning behavior analysis
- `isLoading`: Loading state

## Media Management

### `useFileUpload`
Handles file attachment uploads.

```typescript
const {
  uploadFile,
  deleteFile,
  uploadProgress,
  isUploading
} = useFileUpload();
```

**Returns:**
- `uploadFile`: Function to upload file
- `deleteFile`: Function to remove file
- `uploadProgress`: Current upload progress (0-100)
- `isUploading`: Whether upload is in progress

### `useImageGeneration`
Manages AI image creation.

```typescript
const {
  generateImage,
  isGenerating,
  generatedImages
} = useImageGeneration();
```

**Returns:**
- `generateImage`: Function to create AI image
- `isGenerating`: Whether generation is in progress
- `generatedImages`: Array of generated image objects

## UI Hooks

### `useMobile`
Detects mobile device usage for responsive design.

```typescript
const isMobile = useMobile();
```

**Returns:**
- `isMobile`: Boolean indicating if viewport is mobile size

### `useToast`
Provides toast notification functionality.

```typescript
const { toast } = useToast();
```

**Returns:**
- `toast`: Function to show toast notification
