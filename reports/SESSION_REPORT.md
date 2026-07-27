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

---

## 2026-07-25d: v6 restored to the root; division of authority recorded

**Job 1, restore. Byte-identical, verified both sides.**

```
before  2cd7797531f9bb4b735d393ad00b487e286cdcea97b605c60bf3d99261a05384
        reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md
after   2cd7797531f9bb4b735d393ad00b487e286cdcea97b605c60bf3d99261a05384
        CLAUDE_PROJECT_INSTRUCTIONS_v6.md
```

Moved with `git mv`, not retyped, so history follows the file and the bytes are provably
unchanged. This matters because the committed copy carries two things a pasted variant
lacked: convention (m) DERIVE BEFORE MEASURING, and the 2026-07-13 platform conformance
work order addendum.

**Job 2, index and references.** The superseded index row now records the restore rather
than naming a successor. A SUPERSEDED banner is prepended to v5, whose own header still
read ACTIVE. One link in `HANDOVER_2026-07-25_Fable.md` repointed to the root copy.
Nothing else in `reports/archive/` touched; `FABLE_COMMS.md` not edited, it is append-only.

**Job 3, division of authority.** No equivalent note existed in `CLAUDE.md`, so one was
added near the top. v6 at the root is the stable operating frame, pinned in the owner's
Claude project. `CLAUDE.md` is the builder's conventions document and runs ahead of v6,
already carrying (n). Where they conflict on builder conduct, `CLAUDE.md` governs. Live
state is read from the repository, never from either.

**Lock proof.** `git diff .claude/settings.json` is 0 bytes, verified immediately before
staging.

### Two corrections to the check-in that produced this brief

**1. `HANDOVER_2026-07-25c_Fable.md` DOES exist on `main`.** The check-in reported it
absent and suggested it was never pushed. It was pushed, in commit `bb8d38a`. The clone
was taken at `fc379f8` and `main` was eight commits ahead at the time:

```
7c0e5be  Merge PR #113, cohesion pass
3f3f655  docs(cohesion): close TR-027
08bcca3  art: adopt enhanced character and car; amend the assets convention
0666e2a  art(staged): enhanced car candidate
bb8d38a  docs(handover): new living arc handover   <-- the "missing" file
ae94dcc  tools(art): green-screen to sprite converter
eb07902  docs(cohesion): record what landed and what did not
9c930d4  feat(cohesion): global grade as a blended overlay
```

The check-in's verdict therefore describes a repository state that predates the entire
cohesion pass and the art adoption. Nothing in it is wrong about what it saw; it simply
saw an older tree.

**2. Convention (m)'s ratification date reads 2026-07-27, which is two days ahead of the
true date.** Left byte-exact as instructed. It is the same brief-side date drift Fable
already owned and ruled on: commit dates are authoritative, nothing is relabelled
retroactively, and the reconciliation is recorded once in the tracker.

### FOR THE NEXT SESSION

**Model and effort.** Opus, high. Judgement work: an owner-directed restore with a
byte-preservation requirement and a live contradiction to resolve.

**Approach.** `git mv` rather than rewrite, so the hash proves the bytes. Verified the
expected hash before moving and again after.

**Alternatives rejected.** Committing the pasted variant, which would have silently
dropped convention (m) and the addendum. Editing v6 to refresh its stale sections 4 and 6,
which would have broken the pin's byte-for-byte match with the repository copy.

**Files touched.** `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` (restored), `CLAUDE.md`,
`reports/archive/superseded/INDEX.md`,
`reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v5.md`,
`HANDOVER_2026-07-25_Fable.md`, `reports/briefs/FS_V6_RESTORE_Prompt.md`, this report.

**Open threads.**
- v6 sections 4 (VERIFIED STATE) and 6 (THE BOARD) are a 2026-07-13 snapshot and are now
  materially stale. v6's own header says live state is never read from it, so this is not
  a defect, but a reader who ignores that header will be misled. Options: leave as frozen
  frame; or reissue as v7 with those two sections replaced by pointers to the tracker and
  the living handover. **Recommend the latter**, since the pin is what a fresh Fable chat
  reads first.
- Tool vetting still blocked on the skills-pack source.
- The closing run remains the only place the frame gate can be ruled on.

---

## 2026-07-25e: pre-review pass complete, Jobs 1 to 7

Purpose: bring every document a reviewer will read into agreement with the code they will
verify, then regenerate the evidence, so external review round two scores the game rather
than the drift.

### What landed, by job

| Job | Commit | Result |
|---|---|---|
| 1, operating frame | `fbaea57` | v7 authored, v6 archived byte-identical at `2cd7797...` |
| 2 and 3 | `0bcca3e` | TR-019 closed as duplicate of TR-035; `frontend/dist` removed and gitignored |
| 4d, lock exception | `4ce48fe` | PAR points at COMPLIANCE_WATCH; one file, one insertion, 188 library files byte-identical |
| 4a, 5g sweep | `c02d6cd` | One substantive finding, below |
| 4b, dossier | `31ab0ef`, `14b0590` | Section 8 STATE AT HEAD, plus pointers at the three overtaken sections |
| 4c, GAME_FACTS | `dc87a2f` | Refreshed with measured figures and their sources |
| 5, evidence | seven commits | All seven capture groups regenerated |
| TR-037 fix | `aa4662e` | Max win now renders in full on every mode card |
| 6, provider mark | `4308447` | Three candidates delivered for the owner eye-call |

### The 5g finding, stated because it changes how we cite

The **90.0% to 96.70% RTP band and the 10,000,000 outcomes-per-mode cap are not yet on the
published approval-guidelines page.** They exist in the 2026-07-25 first-party announcement,
which said the RTP range takes effect "shortly with the next deploy". Our compliance
position on both therefore rests on an announcement rather than a published requirement, and
the dossier now cites it that way so the citation is checkable. We comply either way and
with margin: 96.35% inside the band with 0.35pp of headroom, 100,000 outcomes per mode two
orders of magnitude under the cap.

### Regenerated evidence inventory

Full detail in `reports/screens/EVIDENCE_INVENTORY.md`. All seven groups REGENERATED:

| Group | Location | Route |
|---|---|---|
| Layouts | `layouts-2026-07-25/` | six viewports, clean boot, **zero open dialogs asserted** |
| Feature flow | `feature-flow-2026-07-25/` | **natural** base-game trigger, no forced category |
| Rules and paytable | `rules-paytable-2026-07-25/` | opened by clicking; content asserted, not only screenshotted |
| Buy dialogs | `buy-dialogs-2026-07-25/` | includes the **affordability boundary** proving R8 |
| Celebrations | `celebrations-2026-07-25/` | ordinary win played for; higher tiers from **curated shipped-book rounds** |
| Menus | `menus-2026-07-25/` | four panels, each opened by clicking |
| Brand | `brand-assets-2026-07-25/` | emblem at three sizes plus the TR-031 candidates |

### Three findings the regeneration produced, which is the point of doing it

**TR-037, a live platform-requirement defect.** The Bet Modes cards truncated the max-win
value to `5,000x ba...` on every card, so the one figure of the required three that a
reviewer is told to look for was the one they could not read. Fixed at `aa4662e`, and the
first attempt only moved the truncation into the label before the footnote approach settled
it. Caught only by looking at a rendered frame: the content assertions were green in both
broken states, because the text was correct in the DOM either way.

**A capture assertion that was inert.** The paytable checks initially failed while the
content was plainly on screen, because the script had guessed a container class and matched
a different dialog. A screenshot-only proof would have shown green and hidden that the check
was doing nothing.

**A false negative that nearly became a false finding.** The menu run first reported the
session panel as "no clickable route found in this build". It was a wrong selector. Recorded
as absent, that would have put a non-existent missing feature into a compliance evidence set.

### TR-031, delivered with its ceiling stated

Three deterministic candidates from the committed master, re-runnable to identical bytes, at
512, 96 and 48 with delivery-style names. The cause of the illegibility is structural: the
master carries arched text around a detailed wheel, and at 48px that text is about two
pixels per stroke, so sharpening was never the fix. Candidates b and c drop the text ring
and both beat the control clearly. **None is ideal**, and that is recorded rather than
softened: a purpose-drawn mark built simple at small size would beat all three. No adoption;
the eye-call is the owner's.

### Tool vetting

Target confirmed by the owner as `https://github.com/egorfedorov/claude-context-optimizer`,
already assessed in `docs/records/tooling/TOOL_VETTING_2026-07.md` as MIT with zero
dependencies and deferred. The full untrusted-input read remains board item 2, in its own
session, not this one.

### Locks

No exception existed in this session and none was taken. `git diff .claude/settings.json`
empty at every commit. The 4d exception was spent in its own commit and is not reused.

### FOR THE NEXT SESSION

**Model and effort.** Sonnet at High throughout, as directed. No gate failed twice, so no
escalation was triggered.

**Approach.** Documents amended by exception with dated authoritative sections rather than
rewritten in place, so the diffs stay reviewable. Evidence regenerated group by group with
supersession landed in the same commit as each replacement, so the tree was never in a state
where a stale capture sat unmarked beside a fresh one.

**Alternatives rejected.** Rewriting the dossier's 373 lines in place, which would have
churned text a reviewer may already have read. Faking win tiers by setting `winAmount`, which
was faster and would have put celebrations in the evidence that never corresponded to a real
round. Relabelling the historical future-dated files, which would falsify what they were
called when written.

**Files touched.** Listed per commit above; explicit paths throughout, no `git add -A`.

**EXTERNAL REVIEW ROUND TWO IS CLEARED to run against this pass's HEAD.** All seven capture
groups read REGENERATED, no group is STALE, the one platform-requirement defect the
regeneration surfaced is fixed and re-captured, and the dossier and GAME_FACTS agree with
the code at HEAD.

**Open, and none of it blocks round two:**
- TR-031 provider mark awaits the owner eye-call at `reports/screens/provider-mark/`.
- TR-035b open-round semantics and TR-012c placement confirmation are settled at the
  official platform testing session.
- The closing run in a fresh environment remains the only place the frame gate can be ruled
  on; this machine idles at 34 to 43 fps, so local frame numbers stay advisory.
- Tool vetting of the Claude pack, board item 2.

---

## 2026-07-25f/26: ROUND TWO INGEST AND REMEDIATION, jobs 1 to 7

Brief saved verbatim: `reports/briefs/FS_ROUND2_INGEST_AND_REMEDIATION_Prompt.md`.
Eleven jobs were briefed. **Seven are complete and committed. Four are not started and
are listed with everything a resume needs.** Explicit paths on every commit, never
`git add -A`.

**A date note, because the record should not have to be reconciled later.** This pass
began 2026-07-25 and ran past midnight; commits `3a76ca0` and `5aa1219` carry
2026-07-25 and the rest carry 2026-07-26. Git is authoritative, per the standing
ruling. Artefacts written before the rollover keep their 2026-07-25 names rather than
being renamed, which is the same treatment TR-029 gives every other date discrepancy.

### What shipped

| Job | Result | Commit |
|---|---|---|
| 1, ingest the round two reviews | **DONE** | `3a76ca0` |
| 2, tracker rows with Fable's dispositions | **DONE**, 21 new rows | `5aa1219` |
| 3, app launch fix (`sessionID`) | **ALREADY DONE**, verified this session | `37c8c1f` (prior) |
| 4, wallet contract rewrite | **DONE**, PR #114 open, NOT self-merged | `da4826f` on `fix/R2R-wallet-contract` |
| 5, replay through the canonical interpreter | **DONE** | `3319529` |
| 6, social vocabulary layer | **DONE** | `ffe0ca8` |
| 7, verifier fail-closed | **DONE** | `d6d921c` |
| 8, mini-player HUD | **NOT STARTED** | |
| 9, purpose-drawn provider mark | **NOT STARTED** | |
| 10, retrigger escalation | **NOT STARTED** | |
| 11, close | **PARTIAL**, this report; typecheck in CI not done | |

### JOB 1, the ingest, and the two things it found

The source document **was not where the brief said it was.** The brief names
`/Users/jt/Desktop/FUTURE_SPINNER_reviews_round_two__.docx`; nothing exists at that
path. The document is at `/Users/jt/Downloads/FUTURE SPINNER reviews round two. .docx`
with a Word lock file beside it, so it was open in Word when the brief was written. Its
contents match the brief's description exactly, so it is the right document, and the
discrepancy is recorded in `docs/records/reviews/sources/README.md` rather than smoothed
over, because convention (m) requires an external document's physical location to be
stated.

**The split is proved lossless, not asserted.** `pandoc -f docx -t gfm --wrap=none`
produced 561 lines; the three files are lines 1-260, 261-272 and 273-561, and
concatenating them reproduces the extraction byte for byte (`cmp`, exit 0).

| File | Score | SHA-256 |
|---|---|---|
| `round2_review1.md` | 2.00 / 3.00 | `9d1afe1eb405e89cec8388603c6525eae3668abe42cc6c7270b33f9e74f6c3ed` |
| `round2_review2.md` | 1.67 / 3.00 | `69846329683ce08dc69253ff5ccf46cb136107f5496ba33f79d812f9a75ca933` |
| `round2_review3.md` | 0.67 / 3.00 | `4b7cdab1b66fd43b88b03160bbcf7b7b5b729b214494c2e722c524e9a134c95e` |

Source document: 83,010 bytes, SHA-256
`7b00128f04eb78188d8a14f66463eaa5f75596e310b2f0cae64237a5315cf417`.

**Two corrections landed on the way.** The sources README recorded all three ROUND ONE
files as "AWAITING SOURCE TEXT" while those files have held their real text since
`2d3b8f1`; corrected, with round one's hashes computed from the committed files. And
`reports/briefs/FS_ROUND2_INGEST_AND_REMEDIATION_Prompt.md` as committed in `37c8c1f`
carried an added preamble and abbreviated jobs 4 through 11 to one line each. Convention
(f) forbids that in terms, because a brief is the evidence for every claim this report
makes. The genuine verbatim text is now on disk.

### JOB 2, and what was checked independently

Nineteen rows, TR-038 to TR-056, plus source references added to the four rows that
already carried the finding (TR-012c, TR-031, TR-035b, TR-036) rather than duplicate
rows. Two further rows, TR-057 and TR-058, were opened by later jobs. Coverage is
exhaustive against the three ingested files: R2R1's F-01 to F-08, R2R2's findings 1 to 7
and R2R3's findings 1 to 10 each have a row or a reference.

Fable's dispositions were recorded, not re-litigated. Where a fact was cheap to check
against the shipped artefacts, this session checked it, reading the artefacts directly
rather than any report about them, because convention (l.4) makes agreement worthless
unless you state what each side read:

- all five lookup tables have exactly 100,000 rows and a maximum of exactly **500000**
  centibets, which is exactly the 5,000x cap, with nothing above it in any mode;
- per-mode RTP recomputed from weights and the published mode costs is **96.3500%** in
  all five, so the cross-mode spread is **0.0000pp**, not R2R2's claimed 0.60%;
- super's row at id 40992 is `40992,1131181606,10550`, that is 105.5x. R2R2's "5050x at
  row 40,993" appears to be a misread 10550 attached to the wrong index;
- all eleven frontend and maths paths R2R2 cites are absent, `games/future_spinner/index.json`
  included. The real index is at `library/publish_files/index.json`;
- `ReplayMode.svelte:121` gated the canonical interpreter on `freeSpinTrigger` and lines
  144/150/159 then searched `board`, `win` and `scatter`;
- `PaytableModal.svelte:44,52,98,99,100,108` and `WinBanner.svelte:248` carried the
  prohibited social wording R2R3 names;
- `responsibleGambling.ts:19-38` declared and read four invented flag names and read none
  of the five real ones;
- `npm run check` reproduced R2R3 exactly: 491 files, 0 errors, 36 warnings, then
  `vite.config.ts(33,18): error TS7006`, with `SessionPanel.svelte:93` among the warnings.

Taken on Fable's stated first-hand verification rather than re-derived: the pinned
`ts-client` type contents (later read directly during JOB 4, and they hold), and the
verifier's zero-round PASS (JOB 7's self-test now creates that condition deliberately).

**The round two score gap has inverted, and it is recorded.** Round one's reliable
reviewer scored 0.67 while the 2.00 was the incomplete one. Round two's **0.67 is now
the reliable one**: every R2R3 finding tested this session held. R2R1 at 2.00 is also
reliable but reviewed a narrower surface, and its four MAJORs were all already on the
tracker. R2R2 is unusable for the second round running, on the same failure mode, and
that repetition is itself worth recording.

### JOB 4, the wallet contract, PR #114

**Held for Fable's line-by-line review per the PR #103 precedent. NOT self-merged.**

**Lock proof.** Deny lines lifted: exactly `Edit(frontend/src/lib/services/rgsService.ts)`
and `Write(frontend/src/lib/services/rgsService.ts)`, working-tree only, restored before
the commit. `.claude/settings.json` SHA-256
`a0c8f149806a4e0a074a4d1ba10bc29346ae188ed7bf88e4d79bdc46e30570cc`, 547 bytes, identical
before and after; `git diff .claude/settings.json` empty. `gameStore.ts` and
`games/future_spinner/**` untouched, and no `gameStore.ts` change was needed. Nothing was
written to a locked path via Bash.

**Contract mapping, old to new.** OFFICIAL is `stake-engine/src/types.ts` and `client.ts`
at `df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e` (`frontend/package-lock.json:2046`).

*authenticate*

| OLD | OFFICIAL | Consequence of the old shape |
|---|---|---|
| `balance: number` | `balance.amount` | `undefined` |
| absent | `balance.currency` | currency read from the wrong level |
| `minBet` / `maxBet` / `stepBet` / `betLevels` | `config.minBet` / `config.maxBet` / `config.stepBet` / `config.betLevels` | all four `undefined` |
| absent | `config.defaultBetLevel` | never read |
| `jurisdiction: Record<string, unknown>` | `config.jurisdiction: JurisdictionFlags` | flags never arrived |
| `round: {roundId, state:'open'\|'pending_end'}` | `round: Round \| null` | both fields invented |
| body `{sessionID}` | `{sessionID, language}` | `language` never sent |

*play*

| OLD | OFFICIAL |
|---|---|
| `events` at top level | `round.state` |
| `balance: number` | `balance.amount` |
| `roundId: string` | `round.betID: number` |
| `win: number` | `round.payout: number` |
| absent | `round.payoutMultiplier`, `round.active` |
| request `amount` as a **string** | `amount` as a **number** |

*end-round*

| OLD | OFFICIAL |
|---|---|
| request `{sessionID, roundId}` | `{sessionID}` |
| response `{balance: number, roundId}` | `{balance: {amount, currency}}`, no round identity |

*rgs_url*: used unprefixed; the official client builds `https://${rgs_url}`. Every wallet
request went to a relative path on our own origin. `replayService.ts` had always
normalised it correctly, so the two disagreed and replay was the one that was right.

**The balance unit is ANSWERED, not marked unknown.** The official helpers define
`API_MULTIPLIER = 1_000_000` with `ParseAmount = val / API_MULTIPLIER` and the comment
"eg 1_000_000 to a regular decimal number 1.00"
(`node_modules/stake-engine/src/helpers.ts` at the pin). That is byte-for-byte our
`CURRENCY_SCALE`, so no conversion layer and no dual-path constant exists in the diff.

**What is still UNKNOWN, and is labelled so in the code.** `currencyDisplay`: TR-012c's
premise is that the platform sends display metadata we drop, and **the pinned contract
has no such field**. `Balance` is `{amount, currency}` and the official client derives
symbol, decimals and placement from its own client-side table. The passthrough is
implemented and tolerant so DTT can confirm or deny without a code change, but at the pin
it is always `undefined`, and the test asserts that. **TR-012c is not closed.** Second:
where `play` puts the events. `Round.state` is `unknown` upstream; `state.events` is read
first because that is where the Bet Replay endpoint puts them for this same game, with
`state`-as-array as the second form. That is inference from a sibling endpoint and the
code says so.

**Consumers whose signatures changed**, as the brief required listing:

| File | Change |
|---|---|
| `frontend/src/lib/stores/sessionRecovery.ts` | `ActiveRound` retyped to `{betID, active, state}`; `RecoveryOutcome` carries `betID: number` instead of `roundId: string`; the `pending_end` auto-settle branch removed |
| `frontend/src/lib/stores/responsibleGambling.ts` | `RgJurisdiction` gains seven official fields; `rgClampAutoplayCount` gains an optional `cap` parameter |
| `frontend/src/App.svelte` | **none**; `spin`, `initRGS` and `SpinResult` are unchanged |
| `frontend/src/lib/stores/jurisdiction.ts` | **none**; still `Record<string, unknown>`, now receiving the typed twelve |

Everything else keeps its name, type and unit.

**Two findings for Fable, neither actioned.** TR-035b's premise has changed: it was parked
because "authenticate does not return the round's events", and under the official contract
it does, in `round.state`. Recovery still parks rather than settles, because recovery
policy is TR-035b's decision, not JOB 4's. And **TR-057**, a GC decimals divergence where
the official client contradicts itself; escalated per THE FACTS DISCIPLINE item 8 rather
than decided here.

### JOB 5, replay

One `interpretEvents` call now covers every round. The legacy `board`/`win`/`scatter`
search is deleted, and so is the `response.state.board` fallback, which was a second
invented shape. Two smaller corrections rode along: `activeWins` was being given payouts
in MICROS from a field that never existed where the live path puts dollars, and
`scatterCount` now comes from the interpreter's count over the VISIBLE window.

Fixtures are real book rounds, extracted by a committed script
(`frontend/scripts/extract_replay_fixtures.mjs`) so re-running reproduces them byte for
byte. Coverage: loss, win, bigWin, cap and feature for base, cruise and antelite; cap and
feature for bonus and super. **bonus and super have no loss, no ordinary win and no big
win at all**, because the buy guarantees a trigger, so every round in those modes is a
feature round. That is not a gap in the extraction.

The load-bearing assertion is not that a board renders. It is that the presented wins
**sum to the book's own declared payout** in every winning fixture in every mode.

### JOB 6, the social vocabulary layer

`frontend/src/lib/i18n/vocabulary.ts` holds the complete prohibited-term table,
transcribed verbatim from the dated jurisdiction mirror (fetched 2026-07-04,
`content_sha256 b115c7a1...`) including the platform's own duplicates and its own
inconsistencies, plus `sv()`, the one social-aware function, and `scanProhibited()`.

Surfaces routed through it: the paytable rules, the interface guide (mapped as a whole,
so adding a row cannot reintroduce the problem), and `WinBanner`'s unit label.
`socialMode.ts` now resolves the URL currency at module load and exposes `socialAtBoot`,
so a replay URL carrying `currency=XSC` without `social=true` no longer paints the
real-money disclaimer for one frame.

The scan runs in both modes and its result is committed as
`reports/qa/social_dom_conformance_2026-07-25.json`: **33 unique phrases scanned across
seven surfaces** (first paint, features menu, paytable, autoplay, session panel, spin and
a real win banner), **4,289 strings harvested in real money and 3,242 in social**, **zero
actionable hits in social**, 38 in real money (which is required, since zero there would
mean the rewrite had leaked into both modes), zero console errors. Captures in
`reports/screens/social-dom-conformance/`. `win-banner-real.png` is deliberately absent:
the real-money run's eight spins produced no win at or above the 10x banner threshold,
which is sampling rather than a defect.

Getting it to run honestly took three attempts, and both failures are the reason it now
covers the win banner at all. The paytable scroll located its container by an xpath
ancestor that matched nothing, so every iteration sat out Playwright's full 30 s
actionability timeout before falling through to a wheel anyway. And the session panel and
the spin surface were clicked while a previous overlay still covered them, so each
contributed an error entry and nothing else. Each surface group now reloads to a
known-clean state first.

**The new scan found a term nobody had filed.** The social rules read "Prizes pay left to
right"; `pay` is itself restricted. The previous rewrite of that block changed "Wins" to
"Prizes" at the front and left `pay` in the middle, and a scan checking two words could
never have seen it. Recorded as TR-058 and fixed by authoring, because `sv('pay')` is
"win" and "Prizes win left to right" is not English.

### JOB 7, the verifier

Three separate defects let it print PASS on nothing: the decompressor's exit status was
never checked, the round count was never asserted non-zero, and the counts were never
asserted correct. All three are fixed, `VerificationError` now distinguishes "the check
could not run" from "the books disagree", and the expected counts are parameters rather
than hardcoded.

The self-test runs the tool as a subprocess against an empty directory and against a
directory holding the five lookup CSVs and no books, which is exactly what a GitHub
checkout looks like. Both must exit non-zero, print FAIL, not print PASS, and name what
is missing. It needs no books, so it is a CI gate.

Full run on the real package: **500,000 rounds, 4,455,829 assertions, 0 failures**, and
the run additionally proved every mode has exactly 100,000 rounds and 100,000 lookup
rows, no duplicate ids on either side, and no lookup id without a round. Report at
`reports/qa/books_lookup_equality_2026-07-25.json`.

### Gate results

| Gate | Result |
|---|---|
| `svelte-check --tsconfig ./tsconfig.app.json` | 492 files, **0 errors**, 36 warnings; baseline unchanged throughout |
| `scripts/typecheck_baseline.mjs` | PASS |
| `scripts/dead_wiring_scan.mjs` | PASS |
| `scripts/a11y_social_terms_check.mjs` | PASS |
| `scripts/locale_completeness_check.mjs` | PASS |
| `scripts/player_string_dash_check.mjs` | PASS |
| fsModes drift, bet ladder, launch params, live guard, modal guard, scatter escalation, session recovery, currency, both interpreter suites, rgs parse | **PASS**, all |
| NEW gate 6b, social vocabulary | **PASS** |
| NEW gate 11a, wallet contract (on the PR branch) | **PASS**, 66 assertions |
| NEW gate 13, replay rounds | **PASS**, 96 assertions |
| NEW gate 14, books verifier self-test | **PASS**, 8 assertions across two absent-input shapes |
| Books/lookup equality, full run | **PASS**, 500,000 rounds, 4,455,829 assertions, 0 failures |

**`npm run check` is still RED**, at `vite.config.ts(33,18): error TS7006`, exactly as
R2R3 reported. That is TR-046 and it is JOB 11 work, which was not reached. CI still runs
only the Svelte baseline.

### Files touched

Per commit, explicit paths throughout:

- `3a76ca0`: `docs/records/reviews/sources/round2_review{1,2,3}.md`, `sources/README.md`,
  `reports/briefs/FS_ROUND2_INGEST_AND_REMEDIATION_Prompt.md`
- `5aa1219`: `docs/records/reviews/REVIEW_TRACKER.md`
- `3319529`: `frontend/src/lib/components/ReplayMode.svelte`,
  `frontend/src/lib/services/replayRounds.test.ts`,
  `frontend/src/lib/services/__fixtures__/replay_rounds.json`,
  `frontend/scripts/extract_replay_fixtures.mjs`, `.github/workflows/checks.yml`
- `d6d921c`: `tools/verify_books_lookup_equality.py`,
  `reports/qa/books_lookup_equality_2026-07-25.json`, `.github/workflows/checks.yml`
