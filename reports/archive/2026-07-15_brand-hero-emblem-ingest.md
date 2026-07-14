# Session Report: BRAND HERO EMBLEM INGEST, 2026-07-15

- **Date:** 2026-07-15
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/brand-hero-emblem`, cut fresh off `main` (this pass
  doesn't touch `frontend/` or the game bundle at all, and the branch it
  would otherwise have stacked on, `claude/neon-polish-v1`/PR #81, is
  unrelated and still awaiting Fable's review, so this pass gets its own
  clean branch rather than entangling two independent PRs).
- **Source:** pasted brief, "BRAND HERO EMBLEM INGEST, 2026-07-15", plus a
  mid-session change of approach on the licence-archiving step, both quoted
  in full at the end of this report.

## Item 1: `tools/brand/ingest_hero_emblem.py`

Deterministic, re-runnable per convention (l): confirmed byte-identical
`master_1024.png`/`master_512.png` MD5s across two consecutive runs against
the same source.

**Background measurement**: median of three clean 40x40 corner patches
(top-left, top-right, bottom-left - bottom-right skipped since that's where
the watermark sits). Measured `(8, 10, 22)`, matching the brief's cited
`~#080A16` exactly (`0x08=8, 0x0A=10, 0x16=22`).

**Watermark removal**: built a non-background mask (`max per-channel diff >
12`) and ran connected-component labelling. The largest component is the
emblem itself; a single much smaller isolated component (851px, bbox
`x[874,933] y[874,933]`) sits in the bottom-right corner, separated from
the emblem by background pixels - this is the generator's watermark glyph.
Flat-filled its bbox (padded 6px for anti-aliasing halo) with the measured
background colour. Corner stdev: 1.112 before, 1.112 after (well under the
brief's `< 2` requirement - the patch is genuinely invisible, not just
under threshold).

