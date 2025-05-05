# Profile Functionality Implementation Plan

## Context

### Current State
- We have a basic ProfilePage component that displays user profiles
- Existing Mongoose User model with UserProfile schema
- Basic loading and error handling implemented using React Query
- Theme system and LoadingStateContext already in place
- Using Google Cloud Storage for file uploads (bucket: user-profile-pictures-sushflix)
- Profile picture size limit: 2MB

### Goals
- Implement complete profile functionality including viewing, editing, and social features
- Create a robust backend API for profile operations
- Ensure proper state management and error handling
- Maintain consistent UI/UX across all profile-related features

## Database Changes Required

### User Collection Schema Updates
```typescript
interface UserDocument {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  profilePicture: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isCreator: boolean;
  
  // Social metrics
  followers: number;
  following: number;
  subscribers: number;
  posts: number;
  
  // Privacy settings
  isPrivate: boolean;
  allowComments: boolean;
  allowDirectMessages: boolean;
}
```

### New Collections
1. `followers` - For tracking follower relationships
2. `posts` - For storing user posts
3. `notifications` - For storing user notifications

## Implementation Steps

### Phase 1: Backend Setup

1. **API Endpoints**
   - GET /api/profile/:username - Get user profile
   - PUT /api/profile - Update profile
   - POST /api/profile/picture - Upload profile picture
   - POST /api/profile/follow - Follow/unfollow user
   - GET /api/profile/followers - Get followers list
   - GET /api/profile/following - Get following list
   - GET /api/profile/posts - Get user posts

2. **Services Implementation**
   - Create `profileService.ts` with all profile-related operations
   - Implement proper error handling and validation
   - Add caching strategy using Redis
   - Implement rate limiting for API endpoints

3. **Database Operations**
   - Create repository pattern for user operations
   - Implement transaction support for critical operations
   - Add proper indexes for performance optimization

### Phase 2: Frontend Components

1. **Profile Layout**
   - Create ProfileLayout component
   - Implement proper responsive design
   - Add loading states and error boundaries
   - Implement skeleton loading for better UX

2. **Profile Sections**
   - ProfileHeader - Display profile picture, name, bio
   - StatsSection - Show followers, following, posts count
   - PostsGrid - Display user posts in grid layout
   - SocialLinks - Display social media links
   - EditProfile - Form for editing profile information
   - CreatorToggle - Button to toggle creator status

3. **Interactive Features**
   - Follow/Unfollow button with proper state management
   - Profile picture upload with preview (using Google Cloud Storage)
   - Social links editing
   - Bio editing
   - Privacy settings
   - Creator status toggle

### Phase 3: State Management

1. **Contexts**
   - Create ProfileContext for managing profile state
   - Add ProfileProvider component
   - Implement proper state updates and loading states

2. **React Query Integration**
   - Use React Query for all profile data fetching
   - Implement proper caching and refetching
   - Add optimistic updates for interactive features
   - Implement stale-while-revalidate pattern

### Phase 4: UI/UX Improvements

1. **Loading States**
   - Implement skeleton loading for profile sections
   - Add loading indicators for interactive features
   - Proper error states with retry functionality

2. **Error Handling**
   - User-friendly error messages
   - Automatic retries for failed operations
   - Proper error boundaries
   - Toast notifications for user feedback

### Phase 5: Testing

1. **Unit Tests**
   - Test all profile-related components
   - Test API endpoints
   - Test service functions

2. **Integration Tests**
   - Test profile updates
   - Test follow/unfollow functionality
   - Test profile picture upload
   - Test social features

3. **End-to-End Tests**
   - Complete profile flow testing
   - Error scenarios
   - Performance testing

## Current Implementation Status

### Completed Components
1. **ProfileLayout**
   - Responsive design with proper nesting
   - Loading states and error handling
   - Skeleton loading implementation

2. **ProfileHeader**
   - Profile picture display with loading state
   - Display name and bio
   - Follow/Edit buttons with proper state management
   - Creator status indicator

3. **PostsGrid**
   - Grid layout with responsive breakpoints
   - Card-based post display
   - Hover effects and transitions
   - Image preview with CardMedia
   - Proper Grid2 usage from MUI v7

4. **EditProfile**
   - Form for editing profile information
   - Social links editing
   - Loading state management
   - Toast notifications for user feedback
   - Proper form validation

5. **LoadingStateContext**
   - Global loading state management
   - Loading indicators for interactive features
   - Loading state synchronization across components

6. **Toast System**
   - Custom hook for toast notifications
   - Auto-dismiss functionality
   - Success/error/warning/info variants
   - Proper type declarations

### Next Steps
1. Implement profile picture upload functionality
2. Add follow/unfollow functionality
3. Implement social metrics tracking
4. Add privacy settings
5. Implement creator status toggle

## Technical Considerations

1. **Security**
   - Implement proper authentication checks
   - Validate all inputs
   - Sanitize user data
   - Implement rate limiting
   - Add proper CORS configuration

2. **Performance**
   - Implement caching strategy using Redis
   - Optimize database queries
   - Lazy load profile sections
   - Implement proper image optimization
   - Use Google Cloud Storage for file uploads

3. **Scalability**
   - Design for horizontal scaling
   - Implement proper database indexing
   - Use Redis for caching
   - Implement proper error handling

## Files to Modify/Create

### Backend
- `src/services/profileService.ts`
- `src/controllers/profileController.ts`
- `src/routes/profileRoutes.ts`
- `src/models/User.js`
- `src/models/Follower.js`
- `src/models/Post.js`
- `src/models/Notification.js`

### Frontend
- `src/components/profile/ProfileLayout.tsx`
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/StatsSection.tsx`
- `src/components/profile/PostsGrid.tsx`
- `src/components/profile/SocialLinks.tsx`
- `src/components/profile/EditProfile.tsx`
- `src/components/profile/ProfileContext.tsx`
- `src/contexts/ProfileContext.tsx`
- `src/types/profile.ts`
- `src/services/profileService.ts`

## Dependencies

1. **Packages**
   - @tanstack/react-query
   - react-dropzone
   - cloudinary-core
   - @heroicons/react
   - react-toastify

2. **Dev Dependencies**
   - @testing-library/react
   - jest
   - supertest
   - mongoose-memory-server

## Next Steps

1. Start with Phase 1 - Backend Setup
   - Create database schema
   - Implement API endpoints
   - Set up services layer

2. Move to Phase 2 - Frontend Components
   - Create basic profile layout
   - Implement profile sections
   - Add loading states

3. Continue with Phase 3 - State Management
   - Set up ProfileContext
   - Integrate React Query
   - Implement state updates

4. Focus on Phase 4 - UI/UX Improvements
   - Add loading states
   - Implement error handling
   - Add user feedback

5. Finally, Phase 5 - Testing
   - Write unit tests
   - Create integration tests
   - Run end-to-end tests
