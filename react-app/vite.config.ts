import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9902,
    proxy: {
      '/assets': {
        target: 'https://lehre.bpm.in.tum.de/~ge35diz/practicum/ev3_robot/react_app/dist',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assets/, ''),
      },
    },
  }
})
