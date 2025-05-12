# Types Cleanup

## Overview
This document tracks the cleanup and optimization of type definitions in the codebase.

## Current Status
- **Status**: In Progress
- **Last Updated**: 2025-05-13
- **Target Directories**: 
  - `/src/types`
  - `/src/components/*/types.ts`
  - Component prop types
- **Blocked By**: None
- **Progress**: 85% complete

## Type Categories

## Type Audit Findings

### 1. Core Types
- [x] **User-related types**
  - [x] `User` interface (in `types/index.ts`)
  - [x] `UserProfile` (consolidated in `types/user.ts`)
  - [x] `AuthState` (in `types/auth.ts`)
  - [x] `UserPreferences` (in `types/user.ts`)
  - [x] `Creator` interface (in `types/index.ts`)
  - [x] `SubscriptionLevel` (in `types/index.ts`)
  - [x] `UserStats` (in `types/user.ts`)
  - [x] `SocialLinks` (in `types/user.ts`)
  - [x] `UserRole` (in `types/user.ts`)
  - [x] `UserSearchResult` (in `types/user.ts`)
  - [x] `FeaturedProfile` (in `types/user.ts`)
  - [x] `ProfileInput` (in `types/user.ts`)
  - [x] `UserSettingsUpdate` (in `types/user.ts`)

- [x] **Content Types**
  - [x] `Content` interface (in `types/index.ts`)
  - [x] `Comment` (consolidated in `types/index.ts` and `components/content/components/types.ts`)
  - [x] `ContentCardProps` (in `components/content/types.ts` and `components/content/components/types.ts`)
  - [x] `Post` (in `components/content/PostCard.tsx`)
  - [x] `Category` (in `components/content/ContentCategories.tsx`)
  - [x] `ContentCategories` props (in `components/content/ContentCategories.tsx`)

- [x] **API Response Types**
  - [x] `ApiResponse<T>` (in `types/user.ts`)
  - [x] `PaginatedResult<T>` (in `types/user.ts`)
  - [x] `ErrorResponse` (part of `ApiResponse` in `types/user.ts`)

- [x] **State Management**
  - [x] `AuthState` (in `types/auth.ts`)
  - [x] `UserStats` (in `types/user.ts`)
  - [x] `SocialLinks` (in `types/user.ts`)
  - [x] `LoadingState` (in `contexts/LoadingStateContext.tsx`)
  - [ ] `AppState` (not needed - using React Context)
  - [ ] `UIState` (not needed - using component state)

### 2. Component Props
- [x] **Shared Props**
  - [x] `ButtonProps` (in `components/ui/Button.tsx`)
  - [x] `CardProps` (in `components/ui/Card.tsx`)
  - [x] `IconButtonProps` (in `components/ui/IconButton.tsx`)
  - [ ] `BaseProps` (not implemented - consider if needed)
  - [ ] `ThemeableProps` (not implemented - using MUI theming)
  - [ ] `AccessibilityProps` (partially implemented in components)

- [x] **Form Components**
  - [x] `ProfileFormData` (in `components/profile/types.ts`)
  - [x] `FormData` (in `types/auth.ts`)
  - [x] `FormErrors` (in `types/auth.ts`)
  - [x] `LoginFormProps` (in `components/auth/LoginForm.tsx`)
  - [x] `ProfileFormState` (in `components/profile/form/ProfileFormState.ts`)
  - [ ] `FormFieldProps` (partially implemented in form components)
  - [x] `ButtonProps` (in `components/ui/Button.tsx`)
  - [ ] `InputProps` (partially implemented in form components)

- [x] **Layout Components**
  - [x] `LayoutProps` (in `components/layout/ProfileLayout.tsx`)
  - [x] `ContainerProps` (using MUI Container props)
  - [x] `GridProps` (using MUI Grid props)
  - [x] `ProfileLayoutProps` (in `components/profile/ProfileLayout.tsx`)

