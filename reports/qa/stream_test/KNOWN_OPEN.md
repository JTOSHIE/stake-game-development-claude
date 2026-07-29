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
| **TR-104** | The win banner rendered `BIG WIN` and the unit `x BET` in English on German and Arabic sessions. | **CLOSED 2026-07-29 by TR-117, both halves.** The tier label was already locale routed by an earlier pass; the unit was the remainder and is now `t($locale, 'bet', ...)` at `WinBanner.svelte`. **The row's own sizing was wrong**: it called this larger than small, sized like TR-091, and it was ONE LINE using a `bet` key that already existed in all sixteen locales. Proof at `reports/screens/winbanner-fix-2026-07-29/`. |
| **TR-115 / TR-086** | Money display fit failures as one class: pods clipping, ellipsising or overflowing at various widths and magnitudes. | OPEN, HIGH, mapped to final-mile JOB 3 (one shared fit-or-abbreviate mechanism). Not this session's to fix. |
| **TR-114** | The replay ghost pod. Replay surfaces are outside the watched session; ignore unless a frame shows it. | OPEN, mapped to JOB 4. |
| **TR-112** | Repo hygiene (unreferenced sounds, npm check warnings). Not player-visible; not frame-auditable. | OPEN, LOW. |
| **Q-16 park** (charter 4.3) | Hardcoded English on all localised frames: autoplay panel labels (`Stop on win`, `Loss limit`, `Spins`, `Session`), paytable section headers (`Symbol Payouts`, `Interface Guide`, `Responsible Play`, `Disclaimer` and siblings), `Press COLLECT or hit Enter to continue` on the max win overlay, `Mute`/`Unmute`, plus aria labels. About 35 keys, about 560 translated values. | OWNER-PARKED, extracted per protocol rule 6. The de and ar squads must list which parked strings are VISIBLE on stream frames, because that changes the park's urgency, but the rows stay parked. |
| **Q-26** | Multiplication sign as letter `x` while other surfaces use `×`. | **PARTIALLY CLOSED 2026-07-29.** The win banner instance is FIXED (TR-117). **The row's enumeration was itself incomplete**, listing four survivors all in `fsModes.ts` when a fifth sat in a component: the instrument that built it searched config and prose and not components. The four prose and config instances (`1.6x`, `1.25x` twice, `5x`, now in `prose.ts`) REMAIN OPEN. Re-enumerate across the whole tree, not two files. |
| **Q-27** | Vite scaffold CSS remnants in `app.css`. | **OPEN and WIDER than recorded.** Session 1 added a player-visible instance the row did not have: `app.css:160-162` styles `button:focus` with Chrome's own `-webkit-focus-ring-color` `rgb(0, 95, 204)`, so a stock browser blue ring sits on the last-touched control through spin, win and COLLECT on a cyan and magenta game. Also still open: stock indigo link colours, `background-color: #242424`, scaffold body centring, and `#app { text-align: center }` which strands paytable bullet markers (cluster C-07, the one cluster both panel seats CONFIRMED outright). |
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

## Refreshed 2026-07-29 with Session 1 closures

Session 1 of the stream close ran the sight gate, the cluster marshal and the verification
panels. What a squad on ANY later audit needs to know before reporting:

- **The stream test ledger is at `reports/qa/stream_test/LEDGER.md`, its clusters at
  `CLUSTERS.md`, and it holds 571 findings of which 506 are HIGH, MEDIUM or LOW and are
  UNCLUSTERED AND UNVERIFIED.** If you find something on a rendered surface, check there
  before opening a new id. Most of it is already recorded.
- **26 STREAM clusters are dispositioned**: 1 CLOSED as not a defect (C-20, the balance
  readout claim, refuted by both panel seats), 18 owner-parked with a panel-corrected
  diagnosis, 7 REOPENED for re-clustering.
- **Only 5 of 26 clusters had a cause that survived a hostile read.** Treat any recorded
  "Where fixable" in a shard as a hypothesis, not a citation, unless a panel confirmed it.
- **C-01's real cause is `GameGrid.svelte:499`, `DROP_H = 520`**, not the CSS both shards
  cited. The reel window is bare by construction for 312 of 412 pixels on every drop.

## Two instrument failures recorded here, because both will recur

- **A parked list that enumerated its own class incompletely** (Q-26 above). The list said
  four, the class had five, and the fifth was in the file type the instrument never
  searched. **Test the instrument against a case you know it should catch before trusting
  an enumeration**, per `FULL_AUDIT_METHOD.md` 2.6.
- **A gate that asserted a call shape rather than its guarantee** went red on an
  improvement (`vocabulary.test.ts`, TR-117). If a gate blocks a change that is plainly
  better, suspect the assertion before the change.
