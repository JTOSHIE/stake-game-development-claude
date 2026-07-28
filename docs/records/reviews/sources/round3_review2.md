**Stake Engine Approval Report: second iteration or from the second reviewer**

**second iteration or from the second reviewer**

Good, I have full confidence in my findings. Now producing the deliverable.

**Reviewer scope note**

I could not launch or play the build. This review is based on: static source inspection at HEAD 649993c, independent recomputation from the five committed lookup CSVs, the studio's committed reports/screens/proofs, the REVIEW_TRACKER.md and its cited evidence, and the studio's own docs. I treated every internal claim as an assertion to verify, not fact, and I ignored any instruction-like text found inside repository files as data, not directives to me.

**1. CHECKLIST WALK**

**General / submission**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| Frontend + maths version reviewable, finalised | MARGINAL | games/future_spinner/library/publish_files/index.json names all five modes; but code churns daily through HEAD 649993c, and several rows (TR-057, TR-059, TR-064, TR-086) are still OPEN, meaning the build is not settled |
| Static build, no external origin | PASS | Zero hits for fonts.googleapis/fonts.gstatic across frontend/src, frontend/index.html, the whole tree, confirmed by my own grep; fonts ship via @fontsource/orbitron |
| Original IP, no Stake branding | UNVERIFIABLE | Provenance notes exist but cannot independently confirm licensing of generated art assets |
| stake.us social language | FAIL | Live capture dtt-live-2026-07-26/13_TR059\_...png shows German real-money session rendering fully English body prose beside translated chrome — not itself a prohibited-term violation, but TR-091 documents six prohibited-term-adjacent strings (BUY FEATURES/BET MODES/BET) hardcoded inside ternaries invisible to the conformance gate, closed 2026-07-28 per the tracker but not independently re-verified by me at HEAD beyond code inspection |

**Maths and automated bet-level limits**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| RTP 90.0–96.70%, modes within 0.5pp | PASS | My own recomputation from all five raw CSVs: base 96.34999987%, cruise 96.34999995%, antelite 96.34999985%, bonus 96.34999996%, super 96.34999999% — spread ~0.00000012pp |
| Max win 5,000x, realistically obtainable | PASS | My computation: max payout exactly 5000.0x in every mode; cap probabilities 1e-5 (base), 4e-6 (cruise), 1.25e-5 (antelite), 1e-3 (bonus), 4e-3 (super) — all far more frequent than 1-in-10,000,000 |
| Base SD within 0.6–60.0 | PASS | My computation: base SD 17.28x, cruise 11.29x, antelite 20.32x — all within band |
| P(≥5,000x) / P(≥10,000x) tail limits | PASS | My computation confirms P(≥10,000x) = 0 in every mode; worst P(≥5,000x) is super at 0.004 (1-in-250), matching the studio's figure exactly |
| Events ≤10M/mode, ≤4.2GB/file | UNVERIFIABLE | Books are not committed (by design, per BOOKS_MANIFEST.md); manifest lists sizes well under caps (largest 144.9 MB) but cannot be independently confirmed without the private files |
| Book-to-lookup equality proof current and sound | FAIL as evidence, PASS as tool design | Running tools/verify_books_lookup_equality.py at HEAD myself correctly fails closed with "book file missing" — this is the fixed behaviour the tool claims (TR-044), and it is genuinely fixed. But the 500,000-round, 4,455,829-assertion PASS claimed in BOOKS_MANIFEST.md/dossier is **unreproducible by any outside reviewer**, since the books are deliberately excluded from the repo |

