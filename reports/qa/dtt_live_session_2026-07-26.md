# DTT live session, 2026-07-26: full transcription and audit

**Written for Fable, who cannot see the owner's screenshots.** Everything visual in this
session arrived as nineteen PNG captures on the owner's Desktop. This document transcribes
all of them into text, states what each one proves, and records the findings. Where a
figure appears below it is either read directly off a capture or computed from files on
disk, and the source is named in either case per convention (l.3).

**Status in one line:** the game is published, running, and playable on the real platform;
all five modes read COMPLIANT on the platform's own maths page with figures matching ours
to the digit; four frontend files never reached the portal and one of them is a live
player-visible asset; the published bundle is one commit behind `main`.

**Capture set.** `~/Desktop/Screen Shot 2026-07-26 at *.png`, nineteen files, 04.57.12 to
05.16.33. They are not yet committed; see OPEN ACTIONS.

---

## 1. What the platform now holds

Read from the Files page captures at 04.57.12, 04.58.28, 04.59.09 and 04.59.37.

| Panel | Portal reports | The kit on the Desktop holds | Delta |
|---|---|---|---|
| MATH | **380 MB, 13 files** | 12 files | portal has one extra |
| FRONTEND | **13.0 MB, 104 files** | 108 files, 15,510,083 bytes | portal is short four |

Per-file maths sizes as the portal lists them: `books_bonus.jsonl.zst` 145 MB,
`books_super.jsonl.zst` 142 MB, `books_antelite.jsonl.zst` 38.4 MB,
`books_base.jsonl.zst` 27.4 MB, `books_cruise.jsonl.zst` 16.4 MB,
`game_metadata.json` 1.43 KB, `index.json` 893 B, `HASHES.txt` 2.82 KB.

The extra maths file is `math/HASHES.txt`. That is a packaging error of mine, not a
platform fault: the walkthrough moved both hash files to the kit root precisely so they
could not be dragged in, and one was still inside the maths folder when the owner
uploaded. It is inert on the platform. It should be deleted so the panel reads twelve.

### 1.1 The four missing frontend files

Produced by diffing the portal's own 104-line file listing, pasted by the owner, against
`find` output from `~/Desktop/FS_UPLOAD_KIT/02_frontend_upload/`. Nothing on the portal is
absent from the kit, so no stray file went up; the traffic is one way.

| Missing file | Bytes | Live reference in the source |
|---|---|---|
| `assets/themes/future-spinner/ui/scene_character.png` | 629,245 | **YES**, `SceneGroup.svelte:71` |
| assets/sounds/bgm_loop.mp3 | 955,254 | none |
| `assets/themes/future-spinner/frames/frame-1.png` | 169,689 | none |
| assets/themes/future-spinner/ui/brand_mark_base.png | 107,674 | none |

**Corroboration by a second route.** The four total 1,861,862 bytes.
15,510,083 minus 1,861,862 is 13,648,221 bytes, which is 13.015 MB, and the portal's
FRONTEND panel reads 13.0 MB. The byte arithmetic and the name diff agree.

Per (l.4) I should say what these two share: both read the portal's own accounting, one
its stored names and one its stored byte total, so they are independent of each other but
not independent of the portal. The kit side of each comparison is independent, being the
local filesystem. I treat this as strong but not absolute.

### 1.2 The broken image is `scene_character.png`, and this is confirmed visually

The 05.11.48 capture shows the running game. A broken-image placeholder glyph sits inside
a thin rectangular outline on the left of the stage, roughly where a standing figure would
be. The car behind it renders correctly. `scene_car.png` uploaded; `scene_character.png`
did not.

`SceneGroup.svelte:71` is
`<img class="char-img" src="{$themeAssets.assetBase}/ui/scene_character.png" alt="" ...>`,
and that file's own comment at line 12 describes the asset as "the pilot as a FEATURE
HERO". An `<img>` with a 404 source and `alt=""` renders exactly the placeholder seen.

