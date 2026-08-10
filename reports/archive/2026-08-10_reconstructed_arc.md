# Session Report - RECONSTRUCTED 2026-08-05 to 2026-08-10

**THIS SECTION IS A RECONSTRUCTION AND IS LABELLED AS ONE.** It was written on
2026-08-10 by Fable ruling R042 TASK A8, after a fresh-context review found that
**45 commits landed on main with no session report section and no archive copy**,
breaching convention (a) across an entire arc. The record jumped from the
2026-08-05c section straight to R041.

**It is built from `git log` ALONE and invents nothing.** No session that ran this
work is being spoken for: there is no transcript, no brief and no verification
record to draw on, so what follows is the commit subjects grouped by day, at
summary level, and nothing else. Where a commit subject states a fact, that fact
is the COMMIT AUTHOR'S claim at the time, not a claim this reconstruction
verifies. Anything below marked as done should be re-derived from the repository
before being relied on, per protocol rule 16.

**What it cannot recover, stated so silence is not read as coverage:** what was
tried and rejected, what was measured, which gates were run, what was left open,
and why any judgement call went the way it did. That is the actual cost of the
breach, and it is not recoverable by any means available now.

**Range:** `a2805f7~1..d40c4dd`, 45 commits, 105 files, +3,952 / -266.

## 2026-08-08 (1 commits)

- `a2805f7` Guideline items 15 and 46 both close, and only one of them was a defect

## 2026-08-09 (32 commits)

- `be736d6` The upload verification step, and a warning that read as the opposite of the truth
- `d40104d` The submission checklist is captured at last, and it carried a requirement we never assessed
- `4e9a165` Item 7 closes, and the approval screen names a one-shot constraint nobody had recorded
- `8986ec3` The boot screen: archaic wordmark art replaced with text, and a floor so it can be read
- `b7d722b` Boot: one screen, carrying the game logo, the emblem and the prompt
- `ae35810` Item 32: reconcile every published win against the rules screen
- `c49f954` Six scatters: the owner already ruled, and the earlier count was under-sampled
- `ce1bf47` Replay route: social mode was still rendering German
- `cfdcbe3` Remove bg-1.jpg: a shipped image carrying rival casino branding
- `7cdbb95` Two money-path fixes: restore the round stake, and guard the bet at the action
- `adb6668` Replay errors: never paint the raw thrown message to a player
- `7ef33d3` Sub-cent wins now show what the wallet actually moved
- `abb7b37` Replay: fit the grid to the viewport, so Popout S shows all five reels
- `aa69f57` All betting parameters are now consumed, and no lock exception was needed
- `84ba527` Social scan: read the boot overlays before dismissing them
- `128668c` Debit the stake at the press, not at the settlement
- `2b2df65` Gate the replay route's fit, at the same seven presets as the game route
- `517da70` Three local suites were reporting failure against a correct game
- `410333d` Revert the reconciliation gate from CI: the books are not in the repository
- `1b62c6a` Finish the sub-cent fix I left incomplete, and guard the way it was missed
- `ed6d25f` Money follows the launch language, not the player's browser
- `b710d85` Key the two HUD labels that already had shipped translations
- `d19a3ce` The spacebar ban banned the key, not the bet
- `b28f6ff` Fix the RG assertion that failed on a stricter spacebar fix
- `4168042` The document now declares the language it renders, and ships no internal notes
- `2fc1ab1` Autoplay no longer survives a failed round
- `07d0c07` The rules no longer advertise buy tiers the jurisdiction forbids
- `4641d0a` The buy dialog: controls on screen, and a way out of it
- `c2ecb09` Stop promising a retry that cannot happen, in a language the player cannot read
- `e65cc0c` Remove 2.5MB of unreachable assets from the shipped bundle
- `d3d328f` Gate the class that produced eleven untranslated strings
- `2749e32` The maths disclosure was wrong by three orders of magnitude in five locales

## 2026-08-10 (12 commits)

- `8264b15` Write up the rulings the builder cannot make, with the evidence for each
- `4bc6aff` The boot screen's only instruction was invisible for 3.2 seconds
- `bb6c41e` Popout S: the HUD menu ran off the top of the viewport in all sixteen locales
- `7ddd239` The buy cards quoted a price ten times the real one
- `6023698` The RG session panel covered a fifth of the reels at Popout S
- `546f217` A bet could be placed behind an open modal
- `b605127` A 200 that carried no session now says so, without stranding anyone's money
- `1109ea6` Scrub "add funds" in social mode, and stop SELECT clipping out of its card
- `4382e40` Six local proofs had been failing for reasons that were never about the game
- `88d23d4` Replay: the win pod was drawn on top of the reels
- `227be8a` A recovered round that fails to settle is no longer silent
- `d40c4dd` A stalled wallet no longer locks the game forever with the stake gone

## The shape of the arc, read from the subjects only

Three themes are legible without interpretation. **The money path** carries the
most commits and the most risk: the stake debited at the press rather than at
settlement, a restored round stake, a bet guarded at the action, autoplay stopped
after a failed round, a 200 carrying no session, a recovered round failing to
settle, and a stalled wallet. **Player-facing correctness** is the second: money
following the launch language, sub-cent wins, the buy dialog quoting a price ten
times the real one, and the maths disclosure wrong by three orders of magnitude
in five locales. **Gate and evidence hygiene** is the third, including a
reconciliation gate reverted from CI because the books are not in the repository.

**The last of those three is why this reconstruction exists at all.** An arc that
was fixing the record was not itself recorded.
---
