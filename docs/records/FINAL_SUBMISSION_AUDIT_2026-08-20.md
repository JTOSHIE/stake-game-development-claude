# The one-shot submission audit: R074 final verdict (2026-08-20)

Produced by FABLE FINAL AUDIT BRIEF R074, the sole live brief, saved verbatim at
`reports/briefs/FS_FABLE_R074_FINAL_AUDIT_Prompt.md`. Audit posture throughout: evidence
plus escalation, no wallet calls, no portal mutations, nothing ticked or submitted, locked
paths untouched, no placeholder evidence, no seed or threshold retuning. Australian
English, no em dashes or en dashes. Companion table:
`docs/records/GUIDELINES_51_FINAL_AUDIT_2026-08-20.md`.

**Zero fixes landed on any shipped surface.** Every commit this session is a record: the
brief, the dated capture set, the two audit records, and the close set. **The published
`a95c521a` build stands and no rebuild is owed**: a fresh production build at this
session's tip stamps 93 files and 12,467,624 bytes excluding its own build-info, which is
the published figure byte for byte, with cleanTree true, and the shipped sources are
byte-identical to `307989ad`'s (verified by diff, record paths only since).

---

## Phase 0, the anchor: HOLDS

Tip equalled the owner-confirmed published stamp `a95c521a` exactly; tree clean; zero open
pull requests; newest remote run on the tip green (run 32364167540, the one-commit-lag run
R073 left to this session per rule 12). First-hand reads done fresh: the session report's
R072/R073 section, `HANDOVER_2026-08-15_Fable.md`, CLAUDE.md including LOCKED_FILE_DEBTS,
COMPLIANCE_WATCH.md, SUBMISSION_DOSSIER.md, the review tracker, and comms entry 072. No
drift found between the repository and the anchor. Every tracker row not CLOSED is
dispositioned in the table at the end of this record.

## Phase 1, platform truth: ZERO DELTA, and the logged-in half escalated

The entire /docs sidebar was enumerated live (71 anchors, 64 unique routes, zero non-docs
links) and every route captured with dual normalisation into
`docs/stake-engine-live/2026-08-20/` (committed `3cbef98c`). **All 64 bodies are
byte-identical to the 2026-08-15 set**, which was itself byte-identical to 2026-08-11, so
the approval and RGS families are unchanged and **the submission-morning refresh stands
done**. The RGS trio remains unchanged since 2026-07-29 across five dated captures.

**The logged-in reads are escalated, not performed.** The pane's stake-engine.com session
has expired; sign-in requires ticking two terms-agreement checkboxes and an OAuth grant,
which are owner actions, never a session's. Blocked and escalated as one bundle (E1
below): the item-level fifty-one re-read, the portal pre-checks, the published version
stamps, the Math page, the clean-load console inventory, the Start Approval form dry-read,
and the first-time-publisher terms. On that last item: the owner-quoted sentence about one
active review for first-time publishers appears in NO committed capture and on no public
route (verified by sweep of the whole 2026-08-20 set); the public checklist page carries
the delays and review-queue framing, unchanged since at least 2026-08-10, and the
item-level content behind its "Login required" wall was last captured logged-in on
2026-08-13.

## Phase 2, the fifty-one: 38 CONFIRMED, 12 STALE-refreshed, 1 ESCALATED

The full table is `docs/records/GUIDELINES_51_FINAL_AUDIT_2026-08-20.md` (committed
`bc6f7475`). Method: nine read-only verifier agents (workflow wf_eae8c848-2e7, 23 agents,
zero errors, every agent reporting a clean tree), adversarial refutation of every
non-clean draft, first-hand session spot-checks of load-bearing claims, and the full local
battery. **No item's substance failed re-verification.** The twelve STALE rows are mapping
evidence-cell drift from the four estate passes that landed after 2026-08-13, each
corrected in the table; the two recurring shapes are an instrument misattribution (a
static ruling verifier cited as the rounds-driving harness; the real evidence is the
committed round4 drive set) and symbol or line drift (canSpin to canAffordSpin, the R058
pod removal, the R071 precision law). Item 45 is portal state, escalated with E1.

## Phase 3, the estate re-proof: EVERYTHING RUNNABLE IS GREEN

