# FABLE COMMS

Append-only. Newest entry first. One entry per session or significant event, one
screen maximum. Fable fetches this file directly from the repository at each
check-in. Rulings arrive as pasted blocks from the owner; each Fable block carries a
COMMS-ACK line appended here to close the loop.

Australian English, no em dashes or en dashes.

---

## 022 - 2026-07-29 - DECISION REQUEST: Wave 2 discovery is complete and deliberately unverified, 540 findings, and four items need your ruling

The stream test resumed after your session's allowance ran out mid-checkpoint. First, the
premise correction: **the 220MB push had not failed.** `git ls-remote` returned the same
SHA as local and that push's CI was green, so the capture set was never at risk and was
not re-run per convention (q). What was actually lost was the Wave 2 discovery wave, all
but one shard, because the squads were chat-spawned and a chat-spawned fan-out leaves no
run id, no persisted script and no cache to resume from. Recorded as
`FULL_AUDIT_METHOD.md` 4.1 and an amendment to convention (q).

**Discovery is now complete: 47 shards, every one of the 519 frames read by at least one
lens, 540 findings (43 STREAM, 160 HIGH, 228 MEDIUM, 106 LOW), zero squads lost.**
`reports/qa/stream_test/LEDGER.md`. **Nothing in it is verified and the ledger says so in
its first paragraph.** The adversarial pass did not run: the session hit its wave boundary
with the allowance largely spent and stopped there per rule 13, because convention (r) and
your own method's section 4 both say a half checked list is worse than an unchecked one.
Cross-squad agreement is recorded instead, and it is strong: the reel window going
transparent mid-spin was reported independently by **eleven squads across two lenses and
seven viewports**.

**Four items are yours.** (1) **MID-01's fix direction**: the win banner and the HUD WIN
pod run two independent count-ups over one figure, 1400 ms against 528 ms, so they display
different dollar amounts at once and the HUD reveals the number the celebration exists to
reveal. Derived before measuring; the closed form predicted the pod at $15.96 and frame
013 reads $15.95. Hold the pod, share a clock, or accept it: an art call, parked. (2)
**Cluster verification as the default**, a change to the method you ratified: 540 findings
verified individually is about 37.8M tokens, the ~40 clusters about 2.8M, and the trade is
that a cluster verdict covers instances its verifier did not personally open. (3) **The
model roster question is FRAMED, not ruled**, and the reason is recorded: the difference
visible in this arc is orchestration discipline rather than model quality, your session
lost its wave to a missing durability layer rather than to judgement, and your one
surviving shard is among the best of the 47. (4) **Whether the mobile sections need
re-running before they are trusted**, below.

**One thing to go back on, and it is this session's error not yours.** Your run upscaled
the 102 mobile frames to 1600px before judging them. This session did not, so its mobile
squads read 320x568 frames at about 240 image tokens where fine detail is not resolvable,
and signed coverage anyway. The mobile sections of the ledger are thinner than the desktop
sections. Recommend re-running six mobile squads on upscaled frames, about 700k, before
anyone acts on that part. The upscale step is credited to your session in the new work
order template and is now a pre-flight check.

**Two disposition corrections, both verified first-hand.** TR-104 is half fixed: the tier
label is locale routed (frames 430 and 482 prove it) and only the unit remains at
`WinBanner.svelte:210`, a one line change using a `bet` key that exists in all sixteen
locales and that `MaxWinCelebration.svelte:159` already calls. `KNOWN_OPEN` sizes it as
larger than small; it is not. And charter Q-26, which exists to record that the Q-12 glyph
sweep was incomplete, is itself incomplete: `WinBanner.svelte:205` is a fifth survivor, in
a component rather than config, rendering on 60 of 519 frames.

Full account: `HANDOVER_2026-07-25c_Fable.md`, section 2026-07-29, and
`reports/archive/2026-07-29_stream-test-recovery-wave2.md`. Cost model and work order
template: `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md`, `reports/briefs/_TEMPLATE.md`.

---

## 021 - 2026-07-28 - The polish punch shipped, the prompt is ratified, kit V10 waits on the Desktop, and one briefed defect did not reproduce

Six jobs, one commit each, main green on every push. Fonts can never ship as data: URIs
the platform CSP would refuse (assetsInlineLimit 0 plus a seeded dist assertion; bundle
delta zero). Exactly two font stacks now exist, as tokens, with the machine-tell gate
failing any third; the adoption changed 0 pixels of 810,000 on both proof surfaces. Your
three binding edits are applied and the round-three prompt is RATIFIED BY FABLE
2026-07-28, renamed _RATIFIED, with the round-two instrument's survival in the owner's
chat archive recorded in its header. Kit V10 is on the Desktop from a fresh clone of
e3206c90, 110 files, v10 stamped from the one VERSION source, PART 9i walkthrough inside:
future-spinner-3, publish, the one v10 console-line screenshot, one glance at the
paytable hero.

**The item that needs your eye: JOB 3's premise did not reproduce.** The brief said the
Popout L stage measured +3.4 percent off and the desktop 5.3 percent left. Measured on
current main before touching anything: frame and grid at exactly 50.0 percent, 0.0px off,
at Desktop, Laptop AND Popout L. No centring change was made, because shifting a
measured-centred stage would create the defect. Evidence and the annotated desktop
side-by-side (as shipped versus optically centred, ensemble-midpoint construction, all
numbers on the image) are at reports/screens/composition-2026-07-28/. Most probable
source of the figures is the live build of unknown version; the V10 upload resets that
baseline and the re-measure is one screenshot. Second small item: the ratified prompt
names the v9 build line while v10 will be live at round-three time; the applied edit
names the line's mechanism with v9 as the example so it stays true, but if you intended
the literal string, it is a one-line change.

Paytable hero casing verified not mixed (uppercase on both surfaces, one via transform),
so no vocabulary rerouting was needed. Full account:
reports/archive/2026-07-28g_polish-punch-and-r3.md.

---

## 020 - 2026-07-28 - DECISION REQUEST: the verification layer ran, and it found a regression I introduced, five incomplete fixes and a gate that had been passing over the stake.us strings

**Read this one before the repository.** Entry 019 reported six jobs. Everything below
happened AFTER it, and it is mostly the audit auditing itself. Six decisions at the end.

**What ran.** The 51-agent research workflow was resumed twice after usage limits. The
discovery layer completed 100 per cent both times; **every failure was an adversarial
verifier**. The second run rewrote the verify prompt to check the FIXES rather than the
findings, because the tree had moved: a verifier asking "does this defect still exist"
against a correctly fixed repository returns "refuted", which reads as "the finding was
bogus". Thirty-two verdicts, then four more to close the gap: **13 FIX_CONFIRMED, 13
STILL_PRESENT, 5 FIX_INCOMPLETE, 1 FIX_REGRESSED, 1 NEVER_A_DEFECT.**

**The layer paid for itself immediately, and its first catch was mine.**

- **I introduced a regression on the first screen of the game.** The Q-15 font fix put
  Orbitron ahead of `'Courier New', monospace` on the boot progress label, and I wrote that
  the monospace chain stayed behind it for the tabular figures. Wrong twice: a fallback
  stack does not participate once the leading family loads, and `tabular-nums` is inert
  against Orbitron because **it ships no OpenType features at all**. Measured on the shipped
  woff: digit advances 834, 391, 830, 826, 730, 830, 820, 660, 834, 828, so `1` is less than
  half the width of `0`. The percentage counts 0 to 100 on every launch and now shifted as it
  counted. **Fixed. Then the verifier caught the fix too**: `min-width: 3ch` does not reserve
  `100`, because `ch` excludes letter-spacing and the label carries `0.2em`. Now
  `calc(3ch + 0.6em)`. Two corrections to one six-line fix, both from verification rather
  than review.
- **A larger pre-existing one underneath it, TR-089.** All **eighteen** `tabular-nums`
  declarations in the codebase are inert for the same reason, including `.fs-num` on the
  **win count-up**, which the guidelines require to count incrementally and which a reviewer
  watches deliberately. Not ours from this session. Parked with three options, because
  choosing between a fallback numeric face, per-digit boxes and accepting it is your call.

**Five fixes were incomplete and one finding was simply wrong.** Q-25 to Q-29 in the charter:
the `WinPod` fix made its own overflow **worse** (routing through `formatBalance` adds a
symbol and separators into a box still 99px with `nowrap`); the `x` versus `×` sweep missed
four in `fsModes` blurbs; the Vite scaffold block kept its stock indigo link colours; my
`index.html` comments ship into `dist`. And the `fsModes` OVERBOOST casing finding was
**refuted** as a stylised proper noun matching the specification, which was worth more than
agreement: the refuter then found the **real** class-4 defect beside it, TR-092, where
`text-transform: uppercase` on the HUD badge and not on three other surfaces makes the same
mode read `Cruise` and `CRUISE`.

**TR-090, and this one generalises past us.** A read-only research pass silently rewrote five
committed evidence files. Every agent honoured the instruction; **none used an editing tool.**
One RAN `social_string_conformance.mjs`, and the script did the writing. That script and its
sibling still write straight into committed evidence and never import `evidencePaths.mjs`,
the migration an earlier session left open. Restored from HEAD. The next pass carried a "do
not run any project script that writes" clause plus a `git status` self-check, and came back
clean on all four agents. **A read-only instruction constrains an agent's tools, not the side
effects of software it invokes.** Found while restoring: that evidence is stale anyway,
recording `MAX WIN 5,000× base bet` where the build renders `MAX WIN 5,000×`.

**TR-091 is the big one, and it is why I stopped.** Widening the locale gate to see inside an
interpolation found **19 player-visible hardcoded English strings**, and **six are the
stake.us blockers**: `BUY FEATURES`, `BET MODES`, `BET`, `WIN`. They ARE handled for social
mode by a hand-rolled ternary, which is exactly why nobody noticed for so long: the social
swap works, so the surface looks right in both modes anyone tested, while **both branches are
hardcoded English in all sixteen locales**.

**And the ternary is a second copy of a layer we already have.** `SOCIAL_OVERRIDES` already
maps `bet` to `PLAY` and `win` to `PRIZE`, and `tr.ts` is already social-aware, so
`{$isSocial ? 'PLAY' : 'BET'}` **is** `{$tr('bet')}` plus fifteen missing locales. Same for
the constants: `overdriveFreeSpins` and `totalWin` already exist in all sixteen locales, so
`HUD_LABEL_FREE_SPINS` is a second copy of a translated string. **The fix is mostly deletion,
around 96 translated values rather than the 300 I first feared.**

The gate is committed LIVE AND CORRECT with the 19 frozen as file-scoped known debt, so a new
`BET` tomorrow still fails, the count prints on every run, and a stale entry fails in the
other direction so the ratchet cannot rust. **Frozen, not excused.**

**Current HEAD `37e43a5`, main green.** Kit version live on the portal still **NOT KNOWN**;
Front V2 remains the last confirmed publish and six kits sit on the Desktop, so every fix in
the last three sessions is of unknown liveness. That is owner item 3.

**SIX DECISIONS, numbered for one ruling block.**

1. **TR-091, the 19.** Fix all of them now (roughly 96 values, mostly deleting ternaries in
   favour of `$tr`), or fix only the stake.us six and defer the rest, or leave frozen and run
   the whole locale pass as its own session? My recommendation: **all 19**, because the
   ternary removals make the components simpler and the stake.us six cannot be fixed properly
   in isolation anyway.
2. **TR-089, the inert `tabular-nums` on the win count-up.** Fallback numeric face,
   per-digit fixed-width boxes, or accept and record? Art call.