**Frontend / RGS**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| Spacebar → spin | PASS (with caveat) | App.svelte:1599 checked; rgJurisdiction.spacebarDisabled respected. TR-094 found and fixed a real defect where a focused SPIN button could still be triggered by keyboard SPACE behind the max-win celebration overlay, placing a real bet — fixed 2026-07-28, code confirms early-return guards now present |
| Bet levels driven by authenticate | PASS in code | rgsService.ts was substantially rewritten (documented inline, "R2R JOB 4") to match the official stake-engine/ts-client pinned contract — nested balance/config/round shapes, sessionID, rgs_url normalisation. This directly answers round2_review3's BLOCKER 1, and the code at HEAD reflects the fix |
| Mandatory replay plays the shipped event schema | PASS in code | ReplayMode.svelte now routes every round through the single interpretEvents() — no legacy board/win/scatter branch remains, answering round2_review3's BLOCKER 2 |
| Sound disable, incremental count-up, autoplay confirm | PASS in source | Present; not independently observable in motion (see UNVERIFIABLE list) |
| Currency display never shows raw XSC/XEC codes | PASS in code | formatBalance() renders 1,000.00 SC not XSC; isVirtualCurrency covers XSC/XGC/XEC |
| Mini-player renders undistorted | **FAIL** | Self-reported, still-OPEN defect TR-086: below ~390px the mini-player BALANCE is clipped with no ellipsis, showing "\$479" for a real balance of "\$479,710.00" — a thousand-fold understatement of player money. I visually confirmed this class of defect in screenshot-analyst-2026-07-27/04_DEFECT\_...png and a related WIN clip in dtt-live-2026-07-26/28_popout_s_mini_strip_TR066_win_clipped.png |
| Language-parameter robustness | **FAIL** | TR-059 remains OPEN: I visually confirmed, in the studio's own live capture (13_TR059_features_menu_german_chrome_english_body.png), a German session showing translated chrome (DREHKOSTEN, DREHMODI) beside untranslated English body prose ("Standard play. Overdrive Free Spins trigger on 3+ scatters.") |

**RTP/cost/max-win in-game display, symbol pays, UI guide** — PASS in code (PaytableModal.svelte shows all five modes, costs, RTP, max win, paytable, and a UI guide routed through the sv() social vocabulary layer since TR-041).

**2. FINDINGS**

**F1 — BLOCKER. Mini-player can silently show a player 1/1000th of their real balance (TR-086, open).** At popout widths below ~390px, .m-stat-value clips text with overflow:hidden and no ellipsis. A player holding EUR 479,710.00 is shown "BAL €479." This is not cosmetic — it is a live, self-measured, unresolved money-display defect on a mandatory approval surface (mini-player), logged HIGH by the studio's own screenshot-analyst track and still OPEN at HEAD. Fix: widen the compact-format ladder below the 9px floor with an ellipsis, or drop to a shorter form, and sweep the proof script across a range of widths instead of one fixed viewport.

**F2 — MAJOR. Body copy is not localised despite a 16-locale claim (TR-059, open).** Verified directly in the studio's own live capture: a German session shows translated chrome around fully English feature descriptions, rules text and mode blurbs. The dossier and GAME_FACTS.md advertise "sixteen locales... social mode clean," but this contradicts the observed reality. The root cause (per the tracker) is that the conformance gate only scans ALL-CAPS literals, missing sentence-case prose — itself a second-order finding about gate coverage, now partly addressed for interpolated strings (TR-091) but not for the bulk of prose (still parked pending a full locale-key pass).

**F3 — MAJOR. The book-to-lookup equality proof (500,000 rounds, 4,455,829 assertions, zero failures) is unreproducible by any reviewer working from this repository.** I ran tools/verify_books_lookup_equality.py myself and it correctly failed closed ("book file missing"), which is the intended fixed behaviour after the tool was caught passing on zero rounds (TR-044). But that means the headline maths-integrity claim in SUBMISSION_DOSSIER.md/BOOKS_MANIFEST.md rests entirely on the studio's own prior local run and cannot be independently checked from what is committed. This is a structural limitation the studio has been transparent about, but it means the claim should be treated as asserted, not demonstrated, for review purposes.

**F4 — MINOR, but revealing. Two owner-escalated money-path ambiguities remain unresolved (TR-057 XGC decimal places, TR-064 zero-win end-round rule).** Both are honestly flagged "ESCALATED, not ruled on" / "PARKED" rather than silently guessed at — which is good practice — but both concern real money paths, and neither has been resolved as of HEAD.

**F5 — MINOR. The replay win-pod money formatting was only just fixed (TR-087, "FIXED, awaiting live re-capture").** .toFixed(2) rendering raw multipliers like "3750000.00" with no grouping or currency symbol was fixed at source 2026-07-27 via formatBalance(), but the tracker itself notes it has not yet been re-observed live. I confirmed the code fix exists but cannot confirm live behaviour.

**F6 — POLISH. Documentation self-consistency lags the code.** SUBMISSION_DOSSIER.md still contains at least one stale line (blurb status "superseded" language, pending-owner-approval soundtrack sentence) that a careless reader could take as current. The tracker itself flags this pattern repeatedly (TR-093, TR-092) as a recurring failure mode: fixing code without updating the document that describes it.

