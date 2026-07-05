# Competitor demo reference: "Waylander's Forge" (Valkyrie Studio)

Captured 2026-07-05. Eight Stake mobile screen recordings of a third-party Stake Engine
slot, kept as **market reference only** to inform our own development (maths structure,
feature design, buy-menu UX, presentation). Australian English, no em/en dashes.

> **IP note.** This is NOT our game and NOT our IP. It is another studio's title
> (Valkyrie Studio, "Waylander's Forge", TM and (c) 2025 Valkyrie Studio, viking blacksmith
> theme). Use it for structural and UX reference only. Do not copy its art, names, symbols,
> or branding into our packages. Our own game facts live in `GAME_FACTS.md`,
> `docs/MASTER_TEMPLATE.md` and `docs/FEATURE_RESEARCH_v1_1.md`.

## Files

> The raw `.mp4` captures (~122 MB total) are kept locally in this folder but are **git-ignored**
> (see `.gitignore`) - there is no git-lfs in this repo and raw video would bloat history
> permanently. The committed reference is `README.md` + `frames/*.png`, which capture
> everything. To version the videos, install git-lfs and remove the `.gitignore` rule.

Videos (all Stake mobile web wrapper, portrait 720x1584, TRX play-money):

| File | Duration | What it shows |
|---|---|---|
| `01_base-and-buy-menu.mp4` | 19.5s | Studio splash, intro card, base spins, opening the buy menu |
| `02_buy-menu-and-freespins.mp4` | 20.4s | Buy-menu tiers, Wayfinder's Blessing rules card, free-spins play |
| `03_paytable-and-info-pages.mp4` | 17.0s | **The full in-game info: pay table, all features, special symbols, bet modes, RTP/max-win, legal notice** (richest source) |
| `04_base-play-and-bet-menu.mp4` | 14.6s | Base play, MAX/multiplier symbols landing, the bet-level menu |
| `05_bonus-enhancer-activate.mp4` | 15.1s | Activating the Bonus Enhancer (3x cost) and the resulting spin |
| `06_trickster-spin-buy.mp4` | 15.2s | Trickster Spin buy, confirm dialog, multiplier-grid spin |
| `07_trickster-multiplier-grid-bigwin.mp4` | 10.6s | Multiplier-grid cascade building to a Big Win |
| `08_special-symbols-megawin.mp4` | 19.9s | Wild Star / Wild Bomb in action, Nice/Big/Mega Win tiers |

`frames/*.png` are full-resolution stills pulled from the videos (numbered; the info-page
stills 08-17 are the most useful reference). Re-pull any moment with
`ffmpeg -ss <t> -i <video> -frames:v 1 <out>.png`.

---

## GAME FACTS (from the in-game info pages, video 03)

- **Studio / title:** Valkyrie Studio, "Waylander's Forge". TM and (c) 2025.
- **Grid:** 6 reels x 4 rows. **Pay ways** (left-to-right, adjacent reels, min 3), not
  paylines. Wilds pay on every reel.
- **RTP:** "Every game mode has a theoretical RTP of **98.0%**." (Notable - see Insights.)
- **Max win:** "The maximum payout of any bet is **80,085x** the base bet." (A deliberate
  gag-number signature, not a round cap.)
- **"4 DIFFERENT BONUSES", "7 UNIQUE FEATURE SYMBOLS"** (from the splash intro card).
- Tumble/cascade base mechanic (wins remove, symbols drop in).

### Pay table (per-way multipliers, for 3 / 4 / 5 / 6 of a kind)

Premiums and specials pay up to 6-of-a-kind. Values are x per way at base:

| Symbol | 6 | 5 | 4 | 3 |
|---|---|---|---|---|
| WILD (red knot) | 75 | - | - | - |
| Expanding Wild (W banner) | 75 | - | - | - |
| Multiplier Wild ("100" disc) | 75 | - | - | - |
| Longboat (H1, red) | 20 | 10 | 5 | 2.5 |
| Hammer (H2, yellow) | 7.5 | 5 | 2 | 1 |
| Anvil (H3, purple) | 5 | 2.5 | 1 | 0.5 |
| Axe (H4, orange) | 1.2 | 0.6 | 0.4 | 0.3 |
| Tankard (H5, blue) | 0.6 | 0.4 | 0.3 | 0.2 |
| K (royal) | 0.5 | 0.4 | 0.3 | 0.2 |
| Q (royal) | 0.4 | 0.3 | 0.2 | 0.1 |
| J (royal) | 0.4 | 0.3 | 0.2 | 0.1 |

(Wilds/W-banner/100 disc are listed with a 6-of-a-kind value of 75; they primarily function
as the special symbols below.)

---

## THE FOUR FREE-SPINS BONUSES (video 03)

Scatter count on trigger selects which of four distinct feature modes you enter. All award
10 free spins on trigger; all retrigger +5 spins on 3 scatters landed inside the bonus.

1. **Forge Spins** (3 scatters) - a **symbol-upgrade** feature. Each symbol hit fills a
   "symbol bar"; when it fills it resets and the **lowest symbol kind upgrades into a random
   available symbol kind**. The transformed symbol persists for tumbles and spins after the
   upgrade. (A collection/upgrade meter that resolves in-round.)
2. **Wayfinders Blessing** (4 scatters) - a **per-symbol doubling multiplier** feature.
   Starts by turning a random symbol into a wild. Every time a winning connection is made by
   a symbol kind, that symbol's multiplier **doubles** (starts at 1x; wilds have no
   multiplier).
