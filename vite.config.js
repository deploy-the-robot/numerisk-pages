import { defineConfig } from 'vite'
import { resolve } from 'path'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        s4: resolve(__dirname, 'step-4.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
