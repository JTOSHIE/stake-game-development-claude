# Fable handover, arc opening 2026-07-25c

**Read this file first and in full. It is deliberately short.** It exists because the
previous Fable chat grew long enough that context and images were costing real credits, so
this arc starts from a pointer rather than from history.

Supersedes `HANDOVER_2026-07-25_Fable.md`, which is retained as the prior arc's record.

Australian English, no em dashes or en dashes.

---

## 1. Boot: read these, in this order, and nothing else to start

| # | File | Why |
|---|---|---|
| 1 | `CLAUDE.md` | The conventions (a) to (n), the locked-file policy, the true game facts, and THE FACTS DISCIPLINE. Non-negotiable and load-bearing. |
| 2 | `docs/records/reviews/REVIEW_TRACKER.md` | Every finding, its disposition and its evidence. The single source of truth for what is done, parked or open. |
| 3 | `reports/FABLE_COMMS.md` | Newest entry first. Your own prior rulings and the builder's receipts. Read the top three entries; older ones are history. |
| 4 | `COMPLIANCE_WATCH.md` | Live platform requirements, the dated docs mirror, and the 2026-07-25 platform delta. |

**Do not** read the archives to get oriented. `reports/archive/` holds twenty superseded
briefs and handovers; they are kept for auditability, not for onboarding.

## 2. Verified state, as of this file

**Maths.** Five modes, RTP 96.3500% in all five, max win 5,000x, 100,000 outcomes per mode
against a platform cap of 10,000,000. Book-to-lookup equality is **proven for every row of
every mode**: 500,000 rounds, 4,455,829 assertions, zero failures
(`tools/verify_books_lookup_equality.py`). That closes what review 1 said it could not
verify.

**Frontend.** Twelve CI gates, all green. The ones added this arc: authenticated bet
ladder, RG enforcement, modal safety and per-tier affordability, live event schema
alignment, production mock containment, session recovery, scatter anticipation integrity,
and social-safe accessibility strings.

