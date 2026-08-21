# Session Report - R083 ASSETFORGE: THE STOP AT TASK 1, AND THE HALO THE INGEST FOUND IN ITSELF (2026-08-22)

Brief saved verbatim: `reports/briefs/FS_FABLE_R083_ASSETFORGE_Prompt.md`. Branch:
`assetforge/2026-08-22`, REVIEW LANE, delivered by pull request. **No game code changed, no
locked path written.** `.claude/settings.json` diff verified empty.

**THE LANE, decided against convention (t) rather than against the brief's silence.** The
brief said explicit paths, CI green and comms folded per (t), and did not name a lane. (t)
names it: green lane is the four record surfaces only, and "anything touching code, gates,
locked paths, player-facing text or rulings remains review lane", with a mixed change taking
the stricter lane. This session ships a Python pipeline and edits a gate, so it is review
lane and rides a PR. R082 went direct to main because it was records only; this is not.

## TASK 1: STOPPED, which is what the brief asked for

The brief's own instruction: assess the hardware honestly, and **if local generation is
impractical, STOP** and report a costed cloud alternative on the same weights. It is
impractical, so nothing was stood up, no weights were fetched, and no image was generated.
The full assessment is `docs/art/ASSETFORGE_FEASIBILITY_2026-08-22.md`. Three independent
blockers, any one of which is sufficient:

**A. The machine cannot hold the model at reference precision.** Apple M5 MacBook Air,
10-core GPU, 32 GB UNIFIED memory, passively cooled, and measured **already 2.09 GB into
swap with 11.5 GB free-plus-inactive before anything was loaded**. SD 3.5 Large at fp16 is
about 27.4 GB resident once the T5-XXL encoder and the CLIP pair are counted. It fits only
by quantising the transformer or by sequential offload, and that is the wrong instrument for
this specific job: **a calibration pass exists to let the owner judge the MODEL, so running
it through a quantiser means a "not good enough" verdict cannot be attributed.** Convention
(m), a measurement taken with a broken instrument.

**Seconds per image is reported as DERIVED, not measured, and the report says so.** It could
not be measured because of blocker B. Derived floor about 3 to 4 minutes at 1024x1024 by
scaling published M4 Max timings on GPU core count; realistically 6 to 15 minutes here once
offload and fanless throttling are counted. The brief's twice-delivery-size render is the
harder half: SC-01 at twice delivery is 3840x2160, roughly 8x the compute AND far outside
the model's roughly 1 megapixel training distribution, where it produces repeated structure
rather than detail. The correct method is generate near 1 MP then upscale, which is a change
to the brief's method and is flagged for the owner rather than made unilaterally.

**B. THE WEIGHTS ARE GATED AND THE GATE IS AN OWNER ACTION.** Proven first-hand, not
assumed: `GET huggingface.co/stabilityai/stable-diffusion-3.5-large/raw/main/LICENSE.md`
returns **HTTP 401**, "Access to model ... is restricted. You must have access to it and be
authenticated". Even the licence file is behind it. Opening it needs the owner's HuggingFace
account (none configured here: no `HF_TOKEN`, no token in the HF cache) and acceptance of
the Community License on the model page. Accepting an agreement and operating an account are
owner actions under rule 1. **This blocker applies to the cloud path too**, so it is on the
owner's list either way.

**C. The licence needed vetting before generation, and it has two live issues.** Below.

## The licence vetting, and the good result first

Both documents captured verbatim under `docs/licences/stability/2026-08-22/`, in the same
dated-capture shape as the Google Gemini dossier, per convention (l).

**REAL-MONEY GAMBLING IS NOT RESTRICTED.** The Acceptable Use Policy, which the licence
incorporates by reference, contains zero occurrences of "gambl", "casino", "wager",
"betting", "real money" or "lottery". **Verified with a working control on the same file**
("Acceptable Use" 14 hits, "sexual" 7 hits), so the zero is a real absence rather than a
grep that silently matched nothing. Outputs are ours: "You own any outputs generated from
the Models or Derivative Works to the extent permitted by applicable law."

**ISSUE 1, AND IT COLLIDES WITH CONVENTION (w) DIRECTLY.** The licence requires the licensee
to "prominently display 'Powered by Stability AI' on a related website, user interface,
blogpost, about page, or product documentation." Frame convention (w), settled yesterday,
says the platform-mandated General Disclaimer is the SOLE sanctioned occurrence of
third-party branding in shipped text. A "Powered by Stability AI" line in the game UI would
be a second one. The requirement is a DISJUNCTION, so werollspinners.com or the product
documentation discharges it without touching the game, but which surface carries it is a
ruling and not a builder's choice. Escalated as E1.

