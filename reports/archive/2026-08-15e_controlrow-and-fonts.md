# Control row geometry and font specimen, 2026-08-15e

Archive copy of the section in `reports/SESSION_REPORT.md`, per convention (a).
Nothing is edited between the two.

---

# Session Report - CONTROL ROW GEOMETRY AND FONT SPECIMEN (2026-08-15e)

Brief saved verbatim at
`reports/briefs/FS_CONTROL_ROW_FONTS_2026-08-15_Prompt.md`. Branch
`controlrow/2026-08-15`, cut fresh off `main` at `90f21280` as ordered, worked in
a worktree because the primary checkout is on the PR #123 branch (rule 11).
Australian English, no em dashes or en dashes. Explicit-path commits. Locked paths
untouched.

## JOB A1: measured, and the 711 resolved

Every element of the bottom control row measured from the DOM at three profiles,
tables at `reports/screens/controlrow-2026-08-15/MEASUREMENTS.md` with before and
after frames beside them.

**The REPORTED figures from the previous pass all re-derive exactly**: slab centre
+24.50 from the canvas centre, turbo to slab 0.00, slab to spin 7.00.

**The 711 against 688 discrepancy is a stale COMMENT, not a stale geometry.** The
inline comment above `.fs-panel` described the pre-2026-07-25 panel, `x 296..984
(688 wide)`. OWNER AUDIT ROUND 3 item 7 shifted the row right and re-measured the
banner to 309 and 711 wide, and `docs/HUD_SPEC.md` records exactly that. The CSS
and the locked spec agreed at 711 all along; only the comment beside them did not.
Corrected in place with the supersession named. **One thing worth keeping from the
old numbers**: 296..984 centres on 640, so the pre-audit panel WAS canvas-centred,
and the +49px row shift is what took that away.

**Portrait was measured and reported without a gap list, deliberately.** It is not
one row: the balance and win plates sit at centre-Y 373.75, the bet plate and
steppers at 445.00, the turbo, spin and autoplay at 522.00, and the turbo and spin
are CHILDREN of the slab rather than neighbours of it. Its slab measures dead
centre, 160.00 against 160.00.

## JOB A2: one token, and one requirement that is arithmetically impossible

**The token is `--fs-row-gap: 16px`, and its value was taken rather than chosen.**
**Seven of the row's eight control-to-control gaps already measured exactly
16.00**, and `docs/HUD_SPEC.md` rule 2 has locked that step since 2026-07-25. The
eighth, spin to auto, is 0.00 by rule 4, AUTO tangent to SPIN, and is expressed as
a tangency rather than folded into the scale. Nine hand-set pixel values are now
one chain from TURBO's left edge.

**The two outer gaps are now EQUAL, 0.00 and 0.00**, where they were 0.00 and 7.00.
The slab's right inset was 9px against a left inset of 16px; it is now one token on
each side, so the slab spans one gap before MAX to one gap after STEPPERS, 711 wide
to 718.

**Every control's rendered coordinate is unchanged, and that is proved rather than
asserted**: `hud_banner_spec_check.mjs` pins all nine to their exact locked values
and passes, and the before and after readings agree that **the only box whose
geometry changed is the slab**.

**THE SLAB DOES NOT CENTRE ON THE CANVAS AND CANNOT WHILE THE CONTROLS STAY
LOCKED.** The brief asks for equal outer gaps AND a canvas-centred slab. The two
are mutually unsatisfiable, in one line: equal outer gaps needs turbo.right and
spin.left equidistant from 640, and they are locked at 309 and 1027, which are 331
and 387 away. Equivalently the slab's contents run 325 to 1011, whose midpoint is
668, so a symmetric slab inherits 668. **The row is right-heavy by design**, TURBO
alone on the left against SPIN plus AUTO on the right.

So the residual is +28.00 rather than 0.00, it is a consequence of the locked
coordinates rather than a fix this pass declined, and **three costed options are
written out for the owner** rather than one being picked quietly: leave it, shift
the whole row left by 28px and re-lock nine coordinates, or rebalance the row's
furniture.

