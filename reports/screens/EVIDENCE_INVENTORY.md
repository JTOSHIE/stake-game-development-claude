# Evidence inventory

**The honest map of which committed captures are current.** Maintained per capture group,
updated in the same commit that lands each group's replacements, per the partial-progress
rule: a half-regenerated set that looks current is worse than a stale one.

Status is one of **REGENERATED at `<commit>`** or **STALE**. A group is only marked
REGENERATED when its replacements are committed and the captures they supersede are
archived or marked in the same commit.

Started 2026-07-25 during the pre-review pass.

## Capture groups

| Group | Status | Location | Notes |
|---|---|---|---|
| Layouts, landscape and portrait | **REGENERATED** | `layouts-2026-07-25/` | Six viewports: 1280x720, 1920x1080, 960x480 compact landscape, 430x932 and 390x844 portrait, and 400x225 popout. Every capture from a clean boot with **zero open dialogs**, verified in the run. `layout-v1/` and `landscape-compact-v1/` marked SUPERSEDED in the same commit. |
| Feature presentation flow | **REGENERATED** | `feature-flow-2026-07-25/` | Six stages: base idle, entry, entry gate, free spins running, meter progress, resolved. Reached by a **natural base-game trigger**, no forced category and no injected board; route recorded in `PROVENANCE.md`. `feature-fixes/` and `bonus-polish/` marked SUPERSEDED in the same commit. |
| Win celebrations | **REGENERATED** | `celebrations-2026-07-25/` | Ordinary win played for over 18 spins; large and wincap tiers served from **curated rounds in the shipped book** and played through the normal presentation path. Max-win capture shows EPIC WIN $5,000.00 at 5000x bet with the balance and win readouts agreeing. Route per capture disclosed in `PROVENANCE.md`. |
| Buy dialogs | **REGENERATED** | `buy-dialogs-2026-07-25/` | Four captures including the **affordability boundary**: at $150 with a $1 bet, Buy Overdrive (100x) is enabled and NITRO (400x) is disabled, which is the R8/TR-016 fix proven rather than described. Asserted on the real DOM enabled state, not read off a screenshot. `owner-audit-v4/` marked SUPERSEDED in the same commit. |
| Menu | **REGENERATED** | `menus-2026-07-25/` | Four panels, each opened by clicking the control a player uses: FEATURES bet-mode cards, HUD menu, autoplay menu, and the RG session panel reached through the HUD menu's Session item. |
| Rules and paytable | **REGENERATED** | `rules-paytable-2026-07-25/` | All nine sections. Content asserted, not just screenshotted: RTP, max win, all five mode costs, Interface Guide and Responsible Play all present. Surfaced TR-037 (max win truncated on every card), **now fixed and the group re-captured after the fix**. |
| Brand assets | **REGENERATED** | `brand-assets-2026-07-25/` | Hero emblem at 512/96/48 alongside the three TR-031 provider-mark candidates, so the legibility question is answered in one place. Comparison sheet at `provider-mark/48px-legibility-comparison.png`. |
| Mini-player, 400x225 | **NEW, REPLACES the popout capture group** | `mini-player-2026-07-26/` | TR-043. Five active states at Stake's popout size: idle, spinning, result, feature and modal, on the **dedicated** 400x225 layout profile rather than the compact-landscape strip that produced reviewer 3's overlapping fields. **Supersedes** `layouts-2026-07-25/popout-400x225.png` and `reports/qa/popout_conformance_2026-07-27.json`, whose only real assertion was that the rules modal's Continue button could be clicked. Legibility and operability are MEASURED, not judged from the pictures: every control's box is compared against every other for overlap, every touch target is measured against 44px including its pseudo-element extension, and no stat value may be truncated. **Three defects were caught by those measurements and fixed before this group was committed**: the strip was inheriting the stage scale so every target measured a third of its CSS size; the balance rendered as `$1...`; and the first run captured a UI that had never spun, because without launch parameters the live guard correctly blocks betting and every SPIN click was a no-op. The proof now launches with a real session, intercepts the two wallet endpoints, and asserts the balance MOVED, so a capture where nothing happened can no longer pass. Result: `reports/qa/mini_player_proof_2026-07-26.json`. |
| Session recovery, resume and settle | **NEW** | `session-recovery/` | TR-035b and TR-049. Three captures from a **production build** served through `vite preview`, not the dev server: `recoverSession` returns immediately when `import.meta.env.DEV` is true, so a dev-server capture would have photographed a no-op. Only the two wallet endpoints are intercepted, at the network boundary, with official-shaped payloads; everything downstream is shipped code. `resume-and-settle-replay.png` shows the interrupted round being **replayed in front of the player** (H1 x3, 6 ways, $3.90, balance still $100.00 because the settle has not run yet); `resume-and-settle-banner.png` shows the same round settled, the balance moved to $103.90, and the one plain banner; `resume-and-settle-dismissed.png` shows the banner gone. **The first capture of this feature caught a real defect and is the reason the gate exists**: the replay had played out behind the intro splash, so the player was told the round was complete and never saw it. Recovery now waits for every boot splash to clear, and the proof asserts the banner is absent while a splash is up. Result: `reports/qa/session_recovery_proof_2026-07-26.json`. |
| Replay blocker, TR-076 and TR-073 | **NEW** | `replay-blocker/` | TR-076 fix proof, captured 2026-07-26 by `frontend/scripts/replay_blocker_proof.mjs` against the production build at the exact live replay parameter shape. Frame 01 is the convention (p) seeded defect, showing the owner's exact symptom (START REPLAY an unclickable shadow under the backdrop); 02 to 04 are the fixed base-win flow with euro formatting and the win counting up; 05 and 06 are `MaxWinCelebration` presenting and collecting on the `super` cap round, which is TR-073's closing capture. |
| Focus ring, S2-C017 | **NEW** | `focus-ring-s2c017/` | Captured 2026-07-30. REQ-045: plain `:focus` matched mouse-driven focus, so every button showed the user agent's own ring after a click. Frame 01 is a mouse-clicked button with NO ring; frame 02 is a Tab-focused button with the designed 2px ring at 2px offset. **AFTER frames only, and the reason is stated rather than left as a gap**: the before state is the user agent's default ring, whose appearance varies by browser and platform, so a screenshot of it is not a stable artefact. The durable proof is the computed-style measurement quoted in the commit, taken on the real settled game: on four mouse-clicked buttons `:focus` is true, `:focus-visible` is false and `outline-style` is `none`; on the Tab-focused button `outline-style` is `solid` at `2px`. |
| Replay figures, S2-C006 | **NEW** | `replay-figures/` | Captured 2026-07-30 by `frontend/scripts/replay_figures_proof.mjs`, before and after, base and super, at all three visible replay phases. **The before and after sets were captured by identical code**, the script differing only in its output directory, which is what makes them comparable. Frames 01 to 06 are the defect: the bet cost and applied cost multiplier render as the START REPLAY button's third line, so they exist in the `ready` phase and are **absent from the page entirely** once the replay plays. Asserted on the DOM, not read off the pictures: `.replay-figures` present=false in all six and `.btn-line-3` present in the two `ready` frames only, with `body` innerText confirming the figures are nowhere on the page rather than merely outside `.replay-controls`. Frames 07 to 12 are the fix: the figures hoisted into a phase-independent row, present and non-empty in all six, including both `playing` and both `complete` frames. **Do not read frame 03's `390.0x` as the cost multiplier**: that is the PAYOUT multiplier in the win pod, and mistaking the two is exactly the confusion the hoisted row removes. Held by two new assertions in `replay_contract_gate.mjs` and by the `figures-lost-after-play` seed. |
| Scatter anticipation | **CURRENT** | `scatter-anticipation/` | Captured 2026-07-25 during the anticipation pass, after the art adoption |
| Cohesion pass | **CURRENT** | `cohesion-pass/` | Captured 2026-07-25, includes the adopted art in situ |

