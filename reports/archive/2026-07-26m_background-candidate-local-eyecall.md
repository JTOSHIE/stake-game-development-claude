# Session Report - THE BACKGROUND CANDIDATE LOCAL EYE-CALL (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_BG_LOCAL_TEST_Prompt.md`. ONE JOB, fresh
session on `main`, integrator role, explicit paths, no lock exceptions and none
needed: no locked path was touched or required, `git status` on all four is clean
and `git diff .claude/settings.json` is empty. This is the extracted JOB 4 from
`FS_LIVE_ROUND2_Prompt.md`, with the local-proof direction added by the owner.

## Summary

The candidates are ingested with provenance, v2 is proven in a real build and in
a real local session, the captures are committed, and the bundle gets **smaller**
rather than larger. All of that is below and all of it holds.

**The finding that outranks it: neither candidate is an enhancement of our art.
Both are new designs.** That matters because `CLAUDE.md` permits one and forbids
the other, in terms the owner set on 2026-07-25: *"external ENHANCEMENT of
existing art is permitted. Externally DESIGNED art is not."*

This is measured, not an opinion about the art, and the measurement has a control
that makes it mean something. The vendor's own drop supplies one:
`bg_original_enhanced.jpg`, whose README declares it *"Your original image with
contrast, sharpness and colour boost applied (keeps the exact same scene)"*. That
is a declared enhancement, so whatever it scores IS the enhancement signature for
this drop under this method. Scored against the shipped background by the same
code in the same run:

| File | Vendor's declared relationship | Pearson r | Cells moved | Class |
|---|---|---|---|---|
| `bg_original.jpg` | "your original file for reference" | **1.0000** | 0.0% | identity |
| `bg_original_enhanced.jpg` | keeps the exact same scene | **0.9966** | 0.0% | ENHANCEMENT |
| `bg_highquality_1920x1080.jpg` | "new higher-quality version (recommended)" | 0.3457 | 57.8% | NEW DESIGN |
| **`bg_improved_v1.jpg`** | "alternative compositions in the same style" | **0.3850** | 58.2% | **NEW DESIGN** |
| **`bg_improved_v2.jpg`** | "alternative compositions in the same style" | **0.3455** | 57.7% | **NEW DESIGN** |

A genuine enhancement scores 0.9966 and moves no cell. v2 scores 0.3455 and moves
57.7 per cent of them. There is no reading of those two numbers on which v2 is the
same composition as the incumbent, and the captures agree with the arithmetic: the
pink star is gone, the buildings are different, a large screen appears at the
right. It is the same *style*, which is what the vendor claimed, and style is not
what the rule is about.

**Provenance is nonetheless clean, and worth stating plainly**, because it is the
other half of the question. `bg_original.jpg` in the vendor drop is
**byte-identical to our shipped `bg_base.jpg`**, sha256
`23e63e54e99aa0b03ddd52649e7838af33c6661121c1da2563ad81342c57539f`, 277,172 bytes.
Our own art provably was the input. Nothing here is of unknown origin; the
question is only how far the output travelled from the input, and the answer is
most of the way.

**This is surfaced, not ruled on.** Convention (n) is explicit that flagging the
tension is the expected move rather than an escalation, and the owner's brief
directs the eye-call, so the eye-call is delivered in full. What the owner is
choosing between has simply turned out to be larger than a background swap: it is
whether to take externally designed scene art, which is a change to the standing
rule and not something the builder decides. Also recorded for the owner, because
it is decision-relevant and free: **`bg_original_enhanced.jpg` classifies as an
ENHANCEMENT (r 0.9966)**, so it is the one file in the drop that could be adopted
under the rule exactly as it stands. It is not one of the two the brief named, so
it was scored and recorded but not ingested as a candidate or captured.

## What was built, and the bundle delta

Candidate v2 was wired as the scene background and a real build was run, per the
brief. Derived first, per convention (l.1), then measured:

| | Files | Bytes |
|---|---|---|
| Baseline build, shipped background | 107 | 15,519,657 |
| Adoption-shaped build, v2 in place | 107 | **15,502,403** |
| **Delta** | 0 | **-17,254 (0.11% smaller)** |

The derivation: the only file that changes is `bg_base.jpg`, 277,172 bytes to
259,918, so the delta must be exactly -17,254 and the total exactly 15,502,403.
The build reported 15,502,403. Exact agreement, and the two sides are independent
in the way (l.4) requires: one is arithmetic on two file sizes, the other is a
post-build walk of `dist/` by `measureDist()` in `vite.config.ts`.

**v2 costs the bundle nothing because the compression was swept, not guessed.**
The incumbent's own 277,172 bytes was used as the budget, on the reasoning that a
background nobody looks at directly should not ship four times the bytes of the
one it replaces. The sweep, at 1920x1080, progressive, optimised, 4:2:0:

    q92 405,849   q88 324,862   q85 291,033   q82 259,918  <- chosen, first inside budget