3. **Mine Shaft Tumble** (5 scatters) - a **growing-reels tumble** feature. Every winning
   connection raises a random reel's height by 1, **up to 8 rows per reel** (ways balloon).
   Scatters cannot drop; instead 5 consecutive tumbles in a spin award +1 free spin, and each
   awarded free-spin grant increases by +1.
4. **The Soul Forge** (6 scatters) - a **per-position grid multiplier** feature. Enables a
   multiplier grid where every symbol hit **doubles the grid multiplier on its own cell**
   (each cell starts at 1x).

---

## SPECIAL SYMBOLS + FEATURES (video 03)

**Special symbols (the "7 unique feature symbols"):**
- **Expanding Wild** (W banner) - expands downwards on the reel until it hits the bottom, a
  wild, or another special symbol.
- **Multiplier Wild** ("100" disc) - connecting wins are multiplied by this wild. Values:
  **2x, 3x, 5x, 7x, 10x, 25x, 50x, 100x, 200x, 500x, 1000x**.
- **Wild Bomb & Golden Wild Bomb** - Wild Bomb expands to a **2x2** block of wilds; Golden
  Wild Bomb expands to a **3x3** block of wilds.
- **Split** (crossed swords) - every paying symbol on the board is split, **increasing the
  ways** (each split adds 1 additional way to that symbol).
- **Royal Remover** (cauldron) - removes all royal (low-pay) symbols from the board and from
  the initial tumble.
- **Wild Star** (blue shield) - randomly transforms **all symbols of one kind into wilds**.
- **MAX (Wild)** - "instantly reaches the max win on hit"; counts as a wild.
- **Mystery Symbol** (teal rune) - all mystery symbols reveal the same random symbol kind; if
  it reveals an upgraded/transformed symbol it still counts as the original.

**Board features (can trigger on any spin):**
- **Raining Wilds** - places a random number of wilds on the board (any of WILD / Expanding /
  Multiplier / MAX).
- **Guaranteed Bonus** - guarantees at least 3 scatters, with a chance for more.
- **Stacked Symbols** - a random number of reels arrive stacked with one symbol.

---

## BET MODES / BUY MENU (videos 01, 02, 03, 05, 06)

The lightning button opens a scrolling ladder of one **enhancer** plus several **feature
buys**. Every mode is quoted at a **theoretical RTP of 98.0%**. Observed pricing (as a
multiple of base bet):

| Mode | Cost x | What it does |
|---|---|---|
| **Bonus Enhancer** | 3x (e.g. $3 at $1) | "More than 5x as likely to trigger the bonus." A cheap per-spin enhancer (Activate, not Buy). |
| **Trickster Spin** | ~75x observed ($60 at $0.80) | Enables the multiplier grid (every symbol hit doubles the grid multi) and increases the chance for special wilds to land. |
| **Forge Spins** | 100x | Guaranteed bonus with 3 scatters (enters Forge Spins). |
| **Wayfinders Blessing** | 200x | Guaranteed bonus with 4 scatters (enters Wayfinders Blessing). |
| **F U Spins** | ~2000x observed | "Get 3 guaranteed random special symbols." |
| **Mine Shaft Tumble** | 1000x | Guaranteed bonus with 5 scatters (enters Mine Shaft Tumble). |

Notes:
- The **Bonus Enhancer** and **Trickster Spin** are single-spin products (enhancer / one
  charged spin), distinct from the feature buys that drop you straight into free spins.
- The base-bet menu offers discrete levels (0.10, 0.20, 0.40, 0.60, 0.80, 1.00, 1.20, 1.40,
  1.60, 1.80, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, ...) - see `frames/18_bet-menu.png`.
- Win tiers on the celebration banners: **Nice Win -> Big Win -> Mega Win** (video 08 shows a
  Mega Win of ~294x at $15 bet from a multiplier-grid cascade).

---

## WHY THIS MATTERS TO US (insights for our own build)

1. **RTP band.** Their info screen states **98.0% for every mode**. Our mirrored Stake
   approval docs put the ceiling at 96.70% (`CLAUDE.md`, `docs/FEATURE_RESEARCH_v1_1.md`
   section 0). Either the real approvable band is wider than our mirrored copy says, or
   high-RTP titles get special treatment. **Worth re-confirming on the next docs refresh**
   (`COMPLIANCE_WATCH.md`) - it directly affects our own RTP ceiling assumption.
2. **Multi-bonus by scatter count.** One clean idea: the **number of scatters picks the
   feature** (3->4->5->6 = four different bonuses), instead of one feature with scaling
   entries. A different structural answer to the same "give players variety" goal our
   ante/multi-buy work explores (`FEATURE_RESEARCH_v1_1.md` sections 2, 6).
3. **In-round progressive multipliers, four ways.** Symbol-upgrade bar (Forge), per-symbol
   doubling (Wayfinders), growing reels (Mine Shaft), per-cell grid multiplier (Soul Forge).
   All stateless / in-round - the same compliance envelope our Overdrive meter lives in.
   Concrete precedents for "a second interacting free-spins mechanic" (our decision D4).
4. **Buy ladder + cheap enhancer.** A 3x "make bonus 5x more likely" enhancer sits below the
   full feature buys (100x/200x/1000x/2000x). The cheap-enhancer-vs-full-buy split is a UX
   pattern for our own multi-buy selector (our decision D3).
5. **Max-win positioning.** Their 80,085x headline vs our 5,000x is a live data point for the
   max-win ceiling decision (our decision D5).
6. **Special-symbol variety** (expanding / multiplier / bomb / split / royal-remover / wild
   star / mystery / max) is almost all in-round board manipulation - a menu of code-mechanic
   ideas that map onto our `MECHANIC_VARIANTS` catalogue.
