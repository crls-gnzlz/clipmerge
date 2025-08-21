import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'kinn-merger.dhaquantastic.onrender.com',
      'https://kinn-merger.dhaquantastic.onrender.com',
      '069fd8d69da5.ngrok-free.app',
      'f77fbd4e18be.ngrok-free.app',
      '5028e67dda2f.ngrok-free.app'
    ],
  },
})