**Recentring**: measured the emblem's own bbox on the cleaned image as
`x[109,930] y[53,957]` - notably different from the brief's cited
`x123-927, y71-941` (a ~14-16px difference on each edge, most likely because
the brief's figures were eyeballed/measured with a stricter threshold that
excludes the emblem's own soft anti-aliased glow falloff, whereas this
script's `diff > 12` threshold catches slightly more of that falloff).
Went with the script's own direct pixel measurement rather than forcing the
brief's approximate numbers, since the true rendered margins are what
recentring needs to act on. Shift applied: `dx=8, dy=-6`. New margins:
left=101/right=101 (diff 0), top=59/bottom=60 (diff 1) - both comfortably
inside the 4px tolerance.

**Size ladder**: `master_1024.png` (the cleaned+recentred master) plus
512/192/96/48, all via `Image.LANCZOS`. Visually confirmed `master_48.png`
reads as a soft blob rather than a legible mark at that size - expected and
undisclosed-as-a-defect, since the brief's own WRS_MASTER_DOCUMENT.md line
explicitly defers "flat vector mark evolution" to a future Fable art turn;
this pass ships the size ladder of the photoreal emblem as specified, not a
simplified favicon-scale mark.

## Item 2: Committed assets

Under `design-system/brand/hero_emblem/`: `source_raw.png` (untouched
byte-for-byte copy of the owner-supplied original), `master_1024.png`,
`master_512.png`, `master_192.png`, `master_96.png`, `master_48.png`,
`GENERATION_NOTE.md`. Ladder images also copied to
`reports/screens/brand-emblem/` for review-by-proof per convention (h).

## Item 3: `GENERATION_NOTE.md` - a genuine compliance record, not filled in blind

The brief's first pass asked me to record "the generation prompt used" and
"a pointer to the owner's archived copy of Gemini's usage terms" - neither
of which I had. Rather than fabricate either (this file is explicitly an
audit/compliance record, and the project is on the record about a past
external-audit star cost from a stale/misread artefact), I paused and asked
the owner directly. The owner then changed the approach for the terms
pointer specifically: rather than a Desktop archive, fetch and archive the
governing Google terms in-repo myself, and supplied the exact generation
prompt verbatim.

**Prompt** (recorded verbatim in `GENERATION_NOTE.md`): describes refining
an existing/attached emblem design, keeping the same neon palette, wheel/
slot-cylinder motif and arched "WE ROLL"/"SPINNERS" text, changing only the
composition (perfectly centred, square, full margin, no cropped letters, and
the busy city/rain background replaced with a single flat near-black
colour). This lines up with what the source image actually shows: a clean
emblem on a uniform dark background, no scene elements - consistent with a
refinement pass over an earlier, busier version.

**SynthID**: noted per the brief - Google embeds an invisible SynthID
watermark in Gemini-generated images, separate from (and not removed by)
the visible generator-glyph patch this pass's script applied.

## Item 4: Google terms fetched and archived in-repo

Fetched all three URLs directly via `curl` (not through an LLM-summarising
fetch tool, since a compliance archive should hold the actual verbatim text,
not a paraphrase), stripped HTML to plain text with BeautifulSoup, and
saved dated copies under `docs/licences/google-gemini/2026-07-15/`:

- `google-terms-of-service.txt` (`https://policies.google.com/terms`)
- `generative-ai-additional-terms.txt`
  (`https://policies.google.com/terms/generative-ai`)
- `generative-ai-prohibited-use-policy.txt`
  (`https://policies.google.com/terms/generative-ai/use-policy`)

**A real finding, not assumed**: the "Generative AI Additional Terms of
Service" page states in its own text that it "no longer apply[ies]" as of
22 May 2024 for anyone who isn't a business partner with a signed agreement
referencing it - the main Google Terms of Service now covers generative AI
use directly (confirmed: its "Respect others"/"Don't abuse our services"
sections explicitly reference generative AI content and the Prohibited Use
Policy). All three documents are archived regardless, since the additional-
terms page is still worth keeping for context and the business-partner
carve-out.

**Gambling/betting/wagering scan (as requested)**: searched all three
archived documents for any clause mentioning gambling, betting or wagering.
**None was found in any of the three.** The closest applicable provisions
are general-purpose, not gambling-specific: the Prohibited Use Policy's ban
on "illegal activities or violations of law", and the main Terms of
Service's bans on "misleading others into thinking that generative AI
content was created by a human" and "using AI-generated content from our
services to develop machine learning models or related AI technology". No
explicit permission or prohibition covering real-money gambling use exists
in any of the three documents - recorded as an open compliance question
(should probably be cross-referenced against the existing prohibited-tool
register the next time it's reviewed), not assumed either way in either
direction.

## Item 5: WRS_MASTER_DOCUMENT.md, two lines added to section 1

- **Provider brand assets row**: "Hero emblem ratified and ingested
  (design-system/brand/hero_emblem/, 2026-07-15); flat vector mark
  evolution pending Fable's art turn."
- **Licence archive row** (added per the owner's changed approach): "Public
  tool terms are auto-archived in-repo by builder sessions at adoption time
  (docs/licences/); owner-held Desktop archives are reserved for purchase
  receipts and paid licence documents only." This is a standing policy
  clarification, not specific to this one asset - it should apply to future
  tool adoptions too.

## Verification

- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/
  services/rgsService.ts frontend/src/lib/stores/gameStore.ts
  games/future_spinner/ .claude/settings.json` is empty. This pass never
  reads from or writes to `games/future_spinner/**` at all - unlike the
  prior NITRO DEV FUEL pass, there was no need to touch the locked maths
  package here.
- Determinism: re-ran `ingest_hero_emblem.py` twice against the same
  source; `master_1024.png` and `master_512.png` MD5s identical across
  both runs.
- Post-patch corner stdev: 1.112, comfortably under the brief's `< 2`
  requirement.
- Recentring: left/right margins equal (diff 0), top/bottom margins within
  1px (diff 1), both inside the 4px tolerance.
- Grepped every new file (script, notes, master doc, prompt file) for
  em/en dashes via a proper Unicode regex (not a broken byte-pattern grep,
  which initially gave a false negative): zero found in anything authored
  this pass. The three archived Google documents retain their own original
  dashes untouched, since editing a verbatim legal archive to satisfy a
  house style rule would corrupt the record it exists to preserve.

## Governing brief (quoted in full, for the record)

> BRAND HERO EMBLEM INGEST, 2026-07-15. Conventions, locks and reporting as
> pinned; nothing in this pass touches frontend/public or the game bundle
> (brand assets stay out of the shipping dist). The owner will provide the
> source file Gemini_Generated_Image_noojmpnoojmpnooj.png (1024x1024). Build
> tools/brand/ingest_hero_emblem.py, deterministic and re-runnable per
> convention (l), which: (1) removes the generator watermark glyph in the
> bottom-right corner by flat-filling that isolated cluster with the
> measured background colour (background is uniform ~#080A16, corner stdev
> ~1, so an exact patch is invisible; verify post-patch corner stdev stays
> under 2); (2) re-centres the emblem by equalising margins (current bbox x
> 123-927, y 71-941; pad/crop so left/right and top/bottom margins match
> within 4px at 1024x1024); (3) emits the size ladder: master_1024.png,
> 512, 192, 96, 48, all LANCZOS. Commit under
> design-system/brand/hero_emblem/: the cleaned master, the ladder, the
> untouched original as source_raw.png, and GENERATION_NOTE.md recording
> tool (Google Gemini), date, the generation prompt used, a pointer to the
> owner's archived copy of Gemini's usage terms, and a note that outputs
> carry an invisible SynthID watermark. Add one line to
> WRS_MASTER_DOCUMENT.md section 1 (Provider brand assets row): hero emblem
> ratified and ingested; flat vector mark evolution pending Fable's art
> turn. Commit the ladder images also under reports/screens/brand-emblem/
> so review-by-proof works per convention (h).

> Change of approach: do the archiving yourself, no owner action required.
> Fetch https://policies.google.com/terms/generative-ai and
> https://policies.google.com/terms/generative-ai/use-policy (plus
> https://policies.google.com/terms), save dated copies (plain text or PDF)
> under docs/licences/google-gemini/2026-07-15/ in the repo, scan the
> fetched text for any clause mentioning gambling, betting or wagering and
> report what you find in the session report, and cite those in-repo paths
> in GENERATION_NOTE.md instead of any Desktop path. Also add one line to
> WRS_MASTER_DOCUMENT.md section 1: public tool terms are auto-archived
> in-repo by builder sessions at adoption time; owner-held archives are
> only for purchase receipts and paid licence documents. The generation
> prompt for the note, verbatim: "Refine the attached emblem design. Keep
> the exact same style, detail level and neon palette (magenta, purple,
> cyan over dark gunmetal): a circular chrome car wheel with dark tyre and
> neon tread glow, an embedded three-reel slot cylinder showing neon 7 7 7,
> arched text WE ROLL across the top and SPINNERS across the bottom.
> Composition changes only: perfectly centred, square 1:1 format, the
> complete emblem fully inside frame with an even margin on all sides, no
> letters cropped, and the background replaced with a single flat, very
> dark plain colour (near-black, #0a0a12), completely empty: no city, no
> rain, no signs, no cars, no reflections, no other elements of any kind."
> Then proceed and submit.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** measured
  the emblem's true bbox directly from pixel data (connected-component
  labelling to separate the watermark glyph from the emblem body) rather
  than trusting the brief's cited approximate bbox numbers, since a
  recentring tool needs to act on the real rendered margins, not a
  secondhand estimate; the two disagree by ~15px per edge, most likely due
  to threshold sensitivity around the emblem's own anti-aliased glow.
  Fetched the governing legal terms via raw `curl` rather than an
  LLM-mediated fetch tool specifically because a compliance archive should
  hold verbatim text, not a summary.
- **Alternatives rejected:** filling in `GENERATION_NOTE.md`'s prompt and
  licence-pointer fields with placeholder or best-guess text - rejected
  because that file is an audit record, and this project has explicit
  standing concern about stale/misread artefacts costing points at external
  audit; asked the owner instead, which changed the licence-archiving
  approach entirely (in-repo fetch instead of a Desktop pointer).
- **Files touched:** `tools/brand/ingest_hero_emblem.py` (new),
  `design-system/brand/hero_emblem/` (new: source_raw.png, master_1024/512/
  192/96/48.png, GENERATION_NOTE.md), `reports/screens/brand-emblem/` (new,
  ladder proof copies), `docs/licences/google-gemini/2026-07-15/` (new,
  three archived Google policy documents), `WRS_MASTER_DOCUMENT.md` (two
  lines added to section 1), `FS_BrandHeroEmblem_Ingest_Prompt.md` (new,
  brief saved verbatim). Locked files untouched; this pass never opened
  `games/future_spinner/**`.
- **Open threads:** (a) the gambling/betting/wagering compliance question
  this pass surfaced (no explicit Google clause either permitting or
  prohibiting real-money gambling use of Gemini output) is worth a proper
  look the next time the prohibited-tool register is reviewed - it wasn't
  resolved, just surfaced and archived for record. (b) flat vector mark
  evolution for the hero emblem (so it reads cleanly at favicon scale) is
  explicitly deferred to Fable's next art turn, per the WRS_MASTER_DOCUMENT
  line added this pass. (c) Fable reviews this pass's PR next check-in,
  per the standing convention, before any merge.
