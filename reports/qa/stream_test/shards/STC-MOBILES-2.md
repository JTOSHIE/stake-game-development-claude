# STC-MOBILES-2, composition (stream-test-2026-07-28, frames 330 to 346, 1600px upscaled)
supersedes: STC-MOBILES-A.md and STC-MOBILES-B.md, for the frames 330 to 346 overlap only
scope: `mobile-s` frames 330 to 346 inclusive, 17 frames, native viewport 320x568, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
frames_read: 17

**How the figures were arrived at, because it changes how they should be read.** The
frames were judged by eye at 1600px, the shard was written from that pass alone, and only
then were the claims checked with a scratch PNG decoder against the committed NATIVE
frames. **That check refuted six of this squad's own draft claims**, four of them
outright, and every one of the six is recorded under the signed absences rather than
quietly dropped. The upscale is what made the fine geometry legible; it is also what
manufactured two false positives, which is a property of the instrument this re-run was
supposed to trust and is written up plainly below. Pixel figures are given in NATIVE
device pixels where a decoder produced them, and in UPSCALED pixels (901x1600, scale
factor 2.8169) where the figure is an eye read off the upscale. Each figure says which.

## STC-MOBILES-2-01 HIGH The buy dialog puts the max win qualifier in the VALUE, which TR-037 already fixed in the paytable and never swept here, and that is what wraps the sticky strip to three lines

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/346_mobile-s_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/345_mobile-s_transition_dialog_buy_overdrive_opening.png`
- Claim: the sticky stats strip's third column renders `5,000x` / `base` / `bet` on three lines, at upscaled y 1245, 1310 and 1375. That inflates the strip from a one-line height of about 90 upscaled px to 269, and the strip is what pushes the action row out of the scroll box (`STC-MOBILES-B-01`). The wrap is not incidental, it is a sweep gap with a named row behind it:
  - `frontend/src/lib/components/BuyBonus.svelte:135` renders the value as ``` <span class="buy-stat-val">{maxWinVsBaseBetLabel($isSocial)}</span> ```, so the qualifier `base bet` is inside the VALUE. `.buy-stat-val` at `frontend/src/lib/components/BuyBonus.svelte:240` sets `font-size: 0.92rem` with no `white-space: nowrap` and no width floor, so at 320px it wraps to three lines.
  - `frontend/src/lib/components/PaytableModal.svelte:337-338` does the opposite, `<span class="fs-mode-stat-label">{maxWinStatLabel()}</span>` then `<span class="fs-mode-stat-value fs-num">{FS_MAX_WIN_LABEL}</span>`, and the comment directly above it at `frontend/src/lib/components/PaytableModal.svelte:329-336` records why in these words: *TR-037: the qualifier lives in the LABEL, not the value. Rendering "5,000x base bet" as the value clipped it to "5,000x ba..." on every card, hiding the very figure the platform requires to be displayed.*
  - So TR-037 was fixed in `PaytableModal.svelte` and not swept to `BuyBonus.svelte`. The same construction the row exists to forbid is live on the purchase dialog, and at 320px it does not merely truncate, it takes the CONFIRM button off the screen.
- Resolution note: NEW AT 1600PX for the three-line wrap being legible as the strip's height driver; the strip itself is VISIBLE AT BOTH and is already `STC-MOBILES-B-01`.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:132-135` and `frontend/src/lib/components/BuyBonus.svelte:240` (not locked)
- Proposed fix: move the qualifier into the label exactly as `PaytableModal.svelte:337` does, so the value is `5,000×` alone and the strip is one line tall. This is smaller than `STC-MOBILES-B-01`'s structural fix and complementary to it: do both, since a one-line strip still sits above the action row.