- [x] **Content Components**
  - [x] `ContentCardProps` (in `components/content/types.ts` and `components/content/components/types.ts`)
  - [x] `PostCardProps` (in `components/content/PostCard.tsx`)
  - [x] `ContentCategoriesProps` (in `components/content/ContentCategories.tsx`)
  - [x] `ProfileSectionProps` (in `components/content/ProfileSection.tsx`)
  - [x] `SubscriptionPlansProps` (in `components/subscription/SubscriptionPlans.tsx`)

### 3. API & Database Types
- [x] **Request Types**
  - [x] `LoginRequest` (as `FormData` in `types/auth.ts`)
  - [x] `ProfileInput` (in `types/user.ts`)
  - [x] `UserSettingsUpdate` (in `types/user.ts`)
  - [x] `PartialProfileUpdate` (in `types/user.ts`)
  - [x] `FeaturedProfileConfig` (in `types/user.ts`)
  - [ ] `CreatePostRequest` (not implemented - needed for future features)
  - [ ] `UpdatePostRequest` (not implemented - needed for future features)

- [x] **Query Parameters**
  - [x] `PaginationParams` (part of `PaginatedResult` in `types/user.ts`)
  - [ ] `SortingParams` (not implemented - needed for future features)
  - [ ] `FilterParams` (not implemented - needed for future features)

- [x] **Error Types**
  - [x] `ApiError` (part of `ApiResponse` in `types/user.ts`)
  - [x] `FormErrors` (in `types/auth.ts`)
  - [x] `ProfileErrors` (in `components/profile/types.ts`)
  - [ ] `NetworkError` (handled by error boundaries and API client)

- [x] **Database Types** (in `types/database.ts`)
  - [x] `IUser` (Mongoose model)
  - [x] `IUserProfile` (Mongoose model)
  - [x] `IUserStats` (Mongoose model)
  - [x] `ISubscription` (Mongoose model)
  - [x] `ISocialLinks` (Mongoose model)
  - [x] `IUserRelationship` (Mongoose model)
  - [x] `IUserPreferences` (Mongoose model)
  - [x] `ISubscriptionTier` (Mongoose model)
  - [x] `IDailyStat` (Mongoose model)
  - [x] `IMonthlyStat` (Mongoose model)

## Type Cleanup Plan

### 1. Type Consolidation - COMPLETED
- [x] **Resolved Duplicates**
  - [x] Consolidated `UserProfile` types into `types/user.ts`
  - [x] Standardized `SocialLinks` interface in `types/user.ts`
  - [x] Consolidated `Comment` types between `types/index.ts` and `components/content/components/types.ts`
  - [x] Standardized form error types across the application

### 2. Naming Conventions - IN PROGRESS
- [x] **Standardized Naming**
  - [x] Using `I` prefix for database interfaces (e.g., `IUser`, `IUserProfile`)
  - [x] Using regular interfaces for application types (e.g., `UserProfile`, `Content`)
  - [x] Standardized file naming:
    - `types/*.ts` for core type definitions
    - `components/*/types.ts` for component-specific types
- [x] **Type Organization**
  - [x] Grouped related types by domain (user, content, auth, etc.)
  - [x] Created dedicated type files for database models

### 3. Type Definitions Enhancement - COMPLETED
- [x] **Added Missing Types**
  - [x] Added comprehensive user and profile types
  - [x] Added content and post-related types
  - [x] Added API response types with proper generics
  - [x] Added database model interfaces
  - [x] Added form and validation types

- [x] **Type Safety**
  - [x] Replaced most `any` types with proper types
  - [x] Added proper generics for reusable types (e.g., `ApiResponse<T>`, `PaginatedResult<T>`)
  - [x] Ensured type safety in function parameters and return types
  - [x] Added type guards where needed

### 4. Type Organization - COMPLETED
- [x] **File Structure**
  ```
  src/
    types/
      index.ts         # Main type exports
      user.ts          # User-related types
      auth.ts          # Authentication types
      database.ts      # Database model interfaces
      
    components/     
      component-name/
        types.ts      # Component-specific types
        
    services/
      api/
        types/       # API-specific types
  ```
  
