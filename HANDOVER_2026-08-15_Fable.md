# HANDOVER: FABLE, ARC OPENING 2026-08-15

Written by the outgoing Fable session at the close of the stand-back audit arc, for the
incoming Fable session after a full account reset. Australian English, no em dashes or en
dashes, per convention (a).

**Read this document once for orientation, then verify state from the repository.** This
document is a snapshot and the repository always wins. Every claim below carries a
provenance tag: **VERIFIED** means the outgoing Fable read it first hand from a clone,
**REPORTED** means Claude Code or the owner stated it and Fable did not independently
confirm it, **UNKNOWN** means nobody has established it.

Repository: https://github.com/JTOSHIE/stake-game-development-claude

---

## 1. WHERE THE PROJECT IS

Future Spinner is a cyberpunk automotive 5x4 ways slot, 1,024 ways, five bet modes, built
on Stake Engine (Carrot RGS) for stake.com and stake.us. It is in final pre-submission
polish. The maths is finished and verified. The game runs end to end on the platform's own
test harness and settles real rounds. What remains is polish, records hygiene, and a small
number of owner decisions.

LUMEN, the second title, is complete on its own branch and queued for productionisation
after Future Spinner submits.

**Quality target is three stars.** The owner has a personal connection to the platform's
founder, and the bar throughout has been "if we cannot get it right from the start, when
are we going to get it right".

---

## 2. THE TRIAD

- **Josh (owner)**: every approval and eye-call, all spending, all portal actions, final
  word on everything. Works phone-only much of the time, including running Claude Code
  remotely through the Claude app. Everything he must copy goes in one fenced code block
  per item so the app renders a one-tap copy button.
- **Fable (this role)**: strategist, art director, independent verifier. Reads the
  repository first hand before any verdict. Never writes to the repository. Writes prompt
  briefs for Claude Code. Vets any new tool's licence for real-money-gambling
  compatibility before money is spent.
- **Claude Code (builder)**: the only writer, under machine-enforced file locks in
  `.claude/settings.json`. Every session commits `reports/SESSION_REPORT.md`, a dated
  archive copy, and the executed brief verbatim.

---

## 3. REPOSITORY STATE AT HANDOVER

| Ref | SHA | State |
|---|---|---|
| `main` | `90f2128` | **VERIFIED** unmoved through the whole arc |
| PR #123 `track/standback-2026-08-15` | `59c4c88` then pushed | **REPORTED** green, 29 of 29 |
| PR #124 | `aed054a` | **VERIFIED** exists. Opened only to satisfy rule 10, holds the analysis report |
| PR #125 `controlrow/2026-08-15` | `36562d5` | **VERIFIED** exists. **REPORTED** CI green |

**Nothing from this arc has merged.** All three PRs were open at handover. Every finding
below therefore describes either `main` as it stands or an unmerged branch.

A stray worktree exists at `.claude/worktrees/trusting-colden-055579`. **REPORTED**: zero
unique commits, dirty tree, and one hunk not on main, being the CI wiring for
`owner_preview.mjs --self-test`. Main holds that self-test and never runs it. Nothing has
been deleted.

---

## 4. WHAT HAPPENED THIS ARC

A stand-back audit ran on 2026-08-15 using eight read-only discovery lenses in a workflow
container, then clustered and refuted. It produced 44 findings, 16 clusters, 14 confirmed,
2 refuted, and six code fixes landing as TR-149 through TR-154 on PR #123.

**The code it wrote was sound.** Fable verified three fixes line by line. **Its accounting
was not.** It marked a cluster FIXED having fixed two of five instances, reported a
recurrence of a class closed thirteen days earlier without citing the original, and
self-verified its own fixes with its own local tests.

Two analysis-only passes followed, which found considerably more than the audit did, and
then a control row and font specimen pass. The arc's real value was not the six fixes. It
was learning that an internal-consistency instrument finds disagreement, not wrongness. A
value that is wrong consistently, on a surface with only one renderer, produces no finding.

---

## 5. OWNER DECISIONS OUTSTANDING

These block work. None is urgent. All are Josh's alone.

1. **Merge PR #123.** It is green. Until it lands, no track branch can commit an honest
   scope manifest, because `quality-sweep.manifest` on main still claims `frontend/src/**`
   and any new manifest collides with it. PR #125 had to be named around this.
2. **Merge or close PR #124.** It holds a green rule 10 record and the analysis report.
   Closing it discards both.
3. **Merge PR #125** once the eye-calls inside it are made.
4. **OVERBOOST blurb wording.** The card currently reads "Double-chance: about 1.6x the
   feature trigger rate", which contradicts itself in one sentence, and borrows Pragmatic's
   trade name for their ante on Gates of Olympus. Three complete replacements were offered
   and none chosen. The recommended one is: `Raises the feature trigger rate to about 1.6x
   Normal. Debits 1.25x every spin while ON.` Seventeen string sites, being `prose.ts`
   twice and fifteen locales.
