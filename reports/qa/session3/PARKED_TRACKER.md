# UNGUARDED REQUIREMENTS: THE PARKED TRACKER

**JOB 3 of `reports/briefs/FS_SESSION3_REMEDIATION_Prompt.md`.** Every one of the 79
requirements with no proof path, with its disposition. Nothing is left unaccounted for.

Generated from `reports/qa/session3/mechanism_families.json` rather than typed. A hand-typed
list of 79 rows is where transcription errors live, and this session has already caught three
of its own.

Australian English, no em dashes or en dashes.

## Counts

| | Count |
|---|---|
| Requirements with no proof path | **79** |
| **HELD by a gate built this session** | **14** |
| PARKED with a stated reason | 65 |
| of which BLOCKED on a Fable ruling rather than on budget | 5 |
| of which genuinely unreachable by any mechanical proof | 6 |

**A park is a complete answer, not a failure**, per the brief. But the three kinds of park are
NOT the same claim and are never merged here:

- **PARKED, budget.** The instrument is real and buildable and this session ran out of
  allocation. Session 4 can build it from the register.
- **PARKED, BLOCKED.** An authority has to rule before it can be built. Requested, not assumed.
- **PARKED, unreachable.** No mechanical proof exists and inventing a proxy would be the
  wrongly-solved failure convention (l.6) names.

## HELD, 14 requirements now defended by a gate that has been seen to fail

| REQ | Sev | Mechanism | Requirement |
|---|---|---|---|
| REQ-079 | STREAM | M01 replay-contract-driven-session | Replay must load and play with no session and no authorisation, so a shared public URL works fo |
| REQ-083 | STREAM | M01 replay-contract-driven-session | Build the replay request as a GET on exactly that path shape, with rgs_url taken from the query |
| REQ-085 | STREAM | M01 replay-contract-driven-session | Fetch the round data on load, with no click or input needed to start loading. |
| REQ-098 | STREAM | M01 replay-contract-driven-session | A user-facing error state when the replay fetch fails, rather than a blank screen or a silent h |
| REQ-099 | STREAM | M01 replay-contract-driven-session | No control or path anywhere in replay mode can begin a real-money session. |
| REQ-132 | STREAM | M01 replay-contract-driven-session | The client must play back the round's bookEvents strictly in the order the book supplies them,  |
| REQ-040 | HIGH | M08 paytable-maths-parity | Make the max win figure printed in the game rules equal the maths package max win, per mode. |
| REQ-074 | HIGH | M08 paytable-maths-parity | Observed play, including paid combinations, must match the published rules and paytable exactly |
| REQ-077 | HIGH | M01 replay-contract-driven-session | Parse replay query parameters at boot and enter a replay mode that loads the identified round,  |
| REQ-080 | HIGH | M01 replay-contract-driven-session | Read and use all six required query parameters: replay, game, version, mode, event, rgs_url. |
| REQ-090 | HIGH | M01 replay-contract-driven-session | Issue the replay fetch using the values taken from the query string, not defaults or hardcoded  |
| REQ-094 | HIGH | M01 replay-contract-driven-session | Replay makes no authenticate, play, end-round or wallet calls; only the public replay endpoint  |
| REQ-140 | HIGH | M08 paytable-maths-parity | What the player sees on the reels, in win presentation and on the paytable must be the same eve |
| REQ-091 | MEDIUM | M01 replay-contract-driven-session | A visible loading indicator covers the fetch window. |

## PARKED, 65 requirements with an owner-facing reason

### M02: disclaimer-and-social-vocabulary-conformance (8 requirements)

**Instrument:** string-set assertion over the i18n prose layer in all sixteen locales