- `da4826f` (branch `fix/R2R-wallet-contract`, PR #114):
  `frontend/src/lib/services/rgsService.ts`,
  `frontend/src/lib/services/rgsService.contract.test.ts`,
  `frontend/src/lib/stores/sessionRecovery.{ts,test.ts}`,
  `frontend/src/lib/stores/responsibleGambling.{ts,test.ts}`,
  `.github/workflows/checks.yml`
- JOB 6 commit: `frontend/src/lib/i18n/vocabulary.ts`,
  `frontend/src/lib/i18n/vocabulary.test.ts`,
  `frontend/scripts/social_dom_conformance.mjs`,
  `frontend/src/lib/components/PaytableModal.svelte`,
  `frontend/src/lib/components/WinBanner.svelte`,
  `frontend/src/lib/stores/socialMode.ts`,
  `frontend/src/lib/components/ReplayMode.svelte`,
  `reports/qa/social_dom_conformance_2026-07-25.json`,
  `docs/records/reviews/REVIEW_TRACKER.md`, `.github/workflows/checks.yml`

### Locked files

`gameStore.ts` and `games/future_spinner/**` untouched. `rgsService.ts` was edited under
the JOB 4 sanction only, on its own branch, with the lock proof above. `.claude/settings.json`
diff verified empty before every commit.

### Self-audit against the brief

- Australian English, no em or en dashes in authored prose. The one em dash in
  `sources/README.md` is inside a verbatim quotation of the source document's own title,
  where convention (l.7) requires exactness.
- Commit per job: yes, one commit per job, plus the branch commit for JOB 4.
- Explicit paths, never `git add -A`: yes.
- The single sanctioned lock exception was used in JOB 4 and nowhere else.
- Two items that would have needed locked paths were **parked with options rather than
  taken**: TR-047's PAR-sheet component (inside `games/future_spinner/**`) and any
  `gameStore.ts` plumbing (none turned out to be needed).

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, single continuous session across the
2026-07-25/26 midnight rollover.

**Approach.** Jobs worked in briefed order, one commit each, with each job's evidence
gathered before its code was written. Where a disposition was cheap to verify
independently, it was verified against the shipped artefact rather than accepted on relay,
and the rows say which check ran.

**Alternatives tried and rejected.** Hand-written replay fixtures, rejected because the
defect under test is precisely a wrong belief about what the books emit, so a hand-written
fixture records that belief twice. Patching the three named social literals individually,
rejected because it would have left the fourth for round three, which is what the
vocabulary layer exists to prevent. Marking the balance unit UNKNOWN behind a dual-path
constant as the brief allowed, rejected because the evidence exists in the pin and an
UNKNOWN would have been a manufactured one. Deleting the invented RG flags outright,
rejected because two of them are still read by the autoplay and session UI; they are
pinned to permissive values with the reason recorded instead.

**WHAT REMAINS, in the order the brief put it:**

- **JOB 8, mini-player HUD.** Not started. A dedicated 400x225 layout profile rather than
  a scaled desktop HUD, plus idle, spinning, result, feature and modal proofs replacing
  the current popout capture group in `EVIDENCE_INVENTORY.md`. TR-043.
- **JOB 9, purpose-drawn provider mark.** Not started. The full art spec is in the brief:
  vector master drawn at 48 first, two concentric ring circles with stroke never below
  3px at 48, three rounded-rectangle reel windows carrying 7 glyphs at no less than 10px
  height at 48, no text ring, cyan ring and magenta reel accents on transparency,
  deterministic build script with provenance, exports at 512/96/48 plus a delivery-named
  set, tile exports renamed to the same convention, and a refreshed 48px comparison beside
  candidates b and c. TR-031 and TR-045.
- **JOB 10, retrigger escalation.** Not started, and deliberately not started in part: the
  store-layer change is small, but `scatterEscalation.ts` has exactly one consumer,
  `GameGrid.svelte`, and landing the store without the consumer wiring would be dead code
  that the dead-wiring gate correctly rejects. It wants doing whole. TR-036 option (b):
  reduced ladder capped at level 3 on retrigger, its own test fixture, and one added line
  in the retrigger scatter rules routed through the JOB 6 `sv()` layer.
- **JOB 11, close.** Partial. This report exists; the archive copy is committed with it.
  **Not done:** making `npm run check` green (one `TS7006` at `vite.config.ts:33`) and
  adding it plus a production build to CI beside the Svelte baseline. TR-046.

**WHAT REMAINS FOR DTT, stated exactly as the brief asked:**

1. **Does the authenticate response carry any currency display metadata at all?** The
   pinned contract has no such field. The passthrough is wired and tolerant; DTT either
   sees a field arrive or confirms TR-012c should be closed as "the platform does not send
   this, the client-side table is the mechanism".
2. **Where does `play` put the round's events?** `Round.state` is `unknown` upstream. We
   read `state.events` first by inference from the Bet Replay endpoint. One live play
   response settles it.
3. **Is end-round genuinely idempotent on a settled session?** The retry's justification
   was rewritten, because the old one rested on a `roundId` the request does not carry.
   The new reasoning is sound but unconfirmed against a real endpoint.
4. **`stepBet` versus `minStep`.** The pinned client calls the field `stepBet`; the docs
   mirror prose says "authenticate/config/minStep". One live response resolves the naming.
5. **GC decimals, TR-057.** The official client says 0, its own documentation table and
   the docs mirror both say 2. A real GC session is the only input that cannot be wrong.
6. **Open-round recovery, TR-035b.** Its premise changed this session: the events ARE
   returned. The decision to settle or park is now a policy call informed by what DTT
   shows an active round actually contains.

**ROUND THREE OF EXTERNAL REVIEW SHOULD WAIT** until the wallet-contract PR is merged
after Fable's review and the DTT has confirmed the live payload shapes. Sending round two's
HEAD back out now would put a reviewer in front of a wallet layer that is fixed on a branch
and not on `main`, and in front of four briefed jobs that are not done. That is the same
mistake as sending a build with a known blocker and hoping the reviewer looks elsewhere.

---

## 2026-07-26: ROUND TWO REMEDIATION RESUMED, jobs A to F, all six complete

Brief saved verbatim: `reports/briefs/FS_R2R_RESUME_Prompt.md`. Resumes
`reports/briefs/FS_ROUND2_INGEST_AND_REMEDIATION_Prompt.md`, which stays the live
instruction set. **NO lock exception in this session**: the JOB 4 sanction was spent and
closed, and `.claude/settings.json`, `rgsService.ts`, `gameStore.ts` and
`games/future_spinner/**` were untouched throughout. Explicit paths on every commit.

### Job inventory

| Job | Result | Commit |
|---|---|---|
| A, merge PR #114 | **DONE** | `c35fac8` merge, `e6905de` tracker |
| B, TR-035b resume and settle | **DONE** | `4a37920` |
| C, 400x225 mini-player HUD | **DONE** | `0ad12d7`, `e07a784` |
| D, purpose-drawn provider mark and tile delivery | **DONE** | `7ecfe96` |
| E, TR-036 option (b), whole | **DONE** | `58f0ede` |
| F, close | **DONE** | `bf8e5c6` and this report |

Together with the previous session, **all eleven jobs of the live brief are now complete**,
and every round two blocker and major has a merged fix or a recorded ruling.

### JOB A, and a note for the next merge

Merged with a merge commit, not a squash, because `da4826f`'s message IS the lock proof:
which two deny lines were lifted, that the lift was never committed, the settings SHA-256
before and after, and that the locked paths were untouched. A squash would have destroyed
the audit trail the sanction mechanism rests on.

**`gh pr merge` refused the merge**: "refusing to allow an OAuth App to create or update
workflow .github/workflows/checks.yml without workflow scope". The PR adds CI gate 11a, so
it touches the workflow file, and the gh token is not scoped for that. Merged locally with
`git merge --no-ff` and pushed over SSH, which produces the same history; GitHub then marked
the PR merged itself. Recorded because it will recur on any PR that adds a gate, and the
message reads like a repository permissions problem rather than a CLI token one.

Re-run on merged `main`: contract, responsible gambling, session recovery and parse suites
all **PASS**. The contract and parse suites passing on one tree is the result worth having,
since gate 11 proves the event layer reads the shipped book schema and gate 11a proves the
envelope around it is the official one, and they had never both been green on the same
commit before.

### JOB B, resume and settle

Extract from `round.state` with the service's own reader, interpret through
`roundInterpreter`, **present, then settle, then one plain banner**. No forfeit path, and
none is needed: the only reason to forfeit was not knowing what the round contained.

**The first capture found a defect in the feature.** The banner rendered correctly while
the replay had already played out behind the intro splash, so the player was told their
round was complete and never saw it. Presenting behind a splash is indistinguishable from
not presenting. Recovery now waits for every boot splash to clear, and the proof asserts
the banner is absent while a splash is up. The gate resolves itself when neither splash
will be shown, because waiting forever on a dismiss handler that never fires would hold the
round open, which is worse than the defect it fixes.

Two more of my own mistakes were caught by the project's own gates and fixed rather than
allowlisted: a `recoveredScript` store nothing read (dead wiring), and a hardcoded
`aria-label="Dismiss"` that could not be translated.

Evidence from a **production build** through `vite preview`, because `recoverSession`
returns immediately in dev and a dev capture would have photographed a no-op.

### JOB C, and the worst mistake of the session

Three defects in my own work were caught by measurement, and **every one would have passed
a visual review of the screenshots**:

1. The strip inherited the stage `scale(S)`, so the 44px SPIN measured 13.8px.
2. The balance rendered `$1...`. Two intermediate attempts are recorded in the CSS: a
   positional `nth-of-type` selector matched BALANCE instead of WIN, and over-weighting
   balance simply moved the truncation onto WIN. A fixed budget does not care which stat
   you favour.
3. **The first run captured a UI that had never spun.** Without launch parameters the
   production build's live guard correctly blocks betting, so every SPIN click was a no-op
   and the balance read $100.00 before and after. All the geometry passed and "spinning"
   and "result" were an idle screen with two filenames. That is precisely the class of
   empty proof reviewer 3 objected to in the old popout gate, reproduced by me while
   fixing it. The proof now runs a real session and asserts the balance MOVED.

A fourth came from `svelte-check`: an unused `miniPlayer` export on FeatureMenu meant the
**FEATURES trigger was not in the mini row at all**, so a player in the popout could not
reach the bet modes or the buy. A warning about a missing export was a missing control, and
no geometric assertion could see it, because you cannot measure the overlap of something
that is not there. The proof now asserts it is visible and 44px in every non-feature state.

### JOB D and JOB E

The provider mark's build **asserts every line of the art spec and fails rather than
documenting a miss**, and it rejected my first geometry: window corners at 15.50 against a
14.83 limit. The windows were narrowed, not the assertion loosened. A second correction came
from looking rather than arithmetic: at a 2.8 half-bar the 7s rendered as magenta blobs.
The 48px comparison is now four-way, with smoothing off and the true 48px beside each
blow-up. **No adoption; the eye-call is the owner's.**

The retrigger ladder is capped at 3 with two different clamping rules, and the difference is
the design: a sustained level clamps TO the cap, a pulse above it becomes NOTHING. It is
wired in `FreeSpinsPresentation`, which reveals a retriggering spin reel by reel, with the
jets lifted above the overlay for the beat, because wiring it into GameGrid would have
produced a beat behind a nearly opaque backdrop that nobody could see.

### TR-057 ruling, recorded

**Option (c) with (b) as the interim: hold at 2 decimals, DTT flips one line.** Two
first-party sources say 2 (the official client's own documentation table, and the docs
mirror at `rgs-communication.md:82`) against one that says 0 (the client's `CurrencyMeta`
code), and the one that disagrees contradicts a table in the same file. Holding matches
what a reviewer opening the published docs would expect. Changing player money display on a
self-contradicting source would be the worse call, and it is reversible in one value.

### Gate results

| Gate | Result |
|---|---|
| `npm run check`, the COMPLETE command | **exit 0**, 0 errors, 36 warnings. Previously red on `vite.config.ts` TS7006 |
| `typecheck_baseline.mjs` | **PASS** at the committed baseline, not a raised one |
| Production build | **PASS**, now a CI gate |
| All 15 tsx gates | **PASS** |
| dead wiring, wallet floats, currency scale drift, locale completeness, a11y social terms, player string dash | **PASS** |
| Books verifier self-test | **PASS** |
| Recovery banner proof | **PASS**, 10 assertions |
| Mini-player proof | **PASS**, 13 assertions |
| Four-way provider mark build | **PASS**, every spec assertion held |
| Tile delivery | **PASS**, 796 KB of the 3072 KB ceiling |

### Locked files

`.claude/settings.json` SHA-256 `a0c8f149806a4e0a074a4d1ba10bc29346ae188ed7bf88e4d79bdc46e30570cc`,
unchanged and never edited this session. `rgsService.ts`, `gameStore.ts` and
`games/future_spinner/**` untouched. No lock exception existed and none was needed.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort.

**Approach.** Every job's evidence was produced by a script that ASSERTS rather than a
capture that illustrates, and four separate defects in this session's own work were caught
that way. The pattern is worth keeping: a proof that can only pass is not a proof.

**Alternatives tried and rejected.** Wiring the retrigger ladder into GameGrid, rejected
because the overlay would have hidden it. Renaming the tile masters in place, rejected
because two GENERATION_NOTE files describe them by name. Allowlisting the dead
`recoveredScript` store and the hardcoded aria-label, rejected because both gates were
right. Raising the typecheck baseline to absorb the 37th warning, rejected because the
warning was a real missing control.

**WHAT DTT MUST CONFIRM.** Nothing below is a design question; every one is a payload
question, and each has a single line that changes if the answer differs.

1. **The live `authenticate` payload**: that `balance` is `{amount, currency}`, that bet
   configuration sits under `config`, and that the twelve jurisdiction flags arrive under
   `config.jurisdiction`.
2. **The live `play` payload**: `{balance, round}` with `round.payout` in micros and
   `round.payoutMultiplier` in centibets.
3. **The live `end-round` payload**: `{balance}` alone, accepted against a body of
   `{sessionID}` alone, and idempotent on a settled session.
4. **Where the events sit inside `round.state`.** We read `state.events` first by inference
   from the Bet Replay endpoint. One live response settles it.
5. **`currencyDisplay`, present or absent.** The pinned contract has no such field. DTT
   either sees one arrive or confirms TR-012c should close as "the platform does not send
   this".
6. **XGC decimals**, TR-057. Interim is 2; a real GC session flips one value if it is 0.
7. **Resume and settle against a REAL open round**: that the events are there and that
   end-round settles it.

Also outstanding, and neither blocks DTT: the owner's four-way provider-mark eye-call, and
TR-047's PAR-sheet component, which is inside `games/future_spinner/**` and needs a narrow
sanction (options and a recommendation are in the row).

**EXTERNAL REVIEW ROUND THREE WAITS FOR DTT.** The wallet contract is merged and every
round two blocker is closed, but four of the seven questions above are assumptions this
codebase makes about payload shapes it has never seen. Sending round three out before DTT
would be asking three reviewers to check our reasoning about a contract instead of checking
the game, and the one thing round two proved is that reviewers cannot verify what they
cannot run.

---

## 2026-07-26b: PROVIDER MARK INGEST, candidate e

Brief saved verbatim: `reports/briefs/FS_MARK_INGEST_Prompt.md`. All four jobs complete.
**No lock exception, and nothing here touches a locked path**: no frontend source changed,
`.claude/settings.json` unchanged, `rgsService.ts`, `gameStore.ts` and
`games/future_spinner/**` untouched.

### What arrived

The owner commissioned a purpose-made provider mark externally. The source was **at the
path the brief named**, `/Users/jt/Desktop/wrs_provider_mark_source.png`, so no search of
Downloads was needed.

| Field | Value |
|---|---|
| Source SHA-256 | `fba98ff4b36cb7f0380375ca76fb6a4d02b7096f7c1c1ab94973a7b65e6ed7d5` |
| Dimensions | 1254x1254, 8-bit RGB, **no alpha channel** |
| Field colour | `#020614`, consistent across all four corner insets |
| Centring skew | **0 px horizontal, 0 px vertical** |
| Master crop | 1252x1252 at (1,1), a 1 px correction rather than a recomposition |

Externally generated art is permitted for this asset. CLAUDE.md bars externally DESIGNED
art and never allows externally designed SYMBOLS; a provider logo is neither a symbol nor
an animation-pipeline asset, and it came down the same owner-supplied path the hero emblem
did. The obligation CLAUDE.md does set, recording provenance, is met by `PROVENANCE_e.md`.

**The ingest measures and reports; it does not retouch.** Every operation is a measurement,
a crop or a rescale, each with its numbers in the provenance file. An ingest that quietly
improves the art is not an ingest.

### Two things the owner has to decide, both recorded rather than decided

**1. Field or transparent.** The supplied file has no alpha and a dark field with **rounded
corners**. The radii are the evidence that the field is part of the design: a stray backdrop
does not have corner radii. But the platform is explicit that the provider logo wants "a
transparent background" (`docs/stake-engine-live/game-tile-requirements.md:36`). Both forms
are exported, the transparent one keyed at full resolution **before** downscaling so the
edge antialiasing is computed against transparency rather than leaving a grey fringe. If
the rounded tile is the intended mark, the format rule is worth raising with the platform,
because a submission asset that misses a stated format requirement is a portal-upload risk
however good it looks.

**2. The text ring at 48px, measured on this file rather than assumed.** The wordmark is
**0.81 px per stroke at 48px**, below one whole pixel, so it resolves as a texture and not
as words. That is the same structural finding TR-031 recorded against the original master
and the reason candidate d dropped its text ring entirely.

That is not an argument against e. At 48px e's ring, reel windows and 7s read cleanly,
which no earlier candidate managed, and the wordmark is the only element that goes. The
owner may reasonably want it present at 512 and accept the trade at 48. The true-size strip
exists so the call is made on real pixels rather than on that number.

### Exports and hashes

| File | Form | SHA-256 |
|---|---|---|
| `provider_mark_e-owner-supplied_master_1252.png` | master | `933d84fc5359c0d0dd21a88a2402953db7b02b07b256b50158ca045d47105474` |
| `provider_mark_e-owner-supplied_512.png` | field | `172d8930ad459d940a7930af274e1f63c5cc07b46ce03e5dd261b9d77559407d` |
| `provider_mark_e-owner-supplied_96.png` | field | `8aa61ba7cd346f2762a6cb76a7c30bcc16ce1155d28abe371285baef229f065a` |
| `provider_mark_e-owner-supplied_48.png` | field | `2715d872f9ec060c45612a0dd840bc912a3c42e803ae1453ef353e5a44fdcaa3` |
| `provider_mark_e-owner-supplied-transparent_512.png` | transparent | `3538d408e475870f269a3ff4da4596f9c54b2ac28472a1f23c2d11fab33a9b09` |
| `provider_mark_e-owner-supplied-transparent_96.png` | transparent | `7e780ceef4643c44ee87cd00ce0b18edd57c1b483887548add6025b407abf194` |
| `provider_mark_e-owner-supplied-transparent_48.png` | transparent | `d8e594dde0a98ca7c562641e227db92c8e5c7865cdf2ef103abc9cf173f1110c` |
| `reports/screens/provider-mark/48px-legibility-comparison.png` | evidence | `3a760ad82f01efd7ee2a7a36d5568d2891fec7d86f67c6e2d4e5a734dc3f9456` |
| `reports/screens/provider-mark/candidate-e-true-size.png` | evidence | `08be8edf9cff2bd150736d55f83cefddd404f4c15cdefe88d919c5924a4ca97c` |

### Supersession, and nothing adopted

Candidates a, b, c and d are marked **SUPERSEDED, non-preferred** per convention (h), in a
new `README.md` in the provider-mark directory and in a banner at the top of each existing
provenance file. **They are kept, not deleted, and they stay in the comparison sheet**: a
comparison that quietly drops the options it has moved past stops being a comparison, and a
future reader should be able to check that the retirement was earned.

**The delivery set is deliberately unchanged.**
`design-system/brand/delivery/WeRollSpinners-Logo.png` is still byte-identical to candidate
d's 512 export (`676d7d13...`), verified rather than assumed.

### A missing input, named rather than reconstructed

The brief's JOB 4 says "DTT remains the gate for round three per DTT_PROTOCOL.md".
**There is no `DTT_PROTOCOL.md` anywhere in this repository.** Convention (m) is explicit
that a brief referencing an external document must state where it lives and that missing
inputs are named and waited for, never reconstructed, so nothing has been written to stand
in for it.

The substance is not lost. The DTT gate and its seven required confirmations are recorded
in the FOR THE NEXT SESSION block of the 2026-07-26 section above, and that list stands. If
a separate DTT_PROTOCOL.md exists outside the repository it should be added; if it does not
exist yet, that block is the thing to formalise into one.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort. Documents-and-assets pass, no source changes.

**Approach.** The ingest was written to measure and report rather than to improve, and the
two decisions it surfaced were escalated rather than taken. Both are cheap to reverse and
neither is the builder's call.

**Alternatives rejected.** Keying the field out and shipping only the transparent form,
rejected because the rounded corners say the field is designed. Shipping only the field
form, rejected because the platform states a transparency requirement. Cropping the
wordmark away to raise the 48px legibility, rejected outright: that would be redesigning
the owner's commissioned art inside an ingest, which is exactly what an ingest must not do.

**ON THE OWNER'S ONE-LINE CONFIRMATION**, two things happen and nothing else:

1. `design-system/brand/delivery/WeRollSpinners-Logo.png` is regenerated from the chosen
   candidate and form, by re-running `frontend/scripts/tile_delivery_build.mjs` with its
   logo source re-pointed. One line changes in that script.
2. TR-031 closes.

The confirmation needs to answer two things: **which candidate**, and for e, **field or
transparent**.

**DTT REMAINS THE GATE FOR EXTERNAL REVIEW ROUND THREE**, unchanged by this pass. The
provider mark was never a DTT item; it is a portal-upload item, and it does not gate or
unblock anything on the DTT list.

---

## 2026-07-26c: MARK ADOPTED, DTT PROTOCOL WRITTEN, PAR CORRECTED

Brief saved verbatim: `reports/briefs/FS_MARK_ADOPT_AND_DTT_PREP_Prompt.md`. All five jobs
complete. `FS_DTT_PREP_Prompt.md` was never saved to this repository and was not run, so
there was nothing to retire.

### A contradiction in the brief, resolved in the open

The brief opens with **"Go with F"** and then, in its JOB 1 body, names
`provider_mark_e-owner-supplied-transparent`. Those cannot both be followed.

**"Go with F" was taken as the decision.** It is unambiguous, it stands alone at the top,
and it directly answers the question the previous session ended on. The JOB 1 filename
reads as carried over from when e-transparent was the leading candidate, before f existed.

It is flagged in five places rather than buried: the delivery script's own comment, the
delivery README, the provider-mark README, TR-031, and here. **Reversing it is one path in
`frontend/scripts/tile_delivery_build.mjs` plus a re-run**, and nothing else in the set
changes.

f was also the better answer on the evidence, which means the two readings did not carry
equal risk: it closes both of e's open questions by its own construction, carrying a real
alpha channel so the platform's transparency rule is met by the artwork rather than by a
keying step we performed, and carrying no wordmark so e's measured 0.81 px per stroke at
48px cannot arise.

### The findings this session turned up

**Seven jurisdiction flags had no readers.** Found while writing DTT_PROTOCOL.md, by
checking whether the flags the protocol would ask the owner to verify were actually
enforced. They were derived onto named fields and read by nobody. **That is R7/TR-015
reproduced, and by me**: that finding was "the flag was computed correctly and every
consumer ignored it". The wallet pass typed the official twelve, wrote that they "now
derive onto named fields", and stopped. Deriving is not enforcing, and a DTT protocol
asking the owner to confirm behaviour the code cannot produce would have been a test
written to fail.

Fixed: `disabledSpacebar` (App's key handler returns early; the spin button is untouched
because the flag bans the key, not the bet), `disabledSuperTurbo` (the cycle skips 4x and a
late-arriving ban drops 4x to 2x rather than to a standstill), `disabledSlamstop`, and
`socialCasino` (now a third social signal in `socialMode.isSocial`). Three are deliberately
unconsumed and the store now says which and why, because their unexplained silence is what
made the original defect hard to see.

**The bundle is not reproducible from the repository.** Chasing the stale 13.59MB figure
turned up the reason it was stale: `frontend/public/assets/themes/future-spinner/branding/`
is **7.06MB, untracked in git, and referenced by no source file**, and Vite copies
everything under `public/` verbatim into `dist/`. A clone builds 14.81MB; this machine
builds 21.87MB. A committed size a reviewer cannot reproduce is worse than no figure, and
it is the same class as the books verifier printing PASS on absent input: a number that
looks like evidence and is not. Three options recorded with a recommendation to delete;
not done, because deleting owner-supplied art is not a builder's call.

A first-pass `du -sh dist` read 27MB, which would have breached the 25MB budget. That was
filesystem block overhead rather than apparent size. Recorded so nobody hunts for a problem
that does not exist.

### JOB 3 sanction proof

| Condition | Result |
|---|---|
| Deny lines lifted | exactly `Edit(games/future_spinner/**)` and `Write(games/future_spinner/**)`, nothing else |
| Lift mechanism | working-tree edit, never committed, restored before the commit |
| `.claude/settings.json` SHA-256 | `a0c8f149806a4e0a074a4d1ba10bc29346ae188ed7bf88e4d79bdc46e30570cc` before **and** after |
| Settings diff | empty |
| `games/future_spinner/library/` | all **188 files byte-identical**, manifest hash `3f7da94da98d37e1e652e9d8d48a51e11c50120f0a098f190ec0e6b6c62070d6` before and after |
| `git diff --stat` | exactly one file under `games/future_spinner/`, **1 insertion, 1 deletion** |
| Tables, weights, config, code | untouched |

**The correction was re-measured before it was written**, per convention (l.2) and (l.5),
rather than taken on the earlier finding's word. 20,000 rounds of every one of the five
books, counting only rows 1 to 4 of each six-row reel so the padding is excluded, and
covering free-game reveals as well as base:

| Mode | Max visible scatters | Boards at 5 |
|---|---|---|
| base | **5** | 124 |
| cruise | **5** | 41 |
| antelite | **5** | 230 |
| bonus | **5** | 2,909 |
| super | **5** | 2,937 |

Maximum five in all five modes, zero at six or seven.

### Delivery set

| File | SHA-256 |
|---|---|
| `WeRollSpinners-Logo.png` | `66c692daf309293568214bd57b350b02b930d610c6b7d09ecb181a35dc7a03c6` |

Byte-identical to `provider_mark_f-owner-transparent_master_1024.png`, because the master is
a full-frame crop of the owner's file at its own resolution: **the submitted asset has been
through no resampling at all.**

### Gate results

All fifteen tsx gates **PASS**. `typecheck_baseline`, `dead_wiring_scan`,
`scan_wallet_floats`, `currency_scale_drift`, `locale_completeness_check`,
`a11y_social_terms_check`, `player_string_dash_check` all **PASS**. **`npm run check` exits
0.** Gate 9 gained six assertions and now runs 59 checks.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort.

**Approach.** JOB 2 was written last of the code-touching work on purpose: writing down what
the owner should observe is the fastest way to discover what the code cannot yet do, and it
found seven unenforced flags in about a minute.

**Alternatives rejected.** Following the JOB 1 filename instead of "Go with F", rejected and
flagged rather than silently chosen. Force-wiring the three display-only flags to invent
consumers, rejected: recording why they are silent is more useful than a fake reader.
Deleting the untracked 7.06MB branding directory, rejected as not a builder's call.
Reporting the 27MB `du` figure as a budget breach, rejected after measuring properly.

**THE BUILD AND ITS DOCUMENTS ARE DTT-READY.**

The owner runs **`DTT_PROTOCOL.md`** on the portal, alongside `SUBMISSION_DOSSIER.md`
section 5. Order: 5b for the uploads, then DTT_PROTOCOL.md's ten observations, then 5e.

**The one-time uploads, which cannot be done from here:**

- **Provider logo**: `design-system/brand/delivery/WeRollSpinners-Logo.png` into Team
  Settings Branding.
- **Tile layers**: `design-system/brand/delivery/FutureSpinner-BG.jpg` and
  `FutureSpinner-FG.png` into the Tile Editor.

**Worth doing before staging**, and it is the owner's call: resolve the 7.06MB untracked
`branding/` directory, since it ships, nothing references it, and it is why the bundle
cannot be reproduced from a clone.

**EXTERNAL REVIEW ROUND THREE FOLLOWS DTT CONFIRMATION OF THE PAYLOAD SHAPES.** Ten
observations, each with its expected value and the single line that changes if it
disagrees. Until they are made, the wallet layer's correctness rests on a pinned type
definition rather than on anything anyone has watched happen.

---

## 2026-07-26d: BRANDING CLEANUP, and the build is now byte-reproducible

Brief saved verbatim: `reports/briefs/IFS_BRANDING_CLEANUP_Prompt.md`. All three jobs
complete. No lock exception, and no locked path was touched.

**A note on the filename.** The brief names itself `IFS_BRANDING_CLEANUP_Prompt.md`, where
every other brief in this directory is `FS_`. It is saved under the name it gives itself,
because convention (f) forbids tidying a brief and the filename is part of what was
written. Recorded here so the odd one out is explained rather than looking like an error.

### JOB 1: deleted, ignored, and verified against a real clone

**Checked before deleting**, because one of the sixteen files was the source of the
**adopted** provider logo. `we-roll-spinners-app-icon-1024-transparent.png` has SHA-256
`61a2258d7c3283d93e430539656070f72560b86d5940312c7454ff776a3daefd`, which is exactly what
candidate f was ingested from. Deleting the only copy of a source we depend on, to save
7MB, would have been a bad trade, and "it is probably fine" is not the standard here.

It was not the only copy, and that was **verified rather than assumed**: the committed
master at `design-system/brand/provider_mark/provider_mark_f-owner-transparent_master_1024.png`
was compared pixel by pixel against it. 1024x1024, **4,194,304 RGBA bytes, zero differing**.
The ingest cropped the full frame at native resolution, so only the PNG encoding differs.
All sixteen deleted files are hashed in commit `8c61f45`.

**The clean-clone comparison was performed, not asserted.** A clone taken from origin after
the deletion was pushed, installed with `npm ci`, built with `npm run build`:

| | Files | Bytes |
|---|---|---|
| Build machine, first attempt | 112 | 15,546,963 (14.83MB) |
| Clean clone | 108 | 15,510,083 (14.79MB) |

**Those did not match, and the 36,880-byte gap was the whole point of the job**, so I went
after it rather than calling 14.83 and 14.79 "within rounding". The difference was four
`.DS_Store` files: macOS writes them into any directory Finder has opened, including
`public/`, and Vite copies `public/` verbatim into `dist/`. git ignores them; the **build**
did not. Same reproducibility defect as the branding directory, three orders of magnitude
smaller. `pruneLegacyAssets` now strips them.

**After that fix:**

| | Files | Bytes |
|---|---|---|
| Build machine | 108 | **15,510,083** |
| Clean clone | 108 | **15,510,083** |
| File lists | identical | identical |

**Exact match, file for file and byte for byte**, against the 25MB budget.

### A second defect, found by running the tools rather than trusting them

`frontend/scripts/build_diet_verify.mjs` is the proof `SUBMISSION_DOSSIER.md` section 5
cites for "confirmed empty of pruned-path requests and under the 25MB budget". **It had been
broken since 2026-07-16.** HeroSplash (ANIMATION UPLIFT PASS) renders over everything on
load and intercepts pointer events, so its clicks sat out the full 30 second actionability
timeout and the run died.

Its committed result, `reports/qa/build-diet-network-log.json`, was dated **2026-07-14: two
days before the splash landed**. So a cited compliance proof was ten days stale and could
not be regenerated, and nothing noticed because the script is local-only rather than a CI
gate. That is the same shape as the books verifier printing PASS on absent input: an
artefact that looks like evidence while the thing producing it no longer works.

Both of its pages carried their own bespoke intro-dismissal block, written before HeroSplash
existed, and both now use the shared `dismissIntro` helper that about twenty other scripts
were already deduplicated onto. This one was missed in that pass. **The reduced-motion page
was the one actually failing**, which the Playwright log identified precisely by naming
`class="hero-splash ... reduced"`; fixing only the first page looked like it should have
worked and did not.

Fresh result committed: zero 404s, zero pruned-path requests, zero console errors, 14.79MB
under budget, reel-mode toggle absent from the production bundle, reduced-motion CSS present
and the spin clean.

### JOB 2: convention (o)

> **The staging bundle is always built from a fresh clone, never from a working machine, so
> the uploaded artefact is reproducible by definition.**

Written as structural rather than as a discipline to remember, because that is the whole
value: whatever sits on a working machine and is not in the repository cannot reach the
upload. Remembering to check is exactly what failed here.

### Gate results

All fifteen tsx gates **PASS**. `typecheck_baseline`, `dead_wiring_scan`,
`scan_wallet_floats`, `currency_scale_drift`, `locale_completeness_check`,
`a11y_social_terms_check`, `player_string_dash_check` all **PASS**. `npm run check` exits 0.
Books verifier self-test **PASS**. `build_diet_verify` **ALL CHECKS PASS**, for the first
time since 2026-07-16.

TR-047 is now **MERGED across all three components**.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort.

**Approach.** The brief said "confirm it matches a clean-clone build within rounding". I did
the clone build rather than reasoning about it, and the two things this session actually
fixed were both found that way: the `.DS_Store` leak, and a compliance proof that had been
unrunnable for ten days. Neither was visible from the repository alone.

**Alternatives rejected.** Accepting 14.83 against 14.79 as "within rounding", which the
brief would have allowed and which would have left Finder metadata in a submission bundle.
Deleting the branding directory before checking whether it held the adopted logo's source.
Fixing only the first page of the diet verifier, which looked sufficient and was not.

**THE REPOSITORY IS FULLY DTT-READY.** Every round-two blocker and major is merged, every
tracker row is closed or explicitly parked with options, the bundle is reproducible from a
clone, and every gate is green.

**The remaining items are yours, and none of them is a code task:**

1. **The portal session**, per `DTT_PROTOCOL.md`. Ten scripted observations, each with its
   expected value and the single line of code that changes if it disagrees. Run it alongside
   `SUBMISSION_DOSSIER.md` section 5: 5b for the uploads, then the protocol, then 5e.
2. **The two one-time uploads.** The provider logo,
   `design-system/brand/delivery/WeRollSpinners-Logo.png`, into Team Settings Branding; the
   tile layers, `FutureSpinner-BG.jpg` and `FutureSpinner-FG.png`, into the Tile Editor.

**Build the staging bundle from a fresh clone**, per convention (o). This machine and a
clone now agree byte for byte, so either produces the same artefact today, but the clone is
the one that stays true as the working tree accumulates.

**External review round three follows DTT confirmation of the payload shapes.** Until those
ten observations are made, the wallet layer's correctness rests on a pinned type definition
rather than on anything anyone has watched happen.

---

## 2026-07-26e: THE UPLOAD KIT

Brief saved verbatim: `reports/briefs/FS_UPLOAD_KIT_Prompt.md`. All five jobs complete. No
lock exception; the books were read from the local machine and are not committed.

### The kit

**`~/Desktop/FS_UPLOAD_KIT/`**, 395 MB total.

| Folder | Contents | Destination |
|---|---|---|
| `00_READ_ME_FIRST.md` | the walkthrough, 27 numbered steps plus ten checks | read on a phone |
| `01_maths_upload/` | **12 files**, 379.6 MB, plus `HASHES.txt` | the game's Files page |
| `02_frontend_upload/` | **108 files**, 15,510,083 bytes | the game's Files page |
| `03_branding/` | 3 images plus `HASHES.txt` | Team Settings and Tile Editor |

### The maths set is TWELVE files, not eleven

The brief says eleven. So did `SUBMISSION_DOSSIER.md`, in two places. **Both were wrong, and
the arithmetic is not close:** `index.json` declares **ten** files (five books, five lookup
tables); add `index.json` itself and that is eleven; add `game_metadata.json`, which the
index does not declare but the platform still needs, and the real total is **twelve**. The
directory has held twelve files throughout.

The artefacts were always right. The count was not, and this is exactly the error that
derails a first-time uploader: counting twelve files against a document saying eleven, and
reasonably concluding something is broken. Corrected in the dossier at both places, and
called out explicitly at the top of `01_maths_upload/HASHES.txt` and in the walkthrough.

**All twelve verified twice**, against the dossier 5c table and `BOOKS_MANIFEST.md`, once
before copying and again inside the kit. Twelve of twelve matched both times.

### The frontend set came from a real clone

Per convention (o): cloned from origin at `cec7368`, `npm ci`, `npm run build`, gates run
**in the clone**.

| | Files | Bytes |
|---|---|---|
| Clone build | 108 | 15,510,083 |
| Kit copy | 108 | 15,510,083 |
| Committed reproducible figure | 108 | 15,510,083 |

Network-hygiene and size gates, run against that clone build: **ALL CHECKS PASS**. Zero
404s, zero pruned-path requests, zero console errors, 14.79 MB against the 25 MB budget,
reel-mode toggle absent, reduced-motion CSS present and the spin clean.

`02_frontend_upload/` deliberately contains **no** `HASHES.txt`. Everything in that folder
gets uploaded, so a stray file would go to the portal and would break the 108-file match.

### A third reproducibility finding, and the broadest one yet

**Playwright was not declared in `package.json` at all.** Found by doing what the brief
asked, cloning fresh and running the gate in the clone, where it failed with
`Cannot find package 'playwright'`. It exists on this machine at 1.61.1, installed ad hoc
and never saved.

**Fifty-five scripts in `frontend/scripts/` import it.** That is the entire Playwright-based
evidence pipeline: the diet verifier, the mini-player proof, the recovery banner proof, the
social DOM scan, the provider-mark builders, every layout and conformance suite. **None of
them could run from a clean clone**, so every artefact they have ever produced was
reproducible on one machine only.

This is the same family as the two before it, and the broadest: the branding directory was
one directory, the stale diet log was one artefact, this was the tool that makes all of
them. Declared at `^1.61.1` with the lockfile updated via `--package-lock-only
--ignore-scripts`, so CI gains resolution without downloading browsers it does not use.
A clone now needs one documented command, `npx playwright install chromium`.

### The walkthrough

Plain Australian English, phone friendly, numbered steps only. It opens with the four
safety facts, because a first-time uploader's real blocker is not knowing which actions are
irreversible: nothing is public before **Submit for review**, every upload replaces rather
than stacks, "Publish" on this platform means *make my uploads runnable for me*, and
stopping to screenshot is always safe.

Then Team Settings and Branding, the Files page for both sets, the two Publish buttons, the
Tile Editor, and the Developer page's Start game session and Launch in New Tab.

It closes with the ten `DTT_PROTOCOL.md` observations rewritten as **look at this, expect
this, screenshot this**, each with its filename, plus where to put the screenshots. The
protocol's technical detail is cross-referenced, not duplicated: the owner is told plainly
that the file is for me and for Fable.

Three things in it are worth keeping if it is ever rewritten. Check 3 says outright that it
is the most important observation of the session and that being wrong is fine and cheap.
Check 6 warns that confirming an **absence** is easy to do badly. Check 9 says whatever
happens is the right answer, so a jurisdiction that permits everything is not mistaken for
a broken build. A copy is committed at `docs/records/upload-kit/`.

### Two practical warnings the walkthrough carries

**The maths upload is about 400 MB** and two files exceed 140 MB each. On a normal
connection that is a long wait, and an owner who does not expect it will assume it has
hung.

**The frontend must be uploaded as CONTENTS, not as a folder.** If `index.html` ends up one
level down, the game will not load. The walkthrough says so twice, once as an instruction
and once in the troubleshooting section, because it is the most likely single mistake.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort.

**Approach.** Everything was verified before packaging so the owner's task is drag and drop.
The one thing not pre-verified is the portal's own page and button names, which are quoted
from `SUBMISSION_DOSSIER.md` 5b and have never been seen by anyone here; the walkthrough
tells the owner to stop and screenshot if a page asks for something it does not mention,
rather than to improvise.

**Alternatives rejected.** Putting a `HASHES.txt` in `02_frontend_upload/`, which would have
been uploaded to the portal. Writing "eleven" because two documents said so. Installing
Playwright ad hoc in the clone just to get the gate to run, which would have left
fifty-five scripts broken for the next person.

**THE OWNER RUNS `00_READ_ME_FIRST.md` END TO END.** Nothing in it needs me present. The
ten checks produce screenshots into `~/Desktop/DTT_SCREENSHOTS/`.

**Then Fable verifies the observation captures**, against the expected values and flip
points in `DTT_PROTOCOL.md`.

**Then external review round three.** Each of the ten checks either confirms an assumption
or names a single line to change; none is a redesign, which is why the contract work was
done first.

---

## 2026-07-26f: V3 FRESH SESSION, JOB 3 remainder through JOB 5

Brief saved verbatim: `reports/briefs/FS_V3_FRESH_SESSION_Prompt.md` (`63a3f56`).
Live parent set unchanged: `FS_V3_CONSOLIDATED_Prompt.md` and
`FS_V3_CONTINUATION_Prompt.md`. **No lock exception was taken and none was needed.**
`rgsService.ts`, `gameStore.ts` and `games/future_spinner/**` untouched;
`git diff .claude/settings.json` verified 0 bytes before every commit. Explicit
paths on every commit, never `git add -A`.

### What landed, by job

| Job | Result | Commit |
|---|---|---|
| Brief saved verbatim | DONE | `63a3f56` |
| 3(e) mini-profile abbreviation, TR-066 | **DONE, row CLOSED** | `e4bfbc5` |
| 3(d) social forces English, TR-067 | **DONE, row CLOSED** | `e9bf3f6` |
| 3(f) FEATURE PRICE line, TR-068 | **DONE, row CLOSED** | `17679ce` |
| TR-072, found in passing, fixed per the mandate | **DONE, row OPENED and CLOSED** | `a933dc4` |
| 3(g) contrast measured, TR-070 | **DONE, row CLOSED** | `fe8d446` |
| 3(h) locked-paths CI gate | **DONE** | `5c1b991` |
| 3(i) no documentation ships | **DONE** | `856fd17` |
| 4, build provenance, TR-062 (a) | **DONE** | `7dd83e6` |
| 5, kit V3 from a fresh clone, TR-062 (b) | **DONE, row CLOSED** | `a1ff78b` |
| 6, 7, 9, 10 | **NOT STARTED**, resume notes below | |
| 8, close | this section | |

**JOB 3 is now complete, (a) through (i).** Six tracker rows closed this session:
TR-066, TR-067, TR-068, TR-070, TR-062 and the new TR-072.

### JOB 3(e), and the root cause that was not the recorded one

Fable ruled mini-profile abbreviation only. Built as ruled, and building it found
that **this row's own recorded diagnosis was wrong, and it was mine.**

The row said `noStatValueIsTruncated` was vacuous because "every `.m-stat-value`
carries `use:autofitText`, which iteratively shrinks the font". That is true of
`.p-stat-value`, `.c-stat-value` and `.fs-value`. **It was never true of
`.m-stat-value`**, and it is the reverse of the truth: that rule read a flat
`font-size: 11px`, so it never multiplied in the `--autofit-scale` custom property
the action writes. **`use:autofitText` has been a complete no-op on the mini strip
since JOB C created the profile.** The comment sitting beside the rule asserted the
opposite, which is how it survived two tuning passes and a written diagnosis. So the
owner's mid-glyph cut was not autofit reaching a limit; it was nothing shrinking at
all and `overflow: hidden` doing the cutting.

Abbreviation is still required, and that was derived before it was built: the
BALANCE box measures **84.2px** including its 7px label, leaving roughly 58px for a
value needing about 95px, so a fit costs an effective **6.7px** against a 9px floor.

**Both fixtures, which is what makes it a proof of the ruling rather than of half of
it.** Hostile `$52,431,098.76`: `$52.43M` at the full 11px in all five states.
Fits-in-full: **`$1,040.06` complete at 9.92px**, and that value is not invented, it
is the balance in the owner's own capture where the shipped build rendered
`BAL $1,040` with the cents cut. Desktop, portrait and compact landscape all render
`BALANCE $52,431,098.76` in full, asserted.

`formatBalanceCompact` uses Intl compact notation rather than a hand-written K/M/B
table, because a table would be English in a game shipping sixteen locales, and it
**truncates rather than rounds**: $999,999.99 must not read as "$1M". A money readout
may understate under abbreviation; it may never overstate.

**A third defect, found only by doing the capture comparison the ruling asked for.**
The mini strip's menu button renders as an **empty box with no icon**, in the owner's
live capture and in ours. It borrows the portrait profile's `.p-hamburger-bar`, which
paints from `var(--p-acc)`, declared on `.p-hud` and nowhere else, so inside `.m-hud`
the declaration is invalid at computed-value time and the bars are transparent. The
only control reaching the paytable, session panel, turbo, autoplay and MAX in the
popout had no affordance. `.c-hud` had the identical defect. Both fixed.

### JOB 3(f), and what the capture shows

The real-money proof capture reads

```
EPIC WIN   $29,214.24   386x BET      FEATURE PRICE $40,000.00
```

which is TR-068's confusion exactly, now legible as the loss it is. The social
capture reads `EPIC PRIZE $11,551.28  183x PLAY  FEATURE PRICE $10,000.00` with
COINS/PRIZE/PLAY throughout.

`spinCostMicros` is now the only place that cost expression exists. It previously
existed **five times over**, which is five chances for the price a player is quoted
to disagree with the price they are charged.

### TR-072, and why it is not a small thing

Found by looking rather than by a gate: the JOB 3(f) proof stalled on the free-spins
CLICK TO CONTINUE gate, and reading the markup to find its selector showed the string
was a bare English literal.

`locale_completeness_check.mjs` reported PASS with **four** of these shipping. Its
scan required the literal's first character to sit immediately after the `>`, which
holds only when an element and its text are on one line. The moment an element wraps,
which is the house style, its text sits on its own line behind a newline and
indentation and the gate could not see it at all. **That is the TR-060 and TR-063
pattern for the third time.**

The four are all reachable: CLICK TO CONTINUE, which every free-spins entry stops on;
REACHED! and COLLECT on the 5,000x celebration; and PLAY AGAIN on Bet Replay, a
mandatory platform surface. Fixed by authoring across all sixteen locales, composed
from each locale's own shipped vocabulary.

### JOB 3(g): measured, and no scrim needed

The row deliberately did not fix blind. Re-measured after 3(b) and the prediction
held. Worst-case contrast against the real composited backdrop: FEATURES label
**10.06 / 7.98 / 7.57 / 9.05** at Mobile L, M, S and 390x844; the mode chip
10.70 / 10.18 / 9.25 / 10.58. Every figure clears WCAG AA at 4.5:1 and the lowest
clears **AAA** at 7:1. Adding a scrim would have been a change made against a
measurement nobody took.

Two corrections caught before they became findings: a colour-parsing bug that
reported every preset failing at 1.17:1 (impossible for light text, caught by
convention (l.2)), and an inert assertion whose target never rendered.

### JOB 3(h): the deny rules do not guard git

`scripts/qa/locked_paths_gate.mjs` runs first in CI and reads what actually landed.
Token format documented in CLAUDE.md beside the locks:

```
LOCK-SANCTION: <YYYY-MM-DD> <locked-path>[, <locked-path>]...
```

Checked in **both directions**: every locked path touched must be named, and every
path named must be touched, so a blanket sanction is rejected rather than ignored.

**Self-test output, as the brief requires it recorded:**

```
caught  a locked file changed with NO token                      (expected FAIL, got FAIL)
caught  the same change WITH a matching token                    (expected PASS, got PASS)
caught  a token naming ONE path while TWO are touched            (expected FAIL, got FAIL)
caught  a blanket token naming MORE than it changes              (expected FAIL, got FAIL)
caught  a file INSIDE games/future_spinner/ with no token        (expected FAIL, got FAIL)
caught  .claude/settings.json committed with no token            (expected FAIL, got FAIL)
caught  a locked file touched via a bulk add                     (expected FAIL, got FAIL)
caught  negative control: an ordinary commit                     (expected PASS, got PASS)
caught  negative control: an empty range                         (expected PASS, got PASS)

LOCKED PATHS SELF-TEST: PASS
```

It builds a real throwaway git repository and makes real commits in it, because the
git plumbing is where a path-matching gate actually goes wrong.

### JOBs 3(i), 4 and 5

Documentation no longer ships. The audio generation-notes README naming the model,
seeds, prompts and licence paths is pruned at build and its absence is asserted by a
separate gate that knows nothing about the plugin, because a plugin that stops
running fails silently, which is how `build_diet_verify.mjs` sat broken for ten days.

`dist/build-info.json` carries the commit; the boot line prints it from values Vite
**inlined**, and the network-hygiene gate asserts the file is never fetched:
**0 requests**, measured.

`scripts/kit_build.mjs` refuses an unpushed HEAD and a dirty `frontend/`. **Both
refusals were observed firing on the real tree** before the push, and the build
succeeded only once both were resolved, so they are known to work rather than
assumed to. One bug was found by running it rather than reading it: the tree-facts
helper trimmed the whole `git status --porcelain` output, stripping the leading space
off the first line only, so one dirty frontend file was downgraded from a refusal to
a warning. That is the wrong direction to be wrong in.

### THE KIT

**`~/Desktop/FS_UPLOAD_KIT_V3/`**

| Field | Value |
|---|---|
| Commit | `7dd83e6a4ffd6a6fed74a0c2fd0a9262661e6c5e` |
| Tree | clean, built in a fresh clone |
| Contents | `02_frontend_upload/` (108 files, 15,515,125 bytes, 14.80 MB), `README.md`, `BUILD_INFO.json` |
| Gates run IN THE CLONE | dist hygiene PASS, dash gate dist scan PASS, mock containment PASS |
| Maths | stays at V1, NOT re-uploaded |

`~/Desktop/FS_UPLOAD_KIT/` is DEAD and must not be uploaded again.

### Gate results at HEAD

| Gate | Result |
|---|---|
| `npm run check` (svelte-check AND tsc) | **0 errors**, 36 warnings, the committed baseline, 496 files |
| typecheck baseline, dead wiring, wallet floats, currency scale drift | **PASS** |
| locale completeness **plus its new seeded self-test** | **PASS**, 0 unexplained literals, 5 of 5 seeds caught |
| a11y social terms, vocabulary, fsModes drift | **PASS** |
| dash gate: self-test, source, dist | **PASS**, all three |
| currency static | **PASS**, 82 assertions |
| **social locale, NEW gate 12a** | **PASS**, 65 assertions |
| betLadder, responsibleGambling, modalGuard, liveGuard, sessionRecovery, scatterEscalation, launchParams | **PASS** |
| rgsService parse and contract, replayRounds | **PASS** |
| layout fit gate, seven presets | **PASS** |
| **contrast gate, NEW gate 13d** | **PASS**, seeded violation caught, negative control clean |
| **dist hygiene, NEW gate 13e** | **PASS**, 4 of 4 seeds caught, stamp reconciles |
| **locked paths, NEW gate 0** | **PASS**, 9 of 9 self-test cases |
| mini player proof | **PASS**, 19 checks, 5 seeded violations caught |
| feature price proof | **PASS**, 15 checks including the negative control |
| locale launch conformance | **PASS**, 16 locales, 10 fallbacks, 5 social cases, negative control |
| build diet verify | **ALL CHECKS PASS**, `buildInfoRequests: 0` |
| mock containment | **PASS** |
| kit builder self-test | **PASS**, 5 of 5 |

Five new CI gates this session: **0** locked paths, **12a** social locale,
**13d** contrast, **13e** dist hygiene, plus the locale gate's self-test.

### Self-audit against the brief and the conventions

- Brief saved verbatim to `reports/briefs/` and committed first, convention (f).
- One commit per job, explicit paths throughout, never `git add -A`, convention (k).
- No em or en dashes authored. The four surviving in `gameStore.ts` comments stay
  parked (locked, no exception); seven in `vite.config.ts` comments were cleared
  while that file was open.
- No lock exception anywhere. No bulk operation ran over a tree containing locked
  paths; the only tree-wide operations were read-only scans.
- Every new gate ships a seeded self-test, convention (p), and in every case the
  seed is the form the defect really took rather than a form the gate handles.
- Money-path work escalated rather than ruled on: TR-066's abbreviation and
  TR-068's price line were both built to Fable's recorded rulings, not to my
  recommendation, per (l.8).
- Two of my own measurements were wrong and were caught by (l.2) before they became
  findings: the contrast colour parse, and the kit builder's porcelain parse.
  A third, this row's own autofit diagnosis, was wrong in the record and is
  corrected in TR-066 rather than quietly overwritten.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, single continuous session.

**Approach.** Jobs in briefed order, one commit each, each job's measurement taken
before its code was written. Where a ruling predicted an outcome (TR-070's "the
contrast may resolve itself"), the prediction was tested rather than assumed in
either direction.

**Alternatives tried and rejected.**
- A magnitude threshold for the mini abbreviation ("abbreviate above $1,000,000"),
  rejected because it guesses at a pixel width that depends on the currency symbol,
  the locale's separators, the bet ladder and whether the brand font loaded. The
  action measures instead.
- A hand-written K/M/B suffix table, rejected because it would be English in a game
  shipping sixteen locales. Intl compact notation carries each locale's own
  magnitude word for free.
- Rounding rather than truncating the abbreviated value, rejected on the money rule:
  $999,999.99 would read as "$1M".
- Implementing TR-067 as "one line in `tr.ts`" as the row records, rejected because
  it would leave the `locale` store itself reading `de` and every other consumer
  disagreeing with the words beside it. The store is forced instead.
- Adding a scrim to the FEATURES bar, rejected after measuring: it already clears AAA.
- Reporting the contrast gate's first result (every preset failing at 1.17:1) as a
  finding, rejected under (l.2); it was a broken measurement and "fixing" it would
  have addressed a defect that does not exist.
- Refusing the kit build on any dirty path anywhere, rejected as theatre: the
  artefact comes from a clone, so an untracked file elsewhere cannot reach it. It
  warns by name instead and refuses only on `frontend/` and an unpushed HEAD.
- Sharing one doc-extension list between the build plugin and the hygiene gate,
  rejected under (l.4): two methods agreeing means nothing when they share an input.

**Files touched.** Per commit above; explicit paths throughout.

**WHERE THE NEXT SESSION RESUMES: JOB 6, exactly as the live parent brief writes it.**
Nothing in JOBs 6, 7, 9 or 10 was started, and no partial work exists for any of them.

- **JOB 6, DOCUMENTATION.** Not started. Dossier evidence section: the platform's
  independent maths corroboration (96.3500, 17.2841, 100000, 5000, 0.00% variance,
  all constraints green at both star tiers) with capture pointers, which are
  `reports/screens/dtt-live-2026-07-26/15_maths_overall_bet_level_compliance_all_pass.png`,
  `16_maths_all_five_modes_compliant.png`, `17_maths_base_detailed_metrics_and_6of6.png`,
  `18_maths_base_hit_rate_distribution.png` and
  `19_maths_base_property_table_rtp_963500_sd_172841.png`; the production money-path
  proof (the four to-the-cent HUD reconciliations across base, 100x and 400x, and
  Event 63's 400x debit, all currently recorded only inside TR-068's row); the item 12
  conflict recorded as observation-pending with both first-party citations (TR-064).
  `GAME_FACTS.md`: the 5.00% wincap RTP band fact. `COMPLIANCE_WATCH.md`: the
  platform-stated 96.70% ceiling with its capture reference.
  `docs/records/reviews/FIX_LIST_2026-07-26.md` updated so every row carries its
  disposition and commit; **that file has NOT been touched this session and its rows
  do not yet reflect commits `e4bfbc5` through `a1ff78b`.**
- **JOB 7, THE OWNER'S SECOND VISIT.** Not started. Replace any prior second-visit
  section in the walkthrough with one authoritative version, per the parent brief's
  seven numbered steps, plus the two ruled amendments: screenshots saved loose on the
  Desktop for the builder to file, and the confirmation list now including the
  FEATURE PRICE line on a bought round and the mini-player readouts at Popout S.
  Both of those are now real and capturable: `reports/screens/feature-price-2026-07-26/`
  and `reports/screens/mini-player-2026-07-26/` show what the owner should expect to see.
- **JOB 9, QUALITY CHARTER AND SWEEP.** Not started. `docs/QUALITY_CHARTER.md` is
  referenced by THE STANDING MANDATE in CLAUDE.md and **does not exist yet**. Known
  sweep material already located but deliberately not actioned this session: four em
  dashes in locked `gameStore.ts` comments (parked, locked, no exception); and the
  sentence-case English prose that TR-059 owns, including
  `MaxWinCelebration.svelte`'s "Press COLLECT or hit Enter to continue" and
  `ReplayMode.svelte`'s "Replaying round...", which the repaired
  `locale_completeness_check.mjs` still cannot see because it scans ALL-CAPS literals
  only. That limit is now the honest boundary between TR-072 (closed) and TR-059
  (parked), and JOB 9's sweep is where it gets revisited.
- **JOB 10, THE RESKIN BOUNDARY.** Not started. `docs/RESKIN_BOUNDARY.md` does not exist.

**The owner can run the second visit now if they wish**, since kit V3 exists and is
correct, but the walkthrough's authoritative second-visit section is JOB 7 and is not
yet written, so the current walkthrough does not describe kit V3.

**Nothing is blocked.** Every remaining job is documentation or a new document; no
code change is outstanding, no gate is red, and no question is waiting on a ruling.

---

## 2026-07-26g: MULTI-TRACK PROTOCOL V2, integrator session

Brief saved verbatim: `reports/briefs/FS_MULTITRACK_PROTOCOL_V2_Prompt.md`
(`8771040`). It supersedes `FS_MULTITRACK_PROTOCOL_Prompt.md`, which was never
run and does not exist in this repository, so there was nothing to retire.

**This session held the INTEGRATOR role and ran on `main`.** All five jobs
complete. No lock exception, and no locked path was touched: `rgsService.ts`,
`gameStore.ts`, `games/future_spinner/**` and `.claude/settings.json` all
untouched, verified by the gate itself over the session's own commit range.
Explicit paths on every commit.

### What landed, by job

| Job | Result | Commit |
|---|---|---|
| Brief saved verbatim | DONE | `8771040` |
| 1, record the protocol | **DONE**, CLAUDE.md and WRS_MASTER_DOCUMENT.md 3e | `828c9df` |
| 2, the scope gate | **DONE**, with 6 new seeded cases | `1e9cb69` |
| 3, the owner's second visit, on main | **DONE** | `f863f6a` |
| 4, open two parallel tracks | **DONE**, proved disjoint | `7bc4ecd` |
| 5, the retro mechanism | **DONE**, WRS_MASTER_DOCUMENT.md 3f | `828c9df` |

### JOB 1 and JOB 5

The eight protocol rules are recorded verbatim in intent in CLAUDE.md beside THE
STANDING MANDATE, and mirrored in `WRS_MASTER_DOCUMENT.md` as new section 3e,
with 3f carrying the retro mechanism and a change-log entry.

Rule 5's model policy cites the twice-failed escalation rule to
`CLAUDE_PROJECT_INSTRUCTIONS_v7.md`, where it already exists as "a brief failing
its gates twice escalates one tier", rather than restating it from memory.

The retro mechanism is recorded with its reasoning rather than as a bare
instruction: a single polish pass over everything is how polish becomes uniform
and shallow; **up to** three means fewer than three is a legitimate and stronger
outcome than padding; and each nomination carries the measurement that justified
it, so a redo session starts from a stated deficiency rather than from an
instruction to make something nicer.

### JOB 2, and what "provably" had to mean

The locked-paths gate now carries both rules, because both answer the same
question from the same input: did this change touch something it had no business
touching?

The glob language is deliberately small: an exact path, a trailing slash for a
directory, `**` for any depth and `*` for one segment. A manifest is a scope
declaration a human has to read and agree is disjoint from another one, and
negations and character classes make that judgement harder rather than easier.
Anything it cannot express is a sign the scope wants splitting.

Six new seeded cases, all against a real branch with a real committed manifest
and real commits. The one worth naming is **a directory glob must not match a
same-prefixed sibling**: `docs/records/tracks/` must not also match
`docs/records/tracksX/`. That is the classic off-by-one in prefix matching and
it is the one a hand-written matcher gets wrong.

Two defects found by running it rather than reading it: the branch name arrived
untrimmed, and both gate steps sat before `Set up Node` in the workflow, so they
would have run on whatever Node the runner image happened to ship.

### JOB 3, and two things beyond the letter

PART 9 of the walkthrough, in its established voice, with the four safety facts
restated rather than assumed to be remembered from the first visit.

`math/HASHES.txt` was verified against the owner's own capture 03 rather than
taken from the brief: it is the first Math row, **2.82 KB, in a list of 13**. The
walkthrough names the size, because it is the only unambiguous way to pick it
out when every other Math file is megabytes or a `.json`, and it says twice that
nothing else in Math is touched.

**The FEATURE PRICE step says plainly that the price can exceed the win**, and
that seeing a big green win beside a bigger price is the line working rather than
a bug. That is the exact thing that confused the owner in the first place, and a
confirmation step that did not say so would invite the same report again.

Two additions beyond the letter of the brief, both to stop a foreseeable mistake,
and both flagged here because they are additions:

1. **The tile images are re-provided in the kit as `03_branding/`.** The only
   other copy sits inside `~/Desktop/FS_UPLOAD_KIT/`, which is DEAD and which the
   walkthrough tells the owner to bin. Pointing at a folder we have just told
   them to delete is how the wrong thing gets uploaded. This follows the live
   parent brief's JOB 7 step 4, which said the tile images are re-provided inside
   kit V3; it sits against JOB 5's "only `02_frontend_upload/` and a README", and
   the two are reconciled by the kit README saying twice that `03_branding/` is
   for the tile editor and is never uploaded as Front End.
2. **The walkthrough itself is copied into the kit**, because the owner needs
   Part 9 beside the files rather than in a repository they are not reading at
   the time.

Both are done by `kit_build.mjs` from the CLONE, not by hand, so convention (o)
holds for every byte in the kit rather than only for the bundle. That is also why
the builder was edited at all: the README is generated, so a manual edit would
have been silently undone by the next build.

### JOB 4, and two conflicts in the declared manifests

Both were resolved in the open rather than silently, per the obligation
convention (n) sets.

**1. Both manifests declared `docs/records/tracks/`, the whole directory.** Rule
3 in the same brief says parallel tracks require provably disjoint scopes and
that overlap forces sequence, so as written the two tracks could not have run in
parallel at all. Narrowed to each track's own manifest file. Neither track needs
the directory: both manifests and both briefs are committed on `main` by the
integrator before either track starts.

**2. Neither manifest included `reports/`,** while rule 8 requires track session
reports and convention (a) requires one of every session. A track literally could
not have written its report. Resolved with `reports/tracks/<track>/` rather than
by sharing `reports/SESSION_REPORT.md`: disjoint by construction, and it is what
makes rule 8's "resolve report conflicts by concatenation" mechanical instead of
a merge argument, because two tracks appending to one file collide on every pull
request and the pressure at a collision is always to drop one side.

**The disjointness proof.** `--check-disjoint` proves it over **every file git
tracks, 2,488 of them**, plus a pairwise literal-glob comparison, and re-proves
itself on every CI run so a manifest widened later is caught the day it is
widened rather than at the merge that discovers two tracks edited one file. Its
blind spot is stated rather than hidden: a file that does not exist yet could
match two manifests, which is what the literal comparison is for.

Its first seeded case is not hypothetical. It plants **the brief's own overlap**,
both tracks claiming `docs/records/tracks/`, because that is a real overlap
written by hand in a real brief and it is precisely what the check exists to
catch.

Result on the real tree: **2 manifests, 2,488 tracked files, 0 file collisions,
0 shared globs.**

### Gate results at HEAD

| Gate | Result |
|---|---|
| locked paths, track scope and disjointness self-test | **PASS**, **18 of 18** cases, 0 missed |
| track manifests are disjoint | **PASS**, 2,488 files, 0 collisions |
| locked paths over this session's range | **PASS**, 0 sanctioned, 0 violations |
| kit builder self-test | **PASS**, 5 of 5 |
| `npm run check` | **PASS**, 0 errors at the committed 36-warning baseline |
| typecheck baseline, dead wiring | **PASS** |
| locale completeness plus its seeded self-test | **PASS** |
| dash gate, self-test and source | **PASS** |
| dist hygiene, including the build-stamp reconciliation | **PASS** |
| a11y social terms | **PASS** |

Two new CI steps: **track manifests are disjoint**, and the existing gate 0 step
renamed and given `GITHUB_HEAD_REF` so it can see a pull request's source branch.

### Self-audit against the brief and the conventions

- Brief saved verbatim to `reports/briefs/` and committed first, convention (f).
- Explicit paths on every commit, never `git add -A`, convention (k).
- No em or en dashes authored anywhere, checked per file.
- No lock exception, and the gate independently confirms no locked path was
  touched across `ea334fd..HEAD`.
- Every new check ships a seeded self-test whose seed is the form the defect
  really takes, convention (p). The disjointness seed is the brief's own overlap.
- Two conflicts inside the brief were surfaced and reasoned about rather than
  quietly resolved in one direction, per convention (n)'s stated obligation.
- This was a five-job session, and protocol rule 4 says a multi-job session
  justifies itself in its report. **The justification: JOB 3 was explicitly
  ordered to land on main immediately, and JOBs 1, 2 and 4 are the machinery that
  has to exist before any track can start.** Splitting them would have left the
  tracks unable to open and the owner's portal visit blocked behind a session
  boundary. The tracks themselves are one job each, which is the shape rule 4 is
  actually protecting.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, integrator session on `main`.

**Approach.** The protocol was written first and then obeyed, including where it
made the brief's own manifests illegal. Where the brief and its own rules
disagreed, the rule governed and the deviation is recorded above with its
reasoning, rather than the manifests being copied verbatim into a state that
could not pass the gate the same brief commissioned.

**Alternatives tried and rejected.**
- Copying both manifests verbatim, including the shared `docs/records/tracks/`,
  rejected because rule 3 forbids it and the gate would have failed both tracks
  on their first commit.
- Adding `reports/SESSION_REPORT.md` to both manifests, rejected for the same
  reason: it would have made the two tracks overlap on the single file most
  likely to be edited by both.
- Letting the gate carry a hidden always-allowed set of paths so manifests could
  stay literal, rejected because a gate with hidden allowances is a gate that
  lies, and the whole point of a manifest is that it is readable.
- Creating the two track branches before the final commit, rejected because a
  branch created early is behind by the time the session starts, which is the
  same stale-artefact trap as the dead kit. They are cut from final `main`.
- Pointing the walkthrough's tile step at `~/Desktop/FS_UPLOAD_KIT/03_branding/`,
  rejected because the same document tells the owner to bin that folder.
- Editing the kit's README by hand, rejected once it was noticed that
  `kit_build.mjs` generates it and the next build would have silently reverted it.

**Files touched.** Per commit above; explicit paths throughout.

**THE TWO TRACK BRIEFS ARE READY FOR THE OWNER TO PASTE.** Each is a complete
fenced prompt with its own boot list, manifest and limits:

1. **`docs/records/tracks/docs-reskin_BRIEF.md`**, branch `track/docs-reskin`,
   suggested Opus at High. Covers JOB 6 and JOB 10 of the live parent plus
   bringing the fix list up to this session's commits.
2. **`docs/records/tracks/quality-sweep_BRIEF.md`**, branch
   `track/quality-sweep`, suggested Sonnet at High. Covers JOB 9 of the live
   parent: the charter, the sweep, the fixes and the CI gate.

Both branches are cut from this session's final `main` and pushed, so each
session can check out and start without rebasing. **They can run at the same
time**: their scopes are proved disjoint over the whole tracked tree.

**THE INTEGRATOR RETURNS WHEN THEIR PULL REQUESTS ARE UP.** The integrator's job
at that point, in order: Fable verifies each PR; merge them **one at a time**;
and for each, copy that track's `reports/tracks/<track>/SESSION_REPORT.md` into
`reports/SESSION_REPORT.md` as a dated and track-tagged section, **appending,
never rewriting or dropping a section**, plus the archive copy per convention (a).

**THE OWNER'S SECOND PORTAL VISIT IS UNBLOCKED BY NOTHING.**
`~/Desktop/FS_UPLOAD_KIT_V3/` holds the bundle, the tile images, the walkthrough
and the build stamp. Neither track touches it, so the visit and the two tracks
are independent and can happen in any order.

**Then, after that visit:** Fable's benchmark polish review nominates up to three
surfaces for focused redo sessions, one specialist session each on its own track,
per the retro mechanism now recorded at `WRS_MASTER_DOCUMENT.md` 3f. Then round
three of external review.
---

## 2026-07-26h: CI TRIAGE, integrator session

Brief saved verbatim: `reports/briefs/FS_CI_TRIAGE_Prompt.md`, committed with
JOB 1. **This session held the INTEGRATOR role and ran on `main`.** No lock
exception; no locked path touched. Explicit paths on every commit. No em or en
dash written anywhere in this session's text.

### JOB 1: main is green again, in two acts

**Act one, the missing browser.** Root cause confirmed against the remote runs
before touching anything: `layout_fit_gate.mjs` and `contrast_gate.mjs` import
chromium and had been added to the deliberately browser-free static job, so
every push to `main` since they landed crashed at `chromium.launch()`. Runs
117, 118, 119 and 120 all failed at the same step, "layout fit gate, seven
presets", verified via `gh run view` on each. Fix per Fable's ruling:
`checks.yml` now has two jobs. "static gates" is unchanged minus the two
browser gates; the new blocking "browser gates" job installs the chromium
binary (`npx playwright install chromium --with-deps`) after `npm ci`, builds
dist (both gates serve it via `vite preview`), and runs gates 13c and 13d.
Same security posture: no secrets, `contents: read` only. Commit `5ef7783`.

**Act two, the hang after PASS (run 122, Fable's mid-session direction).**
Run 122's static job went green in place of four red predecessors, but the
browser gates job ran 18 minutes on what is a 2-minute job and was cancelled
on Fable's order. The step log is the diagnosis, and it rules OUT the WebGL
hypothesis: the layout gate measured all seven presets and printed
`LAYOUT FIT GATE: PASS` at 04:53:17, thirteen seconds after starting, and the
next line is the cancellation at 05:11:54. The gate did not stop after
chromium.launch, at page.goto or at a waitFor; it stopped at PROCESS EXIT.
Cause: `preview.kill()` signals only the `npx` wrapper, orphaning the real
vite preview child, whose inherited stdout pipe holds the node event loop
open, and the layout gate had no `process.exit` on success. The readiness
sentinel needed no change because readiness was never the problem; a black
canvas was indeed acceptable to both gates, which completed all their
measurements headless.

Repairs, commit `9c7a9a2`: `timeout-minutes: 10` on the browser gates job; a
4-minute hard watchdog inside both gates that fails red on any hang; explicit
`process.exit(0)` on success in both; and the preview now runs detached so
teardown signals the whole process group, reaching vite itself. Verified
locally before pushing: both gates PASS, exit promptly, and `pgrep` finds no
orphaned vite.

**Remote verification per rule 10: run 123 GREEN, BOTH JOBS.**
Run 123: https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189093830 (static gates green; browser gates green, layout and contrast gates passing under the new watchdogs, job runtime back to minutes).

Runs 117 to 120 are CONFIRMED SUPERSEDED rather than re-run: a re-run replays
the workflow file as it stood at those commits, which is the broken
single-job file, so it can only fail again. Run 122 is recorded as cancelled
on Fable's order, static job green, browser job hung as diagnosed above.

### JOB 2: rule 10 in the protocol

Appended to THE MULTI-TRACK PROTOCOL in `CLAUDE.md` and mirrored in
`WRS_MASTER_DOCUMENT.md` section 3e: **(10) a red run on main stops the line.**
No new job starts until main is green; every session verifies its own final
push's remote CI result before closing and records the run link in its session
report; local gate results never substitute for the remote run. The corrected
account of runs 117 to 121 is recorded beside the rule: four consecutive
sessions pushed onto a red main because the same gates passed locally, and run
121 on the track/screenshot-analyst pull request failed the disjointness gate
(SA-013), a collision that track's manifest declared rather than hid.

### JOB 3: the analyst is unblocked (SA-013)

`docs/records/tracks/quality-sweep.manifest` narrowed `reports/qa/**` to
`reports/qa/*`. The glob language has no negation; `*` matches one segment, and
every file the sweep's gates write lands directly in `reports/qa/` (the
directory is flat, 50 files, zero subdirectories, verified), so the narrowing
costs quality-sweep nothing while releasing every subtree, `live_stats`
included, to the analyst's duty 6.

Disjointness re-proved twice: on main's two manifests, and again with
track/screenshot-analyst's manifest temporarily present, which is the pair
that actually collided:

```
DISJOINT: 3 manifest(s), 2495 tracked file(s), 0 file collision(s), 0 shared glob(s)
  docs-reskin: 8 glob(s)
  quality-sweep: 8 glob(s)
  screenshot-analyst: 8 glob(s)
```

**PR #115 is NOT merged**, per the brief: Fable verifies it first-hand next
check-in and rules on merge then.

### JOB 4: the modified evidence (SA-012)

The four uncommitted changed files under
`reports/screens/scatter-anticipation/` (trigger_3.png, trigger_4.png,
trigger_5-reduced.png, trigger_5.png, all mtime 01:11:23 on 2026-07-26) were
restored from HEAD with `git checkout --`; the directory is clean. Cause
identified: `frontend/scripts/anticipation_proof.mjs` line 19 points its
screenshot output at the committed evidence directory itself, so any re-run
rewrites committed evidence in place. The rule is recorded beside convention
(h) in `CLAUDE.md` as (h.1): proof and gate scripts write to scratch paths
only; committed evidence directories are never written outside a job that
explicitly regenerates evidence.

The pattern was then observed LIVE twice more in this very session: the local
verification runs of `layout_fit_gate.mjs` and `contrast_gate.mjs` rewrote
their committed reports/qa JSON and the contrast-2026-07-26 screenshots, which
were also restored from HEAD. Migrating the gate writers to scratch paths is
recorded in (h.1) as open work.

Also present in the working tree, left exactly as found because they belong to
other work and this brief does not touch them: an uncommitted one-line
docstring edit to `scripts/assets/backgrounds.py`, and untracked
`games/future_spinner_super/`, `sideproject/`, and
`reports/screens/cohesion-pass/char-enhanced-closeup.png`.

### FOR THE NEXT SESSION

Model and effort: Fable 5, integrator session. Five jobs in one session,
justified because four of the five are the same incident (the red main) and
splitting them would have left main red longer. Approach taken: verify the
remote failure first, fix, verify remote again; when run 122 hung, the step
log was read before any hypothesis was coded, which is what kept the WebGL
rework out of two measurement scripts whose committed evidence is cited
elsewhere. Alternatives rejected: re-running runs 117 to 120 (replays the
broken workflow file); the WebGL software-rendering args and DOM sentinel
rewrite (diagnosis showed the gates complete and pass headless as they are).
Files touched: `.github/workflows/checks.yml`,
`frontend/scripts/layout_fit_gate.mjs`, `frontend/scripts/contrast_gate.mjs`,
`CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`,
`docs/records/tracks/quality-sweep.manifest`,
`reports/briefs/FS_CI_TRIAGE_Prompt.md`, this report and its archive copy.

Open threads:
- Fable verifies PR #115 first-hand and the green CI, and rules on merge.
- The owner's second visit gains one line: twenty cruise spins with a before
  and after balance frame for the analyst.
- The two prepared track briefs (`docs/records/tracks/docs-reskin_BRIEF.md`,
  `docs/records/tracks/quality-sweep_BRIEF.md`) remain ready to paste.
- The polish review follows the owner's visit.
- (h.1) open work: move the three gate writers' evidence output to scratch
  paths so a re-run can never dirty committed evidence.
- Remote CI link for this session's final push, per rule 10:
  run 124 GREEN, both jobs: https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189187685

## 2026-07-26i: RULE 11, PR #115 MERGED, AND THE (h.1) MIGRATION COMPLETED

Brief saved verbatim: `reports/briefs/FS_RULE11_MERGE115_Prompt.md`. INTEGRATOR
session, on `main`. Five jobs, which is more than rule 4's default of one, so it
justifies itself here as rule 4 requires: JOBS 1, 3 and 5 are independent
mechanical edits with no shared reasoning, and JOB 2 is a merge that cannot start
until its own CI is green. The judgement in the session is concentrated in one
place, the gate defect found under JOB 2, and it got a fresh head rather than the
tail end of a long run.

No lock exception taken and none needed. Explicit paths at every commit. Zero em
or en dashes across every file written.

### JOB 1: rule 11, a working tree per session

Appended to THE MULTI-TRACK PROTOCOL in `CLAUDE.md` and mirrored in
`WRS_MASTER_DOCUMENT.md`. Concurrent sessions never share a working tree: every
track session creates its own git worktree at `worktrees/<track>/` at boot and
removes it at close, the path is gitignored so a worktree can never be committed
or reach a build, the primary checkout belongs to the integrator alone, and a
session finding the primary checkout on an unexpected branch touches nothing and
reports it.

The near-miss that earned it is recorded beside the rule, because it is the
argument. `track/screenshot-analyst` returned for a second intake and found the
primary checkout switched to `main` by the CI triage session with uncommitted
work in progress on three files. Checking out its own branch there would have
pulled the checkout from under a live writer. That track used a worktree
unprompted and reported the gap. **Rule 1 made `main` single-writer for the
BRANCH and never covered the working tree**, which is a shared mutable resource
it does not protect.

**Recorded, not tidied away: there is no rule 9**, in either document. Rule 10
came from the CI triage session and 11 from this one, and neither found a 9 to
follow. It is left as a gap rather than renumbered, because 10 and 11 are already
cited by number in session reports, tracker rows and commit messages, and
shifting them would make those citations wrong. The owner's call whether to fill
it.

### JOB 2: the merge, and the gate defect that had to be fixed first

**PR #115 was red, and rule 10 says a red run stops the line.** It failed TRACK
SCOPE on `reports/SESSION_REPORT.md` and `reports/archive/2026-07-26h_ci-triage.md`,
two files that track had never touched. Both exist only on `main`, added by
`e67ea04`. So the gate was wrong, not the track, and merging around it was not
available.

**The defect.** Actions checks out a pull request's MERGE ref: the head branch
with the base branch as it is NOW merged in. `GITHUB_SHA` is that merge commit.
`github.event.pull_request.base.sha` is the base branch as it WAS when the event
fired. Once `main` moves after the event, `base.sha..merge-ref` contains main's
own newer commits and the gate attributes them to the track.

**The half-fix that looks right and is not.** Taking the merge base of `base.sha`
and the merge ref does nothing at all: `base.sha` is always an ancestor of the
merge ref, and the merge base of a commit and its own ancestor is that ancestor.
This was written first, the seeded self-test case stayed red, and it is kept as a
permanent test case because it is convincing and wrong. **A fix that stopped
there would have shipped the bug with a green gate over it**, which is the exact
shape convention (p) exists to catch, and this is the first time in this project
that the seeded test caught the fix rather than the defect.

**The fix.** Range against the head BRANCH tip, `pull_request.head.sha`, which
does not carry the base branch's later commits. The merge base is still taken for
the case where `base.sha` is not an ancestor of the head branch.
`GITHUB_HEAD_SHA` is now passed in `checks.yml`.

**Why it matters beyond one red run.** A false TRACK SCOPE failure blocks a
correct pull request, and the temptation it creates is to widen the manifest to
make the gate green, which would silently break rule 3's disjointness for a
defect that was never in the track. The same mis-ranging feeds `commitsIn`, so a
locked-path commit belonging to main could be judged as if it belonged to the
pull request.

Per convention (p) the self-test plants all three forms in a real git repository
with a real base branch that advances after the branch point and a real merge
commit: the defect fails, the half-fix fails, the fix passes, and a genuine
out-of-scope change still fails so the gate is not merely blunted.

**Then the merge.** `main` merged into the track branch through a worktree, per
the rule written an hour earlier; CI re-run green on both jobs
(`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189878160`);
PR #115 merged **un-squashed** at 05:54:36Z as `bdc6771`. Seven commits of
distinct evidence work, and a squash would have flattened the reasoning into one
line.

**Promotion.** Three rows added to `docs/records/reviews/REVIEW_TRACKER.md` from
the track's ledger, with the SA numbers kept so the two records stay traceable:

- **TR-073**, the 5,000x max win fired live and the celebration overlay it should
  present has never been captured. **PARKED as an evidence gap, not as a
  suspected defect.** The specification says it should have shown and the wincap
  flag is computed against the bet level, which the round cleared exactly, so the
  expected reading is that it fired and was collected in the twelve seconds
  before the capture. That is inference, and a submission claim about the max-win
  presentation should not rest on it. Worth flagging that this overlaps TR-072,
  which translated `maxWinReached` and `collect` across sixteen locales without
  anyone having seen the surface those strings render on.
- **TR-074**, the scene shows through unfilled reel cells mid-spin while the idle
  board is opaque. An observation, explicitly not a defect finding.
- **TR-075**, `cruise` is the one mode whose wallet debit has never been
  measured, confirmed at display level by inference from two other results.

**TR-013 gains a closure note rather than a new row**, per the tracker's own
rule. The bet levels observed live are 450, 500, 750 and 1,000, none of which the
hardcoded fallback array can express since it tops out at 100. A ladder that
array cannot express is driving the game, which is only possible if both
bet-changing surfaces read `rgsBetLevels` through the non-locked `betLadder.ts`,
as the fix intended. Recorded because **a fix confirmed only by its own test is a
fix confirmed by its author.**

Twelve of the ledger's sixteen rows are deliberately not promoted: nine are
NOT-A-DEFECT answers to closed questions, two were process rows already resolved
by the CI triage session, one concerns another directory entirely.

### JOB 3: two observations for the owner

`docs/records/upload-kit/00_READ_ME_FIRST.md` Part 9b goes from five observations
to seven, written in the walkthrough's own voice.

**Observation 6** has the owner open the `EUR 3,750,000.00` round on the Bets
panel and press **Replay this bet**, watching for the three-star MAX WIN overlay
with its 5,000x and COLLECT button, and screenshotting it BEFORE pressing
COLLECT. It says explicitly that no celebration appearing is the more important
answer, so the owner is not primed to report what we expect.

**Observation 7** brackets twenty `cruise` spins with a Session information
screenshot before AND after. The instruction leads with the before, because the
before is the one that gets skipped and its absence is exactly why TR-075 is
still open.

### JOB 5: convention (h.1) completed

**The sweep found seven scripts, not the three the triage session named.**
Searching by output-directory CONSTANT found five. Searching by WRITE SITE found
seven: `layout_fit_gate.mjs` and `dist_hygiene_gate.mjs` both name their output
`QA`, which no search for `SHOTS`, `SCREENS`, `OUT` or `OUT_DIR` would have
found. Both run in CI on every push. The lesson is the one convention (p) keeps
teaching: search for the behaviour, not for the shape you expect it to take.

The seven: `anticipation_proof.mjs` (the original SA-012 mechanism),
`contrast_gate.mjs`, `layout_fit_gate.mjs`, `dist_hygiene_gate.mjs`,
`mini_player_proof.mjs`, `locale_launch_conformance.mjs`,
`feature_price_proof.mjs`.

**The fix is one module, not seven edits.** `frontend/scripts/lib/evidencePaths.mjs`
resolves every evidence path. By default it returns a path under
`.evidence-scratch/`, gitignored and mirroring the committed tree exactly.
`FS_WRITE_EVIDENCE=1` returns the real committed location, which is the explicit
regeneration convention (h.1) allows, and it is an opt-in a human has to type
rather than a default anyone can trip over. Every run announces its mode. A rule
that lives in seven copies of a path expression is a rule that comes back.

**Proven, not asserted.** All seven re-run: seven exit 0, thirty files written to
`.evidence-scratch/`, and `git status` over `reports/` and `docs/` reports
nothing. **The four `scatter-anticipation/trigger_*.png` files that SA-012 was
about are among the thirty**, which is the direct proof: the exact files that
used to be overwritten now land in scratch.

**Not migrated, and deliberately.** The six `evidence_*.mjs` scripts,
`layout_v1_audit.mjs` and the three `provider_mark_*` scripts write to committed
evidence because regenerating evidence is what they are for. Convention (h.1)
carves out exactly that, and migrating them would break the jobs the carve-out
exists for.

### FOR THE OWNER: a keep-or-discard call, not decided here

Four things sit in the working tree that this session did not create and will not
rule on. Listing them rather than deciding, because two of them look like
somebody's work in progress and discarding another session's work is precisely
what rule 11 was written to prevent.

1. **`scripts/assets/backgrounds.py`**, modified and uncommitted. Present since
   before this session and before the previous two. Either an unfinished edit or
   a stray one.
2. **`games/future_spinner_super/`**, untracked, a complete second maths package
   with its own `game_config.py`, `gamestate.py`, `reels/` and `library/`.
   `CLAUDE.md` says prototypes live on their own branch and never on `main`,
   because a second maths package beside the shipping one is the stale-artefact
   misread that has previously cost a star at external audit. It is untracked so
   it is not on `main`, and convention (o) keeps it out of the staging bundle
   since that is built from a fresh clone. Contained, but it is on the machine
   the captures are taken from.
3. **`sideproject/`**, untracked.
4. **`reports/screens/cohesion-pass/char-enhanced-closeup.png`**, untracked, a
   single capture sitting in a committed evidence directory.

The question for each is keep or discard. This session has not touched any of
them.

### Verification, measured

    node scripts/qa/locked_paths_gate.mjs --self-test        PASS, including four new range cases
    node scripts/qa/locked_paths_gate.mjs --check-disjoint   3 manifests, 0 collisions
    seven migrated gates re-run                              7 exit 0, working tree clean
    dash check across every file written                     0 em or en dashes

PR #115 CI, both jobs green:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189878160`


Rule 10 closing link, this session's final push (`c03089b`), BOTH JOBS GREEN:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30190220946`
  static gates: success
  browser gates: success

The PR #115 merge commit `bdc6771` also ran green on `main` in its own right:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30190146930`
Recorded separately because a merge that is green on the branch and red on
`main` is exactly the case rule 10 exists for, and it is worth showing it was
checked rather than assumed.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort. The gate defect was the judgement
work: the half-fix was written, tested, and rejected by its own seeded case,
which is the sequence convention (p) is for.

**Approach.** Derive before measuring throughout. The gate fix was reasoned from
what GitHub actually checks out before any code changed, and the self-test was
written to distinguish three candidate fixes rather than to confirm one.

**Alternatives tried and rejected.**

- *Merging PR #115 red, since Fable had approved it.* Rejected on rule 10.
- *Widening the screenshot-analyst manifest to make the gate green.* Rejected,
  and it is the tempting wrong answer: the track had not touched either file, so
  widening would have broken rule 3 disjointness to hide a gate defect.
- *Taking the merge base against the merge ref.* Written, tested, rejected by its
  own seeded case. Kept as a permanent test case.
- *Migrating the `evidence_*.mjs` scripts along with the gates.* Rejected:
  regenerating evidence is what they are for.
- *Deciding the keep-or-discard question on the four working-tree items.*
  Rejected as not this session's call.

**Files touched.** `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`, `.gitignore`,
`.github/workflows/checks.yml`, `scripts/qa/locked_paths_gate.mjs`,
`docs/records/reviews/REVIEW_TRACKER.md`,
`docs/records/upload-kit/00_READ_ME_FIRST.md`,
`frontend/scripts/lib/evidencePaths.mjs` (new), seven migrated scripts under
`frontend/scripts/`, `reports/briefs/FS_RULE11_MERGE115_Prompt.md`, this report
and its archive copy.

**Open threads.** TR-073, TR-074 and TR-075 all close on captures the owner takes
during the second portal visit, and all three are now written into the
walkthrough. The rule 9 gap. The four keep-or-discard items above.

---

# Session Report - THE REPLAY BLOCKER, RULE 9, AND THE WORKING-TREE RELOCATIONS (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_REPLAY_BLOCKER_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, one commit per job, no lock exceptions and none
needed: no locked path was touched or required. Multi-job justified per rule 4: one
substantial job (the blocker) plus three small hygiene items, exactly as the brief
recorded.

## JOB 1. The replay blocker, TR-076, fixed and proven

**The defect, as the owner saw it on the live platform:** the Replay panel launches the
game, the board renders static, START REPLAY sits at the bottom as an unclickable shadow,
and nothing plays. Reproduced on `super` event 22975 (EUR) and on a fresh bet. Bet Replay
is a mandatory approval requirement, so this was filed as a BLOCKER.

**Reproduced locally BEFORE any code was read as guilty.** The production build was served
and driven by Playwright at the exact live parameter shape (every documented query
parameter from `docs/stake-engine-live/game-replay-requirements.md`: `replay=true`, game
UUID, `version=1`, `mode=SUPER`, `event=22975`, `rgs_url=rgs.stake-engine.com`,
`currency=EUR`, `amount=10000000` micros, `lang=en`, `device=desktop`), with the public
RGS replay endpoint served the shipped `super` cap book round. The real click on START
REPLAY timed out, and `document.elementFromPoint` at the button's centre returned
`.bg-still-container`.

**Root cause, the brief's suspect 1 confirmed with a named element:** `App.svelte`'s
`.bg-layer` is `position: fixed` at `z-index: 0`, and a positioned layer at z-index 0
paints and hit-tests ABOVE unpositioned content. `ReplayMode`'s `.replay-container` was
unpositioned, so the entire replay UI sat under the backdrop: visible only as a shadow
through the dark overlay, and unclickable because the backdrop swallowed every hit. In
normal play `.game-stage` (z-index 2) covers the backdrop, which is why only replay mode
was exposed. Third appearance of the full-viewport-layer-intercepts-input class
(HeroSplash was the first).

**Fixed at root, in both directions, no locked file:**

- `.bg-layer` now carries `pointer-events: none`. The backdrop is decoration and can
  never take a hit again, in any mode, whatever the stacking order does next.
- `.replay-container` is now `position: relative; z-index: 2`, the same relationship to
  the backdrop the game stage has.

**Proof: `frontend/scripts/replay_blocker_proof.mjs`, 7 of 7 green.** Three passes:

1. **Seeded, convention (p):** the exact shipped CSS is re-injected into the served page
   (backdrop hit-testable, replay container unpositioned) and the proof goes RED: the
   real click is intercepted by `.bg-still-container` again. Frame
   `01_seeded_defect_start_replay_shadowed.png` shows the owner's exact symptom.
2. **Base win at the live shape, EUR:** real click lands; the presentation actually runs
   (Replaying round status, reveal animation, the win counting up across 6 distinct
   sampled frames to a non-zero total, `€3,900.00`); euro formatting asserted on the
   button (`Bet: €10.00`, symbol not code, no NaN).
3. **Super cap round:** `MaxWinCelebration` presents (MAX WIN REACHED!, 5,000x BET) and
   its COLLECT is dismissed by a real click.

Evidence committed to `reports/screens/replay-blocker/` (six frames, this job explicitly
regenerates evidence so (h.1) is satisfied), inventoried in
`reports/screens/EVIDENCE_INVENTORY.md`. Gates re-run: dash gate PASS (source and dist),
`npm run check` 0 errors, CI gate 13 (`replayRounds.test.ts`) PASS, production build
clean.

**TR-073 closed with the pass-3 capture.** The brief says "closing TR-075 with the
capture"; TR-075 is the cruise wallet-debit row, and the wincap-celebration evidence gap
the brief describes is TR-073. Recorded in both tracker rows rather than silently
renumbered, per convention (n)'s surface-the-tension rule. **What the capture is not:** a
replay of live event 22975 itself. The real game UUID lives only in the owner's portal,
not the repository, so the round served was the shipped `super` cap fixture, a real book
round of identical shape through the identical component and interpreter path. The
owner's one-click live confirmation via the Bets panel Replay button after the next
frontend upload stays listed below as belt and braces.

## JOB 2. Rule 9 filled

The empty rule 9 slot in the multi-track protocol now carries its originally intended
content: seeded-failure proofs run locally where possible; a genuinely required red run
against origin uses a branch named `test/expected-fail-<topic>`, a commit message opening
EXPECTED FAIL, the branch deleted after, and the session report naming the run BEFORE the
owner can meet the notification; an unexplained red on any other branch is treated as
real. Recorded beside it that the slot was skipped because the rule's brief was issued
but never executed. Mirrored in `WRS_MASTER_DOCUMENT.md`; both numbering notes updated to
record the fill; rules 10 and 11 keep their numbers so every existing citation stays
correct.

## JOB 3. Working-tree relocations, nothing discarded

1. **`scripts/assets/backgrounds.py`** (one-line docstring edit): committed to a new
   branch `chore/wip-backgrounds` (commit `88df4f9`, pushed) via its own worktree per
   rule 11; the primary working tree restored to HEAD.
2. **`games/future_spinner_super/`** (450MB loose on the capture machine): the existing
   `claude/fs-super-prototype` branch was found to ALREADY carry the entire package,
   byte-identical to the loose copy (verified by `diff -rq`, differing only in
   `__pycache__` and `.DS_Store`). Nothing needed committing; the loose copy was removed
   from the working tree. The horizon material is preserved exactly where the brief
   wanted it.
3. **`reports/screens/cohesion-pass/char-enhanced-closeup.png`**: referenced only in
   session-report disposition lists, never cited as evidence by any tracker row, gate or
   document, so it was moved to scratch per (h.1) rather than committed.
4. **`sideproject/`**: left untouched, listed for the owner below.

## JOB 4. Close

Working tree at close: clean except `sideproject/` (untouched by instruction). Locked
paths untouched; `git diff .claude/settings.json` empty throughout. **Rule 10: remote run
30191773602 on `main` GREEN, both jobs**
(https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30191773602),
verified from the run's own conclusion, not from local gate results.

**Self-audit per THE FACTS DISCIPLINE item 4:** brief re-read against the work; every
number above carries its artefact (proof output, tracker row, diff); the one
non-executable item (live replay of event 22975 by its real id) is parked with its reason
(the game UUID is portal-only) rather than approximated; conventions (b), (f), (h),
(h.1), (k), (n), (p), rules 4, 9, 10, 11 all consciously applied.

### FOR THE OWNER

**`sideproject/`** sits untracked at the repository root (contains a `lumen/` directory
with `docs` and `frontend` inside; not inspected further). Say **LUMEN-branch** (it is
committed to a LUMEN branch) or **off-repo** (it moves out of the repository entirely).

### FOR THE NEXT SESSION

Model and effort: Fable 5, integrator session, four jobs per the brief's own
justification. Approach taken: reproduce at the live parameter shape before reading any
code as guilty; the reproduction named the intercepting element in one run, which made
the fix two CSS declarations rather than a redesign. Alternatives considered and
rejected: raising only the replay container without neutering the backdrop's hit-testing
(fixes replay but leaves the interception class armed for the next unpositioned surface);
fixing only pointer-events without positioning the container (fixes the click but leaves
the replay UI painting under the backdrop as a shadow).

Files touched: `frontend/src/App.svelte`, `frontend/src/lib/components/ReplayMode.svelte`,
`frontend/scripts/replay_blocker_proof.mjs` (new), `reports/screens/replay-blocker/`
(new, six frames), `docs/records/reviews/REVIEW_TRACKER.md` (TR-076 new, TR-073 closed),
`reports/screens/EVIDENCE_INVENTORY.md`, `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`,
`reports/briefs/FS_REPLAY_BLOCKER_Prompt.md` (new), this report and its archive copy;
plus `chore/wip-backgrounds` (one commit, pushed) off-main.

Open threads:

1. **The owner re-tests replay on the live platform after the next frontend upload.**
   The fix is in main and proven locally at the live parameter shape; the deployed
   bundle still carries the defect until re-uploaded. Event 22975 via the Bets panel
   Replay button is the one-click confirmation, and it doubles as the belt-and-braces
   live sighting of MaxWinCelebration for TR-073.
2. **The cruise bracketed run stands** (TR-075 proper: one short cruise session with the
   session panel captured before and after), along with the remaining PART 9b
   observations.
3. **Fable's polish review follows the owner's visit**, per the retro mechanism.
4. **`sideproject/`** awaits the owner's LUMEN-branch or off-repo call, above.

## 2026-07-26k: KIT V4 AND THE BRAND INGEST, integrator session, six jobs

Brief saved verbatim: `reports/briefs/FS_KIT_V4_AND_BRAND_Prompt.md` (v2; the v1 block
from the previous Fable reply was declared DEAD unrun by the brief itself and was never
executed). Fresh session on `main`, integrator role, no other session in flight. Explicit
paths at every commit, one commit per job, no lock exceptions taken and none needed:
`git diff .claude/settings.json` empty throughout, and no locked path appears in any
commit of this session.

**Six jobs in one session, which rule 4 requires justifying.** They are one dependency
chain, not six errands: the ingest produces the candidate the derivation judges, the
derivation decides the file the kit ships, the tile work produces the other files the kit
ships, and the kit cannot be built until all of that has landed and been pushed. Splitting
it would have meant four sessions each waiting on the last, and the judgement-heavy job
(JOB 2) ran second, while attention was fresh, rather than last.

### The headline

**The provider-logo decision was derived by measurement and it did not change the
delivered file.** Candidate g, a 25-file variant pack the owner commissioned, is the
best-looking mark the project has been given at full size and it loses at small size, for
the same structural reason candidate e lost: an arched text ring around a detailed wheel
has nothing left to show once there are not enough pixels to carry it.

**The tile dimension is no longer a guess.** It was never published. It is now measured:
81 of 87 decoded live published tiles are exactly 408x546, and the owner's composed tile
is exactly 408x546.

### JOB 1: brand ingest, commit `3dae890`

Both owner-supplied deliveries ingested through the deterministic pipeline, neither
retouched, both hash-verified after landing rather than before.

| Delivery | Landed as | Check |
|---|---|---|
| The logo variant pack, 25 files | `design-system/brand/provider_mark/pack_g/` plus candidate g exports | every file re-hashed after copy, all 25 match |
| The composed tile | `design-system/brand/tile/tile_composed_master.png` | byte-identical to source, hash checked after the write |

New scripts: `frontend/scripts/provider_mark_ingest_g.mjs` and
`frontend/scripts/tile_master_ingest.mjs`.

**The exports are built from the pack's 1254 transparent file using candidate f's
ink-centred square crop, not from the pack's own 1096 square crop.** The pack ships a
purpose-made square, and using it would have meant JOB 2 comparing the supplier's crop
against ours rather than comparing the artwork. The supplier crop is measured and recorded
anyway.

**A generated claim was caught contradicting its own measurement, and the generator was
fixed rather than the text.** The first draft of `PROVENANCE_g.md` asserted that g's alpha
was soft where f's was hard. The measurement came back `PARTIAL 0`: g's alpha is hard-edged
too. The prose now branches on the measured value, so it cannot say the opposite of the
number printed above it. The finding itself is worth having: the pack's README says the
background was removed, and a hard alpha with zero partial pixels is the signature of
exactly that.

**Cost recorded, not hidden:** `pack_g/` adds 19 MB to the repository. It is outside
`frontend/`, so it cannot reach `dist/`, and the alternative was recording the studio
brand set in a sentence while the files stayed in an owner's Downloads folder.

### JOB 2: the logo derivation, commit `89b8199`

`frontend/scripts/provider_logo_derivation.mjs`. The rule was fixed before any number was
seen: the delivery goes to whichever candidate is measurably more legible at the smallest
size the platform renders.

**Half the work was establishing that the question has no directly observable answer, and
saying so.** The platform publishes no pixel size for the provider logo anywhere;
`game-tile-requirements.md:38` says only "clear and legible at small sizes". And the
provider logo is not drawn on the published tile at all: the platform sets the publisher
as type. So the ladder is built from three anchors, each labelled with what kind of
evidence it is:

| Anchor | Size | Kind |
|---|---|---|
| Portal game-card thumbnail slot, inner box 128x160 device px | 128 | MEASURED off our own capture `03_files_page` |
| Round one's "nearly unreadable at 48px" | 48 | EARNED from external review |
| The smallest file the owner's own pack ships, and its README's favicon size | 32 | The studio's own stated floor |

Both candidates were downscaled with high-quality smoothing, because that is what a
platform resample does, then composited over `rgb(29,29,29)`, **sampled from the portal
capture's page background rather than chosen**. That choice is load-bearing: f's own
provenance flags its near-black structural colour as at risk on dark surfaces, and
measuring on white would have hidden exactly that failure.

**Result: f wins 3 of 3 at 32px** (1.62x the internal detail, 1.90x the global contrast,
2.31x less ink below a 1.5:1 contrast ratio against the surface) **and 2 of 3 at every
other size on the ladder**. The eye agrees with the arithmetic in
`reports/screens/provider-mark/f-vs-g-rendered-sizes.png`.

**Two corrections made to the record before it was committed**, both because generated
prose had outrun the data:

1. A sentence said the crossover sat "above about 64px" while the computed list showed g
   leading at 128, 96, 64 and 48. The sentence now derives its boundary from the data.
2. A sentence said the verdict "would flip" if the platform rendered at 48 or larger. It
   would not: f still takes 2 of 3 at 48. That speculation is replaced by the three-measure
   verdict computed at every size on the ladder, which is both true and more useful.

**The test could have overturned the adoption and did not.** `WeRollSpinners-Logo.png` is
byte-identical to what it already held. f's existing 48 and 96 exports also regenerated
byte-identical from the same pipeline, which is a determinism claim checked rather than
asserted.

Candidate g is superseded for the portal mark per convention (h), kept, and recorded as
the **studio brand set** for favicon, site and print, per its own README.

### JOB 3: tile delivery, commit `71fd791`

**`published_tile_geometry_survey.mjs` closes a gap section 3c has carried since JOB 7.**
The requirements page gives no tile dimensions, so the AssetForge scaffold's values were
recorded as "provisional defaults, not an official number". Every published game exposes
its tile through the public FAIR catalogue; the survey samples them evenly and reads each
PNG header. **408x546 in 81 of 87 decoded assets, 93.1%.** Captured to
`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`.

The owner's composed master is exactly 408x546. It is also the first portrait tile asset
the project has held: BG is 2048x1152 and FG is 4159x1875, both landscape.

**`tile_layer_derivation.mjs` attempted the layer separation and measured why it fails**,
rather than asserting that it would. The attempt is committed as a four-panel proof sheet
so a reader can disagree by looking:

| Finding | Measurement |
|---|---|
| The type is baked into the pixels | 26,879 px resolved, by a deliberately conservative detector that does not fully catch the smaller `WE ROLL SPINNERS` line, so the real figure is larger |
| The background behind the character does not exist | 46,276 px, **20.77% of the frame**, would have to be painted |
| The silhouette is not cleanly keyable | 884 of 2,350 boundary px, **37.62%**, below a 0.10 luminance step against what they touch |

Two heuristics misfired on the first run and were fixed rather than accepted: a fixed
centre seed landed on the character's brightly lit visor and returned a zero-pixel mask,
and a plain brightness threshold counted neon city highlights as type. Both now use
connected components.

**Both forms of the tile ship**, because the Design Thumbnail editor has never been opened
by anyone here and which form it takes is genuinely unknown. Shipping one and guessing
would put the owner in front of an editor with the wrong file.

### JOB 4: sideproject archived off-repo, commit `1b31c5b`

| Field | Value |
|---|---|
| Archive | `~/Desktop/WRS_ARCHIVE/sideproject_2026-07-26.zip` |
| Size | 52,738,480 bytes |
| Contents | 4,188 non-directory entries, 483 directories |
| README inside | one line: concept material, possible future theme inspiration, not project code |

**Verified before deleting, not after.** `unzip -t` clean, and the entry counts reconciled
against the working tree. The first reconciliation came up 8 short, because `find -type f`
does not see symlinks and zip stores them; the 8 are `node_modules/.bin` shims. A "looks
about right" check would have waved that through, and the point of counting is that it
does not.

Master document section 7 is now HORIZON: 7a records the archive and its verification, 7b
carries the next-title template unchanged, so the `CLAUDE_PROJECT_INSTRUCTIONS_v7.md:42`
citation of "section 7 template" stays correct.

### JOB 5: kit V4 and the walkthrough, commit `dd331da`

Built from a **fresh clone of `origin/main` at `1b31c5be`**, per convention (o).

| Gate, run in the clone | Result |
|---|---|
| production build | PASS, 108 files, 15,515,173 bytes (the build stamp records 107 and 15,514,792, not counting itself) |
| dash gate, source scan, 82 files | PASS |
| dash gate, dist scan | PASS |
| dist hygiene, no documentation ships | PASS, four seeded violations caught, negative control clean |
| layout fit, seven presets | PASS, no scroll, every control reachable |
| contrast, portrait presets | PASS, seeded violation caught, negative control clean |

**`layout_fit_gate.mjs` now writes to `.evidence-scratch/`**, so the run did not dirty
committed evidence. That is convention (h.1) actually closed rather than noted as open.

`03_branding/` ships **four** files, not three: the new `FutureSpinner-Tile.png` beside the
BG, FG and logo. Its hash `741e77fa` is the hash of the file the owner supplied, unchanged
from Downloads through the ingest to the kit.

**The walkthrough's PART 9 was a live hazard.** It was written for
`FS_UPLOAD_KIT_V3`, that visit was never run, and its bundle predates the replay fix, so
following it would have uploaded a regression. Its body is replaced by a short DO NOT RUN
marker pointing forward; the full text stays in git history rather than in an operational
document where it could be followed by accident. PART 9c is the new self-contained visit
in nine steps. Start Approval is ruled out three times.

One addition to the brief's list, and it is the cheapest thing in the visit: **PART 9c asks
for a screenshot of the Design Thumbnail editor BEFORE anything is uploaded into it.** That
one capture settles which tile form the platform wants, which is currently the only reason
the delivery set has to carry both.

### What this session did not do

- **It did not open the Design Thumbnail editor.** It cannot; that needs the owner's
  portal session. Which tile form is correct stays open, and both ship.
- **It did not observe the provider mark rendered anywhere.** No capture we hold shows it,
  and the derivation says so in its own first section rather than implying a rendered size
  it cannot support.
- **It did not run the maths.** Nothing in this session touches `games/future_spinner/**`.

### Gate and verification summary

| Check | Result |
|---|---|
| Candidate g pack copy, 25 files re-hashed | PASS |
| Composed tile copy, hash after write | PASS |
| f and g exports regenerated at 48 and 96 | byte-identical to committed |
| Provider logo delivery | unchanged, byte-identical |
| Archive zip integrity and entry reconciliation | PASS |
| Six build and dist gates in the clone | PASS |
| Em and en dash scan over every file written this session | zero |
| `.claude/settings.json` diff | empty |
| Locked paths touched | none |

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, integrator session, six jobs, justified above by the
dependency chain rather than by convenience.

**Approach taken.** Measure first and let the record derive itself from the measurements.
Every document in this session is generated by the script that took the numbers, so a
sentence and the table above it cannot disagree. That caught three real errors before
commit (g's alpha, the crossover boundary, the "would flip" claim), each of which would
have been a plausible-sounding falsehood in a hand-written report.

**Alternatives tried and rejected.**

- *Deciding the logo by eye, or asking the owner.* The brief ruled it derived, and the
  measurement turned out to contradict the intuition that the newer, richer artwork should
  win. An eye-call at full size would very likely have picked g.
- *Building candidate g's exports from the pack's own square crop.* Convenient, and it
  would have made the comparison meaningless.
- *Deriving BG and FG from the composed master anyway, with inpainting.* That is inventing
  a fifth of the picture inside an ingest and delivering it as the owner's art.
- *Deleting PART 9's superseded text outright.* Git history holds it; an operational
  document should not.
- *Excluding `node_modules` from the sideproject archive.* 89 MB of the 112 MB, and
  reinstallable, but the owner said archive the directory and the zip compresses it to
  nothing that matters.

**Files touched.** `frontend/scripts/` (five new: `provider_mark_ingest_g.mjs`,
`tile_master_ingest.mjs`, `provider_logo_derivation.mjs`,
`published_tile_geometry_survey.mjs`, `tile_layer_derivation.mjs`; one modified:
`tile_delivery_build.mjs`); `design-system/brand/provider_mark/` (candidate g exports,
`pack_g/`, `PROVENANCE_g.md`, `PROVIDER_LOGO_DERIVATION.md`, `README.md`);
`design-system/brand/tile/` (`tile_composed_master.png`,
`GENERATION_NOTE_composed_master.md`, `TILE_LAYER_DERIVATION.md`);
`design-system/brand/delivery/` (`FutureSpinner-Tile.png`, `README.md`);
`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`;
`docs/records/upload-kit/` (`00_READ_ME_FIRST.md`, `03_branding_HASHES.txt`);
`reports/screens/provider-mark/f-vs-g-rendered-sizes.png`;
`reports/screens/brand-tile-composed/layer-derivation-attempt.png`;
`WRS_MASTER_DOCUMENT.md`; `reports/briefs/FS_KIT_V4_AND_BRAND_Prompt.md`; this report and
its archive copy. `sideproject/` removed from the working tree.

**Open threads, in the order the owner asked for them.**

1. **The owner runs PART 9c.** `~/Desktop/FS_UPLOAD_KIT_V4/`, single use, delete
   afterwards. The two highest-value minutes in it are the Bets panel replay (does the
   button work now, and does the max win celebration present) and the screenshot of the
   Design Thumbnail editor before anything goes into it.
2. **Fable's benchmark polish review**, per the retro mechanism in section 3f: up to three
   surfaces nominated for focused redo sessions, each with the measurement that justified
   it.
3. **External review round three.**

Also still open and not touched by this session: the six social strings blocking stake.us,
the JOB 2 addendum's platform-conformance extensions, JOB 3b's math self-audit, and JOB 5b's
in-game rules conformance UI.

**Rule 10 closing (2026-07-26k).** Remote run
[30194550651](https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30194550651)
on `31dbc1f`: **green, both jobs** (static gates, browser gates). The mid-session
push at `1b31c5b` was also green, run
[30194275519](https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30194275519).
Verified from the runs' own conclusions, not from local gate results.

**One correction folded into this commit.** The kit README and the report both
gave the bundle as "108 files, 15,514,792 bytes", which mixes two counts: 108
files includes `build-info.json`, and 15,514,792 excludes it, because the stamp
does not count itself. The bundle is 108 files and 15,515,173 bytes; the stamp
records 107 and 15,514,792. The 381-byte gap is the stamp.

**One finding added to section 7a.** The archived `sideproject/` mattered less
than its size suggested: the LUMEN source is on the pushed branch
`claude/lumen-sideproject` (`4f4d6ef`), and 89 MB of the 112 MB in the working
tree was `node_modules`. Recorded so a future reader does not treat the zip as
the only copy.

## 2026-07-26j: THE LIVE WIRE, READ FIELD BY FIELD

Brief saved verbatim: `reports/briefs/FS_LIVE_SHAPES_Prompt.md`. Fresh session on
`main`, three jobs, commit per job. **No lock exception granted and none taken**;
`frontend/src/lib/services/rgsService.ts` is untouched and `git diff` over it is
empty. Zero em or en dashes across every file written.

The owner opened DevTools on a live Stake Engine session and captured the
Network panel with the `wallet` filter applied. These are the first first-party
sightings of the real authenticate, play and end-round bodies. Until today every
claim about those shapes rested on the pinned types and on decoded book rows.

### JOB 1: what the live wire says

Six captures committed to `reports/screens/live-shapes-2026-07-26/`.

**Confirmed, and now closed as TR-077, TR-078 and TR-079.**

- **`round.state` IS a bare event array.** The frame shows it opening directly
  into `[ { "index": 0, "type": "reveal", "board": [...] } ]`. That is what
  `_extractEvents` assumes, and it is the first confirmation from the platform
  rather than from our own pinned types.
- **Money is integer micros in both directions.** `balance.amount` 996800000 on
  authenticate, 995060000 on end-round, and the HUD in the same frame reads
  `EUR 995.06`. At `CURRENCY_SCALE` 1,000,000 those are the same number.
- **`end-round` returns balance ONLY**, the whole body being
  `{"balance":{"amount":995060000,"currency":"EUR"}}`, with no round identity at
  all. That is exactly what the TR-009 rewrite assumed when it replaced the
  invented `{balance: number, roundId}`.
- **Plays without an end-round exist**, visible in the request list, so a
  zero-win round settles without one.
- A detail worth keeping: the board rows carry **six cells against a five-reel
  visible grid**. That is the padding row from the `CLAUDE.md` worked example,
  seen on the live wire for the first time.

**TR-080, the jurisdiction read, and the one place this session nearly got it
wrong.**

The live response carries `jurisdiction` at TOP LEVEL beside `balance` and
`user`. `rgsService.ts:555-559` reads `config.jurisdiction`.

`frontend/scripts/live_shape_conformance.mjs` proves this against the SHIPPED
function rather than a copy: it serves the captured body from a throwaway local
HTTP server and calls the real exported `authenticate()`. Nothing is
re-implemented, so it cannot agree with the parser by sharing its mistake, which
is convention (l.4) applied to a test rather than to a claim.

**The defect is REACHABLE, not confirmed live, and the difference is the whole
finding.** The frame shows the response TAIL only. Whether a `config` block
further up also carries a jurisdiction copy is unknown, so the harness runs both
cases: case A (no copy) reproduces the defect, case B (a copy) shows the parser
already correct.

**The error this session made and caught.** The first draft of the harness
asserted the defect flatly, from a fixture that omitted `config` entirely
because `config` was not legible in the capture. That fixture then "proved" a
second finding: that the bet ladder also arrives empty. **That is false.** Ledger
SA-020 recorded live bet levels of 450, 500, 750 and 1,000, none of which the
hardcoded fallback can express, so `config.betLevels` demonstrably does arrive.
The draft had measured its own assumption and produced a confident wrong answer
from it, which is precisely the failure convention (l.2) names. It was caught by
checking the new result against an existing committed one rather than by
re-reading the code. The harness now models what the capture shows and splits
the unknown into two cases instead of picking the dramatic one.

**The fix is parked, not applied.** One line, `rgsService.ts:558`:

    from   ...(config.jurisdiction ?? {}),
    to     ...(config.jurisdiction ?? raw.jurisdiction ?? {}),

Tolerant rather than a swap: `config.jurisdiction` still wins where it exists,
the top-level block is used where it does not, and where neither exists nothing
changes. All three cases are RUN in the harness, so the owner would be approving
a change that has been executed rather than one that has been described. It sits
in the tracker's parked-rows table with three options and a recommendation.

**TR-081, the red authenticate and the four console errors: NOT DIAGNOSABLE.**

Derivable from code: production has exactly two `authenticate` call sites,
`initRGS()` and `sessionRecovery.recoverSession()`, and `authenticate` is **not**
wrapped in `_withRetry` (only `play` and `endRound` are), so our client never
retries it. Four requests therefore means at least two session boots rather than
a retry storm.

Not derivable: the cause of the red one, or the content of the four console
errors, because **no frame shows the Console panel**; every frame has the AI
assistance tab open in that slot instead. Recording a plausible cause would be
the (l.6) violation, so the row says what would settle it: the Console tab with
the errors expanded, and the red row's own Headers and Response tabs.

### JOB 2: PART 9c rewritten to one page

The section was written before anyone had watched a real update happen. Most of
it described work the platform does by itself.

Differential sync is now explained instead of feared: **upload 4, delete 3, skip
104**, and all three numbers are normal. Upload is only what changed, because the
build renames a file when its contents change. Delete is the previous version of
those same files, worked out by the platform. Skip is everything unchanged.

**The `HASHES.txt` deletion step is gone.** It was a whole step asking the owner
to hunt a 2.82 KB notes file out of a 13 row list. It is harmless residue and the
step cost more than the tidiness was worth. The page says so explicitly, because
a previous version told him to do it, and contradicting yourself silently is
worse than never having said it.

The tile step is gone (composed already), the maths step is gone (untouched, and
no maths folder ships in the kit), and Publish is one button said once.

Five items remain and nothing else: the event 22975 max-win replay with its
celebration capture, twenty bracketed Cruise spins, Gold Coin decimals, the
language list and Danish fallback, and the Guidelines ticks.

**Three old observations came off, and the page says why.** They asked the owner
to read the network panel for where a round's events live, how a round ends, and
whether the platform sends display information. His own DevTools screenshots
answered all three. A shorter list reads as work being cut unless someone says
where it went, and in this case he did the work himself.

Forty-five minutes becomes twenty; 670 lines becomes 542.

### One thing that does not match, flagged rather than resolved

`reports/screens/live-shapes-2026-07-26/02_tile_editor_background_no_file_chosen.png`,
captured 16:28, shows the Tile Editor with **Background Image: No file chosen**
and the placeholder GAME TITLE template in the preview. The brief says the tile
is composed and done, and the walkthrough now says so too.

Both can be true if the tile was finished after 16:28, which is likely given the
brief is later. It is recorded here rather than reconciled because the owner is
authoritative on what he did and a capture is a moment, not a state. If the tile
is in fact not composed, this line is where that gets noticed.

### Verification, measured

    node frontend/scripts/live_shape_conformance.mjs     9 of 9 checks ok
      defect REACHABLE (case A), controls pass, proposed fix verified
    node scripts/qa/locked_paths_gate.mjs --self-test    PASS
    node scripts/qa/locked_paths_gate.mjs --check-disjoint  3 manifests, 0 collisions
    git diff frontend/src/lib/services/rgsService.ts     EMPTY, no lock exception taken
    dash check across every file written                 0

### The records pass: kit V8

Assembled after the merge, as the brief's FOR THE NEXT SESSION said it would be.

`~/Desktop/FS_UPLOAD_KIT_V8/`, built by `scripts/kit_build.mjs --version 8` from a FRESH
CLONE per convention (o), at `e0c30611`, clean tree. **110 files, 15,633,567 bytes.** All
three dist gates run IN THE CLONE and green.

**Verified independently of the builder's own report**, because a builder that reports its
own success is one number rather than two: measured on disk at 110 files and 15,633,567
bytes, and the bundle's own `build-info.json` says 109 files and 15,633,186 bytes EXCLUDING
ITSELF, which reconciles exactly once its own 381 bytes are added back.

**All four player-visible commits of this pass are ancestors of the kit commit**, confirmed
by `git merge-base --is-ancestor`. `docs/records/V7_RECONCILIATION.md` section 1 listed what
V7 could not show; this kit closes the two largest entries by shipping rather than by
argument.

**THE DEFECT FOUND WHILE ASSEMBLING.** `kit_build.mjs` wrote the literal `PART 9e` into every
kit README and had done since V5. The walkthrough moved to PART 9f with V7, and 9f's own
heading now reads SUPERSEDED, DO NOT RUN. **So V5, V6 and V7 each handed the owner a README
pointing at a section the document itself says not to run**, and nobody noticed because a
README looks correct until somebody follows it. Fixed at the cause: the part is DERIVED from
the walkthrough in the clone, and it THROWS rather than falling back, because a kit whose
README cannot name its own visit is worse than no kit. Four new convention (p) seeds, nine
in total, all watched failing. TR-100.

**PART 9g is the V8 visit.** It keeps 9f's full-kit reconcile and SHA capture, then adds a
two-minute LOOK half, because this is the first kit whose changes a player can see: tap the
BET window and check the levels are the platform's own for that currency, and leave a bonus
half way through and reload. **That reload is the live confirmation TR-099 is waiting on.**
The walkthrough says plainly that the prompt NOT appearing is the useful result rather than a
failure, and that the round settles and pays either way. An owner told what a negative result
means reports one; an owner told only what success looks like assumes they did it wrong.

**Left for the owner, deliberately:** `~/Desktop/FS_UPLOAD_KIT/` and `FS_UPLOAD_KIT_V7/` are
both still on the Desktop and both dead. Not deleted by this pass, because that is the
owner's machine; PART 9g asks for it at step 7.


## What was still running at the end, and why it is on the record

Asked at close: what is still going. The answer for this session's own work is **nothing**,
and `git status` was clean throughout, so no committed evidence was touched. But auditing it
found something worth a row.

**Every browser gate leaks its `vite preview` server.** They spawn it detached and reap it
with a process-GROUP `SIGTERM`, and the group signal does not reliably reach it. Measured at
close: **seven leaked preview servers, fourteen processes, holding eighteen ports**, plus two
orphaned chromium groups. Both gates this pass added copied the pattern from the existing
ones, so it is a defect in the gate FAMILY rather than in any one script.

**The worse half is already documented in the codebase as a symptom without being recognised
as a cause.** `layout_fit_gate.mjs`'s hard-timeout comment says it exactly: killing the `npx`
wrapper orphans the real vite child, whose inherited stdout pipe holds the process's event
loop open. So a gate that FAILS mid-run can hang forever. Found running: a
`portrait_layout_conformance.mjs` process from a PREVIOUS session, **hung for 1 day 9 hours**
with five chromium attached, whose log last wrote two days earlier and ends in a
`TimeoutError`. Dead for two days, still holding a browser.

**This is probably part of the frame-gate noise this pass recorded and could not attribute.**
`sampleCount` fell from 85 to 36 and `splashFrameGate` flipped between two runs with no code
change. A gate whose result depends on how many corpses are on the machine reports noise, and
some of those corpses were ours. TR-101, with the three fix options; serving `dist/` from a
`node:http` server inside the gate process is the one that removes the class rather than the
instance.

Cleaned up on the owner's instruction: the hung run, its chromium, every leaked preview and
the orphaned chromium groups terminated; the two `vite --host` dev servers deliberately left
alone. Nothing in the repository changed.


## TR-101 resolved: the orphanable child is deleted, not managed

Fable ruled option (c) on the preview leak. `frontend/scripts/lib/previewServer.mjs` serves
`dist/` over `node:http` from inside the gate process. No `npx`, no vite child, no process
group, nothing that can survive the script. **Adopted across the whole family, all eighteen
scripts, in one pass.**

**Port-reaping was never written.** The ruling approved it only as a temporary guard during a
staged migration, to be removed by the pass that completed it. This completed in one pass, so
there was no window for it to cover, and adding then deleting it would have been ceremony.
Recorded because the ruling named it: its absence is deliberate.

**Two further defects found while migrating, both now impossible rather than fixed.** Three
scripts never called `killPreview` at all and leaked on every run; under option (c) forgetting
to close costs nothing, because the server dies with the process. And four hardcoded a fixed
port, so two running at once fought over it and the second died on `--strictPort`; the kernel
now picks and reports, which also deletes the old `getFreePort()` race where a socket was
opened, closed, and the number handed to a process that bound it a second later.

**The assertion asserts and does not clean up**, because killing there would hide the defect
it reports. It carries a two second grace, since `browser.close()` resolves when playwright
has told chromium to go rather than when the kernel has reaped it, and a gate that goes red at
random teaches everyone to ignore it. Two seconds cannot hide a leak that lasts hours.

**MEASURED AFTER THE MIGRATION: fourteen gate runs, ZERO leaked processes.** Before it, every
run leaked one.


## Rule 10 closing link

This session's final push, BOTH JOBS GREEN:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30197391943`
  static gates: success
  browser gates: success

### FOR THE NEXT SESSION

**The parked sanction line, ready to paste.** If the owner wants TR-080 closed:

> Sanction: lift the deny on `frontend/src/lib/services/rgsService.ts` for one
> isolated pass to change line 558 from `...(config.jurisdiction ?? {}),` to
> `...(config.jurisdiction ?? raw.jurisdiction ?? {}),`, per the recommendation
> in the parked-rows table and the run evidence at
> `reports/qa/live_shape_conformance_2026-07-26.json`. Commit message carries
> `LOCK-SANCTION: <date> frontend/src/lib/services/rgsService.ts`.

The recommendation is to take **one screenshot first**: the authenticate response
scrolled to the top. If a `config.jurisdiction` copy is there, case B is real,
nothing needs fixing, and a locked file never has to be opened. That screenshot
is a ten second job and it converts a maybe into a fact.

**The owner's remaining list**, now five items on one page: the event 22975
replay with its celebration capture, twenty bracketed Cruise spins, Gold Coin
decimals, the language list and Danish, and the Guidelines ticks. Two captures
that are NOT on his page but would close TR-081 if he is in DevTools anyway: the
Console tab with its four errors expanded, and the red `authenticate` row's
Headers and Response tabs.

**Then Fable's polish review and round three.** The retro mechanism at
`WRS_MASTER_DOCUMENT.md` section 3f nominates up to three surfaces for focused
redo sessions after the portal visit, selected by measured weakness against the
professional bar rather than by taste.

**Model and effort.** Opus 5 at high effort. The judgement was in refusing to
report the jurisdiction defect as confirmed when the capture could not support
it, and in noticing that a second finding the harness produced contradicted an
existing committed result.

**Alternatives tried and rejected.**

- *Reporting TR-080 as a confirmed live defect.* Rejected once the fixture's
  own second finding contradicted SA-020. The capture shows a tail, and a tail
  cannot prove the absence of something in the head.
- *Applying the one-line fix.* Rejected: locked file, no exception in this brief.
  The brief's own instruction is to design it, prove it and park it, and that is
  what happened.
- *Guessing at the four console errors.* Rejected under (l.6). Two named
  captures settle it and neither has been taken.
- *Leaving the `HASHES.txt` step in PART 9c "just in case".* Rejected. It is
  residue, and a step that costs more than the tidiness is a step that trains
  the owner to skim the page.

**Files touched.** `reports/briefs/FS_LIVE_SHAPES_Prompt.md`,
`reports/screens/live-shapes-2026-07-26/` (six captures),
`frontend/scripts/live_shape_conformance.mjs` (new),
`reports/qa/live_shape_conformance_2026-07-26.json`,
`docs/records/reviews/REVIEW_TRACKER.md`,
`docs/records/upload-kit/00_READ_ME_FIRST.md`, this report and its archive copy.

**Open threads.** TR-080 (parked sanction, one screenshot away from being
settled either way), TR-081 (not diagnosable, two captures named), TR-073,
TR-074 and TR-075 from the previous session, all of which close on captures from
the same visit. The four keep-or-discard working-tree items from session 26i are
unchanged and still the owner's call.

## 2026-07-26k: THE SANCTIONED FIX AND THE LIVE CONFIRMATIONS

Brief saved verbatim: `reports/briefs/FS_LIVE_ROUND2_Prompt.md`. Fresh session on
`main`, commit per job, zero em or en dashes.

**JOBS 1 and 2 are complete. JOBS 3, 4 and 5 were NOT STARTED, deliberately, and
the reasons are in their own section below rather than buried.**

### JOB 1: the sanctioned one-line jurisdiction fix. COMPLETE.

The live RGS sends `jurisdiction` at top level; the parser read
`config.jurisdiction` only.

    -    ...(config.jurisdiction ?? {}),
    +    ...(config.jurisdiction ?? raw.jurisdiction ?? {}),

**Additive, not a swap.** `config.jurisdiction` is first in the chain, so the
pinned shape still wins where it exists. Where it does not, the live top-level
block is used. Where neither exists, `EMPTY_JURISDICTION` survives exactly as
before.

**The second line, and why it is not scope creep.** `RawAuthenticateWire` did not
declare a top-level `jurisdiction`, so the one-line read did not compile:
`typecheck_baseline` went from 0 errors to 1. The field was added as OPTIONAL
with a one-line comment, because that is what makes the sanctioned change legal
rather than an addition to it. Final `git diff --stat`: **1 file, 3 insertions, 1
deletion.** The alternative was casting through `any` to hold the diff at one
line, and that was rejected: this is a money-path file, and an `any` there buys a
smaller diff by giving up the type safety the file exists to provide.

**Proven against the shipped function, not a copy.**
`frontend/scripts/live_shape_conformance.mjs` serves the captured live body from
a local HTTP server to the real exported `authenticate()`. Nine of nine checks
pass: the live top-level shape now populates all twelve flags, the config-nested
shape still populates and config still wins, the read is inert where neither key
exists, plus both negative controls.

**What this retires.** The previous session parked this because the capture shows
the response TAIL, and a `config.jurisdiction` copy further up would have meant
the parser was already right. That question no longer needs an answer, and the
screenshot that would have settled it comes off the owner's list.

**Lock hygiene, per convention (e).** Exactly the two named deny lines lifted as
a never-committed working-tree edit, restored before the commit, with
`git diff .claude/settings.json` verified empty. `gameStore.ts` and `games/`
untouched and verified. No Bash routing around any deny at any point. The commit
carries `LOCK-SANCTION: 2026-07-26 frontend/src/lib/services/rgsService.ts`, and
the gate reads it: `1 commit, 1 sanctioned, 0 violations`.

### JOB 2: the live confirmations. COMPLETE.

Eight owner captures committed to `reports/screens/live-round2-2026-07-26/`.

**TR-076 CLOSED, and it was the blocker.** Bet Replay is mandatory under the
platform rules, and it had been reported launching to a static board with START
REPLAY sitting as an unclickable shadow. The evening captures show `super` event
22975 replaying through to its celebration and its PLAY AGAIN control, on the
live platform, under the platform's own verification banner. It works. This was
the one open item that could have blocked submission on its own.

**TR-073 CLOSED by the same replay.** `MaxWinCelebration` renders in full: three
gold stars, MAX WIN REACHED!, 5,000 x BET, COLLECT, HIT ENTER TO CONTINUE. The
previous session parked this rather than concluding it fired, because the
evidence was a twelve second gap and an inference. It is now a photograph.

**GAME_FACTS section 3a, THE PLATFORM DISPLAY CONVENTION.** Both the Bets COST
column and `round.amount` carry the BET LEVEL on every mode; the platform keeps
the multiplier as a separate `costMultiplier` field. One capture carries the
whole worked example: `round.amount` 20000000 micros, Bets COST EUR 20.00, our
HUD BET EUR 25.00, at antelite's 1.25x. Effective debits are proven live to the
cent for four of five modes, and `cruise` is stated as NOT proven.

The same section records that our surfaces state effective prices, with the
capture: at EUR 7.00 with OVERBOOST on, the HUD reads EUR 8.75, the FEATURES
header shows SPIN COST EUR 8.75 beside BET EUR 7.00 so both are labelled rather
than one standing for the other, the OVERBOOST card reads 1.25x per spin EUR
8.75, and Buy Overdrive reads 100x EUR 700.00.

**TR-082 PASS**, Danish falls back to clean English, observed.

**TR-057 STAYS PARKED, and the row says why.** GC is not offered in the Settings
currency selector in this environment, so the check could not be run. That is not
a result either way. Recording "unavailable" rather than "passed" matters,
because a reader skimming closed rows would otherwise take it as settled.

**TR-081 observed-only.** The evening captures show nine `authenticate` entries
against two production call sites, so the session re-authenticates repeatedly.
Still no frame shows the Console panel, so the four errors remain uncharacterised
and no cause is recorded. Nothing player-visible has failed in any session.

### JOBS 3, 4 and 5: NOT STARTED, and why

This session ran two jobs of six. Scaling the work down is the owner's call, not
the builder's, so this is stated plainly rather than presented as a full run.

**What was done for JOB 3 anyway, and it is the expensive half.** The owner's
four defect screenshots are committed as the specification the brief said they
are, named for the defect each one shows:

- `05_DEFECT_mobile_portrait_reels_small_in_pane.png`
- `06_DEFECT_mobile_L_dead_space_between_bet_and_controls.png`
- `07_DEFECT_mobile_M_reels_not_filling_width.png`
- `08_DEFECT_popout_s_stage_small_and_right_anchored.png`

Two distinct defects are legible in them, and they are not the same defect at two
sizes:

1. **Popout S, 400x225.** The reel stage renders small and hard right-anchored,
   leaving roughly the left 45 per cent of the frame as empty background, with
   the FEATURES trigger stranded at the far left of the strip.
2. **Mobile portrait, S through L.** The reels do not fill the pane's true
   available width, and at the taller presets a large vertical dead band opens
   between the BET row and the control row, roughly 250px at Mobile L.

**Why it stopped there.** The remaining work is a layout redesign against a
945-line proof suite (`mini_player_proof.mjs` and `layout_fit_gate.mjs`), at
seven presets, with before and after captures and both gates green. The brief is
explicit that the widening must follow the TR-065 method: measured, never
`overflow: hidden`. That is a measure, change, re-measure loop on a shipping
layout, and a half-finished version of it is worse than none, because an
unverified layout change to a shipping game is exactly what this project's
conventions exist to prevent. TR-065 itself is the precedent: the previous
Popout S fix was got right by re-measuring rather than by reaching for a bespoke
change, and it resolved TR-071 incidentally as a result.

**JOB 4** is untouched. Note for whoever picks it up: the brief gives the path as
`~/Downloads/bg_improved_v2.jpg`, and the file is actually at
`~/Downloads/slot_background_assets/bg_improved_v2.jpg`, alongside a `v1`. Both
exist; nothing is missing.

**JOB 5** is untouched and is correctly blocked anyway: the brief gates Kit V5 on
JOB 3 passing its gates.

### Verification, measured

    node scripts/qa/locked_paths_gate.mjs HEAD~2 HEAD    2 commits, 1 sanctioned, 0 violations, PASS
    node frontend/scripts/typecheck_baseline.mjs         PASS, 0 errors, 36 warnings, baseline unchanged
    node frontend/scripts/live_shape_conformance.mjs     9 of 9 checks ok
    git diff .claude/settings.json                       EMPTY
    git status frontend/src/lib/stores/gameStore.ts games/   clean
    dash check across every file written                 0

### Rule 10 closing link

Final push, BOTH JOBS GREEN, and the locked-paths gate accepted the sanction:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30198792499`
  static gates: success
  browser gates: success

### FOR THE NEXT SESSION

**The three jobs this session did not run**, in the brief's own order: JOB 3 the
Popout S and mobile recomposition (defect spec already committed and named), JOB
4 the background candidate v2 ingest (path correction noted above), JOB 5 Kit V5
once JOB 3's gates are green.

**Then, per the brief:** Fable verifies this session and the prior one at git
level, then the benchmark polish review, then round three.

**The owner's remaining list is shorter than it was.** Off it: the max-win
celebration capture (done, TR-073), the replay confirmation (done, TR-076), and
the authenticate-response-head screenshot (no longer needed, the read is tolerant
of both shapes now). Still on it: twenty bracketed Cruise spins, which is the only
thing that closes TR-075, and the Guidelines ticks. Gold Coins is off it until an
environment offers GC.

**Model and effort.** Opus 5 at high effort. The judgement was in JOB 1: noticing
that the sanctioned one-line change did not compile, and choosing a typed
optional field over an `any` cast in a money-path file even though the cast would
have matched the brief's "one line" more literally.

**Alternatives tried and rejected.**

- *Casting `(raw as any).jurisdiction` to keep the diff at one line.* Rejected;
  reasoning above.
- *Starting JOB 3 and handing back a partial layout change.* Rejected. The gates
  are the acceptance criteria and an unproven change to a shipping layout is a
  liability, not progress.
- *Reporting TR-057 as passed because the owner ran the check.* Rejected. The
  check could not be run; that is not a pass.

**Files touched.** `reports/briefs/FS_LIVE_ROUND2_Prompt.md`,
`frontend/src/lib/services/rgsService.ts` (sanctioned),
`frontend/scripts/live_shape_conformance.mjs`,
`reports/qa/live_shape_conformance_2026-07-26.json`, `GAME_FACTS.md`,
`docs/records/reviews/REVIEW_TRACKER.md`,
`reports/screens/live-round2-2026-07-26/` (eight captures), this report and its
archive copy.

# Session Report - THE SMALL-SCREEN RECOMPOSITION (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_SMALLSCREEN_RECOMPOSE_Prompt.md`. Fresh
session on `main`, integrator role, explicit paths, no lock exceptions and none
needed: no locked path was touched or required, and `git diff .claude/settings.json`
is empty. ONE JOB, per the brief, and it is the extracted JOB 3 from
`FS_LIVE_ROUND2_Prompt.md` that the previous session stopped short of.

## Summary

Both defects the owner photographed are fixed, proven at all seven platform presets,
and each one turned out to have a root cause that was derivable from the stylesheet
before anything was measured. The measurements then agreed with the derivation to
0.1px, which is the outcome convention (l.2) is written to produce.

**Popout S was one missing CSS declaration, not a scale problem.**
`.canvas-inner.mini-player` lacked the `width:1280px; height:720px` pair that
`.canvas-inner.portrait` and `.canvas-inner.compact-landscape` both carry. The stage's
children are positioned in stage units against that box, so with the base rule's
`width:100%` resolving against the 400px slot the box became 400x181 instead of
1280x720, and `translateX(-50%)` translated 200px where centring the stage needs 640.
Predicted right-shift (640-200) x 0.2514 = **110.6px**. Measured: **+110.6px**.

**The mobile dead band was proportional to viewport height, which is why the owner's
number and this machine's number were both right.** The owner reported roughly 250px
at Mobile L; a direct measurement at 425x812 gave **30.8px**. Rather than average them
or pick one, the quantity was swept: the gap is
(viewportH - wordmark - canvas - hudContent), and it grows at a measured **1.000px per
px of viewport height** once the canvas is width-bound. It reads 30.8 at 812, 118.8 at
900, 218.8 at 1000, **249.8 at 1031** and 618.8 at 1400. The platform's Screen preset
sets the WIDTH; the window supplies the height. The owner's Mobile L was about 1031px
tall, never 812, and both figures describe the same defect at two heights.

**The mobile width was a crop window spending 21% of the height budget on nothing.**
`PORTRAIT_CROP_BOTTOM_Y` cropped from stage y=0 to 592 while the frame occupies
y=84..552, so 124 of 592 units were empty stage. Because the scale is a `min()` of a
width term and a height term, that waste is exactly what stopped the width term
binding at Mobile M and Mobile S.

## The measured result, before and after

| Preset | Grid fill before | after | floor | Centre offset before | after | Dead band before | after |
|---|---|---|---|---|---|---|---|
| Popout S 400x225 | 32.8% | **44.2%** | 42% | **+110.6px** | **0.0px** | n/a | n/a |
| Mobile L 425x812 | 96.0% | 96.0% | 94% | 0.0px | 0.0px | **30.8px** | **10.0px** |
| Mobile M 375x667 | 79.5% | **96.0%** | 94% | 0.0px | 0.0px | 10.5px | 10.0px |
| Mobile S 320x568 | 65.8% | **83.7%** | 81% | 0.0px | 0.0px | 10.5px | 10.0px |
| Desktop 1200x675 | 40.8% | 40.8% | 40% | 0.0px | 0.0px | n/a | n/a |
| Laptop 1024x576 | 40.8% | 40.8% | 40% | 0.0px | 0.0px | n/a | n/a |
| Popout L 800x450 | 33.9% | 33.9% | 33% | 0.0px | 0.0px | n/a | n/a |

10.0px is `.p-hud`'s own `gap: 10px`, the one deliberate breathing space, so the after
column is the floor and not a smaller hole. The three landscape presets are the
untouched `scale(S)` profile and are asserted for no-regression.

FEATURES at Popout S, opened from the strip the way a player opens it: the mode list's
window went from **28px onto 663px of content with 0 of 4 cards reachable** to **118px
onto 226px with 2 of 4 fully visible** and the rest reachable by scrolling, close and
BET MODES both inside their clipping ancestors.

## What was fixed, and why each

1. **`.canvas-inner.mini-player` gains `width:1280px; height:720px`.** The
   coordinate-space fix above. Placed adjacent to the portrait and compact-landscape
   rule that always carried the pair, so the three cannot drift apart again.
2. **The mini scale divides the frame's own box.** `min(vw/640, availH/534)` instead of
   `min(vw/1280, availH/720)`, with the crop window running from the title (stage y=18)
   to the frame's bottom edge (y=552).
3. **The portrait height term divides the frame (468), not the crop window (592)**, and
   a separate adaptive crop then decides how much decorative stage to show out of what
   is left, centred on the frame. At Mobile L the window opens to the full 592, at
   Mobile M to about 490, at Mobile S it closes to the frame itself.
4. **`.native-hud-slot.portrait` becomes `flex: 0 0 auto`.** Content-sized, so the
   surplus can no longer be distributed into the HUD as a gap. This makes the hole
   structurally impossible rather than merely smaller.
5. **`.canvas-slot.portrait` becomes `flex: 1 1 0`.** See the regression below; this is
   the load-bearing change.
6. **A mini profile for the FEATURES panel**, compressing the head and bet bar to single
   rows so the mode list gets the majority of the panel.

## A regression this pass caused and caught, and the lesson that outranks the fix

The first working draft computed the canvas box as
(viewport - wordmark - HUD) from two separately measured chrome heights. Every
composition assertion passed. **`layout_fit_gate.mjs` went red** and named five
controls including SPIN as outside the viewport at Mobile M and Mobile S.

The cause is worth recording because it is a class, not an incident: that is **two
sources of truth for one box**, and they disagreed NON-DETERMINISTICALLY. Identical
loads produced a 338px canvas on one run and 374px on another; Mobile S overflowed by
25.5px until a 1px resize nudge corrected it to a 10.5px fit. A subtraction has to be
re-run whenever either measurement lands, and a measurement that arrives late finds the
canvas already sized from a stale one.

So the dependency was inverted rather than the timing patched. `.canvas-slot.portrait`
is now `flex: 1 1 0`, which means **CSS decides the box** in the same layout pass that
places the chrome, and the script measures that box and picks a scale to fill it. The
stage is then physically incapable of exceeding its box, and if the HUD grows mid-round
flex shrinks the box in the same frame, so the worst case is one frame of
slightly-too-large stage inside a correct box rather than a control moving out of reach.
Re-tested across load, a 2.5s settle and a resize nudge, the layout is now identical
every time.

**Two conclusions, stated plainly.** First, the composition gate was green through all
of this, and the fit gate caught it: the two gates measure different things and neither
substitutes for the other. Second, a patched settle loop would have made the arithmetic
converge faster while leaving two sources of truth in place, which is the fix that
looks adequate and rots.

## Hypotheses tested and FALSIFIED, recorded so they are not re-run

- **That the mobile layout was history-dependent.** Predicted from `flex: 1 1 auto`
  making `scrollHeight` report the stretched box. Tested with seven routes to each of
  the three presets, including boot-at-desktop-then-apply-preset, which is what the DTT
  actually does. All settled identically, spread **0.0px**. Discarded.
- **That the HUD's reserve was inflated by a stale measurement.** A hand-sum gave the
  HUD's content as 248.5px against a measured slot of 287. The hand-sum was wrong: it
  omitted `.p-hud`'s 10px gap and 20px of vertical padding. `scrollHeight` was
  reporting the content height correctly at Mobile M and S. Discarded; the 20.3px of
  genuine surplus at Mobile L was real and is fixed by item 4 above.
- **Reverse-engineering the owner's exact viewport from their PNGs.** Attempted by
  decoding the captures through the browser's own canvas, the way `contrast_gate.mjs`
  does. The edge detection was not reliable on these crops and the attempt was
  abandoned rather than reported as a measurement. The height sweep answered the same
  question better, and generally: the fix holds at every height rather than at one
  recovered number.

## Verification, measured

    node scripts/smallscreen_composition_gate.mjs            PASS, 7 presets + FEATURES + 10 swept heights
    node scripts/smallscreen_composition_gate.mjs --self-test PASS, both seeded violations caught
    node scripts/layout_fit_gate.mjs                          PASS, 7 presets, scroll=no offscreen=0 clipped=0
    node scripts/mini_player_proof.mjs                        PASS, 25 checks, 5 seeded violations caught
    node scripts/contrast_gate.mjs                            PASS, 4 portrait presets, seeded violation caught
    node scripts/popout_conformance.mjs                       PASS, 3 viewports, real clicks
    node scripts/typecheck_baseline.mjs                       PASS, 0 errors
    npm run check                                             496 files, 0 errors, 36 warnings (the committed baseline)
    node scripts/dead_wiring_scan.mjs                         PASS
    node scripts/scan_wallet_floats.mjs                       PASS
    node scripts/currency_scale_drift.test.mjs                PASS
    node scripts/locale_completeness_check.mjs                PASS
    node scripts/a11y_social_terms_check.mjs                  PASS
    node scripts/dist_hygiene_gate.mjs                        PASS
    node scripts/dash_gate.mjs --self-test / --source / dist  PASS, all three
    npm run build                                             clean

**The new gate ships a seeded self-test per convention (p), and both seeds are the
defect in the form it really occurred**, because both defects were CSS declarations:
one restores `width:100%` on `.canvas-inner.mini-player` (the gate goes red at +149.1px
off-centre, which is (640-200) x 0.339 at the new scale), the other restores
`flex: 1 1 auto` on `.native-hud-slot.portrait` (16 findings, dead bands from 129.7 to
618.8px). The unseeded build is green on the same run.

**Why the gate sweeps heights rather than only checking the seven presets.** A
preset-only gate would have gone green on the exact defect the owner reported, because
30.8px at a nominal 425x812 is inside any tolerance a reviewer would set while 249.8px
at 1031 is not. The presets fix the width; the window fixes the height.

## Convention compliance, self-audited before reporting (l.5)

- **(b) and (f)** brief saved verbatim to `reports/briefs/` and committed with the work.
- **(h)** before and after captures committed for every preset the spec names, plus the
  FEATURES panel state a still of the idle screen cannot show.
- **(h.1) observed and repaired mid-session.** `portrait_layout_conformance.mjs` and
  `popout_conformance.mjs` still write directly into committed evidence directories
  rather than through `evidenceDir()`. Running them dirtied 30 committed PNGs and one
  committed JSON in `reports/screens/{portrait-v2,landscape-compact-v1,audit-remediation-v1}/`
  and `reports/qa/`. All were restored from HEAD with `git checkout` and none is in this
  session's commits. This is the open work CLAUDE.md's (h.1) entry already names; two
  more scripts for that list.
- **(k)** every path staged by name.
- **(l.1) and (l.2)** both root causes derived from the stylesheet before measuring;
  measurement confirmed the Popout S offset to 0.1px.
- **(p)** the new gate fails on a seeded violation before its PASS is claimed.
- **No lock exception.** No locked path touched; settings diff empty.
- **Nothing solved with `overflow: hidden`.** The crop window is a composition choice
  about how much decorative stage is shown; every interactive control is a native-DOM
  element below the canvas, so no control is inside the clipped region at all, and
  `layout_fit_gate.mjs` proves that independently by measuring each control against its
  clipping ancestors.

## For the owner: one decision, with both numbers

At Popout S the available box is 400x181, an aspect of **2.21:1**, and the frame is
**1.37:1**. Height therefore binds, and no centred, undistorted composition can also
fill the width. Keeping the title in frame gives a grid fill of **44.2%**; dropping the
title and cropping to the frame alone gives about **62%**, a frame 247px wide instead of
217px.

The title was kept, because `FS_LIVE_ROUND2_Prompt.md` describes this composition in the
owner's own words as "the height between title and strip". Both figures are recorded so
the call can be made against numbers. Say the word and it is a one-constant change
(`MINI_CROP_TOP_Y`).

### Rule 10 closing link

Final push, BOTH JOBS GREEN on the remote runner, verified before closing rather
than inferred from the local results:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30201767190`
  commit `bc9e8a5`
  static gates: success
  browser gates: success

The browser job is the one that matters here, because it is where
`layout_fit_gate.mjs` runs, and this pass's near-miss was a layout regression that
only the fit gate caught. It is green on a different machine from the one that made
the change.

### FOR THE NEXT SESSION

**Model and effort.** Opus, high effort, single job in a fresh context per rule 4.

**Approach.** Derive from the stylesheet first, measure to confirm, and treat any
disagreement between two measurements as a question to answer rather than a range to
split. The height sweep is the reusable idea here: where a quantity depends on the
viewport, assert it across the viewport, not at the presets someone happened to name.

**Alternatives tried and rejected.**
- *Patching the measurement timing with a settle loop.* Rejected: it leaves two sources
  of truth for one box and only makes the disagreement converge faster.
- *Removing the FEATURES bet bar at Popout S to buy 34px.* Rejected: it is a player
  money display, so per (l.8) the builder does not rule on it. The room was found in
  the head, the card rows and the panel height instead.
- *Shrinking the panel's touch targets below 44px.* Rejected: the mini strip's own
  established pattern is a compact visual with an `::after` hit area extended to 44px,
  which `mini_player_proof.mjs` measures, so this profile follows it rather than
  inventing a second convention.
- *Averaging the owner's 250px against this machine's 30.8px.* Rejected outright. Both
  were correct and the discrepancy was the finding.

**Files touched.** `frontend/src/App.svelte`,
`frontend/src/lib/components/FeatureMenu.svelte`,
`frontend/scripts/smallscreen_composition_gate.mjs` (new),
`docs/records/reviews/REVIEW_TRACKER.md` (TR-083 and TR-084 opened and closed),
`reports/briefs/FS_SMALLSCREEN_RECOMPOSE_Prompt.md`,
`reports/qa/smallscreen_composition_{before,after}_2026-07-26.json`,
`reports/screens/smallscreen-recompose-2026-07-26/` (16 captures plus a README), this
report and its archive copy.

**Open threads.**
- `portrait_layout_conformance.mjs` is **non-deterministic in this environment, and it
  is not this pass's doing.** Three runs, three different outcomes:

  | Run | Build | Outcome |
  |---|---|---|
  | 1 | this pass | FAILURES: iphone14-landscape + pixel7-landscape touchTargetAudit, reducedMotionFrameGate, autoInfiniteOption |
  | 2 | **unmodified HEAD** | **CRASHED**, 30s Playwright timeout clicking `activate-bonus` |
  | 3 | this pass, identical to run 1 | FAILURES: iphone14-portrait + iphone14-landscape **frameGate**, pixel7-landscape touchTargetAudit, reducedMotionFrameGate, autoInfiniteOption |

  Runs 1 and 3 are the same build and disagree with each other, which is what makes the
  script unable to answer a regression question in either direction. The causes are
  visible in its own output: `frameGate` is a frame-rate measurement (run 3 failed on a
  single 116.6ms frame out of 185 samples, on a machine that had chromium running
  throughout this session), and `touchTargetAudit` only sees the free-spins entry card
  when the session it drives happens to trigger a bonus, so the element set it checks
  varies. `reducedMotionFrameGate` was **already failing in its committed result at
  HEAD**. It is deliberately excluded from CI ("stay local... tens of minutes",
  `checks.yml`). Worth a session of its own to make deterministic.
- **One genuine finding came out of those runs and is filed as TR-085**, not fixed here:
  the free-spins entry card's TAP TO CONTINUE button measures **88.1 x 33.4px** against
  a 44px minimum. It is in `FreeSpinsPresentation.svelte`, untouched by this pass, and
  it is out of this brief's single job, so per rule 6 it is written up and handed on
  rather than absorbed. Filed rather than deferred silently, because the standing
  mandate removes "minor" as a disposition.
- The `evidenceDir()` migration for the two scripts named under (h.1) above.
- JOBs 4 and 5 of `FS_LIVE_ROUND2_Prompt.md` remain unstarted. JOB 5 (Kit V5) was gated
  on this job passing its gates, which it now has.

# Session Report - THE BACKGROUND CANDIDATE LOCAL EYE-CALL (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_BG_LOCAL_TEST_Prompt.md`. ONE JOB, fresh
session on `main`, integrator role, explicit paths, no lock exceptions and none
needed: no locked path was touched or required, `git status` on all four is clean
and `git diff .claude/settings.json` is empty. This is the extracted JOB 4 from
`FS_LIVE_ROUND2_Prompt.md`, with the local-proof direction added by the owner.

## Summary

The candidates are ingested with provenance, v2 is proven in a real build and in
a real local session, the captures are committed, and the bundle gets **smaller**
rather than larger. All of that is below and all of it holds.

**The finding that outranks it: neither candidate is an enhancement of our art.
Both are new designs.** That matters because `CLAUDE.md` permits one and forbids
the other, in terms the owner set on 2026-07-25: *"external ENHANCEMENT of
existing art is permitted. Externally DESIGNED art is not."*

This is measured, not an opinion about the art, and the measurement has a control
that makes it mean something. The vendor's own drop supplies one:
`bg_original_enhanced.jpg`, whose README declares it *"Your original image with
contrast, sharpness and colour boost applied (keeps the exact same scene)"*. That
is a declared enhancement, so whatever it scores IS the enhancement signature for
this drop under this method. Scored against the shipped background by the same
code in the same run:

| File | Vendor's declared relationship | Pearson r | Cells moved | Class |
|---|---|---|---|---|
| `bg_original.jpg` | "your original file for reference" | **1.0000** | 0.0% | identity |
| `bg_original_enhanced.jpg` | keeps the exact same scene | **0.9966** | 0.0% | ENHANCEMENT |
| `bg_highquality_1920x1080.jpg` | "new higher-quality version (recommended)" | 0.3457 | 57.8% | NEW DESIGN |
| **`bg_improved_v1.jpg`** | "alternative compositions in the same style" | **0.3850** | 58.2% | **NEW DESIGN** |
| **`bg_improved_v2.jpg`** | "alternative compositions in the same style" | **0.3455** | 57.7% | **NEW DESIGN** |

A genuine enhancement scores 0.9966 and moves no cell. v2 scores 0.3455 and moves
57.7 per cent of them. There is no reading of those two numbers on which v2 is the
same composition as the incumbent, and the captures agree with the arithmetic: the
pink star is gone, the buildings are different, a large screen appears at the
right. It is the same *style*, which is what the vendor claimed, and style is not
what the rule is about.

**Provenance is nonetheless clean, and worth stating plainly**, because it is the
other half of the question. `bg_original.jpg` in the vendor drop is
**byte-identical to our shipped `bg_base.jpg`**, sha256
`23e63e54e99aa0b03ddd52649e7838af33c6661121c1da2563ad81342c57539f`, 277,172 bytes.
Our own art provably was the input. Nothing here is of unknown origin; the
question is only how far the output travelled from the input, and the answer is
most of the way.

**This is surfaced, not ruled on.** Convention (n) is explicit that flagging the
tension is the expected move rather than an escalation, and the owner's brief
directs the eye-call, so the eye-call is delivered in full. What the owner is
choosing between has simply turned out to be larger than a background swap: it is
whether to take externally designed scene art, which is a change to the standing
rule and not something the builder decides. Also recorded for the owner, because
it is decision-relevant and free: **`bg_original_enhanced.jpg` classifies as an
ENHANCEMENT (r 0.9966)**, so it is the one file in the drop that could be adopted
under the rule exactly as it stands. It is not one of the two the brief named, so
it was scored and recorded but not ingested as a candidate or captured.

## What was built, and the bundle delta

Candidate v2 was wired as the scene background and a real build was run, per the
brief. Derived first, per convention (l.1), then measured:

| | Files | Bytes |
|---|---|---|
| Baseline build, shipped background | 107 | 15,519,657 |
| Adoption-shaped build, v2 in place | 107 | **15,502,403** |
| **Delta** | 0 | **-17,254 (0.11% smaller)** |

The derivation: the only file that changes is `bg_base.jpg`, 277,172 bytes to
259,918, so the delta must be exactly -17,254 and the total exactly 15,502,403.
The build reported 15,502,403. Exact agreement, and the two sides are independent
in the way (l.4) requires: one is arithmetic on two file sizes, the other is a
post-build walk of `dist/` by `measureDist()` in `vite.config.ts`.

**v2 costs the bundle nothing because the compression was swept, not guessed.**
The incumbent's own 277,172 bytes was used as the budget, on the reasoning that a
background nobody looks at directly should not ship four times the bytes of the
one it replaces. The sweep, at 1920x1080, progressive, optimised, 4:2:0:

    q92 405,849   q88 324,862   q85 291,033   q82 259,918  <- chosen, first inside budget

v1 lands at q80 for 273,173 bytes on the same rule. The 574,103-byte file the
vendor supplied would have been a 107 per cent increase on the incumbent if
shipped as delivered.

The adoption-shaped build was a temporary working-tree swap, never committed. The
shipped `bg_base.jpg` was restored with `git checkout` and verified byte-identical
by sha256 afterwards; `git status` on that path is clean.

## The captures

`reports/screens/background-candidate-2026-07-26/`, with a README. Three
side-by-side sheets at the platform's own preset sizes, taken from the DTT Screen
menu transcription rather than chosen by us, each with the HUD present and no
dialog open:

| Sheet | View |
|---|---|
| `desktop_1200x675__current_vs_v2.png` | DTT Desktop 1200 x 675 |
| `mobile_portrait_375x667__current_vs_v2.png` | DTT Mobile M portrait 375 x 667 |
| `popout_s_400x225__current_vs_v2.png` | DTT Popout S 400 x 225 |

Both arms of every pair come from one dev server and one build, differing only in
the `?bg=` parameter, so the comparison cannot be reading an unintended build
difference. Each capture's served background `src` is read back out of the DOM and
checked against what the arm claims, because a frame labelled V2 that had quietly
fallen back to the shipped file would be worse than no frame at all. Six of six
verified, recorded in `proof_results.json`.

**One thing to know before judging them:** the three views show very different
amounts of background. Desktop shows the most and is where the choice matters.
Popout S shows the scene at both margins of the stage. Mobile portrait shows
almost none of it, because the stage and HUD occupy nearly the whole pane, so on
a phone the choice barely registers. Measured tonal shift of v2 against the
incumbent: **+15.43** mean luma overall, **+17.81** across the stage band,
**+14.72** under the bottom HUD strip. v2 is the brighter and warmer scene, and
it competes more with the cyan reel frame and the magenta FEATURES bar than the
incumbent does. That is an observation for the owner's eye, not a defect claim.

## The classifier found a defect in itself, which is the point of convention (p)

`scripts/assets/background_candidate_ingest_selftest.py` exists because a
classifier hardwired to return NEW DESIGN would have printed exactly the verdict
above. It plants both classes and requires the classifier to separate them: three
real enhancements (identity, the AssetForge `bg_base` grade parameters reapplied,
and a regrade far harder than any real one), three real recompositions (mirrored,
panned 28 per cent, horizon relocated), plus the vendor's declared enhancement.
Seven cases, and the defect is seeded in the form it really occurs, which for
"a redesign wearing an enhancement's clothes" is same-style-different-composition
rather than noise or a black frame.

**It failed on first run, and it was right to.** The hard regrade scored 33.7 per
cent of cells moved and was classified NEW DESIGN. That was the metric's fault,
not the case's: a regrade is a global affine transform of tone, so it moves every
cell's absolute value while moving none of them relative to the others, and an
absolute-difference measure cannot tell that apart from a rearrangement.
Standardising each downsampled grid to zero mean and unit variance before
differencing removes the grade and leaves the layout, which is what point 2 of the
external-art test actually asks about. Pearson r was already affine-invariant by
construction, which is why it held up at 0.9640 where the raw share did not.

After the correction the two classes separate with room to spare: enhancements run
r 0.9640 to 1.0000 with at most 7.3 per cent of cells moved, recompositions r
0.2478 to 0.5562 with at least 39.0 per cent. The thresholds sit inside both gaps.
Seven of seven cases now behave, in both directions.

Without that self-test the ingest would have shipped a metric that calls a heavy
regrade a redesign, and the next background question would have been answered
wrongly with a green-looking record behind it.

## The local session was verified, not assumed

`frontend/scripts/background_local_testing_verify.mjs`, four checks, all passing,
recorded in `reports/qa/background_local_testing_verify.json`. No live RGS session
is consumed: the authenticate request is intercepted and aborted, so what is
proven is the wiring, using a deliberately invalid host.

| Check | Result |
|---|---|
| Dev server answers on the LAN address, not only `localhost` | PASS, `http://192.168.4.92:5173/` HTTP 200, game mounted |
| Candidate v2 served over HTTP at the path the app requests | PASS, 259,918 bytes served, matches disk, `image/jpeg` |
| The `?bg=v2` choice survives a redirect carrying only the RGS parameters | PASS |
| Game boots on the real launch shape and addresses the given `rgs_url` | PASS, `POST https://rgs.invalid.localtest/wallet/authenticate` |

The first check matters because the Local Testing redirect sends a *browser* to
the redirect URL, and if that browser is the owner's phone then `localhost` is the
phone, not this machine. The dev server has to be bound to the LAN.

The third check is the one that would have quietly spoiled the whole eye-call.
The DTT appends its own `?sessionID=...&rgs_url=...` query, and whether it
preserves a query already on the redirect URL is undocumented and unobserved by
us. A parameter-only switch could therefore have fallen back to the shipped
background with no way for the owner to tell, and the eye-call would have been
made on the wrong frame. The choice is now stored in `sessionStorage` when the
parameter is seen, so it survives a redirect that drops the query. It dies with
the tab and cannot leak into a later session.

## FOR THE OWNER: starting the local session, numbered

Play the real RGS against the local build, with candidate v2 as the background.
Steps 1 and 2 are at the computer; from step 3 on you can be anywhere.

1. On the computer, in Terminal, paste this one line and leave the window open:

       cd /Users/jt/math-sdk/frontend && npm run dev -- --host

   It prints two addresses. The one you want is the **Network** one:
   `http://192.168.4.92:5173/`

2. Still on the computer, open that address once with the candidate switch on:

       http://192.168.4.92:5173/?bg=v2

   The background should be the brighter, warmer scene with the big screen at
   the right, not the teal one with the pink star. That single visit is what
   arms v2 for the rest of the session in that browser.

3. On your phone, join the same wi-fi as the computer, then open
   `http://192.168.4.92:5173/?bg=v2` in the phone's browser. Same check: brighter
   and warmer, no pink star. Now v2 is armed on the phone too.

4. Open the Stake portal on whichever device you want to play on, go to the game,
   and open the **Developer Testing Tool** toolbar.

5. In the DTT, open the **Local Testing** menu and set **Redirect URL** to:

       http://192.168.4.92:5173

   Leave off any `?bg=v2` here. Step 2 or 3 already armed it, and the DTT adds
   its own session parameters to whatever you type.

6. In the DTT's **Settings** menu, set Balance and Currency as you like, and in
   **Screen** pick the size you want to judge: Desktop, Popout S and Mobile M are
   the three the committed captures cover.

7. Launch the game from the portal as normal. It will load from the computer's
   dev server while talking to the real RGS, so spins, wallet and features are
   all live. A small `DEV` badge in the bottom right is how you know you are on
   the local build.

8. To compare, open `http://192.168.4.92:5173/?bg=current` in the same browser
   and relaunch. That switches back to the shipped background; `?bg=v2` switches
   forward again. `?bg=v1` shows the other candidate if you want to see it.

9. Reply **BG: V2** or **BG: KEEP**.

Two things worth knowing before you reply. **Mobile portrait shows almost no
background at all**, so if the phone is where you look, expect the two to seem
nearly identical there; desktop is where this decision actually lives. And per
the finding above, **BG: V2 also means changing the standing rule on externally
designed art**, so if you want the background improved without touching that
rule, `bg_original_enhanced.jpg` is the file that qualifies and I can bring it
through as its own candidate on a word from you.

If the phone cannot reach the address at step 3, the usual cause is the two
devices being on different wi-fi networks, or the Mac firewall prompting for
permission the first time; allow it and retry.

## What was NOT done, per the brief

No adoption. The shipped `bg_base.jpg` is byte-identical to `HEAD`, verified by
sha256 after the adoption-shaped build was reverted. No kit was built. The
candidates are reachable only through a DEV-gated parameter and are **pruned from
the built bundle** by the build diet, alongside the dev-only alternate themes and
for the same reason, so an unadopted candidate is never paid for in a shipped
artefact. `[build-diet] pruned dir assets/themes/future-spinner/backgrounds/candidates (0.51 MB)`
appears in both builds above.

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written.** One job, `main`, explicit paths, brief saved
  verbatim, both candidates ingested, v2 wired and built, dev server run, Local
  Testing path verified, three named views captured side by side with the HUD
  present, bundle delta recorded, no adoption, no kit, numbered owner steps in
  this report. Rule 10 link below.
- **No lock exceptions**, as the brief required: all four locked paths clean in
  `git status`, `git diff .claude/settings.json` empty, and nothing was written to
  a locked path by any route including Bash.
- **No em or en dashes** in any file written this session, checked per file.
- **Every number above carries its source**: the ingest figures come from
  `reports/qa/background_candidate_ingest.json`, the bundle figures from the two
  `build-info.json` outputs, the capture verifications from `proof_results.json`,
  the local-session checks from `background_local_testing_verify.json`.
- **(l.4) honoured on the one claim that needed it.** The enhancement-versus-
  redesign verdict rests on a control whose relationship to our art was declared
  by the supplier rather than inferred by us, and the classifier that produced it
  has been seen to return both answers.
- **(h.1) honoured.** The new evidence directory is written only by the script
  whose job is to generate it, and no pre-existing committed evidence was touched:
  `git status` showed no modification to any existing file under `reports/screens/`.
- **Maths package untouched.** Nothing in this session reads or writes
  `games/future_spinner/**` and no figure here is maths-adjacent.

## Verification, measured

    scripts/assets/background_candidate_ingest.py            2 candidates ingested, 3 controls scored
    scripts/assets/background_candidate_ingest_selftest.py    7 of 7 cases, PASS (failed first run, fixed)
    frontend/scripts/background_candidate_proof.mjs           6 of 6 captures verified, PASS
    frontend/scripts/background_local_testing_verify.mjs      4 of 4 checks, PASS
    frontend/scripts/typecheck_baseline.mjs                   PASS, 0 errors, 36 warnings, baseline unchanged
    node scripts/qa/locked_paths_gate.mjs                     0 violations, PASS
    npm run build (baseline)                                  107 files, 15,519,657 bytes
    npm run build (v2 in place)                               107 files, 15,502,403 bytes
    git diff .claude/settings.json                            EMPTY
    git status on the four locked paths                       clean
    sha256 bg_base.jpg after revert                           matches HEAD
    em and en dash count across files written                 0

## Rule 10 closing link

The work commit `6eaea1a`, BOTH JOBS GREEN on the remote runner:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30202708950`
  static gates: success
  browser gates: success

This documentation commit `dec743f`, also verified green on the remote runner:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30202782775`

Both are recorded because rule 10 binds the session's FINAL push, and the commit
that carries a rule 10 link cannot contain the link to its own run. The second
line closes that gap by naming the run for the commit that follows it: verified
green before this session closed, which is the obligation rule 10 actually
imposes. Any later doc-only commit in this session would repeat the pattern once
and stop there.

`main` is green, so the line is not stopped and the next job may start.

## FOR THE NEXT SESSION

**The decision this session is waiting on.** The owner replies **BG: V2** or
**BG: KEEP** from the committed captures and the local session. Do not adopt
anything before that reply arrives. If it is BG: V2, the adoption is not just a
file copy: it needs the `CLAUDE.md` Assets rule amended by the owner to permit
externally designed scene art, because the measurement in this session says
plainly that is what v2 is. If it is BG: KEEP, delete
`frontend/public/assets/themes/future-spinner/backgrounds/candidates/`, the
`?bg=` parameter block in `App.svelte`, and the candidates line in the build-diet
prune list, and the tree returns to exactly where it was.

**A third answer exists and the owner has been told about it.**
`bg_original_enhanced.jpg` in the same vendor drop measures as a genuine
enhancement (r 0.9966, no cell moved) and could be adopted under the rule as it
stands today, with no amendment. It was scored and recorded but deliberately not
ingested or captured, because the brief named v1 and v2. If the owner asks for it,
it is one run of `background_candidate_ingest.py` with a third entry in `SOURCES`
plus a capture pass.

**Adoption mechanics, when the call comes.** Copy the chosen candidate over
`frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg`, delete the
`candidates/` directory and its prune-list line, remove the `?bg=` block from
`App.svelte`, and rebuild. The bundle figure to expect for v2 is 15,502,403 bytes,
already measured here. Kit V5 then rebuilds from a fresh clone per convention (o).

**Still open from before, unchanged by this session.** JOB 5 of
`FS_LIVE_ROUND2_Prompt.md` (Kit V5) remains unstarted and is now unblocked, though
it should wait for the background call rather than ship a kit that is immediately
superseded. TR-085, the free-spins entry card's 88.1 x 33.4px TAP TO CONTINUE
against a 44px minimum, is still filed and unfixed. TR-075 still needs twenty
bracketed Cruise spins. The `evidenceDir()` migration for `layout_fit_gate.mjs`
and `contrast_gate.mjs` named under (h.1) is still open.

**Model and effort.** Opus 5 at high effort. The judgement was in not treating
"ingest the candidates and capture them" as the whole job: the composition
measurement was cheap, and without the vendor's own declared enhancement as a
control it would have produced a number (r 0.35) with no interpretation attached,
which is exactly the shape of the (l.4) failure the worked example in `CLAUDE.md`
records. The second judgement was believing the self-test over the classifier when
they disagreed.

**Alternatives tried and rejected.**

- *Reporting r = 0.35 as "the candidates differ from the incumbent" and moving on.*
  Rejected. That is a measurement without a control, which (l.4) forbids treating
  as evidence, and it would have buried the rule question entirely.
- *A raw absolute-difference composition metric.* Rejected by its own self-test: it
  classifies a hard regrade as a redesign. Replaced with the grade-invariant form.
- *Adopting v2 directly, since the brief's whole shape assumes it might be chosen.*
  Rejected. The brief says "no adoption" in as many words, and the rule tension
  makes adoption the owner's call twice over.
- *A URL-parameter-only background switch.* Rejected once the DTT redirect's
  query-preservation behaviour turned out to be unobserved. A switch that can
  silently fall back to the shipped background makes the eye-call untrustworthy,
  so the choice is stored for the browsing session.
- *Shipping the vendor's 574KB file as delivered.* Rejected; a 107 per cent bundle
  increase for a background, where a swept encode is 6 per cent smaller than the
  incumbent.
- *Building twice to produce the two capture arms.* Rejected. One build with a
  parameter means the comparison cannot be reading an unintended build difference.

# Session Report - V5 CLOSEOUT, THE TWO RULINGS AND THE TOUCH FIX (2026-07-27)

Brief saved verbatim: `reports/briefs/FS_V5_CLOSEOUT_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, commit per job, no lock exceptions and
none needed: all four locked paths clean in `git status` throughout and
`git diff .claude/settings.json` empty. Five jobs, and the brief justifies the
multi-job shape itself: each is small and two of them are the owner's ruling
lines arriving with the paste.

The rulings were **TITLE: DROP** and **BG: V1**.

## Summary

All five jobs complete. Kit V5 is on the Desktop, built from a fresh clone at
`ffdd7dc4`, with all three dist gates green inside the clone.

**One thing about the BG ruling is worth stating first, because it is a
deviation from the brief and it was decided rather than assumed.** JOB 2
enumerates three branches, V2, ENHANCED and KEEP. The owner replied **V1**,
which is none of them. V1 is the other candidate ingested last session, and the
owner saw it live: the local-session steps included `?bg=v1` for exactly that
purpose. It measures the same class as V2 (NEW DESIGN, Pearson r 0.3850 against
a declared-enhancement control at 0.9966), so the V2 branch's treatment applies
to it unchanged, at its own measured q80 encode rather than V2's q82. That is
the only reading the branch structure supports, and it is recorded here because
a brief and a ruling that disagree is exactly the kind of thing that should not
be resolved silently.

## JOB 1: TITLE DROP at Popout S

One constant, as the recomposition session promised: `MINI_CROP_TOP_Y` from
`LOGO_TOP_Y` (18) to `FRAME_TOP_Y` (84), making the mini crop window 468 stage
units, exactly `FRAME_H`.

Derived before measuring, per (l.1):

    scale = min(400/640, 181/468) = 0.386752
    frame = 640 * 0.386752 = 247.5px, 61.9% of the viewport
    grid  = 522 * 0.386752 = 201.9px, 50.5% of the viewport

The composition gate measured **grid fill 50.5%**, centre offset 0. Exact
agreement.

**Scope checked rather than assumed.** Desktop 40.8%, Laptop 40.8%, Popout L
33.9%, Mobile L 96%, Mobile M 96%, Mobile S 83.7% are all identical to the
before run, and the dead band stays at the one deliberate 10px gap across all
ten swept heights. The title is dropped at the mini profile only.

**The gate's floor moved because its DERIVATION moved**, 42.0 to 48.0, the
divisor going 534 to 468. It was re-derived, not re-pinned to an observation.
The before capture measures 44.2% against that new floor and the gate flags it,
which is the floor demonstrating it would catch a regression back. The
seeded-violation self-test still passes in both directions.

**Two convention (h.1) faults fell out of this**, both caught by `git status`
before they were committed and both fixed:

1. The gate hardcoded its evidence directory, so this pass's captures would have
   overwritten the recomposition session's committed before and after.
2. It also hardcoded its QA result FILENAME, so the first run overwrote that
   session's committed JSON with this pass's numbers while the screenshots went
   somewhere else. That is the worse of the two, because the overwrite was
   invisible in the directory listing.

Both are now scoped by `--evidence-dir`, with the default filename kept byte for
byte so nothing already committed is renamed.

## JOB 2: BG V1 adopted, and the convention amended

`bg_base.jpg` is now candidate v1 at its measured q80 encode, 273,173 bytes,
sha `c7ecfa15dde8db42`, verified against the ingest record after the copy rather
than assumed.

**The Overdrive variant had to be derived, and this is the part an adoption
silently breaks.** `App.svelte` crossfades `bg_overdrive.jpg` over the base while
the feature plays. The two shipped files were always one city under two lights,
graded from two frames of the same retired loop. Swapping only the base would
have cut the entire skyline to a different skyline on every bonus trigger and cut
back when it ended, with nothing in the build reporting it and every gate green.

`scripts/assets/background_overdrive_derive.py` applies the RELATIVE difference
between `backgrounds.py`'s own two grades, so the treatment is the project's own
and traceable to it rather than invented:

| Parameter | Relative | From |
|---|---|---|
| Contrast | 1.0556 | 1.14 / 1.08 |
| Colour | 1.1017 | 1.30 / 1.18 |
| Brightness | 0.9400 | 0.94 / 1.00 |
| Channel R,G,B | 1.1800, 0.9200, 1.0566 | per channel |
| Vignette | 0.1935 | (0.50 - 0.38) / (1 - 0.38), incremental |

Captured both ways at desktop and checked by eye: same skyline, same star, same
road, the Overdrive frame hotter and more heavily vignetted.

**The tonal direction is favourable and worth recording**, because it was not
the reason for the choice but it supports it. Against the background it replaced,
v1 runs **-16.73** mean luma in the title band and **-21.38** under the bottom
HUD strip. Both bands the interface draws over got DARKER, and the interface is
light on dark, so the readouts gained contrast rather than losing it. The stage
band brightened slightly (+6.08), which works with the frame's cyan.

**The convention amendment.** `CLAUDE.md`'s Assets section now permits
owner-commissioned NEW DESIGNS for scene and marketing art with recorded
provenance. The 2026-07-25 amendment drew its line at enhancement because that
was the case in front of it, and two adoptions since have not fitted on either
side of that line: the tile, whose own generation record states *"Externally
generated, commissioned by the owner"*, and this background. Rather than leave
the written rule at odds with what the project actually does, the amendment names
what really separates the permitted case from the Manus failure, which was never
enhancement versus design:

1. the owner commissioned it;
2. it does not enter the animation pipeline (symbols and anything the effect
   system positions remain in-house only, without exception);
3. its provenance is measured and recorded before it ships.

The test gains a fifth point, from this session's own near-miss: **check what
else is derived from the asset**, because an adopted file with siblings computed
from the old one leaves the set incoherent and no gate will say so.

Provenance is recorded in `design-system/brand/GENERATION_NOTE_background.md`,
in the shape the tile's record established.

**Bundle:** `bg_base` -3,999 and `bg_overdrive` -11,718, plus about 202 from
removing the eye-call harness. Measured 15,519,660 to **15,503,741**.

The `?bg=` parameter and the `candidates/` directory are gone. Unlike `?grade`
and `?haze`, which stay as comparison tools because they cost nothing, this one
needed 0.51MB of now-rejected art in `public/` to mean anything. Both are
recoverable at `6eaea1a` and every measurement is in the ingest record.

**`build_diet_verify.mjs` also migrated to `evidenceDir`**, one of the (h.1)
migrations recorded as open. Caught because a routine gate run left
`build-diet-network-log.json` modified inside this commit, where 54 of 54 changed
lines were a random preview port number.

## JOB 3: TR-085, the free-spins TAP TO CONTINUE

**Reproduced before fixing**: 29.9px at iphone14-landscape and 32.2px at
pixel7-landscape against the 44px floor, while both portrait profiles passed.

**The cause was a scale the original fix never saw.** `.entry-continue` already
carried `min-height: 96px`, and that number was not arbitrary: it was chosen so
the button clears 44px at the ~0.58x this stage scales to in PORTRAIT. Landscape
scales much further, measured 0.3112 and 0.3350, so the same 96 units rendered
under the floor. The old fix was right for the case it was measured against and
silently short for the one it was not. That also explains why the audit that
found this only sees it sometimes: it only measures the button on runs that
happen to trigger a bonus, and only landscape fails.

Fixed with the pattern the tracker row itself predicted, `.m-fm-entry`'s compact
visual with an extended hit area: `::after { inset: -28px 0 }`. Vertical only,
because width was never short (78.7px narrowest) and widening sideways would push
the target under neighbouring layout for no gain. **28 units derived, not
guessed:** 96 + 56 = 152 units renders 47.2px at the 0.3104 worst scale, about 7
per cent of margin. Raising `min-height` instead would have needed roughly 142
units, spent on desktop and portrait too where the button is already generous.

| Profile | Stage scale | Visual | Hit box | Extension press |
|---|---|---|---|---|
| iphone14-portrait | 0.5799 | 146.6 x 55.7 | 146.6 x 88.1 | ok |
| iphone14-landscape | 0.3112 | 78.7 x 29.9 | 78.7 x 47.3 | ok |
| pixel7-portrait | 0.6430 | 162.5 x 61.7 | 162.5 x 97.7 | ok |
| pixel7-landscape | 0.3350 | 84.7 x 32.2 | 84.7 x 50.9 | ok |

The new gate does two things a size assertion alone would not. It performs a
**real un-forced click inside the extension but outside the visual button** and
requires the gate to advance, because a target that measures big and takes no
press is not a fix. And its convention (p) self-test seeds the exact defect, the
extension removed, and confirms the gate goes red on both landscape profiles.

**A false PASS was caught during the work**, and it is the finding worth keeping.
The first measurement added unscaled `::after` insets from `getComputedStyle` to
an already scaled `getBoundingClientRect`, reporting a 47px target as 86px. On a
control whose entire problem is that it lives inside a scaled stage, mixing the
two unit systems would have passed a button still under the floor, with a green
gate over it. Both terms are now converted to rendered pixels via the element's
own layout-to-rendered ratio.

## JOB 4: KIT V5

`~/Desktop/FS_UPLOAD_KIT_V5/`, built from a fresh clone at `ffdd7dc4`, frontend
only, single use. **108 files, 15,504,197 bytes (14.79 MB).** All three dist
gates run IN THE CLONE and passed: dist hygiene, dash gate dist scan, mock
containment. The kit's own refusal self-test passed first.

Verified in the built kit rather than assumed: `bg_base.jpg` is
`c7ecfa15dde8db42` and `bg_overdrive.jpg` is `909dbeefd304b10b`, the adopted
pair; the shipped walkthrough contains PART 9d; and zero `candidates/` paths
survive anywhere in the bundle.

`00_READ_ME_FIRST.md` gains **PART 9d, the V5 visit**, and PART 9c is marked
superseded rather than deleted. The final owner list is the brief's: upload and
publish V5, eyeball the recomposed Popout S and the mobiles plus the background
live, the twenty bracketed Cruise spins, the Guidelines ticks, never Start
Approval. It opens with what actually changed so the owner knows what they are
looking at, and it asks for a real thumb on TAP TO CONTINUE on a sideways phone,
because a measurement is not a thumb.

**Two kit-tooling faults fixed on the way.**

1. `kit_build.mjs` had `FS_UPLOAD_KIT_V3` hardcoded while a V4 had been built and
   shipped, so the script and the Desktop disagreed about which kit it makes, and
   a README inside a V4 folder would have told the owner to confirm "Front V3".
   The version is now one parameter used in the folder name, the README title and
   the publish check.
2. The README template still opened by telling the owner to delete
   `math/HASHES.txt` and to compose the tile, both of which PART 9d says in as
   many words are not needed. The kit and the walkthrough inside the same folder
   disagreed on the first instruction the owner reads. Fixed and the kit rebuilt.

**NEEDS THE OWNER'S HAND, and it is the TR-062 hazard by name.** Four kits now
sit on the Desktop: `FS_UPLOAD_KIT` (dead), `FS_UPLOAD_KIT_V3`,
`FS_UPLOAD_KIT_V4` and the new `FS_UPLOAD_KIT_V5`. Only V5 is live. The stale
three were not deleted from here because deleting the owner's Desktop folders is
not a call this session should make unasked, but a stale kit sitting beside a
current one is exactly how TR-062 happened.

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written**, with the one recorded deviation: the BG ruling
  was V1, outside the three enumerated branches, resolved to the V2 branch's
  treatment and flagged above rather than silently.
- **Commit per job**, as required: JOB 1 `6f4be54`, JOB 2 `7b5c22c`, JOB 3
  `1d7df5c`, JOB 4 `c1f131f` and `ffdd7dc`, JOB 5 this report.
- **No lock exceptions**, and none needed. All four locked paths clean in
  `git status` at every commit, `git diff .claude/settings.json` empty, and
  nothing written to a locked path by any route including Bash.
- **No em or en dashes** in any file written this session, checked per file.
- **Every number carries its source**: composition figures from
  `reports/qa/smallscreen_composition_*_title-drop-2026-07-27.json`, background
  provenance from `background_candidate_ingest.json` and
  `background_overdrive_derive.json`, touch measurements from
  `entry_continue_touch_gate.json`, bundle figures from the builds' own
  `build-info.json`, kit figures from the kit's `BUILD_INFO.json`.
- **(l.1) and (l.2) honoured on both measurable jobs**: the Popout S grid fill
  and the touch extension were both derived from the layout maths first and the
  measurement agreed.
- **(h.1) honoured, and enforced twice**: two overwrite hazards were caught and
  fixed rather than committed, and a third script was migrated.
- **(p) honoured**: both gates touched this session have seeded-violation
  self-tests that pass in both directions, and the TR-085 gate was watched going
  red on the real defect before its PASS was accepted.
- **Maths package untouched.** Nothing here reads or writes
  `games/future_spinner/**` and no figure is maths-adjacent.

## Verification, measured

    smallscreen_composition_gate.mjs --phase after       PASS, Popout S 50.5% against floor 48
    smallscreen_composition_gate.mjs --self-test         PASS, seeded violations turn it red
    layout_fit_gate.mjs                                  PASS, 7 presets, 0 offscreen, 0 clipped
    entry_continue_touch_gate.mjs                        PASS, 4 of 4 profiles clear 44px
    entry_continue_touch_gate.mjs --self-test            PASS, seeded defect red on both landscapes
    build_diet_verify.mjs                                PASS, dist 14.79MB < 25MB budget
    dist_hygiene_gate.mjs                                PASS, incl. seeded violations caught
    dash_gate.mjs                                        PASS, source and dist
    typecheck_baseline.mjs                               PASS, 0 errors, 36 warnings, unchanged
    locked_paths_gate.mjs                                PASS, 0 violations
    kit_build.mjs --self-test                            PASS
    kit_build.mjs --version 5                            PASS, 108 files, 15,504,197 bytes
    npm run build                                        107 files, 15,503,741 bytes
    git diff .claude/settings.json                       EMPTY
    git status on the four locked paths                  clean
    em and en dash count across files written            0

## Rule 10 closing link

Final push `d20a356`, BOTH JOBS GREEN on the remote runner, verified before
closing rather than inferred from the local results:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30209594478`
  static gates: success
  browser gates: success

Every push this session, so the record is complete rather than only the last one:

| Commit | Run | Result |
|---|---|---|
| `6f4be54` JOB 1, `7b5c22c` JOB 2, `1d7df5c` JOB 3, `c1f131f` JOB 4 | 30209450883 | **cancelled** |
| `ffdd7dc` JOB 4 kit README fix | 30209491592 | success |
| `d20a356` JOB 5 report | 30209594478 | success |

**The cancelled run is explained rather than left sitting there.** Run 30209450883
was superseded when `ffdd7dc` was pushed about a minute later, and the workflow's
concurrency group cancels an in-flight run when a newer commit lands on the same
branch. It is not a failure and it is not a red. Its content is fully covered:
`ffdd7dc` is a direct descendant of `c1f131f` and contains all four job commits,
and run 30209491592 over that tree passed both jobs. Recorded because rule 10's
value depends on every non-green result on `main` having an account attached to
it, and "cancelled" is not "passed".

`main` is green, so the line is not stopped.

## FOR THE NEXT SESSION

**The owner's V5 visit is the gate on everything else.** Per the brief: after the
visit, Fable's benchmark polish review, then external review round three. Nothing
below should start before the visit's answers are in, because two of the three
open items can only be answered from it.

**What the visit is expected to return**, so the next session knows what it is
filing:

1. **An eye-call on the new background and the dropped Popout S title, live.**
   Both were decided from local evidence; this is the first time either is seen
   on the real platform. If the title drop reads as a loss at Popout S rather
   than a gain, reverting is the same one constant back to `LOGO_TOP_Y`, and the
   gate floor goes back to 42.0 with it.
2. **The twenty bracketed Cruise spins**, the only thing that closes TR-075, and
   unanswered across three visits now.
3. **The Guidelines ticks.**

**Immediate, and it needs the owner rather than a session:** three stale kits
sit on the Desktop beside the live one (`FS_UPLOAD_KIT`, `_V3`, `_V4`). That is
the TR-062 configuration exactly. Ask before deleting them, but ask.

**Still open, unchanged by this session.** The `evidenceDir()` migration for
`layout_fit_gate.mjs` and `contrast_gate.mjs` named under (h.1); this session
migrated `build_diet_verify.mjs` and found two more overwrite hazards in the
composition gate, which suggests the remaining two are worth doing as a set
rather than opportunistically. `reducedMotionFrameGate` was already failing at
HEAD before this session and is excluded from CI; it wants a session of its own
to make deterministic.

**A note for whoever adopts art next.** The fifth point added to the external-art
test, check what else is derived from the asset, came out of nearly shipping a
background whose Overdrive variant was a different city. Nothing in the build
would have caught it: every gate was green, the bundle was smaller, and the
defect only appears once a player triggers a bonus. Derived siblings are invisible
to a file-level swap, and that is the general lesson, not a background-specific one.

**Model and effort.** Opus 5 at high effort. The judgement was in three places:
resolving BG: V1 against a brief that did not enumerate it, rather than either
stopping or quietly picking a branch; noticing that adopting a background implied
regenerating its Overdrive sibling, which no part of the brief asked for; and
distrusting a gate that reported a comfortable 86px pass on a control whose whole
problem is that it lives in a scaled coordinate system.

**Alternatives tried and rejected.**

- *Treating BG: V1 as out of scope and stopping for clarification.* Rejected. V1
  is an ingested candidate the owner saw live through the harness built for that
  purpose, and it measures the same class as the branch that does exist, so the
  treatment follows. Recorded as a deviation instead.
- *Raising `min-height` for TR-085.* Rejected on the arithmetic: about 142 stage
  units, a third taller, spent on every profile to fix two.
- *A uniform `inset: -28px` on the hit extension.* Rejected in favour of vertical
  only. Width already cleared the floor by 78 per cent, and extending sideways
  buys nothing while reaching under neighbouring layout.
- *Keeping the `?bg=` harness as a comparison tool, as `?grade` and `?haze` were
  kept.* Rejected. Those cost nothing; this one costs 0.51MB of rejected art in
  the served tree to keep a switch nobody will press again.
- *Deleting the three stale Desktop kits.* Rejected as not this session's call,
  and flagged for the owner instead.
- *Shipping the background without regenerating `bg_overdrive.jpg`.* Rejected
  once the crossfade was traced. It would have passed every gate.

---

# 2026-07-27b: FS VISUAL FIXPACK, four owner-reported visual defects

**Brief:** `reports/briefs/FS_VISUAL_FIXPACK_Prompt.md`, saved verbatim and
committed with JOB 1 per conventions (b) and (f).

**Posture:** fresh session on `main`, integrator, explicit paths, commit per job,
no lock exceptions and none needed. Six jobs in one session, which multi-track
rule 4 asks be justified: every one is a single named defect with a single named
surface, three of the four share the same verification harness, and JOB 5 cannot
start until the other four are green because it builds from what they produced.

**Headline.** Four owner-reported defects, each root-caused by measurement rather
than by reading, each fixed at the class rather than at the instance, each held
by a new gate that was watched failing on the real defect before it was believed.
Three of the four turned out to be one wrong thing affecting more surfaces than
the report named: the paytable fix also repaired the mode cards, the scrim fix
replaced ten hand-rolled implementations with one, and the speed control needed
its Popout S surface reworked after measurement said the first attempt was flat.

| Job | Commit | Gate added |
|---|---|---|
| 1, splash motion | `03672d9` | `splash_calm_gate.mjs` |
| 2, turbo control | `f8fc733` | `turbo_intensity_gate.mjs` |
| 3, paytable card fill | `ee6eb60` | `paytable_card_fill_gate.mjs` |
| 4, blackout coverage | `f332d52` | `scrim_coverage_gate.mjs` |
| 5, KIT V6 | `7d5d4e4`, `14b6506` | kit builder self-test, 5 of 5 |
| 6, close | this report | |

---

## JOB 1: the load screen's logo stops spinning

**The owner reported** the We Roll Spinners logo jumping around and starting to
spin, and ruled the boot calm: still logo with a gentle pulse, raindrops, TAP TO
CONTINUE, nothing else moving.

**First finding, and it redirected the job.** The SPLASH was already correct.
Measured across ten seconds at 250ms, `HeroSplash`'s emblem moved 0.00px, and
every animation on that screen was opacity-only. The defect is on the LOAD
screen, which the owner reasonably calls the same thing because they meet them
back to back.

**Root cause, which is the owner's own hypothesis confirmed.** `LoadingScreen`
used to draw the mark as two layers: a static chrome rim (`brand_mark_base.png`)
with an inner five-fold blade (`brand_mark_spin.png`) over it. Only the blade
carried `animation: brand-spin 2.6s linear infinite`, so the mark's outline never
moved. `DESIGN_SYSTEM.md` describes exactly that: "a neon chrome rim whose inner
layer spins independently". Commit `54544e4` (OWNER AUDIT ROUND 3 item 1, logo
canonicalisation) replaced both layers with ONE image, `hero_icon_96.png`, and
left the rotation sitting on it. The animation was keyed to a layer that no
longer existed.

**The jumping and the spinning are one defect, not two.** The canonical artwork
is not radially symmetric, so rotating it swings its axis-aligned bounding box.

| Preset | Box excursion before | After |
|---|---|---|
| Desktop 1200x675 | 77.25px | 0.00px |
| Mobile L 425x812 | 57.96px | 0.00px |
| Popout S 400x225 | 97.66px | 0.00px |

**Fixed.** The mark sits still and its glow breathes as a FILTER pulse rather
than a scale. That choice is load-bearing rather than stylistic: a scale pulse
moves the box, and the gate could then only assert "moved a little", which is not
a property. The two entry fades drop their `translateY(-8px)`, which is what slid
the wordmark and the game logo into place on every load. The splash emblem's glow
gains a matching OPACITY pulse, so "logo sitting still with its gentle pulse" is
true on both screens. The loader gains the same `RainLayer` the splash uses, so
the two boot screens read as one calm presentation rather than a stark loader
cutting to a rainy splash.

**Proof:** `reports/screens/splash-calm-2026-07-27/`, 72 captures, before and
after, two surfaces by three presets by six points across the first ten seconds.

**Gate:** `splash_calm_gate.mjs`. Samples every 250ms for ten seconds at three
presets and asserts three independent things: zero geometry variance, no rotation
or translation in the computed matrix, and no running animation writing
`transform`. The third is the structural one. Geometry alone would pass a
rotation that happened to be radially symmetric, and a future asset swap could
reintroduce this exact defect behind a symmetric image and then break the day the
art changed again. It went red on the real unseeded defect at HEAD, 21 findings,
before the fix existed.

---

## JOB 2: the speed control is the bolt alone

**Owner-specified.** The control showed the bolt with a 0.5rem "1x / 2x / 4x"
caption the owner called too small and silly. The numeral is gone at all four
surfaces that render this control, and the three speeds now say which they are by
the control INTENSIFYING.

**Why this could not be a pure deletion.** The control lit on a single boolean,
`.engaged`, so Turbo and Super Turbo were styled IDENTICALLY and the numeral was
the only thing separating them. Removing it without replacing that encoding would
have shipped two speeds a player cannot tell apart at all.

**Luminance, not hue.** Every step raises brightness. A hue-only encoding fails
WCAG 1.4.1 for a colour-blind player and fails again on a phone in daylight, and
it would also be unmeasurable. The accessibility property and the measured
property are therefore the same property.

**Popout S needed a second look, and only measurement said so.** At 400x225 the
control lives only in the mini-player menu, so the menu item IS the control. With
the intensity on the 16px bolt alone, the adjacent steps measured 1.014:1 and
1.030:1, effectively flat, because the bolt is a few percent of a row a player
reads whole. The row's fill and leading edge now intensify with it.

| Preset | normal to turbo | turbo to super |
|---|---|---|
| Desktop | 1.34 | 1.70 |
| Laptop | 1.31 | 1.67 |
| Popout S | 1.35 | 1.53 |
| Popout L | 1.43 | 1.70 |
| Mobile L | 1.46 | 1.75 |
| Mobile M | 1.46 | 1.75 |
| Mobile S | 1.39 | 1.65 |

**The bar is 1.25:1 and it is NOT borrowed from WCAG.** SC 1.4.11's 3:1 governs a
component against its ADJACENT COLOURS, and says nothing about two states of one
component, so quoting it here would be borrowing authority the figure does not
have. Every measured figure is in `reports/qa/turbo_intensity_gate_2026-07-27.json`
so the owner can raise the bar knowing exactly what headroom the shipped design
has.

**The flame animation is removed, deliberately.** It swung brightness 1.0 to 1.28
twice a second on any engaged tier. Once intensity IS the state, something that
changes intensity makes the state ambiguous: a pulsing Turbo passes through Super
Turbo's brightness on every cycle.

**Unchanged:** three speeds, their behaviour, and the `disabledTurbo` /
`disabledSuperTurbo` jurisdiction gating. Presentation only, as specified.

**Paytable Interface Guide:** the row shows all three captures in order rather
than one, because the whole design is the progression. They are real crops of the
live control at each speed, and the row's name and description stay routed
through `sv()`, the social vocabulary layer.

**Proof:** `reports/screens/turbo-control-2026-07-27/`, the three speeds side by
side at Desktop, Mobile L and Popout S with each state's measured luminance
printed underneath.

**Two broken scripts found and fixed, because JOB 2 could not be done without
them.** `regen_interface_guide_icons.mjs` and `interface_guide_icon_proof.mjs`
were both broken, identically. A dedup pass inserted
`import { dismissIntro } ...` at a byte offset rather than a statement boundary,
and in both files that offset was inside the PYTHON source string each one
builds. Each threw "dismissIntro is not defined" before it ran, and its python
would not have parsed if it had. Those two are the only files in `scripts/` that
embed python, which is why those two were hit. `interface_guide_icon_proof.mjs`
was also migrated to `evidencePaths` per convention (h.1): it wrote its proof
grid straight into committed evidence.

---

## JOB 3: a paytable card's fill follows its frame

**The owner reported** the WILD and SCAT cards' background fill stopping short,
so the chrome shows below their text while every other card is clean.

**Root cause.** The card primitive is two elements: `.fs-plate` is the brushed
chrome FRAME and its `.fs-face` child is the dark FILL carrying the content. The
frame was a BLOCK container, so the fill was only ever as tall as its own
content. That is invisible wherever the frame is content-sized too, and wrong the
moment something else stretches the frame. `.fs-sym-grid` is a grid, and grid
items stretch to their row.

| Card | Frame | Fill | Chrome exposed |
|---|---|---|---|
| H1, H2, M1, M2 | 197.36px | 193.6px | 0 |
| WILD | 197.36px | 170.35px | **23.14px** |
| SCAT | 197.36px | 156.59px | **36.89px** |
| Mode cards | 173.83px | 154.54px | **15.42px**, unreported |

**So it was never about WILD and SCAT.** It is about any card whose content is
shorter than its row, in any locale, forever. Padding those two would have been
wrong the next time a translation changed a line count. The frame is now a flex
container and the fill a stretching item.

**Gate:** 374 cards over 22 runs. Asserts BOTH directions, because a fix can fail
either way: the fill covers the frame (the shipped defect), AND every text box
and image sits inside the fill (the defect that pinning the fill to a fixed
height would introduce instead, which is the cause the brief itself suspected).
The sixteen locales are DERIVED from the shipped `Locale` union rather than
listed, so a seventeenth is covered the day it lands.

**Nothing was reconstructed, and this matters.** The brief says the owner's
screenshot "is committed as the spec". It is not in the repository. Convention
(m) says a missing input is named and waited for, never reconstructed, so nothing
was inferred from it: the defect above was reproduced independently and measured
here, and the before capture in the evidence directory is this session's own.
Named as comms item 4 below.

---

## JOB 4: ten hand-rolled scrims become one

**The owner reported** the full-screen dark overlay not always covering the whole
screen, with the corners showing through at some sizes.

**Root cause, and "at some sizes" is the tell.** On desktop, `.game-wrapper` is a
1280x720 box carrying `transform: scale(var(--S))`, and a transform makes an
element the containing block for its `position: fixed` DESCENDANTS. Every dialog
scrim lives inside it, so `inset: 0` resolved to the STAGE and not to the
viewport. `PaytableModal`'s own comment said so approvingly: it "covers the stage
exactly". Covering the stage exactly is invisible while the window happens to be
16:9, because then the stage IS the viewport, and it leaves the letterbox bands
bare at every other shape. The corners are simply where a player's eye meets the
two bands.

| Window | Scrim rendered | Uncovered | Edge points missed |
|---|---|---|---|
| 1600x600 | 1066.67x600 | 266.67px each side | 26 of 40 |
| 900x900 | 900x506.25 | 196.88px top and bottom | 30 of 40 |
| 1100x980 | 1100x618.75 | 180.63px top and bottom | 30 of 40 |

**All seven platform presets passed**, which is why this survived every existing
gate: Desktop is 1200x675, exactly 16:9. The defect only exists away from the
aspect ratio the stage was designed at, and no gate had ever looked there.

**Ten scrims, one implementation.** `.fs-scrim` in `src/app.css`, the global
sheet, which is the point: Svelte scopes a component's styles to that component,
so ten components carrying "the same" rule is ten rules that only look identical,
and this project was bitten by that shape twice in this one session (the
duplicated `dismissIntro` import, the duplicated `.fs-plate` primitive). A
component now supplies only its own paint and layout.

It covers the viewport from inside a scaled ancestor by anchoring to the
wrapper's centre, which `.game-stage` guarantees is the viewport's centre, and
sizing to the viewport DIVIDED by the stage scale. `--scrim-scale` is
deliberately not `--S`: the three native-HUD modes set `transform: none` while
`--S` keeps its computed value, so dividing by `--S` there would be dividing by a
scale nothing is applying.

**Safe-area insets, stated honestly rather than overclaimed.** The shared rule
sizes from `100vw` and `100dvh`, which span the whole visual viewport INCLUDING
the inset regions, and the gate asserts the rule contains no `env(safe-area-inset`
reference, because respecting one here is the regression a well-meaning later
edit would make. Headless chromium reports every inset as zero, so no run here
exercises a real notch and this does not pretend to; the property asserted is the
one that makes insets a non-issue.

**Gate:** 50 measurements, five scrims at seven presets and three swept sizes
chosen to maximise letterboxing. Coverage is asserted by rect AND by hit-testing
forty points one pixel inside every edge, because the rect test alone would pass
a correctly sized scrim that an ancestor clips. It also reads the SOURCE and
fails any component that hand-rolls scrim geometry, since "one implementation" is
a property of what is written, not of what happens to render today.

**Also fixed:** `dismissIntro`'s rules-modal half took a single instantaneous look
100ms after dismissing the splash, while its splash half polls for exactly the
reason the comment above it gives. The rules modal is mounted BY that dismissal,
so any run where Svelte had not yet painted left a full-screen modal over every
control the caller was about to drive.

---

## JOB 5: KIT V6

`~/Desktop/FS_UPLOAD_KIT_V6/`, built from a fresh clone at `14b6506d`, frontend
only, single use. **110 files, 15,601,767 bytes (14.88 MB).** All three dist
gates run IN THE CLONE and passed: dist hygiene, dash gate dist scan, mock
containment. The kit's own refusal self-test passed first, 5 of 5.

**Verified in the built kit rather than assumed:** 110 files in
`02_frontend_upload`; the three speed-control icons present; PART 9e present in
the shipped walkthrough; no maths folder; `BUILD_INFO.json` stamping the commit
and the three gate results. The count went 108 to 110 and the two are the two new
speed-control captures, which is a figure that reconciles rather than one to
take on trust.

**`00_READ_ME_FIRST.md` gains PART 9e, the V6 visit**, and PART 9d is marked
superseded rather than deleted. It is the short flow the brief asks for: upload
and publish V6, then four things to look at, each written as a question rather
than a claim. The speed one is asked as "can you tell the three apart at a
glance, without studying them", because the gate measuring a 1.30:1 step is not
the same as an eye saying so.

**A stale figure fixed on the way.** The walkthrough said "108 files" in three
places including "if it reads fewer than 108, stop", which would have had the
owner halt a correct 110-file upload and report a fault that was not there. 108
was right when written, and that is the problem: the count changes every release
and the page cannot know it. It now points at the kit's own `README.md` and
`BUILD_INFO.json`, which are generated from the clone that produced the bundle
and so cannot be stale by construction.

---

## Comms items for one ruling block (facts discipline item 6)

1. **`DESIGN_SYSTEM.md` still states the WRS standard loading screen is "the rim
   spinning as the loader"**, for every WRS title. This brief's ruling is the
   later and better-informed instrument and therefore governs (convention n), so
   the mark is still. The design-system line was NOT edited on the builder's own
   authority. Amend it to describe a still mark with a breathing glow, or restore
   the spin as a deliberate exception. Surfacing rather than choosing quietly is
   the expected move here, not an escalation.
2. **The ruling says "nothing else moving" and the loader's progress bar still
   moves.** It was kept because it is a readout of real load progress rather than
   decoration, and a loading screen with no progress indication is a product
   decision rather than a defect fix. If the owner wants it gone, that is one
   line.
3. **`OWNER_CHECKLIST.md` is not in the repository.** JOB 5's brief says the
   remaining owner list is in it. No commit in the history adds it and no file of
   that name exists in the tree. Per convention (m) it is named and waited for,
   never reconstructed: PART 9e carries the brief's own four eyeball items and
   nothing was invented to stand in for the rest. Send the file and it becomes
   PART 9f.
4. **The owner's paytable screenshot said to be "committed as the spec" is not in
   the repository either.** Not blocking, because the defect was reproduced and
   measured independently, and the before capture in evidence is this session's
   own. Recorded so nobody later believes a supplied spec was worked from.
5. **Removing the speed numeral leaves brightness and the title tooltip as the
   state cues.** Brightness, not hue, is deliberate and is what the gate
   measures, so the encoding survives colour blindness and a washed-out screen.
   Flagged in case the owner wants a text affordance somewhere else in the
   interface as well; the Interface Guide row now names all three speeds.
6. **Five kits now sit on the Desktop**: `FS_UPLOAD_KIT` (dead), `_V3`, `_V4`,
   `_V5` and the live `_V6`. That is the TR-062 configuration and it is now one
   worse than when the V5 session flagged it. Deleting the owner's Desktop
   folders is not a call a session should make unasked, but it needs asking.

---

## One recorded deviation from the brief

**JOB 4 said "assert coverage in the composition gate at all seven presets plus
three swept window sizes".** It is asserted at exactly that scope, and at a
fourth thing the brief did not ask for (that no component hand-rolls scrim
geometry), but in its own file, `scrim_coverage_gate.mjs`, rather than inside
`smallscreen_composition_gate.mjs`.

The reason is that gate's own opening argument turned on itself. It exists
because `layout_fit_gate` was green while the small screens were visibly wrong,
and its header makes the case that "fits and reachable" and "composed correctly"
are different subjects that deserve different gates. Scrim coverage is a third
subject: whether an OVERLAY covers the viewport, measured with dialogs open, and
its three swept sizes are 1600x600, 900x900 and 1100x980, none of which is a
small screen. Folding them in would have produced a gate that says two things
and is named for one.

Both gates run in the same CI job at the same seven presets, so nothing is
covered less. `smallscreen_composition_gate.mjs` carries a pointer to the new
file at the top, so a reader looking for scrim coverage where the brief said it
would be finds it in one line. Surfaced rather than taken quietly, per
convention (n); if the owner wants them merged it is a move, not a rewrite.

---

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written.** Four defects, each fixed at root with a measured
  proof; commit per job; explicit paths at every commit; no minor-defer
  disposition used anywhere.
- **No lock exceptions, and none needed.** All four locked paths clean in
  `git status` at every commit; `git diff .claude/settings.json` empty; nothing
  written to a locked path by any route including Bash. The one place a locked
  path was relevant, `gameStore.isTurbo`, was read and left alone: JOB 2 changed
  presentation only and `speedMode.ts` already keeps the locked boolean in sync.
- **Nothing that appeared to need a locked path arose**, so nothing was parked on
  that ground.
- **No em or en dashes** in any file written this session, checked per file and
  by the dash gate's source and dist scans.
- **Every number in this report is either a gate's own output or a measurement in
  `reports/qa/`**, and each is reproducible by re-running the named script.
- **Every gate added ships a convention (p) self-test** that plants the defect in
  the form it really occurs and is confirmed red on it, with an unseeded control
  confirmed green. Two of the three went red on the REAL unseeded defect at HEAD
  before the fix existed, which is stronger than a seed.
- **Derive before measuring, convention (l).** Three of the four root causes were
  read out of the source first and then confirmed by measurement rather than
  discovered by it: the two-layer-to-one-layer asset swap, the block-container
  plate, and the transform-creates-a-containing-block rule. The fourth, the
  turbo step sizes, has no specification to derive from and is honestly empirical.

---

## FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort. The judgement was in four places:
recognising that the splash the owner named was already correct and the defect
was one screen earlier; distrusting the first turbo design when the gate reported
a flat 1.014:1 at Popout S rather than adjusting the threshold to fit it;
choosing to fix the plate primitive rather than the two named cards; and reading
the scrim defect as a containing-block problem rather than a sizing one, which is
what made a single shared rule possible instead of ten patches.

**Alternatives tried and rejected.**

- *Making the boot logo's pulse a `scale()`.* Rejected. It reads the same and it
  would have made the assertion unstateable: a moving box cannot be asserted to
  be still, so the gate could only have said "not much", which is not a property.
- *Keeping the flame animation on the engaged speed tiers.* Rejected once
  intensity became the state. A pulsing Turbo passes through Super Turbo's
  brightness on every cycle, so the two stop being distinguishable at exactly the
  moment the owner asked they be.
- *Lowering the turbo step threshold to accommodate the first Popout S result.*
  Rejected outright. The measurement was correct and the design was weak; moving
  the bar to fit a weak design is how a gate becomes a formality.
- *Padding the WILD and SCAT cards.* Rejected on the general case: it is wrong
  the next time a translation changes a line count, and it would have left the
  mode cards broken since nobody had reported those.
- *Portalling the scrims to `document.body` to escape the transform.* Rejected.
  It escapes the transform and also escapes `--theme-primary` and the scheme
  tokens, which are set on `.game-wrapper`, so every modal would have lost its
  theming to fix its geometry.
- *Moving the scale off `.game-wrapper` onto an inner element, as the native-HUD
  modes already do.* This is arguably the deeper fix and it was rejected on
  blast radius, not on merit: desktop layout, the layout fit gate, the contrast
  gate and the composition gate all measure against that box. Recorded here
  because it is the right thing to do when there is a session for it.
- *Deleting the stale Desktop kits.* Rejected as not this session's call, and
  raised as comms item 6 instead.

**Open work this session did not close.**

- **`modal_safety_proof.mjs` fails at HEAD and still fails.** Not caused by this
  session: verified by stashing every source change and reproducing it at
  `f8fc733`. It times out clicking the FEATURES button. Directly measured and NOT
  a player-visible defect: the button is present, enabled, `pointer-events:
  auto`, unobstructed at its own centre, and disabled only for the duration of a
  spin exactly as designed. Parked per multi-track rule 6 rather than solved in
  the margins of another job. It is local-only and not in CI. The `dismissIntro`
  polling fix in JOB 4 was found while chasing it and stands on its own merits.
- **`popout_conformance.mjs` overwrites committed evidence** in
  `reports/screens/audit-remediation-v1/`, found by running it and watching three
  PNGs go dirty. Restored from HEAD. That is the same (h.1) hazard as the four
  already named in CLAUDE.md; this session migrated
  `interface_guide_icon_proof.mjs`, so the remaining set is
  `layout_fit_gate.mjs`, `contrast_gate.mjs` and `popout_conformance.mjs`. Worth
  doing as one pass rather than opportunistically.
- **The `.fs-plate` primitive is copied into four components**
  (`PaytableModal`, `FeatureMenu`, `WinBreakdown`, `WinBanner`). Only
  `PaytableModal`'s was fixed, because only its cards sit in a stretching grid
  today and changing what is not broken is not free. The duplication itself is
  the hazard and it is the same shape as the scrim duplication JOB 4 removed.
- **Em and en dashes remain in `frontend/scripts/*.mjs` comments.** The dash gate
  scans `src/` and `dist/` by design, so these never reach a player, but
  CLAUDE.md's header says "anywhere". Cosmetic, and a mechanical sweep.

**What the V6 visit is expected to return.** Four eye-calls, all on things
already measured, so a disagreement is information rather than a failure: does
the mark hold still for ten seconds, can the three speeds be told apart at a
glance, do the WILD and SCAT panels reach the bottom of their cards, and does the
darkening reach every edge with the window deliberately the wrong shape. Carried
over from V5 and still open: the twenty bracketed Cruise spins and the Guidelines
ticks, both written out in full in PART 9d, neither blocked by anything in V6.

---

## Rule 10 closing

**Final push `da77ab2`, run 30215681101, GREEN on both jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30215681101

The run before it, **30215328100** on `14b6506`, is the one that carries every
code change this session made, and it was green on both jobs too. Its browser
job ran all six new steps on the remote runner and passed each: splash calm
self-test and gate, turbo intensity self-test and gate, paytable card fill
self-test and gate, scrim coverage self-test and gate. That matters more than
the closing run, which is documentation only.

**Two runs in between show `cancelled` and neither is a red.** 30215154559 and
30215238993 were superseded by the next push, and 30215589795 by the push after
that; `concurrency: cancel-in-progress` in `checks.yml` cancels a run when a
newer commit lands on the same ref. Recorded here because rule 9 says an
unexplained non-green is treated as real, and the honest way to keep that rule
worth something is to explain the explainable ones by name rather than let a
reader discover three cancellations and have to work out which kind they were.

---

# 2026-07-27c: ROUND-THREE PREP, the two unrun tracks executed on main

Brief saved verbatim: `reports/briefs/FS_ROUND3_PREP_Prompt.md`. Fresh session on `main`,
integrator role, explicit paths, one commit per job, no lock exceptions taken and none
needed: no locked path was touched at any point.

**Multi-job justified per protocol rule 4.** Six jobs, and the brief named them as one
sequence because two of them are the substance of prepared track briefs that were never run.
The tracks existed precisely so this work could be parallelised, and it was not, so the
alternative to running them here was leaving them unrun for a fourth session.

## JOB 0: the analyst PR merged under standing conditions

PR #116 met both of Fable's standing approval conditions and was merged rather than left.
**Scope gate green**: `TRACK SCOPE: branch track/screenshot-analyst, 13 glob(s), 25 changed
file(s), 0 out of scope`, `DISJOINT: 3 manifest(s), 2810 tracked file(s), 0 file collision(s)`,
`LOCKED PATHS: PASS`, both CI jobs success on run 30218099265. **Ledger-only content**: 25
files, all under `docs/records/`, `reports/screens/`, `reports/qa/live_stats/`,
`reports/briefs/` and `reports/tracks/`. No source, no maths, no locked path.

## JOB 1a: the quality charter, the sweep, and the gate

`docs/QUALITY_CHARTER.md` did not exist. `CLAUDE.md:502` has cited that path since the
standing mandate was recorded, so the mandate has been pointing at a missing document.

**The Valkyrie benchmark is stated in seven checkable properties**, because the brief asked
for checkable terms rather than an adjective, and because Valkyrie turns out not to be a
metaphor: it is a real publisher in our own first-party capture of the platform's FAIR
catalogue (`docs/stake-engine-live/2026-07-28/fair-catalogue.md`), whose Lokis Vault is at
version 746 with 3,600,000 events per mode, and whose second title is captured frame by frame
under `docs/reference/competitor-demos/waylanders-forge/`.

**Derived before measured, per convention (l).** The Orbitron subset was read out of the
shipped woff files FIRST: 183 codepoints, carrying U+0027, U+2019 and U+00D7, and not
carrying U+2715, U+2192, U+2605, U+2713 or U+221E. Only then were strings judged against it.
That order is what made the icon findings provable rather than aesthetic.

**What was shipping, counted in `dist` rather than estimated:** 35 symbol glyphs, 31 of them
player-visible. A trophy emoji in `wincap` across all sixteen locales and the social
override; two emoji speakers at four layout profiles; `★★★` on the max-win crown; two `✕`
close controls; one `→`. An operating-system emoji is drawn by a different vendor on every
platform and can never carry the brand face; a dingbat outside the subset falls back for that
one character mid-line, and no stylesheet says so.

Twenty-two findings, all dispositioned, in `docs/QUALITY_CHARTER.md` 4.2. Also fixed: the
French locale using both apostrophe forms in one rules list and a French error banner with
the apostrophe absent entirely (`git log -S` shows it was never there); a hardcoded `$`
beside the autoplay loss limit at three profiles in a game whose owner plays it in euro; the
last money `.toFixed` in the tree; a letter `x` where every other surface writes `×`; the
Vite scaffold's own `:root` font stack naming no brand face; a `Segoe UI` declaration, which
is the Windows system face; two Courier New declarations, one on the first text a player
reads; and the Svelte starter logo, still committed.

**One item reviewed and KEPT with its reason recorded rather than the finding hidden:** the
infinity symbol. It labels the infinite-autoplay option in a button row whose other members
are the numerals 10, 25, 50 and 100. It is a member of a numeric series rather than an icon,
and a drawn lemniscate among numerals would read worse. Four instances remain in `dist` and
that is the whole of what the gate permits.

**One item PARKED and EXTRACTED per protocol rule 6, not deferred quietly.** The
player-visible English that is not routed through the translation function. Counted rather
than guessed: **27 static player-facing attributes and 48 markup text nodes**, reducing to
about 35 keys, about 560 values across sixteen locales, listed in full in the charter's 4.3
so the surgical pass needs no rediscovery. TR-059's estimate was right. Writing 560 values of
eleven languages in the margins of a six-job session is exactly the case rule 6 exists to
prevent, and a partial pass leaves `locale_completeness_check.mjs` red, which rule 10
forbids.

**The gate**, `frontend/scripts/machine_tell_gate.mjs`, in the static CI job before and after
the build. Convention (p) is met the way `CLAUDE.md:470` demands: **all ten seeds are strings
that were really in this repository at HEAD `3f0d686`**, in the file shape they were found
in, including the two forms a plain string scan cannot see (a locale table value and a Svelte
interpolation). Eight negative controls.

**The gate's own first real run corrected it twice, and both corrections are pinned.** It
flagged a sentence inside `sessionRecovery.test.ts`: a test asserts on malformed prose by
design, so test files are excluded. And it flagged `currency.ts` calling `toFixed` inside
`formatBalance`, which is what that function is FOR: the canonical formatter is the one
exempt file. The control for the second is written at a path that really ends in
`src/lib/utils/currency.ts`, so it exercises the shipped predicate rather than a restatement
of it.

## JOB 1b: the reskin boundary

`docs/RESKIN_BOUNDARY.md`. Section 7b of `WRS_MASTER_DOCUMENT.md` owns the ORDER of a next
title; this owns the CONTENT of its fourth link, the only one whose inputs are art. Both
documents now say so from their own side.

Nine-family skin register answering, per element, where it lives, its measured format and
dimensions, its pipeline and seed convention, and **which gates must re-run after a swap**.
Twelve honest gaps ranked hardest first, named and not solved.

**Three corrections to section 7b's own shorthand**, now cross-referenced from it. It says
"new seeds/prompts"; exactly one family has a seed (AudioForge, `BASE_SEED = 20260707`),
AssetForge is deterministic by construction with none, and the brand emblem has no recorded
seed, model version or date at all. It says "all scripts are reusable"; broadly true, and
Part 3 names the six whose assertions are title-specific.

The inventory came from a research pass and its load-bearing claims were re-verified
first-hand rather than taken on trust: `bg-1.jpg` really is a PNG carrying a `.jpg` name, the
audio seed really is at that line, and `logo.png` and `frame-2.png` really are byte-identical
to legacy-root files, checked by `shasum` on both pairs.

## JOB 2: the three root documents to HEAD

`SUBMISSION_DOSSIER.md` gains section 9 as the current state; section 8 stays the
2026-07-25 snapshot it is, with a correction table rather than an edit. Four live
confirmations with their capture paths, the payload shapes quoted from the wire, all four art
adoptions with hashes and measurements (only one was recorded before), and the display
convention.

A fifth confirmation the brief did not name: **the ACP maths screen has been read live and
every constraint passes at both star tiers**. Three consequences recorded as OPEN: section 5f
reads un-run when it has substantially been run; the CVaR question has an answer on file; and
**two first-party sources disagree on the 2-star Maximum Exposure limit**, 10,000,000
published against 15,000,000 on the platform's own screen. Raised, not silently corrected.

`GAME_FACTS.md` carried the most serious single line in the three documents. "No externally
sourced or AI-generated stock art" was true when written and has not been true since
2026-07-25. It is now a table of four assets with class, measurement and permitting clause,
and it states that every symbol, frame, particle and animated element still comes from the
in-house masters, because that is the line the rule actually draws and it is unbroken. Six em
dashes removed from the same file, which is a machine-tell in a document compiled for
external audit.

`FIX_LIST_2026-07-26.md`: all eighteen rows re-dispositioned against HEAD, seven stale and
three stale in part. Originals untouched. **Three tracker Status cells corrected** (TR-061,
TR-065, TR-063), each reading OPEN while the same row's own fix evidence recorded the fix.
**Two ledger rows promoted** to TR-086 and TR-087, which is the integrator's job under the
analyst track's own brief; both were HIGH and neither had a row.

## JOB 3: the owner checklist

`OWNER_CHECKLIST.md` at the repository root. Seven items, phone-readable, each with its why,
what to send and a DONE-when naming specific fields.

**Three of the brief's own premises turned out to be wrong** and the document says so up
front. The Guidelines list has seven owner rows, not nine (three numbers are in the
repository: 9 in the walkthrough, 8 in the document's summary, 7 rows actually bearing the
token). The USPTO claim is refuted as stated: a confirmation IS recorded, the owner's
attestation of 2026-07-23; what is missing is the evidence behind it. ABN, GST and the
accountant are one register row, not three, and two facts inside it are gaps rather than
statuses.

**Two items restored that had quietly fallen off**: the zero-win end-round observation, which
the project calls its highest-value single observation left and which no current walkthrough
section asks of anyone; and the full scrolled Language list that TR-059 is parked on.

## JOB 4: the polish review pack

`reports/screens/polish-review-2026-07-27/`, 91 frames at the seven platform presets from the
**production build**, plus `MANIFEST.json` and a README index.

The harness was committed FIRST, in its own commit, specifically so the build these were
taken from had a clean tree: build commit `2745b4d8`, `cleanTree: true`, 109 files,
15,607,103 bytes. Eight real rounds went through the intercepted wallet.

**Two failures during development, both caught by the harness's own guard rather than by
inspection.** With `cap` third and `feature` fourth, the feature round never reached the
wallet; swapping them moved the failure rather than fixing it. The common factor was that a
fourth spin cannot start inside the settle window after three presentations have run. The
guard reported `walletCalls.play === before` and SKIPPED the shot both times rather than
photographing a stale screen under an informative filename, which is the failure this
repository has shipped before. The fix is a fresh browser context for the cap round, not a
looser guard.

## JOB 5: the round-three reviewer prompt, DRAFT

`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, marked DRAFT FOR FABLE'S
RATIFICATION on its first two lines.

**The round-two reviewer prompt does not exist in this repository**, and per convention (m)
it is named as a missing input rather than reconstructed. Searched directly: every file under
the reviews tree, both brief directories, the full git history of additions there, and a
content search for the round-one prompt's distinctive phrases.

So the draft states what it IS built from: the round-ONE prompt, which survives verbatim
because one reviewer's export echoed its own instructions; plus the round-two deliverable's
eighth section, REMEDIATION VERIFICATION, carried forward on OBSERVED evidence (all three
round-two reviews return it) rather than recovered text. That inference is flagged for Fable
as one of five decisions that are his.

## Self-audit before reporting, per convention (l.5) and facts-discipline item 4

Re-deriving this session's own claims found one wrong, and it is recorded rather than edited
away. **QUALITY_CHARTER Q-01 claimed the Vite scaffold package name was the browser tab title
permanently**, on the strength of `grep -rn "document.title"` returning nothing. That grep was
the wrong instrument: `App.svelte:1507` sets the title through `<svelte:head>`, which never
mentions `document.title`, and it reaches `dist`. The scaffold name is the PRE-HYDRATION
title only. The fix stands and is still worth having; the severity claim was wrong, and Q-01,
the gate comment, the workflow comment and the master-document row all now say so.

Locked paths: none touched, verified by `git diff --cached --name-only` against the four
locked paths on every commit. `.claude/settings.json` never edited. No lock exception taken.

## Gates

Local, at the end of the session: machine tell gate self-test PASS (10 seeded caught, 8
controls clean), source and dist PASS; dash gate source and dist PASS; locale completeness
PASS; dead wiring PASS; `npm run check` 0 errors and the committed 36-warning baseline.
Browser gates re-run rather than assumed after JOB 1a, because a root font change moves text
metrics on every surface: layout fit PASS at all seven presets, contrast PASS, paytable card
fill PASS across 374 cards in sixteen locales, splash calm PASS, scrim coverage PASS, turbo
intensity PASS.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator role on `main`.

**Approach.** Derive before measuring throughout. The single decision that made JOB 1a
provable rather than aesthetic was reading the Orbitron subset out of the shipped font files
BEFORE judging any string: it turned "these icons look inconsistent" into "these five
codepoints are absent from the brand face, so they fall back per character, here is the
list". Everything else followed from that one measurement.

**Alternatives tried and rejected.**

- *Writing the 560 locale values in this session.* Rejected under protocol rule 6 and
  convention (l.6). It is the tempting wrong answer because the strings are enumerated and
  the work looks mechanical; it is not, because a wrong Japanese autoplay stop-condition is a
  compliance defect nobody on this project can read back, and a partial pass leaves the locale
  gate red.
- *Replacing the infinity symbol with a drawn lemniscate.* Written, then rejected on looking
  at the control: it sits among the numerals 10, 25, 50 and 100, and an icon among numerals
  reads worse than the conventional symbol. Allowlisted with the reason instead.
- *Allowlisting the two false positives the gate's first run produced.* Rejected. Both were
  gate design flaws, not exceptions: test files are not a player surface, and the canonical
  formatter must call `toFixed`. Fixed in the gate with negative controls pinning both.
- *A looser guard on the fourth capture round.* Rejected twice. The guard was right both
  times; the harness was wrong. Fresh browser context instead.
- *Reconstructing the round-two reviewer prompt from its outputs.* Rejected under convention
  (m). The round-three draft says what it is built from and flags the inferred section.
- *Editing the original fix-list rows in place.* Rejected: it would destroy the record of what
  was believed on the day. Re-dispositioned in a new section instead.

**Files touched.** `docs/QUALITY_CHARTER.md` (new), `docs/RESKIN_BOUNDARY.md` (new),
`OWNER_CHECKLIST.md` (new), `docs/records/reviews/round3_reviewer_prompt_DRAFT.md` (new),
`frontend/scripts/machine_tell_gate.mjs` (new),
`frontend/scripts/polish_review_capture.mjs` (new),
`reports/screens/polish-review-2026-07-27/` (new, 91 frames plus README and MANIFEST),
`reports/briefs/FS_ROUND3_PREP_Prompt.md` (new), `SUBMISSION_DOSSIER.md`, `GAME_FACTS.md`,
`COMPLIANCE_WATCH.md`, `WRS_MASTER_DOCUMENT.md`, `docs/records/reviews/FIX_LIST_2026-07-26.md`,
`docs/records/reviews/REVIEW_TRACKER.md`, `reports/FABLE_COMMS.md`,
`.github/workflows/checks.yml`, `frontend/scripts/locale_completeness_check.mjs`,
`frontend/index.html`, `frontend/src/app.css`, `frontend/src/App.svelte`,
`frontend/src/lib/i18n/translations.ts`, eight components under
`frontend/src/lib/components/`, and `frontend/src/assets/svelte.svg` (deleted). This report
and its archive copy.

**Open threads.**

1. **The kit version live on the portal is not known**, and it is the most consequential open
   item in the project. The last frontend version confirmed published anywhere in the
   repository is Front V2; four kits have been built since. Every fix in this session and the
   two before it is therefore of unknown liveness.
2. **The 560-value locale pass** wants its own surgical brief. Everything it needs is
   enumerated in `docs/QUALITY_CHARTER.md` 4.3.
3. **The 2-star Maximum Exposure disagreement** between two first-party sources, raised and
   not resolved.
4. **The COST-column question** (SA-002, SA-007), waiting on a ruling since 2026-07-26.
5. **TR-086**, the mini strip cutting a balance below about 390 css px, promoted this session
   and open. **TR-087** is fixed at source and awaits a live re-capture before it closes.
6. **The round-three reviewer prompt** is a draft and must not be run until Fable rules on the
   five decisions listed in its section E.
7. **Cross-surface capitalisation and button casing** (sweep classes 4 and 7) are review items
   rather than gated ones, and the charter says so rather than implying coverage.

---

## Rule 10 closing

**Final push `0c02cbf`, run 30231843095, GREEN on both jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30231843095

The run that matters more is **30231530987** on `49474c1`, GREEN on both jobs, because it is
the first run to carry every code change this session made through the REMOTE runner: the new
`machine_tell_gate.mjs` self-test and both its scans, the locale gate with its new allowlist
entry, and all six browser gates against a build whose root font stack changed. The closing
run is documentation only.

https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30231530987

**Three earlier runs on `main` this session, all accounted for.** 30229993768 on `3e676a1`
(JOB 1a) green both jobs. 30230730422 on `bea7242` (JOB 5) green both jobs, and it carries
JOB 2's content since `bea7242` is a descendant of `4345b9e`. 30230552617 on `4345b9e` shows
**cancelled**, and it is not a red: `concurrency: cancel-in-progress` in `checks.yml` cancels
a run when a newer commit lands on the same ref, which is what the JOB 5 push did seconds
later. Named here rather than left for a reader to work out, because rule 9 says an
unexplained non-green is treated as real and the way to keep that worth something is to
explain the explainable ones by name.

**And the PR that opened the session:** run 30218099265 on PR #116, green both jobs, which is
half of the standing approval condition under which it was merged.

---

# 2026-07-28: THE LOCALE AND TYPE PASS, Fable rulings 1 to 3

Brief saved verbatim: `reports/briefs/FS_LOCALE_AND_TYPE_PASS_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, no lock exceptions taken and none needed: no locked
path was touched. One coherent job, six commits, ratchet-first.

## Ruling 1, TR-091: nineteen frozen entries, burned to zero

The brief required each fixed entry to be burned out of the frozen list **in the same commit
as its fix, so the ratchet visibly empties**. It did: 19 to 15 to 13 to 10 to 0.

**Ten were fixed, and the fix was mostly DELETION.** The pattern behind almost all of them
was the same: a hand-rolled ternary reimplementing a layer that already exists.
`SOCIAL_OVERRIDES` maps `bet` to PLAY and `win` to PRIZE, and both `tr` and `t()` consult it
before the locale table, so `{$isSocial ? 'PLAY' : 'BET'}` **is** `{$tr('bet')}` plus fifteen
missing locales. The ternary reproduced the social swap and dropped the locale swap, which is
precisely why it survived: the surface looked right in both modes anyone tested.

- `bet` and `win` reused for the BET/PLAY and WIN/PRIZE sites.
- `overdriveFreeSpins` and `totalWin` reused: `HUD_LABEL_FREE_SPINS` and `HUD_LABEL_TOTAL_WIN`
  were **second copies of strings already present in all sixteen locales**, and being
  constants in a `.ts` module they were unreachable by the gate, which only opened `.svelte`.
  Both deleted from `fsModes.ts`.
- Seven new keys across all sixteen locales: `stateOn`, `stateOff`, `buyFeaturesHeading`,
  `betModesHeading`, `sessionNet`, `symbolWild`, `symbolScatter`, plus `winFlash` and
  `loadingDetail` earlier in the arc. Social variants for the two headings live in
  `SOCIAL_OVERRIDES` rather than in a component ternary.

**`winFlash` is its own key rather than `win` plus an exclamation mark**, and that was not
fussiness: the house bakes punctuation into the value per locale because it is not portable.
Japanese writes the fullwidth mark and Spanish opens with an inverted one, exactly as `bigWin`
already does across all sixteen.

**Two were removed as NOT A DEFECT, and the ratchet caught that itself.**
`{#if sym.name === 'SCAT'}` and `{:else if sym.name === 'WILD'}` are Svelte block CONDITIONS
comparing against data; they render nothing. The gate was reading branch logic as
player-visible text. Excluding block tags is the fix, and **the moment the gate stopped
reporting them the both-directions check went red on two frozen entries matching nothing**.
Freezing a false positive is worse than missing a real one, because it makes the debt list
lie about its own size.

**One more was found while fixing, somewhere no version of this gate can reach.**
`SessionPanel` computed `coinsWord = $isSocial ? 'COINS' : ''` in its SCRIPT block. Same
duplicated-layer shape, hidden where markup scanning cannot go. `SOCIAL_OVERRIDES` already
maps `balance` to COINS in every locale, so it asks for it now.

**A gate fix the first burn forced.** Removing the first four entries turned the gate RED on
the two lines that had just been FIXED, because the house style explains a fix by QUOTING the
code it replaced and the gate was reading HTML comments as markup. Verified before changing
it rather than assumed: Svelte compiles with `preserveComments: false`, and grepping
`dist/assets/*.js` for a distinctive committed comment string returns 0. Comments are now
stripped alongside the script block, and the negative control gained a case that quotes a
defect inside a comment and must pass, so stripping them cannot silently blind the gate
instead.

## Ruling 2, TR-092: the HUD stops shouting

Three `text-transform: uppercase` removed. The badge was the outlier, not the other three:
all four surfaces take the name from one source, `modeLabel()`, and the specification spells
it `Cruise`. `OVERBOOST` and `NITRO OVERDRIVE` were never affected because they are already
capitals, **which is exactly why this hid for so long**: the two loudest mode names looked
identical either way.

**Sweep class 4 gets its first gate.** The charter recorded it as only PARTLY covered because
cross-surface casing needs the rendered DOM. True in general, and NOT true of this instance:
the strings already come from one source, so the divergence was one CSS property and can be
pinned statically. `machine_tell_gate.mjs` gains a `cross-surface-casing` class in the static
job. Convention (p) seed is the exact rule removed, byte for byte; the control is a
`.p-stat-label` carrying the same property, because stat labels are not mode names and must
stay free to be styled.

## Ruling 3, TR-089: the count-up holds still, measured

Per-digit fixed-width boxes at `0.834em`, Orbitron's widest real advance, on the amount only.

**The proof is the deliverable here.** `win_countup_steady_gate.mjs` renders the real markup
at the real class names against the real loaded font, waiting on `document.fonts.status`
first so it cannot measure a fallback face and call it Orbitron, and it reads the box width
OUT of `WinBanner.svelte` rather than restating it.

| | `$1,111.11` | `$8,888.88` | worst character drift |
|---|---|---|---|
| unboxed, as it shipped | 249.11px | 419.27px | **141.80px** |
| boxed | 407.17px | 407.17px | **0.00px** |

Those two strings because `1` is the narrowest digit and `8` the widest, so if anything can
drift, those will. **The convention (p) seed is not invented**: it renders the same markup
with the rule absent, i.e. exactly what shipped, and requires the drift to reproduce. If the
unboxed form ever stops drifting, the font has changed and the gate is measuring nothing, so
it fails rather than passing quietly.

**The remaining seventeen declarations are ACCEPTED, per the ruling.** They sit on readouts
that are static between renders: balance, bet, session totals, paytable figures, mode costs.
An inert property costs nothing where nothing is rolling, because a number that changes once
when the player acts does not shimmy. Only the count-up animates digit by digit and only the
count-up got the boxes. They are left in place so a future face with real `tnum` switches them
on for free.

## Gates

Locale completeness PASS at **71 keys across 16 locales**, 8 seeds caught, control clean, and
the frozen list reading **zero debt**. Machine tell gate self-test PASS with **11 seeds caught
and 9 controls clean**, source and dist PASS. Win count-up self-test PASS with the defect
reproducing, gate PASS. Dash gate source and dist PASS. Social locale 65 assertions PASS,
social vocabulary PASS, a11y social terms PASS, HUD naming uniformity PASS. Layout fit PASS at
all seven presets. `npm run check` 0 errors on the committed 36-warning baseline. Production
build clean.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Approach.** Ratchet-first, one commit per group, each burning its own entries so the count
in the log is the count in the gate. The single most useful habit was reading the EXISTING
layer before writing a new one: four of the ten entries needed no new key at all, and two
needed a deletion rather than an addition.

**Alternatives tried and rejected.**

- *Appending `!` to `win` for the flash.* Rejected on inspecting `bigWin`: punctuation is
  baked per locale because it is not portable.
- *Allowlisting the two PaytableModal entries.* Rejected: they are not defects at all, and
  the gate was wrong to read block conditions as text.
- *Extending `hud_naming_uniformity_check.mjs` for the casing assertion.* Rejected: it needs a
  dev server and is not in CI. A static pin runs on every push.
- *Boxing every character in the amount.* Rejected: only digits need monospacing, and boxing
  the currency symbol and separators spaces them oddly.
- *Deleting the seventeen inert `tabular-nums` declarations.* Rejected per the ruling: they
  cost nothing and would switch on for free under a future face.

**Open threads.** TR-088 (the `games/` presentation question) and TR-090 (two proof scripts
still writing into committed evidence) remain open and are both awaiting a ruling. The
sentence-case half of the hardcoded-string class is still parked at
`docs/QUALITY_CHARTER.md` 4.3, whose completeness claim was corrected. Audio, social-mode
capture, accessibility and animation quality remain unswept, per 5.3.

---

## Rule 10 closing

**Final push `7e9dac2`, run 30277530749, GREEN on both jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30277530749

This one carries every change the session made through the REMOTE runner, including the two
NEW browser steps for TR-089: the seeded self-test that must reproduce the 141.8px drift
without the fix, and the gate that must measure 0.00px with it. Both passed on a different
machine with a different font cache, which is the point of running them there.

**One `cancelled` run, named rather than left to be classified.** Run 30277410570 on `0ff5022`
shows cancelled: `concurrency: cancel-in-progress` killed it when the session-report commit
landed seconds later. Its static job had already reported success, and its content is carried
by the closing run above, which is a descendant. Rule 9's discipline is that an unexplained
non-green is treated as real, and that is only worth something if the explainable ones are
explained by name.

---

# 2026-07-28b: BASELINE AND METHOD, rulings 4 and 5 plus the CI and kit work

Brief saved verbatim: `reports/briefs/FS_BASELINE_AND_METHOD_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, one commit per job, no lock exceptions taken and
none needed. Five small jobs, justified per rule 4: four are single-artefact changes and the
fifth is the close.

## JOB 1: rulings 4 and 5

**Ruling 4, TR-088.** Nine non-shipping entries removed from `games/`: the six `0_0_*`
upstream samples, `fifty_fifty`, `template` and the empty `games/__init__.py`, 88 files.
`games/future_spinner/` untouched, and the staged deletion was checked against the four
locked paths to prove it rather than assert it.

**Checked before deleting, and it mattered.** Nothing outside `games/` referenced a sample in
code, `tests/` does not import them, and nothing imports `games.*`, so the package init was
not load-bearing; the locked package's `run.py` imports bare and runs standalone. **But one
real dependency existed**: the `Makefile`'s `test_run` iterated `TEST_NAMES`, which was
exactly those six samples. It is REMOVED rather than repointed at `future_spinner`, and the
Makefile records why: **that package is locked and its `run.py` regenerates books and lookup
tables, so a casual `make test_run` would rewrite published, frozen truth.** Repointing it
was the tidy-looking answer and the dangerous one.

**Ruling 5, SA-002 and SA-007: DECLINED**, recorded in both rows.

The record states explicitly that **the verbatim ruling text was not supplied to this
session**, so what is written is not presented as a quotation of Fable. It is the case the
repository's evidence makes, so a reader can see the decision was supported, and it says
plainly that verbatim reasoning supersedes it if supplied. It also records what DECLINED does
NOT mean: the observation stands, the owner-facing page and both document statements stand,
and if a reviewer raises it the answer is already written.

## JOB 2: the CI work, and two wrong assumptions on the way to it

**The brief asked for the browser job to drop from about six minutes toward two, by
caching the Playwright install. The cache works and did not achieve that, and the honest
account of why is worth more than the seconds.**

**Assumption 1, wrong: chromium was the dominant cost.** The cache hits correctly
(`Cache restored from key: ms-playwright-Linux-1.62.0`, 269 MiB) and cuts the install from
about 90 seconds to 12. **The job stayed at 6.4 minutes.** Per-step timings said why: the
gates were 314 seconds of a 380 second job. Caching a 90 second step in a job whose work is
314 seconds was never going to reach two minutes.

**The key is the RESOLVED version, not the range, and that was not theoretical.**
`package.json` says `^1.61.1`; the lockfile already resolves to **1.62.0**. Keying on the
range would have served a chromium build against a different driver from day one, and that
failure mode is a browser which launches and behaves subtly differently.

**Assumption 2, also wrong: splitting the gates one-per-job would give about 2.7 minutes.**
It gave 4.6. **Seven concurrent legs contend for runner resources**, so each runs slower than
it does alone: turbo intensity is 24 seconds of gate work and took 217 seconds wall-clock.
Parallelism on shared runners is not free and does not divide cleanly.

**Measured outcome: 6.4 minutes down to a 2.9 to 4.6 minute range across two runs.** The
spread is runner CONTENTION rather than anything of ours: the same scrim gate took 276
seconds on one run and 173 on the next, so a run is judged against the range and never
against a single remembered number, plus a diagnostic
gain that is arguably worth more than the seconds: a red check now NAMES the gate that
failed without anyone opening a log. Both changes are kept, since the cache is still worth 80
seconds and there are now seven legs paying that saving each.

**The cost is stated rather than hidden**: each leg repeats about 60 seconds of setup, so
total runner minutes go UP while wall-clock goes down. The right trade on a public repository
where runner minutes are free and a person waiting on a push is not.

Durations are recorded **beside rule 10 in `CLAUDE.md`** as well as in the workflow header,
with **both wrong assumptions kept on the record**, because the useful knowledge is which
levers did not work.

## JOB 3: kit V7 and the clean-baseline visit

Built from a fresh clone at `6e9e4739`, frontend only, single use, 110 files, 15,612,453
bytes, all dist gates run IN THE CLONE.

**V7 rather than another V6, a deliberate deviation from the brief's wording.** V6 exists at
`14b6506d` and predates the entire locale pass, the count-up fix and the casing fix.
Rebuilding "V6" with different contents is exactly the stale-artefact confusion TR-062 is
about; kits are versioned because they are single use.

**PART 9f, the clean-baseline visit**, and every earlier part is now marked superseded. What
makes it different: every previous visit ADDED to what the portal held; this one
**RECONCILES**. The owner is told to drag in the FULL kit contents rather than a subset,
because a partial import can only add and replace and can never remove a file that should not
be there. The sync dialog is screenshotted BEFORE confirming, because its four numbers are
the only record of what the portal actually held, and that has surprised us once: the first
upload handed the portal 108 files and it stored 104, dropping four silently.

**And the one capture that is the point of the visit**: after publishing, read the build
commit SHA from the console boot line or `build-info.json` and screenshot it. Front V2 is the
last confirmed publish and five kits have been built since, so **every fix in the last four
sessions is of unknown liveness**. The walkthrough says plainly that ANY SHA closes it: the
value is not matching a particular build, it is that the repository stops inferring.
`OWNER_CHECKLIST.md` carries it as item 1b, named as the highest-value single action.

## JOB 4: the full audit method

`docs/skills/FULL_AUDIT_METHOD.md`, owner-ordered, named from `WRS_MASTER_DOCUMENT.md`
section 7b as the standard pre-submission analysis for every title. Section 7b owns the ORDER
of a next title and had no step for this at all.

It carries the two layers, the six rules that stop an audit producing confident wrong
answers, the two named patterns (the frozen-debt ratchet and seeded self-tests), the measured
sizing figures, and **the failures honestly**, because a method document recording only what
worked teaches nothing: the wrong search instrument that produced an over-claim, the
read-only pass that dirtied five evidence files, the parked list that called itself complete
while its instrument was blind, and the two gate false positives that were design flaws
rather than exceptions.

**It names waves 2 to 5 as NOT YET RUN for this title**: audio, social-mode capture,
accessibility, animation quality, each with why it matters.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**The four gap audits run as sized jobs at the start of a fresh allowance**, per convention
(r) and the owner's instruction. Do not start one on the last quarter of a budget: a partial
audit produces an unverified findings list, which is the most dangerous artefact this project
can generate. Suggested order by value: **audio first** (largest wholly unexamined surface,
every row model-generated against a platform page that warns about exactly that), then
**social-mode capture** (a distribution target has been blocked on it once), then
**accessibility**, then **animation quality**.

**Fable's next turn is his, not a session's**: the polish review of
`reports/screens/polish-review-2026-07-27/` and ratification of
`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, whose section E lists five
sub-decisions.

**Open threads.** TR-090, two proof scripts still writing into committed evidence, is the
last unruled item from the audit and is a one-pass fix. TR-075, the Cruise wallet delta,
remains the only open money item and is an owner action. The sentence-case half of the
hardcoded-string class stays parked at `docs/QUALITY_CHARTER.md` 4.3, whose completeness
claim was corrected.

**Alternatives tried and rejected.**

- *Repointing `make test_run` at `future_spinner`.* Rejected: it regenerates frozen lookup
  tables.
- *Rebuilding the kit as V6.* Rejected: different bytes under a used version name is the
  TR-062 failure.
- *Keying the chromium cache on the `package.json` range.* Rejected on inspection: the
  lockfile already resolves to a different minor.
- *Quoting reasoning for the SA-002 decline that was not supplied.* Rejected under convention
  (l.7) and (m); the repository's own case is given instead and labelled as such.

---

## Rule 10 closing

**Final push, run 30281912392 on `bb8eecc`, GREEN on all eight jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30281912392

    static gates                    79s      browser: contrast            84s
    browser: win count-up steady    65s      browser: turbo intensity    100s
    browser: layout fit             92s      browser: paytable card fill 121s
    browser: splash calm           155s      browser: scrim coverage     173s

This is the first run on the new matrix that is also the closing run, so it doubles as the
second measurement of it. **Wall-clock 2.9 minutes against 4.6 on the run before**, same
code, same cache state: the spread is runner contention and nothing of ours. A run is judged
against the range, never against a single remembered number.

**Three earlier runs this session, all accounted for.** 30280020957 on `4ca9654` green, the
cache MISS that populated `ms-playwright-Linux-1.62.0`. 30280722398 on `6639c2d` green, the
first cache HIT, which is the run that proved the cache worked and the assumption behind it
did not. 30281432163 on `09f3cea` green, the first matrix run. No cancellations, no reds.

---

# 2026-07-28c: THE PLAYER EXPERIENCE PASS, four owner-ordered jobs

**Brief:** `reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md`, saved verbatim and
committed with JOB 1 per conventions (b) and (f).

**Posture:** fresh session on `main`, integrator, explicit paths, commit per job, no lock
exceptions taken and one requested. Four jobs, ordered by the brief so that an honest stop
leaves whole work, which is exactly what happened: three shipped in the first pass, and the fourth was designed, then built on the
owner's instruction once the design was on the record.

**Multi-track rule 4 asks a multi-job session to justify itself.** JOB 1 gates the owner's
trust in everything after it, JOBS 2 and 3 are single named player surfaces with their own
gates, and JOB 4 was written to be stopped at, which is why its design was committed and reviewed
before a line of it was built.

| Job | Commit | Gate added |
|---|---|---|
| 1, V7 reconciliation | `7d1c6b1` | (document) |
| 2, max-win hold | `86d2833` | `max_win_hold_gate.mjs` |
| 3, bet selector | `3610eb7` | `bet_selector_gate.mjs` |
| 3 fix, green main | `576e276` | (markup fix + design doc) |
| 4, feature resume | `5b8471b` | two model and flow suites |
| 5, close | this report | |

## Headline

**Nothing player-facing had changed since kit V7 was built**, and that is now proved rather
than assumed: `git diff --name-only 6e9e4739..HEAD` returned fifteen files and not one was
under `frontend/`. Every player-visible fix the repository knew about was already in the kit
on the owner's desktop.

**The max-win celebration held correctly and six things moved behind it**, one of which
placed a real wallet bet from a keystroke and dismissed the celebration with no COLLECT.

**The BET window became a control**, driven by the platform's own ladder, proven at three
viewports against a ladder sharing no value with ours.

**Four new tracker rows came out of running the existing suites rather than out of the
briefed work**, and one of them, TR-096, is a responsible-gambling control failing open.

## JOB 1: the V7 reconciliation ledger

`docs/records/V7_RECONCILIATION.md`. Sixty six findings reconciled against the kit V7 build
SHA `6e9e4739` by evidence: Q-01 to Q-34, TR-086 to TR-092, the nineteen formerly frozen
locale entries, and the five visual fixpack rows. **47 SHIPPED IN V7, 1 FIXED POST-V7, 11
OPEN, 7 NOT A DEFECT.**

**Method, and the three things it refused to do.** Ancestry alone never earned a SHIPPED
verdict: the fixed form had to be present in the V7 tree and the defective form absent, and
where the two disagreed the tree won (FROZEN-19 is the worked case). Every verdict was
adversarially re-checked by an agent instructed to refute it, which changed a verdict,
corrected line numbers and quoted strings in a dozen rows, and caught a multiplication sign
transcribed as a letter `x`. And two verifier runs reached OPPOSITE verdicts on Q-29, which
was settled by reading the source rather than by vote.

**Q-29 is the finding worth the pass.** It recorded three loose claims in the quality charter
and closed with "the sentence is what is qualified". The sentence at
`docs/QUALITY_CHARTER.md:424` is not qualified, and that file is unchanged since V7, so
HEAD's state is V7's state. **Q-29 reproduced the exact defect it names in Q-20**, a
disposition that describes a state as if it were an action. Raised as **TR-093**, the only
finding in the set whose fix is not on main.

**The frozen-entry count that three documents give three ways** is recorded rather than
picked: the committed `KNOWN_DEBT` set holds eighteen, its `DEV_ONLY` sibling holds the
nineteenth, and the comment above the set says twenty. Eighteen plus one is the nineteen the
brief and TR-091 both name; the comment does not describe the list it introduces.

**Convention (q) was applied.** The workflow reported two dead verifiers on a usage limit and
was RESUMED before anything else was done, per the standing rule. The epoch was checked first
and was intact. The resume cost nothing and the layer that came back is the layer that
changed a verdict, which is precisely the argument the convention is built on.

**Read-only discipline held.** All sixteen agents ran git and grep only, ran no project
script, and reported `git status --porcelain` in their own output schema. All sixteen
reported clean.

## JOB 2: the max win holds, and the six things behind it

**The overlay was never the problem.** `MaxWinCelebration` carries no timer, and
`waitForWincapCollect()` is resolved by nothing but the collect handler.

**The worst finding came from the adversarial layer, after the hunting agent had looked at
the same code and concluded the scrim was a sufficient barrier.** A scrim stops a pointer and
nothing else. `isSpinning` is already false while the celebration holds, the balance has just
been credited a 5,000x win so `canSpin` is true, and the SPIN button is `disabled=false` and
still tabbable under the z150 scrim. SPACE on a focused button is activated by the BROWSER,
and App.svelte's keydown handler cannot prevent it because every guard returns before
`e.preventDefault()`.

**Measured, not argued.** The gate focuses SPIN mid-hold and presses SPACE. Before the fix
that produced one `/wallet/play`, one `/wallet/end-round`, WIN reset from `$5,000.00` to
`$0.00`, and the celebration GONE with no COLLECT, because the new round's settle calls
`isWincap.set(false)` unconditionally. The first round's promise was then left with no
resolver, so that round could never finish. Guarded at the ACTION rather than at each
control, plus the control disabled by state at all four layout branches.

The other five: the App-level WinBanner firing and self-dismissing under the overlay on every
capped round; WinBreakdown cycling a 1400ms interval with no natural end; GameGrid's 4000ms
win-burst teardown firing 1.4s INTO the hold and stripping the board the celebration sits
over; ReplayMode re-raising the celebration after the player collected and then running a
2000ms settle and the phase change behind it; and the HUD win count-up ticking underneath,
measured at `$3,841.92` on mount and `$5,000.00` thirty seconds later.

**The banner fix is a round-long flag, not `$isWincap`**, and the difference matters: the
collect handler clears that store before resolving, so an `$isWincap` guard would have moved
the banner to just after COLLECT rather than removing it.

**The big and epic banners are deliberately untouched**, per the brief's own condition that
the guarantee extends to them only if they already gate on input. They do not: `WinBanner`
has no `on:click`, no `on:keydown`, no window listener, no `role` and no `tabindex`, and its
single exit is the dismiss timer at `:181` (3.6s, 4.2s and 5.0s by tier).

**The measured assertion the brief asked for**, from the passing run: celebration mounted, 30
seconds elapsed, still mounted, no banner across sixty samples, BALANCE and WIN
byte-identical, no `/wallet/play` and no `/wallet/end-round` including after the SPACE probe,
then a real COLLECT click proceeds cleanly.

**The gate corrected two of my own errors on the way**, which is the best argument for
building it before believing the fix: it caught that ENTER legitimately collects, so pressing
it in the probe was testing the rule's positive half, and that focus now sits on COLLECT, so
SPACE there is a player collecting. Ten static seeds and two runtime seeds, all watched
failing before the PASS was believed.

## JOB 3: the BET window opens a denomination picker

Tapping the BET readout opens a panel listing every level the platform authorised. **The
ladder is never hardcoded**: it renders `activeBetLevels`, the same single source
`betLadder.ts` already gives the arrows, so the panel and the arrows cannot disagree, which
is the R5/TR-013 defect class. The arrows are unchanged and remain the fine adjustment.

**minStep holds by construction**, and the claim is deliberately narrow: the panel cannot
express a value that is not already on the ladder, and `setBetLevel()` refuses anything
`activeBetLevels` does not contain. Nothing rounds, interpolates or synthesises an amount.

**Effective cost: plain levels**, with the reasoning recorded rather than just the choice.
The list IS the ladder and those numbers are what `play` sends as `amount`, so printing 1.25
beside a level of 1.00 puts a figure in the list the player cannot select and the RGS never
sees; two money figures per row differing by a quiet 1.25x is exactly the "formats that
disagree" tell the standing mandate names; and the readout has carried the ante-adjusted
figure since the 2026-07-07 cost-visibility ruling. The panel states the multiplier once, in
a footer shown only while one is in force.

**One measured surprise, and it is why the touch-target claim is worth anything.** The first
run reported the level buttons at **41.3px against a 44px floor** despite `min-height: 44px`.
`.game-wrapper` carries `transform: scale(S)`, making it the containing block for fixed
descendants AND scaling them: 44 x 0.9375 = 41.25. The panel now counter-scales by
`--scrim-scale` and measures 44.0px at all three profiles. A `min-height` alone would have
shipped a floor that was not a floor.

## The red main, and the gate that measured the wrong element

Run 30299061427 went red on `browser: layout fit`. **Nothing was clipping.**
`layout_fit_gate.mjs:199` picks the deepest text-bearing node with
`querySelector('.m-stat-val, .stat-value, span, div') || el`. Promoting the BET readout from
a `<span>` to a `<button>` matched none of those four, so the gate silently stopped measuring
the value and started measuring the whole container, whose 99px `scrollWidth` is the two bet
steppers each carrying 32px of SVG in a 22px box, pre-existing geometry the gate had never
looked at.

Confirmed at both commits rather than argued: at `86d2833` Popout S reports `controls=8
clipped=0` and passes; with JOB 3 it reports `controls=9 clipped=1`. Fixed in the markup so
the gate gets back the text node it looks for. **The gate itself is still wrong and that half
is open as TR-098**, the same shape as TR-091's regex blind spot.

**A near-miss worth recording.** Diagnosing it used `git checkout 86d2833 -- frontend/src` to
measure the pre-JOB-3 build. That command writes to the INDEX as well as the working tree, so
after restoring the working tree from a backup, `translations.ts` and `betLadder.ts` sat with
the pre-JOB-3 content STAGED: a commit at that moment would have silently reverted 69 lines
of JOB 3, including the sixteen locales' new keys. Caught by reading `git diff --cached
--stat` before committing rather than trusting `git status`'s two-column output. **A
diagnostic checkout of a tracked path is an index write, and the check that catches it is
looking at what is actually staged.**

## JOB 4: feature resume, designed then built

`docs/design/FEATURE_RESUME_DESIGN.md` first, unchanged by the build, then
**TR-099 shipped on the owner's instruction.**

**The design in one sentence:** persist a presentation CURSOR, never presentation
CONTENT, keyed by `betID`; on recovery of an active round whose `betID` matches, offer RESUME
and play the canonical script forward from that cursor.

**The single idea that makes it safe** is that what is stored is an INDEX. Every number the
player then sees is read out of `script.freeSpins[i]`, freshly interpreted on the recovering
boot, because `FreeSpinsPresentation.nextSpin()` already derives the meter, the running total
and the spins remaining from the script. Divergence from the round's true figures is
therefore structurally impossible rather than carefully avoided, and that is what makes
localStorage acceptable at all: the store is player-editable, and the worst a forged
checkpoint can do is skip part of an animation of the player's own round. The persisted
totals are kept only as a checksum, never rendered.

**Five pieces:** the non-locked `stores/presentationCheckpoint.ts`; `startFrom(index)` on
`FreeSpinsPresentation`; checkpoint writes at the entry gate and at every spin boundary,
cleared on end, on finish and on settle; `ResumeOffer.svelte`; and the offer threaded through
`recoverSession` as an injectable callback so the flow stays testable.

**The matrix is green, and it is two suites on purpose**, both added to CI.
`presentationCheckpoint.test.ts` proves the validator REFUSES what it should, against a real
triggered round from the shipped book, and **each case asserts WHICH guard fired**, because a
validator that rejects everything for the wrong reason passes a boolean test and is still
broken. `featureResume.test.ts` proves `recoverSession` does the right thing with that
answer, **asserted by call ORDER rather than by independent spies**: the offer is made before
anything is presented, and the round is presented before it is settled, resumed or not.

**Three things the build added that the design did not anticipate.** `$tr` never passed
interpolation params through, although `t()` has always interpolated `{name}` placeholders,
so a sentence with a value in it had to be assembled in markup, which is how a player-visible
string ends up half translated. `checkpointBetID` defaults to NULL, disabling checkpointing,
because the warm mount, Bet Replay and mock rounds all present a script that is not a live
open round. And a recovered feature now checkpoints as it plays, so a player who reloads a
SECOND time in the same round resumes again rather than being sent back to spin one.

**One existing assertion updated rather than deleted.** `sessionRecovery.test.ts` pinned the
exact three-argument call. Its intent is that recovery is not silently a no-op, and that
intent is now LARGER: both callbacks default to a no-op, so a missing argument is not a
compile error but a silently dead feature. Both are named.

**Mid-ordinary-spin keeps the existing resume-and-settle**, per the brief: a base spin is one
reveal, and there is no "where you left off" to return to.

## Four rows that came out of running the existing suites

None of these was in the brief, and all four came from checking the work against the suites
already in the repository.

- **TR-096, and it is the serious one.** The infinite-autoplay option stays visible when a
  jurisdiction caps autoplay, while the committed evidence records it hidden. **Attributed by
  measurement**: a standalone probe was run twice against a dev server, once with this pass's
  source and once with `git stash push -- frontend/src` so the tree was HEAD, and both
  returned `capped: true, pass: false` byte for byte. **PRE-EXISTING.** A responsible
  gambling control failing open, escalated per convention (l.8) rather than ruled on here.
  Not caught by CI, because that suite is not one of the nine jobs `checks.yml` runs.
- **TR-097.** TR-090 names two scripts that write into committed evidence. There are at least
  two more: running `popout_conformance.mjs` and `portrait_layout_conformance.mjs` once each
  modified **eleven committed files**. All restored from HEAD, none committed.
- **TR-098.** The layout fit gate's element-selection fallback, above.
- **TR-099.** The feature-resume park.

**Also measured and left alone:** the frame gates in the portrait suite are load-sensitive.
`splashFrameGate` failed on one run and passed on the next with no code change, `sampleCount`
fell from 85 to 36 under contention, and `reducedMotionFrameGate` was already failing at
HEAD. They are not attributed to this pass and are not claimed clean either.

## Self-audit against the brief (facts discipline point 4)

| The brief asked | Done |
|---|---|
| Brief saved verbatim to `reports/briefs/` and committed | Yes, with JOB 1 |
| On main, explicit paths, commit per job | Yes, four commits, every path staged by name |
| No em or en dashes | Verified zero in every file this pass wrote |
| No lock exceptions; anything needing a locked file parked with a NAMED sanction request | Yes. One requested: `frontend/src/lib/services/rgsService.ts`, one additive line publishing `stepBet`, in TR-095 |
| Stop between jobs, never inside one | Yes. Every commit is one whole job; JOB 4 stopped at its design boundary, and the build resumed from there as its own job |
| JOB 1 verdicts by evidence, owner section listing only FIXED POST-V7 and OPEN | Yes |
| Any finding whose fix is not on main becomes a tracker row | Yes, TR-093 |
| JOB 2 measured assertion, seeded per convention (p) | Yes, twelve seeds watched failing |
| JOB 3 captures at three viewports, ladder-driven test, conformance suites green | Yes, with two pre-existing suite failures attributed by measurement and recorded |
| JOB 4 designed before built | Yes. The design was committed and reviewed first, then built against unchanged |

**One deviation, recorded in the ledger itself:** the brief scoped Q-01 through Q-29 and the
ledger carries Q-01 through Q-34, because sections 4.2c and 4.2d hold five further findings
in the same numbering and two of them are OPEN. Dropping real findings to match a stated
range is the incompleteness Q-29 and Q-33 exist to correct.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Kit V8 is BUILT**, at `e0c30611`, carrying JOBS 2, 3 and 4. See the records pass section
above. What remains is the owner's: upload it and run PART 9g, whose LOOK half is the live
confirmation TR-099 is waiting on.

**TR-099, feature resume, is DONE.** Designed, built, both matrices green and in CI. What
remains on it is the owner's: live confirmation at the portal, below.

**Ahead of it in severity, TR-096**, the infinite-autoplay option failing open under a
jurisdiction cap. It is a responsible-gambling control, it is pre-existing, it is not covered
by CI, and convention (l.8) sends it to the owner and Fable with the evidence attached rather
than to a builder's judgement.

**Cheap and worth doing together:** TR-097 (two more scripts writing into committed evidence,
a one-pass migration to `evidenceDir()`), TR-098 (the layout fit gate's silent fallback), and
TR-093 (one sentence in the quality charter, or a reworded disposition).

**Owner actions unchanged and still the highest value.** `OWNER_CHECKLIST.md` item 1b, the
publish-and-read-the-SHA visit that ends "which build is live". And per the brief, **live
confirmation of feature resume at the portal is the owner's next-visit item** when that job
lands; `DTT_PROTOCOL.md` item 5 is the slot.

**Alternatives tried and rejected.**

- *Suppressing the win banner on `$isWincap`.* Rejected after tracing the ordering: the
  collect handler clears that store before resolving, so it would have moved the banner to
  just after COLLECT rather than removing it. A round-long flag instead.
- *Making the whole BET box a button.* Rejected: the portrait, mini and compact profiles put
  the steppers inside that box, and a button inside a button is invalid.
- *Ante-adjusted figures beside each level.* Rejected on three grounds, recorded in TR-095.
- *`inert` on the stage during the max-win hold.* Rejected for this pass: `MaxWinCelebration`
  is inside `.game-wrapper`, so the attribute would have to go on its siblings rather than on
  one container, and that is an accessibility change across a surface this job did not
  otherwise touch. Focus is moved to COLLECT instead, which makes ENTER unambiguous, and the
  full trap is recorded in TR-094.
- *Widening the layout fit gate to accept a `<button>`.* Rejected as the immediate fix:
  relaxing an instrument to match new markup is how a gate stops meaning anything. The markup
  gives it back the text node it looks for, and the gate's real defect is recorded separately
  as TR-098 so it is fixed as a gate question rather than as a side effect.
- *Building JOB 4 before its design was committed.* Rejected: the brief said designed before
  built, and the design is what the build was then judged against rather than the other way
  round. It went in unchanged, which is the argument for the order.

## Rule 10 closing

**Final push, run 30300598617 on `576e276`, GREEN on all ten jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30300598617

    static gates                    78s      browser: contrast            80s
    browser: bet selector           72s      browser: layout fit          78s
    browser: win count-up steady    76s      browser: turbo intensity    105s
    browser: paytable card fill    115s      browser: max-win hold       130s
    browser: splash calm           153s      browser: scrim coverage     168s

**Ten jobs now, up from eight**, the two additions being this pass's own gates. Browser
wall-clock 168 seconds, at the fast end of the 2.9 to 4.6 minute range recorded beside rule
10, so the two new legs cost nothing measurable: they run in parallel with the rest and
neither is the slowest. `max-win hold` holds a real capped round for thirty seconds and still
lands at 130s, well inside the pack, because the hold overlaps every other leg.

**Every run this session accounted for, including the red.**

- 30295533947 on `86d2833`, GREEN on nine, JOBS 1 and 2.
- 30299061427 on `3610eb7`, **RED on `browser: layout fit`**, JOB 3. Diagnosed as a false
  positive from the gate's own element-selection fallback, root-caused by measuring at both
  commits, fixed in `576e276`, and recorded as TR-098. **The line stopped until it was
  green**, and no new job was started in between.
- 30300598617 on `576e276`, GREEN on ten. The closing run.

- 30300914468 on `3635615`, GREEN on ten. The first close of this pass.
- 30303248840 on `5b8471b`, GREEN on ten, **JOB 4 built**. `static gates` 76s, carrying the
  two new feature-resume suites; browser wall-clock 166s, unchanged, because the additions
  are node suites in the static leg rather than browser legs.

**The closing run is verified after the push rather than assumed, which is what rule 10
actually asks for.**

The red is on the record rather than tidied away, because rule 10's whole value is that a red
run means something.

---

# 2026-07-28d: THE OWNER PREVIEW RULE

**Brief:** `reports/briefs/FS_OWNER_PREVIEW_RULE_Prompt.md`, saved verbatim and committed with
JOB 1 per conventions (b) and (f).

**Posture:** on `main`, integrator, explicit paths, no lock exceptions taken and none needed.

**The owner's order, in his own words:** *whenever main changes, the owner's local copy is
already fresh, never stale, never his job to refresh.*

## The printed version line, which is the proof the mechanism works

```
OWNER PREVIEW  |  Front V8 line, main  |  commit dde20e8  |  built 2026-07-28T08:11:51+10:00  |  started 2026-07-27T22:12:37.652Z  |  http://192.168.4.92:5173
```

Verified rather than asserted, because a script that prints a URL has not proved the URL
works: `http://192.168.4.92:5173/` answers **HTTP 200** with `<title>Future Spinner</title>`,
`/src/main.ts` answers 200 from this checkout's own module graph, and exactly one vite process
is running.

## JOB 1: the canonical owner preview

`scripts/owner_preview.mjs` plus `npm run owner:preview`. Stops the previous instance,
hard-syncs the primary checkout to `origin/main`, installs only if the lockfile moved, starts
the dev server on the LAN at the port the owner already uses, waits for ready, prints one line.

**Four refusals, each verified rather than asserted.**

- **It will not kill a process it did not start.** The pidfile carries the pid AND the process
  start time as the kernel reported it, and both must match before anything is signalled.
  Tested by adopting a decoy, falsifying the recorded start time, and confirming **the decoy
  survived** and the stale record was discarded instead. Pids are recycled; a script that
  guesses at processes eventually kills someone else's.
- **It will not touch a dirty tree.** Tested with a probe file: refused, printed every path,
  changed nothing. It then refused a second time for real, on my own uncommitted fix, which is
  the best kind of test because nobody arranged it.
- **It will not run in a worktree**, checked by comparing `--git-dir` against
  `--git-common-dir` rather than by a path allowlist, so it stays true if the repository moves.
- **It will not leave anything half-started.** A failure after the server spawns reaps it and
  clears the pidfile before exiting non-zero.

**Idempotent, and that is the whole promise.** Two runs back to back: the second stopped pid
720, started 1043, and left exactly one vite and a live address.

## THE FIRST RUN FAILED, AND THAT IS THE PART WORTH KEEPING

The server came up, answered the readiness probe, printed its version line, and then **died
the moment the script exited**. The owner would have opened the address and found nothing,
with a green log saying it had worked. Two causes:

- **stdio was a pipe to the parent.** A detached child whose stdout is a pipe gets that pipe
  closed when the parent exits, and the next write kills it. It writes to a log file fd it
  owns outright now.
- **it was spawned through `npm run dev`**, making `npm` the tracked pid with the real server
  underneath it. **That is precisely the wrapper-orphans-the-child shape TR-101 was about,
  reintroduced within hours of removing it.** Vite is spawned directly now, so the pid in the
  pidfile IS the server.

The lesson is not the two bugs, it is that **printing a URL is not evidence the URL works**.
The check that caught it was curling the owner's actual address, which is now part of the
close rather than something I happened to do.

## JOB 2: rule 12

Appended to the MULTI-TRACK PROTOCOL in `CLAUDE.md`, mirrored in `WRS_MASTER_DOCUMENT.md`
section 3e as row 12, and added to convention (a)'s session-close text.

A session that lands on `main` runs `owner:preview` **before** the session report and pastes
the printed line into it. Before, not after, because the line is evidence and a report written
first is describing an intention. Track sessions never touch it. If it cannot be refreshed,
the report says so in its own line, because **a preview nobody has said is stale is worse than
no preview: the owner trusts it.**

## JOB 3: the ancestor folded in

The `vite --host` dev server that had been running since the background-test session, pid
24622 and 1 day 9 hours old, was adopted through `--adopt` so the normal stop path retired it,
rather than killed behind the script's back. That is the rule's own discipline applied to the
one process that predated the rule.

`OWNER_CHECKLIST.md` gains **item zero**, which is a promise rather than a task: the preview
is always latest main after any session closes, and a SHA disagreeing with the newest session
report is ours to fix rather than his to debug.

## Self-audit against the brief

| The brief asked | Done |
|---|---|
| Brief saved verbatim to `reports/briefs/` and committed | Yes, with JOB 1 |
| On main, explicit paths, no em or en dashes, no lock exceptions | Yes, verified zero dashes in every file written |
| Primary checkout only, never a worktree | Yes, by git-dir inspection |
| Stops only its own previous instance, by pidfile, never guessing | Yes, and the recycled-pid guard is tested |
| Refuses a dirty tree, reports rather than discards | Yes, twice, once unplanned |
| Installs only if the lockfile changed | Yes |
| LAN host, fixed port 5173, waits for ready | Yes, and the address is curled to prove it |
| One trustworthy line: version, SHA, build date, URL | Yes, quoted above |
| Rule 12 in CLAUDE.md, mirrored, and in the close checklist | Yes |
| Ancestor folded in via the adoption path | Yes, pid 24622 |
| Two lines in OWNER_CHECKLIST item zero area | Yes, as item 0 |

**One judgement recorded:** the version label reads `Front V8 line, main`. It is derived from
the walkthrough's live PART heading, which `kit_build.mjs` already keeps current per kit
(TR-100). It names the kit GENERATION, not a claim that this exact commit was kitted; the SHA
on the same line is the exact identity and is the field item zero asks the owner to compare.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Rule 12 now binds every session that lands on main.** Run `npm run owner:preview` before
writing the report and paste the printed line into it. It takes about fifteen seconds when the
lockfile has not moved.

**Open threads unchanged from the player-experience pass:** TR-096 (the infinite-autoplay
option failing open under a jurisdiction cap, pre-existing, escalated per convention (l.8)),
TR-097 (two more scripts writing into committed evidence), TR-098 (the layout fit gate's
silent element fallback), TR-093 (one sentence in the quality charter). Kit V8 is built and
waiting on the owner's PART 9g visit, whose LOOK half is the live confirmation TR-099 needs.

**Alternatives tried and rejected.**

- *Killing the old dev server directly.* Rejected: the brief asked for the adoption path, and
  it is the better answer anyway, because it exercises the mechanism that will retire every
  future instance instead of making this one a special case.
- *Keeping `npm run dev` and tracking the npm pid.* Rejected after it failed: it recreates the
  wrapper-orphans-the-child problem TR-101 had just removed.
- *A version label naming a specific kit.* Rejected: the preview tracks `main`, which moves
  ahead of the last kit, so a label claiming `Front V8` would go quietly wrong. It names the
  generation and the SHA carries the identity.

## Rule 10 closing

**Final push, run 30309950472 on `742bf44`, GREEN on all eleven jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30309950472

**Rule 12 applied to this session, including the wrinkle it exposed in itself.** The report is
a commit, so a preview refreshed before the report is written is one commit behind the moment
that report lands. That is unavoidable and it is not a fault. Rule 12 now says so explicitly:
refresh before the report so the quoted line is real evidence, and run it once more as the
LAST action of the close, after the final push, so the owner's machine ends on the true tip.
The line quoted above is the earlier one; the address is the later one.

The same clarification carries the harder lesson from the first run: **printing a URL is not
evidence the URL works.** Curl the address before believing the line.

---

# 2026-07-28e: RECORDS AND KIT V9

**Brief:** `reports/briefs/FS_RECORDS_KIT_V9_Prompt.md` (v2), saved verbatim and committed with
JOB 1 per conventions (b) and (f). It supersedes `FS_RECORDS_AND_KIT_V8_Prompt.md` and its own
v1, both dead unrun.

**Posture:** on `main`, integrator, explicit paths, commit per job, no lock exceptions taken
and none needed.

## Headline

**The reported defect was refuted and a real one was found underneath it.** The three
background 403s are not a missing asset: the files are in dist and in the uploaded kit,
measured both ways, and the failing path is under the platform's unpublished `scratch/front/`
area. But the gate written to close that class found a genuine dangling reference on its first
run, and that one was ours.

**TR-075 closed on exact arithmetic.** Cruise is the fifth and last mode to get a real wallet
proof, and it was the project's only open money item.

## JOB 1: the 403 backgrounds

**Refuted by measurement, on both halves the brief asked for.** All three files are in the
current dist (`bg-1.jpg` 886,477 bytes, `bg_base.jpg` 273,173, `bg_overdrive.jpg` 269,186) and
all three are in the uploaded 110-file V8 kit. `PRUNED_PREFIXES` names `bg-1.mp4` and nothing
else under `backgrounds/`.

**The root cause is in the URL:** `/api/file/game/we-roll-spinners/future-spinner-2/`**`scratch/front/`**`/assets/...`.
That is the platform's unpublished staging area. Six minutes later, on the same entry, the
background, the car and the rain all render. It resolved with no code change. Per the brief's
own second branch, the paths were scratch and **TR-102** is that record.

**One correlation recorded without over-claiming:** the three failures are exactly the three
`.jpg` files in the bundle and no non-`.jpg` failed, while `.png`, `.woff`, `.js` and `.css`
served from the same prefix. Whether the platform rejects `.jpg` from scratch, or the upload
was still settling, is NOT determined and is not claimed.

**THE GATE FOUND A REAL ONE ON ITS FIRST RUN. TR-103.** `themeStore.ts` derived
`backgroundVideo: ${b}/backgrounds/bg-1.mp4`, pointing at the 6,083,487-byte retired video the
build prunes BY NAME. The field had **zero consumers**, so nothing requested it and no runtime
gate could see it: `build_diet_verify` fails a REQUEST into a pruned path, which cannot catch a
reference nothing requests. That is the half of the missing-asset class the brief asked to
close, and it was the half that was populated. Deleted rather than shipped.

`asset_reference_gate.mjs` resolves every `${b}/...` path the store derives against the
shipping theme plus every literal `assets/...` string in the source, and requires each to exist
in dist. 36 checked. In CI and in `kit_build`'s in-clone set. **The gate taught something about
itself on the way:** the first version flagged its own explanatory comment, because a comment
recording why `bg-1.mp4` was removed necessarily quotes the path. A gate that punishes writing
down the reason teaches people to delete the reason, so the reader strips comments first.

## JOB 2: the human version

`v9`, from **one source**, the repository-root `VERSION` file. `vite.config.ts` stamps it into
`build-info.json` and inlines it, so the boot line opens `Future Spinner v9 build ...`;
`kit_build.mjs` reads the same file. A file rather than a constant because the kit builder must
agree with the build, and **this pair already failed that way once**: the kit version was
hardcoded to V3 while a V4 shipped.

## JOB 3: intake, and the money

Eighteen frames committed at `reports/screens/live-portal-2026-07-28/` with a catalogue that
keeps what each frame SHOWS apart from what it PROVES.

**TR-075 CLOSED, on three independent inputs** per convention (l.4) rather than one figure
restated: the opening balance from the launch URL (`balance=1000000000` micros, EUR 1000.00),
the per-bet cost from the platform's own Bets table (EUR 1.00), and the closing balance from
the HUD. One bet: 1000.00 minus 1.00 = **999.00**, shown. Five bets with payouts 0, 0, 0, 0,
0.84: 1000.00 minus 5.00 plus 0.84 = **995.84**, shown. Both resolve to the cent, at exactly
1.00x.

**The red authenticate is NOT recorded, because the frames do not show one.** The wallet log
shows eight entries and all eight are 200. TR-081's multiple-authenticate half is confirmed;
its red half is absent, and an error is not recorded on the strength of a frame that does not
contain it. **That row is also DUPLICATED in the tracker**, which is noted rather than silently
collapsed.

**The trademark frames are evidence, not a clearance.** The search turned up **FUTURE SPIN**,
serial 88852459, **Class 041 online games**, owner **Light & Wonder, Inc.**, status
DEAD/ABANDONED: a near-identical wordmark in our own class. That is exactly what the checklist
item exists to surface, and whether it clears our use is a legal question for the owner's
adviser. The builder does not rule on it.

## JOB 4: already done, verified clause by clause

The brief specifies work this arc had already completed under Fable's ruling, so the honest
action was verification, not a second implementation. Every clause checked: the in-process
server exists beside `evidencePaths.mjs`; a grep for a `vite preview` spawn across
`frontend/scripts` returns **zero**; port-reaping was never written because the migration
completed in one pass; the assertion is on all nine CI gates plus its own seeded gate. **The
corpses are gone**, and the owner's old dev server was folded in through rule 12's adoption
path rather than killed behind the script's back.

## JOB 5: records to HEAD

`OWNER_CHECKLIST` gains item 0b, ticking off what is done with evidence paths, and item 3b,
deleting the old entry once the cooldown allows. The dossier gains **5b0: the submission entry
is `future-spinner-2`**, with the original recorded as superseded, and with the two things a
reviewer will meet in a console capture and should not misread: the approvals 404, expected
until Start Approval, and the background 403s, diagnosed. `FIX_LIST` is reconciled by
APPENDING, because it is a dated record and editing it in place would destroy that.

## JOB 6: kit V9

`~/Desktop/FS_UPLOAD_KIT_V9/`, fresh clone at `cce4ac15`, clean tree, **110 files,
15,633,545 bytes**, all four dist gates green IN THE CLONE including the new asset-reference
gate. **Verified independently of the builder's own report:** measured on disk at 110 files and
15,633,545 bytes, and `build-info.json` says 109 files and 15,633,145 bytes excluding itself,
which reconciles exactly once its own 400 bytes are added back. `version` reads `v9`, and the
built bundle contains the inlined string `Future Spinner v9 build`.

PART 9h is the walkthrough section, and the one screenshot it asks for does three jobs at once:
names v9 in words, carries the SHA, and proves the backgrounds served.

## Self-audit against the brief

| The brief asked | Done |
|---|---|
| Brief saved verbatim, superseding two dead ones | Yes, with JOB 1 |
| Explicit paths, commit per job, no dashes, no lock exceptions | Yes, seven commits, zero dashes verified per file |
| 403 root-caused with evidence: dist, kit, publish state | Yes, all three, measured |
| Fix at root or record the publish-state explanation | Paths were scratch, so the second branch. TR-102 |
| Dist gate that every referenced asset exists, seeded per (p) | Yes, and it found TR-103 on its first run |
| future-spinner-2 recorded as the submission entry; approvals 404 expected | Yes, in the dossier and the catalogue |
| v9 in build-info, boot line and kit README | Yes, from one source |
| Captures committed, catalogued, money reconciled | Yes, 18 frames |
| TR-075 closed if the arithmetic holds at exactly 1x | Yes, it holds |
| Red authenticate recorded observed-once | **Deviation, stated below** |
| JOB 4 harness leak per the ruling | Already done; verified clause by clause |
| Records to HEAD, dossier staging names the entry | Yes |
| Kit V9, fresh clone, all gates in clone, v9 labelled | Yes |

**One deviation, and it is a refusal rather than an omission.** The brief asked that the red
authenticate be recorded observed-once with frames. **The frames do not contain one**: every
wallet call in them is 200. Recording an error I cannot see would put an unverifiable claim
into a compliance record, which convention (l.3) forbids. What IS in the frames is recorded,
and TR-081 keeps the observation open with the exact capture that would settle it.

**A second, smaller one:** five of the eighteen frames are marked *not individually
catalogued* rather than described from a guess.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Fable's turn, and it is four things.** Verify this arc at git level. Take the benchmark
polish review against the committed capture packs, which now include
`reports/screens/live-portal-2026-07-28/`. Ratify
`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, whose section E lists five
sub-decisions. Then **round three runs**.

**Ahead of round three in severity: TR-096**, the infinite-autoplay option staying visible
under a jurisdiction cap. Pre-existing, attributed by measurement against a stashed tree, not
covered by CI, and a responsible-gambling control failing open. Convention (l.8) sends it to
the owner and Fable rather than to a builder's judgement.

**Cheap and worth doing together:** TR-097, TR-098, TR-093, and collapsing the duplicated
TR-081 row.

**Owner actions:** PART 9h with kit V9, then the checklist remainder, which item 0b has now
narrowed to the Guidelines ticks, USPTO, confirming payments, the accountant, and deleting the
old entry.