## STC-MOBILES-2-02 HIGH The `SELECT` button overflows its column in the paired SPIN MODES card and lands 10px from the card border where its mirror sits at 12px from the divider

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/344_mobile-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/343_mobile-s_transition_features_menu_opening.png`
- Claim: decoding native frame `344` along row `y=418`, two bright vertical features sit near the right edge: the `SELECT` button's right border at **x=272 to 273** (luma 195 and 201) and the card's own right border at **x=283 to 284** (luma 204 and 206), with luma 22 to 25 between them. The card border is confirmed independently at x=284 by scanning the bet-bar card's right border over rows 120 to 205. So `SELECT` clears the card border by **10px**.
  The specification says it should clear it by 26. `.fm-paired-face` sets `padding: 12px 14px !important` and `.fm-paired-opt` sets `padding: 0 12px` (`frontend/src/lib/components/FeatureMenu.svelte:917-921`), so the intended right clearance is 14 + 12 = 26px. The mirror button proves the layout is otherwise correct: `ACTIVE` decodes at cols 63 to 148 and the divider is at x=160, so it clears by **12px**, the specified `.fm-paired-opt` padding exactly.
  Mechanism: `.fm-paired-opt .fm-action` is `flex-direction: row; justify-content: space-between` (`frontend/src/lib/components/FeatureMenu.svelte:924`) holding `.fm-cost`, which is `white-space: nowrap` (`frontend/src/lib/components/FeatureMenu.svelte:963`), beside the button. The row's min-content width exceeds the `flex: 1 1 0; min-width: 0` column, so it overflows to the right. The left column survives only because `ACTIVE` is a bare span (`.fm-active-tag`) while `SELECT` is a padded button, so the fault is invisible until a mode is not the active one.
- Resolution note: NEW AT 1600PX. A 16px overflow against a 26px specified inset is not resolvable at 242 image tokens.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:924` and `frontend/src/lib/components/FeatureMenu.svelte:963` (not locked)
- Proposed fix: allow `.fm-cost` to shrink below its own min-content at narrow widths (`min-width: 0` plus removing `nowrap`, or abbreviating it), or wrap `.fm-action` below a breakpoint so the button gets a full row.

## STC-MOBILES-2-03 MEDIUM The `WILD` and `SCAT` card titles sit 7px out of alignment in a grid row whose next row aligns to the pixel

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/334_mobile-s_paytable_03_symbol_payouts.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/333_mobile-s_paytable_02_ways_to_win.png`
- Claim: decoding native frame `334` at threshold 200, `WILD` occupies rows **220 to 228** (cols 72 to 111) and `SCAT` occupies rows **227 to 235** (cols 205 to 248). Both are 9 rows tall, both are in the same grid row of `.fs-sym-grid`, and they are **7px apart** vertically. The control that makes this read as a fault rather than a stagger is the row directly beneath: `H1` and `H2` both decode at rows **418 to 426**, identical.
  The cause was NOT isolated within the source budget and is recorded as open rather than guessed. What was ruled out: the image box is fixed for every card, `.fs-sym-card img { width: 78px; height: 78px; object-fit: contain }` at `frontend/src/lib/components/PaytableModal.svelte:658` with a narrow override to 64px at `:800`, so a differing art aspect cannot move the box and cannot move the label under it. The face is one rule for all cards, `.fs-sym-card > .fs-face { padding: 14px 10px; gap: 6px; align-items: center }` at `:657`, and the markup is identical for both cards at `:223-231`. Something else is adding 7px above `SCAT` or removing it above `WILD`, and it wants tracing rather than a plausible-sounding answer, per convention (l.6).
- Resolution note: NEW AT 1600PX. 7 native px is below the resolvable floor of a 242-token image, and neither superseded shard raises it.
- Where fixable: UNKNOWN. The surface is `frontend/src/lib/components/PaytableModal.svelte:657-659` and `:223-231`; the cause is not in either and was not traced inside the six-file budget. Not locked.
- Proposed fix: PARK(cause not isolated). The likely shapes are a per-tier rule on `.fs-sym-card.tier-w` or `.tier-s`, or an intrinsic-size difference surviving the fixed box. Trace before changing anything; a padding nudge that hides 7px without knowing its source is the fix this project's own record warns against.

## STC-MOBILES-2-04 MEDIUM The INTERFACE GUIDE `Features` row's icon sits 19px lower against its own title than the three rows above it, because the icon centres on a description that is twice as long

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/338_mobile-s_paytable_07_interface_guide.png`
- Claim: decoding native frame `338`, the four row titles have cap-tops at rows **145** (`Spin`), **233** (`Increase Bet`), **322** (`Decrease Bet`) and **411** (`Features`), an even 88 to 89px pitch. The icon art does not keep that pitch against the title: the `Spin` icon's first lit row is **154**, 9px below its title's cap-top, while the `Features` icon's first lit row is **439**, **28px** below its title's cap-top. The relationship therefore shifts by **19px** between rows of one list, and on the frame the `Features` title reads as floating clear of the icon it names.
  Cause, from source: `.fs-guide-row` is `display: flex; align-items: center` at `frontend/src/lib/components/PaytableModal.svelte:727-729`. The icon is centred on the whole row, and the row's height is set by the text block, which is 2 lines for `Spin` and 4 lines for `Features` at 320px. The title stays at the top of the text block; the icon drops to the middle of it.
