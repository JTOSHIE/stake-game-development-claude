# Handover to Fable — Future Spinner + LUMEN status (2026-07-06)

**From:** the working session (Claude Opus 4.8, 1M context), operating semi-independently
to conserve tokens. **To:** Fable (has main-repo access). **Purpose:** a single, detailed,
navigable handover so you can review the current state and give ONE consolidated round of
feedback (the owner will relay it back). Everything below points to branches / PRs / files
so you can go straight to source without burning tokens re-deriving context.

Australian English throughout; the repo rule is no em or en dashes anywhere.

---

## 0. TL;DR (read this, then dive via the map in section 1)

- **Future Spinner** (the shipping game) got a full **graphics overhaul** implemented from the
  designer's mocks (HUD, paytable, win celebrations), a **unified 5-mode FEATURES menu**, and a
  first **symbol/scene animation pass** (punchier win reaction + the pilot character featured).
  All merged or in open PRs #36/#37.
- The **maths** is essentially done: an 11-mode library (all 96.3500%) plus a **validated Super
  Buy prototype** (400x, GLOW pre-revved to 5x). The only remaining maths step (FeatureMath v2,
  into the LOCKED package) is **gated on the owner** (a lock sanction + a ship name).
- **LUMEN** — a brand-new original slot built from scratch (theme, validated maths, in-house art,
  playable frontend) — is complete and now **backed up on a branch**.
- A reusable **skill** for building original slots was distilled and committed.
- **What we need from you:** a review + advice on the graphics/menu/animation direction, the
  Super Buy maths reasoning and the D1-D6 mode decisions, whether LUMEN is worth productionising,
  the animation roadmap (Path A vs B), and any Stake Engine submission risks/gaps we've missed.

---

## 1. Repository map (where to look — token-efficient review)

### Merged to `main` (review directly on main)
| PR | Branch | What |
|----|--------|------|
| #29 | fs-paytable-reskin | B3 paytable reskin (brushed-steel instrument plates) |
| #31 | fs-hud-reskin | B1 HUD reskin + shared `overdriveVisual` flip |
| #32 | fs-mode-menu | Unified 5-mode FEATURES menu (`fsModes.ts`, data-driven, placeholders) |
| #33 | chrome-primitives-doc | `docs/design/CHROME_PRIMITIVES.md` (canonical chrome for design passes) |
| #34 | fs-win-celebrations | C1 win-tier celebrations reskin (BIG/MEGA/EPIC/MAX) |
| #35 | featuremath-v2-brief | `FS_FeatureMath_v2_Prompt.md` (ready-to-run maths brief) |
| #24-#28 | (various) | earlier: feature presentation, doc reconcile, tooling, ante/multi-buy research |

### OPEN PRs (please review; not yet merged)
| PR | Branch | What |
|----|--------|------|
| #36 | fs-symbol-life-v3 | Amplified Symbol Life - punchier win reaction on the grid |
| #37 | fs-scene-character | Featured the pilot character + removed the awkward turbine swirls |

### Backup / reference branches (NOT for merge — spikes and side projects)
| Branch | What |
|--------|------|
| `claude/lumen-sideproject` | **LUMEN** - the complete new original slot (maths + art + frontend) |
| `claude/fs-super-prototype` | The Super Buy maths spike (code + `SUPER_PROTOTYPE_FINDINGS.md`; 450MB library excluded, regenerable) |
| `claude/gap-analysis` | The full 11-mode maths library + fork variants (bigwin/multiwild/rtp94) + `validate_math.py` |

### Key documents (the fast path to intent)
- `CLAUDE.md` - project rules: locked files, the lock-exception mechanism, true game facts, compliance, conventions.
- `FS_FeatureMath_v2_Prompt.md` - the ready-to-run brief for the locked maths regen (embeds the validated recipe).
- `docs/design/CHROME_PRIMITIVES.md` - the canonical `.fs-` chrome (tokens, plate/rail/knob, overdrive state) for design passes.
- `.claude/skills/build-original-slot/SKILL.md` - the reusable playbook for building an original slot end to end.
- `games/future_spinner_super/SUPER_PROTOTYPE_FINDINGS.md` (on the fs-super-prototype branch) - the Super Buy validation.
- `scripts/validate_math.py` - the independent maths gate (recomputes RTP from the shipped tables).
- `docs/MASTER_TEMPLATE.md` - the 11-mode library + volatility recipes + mechanic catalogue.
- `docs/reference/competitor-demos/waylanders-forge/` - competitor reference (frames + videos) used to ground the animation direction.

