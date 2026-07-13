/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    // Git worktrees live under .claude/. Without this, vitest picks up the
    // half-finished tests of whatever else is in flight there and reports them
    // as failures of THIS tree.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
  },
})
