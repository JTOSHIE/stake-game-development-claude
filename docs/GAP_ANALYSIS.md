# FUTURE SPINNER: FEATURE GAP ANALYSIS

Studio: We Roll Spinners. Compiled 2026-07-04, before the next build layer.
Australian English, metric, no em dashes or en dashes.

Purpose: check Future Spinner against (a) modern video-slot UX conventions and
(b) the Stake Engine platform's own rules and quality rubric, so we go into the
next layer knowing exactly what we have, what is missing, and what can never be
added later. Two independent research passes fed this (general slot UX + the
Stake Engine ecosystem), cross-checked against our mirrored docs in
`docs/stake-engine-live/` and `COMPLIANCE_WATCH.md`.

Legend:  DONE = present and compliant.  PARTIAL = present but thin or unverified.
GAP = absent.  DECISION = owner call.  BANNED = prohibited by Stake, do not build.

---

## 0. THE ONE FINDING THAT DRIVES EVERYTHING

**You cannot add bet modes or change the maths after approval.** The approval
guidelines are explicit: after approval only minor visual updates are permitted,
with no new modes, no maths changes and no mechanic changes (mirrored in
`docs/stake-engine-live/approval-guidelines.md`; also in our `SUBMISSION_DOSSIER.md`
section 1). Three independent reviewers score design, gameplay and maths from 0
to 3 stars; the average must be 1 star or higher to publish at all, and 2 stars
or higher is what earns a New Release tag and premium placement.

So any maths-side gap below (a second bonus-buy tier, an ante/double-chance mode,
a second interacting free-spins mechanic, a higher max-win ceiling) is a
**now-or-never decision for this submission**. The frontend gaps can all be
iterated later; the maths gaps cannot. That is the real fork in the road, and it
is an owner decision because the maths package is locked (`games/future_spinner/**`).

The rubric's most relevant low-rating cause for us, verbatim: "Missing engaging
features: bonus modes and additional game mechanics ... are expected in
competitive submissions." We already answered the base worry by shipping the
Overdrive Free Spins feature plus the 100x bonus buy (Option C). The open question
is whether our single signature mechanic is deep enough to clear 2 stars, or
whether we add one more compliant layer now while we still can.

---

## 1. YOUR SPECIFIC QUESTION: "what line do you have for winnings?"

Short answer: Future Spinner has **no paylines by design**. It is a 1,024-ways
game. A win is any set of matching symbols on **adjacent reels, left to right,
starting from reel 1**, in **any vertical position**. This is the same model as
Megaways and other ways-to-win slots. There is nothing missing here, but the
explanation can be made clearer, which is what your instinct was really flagging.

What the paytable already has (`PaytableModal.svelte`): a "no fixed paylines"
banner, a "1,024 WAYS" callout, a WAYS TO WIN adjacency diagram (five reel cells,
first three matched with arrows), the full symbol payout grid, the rules list and
the Overdrive feature table.

What the best ways-game help screens add that we do not yet have (the convention,
from Pragmatic Play and others):
- **Show where 1,024 comes from:** 4 x 4 x 4 x 4 x 4 = 1,024 (every reel always
  shows four symbols, so unlike Megaways the number never changes). Right now the
  number reads as a badge, not an explanation.
- **A worked multi-way example:** e.g. a symbol on two positions of reel 1, one of
  reel 2 and three of reel 3 pays 2 x 1 x 3 = 6 ways x the per-way value. This is
  the only way to make "matching count multiplies your win" concrete.
- **State that our paytable values are per way** and that wins total across all
  contributing ways, so a player does not misread a per-way number as the total.
- Optional premium touch: an animated example (symbol lands, ways light up, win
  counts up) inside the help screen.

This is a small, high-value frontend change and it directly answers the concern.

---

## 2. SCORED FEATURE MATRIX

### Core UI
| Item | Status | Note |
|---|---|---|
| Bet selector with discrete levels | DONE | Bet nudge + MAX; all RGS bet levels must be selectable (verify full set exposed) |
| Balance / total-bet / win, all distinct | DONE | HUD split banner |
| Spin button + spacebar to spin | DONE | Both present |
| Max-bet button | DONE | Moved to far left, away from SPIN |
| Turbo / quick spin | DONE | Three tiers (normal / turbo / super) |
| Bonus buy with cost + confirm + insufficient-balance guard | DONE | `BuyBonus.svelte`, jurisdiction-gated |
| Autoplay with full stop-condition set | GAP | Count only (10/25/50/100). No stop-on-win, stop-on-loss, single-win limit, or stop-on-feature. Also an RG and jurisdiction item |

