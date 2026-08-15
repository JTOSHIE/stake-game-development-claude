WE ROLL SPINNERS: CONTROL ROW GEOMETRY AND FONT SPECIMEN

Branch: fresh off main. Australian English. No em dashes or en dashes anywhere,
including in committed documents. Commits stage explicit paths only, never
git add -A, never commit -a. Locked paths untouched: rgsService.ts, gameStore.ts,
games/future_spinner/, .claude/settings.json. Extend the track manifest to
exactly the paths this branch touches.

CONTEXT
Fable measured the owner's full window capture: canvas 2400x1350, centre 1471.5,
cyan reel border centre 1471.0 at three rows. The reel is centred and that
question is CLOSED. Fable's earlier off-centre finding came from a cropped image
and is withdrawn. All geometry below is measured from the DOM, never from an
image.

JOB A: control row geometry

A1. MEASURE. At Desktop 1280x720, at the owner's capture ratio 1200x675, and at
the portrait profile, read from the DOM the bounding box of every element in the
bottom control row: turbo button, MAKS button, hamburger button, the balance,
win and bet readout panels, the bet up and down stepper, the spin button, the
autoplay button, and the banner slab itself. Report per profile: each box, the
banner centre against the canvas centre, and every inter-element gap left to
right including the two outer ones, turbo right edge to slab left edge and slab
right edge to spin left edge. Write to
reports/screens/controlrow-2026-08-15/MEASUREMENTS.md.

Known from the previous pass at 1280x720, treat as REPORTED and re-derive: slab
centre +24.50px right of canvas centre, turbo to slab 0.00, slab to spin 7.00,
and the slab measuring 711 wide where its own source comment describes 688.
Resolve that 711 against 688 discrepancy and state its cause.

A2. PROPOSE, then apply. The target is one spacing scale, not seven hand-set
values. Introduce a single control-row gap token and express every inter-element
gap in the row as that token or an integer multiple of it. The two outer gaps,
turbo to slab and slab to spin, must be equal. The slab must centre on the canvas
centre. Choose the token's value from whichever existing gap is already the most
common in the row rather than inventing a number, and say in the report which gap
you took it from and how many sites already agreed with it.

A3. PROVE. Re-run A1 after the change and commit before and after captures at all
three profiles to reports/screens/controlrow-2026-08-15/. Every gap that should
be equal must read equal to two decimal places in the after table. Add a gate at
frontend/scripts/control_row_symmetry_gate.mjs asserting from the DOM that the
two outer gaps are equal and the slab centres on the canvas centre, with a seeded
self-test per convention (p) that skews one gap by 6px in a scratch copy and must
exit non-zero naming which gap.

A4. This is an OWNER EYE-CALL. Do not treat A3 passing as approval. State plainly
in the report that the visual result awaits the owner's judgement on the captures.

JOB B: font specimen page

B1. Build a dev-only route rendering the real paytable, the real money readouts
at their widest values, and a live counting-up balance, in each candidate face,
switchable by an on-page control. Include the same screen in Russian and Hindi so
script coverage is visible rather than described.

Candidates, all SIL OFL or Apache 2.0, all available via @fontsource so delivery
and same-origin compliance are unchanged:
  Orbitron   the incumbent, included as the control
  Oxanium    gaming and techno, distinctive, Latin and Vietnamese
  Chakra Petch  squarish industrial, Latin and Thai
  Saira      technical, very wide weight range, Latin and CYRILLIC
  Exo 2      futuristic, Latin, CYRILLIC and Greek
  Rajdhani   squarish, Latin and DEVANAGARI
  Michroma   very wide and dramatic, Latin only

B2. For each candidate report, in a table committed to
reports/screens/fonts-2026-08-15/SPECIMEN.md: whether the face ships OpenType
tabular figures, measured rather than assumed by rendering the ten digits and
comparing advance widths; which of Latin, Cyrillic, Greek, Devanagari and
Vietnamese it covers; its exact licence; and its woff2 weight for the weights we
would actually ship. Also answer the open question for Orbitron itself, whether
its digits happen to be uniform width by drawing even though TR-089 established
it ships no OpenType features, because if they are not, our money counters wobble
today and that is a separate finding.

B3. Commit captures of every candidate at every locale to
reports/screens/fonts-2026-08-15/.

B4. THE SPECIMEN MUST NOT SHIP. Put the route behind the existing dev-only
mechanism, confirm the build diet plugin prunes it and every candidate font
package from dist, and prove it by reporting dist size and a same-origin request
sweep before and after. CHANGE NO SHIPPED FONT. --fs-font-display and
--fs-font-numeric stay exactly as they are; this job produces evidence for an
owner decision and nothing else.

STOP LINE: close after JOB A and JOB B. Do not act on anything the specimen
suggests. Do not touch any other open finding.

COMMIT
Stage explicit paths only: the control row component changes, the new gate, the
dev-only specimen route, the two reports/screens directories and their markdown,
reports/SESSION_REPORT.md, the dated archive copy, the extended track manifest,
and this brief verbatim to reports/briefs/.
Message first line: control row spacing unified, font specimen for owner review
Run locked_paths_gate.mjs, doc_currency_gate.mjs and the new symmetry gate; all
must pass. Open a PR so CI runs and record it per rule 10. End with a FOR THE
NEXT SESSION block.
