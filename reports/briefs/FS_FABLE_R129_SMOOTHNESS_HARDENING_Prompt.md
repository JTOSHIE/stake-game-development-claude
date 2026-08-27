# FS FABLE R129 - Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-27 and reproduced
from the owner's own message in the same session, not reconstructed.

---

**R129: OVERNIGHT SMOOTHNESS + FULL-GAME HARDENING**

Sole live brief. Unattended. Review lane. Long-running. Multi-agent. High care.

This is an overnight session. Use sub-agents for recon, measurement, viewport QA, docs, and
adversarial review. The parent agent owns every verdict and must re-measure load-bearing claims
first-hand.

### THE FENCE
- No kit packaging.
- No audio generation and no fake stems.
- No bulk art factory intake.
- Do not weaken asset guards.
- Do not sweep or commit the owner's 30 WIP rasters unless a single named file is the exact
  published defect and the brief's later workstream explicitly authorises that one file.
- Do not blow the 25MB cap.
- Do not invent a new hero body family.
- Do not replace live text with baked words.
- Do not "fix" Stake maths, RTP, or locked math files.
- If a change cannot be proven in the running game, do not ship it.

### PRECONDITIONS
- On main, up to date.
- Confirm current live hero: idle weight-shift, 16-frame win unfold, feature brace, punch/sway
  transform if still present.
- Record both budget numbers: local dirty-WIP, clean/CI committed.
- Confirm current version stamp and HEAD SHA.
- Fingerprint the 30 WIP rasters before any file operation.

### GOAL
Kill the **ticking-clock hero**.

The owner's current complaint is not "no movement". It is: movement exists, but it is jagged. It
ticks. It does not flow.

Also harden everything else that is still review-visible and code-solvable tonight, except audio.

Success is: hero motion no longer reads as a stepped slide-show; no new jitter introduced; reduced
motion still actually off; viewports usable; paytable/guide consistent; Stake-facing presentation
intact; a written residual list that is honest.

---

# WORKSTREAM 0 - CONTROL ROOM

### 0.1 Spawn agents
Use agents for: hero animation source map, budget + asset weight map, viewport/layout recon,
paytable/guide recon, Stake-facing checklist recon, adversarial measurement.
The parent agent must not accept an agent's number until it has reproduced the load-bearing ones.

### 0.2 Capture the defect, not the story
Record the live tick before changing anything: frame counts per state, duration per frame, CSS
playback mode (steps(), jump-none, etc.), transform layers on top, measured jump between
neighbouring frames at game size, whether the tick is temporal, spatial, or both.

The expected diagnosis is: the flipbook is discrete, frame holds are long enough to see each still,
and any extra punch layer may be emphasising the steps rather than hiding them.
Do not stop at that guess. Prove it.

---

# WORKSTREAM 1 - HERO SMOOTHNESS, CODE-FIRST
This is the main workstream. Spend most of the night here.

### 1.1 Inventory the playback machine
Map every class, timer, sheet, and transform that moves the hero in idle, glance if still live, win,
feature brace, reduced motion.

### 1.2 Identify the tick
A ticking look usually comes from one or more of:
1. steps(N) with too few frames and too-long holds
2. large pose deltas between neighbouring frames
3. a second transform ticking on a different clock
4. banner occlusion making only the jumpy part visible
5. box clipping that pops limbs on/off
Measure all five.

### 1.3 Allowed smoothness tools
A. Crossfade / dual-buffer dissolve between adjacent flipbook frames. This is the highest-probability
   code fix. Two stacked sheets, offset by one frame, dissolve so the eye never sits on a hard cut.
B. Shorter holds + existing frames, only if the performance still reads and does not become frantic.
C. Retimed easing of state duration. Anticipation longer, peak readable, settle softer.
D. Reduce or decouple the punch/sway transform. Keep it only if it fills gaps.
E. Overflow / box fix. If limbs clip, that will look like a tick even when timing is fine.
F. Measured downsample or upsample of already-accepted sheets. Only from already-intaken approved
   strips. No new factory art.

Do not: add another 24-frame sheet if budget cannot take it; fake smoothness with blur soup; leave
reduced motion broken again; ship a crossfade that ghosts two bodies.

### 1.4 Hard acceptance for smoothness
A change ships only if all of these are true: neighbouring-frame pop is reduced at game size; rest
identity holds; first/last behaviour remains sane; idle does not look drunk; win still reads as an
unfold, not a smear; feature brace still reads; 60fps class performance holds; reduced motion
freezes on rest; no console faults.

Capture: idle, win peak, win settle back to idle, feature entry, reduced motion.
The owner should no longer be able to describe it as a ticking clock.

---

