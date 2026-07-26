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

**3. "Publish" does not mean publish.** The portal has a green **Publish Game** button. On
this platform that means *make my uploads runnable so I can test them*. It does not put
anything in front of players.

**4. If something looks wrong, stop and take a screenshot.** A screenshot of a confusing
screen is more useful than a guess. Nothing breaks by pausing.

---

## What is in this kit

| Folder | What it holds | Where it goes |
|---|---|---|
| `01_maths_upload/` | 12 files: the game's maths | The game's **Files** page |
| `02_frontend_upload/` | 108 files: the game itself | The game's **Files** page |
| `03_branding/` | 3 images | Two different pages, see below |

The two `HASHES.txt` files sit in the kit root, NOT inside the upload folders. That is
deliberate, and it was a correction: they were originally inside, and the first upload
carried `HASHES.txt` into the portal along with the maths files. Anything inside an upload
folder gets uploaded. The folders now contain only files that belong on the platform.

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

10. When the uploads finish, the **MATH** panel at the top of the Files page should read
    **12 files**, about 380 MB.

    If it says 13, one extra file has been uploaded. Tell me which one and I will tell you
    whether it matters. (On the first run it was `HASHES.txt`, which is harmless but does
    not belong there.)

---

## Part 4: the game files

11. Still on the **Files** page, upload **the contents of `02_frontend_upload/`**.

**Upload the contents, not the folder.** Inside `02_frontend_upload/` there is a file
called `index.html` and some folders next to it. Those are what the platform expects at the
top level. If the portal ends up with a folder called `02_frontend_upload` containing
everything, the game will not load, and the fix is to delete and re-upload from inside the
folder.

12. There are 108 files, most of them small. This upload is much quicker than Part 3.

13. When it finishes, the **FRONTEND** panel should read **108 files**.

    **If it reads fewer than 108, stop and tell me the number.** It means some files did
    not make it, and a game missing even one asset can fail in ways that are hard to
    diagnose later. Do not publish over a short upload.

---

## Part 5: make your uploads runnable

**This step is not optional, and skipping it is why a game looks blank when you launch it.**
Until you publish, the platform has your files but no runnable version of them.

As above: "publish" here means *make it runnable for me*, nothing public.

14. On the **Files** page, press **Publish Game**. It is the green button next to
    **Import Files**.
15. Wait for it to report success.
16. To confirm it worked: launch the game, open the **Versions** menu in the toolbar, and
    check that **Front** and **Math** each show a version number. If either says
    **Vundefined** or has no number after the V, publishing has not taken effect yet.

If it reports an error, screenshot it and stop. Do not re-upload files to try to fix an
error you have not read to me first.

**Note:** an earlier version of this document described two separate buttons, "Publish
Game, Math" and "Publish Game, Front End". There is one button. Corrected 2026-07-26 from
your own screenshots.

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

---

# PART 9: THE V3 VISIT (SUPERSEDED, DO NOT RUN)

**This section is dead and its kit is dead.** It was written for
`~/Desktop/FS_UPLOAD_KIT_V3/`, that visit was never run, and a newer build has
replaced it. Running it would upload a bundle that is missing the replay fix.

**Go to PART 9c below.** It is the whole visit, in order, and it absorbs
everything the V3 section asked for.

If `~/Desktop/FS_UPLOAD_KIT_V3/` or `~/Desktop/FS_UPLOAD_KIT/` is still on your
Desktop, drag both to the Bin now, so neither can be picked up by mistake. The
full text of this superseded section stays in the repository's history.

---

# PART 9c: THE NEXT VISIT (V4)

**This is a self-contained session. You do not need to read anything above it.**
Everything earlier stays true: nothing is public until **Submit for review**,
every upload replaces rather than stacks, "Publish" means *make my uploads
runnable for me*, and stopping to screenshot is always safe.

