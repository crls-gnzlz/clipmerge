import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'kinn-merger.dhaquantastic.onrender.com',
      'https://kinn-merger.dhaquantastic.onrender.com',
      '0a158e9ff613.ngrok-free.app'
    ],
  },
})
