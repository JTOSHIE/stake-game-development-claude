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
| `e-owner-supplied` | externally commissioned, owner-supplied | **DELIVERED, awaiting the owner eye-call** |
| **`f-owner-transparent`** | **externally commissioned, owner-supplied, second of two** | **DELIVERED, awaiting the owner eye-call** |

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
| `PROVENANCE_e.md` | e: the first owner-supplied mark, with its source hash and measurements |
| `PROVENANCE_f.md` | f: the second owner-supplied mark, transparent, with its measurements |

## Evidence

| Artefact | What it shows |
|---|---|
| `reports/screens/provider-mark/48px-legibility-comparison.png` | all six exports at 8x with smoothing OFF, and the true 48px beside each |
| `reports/screens/provider-mark/candidates-true-size.png` | e and f at ACTUAL 512, 96 and 48, no upscaling |
| `reports/screens/provider-mark/candidate-f-on-surfaces.png` | every candidate at true size over light, mid, dark and portal surfaces |

## Candidate f closes both of candidate e's open questions

The second file the owner supplied answers, by its own construction rather than by anything
we did to it, the two things that were holding e up:

1. **It has a real alpha channel.** The platform's "transparent background" requirement is
   met by the supplied file; e had no alpha at all and we had to key its field out.
2. **It has no wordmark**, so e's 0.81 px per stroke problem does not exist here.

It also uses **exactly three colours**: `#00FFFF` and `#FF00FF`, the brand emissives
verbatim, plus `#0A0A14` as a structural near-black. At 48px it is the most legible of
every candidate produced so far: the 777 reads as three digits rather than as a texture.

**Two things to look at before adopting it**, both recorded rather than corrected, because
correcting either would mean redrawing the owner's art inside an ingest:

- The structural near-black is **opaque, not transparent**, and it draws the window frames
  and the ring gap. On a dark surface it sits at very low contrast against the background.
  `candidate-f-on-surfaces.png` renders it over light, mid, dark and portal surfaces at true
  size so this is looked at rather than argued about.
- The alpha is **hard-edged: zero partially transparent pixels** in the whole file, so the
  source carries no antialiasing on its silhouette. Harmless at 1024, and the exports are
  downscaled with high-quality smoothing so the resample supplies the softening. The outer
  silhouette also deviates 5.1% from a true circle, visible as slight flattening beside the
  reel strip at 512 and invisible at 48.

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
