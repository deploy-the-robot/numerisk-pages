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
        altS4: resolve(__dirname, 'start-alt.html'),
        s0a: resolve(__dirname, 'step-0a.html'),
        s0b: resolve(__dirname, 'step-0b.html'),
        s0c: resolve(__dirname, 'step-0c.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