**The first lock sanction ran and merged** (PR #103). `rgsService.ts`'s three recorded
debts are cleared: the live event schema (it parsed `board`/`win`/`scatter`, which occur
**zero** times in the shipped books, so a live round would have shown an empty grid),
`endRound` unretried on the credit leg, and the duplicate `CURRENCY_SCALE`.

**XEC is implemented.** A first-party Stake EU announcement made it a release gate, which
superseded the earlier hold. Byte-identical to XSC by construction.

**Scatter anticipation is complete and owner-signed-off.** Escalation is a function of
visible state only, so the build never claims a scatter that has not landed. Two findings
came out of it worth carrying: the whole anticipation system had been **unreachable in the
shipped reel mode** since 2026-07-07, and 0.5% of rounds land two scatters on one reel, so
levels are computed rather than incremented.

## 3. The board

1. `feature/cohesion-pass`: the global grade is built and works; the depth haze does not
   and will not, because it is a style mismatch rather than an atmosphere deficit. **The
   enhanced character art is owner-approved** and staged; see section 4.
2. Tool vetting of the Claude pack, as untrusted input.
3. `chore/docs-refresh` in full: 5g delta sweep, dossier end to end, GAME_FACTS, the PAR
   commercial note, and the second external review pack.
4. The closing run in a fresh environment, which is the **only** place the frame gate can
   be ruled on. See the recorded principle in section 5.
5. Then: external review round two, the official platform testing session, portal and Tile
   Editor, dossier walk, submit.

## 4. Decisions waiting on you

| Item | Question | Recommendation |
|---|---|---|
| **Externally sourced art** | `CLAUDE.md` prohibits it. The enhanced character was produced by an external image model, is owner-approved, and demonstrably better. Adopting it also orphans the SVG master and touches the "original works of We Roll Spinners" line. | Owner call. If adopted, amend the convention explicitly rather than leaving it contradicted. |
| **TR-012c** | SC placement: the announcement shows leading, the SDK and docs say trailing. Implemented as payload-driven so both render correctly; the wiring needs the locked `authenticate` mapping to carry the field. | Confirm at the platform testing session. |
| **TR-035b** | An `open` round cannot be resumed from `authenticate` alone. Three options recorded. | Resolve empirically; four questions written in `docs/staging/`. |
| **TR-036** | Does scatter escalation run for a free-spins retrigger? | Reduced ladder capped at level 3. |
| **PAR** | Should the submission artefact carry the antelite note, or only `COMPLIANCE_WATCH.md`? | A one-line pointer in the PAR. |

## 5. Two principles recorded this arc

**Local frame numbers are advisory only.** This build machine idles at 34 to 43 fps, so it
cannot verify a 55 fps gate in either direction. Ratios measured back to back are
meaningful; absolute numbers are not. Only the closing run's fresh environment can rule.

**Where a recorded method and a subsequent sanction conflict, the sanction governs**
(convention (n)). The obligation it does not remove is to surface the tension and let it be
ruled on. Choosing quietly is the violation, in either direction.

## 6. How the builder works, in one paragraph

Derive from the specification before measuring; measurement confirms, it never discovers.
Every number carries its source. Corroboration requires genuinely independent inputs. An
unsolved problem parked with options beats a problem solved wrongly. Locked files are
machine-enforced and a lift must name its deny lines. Briefs are saved verbatim to
`reports/briefs/`. Full text in `CLAUDE.md`, conventions (l) and (m) and THE FACTS
DISCIPLINE.

---

## Appended 2026-07-26: the replay blocker (TR-076), fixed and proven

Bet Replay on the live platform was dead: the board static, START REPLAY an unclickable
shadow. Reproduced locally at the exact live parameter shape before any code was blamed:
the fixed `.bg-layer` backdrop (z-index 0) hit-tests above unpositioned content, and
ReplayMode's container was unpositioned, so the backdrop sat over the whole replay UI.
Only replay mode was exposed because the game stage (z-index 2) covers the backdrop in
normal play. Fixed both directions (backdrop `pointer-events: none`; replay container
positioned at z-index 2), proven by `frontend/scripts/replay_blocker_proof.mjs`, 7 of 7
including the convention (p) seeded red, evidence in `reports/screens/replay-blocker/`.

**TR-073 is closed by pass 3 of that proof**: MaxWinCelebration presents at the wincap in
replay and COLLECT answers a real click. The brief's "TR-075" reference maps to TR-073;
recorded in the tracker, not silently renumbered. The deployed bundle still carries the
defect until the owner re-uploads the frontend; event 22975 via the Bets panel Replay
button is the one-click live confirmation afterwards.

Also this session: rule 9 filled with the expected-fail protocol (both documents),
the working-tree relocations completed with nothing discarded (`chore/wip-backgrounds`
pushed; `claude/fs-super-prototype` already carried the super package byte-identical, so
the loose 450MB copy was simply removed), and `sideproject/` listed for the owner's
LUMEN-branch or off-repo call. Full account: `reports/archive/2026-07-26j_replay-blocker.md`.

---

# 2026-07-28: the round-three prep arc, and what verifying it found

Appended per convention (j). The arc that began with the round-three prep brief is
complete as BUILD work and now waits on a ruling block. `reports/FABLE_COMMS.md`
entry 020 is the one-screen version with the six numbered decisions; this section
is the account of how the work went, which entry 020 has no room for.

## The shape of it

Six jobs were briefed and all six shipped, one commit each, main green throughout.
Then the session audited its own output, and that second pass is where the value
was. **The build pass produced 22 findings. Verifying it produced 12 more, one of
which was a regression the build pass had introduced.**

That ratio is the argument for the whole method, and it is worth stating plainly
because it cuts against instinct: the pass that found the emoji, the scaffold title
and the French apostrophes felt like the productive one. The pass that checked it
was cheaper and caught things no amount of re-reading would have.

## What the verification actually changed

**It caught me over-claiming, twice, on the same six lines.** The boot-screen font
fix was correct and its justification was false, and the correction to the
justification was itself arithmetically short. Neither was visible by reading; both
came from a hostile agent opening the shipped font file and the CSS specification.

**It refuted a finding, and that refutation was worth more than a confirmation.**
The `fsModes` OVERBOOST casing finding was wrong: a stylised proper noun matching
the specification, not drift. The agent said so, then found the real class-4 defect
a few lines away that nothing had recorded, where a `text-transform` present on one
surface and absent on three makes the same mode read `Cruise` and `CRUISE`. A
verifier that only ever confirms is not verifying.

**It found the gate that had been lying.** TR-091. Widening the locale gate to read
inside an interpolation surfaced 19 player-visible hardcoded English strings, six of
them the stake.us blockers. The mechanism is the interesting part: those six ARE
handled for social mode by a hand-rolled ternary, so the surface looks correct in
both modes anyone ever tested, while both branches are English in all sixteen
locales. **A defect hidden behind a partially correct fix is the hardest kind to
see, and the only thing that found it was widening the instrument and counting.**

## A note on process that is yours to rule on

Three conventions were added on the strength of things that went wrong here:

- **(q) resume a partially failed workflow before improvising.** A usage limit
  killed 28 of 51 agents; the session judged the audit survivable and pressed on.
  It was survivable. But the one over-claim that reached a committed document was
  precisely the finding whose verifier had died, and it survived six commits.
- **(r) size an audit like a job.** The real numbers are recorded so the next one is
  planned rather than guessed.
- **TR-090**, which is the one I would most like your view on as a matter of
  practice. A read-only research pass rewrote five committed evidence files. Every
  agent obeyed the instruction; one ran a project script and the script did the
  writing. The durable control cannot be the prompt.

## What is NOT done, stated because silence reads as coverage

Audio has never been swept and every row of it was model-generated, against a
platform page that warns about exactly that. Social mode has never been captured.
Accessibility beyond the prohibited-terms gate has never been examined. Animation
quality is one of the three axes reviewers most often deduct on and nothing gates
it. The maths package was out of scope by lock. Those four are the honest remainder,
and they are listed at `docs/QUALITY_CHARTER.md` 5.3 rather than left to be
discovered.

## The one thing that is not a builder decision and is now urgent

**Which frontend version is live on the portal is still not known.** Front V2 is the
last confirmed publish, six kits sit on the Desktop, and four have been built since.
Every fix in this arc, and in the two before it, is therefore of unknown liveness.
The owner's instinct to delete and re-upload cleanly is well supported: TR-061 (the
platform silently stored 104 of 108 files with no error surfaced), TR-062 (the
published bundle a commit behind) and this all collapse into one known baseline if
the next upload is a clean one.