The other three missing files have no live reader, verified by grep across
`frontend/src`: the root-level assets/sounds/bgm_loop.mp3 is shadowed by the themed copy
at `assets/themes/future-spinner/sounds/bgm_loop.mp3`, which did upload and is what
`themeStore.ts:71` resolves to, so audio is unaffected; `frame-1.png` was superseded by
`frame-2.png` at `themeStore.ts:57`; brand_mark_base.png was superseded by
`hero_icon_96.png` at `LoadingScreen.svelte:22`.

### 1.3 Cause: not determined, and not guessable

Ruled out from evidence rather than asserted:

- **Not size.** 169,689-byte `frame-1.png` failed while 1,036,271-byte `scene_car.png`
  succeeded.
- **Not content de-duplication.** No two files in the 108 share an MD5; checked.
- **Not position.** The four sit at indices 11, 28, 75 and 101 of the sorted 108.
- **Not a reported skip.** The maths sync dialog at 04.57.12 reads
  `Skip 0 Files (0 B)`, `Delete 0 Files`, `Move 0 Files`.

**Missing input, named rather than reconstructed per (m):** the frontend upload's own sync
dialog was never captured. The 04.57.12 dialog is the maths upload. Without the frontend
dialog's Upload and Skip counts we cannot tell whether the portal received 108 and stored
104, or was only ever handed 104. That distinction decides whether this is a platform
defect worth reporting upstream or a drag-and-drop selection slip. The next upload should
be captured before Start Sync is pressed.

---

## 2. Publishing worked, and the walkthrough's diagnostic earned its place

The 05.00.31 capture shows the Versions menu reading **`Front (Current Vundefined)`** and
**`Math (Current V)`**. The 05.12.05 capture, after Publish Game, shows
**`Front (Current V1)`** and **`Math (Current V1)`**.

This is the exact check written into `00_READ_ME_FIRST.md` step 16, and it behaved as
documented. Worth recording because the step was written speculatively from the client
code, not from having seen the portal.

---

## 3. The Developer Testing Tool's real capability surface

Transcribed from the toolbar captures at 05.00.23, 05.00.31, 05.00.45, 05.00.54 and
05.00.59. `DTT_PROTOCOL.md` was written without ever having seen this toolbar, so this
section is new ground truth.

**Menus:** Versions, Settings, Local Testing, Screen, Replay.

**Settings:** Balance, Currency, Language, Device Type, Open in New Tab, Social Mode.
Balance presets run $100.00 through $10,000,000,000.00 in nineteen steps.

**Screen**, and this one matters:

| Preset | Size |
|---|---|
| Desktop | 1200 x 675 |
| Laptop | 1024 x 576 |
| **Popout S** | **400 x 225** |
| Popout L | 800 x 450 |
| Mobile L | 425 x 812 |
| Mobile M | 375 x 667 |
| Mobile S | 320 x 568 |

**Popout S is exactly 400 x 225.** The mini-player HUD built in R2R JOB 8 and rebuilt in
R2R-R JOB C targeted 400 x 225 on the strength of a reviewer's assertion. The platform's
own tool confirms the number.

I then re-derived our gate against this list rather than assuming it still fits.
`App.svelte:759` is
`window.innerWidth <= 480 && window.innerHeight <= MINI_HEIGHT_BREAKPOINT`, with the
breakpoints 480 and 300 at lines 754 and 755. Against all seven presets: Popout S
(400 x 225) enters mini, correctly; Popout L (800 x 450) does not, correctly; and
**Mobile S (320 x 568) does not**, because the conjunction requires both. Had that gate
been a disjunction, the narrowest phone would have received the popout strip. It is a
conjunction. No defect, and now checked against the real list instead of an assumed one.

