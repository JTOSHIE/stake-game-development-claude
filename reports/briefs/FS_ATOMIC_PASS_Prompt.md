FS_ATOMIC_PASS_Prompt.md. Save this verbatim to reports/briefs/ and commit it with the work. Fresh Opus session on main, drafted per reports/briefs/_TEMPLATE.md, container orchestration for delegated work, explicit paths, no em or en dashes. NO LOCK EXCEPTIONS and no money-path edits: seven answers are owed by the Product Owner and the money brief is blocked pending them.

WHY THIS SESSION EXISTS. Everything money-path, locked-path and owner-decision is blocked. This session does the unblocked work, and it is scoped by CONTEXT rather than by tokens, because context is the resource that has ended the last two construction sessions while their token budgets sat unspent.

BUDGET: context is the binding line and it is stated first.
  window about 1,000k
  less boot, being CLAUDE.md at 72kB, WAYS_OF_WORKING, the budget doc, this brief, orientation  minus 60k
  less close reserve, being the session report, the handover, per-row commit messages, gate stdout, the rule 10 CI verify and the rule 12 preview  minus 200k
  WORKING BUDGET about 740k. Tokens and clock are NOT the constraint and are not rationed here.
  Agents: unlimited within reason, and every read that can be delegated MUST be.

STOP LINES: no new job started below 250k working context. Close at 200k, which is the reserve above and is not optional. There is no clock stop line: the owner has ruled ready when it is right, no date at all, quoted from reports/FABLE_COMMS.md entry 031. The 1 August competition date in the record is NOT a driver and a session that finds it must not reprioritise on it.

DEGRADATION ORDER: JOB 1, then 2, then 3, then 4, then 5, then 6, then 7, then 8. Anything not reached is PARKED with its resume line written and is never half-attempted. The order IS the value order and it is deliberate: the cheap prose corrections are LAST, not first, because they buy the least.

DONE MEANS: every job attempted is either committed with its gate green, or parked with one resume line in reports/qa/session5/RESUME.md naming what remains; the eight blocker rows are in one comms entry ready for a single ruling; and no document this session touches still contradicts HEAD.

---

THE TWO RULES THAT DECIDE WHETHER THIS SESSION SURVIVES

**RULE A, BOUNDED READS ONLY, and it is not a style preference.** Measured at HEAD with `wc -c`: `reports/SESSION_REPORT.md` is 555kB, `docs/records/reviews/REVIEW_TRACKER.md` is 276kB, `reports/qa/session4b/waveA_raw.json` is 351kB. At roughly four bytes per token those three alone are about 294k, or forty per cent of the entire working budget, and every edit they serve below is one line. **Read them with `sed -n` ranges or Read offset and limit, never whole.** Delegate any read whose output you do not need to hold.

**RULE B, THE LEDGERS ARE NOT OPENED AT ALL.** Every anchor this session needs is carried inline below, already resolved against HEAD on 2026-07-30. `reports/qa/session4b/DISPOSITIONS.tsv` and `waveA_raw.json` are the natural place to go and they must not be: four of their recorded citations are STALE at HEAD, so opening them costs context AND risks sending an edit to the wrong line. If an anchor below fails to resolve, that is a finding for the report, not a licence to go hunting in the ledgers.

**COMMIT PER ROW, AND A RESUME LINE AFTER EACH.** Protocol rule 13 makes an honest stop lawful only at a wave boundary, and a prose-and-gate session has no waves. So the boundary is defined here: **one commit per row, and after each commit one appended line to `reports/qa/session5/RESUME.md`, which this session CREATES.** A stop after any commit is then lawful. This costs about 1k per row and it is what makes the difference between a clean handover and the fixdown's outcome, where the report had to reconstruct afterwards which two rows had actually landed.

---

READ FIRST