5. **Banner centring.** The decorative slab sits 28px right of the canvas centre under a
   dead-centred reel. Three options were costed: leave it, shift the row 28px left, or
   rebalance the row so its contents' midpoint is the canvas centre. Only the third
   resolves it. Post-approval lockdown permits cosmetic changes, so the third stays
   available after submission.
6. **Display face.** Orbitron's digits are not uniform and it carries no `tnum`, so money
   counters wobble. Exo 2 and Saira are the only free candidates with both a full 400/700/900
   weight range and a non-wobbling counter. Exo 2 additionally carries Cyrillic. This is
   two decisions, not one: the wobble is a measured defect with a free fix, and the
   separate quality-rankings risk around "standard fonts" is not answered by any free face.
7. **Balance readout precision.** Currently three decimal places. The platform says two is
   sufficient and a reviewer message says two is the ceiling.
8. **Cost display precision.** See section 7. The two sites the audit widened need to come
   back to two places.

---

## 6. WORK OUTSTANDING

**Records and frame**

- `CLAUDE.md` has **no `canSpin` entry** under `LOCKED_FILE_DEBTS`, while both v6 and v7 of
  the operating frame assert it does. **VERIFIED.** `canSpin` is now dead, bypassed by
  `canAffordSpin`, and allowlisted in the dead wiring scan. It will be rediscovered cold
  without a register entry.
- `CLAUDE_PROJECT_INSTRUCTIONS_v7.md` misstates the repository in **eight clauses**.
  **REPORTED** by the analysis pass; two **VERIFIED** by Fable. Convention (f) claims the
  `canSpin` register entry above and repeats an "unreachable via live UI" claim the audit
  disproved. Convention (g) pins `Math.floor` where 36 of 37 conversions use `Math.round`.
  A v8 is owed. **Do not revert to v6**: v6 is already archived at
  `reports/archive/superseded/` and v7 supersedes it.
- **68 of 109 status cells** across the tracker, `KNOWN_OPEN.md`, the charter and
  `COMPLIANCE_WATCH.md` do not match HEAD. **REPORTED.**
- Archive coverage survives at paragraph granularity: two real blocks, a `CORRECTION,
  2026-08-05` and a rule 10 verification block, added to sections after their archive
  copies were written. **REPORTED**, unrepaired by design.
- TR-096, TR-059 and AUDIT_CLOSURE Q6 remain open and were not re-proved.
- TR-148 item 4 cites `games/future_spinner/library/configs/config.json`, which is
  gitignored and untracked, so the citation is not reproducible.

**Money display**

- **Seven fractional-risk currency surfaces** exist. **REPORTED** by the census, five
  **VERIFIED** by Fable. The audit fixed two, in the wrong direction. Still live:
  `PaytableModal.svelte:342`, `FeatureMenu.svelte:442` and `:500`, `SessionPanel.svelte:116`
  Total Wagered, `ReplayMode.svelte:614` Total Spent, and the autoplay loss-limit input
  which reaches the DOM with no formatter at all.
- **Zero-decimal currencies do not widen below 1.00.** `formatBalance` takes the currency's
  own decimals with no floor, so a JPY, KRW, IDR, VND, CLP, ISK, UGX or XOF balance under
  one unit renders as the wrong integer. **VERIFIED.** This is the exact class a reviewer
  rejected another studio over.
- **Digit wobble compensation** is per-site. Any counting readout without it inherits
  Orbitron's 44.30 digit spread. The enumeration has not been done.
- `BET_LEVELS` in `gameStore.ts` invents a `0.50` rung the platform does not offer, omits
  23 rungs, and does not contain the platform minimum `0.01`. **REPORTED.**

**Gates and CI**

- `control_row_symmetry_gate.mjs` exists and passes with a working seed but is **not wired
  into CI**, pending the centring decision.
- The evidence hygiene remainder still wants its own pass, and
  `evidence_hygiene_gate.mjs` must not be wired first because it is still blind to the
  leftover writers.
- **A failing early CI step masks every step after it.** This hid information twice in one
  branch. Once `disjoint` cleared, 75 steps ran, 75 passed, and it was the first complete
  static suite that branch had produced.
- Theme-folder rasters still ship. Parked by the audit.

---

## 7. PLATFORM FACTS ESTABLISHED THIS ARC

These cost real effort to establish. **Do not re-derive them.**

- **A fractional cost multiplier is publishable.** `index.json` carries `"cost": 1.25` for
  antelite as a float. Four independent confirmations: the portal's Math Distribution and
  Summary page renders ANTELITE 1.25x as a compliant mode card; two live rounds settled at
  x1.25 with correct micro debits; TR-075 reconciled the antelite debit against the
  platform ledger to a residual of 0.00; and the replay requirements type `costMultiplier`
  as a float. A local Stake Dev Tool validator rejecting 1.25 is stricter than production.
- **Decimal places are settled.** Four places for any payout or win display, two for
  balances **and other currency displays**. Cost is a currency display, so cost renders at
  two places. Source: a Stake reviewer message, corroborated exactly by `rgs.md`. **There
  is no longer any need to ask Stake Engine this question.**
