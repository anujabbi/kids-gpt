# Coding Standards and Patterns

## TypeScript Guidelines

- Use explicit typing for function parameters and return values
- Prefer interfaces for object types that might be extended
- Use type guards for runtime type checking
- Leverage TypeScript's utility types (Partial, Omit, Pick)

## Component Patterns

### Functional Components

- Use functional components with hooks
- Prefer destructuring props in function parameters
- Keep components focused on a single responsibility
- Use composition over complex conditional rendering

```typescript
// Example component pattern
export function FeatureComponent({ 
  title, 
  description, 
  isActive = false 
}: FeatureComponentProps) {
  const { currentTheme } = useTheme();
  
  return (
    <ThemedComponent variant="surface">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {isActive && <ActiveIndicator />}
    </ThemedComponent>
  );
}
```

### Theming Pattern

Use the `ThemedComponent` wrapper to maintain consistent styling:

```typescript
<ThemedComponent variant="background" className="min-h-screen">
  {children}
</ThemedComponent>
```

## State Management

- Use React Context for global state (auth, theme)
- Use local component state for UI-specific state
- Use custom hooks to encapsulate state logic and API calls
- Prefer reducer pattern for complex state management

## Service Pattern

Organize external API calls in service modules:

```typescript
// Example service pattern
export class ExampleService {
  async fetchData(id: string): Promise<Data> {
    // Implementation
  }
  
  async updateData(id: string, data: UpdatePayload): Promise<Response> {
    // Implementation
  }
}

// Export singleton instance
export const exampleService = new ExampleService();
```

## Naming Conventions

- **Components**: PascalCase (e.g., `ChatInput`, `MessageList`)
- **Custom hooks**: camelCase with 'use' prefix (e.g., `useConversations`, `useTheme`)
- **Interfaces**: PascalCase with descriptive names (e.g., `UserProfile`, `MessageProps`)
- **Type aliases**: PascalCase, usually ending with 'Type' (e.g., `ConversationType`)
- **Constants**: UPPERCASE_WITH_UNDERSCORES for true constants, camelCase for configuration values
- **Files**: Same case as the primary export (PascalCase for components, camelCase for utilities)

## File Organization

- Group related files by feature or domain when possible
- Keep component files focused on a single component
- Co-locate tests with the code they test
- Use index files to simplify imports

## Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Handle edge cases explicitly
- Use error boundaries for component errors

```typescript
try {
  const result = await apiService.fetchData();
  setData(result);
} catch (error) {
  console.error("Failed to fetch data:", error);
  setError("Unable to load data. Please try again later.");
}
```

## Performance Optimization

- Memoize expensive calculations with `useMemo`
- Prevent unnecessary re-renders with `React.memo`
- Memoize callback functions with `useCallback`
- Use virtualization for long lists
- Implement proper loading states

```typescript
// Example of optimized component
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // Implementation
  }, []);
  
  return (
    // Component JSX
  );
});
```

## Testing Patterns

- Test component rendering and user interactions
- Mock external dependencies
- Use data-testid attributes for test selectors
- Write focused, isolated tests
