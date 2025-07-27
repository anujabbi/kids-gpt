# KidsGPT Test Checklist

## Critical Test Cases to Run After Every Change

### 🔐 Authentication & Authorization
- [ ] Sign in as parent works
- [ ] Sign in as child works  
- [ ] Sign out clears session
- [ ] Unauthenticated users redirect to /auth
- [ ] Parent role can access /parents dashboard
- [ ] Child role cannot access /parents dashboard
- [ ] Protected routes require authentication

### 🛣️ Routing & Navigation
- [ ] `/chat` redirects to `/`
- [ ] `/chats` redirects to `/`
- [ ] Unknown routes show 404 page
- [ ] Navigation between pages works
- [ ] Browser back/forward buttons work
- [ ] URL changes reflect current page

### 💬 Chat Functionality
- [ ] Can create new conversation
- [ ] Can send messages
- [ ] AI responses are generated
- [ ] Messages display correctly
- [ ] File attachments work
- [ ] Image generation works
- [ ] Conversation history persists

### 👨‍👩‍👧‍👦 Parent Features
- [ ] Parent can view children list
- [ ] Parent can access child conversations
- [ ] Parent can view analytics
- [ ] Child conversation summaries display
- [ ] Family API key management works
- [ ] Parent dashboard loads without errors

### 🎨 UI & Theming
- [ ] Light/dark theme toggle works
- [ ] Profile image selector works
- [ ] Responsive design on mobile
- [ ] Components render without errors
- [ ] Loading states display correctly
- [ ] Error states display correctly

### 🔧 Services & API
- [ ] Supabase connection works
- [ ] OpenAI API calls succeed
- [ ] File upload to storage works
- [ ] Database queries return data
- [ ] Error handling works properly
- [ ] Network failures are handled

### 📊 Data Management
- [ ] Conversations save to database
- [ ] Messages persist correctly
- [ ] User profiles load properly
- [ ] Family relationships work
- [ ] Folders and organization work
- [ ] Data isolation between users

## How to Run Tests

### Manual Testing
1. Run through each checklist item
2. Test on different devices/browsers
3. Test with different user roles
4. Test error scenarios

### Automated Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run cypress:run

# Run all tests
npm run test:all
```

### Critical Path Smoke Test
1. Sign in as parent
2. Create new conversation
3. Send message and get AI response
4. Navigate to parent dashboard
5. View child conversations
6. Sign out

### Regression Test
Run this checklist after any code changes to ensure no functionality is broken.

## Test Data Setup

### Test Users
- Parent: parent@test.com / password123
- Child: child@test.com / password123

### Test Conversations
- Should have sample conversations for testing
- Should include various message types
- Should include homework examples

### Test Files
- Sample images for upload testing
- Various file types for attachment testing
- Large files for error testing

## Performance Checklist
- [ ] Page load times under 3 seconds
- [ ] Chat responses under 5 seconds
- [ ] No memory leaks in long sessions
- [ ] Database queries are optimized
- [ ] Images load efficiently
- [ ] Smooth animations and transitions