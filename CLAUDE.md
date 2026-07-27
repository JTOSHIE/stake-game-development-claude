# CLAUDE.md: We Roll Spinners / Future Spinner

Project instructions for Claude Code. Read at session start. These override default
behaviour. Australian English, metric units, no em dashes or en dashes anywhere.

## Division of authority (recorded 2026-07-25, owner instruction)

Two instruction documents exist and they do not compete.

- **`CLAUDE_PROJECT_INSTRUCTIONS_v7.md`** at the repository root is the **stable project
  operating frame**: the triad, the session-start protocol, platform reality and the
  standing board. It is pinned verbatim in the owner's Claude project for Fable check-ins,
  so it changes rarely and deliberately. It supersedes v5, which stays archived.
- **`CLAUDE.md`**, this file, is the **builder's conventions document**. It accumulates
  beyond v6 and already carries conventions past it, including (n).

**Where the two conflict on builder conduct, `CLAUDE.md` governs**, because it is the
document kept current with the work.

**Live project state is read from the repository, never from either instructions
document.** v6's own header says so, and its sections 4 and 6 are a dated snapshot rather
than current status. The tracker, the session report and the living handover are state;
these two files are frame.

## Locked files (do not modify)

These are also machine-enforced by the `deny` rules in `.claude/settings.json`:

- `frontend/src/lib/services/rgsService.ts`: RGS communication layer
- `frontend/src/lib/stores/gameStore.ts`: authoritative game state
- `games/future_spinner/**`: the maths package (config, gamestate, run, publish files, PAR)

**Canonical locked state of `rgsService.ts`.** The file now includes these owner-sanctioned
additive passthroughs on top of the base client; this is its canonical locked surface going
forward (no further edits without a new sanction):
- the bet-levels passthrough (writes `rgsBetLevels` from the authenticate response);
- `play()` includes the selected bet mode from the `selectedBetMode` store in the request;
- `authenticate()`/`initRGS()` surface jurisdiction flags and publish them to `jurisdictionFlags`;
- `_rgsSpinReal()` publishes the full raw round events to `lastRoundEvents` before flattening.
`SpinResult` and all existing consumers are unchanged; base-mode behaviour is identical.

### The owner-sanction token, and the CI gate that reads it (added 2026-07-26, JOB 3h)

The `deny` rules guard the **Edit and Write tools**. They do not guard git. The
near-miss recorded under LOCKED_FILE_DEBTS is exactly this: a bulk purge script
walked `src/` through Bash and wrote to `gameStore.ts`, and no deny rule fired,
because a python loop is not the Edit tool. A `cp`, a `sed -i`, a rebase that
resurrects a reverted hunk, or a merge that carries someone else's change all
reach a locked path by the same route.

So `scripts/qa/locked_paths_gate.mjs` runs first in CI and reads **what actually
landed**. It fails any push or pull request whose commits touch one of the four
locked paths without an owner-sanction token in the message of the commit that
touched it.

**The token, on its own line in the commit message:**

```
LOCK-SANCTION: <YYYY-MM-DD> <locked-path>[, <locked-path>]...
```

for example:

```
LOCK-SANCTION: 2026-07-25 frontend/src/lib/services/rgsService.ts
```

**The four locked paths, as the gate spells them** (they must match exactly;
`games/future_spinner/` is a prefix):

- `frontend/src/lib/services/rgsService.ts`
- `frontend/src/lib/stores/gameStore.ts`
- `games/future_spinner/`
- `.claude/settings.json`

`.claude/settings.json` is on the list because it is the lock **mechanism**: a
commit that quietly removes a deny line has unlocked everything else, and the
lock-exception convention below already requires that lift to be temporary and
never committed. A committed change to it is therefore always either a mistake
or a deliberate policy change, and both want a human to have said so.

**The paths are enumerated, and checked in BOTH directions.** Every locked path
the commit touches must be named, so nothing slips in alongside; and every path
named must actually be touched, so a blanket sanction is rejected rather than
ignored. The second direction is what keeps this honest over time: without it, a
single sanction naming all four would be pasted forward forever and the gate
would become a formality. PR #103's real sanction named exactly two deny lines,
and that is the discipline this encodes.

**The token records the sanction; it does not create one.** Writing the line does
not authorise the change. The owner's brief authorises it, per the mechanism
below, and the token is how that authorisation becomes visible to a reviewer
reading `git log` a year later.

The gate ships a seeded self-test (convention (p)) that builds a real throwaway
git repository and makes real commits in it, rather than calling the predicate
with hand-made arrays. Nine cases, including the two negative controls; the git
plumbing is where a path-matching gate actually goes wrong, so the plumbing is
what is tested.

### Lock-exception mechanism (the real one)

A `deny` in `.claude/settings.json` takes precedence over any `allow` in
`.claude/settings.local.json`, so adding a path to the local allow list does NOT lift a
deny. An owner-sanctioned exception therefore works only like this:

- The sanctioning brief must explicitly name the deny line(s) to lift.
- The lift is a temporary, NEVER-committed working-tree edit of `.claude/settings.json`
  removing exactly those deny line(s) for the session, restored before any commit so that
  `git diff .claude/settings.json` is verified empty.
- Writing to locked paths via Bash (for example `cp`, `python`, `sed`) to route around a
  deny is FORBIDDEN and never counts as a sanctioned exception.

When the session ends the full lock re-applies (the deny is back in place, uncommitted diff
empty).

**The optimiser stage is not bit-reproducible.** Confirmed 2026-07-14: the raw simulation
stage (`create_books`) is perfectly deterministic (seeded, reproduces byte-identical
books across runs), but the separate weight-fitting optimiser is not - re-running it
produces a statistically-equivalent but byte-different `lookUpTable_*.csv`. Published
lookup tables are frozen truth: they are never regenerated outside an owner-sanctioned
pass, and even then only to fill a genuinely missing file, never to "refresh" one that
already exists and is already correct.

### LOCKED_FILE_DEBTS (known issues inside locked files, no sanction to fix yet)

