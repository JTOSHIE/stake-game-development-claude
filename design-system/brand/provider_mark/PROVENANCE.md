# Provider mark candidates, provenance (TR-031)

> **SUPERSEDED 2026-07-26, non-preferred (convention (h)).** Candidates a, b and c are
> derivations from the hero-emblem master and are kept, not deleted: they stay in the
> 48px comparison sheet so the owner can see what the later candidates are better
> than. See `README.md` in this directory for current status. The mark awaiting the
> owner eye-call is **e**, the owner-supplied one.

- derived: 2026-07-25 by `frontend/scripts/provider_mark_derive.mjs`
- source: `design-system/brand/hero_emblem/master_1024.png` (unmodified)
- deterministic canvas operations only, no hand editing; re-running reproduces identical output

## Candidates

| Name | Centre crop | Contrast | Saturate | Brightness | Intent |
|---|---|---|---|---|---|
| a-master | 100% | 1.0 | 1.0 | 1.0 | control: the current mark, rescaled only |
| b-core-crop | 68% | 1.35 | 1.25 | 1.08 | drops the arched text ring, keeps wheel and reels |
| c-core-bold | 62% | 1.70 | 1.45 | 1.15 | same crop pushed harder for busy or light backgrounds |

## Why cropping rather than sharpening

The master carries arched WE ROLL / SPINNERS text around the wheel. At 48px that text is
about two pixels per stroke, so it cannot resolve at any contrast. Candidates b and c drop
it and keep the elements that survive. That is a design proposal, not a technical fix, and
the eye-call is the owner's.

## Not adopted

No candidate is adopted in this pass.