- `CLAUDE.md`: protocol rules 10, 12, 13, 15 and 16; conventions (e), (f), (h), (h.1), (k), (p) and (s).
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` section 4.5: main loop context as a budget line. Read this section before planning.
- `docs/records/ROLE_HEAD_OF_ENGINEERING.md` section 2: a command proves what it measures, not what you meant.
- `reports/FABLE_COMMS.md` entries 031, 032 and 033: the pre-flight result, the guidelines sheet, and its verification.
- `reports/qa/PREFLIGHT_FS_MONEY_SERIAL_2.md`: what is blocked and why, so this session does not stray into it.

ARTEFACTS THIS BRIEF EXPECTS, with their paths:
- `reports/qa/session5/RESUME.md`: **CREATE IT.** One line per committed row.
- `reports/screens/replay-figures/`: **CREATE IT.** Convention (h) before and after frames for JOB 3.

---

PREMISE PROVENANCE, per rule 16. Every figure below was resolved against HEAD `d459c42` on 2026-07-30 by the command shown.

- **VERIFIED**, `sed -n '262p' SUBMISSION_DOSSIER.md`: the string `**Eleven files.**` is present. `ls games/future_spinner/library/publish_files/ | wc -l` returns 12.
- **VERIFIED**, `sed -n '32p' BOOKS_MANIFEST.md`: the string `(11 files)` is present.
- **VERIFIED**, `sed -n '279p' docs/records/reviews/REVIEW_TRACKER.md`: the row is TR-104 and its Status field reads OPEN, while its own successor TR-117 reads FIXED.
- **VERIFIED**, `sed -n '148p' COMPLIANCE_WATCH.md`: it claims two `isAutoPlay.set(true)` call sites. `grep -rn "isAutoPlay.set(true)" frontend/src` returns exactly one, and the component the line names was deleted on 2026-07-08.
- **VERIFIED**, `grep -n "function startPreview" frontend/scripts/build_diet_verify.mjs`: line 46 reads `function startPreview() { return _server }`, and `:75` awaits it. **VERIFIED**, `grep -n build_diet_verify .github/workflows/checks.yml`: exactly one hit, line 698, and it is a COMMENT describing this very breakage. The script is dead AND unwired.
- **VERIFIED**, `grep -n "phase === 'ready'" frontend/src/lib/components/ReplayMode.svelte`: line 331. The bet cost and cost multiplier render inside that block only.
- **VERIFIED**, `awk` over `reports/qa/session4b/DISPOSITIONS.tsv` for PARKED and SMALL and STREAM: **eleven rows**, being S2-C001, C005, C006, C008, C009, C010, C011, C012, C013, C016 and C017.
- **REPORTED, and the session must not act on it without checking**: several recorded fix locations in the ledgers have drifted. The S2-C025 finding's `HudOverlay.svelte` citations are stale because MID-01 moved the count-up into a shared store. Anchors in THIS brief are current; anchors in the ledgers are not.
- **STRUCK PREMISES, recorded so they are not re-imported.** Earlier framing said sixteen unbuilt mechanisms and thirty-eight buildable requirements. **Unbuilt gates at HEAD is FIFTEEN**, and thirty-eight is arithmetic residue rather than a buildable count. **No mechanism work is in this brief**, see the exclusions.

---

## THE JOBS

### JOB 1: the eight blocker rows into one comms entry

- **Deliverable**: a new dated entry appended to `reports/FABLE_COMMS.md`, newest first.
- **Agents**: ONE extraction agent. This is DELEGABLE and must be delegated: it reads the ledger so the main loop does not.
- **Why first**: it is the only job whose value does not depend on anything else landing, and it is the only one that shortens the blocked queue. Seven answers are owed and this makes them answerable in one sitting.
- **Content**: the eight rows whose recorded blocker is a ruling, being S2-C014, C015, C046, C062, C076, C097, C120 and C121. For each: the finding in one line, the question in one line, and its evidence path. **Nothing is answered on the Product Owner's behalf.**
- **Cost**: about 5k main loop plus one agent.
- **If short**: never skipped. It is the cheapest job here.

### JOB 2: close the seed-scoring hole in the replay gate, BEFORE anything touches ReplayMode

- **Deliverable**: a commit to `frontend/scripts/replay_contract_gate.mjs`.
- **The defect**: `frontend/scripts/replay_contract_gate.mjs:146-152` returns HTTP 500 with the body `SEED TARGET NOT FOUND` when a seed's target string is absent. A seeded run that 500s renders no page, so the assertion fails, so the seed scores CAUGHT. **A seed that never applied is indistinguishable from a seed that worked.**
- **The fix**: make a missing seed target a hard error that aborts the run and is reported as its own failure class, never as a caught seed.
- **Why before JOB 3**: JOB 3 edits the exact markup two seeds target. If the hole is open, JOB 3's edit can silently blind the gate while every seed still reads CAUGHT.
- **Cost**: about 15k main loop. **Verification is DELEGABLE**: `node scripts/replay_contract_gate.mjs --self-test` launches chromium, so do not hold its output.
- **If short**: SKIP, and then JOB 3 is also skipped. They travel together.

### JOB 3: S2-C006, the replay figures persist past the ready phase, which is why guidelines item 50 is not satisfied end to end

- **Deliverable**: a commit to `frontend/src/lib/components/ReplayMode.svelte`, a new persistence assertion plus its convention (p) seed in `frontend/scripts/replay_contract_gate.mjs`, and before and after frames in `reports/screens/replay-figures/`, which this session CREATES.
- **The defect**: the bet cost and the cost multiplier render inside `{#if phase === 'ready'}` at `frontend/src/lib/components/ReplayMode.svelte:331`. Once the replay plays they are gone. The platform asks for them in the after-replay state at `docs/stake-engine-live/2026-07-29/approval_guidelines_game_replay_requirements.md:134` and `:113`, quoted in full in the ledger.
- **THIS IS WHY ITEM 50 IS NOT SAFE TO TICK END TO END.** Commit `ae40604` fixed the 1.0x suppression in the ready phase only. Two verification agents reached OPPOSITE conclusions about item 50 for exactly this reason, and the resolution is: PASS in the ready phase, nothing in the playing and complete phases.
- **The fix**: hoist the figures into a persistent row alongside the phase-independent currency display, leaving the start button as the button. **The 1.0x assertion added by `ae40604` must still pass afterwards.**
- **Convention (h) applies**: this changes what renders, so before and after frames are committed. Per convention (h.1) the capture writes to a scratch path first and is copied in deliberately, never straight into a committed evidence directory.
- **Cost**: about 120k main loop, and expect it to run over: this is the shape that ended the last session. **The rebuild and every gate run are DELEGABLE.**
- **If short**: PARK with its resume line. Do not land a half-hoisted markup change.

### JOB 4: S2-C009, the social leg on the replay gate

- **Deliverable**: a commit to `frontend/scripts/replay_contract_gate.mjs`.
- **The gap**: the requirement is MET in the source, which renders Token rather than currency in social mode, and nothing asserts it. The gate already parameterises `social`.
- **The fix**: drive one extra session with `social: 'true'`, read the currency display text, assert it contains Token and does not match a currency word boundary, and seed it per convention (p).
- **Cost**: about 95k. No rebuild needed: the gate reads `frontend/dist` and the HEAD build already renders the right words.
- **If short**: PARK.

### JOB 5: the remaining STREAM rows, cheapest first

- **Deliverable**: one commit per row.
- **The set**: S2-C012 and S2-C017 are one-line CSS in `frontend/src/app.css`. Then S2-C005, C008, C010 and C013. Then S2-C001, C011 and C016, whose real specifications are in `reports/qa/session3/JOB4_CAUSE_REDERIVATION.md`, NOT in the wave-A artefacts.
- **THE HONEST SIZING, and the session should read it before planning**: the true fixdown planned fifteen to twenty-five fixes from this same ledger and delivered two. **Do not plan for nine.** Take them in order and stop at the stop line.
- **Cost**: about 25k per row, so budget three to four rows realistically.
- **If short**: stop between rows. Every row is its own commit.

### JOB 6: S2-C092, the upload kit omits the owner's own tile

- **Deliverable**: a commit to `scripts/kit_build.mjs` plus a correction to `SUBMISSION_DOSSIER.md`.
- **The defect**: the kit copies three files into `03_branding` by hardcoded literal. `design-system/brand/delivery/` holds four, and the omitted one is the composed tile master. **This is a defect on the owner's own upload path, not a hygiene row.**
- **The fix**: read the directory and filter the README rather than hardcoding a fourth name, and add a convention (p) seed to the existing `selfTest()`. The existing seeded cases cover tree refusal and Desktop state, not the branding file list.
- **DO NOT RUN `node scripts/kit_build.mjs` WITHOUT `--self-test` OR `--check`.** A full run writes to the owner's Desktop. An agent did this on 2026-07-30 and rewrote a folder there.
- **Cost**: about 15k.

### JOB 7: the prose corrections and the two record closures

- **Deliverable**: one commit, or one per row if the session prefers.
- `SUBMISSION_DOSSIER.md:262`, `**Eleven files.**` becomes Twelve. `BOOKS_MANIFEST.md:32`, `(11 files)` becomes twelve. `docs/records/reviews/REVIEW_TRACKER.md:279`, TR-104's Status field becomes CLOSED superseded by TR-117; **specify the field by number, because a key on the OPEN string is ambiguous across ten rows**. `COMPLIANCE_WATCH.md:148-149`, correct the call-site claim to the single production site and cite the 2026-07-08 deletion. `reports/SESSION_REPORT.md:7349-7350` and its archive twin take a DATED NOTE in both, identical wording, never a silent rewrite.
- **TWO ROWS CLOSE AS STRIKES, NOT FIXES, and their evidence is carried here so nobody re-derives it.** S2-C098 is already closed at HEAD: `livePart` resolves before the destructive step in `scripts/kit_build.mjs` and its self-test is CI-wired. S2-C115 needs NO EDIT: `frontend/src/lib/services/rgsService.ts:525` already transmits the player's raw language preference, which is what the Product Owner ruled, and **its recorded fix would violate that ruling**. Both are ledger lines only.
- **No gate can hold JOB 7**, and the session must not report gates green as evidence it worked. The document currency scan checks that paths, lines and symbols resolve; it cannot read arithmetic.
- **Cost**: about 20k with the anchors above.

### JOB 8: reconcile the guidelines self-assessment in ONE pass

- **Deliverable**: a commit to `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`.
- **Why it matters**: `OWNER_CHECKLIST.md` sends the owner to this document to tick 58 platform items. It contradicts itself in several places at once, and the owner ticks off it.
- **The pass**: recount every one of the 58 rows and the Summary in one sitting, or none. The headline says four items are closed while their rows still read FAIL and CONFLICT, and the Summary still counts them. **Recount every cell or no cell**: a half-reconciled register is worse than a stale one because it looks current.
- **Item 50 gets scoped words, not a tick**: PASS in the ready phase only, with the playing and complete phases named, per JOB 3. If JOB 3 landed, say so; if it parked, say that instead.
- **Item 53 stays DO NOT TICK**, and its reason is already in the file.
- **Cost**: about 50k.
- **If short**: PARK ENTIRELY. Do not start it below 250k.

### JOB 9: close per rule 10

Run link recorded, Plan of Record graded, `npm run owner:preview` from `frontend/` per rule 12 with its printed line quoted, session report per convention (a), handover per convention (i). **State the context used at each commit**, so the next brief can size from a measurement rather than this brief's estimate.

---

WHAT THIS SESSION MUST NOT DO

- **No lock exceptions and no money-path edits**, for any reason, including a change that looks trivial. `frontend/src/lib/services/rgsService.ts`, `frontend/src/lib/stores/gameStore.ts` and `games/future_spinner/**` are untouched.
- **No new proof mechanisms.** Sixty-three of the seventy-nine unguarded requirements are already MET, so a gate over them buys regression insurance in a codebase that freezes at approval. Gate work, if wanted later, targets the NOT_MET rows and is its own session at the measured 0.75M per gate.
- **Do not open the ledger files.** Rule B above.
- **Do not touch `frontend/scripts/layout_fit_gate.mjs:190`.** It belongs to S2-C024 and is not in this brief; two jobs colliding on one line is how a fix lands twice.
- **Do not run the kit build without a flag.** JOB 6.
- **Do not translate the Responsible Play paragraph.** `docs/QUALITY_CHARTER.md` records that class as owner-parked and unparking it is not this session's call.
- **Do not reprioritise on the 1 August date.** The owner has ruled.

FOR THE NEXT SESSION: the reviewers' own named blocker, which is money-display integrity and localisation completeness, and which no session has yet scoped; TR-086 and TR-114, both HIGH and both on mandatory approval surfaces; the missing seeded self-tests for the owner-preview refuse-unpushed guard and for `frontend/scripts/dist_hygiene_gate.mjs`; and the mirror brief's docs no-delta fix, which is a full ingestion job and needs its own budget.
