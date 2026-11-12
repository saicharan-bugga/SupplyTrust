/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, set VITE_BASE=/SupplyTrust/ when building for it.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      // Documented coverage scope: reusable components and pure domain logic.
      include: ['src/components/**', 'src/lib/**'],
      exclude: ['src/**/*.test.*'],
    },
  },
})
