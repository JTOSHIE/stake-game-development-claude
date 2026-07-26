// evidencePaths.mjs - CONVENTION (h.1), in one place.
//
// THE RULE. Proof and gate scripts write to scratch paths only. Committed
// evidence directories are written only by a job that explicitly regenerates
// evidence.
//
// WHY IT EXISTS. On 2026-07-26 four capture files under
// reports/screens/scatter-anticipation/ were found modified in the working tree,
// same dimensions, different bytes, by a session that had not touched them.
// anticipation_proof.mjs pointed its screenshot output at that committed
// evidence directory, so every re-run silently rewrote the evidence in place.
// Convention (h) exists so an independent verifier can review rendering FROM THE
// REPOSITORY, and that only works if the file in the repository is the file that
// was captured. A silent re-render breaks the property whether or not the new
// image is better. Found by track/screenshot-analyst as ledger row SA-012.
//
// The same pattern was then found in four more scripts. This module is what
// stops it recurring in the sixth, because a rule that lives in five copies of
// a path expression is a rule that comes back.
//
// HOW IT WORKS. Call `evidenceDir(...segments)` instead of building the path.
// By default it returns a scratch path under `.evidence-scratch/`, which is
// gitignored, so a gate run can never dirty the working tree. Set
// FS_WRITE_EVIDENCE=1 to write to the real committed location; that is the
// "explicit regeneration" the convention allows, and it is deliberately an
// opt-in a human has to type rather than a default anyone can trip over.
//
// The scratch tree mirrors the committed tree exactly, so a script's own
// relative structure, its filenames and any index it writes are unchanged, and
// a regenerating job can diff one tree against the other.

import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

/** Set FS_WRITE_EVIDENCE=1 to regenerate committed evidence on purpose. */
export const WRITES_COMMITTED_EVIDENCE = process.env.FS_WRITE_EVIDENCE === '1'

/** Where scratch output goes. Gitignored; mirrors the committed tree. */
export const SCRATCH_ROOT = join(REPO_ROOT, '.evidence-scratch')

/**
 * Resolve an evidence path, and create it.
 *
 * @param  {...string} segments repo-relative, e.g. ('reports', 'screens', 'foo')
 * @returns {string} an absolute path, created, under scratch or the repo
 */
export function evidenceDir(...segments) {
  const base = WRITES_COMMITTED_EVIDENCE ? REPO_ROOT : SCRATCH_ROOT
  const dir = join(base, ...segments)
  mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * One line on stderr saying where output went, so a run is never ambiguous
 * about whether it just rewrote committed evidence. Called by every consumer.
 */
export function announceEvidenceMode(scriptName) {
  if (WRITES_COMMITTED_EVIDENCE) {
    console.log(`${scriptName}: FS_WRITE_EVIDENCE=1, WRITING COMMITTED EVIDENCE in place.`)
  } else {
    console.log(`${scriptName}: writing to .evidence-scratch/ (convention h.1). `
      + 'Set FS_WRITE_EVIDENCE=1 to regenerate committed evidence.')
  }
}