**`docs/HUD_SPEC.md` is amended in the same commit**, which its own rule requires,
recording the panel's new width, that no control moved, and the centring question
it deliberately does not answer.

## JOB A3: the gate

`frontend/scripts/control_row_symmetry_gate.mjs`, at 1280x720 and 1200x675: the
two outer gaps equal to two decimal places, every control-to-control gap the same
token, AUTO tangent to SPIN. The slab's offset from the canvas centre is PRINTED
every run and deliberately not asserted, because asserting it would be asserting an
owner decision nobody has made.

**Seeded self-test per convention (p)**: the seed widens the slab's left inset by
6px in a scratch copy of the source, rebuilds to the gitignored scratch tree, and
the run goes red naming the gap, `the two OUTER gaps are equal (turbo to slab
-6.00, slab to spin 0.00)`, at both viewports, with the other assertions still
green and the working file restored and verified byte for byte.

**The gate is not wired into CI in this pass**, because A4 leaves the geometry
awaiting the owner and a gate that pins a geometry the owner may change would need
changing with it.

## JOB A4: this is the owner's eye-call, and the report says so

Stated plainly in `MEASUREMENTS.md` section A4: the gate passing is not approval.
What is proved is that the outer gaps are equal and one token drives the row.
Whether it LOOKS right, and whether the +28.00 should be closed by moving locked
controls, is the owner's judgement on the before and after captures.

## JOB B: the specimen

`frontend/fontspecimen.html`, `src/fontspecimen.ts`, `src/FontSpecimen.svelte`,
using the existing dev-only mechanism that `src/c1preview.ts` has used since R14.
Seven faces and three locales, switchable on the page, rendering the shipped
paytable values, the widest money readouts through the SHIPPED formatters, a
sub-cent win and a live counting balance. 21 captures committed.

**All seven candidates are OFL-1.1**, so the brief's licence premise holds.

**FOUR OF THE BRIEF'S COVERAGE CLAIMS DO NOT MATCH THE PACKAGES**, measured from
the installed files: Oxanium has no Vietnamese, **Saira has no Cyrillic**, Exo 2
has no Greek, and Chakra Petch has Vietnamese as well as Thai. **And three
candidates ship no 900 weight at all** (Oxanium, Chakra Petch, Rajdhani) while
**Michroma ships only 400**, against a HUD that uses 400, 700 and 900.

**TABULAR FIGURES, MEASURED BY RENDERING**: three faces can give a non-wobbling
counter. Oxanium is uniform by drawing (spread 0.00), Saira reaches 0.00 through a
real `tnum`, Exo 2 reaches 0.50 through `tnum`. Orbitron, Chakra Petch, Rajdhani
and Michroma cannot, by either route.

**THE ORBITRON QUESTION IS ANSWERED, AND THE ANSWER IS NO.** Its digits are not
uniform by drawing and it carries no `tnum`: at 100px, `0` is 83.4 and `1` is 39.1,
a spread of 44.30, and asking for `tabular-nums` changes nothing. **The measurement
reproduces TR-089's recorded per-1000-em advances digit for digit**, two
independent methods on the same face. So an uncompensated Orbitron money counter
does change width as it counts; TR-089 already fixed that at the win banner with
per-digit boxes, and what this adds is that the cause is the face and the
compensation is per-site. **Enumerating which other readouts lack it is a separate
pass and was not done**, per the stop line.

**A MEASUREMENT TRAP, kept because the first two runs were wrong.** The first run
returned exactly 50.000px for all ten digits of all seven faces: the probe was
measuring in the fallback because the webfonts had not loaded. Waiting on
`document.fonts.ready` fixed Orbitron alone and left the other six at 50.000,
because that promise only waits for faces the page is ALREADY USING. Each face has
to be forced with `document.fonts.load()` before it is measured. **Seven different
faces agreeing to three decimal places is the tell**, and both wrong runs are
recorded in the component's own comments.