Allow about forty-five minutes. You can stop at any step and come back.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V4/`. Its `README.md`
names the exact commit it was built from, `1b31c5be`, and that is the only kit
to use today.

**Where the screenshots go:** just save them **loose on the Desktop**. Do not
sort them into folders and do not rename them. I will file them. A screenshot in
the wrong folder is worse than one sitting on the Desktop, because I will not
find it.

**The one thing not to do:** do not press **Start Approval**. It is in the
left-hand menu, it is not part of today, and nothing below needs it.

---

## Step 1: delete one file from the Math list

The Math files list has **13 files**. It should have **12**. The extra one is a
notes file that was dragged up with the real ones by accident.

1. Go to **Games**, then **Future Spinner**, then **Files**.
2. In the **Math files** list, find the row named exactly `math/HASHES.txt`. It is
   the first row and it is about 2.82 KB, which makes it the smallest by a very
   long way. Every other Math file is either megabytes or a `.json`.
3. Delete that one row.
4. **Screenshot the Math list afterwards.** It should read **12 files**.

**Do not delete anything else from the Math list.** The other twelve are the game.
If the list does not offer a delete control, stop and screenshot it, and I will
find another route.

**The maths is not being re-uploaded today.** It stays exactly as it is, and
there is no maths folder in the V4 kit for exactly that reason.

---

## Step 2: upload the new game files, and publish

1. Still on the **Files** page, press **Import Files**.
2. Open `~/Desktop/FS_UPLOAD_KIT_V4/02_frontend_upload`.
3. Select **everything inside that folder** and drag it in. **The contents, not
   the folder.** If `index.html` ends up one level down, the game will not load.
   This is the single most likely mistake and it is easy to undo.
4. A sync dialog appears saying how many files it will upload, skip, delete or
   move. **Screenshot that dialog before you confirm it.** On an earlier visit
   this dialog was the thing that explained a problem, and it was not captured.
5. Confirm, and wait. It is about 15 MB, so it should be quick.
6. When it finishes, the **FRONTEND** panel should read **108 files**. Screenshot it.

   If it reads anything other than 108, screenshot it and tell me. Do not try to
   fix it by uploading again.

7. Press **Publish Game**. This is not optional: until you publish, the platform
   has your files but no runnable version of them.

---

## Step 3: confirm the new build is the one running

Open the game (**Play Game**, or the Developer page's launch), and check these
five things. Screenshot each one.

1. **The version has gone up.** On the Versions panel. If it still shows the
   number it showed before you published, the publish did not take, so press
   **Publish Game** again.
2. **The pilot is there.** The character on the left of the screen renders as
   artwork, not as a broken-image icon. This was broken once before, so it is
   worth a look.
3. **No long dashes in the paytable.** Open the paytable and read the rules text.
   You are looking for a **long horizontal dash**, noticeably wider than a hyphen,
   sitting mid-sentence where a comma or a full stop would normally go. Two of
   them used to render here. **There should now be none anywhere in the game.**
   If you find one, screenshot it and note which screen it was on.
4. **The FEATURE PRICE line.** Buy a feature (FEATURES, then one of the buy
   tiers), let it play out, and look at the win banner at the end. Under the big
   win amount and the "x BET" line there should be a small line reading
   **FEATURE PRICE** followed by what the round cost you.

   **The point of that line is that the price can be bigger than the win.** That
   is normal, it is how bought features work, and the line is there so the round
   tells you the truth. Seeing a big green win beside a bigger price is the line
   working, not a bug.

5. **The mini player.** Set the Screen menu to **Popout S (400x225)** and look at
   the bottom strip.
   - **BAL** should show a complete number. If your balance has cents, the cents
     should be there. If your balance is very large it may read something like
     `$52.43M`, and **that is correct and deliberate**: at that size the full
     number does not fit at a readable size, so it shortens rather than being cut
     in half.
   - **WIN** should be complete too, with no half-cut character at the end.
   - **The menu button**, second from the left, should show **three horizontal
     lines**. It used to render as an empty box. If it is empty, screenshot it.

   **Screenshot the whole Popout S screen** as well as the strip.

---

## Step 4: the replay, which is the most valuable minute of this visit

**Replay this bet did nothing at all on the live build.** A full-screen backdrop
was sitting over the replay screen and swallowing the click. It is fixed in the
bundle you just uploaded, and this step is where we find out whether the fix
reached the platform.

It is also the last chance to photograph the max win celebration, which we have
never actually seen on screen.

1. Open the **Bets** panel.
2. **Ideally, find event `22975`**, a SUPER round. If you cannot find it, **any
   bet will do**: the point is that the Replay button works at all.
   If you would rather have the spectacular one, look for the round paying
   **`+EUR 3,750,000.00`**. It is the largest number in the list by a very long
   way, and it is exactly 5,000x, the cap.
3. Click the row to open it, and press **Replay this bet**.
4. **Expect: the replay actually plays.** Previously nothing happened at all.
5. **Watch it to the end** and look for a full-screen celebration: three stars,
   the words **MAX WIN**, a large **5,000x** and a **COLLECT** button.
6. **Screenshot it while it is on screen**, before pressing COLLECT.

**If the replay still does nothing, that is the important answer**, so screenshot
the screen and tell me. And if it plays but no celebration appears on a max win
round, screenshot the end of the replay anyway. Either outcome settles something.

---

## Step 5: twenty Cruise spins, bracketed

Cruise is the one mode we have never been able to check the money on, because
every screenshot of it so far has been a single moment with nothing to compare
against.

1. Open **FEATURES** and select **Cruise**.
2. **Before you spin at all:** open the menu, open **Session information**, and
   **screenshot it**. This is the "before" and the run is worthless without it.
3. Close that panel and spin **twenty times**. Autoplay is fine.
4. **After the twentieth spin:** open **Session information** again and
   **screenshot it**.

Two screenshots, the same panel, before and after. That is the whole thing. With
both, the money can be differenced and Cruise is settled; with only one, it is
not, which is exactly where we are now.

---

## Step 6: the game tile

The game card still shows a **Design Thumbnail** placeholder. Nobody here has
ever opened that editor, so **the first thing to do is look at what it asks
for**, and the kit carries both possible answers.

1. Open the **Design Thumbnail** editor from the game card.
2. **Screenshot it before you upload anything.** This is the one surface in the
   whole submission we have never seen, and one screenshot of it settles a
   question that has been open for weeks.
3. Then give it whichever it wants, from `~/Desktop/FS_UPLOAD_KIT_V4/03_branding/`:
   - **If it takes a single composed image**, use `FutureSpinner-Tile.png`. This
     is the finished tile, at 408x546, which is the exact size the platform's own
     published tiles use.
   - **If it wants separate layers**, use `FutureSpinner-BG.jpg` as the
     **background** and `FutureSpinner-FG.png` as the **foreground**. The
     foreground has a transparent background, so it goes on top.
4. Save, and **screenshot the finished tile**.

If it asks for something neither of those covers, stop and screenshot it.

---

## Step 7: the remaining observations

These are the same shape as the checks above: **look at this, expect this,
screenshot this.** They are what is left of the earlier observation list.

**Being wrong is fine and it is cheap.** Every one of these either confirms
something we assumed or names one line of code to change. There is no answer
here that creates work you will regret.

### Observation 1: a losing spin and the end of a round

Open the browser's developer tools, **Network** tab, and leave it open.

1. Spin until you get a spin that wins **nothing**.
2. Look at the network requests for that spin.
3. **Expect:** a `play` request, and **no `end-round` request**.
4. Also look at the `play` response and find the field called `active`. Note
   whether it says `true` or `false`.
5. **Screenshot the Network list and the `play` response.**

Whatever it does is the right answer. We are checking which of two contradictory
platform instructions the RGS actually follows. This is the highest value single
observation left in the project, because it is a named guideline item with a pass
or a fail rather than a shape question.

### Observation 2: where the round's events live

1. On any spin, open the `play` response.
2. Expand the part called `round`, then the part inside it called `state`.
3. **Expect:** something called `events`, which is a long list.
4. **Screenshot it expanded**, far enough that the structure is visible.

If `events` is not inside `state`, that is the useful answer, so screenshot
wherever it actually is.

### Observation 3: display information

1. Open the very first request of the session, the `authenticate` one.
2. Read through the whole response looking for anything about how to display
   money: a currency **symbol**, a number of **decimals**, or whether the symbol
   goes before or after the number.
3. **Expect: none of it.** We think the platform does not send this.
4. **Screenshot the whole response.**

**This one is easy to get wrong by confirming an absence too quickly.** Please
screenshot the entire response rather than just telling me it is not there, so I
can look myself.

### Observation 4: Gold Coins

1. Open **Settings** in the game toolbar and find the **Currency** selector.
2. Switch to **GC (Gold Coins)**.
3. Look at the balance and the bet.
4. **Expect:** two decimal places, like `1,000.00`.
5. **Screenshot it.**

If it shows whole numbers with no decimals, that is a real finding and it changes
one value in our code.

### Observation 5: the language list, and Danish

1. Open the **Language** menu in the toolbar.
2. **Scroll it all the way to the bottom** and screenshot it in two or three
   overlapping shots so the whole list is captured. Last time it was still
   scrolling when the screenshot was taken, so we do not know the full list.
3. Then start a session with Danish selected, or add `&lang=da` to the game URL.
4. **Expect: clean English.** Danish is one we do not ship, so it should fall back
   to English with nothing missing, no blank labels and no odd codes on screen.
5. **Screenshot the game running in that session.**

---

## Step 8: the Guidelines checklist

Open the portal's **Guidelines** tab, and open
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` beside it. That
document already has our answer for every one of the 58 items.

1. Work down the portal's list and tick the items the document marks as ours.
2. **Nine items are marked OWNER.** Those are yours, not the build's: the
   thumbnail, the approval requests, the Provably Fair toggle, the channel post
   and the post-release steps. Item 7, the thumbnail, you will have just done in
   Step 6.
3. If the portal's list and our document disagree about anything, **stop and
   screenshot it**. A disagreement is worth more than a tick.

---

## Step 9: finishing

1. Leave every screenshot loose on the Desktop. Do not sort or rename them.
2. Tell me anything that came back different from what this document said to
   expect, and anything that was confusing. **"That step made no sense" is a
   useful answer.**
3. **Do not press Start Approval.** It is in the left-hand menu and it is not
   part of today. Nothing above requires it and nothing above is affected by
   leaving it alone.
4. When you are done, delete `~/Desktop/FS_UPLOAD_KIT_V4/`. It is single use.
   The next upload gets a freshly built kit, because a kit sitting on the Desktop
   is a kit that eventually gets uploaded when it is out of date, which has
   already happened once.
