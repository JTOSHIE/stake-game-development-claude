# FUTURE SPINNER — GAME FACTS

Authoritative facts sheet compiled for external audit. Every figure below is quoted from a
committed repo document (cited inline); none is invented or estimated for this sheet. Where
the maths PAR sheet and later art passes disagree only on a symbol's cosmetic name (the
maths ID itself never changes, see `design-system/DESIGN_SYSTEM.md`), the current shipped
name is used and the PAR sheet's original name is noted alongside it. The full maths ID to
display-name reconciliation and integrity statement is in `docs/PAR_NAMING_ADDENDUM.md`.

## 1. Game identity

| Field | Value | Source |
|---|---|---|
| Game name | Future Spinner | `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` |
| Studio / brand | We Roll Spinners | `FUTURE_SPINNER_PAR_SHEET.md`; `design-system/DESIGN_SYSTEM.md` |
| Grid | 5 reels x 4 rows (20 symbol positions) | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Win mechanic | Ways-to-win, up to 4^5 = 1,024 ways | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Bet modes | Five (FeatureMath v2, 2026-07-07): `base` 1.0x, `cruise` 1.0x, `antelite`/OVERBOOST 1.25x, `bonus`/Buy Overdrive 100.0x, `super`/NITRO OVERDRIVE 400.0x | `FUTURE_SPINNER_PAR_SHEET.md` §1, §10, §11 |
| Min / max bet | $0.10 / $100.00 | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Simulation basis | 100,000 rounds per mode, Stake Engine SDK v1 | `FUTURE_SPINNER_PAR_SHEET.md` (header) |
| Optimiser | PigFarm (Rust); all five modes converged to 96.3500% RTP | `FUTURE_SPINNER_PAR_SHEET.md` (header) |
| Version | v1.2.0 (FeatureMath v2, five modes) | `FUTURE_SPINNER_PAR_SHEET.md` §12 footer |

Note (2026-07-07): the "Verified mathematics" section below (§2) was compiled before
FeatureMath v2 and documents `base`/`bonus` only. Cruise/antelite/super's independently
re-verified figures (all 96.350000% RTP; SD 11.29x/20.32x/539.16x; wincap 1-in-250k/
1-in-80k/1-in-250) are in `HANDOVER_2026-07-07_Fable.md`'s per-mode table and
`FUTURE_SPINNER_PAR_SHEET.md` §§10-11; a full three-mode audit-sheet expansion mirroring
the Base/Bonus sections below remains a follow-up, not done in this pass.

## 2. Verified mathematics

All figures are from `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`, which the dossier
records as independently recomputed with exact integer arithmetic (`fractions.Fraction`) and
verified against the books.

### Base mode (cost 1.0x)

| Metric | Value |
|---|---|
| RTP | **96.3500%** at 4dp (10dp: 96.3499998727%) |
| Hit rate (win > 0) | **29.11%** |
| Zero-win rate | 70.89% |
| Volatility (weighted SD) | **17.28x** |
| Maximum win | 5,000x bet (hard cap) |
| Free-spin trigger rate | **1 in 184.7** (0.5415%) |
| Average triggered-round win | 79.40x bet |
| Wincap frequency | 1 in 100,000 (0.001%) |
| RTP split | Base ways 53.3500% + Overdrive free-spin rounds 38.0000% + wincap rounds 5.0000% = 96.3500% |

### Bonus buy mode (cost 100.0x)

| Metric | Value |
|---|---|
| RTP | **96.3500%** at 4dp (10dp: 96.3499999962%) |
| Trigger rate | 100% (guaranteed 3+ scatter entry) |
| Average bought outcome | **96.35x bet** (i.e. RTP 96.35% at the 100x cost) |
| Volatility (weighted SD) | 206.63x |
| Maximum win | 5,000x bet (hard cap) |
| Wincap frequency | 1 in 1,000 (0.100%) |
| RTP split | Overdrive free-spin rounds (incl. instant pays) 91.3500% + wincap rounds 5.0000% = 96.3500% |

### Tail-risk / hard-cap verification

