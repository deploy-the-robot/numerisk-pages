import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createSvgIconsPlugin }  from 'vite-plugin-svg-icons';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    createSvgIconsPlugin({
      // https://github.com/anncwb/vite-plugin-svg-icons
      // Specify the icon folder to be cached
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      // Specify symbolId format
      symbolId: 'icon-[dir]-[name]',
    })
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
