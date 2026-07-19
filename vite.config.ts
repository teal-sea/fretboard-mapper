/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { modePagesPlugin } from './scripts/modePages'

export default defineConfig({
  plugins: [react(), modePagesPlugin()],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testSetup.ts'],
    // Git worktrees live under .claude/. Without this, vitest picks up the
    // half-finished tests of whatever else is in flight there and reports them
    // as failures of THIS tree.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
  },
})