**Local Testing** offers a **Redirect URL** field, defaulting to `http://localhost:3000`,
labelled "Useful for local testing". This is a significant capability we did not know we
had: the DTT can point at a local dev server while still using the real RGS. Iterating on
the localisation and hero-image work no longer requires a full upload and publish cycle
per attempt.

**Replay** read **"No game modes available"** at 05.00.23. That capture is timestamped
before the publish confirmed at 05.12.05, so it is very likely a pre-publish state rather
than a defect. It is not proven either way and DTT check 8 remains outstanding.

---

## 4. Maths: the platform's independent verdict

From the Math Distribution and Summary page, Version 1, captures 05.15.55, 05.16.05,
05.16.15, 05.16.24 and 05.16.33. **This is the dossier evidence required by map item (6)
and it is uniformly good.**

### 4.1 Overall bet level compliance: every constraint passes at both tiers

| Constraint | Our value | 2 Star limit (Max 200x) | 3 Star limit (Max 1000x) |
|---|---|---|---|
| Max Exposure | 1,000,000.0 / 5,000,000.0 | 15,000,000.0 | 50,000,000.0 |
| Max Payout Multiplier | 5,000.0 | 25,000.0 | 100,000.0 |
| Max Bet Cost | 80,000.0 / 400,000.0 | 100,000.0 | 500,000.0 |
| Cost Multiplier | 400.0 | 1,000.0 | 1,500.0 |
| Base Volatility (Std Dev) | 17.3 | 0.6 to 50.0 | 0.6 to 60.0 |
| Tail Probability (5,000x) | 0.003 | 0.010 | 0.010 |
| Tail Probability (10,000x) | 0 | 0.002 | 0.005 |
| Risk Limit (CVaR) | 205.710 | 700.000 | 800.000 |
| Expected Tail Liability (40x) | 0.641 | 0.800 | 0.900 |
| Expected Tail Liability (10,000x) | 0 | 0.600 | 0.800 |
| Expected Tail Liability (Sum) | 0.641 | 1.300 | 1.500 |

Every row carries a green tick in both columns.

### 4.2 All five modes COMPLIANT

| Mode | Cost | Platform volatility band | RTP | Hit | Max | B/E |
|---|---|---|---|---|---|---|
| BASE | 1x | HIGH | 96.35% | 29.11% | 5,000x | 97.0% |
| CRUISE | 1x | MEDIUM | 96.35% | 43.86% | 5,000x | 95.9% |
| ANTELITE | 1.25x | HIGH | 96.35% | 29.44% | 5,000x | 97.3% |
| BONUS | 100x | LOW | 96.35% | 100.00% | 5,000x | 76.5% |
| SUPER | 400x | LOW | 96.35% | 100.00% | 5,000x | 71.8% |

### 4.3 Per-mode compliance, BASE: 6 of 6

| Check | Requirement as the platform words it | Result |
|---|---|---|
| RTP Range | "Return to Player must be between 90% and 96.70%" | 96.35% |
| Maximum Win Achievability | "Advertised max win must be realistically obtainable", odds at most 1 in 20.00M | 1 in 0.10M |
| Non-Zero Win Hit Rate | "Non-zero wins should occur at least 1 in every 20 spins" | 1 in 0.3 |
| Cross-Mode RTP Consistency | "RTP across all modes must be within 0.5% of each other", variance at most 1.00% | **0.00% variance** |
| Base Mode Cost | "Default mode cost-multiplier must be 1.0x" | 1.00 |
| Bet Level Validator | "Valid bet-level template must exist" | Up to 1000x |

Note the RTP ceiling: **96.70%**. We sit at 96.35%, inside it with 0.35 points of headroom.
That ceiling has not previously been quoted from a first-party surface in our records.

### 4.4 The platform's own BASE property table, against our committed claims

This is the strongest independent corroboration the project has had. The platform computed
these from the uploaded books without any input from us.

