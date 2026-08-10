FABLE INDEPENDENT AUDIT: FUTURE SPINNER AT MAIN 7f79148 (2026-08-10)
Auditor: Fable. Method: first-hand only. One repository clone at HEAD
7f79148598e55d465265dcd5ca53c3fafcd1fa1a, tree clean (git status empty), CI green
16/16 per the run attached to HEAD. Australian English, no em or en dashes.

SECTION 0. SCOPE AND METHOD
Read: FABLE_COMMS 042 to 044, OWNER_RULINGS_PRESUBMISSION.md (sections A to L),
FINDINGS.md register, REVIEW_TRACKER.md, CLAUDE.md, COMPLIANCE_WATCH.md, the
stake-engine-live mirror and its manifest, game_metadata.json, and the source of
every surface named below. Ran: machine_tell_gate, hardcoded_string_gate,
check_autoplay_confirm_gate, evidence_hygiene_gate, r042_verify (via tsx), and a
full production build (npm ci, npm run build) to audit the artefact rather than
the source. Recomputed: all five lookup tables with Python Fractions, no floats.
Fetched: stake-engine.com live pages where the site architecture allowed.
Tagged per rule 16: VERIFIED means I reproduced it myself; REPORTED means I read
a committed artefact claiming it; UNKNOWN means neither.

SECTION 1. INDEPENDENT MATHS RECOMPUTATION (VERIFIED, primary data)
Source: games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv,
100,000 rows each, exact rational arithmetic over (id, weight, payout).
  base      RTP 96.34999987%   max payout 500,000   P(cap) 1.00e-5
  cruise    RTP 96.34999995%   max payout 500,000   P(cap) 4.00e-6
  antelite  RTP 96.34999985%   max payout 500,000   P(cap) 1.25e-5  (cost 1.25)
  bonus     RTP 96.35000000%   max payout 500,000   P(cap) 1.00e-3  (cost 100)
  super     RTP 96.35000000%   max payout 500,000   P(cap) 4.00e-3  (cost 400)
Findings. (1) Every mode displays 96.3500% at quoted precision; the declared
rtpTarget 96.35 in game_metadata.json is accurate. The internal claim of exact
rational equality is overstated by between 1.1e-9 and 1.5e-7 percentage points
per mode (audit finding AF-1, wording only, no player or platform impact; the
exact fractions are in the audit evidence, e.g. base
108480455878185533/112589990681340000). Spread across modes rounds to 0.0000pp
as ratified. (2) Super P(cap) 4.0e-3 raw reproduces the ratified tail figure
(3.2e-3 after the documented 0.8 cost scale), inside the 1e-2 limit. (3) THE
BASIS RULING IS PROVEN FROM PRIMARY DATA: the cap is 500,000 centibets in all
five tables including the 100x and 400x modes, so the cap anchors to the bet
parameter (base bet), worth 50x and 12.5x of outlay in the buy modes. Section I
and Brief A's base-bet wording are therefore correct, and section K's surviving
"total bet" string is confirmed wrong. (4) Declared platform metadata (maxWin
5000, betLevels 0.10 to 100.00, stepBet 0.10, stateless true) matches the tables
and the frontend ladder.

SECTION 2. BRIEFS A AND B EXECUTION (VERIFIED)
Brief A landed in full: de rulesMaxWin now reads 5.000x and Basiseinsatz
(prose.locales.ts:146), tr reads temel bahsinizin 5.000x kati (line 1004),
responsiblePlayBody resolves in all fifteen non-English locales, volLow through
volExtreme are keyed, and r042_verify, which I ran myself, reports 99 checks and
146 strings PASS against the committed ruling. Brief B landed in full:
selectAuto and confirmAuto are split (HudOverlay.svelte:206,214),
isAutoPlay.set(true) exists exactly once inside the confirm handler (line 228),
the counts are role menuitemradio with aria-checked (lines 516 to 520), the
rewritten gate passes with the structural assertion, and the before and after
frames are committed under reports/screens/r042b/. The four builder deviations
are judged as follows and RATIFIED: the fourteen-string French apostrophe
normalisation across both files (the per-file scan blindness lesson is adopted);
the Japanese stem substitution leaving the amount suffix intact (correct
Japanese, correct meaning); sections J and K escalated rather than patched
(exactly right under the maths-disclosure rule); and the evidence ratchet frozen
at 32 rather than fixed unbriefed.

SECTION 3. SHIPPED KIT AUDIT (VERIFIED, built by the auditor from HEAD)
Build reproduces cleanly: 77 files, 12,328,647 bytes (12.33 MB) against the
25 MB cap. Zero runtime network egress: a sweep of every built asset finds no
fetch to an absolute URL, no WebSocket, no XMLHttpRequest, no sendBeacon; the
only absolute URLs present are XML namespaces and library error-message links,
which are strings, not requests. machine_tell_gate passes on BOTH source and the
built dist. Orbitron ships self-hosted as three woff2 files inside the kit. The
kit size on record elsewhere (about 9.5 MB) is stale since audio landed; update
to 12.33 MB (audit finding AF-3).

