import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Matches the port already whitelisted in the backend's CORS config (app.cors.allowed-origins)
    port: 3000,
  },
})
