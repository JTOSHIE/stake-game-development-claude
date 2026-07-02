# CLAUDE.md: We Roll Spinners / Future Spinner

Project instructions for Claude Code. Read at session start. These override default
behaviour. Australian English, metric units, no em dashes or en dashes anywhere.

## Locked files (do not modify)

These are also machine-enforced by the `deny` rules in `.claude/settings.json`:

- `frontend/src/lib/services/rgsService.ts`: RGS communication layer
- `frontend/src/lib/stores/gameStore.ts`: authoritative game state
- `games/future_spinner/**`: the maths package (config, gamestate, run, publish files, PAR)

Owner-sanctioned exceptions are granted only via `.claude/settings.local.json` for that
single session, and only for the specific files named in the sanctioning brief. When the
session ends the full lock re-applies. Never edit `.claude/settings.json` to widen access.

## Integer micros rule (mandatory, zero float tolerance)

All currency maths uses integer micros. Never multiply dollars by a multiplier directly.

```ts
const CURRENCY_SCALE = 1_000_000
const wagerMicros = Math.floor(wagerDollars * CURRENCY_SCALE)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100) // csvPayout is centibets
const winDollars  = winMicros / CURRENCY_SCALE                  // display only
```

## True game facts (canonical, base-only package)

- Base game only. Exactly one bet mode: `base`, cost 1.0x. No bonus buy, no free spins,
  no jackpot, no gamble, no continuation mechanic. Stateless.
- Scatter is an instant multiplier of total bet: 3 = 1x, 4 = 3x, 5 = 10x. Applied on the
  same spin, stacks additively with any ways win. This is the true value everywhere
  (maths, PAR, frontend paytable, blurbs). It is not 5x/15x/50x.
- RTP: 96.3500% (at four decimal places; exact integer arithmetic lands at
  96.34999996...%, the same as the committed baseline, which rounds identically).
- Hit rate: 33.5724%. Max win: 5,000x. Volatility (weighted SD): 16.23x.
- Scatter trigger rate: 6.37%. Scatter average win: 97.6x.
- Grid 5x4, 1,024 ways. Simulation basis 100,000 spins.

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
