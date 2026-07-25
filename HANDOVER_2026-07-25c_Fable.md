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
