
## 2026-07-26k: KIT V4 AND THE BRAND INGEST, integrator session, six jobs

Brief saved verbatim: `reports/briefs/FS_KIT_V4_AND_BRAND_Prompt.md` (v2; the v1 block
from the previous Fable reply was declared DEAD unrun by the brief itself and was never
executed). Fresh session on `main`, integrator role, no other session in flight. Explicit
paths at every commit, one commit per job, no lock exceptions taken and none needed:
`git diff .claude/settings.json` empty throughout, and no locked path appears in any
commit of this session.

**Six jobs in one session, which rule 4 requires justifying.** They are one dependency
chain, not six errands: the ingest produces the candidate the derivation judges, the
derivation decides the file the kit ships, the tile work produces the other files the kit
ships, and the kit cannot be built until all of that has landed and been pushed. Splitting
it would have meant four sessions each waiting on the last, and the judgement-heavy job
(JOB 2) ran second, while attention was fresh, rather than last.

### The headline

**The provider-logo decision was derived by measurement and it did not change the
delivered file.** Candidate g, a 25-file variant pack the owner commissioned, is the
best-looking mark the project has been given at full size and it loses at small size, for
the same structural reason candidate e lost: an arched text ring around a detailed wheel
has nothing left to show once there are not enough pixels to carry it.

**The tile dimension is no longer a guess.** It was never published. It is now measured:
81 of 87 decoded live published tiles are exactly 408x546, and the owner's composed tile
is exactly 408x546.

### JOB 1: brand ingest, commit `3dae890`

Both owner-supplied deliveries ingested through the deterministic pipeline, neither
retouched, both hash-verified after landing rather than before.

| Delivery | Landed as | Check |
|---|---|---|
| The logo variant pack, 25 files | `design-system/brand/provider_mark/pack_g/` plus candidate g exports | every file re-hashed after copy, all 25 match |
| The composed tile | `design-system/brand/tile/tile_composed_master.png` | byte-identical to source, hash checked after the write |

New scripts: `frontend/scripts/provider_mark_ingest_g.mjs` and
`frontend/scripts/tile_master_ingest.mjs`.

**The exports are built from the pack's 1254 transparent file using candidate f's
ink-centred square crop, not from the pack's own 1096 square crop.** The pack ships a
purpose-made square, and using it would have meant JOB 2 comparing the supplier's crop
against ours rather than comparing the artwork. The supplier crop is measured and recorded
anyway.

**A generated claim was caught contradicting its own measurement, and the generator was
fixed rather than the text.** The first draft of `PROVENANCE_g.md` asserted that g's alpha
was soft where f's was hard. The measurement came back `PARTIAL 0`: g's alpha is hard-edged
too. The prose now branches on the measured value, so it cannot say the opposite of the
number printed above it. The finding itself is worth having: the pack's README says the
background was removed, and a hard alpha with zero partial pixels is the signature of
exactly that.

**Cost recorded, not hidden:** `pack_g/` adds 19 MB to the repository. It is outside
`frontend/`, so it cannot reach `dist/`, and the alternative was recording the studio
brand set in a sentence while the files stayed in an owner's Downloads folder.

### JOB 2: the logo derivation, commit `89b8199`

`frontend/scripts/provider_logo_derivation.mjs`. The rule was fixed before any number was
seen: the delivery goes to whichever candidate is measurably more legible at the smallest
size the platform renders.

**Half the work was establishing that the question has no directly observable answer, and
saying so.** The platform publishes no pixel size for the provider logo anywhere;
`game-tile-requirements.md:38` says only "clear and legible at small sizes". And the
provider logo is not drawn on the published tile at all: the platform sets the publisher
as type. So the ladder is built from three anchors, each labelled with what kind of
evidence it is:

| Anchor | Size | Kind |
|---|---|---|
| Portal game-card thumbnail slot, inner box 128x160 device px | 128 | MEASURED off our own capture `03_files_page` |
| Round one's "nearly unreadable at 48px" | 48 | EARNED from external review |
| The smallest file the owner's own pack ships, and its README's favicon size | 32 | The studio's own stated floor |

Both candidates were downscaled with high-quality smoothing, because that is what a
platform resample does, then composited over `rgb(29,29,29)`, **sampled from the portal
capture's page background rather than chosen**. That choice is load-bearing: f's own
provenance flags its near-black structural colour as at risk on dark surfaces, and
measuring on white would have hidden exactly that failure.

**Result: f wins 3 of 3 at 32px** (1.62x the internal detail, 1.90x the global contrast,
2.31x less ink below a 1.5:1 contrast ratio against the surface) **and 2 of 3 at every
other size on the ladder**. The eye agrees with the arithmetic in
`reports/screens/provider-mark/f-vs-g-rendered-sizes.png`.

**Two corrections made to the record before it was committed**, both because generated
prose had outrun the data:

1. A sentence said the crossover sat "above about 64px" while the computed list showed g
   leading at 128, 96, 64 and 48. The sentence now derives its boundary from the data.