**Why parked:** NOT BUILT, budget. Ranked 2nd by coverage. The instrument is real and the assets exist (locale_prose_conformance.mjs plus the wired social vocabulary step). The expensive half is the social-branch literal scan, priced by its own squad at 350k alone.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-038 | STREAM | In social mode, never render "currency"; use "token". | as above |
| REQ-010 | HIGH | The disclaimer must convey that a malfunction voids all wins and plays. | as above |
| REQ-011 | HIGH | The disclaimer must convey that a consistent internet connection is required. | as above |
| REQ-012 | HIGH | The disclaimer must tell the player to reload the game after a disconnection to finish inc | as above |
| REQ-013 | HIGH | The disclaimer must convey that expected return is a long-run figure. | as above |
| REQ-014 | HIGH | The disclaimer must convey that the display is illustrative and models no physical machine | as above |
| REQ-015 | HIGH | The disclaimer must convey that the RGS response, not the frontend, settles winnings. | as above |
| REQ-016 | MEDIUM | Present in the platform's template disclaimer as its closing line. Whether this line is it | as above |

### M03: delivery-set-and-kit-payload-conformance (8 requirements)

**Instrument:** one read-only walk of design-system/brand/delivery/ and the kit copy manifest: names, PNG alpha, dimensions, hashes, size caps

**Why parked:** NOT BUILT, budget. Ranked 3rd. One read-only walk of design-system/brand/delivery/ covers all eight. The four delivery files and their hashes are already committed and verified by the panel, so this is the cheapest large win left.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-174 | HIGH | The provider logo must stay readable when scaled down to tile size, so thin strokes and sm | as above |
| REQ-164 | MEDIUM | Background plus foreground must total 3MB or less as a pair; the provider logo is not name | as above |
| REQ-169 | MEDIUM | Foreground is delivered as a high resolution PNG with a genuine alpha channel; JPG is not  | as above |
| REQ-170 | MEDIUM | Name the foreground file `<GameTitle>-FG.png`. | as above |
| REQ-171 | MEDIUM | Supply the studio's official provider logo, not the game logo or a wordmark variant. | as above |
| REQ-172 | MEDIUM | Provider logo is delivered as a high resolution PNG with a genuine alpha channel (same cla | as above |
| REQ-173 | MEDIUM | Name the logo file `<ProviderName>-Logo.png`, provider name first, `-Logo` suffix. | as above |
| REQ-176 | MEDIUM | At submission, upload the contents of dist/ (not the folder itself) into the platform's fr | as above |

### M04: currency-display-table-conformance (5 requirements)

**Instrument:** table-driven unit run of formatBalance against the platform Supported Currencies table

**Why parked:** NOT BUILT, budget. The panel confirmed the seeds are real: CAD, MXN, SGD, NZD and TWD all render a bare $10.00 against the platform table. NOTE REQ-126 has no reachable state at HEAD, since no bet below $0.10 is selectable, so half of it cannot be witnessed until the ladder floor changes.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-108 | STREAM | The table at lines 51 to 100 is the display specification for every supported currency: fo | as above |
| REQ-125 | STREAM | Determine the game's minimum win multiplier and render win amounts with 3 decimal places i | as above |
| REQ-127 | STREAM | In-game win readouts must show the exact win amount with no rounding; the balance readout  | as above |
| REQ-119 | MEDIUM | Keep currency out of round logic, bet arithmetic and outcome selection; it may change only | as above |
| REQ-126 | LOW | Show the extra decimal places only while the base bet is under $0.10; above that, use norm | as above |

### M05: money-readout-and-wager-bounds-live (5 requirements)

**Instrument:** driven browser session asserting the balance and win readouts are present and live, and that no submittable wager escapes the authenticated bounds

**Why parked:** NOT BUILT, and it needs redesign before it can be. PANEL FATAL x2: bet_selector_gate.mjs ODD_LADDER tops at 90,000 units so the wager-bound assertion is RED on a healthy tree before any seed is planted; and REQ-124 binds the MATHS package ladder (game_config.py:106, game_metadata.json), not the frontend fallback, so a green result would be false.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-041 | HIGH | Never submit a bet above 500,000 USD, so the bet ladder and any buy cost must stay at or u | as above |
| REQ-067 | HIGH | Show the live balance in the normal-play UI, updating with wagers and wins. | as above |
| REQ-068 | HIGH | Any round with a payout above zero must present its final win amount legibly. | as above |
| REQ-121 | HIGH | Clamp every wager the game can submit to the authenticated minBet and maxBet, not to a har | as above |
| REQ-124 | HIGH | Offer bet levels starting at $0.01, $0.02, $0.05 and $0.10 rather than a $0.10 floor. | as above |

### M06: commercial-obligation-tracker-rows (8 requirements)

**Instrument:** not a gate: a completeness assertion over owner-parked tracker rows

**Why parked:** PARKED BY DESIGN, not a gate. These are obligations on the STUDIO or on Carrot, not properties of the artefact, so no CI step can assert them. The panel was explicit that asserting a tracker ROW EXISTS is not asserting the obligation is MET. They belong in OWNER_CHECKLIST.md and are the owner's to discharge.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-186 | HIGH | Complete identity and verification document submission, otherwise no fee is payable howeve | as above |
| REQ-178 | MEDIUM | Written notification to Carrot the moment we detect a defect, including ones we find ourse | as above |
| REQ-181 | MEDIUM | Deliver object code within 3 days of acceptance, and any updated object code within 10 day | as above |
| REQ-187 | MEDIUM | Grant Carrot continuous real-time access to the development environment, which in practice | as above |
| REQ-188 | MEDIUM | Fund and supply whatever the certification and jurisdictional-approval process asks for, w | as above |
| REQ-189 | MEDIUM | On any notified breach of the clause 7.1a) game standards, remediate immediately at our co | as above |
| REQ-194 | MEDIUM | Register exactly one payout wallet on the team settings page; without it no payout can be  | as above |
| REQ-190 | LOW | At registration the studio must supply these six items, including an explicit 18-or-over c | as above |