| Property | Platform | Our committed claim | Source of ours |
|---|---|---|---|
| Return to Player (%) | **96.3500** | 96.3500% at 4dp | `CLAUDE.md`, True game facts |
| Standard Deviation | **17.2841** | 17.28 weighted SD | `CLAUDE.md`, Base mode |
| Simulation Count | 100000 | 100,000 rounds per mode | `CLAUDE.md` |
| Maximum Payout Multiplier | 5000 | 5,000x hard cap every mode | `CLAUDE.md` |
| Probability of Zero Win (%) | 70.8870 | hit rate 29.11% | 100 minus 70.8870 is 29.1130 |
| Cost Multiplier (SUPER) | 400.0 | super 400.0x | `CLAUDE.md` |
| Max Win Hit-Rate | 100000.0006 | wincap 1 in 100,000 | `CLAUDE.md` |

Also reported, with no prior claim of ours to check against: Average Win 0.9635, Minimum
Payout Multiplier 0, Zero Payout Count 50564, Non-Zero Weight Count 100000, Number of
Unique Payout Values 10930, Most Probable Simulation Hit-Rate 258.6861, Probability of
Payout less than Bet 96.9687.

**Detailed metrics, BASE:** volatility 17.28 (HIGH), outcomes 100,000, zero rate 70.89%,
mean 0.96x, win hit-rate 3.43, std dev 17.2841, min 0.00x. Outcome breakdown Dead 70.9%,
Sub-bet 26.1%, Win 3.0%. Average spins between any win 3; worst-case zero streak 20 spins
at 1 in 1000. Average spins between profit 33 spins; worst-case loss streak 224 spins at
1 in 1000.

**Hit rate distribution, BASE**, bands with counts, effective hit-rate and RTP
contribution: (0, 0.1) 2 / 1.40 / 0.00%; (0.1, 1) 73 / 3.89 / 14.33%; (1, 2) 86 / 451.30 /
0.33%; (2, 5) 190 / 215.88 / 1.57%; (5, 10) 242 / 241.62 / 3.05%; (10, 20) 481 / 139.19 /
10.47%; (20, 50) 1637 / 138.30 / 21.55%; (50, 100) 2428 / 250.58 / 27.60%; (100, 200)
2927 / 1175.62 / 10.53%; (200, 500) 2368 / 19016.25 / 1.48%; next band 0.40%, truncated by
the capture.

**Nothing here contradicts anything we have published.** Every figure we had already
claimed is confirmed to the precision the platform prints.

---

## 5. Findings

### 5.1 TR-061: four files absent from the portal, one of them live

Covered in section 1. Severity Major while the hero is broken in a running build, trivial
to remedy. Fix is a re-upload, but see TR-062 before doing it.

### 5.2 TR-062: the published bundle is one commit behind `main`

The kit at `~/Desktop/FS_UPLOAD_KIT/02_frontend_upload/` was built before commit `5674bd7`
(the TR-060 dash fix). Verified directly: its shipped
`assets/index-DEOd1P6P.js` still contains **nine** em dash occurrences, including the two
player-facing paytable strings that TR-060 removed, and the owner's 05.14.38 capture shows
both of them rendering to a player right now.

**Consequence for the remedy:** re-uploading the existing kit would restore the hero image
and re-ship the em dashes. The re-upload must be a **fresh clone build** per convention
(o), not the folder currently on the Desktop.

**The deeper finding:** nothing in the artefact ties a published bundle to a commit. There
is no build stamp in `dist/`, so "what is live" is not answerable from the repository, only
inferred by grepping the bundle as I did here. That is the same class as TR-047, where a
committed size figure was checkable on exactly one machine.

### 5.3 TR-063: the dash gate still cannot see the string form that produced TR-060

Self-audit before reporting, per (l.5), and it corrects my own closure note on TR-060.

TR-060 widened `player_string_dash_check.mjs` from 2 files to 25 and I recorded it as
closed with "gate green at 25 files". The gate is green and the strings are gone. But the
widening fixed only the file-coverage half of the defect:

