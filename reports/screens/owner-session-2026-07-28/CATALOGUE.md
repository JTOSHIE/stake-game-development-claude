# Owner session capture pack, 2026-07-28

Thirty-seven frames from the owner's own sessions on 2026-07-28, ingested per JOB 1 of
`reports/briefs/FS_FINAL_MILE_Prompt.md` and committed per convention (h) so an independent
verifier reviews them from the repository.

Catalogued in the analyst pattern: what the frame SHOWS, then what it PROVES, kept apart.

**What this pack does NOT duplicate.** The owner's 07:17 to 08:59 portal visit was already
ingested this morning and lives at `reports/screens/live-portal-2026-07-28/`. Those twenty-two
frames are deliberately not copied here; this pack is everything else the owner captured today.

**The build under test, read off the frames rather than assumed.** The console line at `152145`
and `152225` reads `Future Spinner v10 build e3206c90 built 2026-07-28T03:43:34.285Z`. That is
kit V10. The 02:xx frames predate it and exercise the build that was live on
`future-spinner-2` overnight.

**Two different currencies are exercised and the distinction matters.** The 02:xx frames are a
EUR real-money session on `future-spinner-2`. The 15:xx and 16:xx frames are an **XGC social**
session. Several findings below only appear in one of the two.

---

## 1. THE WINCAP, SETTLED LIVE BY THE PLATFORM. Refutes round three reviewer 1's maths.

### `023040` and `023131`

**SHOWS.** `023040` carries the full URL,
`stake-engine.com/teams/we-roll-spinners/games/future-spinner-2/math?launch=true&team=we-roll-spinners&game=future-spinner-2&currency=EUR&language=da&deviceType=d...`.
The platform's own Bets panel lists, among 41 then 42 settled bets:

| TIME | MODE | COST | PAYOUT | MULT | STATUS |
|---|---|---|---|---|---|
| 02:28:42 | base | EUR 1.00 | **+EUR 5,000.00** | **x5000.00** | Settle... |
| 02:31:17 | bonus | EUR 1.00 | +EUR 35.79 | x35.79 | Settle... |

**PROVES.** The platform ingested our published lookup tables, served a base round that hit the
cap, and settled it at **exactly x5000.00 for exactly EUR 5,000.00 on a EUR 1.00 bet**.

This is the direct, empirical refutation of round three reviewer 1's second maths claim, which
asserted that our "hundredths of a bet" third column would make the RGS register a 5,000x payout
as a 500,000x payout, breach the 100,000x exposure ceiling, and cause hard rejection. The
platform's own ledger reads x5000.00. Nothing was misscaled by a factor of a hundred, and the
round settled rather than being rejected.

It is also the empirical half of the refutation of that reviewer's first maths claim, that a
500,000-round sample cannot show the cap "realistically obtainable". The cap was hit and paid
inside a session of roughly forty bets. The derivational half is in the tracker row: the cap
probability is not sampled at all, it is read off the published weights in closed form.

---

## 2. XGC IS PRINTED BY THE PLATFORM AT TWO DECIMALS. Closes TR-057.

### `153527`, `155145`, `155225`, `155826`, `160121`, `160422`

**SHOWS.** Six independent frames across the social session, in the platform's own Bets ledger,
never in our game client:

```
XGC 1.00        XGC 0.00          XGC 90,000.00     XGC 180,000.00
XGC 500,000.00  +XGC 350,000.00   +XGC 230,000.00   +XGC 7,684,200.00
+XGC 100,000.00 +XGC 4,447,800.00 +XGC 8,144,560.00 +XGC 11,853,280.00
```

Every one carries comma thousands separators and **exactly two decimal places**, on costs, on
wins, and on zero payouts alike.

**PROVES.** The question TR-057 parked is answered by the only authority that could answer it.
The official client's `CurrencyMeta` says XGC has 0 decimals; its own documentation table in the
same file, and the docs mirror at `docs/stake-engine-live/rgs-communication.md:82`, both say 2.
The platform's live ledger prints 2. Our `VIRTUAL_CURRENCIES` holds 2, which was the interim
position, so **the interim is confirmed and no code changes.**

`160422` is the single best frame: nineteen rows, five modes, every amount at two decimals.

---

