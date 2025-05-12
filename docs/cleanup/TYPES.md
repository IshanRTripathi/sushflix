# Types Cleanup

## Overview
This document tracks the cleanup and optimization of type definitions in the codebase.

## Current Status
- **Status**: In Progress
- **Last Updated**: 2025-05-12
- **Target Directories**: 
  - `/src/types`
  - `/src/components/*/types.ts`
  - Component prop types
- **Blocked By**: None

## Type Categories

## Type Audit Findings

### 1. Core Types
- [x] **User-related types**
  - [x] `User` interface (in `types/index.ts`)
  - [x] `UserProfile` (duplicate in `types/user.ts` and `components/profile/types.ts`)
  - [x] `AuthState` (partially in `types/auth.ts`)
  - [x] `UserPreferences` (in `types/user.ts`)
  - [x] `Creator` interface (in `types/index.ts`)
  - [x] `SubscriptionLevel` (in `types/index.ts`)

- [x] **Content Types**
  - [x] `Content` interface (in `types/index.ts`)
  - [x] `Comment` (duplicate in multiple files)
  - [x] `ContentCardProps` (in `components/content/types.ts`)
  - [x] `ContentData` (in `ContentDetail.tsx`)

- [x] **API Response Types**
  - [x] `ApiResponse<T>` (in `types/user.ts`)
  - [x] `PaginatedResult<T>` (in `types/user.ts`)
  - [x] `ErrorResponse` (part of `ApiResponse`)

- [ ] **State Management**
  - [ ] `AppState` (missing)
  - [x] `AuthState` (partial in `types/auth.ts`)
  - [ ] `UIState` (missing)
  - [x] `UserStats` (in `types/user.ts`)
  - [x] `SocialLinks` (in `types/user.ts`)

### 2. Component Props
- [ ] **Shared Props**
  - [ ] `BaseProps` (needs implementation)
  - [ ] `ThemeableProps` (needs implementation)
  - [ ] `AccessibilityProps` (needs implementation)

- [ ] **Form Components**
  - [x] `ProfileFormData` (in `components/profile/types.ts`)
  - [x] `FormData` (in `types/auth.ts`)
  - [ ] `FormFieldProps` (missing)
  - [ ] `ButtonProps` (missing)
  - [ ] `InputProps` (missing)

- [ ] **Layout Components**
  - [ ] `LayoutProps` (missing)
  - [ ] `ContainerProps` (missing)
  - [ ] `GridProps` (missing)

- [x] **Content Components**
  - [x] `ContentCardProps` (in `components/content/types.ts`)
  - [x] `ContentCardActionsProps` (in `ContentCardActions.tsx`)
  - [x] `ContentCardCommentsProps` (in `ContentCardComments.tsx`)
  - [x] `ContentCardHeaderProps` (in `ContentCardHeader.tsx`)
  - [x] `ContentCardMediaProps` (in `ContentCardMedia.tsx`)

### 3. API & Database Types
- [ ] **Request Types**
  - [x] `LoginRequest` (part of `types/auth.ts` as `FormData`)
  - [ ] `CreatePostRequest` (missing)
  - [x] `UpdateUserRequest` (as `ProfileUpdateData` in `components/profile/types.ts`)
  - [x] `ProfileInput` (in `types/user.ts`)

- [ ] **Query Parameters**
  - [x] `PaginationParams` (part of `PaginatedResult` in `types/user.ts`)
  - [ ] `SortingParams` (missing)
  - [ ] `FilterParams` (missing)

- [ ] **Error Types**
  - [x] `ApiError` (part of `ApiResponse` in `types/user.ts`)
  - [x] `ValidationError` (as `FormErrors` in `types/auth.ts` and `ProfileErrors` in `components/profile/types.ts`)
  - [ ] `NetworkError` (missing)

- [x] **Database Types** (in `types/database.ts`)
  - [x] `IUser` (Mongoose model)
  - [x] `IUserProfile` (Mongoose model)
  - [x] `IUserStats` (Mongoose model)
  - [x] `ISubscription` (Mongoose model)
  - [x] `ISocialLinks` (Mongoose model)

## Type Cleanup Plan

### 1. Type Consolidation
- [ ] **Resolve Duplicates**
  - [ ] Consolidate `UserProfile` types (exists in `types/user.ts` and `components/profile/types.ts`)
  - [ ] Consolidate `SocialLinks`/`UserSocialLinks` types
  - [ ] Consolidate `Comment` types
  - [ ] Consolidate form error types

- [ ] **Standardize Naming Conventions**
  - [ ] Use consistent naming (e.g., `I` prefix for interfaces vs no prefix)
  - [ ] Standardize file naming (`*.types.ts` vs `types.ts` vs `*.d.ts`)
  - [ ] Organize types by domain (user, content, auth, etc.)

### 2. Type Definitions Enhancement
- [ ] **Add Missing Types**
  - [ ] `AppState` for global state management
  - [ ] `UIState` for UI-related state
  - [ ] Complete form component prop types
  - [ ] Layout component prop types
  - [ ] API request/response types

- [ ] **Type Safety**
  - [ ] Replace `any` with proper types
  - [ ] Add proper generics for reusable types
  - [ ] Ensure type safety in function parameters and return types
  - [ ] Add type guards where needed

### 3. Type Organization
- [ ] **File Structure**
  ```
  src/
    types/
      core/
        user.types.ts
        content.types.ts
        auth.types.ts
      api/
        requests.types.ts
        responses.types.ts
        errors.types.ts
      components/
        shared.types.ts
        forms.types.ts
        layout.types.ts
      index.ts  # barrel exports
  ```

- [ ] **Documentation**
  - [ ] Add JSDoc to all types
  - [ ] Document type relationships
  - [ ] Add usage examples for complex types
  - [ ] Document type guards and utility types

### 2. Documentation & Best Practices
- [ ] **JSDoc Comments**
  ```typescript
  /**
   * Represents a user in the system
   * @property {string} id - Unique user identifier
   * @property {string} username - User's display name
   * @property {UserRole} role - User's access level
   */
  interface User {
    id: string;
    username: string;
    role: UserRole;
  }
  ```

- [ ] **Type Documentation**
  - [ ] Document all type properties
  - [ ] Add examples for complex types
  - [ ] Document type constraints and limitations
  - [ ] Add deprecation notices for legacy types

### 3. Type Safety & Validation
- [ ] **Runtime Validation**
  - [ ] Implement type guards
  - [ ] Add schema validation (e.g., with Zod)
  - [ ] Validate API responses

- [ ] **Type Testing**
  - [ ] Add type tests
  - [ ] Test type inference
  - [ ] Verify type compatibility

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
