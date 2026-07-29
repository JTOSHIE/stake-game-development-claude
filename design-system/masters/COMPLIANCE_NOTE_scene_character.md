# Compliance note: the scene character, against REQ-006

**Prepared 2026-07-29 so the answer exists before the question is asked.** The Session 2
compliance sweep measured the scene character at roughly 3.7 head heights and escalated it
against REQ-006 rather than ruling on it, which was correct: a measurement is not a
compliance verdict.

Australian English, no em dashes or en dashes.

## The requirement

**REQ-006**, `reports/qa/compliance_register/REGISTER.md`, sourced from
`docs/stake-engine-live/2026-07-29/approval_guidelines.md:28`:

> No child or child-like characters and no art, theme or tone that would appeal to minors.

Two tests, and they are different. **Is it a child or child-like character**, and separately,
**would the art, theme or tone appeal to minors.**

## What triggered the flag, and why the number alone is a weak signal

Head heights is a figure-drawing proportion metric: total height divided by head height.

| Heads | Conventionally reads as |
|---|---|
| 7.5 to 8 | Realistic adult |
| 6 to 7 | Teenager |
| 5 to 6 | Child, roughly 5 to 8 years old |
| about 4 | Toddler |
| 2 to 4 | Chibi or cartoon mascot |

At **about 3.7**, the character sits in the chibi and mascot band, **which overlaps the
toddler band.** That overlap is the entire basis of the flag, and it is why an automated
sweep raised it.

**The metric cannot distinguish a stylised non-human mascot from an infant**, because both
have a large head relative to the body. Everything that actually separates them is in the
art rather than the ratio.

## The assessment

Asset: `frontend/screens/scene_character_render.png`, 680 by 1344, from the vector master
`frontend/scripts/scene/scene_character.svg`.

**Test one, is it a child or child-like character: NO.**

- **It is a machine, not a person.** Segmented armour plating, exposed mechanical joints at
  shoulder and hip, a rigid torso panel, an antenna.
- **It has no face.** A reflective visor occupies the head, with no eyes, nose or mouth.
  This is decisive. The baby schema that makes a figure read as infantile is driven
  primarily by large eyes in a rounded face, and there are no eyes at all.
- **No infantile body cues.** The limbs are thin, straight and angular. There is none of
  the chubbiness, tapering or soft curvature that reads as a small child.

**Test two, would the art, theme or tone appeal to minors: LOW RISK.**

- **Palette is near black with magenta and cyan neon.** Adult cyberpunk, not the bright
  primaries used in art aimed at children.
- **Posture is arms folded, weight on one leg.** Adult, self assured, not playful.
- **The lineage a viewer will read is Daft Punk, mecha and the visored-robot tradition**,
  not children's animation. The owner's own description on sighting it, 2026-07-29, was
  "nothing like a child, it is like an alien figure, very Daft Punk".
- **The characteristics reviewers actually look for are absent**: no cartoon animals, no
  sweets or confectionery motifs, no superhero styling, no resemblance to a children's
  media property, no large expressive eyes.

## Disposition

**Assessed as compliant with REQ-006. The art is unchanged, deliberately.**

Changing the proportions to satisfy a metric would be optimising for the instrument rather
than the requirement, and would cost the character its design language for no compliance
gain.

**What this note is for.** REQ-006 is a judgement requirement, so a reviewer may reasonably
query a mascot at 3.7 head heights. The purpose here is that the response is a prepared
paragraph with the reasoning and the render attached, rather than an argument improvised on
the day. **A defensible position that has been written down is worth more than the same
position held informally.**

**Escalation path if queried:** this note plus the render go to the owner and Fable. The
builder does not rule on compliance readings, per convention (l.8).