## 3. NO END-ROUND ON ZERO-WIN ROUNDS. Rules TR-064.

### `152145` (the negative result) and `152225` (the positive control)

This pair is the whole ruling, and neither frame would be sufficient alone.

**`152145` SHOWS.** DevTools Network, filter box `wallet`, **Invert unchecked**. Exactly nine
request rows, **every one of them named `play`**, all status 200, all `fetch`, 0.4 kB each.
Footer `9 / 11 requests`. No `end-round` row anywhere. Beside it the game reads WIN `$0.00`, and
the platform's Bets panel shows eight consecutive settled base rounds, 15:21:39 through 15:21:48,
each cost `$1,000.00` and each payout `$0.00`.

**`152225` SHOWS.** The identical `wallet` filter, Invert still unchecked, forty seconds later in
the same session during an OVERDRIVE FREE SPINS round. The request list now interleaves
`play, play, play, play, play, end-round, play, end-round, play, play, play, end-round, play,
play, play, end-round`. A hover tooltip on one of them reads, in full,
**`https://rgsd.stake-engine.com/wallet/end-round`**. Footer `27 / 35 requests`.

**PROVES.** The `wallet` filter can and does display `end-round` rows: four of them are visible
in `152225` under that exact filter. So the absence of any `end-round` across the zero-win run in
`152145` is a real observation and not a filter artefact. The endpoint path is confirmed from the
platform's own tooltip to contain `wallet`, and independently from our source at
`frontend/src/lib/services/rgsService.ts:699`, which posts to `${params.rgs_url}/wallet/end-round`.

**Therefore the RGS returns `active: false` on a zero-win round, our `playResp.active` gate does
not fire, and no end-round request is sent.** The platform's testing guideline item 12, *"Zero-win
bets do not send an end-round request to the RGS"*, is satisfied by the current code. The
first-party conflict TR-064 recorded does not arise in practice, and the option (a) observation
the row called for has now been made. **No code change**, which is the outcome the row explicitly
protected against getting wrong.

`152225` also shows the response body of a wallet call: `{"balance":{"amount":561700000000,
"currency":"USD"}}`, integer micros for USD 561,700.00, corroborating the integer-micros contract.

---

## 4. THE MONEY DISPLAY FAILS AS ONE CLASS, IN FIVE PLACES. Feeds JOB 3.

Five distinct surfaces, one session, one underlying cause: a money string that does not fit its
box is clipped, ellipsised or allowed to overflow, and which of those three happens depends only
on which component drew it.

| Frame | Surface | What is rendered | What the value is |
|---|---|---|---|
| `155826` | compact bar PRIZE pod | `684,200.00 G`, cut at BOTH ends | +XGC 7,684,200.00, from the platform row in the same frame |
| `160121` | TOTAL PRIZE pod | `449,400.00...`, a literal ellipsis, `GC` suffix dropped | 449,400.00 GC, printed correctly by the banner in the same frame |
| `155533` | all five PLAY MODES cards | `500,000.0...`, `625,000.0...`, `50,000,00...`, `200,000,0...` | not legible; five for five clipped |
| `154741` | narrow compact bar | `BAL 29.9` cut mid-glyph, `WIN 0 G` missing its `C` | 29,999.00 GC per `154754` |
| `155247` | replay WIN window | `350,000.00 GC` spilling past the window on both sides | 350,000.00 GC |

**PROVES.** The defect is not a viewport, a currency or a component. It is the absence of one
shared fit-or-abbreviate behaviour, which is exactly what JOB 3 builds. `155826` is the owner's
`GC 7,684,200` frame named in the brief. Note that `160121` shows the SAME value rendered
correctly by the banner and incorrectly by the pod eight centimetres away, which is the clearest
possible statement that this is a per-component accident rather than a layout constraint.

---

## 5. THE REPLAY GHOST POD. TR-087's root cause, owner-confirmed live. Feeds JOB 4.

### `155247`

**SHOWS.** A Bet Replay of the winning round settled at 15:51:32. The stripped replay view is
present and correct: the reel grid, a magenta `PRIZE` box reading `350,000.00 GC`, and a
`REPLAY AGAIN` button. **Mounted on top of it, over the bottom right of the grid, is the normal
gameplay MULTIPLIER and WIN pod**, chrome bezel and lightning VFX included, showing `0.7x` and a
WIN window whose `350,000.00 GC` overflows it on both sides.

