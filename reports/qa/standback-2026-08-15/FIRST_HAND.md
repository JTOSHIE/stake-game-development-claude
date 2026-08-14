# First-hand notes, stand-back 2026-08-15

Taken in the main loop at HEAD `90f21280` while discovery ran. Not agent
output. Every claim below was opened in this session.

## Confirmed observations

1. `reports/SESSION_REPORT.md` still opens as the 2026-07-25 platform-delta
   session. Latest archive is `reports/archive/2026-08-15_r070-docs-mirror.md`.
   Command: `head -1 reports/SESSION_REPORT.md`.

2. `frontend/dist/index.html` carries no HTML comments. Source
   `frontend/index.html` still has two. `frontend/vite.config.ts:178-186`
   is a `strip-html-comments` transformIndexHtml plugin. Charter Q-28 at
   `docs/QUALITY_CHARTER.md:200` still reads OPEN. The shipped artefact
   contradicts the present-tense claim.

3. `frontend/scripts/social_string_conformance.mjs:43`,
   `social_dom_conformance.mjs:81`, `popout_conformance.mjs:52` and
   `portrait_layout_conformance.mjs:50` all import `evidenceDir` or
   `qaTmpDir` from `lib/evidencePaths.mjs`. Tracker TR-090 and TR-097 still
   read OPEN. `reports/audit/AUDIT_CLOSURE_2026-08-10.md` B13 already
   records the class CLOSED.

4. `frontend/src/app.css:103-105` still has `color-scheme: light dark` and
   `background-color: #242424`. `:167-168` still has `button:hover {
   border-color: #646cff }`. Charter Q-27 records these as STILL OPEN.

5. `frontend/src/lib/components/WinDisplay.svelte:57-61` still runs its own
   600 ms count-up. Replay-only mount via `ReplayMode.svelte:568`. Matches
   MID-01b as recorded.

6. `frontend/src/App.svelte:1972-1975` mounts only `ReplayMode` when
   `isReplay`. The gameplay tree is the `{:else}`. TR-114 status cell still
   reads OPEN, mapped to JOB 4; the same row's notes say it was fixed at
   root in JOB 4. Status cell disagrees with the source and with its own
   notes.

7. `frontend/scripts/money_fit_gate.mjs` exists (R059, 2026-08-14) and
   tracker TR-138 records that sweep FIXED AND CLOSED. TR-115 and TR-086
   status cells still read OPEN, mapped to JOB 3.

8. `docs/QUALITY_CHARTER.md:424` still asserts every machine-tell seed is a
   string that was actually in the repository. TR-093 is still OPEN on that
   sentence. Q-29 already recorded the dropped-apostrophe seed as a
   de-accented approximation.

9. `frontend/dist/build-info.json` at this HEAD: game future-spinner,
   version v10, commit 90f212807ed5c6f0bfcaedbae20674b8012cca38, cleanTree
   true, 77 files, 12336028 bytes.

10. `git ls-files games/` is only `games/README.md` and
    `games/future_spinner/`. TR-088 presentation claim is current.

## Not claimed from this pass

A scan for scripts that mention writeFileSync or reports/ without importing
evidencePaths returned 45 names. That instrument is too wide (comment
mentions, stdout, /tmp). It is not an enumeration. The four scripts TR-090
and TR-097 named have been migrated. A tighter recount is still open if a
later job wants the remaining writers.