- Resolution note: NEW AT 1600PX.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:729` (not locked)
- Proposed fix: `align-items: flex-start` on `.fs-guide-row` so every icon aligns to its own title, which also gives the list a straight top edge down the icon column.

## STC-MOBILES-2-05 MEDIUM The autoplay panel runs left-aligned rows against a centred list, with a full-bleed divider between them and 54px of dead space down its right side

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/342_mobile-s_autoplay_menu.png`
- Claim: decoding native frame `342`, the panel spans x **92 to 308**, 216px wide. Its option rows are left-aligned: the first checkbox decodes at cols **110 to 127**, an 18px box 18px inside the panel, and the longest label `Stop on feature` ends at col **254**, leaving **54px** of empty panel to its right. Below the divider, `SPINS` and the values `10`, `25`, `50`, `100` are centred on the panel axis. So the top half is flush left and the bottom half is centred inside a 216px box.
  The divider agrees with neither. It decodes as a single full-width row at **y=234**, luma 36 to 43 against a panel background of 12 to 19, running the panel's whole width while every content row is inset 16px.
  From source: `.auto-menu-toggle` is `display: flex` with `padding: 0.5rem 1rem` (`frontend/src/lib/components/HudOverlay.svelte:1800-1811`), `.auto-menu-item` is explicitly `text-align: center` (`:1785-1796`), and `.auto-menu-sep` carries the divider as its own `border-top: 1px solid rgba(255, 255, 255, 0.1)` on a full-width block (`:1842-1850`) while setting no `text-align`, so its `SPINS` caption inherits centring. `.auto-menu { min-width: 220px }` at `:1782` is why the panel is wider than its widest row: the panel is sitting at its floor and the surplus all lands on the right.
  Note for the marshal, because it belongs to an existing row rather than to this one: `.auto-menu-sep` inheriting `center` is another instance of charter row **Q-27**'s scaffold rule `#app { text-align: center }` (`frontend/src/app.css:143`) reaching a finished surface, which is the same mechanism `STC-MOBILES-A-05` traced on the paytable rules list.
- Resolution note: NEW AT 1600PX. `STC-MOBILES-B-04` covers this panel for a different defect (no scrim) and explicitly signs its interior clean of clipping; the internal alignment was not examined.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1782` (`min-width`), `:1849` (the full-bleed `border-top`) and `:1842` (`.auto-menu-sep` inheriting centre) (not locked)
- Proposed fix: inset the divider to the same 1rem the rows use (`margin: 2px 1rem 0` with the border on the element, or a separate `<hr>`), and pick one alignment for the panel. If the values stay centred, centre the toggle rows' block too rather than leaving 54px dead on one side.

## STC-MOBILES-2-06 MEDIUM The `BET MODES` footer button wraps its own two-word label inside a button wide enough to hold it

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/344_mobile-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/343_mobile-s_transition_features_menu_opening.png`
- Claim: the footer button renders its label as `BET` over `MODES` on two lines inside a button measuring about 300 upscaled px, 106 native px, wide. The left half of the same footer also wraps, to `All modes . RTP` over `96.35%`. Both halves of a two-item footer wrapping is the signature of a bar that has run out of width, and it sits directly beneath the third mode card that `STC-MOBILES-B-10` records as clipped to a sliver, so the bottom of this panel reads as three separate things that did not fit.
  `.fm-info-btn` at `frontend/src/lib/components/FeatureMenu.svelte:1007-1011` sets `padding: 0.42rem 0.9rem`, `letter-spacing: 0.1em` and `text-transform: uppercase` with no `white-space: nowrap`, so the label breaks at its space.
