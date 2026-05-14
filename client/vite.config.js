import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    },
    port: 5173,
  },
})