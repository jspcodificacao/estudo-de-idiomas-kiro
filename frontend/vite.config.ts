import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Carregar .env da raiz do projeto (um nível acima)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const port = parseInt(env.FRONTEND_PORT || '4005')

  return {
    plugins: [react()],
    server: {
      port: port,
      host: true
    }
  }
})