- Resolution note: VISIBLE AT BOTH; not raised by either superseded shard, which covered this footer only as the agent that clips the card behind it.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:1007-1011` (not locked)
- Proposed fix: `white-space: nowrap` on `.fm-info-btn`, and shorten the left caption below a breakpoint so the footer stays one line tall.

## Native pass reconciliation

Findings from the superseded shards that fall inside frames 330 to 346. Everything else in
those two shards is a sibling squad's and is ignored here, named at the end so the gap is
explicit rather than silent.

### From STC-MOBILES-A (frames 312 to 337), overlap 330 to 337

| Native id | Verdict | Note |
|---|---|---|
| `STC-MOBILES-A-02` ways diagram clipped both ends | **CONFIRMED** | Seen at 1600px on `330`, `331`, `332` and `333`. Reel box `1` retains only a sliver at upscaled x 100 to 142 with no numeral at all; reel `5` retains a partial glyph at upscaled x 790 to 812. The 1600px read EXTENDS the frame list by `330`, which A did not cite for this. A's derivation of about 315px required against about 262px available stands unchallenged. |
| `STC-MOBILES-A-05` rules list centred against pinned markers | **CONFIRMED and EXTENDED** | Confirmed on `335`. At 1600px the per-item marker-to-text gap is legible and varies from about 38 to about 65 upscaled px across the six bullets, and continuation lines start left of their own first line (bullet two's first line at upscaled x 160, its third at x 143). EXTENDED: the identical construction is on `336`, the OVERDRIVE FREE SPINS bullets, which A did not cite. Same `.fs-rules li` and the same `#app { text-align: center }` inheritance A traced. |
| `STC-MOBILES-A-10` Overdrive table pushed left in its own rule | **CONFIRMED** | Independently on `336` at 1600px: the table's rules run upscaled x 85 to 812, `SCATTERS` starts flush at 85 and `INSTANT AWARD` ends at 742, which is **70 upscaled px, 24.8 native px** short. A measured **25px** by decoding at native. Two measurements from different instruments agreeing to 0.2px. |
| `STC-MOBILES-A-07` win line detail at 5px cap in a 13px band | **CONFIRMED on a NEW frame** | A's frames (`325` to `328`) are outside this range, so this is corroboration rather than reconciliation, and it is recorded because the frame is mine. Decoding native `341`, the strip text occupies rows **254 to 258**, a cap height of **5px**, with dark rows at 252 to 253 above and 259 to 260 below and the chrome rail at 261 to 263. That is A-07's measurement to the pixel, on a different frame, and it confirms the defect is present on every base frame rather than only around the big win. The strip content `H2 x5 8 ways $16.20` fills 196 of the strip's 745 upscaled px, so 74 per cent of the strip is empty while its type is at 5px. |
| A-01, A-03, A-04, A-06, A-08, A-09, A-11 | **OUT OF RANGE** | Frames 317 to 329 and 318. A sibling squad's; not judged here. |

### From STC-MOBILES-B (frames 338 to 363), overlap 338 to 346