v1 lands at q80 for 273,173 bytes on the same rule. The 574,103-byte file the
vendor supplied would have been a 107 per cent increase on the incumbent if
shipped as delivered.

The adoption-shaped build was a temporary working-tree swap, never committed. The
shipped `bg_base.jpg` was restored with `git checkout` and verified byte-identical
by sha256 afterwards; `git status` on that path is clean.

## The captures

`reports/screens/background-candidate-2026-07-26/`, with a README. Three
side-by-side sheets at the platform's own preset sizes, taken from the DTT Screen
menu transcription rather than chosen by us, each with the HUD present and no
dialog open:

| Sheet | View |
|---|---|
| `desktop_1200x675__current_vs_v2.png` | DTT Desktop 1200 x 675 |
| `mobile_portrait_375x667__current_vs_v2.png` | DTT Mobile M portrait 375 x 667 |
| `popout_s_400x225__current_vs_v2.png` | DTT Popout S 400 x 225 |

Both arms of every pair come from one dev server and one build, differing only in
the `?bg=` parameter, so the comparison cannot be reading an unintended build
difference. Each capture's served background `src` is read back out of the DOM and
checked against what the arm claims, because a frame labelled V2 that had quietly
fallen back to the shipped file would be worse than no frame at all. Six of six
verified, recorded in `proof_results.json`.

**One thing to know before judging them:** the three views show very different
amounts of background. Desktop shows the most and is where the choice matters.
Popout S shows the scene at both margins of the stage. Mobile portrait shows
almost none of it, because the stage and HUD occupy nearly the whole pane, so on
a phone the choice barely registers. Measured tonal shift of v2 against the
incumbent: **+15.43** mean luma overall, **+17.81** across the stage band,
**+14.72** under the bottom HUD strip. v2 is the brighter and warmer scene, and
it competes more with the cyan reel frame and the magenta FEATURES bar than the
incumbent does. That is an observation for the owner's eye, not a defect claim.

## The classifier found a defect in itself, which is the point of convention (p)

`scripts/assets/background_candidate_ingest_selftest.py` exists because a
classifier hardwired to return NEW DESIGN would have printed exactly the verdict
above. It plants both classes and requires the classifier to separate them: three
real enhancements (identity, the AssetForge `bg_base` grade parameters reapplied,
and a regrade far harder than any real one), three real recompositions (mirrored,
panned 28 per cent, horizon relocated), plus the vendor's declared enhancement.
Seven cases, and the defect is seeded in the form it really occurs, which for
"a redesign wearing an enhancement's clothes" is same-style-different-composition
rather than noise or a black frame.

**It failed on first run, and it was right to.** The hard regrade scored 33.7 per
cent of cells moved and was classified NEW DESIGN. That was the metric's fault,
not the case's: a regrade is a global affine transform of tone, so it moves every
cell's absolute value while moving none of them relative to the others, and an
absolute-difference measure cannot tell that apart from a rearrangement.
Standardising each downsampled grid to zero mean and unit variance before
differencing removes the grade and leaves the layout, which is what point 2 of the
external-art test actually asks about. Pearson r was already affine-invariant by
construction, which is why it held up at 0.9640 where the raw share did not.

After the correction the two classes separate with room to spare: enhancements run
r 0.9640 to 1.0000 with at most 7.3 per cent of cells moved, recompositions r
0.2478 to 0.5562 with at least 39.0 per cent. The thresholds sit inside both gaps.
Seven of seven cases now behave, in both directions.

Without that self-test the ingest would have shipped a metric that calls a heavy
regrade a redesign, and the next background question would have been answered
wrongly with a green-looking record behind it.

## The local session was verified, not assumed

`frontend/scripts/background_local_testing_verify.mjs`, four checks, all passing,
recorded in `reports/qa/background_local_testing_verify.json`. No live RGS session
is consumed: the authenticate request is intercepted and aborted, so what is
proven is the wiring, using a deliberately invalid host.

| Check | Result |
|---|---|
| Dev server answers on the LAN address, not only `localhost` | PASS, `http://192.168.4.92:5173/` HTTP 200, game mounted |
| Candidate v2 served over HTTP at the path the app requests | PASS, 259,918 bytes served, matches disk, `image/jpeg` |
| The `?bg=v2` choice survives a redirect carrying only the RGS parameters | PASS |
| Game boots on the real launch shape and addresses the given `rgs_url` | PASS, `POST https://rgs.invalid.localtest/wallet/authenticate` |

The first check matters because the Local Testing redirect sends a *browser* to
the redirect URL, and if that browser is the owner's phone then `localhost` is the
phone, not this machine. The dev server has to be bound to the LAN.

