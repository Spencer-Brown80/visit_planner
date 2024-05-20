import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: '.', 
    publicDir: 'public',
    server: {
        port: 4000,
        proxy: {
            '/api': {
                target: 'http://localhost:5555',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    build: {
        rollupOptions: {
            input: 'public/index.html',
        }
    }
})