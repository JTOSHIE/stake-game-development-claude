# R154 - THE MERGE RULE IS RECORDED, THE R153 REPORT IS COMMITTED, AND THE WIN BANNER IS A FRAMED PLAQUE (2026-10-07)

Brief: `reports/briefs/FS_R154_MergeRuleWinBanner_Prompt.md`, saved verbatim first (0386a2ef) per convention (f).
Unattended. Branch `claude/r154-merge-rule-win-banner` from main at 2ffae8ef, PR #191. Under the brief's own standing
rule (now CLAUDE.md rule 17) this PR merges itself once its run on the committed tip is green, and the session stops.
Ultracode on: three workflows, eleven agents, none lost (wave 1 understand: 4 agents, 1,227,364 subagent tokens, 401
tool calls, 29 min; wave 2 adversarial review: 5 agents, 1,748,535 tokens, 543 tool calls, 55 min; wave 3 fix
verification: 2 agents, 725,322 tokens, 198 tool calls, 47 min). Eleven agents in all, 3,701,221 subagent tokens.

**PORT 5173: ONE BREACH, BY A SUBAGENT, RECORDED SO THE NEXT BRIEF CAN NAME IT.** The session never served on 5173. A
wave 1 agent (the gate-impact map) ran a scratch Vite probe with `port: 0`; Vite treats 0 as unset, fell back to 5173 and
bound 127.0.0.1:5173 for about two seconds before the agent closed it. `lsof -iTCP:5173` straight afterwards showed no
listener, and the owner had no server there (none was listening when this session started, checked at boot). Waves 2
and 3 carried the warning in every prompt: never start Vite with port 0; take a real port from `net.listen(0)` and pass
`--strictPort`, or serve the static dist.

## FIRST: main contains 2ffae8ef

VERIFIED 2026-10-07 by `git merge-base --is-ancestor 2ffae8ef origin/main` (exit 0): 2ffae8ef is the #190 merge, parents
c9319124 and 4395afef. Main's run on it, 37590109429, completed success before any R154 work was pushed. Portrait
conformance was not run, as the brief orders.

## The standing rule: CLAUDE.md rule 17

Recorded as rule 17 of the multi-track protocol (c0721077, tightened in e347de89 after wave 2 checked the
transcription). The owner's words are quoted verbatim. What the order requires is listed as such: a merge commit
(`gh pr merge <n> --merge --delete-branch`), "green" meaning the PR's own run on the committed tip with the static job and
every browser leg passing, the two stops (a red check, a locked path), and stopping after the merge. **Four earlier
instruments conflict with it and are named per convention (n), not edited**: rule 7 (Fable verifies every PR before
merge) and (t)'s review lane; rule 12 and convention (a)'s `owner:preview` sentence, which serve on 5173; and rule 10's
own-final-push check, whose push is now the merge that runs after the session stops. Dated notes sit above rules 7, 10
and 12 and above convention (a)'s sentence. **Five readings the order does not settle are labelled as readings**:
Fable's review becomes retrospective; a locked path stops the merge whatever its LOCK-SANCTION token; a skipped browser
matrix is not a stop; a PR run made stale by a moved main is re-run before merging; and the merge SHA goes in the
closing reply because the report is written before the merge. Wave 2's code reviewer found the first transcription had
stated three of those readings as if the owner had ordered them, and missed convention (a) and `--delete-branch`; e347de89
corrected all of it.

## TASK 1: the R153 report is committed

2893adef appends the R153 section to `reports/SESSION_REPORT.md` and copies it to
`reports/archive/2026-10-07_r153-operator-strip-hero-still.md`. It is PR #189's body from its own `# R153 -` heading
down, byte for byte, with the PR's opening summary and footer left off; a dated note above the record carries what came
after it (#189 merged as c9319124 at head afa58195; ruling 3 rode #190 and merged as 2ffae8ef; the four CI runs on those
heads all success). VERIFIED by wave 2's code reviewer: with the note removed, both copies equal the PR body from the
heading down, 24,503 bytes.