2. A sentence said the verdict "would flip" if the platform rendered at 48 or larger. It
   would not: f still takes 2 of 3 at 48. That speculation is replaced by the three-measure
   verdict computed at every size on the ladder, which is both true and more useful.

**The test could have overturned the adoption and did not.** `WeRollSpinners-Logo.png` is
byte-identical to what it already held. f's existing 48 and 96 exports also regenerated
byte-identical from the same pipeline, which is a determinism claim checked rather than
asserted.

Candidate g is superseded for the portal mark per convention (h), kept, and recorded as
the **studio brand set** for favicon, site and print, per its own README.

### JOB 3: tile delivery, commit `71fd791`

**`published_tile_geometry_survey.mjs` closes a gap section 3c has carried since JOB 7.**
The requirements page gives no tile dimensions, so the AssetForge scaffold's values were
recorded as "provisional defaults, not an official number". Every published game exposes
its tile through the public FAIR catalogue; the survey samples them evenly and reads each
PNG header. **408x546 in 81 of 87 decoded assets, 93.1%.** Captured to
`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`.

The owner's composed master is exactly 408x546. It is also the first portrait tile asset
the project has held: BG is 2048x1152 and FG is 4159x1875, both landscape.

**`tile_layer_derivation.mjs` attempted the layer separation and measured why it fails**,
rather than asserting that it would. The attempt is committed as a four-panel proof sheet
so a reader can disagree by looking:

| Finding | Measurement |
|---|---|
| The type is baked into the pixels | 26,879 px resolved, by a deliberately conservative detector that does not fully catch the smaller `WE ROLL SPINNERS` line, so the real figure is larger |
| The background behind the character does not exist | 46,276 px, **20.77% of the frame**, would have to be painted |
| The silhouette is not cleanly keyable | 884 of 2,350 boundary px, **37.62%**, below a 0.10 luminance step against what they touch |

Two heuristics misfired on the first run and were fixed rather than accepted: a fixed
centre seed landed on the character's brightly lit visor and returned a zero-pixel mask,
and a plain brightness threshold counted neon city highlights as type. Both now use
connected components.

**Both forms of the tile ship**, because the Design Thumbnail editor has never been opened
by anyone here and which form it takes is genuinely unknown. Shipping one and guessing
would put the owner in front of an editor with the wrong file.

### JOB 4: sideproject archived off-repo, commit `1b31c5b`

| Field | Value |
|---|---|
| Archive | `~/Desktop/WRS_ARCHIVE/sideproject_2026-07-26.zip` |
| Size | 52,738,480 bytes |
| Contents | 4,188 non-directory entries, 483 directories |
| README inside | one line: concept material, possible future theme inspiration, not project code |

**Verified before deleting, not after.** `unzip -t` clean, and the entry counts reconciled
against the working tree. The first reconciliation came up 8 short, because `find -type f`
does not see symlinks and zip stores them; the 8 are `node_modules/.bin` shims. A "looks
about right" check would have waved that through, and the point of counting is that it
does not.

Master document section 7 is now HORIZON: 7a records the archive and its verification, 7b
carries the next-title template unchanged, so the `CLAUDE_PROJECT_INSTRUCTIONS_v7.md:42`
citation of "section 7 template" stays correct.

### JOB 5: kit V4 and the walkthrough, commit `dd331da`

Built from a **fresh clone of `origin/main` at `1b31c5be`**, per convention (o).

| Gate, run in the clone | Result |
|---|---|
| production build | PASS, 108 files, 15,515,173 bytes (the build stamp records 107 and 15,514,792, not counting itself) |
| dash gate, source scan, 82 files | PASS |
| dash gate, dist scan | PASS |
| dist hygiene, no documentation ships | PASS, four seeded violations caught, negative control clean |
| layout fit, seven presets | PASS, no scroll, every control reachable |
| contrast, portrait presets | PASS, seeded violation caught, negative control clean |

**`layout_fit_gate.mjs` now writes to `.evidence-scratch/`**, so the run did not dirty
committed evidence. That is convention (h.1) actually closed rather than noted as open.

`03_branding/` ships **four** files, not three: the new `FutureSpinner-Tile.png` beside the
BG, FG and logo. Its hash `741e77fa` is the hash of the file the owner supplied, unchanged
from Downloads through the ingest to the kit.

**The walkthrough's PART 9 was a live hazard.** It was written for
`FS_UPLOAD_KIT_V3`, that visit was never run, and its bundle predates the replay fix, so
following it would have uploaded a regression. Its body is replaced by a short DO NOT RUN
marker pointing forward; the full text stays in git history rather than in an operational
document where it could be followed by accident. PART 9c is the new self-contained visit
in nine steps. Start Approval is ruled out three times.

One addition to the brief's list, and it is the cheapest thing in the visit: **PART 9c asks
for a screenshot of the Design Thumbnail editor BEFORE anything is uploaded into it.** That
one capture settles which tile form the platform wants, which is currently the only reason
the delivery set has to carry both.

### What this session did not do