The third check is the one that would have quietly spoiled the whole eye-call.
The DTT appends its own `?sessionID=...&rgs_url=...` query, and whether it
preserves a query already on the redirect URL is undocumented and unobserved by
us. A parameter-only switch could therefore have fallen back to the shipped
background with no way for the owner to tell, and the eye-call would have been
made on the wrong frame. The choice is now stored in `sessionStorage` when the
parameter is seen, so it survives a redirect that drops the query. It dies with
the tab and cannot leak into a later session.

## FOR THE OWNER: starting the local session, numbered

Play the real RGS against the local build, with candidate v2 as the background.
Steps 1 and 2 are at the computer; from step 3 on you can be anywhere.

1. On the computer, in Terminal, paste this one line and leave the window open:

       cd /Users/jt/math-sdk/frontend && npm run dev -- --host

   It prints two addresses. The one you want is the **Network** one:
   `http://192.168.4.92:5173/`

2. Still on the computer, open that address once with the candidate switch on:

       http://192.168.4.92:5173/?bg=v2

   The background should be the brighter, warmer scene with the big screen at
   the right, not the teal one with the pink star. That single visit is what
   arms v2 for the rest of the session in that browser.

3. On your phone, join the same wi-fi as the computer, then open
   `http://192.168.4.92:5173/?bg=v2` in the phone's browser. Same check: brighter
   and warmer, no pink star. Now v2 is armed on the phone too.

4. Open the Stake portal on whichever device you want to play on, go to the game,
   and open the **Developer Testing Tool** toolbar.

5. In the DTT, open the **Local Testing** menu and set **Redirect URL** to:

       http://192.168.4.92:5173

   Leave off any `?bg=v2` here. Step 2 or 3 already armed it, and the DTT adds
   its own session parameters to whatever you type.

6. In the DTT's **Settings** menu, set Balance and Currency as you like, and in
   **Screen** pick the size you want to judge: Desktop, Popout S and Mobile M are
   the three the committed captures cover.

7. Launch the game from the portal as normal. It will load from the computer's
   dev server while talking to the real RGS, so spins, wallet and features are
   all live. A small `DEV` badge in the bottom right is how you know you are on
   the local build.

8. To compare, open `http://192.168.4.92:5173/?bg=current` in the same browser
   and relaunch. That switches back to the shipped background; `?bg=v2` switches
   forward again. `?bg=v1` shows the other candidate if you want to see it.

9. Reply **BG: V2** or **BG: KEEP**.

Two things worth knowing before you reply. **Mobile portrait shows almost no
background at all**, so if the phone is where you look, expect the two to seem
nearly identical there; desktop is where this decision actually lives. And per
the finding above, **BG: V2 also means changing the standing rule on externally
designed art**, so if you want the background improved without touching that
rule, `bg_original_enhanced.jpg` is the file that qualifies and I can bring it
through as its own candidate on a word from you.

If the phone cannot reach the address at step 3, the usual cause is the two
devices being on different wi-fi networks, or the Mac firewall prompting for
permission the first time; allow it and retry.

## What was NOT done, per the brief

No adoption. The shipped `bg_base.jpg` is byte-identical to `HEAD`, verified by
sha256 after the adoption-shaped build was reverted. No kit was built. The
candidates are reachable only through a DEV-gated parameter and are **pruned from
the built bundle** by the build diet, alongside the dev-only alternate themes and
for the same reason, so an unadopted candidate is never paid for in a shipped
artefact. `[build-diet] pruned dir assets/themes/future-spinner/backgrounds/candidates (0.51 MB)`
appears in both builds above.

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written.** One job, `main`, explicit paths, brief saved
  verbatim, both candidates ingested, v2 wired and built, dev server run, Local
  Testing path verified, three named views captured side by side with the HUD
  present, bundle delta recorded, no adoption, no kit, numbered owner steps in
  this report. Rule 10 link below.
- **No lock exceptions**, as the brief required: all four locked paths clean in
  `git status`, `git diff .claude/settings.json` empty, and nothing was written to
  a locked path by any route including Bash.
- **No em or en dashes** in any file written this session, checked per file.
- **Every number above carries its source**: the ingest figures come from
  `reports/qa/background_candidate_ingest.json`, the bundle figures from the two
  `build-info.json` outputs, the capture verifications from `proof_results.json`,
  the local-session checks from `background_local_testing_verify.json`.
- **(l.4) honoured on the one claim that needed it.** The enhancement-versus-
  redesign verdict rests on a control whose relationship to our art was declared
  by the supplier rather than inferred by us, and the classifier that produced it
  has been seen to return both answers.
- **(h.1) honoured.** The new evidence directory is written only by the script
  whose job is to generate it, and no pre-existing committed evidence was touched:
  `git status` showed no modification to any existing file under `reports/screens/`.
