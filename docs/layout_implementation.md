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

### Authentication
```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const login = async (usernameOrEmail: string, password: string) => {
    // Implementation
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Theme System
```typescript
// ThemeContext.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? (savedTheme as 'light' | 'dark') : 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Profile Page
```typescript
// ProfilePage.tsx
export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Fetch user data using ProfileService
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => profileService.getUserPosts(username || ''),
    enabled: !!username,
  });

  // Handle errors
  useEffect(() => {
    if (postsError || statsError) {
      setError('Failed to load profile data. Please try again later.');
    } else {
      setError(null);
    }
  }, [postsError, statsError]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Profile Section */}
      <ProfileSection
        user={currentUser}
        isFollowing={!isOwnProfile}
        onFollow={handleFollow}
        posts={stats?.posts || 0}
        followers={stats?.followers || 0}
        following={stats?.following || 0}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {posts?.map((post) => (
          <PostCard
            key={post.id}
            user={currentUser}
            post={post}
            isFollowing={!isOwnProfile}
            onFollow={handleFollow}
          />
        ))}
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-lg text-white">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Component Structure

### Header
```tsx
// Header.tsx
export function Header({ onMoreClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center px-4">
      <div className="flex items-center justify-between w-full">
        <Link to="/" className="text-white text-xl font-bold">
          Sushflix
        </Link>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button onClick={handleMenuClick}>
            <svg>...</svg>
          </button>
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button onClick={handleMenuClick}>
                  <svg>...</svg>
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-lg shadow-lg ${isMenuOpen ? 'block' : 'hidden'}`}>
                  <div className="py-2">
                    <Link to="/profile" onClick={handleMenuClick}>Profile</Link>
                    <Link to="/settings" onClick={handleMenuClick}>Settings</Link>
                    <button onClick={logout}>Logout</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{user?.displayName}</span>
                <img src={user?.profilePicture} alt="Profile" className="w-8 h-8 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Navigation
- Home
- Explore
- Profile
- Settings
- Logout

### Profile Page Components
- ProfileSection
- PostCard
- ErrorModal
- LoadingSpinner

## Technical Details

### State Management
- React Context for global state
- Local state for component-specific state
- Proper state lifting for shared state
- UseQuery for data fetching

### Routing
- React Router for navigation
- Protected routes for authenticated content
- Route guards for access control
- Proper redirection after login

### UI Components
- Reusable button components
- Loading spinners
- Error modals
- Toast notifications
- Responsive grid layouts

### Error Handling
- Global error state
- Error modals with close functionality
- Loading states for async operations
- Proper error messages for users

### Responsive Design
- Mobile-first approach
- Collapsible menus
- Responsive grid layouts
- Proper spacing and padding
- Touch-friendly buttons

## Next Steps

### High Priority
1. **Profile Page Features**
   - Implement post creation
   - Add post editing
   - Implement post deletion
   - Add post comments

2. **UI/UX Improvements**
   - Add animations for transitions
   - Improve loading states
   - Add skeleton loading
4. **UI/UX Improvements**
   - Add loading states
   - Add error handling
   - Improve error messages
   - Add success messages for actions

## 7. Logging and Error Handling

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
