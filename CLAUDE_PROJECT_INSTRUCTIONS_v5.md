# Claude Project Instructions: We Roll Spinners

**Version:** 5.0
**Date:** July 2026
**Status:** ACTIVE. Supersedes v4 and all earlier versions.

> Provenance note: v4 was not present in the repository. This v5 is a full rewrite
> derived from v3 (the latest predecessor on disk), the current state of the repository,
> and the decisions recorded below. Australian English, metric units, and no em dashes or
> en dashes anywhere in this project.

---

## 1. Studio and project identity

| Field | Value |
|---|---|
| Studio | We Roll Spinners |
| Owner | Joshua Thompson (JTOSHIE) |
| Platform | Stake Engine (Carrot RGS) |
| GitHub | https://github.com/JTOSHIE/stake-game-development-claude |
| Paths | Math SDK and repo root: `~/math-sdk/` . Frontend: `~/math-sdk/frontend/` |
| Dev server | http://localhost:5173/ |
| Tech | Svelte 5 + Vite 7 + TypeScript 5.9 + PixiJS 7 (frontend). Python + Rust Carrot Math SDK (maths). |

## 2. Current game: Future Spinner

| Field | Value |
|---|---|
| Theme | Cyberpunk spinners: automotive parts in a neon megacity |
| Grid | 5x4, 1,024 ways to win |
| Modes | Base game only. Exactly one bet mode: `base`, cost 1.0x |
| RTP | 96.3500% at four decimal places (exact arithmetic 96.34999996...%, matching the committed baseline) |
| Hit rate | 33.5724% |
| Max win | 5,000x |
| Volatility | Medium-high, weighted SD 16.23x |
| Scatter | Instant multiplier of total bet: 3 = 1x, 4 = 3x, 5 = 10x. Stateless, stacks with ways wins |
| Scatter trigger rate | 6.37% |
| Scatter average win | 97.6x |
| Status | Canonical base-only package merged and verified. Design elevation in progress. Submission pending. |

Scatter is 1x/3x/10x everywhere: maths, PAR sheet, frontend paytable, and all blurbs.
It is not 5x/15x/50x. Any surviving 5/15/50 reference is a bug to fix.

## 3. Maths: canonical base-only package (merged and verified)

The maths package is complete and canonical. The previously-present but unshipped 100x
buy-bonus mode has been removed at source, the publish files were regenerated from the
repo, and the PAR sheet was regenerated from the canonical artefact.

Verified at merge:
- New base payouts byte-identical to the prior committed lookup table, positionally and as
  a sorted multiset.
- Books match the lookup table (100,000 rounds), maximum exactly 5,000.00x, none over cap.
- RTP 96.3500% at four decimal places, using the same integer arithmetic as `audit/analyze.py`.
- PAR sheet section 11 is a Single Mode Declaration. No reviewer notes required.

No further maths work is expected. The maths directory is locked (see Section 5).

## 4. Assets: in-house vector design system (Manus retired)

Manus is retired. All visual and audio assets are produced in-house.

- **Vector masters:** SVG masters live in the repo and are the single source of truth for
  symbol and UI art.
- **Asset pipeline:** deterministic, exact-size rendering from the SVG masters to the
  target raster sizes. Same input produces the same output every time.
- **Text-free symbols:** front-facing symbols carry no baked-in text. Any labels or values
  are rendered by the frontend, never painted into the art.
- **Engine and skin architecture:** the frontend is the engine; each game is a skin
  package rendered through the same pipeline. Future games are new skin packages, not new
  engines. This directly answers the Stake Engine quality-ranking concern about generic
  or AI-generated assets.
- **WRS brand layer:** to be specified inside the design system (logo, palette, typography,
  motion signatures) so every skin carries a consistent We Roll Spinners identity.

### Approved symbol lineup (design target for the in-house system)

| Tier | Symbol | Name |
|---|---|---|
| Ultra-premium | H1 | Spinning Rim |
| Premium | H2 | Boost Gauge |
| Mid-high | M1 | Steering Wheel |
| Mid-high | M2 | Gear |
| Mid | M3 | Headlight |
| Low | L1 | Lug Nut |
| Low | L2 | Spark Plug |
| Low | L3 | Piston |

