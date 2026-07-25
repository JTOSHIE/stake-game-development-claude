# Session Report - PLATFORM DELTA AND TOOL VETTING (2026-07-25)

Brief saved verbatim: `reports/archive/briefs/FS_PlatformDelta_ToolVetting_Prompt.md`.
Branch: `claude/platform-delta-tool-vetting-v1` (fresh off `main` at `a261b7e`).
`games/future_spinner/**` read-only throughout (read for computation only, never
written). `.claude/settings.json` diff verified empty at every commit.

## Summary

Five parts, all complete. The pass found more than it was sent to confirm.

The headline is that **the public `StakeEngine/docs` GitHub repository is not the
source of truth and is dangerous to treat as one.** It is four months stale and
structurally diverged from the deployed site, still advertising the old 90.0 to 98.0
RTP range with no mention of the automated bet-level risk limits. That single fact
reversed the brief's fast-track adoption of the official docs MCP server (which
indexes that repository offline), and it corrected a stale URL list that had been
sitting in `WRS_MASTER_DOCUMENT.md`.

Part 2's two-computer verification reconciled 19 of 20 figures, and root-caused the
twentieth rather than leaving it open. Part 3 found and fixed a genuine
player-visible defect: the raw platform currency code leaking to players in replay
mode. Part 4 reversed one recommendation and confirmed one licence risk.

## Delta table (rule, our status, action taken)

| Rule / finding | Our status | Action taken |
|---|---|---|
| RTP ceiling 90.0 to **96.70%** (repo still says 98.0) | **PASS**, 96.3500%, margin **0.35pp**, spread 0.0000pp | Captured to dated mirror; recorded in `COMPLIANCE_WATCH.md` and `WRS_MASTER_DOCUMENT.md` 2a; flagged as our tightest proportional figure |
| File size caps: 4.2GB per events file, **10,000,000 events per mode** (NEW since 2026-07-04) | **PASS**, 100,000 per mode | Recorded; noted as a publish-time hard failure and a constraint on any future simulation-count increase |
| 3-star Maximum Exposure **$25M to $50M** (NEW since 2026-07-04) | Loosening in our favour | Recorded so the superseded $25M figure is not read out of the old mirror |
| Maximum Payout Multiplier 100,000x (3-star) | **PASS**, 5,000x, 5.00% of limit | Independently recomputed |
| Maximum Cost Multiplier 1,500x (3-star) | **PASS**, 400x, 26.67% | Independently recomputed |
| Base SD floor 0.6 / ceiling 60.0 (3-star) | **PASS**, 17.2841, 28.81% of ceiling | Independently recomputed |
| P(>=5000x) limit 1e-2, worst case across modes, cost-scaled | **PASS**, 3.2e-3, 32.00% | Recomputed; NITRO's 0.8 relief band confirmed, Buy Overdrive at 100x confirmed to get **no** relief |
| P(>=10000x) limit 2e-2 (3-star) | **PASS**, structurally **zero** | Proven structural, not empirical: every table's max is exactly 5,000x |
| ETL(>=40x cost) limit 0.9 (3-star) / 0.8 (2-star) | **PASS**, worst 0.6654, but **83.17% of the 2-star limit** | **FLAGGED**, inside the 20% band if a rounded average lands us at 2 stars |
| ETL(P>10000x) limit 0.8 | **PASS**, zero | Structural, follows from the 5,000x cap |
| CVaR limit 800 (3-star) | **PASS on the plausible readings**, definition genuinely ambiguous | All six readings computed; **new mandatory pre-review gate** added at `SUBMISSION_DOSSIER.md` 5f |
| Maximum Exposure $50M | Not determinable from our tables | Recorded as platform-side, confirmed at ACP upload via the new 5f gate |
| Payments: 10% GGR vs 7.5% Guaranteed | Owner decision, open | Page captured; both models and the mechanics recorded on the section 1 payment row |
| Jurisdiction prohibited terms (stake.us) | **BLOCKED**, six visible violations | Found by new harness; reported not fixed, wording is Fable's ruling per JOB 9b |
| Sweepstakes currency display | **PASS** after fixes | Raw code leak fixed, SC grouping fixed, zero-decimal replay fixed |
| XEC currency | **UNVERIFIED** against three first-party sources | Not implemented as a code; Stake EU recorded as contingent |

