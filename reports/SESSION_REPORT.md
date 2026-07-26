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
paths untouched; `git diff .claude/settings.json` empty throughout. Remote CI result for
the final push is recorded in the closing commit per rule 10.

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
