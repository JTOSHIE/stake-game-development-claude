# R084 EXECUTED BRIEF, SAVED VERBATIM

Pasted 2026-08-22, headed R083. **Executed as R084**: R083 was already taken by the
committed local-SD assessment (commits `1ff12e4a` and `44e7c741`, pull request #126, still
open). The brief's line "the earlier R083 draft is dead, never pasted" is not true of this
repository, and the discrepancy is recorded in the session report rather than smoothed.
The brief itself is reproduced below unedited.

---

FABLE BRIEF R083: ASSETFORGE VIA HOSTED APIS, LICENCE GATE FIRST
(2026-08-22). Sole live brief; the earlier R083 draft is dead, never
pasted. Judgement tier, Australian English, no em or en dashes. Save
and commit verbatim. Explicit-path commits, CI green per rule 10,
comms folded per (t). Constraint on record: no models, weights or UIs
install on the owner's machine; pip client libraries and scripts only.
TASK 0, LICENCE CAPTURES, BLOCKING. Capture verbatim into
docs/licences/: the Stability API terms of service and pricing page,
and OpenAI's business terms and usage policies as they bear on image
outputs, commercial use, and gambling. If either text is plainly
prohibitive, mark that provider BARRED; if plainly permissive, CLEARED;
if ambiguous, STOP on that provider and escalate the quoted passage
for a Fable ruling. No generation call to any provider before its
CLEARED mark.
TASK 1, THE CLIENT. scripts/assets/assetforge/: a thin dual-provider
Python client (Stability API SD 3.5 Large and Large Turbo; OpenAI
gpt-image-1), keys from env never committed, every call logged to a
committed provenance ledger (provider, model, full prompt, parameters,
seed where supported, request id, cost), outputs to gitignored scratch,
per-image cost printed, a session spend cap of USD 10 refusing calls
beyond it. THE COMPOSER: production prompts are built
deterministically by merging the committed Grok style register with
each art_manifest_arc2.csv row's subject, dimensions, and notes, so no
hand-written prompt can drift from the manifest; the calibration seven
use Grok's verbatim prompts, committed alongside.
TASK 2, THE CALIBRATION SEVEN, on every CLEARED provider. Native
transparent background where the provider supports it, else the green
key field; twice delivery size; the H1 trio via the provider's best
registration mechanism (shared seed and structure reference on
Stability; reference-image conditioning on OpenAI) with the honest
note recorded if perfect registration proves unreachable by API.
One contact sheet, provider-labelled, IDs and parameters burned in,
placed in outputs for the owner, then STOP for the owner's eye-call.
TASK 3, INGESTION SKELETON. Alpha handling for both routes, downscale
to manifest delivery dims, 64px silhouette thumbnails, dimension
assertion against the manifest, refusal of any file without a manifest
row.
TASK 4, THE EMOJI SWEEP. Per platform staff guidance captured from
Discord (emoji anywhere is a tell), scan every shipped string and
rendered surface for emoji codepoints; expect zero; seeded per (p)
with an injected glyph; one gate joins the matrix.
CLOSE. Comms, tracker rows, tree clean. FOR THE NEXT SESSION: the
owner's provider-and-style eye-call verdict, then reference-chained
batch generation, on the owner's word only.
