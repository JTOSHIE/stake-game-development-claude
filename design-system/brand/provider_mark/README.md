# Provider mark candidates (TR-031)

The provider logo is a one-time square upload in Team Settings Branding and is seen small.
Round one called the shipped mark "nearly unreadable" at 48px; round two reviewer 3 filed
the same thing as the provider half of its eighth finding. This directory holds every
candidate produced since, with its provenance, so the eye-call is made on evidence.

## Status

| Candidate | Origin | Status |
|---|---|---|
| `a-master` | derived from the hero emblem | **SUPERSEDED, non-preferred** |
| `b-core-crop` | derived from the hero emblem | **SUPERSEDED, non-preferred** |
| `c-core-bold` | derived from the hero emblem | **SUPERSEDED, non-preferred** |
| `d-purpose-drawn` | drawn in-house to Fable's spec | **SUPERSEDED, non-preferred** |
| **`e-owner-supplied`** | **externally commissioned, owner-supplied** | **DELIVERED, awaiting the owner eye-call** |

Superseded per convention (h): the files are **kept, not deleted**, and they remain in the
48px comparison sheet. A comparison that quietly drops the options it has moved past stops
being a comparison, and a future reader should be able to check that the retirement was
earned rather than asserted.

**Nothing here is adopted.** `design-system/brand/delivery/WeRollSpinners-Logo.png` is
unchanged and still carries candidate d. On the owner's one-line confirmation the delivery
file is regenerated from the chosen candidate and TR-031 closes.

## Provenance records

| File | Covers |
|---|---|
| `PROVENANCE.md` | a, b, c: the three derivations from the committed hero-emblem master |
| `PROVENANCE_d.md` | d: the in-house purpose-drawn vector mark, with its spec assertions |
| `PROVENANCE_e.md` | e: the owner-supplied mark, with its source hash and measurements |

## Evidence

| Artefact | What it shows |
|---|---|
| `reports/screens/provider-mark/48px-legibility-comparison.png` | all six exports at 8x with smoothing OFF, and the true 48px beside each |
| `reports/screens/provider-mark/candidate-e-true-size.png` | candidate e at ACTUAL 512, 96 and 48, no upscaling, both forms |

## The two open questions on candidate e

Both are the owner's to answer, and both are recorded rather than decided.

**1. Field or transparent.** The supplied file has no alpha channel and a dark field with
rounded corners; the radii are the evidence that the field is part of the design. The
platform states the provider logo wants "a transparent background"
(`docs/stake-engine-live/game-tile-requirements.md:36`). Both forms are exported. If the
rounded tile is the intended mark, the format requirement is worth raising with the
platform, because a submission asset that misses a stated format rule is a portal-upload
risk however good it looks.

**2. The text ring at 48px.** Measured on the supplied file, not assumed: the wordmark is
**0.81 px per stroke at 48px**, below one whole pixel, so it resolves as a texture rather
than as words. That is the same structural finding TR-031 recorded against the original
master, and it is why candidate d dropped its text ring. It is not an argument against e:
e's ring, reel windows and 7s are large and read cleanly at 48, which is more than any
earlier candidate managed. The owner may reasonably want the wordmark present at 512 and
accept it going to texture at 48. The true-size strip exists so that call is made on real
pixels.