## TASK 2: the win banner

### Measured before (wave 1, main's production build, c0721077 = the 2ffae8ef tree)

A routed wallet served base.bigWin's events with the payout pinned per tier (16.2x, 45x, 162x of a 1.00 bet; the client
takes the win from `round.payout` and the tier from winAmount / betAmount). Held after the count-up, timers cleared,
animations paused, three byte-identical shots before measuring. Contrast is WCAG on the composited pixels, text fill
against the band with that text hidden, calibrated on known pairs (21.00 / 4.69 / 4.48 against 21 / 4.69 / 4.48).

| 1280x720 (stage = screen) | BIG | MEGA | EPIC |
|---|---|---|---|
| Band | 0,254.5 1280x111 | 0,240 1280x140 | 0,224 1280x172 |
| Row of text, x | 206.6 to 1073.3 | 147.7 to 1132.3 | 102.0 to 1177.9 |
| Label / amount / multiplier px | 22 / 50 / 16 | 28 / 64 / 20 | 36 / 80 / 26 |
| Contrast amount / label / multiplier | 14.13 / 12.59 / 13.44 | 13.70 / 5.76 / 13.67 | 11.98 / 10.85 / 13.62 |

| 390x844 (stage scaled 0.717) | BIG | MEGA | EPIC |
|---|---|---|---|
| Band, screen | y 250.71 h 99.08 | y 247.0 h 106.51 | y 243.28 h 113.94 |
| Band, stage | 1280x138.14 | 1280x148.5 | 1280x158.86 |
| On screen px, label / amount / multiplier | 14.3 / 25.2 / 9.3 | 15.8 / 28.0 / 10.0 | 17.2 / 30.8 / 10.8 |
| Contrast amount / label / multiplier | 14.28 / 9.92 / 7.24 | 13.22 / 4.68 / 11.42 | 11.10 / 6.83 / 7.27 |

What else the measurement found on main, unchanged by R154 unless said: at 1280 the band crossed the hero's head, the
desktop FEATURES button (966,238) and, at the feature end, the bonus column; the 1280 EPIC burst paints 112 px of the HUD
panel (10 px into it, 3 px above the WIN pod); the feature-end FEATURE COMPLETE title is unreadable under the EPIC burst
(contrast 1.89 / 1.94, 15.19 / 15.25 with the banner hidden); at 390 the band's ends are off screen; and the phone text
was shrunk twice (vw inside a scaled stage).

### What the repository holds (wave 1 survey of 2,774 committed images and 28 SVGs)

**One committed raster fits: `frontend/public/assets/themes/future-spinner/frames/frame-2.png`**, the reel's own neon
bezel. 800x640 RGBA, 95,245 B, sha256 cd9e924d44888d59...; no lettering; window truly transparent (x 89 to 710, y 76 to
563); corner brackets spanning 96 px of source top and bottom and 92 to 93 at the sides; plain rail and tube between
them; already shipped (themeStore.ts:75), so wiring it costs 0 bytes. Provenance: committed 2026-04-04 (8eec7330) as
`frame_clean_minimal.png`, maker not recorded (the briefs of the day name Manus, REPORTED); chosen for the reel by the
owner-approved LAYOUT_SPEC v3.1 blueprint (f06fbce6). Everything else was refused: `overdrive_perimeter.png` is text-free
but owner-ruled off the stage (R131) and pruned; the 1000062171/4/5/6 frames bake WIN or BONUS or a checkerboard;
`panel_win.png` and the balance panel bake words; `plate_instrument.svg` was never exported (using it means rendering a
new file). The "card sheet" the brief fences off is, by inference, the four gitignored `.scratch` royal-tile packages of
2026-10-07; nothing from them was touched.

### What changed

