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
| `e-owner-supplied` | externally commissioned, owner-supplied | **SUPERSEDED, non-preferred** |
| **`f-owner-transparent`** | **externally commissioned, owner-supplied, second of three** | **ADOPTED 2026-07-26, re-confirmed by derivation the same day** |
| `g-owner-pack` | externally commissioned, owner-supplied, third of three, a 25-file variant pack | **SUPERSEDED for the portal mark 2026-07-26. ADOPTED as the studio brand set for non-portal use.** |

Superseded per convention (h): the files are **kept, not deleted**, and they remain in the
comparison sheets. A comparison that quietly drops the options it has moved past stops
being a comparison, and a future reader should be able to check that the retirement was
earned rather than asserted.

## The f-versus-g decision was DERIVED, not asked

Candidate g arrived on 2026-07-26 as a full variant pack and had to be tested against the
adopted mark rather than filed beside it. The test was run to a rule set in advance, in
`frontend/scripts/provider_logo_derivation.mjs`: the delivery goes to whichever candidate
is measurably more legible at the smallest size the platform renders. Full working in
`PROVIDER_LOGO_DERIVATION.md`.

**Candidate f won 3 of 3 measures at 32px**, and by wide margins: 1.62x the internal detail
(mean absolute Laplacian), 1.90x the global contrast, and 2.31x less ink sitting below a
1.5:1 contrast ratio against the real portal surface. The eye agrees with the arithmetic:
in `reports/screens/provider-mark/f-vs-g-rendered-sizes.png`, f still reads as a ring
carrying three 7s at 32px while g has become an indistinct disc.

**Why g loses is structural, and it is the same finding candidate e carried.** g is a
detailed wheel inside an arched `WE ROLL SPINNERS` text ring. That text is the whole
problem at small size: it is below one pixel per stroke long before 32px and resolves as
texture, and the detail it wraps averages toward a single mid tone. It is also
continuous-tone artwork, 546,589 distinct opaque colours against f's three, so a downscale
has a great deal to average away. None of that is a criticism of the artwork at full size,
where it is the strongest mark the project has been given.

**The decision was a real test and it could have gone the other way.** It did not change
the delivered file: `WeRollSpinners-Logo.png` is byte-identical to what it already held.
Recorded because a test that only ever confirms is worth less than one that could have
overturned, and this one is on the record either way.

## Candidate g IS the studio brand set, for everything that is not the portal mark

Losing the portal slot is not a retirement. The pack is the right set for every use where
the mark is not being squeezed into a small square, and it ships purpose-made files for
exactly those uses. It is kept in whole at `pack_g/`, all 25 files, hash-verified against
the delivery in `PROVENANCE_g.md`.

Per the pack's own README:

| Use | File |
|---|---|
| Favicon | `we_roll_spinners_favicon.ico` (carries 32, 64, 128) |
| Website, social | `we_roll_spinners_1254x1254_transparent.png`, or the WebP variants |
| Letterhead, email signature | transparent PNG, or `we_roll_spinners_logo.pdf` |
| Print, business cards | `we_roll_spinners_logo.pdf`, converted to CMYK in design software |
| Applications without alpha | the `_whitebg` and `_blackbg` JPGs |

## Adopted for the portal: candidate f

`design-system/brand/delivery/WeRollSpinners-Logo.png` is candidate **f**, adopted
2026-07-26 on the owner's instruction "Go with F", delivered at its **native 1024**
resolution so the submitted asset has been through no resampling at all.

**A contradiction in the adopting brief, recorded rather than resolved silently.** That
brief opens with "Go with F" and then names `provider_mark_e-owner-supplied-transparent`
in its JOB 1 body. Those cannot both be followed. "Go with F" was taken as the decision:
it is unambiguous, it stands alone at the top, and it directly answers the question the
previous session asked. The JOB 1 filename reads as carried over from when e-transparent
was the leading candidate. **Reversing this is one path in
`frontend/scripts/tile_delivery_build.mjs` and a re-run.**

TR-031 is MERGED. What remains is not a code or asset task: the provider logo is a
one-time square upload in Team Settings Branding, and that is the owner's to do.

## Provenance records

| File | Covers |
|---|---|
| `PROVENANCE.md` | a, b, c: the three derivations from the committed hero-emblem master |
| `PROVENANCE_d.md` | d: the in-house purpose-drawn vector mark, with its spec assertions |
| `PROVENANCE_e.md` | e: the first owner-supplied mark, with its source hash and measurements |
| `PROVENANCE_f.md` | f: the second owner-supplied mark, transparent, with its measurements |
| `PROVENANCE_g.md` | g: the owner-supplied variant pack, all 25 files hashed, with its measurements |
| `PROVIDER_LOGO_DERIVATION.md` | the f-versus-g derivation: the rendered-size anchors, the measures, the verdict |

## Evidence

| Artefact | What it shows |
|---|---|
| `reports/screens/provider-mark/48px-legibility-comparison.png` | all six exports at 8x with smoothing OFF, and the true 48px beside each |
| `reports/screens/provider-mark/candidates-true-size.png` | e and f at ACTUAL 512, 96 and 48, no upscaling |
| `reports/screens/provider-mark/candidate-f-on-surfaces.png` | every candidate at true size over light, mid, dark and portal surfaces |
| `reports/screens/provider-mark/f-vs-g-rendered-sizes.png` | f and g at true 128, 96, 64, 48 and 32, drawn 1:1 with smoothing off, over the measured portal surface |

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
