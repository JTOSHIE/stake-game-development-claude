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

1. `feature/cohesion-pass` — the global grade is built and works; the depth haze does not
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
