# OWNER CHECKLIST

**The anti-forgetting document.** Rewritten 2026-07-28 to Fable's enumeration: **five things
are outstanding**, and everything else that was ever on this list is DONE with its evidence
path recorded below.

Written to be read on a phone. Australian English, no em dashes or en dashes.

---

## 0. Read this one thing about money

**`docs/records/MONEY_DISPLAY_EXPLAINED.md`.**

It is the plain-English account of how every figure on screen relates to what the wallet
actually does. It is item zero because it answers most "is that number right" questions before
they are asked, and because every money claim in this project is now proven rather than
asserted: **all five modes have had their wallet debit differenced to the cent**, Cruise last,
on 2026-07-28.

Nothing to do. This is a pointer, not a task.

---

# THE FIVE OUTSTANDING ITEMS

## 1. Tick the 58 Guidelines on `future-spinner-2`

**With `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` open beside you.** It
carries our position on every one of the 58, so most are a read-and-tick.

**Nine of them are OWNER items**, meaning only you can answer them. **The Provably Fair toggle
is among those nine** and is the one to look at hardest, because it is a platform setting
rather than anything in our build.

**What to send:** a screenshot of the Guidelines panel once the count moves off 0/58.

**DONE when** all 58 are ticked on `future-spinner-2`.

---

## 2. Verify the payout wallet address, character by character, before saving

**Why this gets its own item.** The platform's own wallet page says it plainly: **failed
payments cannot be recovered.** An ERC-20 address with one wrong character is not a bounced
payment, it is a lost one.

**What to do.** Open the wallet setting and compare the saved address against your CoinSpot
receive address **character by character**, not by glancing at the first and last four. Copy
and paste rather than typing.

**Never send that address to us and never put it in the repository.** This repository is
public. We record that the wallet is configured and nothing else; that is deliberate and it is
now a written rule at the head of `WRS_MASTER_DOCUMENT.md` section 1.

**DONE when** you have re-read it once, deliberately. Then the payments layer is finished:
model chosen, wallet configured, address verified.

---

## 3. Upload kit V9 and screenshot the v9 console line

**The kit is built and waiting:** `~/Desktop/FS_UPLOAD_KIT_V9/`. Follow **PART 9h** in the
walkthrough inside it. Upload to `future-spinner-2`.

**The one screenshot:** open the published game with the browser console open and capture the
first line. It reads `Future Spinner v9 build <sha> built <timestamp>`.

That single line does three jobs: it names **v9** in words rather than a hash, it carries the
**SHA** as the exact identity, and **if the city, the car and the rain are on screen behind it,
it proves the background files served.** Three of them returned 403 last visit from the
platform's unpublished area. They were never missing and they came good six minutes later, but
this is the frame that confirms it on a clean upload.

**DONE when** you have sent that one screenshot.

---

## 4. On that same visit, eyeball three things

None of these can be failed. Anything that looks wrong is worth a screenshot.

- **The bet picker.** Tap the BET window. A panel should open listing every bet level, current
  one in gold, smallest marked MIN BET and largest MAX BET. The levels should be **the
  platform's own for your currency**, not a list we invented. An unusual currency is the
  interesting screenshot.
- **Feature resume.** Trigger Overdrive Free Spins, and part way through the free spins
  **reload the page**. It should come back asking **CONTINUE YOUR ROUND**. Both buttons pay
  exactly the same; the choice only decides where the animation starts. **If that prompt does
  not appear, that is the useful result and not a failure**, and telling us beats debugging it.
- **The max-win hold, only if you happen to hit one.** Do not go hunting: it is 1 in 100,000.
  If you see it, leave it on screen for a minute before pressing COLLECT and tell us whether
  anything moved behind it. It is supposed to wait for you indefinitely.

**DONE when** you have looked at the first two and said what you saw.

---

## 5. Delete the old `future-spinner` entry, once the cooldown allows

`future-spinner-2` is the submission entry. The original is superseded, and two entries for one
game is exactly the stale-artefact confusion that has cost this project a star before.

