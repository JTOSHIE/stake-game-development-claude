# Session Report - R084 THE LICENCE GATE BARRED A PROVIDER, AND THE INGEST DESTROYED A CUTOUT (2026-08-22)

Brief saved verbatim: `reports/briefs/FS_FABLE_R084_ASSETFORGE_API_Prompt.md`. Branch:
`assetforge/2026-08-22`, REVIEW LANE, continuing pull request #126. **No game code changed,
no locked path written.**

**NUMBERED R084, NOT R083, AND THE BRIEF'S OWN PREMISE IS THE REASON.** The brief opens
"the earlier R083 draft is dead, never pasted". It was pasted, and it was executed: R083 is
the local-SD feasibility assessment, committed at `1ff12e4a` and `44e7c741`, sitting in the
still-open PR #126 with its full 30-job CI green. Filing this as R083 would put two
different sessions under one number, which is precisely the collision R082 settled two days
ago when the frame lineage was unified at v9. **Repository numbering is authoritative**, so
this is R084 and the earlier work stands. PR #126 is not superseded by this brief; it is
the evidence that produced it, and this session extends the same branch rather than
rewriting the ingest it already contains.

## TASK 0, the blocking gate: one provider BARRED, one CLEARED

Ruling `docs/licences/PROVIDER_GATE_2026-08-22.md`; captures under
`docs/licences/openai/2026-08-22/` and `docs/licences/stability/2026-08-22/`.

**OPENAI IS BARRED.** Its Usage Policies, effective 2026-10-29, list under "Protect people.
Everyone has a right to safety and security. So you cannot use our services for:" the item:

> real money gambling

**It is contractual, not advisory, and that is what makes it a BARRED rather than a
caution.** 16.1 incorporates the OpenAI Policies by reference; the definition of "OpenAI
Policies" includes the Usage Policies; 3.3(a) restricts use that violates them. And the
consequences of breaching that specific clause are unusually sharp: **14.1 carves
"CUSTOMER'S BREACH OF SECTION 3.3 (RESTRICTIONS)" OUT of the mutual liability cap**, 13.2
indemnifies OpenAI for claims arising from violating use, and 8.2 permits termination.
Assets already generated would be of contested provenance in a product that goes to a
regulated operator for approval.

**The narrow reading exists and is deliberately NOT relied on.** One could argue that
generating art is not itself "real money gambling" and that the clause targets operating
gambling through the service. That reading may be right. It is not adopted, for three
reasons: Future Spinner IS a real-money gambling product and the art is made expressly for
it; the prohibition is category-level and unqualified; and convention (m) forbids resolving
a compliance ambiguity in our own favour. **The route to OpenAI is written confirmation
from OpenAI, not our construction of their policy.** Escalated as E1.

**STABILITY IS CLEARED**, and the finding worth carrying is that **the API route is
materially cleaner than the weights route**. Gambling appears in neither its API Terms of
Service nor its Acceptable Use Policy, each verified with a working control so the zero is
a real absence rather than a search that matched nothing. More than that: the Community
License that governs self-hosted weights carries the two clauses R083 escalated, the
"Powered by Stability AI" attribution that collides with frame convention (w) and the USD
$1,000,000 revenue termination. **Measured on the API terms' body with the provenance
header excluded, because the header names both phrases and would otherwise have counted
itself: `Powered by Stability` 0, `1,000,000` 0, `annual revenue` 0.** So moving to the
hosted API does not merely solve R083's hardware problem. **It retires R083's E1 and E2 for
art generated on this route.** Both stay live for anything self-hosted.

Cost, derived from the captured pricing rather than remembered: 1 credit = USD $0.01,
`sd3.5-large` 6.5 credits, `sd3.5-large-turbo` 4, and the Structure control that the H1
trio needs is 5. **The calibration seven is USD $0.455, or $0.555 with two Structure
calls**, under six percent of the brief's $10 cap.

## TASK 1, the client, and the gate is enforced in code

`scripts/assets/assetforge/generate.py` plus `provider_gate.json`, the machine-readable
form of the TASK 0 marks, which the client reads on **every** call. **A client that merely
omitted OpenAI would silently become wrong the day somebody added it back; one that refuses
by mark stays right.** Keys from env, never committed. Every call appends provider, model,
full prompt and negative, parameters, seed, request id and cost to a provenance ledger
before the image counts as delivered. **The USD 10 session cap is checked BEFORE each call
against the ledger's running total**, because spending is the owner's under rule 1 and a
cap checked afterwards is not a cap.