- [x] **Barrel Exports**
  - [x] Centralized type exports in `types/index.ts`
  - [x] Organized types by feature and domain
  - [x] Maintained consistent import patterns

- [ ] **Documentation**
  - [ ] Add JSDoc to all types
  - [ ] Document type relationships
  - [ ] Add usage examples for complex types
  - [ ] Document type guards and utility types

### 5. Documentation & Best Practices - IN PROGRESS
- [x] **JSDoc Comments**
  - [x] Added JSDoc comments to all major types
  - [x] Documented type properties and methods
  - [x] Added examples for complex types
  - [ ] Need to complete documentation for all utility types

```typescript
/**
 * Represents a user in the system
 * @interface User
 * @property {string} id - Unique user identifier
 * @property {string} username - User's display name
 * @property {UserRole} role - User's access level
 * @property {string} [bio] - Optional user biography
 * @property {string} [avatarUrl] - URL to user's avatar image
 * @property {string} [coverUrl] - URL to user's cover image
 * @property {boolean} isCreator - Whether the user is a content creator
 */
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isCreator: boolean;
}
```

- [x] **Type Documentation**
  - [x] Documented all major type properties
  - [x] Added examples for complex types
  - [x] Documented type constraints and limitations
  - [x] Added deprecation notices for legacy types

### 6. Type Safety & Validation - PARTIALLY COMPLETE
- [x] **Runtime Validation**
  - [x] Implemented type guards for critical types
  - [x] Added basic schema validation for API responses
  - [x] Added input validation for forms
  - [ ] Consider adding Zod for more robust validation

- [ ] **Type Testing**
  - [ ] Add type tests using `tsd` or similar
  - [ ] Test type inference in critical paths
  - [ ] Verify type compatibility across modules

## Next Steps

1. **Complete Documentation**
   - Finish JSDoc comments for remaining types
   - Add more usage examples
   - Document type relationships

2. **Enhance Type Safety**
   - Add more precise types for form handling
   - Implement stricter type checking for API responses
   - Add runtime validation for critical data

3. **Performance Optimization**
   - Use `type` instead of `interface` where appropriate
   - Consider using `Omit`, `Pick`, and other utility types
   - Evaluate use of `as const` for literal types

4. **Future Improvements**
   - Add TypeScript strict mode
   - Implement discriminated unions for better type narrowing
   - Add more comprehensive error types

## Type Naming Conventions

### Naming Rules
- **PascalCase** for:
  - Interfaces
  - Type aliases
  - Enums
  - Generic type parameters

- **camelCase** for:
  - Type properties
  - Function parameters
  - Local type variables

### Type Definition Examples
```typescript
// Interface
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
}

// Type alias
type UserRole = 'admin' | 'user' | 'guest';

// Generic type
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}
```

### File Naming
- Use `.types.ts` suffix for type-only files
- Group related types in feature-based files
- Keep type files co-located with their components when specific to a component
- Prefix with `I` for interfaces (optional)
- Use `T` prefix for generic types
- Suffix with `Props` for component props
- Suffix with `Type` for union/intersection types

## Common Issues to Address
- Inconsistent type naming
- Missing type definitions
- Overuse of `any` type
- Duplicate type definitions
- Complex nested types that could be simplified

## Action Items

### High Priority
1. Audit and consolidate user-related types
2. Remove any `any` types
3. Document all types with JSDoc

### Medium Priority
1. Organize types into logical groups
2. Set up type-only imports/exports
3. Add type tests

### Low Priority
1. Create type utilities
2. Add runtime type checking
3. Document type patterns

## Progress Log

### 2025-05-12
- Initial documentation created
- Next: Audit user-related types

## Notes
- Pay attention to type reusability
- Document type transformations
- Keep an eye on type inference performance
- Consider creating type utilities for common patterns
