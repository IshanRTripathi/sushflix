# Cleanup Rules & Guidelines

## Core Principles
1. **Safety First**
   - No breaking changes to existing functionality
   - Maintain backward compatibility
   - One change at a time, thoroughly tested
   - Create backups before making changes

2. **Code Quality Focus**
   - Only fix, don't rewrite
   - No logic changes unless it's a bug fix
   - Document all changes made
   - Follow existing code style and patterns

3. **File Handling**
   - Files >300 lines: Note for later, don't modify yet
   - Break down large files only after all other cleanup is done
   - Keep changes minimal and focused
   - One logical change per commit

4. **Testing Requirements**
   - Test each change before moving to the next
   - Verify functionality after each modification
   - Document any test cases created
   - Update tests when making changes

5. **Documentation**
   - Update JSDoc for all modified components/functions
   - Add comments for non-obvious decisions
   - Keep CHANGELOG.md updated
   - Document any assumptions made

6. **Version Control**
   - Small, atomic commits
   - Clear, descriptive commit messages
   - Reference related issues/PRs
   - One feature/fix per pull request

## File Naming Conventions
- Use PascalCase for component files (e.g., `UserProfile.tsx`)
- Use camelCase for utility files (e.g., `dateUtils.ts`)
- Use kebab-case for test files (e.g., `user-profile.test.tsx`)
- Use `.tsx` for React components, `.ts` for non-React code

## Code Style
- Follow existing indentation (spaces/tabs)
- Use single quotes for strings
- Use semicolons
- Follow existing import order:
  1. React imports
  2. Third-party libraries
  3. Local imports
  4. Styles

## Version History

### 1.0.0 - 2025-05-12
- Initial version created
- Added core cleanup rules and guidelines
- Documented code style and conventions

## Large Files Protocol
1. Any file over 300 lines should be noted in its respective module's documentation
2. Do not modify large files during initial cleanup
3. After initial cleanup, create a plan to break down large files
4. Document the proposed structure before making changes

## Change Process
1. Create a new branch for each cleanup task
2. Make one logical change at a time
3. Test the change
4. Document the change
5. Commit with a clear message
6. Create a PR for review

## Review Process
1. All changes must be reviewed before merging
2. At least one approval required
3. All tests must pass
4. Documentation must be updated
5. Follow the PR template

## Emergency Procedures
If a change breaks functionality:
1. Revert immediately
2. Document the issue
3. Create a new branch to fix
4. Add tests to prevent regression
5. Document the solution

## Documentation Updates
1. Keep all documentation in `/docs`
2. Update relevant documentation with each change
3. Include before/after examples when possible
4. Document any gotchas or special considerations

## Accessibility
- Maintain existing accessibility features
- Add appropriate ARIA attributes when modifying components
- Ensure keyboard navigation works
- Test with screen readers when possible

## Performance
- Avoid unnecessary re-renders
- Use proper memoization
- Optimize asset loading
- Document any performance improvements made