- **Line 65 reads only single-quoted JavaScript literals**,
  `codePart.match(/'([^'\\]|\\.)*'/g)`. The two strings TR-060 found were **markup prose
  between tags**, not quoted literals. The gate would not catch them today. Double-quoted
  strings and template literals are equally invisible.
- **`src/App.svelte` is not in `FILES`**, which lists `translations.ts`, `fsModes.ts` and
  `src/lib/components/*.svelte`. `App.svelte:1215` is
  `<title>{$activeTheme.name} — We Roll Spinners</title>`, an em dash in the browser tab
  title, player-visible, shipping, and green.

So the gate now scans more files for a form of string that was never the problem. This is
the same pattern the project has now named four times, one level further down: the fix
addressed the instance and reported the class as closed. TR-060's row is amended rather
than left standing.

### 5.4 TR-059 confirmed on the real platform, and wider than filed

Already OPEN. The 05.14.20 and 05.14.38 captures are the live evidence. In a `de` session
the chrome translates (`DREHKOSTEN`, `DREHMODI`, `WÄHLEN`, `AKTIV`, `AKTIVIEREN`,
`GEWINNTABELLE`) while the body stays English: mode names Normal, Cruise, OVERBOOST, Buy
Overdrive; every blurb; "Match symbols on adjacent reels starting from reel 1 (left to
right)"; "Substitutes for all symbols except SCATTER"; "BUY FEATURES"; "BET MODES";
"All modes, RTP 96.35%".

**New, and not in the filed row:** the DTT's Language menu lists
`ar de en es fi fr hi id ja ko pl pt ru tr zh vi da`, and the list was still scrolling at
the capture edge. We ship exactly sixteen locales, verified from
`lib/i18n/translations.ts`: `ar de en es fi fr hi id ja ko pl pt ru tr vi zh`. **`da`
(Danish) is offered by the platform and is not one of ours**, and there may be more below
the fold. Parked per (l.6) rather than guessed: the owner should scroll that menu and
capture it in full before we size the work.

### 5.5 Positive confirmations worth banking

- Bonus buys action correctly; owner-reported and consistent with the 05.14.20 capture,
  where at a $500.00 bet Buy Overdrive prices at `100x, $50,000.00` and OVERBOOST at
  `1.25x per spin while ON, $625.00`. Both are exactly right, which exercises the
  per-tier cost path that TR-016 replaced.
- Paytable values render correctly: 1,024 ways; scatter `3/4/5 = 1x/3x/10x + 8/12/16 free
  spins`; H1 3x 1.5 and 4x 6; H2 0.8 and 3; M1 0.45 and 1.5; M2 0.3 and 1. All match the
  PAR sheet.
- Language switching itself works. The owner's German session was a deliberate test and
  the mechanism responded; the gap is unkeyed prose, not broken i18n.
- The intro splash, loading screen, logo, frame, grid, HUD and FEATURES entry all render
  correctly at Desktop size.

---

## 6. Where DTT_PROTOCOL.md stands

| Check | Subject | State |
|---|---|---|
| 1 | authenticate response shape | not yet captured |
| 2 | micros vs whole units | not yet captured |
| **3** | **`round.state.events`** | **not yet captured, highest value outstanding** |
| 4 | end-round payload and response | not yet captured |
| 5 | interrupt and resume-and-settle | not yet captured |
| 6 | absence of currency display metadata | not yet captured |
| 7 | Gold Coin decimals, the TR-057 tiebreak | not yet captured |
| 8 | replays across five modes | Replay read "No game modes available" pre-publish; unresolved |
| 9 | jurisdiction controls | not yet captured |
| 10 | mini player | target size confirmed as 400 x 225; not yet run |

The owner is currently running $1 autospins to accumulate maths data, which does not
require any of these and does not conflict with them.

---

## 7. Open actions

