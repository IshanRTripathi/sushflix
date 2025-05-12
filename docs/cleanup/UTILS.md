# Utils Cleanup

## Overview
This document tracks the cleanup and optimization of utility functions in the `/src/utils` directory.

## Current Status
- **Status**: Pending (Phase 1)
- **Last Updated**: 2025-05-12
- **Target Directory**: `/src/utils`
- **Dependencies**: 
  - Types Cleanup (Phase 1)
  - Hooks Cleanup (Phase 1)

## Utils Inventory

### Utility Files
| File | Category | Functions | Dependencies | Status |
|------|----------|------------|--------------|--------|
| `dateUtils.ts` | Date/Time | `formatDate`, `timeAgo` | date-fns | Will audit |
| `stringUtils.ts` | String | `truncate`, `slugify` | - | Will audit |
| `validation.ts` | Validation | `validateEmail`, `validatePassword` | - | Will audit |
| `api.ts` | API | `apiClient`, `handleApiError` | axios | Will audit |
| `logger.ts` | Logging | `logError`, `logInfo` | - | Will audit |

## Audit Checklist

### 1. Code Quality & Organization
- [ ] **Function Implementation**
  - [ ] Remove duplicate functions
  - [ ] Ensure consistent naming (camelCase)
  - [ ] Verify pure functions where possible
  - [ ] Remove unused code
  - [ ] Consolidate similar utilities

- [ ] **File Structure**
  - [ ] Group related utilities in appropriate files
  - [ ] Create index files for exports
  - [ ] Follow consistent file naming
  - [ ] Separate concerns appropriately

### 2. Type Safety & Validation
- [ ] **TypeScript Implementation**
  ```typescript
  // Before
  function formatDate(date) {
    // ...
  }
  
  // After
  function formatDate(date: Date | string | number): string {
    // ...
  }
  ```
  - [ ] Add proper TypeScript types
  - [ ] Remove `any` types
  - [ ] Add input validation
  - [ ] Use proper return types

### 3. Documentation & Best Practices
- [ ] **JSDoc Comments**
  ```typescript
  /**
   * Formats a date into a human-readable string
   * @param {Date|string|number} date - The date to format
   * @param {string} [formatString='MMM d, yyyy'] - Optional format string
   * @returns {string} Formatted date string
   * @example
   * formatDate(new Date()); // 'May 12, 2023'
   * formatDate('2023-05-12', 'yyyy-MM-dd'); // '2023-05-12'
   */
  function formatDate(date: Date | string | number, formatString = 'MMM d, yyyy'): string
  ```
  - [ ] Document all functions
  - [ ] Add examples
  - [ ] Document edge cases
  - [ ] Add deprecation notices

### 4. Testing & Quality
- [ ] **Unit Tests**
  ```typescript
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-05-12');
      expect(formatDate(date)).toBe('May 12, 2023');
    });
  });
  ```
  - [ ] Add test coverage
  - [ ] Test edge cases
  - [ ] Add performance tests for critical functions
  - [ ] Document test cases

## Common Issues to Address

### Code Quality
- Duplicate or similar utility functions
- Inconsistent function signatures
- Lack of input validation
- Poor error handling
- Missing type definitions

### Performance
- Inefficient algorithms
- Unnecessary computations
- Memory leaks
- Lack of caching for expensive operations

### Documentation
- Missing JSDoc comments
- Undocumented parameters and return values
- No examples provided
- Missing edge case documentation

## Best Practices

### Function Design
```typescript
// Good: Pure function with proper types and validation
function formatCurrency(
  amount: number, 
  locale = 'en-US', 
  currency = 'USD'
): string {
  if (typeof amount !== 'number') {
    throw new TypeError('Amount must be a number');
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
```

### Error Handling
```typescript
// Handle errors appropriately
function parseJSON<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
```

### Performance Optimization
```typescript
// Memoize expensive operations
const memoizedHeavyComputation = memoize((input: string) => {
  // Expensive computation
  return heavyComputation(input);
});

// Debounce frequent operations
const debouncedSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);
```

## Action Items

### High Priority
1. Audit and document all utility functions
2. Add TypeScript types
3. Implement proper error handling
4. Add input validation

### Medium Priority
1. Optimize performance-critical functions
2. Add unit tests
3. Document usage examples
4. Set up code coverage reporting

### Low Priority
1. Add performance benchmarks
2. Create utility documentation
3. Set up automated code quality checks

## Action Items

### High Priority
1. Audit all utility functions
2. Add TypeScript types
3. Document all functions

### Medium Priority
1. Add input validation
2. Create tests
3. Optimize performance

### Low Priority
1. Add benchmarks
2. Create utility templates
3. Document patterns

## Progress Log

### 2025-05-12
- Initial documentation created
- Next: Audit all utility functions

## Version History

### 1.0.0 - 2025-05-12
- Initial version created
- Documented all utility functions
- Added audit checklist
- Identified optimization opportunities

## Notes
- Keep utility functions pure and focused
- Document all parameters and return values
- Add unit tests for all utilities
- Consider creating a utilities documentation site file