## Part 1: docs delta

Three sources compared and found to disagree. The live site is authoritative; our
2026-07-04 mirror is superseded; the GitHub repository is stale **and** on a
different route tree entirely (`/docs/approval/math-requirements` vs the live
`/docs/approval-guidelines/math-verification`, and it still carries a
`/docs/reference/currencies` page that live no longer publishes).

Dated captures written to `docs/stake-engine-live/2026-07-25/` with a manifest and
SHA-256 per file: `math-verification.md`, `payments.md` (first ever capture), and
`DELTA_NOTES.md` carrying the reconciliation.

`COMPLIANCE_WATCH.md` gains a dated section extracting **every** automated bet-level
constraint with its published definition for both star tiers, the cost-multiplier
tail-relief bands, and the CVaR open question with its resolution path.

Mirror bodies are kept byte-faithful to upstream, including upstream's own dash
characters, because they are evidence. The no-dash convention governs our prose; this
is stated in each capture's header.

## Part 2: two-computer math verification

`scripts/qa/bet_level_compliance.py`, written for this pass without reference to
Fable's working. Exact integer ratios and 40-digit decimal arithmetic, no floating
point in the accumulation path, no sampling, all 100,000 rows per mode. Mode costs
read from the shipped `index.json` rather than hardcoded so a table-to-cost mismatch
cannot pass silently.

**19 of 20 figures reconciled.** The twentieth was root-caused, not left open.

Cruise ETL(40x cost): Fable 0.333, this computer 0.3351. Cause is **threshold
inclusivity**. Cruise carries two simulations sitting exactly on its 40.00x threshold
with combined weight 48,564,670,106, worth 0.001791 of RTP. It is the only mode where
the two conventions are distinguishable at three decimal places: base and OVERBOOST
also have threshold atoms but theirs are roughly fifty times lighter and both
conventions round identically. The published definition reads "wins **>= 40x**
Cost-Multiplier", so inclusive is correct and 0.3351 is carried forward. Not
material: OVERBOOST at 0.6654 is the binding mode either way.

The CVaR ambiguity turned out to matter more than expected. The published text says
the worst **0.1%**; Fable's figure is CVaR99, the worst **1%**; and the limit is
stated with no units and no indication of whether it applies to the normalised or
absolute value, nor whether the worst-case-across-modes rule (explicit for the tail
probabilities) also applies. The readings span from 7.74% of the limit to 625% of it.
All six are computed and on file. Resolution is procedural: new **mandatory** gate at
`SUBMISSION_DOSSIER.md` 5f, where the ACP's own Math Distribution and Summary screen
is read and screenshotted before review is requested, the platform's figures are
definitive, and any value outside a limit stops the submission.

## Part 3: XEC/SC currency readiness

**The defect.** `replayService.currencySymbol()` carried its own hardcoded ten-entry
symbol map, entirely separate from `utils/currency.ts`, keyed on `SC`. The RGS sends
`XSC`. A genuine sweepstakes session in replay mode therefore missed the map, fell
through to the code fallback, and rendered **"Bet: XSC 1.00"**, printing the raw
platform code at the player, which the jurisdiction rules prohibit.

Fixing only `XSC` would have opened the mirror-image hole: `parseReplayParams()`
defaults to the **short** form, `params.get('currency') ?? (social ? 'SC' : 'USD')`,
so both forms are genuinely live. All four now resolve through one table.

**B1 re-inspected as instructed: correct, and unchanged.** `currencyDisplay:
'narrowSymbol'` derives the symbol from the code via Intl rather than substituting a
hardcoded glyph, which is exactly what the brief requires. No `US$` literal survives
in `frontend/src` or its history. B1 was never the problem; it improved one of two
implementations and nobody noticed there was a second.

Also fixed: XSC had no thousands separators (`SC 1000.00`, now `SC 1,000.00`); XGC
used `Math.round()` and discarded cents; `ReplayMode` hardcoded `toFixed(2)` so
zero-decimal currencies rendered `¥1.00`; and `ReplayMode` printed `Currency: XSC`
verbatim, now showing the symbol with the label switching to "Token" in social mode
because "currency" is itself on the prohibited-terms table.

