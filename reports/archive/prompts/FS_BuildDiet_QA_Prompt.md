# FS BUILD DIET v2 + QA SOAK HARNESS

READ FIRST: reports/SESSION_REPORT.md and its FOR THE NEXT SESSION block, reports/archive/ latest two entries. Autonomy posture per CLAUDE.md (g). Hard locks unchanged. Branch claude/build-diet-qa from up-to-date main.

## Task 1: Build diet
Exclude from the served build every legacy asset no longer referenced: the old /assets/symbols and /assets/frames directories, legacy /assets/ui files whose consumers were retired (WinPod era), and all video files. Keep everything in the repo; this is dist pruning via the vite config, not deletion. Then run a headless session (base spins plus a bonus) capturing the network log: ZERO 404s and zero requests into pruned paths. Report the final dist size by top-level folder; the target is under 25 MB total; report the actual number either way.

## Task 2: QA soak harness
Create frontend/scripts/qa_soak.mjs: drives the mock game headless through at least 1,000 spins spread across a matrix of four locales, social mode on and off, and all three speed tiers, asserting for every round: the presented total equals the book total exactly (interpreter gate), balance arithmetic stays exact in integer micros with no drift across the run, zero console errors or unexpected warnings, and heap usage stable within 15 percent between the 100th and 1,000th spin. Sample fps throughout with a 55 floor. Wire it as npm run qa:soak. Commit the full run log to reports/qa/soak-1.log with a summary table in the session report.

## Task 3: Ship
Session report with the FOR THE NEXT SESSION block, archive, commit explicit paths, push, PR into main via gh titled "Build diet v2 and QA soak harness" with the report as description.