## Why the older groups are stale, stated once

Two changes since they were taken invalidate them as evidence rather than merely ageing
them:

1. **The scene art was replaced** (enhanced character and car, adopted 2026-07-25). Every
   capture containing the left-hand scene shows artwork that no longer ships.
2. **Several show forced or mid-dialog states**, which is review 1's actual complaint
   recorded as TR-028: a capture that begins inside a dialog is weak experience evidence
   because it does not show what a player sees.

## Known future-dated artefacts (TR-029)

These carry a date ahead of their commit date, which is the brief-side date drift already
ruled on. They are evidence files rather than captures, listed here because the same
inventory should account for them:

    reports/qa/popout_conformance_2026-07-27.json
    reports/qa/owner_audit_v4_2026-07-26.json
    reports/qa/fresh_eyes_review_2026-07-26.md
    reports/qa/audio_verify_2026-07-27.json
    reports/qa/locale_launch_conformance_2026-07-27.json

Nothing is relabelled retroactively, per the standing ruling that commit dates are
authoritative. Regenerated replacements carry the true date.

## Gate on external review round two

**All seven capture groups are REGENERATED as at 2026-07-25.** Round two is not blocked by stale captures. A reviewer scoring stale
captures scores the drift rather than the game, which is the whole reason this pass exists.
