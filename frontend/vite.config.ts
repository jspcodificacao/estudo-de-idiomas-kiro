import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = parseInt(env.FRONTEND_PORT || '4005')

  return {
    plugins: [react()],
    server: {
      port: port,
      host: true
    }
  }
})
