import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set base for GitHub Pages deployment. Replace with repo name if different.
  base: '/Personal-Trainer/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    coverage: {
      reporter: ['text','html'],
    },
  },
})