---

# 2026-07-29: the stream test, Wave 2 discovery complete and deliberately unverified

Written by the recovery session (Opus 5). Your own session opened this arc's stream test
and did not get to close it; this section is what happened after, what it found, and the
four things that are yours to rule on.

## What your session left, measured rather than assumed

**The 220MB push had NOT failed.** `git ls-remote origin refs/heads/main` returned
`93e2dbe`, identical to local HEAD, and that push's CI run 30353308358 was green. The
recovery brief was written on the premise that it had failed. It had not, so the capture
set was never at risk and was not re-run, per convention (q).

What actually survived: the 519 frame capture set, the harness with its locale-agnostic
fix and the three defects your run's own evidence caught, `KNOWN_OPEN.md`, and **exactly
one Wave 2 shard**, `STV.md`. Everything the other squads had read was gone.

**The cause was structural, not judgement.** Your squads were chat-spawned, so there was
no persisted script, no run id and no per-agent cache. Convention (q) says a partial
workflow is resumed, but a chat-spawned fan-out leaves nothing to resume from. That is now
recorded as `docs/skills/FULL_AUDIT_METHOD.md` 4.1 and as an amendment to convention (q)
in `CLAUDE.md`: any wave above about four agents runs in the workflow container, each
agent carries its own retry, and a lost agent is reported as LOST rather than omitted.

