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
| **TR-115 / TR-086** | Money display fit failures as one class: pods clipping, ellipsising or overflowing at various widths and magnitudes. | **CLOSED 2026-08-15 by R071 TASK 8.** The shared fit-or-abbreviate mechanism this row was waiting for HAS SHIPPED and is CI-gated. VERIFIED at HEAD by direct read: `actions/fitMoney.ts` and `actions/autofitText.ts` both exist, the money-bearing nodes are marked `data-money` across the component tree, and `money_fit_gate.mjs` asserts no ellipsis, no overflow and marker visibility on every marked node, at every profile, in CI |
| **TR-114** | The replay ghost pod. Replay surfaces are outside the watched session; ignore unless a frame shows it. | **CLOSED 2026-08-15 by R071 TASK 8.** Fixed by DELETION rather than by fitting: the pod component is gone (R058 TASK 2, under the owner's design ruling of 2026-08-13), `ReplayMode.svelte` records the removal in place of the mount, and `replay_contract_gate.mjs` now ASSERTS the replay DOM contains zero `.win-pod` elements with a seeded self-test behind it. VERIFIED at HEAD by direct read |
| **TR-112** | Repo hygiene (unreferenced sounds, npm check warnings). Not player-visible; not frame-auditable. | **PARTLY CLOSED 2026-08-15 by R071 TASK 8, and this row's own notes already said so while its State column did not.** Two of the four components are closed: bg-1.jpg is deleted and the unreferenced sounds are gone, VERIFIED at HEAD by find. The row stays open only for its remaining components, and those should be re-derived against the current lockfile rather than read from a figure quoted weeks ago |
| **Q-16 park** (charter 4.3) | Hardcoded English on all localised frames: autoplay panel labels (`Stop on win`, `Loss limit`, `Spins`, `Session`), paytable section headers (`Symbol Payouts`, `Interface Guide`, `Responsible Play`, `Disclaimer` and siblings), `Press COLLECT or hit Enter to continue` on the max win overlay, `Mute`/`Unmute`, plus aria labels. About 35 keys, about 560 translated values. | **THE PARK IS SUBSTANTIVELY CLOSED, 2026-08-15 by R071 TASK 8.** VERIFIED at HEAD: `frontend/scripts/hardcoded_string_baseline.json` reads a frozen count of **0** with an empty frozen list, and the gate runs in CI. Every literal the park enumerated is gone from source. Charter section 4.3 carried the same stale park and is corrected with it |
| **Q-26** | Multiplication sign as letter `x` while other surfaces use `×`. | **CLOSED 2026-07-30 by the true fixdown, all 51 instances, and the class now has a gate.** The re-enumeration below was correct at 51, and the sweep replaced every one: `prose.ts` 6 and `prose.locales.ts` 45, three tokens (`1.25x`, `1.6x`, `5x`) at 17 each. U+00D7 went 116 to 167, which is 116 plus exactly 51, and `grep -coE "[0-9](\.[0-9]+)?,?[0-9]*x"` over both files now returns 0. **The "no gate covers this class" sentence below is superseded**: `frontend/scripts/multiplication_sign_gate.mjs` is wired into the static job beside the dash gate, and its seeded self-test plants the defect in `prose.locales.ts` specifically, because that is the file the four-count instrument never searched. `social_string_conformance.mjs:29,:30,:149` hardcoded the pre-sweep literals and were updated in the same commit. DOM re-proof at `reports/qa/session4b/social_string_conformance_2026-07-30_q26_reproof.json`. Rows S2-C020 and S2-C021, commit `fec8d61`. The historical record follows. **PARTIALLY CLOSED 2026-07-29.** The win banner instance is FIXED (TR-117): its remaining `10x`/`30x`/`100x` hits are comments at `WinBanner.svelte:7`, `:50` and `:216`, none rendered. **RE-ENUMERATED 2026-07-29 by the boot-set audit, as this row itself demanded, and the answer is 51 not four.** This row previously said "The four prose and config instances REMAIN OPEN". The real surviving set is **51 player-visible instances**: 6 in the English prose, at `frontend/src/lib/i18n/prose.ts:90` and `frontend/src/lib/i18n/prose.ts:189` (the Overboost blurb, carrying `1.6x` and `1.25x`) and `frontend/src/lib/i18n/prose.ts:94` and `frontend/src/lib/i18n/prose.ts:192` (the Super blurb, carrying `5x`), across the real-money and social variants; and **45 across `frontend/src/lib/i18n/prose.locales.ts:1`, which is 15 locales nobody had counted**. `frontend/src/lib/config/fsModes.ts` contains none of them, so `docs/QUALITY_CHARTER.md`'s Q-26 row named the wrong file as well as the wrong count; corrected there too. The same files already use `×` correctly 116 times. **No gate covers this class**, so it cannot regress noisily. OPEN. |
| **Q-27** | Vite scaffold CSS remnants in `app.css`. | **CLOSED 2026-08-15 by R071 TASK 8.** The row read OPEN AND WIDER THAN RECORDED, and at HEAD it is neither: the scaffold anchor rules are gone (`app.css` carries no anchor rule at all), `#535bf2` and `#646cff` both return ZERO hits across the frontend source and `index.html`, and `#app` was reduced to width and height. VERIFIED 2026-08-15 by direct grep |
| **Q-28** | Explanatory HTML comments shipping in `dist/index.html`. Not frame-visible. | **FIXED AT SOURCE 2026-08-15 by R071 TASK 8's recount.** VERIFIED at HEAD by direct read: `vite.config.ts` defines a `stripHtmlComments()` `transformIndexHtml` plugin, deliberately preserving IE conditional comments, and registers it in the plugin list. The charter's Q-28 row carried the same stale OPEN |
| **Q-34** | The same mode reads `Cruise` on the features menu, paytable and buy dialog and `CRUISE` on the HUD badge, via `text-transform: uppercase` present on one surface class and absent on three. | **FIXED 2026-07-28 as TR-092, a day before this register's own refresh, and the State column never moved. Corrected 2026-08-15 by R071 TASK 8.** VERIFIED at HEAD by direct read: `text-transform: uppercase` is removed from all three mode-badge classes in `HudOverlay.svelte` and each site carries the TR-092 comment recording the removal rather than the rule being silently deleted |
| **Q-07** | The infinity glyph on the autoplay infinite option falls back to a system font by design. | **REVIEWED AND KEPT, and the COUNT is corrected 2026-08-15 by R071 TASK 8: seven instances, not four.** The allowlist entry and its reasoning are intact. The source moved because each of the three layout profiles gained a pending state carrying the same glyph. The disposition never depended on the number |
| **TR-089** | Win count-up digit shimmy on `.fs-num` is FIXED (per-digit 0.834em boxes) and held by `win_countup_steady_gate.mjs`. | **CLOSED 2026-08-15 by R071 TASK 4, and the mechanism this row describes is RETIRED.** The per-digit 0.834em boxes are gone: `WinBanner.svelte` carries no `.c1-digit` rule at HEAD, VERIFIED by direct read. Exo 2 with `font-variant-numeric: tabular-nums` and `font-kerning: none` now holds every money and counting surface still from ONE rule in `app.css`, so the class is closed at the cause instead of at one site. See TR-158 |
| **MID-01** | The win banner and the HUD WIN pod counted the same figure up on two clocks, so they showed different dollar amounts at once and the pod revealed the total the celebration exists to reveal. | **CLOSED 2026-07-30 by the true fixdown**, per Fable's ruling. One shared source at `frontend/src/lib/stores/winCountUp.ts`: one tween engine, one duration rule, one instance driven from `$winAmount` by the store module, with both surfaces as pure readers, so equality is structural rather than asserted between two implementations. Measured before: at 16x the HUD settled 872ms early, at the epic tier 1936ms early. Measured after: exact agreement on every sampled frame at big, mega and epic, 0ms early. Held by `win_countup_sync_gate.mjs`, seeded per convention (p) with the pre-fix pair AND a planted second loop. Fresh frames at `reports/screens/mid01-countup-sync-2026-07-30/`. Commit `9ac424b`. |
| **MID-01b** | **NEW, 2026-07-30. A THIRD win count-up clock.** `WinDisplay.svelte:50` runs its own 600ms count-up over the same `$winAmount`, on the replay surface. | **OPEN.** NOT a MID-01 instance: `App.svelte`'s single `{#if isReplay}` and its `{:else}` are mutually exclusive branches, and `WinDisplay` is mounted only from `ReplayMode.svelte` (line citations dropped 2026-07-31: they had drifted, and the reasoning never depended on them), so it never renders beside the HUD pod and no player sees two figures disagree. What is real is a third duration rule for one figure on a compliance-mandated surface. **Frozen by file in `win_countup_sync_gate.mjs` with its reason, checked in both directions**, so a FOURTH loop still fails the gate and a stale freeze entry also fails. Found by that gate's own negative control on its first run, which is what convention (p) predicts. |
| **RTL** | Arabic renders correct Arabic strings into an unchanged LTR layout: no `dir` attribute, no logical properties anywhere in `frontend/src`. `frontend/index.html:2` is hardcoded `lang="en"`. | **TWO OF THE THREE CITED FACTS ARE NOW FALSE; corrected 2026-08-15 by R071 TASK 8.** VERIFIED at HEAD by direct read: the app root sets both the document language and the direction attribute at runtime from a named right-to-left locale set, so the shipped index document's static lang is the PRE-HYDRATION default only and not the shipped state. **What remains genuinely open is narrower and is not being closed here**: a full right-to-left layout pass is a different and larger question from the direction attribute, and this row should be read as that question from now on |

## Gate blind spots already recorded (do not re-derive)

- `locale_completeness_check.mjs` cannot see script-block literals rendered
  through a variable (TR-104's shape), literals beside interpolations, or
  interpolation-internal literals beyond the shapes TR-091 widened it to.
- Cross-surface capitalisation and button casing (charter classes 4 and 7) are
  gated nowhere; the frames are the instrument.
  **CLOSED 2026-08-15 by R071 TASK 8. This blind spot has an instrument now.**
  VERIFIED at HEAD by direct read: `machine_tell_gate.mjs` emits a
  `cross-surface-casing` finding on any `text-transform` casing rule, quotes the
  standing mandate's own wording for the class beside it, and carries a seeded
  self-test fixture. It runs in CI with that self-test. The frames are still
  worth looking at; they are no longer the only instrument.
  **The locale blind spot above is DIFFERENT and is NOT closed by this.** The
  named gap in that one gate stands exactly as written. What changed is that it
  is no longer the only instrument either: `locale_prose_conformance.mjs` now
  runs beside it in CI and detects prose leaking into the rendered DOM, which is
  a different question asked of a different artefact. Recorded 2026-08-15 by
  R071 TASK 8, and the gap is deliberately left OPEN rather than declared closed
  by a neighbour, because two partial instruments are not one complete one.

## Refreshed 2026-07-29 with Session 1 closures

Session 1 of the stream close ran the sight gate, the cluster marshal and the verification
panels. What a squad on ANY later audit needs to know before reporting:

- **The stream test findings live in the 54 shards at `reports/qa/stream_test/shards/`,
  counted and tiered in `CLUSTERS.md`. There are 566, of which 506 are HIGH, MEDIUM or LOW
  and are UNCLUSTERED AND UNVERIFIED.** If you find something on a rendered surface, check
  there before opening a new id. Most of it is already recorded.

  > **CORRECTED 2026-07-29 by the boot-set audit, and it was wrong in two ways that would
  > have cost a reader real time.** It read: *"The stream test ledger is at
  > `reports/qa/stream_test/LEDGER.md`, its clusters at `CLUSTERS.md`, and it holds 571
  > findings."*
  >
  > **First, the wrong FILE.** `LEDGER.md` does not hold the findings. Its own text says so:
  > *"this ledger holds only the two entries below"*. A session following this instruction
  > would have opened the ledger, found two rows, and concluded the corpus did not exist.
  > The findings are in the shards; `CLUSTERS.md` counts and tiers them.
  >
  > **Second, the wrong TOTAL.** 566, not 571, counted from the shard headings.
  > `CLUSTERS.md` carried the same overcount and is corrected there with the derivation.
  > The "506 HIGH, MEDIUM or LOW" in this sentence was always right, and 60 STREAM plus 506
  > is 566, so this document contained the evidence against its own total.
- **25 of the 26 STREAM clusters are dispositioned**: 1 CLOSED as not a defect (C-20, the
  balance readout claim, refuted by both panel seats), **17** owner-parked with a
  panel-corrected diagnosis, 7 REOPENED for re-clustering. **C-12 is UNDISPOSITIONED.**
  **THE DISPOSITION RECORD IS STILL OPEN AND THE DEFECT IS FIXED, and those are two
  different facts. Recorded 2026-08-15 by R071 TASK 8.** VERIFIED at HEAD by direct
  read: `prose.locales.ts` carries the German `responsiblePlayHeading` and a fully
  translated `responsiblePlayBody`. **The row is left UNDISPOSITIONED on purpose**,
  because inventing a disposition for it now would be exactly the thing the original
  note refused to do, and the honest state is "the thing it described is fixed, and
  nobody has ever ruled on which cluster it belonged to".

  > **CORRECTED 2026-07-29 by the boot-set audit's adversarial verifier.** This read "26
  > STREAM clusters are dispositioned ... 18 owner-parked". `CLUSTERS.md`'s disposition table
  > claimed 18 in that row while naming 17 ids, so 1 plus 17 plus 7 is 25, and **C-12 appears
  > in none of the three rows**. C-12 is real, defined at `CLUSTERS.md:64`, the German
  > Responsible Play paragraph rendering in English under a German heading. Its disposition
  > is left open rather than invented, with the evidence recorded at `CLUSTERS.md`.
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
