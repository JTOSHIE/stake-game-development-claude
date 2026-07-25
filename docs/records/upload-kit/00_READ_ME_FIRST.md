# READ ME FIRST: uploading Future Spinner to Stake Engine

Everything in this kit has already been checked. Your job is to drag files from labelled
folders into the right pages, in order. You do not need to verify anything.

Allow about an hour. You can stop at any step and come back.

---

## Before you start: four things that should make this relaxed

**1. Nothing you do today is public.** Nothing is visible outside your team until you press
**Submit for review**, and you are NOT pressing that today. It is not part of this session.

**2. Nothing you do today is permanent.** Every upload can be replaced by uploading again.
If you upload the wrong file, upload the right one over it.

**3. "Publish" does not mean publish.** The portal has buttons called **Publish Game, Math**
and **Publish Game, Front End**. On this platform that means *make my uploads runnable so I
can test them*. It does not put anything in front of players.

**4. If something looks wrong, stop and take a screenshot.** A screenshot of a confusing
screen is more useful than a guess. Nothing breaks by pausing.

---

## What is in this kit

| Folder | What it holds | Where it goes |
|---|---|---|
| `01_maths_upload/` | 12 files: the game's maths | The game's **Files** page |
| `02_frontend_upload/` | 108 files: the game itself | The game's **Files** page |
| `03_branding/` | 3 images | Two different pages, see below |

Each folder has a `HASHES.txt`. That is a record for later, not a task. Ignore it today.

**One thing to know about the maths folder: it holds TWELVE files.** Some of our older
documents say eleven. Eleven is a miscount that was found and corrected on 2026-07-26. If
you count twelve, that is correct.

---

## Part 1: log in

1. Go to the Stake Engine developer dashboard and log in.
2. You should land on a page listing your team's games. **Future Spinner** should be there.

If Future Spinner is not listed, stop here and tell me. Everything below assumes the game
entry already exists.

---

## Part 2: the studio logo (Team Settings)

This is your studio's logo, not the game's. It is uploaded once and applies to everything
your team publishes.

3. Open **Team Settings**.
4. Open the **Branding** tab.
5. Upload **`03_branding/WeRollSpinners-Logo.png`**.
6. Save.

That is the only file from `03_branding/` that goes here. The other two come later, in a
different place.

---

## Part 3: the maths files

"Maths files" are the tables that decide what every spin pays. The game itself does not
decide outcomes; these files and the platform's server do.

7. From the games list, open the **Future Spinner** entry.
8. Open its **Files** page.
9. Upload **all 12 files** from `01_maths_upload/`.

**Order matters if the page asks you to upload one at a time.** Upload `index.json` first,
because it is the file that names all the others. If you can drag all twelve at once,
do that instead and order does not matter.

Two of the files are large: `books_bonus.jsonl.zst` at about 145 MB and
`books_super.jsonl.zst` at about 142 MB. **The total is about 400 MB, so this upload will
take a while on a normal connection.** That is expected. Leave the tab open.

10. When the uploads finish, confirm the page lists all twelve.

---

## Part 4: the game files

11. Still on the **Files** page, upload **the contents of `02_frontend_upload/`**.

**Upload the contents, not the folder.** Inside `02_frontend_upload/` there is a file
called `index.html` and some folders next to it. Those are what the platform expects at the
top level. If the portal ends up with a folder called `02_frontend_upload` containing
everything, the game will not load, and the fix is to delete and re-upload from inside the
folder.

12. There are 108 files, most of them small. This upload is much quicker than Part 3.

---

## Part 5: make your uploads runnable

Two buttons. As above: "publish" here means *make it runnable for me*, nothing public.

13. Press **Publish Game, Math**.
14. Wait for it to report success.
15. Press **Publish Game, Front End**.
16. Wait for it to report success.

If either reports an error, screenshot it and stop. Do not re-upload files to try to fix an
error you have not read to me first.

---

## Part 6: the game tile

The tile is the picture players see in a game list. You compose it from two layers.

17. Open the **Tile Editor** for Future Spinner.
18. Upload **`03_branding/FutureSpinner-BG.jpg`** as the **background**.
19. Upload **`03_branding/FutureSpinner-FG.png`** as the **foreground**.
20. Position the foreground however looks right to you. This is a visual judgement and it
    is yours.
21. Save.

---

## Part 7: launch the game

22. Open the game's **Developer** page.
23. Press **Start game session**.
24. Press **Launch in New Tab**.

The game should load and be playable with test money.

**If it loads and plays, the hard part is done.** Everything after this is looking at things
and taking screenshots.

---

# Part 8: the ten checks

This is the part that matters most, and it is the reason for the whole session. Take your
time.

**Why we are doing this.** The game talks to the platform's wallet, and we built that
conversation from the platform's published code rather than from watching it happen. Ten
things below are places where we made a sensible assumption that has never been tested
against the real thing. Each check either confirms an assumption or tells us exactly one
line to change.

**Before you start:** in the browser, open the developer tools and select the **Network**
tab. Leave it open for the whole session. In the filter box, type `wallet`.

If you do not know how to open developer tools: right-click the page, choose **Inspect**,
then click **Network** along the top.

**Where screenshots go.** Make a folder on your Desktop called `DTT_SCREENSHOTS`. Save
everything there with the filename given in each check. I will file them into the
repository afterwards.

**The technical detail for every check is in `DTT_PROTOCOL.md` in the repository.** You do
not need it. It is there for me, and for Fable, and it explains what changes if a check
comes back different.

---

### Check 1: the login response

**Look at this.** In the Network tab, find the request called **authenticate**. Click it,
then click **Response**.

