import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Base configuration
  base: '/',
  
  // Plugins
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Only use React's new JSX transform in development
      jsxRuntime: 'automatic',
      // Only enable babel in development for faster builds
      babel: mode === 'development' ? {
        plugins: [
          ['@babel/plugin-transform-runtime', {
            regenerator: true,
          }],
        ],
      } : undefined,
    }),
  ],
  
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'https://sushflix-backend-796527544626.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Reduce file system calls
    dedupe: ['react', 'react-dom'],
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    // Only generate sourcemaps in development
    sourcemap: mode === 'development',
    // Enable minification in production only
    minify: mode === 'production' ? 'esbuild' : false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor modules
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Split MUI components
          mui: ['@mui/material', '@mui/icons-material', '@mui/lab'],
        },
      },
    },
  },
  
  // CSS configuration
  css: {
    // Only generate sourcemaps in development
    devSourcemap: mode === 'development',
    // Enable CSS modules
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // Optimize deps
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server starts
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
    // Don't force include these in the bundle
    exclude: [],
  },
  
  // Log level
  logLevel: 'warn',
  
  // Clear screen
  clearScreen: true,
}));
