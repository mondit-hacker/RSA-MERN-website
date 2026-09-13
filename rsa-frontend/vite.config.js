import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@core':  resolve(__dirname, 'src/core'),
      '@views': resolve(__dirname, 'src/views'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@data':  resolve(__dirname, 'src/data'),
      '@hooks': resolve(__dirname, 'src/hooks'),
    },
  },

  server: {
    port: 3000,
    open: true,
    // Proxy API calls so the backend URL never appears in browser network tab
    proxy: {
      '/x-api': {
        target: 'http://localhost:5000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/x-api/, ''),
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,       // Never expose source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove all console.log in production
        drop_debugger: true,
      },
      mangle: {
        toplevel: true,       // Mangle top-level variable names
      },
    },
    rollupOptions: {
      output: {
        // Fully hashed filenames — no role names in bundle filenames
        entryFileNames:   'assets/[hash].js',
        chunkFileNames:   'assets/[hash].js',
        assetFileNames:   'assets/[hash].[ext]',
        // Split chunks by hash only — no readable chunk names
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'fw';        // framework
            if (id.includes('react-router')) return 'rt'; // router
            return 'vd';                                  // vendor
          }
          // All views (panels) bundled into one encrypted chunk
          if (id.includes('/views/')) return 'ap';
          // Core utilities bundled together
          if (id.includes('/core/'))  return 'cr';
        },
      },
    },
  },
});
