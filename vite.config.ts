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

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || 'development'),
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
          ],
        },
      }),
      createStyleImportPlugin({
        resolves: [AntdResolve()],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'static/**/*'],
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
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/bundle-analyzer-report.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'static',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['lodash', 'axios', 'date-fns'],
            ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
          assetFileNames: 'static/[name]-[hash][extname]',
          chunkFileNames: 'static/[name]-[hash].js',
          entryFileNames: 'static/[name]-[hash].js',
        },
      },
      chunkSizeWarningLimit: 1000,
    },
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
