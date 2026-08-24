# Session Report - R099 OPENAI GATE UNBLOCK: the mark is CLEARED for artwork, the self-test that broke was asserting on data, and a generation call still needs a price (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R099_OPENAI_GATE_UNBLOCK_Prompt.md`. Branch:
`claude/r099-openai-gate-unblock`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero game rasters staged or committed, no placeholder touched, no kit, `output/` read only. The
27 working-tree placeholders are byte-for-byte unchanged.**

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R098 merged as `49afc8c4` |
| `docs/legal/openai-ticket-456254-ruling.md` | Exists, contains "456254" four times |
| OpenAI mark before this session | **BARRED** |
| Placeholders present | 27 rasters plus the R091 provenance record |

## TASK 1: the primary source is NOT present, stated plainly

Searched the repository, `~/Desktop` and `~/Downloads` for any capture of Ticket 456254. **The
only matches are the three R098 records this project wrote itself**: the brief, the ruling
transcription and the dated archive. **No support email, no ticket export, no PDF, no HTML
capture exists anywhere in the workspace.**

Per the brief's own fallback, this session therefore proceeded on the already-committed
transcription at `docs/legal/openai-ticket-456254-ruling.md` as the controlling project record,
and the gate now cites that file as its first evidence line.

**R098's recommendation stands and is now more pointed, because a machine gate depends on it.**
The mark that permits generation for a real-money product currently rests on a transcription
rather than a captured document. Capturing the correspondence and archiving it beside the
2026-08-22 captures remains the right next step.

## TASK 2: the gate is updated, and the clearance is scoped

`scripts/assets/assetforge/provider_gate.json`:

- **`openai.mark`: `BARRED` to `CLEARED`.**
- **`openai.reason`** rewritten to state that the clearance is for development-stage artwork
  generation ONLY, cites Ticket 456254 and its receipt date, records that the permission is
  stated to be subject to the current Usage Policies and Terms of Use, and points at the ruling
  file.
- **New `openai.scope` block**, so the conditions are machine-readable rather than prose only:
  `permitted` (development-stage visual art assets only), `prohibited` (operating gambling,
  accepting or processing wagers, processing payments, interacting with players), `subject_to`,
  `ticket`, `ruling_record`, and a `note` reading "Do not broaden this clearance beyond the
  ticket."
- **New `openai.superseded_assessment` block** preserving the R084 BARRED mark and its full
  four-link contractual reasoning. **Kept rather than deleted: the record of what was believed,
  and why, is evidence.** It also turned out to be load-bearing, see TASK 3.
- **`openai.evidence`** now leads with the ruling file and retains both 2026-08-22 captures.
- **Top-level `_comment`** amended to record what changed, when, on whose instruction, and that
  the clearance is scoped. **The original sentence about a Fable ruling is retained, not removed.**
- **`amended: 2026-08-24`** added beside the untouched `assessed: 2026-08-22`.

`scripts/assets/assetforge/README.md`: its mark table stated OpenAI as BARRED and became false
the moment the gate changed, so the row now records the scoped clearance, the ticket, the
prohibited uses and the prior mark.

**The clearance was not broadened.** Nothing in the gate now permits any use beyond
development-stage artwork.

## TASK 3: the unblock is verified, and one block remains

### Before and after

| provider | before | after |
|---|---|---|
| `openai` | **BARRED** | **CLEARED** |
| `stability` | CLEARED | CLEARED, untouched |

### The normal gate check

`require_cleared` run against the **live** gate file:

- `openai` **passes**, mark `CLEARED`.
- `stability` passes, unchanged.
- `midjourney` still refused with "never been assessed", so the control holds and the gate did
  not become permissive in general.

`scope.ticket` reads `456254`, and the permitted and prohibited lists read back correctly.

### The self-test broke, and why that matters more than the fix

`scripts/assets/assetforge/generate_selftest.py`'s first seeded case read the **live** `openai`
mark and asserted the refusal fired. Changing the mark broke it immediately: **15 of 16, one
FAIL, "openai passed the gate"**.

