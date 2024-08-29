import path from 'path'
import { defineConfig } from 'vite'
// import { analyzer } from 'vite-bundle-analyzer'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
    // analyzer(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => id.includes('node_modules')
                    ? 'vendor'
                    : undefined,
            },
        },
    },
    base: '/community-health/',
})