### Information / help
| Item | Status | Note |
|---|---|---|
| Full paytable, rules, ways explanation | DONE | See section 1 for the sharpening opportunity |
| RTP per mode | DONE | 96.35% base and bonus both shown |
| Max win per mode | DONE | 5,000x shown |
| Scatter values enumerated (1x/3x/10x) | DONE | In the feature table; confirm in rules text too |
| General disclaimer popup | DONE | Present in paytable, near-verbatim to spec |
| Volatility / variance indicator | GAP | We have the numbers (SD 17.28x base, 206.63x bonus); not surfaced to players |
| Game name / version / provider in-client | PARTIAL | Studio name in loading + disclaimer; no version string shown |
| UI button guide (what each button does) | GAP | Distinct from paytable; a named Stake requirement, easy to miss |

### Presentation
| Item | Status | Note |
|---|---|---|
| Win count-up | DONE | Incremental, required for multi-action rounds |
| Tiered big / mega / epic / max celebrations | DONE | Plus dedicated 5,000x wincap splash with dwell |
| Feature intro + feature-complete total-win summary | DONE | `FreeSpinsPresentation.svelte` |
| In-feature Overdrive meter HUD + spins remaining + running total | DONE | Persistent mount |
| Retrigger acknowledgement (+5 spins) | DONE | `fs-retrigger` |
| Winning-symbol / ways highlighting | DONE | Win-connection story added; verify it reads clearly at speed |
| Scatter anticipation on reels 4/5 | PARTIAL | Anticipation sounds exist; confirm the visual reel-4/5 anticipation is wired |

### Settings
| Item | Status | Note |
|---|---|---|
| Master sound toggle | DONE | Mute button |
| Separate Music vs SFX | GAP | Single mute only; sliders are the modern standard |
| Reduced-motion | PARTIAL | `prefers-reduced-motion` honoured in 10 components, but no in-game toggle |
| Battery / simplified-graphics mode | GAP | Mobile is the majority of play |
| One-hand / left-hand mode | GAP | MAX already moved left; a proper mirror/thumb-zone toggle is absent |
| Intro / feature-intro skip toggle | GAP | No explicit skip control |
| Settings persistence (sound, speed) | PARTIAL | Theme and reel-mode persist; sound/speed prefs do not |
| Language | DONE | 16 locales (selector dev-only by design) |

### Responsible gambling / compliance
| Item | Status | Note |
|---|---|---|
| Stateless, no jackpot/gamble/continuation | DONE | Verified; the compliant core |
| Autoplay confirmation (no one-click consecutive bets) | DONE | Verify the modal enforces it |
| Bonus-buy jurisdiction gating (`disabledBuyFeature`) | DONE | Hides the buy where banned |
| Social prohibited-term scrub | DONE | Verify full table coverage on the buy UI specifically |
| Autoplay loss/spend limits + jurisdiction disable | GAP | Ties to the autoplay gap above; UK bans autoplay/turbo/buy outright |
| No deceptive near-miss / loss-disguised-as-win | DONE | Presentation is honest |

### Social / sweeps
| Item | Status | Note |
|---|---|---|
| Currency terminology scrub (coins vs cash) | DONE | Social mode overrides |
| Coin-appropriate win + paytable copy | DONE | No "$" in coin mode |
| Mode indicator always visible | PARTIAL | Confirm the active coin type is always shown |

### Stake-specific plumbing
| Item | Status | Note |
|---|---|---|
| Bet Replay (auto-load, Play, Play Again, slimmed UI, public, no session) | DONE | Verify Play Again + bonus-buy shows 100x cost |
| Mini-player / popout renders undistorted | GAP-VERIFY | Reviewers test the small background player; confirm our layout survives it |
| Game tile asset pack (BG + FG + provider logo, <=3MB) | GAP | Separate deliverable, owner/design; spec captured |
| No console errors / no external fetches | DONE | Self-hosted fonts, static build |
| Provably Fair / Fairness surface | FUTURE | Platform rolled PF across 1,200+ slots Apr 2026; not yet a hard gate for a stateless game; our `lastRoundEvents` passthrough is the data hook |

