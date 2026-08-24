
# Session Report - R100 STYLE REGISTER: the composer runs, and OpenAI still cannot be called because there is no OpenAI client (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R100_STYLE_REGISTER_Prompt.md`. Branch:
`claude/r100-style-register`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero game rasters staged or committed, no placeholder touched, no kit, the incoming art
directory read only. The 27 working-tree placeholders are byte-for-byte unchanged**,
verified by sha256 fingerprint before and after (aggregate `33b3530734`).

## Preconditions: all four met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R099 merged as `05cfd12d` |
| OpenAI mark is CLEARED | Yes, scoped, `scope.ticket` reads 456254 |
| Style register currently absent | Confirmed absent before the session |
| Ticket 456254 ruling exists | `docs/legal/openai-ticket-456254-ruling.md`, present |

## TASK 1: the style register, derived rather than authored

**New file: `docs/art/style_register.json`.** The schema was DERIVED from the consumer
before a word of content was written: `load_style_register` requires `base` and `negative`,
names `per_role` and `camera` as optional, and `compose()` consumes `base` and `negative` as
STRINGS, joining them with `". "` and concatenating the negative, so neither may be a nested
object. Four keys are operative; every other key is documentation the code ignores.

**Nothing was invented.** Discovery ran as five read-only lenses over the committed records,
the arc-2 batch prompt records and the adjudication history, returning 257 cited clauses.
The load-bearing claims were then re-verified first-hand rather than taken on the agents'
word, which is how the primary source was found.

**THE PRIMARY SOURCE IS `design-system/DESIGN_SYSTEM.md`, and a lens found it after I had
already drafted against weaker evidence.** Its SYSTEM LAWS and its July 2026 owner-ratified
addendum supply, as committed law: the material language and its exact hexes, "Key light
upper left.", "Front facing, always. No perspective angles on symbols or UI objects.",
silhouette-first differentiation, the 120x100 legibility floor, the text-free law with its
single named exception, the per-symbol signature colours, the tile-plate spec, and the
pay-tier richness law giving the elaboration order as Gauge and Wild and Scatter above all,
then H, then M, then L. **That last one is exactly the hierarchy the brief asked for, and it
was already owner-ratified.** The lens also corrected me on the text exception: it is the
machined W emblem inside the Wild, not the logo I had guessed.

**Where committed law and practice differ, both are recorded and the difference is named.**
"Key light upper left." is law. "Cool cyan fill" and "magenta rim" are NOT in any committed
document: they come from the batch prompt records, where the upper-left key appears in 14 of
16 batches literally and 15 of 16 in force, and cool cyan fill in 14 of 16. The register
carries them, because the approved masters were made under them and the brief names them,
and flags them so nobody later mistakes practice for law.

**One clause carries an explicit correction rather than a silent repeat.** The rule that the
tile plate stays subordinate to the symbols is recorded with its true provenance, the batch
prompt records, and states that R097 retracted the R092 claim that the manifest said it. The
rule is practice; the misattribution is named so it is not made a third time.

## TASK 2: the access note, and the price that was not invented

`scripts/assets/assetforge/provider_gate.json` gains an `access` block on the OpenAI entry
recording the owner's confirmed Codex / API coverage, marked OWNER-STATED, with an explicit
`what_this_does_NOT_do` field: **it does not satisfy `cost_of()`**, which needs a `credits`
figure and a `credit_usd` rate, and neither was supplied because a committed price is a
factual claim about OpenAI's billing that needs a captured source. Two resolution routes are
recorded and both are the owner's call, because the second one changes how the session spend
cap works and spending is the owner's under rule 1.

## TASK 3: the path verified, and the blocker nobody had recorded

### What the register unblocked

| Check | Result |
|---|---|
| Register loads | PASS, 21 keys, `base` and `negative` both strings |
| Composer over the 30 REPLACE rows | **29 compose cleanly**, 1 raises |
| Stability dry run, end to end | **1 of 1 produced** |
| OpenAI mark | still CLEARED, scope intact |
| Placeholders | 27 of 27 byte-for-byte identical |

**The style register was a real blocker and it is gone.** The proof is the Stability run:
the same command that could not build a prompt this morning now produces one and reaches the
spend check.

### THE FINDING: there is no OpenAI client, and the call would have gone to Stability

`generate.py` implements exactly one transport, `stability_generate`, and `generate_one`
called it **with no branch on provider**. A repository-wide search for `api.openai.com`,
`images/generations` and `gpt-image` returns zero hits in any source file. The module has
one commit, `d4378f21` from R084, written when OpenAI was BARRED, so a Stability-only client
was correct then and became a hazard the moment R099 cleared a second provider.

**Proven offline, with the transport replaced before anything ran and the synthetic price
held only in memory:** a priced OpenAI call resolved to endpoint
`https://api.stability.ai/v2beta/stable-image/generate/sd3`, model `gpt-image-1`, carrying
`OPENAI_API_KEY`. The gate file was confirmed unchanged afterwards.

**I ADDED A GUARD, AND IT IS THE ONE ITEM BEYOND THE BRIEF'S LITERAL FILE LIST.** `CLIENTS`
maps provider to client; `require_client()` refuses anything absent from it, before the
spend check, so the refusal names the deeper blocker. **The reasoning, stated so it can be
overruled:** this session and R099 together tell the owner the path is complete, so the
obvious next action is `--provider openai`, and that action would have sent a credential to
a third party. That is not a near miss, and a README note is not a control. It is one
function and one dict and strips cleanly if Fable considers it out of scope.