`WinBanner.svelte` (65496fb5, then b59971f7 after wave 2): the live tier label, the live amount (still the shared
count-up, Exo 2, autofit, R060 compact fallback) and the live multiplier stand stacked in `.c1-lockup`, a plaque framed
by `.c1-frame`: frame-2.png as a CSS 9-slice (slice 96, border 26 / 28 / 30 px). The url() is inline from `assetBase`,
because a stylesheet or custom-property url() resolves against the CSS file and 404s in production while
asset_reference_gate passes it (wave 1, three engines). Tier colour is a filter: none (cyan), MEGA hue-rotate(142deg)
saturate(1.4), EPIC 242deg, Overdrive 207deg. Rendered tube hue at 1280: BIG 181.8, MEGA 315.0 (label 317), EPIC 50.9
(gold 51). A seal copy of the frame, 1.5 px wider, sits under the first to cover the 9-slice joints. The full-width scrim,
the two full-width neon rules, the band's end mask and its full-width glow are gone; the glow ladder rings the plaque.
The face keeps the band's measured box (`--band-h`), and the plaque stands on its bottom edge and grows upward, so the
HUD and FEATURE COMPLETE clearances are as before. The EPIC chromatic flash, the particle field and the coin fountain
follow the plaque. Phones use the stage-px tier ladder.

**The exact size, as the brief asks.** Source: 800x640, slice 96. Drawn border: 26 / 28 / 30 stage px. Plaque, stage px:

| | BIG | MEGA | EPIC |
|---|---|---|---|
| 1280 (screen = stage) | 440 x 165.6 at x 420 to 860, y 199.9 to 365.5 | 460 x 196.6, x 410 to 870, y 183.4 to 380.0 | 480 x 234.6, x 400 to 880, y 161.4 to 396.0 |
| 390, stage | 440 x 165.6, bottom 379.0 | 460 x 196.6, bottom 384.3 | 480 x 234.6, bottom 389.5 |
| 390, on screen | 315.6 x 118.8 | 329.9 x 141.0 | 344.3 x 168.2 |

### What is missing

- **A frame made for a banner.** Every committed text-free frame with an open window is a reel or stage frame (1.25:1 or
  16:9). The banner uses the reel's own bezel, so at BIG the plaque is that raster at about a quarter scale inside
  itself; three tier colourways exist only as CSS filters, not as drawn art. R113's text-free 1400x360 horizontal banner
  backing, the nearest thing ever offered, lives only in gitignored `.scratch` and was never committed.
- **A clean source.** frame-2.png carries 152 opaque dark-green key-residue pixels and teal specks along its inner side
  edges (source x 88 and 704 to 711); the 9-slice draws them, and after the filter they read as off-hue flecks: 5 to 8
  bright pixels at 1280, 60 to 92 at 390 on a 3x screen (wave 2). Cleaning them means a new raster, which the brief
  forbids; owner list.

### After (e347de89, wave 1's instrument, same cases; fa66f225 changes only the replay mount and the flash's timing)

| | 1280 BIG | 1280 MEGA | 1280 EPIC | 390 BIG | 390 MEGA | 390 EPIC |
|---|---|---|---|---|---|---|
| Amount (before) | 14.13 | 13.70 | 11.98 | 14.28 | 13.22 | 11.10 |
| Amount (after) | 16.00 | 15.00 | 13.93 | 15.75 | 14.99 | 13.98 |
| Label (before) | 12.59 | 5.76 | 10.85 | 9.92 | 4.68 | 6.83 |
| Label (after) | 12.19 | 5.11 | 9.96 | 12.44 | 5.14 | 10.00 |
| Multiplier (before) | 13.44 | 13.67 | 13.62 | 7.24 | 11.42 | 7.27 |
| Multiplier (after) | 10.50 | 11.49 | 10.26 | 10.54 | 11.66 | 10.33 |

**One figure needs its method stated.** The amount's clip room (padding-block .2em, margin-block -.2em) makes its box
0.4em taller without moving a pixel, and the instrument samples the backdrop inside that box, which then takes in the
label and multiplier: it read 10.77 to 13.26. With the clip room removed by an injected rule, the band crops are
identical (0 pixels differ by more than 10, at most 6 levels) and the amount reads the 13.93 to 16.00 above. The lowest
label anywhere rises from 4.68 to 5.11; the 1280 MEGA label alone falls from 5.76 to 5.11, because it now sits over the
bloom's centre rather than at the band's left end. Every text clears 4.5:1. HUD WIN pod: 0 pixels changed in every case.
Feature end: FEATURE COMPLETE sits 11.89 px below the plaque at 1280 (11.89 on main) and 13.19 at 390 (13.24).

