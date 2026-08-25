# R105: RUNTIME-TRUE KIT INTAKE + BANNER PAIR COMMIT PATH + PARTICLE/FX CLOSURE

Sole live brief. Unattended. Review lane. Maximum useful effort. Long-running autonomous session.

## THE FENCE

* No kit packaging.
* output/ read-only.
* Do not weaken asset guards.
* Do not stage/commit rasters except where this brief explicitly authorises a paired, CI-safe
  commit path.
* Preserve the current visual set.
* If blocked, record the exact blocker with evidence and continue. Do not stop early.

## PRECONDITIONS

* On main, up to date.
* Confirm current dirty working tree still contains: the selected banner raster; the one
  uncommitted banner CSS line from R104; the existing placeholder set.
* Confirm the new kit exists: .scratch/art-review/chatgpt-runtime-true-kit/
* Confirm these docs exist: docs/design/FX_REGENERATION_SPEC.md;
  reports/OUTSTANDING_LEDGER_2026-08-25.md or its successor; Spine setup docs.

## GOAL

Turn the runtime-true kit into actual in-game progress. Priority order:

1. Resolve the banner pair correctly
2. Inventory and intake every truly ready asset from the runtime-true kit
3. Close as many FX / particle gaps as the current runtime allows
4. Leave precise follow-ups only where architecture or law blocks progress

## WORKSTREAM 1 - BANNER PAIR RESOLUTION

### 1.1 Verify current local state
Confirm: which banner file is active; which CSS line references it; that both are still
uncommitted; that the live HUD still renders correctly with them.

### 1.2 CI-safe pairing rule
R104 established that committing CSS alone fails asset reference / 404 gates, and committing
raster alone leaves dead art. Choose one explicit outcome:
A. Commit both together if the selected banner is clearly good enough and the wiring is
   minimal/safe.
B. Revert both if the banner is not good enough on final review.
C. Leave both dirty only if a specific blocker remains and is documented.
Do not leave the repo in an ambiguous half-wired state without saying so explicitly.

### 1.3 If committing
Stage only the paired files required; keep the commit minimal; verify local gates / relevant CI
assumptions; confirm no placeholder set is accidentally swept in.

### 1.4 Visual confirmation
Capture or describe: base skin; Overdrive skin if reachable; whether Balance / Win / Bet remain
readable; whether the CSS accent edge still works.

## WORKSTREAM 2 - FULL RUNTIME-TRUE KIT AUDIT

### 2.1 Inventory every asset
For each file record: path, dimensions, alpha, group, intended consumer, status: READY /
WRONG-SPEC / NO-ROW / HOMELESS / LAW-BLOCKED / DUPLICATE / REVIEW-ONLY.

### 2.2 Especially inspect
Banner finalists; jet flame 5-frame sheet; holo 6-frame sheet; scatter pulse sheet; impact ring
sheet; all particle sizes; win micro-FX; visor / eye / chest layers; contact shadows; paytable
support; scene polish.

### 2.3 Compare against runtime contracts
Use the real code contracts, not guesses: steps(5) / steps(6) / steps(4) sheet consumers;
particle sprite sizes actually drawn by the runtime; any existing shadow / layer hooks; any
existing paytable frame targets. Update the outstanding ledger with the new truth.

## WORKSTREAM 3 - INTAKE EVERYTHING TRULY READY

### 3.1 Working-tree intake rules
Intake only if all are true: correct dimensions / frame count; real consumer exists or can be
safely referenced; no locale-baked text hazard; no system-law violation; no CI reference hazard.

### 3.2 Expected high-value candidates
Prioritise: correct-count FX sheets that match CSS steps(...); particle sprites in the real
runtime sizes; robot/car contact shadows if widths match and a safe insertion point exists; any
paytable support art with a real target; any scene polish with a real target.

### 3.3 For each successful intake
Record: source; destination; why it is safe; whether code wiring was needed; whether it remains
working-tree-only or can be committed under current rules.

### 3.4 For each refusal
Record the exact reason and the smallest next action that would unblock it.

## WORKSTREAM 4 - PARTICLE AND FX CLOSURE

### 4.1 Particle runtime mapping
Trace the actual particle system: expected texture sizes; naming expectations; atlas vs
individual sprites; spawn points / layers.

### 4.2 Close the particle gap if possible
If the new kit finally contains the right sizes, intake them and wire only the minimum safe
references needed. If the runtime needs an atlas and only individuals exist, either build a safe
atlas in a non-destructive way, or write the exact atlas packing brief for the next session.

### 4.3 Sheet consumers
For each animation sheet consumer: verify whether the new sheet can drop in; intake if yes;
otherwise write a one-line residual blocker.

### 4.4 Result
End this workstream with a clear statement: which FX rows are now truly closed; which still need
art; which still need code.

## WORKSTREAM 5 - SHADOWS AND SUPPORT LAYERS

### 5.1 Contact shadows
If robot/car shadow art now matches the scene asset widths: determine whether a safe extra
`<img>` / layer can be added; if yes, implement the minimal working-tree-only wiring; if no,
document the exact component insertion point required.

### 5.2 Visor / eye / chest layers
These are useful only if an in-house / law-compliant animation route exists. Do not illegally
wire external character animation layers. Do record whether they materially reduce the cost of a
future law-amendment route.

## WORKSTREAM 6 - PAYTABLE / GUIDE / TEXT HARDENING

### 6.1 Confirm guide honesty remains intact
After prior icon restoration, re-verify the Interface Guide still matches live controls.

### 6.2 Intake paytable support only if safe
No baked English. No fake payout numerals. No locale breakage.

### 6.3 Small safe fixes
Implement only isolated, low-risk corrections discovered while auditing.

## WORKSTREAM 7 - PROGRAMME STATE AND NEXT ROADMAP

### 7.1 Recompute
Working-tree modified rasters; committed vs uncommitted art; REPLACE coverage if changed;
homeless art remaining; law-blocked art remaining; wrong-spec remaining.

### 7.2 Banner status must be explicit
State one of: banner pair committed; banner pair reverted; banner pair intentionally left dirty,
with reason.

### 7.3 Produce the next-session roadmap
Ranked: immediate remaining safe intakes; art still required; component work required; law/owner
decisions required.

## CLOSE

* Minimal safe commits only where pairing rules are satisfied
* No accidental placeholder sweeps
* Guards remain active
* PR on review lane
* Continue until all workstreams are complete