**The code path was never broken. The case was asserting on DATA rather than on the CODE PATH**,
and a provider's mark is a fact that can legitimately change. A self-test that fails when the
data legitimately changes is testing the data.

**The fix keeps convention (p) intact rather than weakening it.** The case now **seeds a BARRED
entry itself, constructed from the real R084 assessment the gate still preserves under
`superseded_assessment`**. So the planted defect is the genuine historical one, in its genuine
wording, exercising the same code path and the same error string, and it is no longer hostage to
which provider happens to be barred today. A second case was added asserting the new scoped
clearance, so the unblock itself is covered rather than assumed.

**Result: 17 of 17 pass. Every seeded refusal still fires.**

### The honest limit: the licence block is gone, the pricing block is not

Measured rather than assumed. With the mark `CLEARED`, `require_cleared` passes and the next gate
in the chain refuses:

```
cost_of gpt-image-1 -> 'gpt-image-1' has no committed credit price in provider_gate.json
```

The OpenAI entry carries no `credit_usd` and no per-model `credits`, because R084 never priced a
provider it had barred. **No price was invented.** A committed price is a factual claim about
OpenAI's billing, and it needs a captured source, which is precisely the discipline that gate line
exists to enforce.

**So the accurate statement is: the LICENCE gate no longer refuses OpenAI, and a generation call
is one captured-pricing task away from running.** Saying "generation is unblocked" without that
qualifier would be wrong.

## TASK 4: records

Comms entry 097. This report and its dated archive. Brief committed verbatim.

## Verification

Self-test 17/17. Doc currency PASS. Locked paths PASS. Zero rasters staged. Close gates chained
with `&&` per (u.1). Explicit paths per (k). Remote CI verified with the full SHA per rule 10.

## ESCALATIONS

**E1 (R099). The gate's own comment asks for a Fable ruling and this session changed the mark on
the owner's brief. Surfaced rather than quietly resolved, per convention (n).** `provider_gate.json`
reads "Changing a mark here without a Fable ruling is the violation." The owner's brief names
exactly this change and is the later and better-informed instrument, so (n) says the sanction
governs; (n) equally says the tension must be surfaced and ruled on rather than silently decided.
**If Fable wants the mark ratified separately, it is one field and fully reversible.**

**E2 (R099). The mark now rests on a transcription, not a captured document.** Archive the Ticket
456254 correspondence beside the 2026-08-22 captures. This was a recommendation at R098; it is a
stronger one now that a machine gate depends on it.

**E3 (R099). A generation call still refuses for want of a committed credit price.** Supplying it
needs OpenAI's published pricing captured as evidence, in the same shape as the Stability capture
at `docs/licences/stability/2026-08-22/stability-api-pricing.txt`, plus `credit_usd` and a
`credits` figure for `gpt-image-1`. Until then the pipeline cannot bill or spend against OpenAI,
which is a safe failure rather than a dangerous one.

**E4 (R099). The style register is still absent**, so the composer refuses independently of any
provider gate: `docs/art/style_register.json` does not exist and `load_style_register` refuses.
That is a separate blocker on generation and was not in this brief's scope. It is the R088 pack
item recorded since R085-R.

R098's E1 is CLOSED by this session, the gate and the record no longer disagree. R098's E2
survives as E2 above. R097's ledger stands otherwise.

## FOR THE NEXT SESSION

**The 27 placeholders are untouched.** Restore command unchanged, recorded in full in
`reports/archive/2026-08-24_r097-arc2-placeholder-audit.md`. Kit packaging stays forbidden while
any placeholder differs from HEAD, and `npm run assets` remains the second hazard per R097's E1.

**To actually generate with OpenAI, three things are needed and none is large:** the captured
pricing plus `credit_usd` and `credits` (E3), the style register (E4), and ideally the archived
correspondence (E2). The licence question itself is now settled in the gate.

Model and effort: one session, unattended, review lane, high care. Four files changed, minimal
diff, no raster and no placeholder touched.
