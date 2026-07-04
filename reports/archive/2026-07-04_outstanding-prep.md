# Session Report: outstanding pre-deploy list (docs, tile/RTP findings, cleanup)

- **Date:** 2026-07-04
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/outstanding-prep` (from `main`, after PR #26 merged).
- **Source:** owner: "move forward with the outstanding list" (the pre-deploy items).

Worked the can-do-now outstanding items. One turned up a real correction to our compliance gate.

## 1. Captured the full approval-guidelines doc set (+ a rubric correction)

The dossier's `/docs/approval/checklist` and `/docs/approval/game-tile` URLs were wrong (they
error). Via the docs nav I found the real set under `/docs/approval-guidelines/` and captured the
**six pages we were missing**: submission-checklist, game-tile-requirements, rgs-communication,
front-end-communication, math-verification, general-disclaimer (now 11 pages mirrored; manifest
rebuilt). Key findings (logged in `COMPLIANCE_WATCH.md`):

- **RTP band is 90.0%-96.70%, not up to 98%** (math-verification). We are compliant at **96.35%**
  (0.35% headroom). `scripts/validate_math.py` was **tightened to the real 96.70% cap** plus the
  documented star-tier operator-risk gates (max payout 100,000x, max cost mult 1,500x, base SD
  band 0.6-60, P(>=5000x) cost-scaled <= 1e-2, max win reachable < 1-in-10M). Re-ran: still ALL
  PASS - base P(>=5000) 1e-5, bonus 1e-3, base SD 17.28.
- **rgs-communication / front-end-communication** (the official contract docs) align with our
  `docs/RGS_CONTRACT_REFERENCE.md`.
- **game-tile-requirements:** BG + FG combined <= 3MB, transparent-PNG FG + Provider Logo, naming
  conventions - feeds the tile asset task.
- **submission-checklist** full criteria are **login-gated** - capture on the owner's next portal login.

## 2. LAYOUT_SPEC v3.7 amendment

Recorded the recent visual work: framed neon HUD value boxes; CSS-drawn instrument plates (flat
`instrument_plate` PNG retired); free-spins board enlarged (72px) and shifted left so the Overdrive
meter clears the top-right tile; the win-connection story + big-win dwell; the max-win dwell; and
the scene hover-pad turbines (with the reverted wheel-split noted).

## 3. Cleanup

- Retired the now-unused `instrument_plate.png` + `instrument_plate_1x.png` (removed both exports
  from `scripts/assets/manifest.json`, deleted the PNGs; pipeline 35 -> 33 outputs, build clean).
- The stale `submission-package/` legacy dir is **already gone** (not tracked) - item resolved.

## Verification

`validate_math.py` PASSES against the tightened real rubric; `npm run assets` + `npm run build`
clean; JSON valid. No frontend code changed; locks untouched.

## Still outstanding (needs deploy / owner)

Verify replay event IDs + real-RGS test on staging, upload bundle to portal; owner: IP/trademark,
public high-res asset link, blurb re-approval, STAKE_TEAM/game-slug, and the authenticated
submission-checklist capture. Tile assets (BG/FG/logo) per the now-captured game-tile spec.
