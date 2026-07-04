# FUTURE SPINNER: RESPONSIBLE-GAMBLING / COMPLIANCE MODULE (item 4)

Australian English, no em/en dashes. Reusable across skins, OFF by default, switched on per RGS
jurisdiction flag. Implemented on branch `claude/compliance-rg`. Money is integer micros.

## What it provides

| Feature | Where | Behaviour |
|---|---|---|
| Autoplay stop-conditions | `stores/responsibleGambling.ts` + HudOverlay menu + App loop | stop on any win / single-win limit (x total bet) / stop on feature / loss limit (session net) - on top of count + the wincap stop |
| Minimum spin interval | `rgSpinDelay` in `scheduleAutoSpin` | never below the jurisdiction min (UKGC 2.5s), even under turbo |
| Autoplay ban | HudOverlay | autoplay control hidden entirely where `disabledAutoplay` |
| Session tracking | `rgSession` + `rgRecordSpin` | time played, spins, wagered, won, net (micros) - recorded on every spin and buy |
| Session panel | `SessionPanel.svelte` | time / spins / net, shown where `rgEnabled` (plus dev) |
| Reality check | `realityCheckDue` + modal | reminder at the jurisdiction interval; acknowledge to reset |

## Jurisdiction flags consumed (from the RGS authenticate passthrough)

`jurisdictionFlags` (extend as markets require). Derived in `rgJurisdiction`:

| Flag | Effect |
|---|---|
| `rgEnabled` | show the session panel / RG UI |
| `disabledAutoplay` | hide autoplay entirely (e.g. UK real-money) |
| `minSpinMs` | minimum spin/round duration (UK: 2500) |
| `disabledTurbo` | (implied when `minSpinMs` > 0) fast-play banned |
| `realityCheckMs` | reality-check reminder interval (0 = off) |
| `maxAutoplaySpins` | cap on autoplay count |

All default to the permissive (off) behaviour, so the Stake/crypto model is unaffected until a
market flag switches a control on.

## Verification

- `stores/responsibleGambling.test.ts` - PASSES 12/12 (every stop condition, loss limit, session
  net, minimum-spin floor). Run: `npx tsx src/lib/stores/responsibleGambling.test.ts`.
- svelte-check + build clean; headless proof in `reports/screens/compliance/`.

## Notes

- ControlBar is retired (only HudOverlay is mounted); the live autoplay UI is in HudOverlay. The
  ControlBar carries a mirror of the change and is dead code (safe to delete in a cleanup pass).
- The App autoplay LOOP enforces the stop conditions and session recording, shared by any control.
- Next: surface RG info links (safer-gambling / self-exclusion) from the game chrome per market;
  wire `maxAutoplaySpins` into the count menu where set.