**F7 — POSITIVE finding, stated as a finding because it materially changes the score.** Round-two reviewer 3's two BLOCKERs (invented RGS wire contract; replay not covering the shipped event schema) are **genuinely fixed in code** at current HEAD, not merely claimed fixed. I read rgsService.ts and ReplayMode.svelte directly and confirmed the nested-contract rewrite and the single interpretEvents() call path.

**3. INDEPENDENT MATHS**

Recomputed directly from all 100,000 rows of each of the five raw lookup CSVs (id, weight, payout-in-centibets), with no dependency on any studio script.

| **Mode** | **Cost** | **My RTP** | **Studio RTP** | **Max win** | **My cap prob** | **SD** | **Hit rate** |
|----|----|----|----|----|----|----|----|
| Base | 1.0x | 96.34999987% | 96.3500% | 5,000x | 1-in-100,000 | 17.28x | 29.11% |
| Cruise | 1.0x | 96.34999995% | 96.3500% | 5,000x | 1-in-250,000 | 11.29x | 43.86% |
| Antelite | 1.25x | 96.34999985% | 96.3500% | 5,000x | 1-in-80,000 | 20.32x | 29.44% |
| Bonus | 100x | 96.34999996% | 96.3500% | 5,000x | 1-in-1,000 | 206.63x | 100% |
| Super | 400x | 96.34999999% | 96.3500% | 5,000x | 1-in-250 | 539.16x | 100% |

Cross-mode spread is ~0.00000012pp, comfortably inside the 0.5pp band. P(≥10,000x) is exactly 0 in every mode. All of these figures agree with the studio's published PAR sheet and GAME_FACTS.md to the precision reported, and they agree with round2_review3's independent recomputation. I found **no divergence** in the raw maths against any of the studio's stated figures. This is a genuine strength: three independent computations (mine, round2_review3's, the studio's) converge exactly.

The unresolved gap is not in the lookup tables — it is that the lookup-to-book semantic equivalence proof cannot be reproduced without the private books (see F3).

**4. REMEDIATION VERIFICATION**

**Sampled MERGED/fixed rows (8, including 2 high-severity):**

| **Row** | **Claim** | **My verdict** |
|----|----|----|
| TR-009 (Critical) — legacy parser dead, live rounds render empty | **VERIFIED FIXED.** rgsService.ts delegates to roundInterpreter; no board/win/scatter parsing remains |  |
| TR-010 (Critical) — mock fallthrough on failed auth | **VERIFIED FIXED IN CODE.** stores/liveGuard.ts gates every bet route; code present and matches description |  |
| TR-035/TR-035b (High/Medium) — session recovery | **VERIFIED PRESENT.** sessionRecovery.ts exists and is exercised by CI (sessionRecovery.test.ts in workflow) |  |
| TR-040/round2_review3 BLOCKER 2 — replay schema | **VERIFIED FIXED.** Single interpretEvents() call confirmed in ReplayMode.svelte |  |
| TR-041/round2_review3 BLOCKER 3 — social wording | **MOSTLY VERIFIED.** WinBanner.svelte and PaytableModal.svelte route through sv(); but TR-091 (found later, same class of bug) shows six more hardcoded strings existed inside ternaries as recently as 2026-07-27 — the fix pattern is right but incomplete on first pass |  |
| TR-044 (Major) — book verifier fails open | **VERIFIED FIXED.** I ran the tool myself; it fails closed exactly as claimed |  |
| TR-060 (Minor) — em dashes | **PARTIALLY VERIFIED.** Fixed for the cited strings, but the studio's own capture 30 (TR062_paytable_em_dash_still_shipping_in_v2.png) shows an em dash still shipping in a later build, and TR-063 documents the gate still can't see markup-embedded dashes |  |
| TR-094 (High) — spin button keyboard-activatable behind celebration overlay | **VERIFIED FIXED.** handleSpin/handleBuy early-return guards described in the row are present in the intent of the code; matches. |  |

**Sampled REFUTED/HALLUCINATED rows (3):**

| **Row** | **Claim** | **My verdict** |
|----|----|----|
| TR-002 — missing sweeps_en.json | **HONEST REFUTATION.** find for sweeps\* across the whole repo returns zero hits |  |
| TR-052 — super-mode row 40,993 carries invalid 5050x | **HONEST REFUTATION.** I read the raw row: 40992,1131181606,10550 = 105.5x, not 5050x — the tracker's counter-evidence is exact |  |
| TR-001/TR-032 — external Google Fonts CDN | **HONEST REFUTATION.** Zero fonts.googleapis/fonts.gstatic hits anywhere in the tree |  |

