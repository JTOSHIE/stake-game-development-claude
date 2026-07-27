# OWNER CHECKLIST

**The anti-forgetting document.** Seven things that are yours, not the build's, plus an item zero that is
simply a promise about your preview. Nothing here
can be done by a session; every one needs you, a portal login, a phone camera or a
conversation.

Written to be read on a phone. Each item says **what**, **why in one line**, **what to send
when it is done**, and **DONE when**.

Australian English, no em dashes or en dashes. Last refreshed 2026-07-28.

**Three corrections to what you may have been told before**, stated up front because two of
them change what you are looking for:

1. The Guidelines list has **seven** owner rows, not nine. Detail in item 2.
2. USPTO **is** recorded in the repository, as your own attestation from 2026-07-23. What is
   missing is the evidence behind it. Detail in item 5.
3. ABN, GST and the accountant are **one** register row, not three. Detail in item 7.

---

## 0. Your local preview looks after itself now

**Nothing to do. This is a promise, not a task.** It is item zero because it changes what you
can assume about the other seven.

**Your preview at `http://192.168.4.92:5173` is now always the latest `main` after any
session closes.** It is refreshed for you as part of every session's close, per protocol rule
12, so you never need to pull, rebuild or restart anything to see current work.

**If the SHA printed in the newest session report ever disagrees with what your preview
shows, tell the builder rather than debugging it yourself.** That disagreement is a fault in
the mechanism and it is ours to fix; chasing it costs you time and tells us less than simply
being told.

---

## 0b. What is now DONE, with the evidence path

Ticked off so you are not asked again. Each names where the proof lives.

| Item | Status | Evidence |
|---|---|---|
| **Twenty Cruise spins** | **DONE 2026-07-28** | `reports/screens/live-portal-2026-07-28/`, frames `072445` and `072516`. TR-075 CLOSED: the arithmetic resolves to the cent and Cruise debits exactly 1.00x. **This was the only open money item in the project.** |
| **The V7 and V8 era uploads** | **DONE** | Kit V8 is live on the portal: the boot line at frame `071805` reads build `e0c30611`, which is the V8 kit commit, and the bundle hash matches the kit. |
| **Which entry is the submission** | **DECIDED: `future-spinner-2`** | Your ruling. A fresh clean upload. The original `future-spinner` entry is superseded and awaits deletion, which is item 3b below. |
| **The payments model** | **APPEARS CHOSEN, confirm it** | Frame `082628` shows **Profit Share selected, 10% GGR**. Item 6 now only needs you to confirm that is deliberate. |

**If you read one document about money, read `docs/records/MONEY_DISPLAY_EXPLAINED.md`.** It is
the plain-English account of how every figure on screen relates to what the wallet actually
does, and it is the answer to most "is that number right" questions before they are asked.

---

## 1. Twenty Cruise spins, bracketed by session panels

**DONE 2026-07-28. TR-075 is CLOSED.** Kept here for the record rather than deleted, so
the method is on file if a sixth mode ever needs the same treatment. Evidence:
`reports/screens/live-portal-2026-07-28/`, frames `072445` and `072516`. Nothing to do.

**Why.** Four of the five modes have had their wallet debit proven to the cent by
differencing two balance readouts: base, OVERBOOST, Buy Overdrive and NITRO. **Cruise never
has.** It has one balance anchor, EUR 921.50, and no second frame, so there is nothing to
difference. What we have for Cruise is an inference from two other results, and the project's
own rule says to say so rather than present it as independent. One short run closes it
properly. It has been asked for across three visits and not yet done.

**What to do.**

1. Open **FEATURES**, select **Cruise**.
2. **Before you spin at all**: open the menu, open **Session information**, screenshot it.
   *The run is worthless without this one.*
3. Close it and spin **twenty times**. Autoplay is fine.
4. **After the twentieth spin**: open **Session information** again, screenshot it.

**What to send.** Two screenshots of the same panel, before and after, from the same session
with no reload in between.

**DONE when** both frames legibly show all of: **Spins** (after = before + 20), **Total
wagered**, **Total won**, **Net result**, the **HUD BET** figure, and **BALANCE**. The
balance pair is the one that actually closes it: the panel alone only proves the game's own
tally is self-consistent, and only two balance readouts prove the **wallet** moved.

*Expect the platform's Bets page COST column to read the bet level rather than the debit.
That is a platform convention, not a fault, and for Cruise at 1.00x the two coincide anyway,
which is exactly why the existing single frame cannot separate them.*