- Zero-decimal currencies must widen when needed to show values below one unit.
- **The Guidelines checkboxes in the portal are ticked by reviewers, not by the studio.**
  `0/51` is the expected state. Do not flag it.
- **Fonts must load from the Stake Engine CDN.** Self-hosting through `@fontsource`
  satisfies this; Orbitron bundles into `dist` and serves same-origin.
- The quality rankings document names **standard fonts**, alongside gradients, emoji icons
  and border effects, as not sufficient for a quality release. This is the star-rating
  document, so it bears directly on the three-star target.
- The industry-standard ante multiplier is 1.25x, used by Pragmatic across Gates of Olympus
  and its family. Made Men's 3x is an outlier. Changing our multiplier would be a mode
  redesign rather than a repricing, because the price is coupled to the trigger boost by
  the RTP constraint.
- **Books are absent from the repository** and the lookup tables carry only id, weight and
  payout with no criteria column. `statistics_summary.json` covers only cruise, antelite
  and super. Anything needing per-round criteria cannot currently be re-derived.

---

## 8. MATHS, INDEPENDENTLY RECOMPUTED

**VERIFIED** by the outgoing Fable using exact rational arithmetic over
`games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv`, weight times payout
summed over weight summed, divided by the cost multiplier, on the 100 centibet book scale.

| Mode | Cost | RTP | Cap | Wincap 1 in |
|---|---|---|---|---|
| base | 1x | 96.3499998727% | 5,000x | 100,000 |
| cruise | 1x | 96.3499999467% | 5,000x | 250,000 |
| antelite | 1.25x | 96.3499998505% | 5,000x | 80,000 |
| bonus | 100x | 96.3499999962% | 5,000x | 1,000 |
| super | 400x | 96.3499999989% | 5,000x | 250 |

Every figure reproduces the record. The portal's own compliance page passes every
constraint on both the two-star and three-star thresholds with margin.

**The 1.6x trigger claim**: traceable as 184.7 divided by 115, and corroborated
independently by the portal's per-mode hit rates, where the base to antelite delta of 0.33
percentage points matches the 0.328 predicted by 1.6061x. It cannot be proved from the
shipped package because the books are absent. Record it as corroborated, not verified.

---

## 9. CORRECTIONS THE OUTGOING FABLE MADE, AND WHY

Read this section. The failure mode repeated four times and a fresh session will be prone
to the same one.

1. Recommended committing frame v6 over the top of a live v7 that already superseded it.
   Cause: did not check the repository before acting on the owner's framing.
2. Called the session report truncation an undeclared deletion. It was commissioned in the
   brief. Cause: read the diff before reading the brief.
3. Said nothing was lost from the archive, using a presence-only substring test across 326
   headings. Two rule 10 addenda were genuinely absent. Cause: the test could not see a
   dropped section because 86 headings repeat.
4. Said the cost formatter fix was correct in direction. It was backwards. Cause: reasoned
   from an internal principle, that display should equal the debit, where the platform had
   already ruled the opposite.
5. Measured the reel as 45px off centre from a cropped screenshot. It is dead centre.
   Cause: treated a crop as the viewport.
6. Asserted font script coverage for four of seven candidates from memory. All four wrong.

**The pattern**: reasoning from memory, from images, or from first principles where a
measurement or a platform ruling was available. **Check the platform first, measure second,
reason last.** DOM measurements govern; pixel measurements from screenshots do not.

---

## 10. SESSION START PROTOCOL

Read in order before answering anything about state:

1. `reports/SESSION_REPORT.md`
2. this handover, and any dated sections appended to it
3. `CLAUDE.md`, especially `LOCKED_FILE_DEBTS`
4. `COMPLIANCE_WATCH.md`
5. `CLAUDE_PROJECT_INSTRUCTIONS_v7.md`, noting section 6 above
6. the open PR list, read from branch heads rather than waiting for merge

Open every reply with the commit SHA of the clone verified against. Clone fresh each
session with `git clone --depth 1 --filter=blob:none`. GitHub's unauthenticated API is
frequently rate limited from a Fable container, so treat CI status as owner-reported unless
a query actually returns.

Hard locks, never edited outside a sanctioned pass:
`frontend/src/lib/services/rgsService.ts`, `frontend/src/lib/stores/gameStore.ts`, all of
`games/future_spinner/`, and `.claude/settings.json` is never committed with changes.

Every brief is one fenced code block, complete, designed for unattended execution, with
premises tagged, a degradation order, an explicit stop line, and explicit commit paths.
Never `git add -A`. Never `commit -a`.

---

## 11. ON THE HORIZON

The fifty-one item guideline walk and Start Approval. Tile Editor composition and the
provider logo, both one-time portal uploads. Trademark clearance on "We Roll Spinners" and
"Future Spinner", a formal submission gate. The external audit as a separate fresh session.
Owner play-test. Blurb approval. Submit. The studio website is built and publishes only on
approval day. LUMEN productionisation follows.

Downside path is budgeted: an average below 1.0 locks the thread for seven days, then
resubmission is allowed. Post-approval lockdown makes the maths permanently final at
submission, so anything in `games/future_spinner/` must be right before it goes.
