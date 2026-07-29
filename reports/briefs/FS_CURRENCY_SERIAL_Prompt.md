FS_CURRENCY_SERIAL_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus Ultra session on main, SERIAL money-path session per protocol rule 4: no parallel squads, sequential care, drafted per reports/briefs/_TEMPLATE.md. Explicit paths, no em or en dashes. One conditional lock sanction below, nothing else locked.

BOOT: CLAUDE.md (protocol rule 4 on the money path, rule 16 PREMISE PROVENANCE, conventions (e), (l.8) and (p), and the lock-exception mechanism with its LOCK-SANCTION token); docs/records/WAYS_OF_WORKING.md; reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md, which is the evidence; scripts/qa/locked_paths_gate.mjs, read BEFORE any locked work.

BUDGET: 7.0M usable, 1h30. Reserve 0.8M. **Main loop 5.5M. Agents 0.7M.**
**SERIAL BY RULING. Zero parallel squads.** Protocol rule 4 keeps the money path sequential, and Fable confirmed it for this session. Agents only to verify a finished table against the mirror, never to write one. Post the Plan of Record before any spend.

STOP LINES: no new job started at 25 minutes remaining or 2.0M left; close at 15 minutes remaining or 0.8M left, whichever comes first.

DEGRADATION ORDER: the table and its gate, then Class A proof ordering, then REQ-124, then REQ-016 derivation, then transcription. **A fix without its gate does not ship**: if the gate is not green at a stop line, revert the table rather than land an unproven money change.

DONE MEANS: all 36 supported codes render exactly the platform's published Example column, proven by a gate covering every code at every magnitude rung, seeded with a deliberately wrong row, green in CI.

PREMISE PROVENANCE, per rule 16, and three corrections were made before this brief was issued:
- **VERIFIED**: 23 of 36 codes diverge. Evidence `reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md`, measured against the platform table on two independent captures three weeks apart. Re-verify the 23-row list from that file before writing code.
- **VERIFIED 2026-07-29, path corrected**: the Supported Currencies table is at **`docs/stake-engine-live/2026-07-29/rgs.md`**, the fresh full capture. It also appears at `approval_guidelines_rgs_communication.md` in the same directory and at the older `docs/stake-engine-live/rgs-communication.md`. **Transcribe from the 2026-07-29 capture** and note if the three disagree.
- **CORRECTED, and this changes JOB 3's framing.** Fable's reply described REQ-124 as a live-versus-config contradiction, "the live authenticate ladder showed a $0.01 minimum, the locked config says $0.10, one of them is dead". **That is not what the record says.** REQ-124 at `rgs.md:295` is a PLATFORM REQUIREMENT: *"Offer bet levels starting at $0.01, $0.02, $0.05 and $0.10 rather than a $0.10 floor."* The $0.01 is what the platform ASKS FOR, not something observed live. `games/future_spinner/game_config.py:105-106` sets `min_denomination = 0.10` and a ladder starting at `0.10`. **Nothing is dead. The config is simply non-compliant**, which is a stronger basis for the sanction than "wrong or dead", not a weaker one. **Do not go looking for a live-versus-config conflict; there is no evidence of one in the repository, and a session told to find a conflict tends to find one.**
- **UNKNOWN, resolve before JOB 3 acts**: whether the RGS authenticate response can override the package ladder at runtime, which would change whether the locked line is player-visible at all. `frontend/src/lib/stores/betLadder.ts` uses `rgsBetLevels` with `BET_LEVELS` as fallback; the maths package ladder is a different surface. Derive which one a player actually sees before touching a locked file.

JOB 1, THE TABLE. Replace the `Intl`-derived fiat formatting in `frontend/src/lib/utils/currency.ts` with a single authoritative table of all 36 codes transcribed from the capture: symbol, side and spacing exact. **XGC and XSC rows are unchanged**, they already pass, and they are the proof that a written table is the right shape. `Intl` becomes an unreachable fallback, with a gate assertion proving no supported code can reach it. **The table ships whole per Fable's ruling**: landing seven now and sixteen later means two serial money sessions for one data structure, and partial-by-sample is the exact pattern being buried.

