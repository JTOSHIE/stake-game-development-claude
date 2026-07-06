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

## PRECONDITIONS (both required before running — do NOT start without them)
1. **Lock sanction.** Explicit owner authorisation to temporarily lift exactly
   these two deny lines in `.claude/settings.json`:
   - `Edit(games/future_spinner/**)`
   - `Write(games/future_spinner/**)`
2. **Super Buy ship name.** `__________` (placeholder: "Super Buy"). Used in
   `game_metadata.json` and the frontend `fsModes.ts` label.

## LOCK DISCIPLINE (mandatory — convention (e))
- Temporarily remove ONLY those two deny lines from the working-tree
  `.claude/settings.json`. NEVER commit that edit.
- Restore both lines before any commit; verify `git diff .claude/settings.json`
  is empty.
- Writing to `games/future_spinner/**` via bash (`cp`/`python`/`sed`) to route
  around the deny is FORBIDDEN and does not count as the sanctioned exception.
- Work off a branch off `main`, in a worktree, same flow as #29/#31/#32/#34.

## SCOPE — one new mode; everything else byte-identical
Shipped five-mode menu = `base` (Normal, 1.0x), `cruise` (Cruise, 1.0x),
`antelite` (OVERBOOST, 1.25x), `bonus` (Buy Overdrive, 100x), `super`
(Super Buy, 400x). base/cruise/antelite/bonus already exist and recompute to
96.3500%. **The only new maths is `super`.** The other six library modes
(volatile, ante 1.5x, superante, minibuy, superbuy, megabuy, hyperbuy) stay in
the package but are not part of the shipped five.

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
