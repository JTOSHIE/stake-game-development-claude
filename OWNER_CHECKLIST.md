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

# HOW THIS DOCUMENT NAMES THINGS, rewritten 2026-07-30 on the owner's order

**Instructions never name a kit version or a portal entry. The dated record below does.**

This document used to contradict itself, and the contradiction was structural rather than
careless. Item 3 said *"delete every older kit, including V9"* while item 5 said *"keep V9
only"*, and **both were true on the day each was written.** The cause was that the kit build
put the version number in the FOLDER NAME, so one fact became five folders on the Desktop, and
then two instructions had to independently track which one mattered. They drifted, as any two
documents tracking a moving number eventually will.

So the rule now is: **history does not go stale, instructions do.** The DONE table at the
bottom names versions and entries in the past tense, at the moment each became true, and it
keeps them forever. The five items below name neither, and therefore cannot rot.

The kit itself is now always at **`~/Desktop/FS_UPLOAD_KIT`**, one folder, rebuilt in place,
and the build **refuses to run while any older kit folder is beside it.**

---

# THE FIVE OUTSTANDING ITEMS

## 1. Tick the 58 Guidelines on the entry you are submitting

**With `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` open beside you.** It
carries our position on every one of the 58, so most are a read-and-tick.

**Nine of them are OWNER items**, meaning only you can answer them. **The Provably Fair toggle
is among those nine** and is the one to look at hardest, because it is a platform setting
rather than anything in our build.

**You and Fable have already worked through a number of these, and that progress is recorded
nowhere.** Checked 2026-07-30 across all 30 entries of `reports/FABLE_COMMS.md`: no entry at
any date records any guidelines progress. Every count this repository holds is **0 of 58**,
the newest from the owner-session frames of 2026-07-28, whose own catalogue says *"the counter
did not move at any point today"*.

**A correction, because this line previously claimed otherwise.** It said getting the state
transcribed was a live request to Fable in comms entry 030. **Entry 030 contains no such
request**: its six questions concern the eight owner-blocked rows, the sanctions, the currency
contradiction, the backlog spend, the docs-watch mechanism and the unanswered queue. The
request was never made, and this document asserted it had been. That is the same failure this
seat is on record for, a document treated as evidence for something nobody did.

**BOTH CAUTIONS THAT USED TO SIT HERE ARE NOW RESOLVED, 2026-08-08, and the resolution is the
useful part.** They warned that the self-assessment's OWNER count disagreed across three
figures, and that its headline still read *"3 FAIL, 1 CONFLICT"* against items that had since
closed.

**The self-assessment has been recounted from its own rows and the counting rule is written into
it**, so anyone can reproduce the figures: **PASS 40, OBSERVE 10, OWNER 7, FAIL 0, CONFLICT 0,
N/A 1**, summing to 58. OWNER is **seven**, not nine and not eight; the rows are items 7, 53,
54, 55, 57, 58 plus item 32 as OWNER and OBSERVE.

**FAIL is zero for the first time.** Items 12 and 25 closed earlier; item 15 was a real defect
and was fixed on 2026-08-05; item 46 was never a defect at all and its FAIL verdict was
corrected after being proven against a real build.

**What to send:** a screenshot of the Guidelines panel once the count moves off 0/58.

**DONE when** all 58 are ticked on the entry you are submitting.

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

## 3. Upload the kit and screenshot the console line

**DONE 2026-08-08: the Desktop tidy-up happened.** All five kit folders were binned and a fresh
kit built at commit `a2805f7`. The build now makes exactly one folder and refuses to run while
another exists, so the ambiguity cannot recur. Kept here as a dated record rather than deleted,
because the sentence below it needed correcting and the correction is the useful part.

**A SENTENCE HERE WAS MISLEADING AND THE OWNER CAUGHT IT.** It read that the unversioned
`FS_UPLOAD_KIT` "holds the maths package and must never be uploaded", which reads as though the
MATHS must never be uploaded. **The maths absolutely is uploaded, and was, on 2026-08-08: twelve
files, 380 MB, validated by the platform as Valid.**

**What that warning actually meant.** The 26 July folder was an OLD THREE-PART bundle carrying a
maths payload, a frontend payload and branding together. The danger was uploading that stale
bundle, not uploading maths. **Maths and frontend go to SEPARATE slots on the platform** and are
published separately. The current kit deliberately contains **no maths at all**: only the
frontend payload and the branding. The maths is already up, it is validated, and it does not
change between frontend builds, so there is nothing to re-send.

