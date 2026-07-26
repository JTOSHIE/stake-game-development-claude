import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { rmSync, existsSync, statSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Build Diet v2: prune every legacy asset that no longer has a live consumer
// from the SERVED build only. public/ (and therefore the repo) is untouched,
// this runs post-build against dist/. Verified reference-free by grep across
// frontend/src before pruning (see reports/archive/<date>_build-diet-qa.md):
//   - assets/symbols/, assets/frames/, assets/videos/, the pre-AssetForge
//     legacy roots, fully superseded by assets/themes/<id>/{symbols,frames}.
//   - assets/themes/future-spinner/backgrounds/bg-1.mp4, the retired video
//     background; themeAssets.backgroundVideo/isVideo are dead fields no
//     component reads (static graded stills ship instead).
//   - assets/ui/*, the pre-LAYOUT_SPEC "WinPod era" HUD art (old ControlBar
//     buttons, panels, banner, logo variants, WinPod v1/v2), EXCEPT
//     win_pod_v3_active.png / win_pod_v3_idle.png, which WinPod.svelte still
//     serves. ReplayMode.svelte mounts WinPod for bet-replay, so those two
//     files remain live and must ship.
//
// Beyond the letter of the Build Diet brief, but in service of its explicit
// "under 25MB" target: the three alternate themes (beautiful-game,
// oil-and-fire, trap-lane) and the raw concept/preview art dump
// (themes/source/, 60MB+ of Manus-era exploration, zero references anywhere
// in frontend/src) total ~153MB and are unreachable in the SERVED build.
// App.svelte forces future-spinner unconditionally whenever
// `!import.meta.env.DEV`, true for every `npm run build` output, with no
// URL param or storage override that survives it (verified by reading
// App.svelte and themeStore.ts). The dev-only ThemeSelector that reaches them
// is itself gated on the same flag. closeBundle only ever runs for `vite
// build`, never `vite dev`, so the dev server keeps every theme for local
// theme-selector testing; only the shipped artifact is pruned.
// R2R3 finding 9 / TR-046, fixed R2R-R JOB F (2026-07-26). This parameter was
// untyped, so `tsc -p tsconfig.node.json` reported TS7006 and `npm run check`
// exited non-zero, which is why CI only ever ran the Svelte half. One
// annotation, and the complete command is green.
function dirSize(absPath: string): number {
  let total = 0
  for (const entry of readdirSync(absPath, { withFileTypes: true })) {
    const p = join(absPath, entry.name)
    if (entry.isDirectory()) total += dirSize(p)
    else total += statSync(p).size
  }
  return total
}

/** Remove every file with the given name anywhere under `root`. Returns the count. */
function pruneByName(root: string, name: string): number {
  if (!existsSync(root)) return 0
  let removed = 0
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const p = join(root, entry.name)
    if (entry.isDirectory()) removed += pruneByName(p, name)
    else if (entry.name === name) { rmSync(p, { force: true }); removed++ }
  }
  return removed
}

/**
 * Documentation must not ship. JOB 3(i), 2026-07-26.
 *
 * TR-063's dist scan found `assets/themes/future-spinner/sounds/README.md` in
 * the bundle, with seventeen em dashes in it, served from the portal in the
 * owner's own 104-file listing. It was fixed at source, and the row raised the
 * question this closes: that the file ships AT ALL. It is a generation-notes
 * document. It names the model, the seeds, the prompts and the licence paths
 * used to produce the audio, and anyone who can fetch the game can fetch it.
 *
 * The bundle is the product. A provenance note is a repository artefact, it is
 * evidence for a reviewer reading the repo, and it has no business being served
 * to a player. Nothing in the running game reads it: no `import`, no `fetch`,
 * no `<link>`. It is in `public/` only because that is where the audio it
 * describes lives, and Vite copies `public/` verbatim.
 *
 * Extension-based rather than a name list, for the reason the dash gate learned
 * twice: a list of files is a list, and the file that hurts is the one nobody
 * added to it. Every extension here is documentation by definition; none is a
 * runtime format this game loads. Verified against the shipped set, which is
 * png, mp3, woff2, woff, webm, js, jpg, json, html and css, plus the one md.
 */
const DOC_EXTENSIONS = ['.md', '.markdown', '.mdx', '.txt', '.rst', '.adoc', '.doc', '.docx', '.pdf']
const DOC_BASENAMES = ['LICENSE', 'LICENCE', 'NOTICE', 'CHANGELOG', 'AUTHORS', 'CONTRIBUTING', 'README']

function isDocFile(name: string): boolean {
  const lower = name.toLowerCase()
  if (DOC_EXTENSIONS.some((e) => lower.endsWith(e))) return true
  // Extensionless conventional doc files, e.g. a bare LICENSE.
  return DOC_BASENAMES.includes(name.toUpperCase())
}

/** Remove every documentation file anywhere under `root`. Returns the paths removed. */
function pruneDocs(root: string, base = root): string[] {
  if (!existsSync(root)) return []
  const removed: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const p = join(root, entry.name)
    if (entry.isDirectory()) removed.push(...pruneDocs(p, base))
    else if (isDocFile(entry.name)) {
      rmSync(p, { force: true })
      removed.push(p.slice(base.length + 1))
    }
  }
  return removed
}

function pruneLegacyAssets() {
  const LEGACY_DIRS = [
    'assets/symbols', 'assets/frames', 'assets/videos',
    // Dev-only alternate themes plus concept art, unreachable once shipped (see above).
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

      // TR-047 follow-up, 2026-07-26. macOS writes .DS_Store into any directory
      // Finder has opened, including public/, and Vite copies public/ verbatim
      // into dist/. git ignores them; the BUILD did not, so the uploaded bundle
      // carried Finder metadata that is not in the repository.
      //
      // That is the same reproducibility defect as the branding directory,
      // three orders of magnitude smaller: after deleting that directory a
      // clean clone built 14.79MB and this machine built 14.83MB, and the
      // entire 36,880-byte difference was four .DS_Store files. Stripping them
      // makes the two builds match FILE FOR FILE rather than within rounding,
      // which is the only version of "reproducible" worth claiming.
      const strayCount = pruneByName(resolve(__dirname, 'dist'), '.DS_Store')
      if (strayCount > 0) {
        prunedCount += strayCount
        console.log(`[build-diet] pruned ${strayCount} stray .DS_Store file(s)`)
      }

      // JOB 3(i), 2026-07-26. No documentation ships. See pruneDocs above for
      // why, and scripts/dist_hygiene_gate.mjs for the assertion that it did
      // not ship, which is the half that survives someone editing this plugin.
      const docs = pruneDocs(resolve(__dirname, 'dist'))
      if (docs.length > 0) {
        prunedCount += docs.length
        console.log(`[build-diet] pruned ${docs.length} documentation file(s): ${docs.join(', ')}`)
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
