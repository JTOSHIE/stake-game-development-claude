# Review tracker

One row per distinct finding across all external reviews, plus Fable's dispositions.
Built before any fix, per the CONSOLIDATED REVIEW REMEDIATION PROGRAMME (2026-07-27).

**Rules.** Every merge updates its row in the same commit. Every future review appends
rows rather than starting a new document. Nothing is ever answered twice from scratch:
if a finding recurs in a later review, it gets a source reference added to the existing
row, not a new row.

Australian English, no em dashes or en dashes.

## Status of the source ingest

**The three review documents have not been provided to the builder session.**
`sources/review1_claude.md`, `sources/review2.md` and `sources/review3_openai.md` are
placeholders awaiting their verbatim text. See `sources/README.md`.

Consequence, stated plainly: the rows below are **complete for every disposition that
could be established independently**, and **incomplete as coverage**. Without the source
documents there is no way to know which findings are missing from this table. The
dispositions that are here are sound; the list is not yet known to be exhaustive.

Rows are provisionally numbered `TR-nnn`. Once the sources land, each row gains its
reviewers' own IDs (review 3's `F`-numbering in particular must be preserved, since
`F3`, `F5`, `F7`, `F8` and `F10` are already cited by that numbering).

## Disposition vocabulary

| Value | Meaning |
|---|---|
| CONFIRMED | Real, reproduced, needs a fix |
| REFUTED | Not true of this codebase, with the evidence recorded |
| ALREADY COVERED | Real concern, already guarded by an existing assert or gate |
| STALE SNAPSHOT | Was true when the reviewer looked, fixed on `main` before receipt |
| HALLUCINATED | The cited file, path, symbol or behaviour does not exist |

## Tracker