`compose.py` is the composer: production prompts are BUILT by merging the style register
with each manifest row, so no hand-written prompt can drift from the manifest, and the same
inputs always yield the same prompt, which is what makes a regeneration reproducible.

**IT REFUSES TODAY, AND THAT IS THE HONEST STATE.** `docs/art/style_register.json` does not
exist. The brief sources production prompts from "the committed Grok style register" and
the calibration seven from "Grok's verbatim prompts, committed alongside". **Neither is in
this repository.** Searched exhaustively: the only "grok" hits are a workflow file and two
session-report mentions of Grok as a tool, and "style register" matches only the phrase
"art style bible" in the v9 frame's OWNER STANDING ITEMS, which is an OPEN owner item and
not a document. This is the same class as R083's missing pivot letter, and convention (m)
governs it identically. The composer names exactly what it needs rather than inventing a
prompt, because a hand-written prompt is the drift it exists to prevent.

## TASK 2, not run, and blocked three ways

It could not run even had the register existed: **no API key is configured** on this
machine (`STABILITY_API_KEY` unset), and **spending is the owner's** under rule 1 even
inside the authorised cap. Blocked on the style register, on Grok's verbatim prompts, and
on a credential. The client's `--dry-run` exercises everything up to the call, so the
moment those three arrive the seven run without further building.

## TASK 3, both alpha routes, and a fourth red

`ingest.py` now decides the route **by measurement rather than by a flag somebody remembers
to pass**: a source carrying a real cutout takes the native route and keeps it; a render on
a chroma field takes the key route; and an RGBA source whose alpha is uniformly opaque is
an RGB image wearing four channels and correctly takes the key route.

**THE NATIVE ROUTE WAS DESTROYING THE PROVIDER'S CUTOUT, and this is the fourth real defect
these self-tests have been seen red on.** `green_key_knockout` reads RGB only. Handed an
already-transparent PNG it converted to RGB, discarded the supplied alpha, computed a fresh
matte from colour, and returned a **fully opaque** image. Measured directly: a source
71.3 percent transparent came back **0.0 percent transparent**. Dimensions correct, format
correct, silhouette generated, ledger written. Nothing downstream could have caught it. The
seeded case is real in the strict (p) sense, proven by running both paths side by side.

Ingest self-test now **17/17**, generate self-test **16/16**.

## TASK 4, already delivered, verified rather than duplicated

`frontend/scripts/machine_tell_gate.mjs` already flags the emoji planes 0x1F000 to 0x1FAFF,
U+FE0F, and the arrow, technical, enclosed-alphanumeric, geometric-shape,
miscellaneous-symbol and dingbat blocks, with a reviewed allowlist of exactly one entry. It
already carries seeded emoji and dingbat cases. It already runs three ways in CI:
`--self-test`, `--source` in the static job, and source-and-dist after a build in the
browser job, so **rendered surfaces are covered as well as shipped strings**. **A second
gate over the same class would be two sources of truth**, which is the failure this project
avoids by design.

Verified by running it rather than by reading it: self-test **16 seeded violations caught
against 12 clean negative controls**; source scan **PASS** over 79 files plus `index.html`.

**And corroborated independently, which is where it got interesting.** My own census over
`frontend/src` found **11 glyph codepoints the gate had passed**: U+2713, U+2605 three
times, U+2715 twice, U+2192 five times. Every one is inside a COMMENT recording a glyph the
2026-07-27 sweep had already removed: "Was `✓`, U+2713, absent from the Orbitron subset",
"This was `★ ★ ★`, U+2605", "The arrow was `→`, U+2192. Drawn now". The gate excludes
comments because the bundler strips them, so it was right and the census was measuring
something else. **Shipped strings are genuinely zero.** Recorded because a disagreement
between two methods is worth resolving in writing rather than assuming the gate wins.

**One provenance note, surfaced per (n):** the brief attributes the emoji rule to "platform
staff guidance captured from Discord". No such capture is in the repository. The rule needs
no rescue, because the v9 frame's section 5 already lists "generic AI-generated assets
(standard fonts, gradients, emoji icons, border effects)" among the platform's own named
causes of a low rating, sourced from a dated capture. The rule stands on that; the Discord
attribution is uncorroborated and is recorded as such.

## Verification

