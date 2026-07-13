# Handover to Fable — Future Spinner status update (2026-07-07)

**From:** the working session (Claude Sonnet 5). **To:** Fable (has main-repo access).
**Purpose:** a focused update on everything that shipped since `HANDOVER_2026-07-06_Fable.md`
(PR #38, still the primary reference for full historical context - graphics overhaul,
LUMEN, the build-original-slot skill, the designer relationship). This handover covers
**PRs #39-#46**, all now merged to `main`, and closes out the one item that document left
"gated on the owner."

Australian English throughout; no em or en dashes anywhere.

---

## 0. TL;DR

- **FeatureMath v2 shipped.** The item PR #38 flagged as the critical-path blocker (a lock
  sanction + a ship name for the Super Buy) arrived, ran, and is merged. The locked
  `games/future_spinner` package now ships all **five** modes live - Normal, Cruise,
  OVERBOOST, Buy Overdrive, and **NITRO OVERDRIVE** (the 400x Super Buy) - all independently
  re-verified at **96.3500%** RTP, 5,000x cap, stateless. I re-ran the maths gate myself
  today from the current shipped tables; see section 2.
- **Found and fixed a real billing bug** (not something I introduced spec-wise, but caught
  mid-session): every FEATURES-menu buy card was silently charging 100x and serving a
  `bonus` round regardless of which tier was clicked, so the new 400x NITRO OVERDRIVE tier
  was actually only charging 100x. Fixed, verified end to end (see section 3). Flagging this
  because it is exactly the kind of thing worth a second set of eyes on before submission.