### M07: shipped-asset-provenance-manifest (4 requirements)

**Instrument:** manifest of every shipped binary against committed generation records, by hash

**Why parked:** NOT BUILT, and it needs redesign. PANEL: the corpus is stated twice and differently, frontend/dist/assets at 107 files against frontend/public/assets at 1,015, so the gate has no defined failure condition until the corpus is settled. The load-bearing rights-basis field is not machine-derivable: the gate could assert a field is non-empty, never that it is true.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-147 | STREAM | The submitted game must be original, guideline-compliant, non-infringing and free of unlaw | as above |
| REQ-052 | HIGH | Every shipped audio and visual asset must be original to this title, with no web-sdk sampl | as above |
| REQ-138 | HIGH | Audit every shipped string, symbol, sound and marketing asset against these four categorie | as above |
| REQ-141 | MEDIUM | The submitted title must be materially distinct from anything already uploaded, not a resk | as above |

### M09: doc-claim-predicate-annotations (5 requirements)

**Instrument:** doc_currency_gate phase 2 predicates on designated documents

**Why parked:** BLOCKED, and NOT a budget decision. This widens doc_currency_gate PHASE 2, which Fable's ruling 5 caps at two named documents (SUBMISSION_DOSSIER.md and GAME_FACTS.md). The brief forbids widening it without a fresh ruling. REQUESTED AT reports/FABLE_COMMS.md ENTRY 026. Separately the panel found the load-bearing half has no predicate that can distinguish a runtime fact from any other number in prose.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-135 | HIGH | The game's runtime behaviour must match the documentation handed to Carrot, so the docs an | as above |
| REQ-183 | HIGH | Produce and hand over integration, operation and ongoing-management documentation; this is | as above |
| REQ-150 | MEDIUM | Write and submit a short theme-and-mechanics blurb alongside the approval request. | as above |
| REQ-180 | MEDIUM | Do not treat an upload, a passing gate or a portal state as acceptance; only Carrot's writ | as above |
| REQ-175 | LOW | Tile pixel geometry is NOT stated anywhere in this capture: no pixel dimensions, no aspect | as above |