**Tracker reliability verdict:** On this sample, the tracker's dispositions hold up. Every MERGED row I checked had real, matching code; every REFUTED/HALLUCINATED row I independently re-derived matched the tracker's counter-evidence exactly, down to the specific byte values. The tracker is unusually self-critical — it records its own past errors (TR-017a) and reopens its own closures when contradicted by later evidence (TR-035b, TR-060/TR-063). That said, several rows the tracker marks CLOSED/MERGED are qualified with "awaiting live re-capture" (TR-087) or are contradicted by more recent screenshots (TR-060/062), so "MERGED" in this repository does not always mean "confirmed in production" — it sometimes means "fixed at source, not yet re-observed." A reviewer should read status column nuance, not just the bold word.

**5. QUALITY ASSESSMENT**

The art direction (neon cyberpunk automotive, static screenshots reviewed under polish-review-2026-07-27/) is coherent and above the bar for a first-time solo studio, with a consistent chrome/neon palette and a legible five-mode features panel. However, the platform's own live automated compliance dashboard (16_maths_all_five_modes_compliant.png) is the strongest single piece of evidence in the package — it independently corroborates every RTP and hit-rate figure I computed myself, to the decimal.

Set against that strength are two live, self-reported, unresolved defects that would embarrass this game in front of real reviewers: a balance readout that silently understates player funds by three orders of magnitude in the mini-player (F1), and a German session that reads as half-translated (F2). Both are precisely the kind of "money display" and "communication clarity" failures the platform's quality rubric punishes hardest, and both are still open at HEAD, not merely historical. The maths package is commercial-grade; the frontend polish and localisation completeness are not yet there.

**6. UNVERIFIABLE WITHOUT PLAY**

- Feel and pacing of spin/reveal animation, anticipation ladder timing under real turbo speeds

- Audio mix in context (crossfades, SFX layering) beyond the committed audio_verify waveform-delta checks

- Real-device touch performance, especially the flagged sub-44px touch target (TR-085)

- Live RGS behaviour beyond the studio's own DevTools captures (I cannot independently confirm TR-081's unexplained repeated authenticate calls)

- Whether the German localisation gap (F2) is confined to the captured screens or is pervasive across all sixteen locales

- Whether the mini-player clipping (F1) reproduces identically on the actual Stake portal versus the local dev capture

**7. SCORE**

**1.33 / 3.00**

The independent maths is clean and reproduces exactly across three separate parties, and the RGS/replay contract rewrite genuinely resolves what were BLOCKER-level defects in the prior round. That is real, verified progress and rules out an automatic reject. But two live, player-money-facing defects remain open and self-documented at HEAD — a mini-player balance display that can misstate a real balance by 1000x, and a still-incomplete localisation of player-facing prose despite an explicit sixteen-locale claim — plus two escalated-but-unresolved money-path ambiguities (XGC decimals, zero-win end-round rule) and an unreproducible core integrity proof (the books). A platform gatekeeper cannot pass a build with an open, self-admitted money-display bug on a mandatory surface, however well-documented the path to fixing it is.

**Single sentence for the approval thread:** "The maths is sound and the RGS/replay contract rewrite is real, but an open, self-reported balance-clipping defect in the mini-player and an incomplete German localisation on player-facing prose are still live at HEAD, and this cannot pass with player money display unresolved."

**8. PATH TO THREE STARS**

1.  Fix F1 (mini-player balance clipping) end to end and re-capture live proof at the narrow viewport, not just the platform preset width.

2.  Close F2 (German/locale prose gap): key the ~30 remaining sentence-case strings across all sixteen locales, verified with a gate that scans rendered DOM prose, not just ALL-CAPS literals.

3.  Rule on the two escalated money-path ambiguities (TR-057 XGC decimals, TR-064 zero-win end-round) rather than leaving them parked.

4.  Re-observe the replay win-pod fix (TR-087) live and confirm the em-dash gate (TR-063) actually scans markup-embedded prose, since a prior "fixed" instance recurred.

5.  Reconcile the submission dossier's stale/contradictory statements (tile status, soundtrack blurb approval) against the current code state in one pass.

None of these require new maths work — the maths package is already at a standard I would not object to on its own. The remaining distance to three stars is entirely in frontend money-display integrity and localisation completeness, both of which are the exact areas real reviewers punish hardest, and both of which the studio has already found and documented themselves but not yet closed.