### Proof

`frontend/scripts/r154_win_frame_proof.mjs`, against a production build, ten cases: 1280 and 390 at BIG, MEGA and EPIC;
EPIC at 1366x768 and 768x1024; EPIC paid in Egyptian pounds at 1280 and 390. F1 the frame loads (decoded 800x640, not
just a 200), F2 nothing baked (every url on elements and pseudo-elements), F3 everything read is live text, F4 the frame
is behind the label and amount (box and paint order), F5 fits, F6 no amount ink clipped, F7 the plaque stands on the
band's measured edge and inside the screen, F8 the HUD WIN pod untouched, F9 no 9-slice seams. Three seeded controls in
the defects' real forms: the production wrong-path url fails to decode; EGP without the clip room is cut; the joints
without the seal show (38 to 49 levels). `--expect head` on main's build requires F1 to fail in all ten cases. **PASS on
e347de89 with all three controls caught; head control PASS.** Seam figures with the seal: 10 levels or less at 390, 360,
430, 1366, 1920 and 1280 (1x) and 390 at 3x, the residue being the corner tube's own shading (looked at 8x: no line);
18.8 to 49 without it.

### Wave 2 found, and b59971f7 fixed

Five adversarial reviewers on the frozen 65496fb5 build (desktop, phones and mounts, code and records, the frame at
drawn size, money and locales). Fixed:

1. **9-slice seams** (major): one-pixel seams at every joint wherever the stage scale is not 1 (35 to 49 levels at
   1366x768 and 390 at 3x). The seal copy covers them.
2. **Portrait wider than 500 px** (major): EPIC at 560 overran the 543.75 stage px a portrait screen shows, cutting the
   corners at 600 and 768 wide; and on phones the entry overshoot plus the shake bound the plaque to 485. Widths are now
   440 / 460 / 480 everywhere, which also clears the reel's own bezel at MEGA and EPIC.
3. **EGP sign cut** (major, a regression): the tighter 1.15 line box sliced the feet of the fallback-face pound sign (139
   px at 1280 EPIC, 0 on main). Clip room added; the stack's height is unchanged.
4. **MEGA hue** (minor): 153deg rendered 326 to 330 against the label's 317 (the filter acts per pixel, and the angle had
   been solved on the tube's average). 142deg renders 315.0.
5. **Leftovers of the band** (minor): the flash split the stage's extreme edges; particles and coins spanned the stage;
   label and multiplier sat 1.5 to 3.5 px left from trailing letter-spacing; the replay capped the amount at 46 px beside a
   36 px label. All fixed. Stale comment numbers corrected.
6. **The proof was weaker than its header** (minor): no seeded url control, an F6 that could not fail for the label, F4
   by construction, no seam check, too few viewports. All addressed above.