| Native id | Verdict | Note |
|---|---|---|
| `STC-MOBILES-B-01` buy dialog has no CONFIRM or CANCEL | **CONFIRMED, independently measured** | Decoding native `346` row by row across x 12 to 308: the stats strip's content ends at row **508**, the dialog's lower border rule is at row **539**, and rows 509 to 538 carry nothing but a partial vertical element at x 20 to 80 reaching luma 109. No button. B measured the same interval and reported at most 15 pixels above luma 60; this squad reaches the same conclusion from its own decode. REFINED by `STC-MOBILES-2-01`, which supplies a second cause B did not have: the three-line `MAX WIN` wrap driving the strip's height. |
| `STC-MOBILES-B-03` bet stepper `-` and `+` 14px apart | **CONFIRMED, to about 1 native px, from an independent instrument** | B decoded native and got `-` at x 209 to 252, rows 127 to 156, and `+` at x 223 to 266, rows 168 to 197. This squad read the upscale by eye and got `-` at upscaled x 590 to 713, y 362 to 437, and `+` at upscaled x 630 to 752, y 478 to 553, which converts to native x 209.5 to 253.1, y 128.5 to 155.1, and x 223.6 to 266.9, y 169.7 to 196.3. Agreement within about 1px on every edge. B's root cause, `flex-wrap: wrap` at `FeatureMenu.svelte:847` with `.fm-betval { margin-left: auto }` at `:861-864`, is confirmed by reading the same lines. The 1600px pass adds only that the two buttons also sit at different distances from the card's right border (about 90 against about 51 upscaled px), which is the same fault stated a second way and needs no separate row. |
| `STC-MOBILES-B-04` autoplay menu applies zero dimming | **CONFIRMED** | Independently reproduced: the panel spans native x 92 to 308, and on frame `342` the game outside it is at full brightness, matching B's table. This squad additionally drafted a claim that the panel is TRANSLUCENT and the HUD reads THROUGH it, and refuted it by measurement; see the signed absences. B's claim is about the absence of a scrim OUTSIDE the panel and is correct. |
| `STC-MOBILES-B-08` paytable content sliced mid-glyph, both ends, no mask | **CONFIRMED and EXTENDED** | Confirmed on `338`, `339` and `340`. At 1600px the top-edge cut on `340` is the worse of the two: `loss limit you choose is reached, and can` loses its glyph tops at the header rule and reads as a rendering fault rather than as scrolled content. EXTENDED to four frames B did not cite, all in this range or A's: the panel's lower border cuts `SYMBOL PAYOUTS` mid-glyph on `332`, the mode-card title `OVERBOOST` on `337`, and body copy plus the second row of symbol cards on `331` and `334`. So the class covers the section headings and the card grid, not only running prose. B's fix point, the maskless `.fs-pt-body` at `PaytableModal.svelte:593-594`, covers all of them. |
| `STC-MOBILES-B-09` prose centred in 339 and 340, left in 338 | **CONFIRMED** | Visible at 1600px exactly as described: `INTERFACE GUIDE` card bodies are left aligned against a hard margin, and the `RESPONSIBLE PLAY` and `DISCLAIMER` paragraphs are centred over 9 and 16 lines. No separate row opened; B's is correct and its fix point (`.fs-disc` at `PaytableModal.svelte:789`) is unchanged. |
| `STC-MOBILES-B-10` third mode card clipped to a sliver by the sticky footer | **CONFIRMED** | On `343` and `344` the card's top edge shows as a strip about 40 upscaled px tall before the footer's top border at upscaled y 1332 cuts it, with no scroll cue. `STC-MOBILES-2-06` sits in the same footer and should be fixed with it. |
| `STC-MOBILES-B-07` BET pod carries 97px of dead space | **CONFIRMED** | B cites frame `341`, which is in this range. Reproduced at 1600px: `BET` ends at upscaled x 155 and the down-chevron BUTTON begins at x 378, a 223 upscaled px gap, 79 native px. B measured GLYPH to GLYPH (label end 54 to chevron glyph 151, 97px) and this squad measured label end to BUTTON BOX. The two definitions differ; the finding is the same and B's figure is the better one. Flagged so the marshal does not read 79 against 97 as a disagreement. This squad drafted it as a new finding and withdrew it on discovering B already owns it. |
| `STC-MOBILES-B-13` transition frames indistinguishable from settled | **CONFIRMED for this range** | `343` is indistinguishable from `344` and `345` from `346` at 1600px, and `341`, labelled `Paytable mid-close`, shows a fully settled base game with no paytable and no scrim. EXTENDED: `330`, labelled `Paytable mid-open`, is likewise indistinguishable from `331`. A signed that pair clean under a different question (no layout shift between transition and settled, which is true), so the two shards do not conflict; B's framing is the one that matters, and this range adds a seventh frame to its list. |
| B-02, B-05, B-06, B-11, B-12, B-14 | **OUT OF RANGE** | Frames 347 to 363, plus `350` to `357`. A sibling squad's; not judged here. |

**Nothing in either superseded shard, inside frames 330 to 346, is REFUTED.** Both were
decoder-measured rather than eyeballed, both already withdrew their own over-claims, and
at full resolution every claim of theirs in this range holds. The false positives this
re-run removed are this squad's own, and they are below.

## Explicit absences, signed

