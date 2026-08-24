# OpenAI support ruling, Ticket 456254

**Date received:** 24 August 2026
**Ticket reference:** 456254
**Recipient:** Joshua / Synergistic Interaction Pty Ltd (We Roll Spinners)
**Provider:** OpenAI
**Subject:** ChatGPT image generation (`gpt-image-1`) for real-money slot game artwork
**Recorded:** 2026-08-24, session R098, records only

---

## 1. The confirmation

OpenAI support confirmed, under Ticket 456254:

- **ChatGPT image generation (`gpt-image-1`) may be used to create visual art assets**, including
  symbols, backgrounds and other artwork, **for incorporation into real-money slot machine games
  published on licensed gambling platforms.**
- This is **permitted as development-stage artwork.**
- The service **must not be used to operate gambling, accept or process wagers, process payments,
  or interact with players.**
- The permission is **subject to the current Usage Policies and Terms of Use.**

## 2. What this closes

**This closes the previous "comps and style-targets only" restriction on ChatGPT-generated art**,
under the conditions stated in section 1. Artwork generated with `gpt-image-1` is no longer
limited to comps or style targets and may be incorporated into the game as development-stage
artwork, provided the service is never used for the operational activities listed above.

## 3. What this record is, and what it is not

**Recorded per convention (l.7): the substance in section 1 is the transcription supplied by the
owner. It is reproduced as given and has not been paraphrased, summarised or extended.**

**THE UNDERLYING CORRESPONDENCE IS NOT IN THIS REPOSITORY.** No capture of the OpenAI support
reply for Ticket 456254 exists under `docs/licences/openai/`. This file is the owner's
transcription of that reply, not the reply itself, and a reader should treat it accordingly.

**Recommended, and not done in this session because the brief is records only:** archive the
original support correspondence alongside the existing captures, in a dated 2026-08-24 folder
under the OpenAI licence directory, in the same shape as the evidence already held for the
2026-08-22 assessment and for Google Gemini at `docs/licences/google-gemini/2026-07-15/`. That
would put the primary source in the repository beside this transcription and satisfy convention
(m) in full.

## 4. Relationship to the R084 provider gate, which is UNCHANGED by this record

`docs/licences/PROVIDER_GATE_2026-08-22.md` records OpenAI as **BARRED**, and that mark is
machine-enforced: `scripts/assets/assetforge/provider_gate.json` carries
`"openai": {"mark": "BARRED"}`, and `scripts/assets/assetforge/generate.py:63` raises
`GateRefusal` for any provider whose mark is not `CLEARED`.

**Neither the gate file nor the generator was changed in this session**, per this brief's own
instruction not to alter asset pipeline behaviour or ingest rules. **So the operational position
is unchanged: a generation call to OpenAI still refuses.** This file records the ruling; it does
not lift the machine gate.

`provider_gate.json`'s own comment states the mechanism for changing a mark:

> Changing a mark here without a Fable ruling is the violation.

**So the next step, if the owner wants the gate lifted, is a Fable ruling directing the mark
change**, in its own review-lane session, with the archived correspondence from section 3 as its
evidence.

## 5. A tension surfaced rather than decided, per convention (l.8)

Recorded because compliance findings escalate to the owner and Fable as a question with evidence,
and the builder does not rule on them.

R084's BARRED assessment did not rest on an opinion. It rested on a four-link contractual chain,
each link quoted verbatim in
`docs/licences/openai/2026-08-22/openai-services-agreement-operative-clauses.txt`: the Services
Agreement incorporates the OpenAI Policies by reference (16.1), the definitions bring the Usage
Policies inside that incorporation, clause 3.3(a) restricts use that violates them, and the Usage
Policies prohibit "real money gambling". R084 further recorded that a breach of 3.3 is carved out
of the liability cap (14.1) and indemnified (13.2).

**Section 1's confirmation is a statement from OpenAI support, and section 1 itself states that
the permission is "subject to the current Usage Policies and Terms of Use".** A support
confirmation and the terms it is subject to are different instruments. Whether the confirmation
resolves the chain R084 documented, or sits alongside it, is a legal judgement for the owner and
Fable rather than for this record.

**Nothing here argues against the ruling.** The ruling is recorded in full and at face value in
sections 1 and 2, which is what this brief asked for. This section exists so that whoever changes
the machine gate does so with both documents in view rather than only one.

## 6. Scope note

The permission in section 1 is specific to **artwork generation**. It expressly does not extend
to operating gambling, accepting or processing wagers, processing payments, or interacting with
players. Nothing in this repository uses an OpenAI service for any of those functions, and
nothing in this record authorises it.

---

## Related records

- `docs/licences/PROVIDER_GATE_2026-08-22.md`, the R084 assessment (OpenAI BARRED, Stability CLEARED)
- `scripts/assets/assetforge/provider_gate.json`, the machine-enforced marks
- `docs/licences/openai/2026-08-22/`, the captures the R084 assessment was made from
- `reports/FABLE_COMMS.md` entry 096, the comms note for this record