**While you are there, bin the old kits.** `~/Desktop/` currently holds `FS_UPLOAD_KIT`,
`FS_UPLOAD_KIT_V7`, `FS_UPLOAD_KIT_V8` and `FS_UPLOAD_KIT_V9`. **Keep V9 only.** Kits are single
use, and a stale kit on the Desktop is one that eventually gets uploaded when it is out of date,
which has already happened once (TR-062).

**DONE when** only `future-spinner-2` remains in the team's game list and only `V9` remains on
the Desktop.

---

## On USPTO, since you asked

**Recorded plainly, and with the caveat that nobody here is a lawyer.**

Your captures show **no live exact match for either name**. The closest neighbours are a **dead,
abandoned FUTURE SPIN filing** and a **live SPINNERS registration in a different goods class**.
**That satisfies the search gate we set**, and the register row is updated to say so.

**A formal attorney clearance opinion remains available to you as optional belt and braces, not
a blocker.**

One honesty note, because this document is evidence. The committed frames at
`reports/screens/live-portal-2026-07-28/` (`082429`, `082546`) show the dead FUTURE SPIN filing
and two DEAD/CANCELLED SPINNER marks in IC 028. **The live SPINNERS registration is your
observation and is not visible in those frames**, so the register records it as yours rather
than as something we verified.

---

# DONE, with evidence

Everything below was on this list and is finished. Kept rather than deleted, so nothing is
asked twice and every claim can be checked.

| Item | Finished | Evidence |
|---|---|---|
| **Twenty Cruise spins, bracketed** | 2026-07-28 | `reports/screens/live-portal-2026-07-28/`, frames `072445` and `072516`. **TR-075 CLOSED.** 1000.00 minus 1.00 = 999.00, and 1000.00 minus 5.00 plus 0.84 = 995.84, both matching the HUD to the cent, at exactly 1.00x. **The last open money item in the project**, and the fifth and final mode to be proven. |
| **The build-SHA capture** | 2026-07-28 | Frame `071805`: the boot line reads build `e0c30611`, the kit V8 commit, so what is live is answerable from the artefact rather than inferred. |
| **Which entry is the submission** | 2026-07-28 | Your ruling: `future-spinner-2`. Recorded in `SUBMISSION_DOSSIER.md` section 5b0. |
| **The payments model** | 2026-07-28 | Frame `082628`: **Profit Share, 10 percent GGR**, selected against Guaranteed at 7.5 percent. |
| **The payout wallet, configured** | 2026-07-28 | Configured on the platform, ERC-20 USDT. Address held offline only and deliberately never recorded here. Verifying it is item 2 above. |
| **Business name registration** | 2026-07-27 | **We Roll Spinners**, ASIC, registered 27 July 2026, **renewal due 28 July 2027**. Diarise the renewal. |
| **Domain** | done | `werollspinners.com` live. |
| **USPTO wordmark searches** | 2026-07-28 | Frames `082429` and `082546`. Summary above; the register row now reads searches complete, evidence summarised, gate satisfied. |
| **The game tile** | 2026-07-28 | Frame `085752`: the composed tile in the Tile Editor on `future-spinner-2`. |
| **Your local preview** | 2026-07-28 | `http://192.168.4.92:5173` is refreshed to latest `main` at the close of every session that changes it, per protocol rule 12. Nothing for you to do. If the SHA there ever disagrees with the newest session report, tell us rather than debugging it. |
| **The stale Desktop kits** | partly | V7 and V8 are still there. Folded into item 5 above rather than kept as a separate item. |

---

## Where each of these is tracked

- Money and wallet proofs: `docs/records/reviews/REVIEW_TRACKER.md`, rows TR-075 and TR-102.
- Compliance and the 58: `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`.
- Company, trademark, payments: `WRS_MASTER_DOCUMENT.md` section 1.
- Upload and staging: `SUBMISSION_DOSSIER.md` section 5, and PART 9h in the kit's walkthrough.
- Capture evidence: `reports/screens/live-portal-2026-07-28/CATALOGUE.md`.
