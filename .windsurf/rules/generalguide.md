---
trigger: always_on
---

1. Place all feature-specific logic inside `src/modules/` following a modular architecture.
2. Store authentication-related components, hooks, and logic in `src/modules/auth/`.
3. Manage user profile functionality within `src/modules/profile/`.
4. Keep reusable code and shared utilities in `src/modules/shared/`.
5. Define API clients and request logic inside `src/modules/shared/api/`.
6. Centralize configuration files in `src/modules/shared/config/`.
7. Place all custom React hooks in `src/modules/shared/hooks/`.
8. Store reusable TypeScript types in `src/modules/shared/types/`.
9. Keep utility functions in `src/modules/shared/utils/`.
10. Define global and app-wide types in `src/types/`.
11. Use `src/App.tsx` as the entry point for rendering the main application UI.
12. Each module should include the following subfolders: `components`, `context`, `hooks`, `server`, and `types`.
13. Inside each module's `server` folder, organize Express-related files including `middlewares`, `routes`, and `model` definitions.
14. Enforce TypeScript strict mode across the entire codebase.
15. Use PascalCase for React components and camelCase for variables and functions.
16. Store all reusable type definitions in a dedicated 'types' directory.
17. Use ESLint and Prettier to enforce code quality and consistent formatting.
18. Maintain consistent coding styles via EditorConfig.
19. Handle sensitive data exclusively through environment variables.
20. Authenticate users using JWT stored securely in localStorage.
21. Prefer React Query for data fetching and cache management.
22. Apply Framer Motion for UI animations with accessibility in mind.
23. For MVP, keep same build configs for development and production environments.
24. Document public APIs with JSDoc and components with usage notes.
25. Enable lazy loading for non-critical routes in React Router.