1. **Rebuild from a fresh clone** per convention (o) and re-upload the frontend, so the
   hero image returns and the em dashes do not. Capture the sync dialog before pressing
   Start Sync, and confirm the panel reads 108.
2. **Publish Game again** after the re-upload; files alone change nothing until published.
3. Delete `math/HASHES.txt` so MATH reads twelve files.
4. Commit the nineteen captures to `reports/screens/dtt-live-2026-07-26/`.
5. Scroll and capture the full DTT Language list, to size the TR-059 locale gap.
6. Continue the ten protocol checks, check 3 first.

**For Fable to rule on:** TR-062's build-provenance question (should `dist/` carry a commit
stamp, and should the upload kit be regenerated rather than reused), and TR-063's proposed
rewrite of the dash gate from literal-matching to markup-aware scanning. Both are recorded
with options in the tracker.

---

# PART 2, appended 2026-07-26: the remediation round, live play data, and the guidelines

The owner re-uploaded, republished to **Front V2**, ran 143 live rounds, and captured the
platform's testing checklist. Twenty-one further captures, 05.46.02 to 06.08.50, committed
to the same folder. This part is appended rather than filed separately so the session reads
as one story.

## 8. TR-061 is FIXED, and the portal named the same four files I did

The owner re-dragged the same kit folder. The sync dialog, captured this time, read:

> **Upload 4 Files. Skip 104 Files. Delete 0 Files. Move 0 Files.**
>
> `upload bgm_loop.mp3` / `upload scene_character.png` / upload brand_mark_base.png /
> `upload frame-1.png` / `skip win_pod_v3_idle.png` / `skip win_pod_v3_active.png` / ...

**The portal independently identified exactly the four files I identified by diff.** That is
genuine independent corroboration in the (l.4) sense: my four came from a local `find`
diffed against a pasted text listing; the portal's four came from its own content
comparison against what it already held. Different inputs, same four names.

**It also settles the cause, which Part 1 left open.** The sync is content-aware. Re-dragging
the same folder produced "upload 4, skip 104", which proves the folder held 108 on both
runs. So the first upload handed the portal 108 and the portal stored 104: **the four were
dropped platform-side, silently, with no error surfaced to the owner.** The first run's
dialog was still never captured, so I state this as strongly supported rather than proven.

This is worth reporting upstream. A sync that drops files without reporting them is a
platform defect, and the only reason it was caught is that the walkthrough told the owner to
compare the panel count against 108.

**Confirmed visually:** the 05.50.11 capture shows the pilot rendering against the car.
Versions now read **`Front (Current V2)`**, `Math (Current V1)`.

## 9. TR-062 is still live in V2, exactly as predicted

The re-upload sent four PNG and MP3 files. It did not rebuild anything. The 05.57.57 capture
of the paytable still shows *"Reels 1, 2 and 3 hold the same symbol (highlighted) — a match"*
with the em dash intact. **The published V2 bundle is still one commit behind `main`** and
still ships the strings TR-060 removed. The remedy remains a fresh-clone rebuild.

## 10. The maths figures have NOT changed, and they could not have

The owner asked directly whether the figures moved after a few hundred spins. **They are
identical, field for field, to the first capture.** I compared every value: the eleven
bet-level constraints, all five mode cards, the detailed metrics block, the six per-mode
compliance rows, and all fourteen property rows. Nothing differs.

**That is correct behaviour, not a stale page, and the reason matters:**

1. The page header reads **Version 1**, and it is the **Math** version. Only frontend files
   were re-uploaded, so Math stayed at V1 while Front went to V2. A page pinned to Math V1
   describes Math V1.
2. More fundamentally, this page is a **static analysis of the uploaded books**: 100,000
   simulated rounds per mode, computed once when the maths was ingested. `Simulation Count`
   reads 100000 and will keep reading 100000. It is not a live telemetry surface and no
   amount of play will move it. Live play appears in the **Bets** panel and in Accounting.