New harness `frontend/scripts/currency_conformance.mjs`, three layers: unit (imports
the module through Vite, exact output against an explicit locale), DOM (real app via
a new dev-only `?mockCurrency=` hook guarded by `import.meta.env.DEV`), and the
social+SC combination. **All currency assertions pass**, including "the raw code
appears nowhere in the rendered page text" for every virtual currency, and JPY as the
high-minimum zero-decimal case.

**Six social-string violations found and deliberately not fixed.** `BET`
(`.fm-betlabel`), `1x bet` twice and `1.25x bet` (`.fm-cost`), `BUY FEATURES`
(`.fm-section-label`), `BET MODES` (`.fm-info-btn`). All confirmed genuinely visible.
They escaped because the existing `social_string_conformance.mjs` checks two terms in
two components' labels and blurbs; it still passes on this same build with all six on
screen. JOB 9b reserves wording to Fable, so these are flagged. The harness reports
currency and wording as **separate verdicts** so neither masks the other.

## Part 4: tool vetting

All five cloned to `~/sandbox/stake-tools/`, reviewed before running, nothing adopted
or installed into the repository. Verdicts in
`docs/records/tooling/TOOL_VETTING_2026-07.md`.

**The fast-track was reversed.** The docs MCP server (c) was installed, built and run
as instructed, and it works, with a genuinely clean security profile (876 lines, no
network, no `child_process`, no runtime writes). But `build-index.ts` walks the
repository's own `.svx` files **offline**. It does not serve live docs. Measured
against the built index: it contains `90.0%` and `98.0`, and does **not** contain
`96.70`, `CVaR`, `Expected Tail Liability`, `Maximum Exposure`, or the file-size
restrictions. Asked for the RTP ceiling, a builder session would be told 90.0 to
98.0, concluding we have 1.65pp of headroom when we have 0.35pp. Recommended instead:
repoint `build-index.ts` at our own dated mirror, which inverts it from a staleness
hazard into an enforcement mechanism for convention (d).

(a) `stake-dev-tool`: MIT confirmed. **Recommend, self-hosted Docker only** since the
cloud and share-link surfaces would upload our frozen lookup tables to a third party.
No analytics SDKs; outbound hosts are opt-in OAuth plus a desktop GitHub Pages
publish path that must never point at our repository.

(b) `ts-client`: ISC declared, no LICENSE file. Do not adopt as a dependency
(`rgsService.ts` is locked and already exceeds it). Valuable as a cross-check and it
paid for itself immediately: a **second** first-party source saying `symbolAfter:
true`, a disagreement with the docs page on XGC decimals, and a **third** source with
no XEC.

(d) `mnemoo/tools`: **no licence anywhere**, all rights reserved confirmed.
Deliberately not run. The Event Finder concept is reproducible in-house in well under
an hour from `scripts/qa/bet_level_compliance.py`, which already parses these tables.
Recommend not pursuing terms.

(e) `claude-context-optimizer`: MIT, zero deps. Defer, no need established.

## Part 5: register updates

`WRS_MASTER_DOCUMENT.md`: new 2a (three new platform rules with pass status), 2b
(distribution targets, with stake.us BLOCKED and Stake EU contingent), 2c (roadmap
intel, explicitly marked UNVERIFIED), the payments docs link and both models on the
section 1 payment row, and a change-log entry. **The "Key doc URLs" line was
corrected**: it had been listing the stale repository route tree.

## Files touched

- New: `reports/archive/briefs/FS_PlatformDelta_ToolVetting_Prompt.md`, `docs/stake-engine-live/2026-07-25/**`
  (math-verification, payments, DELTA_NOTES, _manifest.json),
  `scripts/qa/bet_level_compliance.py`,
  `reports/qa/math_bet_level_compliance_2026-07-25.md`,
  `reports/qa/bet_level_compliance_raw_2026-07-25.json`,
  `reports/qa/currency_readiness_2026-07-25.md`,
  `reports/qa/currency_conformance_2026-07-25.json`,
  `frontend/scripts/currency_conformance.mjs`,
  `reports/screens/currency-readiness/**` (6 proofs),
  `docs/records/tooling/TOOL_VETTING_2026-07.md`.
- Modified: `COMPLIANCE_WATCH.md`, `SUBMISSION_DOSSIER.md` (new 5f gate),
  `WRS_MASTER_DOCUMENT.md`, `frontend/src/lib/utils/currency.ts`,
  `frontend/src/lib/services/replayService.ts`,
  `frontend/src/lib/components/ReplayMode.svelte`, `frontend/src/App.svelte`.

