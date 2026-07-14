# Session Report: ITEM 2, JOB 2 addendum extensions a-g

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/qa-conformance-item2` (off `main`, independent of ITEMS 0/1).
- **Source:** `FS_NextWorkOrder_2026-07-14_Prompt.md`, ITEM 2.

## What changed this pass

New script `frontend/scripts/platform_conformance_item2.mjs` covering all seven
extensions in one run against a live dev server. Full results in
`reports/qa/platform-conformance-item2-2026-07-14.json`; proof screenshots in
`reports/screens/platform-conformance-item2/`.

| Check | Result |
|---|---|
| (a) Same-origin sweep | **PASS** - 139 requests across 3 base spins + a bonus buy, zero third-party hosts. |
| (b) Spacebar bet assert | **PASS** - spacebar triggered a real spin, balance changed. |
| (c) Mini-player popout | **PASS** - popout-s (400x225) and popout-l (800x450), both screenshotted; no horizontal overflow, spin button and balance stay fully within viewport at both sizes. |
| (d) Bet-level conformance | **PASS** - injected a JPY-style bet-levels array (¥100 to ¥50,000, no decimals) via the same `rgsBetLevels` store `initRGS()` would populate; all 8 levels reachable via the increase-bet control, spin succeeded at both the minimum and maximum. |
| (e) Language fuzz | **PASS** - `en`, `de-DE`, `zh-Hant`, `xx-XX` (malformed), an emoji, and an empty string; zero corrupted-text markers, zero console errors on any of the six. |
| (f) Incremental win count-up | **Real, mixed finding - see below.** |
| (g) Fastplay legibility | Captured (this codebase's equivalent of Stake's "fastplay" is the existing Turbo/Super Turbo speed tier - screenshotted at Super Turbo, the fastest tier). |

## Real finding: win count-up is tier-dependent, not universal

**The HUD's plain win figure (`data-testid="hud-win"`) does not count up at all** -
sampled its text across 20 animation frames after injecting a win amount directly;
all 20 samples were identical (`$42.50` from frame 1). It binds `$winAmount`
directly with no tweening (`HudOverlay.svelte`), so it jumps straight to the final
value.

**`WinBanner.svelte`'s own celebration overlay (shown only for wins >=10x) does
count up correctly** - the main script's guessed CSS selector for it
(`.fs-win-amount` / `.win-banner-amount` / `[class*=win-amount]`) matched nothing
(the real class is `.c1-amount`), producing a false "inconclusive" result on the
first pass. Re-verified with the corrected selector in an isolated follow-up check
(not re-run through the full script, to avoid repeating the ~2 minute suite for one
line): sampled 52 distinct values over a real bonus-buy round, `$0.62` up to
`$171.35` - a genuine, smooth staged count-up.

**Net assessment**: Stake's requirement ("multi-win outcomes count up
incrementally") does not literally say "only large wins" - as built, only wins
>=10x actually count up; anything below that (the majority of paying spins,
`base` mode's hit rate is 29.11%, most of which are sub-10x) jumps instantly on the
HUD. Flagging this as a real, disclosed compliance question rather than assuming
either "the WinBanner tier covers it" or "the HUD gap is disqualifying" - that
judgement call belongs to Fable/the owner, not this pass.

## Verification

- Ran the full script for real against a live dev server (first run completed
  clean; a second run hit one flaky `TimeoutError` in the bonus-buy path used for
  the win-count-up check specifically - isolated and re-verified separately rather
  than re-running the whole suite again, see above).
- Visually reviewed `popout-s.png`: renders correctly at 400x225 with the spin
  button, balance, bet and win HUD boxes all fully visible, no clipping.
- Every check ran against the real dev-server-served app, not inferred from
  source reading alone (bet-level injection, language fuzz, and the count-up
  sampling all drove real store updates and read back real DOM state).
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## Not done this pass (flagged, not silent)

- Did not fix the HUD win-display count-up gap - ITEM 2 is a verification/QA-script
  job ("add ... assert"), not a frontend feature pass; the finding is reported for
  a follow-up decision, not silently patched mid-audit.
- The "fastplay" mapping to Turbo/Super Turbo is a judgement call (Stake's actual
  terminology and this codebase's speed-tier system aren't a 1:1 match) - stated
  explicitly rather than assumed to be equivalent without comment.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** built one script
  covering all seven sub-items rather than seven separate scripts, since they share
  the same dev-server/page-driving scaffolding; when a guessed CSS selector
  produced a false negative, verified the real answer with an isolated follow-up
  check instead of either trusting the wrong result or re-running the entire
  multi-minute suite for one fix.
- **Alternatives rejected:** re-running the whole `platform_conformance_item2.mjs`
  suite a third time after fixing the selector (rejected - the flaky timeout in an
  unrelated run showed this suite has some real-world timing variance in the
  bonus-buy path; better to isolate the one check that needed re-verification than
  keep re-rolling the dice on a ~2 minute suite); declaring the win-count-up check
  either fully compliant or fully non-compliant (rejected - the honest answer is
  "it depends which win tier," and that nuance is what got written up).
- **Files touched:** `frontend/scripts/platform_conformance_item2.mjs` (new),
  `reports/qa/platform-conformance-item2-2026-07-14.json`,
  `reports/screens/platform-conformance-item2/*.png` (4 files), this report + its
  dated archive copy. Locked files untouched.
- **Open threads:** the win-count-up tier question above needs a decision; ITEM 3
  (JOB 3b math self-audit), ITEM 4 (JOB 9b social-mode audit), and the sanctioned
  locked pass (books regeneration) remain. ITEM 0's two flagged findings
  (anticipation_build seam tolerance, LUFS discrepancy) still await review on a
  separate open branch/PR.
