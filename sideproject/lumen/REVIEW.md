# LUMEN - autonomous build review (bottlenecks + opportunities)

A side project by Claude, built with the shared math-sdk tools, fully isolated from
`future_spinner`. This is the "how far did it go + where were the bottlenecks" writeup.
Australian English, no em/en dashes.

## What got built (all destinations reached)

A complete, original, playable slot - theme to maths to art to frontend, end to end, on branch
`claude/lumen-sideproject`:

- **D0 Design** - my own concept. Shortlisted four themes (Lumen / Night Market / Cartomancy /
  Glasshouse), chose LUMEN (bioluminescent midnight-zone ocean) because the theme's core idea -
  light building in darkness - maps exactly onto a progressive light meter. `GAME_DESIGN.md`.
- **D1 Maths (the must-reach)** - `games/lumen/`. 5x4 1,024-ways, 10,000x cap, four bet modes
  (Surface 1.0x / Deep Dive 1.5x / Bloom 100x / Abyssal Bloom 300x). Signature mechanic: the
  **dual-fed GLOW meter** - a progressive free-spin multiplier that rises from BOTH winning spins
  (+1) AND collected L3 glow-orbs (+N), fusing two proven mechanics into one. INDEPENDENTLY verified
  (RTP recomputed from the shipped lookUpTables): all four modes 96.3500%, cross-mode spread
  0.0000pp, statelessness proven from the books (2,999/3,000 rounds show orb-fed meter jumps > 1).
- **D2 Art** - `sideproject/lumen/art/`. 12 original in-house SVG masters (anglerfish hero, gulper
  eel, nautilus, jellyfish, lanternfish, isopod, shrimp, glow-orb, siphonophore wild, spore scatter)
  + GLOW gauge + abyss background. Cohesive dark bio-glow system, rendered via the asset toolchain.
- **D3 Frontend** - `sideproject/lumen/frontend/`. A reskinned playable build: LUMEN palette,
  symbols on the abyss backdrop, live win lines, and the working GLOW feature (the meter climbs, the
  glow-orbs light up on the reels - the mechanic rendered). Build + svelte-check clean; screenshots
  in `frontend/screens/`.
- **D4** - `LUMEN_PAR_SHEET.md` + this review.

The result is a genuinely novel game: an original theme, an original validated mechanic, original
art, and a playable loop - produced autonomously.

## Bottlenecks (the honest findings)

1. **Pipeline ordering.** `generate_configs` needs EVERY configured mode's raw lookup table to
   exist, so generating a subset errors unless you simulate all modes first (or trim the package's
   modes with a `wincaps` defaultdict). This bit every maths build until the pattern was set.
2. **Theme-id coupling in the frontend.** The feature, meter, feature button, background stills and
   scene FX are gated on the literal string `'future-spinner'`. The clean reskin was to REPOINT that
   theme entry (keep the id, swap palette/assets), not add a new id (which would switch the feature
   off). A true multi-skin template needs those gates to become capability flags on the theme config.
3. **UI art kit gaps.** The art brief covered symbols + background, but a full game also needs a reel
   frame, logo/brand mark, feature-button art, tile plates and scene/FX art. These were absent and
   gracefully hidden; a shippable skin needs the full kit.
4. **Art readability tradeoff.** The moody dark theme makes some symbols (nautilus, shrimp) subtle,
   and the gulper eel is the least legible at thumbnail size - the cost of the atmosphere. A
   revision pass would boost edge-light on the quieter symbols.
5. **Verifying too early.** Reading a lookup table mid-optimisation gave a nonsense RTP (17,332%) -
   the tables are unweighted until the optimiser finishes. Always wait for completion, then recompute.
6. **Renderer parity.** CairoSVG (the bake toolchain) and the browser render blur/glow slightly
   differently; the production-safe path is bake-to-PNG (which this uses), not in-browser SVG.
7. **Context management.** A build this long only stayed high-quality by delegating each intricate
   piece (maths, art, frontend) to a fresh-context agent with a detailed spec, then INDEPENDENTLY
   verifying (recompute RTP, view screenshots, prove statelessness) before accepting - never trusting
   a reported number. That method was the difference between "reported done" and "verified done".

## Opportunities (where the value is)

1. **Capability-flagged theming** - convert the theme-id gates into feature flags so one framework
   cleanly hosts many skins. This is the single biggest lever for a real multi-game studio template.
2. **The dual-fed GLOW meter is a genuinely novel, reusable mechanic** - it belongs in the template's
   mechanic library alongside the Overdrive meter, multiplier wilds and the collection meter.
3. **Finish the vertical slice** - a full UI art kit + LUMEN-specific sample rounds + the CellModifier
   overlay (already built) for the glow-orb value badges in the feature = a submittable game.
4. **Trivial scale** - more modes, a higher cap, or an ante variant are all proven-cheap additions.
5. **Wire the real RGS + bet replay + submission** for a live LUMEN.

## Second run - visual completion (and the one-run lesson)

Run 2 finished the "little visual things" run 1 flagged: a full UI-chrome art kit (reel frame, LUMEN
wordmark, spin/bet/autoplay/menu buttons, balance/win panels, BUY BLOOM feature button, tile plate,
loading brand-mark) authored + rendered + wired; the future_spinner car/flame scene stripped; placeholder
audio reused; and all feature text LUMEN-ised (THE BLOOM / GLOW / BUY BLOOM), with the rules now
describing the real dual-fed meter + 10,000x cap. Result: a fully complete, polished, playable game -
frame, logo, panels, buttons all render, no broken art, no car in the abyss, and the GLOW feature reads
cleanly at 16x. Verified by build + screenshots (`frontend/screens/lumen_complete_*.png`).

**The two runs consolidate into ONE.** The split existed only because run 1's art brief covered symbols
but not the UI-chrome kit, and the first frontend pass did not strip the old scene. The
`build-original-slot` skill is updated so both are front-loaded into D2/D3 - so the next original game is
a single complete run. Remaining true polish (optional): themed audio, glow-orb per-cell badges in the
feature (needs a small interpreter tweak + LUMEN sample rounds), and the theme-id -> capability-flag
decoupling for multi-skin.

## Verdict

The autonomous flow went the full distance - a complete, verified, original game - and the real
bottlenecks are now known and specific (theme coupling, the UI art kit, pipeline ordering), each
with a clear fix. LUMEN stands on its own as a design, and as a proof of how far the "design +
orchestrate + independently verify" method can push.
