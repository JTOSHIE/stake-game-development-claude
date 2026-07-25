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
| Win celebrations | **STALE** | `opus-elevate/`, `opus-elevate-2/` | |
| Buy dialogs | **STALE** | `owner-audit-v4/` | Also predates the per-tier affordability fix |
| Menu | **STALE** | `owner-audit-v3/` | |
| Rules and paytable | **REGENERATED** | `rules-paytable-2026-07-25/` | All nine sections. Content asserted, not just screenshotted: RTP, max win, all five mode costs, Interface Guide and Responsible Play all present. Surfaced TR-037 (max win truncated on every card), **now fixed and the group re-captured after the fix**. |
| Brand assets | **STALE** | `brand-emblem/`, `brand-tile-*`, `brand-vector-mark*/` | TR-031 provider mark candidates land separately under `provider-mark/` |
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

**Round two is NOT cleared while any group above reads STALE.** A reviewer scoring stale
captures scores the drift rather than the game, which is the whole reason this pass exists.
