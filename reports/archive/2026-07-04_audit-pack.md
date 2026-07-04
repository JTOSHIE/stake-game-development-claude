# Session Report: Audit pack assembly

- **Date:** 2026-07-04
- **Branch:** `claude/audit-pack` (from up-to-date `main`; PR #16 opus-elevate-2 merged).
- **Brief:** `FS_AuditPack_Prompt.md` (saved verbatim).
- **READ FIRST (convention (i)):** `reports/SESSION_REPORT.md` (the opus-elevate-2 report)
  incl. its FOR THE NEXT SESSION block, `CLAUDE.md`. Both read before touching anything.

This is a documentation/assembly pass, not a code pass: it compiles an authoritative facts
sheet and assembles a self-contained external-auditor pack on the Desktop, so the owner can
paste it plus the auditor prompt into external AIs for an independent second opinion ahead
of formal Stake Engine review. No game code, maths, or asset was touched.

## Task 1 — GAME_FACTS.md

Compiled `GAME_FACTS.md` (repo root) from five source documents (every number cited inline
to its source, none invented): `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`,
`SUBMISSION_DOSSIER.md`, `COMPLIANCE_WATCH.md`, `CLAUDE.md`, and `design-system/
DESIGN_SYSTEM.md`/`LAYOUT_SPEC.md`. Five sections: game identity, verified mathematics (base
+ bonus RTP, hit rate, volatility, trigger rate, wincap frequency, the tail-risk/hard-cap
verification language from PAR §9, the paytable), feature rules (trigger/meter/retrigger,
trigger distribution), technology summary (Svelte + PixiJS, the deterministic vector asset
pipeline, static backgrounds, three speed tiers), and compliance summary (16 locales, social
mode, replay, disclaimer, six viewports, the fps and exact-total gate results).

**One discrepancy found and resolved:** the PAR sheet's symbol names (locked maths document,
written before the later art-rename passes) still say H2 "Turbocharger", M1 "Car Grille", M2
"Exhaust Pipe", M3 "Steering Wheel", L2 "Spark Plug" — but `DESIGN_SYSTEM.md`'s current
lineup table (post opus-elevate) has H2 "Nitro Canister", M2 "Coilover", M3 "Plasma Booster",
L2 "Blade Fuse", with M1 now "Steering Wheel". Per `CLAUDE.md`/`DESIGN_SYSTEM.md`, symbol
naming is skin-level and the maths IDs (H1/H2/M1/M2/M3/L1/L2/L3/W/S) never change — so
GAME_FACTS.md uses the current shipped names and includes a table showing both, rather than
silently picking one and hiding the mismatch. This is a documentation-only observation; no
PAR sheet edit was made or needed (the PAR sheet's IDs and figures are unaffected by a
cosmetic rename, and it is inside the locked `games/future_spinner/**` path in any case).

## Task 2 — the pack

Assembled `~/Desktop/FS_AuditPack/` (copies only — reading out of the locked maths path to
copy the PAR sheet is a read, not a write, per the brief and `CLAUDE.md`'s lock mechanism;
nothing under `games/future_spinner/**` was modified):

- `GAME_FACTS.md`, `AUDITOR_PROMPT.md` (verbatim below), `INDEX.md` (manifests all 20 files).
- Copies of `SUBMISSION_DOSSIER.md`, `COMPLIANCE_WATCH.md`, `HANDOVER.md`,
  `design-system/DESIGN_SYSTEM.md`, `design-system/LAYOUT_SPEC.md`,
  `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`, and the latest three
  `reports/archive/` entries by mtime (`opus-elevate-2`, `opus-elevate`,
  `motion-polish-v2`; `ux-polish` is 4th-latest and excluded).
- `media/` (9 files): `layout-base.png` / `layout-bonus.png` (LAYOUT_SPEC base/bonus states),
  `base-v33-clean.png` (the v3.3 clean shot), `buy-modal.png`, `paytable.png`, and all four
  proof GIFs from the motion and elevate passes — `proof-spin-stagger.gif`,
  `proof-win-bloom.gif`, `proof-overdrive-transition.gif` (Motion Polish v2) and
  `proof-bonus-jets.gif` (Opus Elevate 2).

**Zipped to `~/Desktop/FS_AuditPack.zip`: 6,771,987 bytes (6.5 MB).** Unzipped folder: 6.6 MB,
20 files.

## Task 3 — ship

