import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// AssetForge v2: the animated background loop is retired from the served build
// (static graded stills ship instead). The source file stays in the repo under
// public/ for reference; this plugin drops it from dist so it is never served or
// preloaded. Symbol idle/win videos and other assets are untouched.
function excludeRetiredVideo() {
  const rel = 'assets/videos/bg_animated_loop.mp4'
  return {
    name: 'assetforge-exclude-retired-video',
    closeBundle() {
      const out = resolve(__dirname, 'dist', rel)
      if (existsSync(out)) {
        rmSync(out)
        // eslint-disable-next-line no-console
        console.log(`[assetforge] excluded ${rel} from dist`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), excludeRetiredVideo()],
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