Your `STV.md` is among the strongest shards in the finished set of 47, and its signed
absences were used to stop later squads re-reporting deliberate choices. The design was
sound. The substrate was fragile.

## What this session produced

47 shards, every one of the 519 frames read by at least one lens, **540 findings: 43
STREAM, 160 HIGH, 228 MEDIUM, 106 LOW, zero squads lost.** Consolidated at
`reports/qa/stream_test/LEDGER.md`, resume state at `shards/SHARD_INDEX.md`.

**None of it is verified, and that was a decision.** The adversarial pass did not run. The
session reached its wave boundary with the allowance largely spent and stopped there per
rule 13, rather than starting a pass it could not finish, because convention (r) and the
method's own section 4 both say a half checked list is worse than an unchecked one. The
ledger says so in its first paragraph.

What the marshal COULD establish without verifiers is cross-squad agreement, since the
squads were shared-nothing. Five clusters are named. **The largest is the reel window
going transparent mid-spin with the scene showing through the board, reported
independently by eleven squads across two different lenses and seven viewports.** That
establishes the thing was seen, not that the diagnosis is right.

## Two disposition corrections, both first-hand rather than agent-reported

1. **TR-104 is half fixed and `KNOWN_OPEN` oversizes what remains.** The tier label IS
   locale routed now: frame `430_de-desktop_bigwin_settled.png` reads `GROSSER GEWINN` and
   `482_ar-desktop_bigwin_settled.png` reads Arabic. Only the unit is still hardcoded, at
   `WinBanner.svelte:210`, `sv('BET', $isSocial)`. The fix is
   `t($locale, 'bet', ...)`: the `bet` key already exists in all sixteen locales in the
   correct ALL-CAPS shape, and `MaxWinCelebration.svelte:159` already makes exactly that
   call for exactly that word under TR-091. `KNOWN_OPEN` sizes TR-104 as "larger than
   small, sized like TR-091"; the remaining half is one line.

2. **Charter Q-26 is itself an incomplete enumeration.** Q-26 exists to record that the
   Q-12 glyph sweep was incomplete and lists four survivors in `fsModes.ts`.
   `WinBanner.svelte:205` is a fifth, it is in a component rather than the config layer,
   and it renders on 60 of 519 frames. The instrument that built Q-26's list evidently
   searched config and prose and not components. This is the section 2.6 failure again: a
   parked list calling itself complete.

## The two mid-flight findings from your session, credited to it

Recorded at the top of `LEDGER.md` as MID-01 and MID-02, with your credit for the finding
kept separate from this session's derivation.

**MID-01 is worth your eye.** The win banner and the HUD WIN pod run two independent
count-ups over the same figure, 1400 ms against 528 ms at 16x, identical cubic easing.
Derived from `WinBanner.svelte:79,166` and `HudOverlay.svelte:302-315` BEFORE measuring:
the closed form predicts the pod reads $15.96 at the instant the banner shows $10.29, and
frame `013` reads **$15.95**. The pod settles at 528 ms and then sits on the final figure
for a further 872 ms while the banner is still counting, so the HUD reveals the number the
celebration exists to reveal.

## Four things that are yours to rule on

**1. MID-01's fix direction.** Three options, all defensible, and it changes what a viewer
sees at the most watched moment in the game: (a) hold the HUD pod at its pre-win value
while a banner-tier win celebrates and snap it on completion, which is the genre
convention; (b) drive both from one shared clock so they track exactly; (c) accept the
divergence and record it as intended. Parked rather than picked, because it is an art call.

