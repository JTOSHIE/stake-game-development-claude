# The fifty-one: mapping to estate evidence, 2026-08-13 (R056 TASK 2)

Companion to the verbatim capture at
`docs/stake-engine-live/2026-08-13/submission_checklist_we_roll_spinners.md`; item
numbers [01] to [51] are that file's reference numbering. This table exists so the owner
can walk the checklist and see what the estate holds behind each item. NOTHING here ticks
a portal box; the disposition column says what the ESTATE holds, and the reviewer's
judgement remains the reviewer's.

**CORRECTED 2026-08-15 by R071 TASK 8, and the correction matters because the earlier
wording set up a job that does not exist.** Reading "the owner's walk of the checklist"
beside a portal showing 0 of 51 invites the conclusion that fifty-one boxes are waiting
for the owner to tick. They are not. **The Guidelines checkboxes are ticked by REVIEWERS,
not by the studio, so 0 of 51 is the EXPECTED state and is not an outstanding action, not
a finding, and not something to flag.** Confirmed by the owner and recorded in the living
handover at `HANDOVER_2026-08-15_Fable.md`: "The Guidelines checkboxes in the portal are
ticked by reviewers, not by the studio. 0/51 is the expected state. Do not flag it." The
walk is still worth doing, for the owner's own confidence in what sits behind each row.
It is a READ, not a data-entry task, and the OWNER disposition in this table marks the
items that genuinely need him, which is a much shorter list than fifty-one.

