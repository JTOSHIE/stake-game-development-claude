import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          pixi:   ['pixi.js'],
          svelte: ['svelte'],
        },
      },
    },
  },
})