**Draft claims of this squad's own, refuted before they reached the ledger.** Each was
written into the STEP 2 shard on the 1600px eye pass and removed after measurement or
after reading the source. They are recorded because a squad that only ever adds findings
is not being checked by anything.

- **REFUTED: the autoplay panel is NOT translucent and the HUD does NOT read through it.**
  Drafted as this squad's only STREAM finding, claiming `0.00`, `WIN`, `$16.20`,
  `FEATURES`, `BET`, `$1.00` and the reel symbols were legible inside the panel on `342`.
  Measured, comparing `342` against `341` at the same pixels inside the panel bounds:
  the balance digits read mean 14.7 peak 19.6 against a panel background of mean 13.8
  peak 19.6, where the same pixels on `341` read mean 78.2 peak 239.8. The FEATURES bar
  band reads 15.0 / 19.0 against 92.9 / 222.8. Scanning row y=300 across the panel, the
  underlying glyph positions read 19 where the panel background reads 13, against 223 on
  the unobscured frame: a bleed of about **3 per cent**, the same order as the
  `rgba(6, 6, 18, 0.96)` residue `STC-MOBILES-A-03` recorded on the hud menu and equally
  invisible. Every bright pixel this squad read as bleed-through inside the panel resolves
  on measurement to the panel's OWN content: the peak of 199 at x 190 to 265 is the `50`
  option, the peak of 206 at x 200 to 270 is the `Single win limit` label.
  **The upscale manufactured this.** It is the one result here that should change how the
  re-run's other shards are read: 1600px resampling smooths a hard panel edge into a
  gradient and invites the reader to complete a pattern that is not in the pixels. A
  claim of the form "X is faintly visible through Y" is exactly the claim the upscale can
  fabricate, and it must be decoded before it is written.
- **REFUTED: the buy dialog is NOT showing the features menu through it.** Drafted as a
  MEDIUM finding claiming the yellow `BET MODES` button and four mode-card tops were
  legible inside the dialog below the stats strip on `346`, and claiming this RESOLVED the
  question `STC-MOBILES-B` signed as unseparable. Measured, comparing `346` against `344`
  at x 20 to 80: at y=485 and y=505 frame `346` reads **109** where `344` reads **60**.
  `346` is BRIGHTER than the surface it would have to be a dimmed copy of, so it cannot be
  bleed-through of that surface. B's decision to park the question was correct and it
  stays parked. What survives from this squad's look at that region is the independent
  confirmation of B-01 recorded above.
- **REFUTED: the autoplay checkboxes are NOT under-sized touch targets.** Drafted as a
  MEDIUM finding on the measured 18x18 native px checkbox against a 44px minimum. The
  measurement is right and the finding is wrong: the input is wrapped by
  `<label class="auto-menu-toggle">` (`frontend/src/lib/components/HudOverlay.svelte:503`),
  and that label is `min-height: 44px` with `padding: 0.5rem 1rem`
  (`:1800-1811`), so the hit target is the whole 44px row. The 20px input size at
  `:1813-1819` is the visible affordance only, and the comment at `:1763-1769` records
  this being deliberately fixed under OWNER AUDIT ROUND 3 item 9, from a state where the
  targets genuinely were sub-44px. Withdrawn.
- **REFUTED: the BET MODES cost cell's second line is not a defect.** Drafted as a MEDIUM
  finding on `337`, that `$1.00` orphans onto a row whose other two columns are empty.
  The stack is deliberate and its reason is recorded in the source at
  `frontend/src/lib/components/PaytableModal.svelte:316-320`: the one-line form truncated
  the 100x and 400x tiers' dollar figures with an ellipsis in the narrow cost column, and
  the comment states it was caught on a committed screenshot rather than assumed. Fixing
  the ragged block would reintroduce a money-display truncation. Withdrawn.
- **REFUTED: the paired mode card's column padding is NOT asymmetric.** Drafted as part of
  a HIGH finding claiming the left column is inset 22px and the right 10px. Source says
  they are identical, `.fm-paired-opt { padding: 0 12px }` at
  `frontend/src/lib/components/FeatureMenu.svelte:918-921` inside
  `.fm-paired-face { padding: 12px 14px }` at `:917`, and the render matches the
  specification: left column body decodes at x=62 against a predicted 35 + 14 + 12 = 61,
  right column body at x=173 against a predicted 160 + 1 + 12 = 173. The draft figure came
  from measuring one column against the card border and the other against the divider.
  Withdrawn; what survives is the `SELECT` overflow at `STC-MOBILES-2-02`.
