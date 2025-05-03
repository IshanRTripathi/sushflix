# Sushflix Layout Implementation Plan

## 1. Priority Order
1. **Core Layout Structure**
   - Responsive grid system
   - Main content area
   - Sidebar navigation
   - Header with profile picture
   - Theme toggle functionality

2. **Navigation Components**
   - Sidebar menu
   - Profile dropdown
   - More menu overlay

3. **Content Components**
   - Post card layout
   - Profile section
   - Follow button
   - Interaction buttons (like, comment, share, bookmark)

4. **Styling and Responsiveness**
   - 16:9 aspect ratio for content
   - Mobile-first approach
   - Dark/light theme support
   - Theme persistence across sessions

## 2. Component Structure

### Core Components
```typescript
// Layout components
src/components/layout/
├── AppLayout.tsx         // Main layout container
├── Sidebar.tsx           // Left navigation
├── Header.tsx            // Top header with profile
├── MoreMenu.tsx          // Overlay menu for "More" items

// Content components
src/components/content/
├── PostCard.tsx          // Main post layout
├── ProfileSection.tsx    // User profile display
├── InteractionButtons.tsx // Like, comment, share, bookmark buttons

// UI components
src/components/ui/
├── Button.tsx
├── Avatar.tsx
├── Card.tsx
├── Icon.tsx
```

## 3. Implementation Details

### 1. Core Layout (High Priority)
```typescript
// ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 bg-black border-r border-gray-800">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMoreClick={() => setIsMoreMenuOpen(true)} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>

        {/* More Menu Overlay */}
        {isMoreMenuOpen && (
          <MoreMenu onClose={() => setIsMoreMenuOpen(false)} />
        )}
      </div>
    </ThemeProvider>
  );
};
```

### 2. Post Card Layout
```typescript
// PostCard.tsx
interface PostCardProps {
  user: UserProfile;
  post: Post;
  isFollowing: boolean;
  onFollow: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
}

const PostCard = ({ user, post, isFollowing, ...handlers }: PostCardProps) => {
  return (
    <div className="bg-black rounded-lg p-4 mb-4">
      {/* Profile Section */}
      <div className="flex items-center mb-4">
        <Avatar src={user.profilePicture || '/default-avatar.png'} size="sm" />
        <div className="ml-3">
          <h3 className="text-white font-semibold">{user.displayName}</h3>
          <p className="text-gray-400 text-sm">Last seen online</p>
        </div>
        <button
          className={`ml-auto px-4 py-2 rounded-full ${
            isFollowing ? 'bg-gray-600' : 'bg-red-600'
          } text-white text-sm`}
          onClick={handlers.onFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Post Content */}
      <div className="mt-4">
        <p className="text-white mb-4">{post.caption}</p>
        <img
          src={post.mediaUrl}
          alt={post.caption}
          className="w-full aspect-video rounded-lg"
        />
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center mt-4 space-x-4">
        <InteractionButton
          icon="like"
          count={post.likes}
          onClick={handlers.onLike}
        />
        <InteractionButton
          icon="comment"
          count={post.comments}
          onClick={handlers.onComment}
        />
        <InteractionButton
          icon="share"
          onClick={handlers.onShare}
        />
        <InteractionButton
          icon="bookmark"
          onClick={handlers.onBookmark}
        />
      </div>
    </div>
  );
};
```

## 4. Styling and Layout

### Key CSS Classes
```css
/* Main layout */
.app-layout {
  display: grid;
  grid-template-columns: 256px 1fr;
  height: 100vh;
}

/* Post card */
.post-card {
  aspect-ratio: 16/9;
  max-width: 100%;
  border-radius: 1rem;
  background: #000;
  padding: 1rem;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}
```

## 5. State Management

### Context Structure
```typescript
// src/context/AppContext.tsx
interface AppContextType {
  user: User | null;
  isSidebarOpen: boolean;
  isMoreMenuOpen: boolean;
  selectedPost: Post | null;
  setSidebarOpen: (open: boolean) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setSelectedPost: (post: Post | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
```

## 6. Logging and Error Handling

### Implementation
```typescript
// src/utils/logger.ts
interface LogEvent {
  type: 'info' | 'error' | 'warning';
  component: string;
  action: string;
  data?: any;
  timestamp: number;
}

export const logger = {
  info: (component: string, action: string, data?: any) => {
    const event: LogEvent = {
      type: 'info',
      component,
      action,
      data,
      timestamp: Date.now()
    };
    console.log('[Sushflix]', event);
  },

  error: (component: string, error: Error, data?: any) => {
    const event: LogEvent = {
      type: 'error',
      component,
      action: error.message,
      data,
      timestamp: Date.now()
    };
    console.error('[Sushflix]', event);
  }
};
```

## 7. Development Phases

### Phase 1: Core Structure
- Implement basic layout grid
- Set up responsive design
- Create core components
- Basic navigation

### Phase 2: Navigation
- Complete sidebar menu
- Implement profile dropdown
- Add more menu overlay
- Set up routing

### Phase 3: Content
- Post card layout
- Interaction buttons
- Profile display
- Follow/unfollow functionality

### Phase 4: Styling & Polish
- Finalize responsive design
- Add animations/transitions
- Implement dark/light theme
- Performance optimization

## 8. Testing Strategy

### Unit Tests
- Component rendering
- State management
- Event handlers
- Error boundaries

### Integration Tests
- Navigation flow
- User interactions
- API integration
- State persistence

### E2E Tests
- Complete user flow
- Error scenarios
- Performance
- Responsive behavior

## 9. Performance Considerations

### Optimization Techniques
1. Virtual scrolling for posts
2. Lazy loading of images
3. Code splitting
4. Memoization of components
5. Debouncing input handlers
6. Efficient state updates

## 10. Error Handling

### Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    logger.error('ErrorBoundary', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

This implementation plan follows React best practices and includes:
- Proper component organization
- State management with context
- Comprehensive error handling
- Performance optimization
- Responsive design
- Logging for debugging
- Testing strategy

Would you like me to elaborate on any specific section or start implementing any particular component first?