Document currency, locked paths and both AssetForge self-tests below, chained with `&&` per
the frame's (o). Explicit paths per (k). Remote CI verified with the FULL sha, never an
abbreviation, per R082's lesson.

## ESCALATIONS

**E1 (R084). OpenAI is BARRED on our reading; only OpenAI can lift it.** If the owner wants
gpt-image-1, the ask is written confirmation from OpenAI that generating art assets for a
real-money gambling product is permitted under the Usage Policies. Our own narrow reading
is not a substitute, and 14.1 removing the liability cap is why.

**E2 (R084). The style register and Grok's verbatim prompts do not exist**, so TASK 2 is
blocked on content as well as on credentials. Same class as R083's pivot letter.

**E3 (R084). A Stability API key and the owner's decision to spend.** The cap is coded at
USD 10 and the seven cost $0.555, but rule 1 makes the spend the owner's call and no key is
configured.

**E4 (R084). PR #126 is open and unreviewed.** It carries R083 and now R084. Review lane
needs Fable approval; it will not merge on CI alone.

R083's E1 and E2 are **retired for the hosted-API route** by TASK 0 and stay live for
self-hosted weights. R083's E3 and E4 stand, as do R082's three, R080's E1, R081's E2 and
E3, TR-148's four, R078's E1 and E2, and R079's E1 and E2.

## THE MERGE, AND AN ORDERING CONSTRAINT THE CLOSE SEQUENCE HAD NOT MET BEFORE

**PR #126 merged to main as `d8183f15`**, a merge commit per the repository's convention
(215 of them on main), carrying both R083 and R084. The remote branch
`assetforge/2026-08-22` was deleted on merge per (t.1). **The owner's instruction of
2026-08-22 discharged the review-lane approval that E4 was waiting on**, which is the only
thing that could: (t) keeps code and gates in review lane and CI green alone never merges
them.

**RETRO-VERIFIED PER RULE 10: the merge commit's OWN run is green.** Run 32513897964,
**30 jobs, 30 success**, none skipped, 18:32:46Z to 18:44:32Z. Probed with the full sha
throughout, never an abbreviation, per R082's lesson. The merged tree was also re-gated
locally before the close: document currency PASS at 272 frozen and 0 new, locked paths
PASS, ingest self-test 17/17, generate self-test 16/16.

**AND THE CLOSE HAD TO WAIT FOR THAT RUN, WHICH IS NOT OBVIOUS AND IS WORTH RECORDING.**
`checks.yml` declares `concurrency: group: checks-${{ github.ref }}` with
`cancel-in-progress: true`. A records commit pushed to `main` while the merge commit's run
is still going lands in the SAME concurrency group and **cancels it**. So posting the close
promptly after a merge does not merely race the verification, it destroys it: rule 10 would
then be verifying a cancelled run, or nothing at all. The close sequence for a MERGE is
therefore ordered merge, wait for the merge run to finish, then close, and that ordering is
the opposite of the instinct to record promptly.

The wait was estimated from measurement rather than guessed: the three preceding
full-matrix runs took 11m49s, 11m52s and 12m16s, so the remainder was called at five to six
minutes against a six-minute elapsed. It finished at 11m46s.

## TASK 2, THE HONEST CARRY

Not completed, and it could not be. All three blockers were re-verified first-hand at the
merged HEAD rather than carried forward from earlier in the session:

| Blocker | State at `d8183f15` |
|---|---|
| The style register, expected at docs/art/style_register.json | **ABSENT** |
| Grok's verbatim prompts for the calibration seven | **ABSENT**, no tracked artefact |
| `STABILITY_API_KEY` | **NOT SET** |

The client demonstrates it end to end rather than asserting it: `generate.py --id SY-01
--dry-run` refuses at the composer and reports `0 of 1 produced, session spend USD 0.000 of
cap 10.00`. **Two of the three are content the owner or Fable supplies, and the third is a
credential plus a spending decision that rule 1 reserves to the owner.** Nothing here is a
builder's to unblock, which is why it carries rather than waits.

## FOR THE NEXT SESSION

Three things unblock TASK 2 and none is a builder's: **the style register plus Grok's
verbatim prompts committed**, **a Stability API key**, and **the owner's word on spending**
the $0.555. With those the seven run unattended and land a provider-labelled contact sheet
for the eye-call.

Nothing else is queued. The mechanic decision remains open and still gates the books
regeneration.

Model and effort: Opus, judgement tier, one session, review lane on `assetforge/2026-08-22`,
code plus records.
