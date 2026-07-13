# Session Report: JOB 5 - Dossier and copy

- **Date:** 2026-07-13
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/dossier-copy-job5` (off up-to-date `main`, independent of the other
  jobs per the work order).
- **Source:** `FS_ConsolidatedWorkOrder_2026-07-13_Prompt.md`, JOB 5.

## What this delivers

### Soundtrack sentence restored as DRAFT, PENDING OWNER APPROVAL
No original wording survives anywhere in the repo (searched thoroughly - it was fully
removed when audio was pending, not archived), so this is freshly composed to match what
actually shipped in JOB 1, not a recovered original: *"A driving synthwave soundtrack and
layered turbo SFX push the neon city to life, shifting up a gear the instant Overdrive
ignites."* Added to `SUBMISSION_DOSSIER.md` §3 and synced into `PROMO_BLURB.md`, both
clearly marked `[DRAFT - PENDING OWNER APPROVAL, not yet part of the approved text]` -
**never marked approved**. The rest of both blurbs is untouched, still the owner's
last-approved v2 text.

### Dossier section 5 rewritten as the staging protocol
Previously a 5-line "post-upload verification protocol." Rewritten into a full staging
sequence with the four sub-parts the brief named, the old content preserved (not lost)
as subsection 5e:
- **5a.** The frontend build artefact - what `dist/` is, how `npm run build` produces it
  (Svelte build + `pruneLegacyAssets`), current measured size (13.59MB, JOB 4).
- **5b.** Exact portal upload steps, in order - team/branding one-time setup, frontend
  bundle, publish_files bundle (in the right file order), tile composition, blurb entry
  (explicitly gated on soundtrack-sentence approval), then verification before requesting
  review.
- **5c.** The `publish_files` inventory with fresh SHA-256 hashes - see Findings below,
  a real gap and a real stale-artefact risk both surfaced here.
- **5d.** A one-page owner checklist, explicitly split into one-time portal actions
  (team profile, branding, payment, trademark search) vs per-update actions (rebuild
  dist fresh, re-verify hashes, re-upload, re-verify, re-confirm blurb approval state).
- **5e.** The original post-upload verification protocol, preserved verbatim, now framed
  as the last step of the fuller sequence rather than the whole of section 5.

### GAME_FACTS.md audio row
**No pre-existing "pending" row was found** (checked - GAME_FACTS.md simply didn't
mention audio at all, an omission rather than a placeholder to flip). Added a new
"Audio: shipped" entry to §4 (Technology summary), alongside frontend/asset-pipeline/
backgrounds/speed-tiers/layout, with the provenance pointer
(`reports/audio/GENERATION_LOG_2026-07-13.md`, `sounds/README.md`, the Stability AI
licence, `audio_verify.mjs`'s ALL CHECKS PASS result).

## Findings (disclosed, not silently absorbed)

- **`books_super.jsonl.zst` is absent from this checkout's local `publish_files/`
  directory.** `index.json` requires it (declares five modes including `super`), but the
  file itself isn't present right now - it's gitignored like every publish_files
  artefact, so this doesn't necessarily indicate an upstream problem, but it does mean
  **this exact checkout cannot be staged for upload as-is**. The PAR sheet's last-recorded
  hash (`c079226d718cab54825b91d5fdab631d7d2f8dd542f432e9b7b6ec7d57347445`) is cited in
  the dossier as the value to confirm against once regenerated - not done in this pass,
  since regenerating it requires writing to the locked `games/future_spinner/**` path
  under a sanctioned lock exception, and this work order explicitly restricts this job
  from touching that path at all.
- **Seven orphaned, unreferenced `books_*.jsonl.zst` files found sitting in
  `publish_files/`** - `books_volatile`, `books_ante`, `books_hyperbuy`, `books_minibuy`,
  `books_superbuy`, `books_megabuy`, `books_superante` (35-203MB each, all dated
  2026-07-05, none referenced by `index.json`). Not part of the declared publish set -
  these look like leftovers from an earlier mode-naming iteration. This is exactly the
  stale-second-maths-package risk class `CLAUDE.md`'s "Reference / prototype branches"
  note already names as having cost a star at a prior external audit. Flagged in the
  dossier, not deleted (locked path, out of this job's scope) - recommend a future
  sanctioned cleanup pass.

## Verification

| Check | Result |
|---|---|
| SHA-256 for 11 declared publish_files (10 of 11 - `books_super.jsonl.zst` absent) | computed fresh, recorded |
| `books_cruise`/`books_antelite` hashes vs REVIEW_EVENTS pass's recorded values | match exactly |
| Locked-file diff | empty (docs-only pass; publish_files hashing was read-only) |

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** actually computed
  fresh SHA-256 hashes from the real files rather than copying the PAR sheet's
  previously-recorded values forward, which is exactly what surfaced the missing-file gap
  and the orphaned-files finding - both would have been invisible from a documentation
  pass that only edited prose without touching the actual directory.
- **Alternatives rejected:** deleting the seven orphaned books files myself (rejected -
  `games/future_spinner/**` is locked and this work order explicitly forbids touching it
  in this job); silently omitting the missing `books_super.jsonl.zst` from the inventory
  table to make it look complete (rejected - reported it as a real gap with the exact
  action needed before staging, per the "no silent gaps" discipline this whole engagement
  has followed); inventing a plausible-sounding "recovered" soundtrack sentence and
  presenting it as original text (rejected - clearly disclosed it as freshly composed).
- **Files touched:** `SUBMISSION_DOSSIER.md` (§3 draft soundtrack sentence, §4 status
  note, §5 fully rewritten as the staging protocol), `PROMO_BLURB.md` (synced draft
  sentence), `GAME_FACTS.md` (new audio entry + sources list), this report + its dated
  archive copy. No code changed, no locked files touched.
- **Open threads:** `books_super.jsonl.zst` needs regeneration and hash-reconfirmation
  before any real staging attempt (needs a sanctioned lock exception, out of this job's
  scope); the seven orphaned books files need a future sanctioned cleanup pass; the
  soundtrack sentence needs the owner's explicit approve/reject decision before it can
  ship in either blurb. JOB 6 (external audit refresh prep) is next, independent of all
  prior jobs.
