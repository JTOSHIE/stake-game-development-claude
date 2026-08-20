# Session Report - R075 THE TOOLTIP AND THE GATE (2026-08-20)

Brief saved verbatim: `reports/briefs/FS_FABLE_R075_TOOLTIP_GATE_Prompt.md`, the sole
live brief, both items from the R074 final audit. Branch: `main`, as integrator, per
multi-track rule 1. Locked paths untouched; `locked_paths_gate.mjs` PASS. The close
crossed local midnight; the records carry the brief's date.

## Summary

Both tasks landed whole. **G2 is CLOSED** (TR-173): the four speed tooltips route
through the localised source their aria-labels already used, and the hardcode gate can
now see the class that hid them. **G4 is CLOSED** (TR-174): popout_conformance asserts
the 44 its label always claimed, and it is GREEN at the new threshold with the Continue
button measuring exactly 44 at all three viewports, so the do-not-retune branch was
never reached.

## TASK 1, the tooltip and the gate

**The fix.** All four `title` attributes on the speed control (HudOverlay's portrait,
menu, compact and fullscreen sites) now read `title={$tr('a11yCycleSpeed')}`: the same
key the adjacent aria-labels already carried, present in all sixteen locales, no new
strings, the four sites identical. The menu site, which labels itself with visible text
and carried no aria-label, takes the same title as the other three.

**The gate, and why it was blind.** The blindness had TWO causes, both now named inside
the gate: rule 2 read only STATIC double-quoted attribute values, so an interpolated
title was invisible to the attribute scan; and rule 1, which does read expression
literals, rejected 'Normal speed', 'Turbo' and 'Super Turbo' because PROSE_WORD carries
no speed vocabulary. New rule 2b scans interpolated player-facing attributes
(aria-label, title, placeholder, alt, aria-description), treating the attribute name
itself as the prose marker, with keys and comparison literals excluded exactly as rule 1
excludes them. One shape it cannot see is stated in place per the audit discipline: a
literal after a nested closing brace in the same attribute expression.

**Seeded per (p), in the form that shipped.** The self-test plants the exact pre-R075
ternary verbatim, two seeds (the label branch and the colon branch) plus negative
controls for the fix form and for comparison literals: 9 seeded, 12 negative controls,
PASS. **The red run is the decisive half**: with the HudOverlay fix stashed, the
extended gate FAILED naming all three labels ("Normal speed", "Turbo", "Super Turbo" at
HudOverlay.svelte), exit 1; with the fix restored it passes at 0 outstanding.

**Frames.** `reports/screens/r075-tooltip/` holds the hovered control in en and de with
the DOM title attribute read live and asserted equal to the localised string
(en "Cycle speed (Normal / Turbo / Super Turbo)", de "Geschwindigkeit wechseln
(Normal / Turbo / Super Turbo)"). The native tooltip bubble itself is browser chrome no
headless frame can show, so the asserted attribute is the evidence and the frame shows
the control; the README beside them says so.

## TASK 2, the popout threshold

`popout_conformance.mjs` now asserts `>= 44` where it always said "44px touch target";
the comment records the provenance (TR-169, our own Apple HIG bar, the platform naming
none) and the history (the assertion read `>= 40` from R14 until this pass). **Run at
the new threshold: PASS, three viewports, real clicks, and the measured Continue height
is exactly 44 at each.** Nothing reads under the bar, so nothing was reported for an
owner call and nothing was retuned. The existing seeded self-test (Continue forced
outside the 400x225 viewport) passed unchanged.

## Verification

Local at the code tip: hardcoded_string_gate self-test PASS (9 seeded, 12 negative
controls) and real scan PASS (0 outstanding); the red run quoted above;
popout_conformance self-test and real run PASS at 44; typecheck baseline PASS; dash and
machine-tell source scans PASS; doc_currency PASS at 272 frozen, 0 new; production
build clean. Every gate invocation chained with `&&` per (u.1); explicit paths staged
throughout.

## The remote run, recorded per rule 10

The code push `8e9fcb29` triggers the FULL browser matrix (rendering and gate code
changed). Its run was watched to completion before this close committed, and the result
is recorded in the comms entry beside this report. The close commit itself carries the
usual one-commit lag per rule 12's design.

## The owner preview, per rule 12

Refreshed before this report, line quoted as evidence:

OWNER PREVIEW  |  v10 line, main  |  commit 8e9fcb29  |  built 2026-08-21T00:38:36+10:00  |  http://192.168.4.92:5173/

Run once more as the last action of the close, after the final push. The rebuilt dist
stamp for the owner's final sync is printed in the comms entry and in the chat close,
built at the final tip.

## FOR THE NEXT SESSION

Nothing. The owner's glance, walk, and Start Approval, exactly as the R074 verdict
left it: the E1 logged-in morning pass, the fifty-one beside the Guidelines tab, and
the button on the owner's word alone. Model and effort: Fable, judgement tier, one
short session, integrator on `main` throughout.
