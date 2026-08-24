# R101: GUARD `npm run assets` AGAINST PLACEHOLDER DESTRUCTION

Sole live brief. Unattended. Review lane. High care.

## THE FENCE

- No game rasters may be staged or committed as part of this work.
- Do not modify the current 27 working-tree placeholders.
- No kit packaging.
- output/ remains read-only.
- Placeholders must survive byte-for-byte unchanged.

## PRECONDITIONS

- On main, up to date.
- Confirm the current working tree still contains the arc-2 placeholder rasters.
- Confirm `npm run assets` (or the underlying assets build path) is capable of regenerating
  symbol/UI rasters from the committed pipeline.

## CONTEXT

R097 established that `npm run assets` would silently:

- Revert 16 of the 27 current placeholders
- Recreate 15 deliberately deleted files

This is the only known command that can destroy the current visual test set without warning.
It must be guarded before further integration work.

## TASK 1 - MAP THE HAZARD

Identify exactly:

- Which command/script `npm run assets` invokes
- Which of the current working-tree placeholders it would overwrite
- Which deleted files it would recreate
- Whether any existing safety check already exists

Report the concrete file list, not a summary estimate.

## TASK 2 - IMPLEMENT A GUARD

Add a safety gate so `npm run assets` cannot silently destroy uncommitted placeholder work.

Acceptable designs (choose the minimal robust one):

- Refuse to run if tracked asset paths differ from HEAD in the working tree
- Require an explicit force flag (e.g. `--force-assets` / `ALLOW_ASSETS_OVERWRITE=1`) to
  proceed when dirty asset files are present
- Print a clear refusal naming the number of at-risk files and how to override

Requirements:

- Default behaviour must be safe
- Override must be explicit and intentional
- Message must be understandable to a human operator
- Do not broaden the guard beyond asset regeneration

## TASK 3 - SELF-TEST

Add or extend a test that proves:

1. With dirty placeholder assets present, `npm run assets` refuses by default
2. With the explicit override, it can proceed
3. Clean tree behaviour remains intact

Follow project testing conventions. Prefer a seeded/self-contained proof.

## TASK 4 - RECORDS

- Communications entry stating the hazard is now guarded
- Note the override mechanism
- Confirm the 27 placeholders were left untouched

## CLOSE

- Minimal diff: guard + test + records
- Zero placeholder rasters staged or committed
- Leave working tree placeholders unchanged
- PR on review lane
- Report the final refusal behaviour and override method

When finished, stop and confirm that `npm run assets` is safe by default.
