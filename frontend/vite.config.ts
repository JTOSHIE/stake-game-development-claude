import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { rmSync, existsSync, statSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Build Diet v2: prune every legacy asset that no longer has a live consumer
// from the SERVED build only — public/ (and therefore the repo) is untouched,
// this runs post-build against dist/. Verified reference-free by grep across
// frontend/src before pruning (see reports/archive/<date>_build-diet-qa.md):
//   - assets/symbols/, assets/frames/, assets/videos/  — the pre-AssetForge
//     legacy roots, fully superseded by assets/themes/<id>/{symbols,frames}.
//   - assets/themes/future-spinner/backgrounds/bg-1.mp4 — the retired video
//     background; themeAssets.backgroundVideo/isVideo are dead fields no
//     component reads (static graded stills ship instead).
//   - assets/ui/* — the pre-LAYOUT_SPEC "WinPod era" HUD art (old ControlBar
//     buttons, panels, banner, logo variants, WinPod v1/v2), EXCEPT
//     win_pod_v3_active.png / win_pod_v3_idle.png, which WinPod.svelte still
//     serves — ReplayMode.svelte mounts WinPod for bet-replay, so those two
//     files remain live and must ship.
//
// Beyond the letter of the Build Diet brief, but in service of its explicit
// "under 25MB" target: the three alternate themes (beautiful-game,
// oil-and-fire, trap-lane) and the raw concept/preview art dump
// (themes/source/, 60MB+ of Manus-era exploration, zero references anywhere
// in frontend/src) total ~153MB and are unreachable in the SERVED build.
// App.svelte forces future-spinner unconditionally whenever
// `!import.meta.env.DEV` — true for every `npm run build` output — with no
// URL param or storage override that survives it (verified by reading
// App.svelte and themeStore.ts). The dev-only ThemeSelector that reaches them
// is itself gated on the same flag. closeBundle only ever runs for `vite
// build`, never `vite dev`, so the dev server keeps every theme for local
// theme-selector testing; only the shipped artifact is pruned.
function dirSize(absPath) {
  let total = 0
  for (const entry of readdirSync(absPath, { withFileTypes: true })) {
    const p = join(absPath, entry.name)
    if (entry.isDirectory()) total += dirSize(p)
    else total += statSync(p).size
  }
  return total
}

function pruneLegacyAssets() {
  const LEGACY_DIRS = [
    'assets/symbols', 'assets/frames', 'assets/videos',
    // Dev-only alternate themes + concept art — unreachable once shipped (see above).
    'assets/themes/beautiful-game', 'assets/themes/oil-and-fire',
    'assets/themes/trap-lane', 'assets/themes/source',
  ]
  const LEGACY_FILES = ['assets/themes/future-spinner/backgrounds/bg-1.mp4']
  const UI_DIR = 'assets/ui'
  const KEEP_UI = new Set(['win_pod_v3_active.png', 'win_pod_v3_idle.png'])

  return {
    name: 'build-diet-prune-legacy-assets',
    closeBundle() {
      let prunedBytes = 0
      let prunedCount = 0

      for (const rel of LEGACY_DIRS) {
        const abs = resolve(__dirname, 'dist', rel)
        if (existsSync(abs)) {
          const size = dirSize(abs)
          prunedBytes += size
          prunedCount += 1
          rmSync(abs, { recursive: true, force: true })
          console.log(`[build-diet] pruned dir  ${rel} (${(size / 1024 / 1024).toFixed(2)} MB)`)
        }
      }

      for (const rel of LEGACY_FILES) {
        const abs = resolve(__dirname, 'dist', rel)
        if (existsSync(abs)) {
          const size = statSync(abs).size
          prunedBytes += size
          prunedCount += 1
          rmSync(abs)
          console.log(`[build-diet] pruned file ${rel} (${(size / 1024 / 1024).toFixed(2)} MB)`)
        }
      }

      const uiAbs = resolve(__dirname, 'dist', UI_DIR)
      if (existsSync(uiAbs)) {
        for (const f of readdirSync(uiAbs)) {
          if (KEEP_UI.has(f)) continue
          const abs = join(uiAbs, f)
          const size = statSync(abs).size
          prunedBytes += size
          prunedCount += 1
          rmSync(abs)
        }
        console.log(`[build-diet] pruned ${UI_DIR}/* except ${[...KEEP_UI].join(', ')}`)
      }

      console.log(`[build-diet] total pruned: ${prunedCount} paths, ${(prunedBytes / 1024 / 1024).toFixed(2)} MB`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), pruneLegacyAssets()],
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