**ISSUE 2, THE REVENUE CLIFF.** "If at any time You or Your Affiliate(s) ... generate more
than USD $1,000,000 in annual revenue ... any licenses granted to You under this Agreement
shall terminate", after which "You must request a license from Stability AI, which Stability
AI may grant to You in its sole discretion." For a studio whose product is a slot game that
is a live commercial risk on the SUCCESS case, and "sole discretion" means it is not a
formality. Output ownership survives termination; the right to keep generating does not.
Escalated as E2.

## TASK 2: not run, and blocked twice over

It depends on TASK 1, which stopped. It is **also** independently blocked, and that is worth
recording because it will still be blocked when the pipeline exists:

**The pivot letter does not exist in this repository.** The brief sources the SD prompt
register from "the pivot letter (committed alongside)". Nothing named pivot is tracked or
untracked anywhere; "prompt register" and "SD prompt" return nothing across every tracked
file. CLAUDE.md convention (m) is explicit that external documents must physically exist in
the repository before work cites them. The prompt register has to arrive before TASK 2 can
run, whatever hardware it runs on.

**A CORRECTION TO MY OWN FIRST READING, recorded rather than quietly fixed.** I first
reported H1 and H2 as undefined, having checked them against the manifest ID column where
they genuinely do not appear. They are not IDs, they are FILENAMES, and the seven resolve
cleanly:

| Brief's name | Manifest row | Path | Target |
|---|---|---|---|
| SY-01 | SY-01 | `symbols/wild.png` | 240x240 |
| H1 composed | SY-03 | `symbols/h1.png` | 240x240 |
| H1 base | SY-04 | `symbols/h1_base.png` | 240x240 |
| H1 spin | SY-05 | `symbols/h1_spin.png` | 240x240 |
| H2 | SY-06 | `symbols/h2.png` | 240x240 |
| SY-13 | SY-13 | `symbols/tile_plate.png` | 244x204 |
| SC-01 | SC-01 | `backgrounds/bg_base.jpg` | 1920x1080 |

All seven are REPLACE, so all seven are ingestable by TASK 3's pass. Recorded here so the
next session does not re-derive it.

## TASK 3: delivered in full, and it went red three times on itself

`scripts/assets/assetforge/ingest.py` plus a 15-case convention (p) self-test. Green-key
knockout, delivery downscale, 64px silhouette, dimension assertion, manifest refusal.
Outputs to `.scratch/assetforge/ingest/` per (h.1); exit 2 on any refusal so it can gate a
chain.

**The refusal rules are per manifest CLASS, and each class refuses for its own reason**,
taken from the manifest's own notes rather than invented: KEEP is BR-01, the emblem the
palette anchors to, "do not replace, restyle or recolour"; DEAD "ships but never renders"
and its rows say delete rather than redraw; REGEN is **not UI art at all**, those PNGs being
headless screenshots of live CSS and SVG controls, so a hand-drawn replacement drifts from
the control it documents. Only the 30 REPLACE rows are ingestable.

**It also refuses ASPECT DRIFT, which is the failure a dimension assertion structurally
cannot see.** A square candidate resized into 244x204 satisfies every dimension check ever
written and still looks wrong, so aspect is compared on the SOURCE, before the resize.

**THE SELF-TEST WAS SEEN RED THREE TIMES ON REAL DEFECTS, which is the only reason its green
means anything (convention (p)).** In order:

1. **A metric that could not fail.** `max_residual_dominance` was computed from the
   PRE-despill array, so a broken despill and a working one produced identical numbers. Now
   measured after despill, on the pixels the matte kept.
2. **A GREEN HALO IN THE DELIVERED FILE, and the self-test did not catch this one, the first
   end-to-end run did.** RGBA was downscaled without premultiplying alpha. A cleared pixel
   still carries its original RGB, which after a green-key knockout is the key itself, and
   Lanczos resamples colour and alpha independently: alpha said "barely there" while RGB
   said "pure green", and the game would have composited the green on every symbol edge.
   Every statistic the knockout reported was clean throughout, because they are all measured
   BEFORE the resize. **The lesson is the one this project keeps relearning: assert on the
   artefact that ships, not on the stage before it.** The delivered-file assertion exists
   because of this and is now case 11.