- **It did not open the Design Thumbnail editor.** It cannot; that needs the owner's
  portal session. Which tile form is correct stays open, and both ship.
- **It did not observe the provider mark rendered anywhere.** No capture we hold shows it,
  and the derivation says so in its own first section rather than implying a rendered size
  it cannot support.
- **It did not run the maths.** Nothing in this session touches `games/future_spinner/**`.

### Gate and verification summary

| Check | Result |
|---|---|
| Candidate g pack copy, 25 files re-hashed | PASS |
| Composed tile copy, hash after write | PASS |
| f and g exports regenerated at 48 and 96 | byte-identical to committed |
| Provider logo delivery | unchanged, byte-identical |
| Archive zip integrity and entry reconciliation | PASS |
| Six build and dist gates in the clone | PASS |
| Em and en dash scan over every file written this session | zero |
| `.claude/settings.json` diff | empty |
| Locked paths touched | none |

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, integrator session, six jobs, justified above by the
dependency chain rather than by convenience.

**Approach taken.** Measure first and let the record derive itself from the measurements.
Every document in this session is generated by the script that took the numbers, so a
sentence and the table above it cannot disagree. That caught three real errors before
commit (g's alpha, the crossover boundary, the "would flip" claim), each of which would
have been a plausible-sounding falsehood in a hand-written report.

**Alternatives tried and rejected.**

- *Deciding the logo by eye, or asking the owner.* The brief ruled it derived, and the
  measurement turned out to contradict the intuition that the newer, richer artwork should
  win. An eye-call at full size would very likely have picked g.
- *Building candidate g's exports from the pack's own square crop.* Convenient, and it
  would have made the comparison meaningless.
- *Deriving BG and FG from the composed master anyway, with inpainting.* That is inventing
  a fifth of the picture inside an ingest and delivering it as the owner's art.
- *Deleting PART 9's superseded text outright.* Git history holds it; an operational
  document should not.
- *Excluding `node_modules` from the sideproject archive.* 89 MB of the 112 MB, and
  reinstallable, but the owner said archive the directory and the zip compresses it to
  nothing that matters.

**Files touched.** `frontend/scripts/` (five new: `provider_mark_ingest_g.mjs`,
`tile_master_ingest.mjs`, `provider_logo_derivation.mjs`,
`published_tile_geometry_survey.mjs`, `tile_layer_derivation.mjs`; one modified:
`tile_delivery_build.mjs`); `design-system/brand/provider_mark/` (candidate g exports,
`pack_g/`, `PROVENANCE_g.md`, `PROVIDER_LOGO_DERIVATION.md`, `README.md`);
`design-system/brand/tile/` (`tile_composed_master.png`,
`GENERATION_NOTE_composed_master.md`, `TILE_LAYER_DERIVATION.md`);
`design-system/brand/delivery/` (`FutureSpinner-Tile.png`, `README.md`);
`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`;
`docs/records/upload-kit/` (`00_READ_ME_FIRST.md`, `03_branding_HASHES.txt`);
`reports/screens/provider-mark/f-vs-g-rendered-sizes.png`;
`reports/screens/brand-tile-composed/layer-derivation-attempt.png`;
`WRS_MASTER_DOCUMENT.md`; `reports/briefs/FS_KIT_V4_AND_BRAND_Prompt.md`; this report and
its archive copy. `sideproject/` removed from the working tree.

**Open threads, in the order the owner asked for them.**

1. **The owner runs PART 9c.** `~/Desktop/FS_UPLOAD_KIT_V4/`, single use, delete
   afterwards. The two highest-value minutes in it are the Bets panel replay (does the
   button work now, and does the max win celebration present) and the screenshot of the
   Design Thumbnail editor before anything goes into it.
2. **Fable's benchmark polish review**, per the retro mechanism in section 3f: up to three
   surfaces nominated for focused redo sessions, each with the measurement that justified
   it.
3. **External review round three.**

Also still open and not touched by this session: the six social strings blocking stake.us,
the JOB 2 addendum's platform-conformance extensions, JOB 3b's math self-audit, and JOB 5b's
in-game rules conformance UI.

**Rule 10 closing (2026-07-26k).** Remote run
[30194550651](https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30194550651)
on `31dbc1f`: **green, both jobs** (static gates, browser gates). The mid-session
push at `1b31c5b` was also green, run
[30194275519](https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30194275519).
Verified from the runs' own conclusions, not from local gate results.

**One correction folded into this commit.** The kit README and the report both
gave the bundle as "108 files, 15,514,792 bytes", which mixes two counts: 108
files includes `build-info.json`, and 15,514,792 excludes it, because the stamp
does not count itself. The bundle is 108 files and 15,515,173 bytes; the stamp
records 107 and 15,514,792. The 381-byte gap is the stamp.

**One finding added to section 7a.** The archived `sideproject/` mattered less
than its size suggested: the LUMEN source is on the pushed branch
`claude/lumen-sideproject` (`4f4d6ef`), and 89 MB of the 112 MB in the working
tree was `node_modules`. Recorded so a future reader does not treat the zip as
the only copy.
