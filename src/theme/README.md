# Theme Module

This module provides a robust theming solution for SushFlix, built on Material-UI's theming system with first-class TypeScript support. It offers:

- 🎨 Light and dark theme variants
- 🌓 Automatic system preference detection
- 🛠 Type-safe theme customization
- ⚡ Optimized performance with memoization
- 📱 Responsive design support

## Structure

```
src/theme/
├── components/           # Theme-related React components
│   └── ThemeProvider.tsx  # Theme provider component
├── context/               # Theme context
│   └── ThemeContext.ts
├── hooks/                 # Theme-related hooks
│   └── useTheme.ts
├── managers/             # Theme management logic
│   └── ThemeManager.ts
├── themes/               # Theme definitions
│   ├── base.ts           # Base theme configuration
│   ├── dark.ts           # Dark theme
│   ├── index.ts          # Theme exports
│   └── light.ts          # Light theme
├── types/                # TypeScript type definitions
│   └── index.ts
├── README.md             # This file
└── index.ts              # Public API
```

## Usage

### ThemeProvider

Wrap your application with the `ThemeProvider`:

```tsx
import { ThemeProvider } from './theme';

function App() {
  return (
    <ThemeProvider>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### useTheme Hook

Access the theme context in your components:

```tsx
import { useTheme } from '../theme';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <div>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

## Theming

### Theme Modes

- `light`: Light theme
- `dark`: Dark theme
- `system`: Follows system preference

### Customization

1. **Colors**: Update the palette in `themes/light.ts` or `themes/dark.ts`
2. **Typography**: Modify the base theme in `themes/base.ts`
3. **Components**: Override component styles in the respective theme files

## Best Practices

### Theme Tokens
Always use theme tokens instead of hardcoded values:

```typescript
// Good
const StyledDiv = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

// Bad
const StyledDiv = styled('div')({
  backgroundColor: '#ffffff',
  color: '#000000',
});
```

### Typography
- Use the theme's typography scale for consistent text styling
- Prefer `theme.typography` over direct CSS for text styles
- Use responsive typography utilities

### Dark Mode Support
- Test all components in both light and dark modes
- Use theme-aware colors (avoid hardcoded colors)
- Consider contrast ratios for accessibility

### Performance
- Memoize theme-dependent calculations with `useMemo`
- Avoid inline styles that depend on theme
- Use theme breakpoints for responsive design

### Type Safety
- Import types from `./types` when extending the theme
- Use TypeScript generics for theme-aware components
- Add proper type guards for theme validation

## Advanced Usage

### Extending the Theme

Add custom theme properties in `types/index.ts`:

```typescript
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      customProperty: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      customProperty?: string;
    };
  }
}
```

### Server-Side Rendering

For SSR, ensure the theme is consistent between server and client:

```typescript
// In your server-side code
const theme = createTheme(light);
const html = renderToString(
  <CacheProvider value={cache}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </CacheProvider>
);
```

## Testing

When testing components that use the theme, wrap them in a `ThemeProvider`:

```tsx
test('should render with theme', () => {
  const { container } = render(
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
  
  // Test theme-dependent styles
  expect(container.firstChild).toHaveStyle({
    backgroundColor: expect.any(String),
    color: expect.any(String),
  });
});

test('should toggle theme', () => {
  const { getByText, container } = render(
    <ThemeProvider>
      <MyToggleButton />
    </ThemeProvider>
  );
  
  const button = getByText(/dark/i);
  fireEvent.click(button);
  
  // Verify theme change
  expect(container.firstChild).toHaveStyle({
    backgroundColor: expect.any(String),
  });
});
```
