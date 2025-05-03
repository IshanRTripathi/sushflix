# Authentication System

## Overview
Sushflix implements a robust authentication system that supports both login and signup functionality. The system is built using React Context for state management and integrates with the backend API for user authentication.

## Components

### LoginModal
The `LoginModal` component provides a user-friendly interface for both login and signup operations. It supports two authentication methods:

1. **Email/Username + Password**
2. **Phone Number + OTP**

#### Props
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### Features
- Form validation for email/username and password
- Phone number validation
- OTP support for phone authentication
- Error handling and display
- Automatic redirect to `/explore` after successful authentication

### AuthContext
The `AuthContext` provides authentication state management and related functions throughout the application.

#### Context Type
```typescript
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  error: string | null;
}
```

## Authentication Flow

### Login Flow
1. User enters email/username and password
2. Form validation is performed
3. API call to `/auth/login` is made
4. On success:
   - User data is stored in localStorage
   - Auth state is updated
   - User is redirected to `/explore`
5. On error:
   - Error message is displayed
   - Form remains open for retry

### Signup Flow
1. User enters email/username and password
2. Form validation is performed
3. API call to `/auth/signup` is made
4. On success:
   - User data is stored in localStorage
   - Auth state is updated
   - User is redirected to `/explore`
5. On error:
   - Error message is displayed
   - Form remains open for retry

## Error Handling
The system implements comprehensive error handling at multiple levels:

1. **Form Level Validation**
   - Email format validation
   - Password strength validation
   - Phone number format validation

2. **API Error Handling**
   - Network errors
   - Authentication failures
   - Server errors

3. **User Feedback**
   - Clear error messages
   - Loading states
   - Success notifications

## Security Features

### Token Management
- JWT tokens are stored in localStorage
- Tokens are automatically included in API requests
- Token expiration handling

### Input Validation
- All user inputs are validated before submission
- Password strength requirements
- Email format validation
- Phone number format validation

### Error Logging
- All authentication actions are logged
- API responses are logged
- Error messages are logged for debugging

## Usage Examples

### Using AuthContext
```typescript
const { user, isAuthenticated, login, logout } = useAuth();

// Check authentication status
if (!isAuthenticated) {
  // Show login modal
}

// Handle login
const handleLogin = async () => {
  try {
    await login(email, password);
    // User will be redirected to /explore
  } catch (error) {
    // Handle login error
  }
};
```
