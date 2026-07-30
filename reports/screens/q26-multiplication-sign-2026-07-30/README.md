# Q-26 proof: the multiplication sign, before and after

Convention (h), for the true fixdown's Q-26 sweep (rows S2-C020 and S2-C021,
commit `fec8d61`). Australian English, no em dashes or en dashes.

## BEFORE

**`reports/screens/social-strings-item-c/`**, already in the repository and
unmodified by this pass. Those four frames were captured before the sweep and
render the defect: `1.6x`, `1.25x` and `5x` on the feature menu and the bet-mode
cards, in both real-money and social vocabulary.

They are cited rather than copied, because they are another pass's committed
evidence and convention (h.1) makes those write-once.

## AFTER

**`after/`**, the same four surfaces captured 2026-07-30 from the fixed tree by
`frontend/scripts/social_string_conformance.mjs`, rendering `1.6×`, `1.25×` and
`5×`.

| Frame | Surface |
|---|---|
| `after/feature-menu-real-money.png` | SPIN MODES menu, real-money vocabulary |
| `after/feature-menu-social.png` | SPIN MODES menu, social vocabulary |
| `after/bet-modes-real-money.png` | Bet-mode cards, real-money vocabulary |
| `after/bet-modes-social.png` | Bet-mode cards, social vocabulary |

The machine-readable half of the same run is at
`reports/qa/session4b/social_string_conformance_2026-07-30_q26_reproof.json`, in
which `realMoney.overboostBlurbUnchanged` asserts the rendered DOM contains
`Debits 1.25× every spin while ON` and passes.

## A NOTE ON HOW THESE WERE OBTAINED, because it is a convention (h.1) hazard

`social_string_conformance.mjs` writes STRAIGHT INTO
`reports/screens/social-strings-item-c/` and into
`reports/qa/social_string_conformance_2026-07-14b.json` on every run, so simply
running it dirtied five committed evidence files. All five were restored from
HEAD and the outputs kept here and under `reports/qa/session4b/` instead.

**This is the fourth recorded instance of the (h.1) pattern**, after
`anticipation_proof.mjs`, `layout_fit_gate.mjs` and `contrast_gate.mjs`.
Migrating these writers to scratch paths remains open work, and this script
should be added to that list: it is worse than the others in one respect, because
it overwrites SCREENSHOTS, where a stale-looking frame is much harder to notice
than a changed number in a JSON.
