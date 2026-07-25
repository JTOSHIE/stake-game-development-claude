# CLAUDE.md: We Roll Spinners / Future Spinner

Project instructions for Claude Code. Read at session start. These override default
behaviour. Australian English, metric units, no em dashes or en dashes anywhere.

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

- **`rgsService.ts` declares its own `CURRENCY_SCALE = 1_000_000`** (line 29), a second
  copy of the constant whose canonical home is `frontend/src/lib/utils/currency.ts`.
  A third copy in `replayService.ts` was removed 2026-07-26 (it now imports the
  canonical one); this one cannot be, because the file is locked. Both copies currently
  agree, and per Fable ruling 8 (2026-07-26) the duplication is now **held by a gate,
  not by a comment**: `frontend/scripts/currency_scale_drift.test.mjs` parses both
  declarations as text (read-only, it never writes to the locked file) and fails if
  they ever diverge or if `replayService.ts` reintroduces a local copy. Fix by deleting
  the local declaration and importing the canonical one the next time `rgsService.ts`
  is under a sanctioned edit.

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
  96.350000% - see `HANDOVER_2026-07-07_Fable.md` for the full per-mode table).
- Max win 5,000x (hard cap every mode). Grid 5x4, 1,024 ways. 100,000 rounds per mode.
- **Base mode:** hit rate 29.11%, volatility (weighted SD) 17.28x, free-spin trigger rate
  1 in 184.7 (0.5415%), average triggered-round win 79.4x, wincap 1 in 100,000.
- **Bonus mode:** average bought outcome 96.35x (RTP 96.35% at 100x), volatility 206.63x,
  wincap 1 in 1,000.
- Paytable unchanged (H1 22/6/1.5 down to L3 0.65/0.20/0.08 per way).

## Assets

Manus is retired. All visual and audio assets are produced in-house from vector masters
(SVG) via the asset pipeline: deterministic, exact-size rendering, front-facing symbols
carry no baked-in text. Do not reintroduce Manus briefs or externally sourced art.

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

**(b) Pasted briefs.** When executing a pasted brief, first save it verbatim as its named
prompt file in the repo root (for example `FS_Something_Prompt.md`) and include that file
in the session's commits.

**(c) Status doc.** `FUTURE_SPINNER_PROJECT_STATUS.md` is still copied to `~/Desktop/` at
the end of a session that changes it.

**(d) Docs watch.** Periodically refresh the live Stake Engine docs pages (approval
guidelines, jurisdiction requirements, quality rankings, changelog, bet replay) via the
headless browser into `docs/stake-engine-live/`, and update `COMPLIANCE_WATCH.md` with any
differences found.

**(e) Lock exceptions.** Follow the lock-exception mechanism above (temporary, never-committed
`settings.json` deny removal named by the brief, restored with a verified-empty diff before
commit; Bash-routing around a deny is forbidden).

**(f) Briefs saved verbatim.** Briefs arrive as pasted messages. The session saves each one
verbatim as its named prompt file in the repo root and commits it with that session's work
(this reinforces (b)).

**(g) Autonomy posture.** The owner pre-authorises all commands, network access and Desktop
writes for every session; never pause to request approval for anything the settings permit;
the deny rules are the only boundary and remain machine-enforced; owner-sanctioned lock
exceptions continue to follow convention (e).

**(h) Visual proof.** Any pass that changes what renders commits before and after proof
screenshots to `reports/screens/<pass>/` so the independent verifier can review rendering
from the repository.

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
