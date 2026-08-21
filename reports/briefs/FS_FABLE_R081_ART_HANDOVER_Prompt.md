FABLE BRIEF R081: ART HANDOVER FOR ARC 2, THE FULL VISUAL INVENTORY
(2026-08-21). Sole live brief, records and evidence only, no game code.
Judgement tier. Australian English, no em or en dashes. Save and commit
verbatim. Explicit-path commits, CI green per rule 10, comms folded
per (t).
OWNER RULING ON RECORD: every shipped raster is up for replacement in
ARC 2 except the We Roll Spinners hero emblem
(design-system/brand/hero_emblem/master_1024.png and its shipped
derivatives), which is the sole KEEP. Fonts, palette and styles are all
open to change; current values are recorded as the starting point, not
the constraint.
TASK 1, THE INVENTORY. Produce docs/art/ART_HANDOVER_ARC2.md plus a
machine manifest docs/art/art_manifest_arc2.csv covering EVERY raster
the kit ships (the ~115 under themes/future-spinner, assets/ui and
symbols): one row per file with a stable ID, path, dimensions, alpha
yes/no, role, where it renders (component and screen), state variants
and sheets grouped under their parent, classification KEEP or REPLACE,
replacement priority P1 symbols and wild and scatter, P2 scene and
backgrounds and frame, P3 buttons and panels and gauge, P4 particles
and sheets, and the delivery spec per row: exact target dimensions,
transparent PNG or opaque, safe margins, and any animation-sheet frame
layout that must be honoured.
TASK 2, THE STYLE RECORD. Append the current design-language facts:
the palette as shipped (the CSS custom properties with hex values),
the type roles (Orbitron for brand and headings, Exo 2 for money and
counting), the kept emblem's own colour story as the anchor any new
style must harmonise with, and the licence requirement stated plainly:
every generated or purchased replacement must be commercially usable
in real-money gambling, verified before it ships.
TASK 3, THE CONTACT SHEETS. Render labelled contact sheets of the
current assets grouped by priority tier under reports/art/arc2/current/
so any external tool can see the starting state beside the manifest.
CLOSE. Comms entry, tracker row ARC2-ART opened, tree clean. FOR THE
NEXT SESSION: nothing; the owner hands the manifest to the generation
tools.