**THE SPECIMEN DOES NOT SHIP, proven three ways**: `dist` is 77 files and
12,337,183 bytes against 12,336,028 on `main`, and the +1,155 is the JOB A token
block rather than fonts; a grep for every candidate name across `dist` returns
nothing and only three woff2 files ship, all Orbitron; and a same-origin request
sweep on the built app records 51 requests, 49 to the app's own origin and 2 to the
stubbed wallet, with zero external origins. `dist/fontspecimen.html` does not
exist. **No shipped font changed**: `--fs-font-display` and `--fs-font-numeric` are
untouched and the six candidates are devDependencies.

## Verification

- `scripts/qa/locked_paths_gate.mjs`: PASS, 0 sanctioned, 0 violations.
- `scripts/qa/doc_currency_gate.mjs`: PASS.
- `frontend/scripts/control_row_symmetry_gate.mjs`: PASS, and its seeded self-test
  PASS.
- `frontend/scripts/hud_banner_spec_check.mjs`: PASS, which is the proof that no
  locked control moved.

**THE TRACK MANIFEST, AND WHY THIS BRANCH DOES NOT CARRY ONE.** The brief asks for
the manifest to be extended to exactly the paths this branch touches. Measured
rather than assumed: this branch is `controlrow/2026-08-15`, not a `track/` branch,
so the scope check reports `not a track branch, scope check not applicable`, and a
manifest committed for it would be compared by the DISJOINT check against `main`'s
three surviving manifests, where `quality-sweep` still declares `frontend/src/**`
and `frontend/scripts/**`. This branch touches both. **A manifest here would turn a
green disjoint check red**, which is the same collision PR #123 hit and which the
owner has already ruled on: the dead manifests are archived under
`docs/records/tracks/closed/` on that branch, and that move is not on `main` yet.
**So no manifest is committed and the reason is recorded rather than the
requirement being silently dropped.** Once PR #123 merges, a track manifest becomes
possible again.

**ONE RED, CAUGHT BY OUR OWN GATE AND FIXED WITHOUT WEAKENING IT.** The first push
failed `machine tell gate, source scan`: the specimen spelled a literal font stack
in its stylesheet, which is the exact class that gate exists to stop. The gate was
right. The specimen now sets its face on its own root element at runtime through
the DOM API, so no literal stack exists under `src/` and **no exemption was added
to the gate**: widening its file list would have created a hole a shipped file
could later sit behind. Its scan still reads 78 files and its seeded self-test
still catches 16 of 16.

## The remote run, recorded per rule 10: GREEN

**Run 31854473710 on `e77538cb`: success, every job green**, including the full
browser matrix, since this branch touches rendering code. The first run,
31853809221, failed on `machine tell gate, source scan` for the reason above and
is recorded rather than hidden.

PR #125 opened so the run exists: `checks.yml` triggers on `pull_request` and on
pushes to `main` only.

## FOR THE NEXT SESSION

Model and effort: Claude Fable 5, judgement tier, one session, in a worktree off
`main`. Approach: measure before proposing, take the token's value from what the
row already agreed on rather than inventing one, prove the refactor is a no-op with
the locked spec's own gate, and prove the specimen does not ship rather than
asserting it. Alternatives tried and rejected: moving the locked controls to centre
the slab, which the arithmetic shows is the only way and which is an owner decision
rather than a builder's; and reporting the first digit measurements, which were
seven faces agreeing to three decimal places and therefore wrong.

**What the next session decides, in this order:**

1. **The slab's +28.00 from the canvas centre.** Three costed options are written
   out and none is applied. This is the eye-call the captures exist for.
2. **Whether any font candidate proceeds at all**, given that no single face covers
   both Cyrillic and Devanagari and three of the seven have no 900 weight.
3. **Whether the money readouts that count up all carry the per-digit treatment**
   TR-089 added at the win banner, now that the cause is measured to be the face
   itself.
4. **Whether `control_row_symmetry_gate.mjs` joins the CI matrix**, which follows
   from decision 1.
5. Everything the earlier passes left open, untouched here: the money surfaces, the
   bet ladder, the eight v7 clauses, the 68 register mismatches and TR-148 item 4.
