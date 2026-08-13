# Distinctness attestation, SIGNED (R057 TASK 4, 2026-08-13)

**STATUS: SIGNED BY THE OWNER, 2026-08-13, SAME DAY AS STAGING.** This record
serves checklist item [07] of the fifty-one ("Game is sufficiently distinct
from existing titles and series"), whose mapping row records that distinctness
against the platform's catalogue is the reviewers' judgement by nature; this
attestation is the BASIS the estate can honestly show, and the owner has
signed it as written (the sign-off, verbatim, in the Sign-off section below).

## The attestation, verbatim per the R057 brief

> Future Spinner is an original We Roll Spinners design: in-house five-mode
> mathematics, an original Overdrive meter mechanic with pre-revved buy tiers,
> commissioned and in-house art with recorded provenance, and a title cleared
> by trademark search. Distinctness against the existing catalogue is the
> reviewers' judgement; this record shows the basis.

## The basis, each clause cited

- **In-house five-mode mathematics**: the locked package at
  `games/future_spinner/` (base, cruise, antelite, bonus, super; RTP 96.3500%
  at 4dp in all five modes; 100,000 rounds per mode), verified end to end by
  `tools/verify_books_lookup_equality.py` (500,000 rounds, 4,455,829
  assertions, 0 failures, TR-011).
- **An original Overdrive meter mechanic with pre-revved buy tiers**: the
  Overdrive Free Spins meter (+1x after every winning free spin, never
  resetting, retriggers at the current meter) with the NITRO tier pre-revved
  to 5x; specified in `games/future_spinner/game_config.py` and the True game
  facts section of `CLAUDE.md`.
- **Commissioned and in-house art with recorded provenance**: the canonical
  source registry (`scripts/assets/canonical_sources.json`, convention (u)),
  the generation notes beside each adopted asset
  (`design-system/brand/GENERATION_NOTE_background.md`,
  `design-system/brand/tile/GENERATION_NOTE_composed_master.md`), and the
  promoted portal set with provenance JSONs at `assets/portal/` (R050,
  owner-promoted).
- **A title cleared by trademark search**: IP Australia exact search 0
  results and USPTO `CM:"Future Spinner"` genuine "No results found", captured
  with method notes 2026-08-11 (R050 TASK 5, `docs/records/legal/`; the
  earlier variant scans at `docs/records/trademark/`).

## Sign-off

Owner's sign-off, given 2026-08-13 in the owner sign-off block (item 3, saved
verbatim at `reports/briefs/FS_OWNER_SIGNOFF_THREE_2026-08-13_Prompt.md`; the
paste is the signature), quoted:

> DISTINCTNESS SIGNED OFF. Owner signs the staged item 07 attestation as
> written in the dossier; the mapping row closes on this line.

The mapping row [07] flips to EVIDENCED on this line, and TR-136's one open
part closes with it.