---

## 2. Play-by-play (what happened, in order)

1. **Maths library.** Built the full template mode library in `games/future_spinner`: base, cruise
   (low-vol), ante (1.5x), antelite (1.25x), superante (2.0x), volatile, bonus (100x buy), minibuy
   (80x), superbuy (300x), megabuy (500x), hyperbuy (1000x). Every mode independently recomputes to
   **96.3500%** (4dp) from the shipped tables; cross-mode spread 0.00pp. Plus fork variants
   (`future_spinner_bigwin` 25,000x cap, `future_spinner_multiwild`, `future_spinner_rtp94`).
2. **Strategy locks (D1-D6).** With the owner: ante ships at **1.25x** rebadged **OVERBOOST** (a
   stated "double-chance"); **Cruise** ships (low-vol white space); the buy ladder is **100x standard
   + a 400x Super** (no cheap mini-buy - a measured finding: our feature is too rich for a cheap
   hunt buy); **no second interacting mechanic for Future Spinner** (that is game two's headline);
   **keep the 5,000x cap**; **96.3500% parity across every mode** (the 0.5% rule).
3. **LUMEN.** Built a complete original slot autonomously (see section 4).
4. **The skill.** Distilled the LUMEN build into `.claude/skills/build-original-slot/SKILL.md`.
5. **Designer graphics overhaul.** Implemented three Claude Design mocks into the FS frontend:
   B1 HUD, B3 paytable, C1 win celebrations (see section 5).
6. **5-mode FEATURES menu.** Ported LUMEN's unified "one list, all modes" menu to FS (section 5).
7. **Super Buy prototype.** Built + validated the 400x / 5x-pre-rev Super Buy in a sibling package
   to de-risk the locked regen (section 3).
8. **FeatureMath v2 brief.** Wrote the ready-to-run brief for the locked regen (section 3).
9. **Symbol animation.** Amplified the existing Symbol Life win-reaction (section 6, PR #36).
10. **Scene/character.** Pulled the pilot out as a feature, removed the swirls (section 6, PR #37).
11. **Logo discussion.** Reviewed the "We Roll Spinners" studio logo sample (section 7).

---

## 3. Maths — status and the one gated step

**Done and verified (all recompute to 96.3500% from the shipped lookup tables):** the 11-mode
library. The shipped five-mode menu = Normal (base 1.0x), Cruise (1.0x), OVERBOOST (antelite 1.25x),
Buy Overdrive (bonus 100x), Super Buy (400x). Four of those already exist and validate.

**The one new artifact - the Super Buy - is prototyped and validated** (branch
`claude/fs-super-prototype`, `SUPER_PROTOTYPE_FINDINGS.md`):
- Mechanic: a per-mode starting Overdrive/GLOW meter pre-revved to **5x** at the feature start
  (base game stays 1x; set at each round's feature start, reset every round = stateless).
- Recomputed: **96.350000% at 400x**, mean 385.4x, SD ~500x, max win 5,000x, tail P(>=5000x)
  cost-scaled 3.2e-3 (limit 1e-2). Statelessness proven from the books (meter reads `[1,5,6,7,...]`
  per round, no cross-round carry). Converged first try, no fence re-tuning.

**Gated on the owner (this is the critical-path blocker):** FeatureMath v2 - dropping the Super Buy
into the LOCKED `games/future_spinner` package and rebadging antelite as OVERBOOST. It needs
(a) an explicit **lock sanction** to lift the two deny lines `Edit/Write(games/future_spinner/**)`,
and (b) a **ship name** for the Super Buy. The brief (`FS_FeatureMath_v2_Prompt.md`) is ready to run
the moment those arrive; it embeds the exact recipe, the per-mode generation that keeps the four
existing modes byte-identical, and the validation gates.

**For your review:** does the Super Buy reasoning hold (fence shape, the 5x pre-rev as a stateless
per-mode meter init, the cost-scaled tail gate at 400x)? Any concern with the D1-D6 mode decisions?

---

## 4. LUMEN — the new original slot (backed up on `claude/lumen-sideproject`)

A complete original game, built from scratch to test the end-to-end pipeline and seed the skill:
- **Theme:** a bioluminescent abyss. **Signature mechanic:** a dual-fed GLOW meter (a progressive
  meter fed by BOTH winning free spins AND collected Glow Orbs into one global multiplier).
- **Maths** (`games/lumen`): four modes - surface / deepdive / bloom / abyssalbloom - all validated
  to **96.3500%**, 10,000x cap, proven stateless from the books.
- **Art:** 12 in-house SVG symbol masters + a full UI-chrome kit, rendered via the asset pipeline.
- **Frontend** (`sideproject/lumen/frontend`): a reskinned playable build with the unified FEATURES
  menu, an overhauled paytable (named symbols, interface guide), and music/SFX volume sliders.
- **Decision needed from the owner (input welcome from you):** LUMEN is currently a side project.
  Is it worth productionising / submitting as a second title, or does it stay a reference build?

---

## 5. What we UPDATED / IMPLEMENTED (the Future Spinner overhaul)

### Graphics (from the designer's mocks, merged)
- **B3 paytable (#29):** rebuilt on a brushed-steel `.fs-plate` instrument-plate vocabulary; kept
  all dynamic wiring (i18n, social-mode, jurisdiction-gated buy price, the seven-point disclaimer).
- **B1 HUD (#31):** the control bar rebuilt as brushed-chrome plates/knobs at the exact spec
  coordinates + a crafted CSS/SVG spin button; introduced the shared `overdriveVisual` store that
  flips both the HUD and the paytable to a magenta "Overdrive" state from one source of truth.
- **C1 win celebrations (#34):** BIG (10x) / MEGA (30x) / EPIC (100x) plates + the MAX 5,000x
  fullscreen overlay, on the same chrome. (Correction logged: real tiers are 10/30/100, not the
  2/10/50 an earlier handover assumed.)
- **Chrome primitives doc (#33):** `docs/design/CHROME_PRIMITIVES.md` - the canonical `.fs-`
  primitives + tokens + overdrive pattern, so design passes build on the real chrome.

### Product architecture (merged)
- **Unified 5-mode FEATURES menu (#32):** a single data-driven menu (`fsModes.ts`) listing every
  bet mode as a card. Only base + bonus are runtime-live (what the RGS serves today); Cruise,
  OVERBOOST and Super Buy render as clearly-marked "COMING SOON" placeholders that flip live with a
  one-line `available:true` edit once FeatureMath v2 ships. This is the owner's "template with
  placeholders you tweak in and out" model.

### Animation (OPEN PRs - please review)
- **Symbol Life amplification (#36):** the grid already had a subtle win-burst; we amplified it -
  a squash-stretch winner pop, brighter bloom, bigger tinted particle burst, losers dimmed harder
  (dim-to-spotlight), a left-to-right staggered reveal, punchier landing + anticipation. Reduced-
  motion guarded. Symbol-agnostic (fires on every real win).
- **Scene/character (#37):** split the baked `scene_character_car.png` into two rendered layers
  (car + pilot) from the SVG master; pulled the pilot out as a fully-visible, left-justified feature
  hero with his own idle bob/sway; removed the awkward spinning turbine swirls.

---

## 6. Design input + the pending designer feedback

**Context you already have:** you (Fable) gave the initial startup prompt for the designer (Claude
Design). Since then the designer produced three mocks (B1 HUD, B3 paytable, C1 win celebrations) via
handoff zips, which we implemented (section 5). **You have not seen the feedback loop yet.**

**Key facts about the designer relationship:**
- Claude Design builds mocks in a separate environment and **cannot access this repo**, so handoffs
  come as zip bundles and we hand the chrome back via `CHROME_PRIMITIVES.md`.
- The design work has materially lifted the game - the owner's words: it now "looks like a proper,
  professionally made slot" and "sets a new standard." That is the consolidated positive feedback to
  pass back to the designer.

**Direction changes / decisions during the animation work:**
- **Symbol animation: Path A chosen** - amplify the EXISTING in-house animation on the current clean
  art, rather than commission new rigged/spine symbols (Path B). Path B (AAA rigged symbols) needs a
  rigging pipeline we do not have in-house; it stays a future option.
- **Next design asks (queued, not yet briefed):** (1) per-symbol bespoke win animations (piston
  pumps, fuse sparks, coilover compresses, nitro flares, wild flares rings, scatter pulses - the
  thematic parts already exist in the SVG masters like `H2_reel_nitro`, `M2_reel_coilover`,
  `L2_reel_fuse`); (2) a **logo rebuild** - the "We Roll Spinners" studio emblem sample is a strong
  concept (wheel/tyre + slot-reel fusion, neon roundel) but executed as AI raster key-art; it needs
  a clean in-house vector rebuild (crisp letterforms, drop the generic 777 for our real symbols,
  scalable to favicon). Your view on both is welcome.

---

## 7. What we FIXED / process learnings

- **Stacked-PR gotcha:** #30 auto-closed when its stacked base branch was deleted on merge;
  reopened as #31. Lesson: stacked PRs die if the base branch is deleted - target main once the
  parent merges.
- **Super validation units:** the books' `payoutMultiplier` is x100 integer (500000 = 5,000.00x);
  do not misread it as a cap violation.
- **Optimiser discipline (in the skill):** simulate all configured modes before generate_configs;
  never read a lookup table mid-optimisation (reports nonsense); wait for DONE, then recompute.
- **Delegate-and-verify:** intricate builds run in isolated git worktrees via fresh-context
  subagents, then we independently verify (recompute RTP, view screenshots, diff the locked
  boundary). This is how quality held across a long, token-constrained run.

---

## 8. OUTSTANDING / gaps / limitations (please weigh in)

**Gated on the owner (cannot proceed without them):**
- FeatureMath v2 lock sanction + Super Buy ship name (critical path).
- Audio files for `~/Desktop/fs_audio/` (the game still uses placeholder sounds).

**Not started (queued):**
- Per-symbol bespoke win animations (the "each symbol gets its own character" pass).
- The logo vector rebuild.
- Feature / big-win choreography (tie the grid reaction into the C1 tiers), stronger anticipation.
- Merge of open PRs #36 (symbol life) and #37 (scene).

**Limitations we hit:**
- Claude Design has no repo access (zip handoffs only) - slows the design loop.
- The dev server has no RGS/wallet backend, so we cannot spin live; we force states via the public
  store `.set()` API for screenshot/demo (e.g. `?windemo=`, the C1 preview harness).
- Path B (rigged/spine symbol art) needs external tooling we do not have in-house.
- Three of the five menu modes are placeholders until FeatureMath v2 ships.
- A separate concurrent session has been running on `claude/build-diet-qa` (build-diet + QA soak);
  its work is outside this handover - worth a look if you are auditing everything.

**Open strategic questions for the owner (your advice sought):**
- LUMEN: productionise/submit, or keep as a reference build?
- Animation roadmap: is Path A the right ceiling for launch, with Path B post-launch?
- The Future Spinner submission sequence (FeatureMath v2 -> 5-mode live -> audio -> docs/QA/
  compliance re-validation -> portal + dossier): any risk or missing gate for Stake Engine?

---

## 9. What we would like from you (Fable)

A single consolidated review covering:
1. **The overhaul** (graphics #29/#31/#33/#34, the 5-mode menu #32, the animation #36/#37) - is the
   direction and execution sound? Anything you would change before we treat it as the standard?
2. **The maths** - the Super Buy 400x/5x-pre-rev reasoning and the D1-D6 mode decisions.
3. **LUMEN** - worth productionising as a second title?
4. **The skill** - is `build-original-slot` a good reusable asset, and would you add to it?
5. **Submission risk** - any Stake Engine compliance/quality gap we have not covered.
6. **The designer** - your view on the per-symbol animation and logo-rebuild asks (you seeded the
   designer, so your steer helps us brief the next passes cleanly).

The owner will collect your feedback and relay it back in a single input, so please be as specific
and prioritised as you can. Thank you.
