import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { rmSync, existsSync, statSync, readdirSync, writeFileSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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
//     buttons, panels, banner, logo variants, WinPod v1/v2/v3). WinPod.svelte
//     was deleted 2026-08-13. Nothing in src reads these files, so the
//     prune list keeps none of them.
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

/**
 * Build provenance. JOB 4 / TR-062, 2026-07-26.
 *
 * THE FINDING. The published bundle was one commit behind `main`, and nothing
 * in the artefact tied a bundle to a commit. "What is live" was not answerable
 * from the repository at all: it was established by grepping the shipped
 * JavaScript for em dashes, which is not a method anyone should need.
 *
 * Fable ruled option (a) with (b): `dist/` carries a build stamp, and kits are
 * single use. This is the (a) half.
 *
 * READ FROM GIT, AND THE DIRTY FLAG IS NOT DECORATION. A stamp that says
 * "abc1234" while the tree had uncommitted edits names a commit that does not
 * describe the bundle. `clean: false` is the honest answer in that case, and
 * `scripts/kit_build.mjs` refuses to package such a build outright.
 */
function gitFacts(): { commit: string; clean: boolean; branch: string } {
  const run = (args: string[]): string => {
    try {
      return execFileSync('git', args, { cwd: __dirname, encoding: 'utf-8' }).trim()
    } catch {
      return ''
    }
  }
  const commit = run(['rev-parse', 'HEAD'])
  const branch = run(['rev-parse', '--abbrev-ref', 'HEAD'])
  // --porcelain over the whole repository, not just frontend/: a change to the
  // maths package or to a gate is still a change this bundle was built beside.
  const status = run(['status', '--porcelain'])
  return {
    commit: commit || 'unknown',
    branch: branch || 'unknown',
    clean: commit !== '' && status === '',
  }
}

/** Total bytes and file count under `root`, excluding one path. */
function measureDist(root: string, exclude: string): { files: number; bytes: number } {
  let files = 0
  let bytes = 0
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name)
      if (p === exclude) continue
      if (entry.isDirectory()) walk(p)
      else { files += 1; bytes += statSync(p).size }
    }
  }
  if (existsSync(root)) walk(root)
  return { files, bytes }
}

/**
 * Strip HTML comments from the EMITTED index.html.
 *
 * The source file carries two long explanatory comments, and they are worth
 * keeping there: they record why the Vite starter favicon was replaced and what
 * the pre-hydration tab title is for. They were also being shipped verbatim, so
 * anyone viewing source on the submitted game read an internal ticket reference
 * ("R12") and an internal repository path
 * ("design-system/brand/hero_icon/hero_icon_32.png").
 *
 * That is the standing mandate's inspection test failing on the very first file
 * a reviewer can open: internal commentary in shipped markup does not read as a
 * professional outfit. The comments stay in the repository and leave the build.
 *
 * Conditional comments are deliberately preserved: they are IE-era conditional
 * markup rather than prose, and stripping one would change behaviour rather than
 * remove a note. Nothing here ships any today; the guard is so that adding one
 * later is not silently broken by this plugin.
 */
function stripHtmlComments() {
  return {
    name: 'strip-html-comments',
    enforce: 'post' as const,
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        return html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
      },
    },
  }
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
  const KEEP_UI = new Set<string>()

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

      // JOB 4 / TR-062. Written LAST, after every prune, so the figures
      // describe the bundle that actually ships rather than the one Vite
      // emitted before the diet ran.
      //
      // The byte total EXCLUDES this file, and the name says so. Including it
      // is impossible without a fixed point, and a figure that silently means
      // something slightly different from the one the hygiene gate measures is
      // how two documents start disagreeing. The gate reconciles the two
      // explicitly instead: recorded bytes plus this file's own size must equal
      // the measured total.
      const distRoot = resolve(__dirname, 'dist')
      const infoPath = join(distRoot, 'build-info.json')
      const git = gitFacts()
      const measured = measureDist(distRoot, infoPath)
      const info = {
        game: 'future-spinner',
        version: KIT_VERSION,
        commit: git.commit,
        branch: git.branch,
        cleanTree: git.clean,
        builtAt: new Date().toISOString(),
        bundleFilesExcludingThisFile: measured.files,
        bundleBytesExcludingThisFile: measured.bytes,
        note: 'Provenance only. Nothing in the running game fetches this file; '
          + 'the boot line is inlined at build time. See TR-062.',
      }
      writeFileSync(infoPath, JSON.stringify(info, null, 2) + '\n')
      console.log(`[build-info] ${KIT_VERSION} ${git.commit.slice(0, 8)}${git.clean ? '' : ' DIRTY'} `
        + `${measured.files} files, ${measured.bytes} bytes`)
    },
  }
}

// https://vite.dev/config/
// The same provenance, INLINED at build time so the boot line costs no network
// request. TR-062's ruling requires the network-hygiene gate to assert exactly
// that, and a runtime fetch of build-info.json would have been the obvious and
// wrong way to print it.
/**
 * THE HUMAN VERSION, owner's order 2026-07-28 (JOB 2): the owner reads `v9`
 * rather than a hash.
 *
 * ONE SOURCE, the repository-root `VERSION` file, read by the build, by the
 * boot line, and by `scripts/kit_build.mjs` for the kit name and its README.
 * It is a file rather than a constant in this config because the kit builder is
 * a sibling script that must agree with it, and two constants that must agree
 * are two constants that eventually will not. The kit version was hardcoded to
 * V3 while a V4 shipped once already, which is the failure this shape removes.
 */
const KIT_VERSION = (() => {
  try {
    const raw = readFileSync(resolve(import.meta.dirname, '..', 'VERSION'), 'utf-8').trim()
    return /^\d+$/.test(raw) ? `v${raw}` : 'v0'
  } catch {
    return 'v0'
  }
})()

const BUILD_GIT = gitFacts()

export default defineConfig({
  plugins: [svelte(), pruneLegacyAssets(), stripHtmlComments()],
  base: './',
  define: {
    __BUILD_VERSION__: JSON.stringify(KIT_VERSION),
    __BUILD_COMMIT__: JSON.stringify(BUILD_GIT.commit),
    __BUILD_CLEAN__: JSON.stringify(BUILD_GIT.clean),
    __BUILD_AT__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    target: 'es2020',
    // FONT SHIPPING SAFETY, owner's order 2026-07-28 (FS_POLISH_PUNCH_AND_R3
    // JOB 1). The platform serves the game under a CSP whose font-src is
    // 'self', observed live 2026-07-28: a font delivered as a data: URI is
    // BLOCKED by that policy, silently, and the browser falls through to the
    // system font mid-interface. Vite's default inlines any asset under 4096
    // bytes as a data: URI, so a future small woff2 subset would ship in a
    // form the platform refuses to render. Zero disables inlining outright:
    // every asset ships as a file reachable under 'self'. The current bundle
    // inlines nothing (verified before this change, so the delta is zero);
    // this exists so that stays true. scripts/dist_hygiene_gate.mjs asserts
    // the property on the built dist, which is the half that survives someone
    // editing this file.
    assetsInlineLimit: 0,
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