SECTION 4. GATES RUN BY THE AUDITOR
machine_tell_gate: PASS (76 source files plus dist). hardcoded_string_gate:
PASS, 0 outstanding, 2 exempt by design with reasons. check_autoplay_confirm:
PASS with the structural claim. evidence_hygiene: PASS, 32 frozen on a
shrink-only ratchet. r042_verify: PASS, 99 checks. Every run left the tree
clean. Not re-run by me (browser required): popout_conformance, social DOM and
replay contract proofs, language fuzz; their committed artefacts stand as
REPORTED with dated evidence under reports/qa/ and reports/screens/.

SECTION 5. PLATFORM REQUIREMENTS MATRIX
Statelessness: VERIFIED by table structure and committed collapse artefacts;
live clause corroborated today ("Each bet must be independent of previous
outcomes"). Autoplay confirmation: clause at front-end-communication.md:40,
"the player must confirm the autoplay action, games are not allowed to
automatically place consecutive bets with one click"; implementation now
satisfies both clauses by construction; VERIFIED. Replay sounds: required at
game-replay-requirements.md:105 and 130 ("Show all animations, sounds, and
visual effects"); ReplayMode.svelte contains zero audio references; OPEN,
blocker B9. Spacebar: mapped with the official disabledSpacebar flag honoured
(App.svelte:1826-1852); VERIFIED at source. Bet levels and minStep: betLadder.ts
derives from the authenticate response; declared ladder matches metadata;
VERIFIED at source. Per-mode cost, RTP and max win display: present on cards,
rules and footnote, with per-locale numerals correct since Brief A; ONE
CONTRADICTION remains (section K, below). Count-up: tween-based incremental
display present (WinBanner). Sound disable: master mute plus independent music
and SFX volumes (soundService.setMuted:180, audioSettings.ts); VERIFIED at
source. Same-origin: VERIFIED at artefact level (section 3). Social vocabulary:
the platform's 39-row table transcribed verbatim with content sha256
b115c7a1..., enforced by sv() and the replay contract gate; VERIFIED at source,
proofs REPORTED. IP and trademark: owner-side, OPEN. Tile kit inside 3 MB:
REPORTED (register), not re-measured.

SECTION 6. LIVE DOCUMENTATION POSTURE (honest limits)
stake-engine.com/docs is client-rendered; my fetch tooling receives the loading
shell. What could be corroborated live today via indexed content matches the
mirror word for word on the approval-guidelines clauses (statelessness, IP,
blurb requirement, stake.us language conditions). For everything deeper, the
freshest first-hand source is the repository's own dated capture of 2026-08-09,
one day old, hash-manifested, refreshed by the project's mirror tool; the public
GitHub docs mirror remains disqualified as stale. Standing direction: re-run the
mirror refresh on submission morning and treat any delta as a stop.

SECTION 7. OPEN REGISTER AT HEAD, RANKED
1. B12 / section H, live settle failure: a settle that fails during ordinary
   play refunds the optimistic debit, sets no guard, and allows a second stake
   on an open round. The one remaining item that costs a player money. Next
   brief (R042-D), unlocked-first design via the recovery probe, sanction
   fallback naming settings.json deny lines 8-9 if the locked file must move.
2. Section K: rulesOverdriveTrigger still says total bet in sixteen locales and
   now contradicts the corrected basis on the same screen. Wording is ruled
   (base bet, same substitution table as A3); execution awaits R043.
3. Section J: modeOverboostBlurb figures 1.6 and 1.25 in en punctuation in the
   ten comma-decimal locales; one-line extension of the A2 mechanism; R043.
4. Majors 12 and 13: the Overdrive rules block claims two modes and an
   unqualified 1x meter start; corrected wording and sixteen-locale text owed
   by Fable in R043.
5. B9: silent Bet Replay; Brief C, map book events onto the existing audio
   pipeline with mute respected.
6. Q6: the 400-body field, UNKNOWN, armed and waiting on one owner launch URL.
7. Hygiene majors: evidence ratchet at 32; REVIEW_TRACKER carries no R042 rows
   while OWNER_RULINGS does (AF-2); documentation staleness cluster (register
   majors 8 to 11 and 17 to 19); roughly seventy majors total outstanding, to
   be triaged in clusters at the next check-ins.
8. Owner standing items: trademark searches, blurb approval, portal one-timers,
   play-test of the current preview.

SECTION 8. AUDIT FINDINGS NEW IN THIS PASS
AF-1 (info): "exact" RTP equality overstated; displayed figures correct; adjust
internal wording, no player impact. AF-2 (hygiene): tracker not current with
R042; single-register principle wants the tracker updated or OWNER_RULINGS
declared the register of record. AF-3 (doc currency): kit size records say
9.5 MB, artefact is 12.33 MB. AF-4 (positive assurance): zero runtime egress in
the built kit, confirmed directly, which is the platform's classic rejection
avoided at artefact level, not just source level.

SECTION 9. VERDICT
Everything closed to date is genuinely closed: I reproduced it rather than read
it. The maths is sound at primary-data level and its disclosure layer is now
correct everywhere except the four wording items above. The game is NOT
submission-ready today: one money-path defect (B12), one conformance feature
(B9), four ruled-but-unexecuted wording items (J, K, majors 12 and 13), one
UNKNOWN (Q6), and the owner gates stand between HEAD and the portal. The path
is short and fully specified: R042-D, then R043 (wording block plus Brief C),
then major clusters, then the final Fable verification round against the
submission candidate, then owner one-timers. Nothing in this audit found a
defect class without an instrument now guarding it, and nothing found the
instruments lying.