3. **TR-092, `Cruise` versus `CRUISE`.** Drop the `text-transform` so the HUD matches the
   specification's own spelling, or add it to the other three?
4. **TR-088, the `games/` directory.** A fresh clone shows ten maths packages of which one
   ships; nine are upstream SDK samples, documented, and all our own forks are untracked. One
   README line, remove the samples, or leave it?
5. **SA-002 and SA-007**, still waiting since 2026-07-26: does the COST-column convention
   need raising with the platform before submission?
6. **The round-three reviewer prompt** at `docs/records/reviews/round3_reviewer_prompt_DRAFT.md`
   needs your ratification before it can run. Its section E lists five sub-decisions,
   including whether disclosing the prior rounds' scores anchors a reviewer.

**Where the detail lives.** `docs/QUALITY_CHARTER.md` sections 4.2b, 4.2c and 4.2d for every
verdict; TR-086 through TR-092 in the tracker; `reports/screens/polish-review-2026-07-27/`
for 91 frames at seven presets; `OWNER_CHECKLIST.md` for the owner's seven.

**One process change worth your view.** `CLAUDE.md` gained conventions (q) and (r): resume a
partially failed workflow before improvising, and size an audit like a job rather than
squeezing it into what is left. The cost of not resuming was measured, not guessed: the one
over-claim that reached a committed document was precisely the finding whose verifier had
died.

---

## 019 - 2026-07-27 - The two unrun tracks executed on main: 35 machine-tell glyphs were shipping, a scaffold package name was the boot tab title, and the documents now match reality

**What ran.** The prepared `track/quality-sweep` and `track/docs-reskin` briefs had never
been run. Their substance was executed on `main` by the integrator, plus four other jobs.
The analyst PR #116 was merged first under your standing conditions: scope gate green,
ledger-only content, 25 files, no source and no locked path.

**The sweep found more than expected, and it was counted rather than estimated.**
`docs/QUALITY_CHARTER.md` now exists, which matters because `CLAUDE.md`'s standing mandate
has cited that path since the mandate was written and the file was not there.

- **35 symbol glyphs were shipping in `dist`, 31 of them player-visible.** A trophy emoji
  in the max-win string in all sixteen locales; two emoji speakers in the audio menu at four
  layout profiles; `★★★` on the max-win crown; two `✕` close controls; a `→` in the
  paytable. **The Orbitron subset carries 183 codepoints and does not carry U+2605, U+2715 or
  U+2192**, verified against the shipped woff files before any string was judged. So those
  were not only the wrong icon family, they were rendering in the operating system's font
  mid-interface, and no stylesheet said so. All drawn now.
- **`<title>future-spinner-frontend</title>`**, the Vite starter's own npm package name,
  was the tab title from first paint until the app mounts. **I got the severity wrong first
  time and the record says so**: I claimed nothing overrode it, on a grep for
  `document.title` that returned nothing. `App.svelte:1507` sets it through
  `<svelte:head>`, which never mentions `document.title`. Transient, not permanent. Fix
  stands, claim corrected in four places.
- **The French locale used both apostrophe forms in one rules list**, and a French error
  banner read `Votre session n a pas pu` with the apostrophe absent entirely. `git log -S`
  shows it was never there: authored inside a single-quoted literal and dropped rather than
  escaped.
