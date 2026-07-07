# FS FeatureMath v2 — Super Buy into the locked package (ready-to-run brief)

Adds the 400x Super Buy (Overdrive meter pre-revved to 5x) to the shipped
`games/future_spinner` maths package and relabels the 1.25x ante as OVERBOOST,
so the shipped five-mode menu (PR #32) has real maths behind every card. The
mechanic is already **prototyped and independently validated** in the sibling
`games/future_spinner_super` (see findings), so this is a de-risked drop-in, not
an exploration. Do NOT change any already-verified mode's numbers.

## READ FIRST
- `games/future_spinner_super/SUPER_PROTOTYPE_FINDINGS.md` — the validated recipe
  and the recomputed numbers (super 96.350000% at 400x, SD ~500x, max win 5,000x,
  tail 3.2e-3 cost-scaled, stateless from the books).
- `CLAUDE.md` — locked files, the lock-exception mechanism, the true game facts.
- `scripts/validate_math.py` — the independent gate (extend it to the shipped set).
- `.claude/skills/build-original-slot/SKILL.md` — D1 maths fast path + golden rules
  (independently recompute RTP; wait for the optimiser before recomputing; prove
  statelessness from the books).
- `docs/MASTER_TEMPLATE.md` — the 11-mode library and the ship-config.

## PRECONDITIONS
**STATUS 2026-07-06: BOTH SATISFIED - this brief is CLEARED TO RUN.** The owner
issued the lock sanction (relayed via Fable) naming exactly the two deny lines
below, and decided the Super Buy ship name: **NITRO OVERDRIVE** (the nitro
canister is the H2 symbol and a pre-revved meter is literally what nitro does).
1. **Lock sanction (in hand).** Temporarily lift exactly these two deny lines in
   `.claude/settings.json`:
   - `Edit(games/future_spinner/**)`
   - `Write(games/future_spinner/**)`
2. **Super Buy ship name: NITRO OVERDRIVE.** Used in `game_metadata.json` and the
   frontend `fsModes.ts` label.

## LOCK DISCIPLINE (mandatory — convention (e))
- Temporarily remove ONLY those two deny lines from the working-tree
  `.claude/settings.json`. NEVER commit that edit.
- Restore both lines before any commit; verify `git diff .claude/settings.json`
  is empty.
- Writing to `games/future_spinner/**` via bash (`cp`/`python`/`sed`) to route
  around the deny is FORBIDDEN and does not count as the sanctioned exception.
- Work off a branch off `main`, in a worktree, same flow as #29/#31/#32/#34.

## SCOPE — the shipping package on main is base + bonus; ADD THREE modes
CORRECTED (verified against origin/main, 2026-07-06): the shipping package
`games/future_spinner` currently carries ONLY `base` + `bonus`. The 11-mode
library lives on `claude/gap-analysis` as REFERENCE and MUST NOT be pulled into
the shipping package (Fable's guard). So FeatureMath v2 ADDS exactly three modes
to reach the shipped five, keeping `base` + `bonus` byte-identical:
- **`cruise`** (Cruise, 1.0x, low-vol) - port its BetMode + optimiser fences
  verbatim from the validated `claude/gap-analysis` (`game_config.py` /
  `game_optimization.py`).
- **`antelite`** (1.25x) rebadged **OVERBOOST** (display name only; the mode id
  stays `antelite`, which the frontend `fsModes.ts` already maps as its
  serverMode) - port its fences from `claude/gap-analysis`.
- **`super`** (400x) named **NITRO OVERDRIVE** - the 5x pre-rev recipe below.
Add ONLY these three. Do NOT bring in volatile / ante 1.5x / superante / minibuy
/ superbuy / megabuy / hyperbuy - they stay on the library branch as reference.

## THE RECIPE (apply verbatim to `games/future_spinner/`)

### 1. `gamestate.py` — pre-rev the meter for `super`
Add the helper (e.g. above `run_spin`):
```python
def _overdrive_start_meter(self) -> int:
    """Starting Overdrive meter for the current bet mode. Super buy pre-revs to
    5x; every other mode starts at 1x. Stateless: applied at the feature start
    each round, reset to 1 by reset_book every round."""
    try:
        name = self.get_current_betmode().get_name()
    except Exception:
        return 1
    return 5 if name == "super" else 1
```
In `run_freespin`, immediately after `self.reset_fs_spin()`:
```python
_start_meter = self._overdrive_start_meter()
if _start_meter > 1:
    self.global_multiplier = _start_meter
```

### 2. `game_config.py` — add the `super` BetMode (guaranteed 3+, standard bonus conditions)
```python
BetMode(
    name="super",
    cost=400.0,
    rtp=self.rtp,
    max_win=_maxwin,
    auto_close_disabled=False,
    is_feature=False,
    is_buybonus=True,
    distributions=[
        Distribution(criteria="wincap", quota=0.03,
                     win_criteria=float(_maxwin), conditions=wincap_bonus_condition),
        Distribution(criteria="freegame", quota=0.97,
                     conditions=freegame_bonus_condition),
    ],
),
```
Richness comes from the 5x pre-rev, not from extra scatters, so it reuses the
standard `wincap_bonus_condition` / `freegame_bonus_condition` (already defined).

### 3. `game_optimization.py` — add the `super` opt block
```python
"super": {
    "conditions": {
        "wincap": ConstructConditions(
            rtp=0.05, av_win=wincaps["super"], search_conditions=wincaps["super"]
        ).return_dict(),
        "freegame": ConstructConditions(rtp=0.9135, hr="x").return_dict(),
    },
    "scaling": ConstructScaling(
        [{"criteria": "freegame", "scale_factor": 1.1,
          "win_range": (150, 800), "probability": 1.0}]
    ).return_dict(),
    "parameters": ConstructParameters(
        num_show=5000, num_per_fence=10000, min_m2m=4, max_m2m=12,
        pmb_rtp=1.0, sim_trials=5000, test_spins=[10, 20, 50],
        test_weights=[0.6, 0.2, 0.2], score_type="rtp",
    ).return_dict(),
},
```
Same buy fence shape as bonus (0.05 + 0.9135 = 0.9635); the 400x cost scales the
mean to 385.4x. Converged first try in the prototype; no re-tuning expected.

## GENERATION (preserve every existing mode byte-identical)
- Generate ONLY `super` (per-mode generation, the same way the ante was added on
  its own — see the note in `run.py`), so base/cruise/antelite/bonus books, force
  files and replay IDs stay byte-identical. Add `super` to `run.py` `target_modes`
  and to `game_metadata.json` `modes`.
- Wait for the Rust optimiser to finish before recomputing anything (a table read
  mid-run reports nonsense).

## VALIDATE (independently, zero trust — recompute from the SHIPPED tables)
Extend `scripts/validate_math.py` to the shipped five and confirm:
- Every shipped mode recomputes to **96.3500% at 4dp**; cross-mode spread <= 0.5pp.
- `super`: max win exactly 5,000x; tail `P(>=5000x)` cost-scaled <= 1e-2
  (cost 400 -> cost_scale 0.8; the prototype was 3.2e-3).
- **Statelessness from the books:** decompress `books_super.jsonl.zst`; every round
  shows `globalMult` starting `[1, 5, 6, 7, ...]` (base 1x, feature starts at 5,
  climbs +1 per winning spin), one final payout per round, meter reset each round,
  no cross-round carry.
- **Byte-identical check:** base/cruise/antelite/bonus `lookUpTable_*_0.csv`,
  `books_*`, and force files hash-match their pre-v2 versions.

## RELABEL + METADATA
- `game_metadata.json`: the 1.25x ante's display name -> **OVERBOOST** (the mode
  id stays `antelite`; the frontend `fsModes.ts` already maps `overboost` ->
  `serverMode: 'antelite'`). Add `super` with the owner's ship name. Version bump.
- Record the shipped-five selection (base, cruise, antelite/OVERBOOST, bonus,
  super) in the ship-config note; the other six library modes remain but are not
  shipped.

## DOCS + REPORT
- PAR sheet: add `super`'s validated row and the pre-rev mechanic note; state the
  shipped five and the 5,000x cap.
- `docs/MASTER_TEMPLATE.md`: `super` as a shipped mode.
- `reports/SESSION_REPORT.md` (+ archive) with a FOR THE NEXT SESSION handover
  (convention (i)). Save THIS brief verbatim at the repo root and include it in
  the commit (conventions (b)/(f)).

## FRONTEND FOLLOW-ON (separate, UNLOCKED commit)
Once the RGS serves the five, flip the placeholders live in
`frontend/src/lib/config/fsModes.ts`: set `available: true` on `cruise`,
`overboost` and `super`, and set the `super` label to the owner's ship name.
This is the one-line-per-mode change the placeholder architecture was built for
(PR #32). Not locked; do it as its own frontend commit/PR.

## DEFINITION OF DONE
- [ ] `super` recomputes to 96.3500% (4dp), max win 5,000x, tail-safe, stateless
      (books proof: meter starts at 5, resets each round).
- [ ] base/cruise/antelite/bonus byte-identical (hash match to pre-v2).
- [ ] OVERBOOST label + Super Buy ship name in `game_metadata.json`.
- [ ] `validate_math.py` ALL PASS on the shipped five.
- [ ] PAR sheet + `MASTER_TEMPLATE.md` + session report + handover written.
- [ ] `.claude/settings.json` diff empty; deny lines restored; lock re-applied.
- [ ] Frontend `fsModes.ts` placeholders flipped live (separate unlocked commit).

If every box is ticked, FeatureMath v2 is complete and the shipped five-mode menu
is backed by validated maths.

---

## FABLE RATIFICATION + ADDITIONS (2026-07-06)

The overseer (Fable) reviewed and ratified this approach. Bake these in:
- **Sanction in hand; name decided.** Run end to end. NITRO OVERDRIVE (400x super),
  OVERBOOST (antelite 1.25x rebadge).
- **Guard: shipping package stays lean.** Add ONLY cruise, antelite(OVERBOOST) and
  super(NITRO OVERDRIVE). The 11-mode library stays reference on `claude/gap-analysis`,
  never merged into the shipping package.
- **Independent recomputation is on the v2 OUTPUT** in the locked package (Fable does
  this at a check-in), not on the prototype. So the validation gates in this brief are
  mandatory and must pass on the shipped tables.

### Submission-risk items to CLOSE as part of v2 (Fable):
- **Placeholders must never ship.** Once all five modes are live server-side, flip the
  frontend `fsModes.ts` placeholders (`cruise`, `overboost`, `super`) to
  `available: true` and set the super label to "Nitro Overdrive" (separate UNLOCKED
  frontend commit). A submitted build advertising dead COMING SOON modes is a rejection
  risk.
- **REVIEW_EVENTS / bet-replay per-mode IDs** for the three new modes (cruise, antelite,
  super) - add them so replay covers every shipped mode.
- **PAR sheet + dossier + paytable copy: five-mode update**, including an explicit
  disclosure of the Super Buy's 5x pre-revved starting meter (the NITRO OVERDRIVE
  mechanic) so the maths is transparent to the reviewer.
- **QA re-soak must cover all five live modes**; the external audit pack is now stale
  against the overhauled game and needs one refresh re-run AFTER audio lands.

### After v2 (owner / next sessions):
- Audio delivery into `~/Desktop/fs_audio/` (top creative blocker, owner-gated).
- QA re-soak (5 modes) + external audit refresh + compliance re-validation.
- Portal one-timers + dossier section 5, then submit. Target: 3 stars.