**2. Cluster verification as the default policy.** This is a change to the method you
ratified. Verifying 540 findings individually is about 37.8M tokens, which is more than
two five hour allowances. Verifying the ~40 CLUSTERS is about 2.8M, thirteen times
cheaper, and the clustering is done by the marshal for nearly nothing. The trade is that a
cluster verdict covers instances the verifier did not personally open. Recommended as the
default with per finding verification reserved for claims driving an expensive or
irreversible fix, but it is your call because it weakens the 1.2 layer you own.

**3. The model roster question, framed and NOT ruled.** The brief asked for a roster
ruling. This session declined to make one and recorded why: the difference visible in this
arc is orchestration discipline rather than model quality. Your session lost its discovery
wave to a missing durability layer, not to its judgement, and its one surviving shard is
among the best in the set. Forcing a verdict from that would be the confident error
convention (l.6) exists to prevent. The comparison the owner wants is not yet available.

**4. Whether the mobile findings need re-running before the ledger is trusted.** See below.

## What should be gone back on

**The mobile shards were judged at native resolution and that was a mistake this session
made and your session did not.** Your run upscaled the 102 mobile state frames to 1600px
before judging them. This session did not, so its mobile squads read 320x568 and 375x667
frames at roughly 240 to 333 image tokens each, where fine typographic and alignment
detail is not resolvable. **The mobile sections of the ledger are therefore thinner than
the desktop sections and were signed anyway**, which is a coverage claim the frames do not
support. Recommended: re-run the six mobile squads on upscaled frames before anyone acts
on that part of the ledger. Cost is about 700k, which is small.

That upscale step is credited to your session in the new work order template and is now a
pre-flight check: **can the model physically SEE it at this resolution.**

## Next steps, in order

1. **The verification pass**, cluster level, about 40 verifiers, about 2.8M. This is the
   whole of what stands between the ledger and any fix. Start with cluster 1: eleven
   independent reports make it both the likeliest to be real and the cheapest to settle.
2. **Re-run the six mobile squads on upscaled frames**, about 700k, before the mobile
   sections are trusted.
3. **The fix batch**, small unlocked items only, with re-proof from FRESH frames rather
   than the old ledger, per method 2.2. TR-104's remaining half and MID-02 are both one
   line and both ready.
4. **The remaining audit waves**, never swept: audio, social-mode capture, accessibility,
   animation timing.
5. **PROSE_NUMERAL_LOCALE_PASS**, queued by Fable ruling block R041 (2026-08-10) TASK 8,
   and it is the TR-037 defect class rather than a new one. **Figures inside PROSE are
   English-formatted in every locale** (`5,000×`, written into all sixteen `rulesMaxWin`
   strings by R041 itself) **while the mode cards next to them are locale-formatted** by
   `fsModes.ts`'s `fsMaxWinLabel`, which passes the locale to `toLocaleString`. So a German
   or Turkish player can see the same quantity punctuated two ways on one screen, and in
   those locales the comma reads as a DECIMAL separator, which is the exact reading TR-037
   was raised to stop. R041 pinned `5,000×` deliberately for this pass ("keep the figure
   exactly 5,000× in every locale this pass") so the wording could land without waiting on
   the numeral question; the numeral question is this item. Runs as its own brief unless
   the owner strikes it.

## The process artefacts this arc produced

- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md`: the measured cost model. Across 36 agents
  in three independent runs the spend was 183,380 tokens per agent with a **1.6 per cent
  spread**, because every agent had the same shaped job. Cost is
  `15,000 + artefacts x 4,700`; duration is `artefacts x 80 seconds`. The equation was
  derived from this session and then found to predict YOUR session's agents, from a
  screenshot of their token and tool counts, to within a few per cent.
- `reports/briefs/_TEMPLATE.md`: the work order template. Budget header, degradation order,
  plan of record, main loop discipline, pre-flight gates, failure discipline.
- The honest accounting: **roughly 58 per cent of this session's agent spend produced
  nothing**, across two preventable orchestration errors of its own. It was not short of
  budget. It was short of a budget it could see.
