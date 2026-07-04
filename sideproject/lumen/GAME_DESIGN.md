# LUMEN — Game Design Document

A side project. Original design by Claude, built with the shared math-sdk tools and framework,
fully isolated from `future_spinner` (never modified). Stake Engine compliant. Australian English,
no em/en dashes.

---

## 1. Theme shortlist (I considered four, then chose)

1. **LUMEN - bioluminescent midnight-zone ocean** (CHOSEN). The lightless deep sea, lit only by the
   creatures that glow. Dark palette, cyan/teal/magenta bio-glow.
2. **Night Market** - a neon Asian street-food market (dumplings, lanterns, koi). Warm, appetite-led.
3. **Cartomancy** - a fresh tarot/fortune reading (cards, moths, candles). On-trend mysticism.
4. **Glasshouse** - Victorian carnivorous plants that "eat" to pay. Organic, novel.

### Why LUMEN wins (the expert call)
- **Mechanic-theme fusion.** The theme's core idea - light building in total darkness - maps
  *exactly* onto a progressive light meter fed by wins AND collected glow. The mechanic IS the
  theme, not a bolt-on. That coherence is what makes memorable slots.
- **Art efficiency + drama.** Glowing shapes on near-black read beautifully with cheap SVG/CSS glow
  (blur + additive light), and a dark stage makes every win pop. High impact per unit of art - ideal
  when authoring vector art by hand.
- **Emotional distinctiveness.** Calm, awe, and tension (the abyss) instead of the usual frantic
  candy/gold. It stands out on a lobby wall of bright slots.
- **Mass-market safe**, original IP, no trademark risk (unlike "Megaways"), no dark/underage content.

---

## 2. The game

| Parameter | Value |
|---|---|
| Grid | 5 reels x 4 rows |
| Win mechanic | Ways-to-win, 4^5 = 1,024 ways |
| RTP | 96.35% (all modes, within the 90.0-96.70% band) |
| Max win | 10,000x total bet (hard cap, all modes) |
| Volatility | High |
| Feature | THE BLOOM free spins with the GLOW meter |
| Bet modes | Surface 1.0x, Deep Dive 1.5x, The Bloom buy 100x, Abyssal Bloom buy 300x |
| Stateless | Yes - the whole feature resolves inside one book round |

### Symbols (10)
- **High:** H1 Anglerfish, H2 Gulper Eel.
- **Mid:** M1 Nautilus, M2 Jellyfish, M3 Lanternfish.
- **Low:** L1 Isopod, L2 Deep Shrimp, L3 Diatom (plankton).
- **Wild:** W Siphonophore (a glowing chain-jelly) - substitutes for all except Scatter.
- **Scatter:** S Spore (a glowing egg-sac) - 3/4/5 trigger the feature.
- **Glow Orb** (feature-only value carrier - see the mechanic; rendered as a drifting light mote).

Paytable (per way) mirrors the proven Future Spinner tier shape for validation reliability, then
can be re-tuned: H1 22/6/1.5, H2 10/3/0.8, M1 5/1.5/0.45, M2 4/1/0.3, M3 2/0.6/0.2, L1 1.5/0.45/0.15,
L2 0.8/0.25/0.10, L3 0.65/0.20/0.08 (for 5/4/3 of a kind).

### THE BLOOM (free spins) + the GLOW meter (signature mechanic)
- **Trigger:** 3/4/5 Spore scatters award 8/12/16 free spins AND pay an instant 1x/3x/10x total bet.
- **The GLOW meter** starts at x1 and multiplies every free-spin win (ways wins and scatter pays).
  It rises from TWO sources - this fusion is the game's soul:
  1. **+1 after every winning free spin** (the abyss brightens as you win - the proven progressive
     pattern), and
  2. **+1 for every Glow Orb that lands** during free spins (you gather light - the proven collect
     pattern, feeding the same meter instead of a separate pot).
  The meter never resets during the feature and is not retroactive.
- **Retrigger:** 3+ scatters in the feature award +5 free spins and pay the instant award x the
  current GLOW.
- **Wincap:** 10,000x total per round, hard.

### Bet modes (the ladder, per the research: base + enhancer + a small buy ladder, all one RTP)
- **Surface** (1.0x) - standard play; the feature triggers ~1 in 180.
- **Deep Dive** (1.5x) - descend deeper: ~2x the trigger rate (the ante/double-chance pattern).
- **The Bloom** (100x) - buy a guaranteed feature entry.
- **Abyssal Bloom** (300x) - buy a rich guaranteed entry (4/5-scatter weighted, higher starting GLOW).

All four return 96.3500% RTP (within 0.5% of each other) and share the 10,000x cap.

---

## 3. Why these features (merit selection)

- **Ways + free spins + a progressive multiplier + a buy** is the proven modern winning formula
  (Sweet Bonanza / Gates lineage), adapted to ways.
- **The dual-fed GLOW meter** is the differentiator: it combines two independently-validated
  mechanics (progressive multiplier + collection) into one thematically perfect meter, giving a
  richer feature than either alone without breaking the stateless rule (the meter resolves inside
  one round).
- **A tight 4-mode ladder** (not an overwhelming menu) matches the "table-stakes + one premium buy"
  convention and keeps the UI clean.
- **10,000x cap** is a modern chase (above the 5,000x mass-market floor) and I have already proven
  higher caps validate cleanly.

Deliberately EXCLUDED (stateless / focus): jackpots, gamble, cross-round state, and a sprawling
mode menu.

---

## 4. Workflow + destination points

- **D0 (this doc):** isolate + design. DONE.
- **D1 (must-reach): validated maths.** New game package `games/lumen/` (a sibling; not
  `future_spinner`): reskinned config (Lumen symbols/paytable), the GLOW mechanic in gamestate
  (progressive meter fed by winning spins + Glow Orbs), the 4 bet modes, 10,000x cap. Generate 100k
  sims/mode, independently verify 96.3500% RTP (recompute from the shipped lookup tables), confirm
  statelessness from the books.
- **D2: art.** In-house SVG masters for the 10 symbols + wild/scatter + a background, rendered to
  exact-size PNGs via the asset pipeline. Dark stage, additive bio-glow.
- **D3: frontend.** A Lumen skin (adapt the shared Svelte/Pixi framework): reels, the GLOW meter
  presentation, win display, feature, mode selector - a playable loop wired to the maths.
- **D4: polish + review notes** - PAR sheet, compliance check, and a "where the bottlenecks were"
  writeup.

Build method (proven this project): I own the design + orchestration + independent verification;
delegate intricate builds to fresh-context agents with detailed specs; never trust a reported
number - recompute RTP from the shipped tables before accepting.

Bottleneck watch: (a) the dual-fed meter maths converging to exact RTP; (b) authoring enough
distinct, on-theme SVG symbols by hand; (c) frontend feature-presentation for the new meter.