3. **The despill ceiling was too generous.** It permitted dominance up to `tol_low` in kept
   pixels, and the downscale then resampled that allowance up to 46/255 on the delivered
   edge. A partially transparent pixel is a blend WITH THE KEY by definition, so the edge is
   now clamped to zero green dominance while solid interior pixels, which never touched the
   key, keep the gentle ceiling and stay free to be legitimately green.

**Delivered green dominance across those three fixes went 255/255 to 0/255**, alpha-weighted
17.3/255 to 0.0/255, measured on the shipped artefact. The realistic end-to-end candidate
lands at 4/255 raw and 1.93/255 alpha-weighted.

I want to be plain that fix 2 was found by luck of running the tool for real, not by the
test I had just written. The test was measuring the pipeline's own opinion of itself.

## The gate gap this pass exposed

`docs/currency` went red on `scripts/assets/assetforge/README.md` for citing
`.scratch/assetforge/ingest/`, a directory that is gitignored BY DESIGN under convention
(h.1) and can therefore never exist at HEAD. `.evidence-scratch/` sits in the gate's
`UNRESOLVABLE_PREFIXES` for exactly that reason; `.scratch/` was added to `.gitignore` later
and never added to the gate. **The omission had sat unexercised because no tracked document
had ever cited the path in backticks, and this README is the first.** One line, with the
reasoning in a comment beside it. The gate's own self-test still reports 28/28 with every
seed red, so it can still fail.

## Verification

Document currency: **PASS, 272 frozen, 0 new**, self-test 28/28. Ingest self-test: **15/15**,
after being seen red. Locked paths: self-test PASS then PASS at 0 violations. Gates chained
with `&&` per the frame's (o). Explicit paths per (k).

**REMOTE CI GREEN on `1ff12e4a`, run 32509661980: the FULL 30-job matrix, every job success,
none skipped.** Verified with the full sha per R082's lesson, never an abbreviation.

**A PREDICTION IN THIS REPORT WAS WRONG AND IS CORRECTED RATHER THAN QUIETLY DROPPED.** An
earlier draft of this section said "no frontend change and no rebuild, so the browser matrix
has nothing to exercise", reasoning from R082, where a records-only push correctly skipped
it. That was wrong here: all 28 browser legs RAN and all 28 passed. R082 changed only
documents; this pass changes `scripts/qa/doc_currency_gate.mjs`, and the `changes` job that
gates the matrix is deliberately built to fail OPEN, running the full matrix whenever it
cannot prove the change is inert. The prediction was a guess dressed as a derivation, which
is the thing convention (m) exists to stop, and the outcome is better evidence than the one
I predicted.

## ESCALATIONS

**E1 (R083). "Powered by Stability AI" against convention (w).** The licence requires
prominent attribution on one of website, user interface, blogpost, about page or product
documentation. (w) makes the platform disclaimer the sole third-party mark in shipped text.
Recommendation, for the owner to accept or overrule: werollspinners.com plus the product
documentation, never the game UI, which discharges the licence and leaves (w) intact.

**E2 (R083). The USD $1,000,000 revenue termination clause.** Whether that is acceptable for
art that ships in a commercial slot game, or whether the Enterprise conversation happens
BEFORE the art is generated rather than after the game succeeds. This is a company-layer
decision and squarely the owner's.

**E3 (R083). The pivot letter and its SD prompt register do not exist**, so TASK 2 stays
blocked on content regardless of hardware.

**E4 (R083). The twice-delivery-size method should become generate-near-1MP-then-upscale**,
for the training-distribution reason in the feasibility report. Method change, so it is a
Fable ruling rather than a builder's edit.

R082's E1, E2 and E3 all stand, as do R080's E1, R081's E2 and E3, TR-148's four, R078's E1
and E2, and R079's E1 and E2.

## FOR THE NEXT SESSION

**Nothing proceeds on art generation until the owner answers the feasibility report's four
questions**, of which the weights gate (blocker B) is the one that blocks every path
including the cloud one, because it needs the owner's own account.

The ingestion half is ready and needs no generator to be useful: it will accept the seven
calibration files the moment they exist, from any source. LoRA training remains where the
brief left it, on the owner's word only, and wants the 48 GB or 80 GB class rather than the
24 GB one.

Model and effort: Opus, judgement tier, one session, review lane on `assetforge/2026-08-22`,
code plus records.