**Then build a fresh kit and upload it.** `node scripts/kit_build.mjs` puts it at
`~/Desktop/FS_UPLOAD_KIT`. Follow the walkthrough inside the folder; it is copied in with the
kit, and its live section is the only PART 9 heading not marked SUPERSEDED. **Upload to the
portal.** Which entry is yours to choose; this document does not name one, because naming one
is what made it go stale.

**Do not upload a kit you did not just build.** That is a standing rule and not a comment on
any particular folder: the version inside a kit tells you what it is, and a kit older than the
tip is a kit that ships yesterday's fixes.

**OPEN IT IN A NEW PRIVATE WINDOW, AND THIS IS NOT OPTIONAL. Added 2026-08-08 after a stale
page cost an evening and looked exactly like a broken build.**

A private window does two jobs at once: it holds **no cached copy of the previous upload's HTML**,
and it runs **no browser extensions**. On 2026-08-08 roughly forty of the forty-five console
errors came from a crypto wallet extension injecting itself into the page, which is noise that
makes a real error impossible to find.

**THE FAILURE THAT PRODUCED THIS STEP, so it is recognisable rather than mysterious.** After a
clean upload the game showed a **WHITE SCREEN** and the console showed asset 404s. The page was
asking for these:

    svelte-BYtsoJ2v.js      index-IEbOMUSR.css      index-DEOd1P6P.js

The kit that had just been uploaded contains these:

    svelte-Dqw5zo1U.js      index-DqeVIwyE.css      index-DiIn163I.js

**Different hashes. So the HTML being executed was not the HTML that was just uploaded**: it was
an older copy, asking for asset names that no longer existed. The confirming detail is that the
stylesheet came back with MIME type `text/plain` rather than `text/css`, which is what a 404 page
looks like when a browser tries to parse it as CSS.

**A white screen from a stale page is indistinguishable from a broken build by eye.** The hash
comparison is what tells them apart, and it takes ten seconds.

**THE CHECK, in order:**

1. Open the published game in a **new private window**.
2. **First console line** must read `Future Spinner v<n> build <sha> built <timestamp>`, and the
   version and SHA must match the BUILD_INFO.json file inside the kit you just uploaded.
3. **If you see a white screen or asset 404s**, do NOT conclude the build is broken. Compare the
   hash in the failing request against the ones in the kit's `index.html`. If they differ, the
   page is stale: close the window, open another private one, and try again.
4. **Only if the hashes MATCH and it still fails** is it a real problem with the build.

**You do not need to restore a previous version to clear this.** On 2026-08-08 restoring V9 and
republishing did clear it, but that changed the published version as a side effect, which is a
heavier action than the situation needed. **Try a fresh private window first.** If a stale page
survives that, it is the platform's cache rather than yours, and the version round-trip is the
fallback rather than the first move.

**The one screenshot:** that first console line. The same version and commit are in the
BUILD_INFO.json file inside the kit folder, if you want to check before uploading.

**Your local preview shows the same two values on screen now**, bottom left, so you can compare
what you are about to upload against what you have been looking at without opening a console.

That single line does three jobs: it names the **version in words** rather than a hash, which
closes which-build-is-live for good; it carries the **SHA** as the exact identity; and **if the
city, the car and the rain are on screen behind it, it proves the background files served** on
a clean upload.

**While the paytable is open on that visit, one glance at the hero:** it should read
**1,024 WAYS TO WIN**, uppercase, in the brand face. Anything else there is a screenshot.

**DONE when** you have sent that one screenshot **and there is no `FS_UPLOAD_KIT` folder on
your Desktop.** Bin it after uploading. That is the whole single-use rule and it is now
checkable at a glance rather than by remembering a version number: **a kit folder that is
there means you have not uploaded it yet.**

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

## 5. Delete the superseded portal entries, once the cooldown allows

**Keep one entry for this game and delete the rest.** Two entries for one game is exactly the
stale-artefact confusion that has cost this project a star before.

**Which one survives is your call**, and the DONE table below records which entry each piece of
evidence came from, so you can tell them apart. You have said the numbered entries are working
handles you swap between while building; that is fine, and it is precisely why no instruction
in this document names one.

The Desktop kit tidy-up that used to live here has moved into item 3, because it has to happen
before the next upload rather than after it.

**DONE when** one entry remains in the team's game list.

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

Kept rather than deleted, so nothing is asked twice and every claim can be checked.

