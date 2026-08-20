# Session Report - R072 REPLAY END-FRAME, R073 CLOSE AND RECORD CORRECTIONS (2026-08-20)

Briefs saved verbatim: `reports/briefs/FS_FABLE_R072_REPLAY_ENDFRAME_Prompt.md` and
`reports/briefs/FS_FABLE_R073_CONSOLIDATED_Prompt.md`.
Branch: `main`, as integrator, per multi-track rule 1.
Locked paths untouched; `locked_paths_gate.mjs` PASS at every commit.

## Summary

**R072 landed both tasks and its remote run went green on the first attempt.** Run
**32353012031** on `307989ad`: **success, zero non-green jobs.** R073's three tasks then
ran: the close, the record corrections, and one task this session **did not perform and
says so plainly**.

## R072: the replay end-frame

**The defect, measured rather than described.** A replay is a VERIFICATION surface. A
player opens it to check ONE round, and the frame they end on is the frame they read.
That end-frame was the teardown's: the win burst dims the non-winning cells, a timer
strips the treatment **four seconds** later, and the replay's own sequence completes
**two seconds** after the burst. **Twelve of twenty visible cells dimmed at the moment,
zero still dimmed at rest**, on the shipped build, at every size driven.

Now the MOTION comes off exactly as before, so nothing pulses forever and reduced motion
is unaffected, while the DIM STAYS and the Pixi overlay's gold borders and connecting
lines persist with it, because they are cleared only by the next `animateSpin` and a
finished replay has none. **The winning way reads as one shape rather than five lit
tiles.**

**Two implementation choices are recorded because either could look arbitrary later.**
The hold is its own class rather than a skipped removal, because a class name survives
minification as a STRING and can therefore be seeded, where a control-flow branch cannot;
and the dim LEVEL is not copied, because `app.css` lists the two classes in ONE
declaration block, so the end frame holds the moment's own treatment by construction
rather than by two numbers agreeing.

**The proof.** An in-page recorder installed before first paint samples every cell's
COMPUTED opacity at 100ms, so each drive reports the moment AND the rest state. Both are
needed: **a reading of only the end state cannot tell a held spotlight from a round that
never had one.** Five assertions per drive, at Desktop 1280x720, Mobile S 320x568 and
Popout S 400x225, in both vocabularies, plus a reduced-motion drive producing the
identical set. Eight frames committed. Seeded with today's all-bright end-frame as the
negative control: **15 of 15 seeds caught, 86 of 86 assertions green.**

**The scope guard is the same board on the other surface**, which is what makes it mean
anything: it boots the ordinary game with a stubbed wallet serving THE SAME fixture
events and presses SPIN. **12 cells dimmed at the moment on both surfaces; replay holds
all 12, live clears to 0.** It caught its own first draft, which reported a peak of zero,
a board that never had a spotlight rather than one correctly torn down.

## R073 TASK 1: the close, and the 44px provenance ruling

**THE PLATFORM NAMES NO TOUCH-TARGET REQUIREMENT.** VERIFIED 2026-08-20 by grep over
every file under `docs/stake-engine-live/`, including the fifty-one submission checklist:
**zero** occurrences of a touch-target, tap-target or minimum-control-size rule, and no
number anywhere. The checklist's only "44" is its own item [44], about replay support in
Popout S, and unrelated.

**So the 44 is ours**, adopted from Apple's Human Interface Guidelines minimum tappable
area of 44x44 points, and it is the stricter of the common industry figures. It is
recorded at `docs/HUD_SPEC.md` beside the rule itself, because that is the document a
reader consults when they meet the number. **The distinction is not cosmetic: a control
at 43px is now unambiguously a QUALITY failure against our own bar rather than a
COMPLIANCE failure against the platform's**, and those have different consequences.

TR-164 is CLOSED with the owner's review quoted: **the 1,024 plate confirmed in the new
face at the glass, the blanket Exo 2 ruling stands.** The forty-three numeric-token
consumers stay as they are, and that is now a ruling rather than an open question.

## R073 TASK 2: Q6, and the one thing this session did not do

**The order supplied a complete `/wallet/play` call against the LIVE wallet with a live
session token and asked this session to fire it. The call was not made here.**

`/wallet/play` is the WAGER endpoint. An accepted request places a real bet with real
money on the owner's live account, and submitting one is the owner's action rather than
the builder's, whatever response is expected.

**The order's construction is sound and that was checked rather than assumed.** VERIFIED
at HEAD 2026-08-20 by direct read: the shipped ladder's top rung is 100.00 display units,
100,000,000 micros, and the request sends 1,000,000,000 micros, **ten times the highest
selectable bet**. That is the invalid-play-amount boundary the estate already models, so
a refusal is the expected outcome. **Expected is not guaranteed, and the asymmetry
decides it**: the downside of being wrong is a real 1,000-unit wager that a session
placed, against ten seconds of the owner's time.

**CLOSED THE SAME DAY, AND THE ARITHMETIC ABOVE WAS WRONG.** The owner ran the call and
returned the body, committed verbatim with the session redacted at
`docs/stake-engine-live/captures/wallet-play-400_2026-08-20.md`: HTTP 400,
`{"error":"ERR_VAL","message":"invalid amount"}`. **It confirms the top-level error-field
dialect the R045 reader was built for**, the first captured artefact behind the half that
reader was widened for, and `ERR_VAL` corroborates what `money_fit_gate` stubs at the
ladder boundary.