The full hit-rate distribution is now visible where the first capture truncated it. The
complete table, with the four previously unseen bands:

| Band | Count | Effective hit-rate | RTP contribution |
|---|---|---|---|
| (0, 0.1) | 2 | 1.40 | 0.00% |
| (0.1, 1) | 73 | 3.89 | 14.33% |
| (1, 2) | 86 | 451.30 | 0.33% |
| (2, 5) | 190 | 215.88 | 1.57% |
| (5, 10) | 242 | 241.62 | 3.05% |
| (10, 20) | 481 | 139.19 | 10.47% |
| (20, 50) | 1637 | 138.30 | 21.55% |
| (50, 100) | 2428 | 250.58 | 27.60% |
| (100, 200) | 2927 | 1175.62 | 10.53% |
| (200, 500) | 2368 | 19016.25 | 1.48% |
| **(500, 1000)** | **452** | **160934.03** | **0.40%** |
| **(1000, 2000)** | **42** | **3702760.60** | **0.03%** |
| **(2000, 5000)** | **1** | **261347920.01** | **0.00%** |
| **(5000, 10000)** | **1** | **100000.00** | **5.00%** |

**The contributions sum to 96.34%**, against the stated 96.3500%, the residual being
rounding across fourteen printed values. That is an internal consistency check the platform
does not perform for us and it passes.

**One fact in that table deserves the board's attention.** The wincap band contributes
**5.00% of RTP from a single outcome at 1 in 100,000**: 5,000x divided by 100,000 is exactly
0.05. So **5.19% of the game's entire return lives in one outcome most players will never
see**. That is a legitimate and deliberate design choice for a 17.28 SD game, it passes every
platform constraint, and it is not a defect. It is stated here because it is the single most
load-bearing number in the distribution and it has not previously been written down.

## 11. Live play: what 143 spins actually tell us, which is almost nothing

Two Session information captures, twenty-four seconds apart:

| Capture | Spins | Wagered | Won | Net |
|---|---|---|---|---|
| 06:08:26 | 131 | $131,000.00 | $69,740.00 | **-$61,260.00** |
| 06:08:50 | 143 | $143,000.00 | $152,590.00 | **+$9,590.00** |

**First, an internal check that passes.** The owner set the balance to $50,000,000. At the
second capture the HUD reads $50,009,590.00, and the panel's Net result reads +$9,590.00.
Those reconcile exactly. At the first, $49,938,740.00 against -$61,260.00. Also exact. **Our
own session accounting agrees with the platform's wallet to the cent across 143 settled
rounds.** That is the first end-to-end confirmation that the money path is right in
production.

**Second, the statistics.** Using the platform's own SD of 17.2841:

| Capture | Observed RTP | Deviation from 96.35% | Standard error of the mean | z |
|---|---|---|---|---|
| 131 spins | 53.24% | -43.11 points | 151.0 points | **-0.29** |
| 143 spins | 106.71% | +10.36 points | 144.5 points | **+0.07** |

Both are statistically indistinguishable from expectation. The 143-spin result sits **0.07
standard deviations** from the model. There is no signal here of any kind, good or bad.

**Third, the thing that makes it vivid.** Between those two captures, twelve spins wagered
$12,000 and won $82,850, swinging the session from -$61,260 to +$9,590. Essentially all of
it is one spin: **06:08:38, +$80,650.00 on a $1,000 bet, a ×80.65**. Remove that single
outcome and the remaining 142 spins returned **50.66%**.

So one spin in 143 moved the measured RTP from 50.7% to 106.7%, a 56-point swing. **That is
what a standard deviation of 17.28 means in practice**, and it is the clearest possible
answer to how the game is "tracking".