### The self-test broke again, one session after the identical lesson

Its "absent style register refused" case called `load_style_register()` with no argument,
reading the LIVE repository. Creating the register broke it immediately: **16 of 17.**

**The code path was never wrong. The case was asserting on DATA rather than on the CODE
PATH**, which is verbatim the R099 finding. The fix is the same shape: the case now names a
path inside the repository that is never created and seeds the absence itself. It must stay
under the repository root, because the refusal message renders the path with
`relative_to(REPO)` and would raise on anything outside, which is a detail the obvious
temp-directory fix would have hit.

Three cases added: a register that exists but lost a required key, seeded as the hand-edited
file that is its realistic form and exercising a branch never previously reached; the live
register composing a real prompt, so a future deletion goes red here; and the client guard,
seeded with a SYNTHETIC cleared-but-unimplemented provider so that implementing an OpenAI
client later does not break the case. **21 of 21.**

### Two defects found in passing, reported and not fixed

**SC-03 crashes the composer.** Its `target_dimensions` cell reads `800x640 source` and
`compose()` parses that field with `int()`, so it raises `ValueError`, which neither
`compose.main()` nor `generate.main()` catches: it surfaces as an unhandled traceback rather
than a clean refusal, in a module whose whole design is refusing cleanly. Not fixed here
because the remedy is a manifest correction and the true target is an owner question: the
arc-2 handover says frame-2 should be authored at the true 640x468 aspect.

**7 of 30 rows get their manifest note cut mid-token.** `notes.split('.')[0]` splits on the
first period, which lands inside `plates.json`, `GameGrid.svelte:121`, `0.800`,
`H2_master_v31.svg` and `.col-focus`. SY-01's live prompt contains the fragment
"manifest note: Plate signature colour #ff00ff (plates". Affected: SY-01, SY-03, SY-04,
SY-13, SC-03, UI-01, FX-08. **The first count I took was 13 and it was wrong**: the detector
flagged sentence-final periods too. It was rebuilt with a self-check against a case it must
catch and two it must not, and the honest number is 7.

## TASK 4: records

Comms entry 098. This report and its dated archive. Brief committed verbatim.

## Verification

Generate self-test 21/21. Ingest self-test 17/17, unchanged, as a control. Doc currency
PASS with 0 new claims. Locked paths PASS. Gates chained with `&&` per (u.1), each exit code
the direct left operand. Explicit paths per (k). Zero rasters staged.

**The doc currency gate went red once, correctly, and the reason is worth keeping:** the
README's new backticked `docs/art/style_register.json` was a DEAD_PATH because the gate
resolves existence with `git ls-files`, and the register was not yet staged. Staging it
cleared the gate with no change to either document. This is the fifth encounter with that
class in this arc, and the first where the fix was staging rather than de-backticking.

## ESCALATIONS

**E1 (R100). There is no OpenAI client, and this is now the FIRST blocker, ahead of
pricing.** Implementing one is a bounded code change: an endpoint, a request shape, a
response decode and a self-test. It is not a gate edit and no licence change affects it.

**E2 (R100). The client guard is beyond the brief's literal file list and is flagged for
ratification.** Added because the alternative was leaving a path that sends the owner's
OpenAI key to Stability, in the same session that tells the owner the path is complete.

**E3 (R100). M3 is three different things in three places.** `design-system/DESIGN_SYSTEM.md`
says Plasma Booster; the manifest's SY-09 role says Holographic Dash Readout, corrected at
R086 and owner-ratified; FX-01's role still says the M3 booster flame. Because `compose()`
puts the role straight into the prompt, FX-01 would generate the wrong subject. Two one-line
corrections, both owner or Fable calls.

**E4 (R100). The composer has no per-row negative, and UI-05 needs one.** The global
negative forbids wordmarks and readable text, correct for 29 rows and wrong for the one row
that IS the FUTURE SPINNER wordmark. Left strict rather than weakened for all 30.

**E5 (R100). SC-03 crashes rather than refuses**, and **E6 (R100), 7 of 30 manifest notes
are truncated mid-token.** Both above, both non-blocking.

**E7 (R100). Background subject matter has drifted.** The manifest's SC-01 role is a
rain-soaked neon megacity skyline; later batch records ban rain, city streets and readable
signage and moved to a workshop interior. The role reaches the prompt directly, so whichever
is intended should be settled in the manifest.

**Carried forward:** R099's E2 (the Ticket 456254 primary source is still a transcription,
not a captured document) and E3 (the missing credit price) both stand. R099's E4, the absent
style register, is **CLOSED by this session**. R097's ledger otherwise stands.

## FOR THE NEXT SESSION

**The 27 placeholders are untouched and the restore command is unchanged**, recorded in full
in `reports/archive/2026-08-24_r097-arc2-placeholder-audit.md`. Kit packaging stays forbidden
while any placeholder differs from HEAD, and `npm run assets` remains the second hazard: it
would silently revert 16 of the 27.

**To generate with OpenAI, in order:** implement the client (E1), then commit a captured
price or rule on the covered-plan exemption (R099 E3). To generate with **Stability**,
nothing is missing but the key in the environment: that path is open today.

Model and effort: one session, unattended, review lane, high care. Five read-only discovery
lenses, 257 cited clauses, load-bearing claims re-verified first-hand. Eight files changed,
no raster and no placeholder touched.
