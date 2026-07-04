# FUTURE SPINNER: SHIPPED CONFIGURATION (this skin)

Australian English, no em/en dashes. The full maths library is 11 modes
(`docs/MASTER_TEMPLATE.md`); THIS first game ships a curated subset. The remaining
modes stay validated in the library for future skins.

## Shipped bet modes (5 of 11)

| Mode | Cost | Role | UI |
|---|---|---|---|
| cruise   | 1.0x | low-volatility "smooth" option | standing selector |
| base     | 1.0x | the standard game (default)    | standing selector |
| ante     | 1.5x | Double Chance (~2x trigger)    | standing selector |
| bonus    | 100x | standard feature buy           | buy button |
| superbuy | 300x | super feature buy (rich entry) | buy button |

Rationale: covers the main player types (casual / standard / trigger-chaser /
buyers) without overwhelming the UI. All five return 96.3500% RTP.

## Decisions

- **Ante price:** ships at **1.5x** ("Double Chance"). The 1.25x `antelite` and the
  heavier `superante` (2.0x) remain in the library for skins that want a different ante.
- **Not shipped this skin (library only):** antelite, volatile, superante, minibuy,
  megabuy, hyperbuy. Available by selecting them in a future skin's `index.json` + UI.
- **Max win:** 5,000x (see `docs/MASTER_TEMPLATE.md` section 5; the cap does not limit
  the buy ladder). A higher-cap skin is a separate package (see the bigwin variant).

## Frontend

- Production **ModeSelector** (Cruise / Normal / Double Chance) drives the standing
  mode; the buy row exposes Bonus (100x) and Super (300x).
- The DEV-only **Mode Library** panel still exposes all 11 modes for testing.
- Jurisdiction gating: the buy tiers hide under `disabledBuyFeature`; ante-style modes
  should gate where ante bets are restricted (frontend flag, per skin).