Checked and fine by wave 2: every locale's tier label fits at EPIC and MEGA at 1280 and 390 (smallest autofit scales
Vietnamese 0.761, Russian 0.813, German 0.845); $1,234,567.89 and the money_fit gate's 949,300.00 GC fit at every size
(at 1280 EPIC main fell back to the compact form in German, Russian and Vietnamese; the tip shows the full figure); the
replay mount, the mini player and a bought round's FEATURE PRICE line fit; RTL, reduced motion and Overdrive render;
the plaque never overlaps the hero, the FEATURES button (bar the faint outer ring of the EPIC glow, 13 levels against the
band's 169) or the HUD.

### Wave 3 verified the fixes, and fa66f225 fixed what it found

Two verifiers on the e347de89 build confirmed every wave 2 fix: worst joint dip 9.3 levels or less (Overdrive at 1x),
1.6 at 390 on a 3x screen, against 26 to 58 before, with the corner brackets not doubled; the slam peak with the shake
at its extremes keeps the frame on screen at 360, 390, 430, 600, 768 and 820 portrait (1.29 px at 360, where the first
cut was 5.9 px off); particles and coins paint 0 px on the hero, the FEATURES button, the HUD and the logo; label,
amount and multiplier centred to within 1 px; EGP cut 0 px at EPIC and MEGA at 1280, 390 and 320 (its control still
cuts); the feature-end clearance 11.89 / 13.19 / 7.11 px at 1280 / 390 / 400x225 (main 11.89 / 13.24 / 6.82); a bought
round's price line inside the window; all 64 locale cases fit. It found two minors of the fixes' own making, fixed in
fa66f225: **the replay's EPIC plaque hung 15.3 stage px out of its 412 px grid box** once the amount clamp was gone
(lifted 20 px in that container: now inside by 4.26 / 2.72 / 1.26 px at 1280 / 390 / 400x225, nothing cut), and **the
EPIC chromatic flash, now inside the plaque, peaked during the entry's fade** at opacity 0.41 (delayed .155 s it peaks
on the slam: 3,503 px at 128 levels, 0 at the stage edges). The R154 proof passed again on that build with its three
controls. Two notes stand as owner items (below): coins and particles now gather over the plaque's text for the first
second, and in Vietnamese and Russian the autofit makes the EPIC word slightly smaller than the MEGA word.


## A red check that was not R154's, fixed rather than re-run

PR run 37597619702 on 65496fb5 went red on "browser: splash calm": at Popout S the intro's TAP TO CONTINUE grew 5.20 px.
R154 does not touch the splash. Forced rather than waited for: holding Exo 2 700 back 3 s moved the prompt 1.96 to 2.09
px at all three profiles on main's build and on 65496fb5 alike, so the race was already on main and a loaded runner
exposed it (12 interleaved unforced local runs were still on both builds; 1 of 2 earlier tip runs moved 2.09 px). The
prompt was a flex item in a centred column, so its box followed whichever face had loaded. 29d7c7ae gives it the
column's width and a fixed line height and holds it hidden until its own face loads (capped at 3000 ms). Forced again:
0.00 px at every profile with the face held back 3 s and 6 s; the gate's self-test and plain run pass; a tap still
dismisses; the prompt shows at 3069 ms unforced (main 2905) and 3637 ms with the face held back 6 s. Run 37600933973 on
29d7c7ae: 30 of 30.

## TASK 3: fences

No symbol ingested; no card-sheet file touched. No sound touched (`git diff 2ffae8ef..HEAD --stat -- '*.mp3' '*.wav'
'*sounds*'` empty). Hero strips not restored (hero_idle_planted gate green in the static job). No image generated, no
raster added or changed (`git diff 2ffae8ef..HEAD --name-only` carries no image). Portrait conformance not run. No
locked path touched.

## Verification