**Fourth, and this is the good news, that win was textbook.** Our committed model says the
base free-spin trigger rate is 1 in 184.7 and the average triggered-round win is 79.4x. In
143 base spins the expected number of triggers is **0.774**. The owner got one, and it paid
**80.65x against a modelled average of 79.4x**. Frequency and magnitude both landed on the
model's nose. That is not proof of anything at n=1, but it is exactly what should happen.

### How much play would it actually take?

Derived from the platform's own SD, at 95% confidence:

| To resolve RTP to | Spins required |
|---|---|
| plus or minus 10 points | **114,764** |
| plus or minus 5 points | **459,056** |
| plus or minus 1 point | **11,476,400** |

**RTP cannot be verified by playing.** Eleven and a half million spins to pin it to a single
percentage point. This is precisely why convention (l) exists: the RTP is *derived* from the
lookup tables and *confirmed* by the platform's static analysis of the books, both of which
already agree at 96.3500. Live play confirms that the money path works, not that the maths
is right. Both captures above are consistent with the model, and that is the most any
session of this size can say.

**Practical advice for the owner:** more autospins are useful for finding UI, animation and
settlement bugs, and for exercising the feature. They are not useful for validating RTP, and
a run that ends well down or well up means nothing. Do not read the session panel as a
verdict on the maths.

## 12. The Bets panel and the Guidelines tab, both new surfaces

**Bets.** Every round is listed with time, mode, cost, payout, multiplier and status.
Expanding a row gives **Event ID, Operator, Currency, Cost, Payout, Cost multiplier, Created,
Updated**, and a **"Replay this bet"** button. Event ID 52121 was replayed successfully.

Two consequences. First, **DTT check 8 is largely solved**: `REPLAY_TEST_EVENTS.md` guessed
at IDs and warned they might be one out; the owner can now replay any real round by clicking
it. Second, replay is confirmed working in production, disclaimer and all, which is a
mandatory compliance feature.

**Guidelines.** A 58-item "Reference checklist for testing", showing **0 of 58**. The owner
transcribed it in full and instructed that we work against it ourselves first. That
assessment is now at **`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`**:
**31 PASS, 14 OBSERVE, 8 OWNER, 3 FAIL, 1 CONFLICT, 1 not applicable.**

The three failures and one conflict are new tracker rows TR-064 through TR-067, summarised
in the comms entry. All three failures are small, self-contained frontend changes touching
no locked file and no maths.

## 13. Responsive behaviour, checked properly this time

All seven DTT presets were exercised. Desktop and Laptop are clean. Popout L renders the
full landscape HUD. Popout S renders the mini strip with all seven controls present, which
closes the substance of DTT check 10. Mobile portrait and Mobile S are playable.

Two defects, both new:

- **A scrollbar on the game frame** at mobile portrait, Mobile S and Popout S, absent on
  desktop. Root-caused to `App.svelte:1821`, where `.game-wrapper.portrait`,
  `.compact-landscape` and `.mini-player` carry `overflow-y: auto`. Exactly the three
  layouts, exactly the three captures. Guideline item 15. TR-065.
- **The mini strip's WIN readout is clipped mid-glyph** at Popout S, reading `$0.0` plus a
  partial character. The balance also drops its cents (`BAL $1,040` where the true balance
  is $1,040.06), which may be intentional but the clipping is not. TR-066.

## 14. Revised open actions

1. **Fresh-clone rebuild and re-upload the frontend**, which clears TR-062 and can carry the
   TR-065, TR-066 and TR-067 fixes in the same bundle. Republish afterwards.
2. **One network capture on a zero-win spin** to settle TR-064. This is now the highest
   value single observation in the project, ahead of DTT check 3, because it is a named
   guideline item with a pass or fail rather than a shape question.
3. Delete `math/HASHES.txt` so MATH reads twelve files.
4. Upload the game thumbnail in the Tile Editor; the portal still shows the placeholder.
5. Scroll and capture the full DTT Language list for TR-059 sizing.
6. Work the remaining fourteen OBSERVE items, most of which fall out of DTT_PROTOCOL.md.
