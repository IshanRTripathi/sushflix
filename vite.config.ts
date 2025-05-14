import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { createStyleImportPlugin, AntdResolve } from 'vite-plugin-style-import';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables schema
const envSchema = z.object({
  VITE_API_URL: z.string().url().default('https://sushflix-backend-796527544626.us-central1.run.app'),
  VITE_APP_NAME: z.string().default('Sushflix'),
  VITE_APP_DESCRIPTION: z.string().default('Content sharing platform'),
  VITE_APP_THEME_COLOR: z.string().default('#ffffff'),
});

export default defineConfig(({ mode }: ConfigEnv) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate environment variables
  try {
    envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.errors);
      process.exit(1);
    }
  }

  const isProduction = mode === 'production';
  
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || 'development'),
    },
    esbuild: {
      // Minify production builds
      minify: isProduction,
      // Enable tree-shaking
      treeShaking: true,
    },
    build: {
      target: 'esnext',
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor modules into separate chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // Split UI libraries
            ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            // Split data fetching libraries
            data: ['@tanstack/react-query', 'axios'],
          },
        },
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize chunks
      chunkSizeWarningLimit: 1000,
      // Enable gzip compression
      reportCompressedSize: true,
    },
    plugins: [
      // Enable React fast refresh in development
      react({
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            // Enable React.lazy and Suspense for code splitting
            '@babel/plugin-syntax-dynamic-import',
          ],
        },
      }),
      createStyleImportPlugin({
        resolves: [AntdResolve()],
      }),
      // PWA support
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: env.VITE_APP_NAME,
          short_name: env.VITE_APP_NAME,
          description: env.VITE_APP_DESCRIPTION,
          theme_color: env.VITE_APP_THEME_COLOR,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          // Enable precaching of assets
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Enable runtime caching for API requests
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200], // Cache successful and opaque responses
                },
              },
            },
          ],
        },
      }),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
        webp: { lossless: false },
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.VITE_APP_NAME,
            description: env.VITE_APP_DESCRIPTION,
          },
        },
      }),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/bundle-stats.html',
      }),
    ].filter(Boolean),
    server: {
      port: 5173,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: 5173,
      host: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },
  };
});