JOB 2, THE GATE, all 36 codes crossed with the magnitude ladder, **Class A codes first in the proof output** so the seven wrong-currency cases read first. Seeded per convention (p) with a deliberately wrong row, plus negative controls, and a paired positive for every negative control. Wire it with the self-test as its own step BEFORE the scan. **Re-run the money-fit and social conformance suites**, since symbol widths change: `frontend/scripts/layout_fit_gate.mjs`, `social_string_conformance.mjs`, `social_dom_conformance.mjs`, `a11y_social_terms_check.mjs`.

JOB 3, REQ-124, AND THE LOCK RITUAL. Derive first, per the UNKNOWN above: establish which ladder the player actually sees, the package ladder or the authenticated one, and document the derivation with file:line. **Only if the locked line is genuinely non-compliant AND player-visible** does the sanction apply.

**THE SANCTION, granted conditionally by Fable 2026-07-29 and activated by the owner's paste of this brief.** It lifts exactly two deny lines for exactly one line of one file:

- Deny lines to lift, temporarily and NEVER committed: `Edit(games/future_spinner/**)` and `Write(games/future_spinner/**)` in `.claude/settings.json`.
- Scope: `games/future_spinner/game_config.py:106` only, the bet ladder. Nothing else in the package.
- **THE COMMIT MESSAGE MUST CARRY THE TOKEN OR CI FAILS BY CONSTRUCTION.** `scripts/qa/locked_paths_gate.mjs` runs FIRST in CI, reads what actually landed in git rather than which tool was used, and rejects any commit touching a locked path without it. Exactly this line, on its own line, trailing slash included:

```
LOCK-SANCTION: 2026-07-29 games/future_spinner/
```

  The gate checks BOTH directions: every locked path touched must be named, and every path named must be touched. So that line and nothing more, and only on the commit that actually changes the file.
- Ritual, all of it, per convention (e): ONE file, ONE line changed; SHA-256 of every file under `games/future_spinner/library/` identical before and after, recorded in the commit; deny lines restored; `git diff .claude/settings.json` verified EMPTY before any commit; tracker row updated with the derivation.
- **The optimiser is not bit-reproducible and published lookup tables are frozen truth.** Changing a bet ladder must not regenerate them. If the change implies any lookup table alteration, STOP and park: that is a different sanction.

JOB 4, REQ-016, method not guess, per Fable. **Quote the platform's mirrored words verbatim** into the tracker row from the 2026-07-29 capture. If the platform explicitly mandates the TM line in-game, the platform's words win over the standing no-Stake-branding rule and the row records that. If the text is ambiguous, **park with one owner-question line and ship no interpretation.**

JOB 5, TRANSCRIPTION AND CLOSE. Transcribe Fable's 027 rulings into `reports/FABLE_COMMS.md` with attribution and date, in Fable's own words where quoted and marked as summary where not, per convention (l.7). Acknowledge and disposition the four entries 026 names (020, 023, 024, 025), applying standing rulings where they match and queueing genuinely new items. **Record that Fable has bound its ratification language to same-turn verification**, which is the process change that stopped two stale rulings. Close per rule 10 with the run link, Plan of Record graded, and FOR THE NEXT SESSION: the TRUE fixdown, premise corrected, **MID-01's shared clock still unbuilt, 18 parked clusters, 118 upheld findings at zero fixed, 50 requirements unguarded**, every count to be re-verified from the ledgers at that session's boot rather than carried from here.

WHAT THIS SESSION MUST NOT DO: no parallel squads, it is a money-path session. No locked path other than the one line named, and none at all if the derivation does not warrant it. Do not regenerate any lookup table. Do not start the fixdown. Do not widen currency gate phase 2.
