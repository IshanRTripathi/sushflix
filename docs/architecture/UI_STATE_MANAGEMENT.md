# UI State Management

This document outlines the architecture and patterns used for managing UI state in the SushFlix application.

## Overview

The UI state management system is built using React Context and custom hooks to provide a centralized way to manage UI-related state across the application. This includes:

- Modal dialogs
- Sidebar state
- Navigation menus
- Toast notifications
- Loading states

## Architecture

### UIContext

The `UIContext` is the central hub for all UI-related state. It provides:

- Global state for UI components
- Methods to update the state
- Helper functions for common UI patterns

```typescript
interface UIContextType {
  // Navigation
  isSidebarOpen: boolean;
  isMoreMenuOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleMoreMenu: () => void;
  toggleMobileMenu: () => void;
  closeAllMenus: () => void;
  openMoreMenu: () => void;
  closeMoreMenu: () => void;
}
```

## Usage

### Accessing UI State

```typescript
import { useUI } from '@/contexts/UIContext';

function MyComponent() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  
  return (
    <div>
      <button onClick={toggleSidebar}>
        {isSidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
    </div>
  );
}
```

### Best Practices

1. **Use Custom Hooks**: Create custom hooks for complex UI logic
2. **Memoize Callbacks**: Use `useCallback` for functions passed as props
3. **Optimize Rerenders**: Use React.memo for pure components
4. **Clean Up**: Always clean up event listeners and subscriptions

## Components

### AppLayout

Main layout component that provides the overall structure and manages:
- Page layout
- Responsive behavior
- Modal overlays

### Navigation

Handles:
- Main navigation menu
- User menu
- Mobile responsiveness

### Sidebar

Manages:
- Sidebar visibility
- Navigation links
- Responsive behavior

## State Management Flow

1. **State Updates**: Components request state changes through context methods
2. **State Propagation**: Changes are propagated to all subscribed components
3. **Rerender**: Only affected components rerender

## Performance Considerations

- **Memoization**: Use `useMemo` for expensive calculations
- **Selective Rerenders**: Split context to prevent unnecessary rerenders
- **Lazy Loading**: Code split components where possible

## Testing

When testing components that use UI state:

1. Mock the `useUI` hook
2. Test different states independently
3. Verify proper cleanup

## Future Improvements

1. Add state persistence for user preferences
2. Implement more granular context providers
3. Add animations for state transitions
4. Improve error boundaries
5. Add more comprehensive TypeScript types
