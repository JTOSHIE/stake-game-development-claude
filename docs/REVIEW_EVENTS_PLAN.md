# REVIEW EVENTS PLAN

Event IDs to capture on the deployed staging build, then fill into the ID column,
during the SUBMISSION_DOSSIER.md section 5 post-upload protocol. Each ID is a
replay event id (`{rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`) so the
reviewer can reproduce the exact round. Capture in the Developer Testing Tool
against the deployed build.

"Social" applies where the event can occur in social mode (SC currency). The buy
events do not appear where the jurisdiction disables the feature; capture those in
a jurisdiction that permits the buy.

| # | Event | Mode | Normal ID | Social ID |
|---|-------|------|-----------|-----------|
| 1 | Base win (any paying way) | base | | |
| 2 | 3 scatters trigger (8 free spins, 1x instant) | base | | |
| 3 | 4 scatters trigger (12 free spins, 3x instant) | base | | |
| 4 | 5 scatters trigger (16 free spins, 10x instant) | base | | |
| 5 | Retrigger during free spins (3+ scatters, +5 spins) | base | | |
| 6 | Bonus buy round (100x, guaranteed trigger) | bonus | | |
| 7 | Wincap round, base mode (5,000x) | base | | |
| 8 | Wincap round, bonus mode (5,000x) | bonus | | |
| 9 | BIG tier win (>=10x) | base | | |
| 10 | MEGA tier win (>=30x) | base or bonus | | |
| 11 | EPIC tier win (>=100x) | bonus | | |

Notes:
- Tiers 9 to 11 are presentation thresholds (WinBanner BIG/MEGA/EPIC); capture the
  nearest sampled round at or above each threshold.
- The wincap events double as the CVaR/tail evidence already pre-verified clean.
- Once filled, this file feeds the compliance evidence pack; the empty state above
  is the pre-staging checklist.
