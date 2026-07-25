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
