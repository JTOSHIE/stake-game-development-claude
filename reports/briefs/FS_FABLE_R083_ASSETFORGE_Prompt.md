FABLE BRIEF R083: ASSETFORGE, THE LOCAL GENERATION PIPELINE AND THE
CALIBRATION SEVEN (2026-08-22). Sole live brief; the R082-numbered
draft of this brief is dead, never pasted, the number having been taken
by the frame merge. Judgement tier, Australian English, no em or en
dashes. Save and commit verbatim. Explicit-path commits, CI green per
rule 10, comms folded per (t).
TASK 1, PIPELINE. Stand up a local Stable Diffusion 3.5 pipeline
(AudioForge's sibling, scripts/assets/assetforge/): SD 3.5 Large and
Large Turbo weights fetched under the Stability Community License with
the licence text committed to docs/licences/stability/ per (l); first
assess this machine's hardware honestly (chip, RAM, expected seconds
per image) and report; if local generation is impractical, STOP and
report with a costed cloud-GPU alternative running the same weights,
no other provider or model without a Fable licence ruling. Every
generation is seeded and logged (prompt, negative, seed, steps, CFG,
sampler, model, LoRA) to a committed provenance ledger, outputs to a
gitignored scratch dir, only owner-approved assets ever committed.
TASK 2, THE CALIBRATION SEVEN. Script and run the gate: SY-01, H1
composed, H1 base and spin as an identical-seed ControlNet-registered
pair, SY-13, H2, SC-01, using the SD prompt register from the pivot
letter (committed alongside), green key fields, twice-delivery-size
render. Contact-sheet the seven with IDs and parameters burned in,
place in outputs for the owner, and STOP: no LoRA training, no further
generation, until the owner's eye-call verdict arrives beside his
Waylander reference.
TASK 3, INGESTION SKELETON. The alpha-extraction and QA pass ready for
later batches: green-key knockout, downscale to manifest delivery
dims, 64px silhouette thumbnail, dimension assertion against
art_manifest_arc2.csv, refusing any file not matching a manifest row.
CLOSE. Comms, tracker row ARC2-PIPELINE, tree clean. FOR THE NEXT
SESSION: LoRA training on the approved set, on the owner's word only.
