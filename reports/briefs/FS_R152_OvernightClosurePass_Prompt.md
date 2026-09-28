R152: OVERNIGHT CLOSURE PASS.
Review lane. Opus. Unattended. Long session. Use sub-agents.
Save this brief verbatim first.

Owner state
- R151 PR #187 is the last presentation pass. Merge it if open
  and green (merge commit), then branch from that main.
- Audio is accepted. R150 idle bed stays. Seam exemption at the
  accepted hash stays. Do not re-encode, EQ, widen, or replace
  any sound.
- No new image generation. No Spine. No Path 1 rest-pose swap.
- 5173 is the owner's preview. Never bind it, never kill it,
  never run npm run assets against this checkout.
- Kit packaging is forbidden this session. Record the exact
  rebuild command for the owner; do not upload.

Fence
Locked maths. Locked HUD geometry (token colour only if a
contrast fail is measured). No raster commits except look-pass
screens that do not depict uncommitted placeholder art.
Fingerprint all theme rasters and all sounds/ files at start
and assert they are unchanged at close, except files you are
explicitly authorised to prune from dist (sources stay).

Phase 0
1. git fetch. Merge #187 if required. Confirm arc2-baseline
   still resolves. Confirm audio_verify: bgm_loop exempt at
   hash, other beds inside 2.0 dB.
2. Own server on a free port ≠ 5173. Prove identity by hashing
   a known shipped asset against this tree before any
   measurement (liveness is not identity).
3. Record dist size vs 26,214,400 B.
4. Fingerprint.

Phase 1 — copy and chrome (do these)
1. "1 ways" and every other 1-plural on HUD, banner, feature
   entry, paytable, replay. Locale-safe. English "1 way".
   Grep the locale files; do not hardcode one language only.
2. Splash / first gesture: Space or Enter that starts the bed
   must dismiss the splash the same as a pointer click.
   Music already starts; the splash must not stay up.
3. Scatter celebration 460 ms early: fire on land, not on
   anticipate. One 3-scatter fixture, before and after,
   timestamps vs the landing frame.
4. Bought feature as first action: grid must not keep the
   cosmetic pre-spin board beside the win. Neutral or real
   result, never a fake deal.
5. Win-latch: a win during feature brace must not be dropped
   on the floor. If un-consuming it fires late, record the
   choice and pick the one that cannot skip a paid win.
6. Title halo: keep 954ec600 unless you reproduce softness
   at ≥2 of 12 size/DPR configs on the production build.
   If reproduced, revert that commit only and record why.
7. Dead rasters: the four unused images (~0.9 MB) named in
   the R151 report. Prune from dist only when no runtime
   reference remains. Leave sources on disk. The 92 KB car
   prune already shipped; do not resurrect it.
8. overdrive_perimeter.png: confirm it is unreferenced. If
   yes, prune from dist.
9. "1 ways" on the chip is the known copy bug; sweep cousins
   (spin/spins, way/ways, scatter/scatters) in player-facing
   strings only.

Phase 2 — motion residue from R151 (measure, then fix or park)
Re-derive each claim. Do not trust the R151 narrative.

A. Turbo hold: neighbouring reels in phase on the rare hold
   pattern. If a CSS offset exists that keeps adjacent
   visible cells ≥50 ms apart on Normal and Cruise without
   collapsing Turbo below the R151 candidate, take it.
   If not, record the residual rate and stop.
B. Anticipation hold at Turbo bringing reels within 50 ms:
   same rule.
C. Burst-text snap on feature entry: confirm the shrink-fade
   still runs on the tip. If it snapped back, restore.
D. Banner exit: must reach opacity 0 before DOM removal at
   BIG/MEGA/EPIC, 1280 and 390. Centring drift ≤ 1 px.
E. Phone SPIN press: still present after merge. Reduced
   motion: scale only, no spin rotation.
F. Shock ring, H1 spoke, scatter scanline: still live in
   built CSS (liveness gate). If dead, restore the gate
   pattern, do not invent new keyframes.
G. Hero blink into reactions: 0 of N on a 15-run probe.
   If it regresses, fix in HeroIdle.svelte only.
H. Park, do not redesign: win band covering the hero head;
   max-win overlay covering the hero; sub-10x celebration
   policy; SC-03 target.

Phase 3 — R147 audio code leftovers (code only)
D2, D4, D5 as named in R151 owner list item 5.
Read soundService.ts and the R148/R147 reports.
If a defect is already closed, write CLOSED with file:line.
If still open and the fix is local (no new stem, no new
graph), fix it.
Do not touch loopBed.ts loop math.
Do not change duck numbers.
Space/Enter splash is Phase 1 item 2, not this phase.

Phase 4 — locales, widths, replay, reduced motion
1. Paytable, HUD labels, banner tier words, feature copy:
   load en, and at least one of ja / zh / ar. No overflow
   that clips a live value. No baked English in rasters.
2. Widths 1280, 390, and one compact-landscape if that
   layout exists. Capture idle / ≥10x win / feature entry.
3. Bet Replay: audio proof r043 still 11/11. Web Audio bed
   still observed. Replay values match the booked round.
4. prefers-reduced-motion: hero float off or frozen, title
   pulse off, symbol idles off or static, feature frame not
   flashing, spin glyph not rotating.

Phase 5 — docs and git hygiene
1. Dated notes only. Do not rewrite R103 or any other dated
   paragraph in place.
2. GAME_FACTS / SUBMISSION_DOSSIER / sounds README: current
   bed is the R150 take, exemption in force, circular bed
   retired, 140 ms ChatGPT edit licence line unchanged.
3. Delete merged session branches that are ancestors of
   main and have a merged PR. Log tips for restore.
   Do not delete anything with unique commits.
4. uploads/.env remains tracked-empty; do not add secrets.
5. Record owner kit command:
   the exact frontend build + zip steps this repo already
   uses. Do not run a portal upload.

Phase 6 — self-audit
Five lenses minimum: fence, number re-derivation, motion
regressions, copy/locale, CI impact.
Every serious finding re-derived first-hand before a fix.
Fail-closed instruments. Seeded reds on new gates.
Local static job + 28-leg browser matrix on the final tip.
PR review lane. Do not merge. Do not touch 5173.

Look-pass screens
Idle, ≥10x win, feature entry, at 1280 and 390.
Console boot line must read Future Spinner v10 build <sha>
with no DIRTY / uncommitted.
No committed shot may contain gitignored scratch art.

Owner list at the end, numbered, each with next action:
kit rebuild, Hayden cover + ≤30s muted hover clip,
win_max stem 1.81 s, phone-floor on the dual-mono idle,
parked layout items (banner-over-hero, max-win-over-hero),
anything you could not close.

Close report in SESSION_REPORT.md plus dated archive.
Every figure in the report re-derived in this session.
