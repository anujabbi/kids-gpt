# Component Documentation

## UI Components

### AppHeader
- **Purpose**: Main navigation header with title and actions
- **Props**: None
- **State**: Uses theme context for styling

### AppSidebar
- **Purpose**: Navigation sidebar for conversations and settings
- **Props**: None
- **State**: Conversation list from useConversations hook

### ChatInput
- **Purpose**: Message composition with file upload functionality
- **Props**: 
  - `onSendMessage`: Callback for message submission
  - `isDisabled`: Optional flag to disable input
- **State**: 
  - Message text
  - File attachments
  - Upload progress

### ChatMessage
- **Purpose**: Displays a single message in the conversation
- **Props**: 
  - `message`: Message object with content and metadata
- **Features**:
  - Markdown rendering
  - File attachment display
  - Homework detection badge
  - Image display with print option

### ChildActivityMonitoring
- **Purpose**: Shows activity patterns for parents
- **Props**:
  - `childId`: ID of child to monitor
- **Features**:
  - Activity charts
  - Topic analysis
  - Learning pattern visualization

### MessageList
- **Purpose**: Container for conversation messages
- **Props**:
  - `messages`: Array of message objects
  - `isLoading`: Optional loading state flag
- **Features**:
  - Auto-scrolling to latest message
  - Loading state handling

### MarkdownRenderer
- **Purpose**: Renders markdown content with syntax highlighting
- **Props**:
  - `content`: Markdown string to render
  - `className`: Optional CSS class name
- **Features**:
  - Code syntax highlighting
  - Math formula rendering
  - Table formatting

### ImageGenerationDialog
- **Purpose**: Interface for creating AI-generated images
- **Props**:
  - `isOpen`: Whether dialog is visible
  - `onClose`: Callback when dialog closes
  - `onGenerate`: Callback when image generation requested
- **State**:
  - Prompt text
  - Image size selection
  - Generation status

### ProfileImageSelector
- **Purpose**: Interface for selecting or uploading profile images
- **Props**:
  - `currentImage`: Current profile image URL
  - `onSelect`: Callback when image selected
- **Features**:
  - Preset avatar selection
  - Custom image upload
  - Image cropping and resizing

## Layout Components

### ThemedComponent
- **Purpose**: Wrapper that applies theme styles to children
- **Props**:
  - `variant`: Visual style variant
  - `className`: Additional CSS classes
  - `children`: React children
- **Features**:
  - Consistent theming
  - Dark/light mode support
  - Animation support

### ProtectedRoute
- **Purpose**: Route wrapper that enforces authentication
- **Props**:
  - `children`: React children
  - `requiredRole`: Optional role requirement
- **Features**:
  - Redirects unauthenticated users
  - Validates user role permissions
  - Loading state during auth check

## Parent Dashboard Components

### ChildSummaryCard
- **Purpose**: Displays summary information about a child
- **Props**:
  - `childId`: ID of child to display
  - `compact`: Optional flag for condensed view
- **Features**:
  - Activity stats
  - Recent topics
  - Learning progress

### FamilyManagement
- **Purpose**: Interface for managing family members
- **Props**: None
- **State**:
  - Family members list
  - Invitation status
  - Family code
- **Features**:
  - Add/remove family members
  - Generate family invitation code
  - Manage child account settings

### ParentAnalytics
- **Purpose**: Analytics dashboard for parents
- **Props**:
  - `childId`: Optional ID to filter for specific child
- **Features**:
  - Usage statistics
  - Learning topic breakdown
  - Homework assistance tracking
