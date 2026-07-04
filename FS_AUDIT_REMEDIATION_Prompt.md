FS_AUDIT_REMEDIATION_Prompt.md

CONTEXT AND CONVENTIONS
You are Claude Code operating in ~/math-sdk on the Future Spinner repo
(https://github.com/JTOSHIE/stake-game-development-claude). Read before touching anything:
reports/SESSION_REPORT.md, the three 2026-07-04 archives (motion-polish-v2, opus-elevate,
opus-elevate-2), CLAUDE.md, design-system/LAYOUT_SPEC.md (through v3.4),
design-system/DESIGN_SYSTEM.md, COMPLIANCE_WATCH.md, SUBMISSION_DOSSIER.md.
Branch: claude/audit-remediation from up-to-date main.
Australian English. No em dashes or en dashes in any output or committed text.
HARD LOCKS, absolute: frontend/src/lib/services/rgsService.ts,
frontend/src/lib/stores/gameStore.ts, games/future_spinner/** are never edited,
including via Bash. No lock exception is granted in this brief. Task 6 is
read-only analysis of locked paths; reading is permitted, writing is not.
Loop closure: commit reports/SESSION_REPORT.md, a dated archive copy
(reports/archive/2026-07-04_audit-remediation.md), and this brief verbatim
(FS_AUDIT_REMEDIATION_Prompt.md) before the session is closed.

BACKGROUND
Three independent external audits of the submission pack returned: conditional 3 stars,
2 stars, 2 stars. Consolidated valid findings are the tasks below, ranked by review
impact. Findings already triaged as invalid (do not action): renaming the
disabledBuyFeature flag (it is Stake's RGS flag name), 64-bit meter overflow (impossible
under the 5,000x cap), reworking instrument plates or the character (shipped in
AssetForge; the audit that flagged them read a superseded handover).

TASK 1: COLD-START OVERDRIVE HITCH, WARM HIDDEN MOUNT (the fix all three audits demand)
The single >100ms frame on the first-ever Overdrive entry mount is root-caused as a
one-time compile/style cost of the entry-overlay and BonusInstrumentColumn subtree.
Implement the warm hidden mount: during LoadingScreen (before the intro splash), mount
the FreeSpinsPresentation entry overlay subtree and BonusInstrumentColumn once,
hidden (opacity 0, pointer-events none, aria-hidden true, visibility hidden after first
paint), drive one entry-stage tick, then unmount. It must never be visible, never emit
audio, never affect layout, and never delay the loading screen by more than 250ms.
Gate: re-run frontend/scripts/motion_v2_proof.mjs on a fresh headless page. PASS
criterion: zero frames over 100ms across the full 20-spin run including first bonus
entry, average fps >= 55. If the hitch survives, report the measured residual honestly
and stop tuning; do not stack speculative fixes.

TASK 2: SUPER TURBO ANTICIPATION FLOOR
The 900ms scatter anticipation hold scaled by Super Turbo (0.16x) yields ~144ms, below
perceptual reaction time, so anticipation is bypassed. In GameGrid.svelte, clamp the
scaled anticipation hold to a minimum of 300ms at every speed tier (Math.max(300,
scaledHold)). Apply the same 300ms floor to the secondary near-miss hold. Normal and
Turbo behaviour must be numerically unchanged (900ms and 450ms both exceed the floor).
Gate: log the effective hold per tier in the proof harness output; assert >= 300ms.

TASK 3: MAX CHIP TOUCH TARGET
The 24px MAX chip beside the SPIN circle is below mobile touch-target minimums and
risks accidental max-bet next to the primary control. Keep the visual chip at its
LAYOUT_SPEC v3.3 geometry (x936 w24) but give it an invisible enlarged hit area of at
least 44x44 CSS px, centred on the chip, that must NOT overlap the SPIN circle's own
hit circle or the bet-arrow column hit areas. If 44px cannot fit without hit-area
overlap at S=1, reduce to the largest non-overlapping size and record the measured
value as LAYOUT_SPEC AMENDMENT v3.5 (append, never rewrite). Add a headless audit
check: hit-area rectangles for MAX, SPIN, arrows are pairwise non-intersecting at
1280x720 and at Mobile S 320x568.

TASK 4: INTRO SPLASH PERSISTENCE
sessionStorage forces the splash every load in incognito or memory-cleared contexts.
Change persistence to localStorage with key fs_intro_seen_v1, falling back silently to
sessionStorage then to in-memory if storage is unavailable (try/catch, no console
errors). The splash must remain fast to dismiss: Continue enabled immediately, splash
never blocks longer than its own animation, spacebar-block behaviour unchanged.

TASK 5: FLAME JET VIEWPORT CLIP AUDIT (verification, code change only if it fails)
Extend the existing occlusion/audit harness to assert, at all six required viewports
(320x568, 375x667, 425x812, 400x225, 800x450, 1200x675), that all eight jet flame
bounding boxes at scale 0.55 remain fully inside the visible stage. If any clip, the
fix lever is jet scale only (record the new scale as part of AMENDMENT v3.5); do not
move the v3.4 mount points. Commit the audit JSON to reports/screens/audit-remediation/.

TASK 6: SOCIAL MODE ERROR-STRING BLEED CHECK (read-only on locked paths)
Verify that RGS-originated error payloads (insufficient funds, bet rejected, network
failure) cannot surface prohibited terms (bet, buy, purchase, cost) in the stake.us
social UI. Read rgsService.ts and every component that renders error states; map each
user-visible error path. If any path renders a raw server string, fix it in the
UNLOCKED rendering layer only: map RGS error codes to the existing localised social-safe
strings in translations.ts (add keys across all 16 locales with social overrides if
needed). rgsService.ts and gameStore.ts are not edited under any circumstances. Report
the full error-path map in the session report, including a PASS/FAIL per path.

TASK 7: DOCUMENT HYGIENE FOR THE REVIEWER-FACING PACK
(a) PAR naming note: games/future_spinner/ is locked, so do NOT edit the PAR sheet.
Instead create docs/PAR_NAMING_ADDENDUM.md stating: maths IDs are immutable; H2, M1,
M2, M3 were cosmetically renamed at art level (Turbocharger->Nitro Canister,
Car Grille->Steering Wheel, Exhaust Pipe->Coilover, Steering Wheel->Plasma Booster);
reel frequencies, paytable values and RTP are byte-identical to the hashed PAR
artefacts; cite the SHA-256 manifest. Reference this addendum from GAME_FACTS.md if
that file exists in the repo, else note it for the audit pack assembler.
(b) HANDOVER.md: prepend a single header line marking it ARCHIVED 2026-07-03,
superseded by reports/SESSION_REPORT.md and the 2026-07-04 archives. Change nothing
else in the file.
(c) SUBMISSION_DOSSIER.md: correct the blurb status line to OWNER APPROVED (the
handover records approval; the dossier is stale). Amend the blurb's soundtrack
sentence to remove the soundtrack claim UNTIL audio ships: replace the final paragraph
with one that keeps RTP 96.35%, 5,000x, turbo mode, and drops the soundtrack phrase.
Mark the edit as pending owner re-approval in the dossier status column.
(d) Grep the reviewer-facing documents (SUBMISSION_DOSSIER.md, COMPLIANCE_WATCH.md,
GAME_FACTS.md if present, docs/) for: pending, owner taste, next session, future pass,
awaiting approval. For each hit either resolve it factually or move it to an internal
tracking section clearly marked NOT PART OF THE SUBMISSION PACK. Do not delete history
from session reports or archives; they are internal.
(e) Create docs/REVIEW_EVENTS_PLAN.md: the checklist of event IDs to capture on staging
after deploy (base win; 3, 4 and 5 scatter triggers; retrigger; bonus buy; wincap round
in each mode; BIG, MEGA, EPIC tier wins; each in normal and social mode where
applicable), with an empty ID column to fill during the dossier section 5 protocol. This
answers the reviewer event-ID demand in advance.

TASK 8: PERCENTILE FRAME REPORTING
Extend motion_v2_proof.mjs to also report p95 and p99 frame times alongside the
average, and write them into the proof-summary JSON. No gate change; evidence quality
only.

GATES (all must pass before commit)
1. motion_v2_proof.mjs: avg fps >= 55, zero frames > 100ms (Task 1), p95/p99 reported.
2. Anticipation floor assertion >= 300ms at all three tiers.
3. Hit-area non-intersection audit at 1280x720 and 320x568.
4. Jet clip audit PASS at all six viewports (or scale amendment recorded).
5. Exact-total interpreter test PASS 58/58 unchanged.
6. npm run build clean; svelte-check zero new errors; npm run assets byte-identical
   across two runs.
7. Locked-file verification: git diff shows zero changes to rgsService.ts,
   gameStore.ts, games/future_spinner/**; .claude/settings.json diff empty.

SESSION REPORT REQUIREMENTS
Standard convention plus: the Task 6 error-path map with per-path PASS/FAIL, the
measured warm-mount result (hitch eliminated or residual value), the effective
anticipation holds per tier, the final MAX hit-area geometry, the jet clip audit
result, and a FOR THE NEXT SESSION block listing what remains before the dossier
section 5 protocol (audio delivery, staging run, portal one-timers, tile assets,
blurb re-approval).