### M10: shipped-artefact-external-origin (2 requirements)

**Instrument:** driven session over the built bundle asserting every request resolves to the serving origin, plus a dist byte-scan for telemetry sinks

**Why parked:** NOT BUILT, budget. No panel objection. The instrument already half exists at platform_conformance_item2.mjs sameOriginSweep and build_diet_verify.mjs; this is a merge plus a wire plus a seed.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-104 | HIGH | Ship only static assets; zero runtime requests to any external host, including external fo | as above |
| REQ-146 | HIGH | The shipped game must not collect, store or transmit player personal data to us: no studio | as above |

### M11: dependency-licence-and-advisory (2 requirements)

**Instrument:** one lockfile walk yielding licence field, advisory query and git-pin check

**Why parked:** NOT BUILT, budget. No panel objection. One lockfile walk yields the licence field, the advisory query and the git-pin check; the panel merged two proposals into one and priced the pair at 155k.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-139 | HIGH | Run and record a security pass over the shipped bundle and its dependencies, and remove wh | as above |
| REQ-143 | HIGH | Prove no GPL or other copyleft dependency is bundled into, compiled with or linked to the  | as above |

### M12: entry-eligibility-clock (2 requirements)

**Instrument:** date and step assertions against the competition deadline

**Why parked:** NOT BUILT, budget. No panel objection.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-191 | HIGH | Three entry steps, all completed before the Closing Date: hold an account, build the game  | as above |
| REQ-192 | HIGH | Hard submission deadline for competition eligibility, 11:59pm AEDT 1 August 2026; entries  | as above |

### M13: prohibited-content-lexicon (2 requirements)

**Instrument:** token scan of shipped strings and asset names

**Why parked:** NOT BUILT, and a token scan is the wrong instrument. PANEL: the platform clause at terms.md:112 is a four-part CATEGORY definition, not a lexicon, so a token scan can assert the presence of listed words and never the category. Needs a different design or an owner ruling that a word list is the agreed proxy.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-142 | STREAM | Nothing in the shipped game may embarrass Carrot or Stake; this is the clause a machine-ge | as above |
| REQ-137 | MEDIUM | No Prohibited Content anywhere in the game, including references to it; see R9-06 for the  | as above |

### M14: prohibited-mechanic-control-inventory (1 requirement)

**Instrument:** assertion that no jackpot, gamble, continuation or cashout control exists

**Why parked:** NOT BUILT, budget. No panel objection. Checkable against fsModes.ts and the control inventory.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-002 | HIGH | Ship no jackpot, no gamble/double-up, no continuation of a prior round, and no early casho | as above |

### M15: autoplay-single-confirmed-start-path (1 requirement)

**Instrument:** caller-reachability analysis over Svelte components

**Why parked:** NOT BUILT, and it is not the cheap wire it looked like. PANEL: check_autoplay_confirm_gate.mjs only COUNTS occurrences of isAutoPlay.set(true) and its one structural test asks whether the FILE contains any on:click, so all three proposed seeds pass green against it. The real deliverable is a caller-reachability analysis over Svelte components, a NEW_SCRIPT.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-072 | HIGH | Autoplay must sit behind an explicit confirmation step, so a single click can never start  | as above |

### M16: cross-os-cross-browser-matrix (1 requirement)

**Instrument:** widen the browser matrix beyond one runner OS and chromium

**Why parked:** NOT BUILT, and its own negative control contradicts its assertion. PANEL: requiring all ten rendered-surface legs to pass on chromium, firefox AND webkit on more than one runner OS is incompatible with the wall-clock budget the same mechanism sets. Needs an owner decision on which surfaces get cross-browser coverage before it can be sized.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-185 | HIGH | Every test obligation in the agreement is a cross-OS and cross-browser matrix, not a singl | as above |

### M17: books-publish-cap-blocker (1 requirement)