| ID | Finding | Source | Disposition | Severity | Branch | Status | Fix evidence |
|---|---|---|---|---|---|---|---|
| TR-001 | Build loads fonts from an external CDN (google-fonts), breaching the static-build rule | Review 2 | **REFUTED** | Blocker as filed | n/a | CLOSED | **Independently re-verified 2026-07-27, not accepted on relay.** Zero hits for `fonts.googleapis`/`fonts.gstatic` in `frontend/src`, in `frontend/index.html`, across the whole `frontend` tree excluding `node_modules`, **and in the built `frontend/dist` bundle**. Fonts load via `@fontsource/orbitron` imported in `src/main.ts` (400/700/900), which is bundled locally. The reviewer's blocker does not exist in this codebase. |
| TR-002 | Missing `sweeps_en.json` language file required for social mode | Review 2 | **REFUTED** (HALLUCINATED path) | Blocker as filed | n/a | CLOSED | **Independently re-verified 2026-07-27.** `find` for `sweeps*` across the repo excluding `node_modules` and `.git` returns **zero** matches: no such file, and no reference to one. Social strings are implemented via the `socialLabel`/`socialBlurb` overrides in `frontend/src/lib/config/fsModes.ts` plus the `isSocial` store, not via a `sweeps_<lang>` file. The platform docs *recommend* that pattern; we did not adopt it. The reviewer asserted a missing file for an approach we never took. |
| TR-003 | NITRO/super wincap frequency disagrees with our stated figure | Review 2 | **REFUTED**, pending the reviewer's arithmetic | High as filed | n/a | OPEN pending reviewer | **Independently recomputed 2026-07-25 and re-checked 2026-07-27.** `super` P(>=5000x) = `4.000000e-03`, which is **exactly 1 in 250.0**, from `reports/qa/bet_level_compliance_raw_2026-07-25.json`, itself produced by `scripts/qa/bet_level_compliance.py` reading the frozen publish tables with exact integer ratios and no sampling. This is the third independent agreement (Fable, the Part 2 recomputation, and this re-check). Row stays OPEN only because the reviewer's own working has not been seen; if they used the raw cap probability without the documented 0.8 cost scale, or divided by a different denominator, that would explain the gap. Not a code change either way. |
| TR-004 | Review 3 finding F3 | Review 3 (OpenAI) | **STALE SNAPSHOT** | unknown | n/a | BLOCKED on source | Fable's disposition relayed in the programme brief: fixed on `main` before the review was received. **The finding text and the specific PR citation cannot be recorded until `sources/review3_openai.md` is ingested.** Row exists so the disposition is not lost. |
| TR-005 | Review 3 finding F5 | Review 3 (OpenAI) | **STALE SNAPSHOT** | unknown | n/a | BLOCKED on source | As TR-004. |
| TR-006 | Review 3 finding F7 | Review 3 (OpenAI) | **STALE SNAPSHOT** | unknown | n/a | BLOCKED on source | As TR-004. |
| TR-007 | Review 3 finding F8 | Review 3 (OpenAI) | **STALE SNAPSHOT** | unknown | n/a | BLOCKED on source | As TR-004. |
| TR-008 | Review 3 finding F10 | Review 3 (OpenAI) | **STALE SNAPSHOT** | unknown | n/a | BLOCKED on source | As TR-004. |
| TR-009 | Live path parses legacy `board`/`win`/`scatter` in locked `rgsService.ts` while the canonical `roundInterpreter` and shipped books use `reveal`/`winInfo` | Consensus (per programme brief) | CONFIRMED | Critical | `fix/R1-event-contract`, `fix/R1a-rgs-locked-pass` | OPEN (wave 3) | Not started. Diagnosis first: adapter if raw events are exposed, sanctioned locked pass only if not. |
| TR-010 | Production builds can reach `_mockSpin`; auth failure falls through to mock instead of hard-disabling betting | Consensus | CONFIRMED | Critical | `fix/R2-mock-containment` | OPEN (wave 3) | Not started. Acceptance: mock symbol absent from a production bundle. |
| TR-011 | Books/lookup equality unproven; dossier does not distinguish repo-committed artefacts from the local upload set | Consensus | CONFIRMED | High | `fix/R3-books-equality` | OPEN (wave 3) | Not started. |
| TR-012 | Social/currency incomplete: XEC absent from the SC family; social mode not derived from currency code; accessibility strings carry real-money terms | Consensus | CONFIRMED | High | `fix/R4-social-currency` | OPEN (wave 2) | Partially pre-covered: the SC/GC family, both code forms and the visible-text prohibited-term sweep landed 2026-07-25/26 (`reports/qa/currency_readiness_2026-07-25.md`). Outstanding: XEC, currency-derived social mode, **accessibility attributes** (aria-labels are not covered by the current DOM sweep). |
| TR-013 | Bet-changing surfaces do not all drive from the authenticated bet-level model | Consensus | CONFIRMED | High | `fix/R5-bet-levels` | OPEN (wave 2) | Not started. |
| TR-014 | Launch `lang` parameter not applied to the locale store before first render | Consensus | CONFIRMED | High | `fix/R6-locale` | OPEN (wave 1) | Not started. |
| TR-015 | RG jurisdiction flags not enforced: autoplay cap, `turboDisabled`, `minSpinMs` | Consensus | CONFIRMED | High | `fix/R7-rg-enforcement` | OPEN (wave 2) | Not started. |
| TR-016 | Modal safety and buy affordability: spacebar/autoplay ignore blocking modals; affordability computed from the wrong tier cost | Consensus + owner observation 2026-07-26 | CONFIRMED | High | `fix/R8-modal-affordability` | OPEN (wave 2) | Owner independently reported the symptom: NITRO "not always selectable" and mis-clicks. Root cause already recorded in `CLAUDE.md` `LOCKED_FILE_DEBTS`: `canBuyBonus` in locked `gameStore.ts` hardcodes `bet x 100`, wrong at the 400x tier. |
| TR-017 | Scatter rules under-disclosed: scatter3/4/5 strings do not state free spins AND instant pay; no 6-plus scatter rule | Consensus | CONFIRMED | High | `fix/R9-scatter-disclosure` | OPEN (wave 1) | Also folds in the i18n dash sweep (84 instances) and a dash-free conformance assert on player strings. |
| TR-018 | 11 outstanding `svelte-check` errors; CI ratchets to a non-zero baseline | Review(s) + internal | CONFIRMED | Medium | `fix/R10-type-zero` | IN PROGRESS (wave 1) | All 11 already enumerated and classified in `reports/FABLE_COMMS.md` entry 004. **Note:** this reverses the 2026-07-26b ruling that the baseline stays at 11; the programme brief supersedes it. |
| TR-019 | No session recovery: active round not hydrated from `authenticate.round`; no idempotent `endRound` retry | Consensus | CONFIRMED | High | `fix/R11-session-recovery` | OPEN (wave 3) | Not started. |
| TR-020 | Evidence hygiene: stale failing `audio_verify` JSON committed; Vite starter residue; favicon not the hero icon | Consensus | CONFIRMED | Medium | `fix/R12-evidence-hygiene` | OPEN (wave 1) | Also carries the owner's splash-every-cold-load ruling (sessionStorage) and the buy-dialog disclosure retention at 390x664. |
| TR-021 | Mini-player popout proofs stale; `IntroSplash` Continue button can render outside the viewport at 400x225 | Review(s) + internal (Round 3) | CONFIRMED | High | `fix/R14-popout-refresh` | OPEN (wave 1) | Long-standing internal finding, carried in the handover as unfixed. Regenerate proofs on the current build, fix any real collision, add the assert permanently. |
| TR-022 | Splash shows only once per browser profile, so a returning player never sees the brand screen | Owner observation 2026-07-26 | CONFIRMED | Low | `fix/R12-evidence-hygiene` | OPEN (wave 1) | Diagnosed 2026-07-26: `introSeen()` in `App.svelte` reads **localStorage first**, so the flag persists across sessions. That is why incognito shows it and a normal desktop profile does not. Owner ruled: splash on every cold load, implemented via `sessionStorage` only. |

## Parked rows

None yet. Per the operating rules, any finding without a clean answer gets two or three
options with trade-offs written into its row and is marked PARKED rather than stalling
the wave.

## Wave plan

| Wave | Branches | Theme |
|---|---|---|
| 1 | `fix/R10-type-zero`, `fix/R12-evidence-hygiene`, `fix/R9-scatter-disclosure`, `fix/R14-popout-refresh`, `fix/R6-locale` | Quick wins, low-hanging fruit first per the owner |
| 2 | `fix/R4-social-currency`, `fix/R5-bet-levels`, `fix/R7-rg-enforcement`, `fix/R8-modal-affordability` | Enforcement cluster |
| 3 | `fix/R1a-rgs-locked-pass`, `fix/R1-event-contract`, `fix/R2-mock-containment`, `fix/R3-books-equality`, `fix/R11-session-recovery` | Integration core |
| then | `feature/scatter-anticipation` | Motion quality, under the visible-state-only integrity ruling |
