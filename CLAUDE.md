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

## Integer micros rule (mandatory, zero float tolerance)

All currency maths uses integer micros. Never multiply dollars by a multiplier directly.

```ts
const CURRENCY_SCALE = 1_000_000
const wagerMicros = Math.floor(wagerDollars * CURRENCY_SCALE)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100) // csvPayout is centibets
const winDollars  = winMicros / CURRENCY_SCALE                  // display only
```

## True game facts (Overdrive Free Spins, two-mode package)

The owner decided Option C: the game ships WITH a real bonus feature (Overdrive Free
Spins). Two bet modes: `base` (cost 1.0x) and `bonus` buy (cost 100.0x). Stateless: the
whole feature resolves inside one book round. No jackpot, gamble, or continuation.

- **Feature (Overdrive Free Spins):** 3/4/5 scatters award 8/12/16 free spins AND pay an
  instant 1x/3x/10x total bet. During free spins an Overdrive meter starts at 1x and rises
  +1x after every winning spin, applied to all subsequent free-spin wins (ways and scatter
  pays), never resetting, not retroactive. 3+ scatters in free spins retrigger +5 spins and
  pay their instant award x the current meter. The bonus buy guarantees a 3+ trigger.
- **Scatter values are 1x/3x/10x everywhere** (maths, PAR, and frontend once Stage 2 wires
  the feature). Not 5x/15x/50x.
- **RTP: 96.3500% at 4dp in BOTH modes** (base 10dp 96.3499998727%, bonus 96.3499999962%).
- Max win 5,000x (hard cap both modes). Grid 5x4, 1,024 ways. 100,000 rounds per mode.
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
  gameStore.ts). In replay mode BalanceDisplay, ControlBar, AutoPlayModal and
  ThemeSelector are not rendered.
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
exceptions continue to follow convention (d).