# WORKSTREAM 2 - HERO BOX, BANNER, AND CLIPPING
Re-measure: live hero box vs peak pose width; banner occlusion band using the actual centred banner
geometry; whether any peak frame is clipped.
Fix only low-risk layout/CSS if clipping is causing the jagged read.
Do not redesign the win banner unless a one-line proven improvement exists.

---

# WORKSTREAM 3 - GAUGE DOUBLE-NEEDLE, SAFE PATH ONLY
R127 found: committed gauge_face.png has a baked needle; the engine draws a second live needle on
top; owner WIP already has the needle-free face; gauge_base.png / manifest path may already describe
the correct file.

Allowed: point the live draw site at the already-correct needle-free asset if that file exists in the
committed or generated tree; or a CSS/code path that hides the baked needle without committing the
owner's full WIP set.

Not allowed: silently commit all 30 WIP rasters; run `npm run assets` if that would repaint the baked
needle onto the owner's fix.

If the only honest fix is committing one owner file, stop and document the exact file, exact reason,
and exact restore command. Do not freelance the whole WIP tree.

---

# WORKSTREAM 4 - VIEWPORT AND USABILITY AUDIT
Test at least: 1280 desktop, 390 class mobile, one in-between compact / portrait layout if the game
has it.
Check: HUD readable; Spin / Bet / Balance not colliding; FEATURES reachable; paytable usable; win
banner not covering the only readable hero motion; feature overlay tap target; no clipped controls;
no text overflow in EN first, then spot-check one longer locale if cheap.
Fix real breakage. Record residuals that are design decisions, not bugs.

---

# WORKSTREAM 5 - PAYTABLE / GUIDE / TEXT / IMAGES
Audit: Features row still matches the live control; Turbo still uniquely owns the bolt; no stale
chrome icons; no baked MAX / 5000 in guide art; paytable text contrast; close target still >= 44px;
symbol art in the paytable still matches in-game symbols; no missing assets.
Fix only proven mismatches.

---

# WORKSTREAM 6 - STAKE-FACING HARDENING
Do a presentation/compliance pass, not a maths rewrite.
Check and record: no baked values in celebration art; live Balance / Win / Bet still live; reduced
motion honouring; sound mute still safe; no 404s; dist under 25MB on both budget views; version stamp
visible; portal tile path exists and is documented, but do not force a darker lobby candidate; no
console errors in base, win, feature, paytable.
If a Stake guideline is written in-repo, derive from that text. Do not invent policy.

---

# WORKSTREAM 7 - OUTSTANDING NON-AUDIO BACKLOG
Inspect and either fix cheaply or record precisely:
1. dead heroMode / unreachable rig remnants if they still cost bundle
2. stale comments with wrong banner geometry or wrong frame counts
3. any second copy of the reduced-motion specificity bug
4. feature instrument column remaining chrome mismatch
5. win-tier number disagreements if still present
6. unused orphan rasters that are safe to leave but should be listed
7. whether current anticipation CSS is actually visible enough, without new 240x240 overlays unless a
   real consumer and budget both exist

Do not intake the refused factories from R127/R128 unless a candidate now has a consumer, beats the
incumbent, and fits budget.

---

# WORKSTREAM 8 - IMAGE GAP MEMO ONLY
Do not generate images. Write the remaining image gaps as a buyer's list: needed / not needed; why;
exact size; exact consumer; whether code can cover it instead.
Expected likely leftovers: audio waveforms not in scope; optional smoother idle with real weight-shift
amplitude, only if current idle still ticks after WS1; nothing else unless proven.

---

# WORKSTREAM 9 - SELF-AUDIT AND ADVERSARIAL PASS
Before close, a separate pass must try to refute: "the tick is gone"; "reduced motion works"; "budget
still under cap"; "no WIP clobber"; "paytable matches live controls"; "no banner-geometry comment
lies".

If the adversarial pass finds a smoothness fix that only moved the pop from mid-strip to the
endpoints, treat that as a defect and fix it. R126 already made that mistake once.

Re-run the project gates. If CI fails on infrastructure, prove the diff cannot reach it before
retrying.

---

# WORKSTREAM 10 - REPORT
The report must contain:
1. Before/after neighbour-jump table for idle, win, feature
2. What smoothness technique shipped and why
3. What was tried and thrown away
4. Both budget numbers
5. Viewport results
6. Paytable/guide results
7. Gauge status
8. Remaining image gaps
9. Remaining publication gaps except detailed audio production
10. Exact restore command if any raster changed
11. Whether a reviewer would still call the hero "ticking"

### CLOSE
- Smoothness first
- Code before more art
- Measurement-first
- Guards remain active
- PR on review lane
- Stop when the hero no longer ticks or when every remaining tick is proven to be an art-density
  limit rather than a playback bug

Work through every workstream. Do not return after WS1 unless the rest is impossible. This session
should still complete the audit even if smoothness only gets part-way.