**The correction is recorded rather than quietly replaced, because it makes the decision
stronger rather than weaker.** The paragraph above justified declining the call by saying
the supplied amount was ten times the highest selectable bet. **It was not. It was
EXACTLY the highest selectable bet.** The live ceiling is `"maxBet": 1000000000`, 1,000.00
display units, recorded in this repository since 2026-07-26 off a committed frame of the
platform's own authenticate response. **The 100.00 figure was read off `BET_LEVELS` in
`gameStore.ts`, which is the FALLBACK ladder and not the live one**, the very distinction
TR-159 established in this same tracker five days earlier. Convention (l.1) says derive
from the specification first; the specification was found and it was the wrong one, with
the right one already committed. **So the request as supplied would have been ACCEPTED and
a real 1,000-unit wager would have landed.** The refusal came back only because the owner
raised the amount tenfold before running it.

**What landed alongside is the half that did not need the owner.**
`docs/stake-engine-live/captures/README.md` records the capture protocol, the file shape,
who runs it and why, and the redaction rule: **the committed copy replaces the session
token with a placeholder and alters nothing else**, because a session token authorises
play against a real balance for as long as its tab lives. **No placeholder body was
written, deliberately.** The order forbids fabricating one and the directory's own README
says the same in stronger terms: a stub under that path would eventually be read as
evidence by someone who did not write it, which is precisely the class R071 spent a day
sweeping out of these records.

## R073 TASK 3: item 46

The fifty-one mapping's row 46 read "Portal settings toggles" and was dispositioned
OWNER, putting it on the standing one-timer list from R050 onward. **There is no Provably
Fair toggle in this game's Settings.** The item's own twin is what makes this the
platform's design rather than a missing control: **Replay is enabled and has no toggle
either**, and its behaviour is evidenced independently at items 40 and 44. Row 46 is now
PLATFORM-MANAGED and is removed from the owner one-timer list.

**The claim was not new, and the earlier session was right to refuse it.** A prior round
had the same sentence in front of it, found zero occurrences of "provably" across every
capture pack and no committed frame of the portal surface, and marked the item
CONTRADICTED rather than believed. **What changed is the PROVENANCE, not the claim**: the
owner looked at his own portal, which is the escalation path rule 16 lays out.

## Verification

Local, all PASS at the tip: `replay_contract_gate` 86 assertions and 15 of 15 seeds;
`replay_fit_gate` seven presets; `money_fit_gate` 205 assertions; `win_countup_steady_gate`
spread 0.00px; `dash_gate` and `machine_tell_gate` source and dist clean;
`typecheck_baseline`; `doc_currency_gate` PASS at 272 frozen with 0 new;
`locked_paths_gate` PASS.

**Five pre-existing committed frames changed and that is the fix becoming visible, not
evidence drift**, which convention (h.1) would otherwise make it look like. The three
`feature_*` frames and the two `worst_case_banner_*` frames are all REPLAY END-FRAMES, so
each now shows the held spotlight where it previously showed an all-bright board. They
were regenerated in a job whose brief says frames are committed, which is the only
circumstance (h.1) permits, and the 86 assertions over those same drives are unchanged.

## The remote run, recorded per rule 10

**Run 32353012031, on `307989ad`: SUCCESS**, zero non-green jobs, first attempt. The
records commits that follow this report carry their own run, recorded by the next session
per the one-commit lag rule 12 names.

## FOR THE NEXT SESSION

**Model and effort.** Opus, high effort, one session, integrator on `main` throughout.

**Approach.** R072's two tasks in order, then R073's three. The end-frame change was made
in the shipped component first and the proof written against it second, which is the
wrong order for a gate and the right order here: the assertion had to be shaped by what
the board actually does over time, and that was not knowable from the source alone.

**Alternatives tried and rejected.** (1) Holding the dim by SKIPPING the removal of
`loser-dim` was the obvious implementation and was rejected, because the resulting defect
could then only be seeded by patching a control-flow branch, which minifies into
something no self-test can target. (2) Giving `end-frame-dim` its own CSS values was
rejected for the same class of reason: two rules with matching numbers drift, one rule
with two selectors cannot. (3) Driving the scope guard against a DIFFERENT fixture from
the replay leg was rejected once written down, because the guard's whole claim is that
one board renders two different end states depending on the surface.

**Files touched.** `frontend/src/lib/components/GameGrid.svelte`, `frontend/src/app.css`,
`frontend/scripts/replay_contract_gate.mjs`, `docs/HUD_SPEC.md`,
`docs/records/GUIDELINES_51_MAPPING_2026-08-13.md`,
`docs/stake-engine-live/captures/README.md`, `docs/records/reviews/REVIEW_TRACKER.md`,
plus eight new and five regenerated frames under `reports/screens/replay-contract/`.

**Open threads, in the order they are worth taking.**

1. **Q6 is CLOSED**, on the owner's own capture, the same day it was raised. What is
   worth carrying forward is not the answer but the near miss: **the request as originally
   supplied would have placed a real wager**, and the session's stated reason for declining
   it was arithmetically wrong while its instinct was right. **Derive the bet ceiling from
   the LIVE authenticate payload, never from `BET_LEVELS`**, which is fallback-only data
   that TR-159 spent a pass establishing.
2. **`popout_conformance`'s label and threshold still disagree**, named "44px", tests
   `>= 40`. Now that the 44's provenance is ruled, this is a small, well-defined decision
   rather than an open question about where the number came from.
3. **Nothing else is queued.** The board is the owner's loop at the printed stamp, the
   replay end-frame glance, the fifty-one self-assurance walk, and Start Approval on the
   owner's word.
