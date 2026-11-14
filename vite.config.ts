import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths so it works on any static host
  build: {
    rollupOptions: {
      // intro.html is the landing page; mission.html is the game its Start button opens.
      input: { intro: 'intro.html', mission: 'mission.html' },
    },
  },
})