**Expect this.** A block of text with `balance` in it, and inside `balance` two things:
`amount` and `currency`. Also a block called `config` containing `minBet`, `maxBet`,
`stepBet`, and a list called `betLevels`. Inside `config` there should be another block
called `jurisdiction` with about twelve true/false settings.

**Screenshot this.** `01-authenticate.png`, with the response expanded so `balance` and
`config` are both visible.

---

### Check 2: is your balance in whole units or millionths?

**Look at this.** In that same authenticate response, read the number next to `amount`.
Then look at the balance shown in the game itself.

**Expect this.** If the game shows `$100.00`, the number in the response should be
`100000000`. The platform counts in millionths.

**Screenshot this.** Covered by check 1. Just tell me the two numbers.

---

### Check 3: a spin

**Look at this.** Spin once. In the Network tab find the request called **play**, click it,
then **Response**.

**Expect this.** Two blocks: `balance`, and `round`. Inside `round` there should be
`betID`, `payout`, and a block called `state`.

**Then expand `state`.** This is the single most important thing in the whole session.
We expect to find a list called `events` inside it.

**If `events` is somewhere else**, write down exactly where. If it is not there at all,
say so. This is the one where being wrong matters most, and it is also completely fine if
we are wrong, because it is a small change.

**Screenshot this.** `03-play.png`, with `state` expanded far enough to show what is inside.

---

### Check 4: the end of a round

**Look at this.** After a winning spin, find the request called **end-round**. Look at both
what was sent (**Payload** or **Request**) and what came back (**Response**).

**Expect this.** What we send should contain only `sessionID` and nothing else. What comes
back should contain only `balance`.

**Screenshot this.** `04-endround.png`, showing both.

---

### Check 5: interrupting a round

This one is a deliberate experiment. Nothing breaks.

**Do this.** Start a spin and, while it is still going, **reload the page**.

**Expect this**, in this order:
1. The game loads and shows the opening splash.
2. **After you tap past the splash**, the interrupted spin plays out in front of you.
3. The balance updates.
4. A message appears: *"Your previous round has been completed and its result applied."*

**The thing to check.** Once that message appears, compare the balance in the game with
your balance in the portal itself. **They must agree.** If they do not, that is the most
important finding of the day, so tell me immediately.

**Screenshot this.** `05a-replay.png` while the spin is playing back, and
`05b-banner.png` with the message and the balance visible.

---

### Check 6: is there any display information we are missing?

**Look at this.** Back in the authenticate response from check 1, look for anything about
how to display currency: words like `symbol`, `decimals`, or `currencyDisplay`.

**Expect this.** Nothing. We expect there is no such information, and we handle the display
ourselves.

**This check is asking you to confirm something is absent**, which is easy to get wrong by
not looking hard enough. Have a proper scan through.

**Screenshot this.** Covered by check 1. Just tell me: found something, or found nothing.

---

### Check 7: Gold Coins

Only if you can open a **Gold Coin (GC)** session.

**Look at this.** The balance as the **platform itself** shows it, outside the game.

**Expect this.** Two decimal places, like `10.00 GC`.

**Why we ask.** The platform's own code and the platform's own documentation disagree with
each other about this. Yours is the tiebreak.

**Screenshot this.** `07-gc-balance.png`.

---

### Check 8: replays

**Look at this.** We have a list of test replay IDs in `REPLAY_TEST_EVENTS.md`. Open a
replay for each of the five game modes.

**Expect this.** The round described. **But be ready for the ID to be one out.**

**If a replay shows nothing, or shows a different round, try the next number up.** So if ID
`5` fails, try `6`. Write down which one worked. Being one out is a known possibility and a
perfectly good answer.

**Also check** that an ordinary winning replay shows a real board with real wins, not an
empty grid.

**Screenshot this.** `08-replay-<mode>.png`, at least one per mode.

---

### Check 9: the controls

**Look at this.** Try each of these and note what happens.

| Try this | Note whether |
|---|---|
| Press the spacebar | it spins, or it does nothing |
| Press the speed control repeatedly | which speeds it offers |
| Tap during a spin | the reels stop early, or they do not |
| Look for the bonus buy | it is there, or hidden |

Whatever happens is the right answer. We are recording what this jurisdiction allows, not
testing whether the game is broken.

**Screenshot this.** `09-controls.png` of the authenticate response's `jurisdiction` block
from check 1, plus a photo of anything that behaved unexpectedly.

---

### Check 10: the small player

**Look at this.** Open the game in the platform's **mini player** (the small pop-out
window).

**Expect this.** One row of controls along the bottom: a features button, a menu, your
balance, your win, plus and minus for the bet, and a spin button. Everything readable,
nothing overlapping, nothing cut off.

**Screenshot this.** `10-mini-player.png` sitting still, and `10b-mini-spinning.png`
mid-spin.

---

## When you are finished

25. Zip up your `DTT_SCREENSHOTS` folder, or just leave it on the Desktop and tell me.
26. Tell me anything that came back different from expected, and anything that confused
    you. **"That step made no sense" is a useful answer** and I would rather fix the
    instructions than have you guess.
27. **Do not press Submit for review.** That comes after we have looked at what you found.

---

## If something goes wrong

**An upload fails partway.** Upload it again. Uploads replace, they do not stack.

**The game will not load after publishing.** Most likely the frontend files went up inside
a folder instead of at the top level. See step 11.

**A page asks for something this document does not mention.** Screenshot it and stop.
The portal may have changed since our notes were written, and I would rather update the
notes than have you work around it.

**You are unsure whether you have broken something.** You have not. Nothing before
**Submit for review** is visible outside your team, and every upload can be replaced.