- **Maths package untouched.** Nothing in this session reads or writes
  `games/future_spinner/**` and no figure here is maths-adjacent.

## Verification, measured

    scripts/assets/background_candidate_ingest.py            2 candidates ingested, 3 controls scored
    scripts/assets/background_candidate_ingest_selftest.py    7 of 7 cases, PASS (failed first run, fixed)
    frontend/scripts/background_candidate_proof.mjs           6 of 6 captures verified, PASS
    frontend/scripts/background_local_testing_verify.mjs      4 of 4 checks, PASS
    frontend/scripts/typecheck_baseline.mjs                   PASS, 0 errors, 36 warnings, baseline unchanged
    node scripts/qa/locked_paths_gate.mjs                     0 violations, PASS
    npm run build (baseline)                                  107 files, 15,519,657 bytes
    npm run build (v2 in place)                               107 files, 15,502,403 bytes
    git diff .claude/settings.json                            EMPTY
    git status on the four locked paths                       clean
    sha256 bg_base.jpg after revert                           matches HEAD
    em and en dash count across files written                 0

## Rule 10 closing link

Final push at `6eaea1a`, BOTH JOBS GREEN on the remote runner:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30202708950`
  static gates: success
  browser gates: success

`main` is green, so the line is not stopped and the next job may start.

## FOR THE NEXT SESSION

**The decision this session is waiting on.** The owner replies **BG: V2** or
**BG: KEEP** from the committed captures and the local session. Do not adopt
anything before that reply arrives. If it is BG: V2, the adoption is not just a
file copy: it needs the `CLAUDE.md` Assets rule amended by the owner to permit
externally designed scene art, because the measurement in this session says
plainly that is what v2 is. If it is BG: KEEP, delete
`frontend/public/assets/themes/future-spinner/backgrounds/candidates/`, the
`?bg=` parameter block in `App.svelte`, and the candidates line in the build-diet
prune list, and the tree returns to exactly where it was.

**A third answer exists and the owner has been told about it.**
`bg_original_enhanced.jpg` in the same vendor drop measures as a genuine
enhancement (r 0.9966, no cell moved) and could be adopted under the rule as it
stands today, with no amendment. It was scored and recorded but deliberately not
ingested or captured, because the brief named v1 and v2. If the owner asks for it,
it is one run of `background_candidate_ingest.py` with a third entry in `SOURCES`
plus a capture pass.

**Adoption mechanics, when the call comes.** Copy the chosen candidate over
`frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg`, delete the
`candidates/` directory and its prune-list line, remove the `?bg=` block from
`App.svelte`, and rebuild. The bundle figure to expect for v2 is 15,502,403 bytes,
already measured here. Kit V5 then rebuilds from a fresh clone per convention (o).

**Still open from before, unchanged by this session.** JOB 5 of
`FS_LIVE_ROUND2_Prompt.md` (Kit V5) remains unstarted and is now unblocked, though
it should wait for the background call rather than ship a kit that is immediately
superseded. TR-085, the free-spins entry card's 88.1 x 33.4px TAP TO CONTINUE
against a 44px minimum, is still filed and unfixed. TR-075 still needs twenty
bracketed Cruise spins. The `evidenceDir()` migration for `layout_fit_gate.mjs`
and `contrast_gate.mjs` named under (h.1) is still open.

**Model and effort.** Opus 5 at high effort. The judgement was in not treating
"ingest the candidates and capture them" as the whole job: the composition
measurement was cheap, and without the vendor's own declared enhancement as a
control it would have produced a number (r 0.35) with no interpretation attached,
which is exactly the shape of the (l.4) failure the worked example in `CLAUDE.md`
records. The second judgement was believing the self-test over the classifier when
they disagreed.

**Alternatives tried and rejected.**

- *Reporting r = 0.35 as "the candidates differ from the incumbent" and moving on.*
  Rejected. That is a measurement without a control, which (l.4) forbids treating
  as evidence, and it would have buried the rule question entirely.
- *A raw absolute-difference composition metric.* Rejected by its own self-test: it
  classifies a hard regrade as a redesign. Replaced with the grade-invariant form.
- *Adopting v2 directly, since the brief's whole shape assumes it might be chosen.*
  Rejected. The brief says "no adoption" in as many words, and the rule tension
  makes adoption the owner's call twice over.
- *A URL-parameter-only background switch.* Rejected once the DTT redirect's
  query-preservation behaviour turned out to be unobserved. A switch that can
  silently fall back to the shipped background makes the eye-call untrustworthy,
  so the choice is stored for the browsing session.
- *Shipping the vendor's 574KB file as delivered.* Rejected; a 107 per cent bundle
  increase for a background, where a swept encode is 6 per cent smaller than the
  incumbent.
- *Building twice to produce the two capture arms.* Rejected. One build with a
  parameter means the comparison cannot be reading an unintended build difference.
