# Loading Context Migration Guide

This guide will help you migrate from the old loading contexts (`LoadingContext` and `LoadingStateContext`) to the new unified `LoadingContextV2`.

## What's New

- **Unified API**: Single context for all loading state management
- **Better TypeScript Support**: Improved type safety and intellisense
- **More Features**: Built-in support for loading time tracking, error handling, and async operations
- **Backward Compatibility**: Drop-in replacement for existing code

## Migration Steps

### 1. Update Imports

#### Before:
```typescript
import { useLoading } from '../../contexts/LoadingContext';
// or
import { useLoadingState } from '../../contexts/LoadingStateContext';
```

#### After:
```typescript
import { useLoadingContext } from '../../contexts/LoadingContextV2';
// For backward compatibility
import { useLoadingState } from '../../contexts/LoadingContextV2';
```

### 2. Update Provider Setup

#### Before:
```tsx
<LoadingProvider>
  <LoadingStateProvider>
    <App />
  </LoadingStateProvider>
</LoadingProvider>
```

#### After:
```tsx
<LoadingProvider>
  <App />
</LoadingProvider>
```

### 3. Update Hook Usage

#### Simple Loading State

##### Before:
```typescript
const { isLoading, startLoading, stopLoading } = useLoading();
// or
const { loadingState, setLoadingState } = useLoadingState();
```

##### After:
```typescript
const { isLoading, startLoading, stopLoading } = useLoadingContext();
// or (for backward compatibility)
const { loadingState, setLoadingState } = useLoadingState();
```

#### Async Operations

##### Before:
```typescript
const { withLoading } = useLoading();

const fetchData = withLoading(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

##### After:
```typescript
const { wrapAsync } = useLoadingContext();

const fetchData = wrapAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

### 4. New Features

#### Multiple Loading States
```typescript
const { 
  getLoadingState, 
  startLoading, 
  stopLoading 
} = useLoadingContext();

// Start a specific loading state
startLoading('userProfile');

// Check loading state
const { isLoading } = getLoadingState('userProfile');

// Stop loading with optional error
stopLoading('userProfile', error);
```

#### Loading Time Tracking
```typescript
const { getLoadingTime } = useLoadingContext();

// Get loading time in milliseconds
const loadingTime = getLoadingTime('default');
```

### 5. Deprecations

The following features are deprecated but still available for backward compatibility:

- `useLoading` hook (use `useLoadingContext` instead)
- `useLoadingState` hook (use `useLoadingContext` directly)
- `loadingState` and `setLoadingState` in the context value

## Migration Checklist

- [ ] Update all imports to use the new context
- [ ] Remove any nested `LoadingStateProvider` usages
- [ ] Update component implementations to use the new API
- [ ] Test all loading states and error handling
- [ ] Remove old context files after migration is complete

## Troubleshooting

### Loading states not updating
Make sure you're using the correct loading ID when working with multiple loading states.

### Type errors
Check that you're using the correct types from the new context. The API has been updated to be more type-safe.

### Performance issues
If you notice performance issues, make sure to use the appropriate loading IDs to prevent unnecessary re-renders.