---

## 3. PRIORITISED ACTION LIST

### A. Now-or-never maths decisions (owner, before the maths locks)
These cannot be added after approval. They are the only items on this whole list
with a hard deadline.
1. **Second/third bet mode.** DONE (2026-07-05): added a third mode, **ante /
   Double-Chance** (cost 1.5x, ~2x free-spin trigger rate: 1 in 92.4 vs base
   1 in 184.7), stateless, RTP 96.3500% (cross-mode variation 0.0000%), max win
   5,000x. Independently validated by `scripts/validate_math.py` (all three modes
   pass) and wired into the frontend (Double Chance toggle). See the PAR sheet
   section 5B and `reports/screens/ante/`. A further "super/mini" buy tier remains
   an option if wanted this submission.
2. **One interacting free-spins mechanic** (for example sticky wilds that feed the
   Overdrive meter, or symbol upgrades). This is the clearest way to lift the
   "limited depth / missing additional mechanics" risk from a possible 1 to 2 star
   toward a solid 2 to 3. Stateless-compatible.
3. **Max-win ceiling.** Ours is 5,000x. The risk tier allows up to 100,000x (2-star
   up to 25,000x), and competitive Stake slots advertise 10,000x to 50,000x as the
   chase. 5,000x reads as low-ceiling to big-win hunters. A deliberate choice, but
   flag it as below category norm while the maths can still change.

Recommendation: at minimum seriously consider adding an ante/double-chance third
mode. It is the cheapest way to widen appeal, it is stateless, and it is
impossible to add later.

### B. Frontend, do now (this submission, no maths impact)
4. **Autoplay stop-conditions**: stop on any win, stop if single win >= X, stop on
   feature trigger, loss limit / spend limit, plus jurisdiction gating. Both a UX
   and an RG requirement.
5. **Sharpen the ways explainer** (section 1): the 4^5 = 1,024 math, a worked
   multi-way example, and a "values are per way" note. Directly answers the
   owner's question.
6. **Volatility indicator** in the info screen (we already have the SD numbers).
7. **UI button guide** screen (named Stake requirement).
8. **Settings depth**: split Music vs SFX, add a reduced-motion toggle, a
   battery/simplified mode, an intro-skip toggle, and persist sound/speed prefs.
9. **Verify Stake table-stakes**: mini-player/popout rendering, all RGS bet levels
   selectable, fastplay legibility on the fastest turbo tier, bonus-buy replay
   shows the 100x cost, full social prohibited-term coverage on the buy UI, and the
   active coin-type indicator always visible.

### C. Owner / design deliverable (parallel track)
10. **Game tile asset pack**: Background + transparent Foreground + provider logo,
    combined <=3MB, correct naming. Spec is captured in `COMPLIANCE_WATCH.md`.

### D. Do NOT build (banned by Stake, would fail approval)
- Gamble / double-up.
- Jackpots or progressive pots.
- Cross-round collection or persistence meters (our Overdrive meter is compliant
  precisely because it resolves inside one round and resets).
- Continuation or early-cashout.

### E. Forward-looking (not this submission)
- Reserve a Provably Fair / Fairness info surface for when the platform makes it a
  hard gate for stateless games.

---

## 4. BOTTOM LINE

Future Spinner is compliant and, on the frontend, already ahead of a typical first
submission (real feature, bonus buy, tiered celebrations, replay, 16 locales,
in-house art that directly answers the "no generic AI assets" rubric line). Your
paytable "lines" worry is explained by the ways-to-win design, and the fix is a
small clarity pass, not a missing feature.

The one thing that genuinely cannot wait is the maths scope: a second/third bet
mode, a deeper free-spins mechanic, and the max-win ceiling are all locked in the
moment we submit. Everything in list B and C can be improved release over release;
list A cannot. That is the decision to make before the next layer.

Sources: general slot UX conventions and the Stake Engine ecosystem research
(2026-07-04), cross-checked against the mirrored approval docs in
`docs/stake-engine-live/` (approval-guidelines, game-quality-rankings,
front-end-communication, math-verification, game-replay-requirements,
jurisdiction-requirements, game-tile-requirements, rgs-communication,
general-disclaimer) and `COMPLIANCE_WATCH.md`.