- **Local static job** (scratch replay of every `run:` step of checks.yml's static job): 85 of 85 at c0721077 (records),
  65496fb5, e347de89 and fa66f225.
- **R154 proof**: PASS on e347de89 and on fa66f225's build with three controls; head control PASS on main's build.
- **Remote CI on PR #191**: run 37597619702 (65496fb5) red on splash calm only, fixed by 29d7c7ae; run 37600933973
  (29d7c7ae) 30 of 30; run 37607810471 (e347de89) 30 of 30; the run on this report's commit decides the merge.
- **Bundle**: 87 files, 10,993,529 B at fa66f225 against 10,993,098 B on main (+431 B of CSS and JS); 0 raster bytes.
- **Owner preview NOT refreshed:** rule 17 and the brief keep port 5173 untouched.

## OWNER LIST

1. **The banner's shape against the V3 ruling.** The Audit Round 2 ruling made the banner "a full-width neon band ...
   no box"; R154's brief asks for a frame behind the label and amount, and the later order governs (convention (n)). The
   plaque is that box. Confirm, or rule otherwise.
2. **A purpose-made banner frame.** The plaque uses the reel's own bezel (see What is missing). If wanted: a text-free
   wide frame in three drawn colourways, commissioned under the R109 conditions, would replace it at one path.
3. **frame-2.png's specks** are drawn into the plaque (and were always in the reel frame). A cleaned copy is a new raster:
   your call.
4. **FEATURE COMPLETE under the EPIC burst** (R151 item 7, still open): unreadable on main (1.89) and after R154 (2.22 on
   65496fb5, wave 2).
5. **844x390 and the FEATURE PRICE line on phones are small** (unchanged from main): label 9.6 px at BIG on 844x390;
   price 7.2 / 9.3 px at 390.
6. **Overdrive MEGA and EPIC frames are both orange**, following the existing tier colour mapping.
7. **App.svelte's Overdrive reel-frame filters do not make the colours their comments name**: hue-rotate(280deg)
   saturate(1.4) turns frame-2's cyan tube green (71,221,0), 305deg turns it pure green, 185deg coral (computed from the
   CSS matrices, confirmed in a browser). Possibly R152 item 16 ("route frame colours are the opposite of their
   comments"). Not touched: outside this brief.
8. **CI has no banner leg.** The frame, its url and the seams are proved by a local script only; a CI leg would need a
   second build for the head control.
9. **The multiplier rounds to nearest** (R152 item 15): a 99.99x MEGA reads "100x".
10. **Coins and particles gather over the plaque's text** for the first second (16 of 16 coins on the label row at their
    peak, against 9 or 10 when they spanned the stage): the cost of keeping them off the hero and the FEATURES button.
    Widening the coin start positions is a one-line change if you prefer.
11. **Vietnamese and Russian EPIC words come out slightly smaller than their MEGA words** (25.8 against 28 px at 1280 in
    Vietnamese), because autofit fits the longer EPIC word to the 480 px plaque. A wider EPIC plaque would lay its
    chrome on the reel's bezel again. Your call.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode on. **Approach:** confirm main, record the rule, commit the records; wave 1 to
measure the live banner and survey every committed asset before touching code; prototype the 9-slice in scratch;
implement; measure against wave 1's baseline; wave 2's five lenses; fix; wave 3 on the fixes; close under rule 17.

**Alternatives rejected:** keeping the full-width band with a plaque on it (still a strip); overdrive_perimeter.png
(owner-ruled off the stage, pruned, mid-edge ornaments that smear under a 9-slice); plate_instrument.svg (never
exported); 560 / 600 / 640 and 480 / 520 / 560 widths (frame on frame, and EPIC overran portrait screens); a 2.5 px
seal (no better at 1x, worse at 3x); re-running the red splash leg instead of fixing the race.

**Files touched:** `CLAUDE.md`; `reports/SESSION_REPORT.md` and two dated archives; the brief;
`frontend/src/lib/components/WinBanner.svelte`, `HeroSplash.svelte`, `FreeSpinsPresentation.svelte` (comment),
`App.svelte` (comment); `frontend/scripts/r154_win_frame_proof.mjs`. Commits: 0386a2ef, 2893adef, c0721077, 65496fb5,
29d7c7ae, b59971f7, e347de89, fa66f225, and the records commit that carries this report.

**Lessons worth keeping:** a CSS 9-slice inside a transform-scaled stage seams at every joint unless the scale is exactly
1, and the only viewport most proofs use is the one where it does not show; a filter angle solved on a colour's average
is wrong for the pixels around it, so sweep it live; tightening a line box under `overflow: hidden` cuts any glyph drawn
in a taller fallback face, and a USD-only check cannot see it; a box made taller by invisible padding changes what a
contrast instrument samples, so isolate with the padding removed before believing a drop; a 200 from a SPA server proves
nothing about an image, decode it; a subagent told never to touch a port can still bind it through a tool's default;
and, again, an unquoted heredoc runs backticked words as commands (it happened once here while filling this report;
nothing executable matched and the file was untouched, but the rule in memory stands: quote the heredoc).
