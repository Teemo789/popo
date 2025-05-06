import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows access from external devices like ngrok
    allowedHosts: [
      'd6b7-41-251-187-54.ngrok-free.app' // 👈 your ngrok domain
    ]
  }
})