**CORRECTED 2026-08-05, S2-C055. This heading used to read "Everything below was on this
list and is finished", and the table below contradicts it in two rows.** "The stale Desktop
kits" reads **not done** and is FOLDED INTO ITEM 3 rather than finished. "Kit V10 uploaded"
is REPORTED by the owner in conversation and explicitly not verified here, and its own cell
says item 3 stays open until the console line arrives.

**So this table is what has been DEALT WITH, which is not the same as finished.** A row here
is closed, folded into a live item, or recorded as reported; each row says which. Read the
Finished column and the evidence, not the heading.

| Item | Finished | Evidence |
|---|---|---|
| **Twenty Cruise spins, bracketed** | 2026-07-28 | `reports/screens/live-portal-2026-07-28/`, frames `072445` and `072516`. **TR-075 CLOSED.** 1000.00 minus 1.00 = 999.00, and 1000.00 minus 5.00 plus 0.84 = 995.84, both matching the HUD to the cent, at exactly 1.00x. **The last open money item in the project**, and the fifth and final mode to be proven. |
| **Kit V10 uploaded** | 2026-07-30, reported | **REPORTED by the owner in conversation, not verified here.** His words: *"yes, version 10 was uploaded"*. No screenshot, entry name or console line has reached the repository, so what is LIVE is not answerable from any artefact and the row below still records the newest capture. Item 3 above stays open until the console line arrives. |
| **The build-SHA capture** | 2026-07-28 | Frame `071805`: the boot line reads build `e0c30611`, the kit V8 commit, so what is live is answerable from the artefact rather than inferred. |
| **Which entry is the submission** | 2026-07-28 | Your ruling that day: `future-spinner-2`. Recorded in `SUBMISSION_DOSSIER.md` section 5b0. **Superseded 2026-07-30**: you have since confirmed the numbered entries are interchangeable working handles, so no document names one and the choice is yours at upload time. Kept because it dates the evidence rows below it. |
| **The payments model** | 2026-07-28 | Frame `082628`: **Profit Share, 10 percent GGR**, selected against Guaranteed at 7.5 percent. |
| **The payout wallet, configured** | 2026-07-28 | Configured on the platform, ERC-20 USDT. Address held offline only and deliberately never recorded here. Verifying it is item 2 above. |
| **Business name registration** | 2026-07-27 | **We Roll Spinners**, ASIC, registered 27 July 2026, **renewal due 28 July 2027**. Diarise the renewal. |
| **Domain** | recorded live 2026-07-28 | `werollspinners.com` live. **The Finished column read "done" where every other row carries a date.** No registration date is on file anywhere in this repository, so the date given is when this row was RECORDED, not when the domain was registered; it is a dated observation and deliberately not a claim about the registrar. |
| **USPTO wordmark searches** | 2026-07-28 | Frames `082429` and `082546`. Summary above; the register row now reads searches complete, evidence summarised, gate satisfied. |
| **The game tile** | 2026-07-28 | Frame `085752`: the composed tile in the Tile Editor on `future-spinner-2`. |
| **Your local preview** | 2026-07-28 | Your local preview is refreshed to latest `main` at the close of every session that changes it, per protocol rule 12. Nothing for you to do. If the SHA there ever disagrees with the newest session report, tell us rather than debugging it. **The address is deliberately NOT written here any more, per convention (s).** This row carried `192.168.4.92`, which stopped being this machine's address and answered nothing; `scripts/owner_preview.mjs` carried the same literal and was corrected on 2026-08-05 to derive the address and to refuse to print one it cannot reach. **Read the address from the line that script prints.** |
| **The stale Desktop kits** | not done | Five kit folders are on the Desktop, including the 26 July unversioned one that holds the MATHS package. Folded into item 3, because it must happen before the next upload. `ls -d ~/Desktop/FS_UPLOAD_KIT*` is the current list; do not trust this row for it. |

---

## Where each of these is tracked

- Money and wallet proofs: `docs/records/reviews/REVIEW_TRACKER.md`, rows TR-075 and TR-102.
- Compliance and the 58: `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`.
- Company, trademark, payments: `WRS_MASTER_DOCUMENT.md` section 1.
- Upload and staging: `SUBMISSION_DOSSIER.md` section 5, and the one PART 9 section in the kit's walkthrough that is NOT marked SUPERSEDED. The build refuses unless exactly one is live, so there is never a choice to make.
- Capture evidence: `reports/screens/live-portal-2026-07-28/CATALOGUE.md`.