Plus Wild (substitute, no independent pay) and Scatter (instant multiplier). This lineup
is the approved go-forward design; the currently shipped raster symbols will be replaced by
vector renders of these through AssetForge v2. Paytable positions and values are unchanged
(the maths is locked); only the art identity is being brought to the approved lineup.

## 5. Locked files (machine-enforced)

The `deny` rules in `.claude/settings.json` block edits to:

- `frontend/src/lib/services/rgsService.ts`
- `frontend/src/lib/stores/gameStore.ts`
- `games/future_spinner/**` (the entire maths package)

Plus `git push --force*` and `sudo`. Owner-sanctioned exceptions are granted only via
`.claude/settings.local.json` for that single session, and only for the specific files the
sanctioning brief names. When the session ends the full lock re-applies. Never widen access
by editing `.claude/settings.json` itself.

## 6. Integer micros rule (mandatory, zero float tolerance)

```ts
const CURRENCY_SCALE = 1_000_000
const wagerMicros = Math.floor(wagerDollars * CURRENCY_SCALE)
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100) // csvPayout in centibets
const winDollars  = winMicros / CURRENCY_SCALE                  // display only
```

Never multiply dollars by a multiplier directly. Logic lives in `rgsService.ts`, state in
`gameStore.ts`.

## 7. Frontend posture

- Theme selector is dev-only. In production the selector is not rendered and the default
  theme is forced. Only the validated Future Spinner skin ships. Gating is in `App.svelte`
  behind `import.meta.env.DEV`; reversible by removing the guards.
- Fonts are self-hosted via `@fontsource` only. No external font CDN. Verify empty:
  `grep -rn "fonts.googleapis.com\|fonts.gstatic.com" --include=*.{html,svelte,ts,css} frontend/`.
- Bet Replay is mandatory and implemented in `replayService.ts`, `replayStore.ts`,
  `ReplayMode.svelte`, with `App.svelte` branching on the replay URL params. Replay never
  calls rgsService or wallet endpoints and never edits gameStore.ts.

## 8. Remaining pass sequence

1. **AssetForge v2**: after design batch approvals. Render the approved symbol lineup and
   UI from the vector masters through the pipeline at exact target sizes.
2. **Motion Polish v2**: animation and feel pass over the rendered assets.
3. **Build Diet v2**: bundle size reduction (a named quality-ranking factor).
4. **Submission**: upload the bundle, use the portal Developer Testing Tool, run the live
   RGS check (authenticate, play, end-round), then request review with the blurb and the
   captured replay event IDs.

## 9. Workflow conventions

- **Session report:** at the end of every session, write `reports/SESSION_REPORT.md`
  (what ran, what changed, verification results, anything needing owner attention), copy it
  to `reports/archive/<date>_<topic>.md`, then commit and push both.
- **Pasted briefs:** when executing a pasted brief, first save it verbatim as its named
  prompt file in the repo root and include it in the session's commits.
- **Status doc:** `FUTURE_SPINNER_PROJECT_STATUS.md` is copied to `~/Desktop/` at the end
  of any session that changes it.
- **Docs watch:** periodically refresh the live Stake Engine docs pages (approval
  guidelines, jurisdiction requirements, quality rankings, changelog, bet replay) via the
  headless browser into `docs/stake-engine-live/`, and update `COMPLIANCE_WATCH.md` with
  any differences found.
- **Three-strike rule:** the same error three times means stop, report the exact state, and
  do not attempt a fourth time.

## 10. Compliance summary (Stake Engine)

Verified against the current live docs (see `docs/stake-engine-live/` and
`COMPLIANCE_WATCH.md`): strictly stateless, no jackpot or gamble or continuation or early
cashout, original in-house IP, no Stake branding, no underage appeal, social mode for
stake.us jurisdiction terms, Bet Replay implemented. Open item from the quality-rankings
page: base-only single-mode is fully compliant but may cap the star rating, since the docs
list additional mechanics as expected in competitive submissions. This is an owner decision,
recorded in `COMPLIANCE_WATCH.md`.

---

**Studio:** We Roll Spinners . **Game:** Future Spinner . **Instructions version:** 5.0 .
**Supersedes:** v4 and earlier.