Dispositions used: **EVIDENCED** (clean estate evidence, cited), **FLAGGED** (evidenced
AND the item speaks to currency display or to work amended this session, so the note
names the ruling), **ESCALATED** (no clean dedicated evidence; owner and Fable decide,
never self-assessed green), **PORTAL** (the portal's own recorded state), **OWNER**
(an action only the owner performs), **POST-SUBMISSION** (a state that can only exist
after submission or approval).

| # | Item (verbatim, abbreviated) | Disposition | Evidence and citation |
|---|---|---|---|
| 01 | Authenticates with RGS on launch | EVIDENCED | `rgsService.ts` `authenticate`/`initRGS` (locked canonical surface); behavioural rounds per mode with frames via `frontend/scripts/r047_verify.mjs`; live portal session played 2026-08-11 (Q6 capture, `reports/FABLE_COMMS.md` 052-era record) |
| 02 | Auth fails correctly with invalid rgs_url | EVIDENCED | `frontend/scripts/r057_invalid_rgs_proof.mjs` (R057 TASK 1, CI leg "browser: invalid rgs_url guard"): a refused-port rgs_url raises the keyed auth-failed banner in en and de within 0.1s, a press on the spin control puts nothing on the wire, seeded per (p) by severing the guard. The adjacent dialect evidence stands beside it (`r045_error_field_proof.mjs`) |
| 03 | Bet button sends play request | EVIDENCED | `rgsService.play` (locked); one round per mode driven and frame-verified in `frontend/scripts/r047_verify.mjs`; autoplay legs drive the same path (`r042b_autoplay_proof.mjs`) |
| 04 | No Stake Engine Loader | EVIDENCED | `frontend/index.html` is the custom document by direct read (favicon, title, `/src/main.ts` only; no platform loader script); dist is built from it (`frontend/scripts/dist_hygiene_gate.mjs`) |
| 05 | Title unique, no restricted terms | EVIDENCED | Trademark evidence 2026-08-11: IP Australia exact 0 results, USPTO `CM:"Future Spinner"` genuine "No results found" (`docs/records/`, R050 TASK 5 captures); "Future Spinner" carries no restricted term (restricted-term scans: `frontend/scripts/social_string_conformance.mjs`) |
| 06 | Assets not offensive/inappropriate | EVIDENCED | All art in-house from vector masters or owner-commissioned with recorded provenance (CLAUDE.md Assets section; `scripts/assets/canonical_sources.json` registry, convention (u)); owner reviewed every promoted final (R050 Checkpoint One) |
| 07 | Sufficiently distinct from existing titles | EVIDENCED | The distinctness attestation at `docs/records/DISTINCTNESS_ATTESTATION_2026-08-13.md` (R057 TASK 4), every clause cited (five-mode maths, the Overdrive meter mechanic, provenanced art, the cleared title), **SIGNED by the owner 2026-08-13** (the sign-off block, item 3, quoted verbatim in the record). Distinctness against the catalogue remains the reviewers' judgement; the signed record shows the basis |
| 08 | Thumbnail meets artwork guidelines | EVIDENCED | Portal pre-check reads "Thumbnail is set." (captured 2026-08-13); tile master 408x546, the measured de facto geometry of published games (`design-system/brand/tile/GENERATION_NOTE_composed_master.md`); promoted set with provenance at `assets/portal/` |
| 09 | Dynamically uses betting parameters | EVIDENCED | `src/lib/stores/betLadder.ts` drives from `rgsBetLevels` (authenticate response) with the hardcoded array as fallback only; `betLadder.test.ts` pins it including the three TR-013 arithmetic cases |
| 10 | Active rounds restore the bet amount | EVIDENCED | `src/lib/stores/sessionRecovery.ts:251` sets `betAmount` from `round.amount`; the comment at lines 267 to 276 quotes this checklist item verbatim as its driver; `sessionRecovery.test.ts` |
| 11 | Supports and displays currencies correctly | FLAGGED | `src/lib/utils/currency.ts` (49-row transcription of the published table, unified resolution path); `currency.test.ts` (116 assertions); `frontend/scripts/currency_table_gate.mjs` parses the platform mirror at runtime. **Currency-display item, flagged per the brief: R056 TASK 1 reversed XEC to the published row SC (rgs.md:142) and the table gate now pins transcription fidelity** |
| 12 | Displays sub-cent payouts correctly | EVIDENCED | `frontend/scripts/r057_subcent_proof.mjs` (R057 TASK 2, CI leg "browser: sub-cent display"): the REAL 0.08x book round 47 at the $0.10 minimum bet renders $0.008 on the HUD win, win panel, ledger Total Won and Net, and the same in XSC, every expectation derived from `winFractionDigits`; frames at `reports/screens/r057-subcent/`; seeded per (p) with the widening severed. The proof also found and fixed the ledger's Total Won truncating through formatBalance (`SessionPanel.svelte`) |
| 13 | Zero-win bets send no end-round | EVIDENCED | `rgsService.ts` (locked): `needsEndRound = playResp.round ? playResp.active : playResp.winMicros > 0`, the official client's `active`-flag rule; a zero-win settled round sends nothing |
| 14 | Insufficient balance sends no play | EVIDENCED | `gameStore.ts:88` `canSpin` requires `$bal >= $bet` and gates the spin control (locked, canonical); buy tiers gated per-mode by `stores/buyAffordability.ts` (TR-016) |
| 15 | Main frame not scrollable | EVIDENCED | `frontend/scripts/layout_fit_gate.mjs` across seven presets in CI; its own header names this checklist line as its driver |
| 16 | Space bar bound to bet button | EVIDENCED | `src/App.svelte:1865` `handleKeydown` binds Space to `handleSpin` behind the same `canSpin` guard; typing fields and open modals exempted |
| 17 | RTP and Max Win in game rules | EVIDENCED | `rulesMaxWin` and RTP disclosure keys in `src/lib/i18n/translations.ts` all 16 locales; `disclaimer_conformance.test.ts` pins the disclosure; paytable frames in `reports/screens/` (R047) |
| 18 | Per-symbol payout information | EVIDENCED | Paytable renders per-symbol centibet values through locale formatters (TR-125, `toLocaleString` with the template scan seeded); behavioural frames R047 |
| 19 | Win combinations displayed | EVIDENCED | 1,024-ways explanation and per-symbol combination rows in the rules overlay (`translations.ts` rules keys; paytable frames R047) |
| 20 | Modes described with cost | EVIDENCED | `FeatureMenu.svelte` cards from `config/fsModes.ts` `MODE_COST`; `allModesLabel` in 16 locales (TR-126); `feature_price_proof.mjs` |
| 21 | Free game and re-trigger conditions | EVIDENCED | Rules state 3/4/5 scatters award 8/12/16 spins plus 1x/3x/10x, retrigger +5 (translations rules keys; matches `game_config.py` `freespin_triggers`) |
| 22 | General disclaimer included | EVIDENCED | Disclaimer in all locales (`prose.locales.ts`); `disclaimer_conformance.test.ts` is its pin (TR-128 kept the de register unified) |
| 23 | Auto-bet confirmation step | EVIDENCED | `frontend/scripts/check_autoplay_confirm_gate.mjs` and `r042b_autoplay_proof.mjs`, both CI legs with frames (TR-129) |
| 24 | High cost modes confirm before activation | EVIDENCED | Buy confirm dialog with per-tier price (`FeatureMenu.svelte`; `buyAffordability.ts` one truth for card and dialog, TR-016); R047 frames |
| 25 | Functions on Desktop/Laptop | EVIDENCED | The 24-leg browser matrix runs desktop; behavioural rounds with frames (`r047_verify.mjs`) |
| 26 | Functions on Popout S/L | EVIDENCED | `frontend/scripts/popout_conformance.mjs` CI leg at both popout sizes |
| 27 | Functions on Mobile | EVIDENCED | `portrait_layout_conformance.mjs` and the mobile presets of `layout_fit_gate.mjs`, CI legs |
| 28 | Double tap zoom disabled | EVIDENCED | `src/app.css:16` `touch-action: manipulation`, with the recorded reasoning for NOT using `user-scalable=no` (accessibility) |
| 29 | User interaction guide in game info | EVIDENCED | The guide section of the info overlay: `guideSpinName/Desc`, `guideBetPlusName/Desc`, `guideFeaturesName` and siblings in `prose.locales.ts` (all locales) and `prose.ts` (en) |
| 30 | Option to disable sounds | EVIDENCED | `src/lib/stores/audioSettings.ts` with the HUD mute control (`HudOverlay.svelte`); owner-accepted mix (TR-102 closed) |
| 31 | Supports English | EVIDENCED | `translations.ts` en is the base table of the 16-locale estate |
| 32 | Invalid language does not break display | EVIDENCED | `App.svelte` reads `?lang` and every read falls back per-key to en (`translations.ts:2700` to `:2706` `?? proseI18n.en` pattern); an unknown code renders complete English |
| 33 | Check 5 wins per mode against rules | EVIDENCED | `tools/verify_books_lookup_equality.py`: 500,000 rounds, five independent reconciliations per round, 4,455,829 assertions, 0 failures (TR-011); `frontend/scripts/round_payout_reconciliation_gate.mjs` at the display layer |
| 34 | Mystery Mode probabilities accurate | EVIDENCED | Not present: `games/future_spinner/game_config.py` defines no mystery mode; item is vacuously satisfied and the mapping says so rather than ticking silently |
| 35 | Social translations compliant | EVIDENCED | `social_string_conformance.mjs` and `social_dom_conformance.mjs`, both CI legs; social renders English only (below) |
| 36 | SC and GC supported, no "$" prefix | FLAGGED | `VIRTUAL_CURRENCIES` GC/SC with TRAILING symbol placement (`currency.ts`, `VIRTUAL_SYMBOL_TRAILING`); tests pin `1,000.00 SC` shape, never `$`. **Currency-display item: TASK 1's fidelity pin covers the virtual family, XEC now SC per the published row** |
| 37 | Social Mode terminology for mode naming | EVIDENCED | The social vocabulary system names modes per the terminology guidelines; `vocabulary.test.ts` and the social DOM leg assert the rendered names |
| 38 | Replay window free of restricted words | EVIDENCED | `replay_contract_gate.mjs` social leg asserts Token, never Currency, in the replay window (S2-C009, stake.us prohibited terms); restricted-term scans in the social gates |
| 39 | English only in Social Mode | EVIDENCED | `stores/socialLocale.ts` forces en in social mode (named by `prose.locales.ts` header as the enforcement point); there is deliberately no per-locale social table |
| 40 | Replay urls load and play the event | EVIDENCED | `replayService.ts` public endpoint; TR-132 fix proven against the platform's real captured payload (event 83776) in `replay_contract_gate.mjs`; owner confirmed the live render (R056 TASK 0 close) |
| 41 | Optional params currency, language, amount | EVIDENCED | `ReplayMode.svelte` reads currency, lang and amount from the query string; the contract gate drives all three (`driveReplay({qs})` scenarios) |
| 42 | Replay again after completion | EVIDENCED | `ReplayMode.svelte:487` play-again control (`replayAgain` key, both vocabularies), state reset at line 392 |
| 43 | UI displays bet cost and applied multiplier | FLAGGED | The replay banner and bet summary render cost and `payoutMultiplier` (R053 proof); **R056 TASK 3 fixes the FEATURE COMPLETE pod to show the round total, multiplier and amount from the envelope, and TASK 5 pins pod equals envelope payout** |
| 44 | Replays in Popout S | FLAGGED | Popout S replay renders (ReplayMode's own recorded 520-vs-400px fix); **R056 TASK 4 makes the replay view fit one viewport at the popout size and TASK 5 adds the no-vertical-overflow assertion with frames** |
| 45 | Bet-level templates applied | PORTAL | The approval landing's pre-check read "Valid betlevel template found." at capture, 2026-08-13 |
| 46 | Provably Fair and Replay enabled | **PLATFORM-MANAGED** | **CORRECTED 2026-08-20 by R073, and the correction is that this row asserted a control that does not exist.** It read "Portal settings toggles" and carried the item on the owner's standing one-timer list from R050 onward, so for three months the record described a switch for the owner to find and flip. **OWNER-OBSERVED at the portal, 2026-08-20: there is NO Provably Fair toggle in this game's Settings.** The item's own twin is the evidence that this is the platform's design rather than a missing control: **Replay is enabled and has no toggle either**, and its behaviour is evidenced independently at items 40 and 44. Both halves of this item are therefore states the platform manages for a published game, not settings a studio sets. **REMOVED from the owner one-timer list**: there is nothing for the owner to do here, and an item sitting on that list unactionable is worse than absent, because it makes the whole list read as optional. **THE CLAIM WAS NOT NEW AND THAT IS THE PART WORTH RECORDING.** An earlier round already had "no Provably Fair toggle exists on the portal" in front of it and correctly refused to act on it, because at that point it was an unsupported assertion: the review found zero occurrences of "provably" across every capture pack and no committed frame showing the portal surface where such a setting would live, so it was marked CONTRADICTED and unproven in either direction rather than believed. **What changed on 2026-08-20 is the provenance, not the claim**: the owner looked at his own portal. That moves it from an unsourced assertion to a first-hand observation by the only person who can make it, which is exactly the escalation path rule 16 describes, and it is why this row moves now and did not move then |
| 47 | Front and Math requests approved | POST-SUBMISSION | Reviewer-side state that exists only after submission; latest published versions front v9, math v1 (captured 2026-08-13) |
| 48 | Posted in stake-engine-game-approved channel | POST-SUBMISSION | Owner action after approval |
| 49 | Works on older mobile devices | EVIDENCED | Diligence pack at `reports/qa/r057_throttled_device_2026-08-13.md` (R057 TASK 3): mobile portrait under 6x CPU throttle, boot to interactive 528ms against 161ms at 1x, spin cadence animation-clocked at 1.24 to 1.32s and essentially unchanged; thresholds reported, not invented, because emulation is not hardware, and the pack records the owner's hand-test on real devices as one line when given |
| 50 | Approval request closed, emojis added | POST-SUBMISSION | Process step after go-live |
| 51 | Game Released | POST-SUBMISSION | The end state itself |

## The escalations, gathered (per the brief: never self-assessed green)

**DISPOSITIONED 2026-08-13 BY R057, the four rows above carrying the
citations.** The original escalations stand below as the dated record of what
was open when this table was first drawn:

- **[02] invalid rgs_url at launch**: adjacent evidence strong (error dialect proof, auth
  shape guard), the exact scenario undriven. One bounded proof if the owner wants it.
  *R057 TASK 1 drove it; EVIDENCED.*
- **[07] distinctness**: reviewer judgement by nature; the estate can only evidence
  originality of our own IP, which it does. *R057 TASK 4 staged the attestation; SIGNED
  by the owner the same day (the sign-off block, item 3); EVIDENCED.*
- **[12] sub-cent display**: the micros rule prevents float error but no proof renders a
  sub-cent payout and asserts the string. One bounded proof if the owner wants it.
  *R057 TASK 2 proved it and repaired the ledger row it found; EVIDENCED.*
- **[49] older devices**: emulation only. Hardware testing is an owner decision.
  *R057 TASK 3 recorded the throttled diligence pack; the hardware line stays the owner's.*

## Currency-display items against TASK 1, flagged per the brief

Items [11] and [36] are the two that speak to currency display. Both are green in the
estate AND both now sit on the R056 TASK 1 ruling: XEC displays SC exactly as the
published table row prints it (`docs/stake-engine-live/2026-07-29/rgs.md:142`), the
X-strip family rule survives only as defence in depth for codes with NO published row,
and `currency_table_gate.mjs` pins our label EQUAL to the published row so any platform
change rusts loudly. Item [43] and [44] are flagged to TASKS 3 to 5 of the same brief.