## Locked files

No locked-file exception requested or needed. `games/future_spinner/**` was **read**
for the Part 2 computation and never written. `rgsService.ts` and `gameStore.ts`
untouched. `.claude/settings.json` diff verified empty before each of the four
commits.

## Verification

- `svelte-check`: 33 errors / 36 warnings / 13 files, **identical before and after**
  this session's frontend changes. Zero in the four files touched. The baseline is
  pre-existing test-file `@types/node` gaps plus two unrelated `App.svelte` items.
- `frontend/scripts/currency_conformance.mjs`: **PASS** on all currency assertions.
- `frontend/scripts/social_string_conformance.mjs`: re-run, **ALL CHECKS PASS**
  (regression check after touching shared currency code).
- `scripts/qa/bet_level_compliance.py`: runs in 0.66s, output committed as JSON.

## FOR THE NEXT SESSION

**Model and effort:** Claude Opus 5, high reasoning effort, no `/fast` toggle.

**Approach taken:** Worked the five parts in order, committing each part separately
with explicit paths so a reviewer can read the pass as four self-contained diffs.
Every claim in Part 2 was recomputed from the shipped tables rather than carried
forward. Where the brief asserted a fact I could not verify (XEC, the roadmap intel),
I recorded it as unverified with the exact searches performed rather than repeating
it as established, on the basis that a register entry that reads as fact is worse
than no entry.

**Alternatives tried and rejected:**
- For the Part 1 docs fetch: plain HTTP fetch first, which returned only a "Loading..."
  shell because the site is a client-rendered SPA. Switched to the rendering browser
  per convention (d). Also tried the GitHub repository as the primary source, which
  is what surfaced the staleness finding; kept as a secondary source only.
- For the cruise ETL divergence: considered simply reporting both numbers and moving
  on. Rejected as insufficient, since the brief asked for reconciliation to four
  decimal places. Testing inclusive versus exclusive across all five modes located
  the exact two threshold atoms and settled it against the published wording.
- For the six social strings: considered applying the obvious substitutions
  (`BET MODES` to `PLAY MODES`, `BUY FEATURES` to `GET FEATURES`). Rejected because
  JOB 9b explicitly reserves social wording to Fable, and the choices carry different
  clarity implications that are an art-direction call.
- For the currency fix: considered handling only `XSC`, which was the reported symptom.
  Rejected after reading `parseReplayParams()` and finding the short `SC` form is a
  live default, so a narrow fix would have closed one leak and left its mirror image.
- Considered making the new harness fail on the social strings so the gate is red.
  Rejected in favour of two separate verdicts, so a wording gap awaiting a ruling
  cannot be confused with a currency regression, in either direction.

**Open threads:**
- **CVaR definition**, resolved only at ACP upload via the new 5f gate. Both quantiles
  and both normalisations are already on file, so no recomputation is needed then.
- **SC symbol placement**, leading versus trailing. Two first-party sources say
  trailing, the brief says leading. We ship leading behind a single
  `VIRTUAL_SYMBOL_TRAILING` constant. Needs a ruling before submission.
- **Six social strings**, blocking stake.us and any social distribution, awaiting a
  Fable wording ruling. Not blocking stake.com.
- **XEC unverified** against three sources. Stake EU stays contingent.
- **Docs MCP server**, recommended adopt path is to repoint its indexer at our own
  dated mirror. Needs a Fable ruling since it changes the tool's purpose.
- **stake-dev-tool**, recommended self-hosted only; needs an owner decision on whether
  our math may leave the machine before any cloud or share-link use.
- **Locale plumbing**, `formatBalance` now accepts a platform locale tag and the replay
  path passes it, but the main HUD call sites still fall back to the browser locale.
  Low risk (grouping and decimal marks only), worth closing later.
- Carried forward untouched from the previous arc: popout-viewport overflow in
  `IntroSplash.svelte`; the audio loop-seam decode gap needing a non-headless recheck;
  five older audit scripts still on the pre-shared-helper `dismissIntroIfPresent`; and
  the two named external-audit gates (`qa_soak.mjs`'s full 24-cell matrix and
  `portrait_layout_conformance.mjs`'s full run), neither of which this session ran.
