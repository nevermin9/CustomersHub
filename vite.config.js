import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 8080,
    },
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': resolve( __dirname, './src' ),
        },
    },
    assetsInclude: [ '**/*.csv' ],
})
