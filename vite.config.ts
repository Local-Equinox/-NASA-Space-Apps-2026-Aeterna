import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths so it works on any static host
  build: {
    rollupOptions: {
      // Two pages: index.html is the intro, mission.html is the game it links to.
      input: { index: 'index.html', mission: 'mission.html' },
    },
  },
})