- Maximum win is **exactly 5,000.00x with zero rounds above the cap in either mode**
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Both lookup tables independently recomputed with exact integer arithmetic; both equal
  96.3500% RTP at 4dp (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Books match the lookup tables positionally by id and as sorted multisets, in both modes
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Simulation is deterministic — fixed seeds reproduce identical payouts
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Round-shape audit of freegame-containing books confirmed correct trigger counts,
  retriggers, Overdrive multiplier progression (+1 only after winning spins, applied to
  subsequent wins), instant scatter pays, and that the total payout equals the recorded
  payout multiplier in every sampled round (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- SHA-256 manifest recorded for `index.json`, `game_metadata.json`, both lookup tables and
  both compressed book files (`FUTURE_SPINNER_PAR_SHEET.md` §9 table).

### Paytable (per-way multiplier x bet x ways x Overdrive meter)

| Match | H1 | H2 | M1 | M2 | M3 | L1 | L2 | L3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 5-of | 22.00 | 10.00 | 5.00 | 4.00 | 2.00 | 1.50 | 0.80 | 0.65 |
| 4-of | 6.00 | 3.00 | 1.50 | 1.00 | 0.60 | 0.45 | 0.25 | 0.20 |
| 3-of | 1.50 | 0.80 | 0.45 | 0.30 | 0.20 | 0.15 | 0.10 | 0.08 |

Wild substitutes for all pay symbols (no independent pay). Scatter pays instantly and does
not participate in the ways calculation (`FUTURE_SPINNER_PAR_SHEET.md` §3).

## 3. Feature rules — Overdrive Free Spins

Source: `FUTURE_SPINNER_PAR_SHEET.md` §2 and `CLAUDE.md` "True game facts".

- **Trigger:** 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins and pay an
  instant scatter award of 1x, 3x or 10x total bet respectively.
- **Overdrive meter:** starts at 1x. After every **winning** free spin the meter rises +1x
  and applies to all subsequent free-spin wins (ways wins and scatter pays alike). It never
  resets during the round and is not retroactive; no cap beyond the round win cap.
- **Retrigger:** 3 or more scatters during free spins award +5 free spins and pay their
  instant scatter award multiplied by the current Overdrive meter.
- **Bonus buy:** the `bonus` mode (cost 100.0x) guarantees a 3+ scatter trigger spin.
- **Win cap:** 5,000x total per round, hard, both modes.
- **Stateless:** the entire feature resolves inside a single book round; no state carries
  between rounds. No jackpot, gamble, or continuation mechanic.
- **Scatter values are 1x/3x/10x everywhere** (maths, PAR, frontend) — not 5x/15x/50x.

### Trigger distribution

| Free spins | Scatters | Base-mode share | Bonus-mode share |
|---:|---:|---:|---:|
| 8 | 3 | 86.37% | 76.56% |
| 12 | 4 | 12.78% | 16.37% |
| 16 | 5 | 0.85% | 7.07% |

(`FUTURE_SPINNER_PAR_SHEET.md` §5, §6)

### Symbol lineup (art is skin level; the maths IDs H1/H2/M1/M2/M3/L1/L2/L3/W/S never change)

| ID | Current shipped name | PAR sheet name (maths doc, unchanged) |
|---|---|---|
| H1 | Spinning Rim | Spinning Rim |
| H2 | Nitro Canister | Turbocharger |
| M1 | Steering Wheel | Car Grille |
| M2 | Coilover | Exhaust Pipe |
| M3 | Plasma Booster | Steering Wheel |
| L1 | Lug Nut | Lug Nut |
| L2 | Blade Fuse | Spark Plug |
| L3 | Piston | Piston |
| W | Wild (machined W hub) | Wild |
| S | Energy Burst Scatter | Scatter |

(`design-system/DESIGN_SYSTEM.md` "APPROVED SYMBOL LINEUP"; `FUTURE_SPINNER_PAR_SHEET.md` §3/§4.
Reel frequencies, which are maths-locked, are unaffected by the cosmetic rename.)

## 4. Technology summary

- **Frontend:** Svelte + PixiJS. Reel motion is ticker-driven (PixiJS `app.ticker`, 60fps);
  win-line highlighting and win particle bursts render on a transparent Pixi canvas layered
  over the symbol grid (`reports/archive/2026-07-04_motion-polish-v2.md`).
- **Asset pipeline:** deterministic, in-house, vector-to-raster. Every visual asset derives
  from SVG masters in `design-system/masters/` via `npm run assets`
  (`scripts/assets/build.py` + `manifest.json`), reproducible byte-identical on re-run. Layered
  exports (e.g. H1's rotating spoke sprite, H2's needle, the Overdrive flame jets) isolate
  named SVG groups so the engine animates parts independently of the static base art
  (`design-system/DESIGN_SYSTEM.md`; `reports/archive/2026-07-04_motion-polish-v2.md`;
  `reports/archive/2026-07-04_opus-elevate-2.md`). No externally sourced or AI-generated
  stock art; Manus is retired (`CLAUDE.md` "Assets").
- **Backgrounds:** static graded stills (one base scene, one Overdrive-state variant), no
  background video ships (`design-system/DESIGN_SYSTEM.md` ADDENDUM "Static environment
  backgrounds").
- **Speed tiers:** three — Normal, Turbo, Super Turbo — scale every reel-motion duration
  (`design-system/LAYOUT_SPEC.md` "Reel feel requirements"; implemented in
  `frontend/src/lib/stores/speedMode.ts`, verified in
  `reports/archive/2026-07-04_motion-polish-v2.md`). Autoplay honours the active tier.
- **Layout system:** a single 1280x720 design surface scaled by one factor `S` so the whole
  stage (frame, grid, HUD, instrument column) shrinks/grows together
  (`design-system/LAYOUT_SPEC.md` v3.1 onward, amended through v3.4 for the fixed-field HUD
  and Overdrive flame jets).
- **Audio: shipped** (2026-07-13, previously the one open creative item per
  `docs/CHAT_CLOSEOUT_2026-07-06.md`). Twelve mastered sound files - two music beds
  (`bgm_loop` 100 BPM, `bgm_tension` 140 BPM, both crossfading on Overdrive entry/exit)
  and ten SFX/stingers - generated via Stable Audio 3 open weights
  (`tools/audio_forge/generate.py`, model `stabilityai/stable-audio-3-medium`), mastered
  deterministically (`tools/audio_forge/master.py`: silence trim, bar-aligned loop points,
  loudness normalisation with a verified win-tier escalation check) and wired into
  `soundService.ts`. Provenance: `reports/audio/GENERATION_LOG_2026-07-13.md` (per-file
  model/seed/prompt), `frontend/public/assets/themes/future-spinner/sounds/README.md`,
  licensed under the Stability AI Community License
  (`tools/audio_forge/LICENSE.md`/`NOTICE`). Verified via
  `frontend/scripts/audio_verify.mjs` - ALL CHECKS PASS.

## 5. Compliance summary

- **Locales:** 16, with social-mode overrides for every player-facing string
  (`SUBMISSION_DOSSIER.md` §4; `CLAUDE.md`).
- **Social mode:** prohibited-term overrides applied for stake.us (`social=true`); the
  `disabledBuyFeature` jurisdiction flag fully hides the bonus buy where required
  (`COMPLIANCE_WATCH.md` "Current posture").
- **Bet Replay:** implemented and mandatory-compliant, no player session required; bonus-buy
  replays display the amount spent including the 100x cost multiplier
  (`COMPLIANCE_WATCH.md`; `SUBMISSION_DOSSIER.md` §4).
- **Disclaimer:** the Stake Engine seven-point disclaimer and full paytable are always
  reachable (`SUBMISSION_DOSSIER.md` §4).
- **Responsive viewports:** verified at all six required viewports — Mobile S 320x568,
  Mobile M 375x667, Mobile L 425x812, Popout S 400x225, Popout L 800x450, Desktop 1200x675
  (`SUBMISSION_DOSSIER.md` §4; occlusion/position audits in
  `reports/archive/2026-07-04_layout-install.md` and `reports/archive/2026-07-04_ux-polish.md`).
- **Stateless / no jackpot, gamble, or continuation:** verified, matches the Stake Engine
  approval-guidelines key restrictions (`COMPLIANCE_WATCH.md`).
- **Original IP, no Stake branding, no underage appeal:** verified (`COMPLIANCE_WATCH.md`).
- **fps gate:** headless run of 20 spins including a full bonus round averaged **59.9fps**
  against a >=55fps gate (PASS); a single frame exceeded 100ms, root-caused to a one-time
  browser cold-start cost at the very first Overdrive-entry mount on a fresh page load, not
  a recurring reel-motion defect (`reports/archive/2026-07-04_motion-polish-v2.md`;
  re-confirmed with flame jets burning in `reports/archive/2026-07-04_opus-elevate-2.md`).
- **Exact-total interpreter gate:** the presented win sequence sums exactly to the book's
  recorded payout on every sampled round, PASS 58/58 across the full curated sample pool
  (`reports/archive/2026-07-04_ux-polish.md`; re-confirmed in later passes).

## Sources

`games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` · `SUBMISSION_DOSSIER.md` ·
`COMPLIANCE_WATCH.md` · `CLAUDE.md` · `design-system/DESIGN_SYSTEM.md` ·
`design-system/LAYOUT_SPEC.md` · `reports/archive/2026-07-04_layout-install.md` ·
`reports/archive/2026-07-04_ux-polish.md` · `reports/archive/2026-07-04_motion-polish-v2.md` ·
`reports/archive/2026-07-04_opus-elevate.md` · `reports/archive/2026-07-04_opus-elevate-2.md` ·
`reports/audio/GENERATION_LOG_2026-07-13.md` · `reports/archive/2026-07-13_job1-audio-integration.md`
