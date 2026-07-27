// build-info.d.ts, JOB 4 / TR-062 (2026-07-26).
//
// Ambient declarations for the three constants `vite.config.ts` inlines at
// build time via `define`. They are compile-time substitutions, not runtime
// lookups: the boot line that prints them costs no network request, which is
// what the ruling requires the network-hygiene gate to assert.
//
// `dist/build-info.json` carries the same facts as a file, for a human or a
// tool reading the artefact. Nothing in the running game fetches it.

/**
 * The HUMAN version, `v9` and so on, read from the repository-root `VERSION`
 * file at build time. It leads the boot line so the owner reads a version
 * rather than a hash; the SHA beside it stays the exact identity.
 */
declare const __BUILD_VERSION__: string

/** Full commit SHA of the tree this bundle was built from, or "unknown". */
declare const __BUILD_COMMIT__: string

/**
 * Whether that tree had NO uncommitted changes.
 *
 * False is the honest answer for a working-machine build, and it is not
 * cosmetic: a stamp naming a commit while the tree carried uncommitted edits
 * names a commit that does not describe the bundle. `scripts/kit_build.mjs`
 * refuses to package a build with this false.
 */
declare const __BUILD_CLEAN__: boolean

/** ISO timestamp of the build. */
declare const __BUILD_AT__: string
