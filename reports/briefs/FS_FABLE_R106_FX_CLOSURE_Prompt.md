# R106: FX CLOSURE KIT INTAKE + PARTICLE / SHEET WIRING

Sole live brief. Unattended. Review lane. High effort. Long-running autonomous session.

## THE FENCE

- No kit packaging.
- output/ read-only.
- Do not weaken asset guards.
- Working-tree-only raster intake unless a paired CI-safe commit is clearly justified.
- Do not stage/commit unrelated placeholders.
- If blocked, record the exact blocker with evidence and continue.

## PRECONDITIONS

- On main, up to date.
- Confirm the new kit exists: `.scratch/art-review/chatgpt-fx-closure-kit/`
- Confirm current dirty placeholder / FX state is preserved.
- Confirm runtime contracts from prior sessions remain available: FX sheet `steps(...)` consumers;
  particle size expectations; outstanding ledger / FX regeneration specs.

## GOAL

Close as many remaining FX rows as this kit truly allows.

Priority:
1. Audit the closure kit against real runtime contracts
2. Intake every valid sheet / particle
3. Wire only what is safe and minimal
4. Leave precise residuals only where art or architecture still blocks

## WORKSTREAM 1 - FULL KIT AUDIT

Inventory every asset in `chatgpt-fx-closure-kit`. For each file record: path, dimensions, alpha,
subject, intended FX row / consumer if any, status: READY / WRONG-SPEC / NO-ROW / HOMELESS /
WEAK-VS-INCUMBENT / REVIEW-ONLY.

Especially verify: FX-03 5-frame jet sheet; FX-02 4-frame filament arc sheet; particle subjects at
32 / 64 / 96 / 128; any bonus micro-FX.

## WORKSTREAM 2 - SHEET INTAKE

### 2.1 FX-03 jet flame
If it is truly 5 frames and matches the runtime contract: intake through the normal safe path;
place working-tree-only onto the real target; verify frame boundaries / downscale integrity;
confirm the consumer can use it without code changes if possible.

### 2.2 FX-02 filament arc
If it is truly the L2 filament/electrical subject and matches geometry: intake working-tree-only;
do not accept a reel-stop impact impostor.

### 2.3 Any other valid sheet
Intake only if both geometry and intent match.

## WORKSTREAM 3 - PARTICLE INTAKE

### 3.1 Map the real particle runtime
Identify: expected texture sizes; current incumbent particle art; whether the system uses
individuals, atlas, or both; exact target paths.

### 3.2 Compare new particles against incumbents
For each candidate: size match? subject match? stronger / weaker than incumbent? safe to replace
or additive only?

### 3.3 Intake the winners
Working-tree-only intake for particles that are clearly valid. Refuse weak replacements rather
than shipping quieter/fainter art by accident.

### 3.4 If an atlas is required
Either build a safe atlas without destroying source individuals, or write the exact atlas packing
residual for the next session.

## WORKSTREAM 4 - MINIMAL WIRING ONLY WHERE SAFE

If an intaken asset needs a tiny safe reference update to become live, do it. Do not build large
new systems in this session.

In particular: do not force burst-overlay architecture unless it is truly tiny and isolated; do
not illegally animate external character layers; do not disturb the committed banner pair.

## WORKSTREAM 5 - SHADOW INSERTION POINT

If still blocked only by `.char-layer` breathing transform: document the exact safe insertion
point outside the animated wrapper; if a minimal safe implementation is obvious and low-risk,
implement it working-tree-only; otherwise leave a precise next-brief snippet.

## WORKSTREAM 6 - PROGRAMME STATE

Recompute and report: REPLACE coverage; which FX rows are now closed; which particle rows are now
closed; remaining art gaps; remaining code gaps; remaining law/owner decisions. Update the
outstanding ledger.

## CLOSE

- Records + safe working-tree intakes + minimal safe wiring only
- No accidental placeholder sweeps
- Guards remain active
- PR on review lane
- Stop only when all workstreams are complete