This report, archived, brief and `GAME_FACTS.md` committed with explicit paths. The assembled
pack itself (`~/Desktop/FS_AuditPack/` and its zip) is a Desktop deliverable, not a repo
artefact, and is not committed — consistent with the brief ("the pack itself stays on the
Desktop, only the brief and reports are committed"); `GAME_FACTS.md` is committed to the repo
root alongside its sibling documents (`SUBMISSION_DOSSIER.md`, `COMPLIANCE_WATCH.md`) since it
is Task 1's own repo deliverable, not merely a pack component, and is the kind of durable,
sourced document worth keeping under version control as the game evolves.

## Appendix: AUDITOR_PROMPT.md (verbatim)

```
You are an independent external auditor reviewing a Stake Engine slot game submission
called "Future Spinner" (studio "We Roll Spinners") ahead of formal review. You have been
given a self-contained audit pack: GAME_FACTS.md (a facts sheet with every mathematical and
compliance claim sourced to a specific document), the PAR sheet, the submission dossier, the
compliance watch log, the design system and layout specification, the three most recent
session reports, and a media/ folder of screenshots and short GIFs showing the actual
rendered game (base state, bonus state, the buy modal, the paytable, a spin with reel
stagger, a win with particle effects, and the Overdrive feature transition).

Your job is to give the owner an honest, critical second opinion before this goes to formal
review. Do not take any claim in GAME_FACTS.md on faith just because it is cited — check
whether the citation actually supports the number, and flag anything that reads as asserted
rather than demonstrated. Do not invent facts that are not in the pack; if something needed
to answer a question is missing from the pack, say so explicitly rather than guessing.

Please assess and report on:

1. **Mathematics integrity.** Do the RTP, hit rate, volatility, trigger rate and wincap
   numbers for both modes look internally consistent (do the stated RTP splits sum to the
   stated total; does the wincap frequency plausibly match the stated volatility)? Is the
   hard 5,000x cap claim ("zero rounds over cap in either book") the kind of claim that
   should be independently re-verified before trusting it, and if so, what would you ask the
   studio to show you to confirm it?
2. **Compliance posture.** Based on COMPLIANCE_WATCH.md and SUBMISSION_DOSSIER.md, are there
   any open items that look like they would block or delay a Stake Engine review request?
   Are the stateless / no-jackpot / no-gamble / no-continuation claims well supported?
3. **Feature clarity.** Read the Overdrive Free Spins rules as described. Would a player
   understand the meter behaviour (starts at 1x, +1x after every winning free spin, never
   resets, not retroactive) from the in-game explanation alone, based on the screenshots and
   the intro-splash description in GAME_FACTS.md?
4. **Visual and motion quality.** From the screenshots and GIFs, assess whether the game
   reads as an original, polished, competitive submission (per the Stake Engine's game-
   quality-ranking factors quoted in COMPLIANCE_WATCH.md — engaging mechanics, no over-
   reliance on generic AI-generated assets) rather than a placeholder or template look.
5. **Gaps and risks.** List anything you would flag to the owner as a risk before
   submission, ranked by how likely it is to cause a delayed or rejected review, distinguishing
   between "must fix before submission" and "nice to have."

Structure your answer as a short executive verdict (would you submit this as-is, yes/no/with
reservations) followed by the five sections above. Be specific and cite which pack document
or screenshot supports each point you make.
```

## Scope and locks

`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` untouched — the PAR sheet was
copied OUT of the locked path (a read) for the Desktop pack, never edited; no write to any
locked path; no lock exception needed or taken (confirmed via an empty `.claude/settings.json`
diff before committing).

## Files changed

New: `GAME_FACTS.md`, `FS_AuditPack_Prompt.md`. Not committed (Desktop-only, per the brief):
`~/Desktop/FS_AuditPack/` (20 files) and `~/Desktop/FS_AuditPack.zip`.

## FOR THE NEXT SESSION

- **Model / effort used:** Sonnet 5, High.
- **Approach:** read the current PAR sheet, dossier, compliance watch and the three most
  recent session reports directly rather than delegating the research, since the brief's own
  constraint ("every number sourced from a repo document, none invented") meant transcription
  accuracy mattered more than speed; cited every figure in GAME_FACTS.md back to its source
  document/section. Found and transparently resolved the PAR-sheet-vs-DESIGN_SYSTEM symbol-
  naming discrepancy rather than silently picking one name.
- **Alternatives tried and rejected:** considered committing GAME_FACTS.md only inside a
  reports/ subfolder rather than the repo root — rejected in favour of the repo root, matching
  its siblings `SUBMISSION_DOSSIER.md`/`COMPLIANCE_WATCH.md` (same class of durable, sourced,
  owner-facing document, easiest for a future session to find and update).
- **Files touched:** `GAME_FACTS.md`, `FS_AuditPack_Prompt.md`, `reports/SESSION_REPORT.md`,
  `reports/archive/2026-07-04_audit-pack.md`, plus the Desktop-only pack and zip (not
  committed).
- **Open threads:**
  1. **GAME_FACTS.md maintenance** — it is a snapshot; if a future pass changes the maths,
     lineup names, or compliance posture, GAME_FACTS.md should be regenerated or amended
     alongside that pass, the same way COMPLIANCE_WATCH.md is a living document.
  2. **PAR sheet symbol names** — cosmetic only (`design-system/DESIGN_SYSTEM.md` is the
     authoritative current naming), but if the owner wants the PAR sheet's prose descriptions
     brought in line with the shipped names, that requires a sanctioned lock exception on
     `games/future_spinner/**` (a naming-only edit, no maths change) in a future session.
  3. **Inherited from opus-elevate-2:** audio implementation (pending `~/Desktop/fs_audio/`),
     flame-jet art-direction owner-eye call, optional paytable micro-polish, and the single
     one-time cold-start frame on the very first Overdrive mount (unchanged, documented, not
     a recurring reel defect).