**PROVES.** Gameplay-only UI mounts in replay mode. The same figure is printed twice on one
screen by two different components. This is the ghost pod the brief names, confirmed live by the
owner rather than inferred, and it is why JOB 4 fixes it at the root with a replay-mode assertion
that only replay UI mounts, rather than by hiding one widget.

It also carries the fifth instance of the money-display class in section 4 above, so the two jobs
meet in this single frame.

---

## 6. THE APPROVAL GUIDELINES STAND AT 0 OF 58

`023040`, `023131`, `152145`, `153527`, `155145`, `155225`, `155826`, `160121` and `160422` all
show the platform's `Guidelines` tab reading **`0/58`**. The counter did not move at any point
today. **The tab is never opened in any frame**, so this pack proves the count and nothing about
the content of the fifty-eight items. Feeds JOB 6, where the owner ticks them.

---

## 7. Frame index

Frames not named in sections 1 to 6 were read and are catalogued here in one line each. Nothing
in this pack was copied without being read.

| Frame | What it is |
|---|---|
| `021356` | Asset upload dialog, 110 files / 14.9 MB staged, "Publish immediately after upload" left UNCHECKED. Its own header says 107 files while its Upload card says 110; recorded rather than resolved. Pre-Start Sync, so it does not prove the upload ran. |
| `022611` | Platform Files page. MATH 380 MB / 12 files, FRONTEND 14.9 MB / 110 files. All five `books_<mode>.jsonl` and all five `lookUpTable_<mode>_0.csv` are listed by name and size. Math shows the contradictory pair "Not published yet" and "V1 published successfully."; Front End is "Not published yet". |
| `023040` | See section 1. Also the Danish (`language=da`) EUR session; TR-082's clean English fallback is what is on screen. |
| `023131` | See section 1. Reel grid is pixel-identical to `023040` fifty-one seconds and one settled bonus round later, with no winning cells marked despite WIN reading EUR 35.79. Recorded as an observation, not a finding: the client may legitimately restore the prior base board after a feature. |
| `093952` | Portal launch/files page for `we-roll-spinners / future-spinner-2`. |
| `094435`, `094455`, `094758` | Three narrow crops of the same DevTools Console log at different scroll positions. |
| `095057` | Launcher URL with the game canvas rendering and DevTools open. |
| `095546` | The in-game SELECT BET modal, game client only. |
| `152254` | Game canvas with DevTools Network docked right. |
| `152343`, `152432` | The in-game "Session information" modal, at two window sizes. |
| `152413` | A big-win presentation at a wide landscape size beside the platform panel. |
| `153442` | Local test harness with a settings popup open. |
| `154405`, `154437` | The harness window, the second with the Chrome remote-debugging infobar pinned across it. |
| `154505`, `154711`, `154754` | The game at three desktop-ish viewports. |
| `154621`, `154636`, `154655` | The game in portrait phone-width preview frames, three sizes. |
| `155521` | The in-client Info / paytable screen, top. |
| `160100` | **Not a usable capture.** The file is a 4 x 1 pixel PNG, 671 bytes. It is an accidental empty screenshot. Kept in the pack because it was taken today and its absence would be a silent gap; it is evidence of nothing. |
| `160233` | A cropped horizontal band of a win presentation. |

---

## What this pack changes

| Row | Before today | After these frames |
|---|---|---|
| TR-057 | PARKED, check could not be run | **CLOSED.** Platform prints XGC at two decimals; interim confirmed; no code change. |
| TR-064 | PARKED, awaiting one observation | **CLOSED.** No end-round on zero-win rounds; guideline satisfied; no code change. |
| TR-086 | OPEN, one measured viewport | Feeds JOB 3, now with four more instances across three more surfaces. |
| TR-087 | FIXED at source, awaiting live re-capture | **Re-observed live, and a SECOND defect found in the same frame**: the ghost pod. See JOB 4. |
| Round three reviewer 1's maths | Two claims asserted against an inaccessible repository | **Both REFUTED**, one by the platform's live x5000.00 settlement, one by closed-form derivation. |