---

## 1b. The build-SHA capture, which permanently answers "which build is live"

**NEW, and it is the highest-value single thing on this list.** Right now the repository
cannot tell you which frontend version is live: Front V2 is the last confirmed publish and
five kits have been built since, so **every fix in the last four sessions is of unknown
liveness**.

**Why.** One screenshot ends that, permanently and for every future version.

**What to do.** It is step 3 of PART 9f in the kit walkthrough. After publishing, open the
game and read the build commit SHA, either from the DevTools Console boot line on reload or
from `build-info.json` in the published bundle.

**What to send.** That one screenshot, showing the SHA legibly, plus the portal's sync dialog
from the import step.

**DONE when** the screenshot shows a commit SHA. Any SHA: the value is that we stop
inferring.

## 2. The portal Guidelines ticks, with our self-assessment open beside you

**Why.** You asked that we work against the platform's own 58-item guidelines list before
ticking them on Stake Engine. We have. Our answers are in
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`, one row per item with the
evidence. Ticking the portal list with that open turns an hour of judgement into an hour of
copying.

**The count, corrected.** You may have read "nine are marked OWNER". **It is not nine.**
Three different numbers are in the repository: the walkthrough says 9, the self-assessment's
own summary table says 8, and **seven rows actually carry the OWNER token, six of them
unambiguously.** The prose was right about the substance and wrong about the arithmetic.

**Your seven, by item number:**

| # | Item | Can you do it now? |
|---|---|---|
| 7 | Thumbnail meets Stake artwork guidelines | **YES**, and see the note below |
| 32 | Check 5 wins for each game mode against the Game Rules | **YES**, made easy by the per-row "Replay this bet" button |
| 53 | **Provably Fair and Replay enabled** | **YES.** Replay is demonstrably working; Provably Fair is a portal toggle |
| 54 | Front and Math requests approved | No, needs Start Approval |
| 55 | Posted in the stake-engine-game-approved channel | No, post-approval |
| 57 | Approval request closed after live, emoji added | No, post-release |
| 58 | Game Released | No, final step |

**A contradiction in our own documents on item 7, so check rather than assume.** The
self-assessment says the portal still shows a "Design Thumbnail" placeholder in every
capture, so it is **not yet done**. The V6 walkthrough says "The game tile is done. You
composed it already." The kind reading is that the walkthrough means the artwork is composed
rather than uploaded. **Look at the portal and tell us which it is.** Also worth knowing: the
self-assessment only knows about the two landscape files and does not know that a composed
portrait tile at the platform's own 408x546 geometry now exists in the delivery set.

**What to send.** A screenshot of the portal list showing the tick count, plus a screenshot
of anything where the portal's list and our document disagree.

**DONE when** items 7, 32 and 53 are ticked on the portal, or you have sent a screenshot
explaining why one of them cannot be.

*The standing rule if anything disagrees: stop and screenshot it. A disagreement is worth
more than a tick.*

---

## 3. Bin the stale Desktop kits, keep only the newest

**Why.** A kit left on the Desktop is a kit that eventually gets uploaded when it is out of
date, **and that has already happened once.** The published bundle was a commit behind, and
the stale kit still contained nine em dashes including two that a reviewer could read on
screen. That defect (TR-062) is closed in the build, and the folders themselves are quietly
re-opening it. Kits are single-use by design; the builder refuses to make one from a dirty
tree.

**The current kit is `FS_UPLOAD_KIT_V7`**, built from a fresh clone at commit `6e9e4739` on
2026-07-28, 110 files, 15,612,453 bytes, with all dist gates run IN THE CLONE. Every earlier
walkthrough part is explicitly marked SUPERSEDED, DO NOT RUN; the live one is **PART 9f, the
clean-baseline visit**.

**V7 rather than another V6, deliberately.** V6 was built at `14b6506d` and predates the
whole locale pass, the count-up fix and the casing fix. Reusing a version name for different
contents is exactly the stale-artefact confusion TR-062 is about.

**What to do.** Delete these five from the Desktop:

- `FS_UPLOAD_KIT` (dead)
- `FS_UPLOAD_KIT_V3`
- `FS_UPLOAD_KIT_V4`
- `FS_UPLOAD_KIT_V5`
- `FS_UPLOAD_KIT_V6`

**What to send.** One screenshot of the Desktop showing only `FS_UPLOAD_KIT_V7` remaining.

**DONE when** exactly one kit folder is on the Desktop and its `README.md` names the commit
it was built from. Delete V7 too once you have published from it.

---

## 3b. Delete the old `future-spinner` entry, once the cooldown allows

**Why.** `future-spinner-2` is the submission entry. The original entry is superseded, and two
entries for one game is exactly the stale-artefact confusion that has cost this project a star
before. The platform imposes a cooldown before an entry can be removed.

**What to do.** When the cooldown allows, delete the original `future-spinner` entry. Nothing
depends on it.

**DONE when** only `future-spinner-2` remains in the team's game list.

---

## 4. If the red authenticate comes back, one Console screenshot

**Low urgency. Nothing player-visible has failed.** Do this only if you are in DevTools
anyway. Tracker row TR-081.

**Why.** Your capture showed four `authenticate` requests in one session, one of them red,
and four console errors. **Half of that is already explained**: production has exactly two
places that call `authenticate`, and the client never retries it, so a repeated count means
repeated session boots rather than a retry loop. What cannot be worked out from any frame we
hold is **why one was red and what the four errors said**, because every capture has the AI
assistance tab open where the Console panel would be.

**What to do, if it recurs.**

1. In DevTools, click the **Console** tab. Not the AI assistance tab.
2. **Expand** the four errors so the text is readable, not collapsed.
3. Screenshot.
4. If you can, also click the red `authenticate` row and screenshot its **Headers** and
   **Response** tabs.

**What to send.** The Console screenshot. The Headers and Response pair if you got them.

**DONE when** the four error texts are legible in one image. That alone is enough to close
the row.

---

## 5. Confirm the USPTO trademark position for both names

**Why.** Australia is genuinely closed: both legs were run on the official register, and the
dataset, the screenshots and the JSON are all committed. **USPTO is different, and the brief
that produced this checklist had it slightly wrong.** A USPTO confirmation **is** recorded in
the repository: your own attestation dated 2026-07-23 that you searched and found the names
clear. What was never recorded is **the evidence behind it**: no hit counts, no mark records,
no screenshots. An attestation is fine for our own confidence. It is thin if the names are
ever challenged, and the platform is explicit that trademark infringement is grounds for
rejection.

**What to do.** At `tmsearch.uspto.gov`, run three searches and screenshot each result page:

1. `We Roll Spinners`
2. `Future Spinner`
3. `future spin`

Each with **live marks only** and **classes 9 and 41**.

**What to send.** Three screenshots, each showing the search term, the live filter, the class
filter, and the result count.

**DONE when** all three are captured, whatever they show. A result that is not clean is more
valuable than no result, and it is far cheaper to find now than after release.

*Standing caveat, unchanged: this is documented pragmatic clearance, not a formal legal
opinion. A trademark professional is still needed before any enforcement action.*

---

### What your 2026-07-28 search actually turned up

Committed at `reports/screens/live-portal-2026-07-28/`, frames `082429` and `082546`.

- **"Future Spinner"**: 14,407 results. The two visible marks are both `SPINNER`, IC 028, both
  **DEAD / CANCELLED**.
- **"future spin"**: 16,693 results. The first result is **FUTURE SPIN**, serial **88852459**,
  **Class 041, entertainment services and online games**, owner **LIGHT & WONDER, INC.**,
  status **DEAD / ABANDONED**.

**That last one is the material find**, and it is why this item exists: a near-identical
wordmark in our own class, once held by a major supplier, now abandoned.

**This is evidence, not a clearance, and the builder does not give you a view on it.** Whether
an abandoned mark clears our use is a legal question. Put these two frames in front of whoever
advises you and let them answer it.

---

## 6. Choose the payments model on the portal, before release

**Why.** You are paid per team and you can switch at any time, with a change taking effect
from the next cycle. The choice is genuinely yours because it is a volatility question, not a
correctness one. Payouts run monthly on any amount above zero.

**The two models, in the platform's own words** (captured 2026-07-25):

| In the app | Model | Rate |
|---|---|---|
| Profit Share | 10% GGR (Revenue Share) | 10% of actual GGR |
| Guaranteed | 7.5% Guaranteed Payment | 7.5% of expected GGR |

`GGR = Total Bets − Total Wins Paid to Players`

**Option 1, 10% GGR.** "If players get lucky and your game has negative GGR, you do not owe
Stake any money. Instead, a negative balance (debt) is recorded and carried forward." Also:
"You never pay Stake money out of pocket", "A negative balance carries forward indefinitely
until future positive earnings offset it", "You don't receive payouts until the debt has been
cleared", and "There is no time limit on carrying the balance forward."

**Option 2, 7.5% Guaranteed.** "you earn 7.5%, but it's calculated using your game's
**expected RTP** rather than the actual results", and there is "no negative balance and no
debt", with Stake taking on all of the volatility. Note: "If you carried a negative balance
(debt) from a previous 10% GGR period when you switch to 7.5%, that existing debt still needs
to be earned off first."

**The plain trade-off.** 10% pays more when the game runs at or above expectation and can
leave you waiting through a debt period when it does not. 7.5% pays less and cannot go
negative. With one title and no buffer, the second is the lower-variance choice; with a
5,000x cap and a 100,000-round-per-mode tail, a bad month is a real possibility rather than a
theoretical one. **This is your call and nobody here should make it for you.**

**What to send.** A screenshot of the Payments page showing which model is selected.

**DONE when** a model is selected on the portal and the wallet details are configured, before
the first payout cycle.

---

## 7. The accountant conversation, before first revenue

**Why.** Money starts arriving as soon as a model is chosen and a wallet is configured, and
it arrives monthly on any amount above zero. It is much easier to have the structure right
before the first payment than to unpick it after.

**Correction to how this is usually described.** It is **one** register row, not three:
"Business structure and tax advice (AU)", status **OPEN**, owner **JOSH**. Two things follow
from that, and both are gaps rather than facts:

- **Whether you have an ABN is not recorded anywhere in the repository.** It is treated as a
  topic to raise, not a tracked item with a status.
- **GST is recorded only as a threshold to watch** (AUD 75k registration threshold). No
  registration status is recorded either way.

If either is already sorted, say so and it gets recorded, because right now the register
cannot tell.

**The five topics, as the register row itself lists them.** Sole trader versus company for
publisher income; ABN; GST registration threshold (AUD 75k); treatment of Stake Engine
payouts; record keeping.

**What to send.** One line telling us the structure decided, whether an ABN exists, and
whether GST registration applies yet. That is all that needs recording; nothing sensitive
goes in the repository.

**DONE when** the register row can be flipped from OPEN to DONE with a date.

*Standing disclaimer, carried verbatim from the register: neither Fable nor any document here
is legal or tax advice.*

---

## Two things that fell off the list and should not have

Recorded here rather than lost again. Neither is a new request; both were asked for once and
then quietly dropped out of the current walkthrough when it was rewritten.

**A. The zero-win end-round observation (TR-064).** The project's own notes call this "the
highest-value single observation left", and it is the only genuine CONFLICT among the
platform's 58 guideline items: the official client and the platform's own testing guideline
give opposite instructions for what to do at the end of a losing round. The ruling was to
**observe before changing anything**. It is no longer asked of anyone in any current
walkthrough section.

*There may be an answer already in hand.* One live capture's request list shows `play`
entries with no `end-round` following them. If those rounds were zero-win, the question is
settled. If the frame cannot show they were zero-win, it is not, and saying so is the honest
answer. Worth five minutes in DevTools next time you are in there: play until you lose, and
screenshot the network panel showing whether an `end-round` follows.

**B. The full DTT Language list, scrolled to the end.** The platform's Language menu offers
at least seventeen languages and we ship sixteen; the menu was still scrolling when the
capture stopped. Until that list is read end to end, the size of the remaining translation
work is guesswork. One scrolled screenshot of the whole menu settles it.

---

## Where each of these is tracked

| Item | Row or record |
|---|---|
| 1. Cruise spins | `docs/records/reviews/REVIEW_TRACKER.md`, TR-075 |
| 2. Guidelines ticks | `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` |
| 3. Desktop kits | TR-062, and `docs/records/upload-kit/00_READ_ME_FIRST.md` PART 9e |
| 4. Red authenticate | TR-081 |
| 5. Trademark | `docs/records/trademark/2026-07-15/SEARCH_LOG.md` |
| 6. Payments model | `WRS_MASTER_DOCUMENT.md` section 1, and `docs/stake-engine-live/2026-07-25/payments.md` |
| 7. Accountant | `WRS_MASTER_DOCUMENT.md` section 1, first row |
| A. Zero-win end-round | TR-064, TR-079 |
| B. Language list | TR-059 |
