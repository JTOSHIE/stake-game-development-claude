# Brief saved verbatim: FS AUDIT REMEDIATION (2026-07-27) + owner observations

Saved per conventions (b) and (f). **Not yet executed.** Received mid-flight during
OWNER AUDIT ROUND 4; sequencing recommendation recorded in `reports/FABLE_COMMS.md`.

---

## Owner observations, relayed 2026-07-26 during Round 4

Recorded verbatim in substance, as clarifications to Round 4 items 1 and 3 plus one
new finding.

1. **Mobile-only splash after the spin.** "When I was talking about the bonus after
   the splash screen, when I'm on mobile, it takes me straight to Overdrive free spins
   and continue. It's another splash screen after the re-roll spin is one. Now it has
   to come up on a complete new refresh, so I had to go into incognito mode for it to
   actually come up again, but that does not come up when I load into desktop mode."

2. **The pink is about borders and shading, not buttons.** "When I talk about the
   bonus going pink, I'm talking about the borders, the colour shading. Yes, I
   understand that the buttons are pink when you go to select the bonus itself, but it
   needs to differentiate itself between a bonus that has been spun in versus a bonus
   that you pay for. That's why you want the different colour."

3. **NITRO affordability may explain the mis-clicks.** "When selecting the NITRO
   Overdrive Bonus, it's not always selectable if you haven't got enough funds because
   it's obviously 400x the bet size. Sometimes you need to put: if you were getting a
   mis-click or it wasn't clicking correctly, that could be one of the reasons."

---

## FS AUDIT REMEDIATION brief, verbatim

FS AUDIT REMEDIATION, 2026-07-27. Opus, High effort; conventions, locks and reporting as pinned; review lane; fresh branch; comms entries per milestone; proofs to reports/screens/audit-remediation-v1/. R1, EVENT CONTRACT UNIFICATION, the priority: the live path parses legacy board/win/scatter inside locked rgsService.ts while the canonical roundInterpreter and shipped books use reveal/winInfo. Diagnose the seam: if rgsService exposes the raw round events in its result, build one unlocked adapter routing every live round through roundInterpreter before presentation and reduce the legacy walker to dead code recorded in LOCKED_FILE_DEBTS; if the raw events are not exposed, a SANCTIONED LOCKED PASS on rgsService.ts is PRE-GRANTED for this single purpose (deny-lines lifted per convention f, empty settings diff before commit) to align it to the canonical schema by delegation, never by a second parser. Prove it: decode real book rows from the local books and drive them through the live path end to end; replay uses the same adapter; add a permanent fixture test pinning the canonical schema. R2, MOCK CONTAINMENT: production builds must be structurally unable to reach _mockSpin: compile the mock path out via the PROD flag; live auth failure hard-disables betting with a player-visible error state and no fallthrough; assert by building production and proving the mock symbol is absent from the bundle. R3, BOOKS VERIFICATION: verify all five local books exist matching index.json, re-record SHA-256s in dossier section 5, write scripts/verify_books_lookup_equality.py proving per-row summed event payout equals the lookup payout for all 100,000 rows in all five modes, commit results, and reword the dossier to distinguish repo-committed artefacts from the local upload set so the misread class dies. R4, SOCIAL AND CURRENCY COMPLETION: add XEC to the SC-format family; derive social mode from currency code with the query flag as override only; sweep the interface guide and every aria-label and accessibility string for real-money terms (Bet, Max Bet, buy) into the social layer; extend the DOM-level prohibited-term test to accessibility attributes. R5, BET-LEVEL UNIFICATION: every bet-changing surface, FeatureMenu steppers included, drives from the authenticated level model; remove the gameStore ladder dependency frontend-side; assert with an unusual ladder fixture. R6, LOCALE WIRING: apply the launch lang parameter to the locale store before first render with English fallback; fuzz all sixteen plus unknown values; proofs of two non-English locales rendering. R7, RG ENFORCEMENT: filter autoplay count options to the jurisdiction cap, consume turboDisabled by disabling and resetting the control, enforce minSpinMs on manual and turbo paths; extend the RG soak to a capped-jurisdiction fixture. R8, MODAL SAFETY AND AFFORDABILITY: shared blocking-modal state that the spacebar handler and autoplay respect; the buy confirmation computes affordability from the selected tier's actual cost and the final handler revalidates balance against MODE_COST times bet immediately before the paid call; extend the boundary assert to the confirm surface at both tiers. R9, RULES DISCLOSURE: add the 6-plus scatter treatment (evaluation, payout at current meter, retrigger, any cap) to the player rules in all locales and social variants, consistent with the PAR. R10, TYPE ZERO: fix all 11 svelte-check errors including the RainLayer parser chase; drop the baseline ratchet to zero and make CI enforce it. R11, SESSION RECOVERY: hydrate an active round from authenticate.round and resume the feature presentation safely after reload; implement idempotent endRound retry with reconciliation; add a mid-feature-reload test against the mock and document the live-path verification for DTT staging. R12, EVIDENCE HYGIENE: supersede the stale failing audio_verify JSON per convention h and regenerate green audio evidence including bed swap and reversion; replace the Vite favicon with the 32px hero icon and purge starter residue; keep the buy dialog's RTP and max-win disclosure present at all viewport heights including 390x664. R13, CLOSE: full conformance suite, the two heavy suites attempted, all proofs regenerated from the closing commit, comms entry with a finding-by-finding disposition map back to the external review. SEQUENCING NOTE recorded in the map: Developer Testing Tool staging moves up to immediately after this pass merges, before the internal external-audit session, because real-RGS testing is the only environment that exercises R1, R2 and R11 authentically.