Findings inside a locked file that are compensated/unreachable today, recorded here so they
ride along with the next sanctioned locked pass rather than being rediscovered cold:

- **`gameStore.ts`'s `canBuyBonus` derived store hardcodes `$bet * 100`**, not the real
  per-tier `MODE_COST` (`config/fsModes.ts`). Wrong for `super` (400x). Currently
  compensated and unreachable via the live UI: `FeatureMenu.svelte`'s own `activateBuy()`
  gate (`$balance < $betAmount * m.cost`) checks the correct per-mode cost and blocks
  first, so `canBuyBonus`'s wrong threshold never actually gates a real purchase. Ratified
  by Fable (2026-07-07, Wiring Integrity Audit follow-up): no lock lift for this alone;
  fix opportunistically the next time `gameStore.ts` is under a sanctioned edit for
  something else.

- **`rgsService.ts`: ALL RECORDED DEBTS CLEARED, 2026-07-25.** The first lock sanction
  (Fable, 2026-07-25, PR #103) ran an isolated pass over this file and closed every debt it
  carried. Kept here as a record of what was fixed, not as outstanding work:
  - the **live event schema**. The parser read `board`/`win`/`scatter`, none of which the
    shipped books emit (0, 0 and 0 across the first 300 rounds of `books_base.jsonl.zst`,
    against `reveal` 724 and `winInfo` 499), so a live round returned an empty board with
    no wins. It now delegates to `roundInterpreter`, the canonical reader, rather than
    reimplementing the schema. Held by `rgsService.parse.test.ts` (CI gate 11) against real
    decoded book rows.
  - **`endRound` unretried**. It called `_post` directly while `play` was wrapped, leaving
    the CREDIT leg unprotected: one transient failure and the wallet had taken the bet
    while the player had not been paid. Now routed through `_withRetry`; safe because
    end-round is idempotent on the round id. This also closed the R11/TR-008 gap.
  - **the local `CURRENCY_SCALE` copy**. Removed; the canonical value is imported and
    re-exported. There is now exactly one declaration in the codebase, and
    `currency_scale_drift.test.mjs` asserts no copy returns rather than reconciling two.

- **The bet-ladder actions inside `gameStore.ts` operate on the hardcoded `BET_LEVELS`,
  not on the authenticated ladder.** `increaseBet`, `decreaseBet`, `setMaxBet`,
  `setMinBet`, `canIncreaseBet` and `canSetMaxBet` all index the module-level
  `BET_LEVELS` array. When the RGS authenticate response supplies a different ladder
  (any currency that is not USD-shaped, and any jurisdiction with its own levels), the
  current bet is absent from that array, `indexOf` returns -1, and `increaseBet`
  evaluates `BET_LEVELS[-1 + 1]`, i.e. `BET_LEVELS[0]`: pressing "+" DROPPED the bet to
  0.10 while "-" silently did nothing, with `canIncreaseBet` returning true so the
  control stayed enabled. Found by R5/TR-013 (2026-07-25). **No longer reachable:** both
  bet-changing surfaces now drive from the non-locked `stores/betLadder.ts`, which uses
  `rgsBetLevels` with `BET_LEVELS` only as fallback, and `betLadder.test.ts` pins the
  behaviour including the three arithmetic cases that reproduce the old defect. The
  locked functions are now unreferenced by production code. Delete them on the next
  sanctioned `gameStore.ts` pass; do not re-import them.
- **`canBuyBonus` inside `gameStore.ts` is `$bal >= $bet * 100` for EVERY buy tier.**
  That is the Buy Overdrive price. NITRO OVERDRIVE costs 400x, so at bet 1.00 with
  balance 150.00 the gate returned true and the confirm dialog enabled CONFIRM beside
  a correctly displayed 400.00 price. Recorded here previously as compensated by
  `FeatureMenu`'s own per-mode guard running first, which remains true. R8/TR-016
  (2026-07-25) replaced it at both consumers with the non-locked
  `stores/buyAffordability.ts`, so the card and the dialog now share one per-tier
  truth and cannot disagree. The locked derived store is now unreferenced by
  production code and allowlisted in the dead-wiring gate. Delete it on the next
  sanctioned `gameStore.ts` pass; do not re-import it.

- **`gameStore.ts` carries four em dashes in comments that the 2026-07-26 style purge
  could not remove.** The purge cleared 175 dashes across 42 files so the source tree
  matches the CLAUDE.md header, but this file is locked and that session carried no lock
  exception, so its four remain: line 1, the `isTurbo` doc comment, the `boardSymbols` doc
  comment, and the trailing comment on `balance.set(authBalance)`. **All four are comments,
  so none reaches `dist` and the shipped artefact is unaffected**: the dist gate reads zero
  and the source scan reports them without failing. Purely cosmetic debt. Sweep them on the
  next sanctioned `gameStore.ts` pass, alongside the four dead stores and the two dead
  derived stores already listed here; not worth a pass of its own. **A related process note:
  the purge script walked `src/` in bulk and wrote to this file before it was caught by the
  commit's own verification and reverted. The `deny` rules guard the Edit and Write tools,
  not a python loop invoked through Bash. Any future bulk rewrite over a tree containing
  locked paths must carry an explicit exclusion list up front rather than a check afterwards.**
  **That near-miss now has a machine backstop as well as a rule: `scripts/qa/locked_paths_gate.mjs`
  runs first in CI and fails any commit that touches a locked path without the owner-sanction
  token, reading what actually landed in git rather than which tool was used. The exclusion-list
  discipline above still stands and is still the first line; the gate is the last one.**

- **Four dead stores inside `gameStore.ts`**: `betIndex` (derived), `buyBonusActive`
  (writable), `canSetMaxBet` (derived), `sessionStats` (writable). None has a single
  read anywhere in production code, verified including `derived()` and `.subscribe()`
  forms. Dead weight rather than defects: no behaviour depends on them and none is
  reachable by a player. Found by the fresh-eyes review
  (`reports/qa/fresh_eyes_review_2026-07-26.md`), recorded per Fable ruling 9
  (2026-07-26). They are allowlisted with this reason in
  `frontend/scripts/dead_wiring_scan.mjs`, so the gate stays green while remembering
  them. Delete on the next sanctioned `gameStore.ts` pass; not worth a pass of its own.

### Reference / prototype branches (not on main)

Not-for-release maths prototypes and forks live on their own branch, never on `main` -
a second maths package sitting beside the shipping one is exactly the stale-artefact
misread that has previously cost a star at external audit. Current pointers:

- **Collection Meter** (stateless coin-collect bonus prototype) - `claude/collect-prototype`.
  Relocated off `main` 2026-07-08 (hygiene pass, ratified by Fable); independently
  RTP/SD/hit-rate-verified findings in that branch's `games/future_spinner_collect/COLLECT_PROTOTYPE_FINDINGS.md`.
  Reads as a LUMEN mechanic or a Future Spinner v1.1 post-launch mode, not a pre-submission item.

## Integer micros rule (mandatory, zero float tolerance)

All currency maths uses integer micros. Never multiply dollars by a multiplier directly.

```ts
const CURRENCY_SCALE = 1_000_000
const wagerMicros = Math.floor(wagerDollars * CURRENCY_SCALE)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100) // csvPayout is centibets
const winDollars  = winMicros / CURRENCY_SCALE                  // display only
```

## True game facts (Overdrive Free Spins, five-mode package)

The owner decided Option C: the game ships WITH a real bonus feature (Overdrive Free
Spins). FeatureMath v2 (2026-07-07) shipped the full five-mode package into the locked
package: `base` (Normal, 1.0x), `cruise` (Cruise, 1.0x, low-vol), `antelite` (OVERBOOST,
1.25x), `bonus` (Buy Overdrive, 100.0x) and `super` (NITRO OVERDRIVE, 400.0x, Overdrive
meter pre-revved to 5x). Stateless: the whole feature resolves inside one book round. No
jackpot, gamble, or continuation.

- **Feature (Overdrive Free Spins):** 3/4/5 scatters award 8/12/16 free spins AND pay an
  instant 1x/3x/10x total bet. During free spins an Overdrive meter starts at 1x and rises
  +1x after every winning spin, applied to all subsequent free-spin wins (ways and scatter
  pays), never resetting, not retroactive. 3+ scatters in free spins retrigger +5 spins and
  pay their instant award x the current meter. The bonus buy guarantees a 3+ trigger.
- **Scatter values are 1x/3x/10x everywhere** (maths, PAR, and frontend once Stage 2 wires
  the feature). Not 5x/15x/50x.
- **RTP: 96.3500% at 4dp in ALL FIVE modes** (base 10dp 96.3499998727%, bonus
  96.3499999962%; cruise/antelite/super independently re-verified 2026-07-07 at
  96.350000% - see `reports/archive/handovers/HANDOVER_2026-07-07_Fable.md` for the full per-mode table).
- Max win 5,000x (hard cap every mode). Grid 5x4, 1,024 ways. 100,000 rounds per mode.
- **Base mode:** hit rate 29.11%, volatility (weighted SD) 17.28x, free-spin trigger rate
  1 in 184.7 (0.5415%), average triggered-round win 79.4x, wincap 1 in 100,000.
- **Bonus mode:** average bought outcome 96.35x (RTP 96.35% at 100x), volatility 206.63x,
  wincap 1 in 1,000.
- Paytable unchanged (H1 22/6/1.5 down to L3 0.65/0.20/0.08 per way).

## Assets

Manus is retired. All visual and audio assets are produced in-house from vector masters
(SVG) via the asset pipeline: deterministic, exact-size rendering, front-facing symbols
carry no baked-in text. Do not reintroduce Manus briefs.

**AMENDED 2026-07-25 by owner ruling: external ENHANCEMENT of existing art is permitted.
Externally DESIGNED art is not.**

The original prohibition was written after Manus, and it was aimed at a specific failure:
externally designed assets, symbols above all, that did not fit the animation pipeline and
had to be redone. That reason still holds and the rule still holds for that case.

It does not cover what happened here. The scene character and car were **enhanced, not
redesigned**: the same artwork, the same silhouette, given the volumetric shading, rim
light and specular that flat vector masters could not carry. Verified rather than asserted
before adoption:

- `scene_character.png` 680x1344 RGBA, subject bounding box matching the original to
  **0.7%**;
- `scene_car.png` 2840x1000 RGBA, subject bounding box **identical** at 2729x914, 40.7%
  transparent in both.

The owner's reasoning, recorded because it is the test to apply next time: *"we're only
subbing out and subbing in pretty much the same images... this enhanced is actually great
because this is taking us where we need to get to. It's actually solved a massive
problem."*

**AMENDED AGAIN 2026-07-27 by owner ruling (BG: V1, `reports/briefs/FS_V5_CLOSEOUT_Prompt.md`):
owner-commissioned NEW DESIGNS are permitted for SCENE and MARKETING art, with recorded
provenance. Symbols remain never externally designed, and unrequested external design
remains prohibited.**

The 2026-07-25 amendment drew the line at enhancement because that was the case in front
of it. Two adoptions since have not fitted on either side of that line, and both were
accepted on their merits, so the rule is restated to describe what the project actually
does rather than leaving the record at odds with itself:

- **The published tile** (`design-system/brand/tile/tile_composed_master.png`, 2026-07-26).
  Its own generation record states the origin as *"Externally generated, commissioned by
  the owner"*. It is not an enhancement of anything: nothing portrait existed to enhance,
  and it landed byte-identical at 408x546, the platform's own published tile geometry.
- **The scene background** (`bg_base.jpg`, this ruling). Measured at Pearson r 0.3850
  against the background it replaced, with a declared enhancement scoring 0.9966 as the
  control, so it is unambiguously a new design and was adopted as one.

**What actually distinguishes the permitted case from the Manus failure** is not
enhancement versus design. It is these three things, and they are the conditions:

1. **The owner commissioned it.** Art that arrives unrequested is out, whatever its
   quality. The Manus failure was a pipeline handing over work nobody had specified.
2. **It does not enter the animation pipeline.** Symbols, frames and anything the effect
   system positions or animates are still produced in-house from vector masters, full
   stop. Scene backdrops, tiles and marketing art are flat, terminal, and animate nothing,
   which is why they can come from outside without the failure recurring.
3. **Its provenance is recorded and measured**, per point 4 below, before it ships.

**The test for any future external asset**, in order:

1. **Which class is it?** A symbol, or anything the animation pipeline touches: in-house
   only, no exceptions, and no measurement will change that answer. Scene, tile or
   marketing art: continue, and state plainly whether it is an enhancement or a new
   design rather than letting the question go unasked.
2. **Measure it against what it replaces rather than asserting the answer.** For a subject
   with a silhouette, the subject bounding box; a changed silhouette breaks layout,
   because overlay effects are positioned by percentage within their layer. For a
   background, composition correspondence against a CONTROL whose relationship to our art
   is declared, since a correlation figure alone means nothing
   (`scripts/assets/background_candidate_ingest.py`, and its convention (p) self-test).
3. **Does it preserve the alpha channel and every effect anchor?** The car's own green
   nose booster glow is 0.08% of its opaque pixels; a naive green-screen key would have
   punched holes in it. Check before converting, not after. For an opaque asset the
   equivalent anchors are the regions the interface draws over, measured per region.
4. **Record the provenance** in a generation record beside the asset, in the tracker row,
   and in the commit. Source path, source hash, shipped hash, dimensions, what the
   supplier claimed and what the measurement found. `design-system/brand/GENERATION_NOTE_background.md`
   and `design-system/brand/tile/GENERATION_NOTE_composed_master.md` are the shape.
5. **Check what else is derived from it.** An adopted asset with siblings computed from
   the old one leaves the set incoherent, and nothing in the build will say so. Adopting
   the background required deriving a matching Overdrive variant, because `App.svelte`
   crossfades the two and they would otherwise have been two different cities.

The SVG masters remain the source for anything generated fresh, and remain committed. An
enhanced raster that supersedes its master is recorded as such rather than silently
diverging from it.

## Theme selector

The theme selector is dev-only. In production (`!import.meta.env.DEV`) it is not rendered
and the default theme is forced. Only the validated Future Spinner skin ships. The gating
lives in `App.svelte` behind `import.meta.env.DEV`; reversible by removing those guards.

## Compliance (do not regress)

- Fonts self-hosted via `@fontsource` only. No `fonts.googleapis.com` / `fonts.gstatic.com`
  or any external font CDN. Verify before commit:
  `grep -rn "fonts.googleapis.com\|fonts.gstatic.com" --include=*.{html,svelte,ts,css} frontend/`
  must be empty.
- Bet Replay is mandatory. It lives in `replayService.ts`, `replayStore.ts`,
  `ReplayMode.svelte`; `App.svelte` branches on the replay URL params. Replay never calls
  rgsService or wallet endpoints, uses the public `/bet/replay/` endpoint, and drives the
  animation pipeline via the public `.set()` API of gameStore writables (never edits
  gameStore.ts). In replay mode the balance readout, the bet controls and bet ladder,
  the autoplay menu and its confirm gate, and the theme selector are all not rendered.
  (Reworded 2026-07-26, Fable ruling: this line previously named BalanceDisplay,
  ControlBar, AutoPlayModal and ThemeSelector. `ControlBar` and `AutoPlayModal` no
  longer exist as components, and `BalanceDisplay` is dead and removed; the bet ladder
  was ported into `HudOverlay.svelte` and the autoplay menu lives there too. The
  behaviour was and is correct; the requirement is now stated against behaviour rather
  than against component names, so it stays checkable as the component tree changes.)
- No Stake branding in shipped assets or text. Original IP only.

## Session conventions

**(a) Session report.** At the end of every session write `reports/SESSION_REPORT.md`
summarising what ran, what changed, verification results and anything needing owner
attention. Copy it to `reports/archive/<date>_<topic>.md`. Commit and push both.
**A session that landed anything on `main` runs `npm run owner:preview` first, per
rule 12, and pastes the printed version line into the report; if it could not be
refreshed, the report says so in its own line.**

**(b) Pasted briefs.** When executing a pasted brief, first save it verbatim as its named
prompt file and include that file in the session's commits. **From 2026-07-25 briefs are
saved to `reports/briefs/`, not the repository root.** The root previously accumulated
twenty of them, which buried the functional documents a reviewer actually opens. Briefs
written before that date stay where they were archived, at
`reports/archive/briefs/`, with an index; nothing was edited and nothing deleted.

**(c) Status doc.** `reports/archive/superseded/FUTURE_SPINNER_PROJECT_STATUS.md` is still copied to `~/Desktop/` at
the end of a session that changes it.

**(d) Docs watch.** Periodically refresh the live Stake Engine docs pages (approval
guidelines, jurisdiction requirements, quality rankings, changelog, bet replay) via the
headless browser into `docs/stake-engine-live/`, and update `COMPLIANCE_WATCH.md` with any
differences found.

**(e) Lock exceptions.** Follow the lock-exception mechanism above (temporary, never-committed
`settings.json` deny removal named by the brief, restored with a verified-empty diff before
commit; Bash-routing around a deny is forbidden).

**(f) Briefs saved verbatim.** Briefs arrive as pasted messages. The session saves each one
verbatim as its named prompt file in `reports/briefs/` and commits it with that session's
work (this reinforces (b)). Verbatim means verbatim: a brief is the evidence for every
claim the resulting session report makes, so it is never tidied, summarised or corrected.

**(g) Autonomy posture.** The owner pre-authorises all commands, network access and Desktop
writes for every session; never pause to request approval for anything the settings permit;
the deny rules are the only boundary and remain machine-enforced; owner-sanctioned lock
exceptions continue to follow convention (e).

**(h) Visual proof.** Any pass that changes what renders commits before and after proof
screenshots to `reports/screens/<pass>/` so the independent verifier can review rendering
from the repository.

**(h.1) Evidence directories are write-once outside regeneration jobs** (SA-012, CI triage
session, 2026-07-26). Proof and gate scripts write to scratch paths only; committed evidence
directories are never written outside a job that explicitly regenerates evidence. The earned
case: frontend/scripts/anticipation_proof.mjs screenshots straight into the committed
`reports/screens/scatter-anticipation/`, so a re-run at 01:11 on 2026-07-26 silently modified
four committed evidence PNGs in the working tree. Evidence that a casual re-run can overwrite
is not evidence. The four files were restored from HEAD; a script that regenerates committed
evidence must do so only in a job whose brief says that is what it is doing. The same session
observed the pattern twice more: layout_fit_gate.mjs and contrast_gate.mjs rewrite their
committed reports/qa JSON and contrast-2026-07-26 screenshots on every run, so a plain local
re-run dirties committed evidence. Migrating the gate writers to scratch paths is open work.

**(i) Handover block.** Every session report ends with a FOR THE NEXT SESSION section stating
the model and effort used, the approach taken, alternatives tried and rejected, files touched,
and open threads; and every brief opens with a READ FIRST list of the repo documents that
carry its context.

**(j) Living handover (Fable-facing, ratified 2026-07-07 as standing).** The Fable handover
document is a single living file per arc (`HANDOVER_<date>_Fable.md`, the date of the arc's
first commit), extended with dated appended sections as the conversation continues, not a
fresh document per update. Start a new document only when a genuinely new arc begins (a
different major initiative, not just the next round of feedback on the current one). Each
appended section states what was actioned since the prior verdict, quotes the driving
instruction where load-bearing, and re-verifies every claim fresh rather than carrying
forward a prior pass's numbers.

**(k) Explicit-paths commits.** Every commit stages explicit file paths, never `git add -A`
or `git add .` - review `git status` after any broad staging step and stage each intended
path by name. This has been followed as informal discipline throughout; recorded here as a
standing convention (2026-07-08 hygiene pass) so it does not need re-establishing per
session.

**(o) The staging bundle is always built from a fresh clone, never from a working
machine, so the uploaded artefact is reproducible by definition.**

Established 2026-07-26 by TR-047. An untracked, unreferenced `branding/` directory sat in
`frontend/public/`, and Vite copies `public/` verbatim into `dist/`, so 7.06MB shipped in
the bundle while being invisible to git: a clone built 14.81MB where the working machine
built 21.87MB. The committed bundle-size figure was a number nobody else could check.
Deleting it closed the gap to four `.DS_Store` files, which the build now strips, and a
clone and this machine then produced byte-identical 15,510,083-byte builds. Building from a
clone makes that property structural rather than something to remember: whatever is on a
working machine and not in the repository cannot reach the upload.

**(p) Every gate that claims a class closed ships a self-test that plants a violation and
must FAIL on it before its PASS counts. Ratified 2026-07-26 by Fable, generalising the
TR-063 ruling.**

A gate that has never been seen to fail is not evidence. It is a script that prints PASS.

This project has now produced the same failure four separate times, each time with a green
gate sitting over it: the social conformance script, the books verifier, `build_diet_verify.mjs`,
and `player_string_dash_check.mjs`. The last of those is the worked example, and it is worth
keeping because the second attempt failed too. TR-060 found two em dashes rendering to
players while the dash gate reported PASS, because its file list was two files. The gate was
widened to twenty-five files and recorded as closed. **It was still wrong**: it read only
single-quoted JavaScript literals, and the two strings it had been written to catch were
markup prose between tags, so the widened gate could not have caught them either. A seeded
violation would have exposed that in one run. Instead it took a fresh reading of the gate's
own regex, four days later, to notice.

So the requirement is not "write a test for the gate". It is specifically: **plant the exact
defect the gate exists to catch, in the form it really occurs, and prove the gate goes red.**
A gate whose self-test seeds a defect in a form the gate happens to handle, while the real
defect occurs in another form, has learned nothing. Seed the form that actually shipped.

This binds every gate, not only new ones. Where an existing gate claims a class is closed and
has no seeded-violation self-test, it is making an unverified claim, and adding the self-test
is the cheapest way to find out whether the claim is true.

## THE STANDING MANDATE (owner's order, 2026-07-26, binding to submission)

Recorded verbatim as given, and it outranks every convenience below it.

> this title is the studio's flagship and the template for every future build.
> Whatever is found gets fixed now, not later; before submission there is no
> minor-defer category, only fixed or explicitly owner-parked with reasons. The
> bar is that a player, a reviewer, or a rival studio inspecting any surface
> concludes this was made by a professional outfit adhering to industry
> conventions. Nothing player-visible may read as machine-generated.

**What this changes in practice.** "Minor" is no longer a disposition. A finding
is FIXED, or it is OWNER-PARKED with a written reason, and there is no third
category. Severity still decides ORDER, never whether something gets done. The
phrase "polish item for later" does not apply between now and submission, and a
tracker row cannot be closed by arguing the defect is small.

**The inspection test.** Before any surface is called done, ask what a rival
studio's art director would conclude from it alone. Machine-tells are the specific
failure this names: em dashes in prose, straight and curly quotes mixed in one
view, double spaces, capitalisation that changes between two screens showing the
same word, decimal or currency formats that disagree, placeholder strings that
survived, button casing that drifts, iconography from two different families,
and the system default font leaking through where the brand face should be. The
sweep list and the repeatable gate live in `docs/QUALITY_CHARTER.md`.

## THE MULTI-TRACK PROTOCOL (owner's order, 2026-07-26, standing)

Until now this project has had exactly one writer working one job at a time on
`main`. That is why the record is coherent, and nothing below weakens it. What
changes is that more than one session may now work at once, and the protocol
exists so that concurrency cannot cost what single-writer discipline bought.

**1. `main` is single-writer.** Exactly one session at a time holds the
INTEGRATOR role, and only the integrator merges or pushes `main`. Every other
session works on a branch and delivers by pull request. A session that is not the
integrator does not push `main`, and its brief says so in its opening lines.

**2. A track is a branch plus a manifest.** One branch, `track/<name>`, and one
committed scope manifest at `docs/records/tracks/<name>.manifest` listing path
globs. The manifest is declared in the track's brief and committed before the
work starts. Tracks deliver by pull request only.

**3. Parallel tracks require provably disjoint scopes.** Not "unlikely to
collide": disjoint, checkable by comparing the manifests. Where two tracks want
the same path, they do not run in parallel, they run in sequence. This is the
rule that keeps merges mechanical, and it is cheaper than any merge-conflict
policy could be.

**4. One job per session by default, in a fresh context.** A session that runs
several jobs is not forbidden, but it justifies itself in its session report,
because the failure mode is real: judgement degrades late in a long session and
the last job of six gets the least of it.

**5. Model policy.** Sonnet at High for mechanical and suite work; Opus for
judgement work; xHigh and above reserved for a single hard bounded problem in a
short surgical session, never for a long mixed one. **The twice-failed escalation
rule stands**, as recorded in `CLAUDE_PROJECT_INSTRUCTIONS_v7.md`: a brief failing
its gates twice escalates one tier.

**6. Hard problems are extracted, not solved mid-flow.** When a job turns out to
contain a genuinely hard bounded problem, it is written up as its own surgical
brief and handed back, rather than absorbed into the session that found it. A hard
problem solved in the margins of another job gets the attention that was left over.

**7. Fable verifies every pull request before merge**, and the scope gate enforces
the manifests in CI, so a track that wanders outside its declared paths fails
before a human has to notice.

**8. Session reports on tracks are dated AND track-tagged sections.** The
integrator merges pull requests **one at a time** and resolves any report conflict
**by concatenation, never by discarding a section.** Two tracks' reports are two
accounts of two pieces of work; keeping both is the whole point, and a merge that
drops one has destroyed evidence to save a scroll.

**9. Expected failures are declared before they run** (filled 2026-07-26, from
the replay-blocker brief, with the slot's originally intended content).

Seeded-failure proofs, the convention (p) red runs that prove a gate can fail,
run LOCALLY wherever that is possible; a seeded red never needs to reach origin
to count. Where a red run against origin is genuinely required:

- it runs on a branch named `test/expected-fail-<topic>`, never on `main` or a
  track branch;
- its commit message OPENS with `EXPECTED FAIL`;
- the branch is deleted after the run;
- the session report names the run BEFORE the owner can meet the notification,
  so a red email arriving on the owner's phone already has its explanation
  committed.

**An unexplained red on any other branch is treated as real**, full stop. The
whole value of rule 10 is that a red run means something; a deliberate red that
looks identical to an accident would spend that meaning.

RECORDED BESIDE IT, so the history is honest: this slot sat empty because the
rule's brief was issued but never executed. Rules 10 and 11 were added by the CI
triage and rule 11 sessions respectively, neither found a 9 to follow, and the
gap was left rather than renumbered because 10 and 11 were already cited by
number in session reports, tracker rows and commit messages. The numbering note
that recorded the gap is superseded by this entry.

**10. A red run on main stops the line** (owner's order, 2026-07-26, from the CI
triage brief, reports/briefs/FS_CI_TRIAGE_Prompt.md). No new job starts until
main is green. Every session verifies its own final push's REMOTE CI result
before closing and records the run link in the session report. Local gate
results never substitute for the remote run: the remote runner is a different
machine with a different inventory, which is exactly how this rule was earned.

**EXPECTED RUN TIMES, MEASURED 2026-07-28 on run 30281432163, so a slow run is
knowledge rather than alarm.** Rule 10 asks every session to verify its own final
push's remote result, so every session reads these:

| Job | Measured |
|---|---|
| `static gates` | about **82 seconds** |
| `browser: scrim coverage` | about **276 seconds**, the slowest leg, which sets the wall-clock |
| the other six browser legs | 74 to 217 seconds each, in parallel |
| **browser wall-clock** | **2.9 to 4.6 minutes** across two runs, down from 6.4 |

**TWO ASSUMPTIONS WERE WRONG ON THE WAY TO THAT, and both are kept here**, because
the useful knowledge is which levers did not work.

1. **Caching chromium was expected to be the win.** It hits correctly and cuts the
   install from about 90 seconds to 12, and the job stayed at 6.4 minutes. The
   install was never the dominant cost; the gates were, at 314 of 380 seconds.
2. **Splitting the gates one-per-job was then predicted to give about 2.7 minutes**,
   setup plus the slowest gate. It gave 4.6. **Seven concurrent legs contend for
   runner resources**, so each runs slower than it does alone: turbo intensity is
   24 seconds of gate work and took 217 seconds wall-clock. Parallelism on shared
   runners is not free and does not divide cleanly.

The honest figure is **6.4 down to a 2.9 to 4.6 range**, and the spread is runner
CONTENTION rather than anything of ours: the same scrim gate took 276 seconds on
one run and 173 on the next. **Judge a run against the range, never against a
single remembered number.** Plus a diagnostic gain that is arguably
worth more than the seconds: a red check now NAMES the gate that failed without
anyone opening a log.

A cache MISS is expected on the first run after a Playwright bump, since the key
carries the RESOLVED version. **Both a hit and a miss are normal.**

THE CORRECTED ACCOUNT OF RUNS 117 TO 121THE CORRECTED ACCOUNT OF RUNS 117 TO 121THE CORRECTED ACCOUNT OF RUNS 117 TO 121, so the history is honest. Runs 117,
118, 119 and 120 on main all failed at the step "layout fit gate, seven
presets": layout_fit_gate.mjs and contrast_gate.mjs launch chromium, and they
had been added to the deliberately browser-free static job, so they crashed at
chromium.launch() on every run after they landed. Four consecutive sessions
pushed onto a red main and closed without checking the remote result, because
the same gates passed locally, where chromium is installed. Run 121, on the
track/screenshot-analyst pull request, failed at "track manifests are
disjoint": the declared reports/qa/live_stats/** overlap with quality-sweep's
reports/qa/** (SA-013), a collision that manifest declared rather than hid.
Repairs: the two-job split in checks.yml (this session, JOB 1) and the
quality-sweep manifest narrowing (this session, JOB 3).

**11. Concurrent sessions never share a working tree** (owner's order,
2026-07-26, from reports/briefs/FS_RULE11_MERGE115_Prompt.md).

- **Every track session creates its own git worktree at boot**, at
  `worktrees/<track>/`, and removes it at close. The path is gitignored, so a
  worktree can never be committed and can never reach a build.
- **The primary checkout at the repository root belongs to the integrator
  alone.** No track session checks out a branch there, for any reason, however
  briefly.
- **A session that finds the primary checkout on an unexpected branch touches
  nothing and reports it.** It does not check out, stash, reset or "put it
  back". An unexpected branch means another session is mid-flight, and the state
  of their working tree is theirs.

The commands, so the rule is followed the same way every time:

```
git worktree add worktrees/<track> track/<name>    # at boot, from the repo root
git worktree remove worktrees/<track>              # at close, after the push
```

WHERE THIS CAME FROM, because the near-miss is the argument. On 2026-07-26 the
screenshot-analyst track returned for a second intake and found the primary
checkout switched to `main` by the CI triage session, with uncommitted work in
progress on `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md` and
`docs/records/tracks/quality-sweep.manifest`. Checking out `track/screenshot-analyst`
there would have pulled the checkout out from under a live writer and put three
files of someone else's uncommitted work at risk. That track used a worktree
instead, unprompted, and reported the gap. Rule 1 made `main` single-writer for
the BRANCH; it never said anything about the working tree, and a shared working
tree is a shared mutable resource that rule 1 does not protect. This closes that.

**12. The owner's local preview is always current main** (owner's order,
2026-07-28, from reports/briefs/FS_OWNER_PREVIEW_RULE_Prompt.md).

The owner's order in his own words: *whenever main changes, the owner's local
copy is already fresh, never stale, never his job to refresh.*

- **Any session that lands a change on main runs `npm run owner:preview` as part
  of its close, BEFORE the session report**, and records the printed version
  line in that report. Before, not after, because the line is evidence and a
  report written first would be describing an intention.
- **Track sessions never touch the owner preview.** Single writer applies to it
  exactly as it applies to `main`: one designated checkout, one server, one
  session refreshing it. `scripts/owner_preview.mjs` refuses to run in a linked
  worktree by inspecting the git dir rather than trusting the caller.
- **If the preview cannot be refreshed, the session report says so in its own
  line.** Machine constraints, a dirty tree, a failed start: any of them is
  recorded plainly rather than silently leaving a stale server up. A preview
  nobody has said is stale is worse than no preview, because the owner trusts it.

The script stops ONLY the instance it previously started, tracked by a pidfile
under the gitignored `.owner-preview/`, matched on pid AND process start time so
a recycled pid can never be mistaken for ours. It never guesses at processes.
It refuses a dirty tree and reports it in full rather than discarding work. It
leaves nothing half-started: a failure after the server spawns reaps it first.


A NOTE ON THE NUMBERING: the rule 9 gap this note used to record was FILLED on
2026-07-26 by the replay-blocker session, on the owner's instruction, with the
slot's originally intended content (expected-fail declarations, above). Rules
10 and 11 keep their numbers, so every existing citation stays correct.

**(l) Derive before measuring. Standard operating procedure, ratified 2026-07-27
by the owner after a real failure (worked example below).**

This project is surrounded by compliance, facts, figures and mathematics. There is no
interpretation and no imagination in it. An answer is either exactly correct or it is
not one. The following is not advice, it is the procedure.

**(l.1) Derive from the specification first.** For any question about game behaviour,
a limit, or a number, go to the specification before touching data:
`games/future_spinner/game_config.py`, the PAR sheet, `frontend/src/lib/config/fsModes.ts`,
`docs/stake-engine-live/`. State the closed-form answer and cite the exact `file:line`
it came from. Most questions here are finite and exactly calculable. Calculate them.

**(l.2) Measurement confirms, it never discovers.** Empirical work exists to CONFIRM a
derived answer. If you are measuring in order to find out what the answer is, stop: it
means the specification has not been found yet, and it exists. A measurement that
disagrees with the specification is a broken measurement until proven otherwise. The
specification is the authority.

**(l.3) Every number carries its source.** No figure enters a report, a commit message,
a tracker row or a chat reply without a citation the owner could check. If it cannot be
cited, it is not known, and the honest output is "not known".

**(l.4) Corroboration requires INDEPENDENT inputs.** Two methods agreeing means nothing
if they share an input, because they also share its flaw. Before treating agreement as
confirmation, state explicitly what each side relies on. This is the same rule as the
self-verifying-recentre lesson and as protocol 6's two-computer reconciliation.

**(l.5) Self-audit BEFORE reporting, not after.** Before anything is written up:
re-derive the claim from the specification; check it against the measurement; confirm
the locked paths were respected; confirm the stake-engine requirement was followed as
written rather than as remembered. Only then report.

**(l.6) Unsolved beats wrongly solved.** Where certainty is not reachable, PARK the item
with its options and their trade-offs and move on. Never fill a gap with a
plausible-sounding answer. An open question handed to the owner is a good outcome; a
confident error is not.

**(l.7) Compliance text is quoted, never paraphrased.** Limits, prohibited terms, RTP
bands and disclosure wording are quoted verbatim from the live docs or the dated mirror,
with the date. Never restated from memory, never inferred.

**(l.8) Maths-adjacent findings escalate.** Anything touching the maths package, player
money display, or a submission claim goes to the owner and Fable as a question with
evidence attached. The builder does not rule on it.

**WORKED EXAMPLE, the failure that produced this convention (2026-07-27).** Asked to
document a "6-plus scatter rule", the builder decompressed all 100,000 rounds of
`books_base.jsonl.zst`, counted scatter cells per board, and reported that 352 rounds
reached 6 scatters and 12 reached 7. A disclosure string was written into all 16 locales
on that basis.

It was wrong. The `reveal` event emits a **six-row board per reel**: the visible 5x4 grid
plus one padding row above and below, carried for the spin animation and never shown to a
player. The count included padding. Re-measured on the visible window only: **maximum 5,
zero rounds at 6 or 7.**

Two things made it worse, and both are covered above:
- The exact answer was available in **one line of specification**, `num_reels = 5`, with
  no measurement at all. That is (l.1) and (l.2).
- Switching from name-matching to the engine's own `scatter: true` flag produced
  IDENTICAL counts, which read as independent corroboration. It was not: both read the
  same padded array, and the flag is set on padding cells too. That is (l.4).

The owner caught it by asking the obvious question the builder had skipped: how many
reels are in play, how many tiles are in play. There is the answer.

**(q) A workflow that reports partial failure is RESUMED before anything else is done.
Standing rule, recorded 2026-07-27 after the cost of not doing it was measured.**

Multi-agent workflows persist their script and return a run id, and a resume replays every
completed agent from cache while re-running only the ones that failed. **That makes recovery
from a partial failure roughly free, and improvising around the gap expensive.**

WHERE THIS CAME FROM. The round-three prep session ran a 51-agent research workflow: 10
discovery agents and 41 adversarial verifiers. A usage limit killed 28 of them mid-run. The
session read the failure list, observed that **all 28 failures were verifiers and all 10
discovery agents had completed**, judged the audit survivable, and proceeded by hand.

The audit did survive, because discovery is the part that finds things. But the layer that
died was the layer that stops a finding being over-claimed, and **the one over-claim that
reached a committed document was precisely the finding whose verifier had died**
(`verify:placeholder:index.html`, and the `index.html` title severity claim in
`docs/QUALITY_CHARTER.md` Q-01). It survived six commits before being caught by accident.
A resume would have cost about 1.4M subagent tokens against a session that had 87 per cent
of its allowance left.

TWO THINGS THE RESUME MUST GET RIGHT, both learned in the same session:

1. **Check the EPOCH before resuming.** If the tree has changed since the run started, the
   cached results describe the old tree and the fresh ones describe the new one, and a
   plain resume silently concatenates two epochs into one report. Worse, a verifier written
   to ask "does this defect still exist" now reads a repository where the defect was
   correctly FIXED, and returns "refuted", which reads as "the finding was bogus". Rewrite
   the verifier to ask *was it real, is it fixed, is the fix complete, did the fix break
   anything* before resuming. Editing the script invalidates the cache from the first
   changed agent call onward, which is exactly the wanted behaviour.
2. **Resume is same-session only.** So the decision cannot be deferred to the next session,
   which is precisely why it belongs at the top of the list rather than in a follow-up.

**(r) An audit is sized and scheduled like a job, not squeezed into what is left.
Recorded 2026-07-27.**

The same session measured the real cost of a full stand-back audit, so it can be planned
rather than guessed at: a 51-agent workflow was about 1.5M subagent tokens and 23 minutes of
wall-clock; the whole session, INCLUDING the fixes, a new CI gate, three production builds,
eight browser-gate runs and a 91-frame capture pass, came to about a third of a five-hour
allowance. A clean uninterrupted run would have been about 4 to 6 percentage points more.

The rule that follows: **do not start a thorough audit on the last quarter of a budget.**
It is not that the audit is expensive; it is that a partial audit produces a findings list
nobody has verified, which is the most dangerous artefact this project can generate.

**(n) Where a recorded method and a subsequent sanction conflict, the SANCTION governs.
Standing rule, Fable ruling 2026-07-25.**

A method recorded earlier in a tracker row, a plan or a convention is the best guidance
available at the time it was written. A sanction issued later, naming the same work, is
both the later and the better-informed instrument: it was written with the diagnosis in
hand. When the two disagree, follow the sanction.

Established by PR #103. TR-009's recorded method said "adapter if raw events are exposed,
sanctioned locked pass only if not", and raw events were exposed. The sanction nonetheless
enumerated the at-source fix. The at-source fix was ratified, for reasons worth keeping:
the diagnosis showed **total** breakage rather than partial, so there was no working code
to preserve behind an adapter; and a fully dead parser left in a money-path file behind an
adapter is two sources of truth, which is the failure mode the adapter was meant to avoid.

**The obligation this does not remove:** surface the tension explicitly and let it be
ruled on, rather than silently picking a side. Doing so is the expected move, not an
escalation. Choosing quietly is the violation, in either direction.

**(m) External documents must physically exist in the repository before work cites them.
Owner/Fable ruling, 2026-07-27.**

Any brief referencing an external document must state where that document physically
lives. Work citing it does not start until the document is in the repository. Missing
inputs are **named and waited for, never reconstructed**.

This exists because the consolidated remediation programme instructed the builder to
ingest three external reviews and build a tracker from them, and the review documents
had not been supplied. The correct response was to create placeholders, say plainly
that coverage could not be called exhaustive, and stop work that depended on them,
rather than inferring finding text from the dispositions that had been relayed.
Reconstructing them would have put fabricated findings into a compliance record and
made every downstream row unverifiable.

## THE FACTS DISCIPLINE (owner's order, 2026-07-27, standing)

Recorded verbatim as given.

1. Where calculation is possible, calculation is mandatory: this project runs on finite
   information (reels, tiles, tables, shipped files, published requirements), so answers
   are computed or looked up, never imagined, never shaped by what would please.
2. Every claim carries its source path or its computation; a claim with neither does not
   get written.
3. An unsolved problem parked honestly beats a problem solved wrongly, every time:
   parking means two or three options with trade-offs in the tracker and moving on.
4. After every task, before commit: self-audit against the brief, the conventions, and
   the platform requirements, and record the audit in the session report.
5. When blocked on a missing input, name it and stop that item; asking is compliance,
   guessing is the violation.
6. Decision questions batch into numbered comms items for one Fable ruling block,
   exactly as entry 008 did, which is the correct pattern and is now the named pattern.