- **REFUTED: the INTERFACE GUIDE icon FRAME is not a different size on the Features row.**
  Drafted as part of `STC-MOBILES-2-04` claiming a 122x97 frame against 150x148. Source
  says `.fs-guide-icon` is `width: 56px; height: 56px` for every row
  (`frontend/src/lib/components/PaytableModal.svelte:736-747`), and the `--set` variant
  that widens it (`:754-758`) applies only to a multi-file row, which the Features row is
  not. What this squad measured as a size difference is the icon ART inside a fixed box
  under `object-fit: contain` (`:748`), a wide pill against a square glyph, which is
  correct behaviour. Withdrawn; the vertical relationship half of the finding survives and
  is measured.
- **WITHDRAWN, not refuted: the base game BET pod void and the bottom control row.** The
  BET pod gap is `STC-MOBILES-B-07`, which already cites frame `341`; reported there, not
  here. A draft claim that the control row is inset 38px left against 29px right (upscaled)
  was dropped: both `STC-MOBILES-A-09` and `STC-MOBILES-B`'s signed absences measured that
  row with a decoder and found it centred on a shared axis with equal outer margins, and a
  3 native px difference read off a threshold on an upscale is not evidence against a
  direct measurement.
- **WITHDRAWN: `SCAT` is not set at a different size from `WILD`.** Drafted inside
  `STC-MOBILES-2-03`. `WILD` decodes 40px wide and `SCAT` 44px for the same four-character
  count, which is glyph advance, not type size. Both titles are 9 rows tall. Only the 7px
  vertical offset survives.

**Checked at 1600px and clean, signed for frames 330 to 346 only.**

