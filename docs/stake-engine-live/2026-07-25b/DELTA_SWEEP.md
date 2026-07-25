<!-- Dossier 5g delta sweep -->
- performed: 2026-07-25
- method: live pages rendered through headless Chrome (a plain fetch returns only
  "Loading..."; the docs site is client-rendered), compared against the mirror at
  docs/stake-engine-live/
- scope: approval-guidelines, plus the announcement-driven items from the
  2026-07-25 platform delta

# 5g delta sweep, 2026-07-25

## Finding 1: the announced enforcement numbers are NOT yet on the published page

The 2026-07-25 platform announcements introduced two hard limits:

- **RTP range 90.0% to 96.70%** for new submissions, and
- **10,000,000 outcomes per mode** as a cap.

Neither appears on the live `/docs/approval-guidelines` page as at this sweep. The page
still carries only the general requirements, the key restrictions and the post-release
lockdown note. The announcement itself said the RTP range **"will come into effect shortly
with the next deploy"**, so the documentation has not yet caught up with the policy.

**Why this matters for the dossier, stated rather than glossed:** our compliance position
on both numbers currently rests on a **first-party announcement**, not on a published
requirement page. That is sound, and both are recorded verbatim with their date in
`COMPLIANCE_WATCH.md`. It also means a reviewer reading only the docs site will not find
the rule we are complying with, so the dossier cites the announcement as the source rather
than implying the page carries it.

**We comply either way**, and with margin: 96.35% sits inside the band with 0.35pp of
headroom, and 100,000 outcomes per mode is two orders of magnitude below the cap.

## Finding 2: approval-guidelines content is unchanged against the mirror

Re-read in full and compared against `docs/stake-engine-live/approval-guidelines.md`. The
substantive content is unchanged: statelessness, no jackpots or gamble or continuation or
early cashout, IP and trademark compliance, original designs only, no Stake branding in
assets, the underage-appeal prohibition, automatic stake.us consideration subject to
language requirements, and the post-approval lockdown limiting changes to minor visual
fixes.

Quoted, because it is the sentence the whole submission plan turns on:

> "Once a game has been approved for publication on Stake/Stake-US, only minor updates to
> address visual issues are permitted... Changes to the underlying math model, the addition
> of new game modes, or modifications to gameplay mechanics will not be allowed."

## Finding 3: the payments page is new since the last sweep

Captured at `docs/stake-engine-live/2026-07-25/payments.md`. Commercial terms only; it
places no obligation on the code, the maths package or the submission artefacts. Recorded
as an owner decision rather than a build item.

## Result

**One delta of substance** (finding 1: policy ahead of documentation) and **no regression**
against the mirrored requirements. No re-capture of the unchanged pages was warranted; the
mirror remains accurate for everything it covers.
