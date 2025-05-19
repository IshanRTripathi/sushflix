# Authentication Module Refactoring Plan

## Overview
This document outlines the plan to refactor the authentication system into a dedicated `src/modules/auth` module. The goal is to improve code organization, maintainability, and separation of concerns.

## Current Structure
Auth-related code is currently scattered across:
- `src/components/auth/`
- `src/hooks/useAuth.ts`
- `src/server/middlewares/auth.js`
- `src/server/middlewares/authorization.js`
- `src/server/routes/auth.js`
- `src/types/auth.ts`

## Target Structure
```
src/modules/auth/
├── components/         # Auth-related React components
│   ├── LoginForm.tsx
│   ├── AuthModal.tsx
│   └── ...
├── hooks/             # Custom hooks
│   └── useAuth.ts
├── services/          # API services
│   └── auth.service.ts
├── types/             # TypeScript types
│   └── auth.types.ts
├── context/           # Auth context
│   └── AuthContext.tsx
├── server/            # Server-side code
│   ├── controllers/
│   ├── middlewares/
│   └── routes/
└── index.ts           # Module exports
```

## Phase 1: Create New Module Structure

### 1.1 Create Base Directories
```bash
mkdir -p src/modules/auth/{components,hooks,services,types,context,server/{controllers,middlewares,routes}}
```

### 1.2 Set Up Type Definitions
Create `src/modules/auth/types/auth.types.ts`:
```typescript
export type AuthErrorType = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type AuthModalType = 'login' | 'signup';

// Other auth-related types...
```

## Phase 2: Move Authentication Logic

### 2.1 Move Context and Hooks
1. Move `AuthContext.tsx` to `src/modules/auth/context/`
2. Move `useAuth.ts` to `src/modules/auth/hooks/`
3. Update imports in affected files

### 2.2 Move Components
1. Move `LoginForm.tsx` to `src/modules/auth/components/`
2. Move `AuthModal.tsx` to `src/modules/auth/components/`
3. Update imports and relative paths

## Phase 3: Server-Side Refactoring

### 3.1 Move Server Files
1. Move `server/middlewares/auth.js` to `src/modules/auth/server/middlewares/`
2. Move `server/routes/auth.js` to `src/modules/auth/server/routes/`
3. Create `auth.controller.js` in `src/modules/auth/server/controllers/`

### 3.2 Update Server Configuration
Update server initialization to use the new auth module paths.

## Phase 4: Consolidate Authentication Logic

### 4.1 Create Auth Service
Create `src/modules/auth/services/auth.service.ts`:
```typescript
import { API_BASE_URL } from '../../../config';
import { AuthErrorType } from '../types/auth.types';

class AuthService {
  private static readonly ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  };

  static async login(username: string, password: string): Promise<{ user: any; token: string }> {
    // Implementation...
  }

  
  // Other auth methods...
}

export default AuthService;
```

## Phase 5: Testing and Validation

### 5.1 Test Cases
1. Login/Logout functionality
2. Protected routes
3. Token refresh
4. Error handling
5. Session management

### 5.2 Update Tests
1. Move and update auth-related tests
2. Add new tests for the refactored code

## Phase 6: Cleanup

### 6.1 Remove Old Files
After confirming everything works:
```bash
rm -rf src/components/auth
rm src/hooks/useAuth.ts
# Remove other old auth files...
```

### 6.2 Update Documentation
Update README.md with the new auth module structure and usage.

## Implementation Notes

1. **Dependencies**:
   - Ensure all required dependencies are listed in package.json
   - Update any peer dependencies

2. **Environment Variables**:
   - Document all required environment variables
   - Update .env.example

3. **Error Handling**:
   - Implement consistent error handling
   - Add proper error boundaries

4. **Performance**:
   - Optimize bundle size
   - Implement code splitting where needed

## Rollback Plan
If issues arise:
1. Revert to the previous commit
2. Keep a backup of the original files
3. Document any issues encountered

## Timeline
1. Initial setup: 1 day
2. Core implementation: 2-3 days
3. Testing and bug fixes: 1-2 days
4. Documentation and cleanup: 0.5 day

## Success Metrics
- Reduced code duplication
- Improved maintainability
- Easier testing
- Better separation of concerns
- No regression in functionality