- **No control or panel is clipped by the VIEWPORT edge anywhere in this range.** Checked
  every frame. The paytable panel, the FEATURES panel, the autoplay panel and the buy
  dialog all close inside 320x568: the buy dialog's own border decodes at row 539 on `346`
  with rows 542 to 566 outside it, and the autoplay panel decodes at native x 92 to 308.
  All the clipping in this range is a container clipping its own content (the ways
  diagram, the paytable scroll box, the FEATURES card list, the buy dialog's scroll box),
  which is reported as such.
- **No money display fit failure at this viewport** (the TR-115 and TR-086 class).
  `$50,000.00`, `$16.20`, `$1.00`, `$100.00`, `96.35%` and `5,000×` all render complete
  with no ellipsis and no clipping on `337`, `341`, `343`, `344`, `345` and `346`. The one
  money figure that misbehaves does so by WRAPPING rather than truncating, and it is
  `5,000x base bet` at `STC-MOBILES-2-01`; whether the marshal files that under TR-115 or
  under TR-037's sweep gap is a judgement for the ledger, and the TR-037 reading is the
  one with a source comment behind it.
- **The paytable panel's side margins are symmetric on every section in this range.**
  Checked `330` to `340`. The gold rail down the left is a one-sided accent present
  identically on all eleven, not a padding error, which agrees with both superseded
  shards.
- **The mode cards, the symbol cards and the three-column tables all use equal column
  widths.** The visible faults in them are content overflowing a correct column
  (`STC-MOBILES-2-02`) or content sitting left inside a correct rule
  (`STC-MOBILES-A-10`), not unequal columns.
- **Nothing in this range is a dead region reading as unfinished.** The largest empty
  areas are the 54px right column of the autoplay panel (`STC-MOBILES-2-05`), the empty
  lower-left of the FEATURES bet bar caused by the wrap (`STC-MOBILES-B-03`), and the 74
  per cent of the win strip that its 5px type does not fill (`STC-MOBILES-A-07`). All
  three are consequences of a reported finding rather than separate ones.
- **No replay surface appeared** (the TR-114 class), so nothing to add to that row.
- **Not checked, and named rather than left implied:** the German and Arabic paytable and
  FEATURES surfaces, which are another squad's; the `mobile-s` frames outside 330 to 346;
  motion and timing, beyond noting that `330` matches `331`, `343` matches `344` and `345`
  matches `346`, which belongs to `STC-MOBILES-B-13`; and colour, contrast and type face,
  which are the typography lens.

## KNOWN matches

- **KNOWN(Q-26)**: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/336_mobile-s_paytable_05_overdrive_free_spins.png` renders the INSTANT AWARD column as `1x`, `3x`, `10x` with a letter x, while
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/335_mobile-s_paytable_04_rules.png`, the section immediately above it on the SAME scrolling panel, renders `1×, 3×, or 10×` and `5,000×` with the multiplication sign, and `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/337_mobile-s_paytable_06_bet_modes.png` carries both forms in one stat row, `COST 1x` beside `MAX WIN 5,000×`. `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/346_mobile-s_dialog_buy_overdrive.png` renders `1x, 3x or 10x total bet` and `rises +1x` in the `WHAT YOU GET` prose while its own strip reads `5,000x`. At 1600px the two glyphs are cleanly distinguishable, which they are not at 242 tokens, so this upgrades `STC-MOBILES-A`'s and `STC-MOBILES-B`'s frame-read evidence from probable to legible. Still offered as evidence for the class, not as a codepoint claim: only source can settle a codepoint.
- **KNOWN(Q-27)**: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/342_mobile-s_autoplay_menu.png`. A THIRD component inherits the Vite scaffold's `#app { text-align: center }` (`frontend/src/app.css:143`): `.auto-menu-sep` at `frontend/src/lib/components/HudOverlay.svelte:1842-1850` sets no `text-align`, so its `SPINS` caption centres while the toggle rows above it are flush left. `STC-MOBILES-A-05` already argued the row's premise (*visible only if any link or unstyled surface reaches a frame*) needs revising on two components; this is the third, and it is on the HUD rather than in a modal.
- **KNOWN(Q-34)**: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/337_mobile-s_paytable_06_bet_modes.png` and `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/344_mobile-s_features_menu.png` both render the mode name as `Cruise` in title case, on the bet modes card and the features menu respectively, which is the two title-case surfaces of the row's four. `337` additionally shows `Normal` and `Cruise` in title case directly above `OVERBOOST` in all caps within one scrolling view, which is a second casing disagreement inside a single surface rather than across two.
- **KNOWN(Q-07)**: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/342_mobile-s_autoplay_menu.png`. The infinite autoplay option's `∞` renders visibly smaller and on a different optical centre from the `10` / `25` / `50` / `100` above it. Allowlisted as a deliberate system font fallback; evidence only, no finding.
- **No MID-01 or MID-02 match.** Neither the win banner nor a big-win count-up appears in
  frames 330 to 346. `STC-MOBILES-A` records both on `324` to `326`, which are outside this
  range.

tree_after: verbatim `git status --porcelain`, run after the final write. **Nothing shows
as MODIFIED and nothing as DELETED, so this squad did not dirty the tree.** Every line is
an untracked shard; only `STC-MOBILES-2.md` is mine and the other twenty-four belong to
sibling squads in this re-run wave. Noted for the marshal: the ` M` on
`reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png` that
`STC-MOBILES-B` reported LOUDLY in its own footer is **gone**, so that committed evidence
PNG has been restored since the native wave.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-MOBILEL-2.md
?? reports/qa/stream_test/shards/STC-MOBILEL-3.md
?? reports/qa/stream_test/shards/STC-MOBILEM-1.md
?? reports/qa/stream_test/shards/STC-MOBILEM-2.md
?? reports/qa/stream_test/shards/STC-MOBILEM-3.md
?? reports/qa/stream_test/shards/STC-MOBILES-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-MOBILEL-1.md
?? reports/qa/stream_test/shards/STT-MOBILEL-2.md
?? reports/qa/stream_test/shards/STT-MOBILEL-3.md
?? reports/qa/stream_test/shards/STT-MOBILEM-1.md
?? reports/qa/stream_test/shards/STT-MOBILEM-2.md
?? reports/qa/stream_test/shards/STT-MOBILEM-3.md
?? reports/qa/stream_test/shards/STT-MOBILES-1.md
?? reports/qa/stream_test/shards/STT-MOBILES-2.md
?? reports/qa/stream_test/shards/STT-MOBILES-3.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```