**Instrument:** size and event-count caps on the publish files

**Why parked:** NOT BUILT, and the artefact is not present to measure. PANEL: .gitignore:9 excludes **/library/** and the books_*.jsonl.zst are untracked, so neither cap can be measured against the real five-mode package on any runner, only against synthetic fixtures. NOTE the lookUpTable CSVs ARE tracked and Session 3 used them in M08; the books are the untracked half.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-157 | MEDIUM | Treat the two size caps as publish-time blockers, so the size check happens before upload  | as above |

### M18: nonzero-payout-count-in-evidence (1 requirement)

**Instrument:** assert the submitted maths evidence carries the payout count

**Why parked:** NOT BUILT, budget. Cheap: validate_math.py:163 already computes it and is simply not wired.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-158 | MEDIUM | Report the count of non-zero weight payouts as part of the submitted maths evidence. | as above |

### M19: submitted-version-pair-binding (1 requirement)

**Instrument:** the submission record names one frontend and one maths version, both matching the artefacts

**Why parked:** NOT BUILT, and the commit half is circular. PANEL FATAL: vite.config.ts derives the build stamp from git rev-parse HEAD at build time, so dist/build-info.json cannot disagree with the commit it was built from and that half can never fail. The maths-version half is sound and salvageable.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-149 | HIGH | Name the exact frontend build and maths version in the approval request, and expect approv | as above |

### M20: guidelines-58-clearance (1 requirement)

**Instrument:** every item of the platform 58-item checklist carries a disposition

**Why parked:** NOT BUILT, budget. No panel objection.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-153 | HIGH | Clear every requirement before submitting; a partial submission is held rather than review | as above |

### M21: relative-emitted-reference-shape (1 requirement)

**Instrument:** every reference emitted into dist/index.html is relative

**Why parked:** NOT BUILT, budget. Cheapest item in the register at 22k; dist_hygiene_gate.mjs is wired and already reads the emitted references.

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-131 | MEDIUM | A Vite-built frontend must set base to "./" so the bundle resolves its assets relative to  | as above |

### PARK: genuinely-unreachable (6 requirements)

**Instrument:** no mechanical proof exists; owner-parked tracker row

| REQ | Sev | Requirement | Reason, where it differs from the family |
|---|---|---|---|
| REQ-001 | HIGH | The shipped game must be functional, clear, communicative of what is happening, and techni | Reviewer inspection of whether the game is functional, clear and communicative. No artefact could go red. |
| REQ-043 | MEDIUM | 2-star rating only: the build must show considerable creativity or originality plus strong | The 2-star creativity and originality band. A judgement about the work, not a property of it. |
| REQ-044 | MEDIUM | Provide enough gameplay depth that a player keeps betting past the first spin or two; shal | Gameplay depth measured by player behaviour, and terms.md:666 forbids the studio holding the data that would measure it. THE REQUIREMENT AND THE PRIVACY CLAUSE ARE IN DIRECT TENSION, which is worth the owner knowing independently of this row. |
| REQ-151 | MEDIUM | Submit only a finished build; work-in-progress submissions are out of order. | Demoted from a mechanism by the panel. A CI checkout is a fresh clone and always clean, so kit_build.mjs's dirty-tree refusal can never fire in CI. Wiring it would ship a step that always passes. |
| REQ-156 | MEDIUM | The build must average at least 1 star over three independent reviewers across design, gam | The 1-star average across three independent reviewers. The rating does not exist yet: STAKE_GUIDELINES_SELF_ASSESSMENT.md:155 records "Not started. Requires Start Approval." |
| REQ-179 | MEDIUM | Submission is an upload to the platform for assessment against criteria Carrot sets and ca | Demoted from a mechanism by the panel. On a pull request the checked-out ref is a synthetic merge commit contained in no remote branch, so the head-on-remote refusal would REFUSE on every pull request regardless of the tree. It would report the CI event type, not the requirement. |