**The CI matrix at HEAD.** The newest full browser matrix is run 32353012031 on
`307989ad`: SUCCESS, 30 of 30 jobs. Every commit since is record-only, zero paths under
frontend, scripts or the workflow file (verified by diff), which is exactly the class the
matrix's changes filter skips by design; the static suite ran green on every later push
(32364167540, 32372996744, 32373522535, and this session's own).

**The local re-run of the entire matrix, this session, command lines taken verbatim from
checks.yml:** static suite 74 of 74 steps PASS including every seeded-violation self-test;
browser matrix 28 of 28 legs PASS including every seeded self-test. FS_WRITE_EVIDENCE
stayed unset; the tree stayed clean throughout.

**Local-only harnesses (outside CI by ruling 11):** the fifty-row
currency_conformance PASS; locale_launch_conformance PASS, 16 of 16 locales and 10 of 10
malformed fallbacks. Three local-only harnesses are STALE at HEAD and could not complete
honestly (gap G3): the R066 lesson, local-only proofs go stale silently, now has three
live instances.

**The kit at artefact level.** Fresh build at the tip: the dist build-info stamp records 93
files, 12,467,624 bytes excluding itself, commit at tip, cleanTree true; the raw dist
count agrees (94 files including build-info, 12,468,024 bytes). **Byte-identical to the
published figure.** Same-origin: build_diet_verify PASS locally (its network hygiene half),
dist carries zero external-origin references (dash, machine-tell, asset-reference and
supply-chain gates all PASS), and dist ships only the future-spinner theme, the alternate
trees pruned by vite.config.ts's deliberate exclusion (verified in dist directly).

**The named battery, latest verdicts with dated citations, every runnable one re-run
green this session:**

| Battery item | Verdict and citation |
|---|---|
| Replay board, results, end-frame | replay_contract_gate 86 assertions, 15 of 15 seeds, PASS this session; the held end-frame is TR-167/168, CLOSED 2026-08-20 (R072), frames at HEAD vintage |
| Popout | popout_conformance PASS this session; label wording gap G4 escalated |
| Autoplay two-step | r042b_autoplay_proof PASS this session (TR-129, CI leg since 2026-08-11) |
| Spacebar | Wiring verified first-hand at App.svelte:1868 and :1909 this session; modalGuard.test.ts 25 assertions PASS this session; the runtime harness is stale (G3), last dated runtime proof 2026-07-25 |
| Count-up steadiness | win_countup_steady_gate PASS this session (rebuilt on the outcome by TR-158, spread 0.00) |
| Sub-cent display | r057_subcent_proof PASS this session (TR-136; expectations conformed to the precision law by R071) |
| Zero-decimal widening | precision_law_gate PASS this session (TR-155, 21 rows, three seeds); currency_table_gate widening conformed per TR-161, PASS this session |
| Fifty-row currency conformance | currency_conformance.mjs local run PASS this session (the R065/R066 placement and decimals rulings standing) |
| RTL parity | direction_parity_gate PASS this session (TR-145, flip-in-place twins, seeded) |
| Retrigger moment | r062_retrigger_proof PASS this session (R062, 28-job matrix era proof) |
| Money fit at visual bounds | money_fit_gate 205 assertions PASS this session (R059 to R061; TR-161 re-measured seeds) |
| Error dialect, both captured bodies | r045_error_field_proof PASS this session; both captured platform bodies verified first-hand: 2026-08-11 play 400 `{"error":"ERR_VAL","message":"could not parse request json"}` and 2026-08-20 wallet-play-400 `{"error":"ERR_VAL","message":"invalid amount"}`, both the top-level error dialect the dual reader handles, code winning |

**Frames.** The one frame family at HEAD vintage is the R072 replay-contract set
(2026-08-20, committed with the change it shows). The older families (round4, r057-subcent,
r056-replay, r047 paytable) predate later passes over their surfaces; they stand as dated
records, and the behaviours they illustrated are re-proven at HEAD by the gates above. No
frames were regenerated this session: an audit regenerates evidence only in a declared
refresh job, and none was declared.

## Phase 4, the maths: EXACT, END TO END

Independent recompute from the shipped lookup tables, exact rational arithmetic, costs
taken from the shipped index.json (1.0, 1.0, 1.25, 100.0, 400.0, verified):

| Mode | RTP recomputed | Cap | Wincap 1 in |
|---|---|---|---|
| base | 96.3499998727% | 500,000 centibets = 5,000x | 100,000 |
| cruise | 96.3499999467% | 5,000x | 250,000 |
| antelite | 96.3499998505% | 5,000x | 80,000 |
| bonus | 96.3499999962% | 5,000x | 1,000 |
| super | 96.3499999989% | 5,000x | 250 |

Every figure reproduces the record to ten decimal places. statistics_summary.json
reconciles where it speaks (cruise, antelite, super; its cost_mapping agrees with
index.json; antelite freegame hit rate 115.0 is the denominator of the corroborated 1.6x
trigger claim). **Books-to-lookup equality re-run in FULL at HEAD this session: 500,000
rounds, 4,455,829 assertions, 0 failures**, and before the run all five book SHA-256
values were verified equal to BOOKS_MANIFEST.md's rows, which supplies the input-binding
provenance TR-110 asked for, dated today at the tip. The portal Math page reconciliation
is in E1; its newest committed capture (2026-08-13, five compliant mode cards) stands.

**The blurb-to-truth matrix at HEAD**, approved Option C text and shipped rules, each
claim against a primary source: 5x4 grid (game_config.py num_reels 5, num_rows 4 by 5);
1,024 ways (4 to the power 5, win_type ways); 96.35% RTP (config 0.9635; the lookup
recompute above); 5,000x base bet cap (config 5000.0; every table capped at 500,000
centibets); 3, 4 or 5 scatters instant 1x, 3x, 10x (scatter_multiplier_table); 8, 12 or
16 spins (freespin trigger table); +5 retrigger (freegame trigger table, flat 5); +1x
never resets (the config's own meter statement, held by the book-driven proofs); 100x buy
and 400x NITRO (index.json costs); NITRO pre-rev 5x (METER_PRE_REV super 5 in fsModes.ts,
proven against the books' meterBefore by the standing proof); the soundtrack shift (the
audio bed crossfade, TR-020a). **Every row verifies.**

## Phase 5, the adversarial gap hunt

Lenses run read-only (workflow wf_a82c4d7d-527, 31 agents, zero errors): the en string
sweep, the sixteen-locale integrity sweep, the asset and licence audit, and the
first-time-publisher obligations check; every finding adversarially refuted, 7 of 27
refuted, and the survivors are the gap list below. The en sweep found zero typos, zero
placeholder residue, zero double spaces and zero US-register violations in player-facing
English; the locale sweep found complete keysets in all sixteen locales, zero
interpolation-slot mismatches, zero leaked keys, uniform informal de register per TR-128,
zero mojibake, and consistent apostrophe form per locale. Parts (a) clean load and (d)
Start Approval dry-read are in E1.

---

## The consolidated gap list

Severities per the standing mandate: no minor category exists; everything is escalated
with evidence, because the brief's fix policy admitted only zero-judgement
submission-material fixes and every gap below carries a judgement or belongs to the owner.

**E1, the login bundle. ESCALATED to the owner, one logged-in pass.** The pane's portal
session expired; sign-in wants terms boxes and OAuth, owner actions. Blocked reads, all
with their newest committed evidence standing: the fifty-one item-level wording re-read
(2026-08-13 transcription), portal pre-checks including item 45's betlevel template and
item 08's thumbnail (2026-08-13 capture), published version stamps (front v9, math v1 at
2026-08-13), the Math page (2026-08-13 capture, five compliant cards), the clean-load
console inventory (TR-081's two settling captures remain wanted: the Console panel
expanded, and any red row's own Headers and Response), the Start Approval form dry-read
(no committed record of its fields exists; the owner will meet it first), and the
first-time-publisher terms, whose one-active-review sentence exists in no committed
capture. None of this blocks pressing Start Approval; all of it is the owner's own
submission-morning walk, which the fifty-one table was built to sit beside.

**G1. SUBMISSION-MATERIAL, ESCALATED: dossier 5g's checklist fetch is blind at the
criteria level.** SUBMISSION_DOSSIER.md section 5g lists the submission-checklist route
among its eleven anonymous rendered fetches with "If ANY rule changed, HALT", but the
criteria section of that page is login-gated (so since at least 2026-08-10 the anonymous
fetch sees only framing), and no step fetches the authenticated view. The sweep would
report a false clean if the 51 criteria changed after 2026-08-13. Fix is a protocol
change to a live document: owner and Fable's call. The compensating fact: the framing
page is byte-stable across five dated captures, and the owner's logged-in morning pass
(E1) covers the item-level read.

**G2. SUBMISSION-MATERIAL, ESCALATED: the speed tooltip is hardcoded English with
internal drift.** HudOverlay.svelte lines 513, 621, 778 and 871 each carry
`title={$speedTier === 'normal' ? 'Normal speed' : ... 'Turbo' : 'Super Turbo'}`: a
player-visible hover tooltip, untranslated in fifteen locales, its first state carrying a
trailing noun the others lack, sitting beside an aria-label that routes correctly through
the a11yCycleSpeed key. No translated tooltip keys exist, so the fix needs sixteen
translations: judgement content, review lane. The finding also exposes an instrument
blind spot: the hardcoded-string gate cannot see interpolated title attributes, and
QUALITY_CHARTER's Q-16 row claims a sweep of quoted attributes that this form escapes.

**G3. QUALITY, ESCALATED: three local-only harnesses are stale at HEAD.**
modal_safety_proof.mjs times out waiting to click the feature menu (predates the boot
scrim and DOM-click era); portrait_layout_conformance.mjs dies against the Max Win
overlay and, lacking the TR-123 exit contract, leaves processes behind;
platform_conformance_item2.mjs fails its language fuzz on a dev-only store-injection path
that does not exist in production (display stayed uncorrupted; the reachable launch path
is proven by locale_launch_conformance's 10 of 10 fallbacks) and writes output under a
hardcoded 2026-07-14 date. Exactly the class R066 recorded: local-only proofs go stale
silently. The behaviours these harnesses existed to hold are all covered green by CI
gates or were re-verified first-hand this session (the spacebar wiring by direct read).
A bounded harness-hygiene pass is the fix; it wants its own brief.

**G4. QUALITY, ESCALATED (standing, R073 open thread): popout_conformance's label and
threshold disagree.** popout_conformance.mjs line 165 says "44px touch-target rule",
line 166 asserts `>= 40`. TR-169 settled the 44's provenance (our own HIG bar, stricter
than the platform, which names none). Which number the gate should assert is the ruled
decision R073 left open; nothing was retuned here.

**G5. QUALITY, ESCALATED: the ellipsis glyph splits by layer.** prose.ts carries ASCII
three-dot forms (replayLoading line 150, replayingRound 152, loadingCybernetics 154)
while translations.ts line 259 carries the SAME loading string with U+2026, and the
locale prose files carry the ASCII form in all fifteen locales. One string, two glyphs,
two layers; the machine-tell family's mixed-forms concern, though no single surface has
been shown rendering both at once. Player-string change: review lane.

**G6. QUALITY, ESCALATED: two social override lines read as machine-substituted.** The
social rulesOverdriveBuy reads "Feature Play: play 100× your total play to start the
feature instantly." and the social buyBonusDesc has the same doubled-play register.
Correct under the vocabulary table, but the sentence a native reader writes is not the
sentence the substitution wrote. Social wording: owner and Fable's register call.

**G7. QUALITY, ESCALATED: two win-tier vocabularies are simultaneously reachable.** The
live celebration renders translations.ts bigWin and siblings with exclamation marks while
the replay surface renders prose.ts tierBigWin and siblings without; same tiers, two
voices. One vocabulary should own the tier names; which one is a wording call.

**G8. QUALITY, ESCALATED: no OFL licence text ships or is tracked for the two shipped
faces.** Orbitron and Exo 2 arrive via @fontsource, licence texts exist only under
gitignored node_modules, and one generation note cites that gitignored path. The
platform's font rule (self-hosting, same-origin) is met and re-proven; this is the
licence-artefact record beside it. Committing the two OFL texts under docs/licences/ is
bounded, but a compliance-record addition belongs to review lane.

**G9 and the record-only set, ESCALATED as one records pass.** The Gemini capture's own
open compliance question lives only inside the generation note; three boot documents
state review-model facts no capture holds (the seven-day lock, the 0.33-step rubric, the
Friday re-rank) while the captured page says only that a rejected game may resubmit after
addressing feedback, and HANDOVER_2026-08-15_Fable.md line 288 mis-states the
resubmission condition; the paytable modal renders two malfunction clauses that disagree
in number and three spellings of the scatter's name; ReplayMode lines 611 and 627
hard-code the social-mode words Play and Token past the vocabulary table (consistent
today because social forces English); the ja locale leaves the four bet-limit labels
en-identical where every other non-en locale translates them; TR-081 remains duplicated
in the tracker and the TR-057 and TR-064 supersession triplets remain; camera-roll-named
media and the three alternate theme trees are git-tracked with no provenance records,
none of it shipping (dist verified clean of all of it), which folds into the standing
public-repository escalation; COMPLIANCE_WATCH's per-asset generation-note sentence
overstates the scene character and car records; WRS_MASTER_DOCUMENT line 31 still names
the superseded provider upload file; and the platform's own quality-rankings page
contradicts itself at the one-star tier (a platform defect, recorded only). None of this
is player-visible beyond what G5 to G7 already name; all of it is one records-hygiene
brief.

## The open tracker rows, dispositioned

| Row | State at HEAD | R074 disposition |
|---|---|---|
| TR-003 | OPEN pending reviewer | Stays open by design: the reviewer's arithmetic never arrived. This session's recompute is a FOURTH independent agreement (super wincap exactly 1 in 250). Not a blocker. |
| TR-048 | OPEN, JOB 11 | Evidence-legibility item (audio_verify artefact pair); rides the records pass (G9). |
| TR-057 / TR-064 | Superseded triplets, newest rows CLOSED | The duplicate-row shape rides the records pass; substance closed. |
| TR-074 | OPEN observation | Translucent spin cells versus opaque idle board; one settled-state frame at the same viewport settles it; owner eye-call territory. Not a defect on the record. |
| TR-081 | OPEN observation, duplicated row | Multiple authenticates confirmed, red half never reproduced, nothing player-visible fails; the two settling captures are in E1's console inventory. Row duplication rides the records pass. |
| TR-093 | OPEN, LOW | One charter sentence versus its own Q-29 row; a documentation call for the charter's owner; rides the records pass. |
| TR-098 | WORKED AROUND, gate fix open | layout_fit measurement nuance; the gate passed at HEAD including seeds; rides the harness-hygiene pass (G3's sibling). |
| TR-109 / TR-116 / TR-117 | Substantially done, cells not CLOSED | Substance verified done at HEAD by R071's sweep; cell wording rides the records pass. |
| TR-110 | OPEN, HIGH as filed | **Strengthened this session**: full equality re-run at HEAD, 0 failures, inputs hash-bound to BOOKS_MANIFEST before the run, dated and quoted in this record. The row's residual (the 2026-07-25 artefact's own missing provenance fields, and the capped-round exception's breadth) stands for the maths owner; the headline claim is now re-proven with provenance twice over. |
| TR-112 | PARTLY CLOSED | Remainder is the 36 check warnings and the qs advisory; npm run check and the supply-chain gate both ran green this session (the gate's advisory step included); the row's remainder wants a one-line recount against the current lockfile in the records pass. |
| TR-122 | OPEN by nature | The doc-currency predicate limit is structural; the frozen tail rode down again this session (272, file-sourced). No action. |
| TR-124 | OPEN by design, ruled KEEP | Post-approval decision, unchanged. |
| TR-130 / TR-146 / TR-147 / TR-159 | Dispositioned or recorded | Complete as records; no action. |
| TR-148 | ESCALATED, awaiting rulings | The four standing escalations (the public repository against clause 5.1.a.ii, the insurance obligation, the licence-fee accrual floor, the gitignored config's internal hash disagreement) remain the owner's and Fable's; none blocks the portal act of submission; the public-repo item gains the G9 residue note. |
| TR-171 | CLOSED (Q6) | Complete; its disposition cell's OPEN-phrased narrative beside a CLOSED status is the one cell-shape tension found in Phase 0, cosmetic, rides the records pass. |

## The verdict

Platform truth is byte-stable to 2026-08-11 across the whole tree; the estate is green
everywhere a machine can run it, remotely at the last shipped-surface commit and locally
in full this day, seeds included; the maths reproduces exactly from primary artefacts
with the books hash-bound; the shipped kit reproduces the published stamp byte for byte;
the fifty-one walk found no item whose substance fails; and every gap found is either the
owner's logged-in morning glance or an escalated judgement call, none of which blocks the
submission act.

**GO FOR START APPROVAL**, on the owner's word and hand alone, with E1's logged-in pass
as the submission-morning walk and the escalations standing as listed.

Signed with the run identifiers of record: remote 32353012031 (full matrix, 30 of 30, at
`307989ad`), 32364167540, 32372996744, 32373522535 (static greens through the tip),
this session's pushes `50aeffae`, `3cbef98c`, `bc6f7475` and the close set following;
workflows wf_eae8c848-2e7 (the fifty-one walk, 23 agents) and wf_a82c4d7d-527 (the gap
hunt, 31 agents); local battery static 74 of 74 and browser 28 of 28 at `3cbef98c`.