- **A hardcoded `# FABLE COMMS

Append-only. Newest entry first. One entry per session or significant event, one
screen maximum. Fable fetches this file directly from the repository at each
check-in. Rulings arrive as pasted blocks from the owner; each Fable block carries a
COMMS-ACK line appended here to close the loop.

Australian English, no em dashes or en dashes.

 beside the autoplay loss limit** at three layout profiles, in a game
  you play in euro. Same class as the `XSC` leak PR #89 fixed.
- **The Vite scaffold's own `:root` font stack**, naming no brand face at all, plus a
  `Segoe UI` declaration (the Windows system face, resolving on nothing else) and Courier
  New on the first text a player reads.

Held by `frontend/scripts/machine_tell_gate.mjs`, in CI. All ten of its seeded violations
are strings that were really in this repository, in the file shape they were found in,
including the two forms a plain string scan cannot see. Its own first real run corrected it
twice, and both corrections are pinned by negative controls.

**Current HEAD.** `2745b4d8` at the time of the capture set; see the top of `main` for the
close. Bundle 109 files, 15,607,103 bytes, clean tree.

**Kit version live on the portal: NOT KNOWN, and that is a finding.** Six kits sit on the
Desktop. The last frontend version confirmed published anywhere in the repository is
**Front V2**, published on the morning of 2026-07-26. Four kits have been built since. **Every
fix in this session, and every fix in the two before it, is therefore of unknown liveness.**
It is item 3 on the new `OWNER_CHECKLIST.md`.

**Open rows.** TR-075 (the Cruise wallet delta, the only open money item, unanswered across
three visits). TR-064 (the zero-win end-round conflict, ruled observe-first and now absent
from every current walkthrough section, so nobody is being asked). TR-081 (the red
authenticate, low urgency). **TR-086 and TR-087 are new**, promoted by me from the analyst
ledger: the mini strip cutting a balance to `BAL €479` below about 390 css px, and the
replay win pod's `.toFixed(2)`, which I fixed at source. Both were HIGH and unpromoted.
Three tracker Status cells read OPEN while their own fix evidence recorded the fix; corrected.

**The three questions this pass could not settle.**

1. **The 2-star Maximum Exposure limit disagrees between two first-party sources.**
   `COMPLIANCE_WATCH.md` records the published table at `$10,000,000`; the platform's own
   ACP screen displays `15,000,000.0`. Both pass for us comfortably, which is exactly why
   it is safe to leave open and wrong to overwrite. Raised, not corrected.
2. **Should the COST-column convention be raised with the platform before submission?**
   SA-002 and SA-007 have asked since 2026-07-26. The convention is now proven from the
   platform's own `costMultiplier` field, so the question is no longer whether it is true
   but whether a reviewer reading the Bets page alone will underestimate spend on every
   non-unit mode. Yours or the owner's, not mine.
3. **Is the round-three reviewer prompt legitimate to run as drafted?** The round-TWO prompt
   does not exist in this repository. I did not reconstruct it, per convention (m). The draft
   at `docs/records/reviews/round3_reviewer_prompt_DRAFT.md` is built on the round-ONE
   prompt, which survives verbatim, plus the round-two deliverable's eighth section inferred
   from its outputs. Marked DRAFT FOR YOUR RATIFICATION with five decisions listed. It also
   discloses the prior rounds and their scores, which anchors a reviewer; the alternative is
   disclosing findings without scores.

**Parked, and named rather than half-done.** Roughly 35 keys times 16 locales of
player-visible English is still hardcoded, counted at 27 attributes and 48 markup text nodes
and listed in full in the charter. 560 translated values written in the margins of a six-job
session is the exact case protocol rule 6 exists to prevent, and a partial pass leaves the
locale gate red, which rule 10 forbids. It wants its own surgical brief.

**For your eye: `reports/screens/polish-review-2026-07-27/`.** 91 frames from the
production build at seven platform presets, eight real rounds through the intercepted wallet,
with a README naming what the set does not cover. `OWNER_CHECKLIST.md` at the repository
root is the owner's seven items, phone-readable; three of the brief's own premises about them
turned out to be wrong and it says so.

---


## 018 - 2026-07-26 - Buy modes exercised live: the money path reconciles to the cent four times over, and the one real finding is that a buy round headlines a loss as a win

**Two things the owner flagged, and both need care rather than a fix.**

**1. "The bet cost is wrong."** It is not. The platform's Bets panel row shows **COST = bet
level**; the expanded detail shows **Cost (USD) = what was debited**. The 06:25:18 row reads
`super $1,000.00` and its detail reads `Cost (USD) $400,000.00, Cost multiplier x400.00`.
Super is 400x, so that is correct. **Our own confirm dialog shows the true price up front**,
captured twice: `PRICE $200,000.00` at a $500 bet and `PRICE $400,000.00` at $1,000. The trap
is the platform's **MULT column, which is payout divided by bet level, not by what was
staked**: a green `+$102,930.00 at x102.93` was a **loss of $297,070**. Across eight buy
rounds the owner staked $1,550,000 for $553,845 back, a 35.7% return, entirely ordinary
against super's 71.8% break-even.

**2. "The balance wasn't updating."** It was, every time. I reconciled four HUD balances
against the platform's own bet log, each derived independently using the true per-mode cost:

| Time | Expected | HUD | |
|---|---|---|---|
| 06:20:58 | $49,917,330.00 | $49,917,330.00 | exact |
| 06:22:36 | $49,972,875.00 | $49,972,875.00 | exact |
| 06:23:37 | $49,830,090.00 | $49,830,090.00 | exact |
| 06:28:31 | $48,916,485.00 | $48,916,485.00 | exact |

**Four exact reconciliations across base, 100x bonus and 400x super.** Confirmed in code too:
`App.svelte:1002` computes `cost = bet * MODE_COST[mode]`, and that same `cost` feeds both the
balance path and `rgRecordSpin`, so the wallet and the session panel cannot drift apart.
**This is now the strongest evidence we have that the money path is correct in production**,
and it covers the buy tiers, which is exactly where this project has been bitten before.

**TR-068, the real finding, and it needs your ruling.** What the owner saw is genuine: at
06:23:37 the HUD reads `WIN $57,215.00` in large green type while the balance falls by
$142,785. Gross-payout WIN readouts are the genre convention and are not wrong in themselves.
The problem is that **the typical buy round pays back less than it cost** (super break-even
71.8%, bonus 76.5%), so at 400x the convention inverts the meaning of the round in the common
case, not the edge case: seven of the owner's eight buy rounds were "wins" that lost money.
It also sits against guideline item 50, *"UI clearly displays bet cost and applied
multiplier"*. **Options:** (a) show cost beside win on buy rounds, `WIN $57,215 / COST
$200,000`, most honest and breaks no convention; (b) show net for buy rounds, clearest but a
reviewer expecting a WIN readout would read it as wrong; (c) show the multiplier against cost
(`x0.29`) instead of against bet level; (d) leave it. **Recommend (a) with (c).** Player-money
presentation, so it comes to you under (l.8) rather than being decided here.

**New artefact: `docs/records/reviews/FIX_LIST_2026-07-26.md`.** Owner asked for a
consolidated list of everything the day's sessions turned up, prioritised. It carries the two
not-a-bug findings first so they are not re-investigated, then eight confirmed defects, the
one escalation, what is the platform's rather than ours, and the owner's own actions.
**The headline: B.2 through B.5 are all small, self-contained frontend changes touching no
locked file and no maths, and doing them in one pass plus a fresh-clone rebuild also clears
TR-062.**

**Nothing about the maths changed.** The Math page is still Math V1, still identical field
for field, and still will be: it is a static analysis of the uploaded books, not telemetry.

**Lane.** Green: fix list, tracker row, eight further captures. No behaviour changed.

**Awaiting your ruling on:** TR-064 (zero-win end-round, client versus checklist, must not be
fixed blind), TR-068 (buy-round win presentation), TR-067 (force English in social), and
TR-062/TR-063 from entry 017.

---

## 017 - 2026-07-26 - Hero fixed, Front V2 live, 143 real rounds settled; the platform's own 58-item checklist found us 3 failures and 1 genuine contract conflict

**Read this one instead of 016 if you only read one.** 016 stands, this supersedes its open
actions. Twenty-one further captures committed to `reports/screens/dtt-live-2026-07-26/`;
full transcription appended as PART 2 of `reports/qa/dtt_live_session_2026-07-26.md`.

**TR-061 RESOLVED.** The owner re-dragged the same folder; the sync dialog read
**`Upload 4 Files, Skip 104 Files`** and named exactly the four files my diff named, from
its own content comparison. Independent corroboration in the (l.4) sense, and it settles the
cause: the folder held 108 on both runs, so the **first upload was handed 108 and the portal
stored 104, dropping four silently with no error**. Worth reporting upstream. Republished to
**Front V2**; the pilot renders. Math stayed V1, correctly, since no maths file changed.

**TR-062 still live in V2**, exactly as predicted: the re-upload sent four images, it did not
rebuild, and the paytable capture still shows the em dashes. Fresh-clone rebuild still owed.

**The maths figures have not moved and could not have.** The owner asked directly. I compared
every field: identical. Two reasons, both worth stating because the question will recur. The
page is pinned to **Math V1** and only the frontend changed; and more fundamentally it is a
static analysis of the uploaded books at `Simulation Count 100000`, not telemetry. Live play
surfaces in the Bets panel, never here.

**New from the now-untruncated distribution table, and it is the most load-bearing number in
the game: the wincap band contributes 5.00% of RTP from a single 1-in-100,000 outcome.**
5,000x over 100,000 is exactly 0.05, so **5.19% of total return lives in one outcome most
players never see**. Deliberate, passes every constraint, previously unwritten. The fourteen
contributions sum to 96.34% against the stated 96.3500, the residual being rounding.

**143 live rounds, and the money path reconciles exactly.** Session panel net result
+$9,590.00 against a HUD balance of $50,009,590.00 from a $50,000,000 start, and -$61,260.00
against $49,938,740.00 twelve spins earlier. **Our own accounting agrees with the platform
wallet to the cent across 143 settled rounds.** First end-to-end confirmation in production.

**What the play data says about RTP: nothing, and I want that on the record.** At 143 spins
the observed 106.71% sits **0.07 standard deviations** from 96.35% using the platform's own
SD of 17.2841. Twelve spins earlier it was 53.24%, at -0.29 SD. Both unremarkable. One spin
did it: **06:08:38, +$80,650 on a $1,000 bet, x80.65**; strip it out and the other 142 spins
returned 50.66%. To resolve RTP to plus or minus one point at 95% needs **11,476,400 spins**;
to ten points, 114,764. **RTP is not verifiable by playing**, which is convention (l) in one
sentence. Pleasingly, that single feature paid **80.65x against our modelled 79.4x average
triggered win**, and arrived at spin ~140 against a modelled 1-in-184.7 trigger rate, so
frequency and magnitude both landed on the nose.

**The new deliverable: `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`.** The
platform exposes a 58-item testing checklist, at 0 of 58. Owner instruction was to work it
ourselves before ticking anything there. Our pass: **31 PASS, 14 OBSERVE, 8 OWNER, 3 FAIL,
1 CONFLICT, 1 N/A.**

**Findings for your ruling, numbered:**

1. **TR-064, and this is the real one. The official client and the platform's own checklist
   give opposite instructions.** Guideline item 12 says *"Zero-win bets do not send an
   end-round request"*. Our gate is the round's `active` flag, changed deliberately under the
   JOB 4 sanction because the client says *"Only call this API if Play() has returned an
   Active result"*, and because `winMicros > 0` is wrong in both directions against that
   contract. If the RGS returns `active: true` on a zero-win round we breach the checklist;
   if `false`, both are satisfied. **This must not be "fixed" before it is observed** or we
   reintroduce the bug the sanction closed. Options: (a) observe one zero-win spin, (b)
   revert literally, (c) `active && winMicros > 0`. **Recommend (a)**, thirty seconds of
   Network tab, and it is now the highest-value single observation in the project, ahead of
   DTT check 3.

2. **TR-065, guideline item 15, confirmed FAIL.** `.game-wrapper.portrait`,
   `.compact-landscape` and `.mini-player` carry `overflow-y: auto` at `App.svelte:1821`, so
   the frame scrolls at mobile portrait, Mobile S and Popout S, and not on desktop. Derived
   from code, then corroborated by three captures at three sizes. One rule, but the reason
   `auto` was chosen needs checking so the fix does not clip instead.

3. **TR-066, guideline item 25, confirmed FAIL.** No `maximum-scale`, no `user-scalable=no`,
   and `touch-action` appears nowhere in `frontend/src`. Nothing disables double-tap zoom.
   Note the meta tag alone is ignored by modern iOS Safari, so the durable fix is
   `touch-action: manipulation`. Filed with a cosmetic sibling: the Popout S mini strip clips
   the WIN readout mid-glyph.

4. **TR-067, guideline item 46, confirmed FAIL.** *"English is the only supported language in
   Social Mode"*. `tr.ts:14` derives from `[locale, isSocial]` but social selects only the
   **vocabulary variant**, never the locale, so a social session with `lang=de` renders
   German. The 39-term substitution layer is fine; this is a separate axis nobody connected.
   Options: force `en` under social (one line), leave it and treat the guideline as a
   statement about platform behaviour, or force with a warning. **Recommend forcing.**

**All three failures are small self-contained frontend changes touching no locked file and
no maths**, and they should ride the same fresh-clone rebuild that clears TR-062.

**Also new and useful.** The Bets panel exposes Event IDs and a per-row **"Replay this bet"**
button, which largely solves DTT check 8 (replay confirmed working live, disclaimer and all,
on Event ID 52121) and removes the guesswork in `REPLAY_TEST_EVENTS.md`. Popout S renders the
mini strip with all seven controls, closing the substance of check 10. The portal still shows
a **placeholder game thumbnail**, which is an unstarted owner action.

**Lane.** Green: captures, QA artefact, self-assessment, tracker rows. No behaviour changed.

---

## 016 - 2026-07-26 - THE GAME IS LIVE ON THE PLATFORM. Maths passes everything; four files never uploaded; two findings need your ruling

**State delta.** The owner ran the upload kit end to end. Future Spinner is published,
running and playable on the real platform with real RGS. `Front (Current V1)`,
`Math (Current V1)`. Bonus buys action correctly. Language switching works.

**You cannot see the nineteen screenshots this is drawn from, so they are transcribed in
full at `reports/qa/dtt_live_session_2026-07-26.md`.** That is the artefact for this entry;
everything below is a pointer into it.

**The maths verdict is uniformly good, and it is independent of us.** The platform computed
its own figures from the uploaded books. All five modes COMPLIANT. Overall bet level
compliance passes every constraint at both 2 Star and 3 Star. BASE scores 6 of 6. The
platform reports RTP **96.3500**, Standard Deviation **17.2841**, Simulation Count 100000,
Max Payout Multiplier 5000, Probability of Zero Win 70.8870 (so hit rate 29.1130).
Our committed claims are 96.3500%, 17.28, 100,000, 5,000x and 29.11%. Cross-Mode RTP
Consistency returns **0.00% variance**. This is protocol 6 corroboration arriving from a
third party for free. One number new to our records: the platform states the RTP ceiling as
**96.70%**, which we had not previously quoted from a first-party surface.

**Four frontend files never reached the portal (TR-061, OPEN).** Panel reads 104 files /
13.0 MB against the kit's 108 / 15,510,083 B. One of the four is live:
`ui/scene_character.png`, the hero pilot, which renders as a broken image in the published
build. The other three have no reader. Corroborated by byte arithmetic to 13.015 MB. Cause
ruled out on size, de-duplication, position and reported skips; **not determined, and not
guessed**. The frontend sync dialog was never captured, which is named as the missing input
rather than reconstructed.

**Findings for your ruling, numbered:**

1. **TR-062: the published bundle is one commit behind `main`, and nothing ties a bundle to
   a commit.** The kit predates `5674bd7`; its shipped JS still carries nine em dashes and
   the owner's capture shows two of them rendering to a player now. So the TR-061 remedy
   must be a fresh-clone build, not a reuse of the kit on the Desktop. The general problem
   is that `dist/` carries no build stamp, so "what is live" is not answerable from the
   repository. Same class as TR-047. Options (a) stamp `dist/` with the SHA and refuse to
   package a non-HEAD tree, (b) treat the kit as single-use, (c) SHA in the kit README only.
   **Recommend (a) with (b).**

2. **TR-063: I am correcting my own TR-060 closure.** I widened the dash gate from 2 files
   to 25 and recorded the class as closed. It was not. The gate reads single-quoted JS
   literals only, and the two strings it was written to catch were markup prose, so it still
   cannot see them. It also does not scan `App.svelte`, which ships an em dash in the
   document title at line 1215 while the gate reports PASS. **This is the same pattern we
   have now named four times**, one level down: instance fixed, class reported closed.
   Options (a) whole-text scan with allowlist, (b) strip comments and scan all text plus add
   `App.svelte`, (c) move the gate onto `dist/` so it checks what actually ships.
   **Recommend (c) with (b)**, because (c) would also have caught finding 1.

3. **TR-059 is confirmed live and is wider than filed.** The German session shows translated
   chrome against fully English body copy, exactly as measured. New: the platform's Language
   menu offers `da` (Danish), which we do not ship, and the list was still scrolling at the
   capture edge, so the real gap is unknown. Parked pending a full capture rather than
   estimated.

**Confirmed by the platform, worth banking.** Popout S is **exactly 400 x 225**, so the
mini-player target we took on a reviewer's assertion is correct; I re-derived our
breakpoint conjunction against all seven presets and Mobile S (320 x 568) correctly stays
out. The DTT also exposes a **Local Testing redirect URL**, so we can iterate against the
real RGS from a local dev server without an upload cycle. That materially cheapens the
TR-059 and TR-061 work.

**Lane.** Green: this entry, the QA artefact, tracker rows. Nothing merged to game
behaviour this session.

**Outstanding.** Nine of the ten DTT protocol checks are unrun; check 3
(`round.state.events`) remains the highest value. Replay read "No game modes available" but
that capture predates the publish, so it is unresolved rather than failed. `math/HASHES.txt`
is my packaging error and should be deleted from the portal.

---

## 015 - 2026-07-25 - COMMS-ACK 013 and 014; TR-012c dissolved and implemented; custody rule held

**COMMS-ACK, entries 013 and 014: receipt appended.**

**TR-012c, resolved by dissolving it, and the ruling is the better answer.** Neither side
of the leading-vs-trailing argument had to be right. `formatBalance` now takes optional
`CurrencyDisplay` metadata and renders per payload, using the **documented** field names
(`symbol`, `symbolAfter`, `decimals`) rather than a shape of our own invention. Partial
payloads degrade field by field. Absent metadata the output is byte-identical to before,
asserted, which is what makes it safe to ship ahead of the DTT. 10 new assertions, 39 to
49, covering both placements, fiat as well as virtual, every partial combination, and the
no-metadata equivalence.

**One gap, named rather than worked around.** Locked `rgsService.authenticate()` builds a
typed object and **drops any field not in its list**, so a real payload's display metadata
cannot reach the consumption layer yet. The mechanism is complete and proven; the wiring
needs either a lock sanction adding the field to that mapping, or confirmation at the DTT
that the platform sends it inside a field the mapping already carries. I have not guessed
which, and I have not routed around the lock.

**Custody ruling recorded and applied.** The Stake Dev Tool cloud is rejected; self-host
remains the only permitted mode. Written into `COMPLIANCE_WATCH.md` in the ruling's own
terms, including the part that matters most: every empirical question the cloud would
answer is answered identically by the official on-platform tool during staging, so there
is never a reason to move the books to a third party to get an answer. My earlier
suggestion that the cloud would be a convenient DTT environment was wrong on exactly this
point, and the correction is on the record rather than quietly dropped.

**Payments page mirrored.** `docs/stake-engine-live/2026-07-25/payments.md`, captured
through headless Chrome because a plain fetch returns only "Loading...". Commercial terms
only, no build work owed: 10% of actual GGR with an indefinite carry-forward debt, or 7.5%
of expected GGR with no debt and no variance upside. Recorded as an owner decision without
a recommendation, since it is commercial rather than compliance. Worth one line though:
this package knows its own variance precisely, base-mode weighted SD 17.28x and a 1-in-250
wincap on `super`, so the carry-forward risk under the 10% model is real rather than
theoretical.

**Continuation run, honest status.** Item 1 is partially delivered: the TR-012c
implementation and the payments capture are done, the wider dossier and GAME_FACTS refresh
and the second review pack are not. Items 2 to 6 are not started. Nothing is half-landed.

---

## 014 - 2026-07-25 - FULL-RUN REPORT (PARTIAL): four branches merged, three not reached, one blocked on a missing input

**Stated plainly at the top: this run is NOT complete.** Four of the eight build branches
merged. Three were not reached. One cannot start because its input was never supplied.
The brief said the run does not stall, and it did not; it ran out of session, which is a
different thing and is reported as such rather than dressed up.

### Merged, with evidence

| Branch | What was actually wrong | Gates and evidence |
|---|---|---|
| #106 `fix/R2-mock-containment` | `initRGS` sets `_rgsMode = false` on a REAL auth failure as well as the dev case, and `spin()` falls through to `_mockSpin()`. A production player with a failed session was served the mock: fabricated wins, no wallet. | New `liveGuard` (11 assertions, CI gate 10a) + `mock_containment_check.mjs`. Negative control run: injecting a marker into `dist` makes the gate FAIL. |
| #107 `fix/R11-session-recovery` | `authenticate.round` was mapped and then discarded. On a `pending_end` round that is a decided win nothing was ever going to collect. | 17 assertions against an injected stub (CI gate 10b), plus `docs/staging/DTT_SESSION_RECOVERY_VERIFICATION.md`. |
| #108 `chore/repo-presentation` | 41 markdown files in root, 20 of them briefs. | Root reduced to the functional nine; 32 documents relocated by `git mv` with three indexes; 12 files relinked. |
| (this) tracker repair | Two stale duplicate rows, and an ID COLLISION I created. | See below. |

### Two mistakes I made in this run, both caught and both recorded

**`git add -A` staged 4,249 paths**, sweeping in the untracked 450 MB
`games/future_spinner_super/` prototype. That is exactly what convention (k) forbids, and
it was caught by the other half of the same convention, reading `git status` after
staging. Staged explicitly instead; both untracked trees are untouched.

**I reused TR-017 for session recovery when it already belonged to the scatter-disclosure
finding.** A first pass at de-duplicating the tracker then "helpfully" deleted the older
row along with three rows from the parked-items summary table. Reverted, and the real fix
applied: session recovery is renumbered **TR-035 / TR-035b**, only the two genuinely stale
`OPEN (wave 2)` copies of TR-015 and TR-016 are gone, and TR-017 stands as it was. The
lesson is small and worth keeping: a de-duplicator that matches on id alone will happily
destroy a record whose id was reused by mistake.

### Not reached

`feature/scatter-anticipation`, `feature/cohesion-pass` and `chore/docs-refresh` were not
started. No partial work exists for them and nothing is half-landed.

### Blocked on a missing input

**Tool vetting cannot start.** The brief names "the Claude skills pack from the owner's
Discord list". That list has not been supplied to this session and is not in the
repository. Convention (m) is explicit that work does not begin until the external
document physically exists here, and the whole point of the item is to treat the pack as
untrusted input and read every file, which cannot be done against a guess at a URL. Named
and waiting, per the facts discipline.

### Closing run

Not performed, because it must run against the final merged state and three branches are
outstanding. The individual gates were run per branch and all passed.

**Next.** Supply the skills-pack source, then the three remaining branches and the closing
run.

---

## 013 - 2026-07-25 - COMMS-ACK 011 and 012; PR #103 merged; convention (n) recorded

**COMMS-ACK, entries 011 and 012: receipt appended.**

**PR #103 merged** after line-by-line locked-diff review, branch deleted.
`rgsService.ts`'s three recorded debts are now CLEARED in `LOCKED_FILE_DEBTS` and kept
there as a record of what was fixed rather than as outstanding work: the live event
schema, the unretried `endRound`, and the duplicate `CURRENCY_SCALE`. TR-009 and TR-008
both move to MERGED.

**Convention (n) recorded in `CLAUDE.md`, from the ruling on (a).** Where a recorded method
and a subsequent sanction conflict, the **sanction governs**: it is both the later
instrument and the better-informed one, written with the diagnosis in hand. The ruling's
reasoning is kept with it, because the reasoning is the part that transfers: total breakage
means there is no working code to preserve behind an adapter, and a fully dead parser left
in a money-path file behind an adapter is two sources of truth. The obligation the rule
does NOT remove is written in alongside it: surface the tension and let it be ruled on.
Choosing quietly is the violation, in either direction.

**Ruling on (c) recorded.** Deferral accepted and the scoping error owned. `canIncreaseBet`
and `canBuyBonus` stay as recorded debts, unreferenced and therefore inert, riding whatever
future `gameStore.ts` sanction may ever exist, including never. That is now written into
`LOCKED_FILE_DEBTS` in those terms so no future session reads them as pending work.

**Wave 3 and RG: proceeding in parallel**, standard lanes, a comms entry per landing.
R2 mock containment, R3 books equality, R11 balance, and the RG wording branch built on the
English masters exactly as given.

---

## 012 - 2026-07-25 - R1a sanctioned pass done, PR #103 held for your block; two items need a ruling

**The pass is on the branch and will not merge itself.** PR #103, one isolated commit,
scope (a), (b) and (d). Lock proof in the commit message and the PR: exactly the two named
deny entries lifted, `git diff .claude/settings.json` 0 bytes, SHA-256 identical before and
after, `gameStore.ts` and `games/future_spinner/` untouched, no Bash routing at any point.

**(a) was worse than TR-009 described, and the numbers say so.** The locked parser read
`board`, `win` and `scatter`. Across the first 300 rounds of the shipped
`books_base.jsonl.zst` those occur **0, 0 and 0** times, against `reveal` 724 and `winInfo`
499. Every branch was dead on a live round, so `_emptyBoard()` came back unchanged: a live
player would have watched an empty grid. Now delegated to `roundInterpreter` rather than
reimplemented. The six-row padding is stripped to the visible 5x4, verified against the
book rather than assumed, and the test asserts scatter never exceeds 5.

**(b)** `endRound` now goes through `_withRetry`. It was the credit leg that was
unprotected: one transient failure and the wallet had taken the bet while the player had
not been paid. Safe to retry because end-round is idempotent on the round id.

**(d)** The local `CURRENCY_SCALE` copy is gone and there is now exactly one declaration in
the codebase. The drift gate is updated deliberately, which is what its own failure message
demanded if the declaration ever moved.

**DECISION REQUESTS, numbered.**

1. **Scope (c) cannot be executed under this sanction, and I have not forced it.**
   `canIncreaseBet` and `canBuyBonus` are in `gameStore.ts`, not in `rgsService.ts`: grep
   finds **0** occurrences of either name in the file the sanction unlocked. The sanction
   lifts only the `rgsService.ts` deny entries, and convention (e) both requires the brief
   to name the deny lines and forbids routing around a deny by any other means.
   **Options:** (a) issue a second sanction naming the two `gameStore.ts` deny lines and I
   run it as its own isolated pass; (b) fold it into whatever the next `gameStore.ts`
   sanction is, since both helpers are already unreferenced and recorded in
   `LOCKED_FILE_DEBTS` so nothing regresses by waiting; (c) leave them permanently, on the
   basis that unreferenced-and-wrong is harmless. **Recommend (b)**: it costs nothing to
   wait and avoids a lock lift whose only purpose is deleting dead code.

2. **One tension in (a) that is yours to settle, not mine.** The sanction says (a) happens
   "only as R1's diagnosis requires". TR-009's own recorded method says "adapter if raw
   events are exposed, sanctioned locked pass only if not", and raw events ARE exposed:
   `lastRoundEvents` publishes them before flattening. On that reading (a) could have been
   an adapter in non-locked code. I did it at source because the sanction enumerates it
   explicitly and is the later instruction, because the parser is 100% broken rather than
   partially, and because a wrong parser left behind an adapter is a landmine for any
   future consumer of `SpinResult`. **If you would rather it were an adapter, say so and I
   will revert (a) and keep (b) and (d).**

**Next while #103 waits.** Wave 3 remainder: R2 mock containment, R3 books equality, R11
balance. Plus decision 3's RG wording, which lands on its own branch as its own item.

---

## 011 - 2026-07-25 - COMMS-ACK 010 received; wave 2 merged; PAR converted to a numbered item

**COMMS-ACK, entry 010: receipt appended.** All four rulings actioned. Recorded here
rather than only in the tracker so the loop closes in the file Fable fetches.

**Wave 2 merged in the ordered sequence.** PRs #98, #99, #100, #101, #102, merged in that
order, branches deleted, tracker rows updated. Three of the five needed conflict
resolution and none of it was mechanical: #100 and #102 each touched the same components
as an earlier PR in the sequence, so the resolutions had to keep BOTH changes rather than
take a side. The R5 bet-ladder guards and the R4 translated `aria-label`s, for instance,
occupy the same three lines of two components; both survive, verified by running the R4
and R5 gates together after the merge. CI gates renumbered 1 to 11 with 6a, all twelve
green on the merged tree before each push.

**DECISION 1 actioned, XEC HOLD.** TR-012b updated to record the ruling: the hold is
confirmed and the resolution path is the Developer Testing Tool session. No code written,
no code form recorded anywhere in the register.

**DECISION 3 actioned, RG wording.** The English masters are taken verbatim as given and
are now the source strings. Translation follows the standard casino
responsible-gambling lexicon per locale rather than literal rendering, and each locale's
confidence is recorded in the tracker row. Landing as its own branch, not folded into the
sanctioned pass, since the sanction says nothing else goes in that commit.

**DECISION 4 actioned, dates.** Commit dates are authoritative; today is 2026-07-25.
Nothing relabelled retroactively. The drift is noted once, in the tracker, and every
document from here carries the true date.

**PAR, converted from a parked conversation into a numbered item as directed.**

1. **Where does the antelite tail-concentration note permanently live?** Your 2026-07-28
   ruling already resolved this to `COMPLIANCE_WATCH.md` as the permanent location, not a
   temporary one, and nothing is blocked today. What remains open is only whether the PAR
   sheet itself should ALSO carry it, which matters because the PAR is what a regulator
   reads first and `COMPLIANCE_WATCH.md` is not part of the submission pack.
   **Options:** (a) leave as ruled, `COMPLIANCE_WATCH.md` only, and accept that the note
   is absent from the artefact a reviewer opens first; (b) mirror the note into the PAR
   under a future lock sanction naming the PAR deny lines, so the submission artefact
   carries its own disclosure; (c) add a one-line pointer in the PAR to the
   `COMPLIANCE_WATCH.md` entry, cheapest, keeps the PAR authoritative without duplicating
   analysis that may later drift out of step. **Recommend (c).** No further work happens
   on this until it is ruled, and it is no longer a conversation to be had later.

**SECURITY, lesson recorded.** The Drive closure is confirmed; the backup stays private,
sharing off, location on record. The lesson line is now in `COMPLIANCE_WATCH.md`:
**backups of pre-release game internals are private by default, verified at creation, not
after.**

**Next.** The R1a sanctioned pass, on `fix/R1a-rgs-locked-pass`, one isolated commit,
scope (a) to (d) exactly and nothing else. It will NOT merge on the standing same-day
authorisation; it waits for the explicit block after a line-by-line review of the locked
diff.

---

## 010 - 2026-07-25 - Wave 2 complete: five PRs open, four defects were invisible to every existing check

**Ruling 23 executed, and it refuted its own hypothesis.** Instrumenting
`setOverdriveBed()` proved the crossfade correct: on a real bought feature the counters
read `crossfadeToTension` 0 to 1, `crossfadeToBase` 0 to 1, `earlyReturnMuted` 0, and
`bgm_tension` genuinely plays. The early-return theory is REFUTED. All three red checks
were harness faults, two of them one mistake: a `?mockCategory` pinned for the real spin
also governed the buy, so the buy served a base round with no feature to swap for; and
the seam check appended asset paths after the query string, decoding `index.html` instead
of audio for a fortnight. 8 of 8 green, three consecutive runs. PR #98.

**Wave 2 complete. PRs #99, #100, #101, #102, all open for review.**

| PR | Item | What was actually wrong |
|---|---|---|
| #99 | R4 / TR-012 | 14 `aria-label`s carried the restricted phrase "bet". A blind player in a social jurisdiction heard the vocabulary a sighted player was protected from. Replay derived social mode from the flag alone, so `currency=XSC` rendered real-money wording beside an SC balance. |
| #100 | R5 / TR-013 | FeatureMenu's bet arrows used the hardcoded ladder. Off the authenticated ladder `indexOf` is -1, so `BET_LEVELS[-1+1]` is 0.10: "+" DROPPED the player's bet to the minimum, "-" did nothing, and the control stayed enabled. |
| #101 | R7 / TR-015 | `turboDisabled` had ZERO readers anywhere. Derived correctly, ignored by everything, so a market banning fast play still ran at 2x and 4x. `maxAutoplaySpins` gated only the infinite option, so a cap of 25 still offered and started 100. The RG test was not in CI at all. |
| #102 | R8 / TR-016 | Spacebar span the reels under six blocking surfaces, and autoplay fired through reality checks. `canBuyBonus` checked `bet x 100` at the 400x tier, enabling CONFIRM beside a correctly displayed 400x price. |

**The pattern worth your attention.** Every one of these was invisible to the existing
gates, and for a structural reason rather than an oversight in each case:

- The prohibited-term sweep reads **rendered DOM text**, and screen-reader text is not
  rendered DOM text, so no accessibility string was ever checked.
- `App.svelte`'s modal list could not name another component's local `let`, so six
  blocking surfaces could never have been added to it. The fix inverts the dependency:
  surfaces register themselves.
- `turboDisabled` was correct in the store and read by nothing. "The store holds the
  right value" is not the compliance claim.

Each now has a permanent gate. Four new CI gates added, and the RG suite put into CI for
the first time.

**Two defects that only the browser proofs caught, both the same shape as the bugs.**
In R5 a `$:` alias latched a transient `false`, leaving both bet arrows disabled with a
valid bet on screen: the model was right, the surface was not. In R7 my first proof read
an EMPTY autoplay menu and passed every "does not offer" assertion vacuously; it now
asserts the offered list positively and throws on an empty read. Recording both because
they argue for keeping runtime proofs alongside unit tests rather than instead of them.

**Locked files untouched throughout.** `gameStore.ts`'s `canIncreaseBet` and
`canBuyBonus` are now unreferenced by production code and recorded in `LOCKED_FILE_DEBTS`
as **wrong, not merely dead**: leaving them unread is strictly safer than leaving them
wired. Both await the next sanctioned pass.

**DECISION REQUESTS, numbered.**

1. **XEC: implement on review 1's word, or hold?** Review 1 marks its absence a FAIL and
   asserts jurisdiction requirements treat XGC, XSC and XEC as social. It cites no
   first-party source. Three first-party sources have none: the live `/docs` routes,
   `/docs/reference/currencies` (XGC and XSC only), and the official StakeEngine/ts-client
   SDK `Currency` union. Our own scrape of the jurisdiction-requirements page found the
   prohibited-terms table and social mode only, no currency codes at all. The standing
   recommendation, quoted, is "do not record XEC as a supported code anywhere in the
   register until a first-party source is produced". Implementing it means inventing a
   symbol mapping, which convention (l) forbids, so it is parked as TR-012b.
   **Options:** (a) hold, current position; (b) resolve empirically by toggling
   currencies in the Developer Testing Tool at staging, already comms map item 6;
   (c) implement XEC to SC defensively, cheap, but records an unverified code as fact.
   **Recommend (b), then (a) meanwhile.**

2. **R1a needs a lock sanction naming the deny lines.** Step 6 of the execution order is
   `fix/R1a-rgs-locked-pass` as an isolated commit under convention (f). Convention (e)
   requires the sanctioning brief to name the exact deny line(s) to lift. Not started,
   and will not start, until that arrives. Wave 3 (R1, R2, R3, R11) can proceed
   independently in the meantime.

3. **TR-012a: who writes the RG wording?** Four player-facing `aria-label`s stay
   English-only, including "Reality check" and "Session information". Not a compliance
   breach, none carries a restricted phrase, verified by the new gate. Deliberately NOT
   machine-translated: the standing caveat is that machine translations are not
   native-reviewed, RG terms especially. Needs a decision on who supplies reviewed
   wording for 15 locales.

4. **Which date is authoritative?** Briefs are labelled 2026-07-27 and 2026-07-28; actual
   commit and run dates are 2026-07-25, checkable in git. New comments carry the
   verifiable run date and existing text was left alone. One line settles it.

**Process note, my error.** Entry 009 was the last thing you could see, because entry 010
was committed onto a feature branch instead of straight to `main`. `FABLE_COMMS.md` is a
GREEN-lane document and you fetch it from the repository, so it must always go directly
to `main`. Corrected, and noted so it does not recur.

**Security note, closed.** The owner's off-repo backup of the full `games` directory on
Google Drive, raised on 2026-07-28 as a pre-release exposure because it loaded without
sign-in, has had its **sharing disabled** and is no longer publicly accessible. The backup
itself is intact and owner-held. Recorded in `COMPLIANCE_WATCH.md` (status CLOSED) and now
also on the `BOOKS_MANIFEST.md` row that names it, so the manifest cannot be read as
implying a public copy. No link is recorded in this repository.

**Also parked at owner's direction.** The PAR-sheet question is held until you and the
owner speak. The antelite note's permanent location is already resolved as
`COMPLIANCE_WATCH.md` per your 2026-07-28 ruling; nothing is blocked by the hold.

**Artefacts.** PRs #98, #99, #100, #101, #102. Proofs:
`reports/qa/audio_verify_2026-07-13.json` (8 of 8),
`a11y_social_proof_2026-07-25.json`, `bet_ladder_proof_2026-07-25.json`,
`rg_enforcement_proof_2026-07-25.json`, `modal_safety_proof_2026-07-25.json`.
New gates: `a11y_social_terms_check.mjs`, `betLadder.test.ts`, `modalGuard.test.ts`,
plus `responsibleGambling.test.ts` into CI. Tracker rows TR-020a, TR-012, TR-013, TR-015,
TR-016 move to MERGED on merge; TR-012a and TR-012b opened.

**Heads-up for whoever merges.** #100, #101 and #102 each add their own "Gate 8" to
`.github/workflows/checks.yml`. The first merges clean, the second and third conflict in
that file only. The gates are independent and just need renumbering; merge one at a time.

**Next.** Wave 3 (R1, R2, R3, R11), then `feature/scatter-anticipation` and
`feature/cohesion-pass`. R1a waits on item 2 above.

---

## 009 - 2026-07-28 - Rulings executed: books resolved by design, FAIR captured, one lock conflict named

**COMMS-ACK.** Rulings of 2026-07-28 received and executed. Entry 008 closed.

**RULING 1, books.** LFS rejected, books stay out of the public repository.
`BOOKS_MANIFEST.md` created as the public fingerprint of the private set, and
`SUBMISSION_DOSSIER.md` 5c reworded around an explicit two-set table with the manifest
as the bridge. TR-023 closed **RESOLVED BY DESIGN**, TR-024 **FIXED**.

Verified while building the manifest, all computed not assumed: every book holds exactly
**100,000 rows**, matching its lookup table; the mode set matches `index.json`; and **all
five SHA-256 values are byte-identical to those already in dossier 5c**. The dossier's
hash record was always correct. Only its sentence was wrong, which is precisely how three
reviewers cloned the repo and one raised a BLOCKER. Row-by-row payout equality is stated
in the manifest as **not yet proven**, and remains R3's work.

**RULING 2, antelite: ACCEPTED BY DESIGN.** Closed. **But it could not be recorded where
you asked.**

31. **The PAR sheet is inside a locked path and the ruling named no deny lines to lift.**
    `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` is covered by
    `Edit(games/future_spinner/**)` and `Write(games/future_spinner/**)`. Convention (e)
    requires a sanctioning brief to name the exact deny lines; this one did not, and
    routing around a deny via Bash is explicitly forbidden. So I did not edit it.
    The same content is recorded in `COMPLIANCE_WATCH.md` under 2026-07-28, flagged to
    move into the PAR on the next sanctioned locked pass. **Ruling wanted:** accept the
    compliance-register location, or issue a lift naming
    `Edit(games/future_spinner/**)` for this single line.

**RULING 3, art contradiction: SCHEDULED.** TR-027 closed as ruled, with R1's bar
governing and the targeted cohesion pass recorded in three parts.
`feature/cohesion-pass` to be sequenced with `feature/scatter-anticipation` after
Wave 3. Not branched yet, per the execution order.

**RULING 4, FAIR API: captured.** `docs/stake-engine-live/2026-07-28/fair-catalogue.md`,
with the schema and a verbatim excerpt. `COMPLIANCE_WATCH.md` records that our maths
package is its data source and **no additional work is owed**.

Two things the capture told us that are worth knowing, both computed from the payload:

- **Our `weight_range` is conventional.** Published games cluster at `1.1259e15` (2^50),
  exactly where our per-mode totals sit.
- **Our 100,000 events per mode is at the LOW end of the published field.** Others run
  1M to 10M; Obey The Reptillians sits at exactly 10,000,000, the platform cap. We are
  compliant, on the stated 100,000 minimum, but it is publicly visible to anyone reading
  the catalogue, including competitors and reviewers. Worth an owner decision at some
  point. Also visible: several live games run above the 96.70% ceiling (Lokis Vault at
  0.98), consistent with the ceiling binding new submissions only.

32. **Missing input, named not guessed: the FAIR outcome endpoint.**
    `https://fair.stake-engine.com/` returns **404**, and the catalogue payload carries
    no schema link, no documentation and no per-game outcome URL. The outcome endpoint
    contract is therefore **not captured**. Per convention (m) I will not infer a URL
    pattern. **Need: the endpoint URL.**

**Owner note recorded.** A full OneDrive copy of the `games/future_spinner` library
including publish files was taken 2026-07-28; recorded in `BOOKS_MANIFEST.md` and the
dossier as the off-repo custody location for the upload set.

**Next, per the execution order, no deviation:** merges #94, #95, #93, #92 with rebases,
then R24, R14, audio instrumentation, Wave 2.

## 008 - 2026-07-27 - DECISION REQUEST: wave 1 complete bar one, ten items need a ruling

Written as a decision document rather than a status update. Everything below is
either blocked on you, blocked on the owner, or a judgement call I should not make
alone. Numbering continues from entry 007.

### Board

**Wave 1: four of five delivered, all CI green.** #92 R10 type-zero, #93 R12
evidence hygiene, #94 R9 scatter disclosure, #95 R6 locale. Remaining: R14 popout.
Nothing is merged; all four await review.

### BLOCKING, and it compounds

21. **The three external review documents have never reached the builder session.**
    Only your dispositions on a handful of findings were relayed inside the
    programme brief. `docs/records/reviews/sources/` holds placeholders, not
    reconstructions, because writing plausible review text from dispositions would
    put fabricated findings into a compliance record.
    **Consequence:** TR-004 to TR-008 (review 3's F3/F5/F7/F8/F10) cannot record
    their finding text or PR citations, and **tracker coverage cannot be called
    exhaustive** since there is no way to know what is missing. This gets worse as
    each wave lands against an unverified baseline. **Need: the three documents
    pasted into the repo, or an instruction to proceed on partial coverage and
    accept the gap on the record.**

### Needs your ruling

22. **Merge order for the four open PRs.** `REVIEW_TRACKER.md` is touched by **all
    four**; `App.svelte` by three (#92, #93, #95). Conflicts are certain.
    **My recommendation:** #94 (smallest overlap), then #95, then #93, then **#92
    last** so the zero-error ratchet is verified against the fully merged tree
    rather than a partial one. I will rebase and resolve the tracker conflicts.
    Confirm or reorder.

23. **TR-020a, audio bed swap. PARKED after two attempts**, per the operating
    rules. `bedSwapFiredOnBonusBuy` and `bedRevertedAfterFeature` still fail.
    Ruled out: the wiring exists (`soundService` subscribes to `overdriveVisual`
    at line 360, `App` sets it at line 318). Fixed on the way but not the cause: a
    real click-path gap where the harness never clicked CLICK TO CONTINUE.
    **Options:** (a) instrument `setOverdriveBed()` with a dev counter to prove
    whether it is called and which branch it takes, roughly 30 minutes; (b) suspect
    the `active === overdriveBedActive` early return, since the warm-mount
    presentation may already have flipped the store so the real entry no-ops, which
    would be **a genuine product bug**; (c) accept headless audio limits and move
    bed-swap plus seam checks to DTT staging, where the seam check must be re-run
    anyway. **My recommendation: (a) then (b).**

24. **TR-014a, 40 hardcoded player-facing strings, untranslated in all 16 locales.**
    Found while checking the `ja` proof: FEATURES still renders English. Includes
    `FEATURES`, `ACTIVATE`, `SELECT`, `SPIN MODES`, `SPIN COST`, `MAX WIN`,
    `MULTIPLIER`, `SOUND`, `MUSIC`, `OVERBOOST`, `CRUISE`, `SESSION`, `SPINS`,
    `REALITY CHECK`, `CONTINUE`, `START REPLAY`. The platform states games "will be
    tested with various combinations of currencies and languages"
    (`front-end-communication.md:44`), so this is reviewer-visible in fifteen of
    sixteen locales. Unassigned, not fixed, scope deliberately not expanded.
    **Need: priority (the owner has opened reprioritisation, and I would argue this
    outranks parts of wave 2), and a ruling on whether the RG and session strings
    also require social variants.**

25. **R14 popout inherits a known-real defect.** `IntroSplash.svelte`'s Continue
    button can render fully outside the viewport at Stake's 400x225 mini-player
    size, carried unfixed since Round 3 and confirmed by a DOM-level click bypass
    being required to unblock the harness. **Need: does R14 fix it, or regenerate
    proofs and leave the fix to its own responsive pass?**

26. **R1a pre-granted locked pass, still unacknowledged.** Wave 3 opens the first
    lock lift in this project's history on `rgsService.ts`. I will follow
    convention (f) exactly. **Need: confirmation it lands as its own isolated
    commit rather than one strand of a thirteen-item sweep, before I start wave 3.**

### For the record, no action needed

27. **The 6-plus scatter claim was mine and was wrong.** Retracted in #94, cause
    recorded, and it produced convention **(l) derive before measuring**, now
    ratified and merged. The engine's clamp for counts above 5 exists but is
    unreachable on the visible 5x4 board, so it is defensive dead code, not a
    compliance question. No ruling needed.

28. **Splash now returns on every cold load** per the owner's ruling, with the
    legacy localStorage flag actively cleared so existing players are not left
    permanently opted out.

29. **Buy-dialog disclosure was clipped more widely than the brief assumed.**
    390x664 already passed; the real failures were 360x600 and compact landscape
    812x375. Fixed by making the stats row sticky. RTP and max win are a stated
    review requirement, so this was compliance, not styling.

30. **Convention (l) is in force** and R6 was the first work executed under it. The
    gap was found by derivation from the spec rather than by measurement.

## 007 - 2026-07-27 - Convention (l) ratified: derive before measuring

**Owner ruling, standard operating procedure.** Recorded as `CLAUDE.md` convention
**(l)** and mirrored into `reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md` section 3 as **(m)**.
Green lane, merged to `main`.

**What prompted it.** I reported that 352 base rounds reached 6 scatters and 12 reached
7, and wrote a `rulesScatterSixPlus` disclosure into all 16 locales on that basis. The
owner challenged it. **They were right and I was wrong.** The `reveal` event emits a
six-row board per reel, the visible 5x4 grid plus one padding row above and below, and I
counted the padding. Visible window only: **maximum 5, zero rounds at 6 or 7.** The
disclosure was removed (19 references) and TR-017a is marked REFUTED as my own error.

**The two failures the convention now closes:**

1. The exact answer was one line of specification away, `num_reels = 5`, needing no
   measurement at all. I measured to discover rather than to confirm.
2. Switching from name-matching to the engine's own `scatter: true` flag returned
   **identical** counts, which I read as independent corroboration. It was not: both
   read the same padded array, and that flag is set on padding cells too. Shared input,
   shared flaw.

**The procedure, in force from now:** derive from the specification first and cite
`file:line`; measurement confirms and never discovers, and a measurement disagreeing
with the specification is broken until proven otherwise; every number carries a
checkable source or is reported as not known; corroboration requires independent inputs,
stated explicitly; self-audit before reporting rather than after; **unsolved beats
wrongly solved**, so park with options rather than filling a gap; compliance text quoted
verbatim with its date, never paraphrased; maths-adjacent findings escalate as questions
with evidence rather than being ruled on by the builder.

The worked example is written into the convention itself, so the next session inherits
the failure and not just the rule.

**Board.** Wave 1: R10 (#92), R12 (#93), R9 (#94) all open and CI green. R9 carries the
retraction up front so a reviewer sees it before the claim. Remaining in wave 1: R14
popout refresh, R6 locale wiring. **Still blocked:** the three external review documents
have never been provided, so TR-004 to TR-008 cannot be resolved and tracker coverage
cannot be called exhaustive.

## 006 - 2026-07-26 - Owner Audit Round 4 delivered, PR #91

**State delta.** All seven Round 4 items delivered, **PR #91 open, CI green (49s)**.
Proofs `reports/screens/owner-audit-v4/`, results
`reports/qa/owner_audit_v4_2026-07-26.json`.

**Two bugs, both root-caused, and the brief's framing was wrong on both.**

- **Item 3.** Overdrive was always correct. Only NITRO broke, and only inside the
  wincap window: Overdrive derived from `$selectedBetMode`, NITRO from
  `liveIsNitroEntry`, a binding that arrives only once `FreeSpinsPresentation` reaches
  its entry phase, which is after MaxWinCelebration's COLLECT gate. Measured before
  the fix: `nitro-wincap` read `colourway-natural`.
- **Item 1 does not reproduce.** Gate visible and in-viewport on four profiles and six
  desktop sizes across all three routes. Not "fixed": that is working code days before
  the audit. The owner's clarification points at `introSeen()` reading **localStorage
  first**, which is exactly why incognito shows the splash and their desktop does not.

**The owner's clarification changed item 3 materially, and for the better.** They meant
**borders and shading**, not the jets. That exposed a real gap rather than a routing
bug: the backdrop and frame had only **two** states, so a spun-in feature and a bought
Overdrive rendered identically magenta. Natural now grades green to match its green
flames. All three surfaces derive from one route source, so they can no longer
disagree; they previously each re-derived from `liveIsNitroEntry` and shared one bug.

**Item 7 draft delivered; prototype deliberately NOT built.** It lives in `GameGrid`'s
reel timing loop. Prototyping there on a seven-item PR immediately before the audit is
the risk the section 1 bar warns against. Scoped as its own branch in section 6.

**Findings needing your ruling.** Continuing the numbering.

15. **Scatter anticipation, five open questions** in the proposal's section 7. The
    load-bearing one: escalation can build toward a 4th or 5th scatter the board never
    had, because the outcome is known before the reels move. Accept as genre-standard,
    or soften when the board holds no further scatter? I lean accept, with a capped
    dead-build duration.
16. **Natural route colour is my call and should be yours.** I chose green-leaning to
    match the green flames and to read as clearly not-a-purchase. Colour is an owner
    eye-call; proofs are in `item3-route-*.png`.
17. **Item 6 reverses a prior decision.** The 2026-07-14c grid-first pass explicitly
    excluded the desktop lockup from portrait; Round 4 reinstates it. Noting the
    reversal rather than burying it.
18. **NITRO affordability** (owner's third observation) is real: `canBuyBonus` in
    locked `gameStore.ts` hardcodes `bet x 100`, wrong at 400x. Already in
    `LOCKED_FILE_DEBTS`; it is what R8 targets. Not touched here, it needs the locked
    pass.

**Sequencing decision, taken and flagged.** The FS AUDIT REMEDIATION R1-R13 brief
arrived mid-Round-4. It is **saved verbatim and not executed**
(`reports/archive/briefs/FS_AuditRemediation_2026-07-27_Prompt.md`). Round 4 lands first as its own reviewable
unit; R1-R13 takes a fresh branch. Two things in it need your explicit acknowledgement
before I start:

19. **R10 reverses your ruling of the previous day.** You ruled "baseline stays at 11,
    and the type-cleanup pass is correctly refused before the audit". R10 says fix all
    11 including the RainLayer parser chase and ratchet CI to zero. I will do it, but
    the reversal should be deliberate, not silent.
20. **R1 pre-grants the first locked pass in this project's history** on
    `rgsService.ts`. I will follow convention (f) exactly (named deny lines,
    never-committed edit, verified-empty diff), and I want it as its own isolated
    commit rather than one strand of a thirteen-item sweep.

**Lane.** PR #91 REVIEW. This entry GREEN.

**Map position.** Round 4 awaits your review. R1-R13 queued behind it. The owner
re-test (map item 3) is still the audit's precondition.

## 005 - 2026-07-26 - Branch prune done; board handed to the owner

**COMMS-ACK.** Receipt of FABLE RULINGS 2026-07-26b recorded. Entry 004 closed.
Rulings noted: (1) ruling 13 closed, baseline stays at 11, type cleanup correctly
refused; (2) audit pack refresh ratified in full; (3) dossier 5g ratified as landed;
(4) branch prune executed, below; (5) board state formally recorded.

**RainLayer blind spot: compensated, not chased.** One instruction added to
`reports/archive/superseded/AUDIT_PACK_INDEX.md` section 4 as item 5: the auditor manually verifies the two props
(`count`, `opacity`, plus the cosmetic `variant`) against both callers, `App.svelte`
and `HeroSplash.svelte`. Closes the only known unchecked-props hole for the price of a
sentence, as ruled.

### Branch prune

**15 merged remote branches deleted.** Full SHAs recorded here so every deletion stays
recoverable by `git branch <name> <sha>`:

| Branch | SHA |
|---|---|
| `claude/anticipation-reroll-itemA` | `5ee9869aa50f088669eb00c1725aab2002be2813` |
| `claude/audio-seam-warmup-item0` | `ab7c96eb60e9ad18221093a6e752e89612b72a7a` |
| `claude/books-regen-locked-pass` | `f43dd2c5a0ee9dcff5abecf50d9cde94f8d91f43` |
| `claude/brand-hero-emblem` | `12ac14a7cd47b53e05d1310f2bea5acbd8876755` |
| `claude/landscape-compact-v1` | `97c0441dcff6be08b9b9598c377851eada276a3a` |
| `claude/math-audit-correction-itemD` | `c57f7eead0f53d20a5470161fa5624f560400e8f` |
| `claude/math-selfaudit-item3` | `a1f0b4bed6fcda619694b31edea684dc7f1b0802` |
| `claude/portrait-layout-v1` | `d987760b8fc55e34a4e871b99d2718ecbfc208ab` |
| `claude/portrait-v2-grid-first` | `cc1521d0a4dfa6d1685af0d74253fbba82f251f8` |
| `claude/qa-conformance-item2` | `c8202319cac26913b3838522069099a8c1a1af42` |
| `claude/record-corrections-itemE` | `92525cb7b7ce8e8dcbf75244977f271ac6da42cd` |
| `claude/rules-conformance-item1` | `7126f996b4b7ca51bab9a6184b1e673a051ba032` |
| `claude/social-audit-item4` | `4b45a4060a865c6b21f24604aa9b21ba3306537e` |
| `claude/social-strings-itemC` | `906d96cd71bc514cf2acc5132faaa3d7b09413bd` |
| `claude/win-countup-itemB` | `a42084de4c0e4fe76d24dc92b73000ca4f9954c9` |

Each was verified an ancestor of `main` before deletion, not merely assumed merged.
Four stale local branches whose remotes were deleted were also removed with
`git branch -d` (which refuses anything unmerged).

**Four reference branches preserved exactly as directed:** `claude/collect-prototype`,
`claude/gap-analysis`, `claude/lumen-sideproject`, `claude/fs-super-prototype`.

**ONE EXCEPTION, HELD RATHER THAN DELETED, needs your ruling.**

14. **`claude/compliance-rg` (`c595566`) was NOT deleted.** It is **not an ancestor of
    `main`**, so it does not satisfy "every merged remote work branch", and it is not
    on the four-branch preserve list either. It falls between the two clauses. The
    2026-07-25 close-out sweep recorded that its content "landed via hand-picked
    cherry-picks into other PRs per the 2026-07-07 handover, not a PR of their own",
    which explains why the tip is not an ancestor even though the work is on `main`.
    I did not delete it, because deleting an unmerged branch on an inference about
    cherry-picks is not something to do without an explicit instruction. **Ruling
    wanted:** delete it, or add it to the preserve list. Remote is otherwise exactly
    the four references plus `main`.

### Board state

Confirmed from the repository, not asserted: **no open PRs, working tree clean** except
the two known-safe untracked directories, `main` green, CI passing.

**The builder holds nothing actionable.** Audit prep is complete. The external audit's
sole remaining precondition is the owner's full re-test verdict and any round-4 items
it produces. As of this entry the machine side is waiting on its owner.

Open items carried, none of them blocking and none of them mine to move:

- Owner re-test verdict, then any round-4 items (map item 3).
- Ruling wanted on `claude/compliance-rg` above.
- XEC, resolved empirically at Developer Testing Tool staging (map item 6).
- Owner one-timers: payment details against the captured payments doc, hero-emblem
  provider logo upload, Tile Editor composition.
- Blurb's draft soundtrack sentence still pending owner approval.
- Post-launch, ruled and deliberately deferred: `replayStore` removal, feature-grid
  renderer unification, the six non-shared overlay scripts, the 11-error typecheck
  baseline.

**Lane.** GREEN: comms, records, branch housekeeping. No code, no game behaviour.

---

## 004 - 2026-07-26 - PR #90 merged; audit prep complete; the 11 errors enumerated

**COMMS-ACK.** Receipt of FABLE REVIEW, PR #90 (2026-07-26) including addendum ruling
14 recorded. Entry 003 closed. Rulings noted: (11) extension confirmed, and the wider
principle logged, **rulings on phrases apply repo-wide, not per-location**; (12)
framing ratified; (13) approved with the enumeration condition, discharged below.

**PR #90: MERGED**, branch deleted. Map item (2) complete. No open PRs.

### Ruling 13 condition, discharged: all 11 errors, classified

**None is compliance-bearing. None touches currency, wallet, or cost display in a way
that affects behaviour.** All 11 may ride to post-launch under the section 1 bar.
Verified rather than assumed, and one required a build to settle.

| # | File:line | Class | Compliance-bearing? |
|---|---|---|---|
| 1 | `RainLayer.svelte:71` | Parser-only: svelte-check reports `<script> was left open`; the file is structurally sound (script opens line 1, closes line 35) | **No.** Verified by build: `rain-layer`/`rain-streak` are in the shipped JS bundle and `rain-fall` keyframes in the shipped CSS. The component compiles and ships. Checker quirk. |
| 2-3 | `App.svelte:11`, `HeroSplash.svelte:21` | `RainLayer has no default export` | **No.** Both are downstream of #1. |
| 4-8 | `App.svelte` 356, 407, 702, 783, 785 | `TelemetryEvent` under-declares fields the `track()` calls pass (`tier`, `winMicros` x2, `costMicros`, `multiple`) | **No.** Money-adjacent *names*, but telemetry is a no-op observer sink with zero network calls (`docs/TELEMETRY_TAXONOMY.md`, confirmed at built-bundle level in JOB 3). It observes; it cannot reach the wallet or any display. |
| 9 | `App.svelte:1080` | `FlameJets` colourway union widened to `string` | **No.** Cosmetic. |
| 10 | `PaytableModal.svelte:307` | `g.label` does not exist on `INTERFACE_GUIDE` entries | **No.** The paytable *is* a compliance surface (the UI button guide is a review requirement), but this line sits in the `{:else}` branch for `kind !== 'img'`, and since Round 3 item 5 **all eight entries are `kind: 'img'`**. Dead, unreachable code. The rendered guide is unaffected. |
| 11 | `WinDisplay.svelte:77` | `$tr(scatterKey)` widened to `string` vs `keyof Translations` | **No.** `scatterKey` resolves only to `scatter3`/`scatter4`/`scatter5`, all three present in `Translations`. Type widening on a correct lookup. |

**One blind spot worth naming.** Because #1 stops svelte-check parsing `RainLayer`
entirely, its props are not type-checked at all. A genuine prop mistake there would go
unnoticed. Small surface (two props), but it is a real hole rather than pure noise.

**Recommendation: leave the baseline at 11.** If you want it at zero, #10 (delete a
dead branch) and #11 (one cast) are trivial and zero-risk; #4-8 need a
`TelemetryEvent` type widening; #1-3 need the RainLayer parser issue chased, which is
the only one with any depth. That is its own pass, and I would not run it before the
audit.

### Audit prep, green lane, delivered

1. **MaxWinCelebration rider: already satisfied, verified not re-done.**
   `dismissOverlays.mjs` already handles the wincap gate both by its `max-win-collect`
   testid and by the `.max-win-overlay` container's own presence, exported as
   `clickAnyPendingGate` (Round 3 FINAL MERGE rider (a)). Nothing to add. Re-read and
   confirmed line by line rather than trusted from the report.
2. **Audit pack refreshed** (`reports/archive/superseded/AUDIT_PACK_INDEX.md`). The 2026-07-14 edition was
   materially stale: it pointed at the **superseded** 2026-07-07 handover as current
   and listed PRs #56/#57/#60 as unmerged blockers (all merged, branches gone,
   confirmed). Rewritten to current artefacts, with the superseded ignore list
   extended: the old top-level `docs/stake-engine-live/*.md` capture set (still shows
   the $25M exposure figure), the retired vector-mark track, and the public
   `StakeEngine/docs` repo as **actively misleading** rather than merely stale.
   Archive count corrected 43 to 79.
3. **Path verification: 83 repo-relative paths checked across the nine audit-defining
   documents. Zero broken references.** Everything that did not resolve was correctly
   a non-file reference (branch names, URL paths, GitHub slugs, prose shorthand).
4. **Ruling 14 landed** as `SUBMISSION_DOSSIER.md` **section 5g**, wired into 5e's
   sequence as a hard gate ahead of the review request, with all eleven pages
   enumerated and an explicit warning not to use the stale GitHub repo for the sweep
   (which would produce a false clean result).
5. **Register updates:** the payment one-timer is now explicitly to be done against the
   **captured** `docs/stake-engine-live/2026-07-25/payments.md`, not the live page;
   Discord announcements recorded in section 2 as a first-class intelligence source,
   treated as intel pending first-party confirmation, with anything limit-affecting
   triggering an immediate sweep rather than waiting for 5g.

**Findings needing your ruling.** None new. Item 13 above is the only open question and
it carries my recommendation.

**Map position.** (1) and (2) complete. **(3) owner full re-test is next and is not
mine to start.** The audit (4) stays gated on that verdict and any round-4 items, as
you directed. Nothing in the repository blocks either.

**Lane.** GREEN throughout: docs, records, audit prep, comms. No game behaviour
touched, no code changed.

**Pointers.** `reports/archive/superseded/AUDIT_PACK_INDEX.md`; `SUBMISSION_DOSSIER.md` section 5g;
`WRS_MASTER_DOCUMENT.md` sections 1 and 2.

---

## 003 - 2026-07-26 - Rulings 1-11 executed; PR #89 merged; CI live

**COMMS-ACK.** Receipt of the FABLE RULINGS 1-10 AND NEXT SESSION block (2026-07-26),
including addendum ruling 11, recorded as instructed. Entries 001 and 002 closed.

**PR #89: MERGED** on your approval, branch deleted. Map item (1) complete. The
reconciliation document is noted as the standard for protocol 6 outputs.

**State delta.** All rulings executed in one consolidated pass, **PR #90 open for your
review**. Every gate green, including CI on its first real run (51s, all six).

| Ruling | Result |
|---|---|
| 2 SC placement | Flipped to **trailing**, `1,000.00 SC` / `500.00 GC`. One constant, every surface followed. Proofs regenerated, report tables corrected so the document no longer contradicts its own update section. |
| 3 Social wording | Applied social-branch-only, real-money untouched. **Zero prohibited terms.** stake.us and Stake EU unblocked on this axis. |
| 4 XEC | Documents no longer chased. Resolution path recorded as empirical via Developer Testing Tool currency toggling (map item 6). Stake EU stays contingent. |
| 5 MCP repoint | Adopted, recorded. Not yet built; queued behind the audit. |
| 6 stake-dev-tool | Self-hosted-only recorded as the default; no trial started this pass. |
| 7 Cleanup | Five YES items done; both refusals ratified and left undone. |
| 8 `CURRENCY_SCALE` | Canonical + import + **new drift gate**, read-only against the locked file. |
| 9 gameStore dead stores | In `LOCKED_FILE_DEBTS`, allowlisted with reasons in the scan. |
| 10 `dead_wiring_scan.mjs` | Adopted into the suite and into CI. |
| 11 CI | `.github/workflows/checks.yml`, six static gates, **verified green on PR #90**. |

**Three things I want your eye on.**

11. **A seventh social string existed.** `PaytableModal.svelte:259` had a hardcoded
    `Bet Modes` heading in a surface your six did not cover. I extended your ruling on
    that exact phrase to it (`Play Modes`) rather than inventing wording. Confirm you
    are happy with the extension.
12. **That rename broke a test, and it was the archaeology class repeating.**
    `social_string_conformance.mjs` pinned two selectors to the literal `"Bet Modes"`.
    I created a fresh instance of the stale-selector class within an hour of writing
    the report identifying it. Both selectors are now social-aware and the suite
    passes. Recorded because the lesson is that the class recurs under any rename, not
    only under overlay changes, and our only defence is running the suite.
13. **Ruling 11 forced a judgement call.** `svelte-check` had 33 pre-existing errors,
    so a naive gate fails on day one. Root cause was the browser app's tsconfig being
    applied to `tsx`-run `*.test.ts` scripts. Excluding them dropped the baseline
    **33 to 11 without touching app code**. The remaining 11 are real (telemetry
    payload typing on a no-op observer, a `RainLayer` default export, a `FlameJets`
    union), so the gate enforces **no regression against a committed baseline** rather
    than zero. **Ruling wanted:** clear the 11 as its own pass, or leave the baseline?
    I lean leave: they are annotation gaps in an observer path, and the file is
    `App.svelte`, days before the audit.

**Lane table.**

| Output | Lane | Status |
|---|---|---|
| PR #89 platform delta | REVIEW | **Merged**, branch deleted |
| PR #90 cleanup pass (rulings 2, 3, 8, 10, 11 + five items) | **REVIEW** | Open, CI green, awaiting your block |
| This comms entry | GREEN | Merged to `main` |

**Map position.** (1) done. (2) done, pending your #90 review. Next is (3) owner full
re-test on the current build, then (4) external audit prep. Nothing from me blocks (3)
once #90 lands.

**Pointers.** PR #90; `reports/qa/currency_readiness_2026-07-25.md` section 6a;
`.github/workflows/checks.yml`; `frontend/scripts/dead_wiring_scan.mjs`,
`currency_scale_drift.test.mjs`, `typecheck_baseline.mjs`;
`frontend/src/lib/utils/currency.test.ts`.

---

## 002 - 2026-07-26 - Fresh-eyes deep review delivered

**State delta.** Section 3 deliverable complete: `reports/qa/fresh_eyes_review_2026-07-26.md`.
Findings only, nothing changed. Scope: 61 source files / 15,026 lines, 35 harnesses,
78 archives / 12,017 lines. **14 findings: 5 KEEP, 6 CLEAN, 3 RETHINK.** No bug in
shipping behaviour found.

**Headline.** The codebase is better than three weeks of rapid iteration predicts:
**zero TODO/FIXME/HACK/@ts-ignore/eslint-disable markers in 15,026 lines.** The real
debt is not mess, it is **duplicated concepts** kept in agreement by a comment or an
assert rather than by construction. That single pattern is behind the PR #89 currency
defect, the Round 3 feature-grid sizing bug, and the 22 drifted `dismissIntro` copies.
Three live instances remain.

**Corrections to standing knowledge.**
- The stale-overlay script count is **six, not five**. `animation_uplift_proof.mjs`
  has its own inline handling under a different function name, which is why previous
  sweeps missed it.
- `CLAUDE.md`'s replay-mode compliance line names `ControlBar` and `AutoPlayModal`.
  **Neither file exists.** Behaviour is still correct; the requirement can no longer
  be checked against the code as written.

**Findings needing your ruling.** Continuing the numbering from 001.

7. **Consolidated cleanup pass contents.** Eight candidates ranked in the report's
   final table. I recommend **yes** to five and **explicitly no** to two:
   `replayStore.ts` (write-only, 4 stores) and unifying the duplicated feature-grid
   renderers. Both are real, both are post-launch. Under section 1's bar they are
   elegance, in compliance-bearing or visually complex code, days before the external
   audit. Ruling wanted on whether you agree with the two refusals.
8. **`CURRENCY_SCALE` is defined three times**, one copy inside locked
   `rgsService.ts`. All three agree today. It is the money path and the exact shape
   that produced the PR #89 defect. Proposed: `utils/currency.ts` canonical,
   `replayService.ts` imports it, the locked copy recorded in `LOCKED_FILE_DEBTS`.
   No lock lift needed.
9. **Four dead stores inside locked `gameStore.ts`** (`betIndex`, `buyBonusActive`,
   `canSetMaxBet`, `sessionStats`), no production read. Propose recording in
   `LOCKED_FILE_DEBTS` to ride the next sanctioned pass. Not worth a pass of its own.
10. **New permanent guard, already working.** The `standingMode` dead-wiring class is
    statically detectable. I wrote and ran the detector during the review: 9 of 53
    stores have no production read, and it correctly clears `jurisdictionFlags`, which
    a naive version false-flags. Run against the 2026-07-07 tree it would have caught
    `standingMode` before the manual wiring audit did. Propose hardening it into
    `frontend/scripts/dead_wiring_scan.mjs` and adding it to the suite. This closes
    the one row in the armour table currently marked "no static guard".

**Armour confirmed, since you asked for that too.** The buy-tier billing class is
covered three ways (cost-integrity gate driving the real player path, the
`fsModes`/`index.json` drift test, the wallet float scan). Notably `qa_soak.mjs`'s
cost table is **hardcoded rather than imported**, which looks like duplication and is
the correct independent-oracle design, i.e. the c6 recentre lesson applied properly by
whoever wrote it.

**Lane.** GREEN (findings document, no code changes), branched off `main` not off
PR #89 so it cannot drag review-lane content into `main`.

**Pointers.** `reports/qa/fresh_eyes_review_2026-07-26.md`. Map item (2) is now ready
for your rulings; item (1) still waits on your PR #89 review.

---

## 001 - 2026-07-25 - Platform delta and tool vetting; builder handover acknowledged

**Handover.** Opening correspondence received and saved verbatim as
`reports/archive/handovers/FS_Fable_ModelHandover_2026-07-25.md`. Roles, two-lane merge policy, dual
independent verification (protocol 6) and the nine-step map are in force from now.
Note: the opening block carried no COMMS-ACK token, so none is recorded against it;
this entry is the acknowledgement. Subsequent blocks will be ack-logged as specified.

**State delta.** Five-part platform-delta brief complete, four commits.

- **The public `StakeEngine/docs` GitHub repo is stale and structurally diverged**
  (commit `fefadc7`, 2026-03-17), still advertising 90.0 to 98.0 RTP with none of the
  risk limits. It is not the source of truth. This reversed the brief's own
  fast-track on the docs MCP server and corrected a wrong URL list in the master
  document.
- Live deltas captured: RTP ceiling **96.70** (ours 96.3500, margin 0.35pp); new
  **10,000,000 events per mode** and 4.2GB publish-time caps (ours 100,000); 3-star
  Maximum Exposure doubled **$25M to $50M**; `/docs/payments` captured for the first
  time.
- **Protocol 6 applied to the maths, 19 of 20 figures reconciled.** The twentieth was
  root-caused, not left open: cruise ETL(40x) is a threshold-inclusivity difference,
  two simulations sitting exactly on the 40.00x threshold worth 0.001791 of RTP.
  Published wording is `>= 40x`, so inclusive is correct, 0.3351 carried forward. Not
  material; OVERBOOST binds either way.
- **Real player-visible defect found and fixed.** Replay rendered `Bet: XSC 1.00`,
  printing the raw platform currency code at the player. Root cause was a second,
  divergent symbol table in `replayService.ts` keyed on `SC` while the RGS sends
  `XSC`. Both forms are genuinely live, so a narrow fix would have opened the mirror
  image. Now one table.
- **stake.us is BLOCKED** on six visible prohibited-term strings (`BET MODES`,
  `BUY FEATURES`, `1x bet` x2, `1.25x bet`, `BET`). Flagged not fixed per JOB 9b.
- All bet-level constraints **PASS on both star tiers**. `SUBMISSION_DOSSIER.md`
  gains section **5f**, a mandatory pre-review ACP gate.

**Lane assignments.**

| Output | Lane | Status |
|---|---|---|
| Platform-delta work (PR #89) | **REVIEW** | Open, mergeable, awaiting your block. Contains frontend currency behaviour, compliance docs and the dossier, so review lane governs the whole PR even though roughly half its content is green-lane by type. Say the word if you would rather I split the docs-only half out to land immediately. |
| This comms file + handover verbatim save | **GREEN** | Merged to `main` on own gates. |
| Fresh-eyes review (next) | **GREEN** on delivery | Findings document, no code changes, per section 3. Will be branched off `main`, not off PR #89, so it cannot drag review-lane content into `main`. PR #89's currency delta is accounted for inline since I authored it. |

**Findings needing your ruling.** Numbered for reference.

1. **CVaR definition.** Ambiguous on three axes (worst 0.1% or 1%; normalised or
   absolute; worst-case-across-modes or base only). Readings span 7.74% of the limit
   to 625% of it. All six computed and on file. Resolution is procedural via the new
   5f gate. Ruling needed only if you want a different resolution path.
2. **SC symbol placement.** Two first-party sources say trailing (`10.00 SC`): the
   docs currency page and the official `ts-client` SDK. The brief specified leading
   (`SC 1,000`). Shipped leading behind a one-line flip constant. **Needs your ruling
   before submission.**
3. **Six social strings.** Wording is yours per JOB 9b. Blocking stake.us and Stake
   EU, not stake.com.
4. **XEC unverified** against three first-party sources. Stake EU recorded as
   contingent. Confirm whether you have a source I could not reach.
5. **Docs MCP server.** Recommend repointing its indexer at our own dated mirror,
   which inverts it from staleness hazard to enforcement of convention (d). Changes
   the tool's purpose, so it needs your ruling rather than quiet adoption.
6. **stake-dev-tool.** MIT confirmed. Recommend self-hosted Docker only; cloud and
   share links would upload our frozen lookup tables to a third party. Needs an owner
   decision before any trial.

**New-capability self-assessment** (section 3d, three proposals, evidence-based).

What is demonstrated this session, not claimed in the abstract: **long coherent
passes holding cross-part state** (a `ts-client` finding in Part 4 fed back into
Part 3's report and the master document rather than being lost), and **chasing the
class rather than the symptom** (the `XSC` fix was incomplete until reading
`parseReplayParams` revealed the short form was also live). What I have **not**
demonstrated here and will not claim: better visual reasoning over committed
screenshots. Untested on this project.

1. **Cross-file invariant sweeps for the duplicated-logic class.** The currency
   defect was two implementations of one concept drifting apart, which is the same
   class as the twenty-two drifted `dismissIntro` copies. Propose a systematic sweep
   for concepts implemented more than once (currency, cost multipliers, mode
   metadata, overlay handling), reported as findings.
2. **Adversarial verification design under protocol 6.** The self-verifying recentre
   bug happened because the check shared code with the thing checked. Propose that
   for every remaining compliance artefact I write the verification so it shares no
   code path with the implementation, and state in each report what the two sides
   independently rely on.
3. **Whole-tree single-pass hygiene review.** The fresh-eyes deliverable itself, done
   as one coherent pass over the full frontend and scripts tree rather than chunked,
   so cross-file inconsistencies stay visible.

**Artefacts.** `reports/SESSION_REPORT.md` and
`reports/archive/2026-07-25_platform-delta-tool-vetting.md` (delta table);
`docs/stake-engine-live/2026-07-25/` (dated mirror + DELTA_NOTES);
`COMPLIANCE_WATCH.md` 2026-07-25 section (full constraint extraction);
`reports/qa/math_bet_level_compliance_2026-07-25.md`;
`reports/qa/currency_readiness_2026-07-25.md`;
`docs/records/tooling/TOOL_VETTING_2026-07.md`; PR #89.

**Next.** Fresh-eyes deep review, section 3 (a) through (d).
