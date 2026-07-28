# Stream test: the known-open register

Written before Wave 2 so the audit squads cross-reference existing rows instead
of rediscovering them. A finding that matches a row below is reported as
KNOWN(<row>) with the frame path added as fresh evidence; only genuinely new
findings get new ledger ids. Compiled from `docs/records/reviews/REVIEW_TRACKER.md`
and `docs/QUALITY_CHARTER.md` section 4 at HEAD `d9bdf22`.

Australian English, no em dashes or en dashes.

## Open rows a stream-lens audit will re-observe

| Row | What the squads will see | State |
|---|---|---|
| **TR-104** | The win banner renders `BIG WIN` and the unit `x BET` in English on German and Arabic sessions. Source: `WinBanner.svelte:195-197` tier ternary and `:207` unit, hardcoded English on both social branches, no locale route. | OPEN, HIGH. Fix is a sixteen-locale key change on a celebration surface, sized like TR-091: larger than small. |
| **TR-115 / TR-086** | Money display fit failures as one class: pods clipping, ellipsising or overflowing at various widths and magnitudes. | OPEN, HIGH, mapped to final-mile JOB 3 (one shared fit-or-abbreviate mechanism). Not this session's to fix. |
| **TR-114** | The replay ghost pod. Replay surfaces are outside the watched session; ignore unless a frame shows it. | OPEN, mapped to JOB 4. |
| **TR-112** | Repo hygiene (unreferenced sounds, npm check warnings). Not player-visible; not frame-auditable. | OPEN, LOW. |
| **Q-16 park** (charter 4.3) | Hardcoded English on all localised frames: autoplay panel labels (`Stop on win`, `Loss limit`, `Spins`, `Session`), paytable section headers (`Symbol Payouts`, `Interface Guide`, `Responsible Play`, `Disclaimer` and siblings), `Press COLLECT or hit Enter to continue` on the max win overlay, `Mute`/`Unmute`, plus aria labels. About 35 keys, about 560 translated values. | OWNER-PARKED, extracted per protocol rule 6. The de and ar squads must list which parked strings are VISIBLE on stream frames, because that changes the park's urgency, but the rows stay parked. |
| **Q-26** | Multiplication sign as letter `x` in `fsModes.ts` blurbs (`1.6x`, `1.25x` twice, `5x`) while other surfaces use `×`. | OPEN, small, unlocked. Wave 3 fix candidate if visible on frames. |
| **Q-27** | Vite scaffold CSS remnants in `app.css`: stock indigo link colours, `background-color: #242424`, scaffold body centring. | OPEN, small, unlocked. Visible only if any link or unstyled surface reaches a frame. |
| **Q-28** | Explanatory HTML comments shipping in `dist/index.html`. Not frame-visible. | OPEN, small. |
| **Q-34** | The same mode reads `Cruise` on the features menu, paytable and buy dialog and `CRUISE` on the HUD badge, via `text-transform: uppercase` present on one surface class and absent on three. | OPEN, one-property fix in either direction; the direction is an art call. |
| **Q-07** | The infinity glyph on the autoplay infinite option falls back to a system font by design. | REVIEWED AND KEPT, allowlisted. Not a finding. |
| **TR-089** | Win count-up digit shimmy on `.fs-num` is FIXED (per-digit 0.834em boxes) and held by `win_countup_steady_gate.mjs`. | CLOSED for that surface. Any OTHER numeric surface that shimmies (balance tick, feature total, meter) is a NEW finding. |
| **RTL** | Arabic renders correct Arabic strings into an unchanged LTR layout: no `dir` attribute, no logical properties anywhere in `frontend/src`. `frontend/index.html:2` is hardcoded `lang="en"`. | Known gap, flagged by round three reviewer 3; no row yet. The ar squad should record specific frames where LTR flow visibly harms the Arabic read, so the park is evidenced rather than abstract. |

## Gate blind spots already recorded (do not re-derive)

- `locale_completeness_check.mjs` cannot see script-block literals rendered
  through a variable (TR-104's shape), literals beside interpolations, or
  interpolation-internal literals beyond the shapes TR-091 widened it to.
- Cross-surface capitalisation and button casing (charter classes 4 and 7) are
  gated nowhere; the frames are the instrument.