- **Recovered an orphaned branch's remaining value.** A local-only `claude/compliance-rg`
  branch (never pushed, never PR'd) turned out to hold a full responsible-gambling module,
  a mechanic-agnostic per-cell overlay, a telemetry emitter, a PF determinism test, and a
  not-for-release Collection Meter maths prototype. All hand-picked and landed (see section
  4) rather than merged wholesale, since the branch had also diverged from a lot of
  since-shipped work.
- **LUMEN parity.** Future Spinner only had mute/unmute; LUMEN (the side project) already
  had independent MUSIC/SOUND volume sliders and a paytable Interface Guide. Ported both
  over (see section 5).
- **Everything below is independently re-verified today**, not carried forward from prior
  claims: `npm run build` clean, `svelte-check` clean, the RG logic test (12/12), the PF
  determinism test (58/58), the Google-Fonts-CDN compliance grep (empty), and
  `scripts/validate_math.py` (all-pass, fresh numbers pasted in section 2). Locked files
  (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**`) are untouched by anything
  in sections 3-5 - only FeatureMath v2 (section 2) touched the locked maths package, under
  its own sanctioned lock exception.

---

## 1. Repository map (delta since PR #38)

### Merged to `main` since the last handover
| PR | Branch | What |
|----|--------|------|
| #39 | featuremath-v2-brief | Corrected FeatureMath v2 brief, Fable's guards folded in |
| #40 | chat-closeout | Full snapshot of undocumented decisions (audio plan, parked creative inventory) |
| #41 | build-diet-qa | Build Diet v2 (shipped-bundle asset pruning) + QA soak harness |
| #42 | featuremath-v2 | **NITRO OVERDRIVE + OVERBOOST into the locked package** (the gated item) |
| #43 | compliance-rg-v2 | Responsible-gambling module + SessionPanel (Pass A) |
| #44 | fix-buy-tier-billing | Buy-tier billing bug fix |
| #45 | compliance-rg-passb | CellModifier overlay + telemetry + PF determinism test + Collection Meter recovery (Pass B) |
| #46 | lumen-parity | MUSIC/SOUND volume sliders + paytable Interface Guide |

No PRs are currently open. All eight landed cleanly (two of them - #44 and #45 - needed a
manual re-merge after #43 landed first and touched the same file; resolved, re-verified,
merged).

### Still-relevant reference branches (unchanged from PR #38, not for merge)
`claude/lumen-sideproject` (LUMEN), `claude/fs-super-prototype` (superseded now that its
recipe shipped in #42, kept as the historical record), `claude/gap-analysis` (11-mode
template library, reference only).

---

## 2. FeatureMath v2 — the gated item, now shipped and re-verified today

The lock sanction and the ship name (**NITRO OVERDRIVE** for the 400x Super Buy; antelite
rebadged **OVERBOOST**, mode id unchanged) both arrived and PR #42 ran the recipe exactly as
`FS_FeatureMath_v2_Prompt.md` specified: `gamestate.py` gained the per-mode Overdrive
pre-rev (5x for `super`, unchanged for every other mode), `game_config.py` and
`game_optimization.py` gained the three new mode blocks as pure additions (base/bonus
untouched, byte-identical lookup tables verified at three checkpoints), and `run.py` only
ever simulated the three new modes this run.

I re-ran `scripts/validate_math.py` myself today, straight from the current `main` tip
(not a cached number from the PR):

| mode | cost | RTP (recomputed) | SD | max win | wincap odds | tail (cost-scaled) |
|---|---|---|---|---|---|---|
| base (Normal) | 1.0x | 96.350000% | 17.28x | 5,000x | 1 in 100,000 | 1.0e-5 |
| cruise (Cruise) | 1.0x | 96.350000% | 11.29x | 5,000x | 1 in 250,000 | 4.0e-6 |
| antelite (OVERBOOST) | 1.25x | 96.350000% | 20.32x | 5,000x | 1 in 80,000 | 1.25e-5 |
| bonus (Buy Overdrive) | 100.0x | 96.350000% | 206.63x | 5,000x | 1 in 1,000 | 1.0e-3 |
| super (NITRO OVERDRIVE) | 400.0x | 96.350000% | 539.16x | 5,000x | 1 in 250 | 3.2e-3 (limit 1e-2) |

All five modes recompute to exactly 96.350000% (0.0000pp cross-mode spread), every stated
fact in `CLAUDE.md` cross-checks OK (cruise's SD recomputes to 11.29x today, a shade off the
11.10x figure quoted in an earlier handover - within the tool's own tolerance band, noted
here for precision since this table is a fresh run, not a carried-forward number), and the
tail gate passes with margin. The frontend's
5-mode FEATURES menu (built placeholder-first in #32) is now fully live - no more "coming
soon" cards.

---

## 3. The buy-tier billing bug (worth your attention)

While wiring telemetry into the newly-recovered compliance work (section 4), I traced the
FEATURES menu's dispatched mode all the way to the actual spin request and found it was
being **silently discarded at three separate points**: `App.svelte`'s `on:buy` handler
ignored the dispatched mode, `BuyBonus.svelte`'s confirm price was hardcoded to `bet * 100`,
and `handleBuy()` always charged 100x and set the mode to `'bonus'`. Net effect: clicking
NITRO OVERDRIVE (meant to cost 400x) actually charged 100x and served a `bonus` round. This
predates this session - it was introduced when FeatureMath v2's frontend flip (#42) added
the new tier without the mode threading catching up.

I stopped what I was doing, asked the owner how to prioritise it, and fixed it immediately
per their direction (PR #44). Fix: `fsModes.ts` gained a `MODE_COST` lookup (derived from
the existing single source of truth, not a second table), and the mode is now threaded
through `FeatureMenu -> BuyBonus -> handleBuy` end to end. Verified via Playwright, including
the *actual debit*, not just the displayed price: after confirming a NITRO OVERDRIVE buy at
a $0.10 bet, balance went from $100.00 to $60.06 (100.00 - 40.00 cost + 0.06 win) - the real
400x charge, not the old hardcoded $10.00. The locked `rgsService.ts` needed no change:
`play()` already reads the mode from the `selectedBetMode` store, not the spin request, so
the real wallet/RGS debit was fixed with zero locked-file edits.

**Why this matters for your review:** this class of bug (a UI control that looks right but
silently charges/serves the wrong thing) is exactly what a pre-submission audit should be
hunting for. Worth deciding whether a broader pass (grep every `dispatch`/handler pairing in
the buy and mode-select paths) is warranted before Stake Engine review, or whether this one
instance plus the tests now in place are sufficient assurance.

---

## 4. Recovered from an orphaned branch (`claude/compliance-rg`)

Found a local-only branch, never pushed or PR'd, sitting on the machine from earlier work.
Backed it up to `origin` immediately, then inspected it properly before touching anything:
`git diff --stat main claude/compliance-rg` showed **206 files** and turned out to be a
large, stale fork that predated a lot of since-shipped work (it also carried unrelated
motion-tuning reverts to `GameGrid.svelte` that would have regressed shipped
motion-polish/reel-feel work). So neither pass merged it wholesale - both hand-picked
specific, self-contained pieces:

**Pass A (PR #43):**
- **Responsible-gambling module** (`responsibleGambling.ts`, 12/12 tests pass): autoplay
  stop-conditions (stop-on-win, single-win-limit, stop-on-feature, loss-limit), a UKGC
  minimum-spin-interval guard (2.5s, effective May 2026), all jurisdiction-flag-driven and
  off by default.
- **SessionPanel.svelte**: TIME/SPINS/NET display + a reality-check modal.

**Pass B (PR #45):**
- **CellModifier overlay**: a mechanic-agnostic per-cell badge component (for a future
  mechanic like multiplier wilds - adds data, not a new presentation pipeline). Hand-
  integrated into `GameGrid.svelte` line-by-line rather than diff-applied, for the reason
  above. No visible change to current base play (the shipped package has no per-cell
  mechanic yet, so the overlay renders nothing today).
- **Telemetry**: a vendor-agnostic, pluggable-sink event emitter (`spin`/`buy`/`win`/
  `wincap`), no-op until a sink is registered. Win-tier thresholds corrected to match the
  shipped celebration thresholds exactly (BIG >=10x / MEGA >=30x / EPIC >=100x / MAX =
  5,000x cap) - the original recovered version had mismatched thresholds (20/200/1000),
  which would have made analytics disagree with what the player actually saw on screen.
- **PF readiness determinism test**: `roundInterpreter.determinism.test.ts`, 58/58 sample
  books reconstruct byte-identical across 5 runs each - this is the provably-fair invariant
  from `docs/PF_READINESS.md`.
- **Collection Meter prototype** (`games/future_spinner_collect`): a **not-for-release**
  sibling package (its own README says so), a stateless coin-collect bonus layered on the
  Overdrive engine. Independently re-recomputed its RTP/SD/hit-rate/wincap odds from the
  shipped lookup tables myself - matched its own documentation exactly (base 96.3499998474%,
  bonus 96.3499999943%, both capped at 5,000.00x). Flagged clearly in
  `COLLECT_PROTOTYPE_FINDINGS.md` that the event-level statelessness claim (one payout per
  book, coins sum to the payout) was **not** re-derived this pass, since the underlying
  books are gitignored and weren't recovered - that would be the next step if this is ever
  sanctioned for a real regen.

---

## 5. LUMEN parity (PR #46)

Future Spinner only had mute/unmute; LUMEN already shipped independent MUSIC/SOUND sliders
and a paytable Interface Guide. Ported LUMEN's validated design over:
- `audioSettings.ts` (musicVolume/sfxVolume, persisted, clamped 0..1) and a reworked
  `soundService.ts` (BGM = musicVol x duck factor, every SFX = its base volume x sfxVol).
- The HUD menu's Mute button gained the two sliders, styled on Future Spinner's own
  `--sig-cyan` theme token (not hardcoded, so every skin still gets consistent colours).
- A new "Interface Guide" section in the paytable (Spin / Increase Bet / Decrease Bet /
  Features / Autoplay / Menu with real theme art, Turbo/Max as styled pills) between Bet
  Modes and RTP. Did **not** touch the existing symbol-payout grid or copy - that stays
  exactly as shipped/validated.

---

## 6. Outstanding (unchanged from PR #38 unless noted)

**Still owed from your side (per the owner, in progress):** the audio files
(`~/Desktop/fs_audio/` per the audio plan in `docs/CHAT_CLOSEOUT_2026-07-06.md` section 3).
Not chasing this, just confirming it is still the one open creative blocker on your end.

**Not started (queued, unchanged):** per-symbol bespoke win animations, the logo vector
rebuild, feature/big-win choreography tying the grid reaction into the C1 tiers.

**Open strategic questions carried forward from PR #38** (still awaiting your/the owner's
view): LUMEN productionise-or-reference-build, whether Path A (amplified in-house animation)
is the right ceiling for launch versus Path B (rigged/spine symbols) post-launch, and any
Stake Engine submission-sequence risk.

---

## 7. What we would like from you

1. **The buy-tier billing bug** (section 3) - does this change how confident you are in the
   frontend/RGS wiring, and is a broader dispatch-pairing audit warranted before submission?
2. **FeatureMath v2** (section 2) - now that it is shipped and re-verified, any final
   objection before treating the five-mode package as locked-and-done?
3. **The recovered RG module and telemetry** (section 4) - sanity-check the autoplay
   stop-conditions and the UKGC 2.5s spin-interval guard against whatever compliance detail
   you are tracking that we might not be.
4. **The Collection Meter prototype** - worth pursuing to a real regen (like NITRO OVERDRIVE
   was), or does it stay a shelved reference?
5. Everything still open from PR #38 (section 6 above) - if you have not had a chance to
   weigh in yet, no rush, just keeping it visible.

The owner will collect your feedback and relay it back in a single input, same as last time.
Thank you.

---

## 8. Update — your verdicts actioned (2026-07-07, same day, PR #48)

Your verdicts arrived (relayed by the owner, saved verbatim as
`FS_FableVerdicts_2026-07-07_Prompt.md`). Item 1's sanctioned work order - the Wiring
Integrity Audit, "read-only plus tests, no locked files, no sanction needed" - is done and
merged (PR #48). Full detail in `reports/qa/wiring_integrity_audit_2026-07-07.md`.

**Delivered exactly as specified:**
- (a) Full static trace of every dispatch/handler pairing across buy, mode-select,
  bet-change and autoplay.
- (b) A permanent cost-integrity gate in `qa_soak.mjs` - drives all five modes at a fixed
  bet, asserts the correct mode and integer-micros debit.
- (c) `scan_wallet_floats.mjs` - a wallet-path float scan, locked files explicitly out of
  scope (can't remediate a finding there without a sanction).
- (d) `fsModes.drift.test.ts` - cross-checks `fsModes.ts` against the shipped
  `index.json`, 5/5 matched.
- (e) Two autoplay asserts: an explicit test for the literal `minSpinMs=0` default, and a
  static gate proving autoplay only ever starts from exactly one real, explicit click
  (correctly separated a dead-code duplicate in the retired `ControlBar.svelte` from the
  live path in `HudOverlay.svelte` rather than failing on it).

**Headline finding, surfaced by the trace itself (not part of your original ask):**
`standingMode` was a dead-end store - selecting Cruise or toggling OVERBOOST in the
FEATURES menu had zero effect on the actual spin request, since `handleSpin()` hardcoded
`mode: 'base'` unconditionally. Same bug class as the buy-tier billing fix, on the
standing-mode side. The new cost-integrity gate (item b) reproduced it exactly:
`cruise`/`overboost` failed, `normal`/`bonus`/`super` passed.

Per the audit's own scope ("flagging", not fixing) this was left unfixed and reported to
the owner as a finding requiring an explicit decision, since it's a real gameplay/cost
behaviour change (which maths curve plays; whether OVERBOOST's 1.25x should apply per
spin), not a mechanical correction. **The owner confirmed same day: wire it through,
OVERBOOST 1.25x per spin while toggled on.** Fixed and merged in the same PR:
`handleSpin()` now reads `$standingMode`, computes the real per-mode cost (integer-micros
rounded, mirroring `handleBuy`'s pattern), and threads it through to the wallet request
and RG session tracking. Re-ran the cost-integrity gate after the fix - all five modes now
pass. Verified live: OVERBOOST ON + a $1.00 spin debited exactly $1.25 (balance
$100.00 -> $98.75), and the RG SessionPanel's NET figure picked up the real cost too
(`-$1.25`). Screenshots in `reports/screens/standingmode-fix/`.

Also fixed along the way (all non-locked, no sanction needed): a stale `.spin-btn`
selector in `qa_soak.mjs` that would have timed out the whole harness (the live spin
button has carried `data-testid="spin-button"` since the B1 HUD reskin); `handleBuy`'s
`cost` was reaching the balance store as an unrounded float (a real "zero float
tolerance" violation, now routed through integer micros); `CLAUDE.md` and `betMode.ts`
both still claimed only two bet modes exist, corrected to the current five-mode reality.

**Not yet actioned from your verdicts (queued, per your own sequencing - "wiring
integrity audit now, then dossier and copy update, then hygiene pass"):**
- Item 2's standing directive: the REVIEW_EVENTS pass committing the statelessness
  artefact and per-mode replay IDs for cruise/antelite/super.
- Item 4: relocating `games/future_spinner_collect` to a reference branch
  (`claude/collect-prototype`) with a doc pointer - part of the hygiene pass, which per
  your sequencing comes after the dossier/copy update, not yet started.
- Item 5's list: the two owner eye-calls (strip vs drop reel mode; flame-jet scale/
  orientation) remain with the owner, unchanged; the hygiene pass scope; the dossier and
  paytable five-mode copy update; QA re-soak (gated on audio).

**Next up, per your sequencing:** the dossier and paytable copy update, unless you'd
rather reorder given the standingMode fix landed same-day as the audit itself. Let us know.

---

## 9. Update — dossier/copy update, REVIEW_EVENTS pass, hygiene pass (2026-07-08, PRs #50/#51/#52)

Everything from your 2026-07-07 verdicts (`FS_FableVerdicts_2026-07-07_Prompt.md` and
`FS_FableVerdicts2_2026-07-07_Prompt.md`, both saved verbatim) is now done, in your own
stated sequencing order. Two of the three PRs below are merged; the third is open, still
awaiting the owner's merge.

### 9a. Dossier and paytable five-mode copy update — PR #50, merged 2026-07-08

`SUBMISSION_DOSSIER.md` and the in-game paytable copy updated to describe all five modes
(base/cruise/antelite/bonus/super) instead of the old two-mode description, plus OVERBOOST
HUD visibility (the standingMode fix from section 8 needed a visible on-screen indicator
so a player can see OVERBOOST is active, not just feel the cost) and reel mode defaulted
to `drop` (the owner's eye-call from section 6, now actioned). No maths changes; no locked
files touched.

### 9b. REVIEW_EVENTS pass — PR #51, merged 2026-07-08

Your verdict item 2's standing directive, closed:

- **Statelessness proof extended to cruise and antelite.** Previously only `super` had
  been independently proven stateless from its actual shipped books (the manual analysis
  during FeatureMath v2); cruise/antelite had only been ported verbatim from an
  already-validated library, not re-checked this specific way. Generalised that one-off
  analysis into a committed, reusable script
  (`scripts/review_events_stateless_scan.py`): every round's Overdrive meter is set once
  at free-spin start and only ever increments afterward, so the first winning free spin's
  `meta.globalMult` in every round equals that round's starting meter - the distinct set
  of these values across 100,000 rounds collapsing to a single constant proves both
  statelessness (no drift) and correctness (constant matches `gamestate.py`'s coded
  expectation). Result: cruise `{1}` (6,100/100,000 sampled), antelite `{1}`
  (24,249/100,000), super `{5}` (99,998/100,000) - all three **STATELESS**, matching
  expectation exactly. Full report: `reports/qa/review_events_statelessness_2026-07-08.md`.
- **Books regenerated under a properly-scoped lock exception** (you named the deny lines,
  we lifted them for the session only, restored before commit, verified-empty diff) via
  `run.py`'s `run_sims` path only - never the stochastic optimiser - so the shipped
  `lookUpTable_*_0.csv` files could not drift. Confirmed byte-for-byte unchanged before and
  after, and the three regenerated `books_*.jsonl.zst` SHA-256 hashes matched the
  already-committed PAR-sheet-recorded hashes exactly. This is a pure read/analysis pass
  over already-shipped maths, not new maths.
- **Per-mode Bet Replay event IDs** added to `REPLAY_TEST_EVENTS.md` for all five modes
  (previously only base/bonus had recorded IDs).

### 9c. Hygiene pass — PR #52, open, awaiting merge

Your verdict's full expanded scope (Collection Meter relocation, dead component removal,
the five stale-selector scripts, HANDOVER supersession, prompt archive, explicit-paths
convention, QA log archive) - all seven items done:

- **Collection Meter relocated off `main`** to `claude/collect-prototype` (branch created
  from the exact pre-removal commit, verified via `git ls-tree` to carry the full
  directory before removal here) - closing the stale-second-maths-package risk you flagged
  by name. `CLAUDE.md` now carries a permanent "Reference / prototype branches" pointer.
- **`FeatureButton.svelte` and `ControlBar.svelte` deleted** - confirmed zero live imports
  (only historical comments), clean build afterward. `ControlBar.svelte`'s duplicate
  `isAutoPlay.set(true)` call site (the one your Wiring Integrity Audit trace had to
  explicitly separate from the live path rather than fail on) is now gone entirely rather
  than merely flagged.
- **Five QA/proof scripts de-rotted and re-verified live**, not just statically edited -
  each actually run to completion against a live dev server after fixing:
  `build_diet_verify.mjs`, `layout_v1_audit.mjs`, `ux_v1_audit.mjs`, `reel_v3_proof.mjs`,
  `motion_v2_proof.mjs`. All had the same underlying stale-selector rot (`.spin-btn` ->
  `[data-testid="spin-button"]`, the old FeatureButton click flow -> the current
  FeatureMenu menu-then-ACTIVATE flow) from two historical UI changes (the B1 HUD reskin
  and the FeatureButton->FeatureMenu migration) that had gone unnoticed since neither had
  been run since.
- **Two new findings surfaced by actually running the scripts, not silently absorbed:**
  - A `vite preview` startup-detection bug in `build_diet_verify.mjs` - its regex
    (`/Local:/`) never matched because (unlike `vite dev`'s banner) `vite preview`
    inserts an ANSI reset code between "Local" and ":". Fixed; also hardened to request a
    free port dynamically rather than a hardcoded one.
  - `reel_v3_proof.mjs` and `motion_v2_proof.mjs` **each show exactly one frame over the
    100ms hard gate** (149ms and 150ms respectively, out of ~2,000-2,300 samples), landing
    at almost the same magnitude in both - consistent with one shared, likely-transient
    hitch at the bonus-buy transaction moment rather than two independent regressions.
    Average fps passes comfortably in both (~59.5), so this is not a functional failure,
    but it is new information this pass surfaced that did not exist before (the scripts
    could not previously run at all) - flagged for your attention, not chased further here
    (would need profiling, out of scope for a selector-fix pass).
  - Also flagged, not fixed: `layout_v1_audit.mjs`'s recorded "expected" position values
    are stale (pre-B1-reskin); only occlusion is gated so this is not a functional
    failure, but the reference numbers would mislead a human comparing them directly.
- **HANDOVER supersession, prompt archive, QA log archive, explicit-paths convention** -
  all repo-hygiene housekeeping per your scope, each with an explanatory README where a
  human might otherwise wonder why files moved. Detail:
  `reports/archive/2026-07-08_hygiene-pass.md`.

Full verification (build, svelte-check, all four test suites, wallet-float scan,
autoplay-confirm gate, font-CDN compliance grep, `validate_math.py`, locked-file diff) run
fresh for this pass and all clean - detail in the same report.

## 10. What we would like from you

1. **The two long-frame findings** (section 9c) - worth a profiling pass now, or fine to
   let ride until audio ships and a full QA re-soak happens anyway?
2. **`layout_v1_audit.mjs`'s stale position-expectation values** (section 9c) - worth a
   dedicated refresh pass, or low enough priority to leave as a known-flagged gap?
3. **PR #52 itself** - any objection before the owner merges the hygiene pass as-is?
4. Confirming our read of your sequencing: with the dossier/copy update, REVIEW_EVENTS
   pass and hygiene pass all now done, is there anything still open from your 2026-07-07
   verdicts that we have not covered, or does this close out that round entirely?
5. Anything new since - the owner will collect your feedback and relay it back in a single
   input, same as every round so far.

The owner will collect your feedback and relay it back in a single input, same as last
time. Thank you.

