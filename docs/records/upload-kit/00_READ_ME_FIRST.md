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

> **PROVENANCE, added 2026-08-05 per protocol rule 16, because this is the single most
> load-bearing sentence in this document and it carried no source at all.** A reader acts on
> it by pressing a button they have been told is irreversible everywhere else.
>
> **REPORTED**, by the owner, from his own observation of the portal. **Not VERIFIED**, and
> the reason it cannot be is itself recorded: the platform's full submission criteria page is
> **login-gated**, noted under the `submission-checklist` bullet in `COMPLIANCE_WATCH.md`,
> and every capture attempt has stored the login wall rather than the page. Capturing the
> authenticated version is an owner action on his next portal login.
>
> **PARTLY CORROBORATED, and only partly.** The live-portal frame catalogue at
> `reports/screens/live-portal-2026-07-28/CATALOGUE.md` establishes that the platform serves
> uploaded assets from a remote staging prefix it spells scratch/front, described there as
> "the platform's unpublished staging area". That is a path on the PLATFORM's server and
> not one in this repository, so it is deliberately not written as a backticked path. That is independent evidence that an upload lands somewhere unpublished. **It
> is not evidence of what the Publish button itself does**, and it is not offered as such.
>
> **The guidance above is unchanged.** Nothing here says it is wrong; it says what it rests
> on, so a later reader can weigh it rather than inherit it.

**4. If something looks wrong, stop and take a screenshot.** A screenshot of a confusing
screen is more useful than a guess. Nothing breaks by pausing.

---

## What is in this kit

| Folder | What it holds | Where it goes |
|---|---|---|
| `01_maths_upload/` | 12 files: the game's maths | The game's **Files** page |
| `02_frontend_upload/` | the game itself | The game's **Files** page |
| `03_branding/` | 4 images | Two different pages, see below. The fourth is the composed tile master, for the Design Thumbnail step; it is not uploaded as Front End. Corrected 2026-07-31: the kit began shipping four at 2219f77 and this row still said three, and this file is the one that physically reaches the Desktop. |

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

12. It is a few hundred small files. This upload is much quicker than Part 3.

13. When it finishes, the **FRONTEND** panel should read the same file count as the
    kit's own `README.md` and `BUILD_INFO.json`, which both state it.

    **If it reads fewer than that, stop and tell me the number.** It means some files
    did not make it, and a game missing even one asset can fail in ways that are hard to
    diagnose later. Do not publish over a short upload.

    **The number is deliberately not written out here.** It changes with every release,
    and this page carried a stale 108 into a 110-file kit, which is the same class of
    defect as a kit and its walkthrough disagreeing about which part to read. The kit
    states its own count, and the kit is built from a clone, so that number cannot be
    stale.

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

# PART 9c: THE V4 VISIT (SUPERSEDED, DO NOT RUN)

**Superseded by PART 9d below, 2026-07-27.** Kept because three of its five
open items were answered on that visit and the record of what was asked is
worth keeping. Do not work from this section.

**This is the whole visit and it fits on one page.** You do not need to read
anything above it.

Allow about twenty minutes. You can stop at any step and come back. Nothing is
public until **Submit for review**, and you are not pressing that today.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V4/`. Its `README.md`
names the commit it was built from. That is the only kit to use.

**Where the screenshots go:** loose on the Desktop. Do not sort or rename them.
I will file them.

---

## The update, in four steps

**1. Import.** Games, then Future Spinner, then **Files**, then **Import Files**.
Open `~/Desktop/FS_UPLOAD_KIT_V4/02_frontend_upload` and drag in **everything
inside that folder**, the contents and not the folder itself. That is the only
step where a mistake is likely, and it is undoable.

**2. Read the sync dialog, then confirm it.** It will say something like
**upload 4, delete 3, skip 104**. All three numbers are normal and none of them
is a problem:

- **Upload** is only what actually changed. The build renames a file when its
  contents change, so a small number here means the build did its job.
- **Delete** is the previous version of those same files. The platform works out
  the deletions itself from what you dragged in. You never delete anything by
  hand.
- **Skip** is everything unchanged, which is most of it. Skips are the normal
  case, not a warning.

**Screenshot the dialog before confirming**, then press **Start Sync**.

**3. Publish.** One green **Publish Game** button. Until you press it the
platform has your files but nothing runnable. Press it and wait for success.

**4. Check the version went up.** Launch the game, open the **Versions** panel,
and confirm the front-end number is higher than it was. If it is unchanged,
press **Publish Game** again.

That is the update. Everything below is looking at things.

### Three things you do not need to do

- **The maths is not being touched.** It is already uploaded and correct. There
  is no maths folder in the V4 kit for that reason.
- **`math/HASHES.txt` can stay.** It is a small notes file that rode along on
  the first upload. It is harmless, it is not part of the game, and chasing it
  is not worth a step. Earlier versions of this document asked you to delete it;
  ignore that.
- **The game tile is done.** You composed it already and it does not need
  revisiting.

---

## What is still open

Five things, and only these. Each is short.

### 1. The max win, replayed. The most valuable minute of the visit.

You already hit the maximum win: a NITRO OVERDRIVE round that paid
**EUR 3,750,000.00**, exactly 5,000x, the cap. What we have never captured is
the celebration screen that is supposed to appear when it happens.

1. Open the **Replay** panel from the game toolbar.
2. Set **Game Mode** to `super` and **Event ID** to **22975**.
3. Press **Play Event** and watch it through.
4. **Watch for:** a full-screen celebration with three stars, the words **MAX
   WIN**, a large **5,000x** and a **COLLECT** button.
5. **Screenshot it while it is on screen**, before pressing COLLECT.

**If no celebration appears, that is the more important answer.** Screenshot the
end of the replay anyway and tell me.

### 2. Twenty Cruise spins, bracketed

Cruise is the one mode whose money we have never been able to check, because
every screenshot of it so far has been a single moment with nothing to compare
against.

1. Open **FEATURES** and select **Cruise**.
2. **Before you spin at all:** open the menu, open **Session information**, and
   **screenshot it**. The run is worthless without this one.
3. Close it and spin **twenty times**. Autoplay is fine.
4. **After the twentieth spin:** open **Session information** again and
   **screenshot it**.

Two screenshots of the same panel, before and after. That is the whole thing.

### 3. Gold Coins

1. Open **Settings** in the game toolbar, find the **Currency** selector, and
   switch to **GC (Gold Coins)**.
2. Look at the balance and the bet.
3. **Expect:** two decimal places, like `1,000.00`.
4. **Screenshot it.**

If it shows whole numbers with no decimals, that is a real finding and it
changes one value in our code.

### 4. The language list, and Danish

1. Open the **Language** menu and **scroll it all the way to the bottom**.
   Screenshot it in two or three overlapping shots so the whole list is
   captured. Last time it was still scrolling when the shot was taken.
2. Then start a session with Danish selected, or add `&lang=da` to the game URL.
3. **Expect: clean English.** Danish is one we do not ship, so it should fall
   back with nothing missing, no blank labels and no odd codes on screen.
4. **Screenshot the game running in that session.**

### 5. The Guidelines ticks

Open the portal's **Guidelines** tab with
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` beside it. That
document already has our answer for all 58 items.

1. Work down the list and tick the items the document marks as ours.
2. **Nine are marked OWNER** and are yours rather than the build's: the
   thumbnail, the approval requests, the Provably Fair toggle, the channel post
   and the post-release steps.
3. If the portal's list and our document disagree anywhere, **stop and
   screenshot it**. A disagreement is worth more than a tick.

---

## Finishing

1. Leave every screenshot loose on the Desktop.
2. Tell me anything that came back different from what this page said to expect.
   **"That step made no sense" is a useful answer.**
3. **Do not press Start Approval.**
4. Delete `~/Desktop/FS_UPLOAD_KIT_V4/` when you are done. It is single use, and
   a kit left on the Desktop is a kit that eventually gets uploaded when it is
   out of date, which has already happened once.

---

**What came off this list, and why.** Earlier versions asked you to check the
network panel for how a round ends, where the round's events live, and whether
the platform sends currency display information. **Your DevTools screenshots of
26 July answered all three**, so they are done and gone: the round's events are
where we thought, a losing spin settles without a second request, and the money
figures are the units we assumed. Those are recorded as TR-077, TR-078 and
TR-079. This page is shorter because you already did that work.

---

# PART 9d: THE V5 VISIT (SUPERSEDED, DO NOT RUN)

**Superseded by PART 9e below.** Kept, not deleted, so the record of what was
asked at V5 stays readable. Do not run it.

**This is the whole visit and it fits on one page.** You do not need to read
anything above it.

Allow about twenty minutes. You can stop at any step and come back. Nothing is
public until **Submit for review**, and you are not pressing that today.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V5/`. Its `README.md`
names the commit it was built from. That is the only kit to use.

**Where the screenshots go:** loose on the Desktop. Do not sort or rename them.
I will file them.

**What is new in V5**, so you know what you are looking at:

- **The background is your V1 pick**, now the shipped art rather than a
  candidate served through a switch. The Overdrive version of it was rebuilt to
  match, so the feature still lights the same street rather than cutting to a
  different one.
- **Popout S drops the title**, your DROP call. The reels are noticeably bigger:
  the grid went from 44.2 to 50.5 per cent of the frame width.
- **The bonus TAP TO CONTINUE button is now tappable in landscape.** It measured
  under the 44px minimum on phones held sideways and did not on phones held
  upright, which is why it took this long to catch.

---

## The update, in four steps

**1. Import.** Games, then Future Spinner, then **Files**, then **Import Files**.
Open `~/Desktop/FS_UPLOAD_KIT_V5/02_frontend_upload` and drag in **everything
inside that folder**, the contents and not the folder itself. That is the only
step where a mistake is likely, and it is undoable.

**2. Read the sync dialog, then confirm it.** Upload, delete and skip counts are
all normal: upload is what changed, delete is the previous version of those same
files, skip is everything unchanged. You never delete anything by hand.
**Screenshot the dialog before confirming**, then press **Start Sync**.

**3. Publish.** One green **Publish Game** button. Press it and wait for success.

**4. Check the version went up.** Launch the game, open the **Versions** panel,
and confirm the front-end number is higher than it was. If it is unchanged,
press **Publish Game** again.

That is the update. Everything below is looking at things.

### Three things you do not need to do

- **The maths is not being touched.** It is already uploaded and correct, and
  there is no maths folder in the V5 kit for that reason.
- **`math/HASHES.txt` can stay.** Harmless, not part of the game, not worth a
  step.
- **The game tile is done.** You composed it already.

---

## What is still open

Three things, and only these.

### 1. Eyeball the new art and the new small screens. Five minutes.

This is the one that needs your eye rather than a measurement, because
everything below the eye has already been measured.

1. In the toolbar, open **Screen** and step through **Desktop**, **Popout S**,
   **Mobile S**, **Mobile M** and **Mobile L**, playing a spin or two at each.
2. **At Desktop, look at the background.** It is your V1 pick. This is the first
   time you are seeing it as the real shipped art rather than through the local
   switch.
3. **At Popout S, look at the reels.** The title is gone and the grid is bigger.
   The question is whether losing the title reads as an improvement or a loss at
   that size, which is exactly the trade you called.
4. **At the three Mobile sizes, look for anything cramped or cut.**
5. **Trigger the bonus at least once and press TAP TO CONTINUE with your thumb,
   on a phone held sideways if you can.** That is the fix from this round and a
   real thumb is the only test that counts.
6. **Screenshot anything that looks wrong.** If nothing looks wrong, say so and
   that is the answer.

### 2. Twenty Cruise spins, bracketed

Still the one mode whose money we have never been able to check, and the only
thing that closes it.

1. Open **FEATURES** and select **Cruise**.
2. **Before you spin at all:** open the menu, open **Session information**, and
   **screenshot it**. The run is worthless without this one.
3. Close it and spin **twenty times**. Autoplay is fine.
4. **After the twentieth spin:** open **Session information** again and
   **screenshot it**.

Two screenshots of the same panel, before and after. That is the whole thing.

### 3. The Guidelines ticks

Open the portal's **Guidelines** tab with
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` beside it. That
document already has our answer for all 58 items.

1. Work down the list and tick the items the document marks as ours.
2. **Nine are marked OWNER** and are yours rather than the build's: the
   thumbnail, the approval requests, the Provably Fair toggle, the channel post
   and the post-release steps.
3. If the portal's list and our document disagree anywhere, **stop and
   screenshot it**. A disagreement is worth more than a tick.

---

## Finishing

1. Leave every screenshot loose on the Desktop.
2. Tell me anything that came back different from what this page said to expect.
   **"That step made no sense" is a useful answer.**
3. **Do not press Start Approval.**
4. Delete `~/Desktop/FS_UPLOAD_KIT_V5/` when you are done. It is single use, and
   a kit left on the Desktop is a kit that eventually gets uploaded when it is
   out of date, which has already happened once.

---

**What came off this list since V4, and why.** The max win replay is **done**:
you captured the celebration and it closed TR-073 and TR-076. The Danish
fallback is **done** and passed. **Gold Coins is parked**, not forgotten: the
environment you have does not offer GC, so there is nothing to check until one
does. That leaves the three items above, and two of them are unchanged from last
time because they are the two that still have no answer.

---

# PART 9e: THE V6 VISIT (SUPERSEDED, DO NOT RUN)

**This is the whole visit and it fits on one page.** You do not need to read
anything above it. PART 9d and everything before it are superseded.

Allow about ten minutes. This is a short one: four fixes, all of them things you
reported, and the only thing being asked of you afterwards is to look at them.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V6/`. Its `README.md`
names the commit it was built from. That is the only kit to use.

**Where the screenshots go:** loose on the Desktop. Do not sort or rename them.
I will file them.

**What is new in V6**, so you know what you are looking at. All four are yours.

- **The load screen is calm again.** The We Roll Spinners mark was spinning and
  its outline was swinging about 77 pixels as it turned. It sits still now, with
  its glow breathing, and nothing on that screen slides into place any more.
- **The speed button is the bolt alone.** The little 1x, 2x and 4x caption is
  gone. The three speeds are told apart by the control getting brighter at each
  step instead.
- **The WILD and SCAT cards are fixed.** Their dark fill stopped short of the
  card, so the chrome showed underneath. It was 23 pixels on WILD and 37 on
  SCAT. Every card now fills its frame whatever its text says, in any language.
- **The blackout behind dialogs covers the whole screen.** It was covering the
  game area only, which looks identical while the window is 16:9 and leaves bare
  strips at every other shape. That is why it was the corners you saw.

---

## The update, in four steps

**1. Import.** Games, then Future Spinner, then **Files**, then **Import Files**.
Open `~/Desktop/FS_UPLOAD_KIT_V6/02_frontend_upload` and drag in **everything
inside that folder**, the contents and not the folder itself. That is the only
step where a mistake is likely, and it is undoable.

**2. Read the sync dialog, then confirm it.** Upload, delete and skip counts are
all normal: upload is what changed, delete is the previous version of those same
files, skip is everything unchanged. You never delete anything by hand.
**Screenshot the dialog before confirming**, then press **Start Sync**.

**3. Publish.** One green **Publish Game** button. Press it and wait for success.

**4. Check the version went up.** Launch the game, open the **Versions** panel,
and confirm the front-end number reads **Front V6**. If it is unchanged, press
**Publish Game** again.

That is the update. Everything below is looking at things.

### Three things you do not need to do

- **The maths is not being touched.** It is already uploaded and correct, and
  there is no maths folder in the V6 kit for that reason.
- **`math/HASHES.txt` can stay.** Harmless, not part of the game, not worth a
  step.
- **The game tile is done.** You composed it already.

---

## What is still open: four things to look at

Every one of these has already been measured and gated, so none of them is a
test. They are here because you reported them and you should see them fixed.

### 1. The splash, on the way in

Launch the game and watch the first ten seconds without touching anything.

The mark should sit dead still. Its glow should breathe slowly. Rain should
fall, TAP TO CONTINUE should pulse, and nothing else should move at all. If the
logo moves by any amount, that is the defect returning and it is worth a
screenshot.

### 2. The speed button

Find the bolt button and press it three times, so you see all three speeds and
come back to where you started.

The question is only this: **can you tell the three apart at a glance, without
studying them?** Each step should be visibly brighter than the one before. If
two of them look the same to you, say which two, because that is the whole
design and a measurement saying they differ is not the same as your eye saying
so.

### 3. The two paytable cards

Open the paytable and look at **Symbol Payouts**, top row, the WILD and SCAT
cards.

Their dark panel should reach the bottom of the card exactly like every other
card in the grid. There should be no pale band underneath their text.

### 4. A dialog with the window stretched

This one needs the window deliberately the wrong shape, because that is the only
condition it ever went wrong in.

1. **Drag the browser window wide and short**, much wider than it is tall.
2. Open the **paytable**, or any dialog.
3. **Look at the far left and far right edges, and at all four corners.** The
   darkening should reach every edge. Nothing bright should be showing beside
   the game.
4. Then drag the window **tall and narrow** and open the same dialog again. Look
   at the top and bottom this time.

---

## Finishing

1. Leave every screenshot loose on the Desktop.
2. Tell me anything that came back different from what this page said to expect.
   **"That step made no sense" is a useful answer.**
3. **Do not press Start Approval.**
4. Delete `~/Desktop/FS_UPLOAD_KIT_V6/` when you are done. It is single use, and
   a kit left on the Desktop is a kit that eventually gets uploaded when it is
   out of date, which has already happened once.

---

**A missing input, named rather than guessed.** The brief for this round says
"the remaining owner list is in `OWNER_CHECKLIST.md`". That file is not in the
repository, and has never been: there is no commit in the history that added it
and no file of that name anywhere in the tree. Convention (m) says a missing
input is named and waited for, never reconstructed, so the four items above are
the brief's own eyeball list and nothing has been invented to stand in for the
rest. **If there is a further list, send the file and it becomes PART 9f.**

**What carried over from V5 and is still open**, so it is not lost: the twenty
bracketed Cruise spins with a Session information screenshot either side, and
the Guidelines ticks against
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md`. Both are written
out in full in PART 9d above. They are not repeated here because this visit was
asked for as a short one, and neither is blocked by anything in V6.

---

# PART 9f: THE CLEAN-BASELINE VISIT (V7) (SUPERSEDED, DO NOT RUN)

**Superseded by PART 9g below.** If you never ran this visit, that is fine: PART 9g does
everything this one did, against a newer kit. Kept for the record, not to be run.

**Why this one is different from every visit before it.** Every previous visit added files to
what was already on the portal. This one **reconciles**, so that afterwards we know exactly
what is live. Right now we do not: the last frontend version confirmed published anywhere in
the repository is Front V2, and five kits have been built since, so every fix in the last
four sessions is of unknown liveness. That is the single most consequential open item in the
project and this visit closes it permanently.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V7/`. Its `README.md` names the
commit it was built from. **That is the only kit to use.**

## 1. Import the FULL kit contents, not just changed files

Drag in **everything** in `FS_UPLOAD_KIT_V7/`, not a subset. The portal's sync dialog
compares what you hand it against what it holds and reports four numbers: Upload, Skip,
Delete, Move.

**Handing it the full set is what makes the deletions happen.** A partial import can only
add and replace; it can never remove a file that should no longer be there. Since we do not
know what accumulated across earlier uploads, only a full reconcile clears it.

**Screenshot the sync dialog before you confirm it.** Those four numbers are the record of
what the portal actually held, and we have been surprised by them before: the first upload
handed the portal 108 files and it stored 104, dropping four with no error shown anywhere
(TR-061). If Delete is greater than zero, that is expected here and is the point.

## 2. Publish

Publish the version as usual.

## 3. THE ONE CAPTURE THAT PERMANENTLY ANSWERS "WHICH BUILD IS LIVE"

**Do not skip this. It is the reason for the visit.**

Open the published game and read the build SHA. Either route works:

- **The console route.** Open DevTools, Console tab, reload the game. The boot line prints
  the build commit.
- **The file route.** Open `build-info.json` from the published bundle in a browser tab. It
  carries `commit`, `builtAt`, the file count and the byte total.

**Screenshot whichever one you used, showing the SHA legibly.**

**What to send.** That one screenshot, plus the sync dialog from step 1.

**DONE when** the screenshot shows a commit SHA. Any SHA. The value is not that it matches a
particular build; it is that from this moment on the repository knows what is live, instead
of inferring it. Send it and it gets recorded against the version.

## 4. Delete the kit

Delete `~/Desktop/FS_UPLOAD_KIT_V7/` when you are done, along with every older kit still
sitting there. Kits are single use. A kit left on the Desktop is a kit that eventually gets
uploaded when it is out of date, and that has already happened once.

## 5. Then the owner list

Everything else that needs you is in **`OWNER_CHECKLIST.md`** at the repository root, seven
items, each with what to send and a DONE-when. The two that matter most while you are already
in the portal:

- the **twenty Cruise spins** bracketed by session panels, still the only open money item;
- the **Guidelines ticks**, with our self-assessment open beside you.

If the portal's list and our document disagree anywhere, **stop and screenshot it**. A
disagreement is worth more than a tick.

---

# PART 9g: THE FIRST PLAYER-VISIBLE VISIT (V8) (SUPERSEDED, DO NOT RUN)

**Superseded by PART 9h below.** If you never ran this visit, that is fine: PART 9h does
everything this one did, against a newer kit. Kept for the record, not to be run.

**What is different about this one.** Every kit from V3 to V7 was fixes you could not see:
hygiene, provenance, gates, tidying. **V8 is the first kit since V7 that changes what a
player actually does**, and there are three of those changes. So this visit has the usual
upload half, and then a short LOOK half where you use the game for two minutes.

**If you never ran the V7 visit, run this instead.** It does everything that one did.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V8/`. Its `README.md` names the
commit it was built from. **That is the only kit to use.** Delete every older one.

## 1. Import the FULL kit contents, not just changed files

Drag in **everything** in `FS_UPLOAD_KIT_V8/`, not a subset. The portal's sync dialog
compares what you hand it against what it holds and reports four numbers: Upload, Skip,
Delete, Move.

**Handing it the full set is what makes the deletions happen.** A partial import can only
add and replace; it can never remove a file that should no longer be there.

**Screenshot the sync dialog before you confirm it.** Those four numbers are the record of
what the portal actually held, and we have been surprised by them before: the first upload
handed the portal 108 files and it stored 104, dropping four with no error shown anywhere
(TR-061). If Delete is greater than zero, that is expected and is the point.

## 2. Publish, and confirm it reads Front V8

The maths package stays at V1 and is NOT re-uploaded. Do NOT press Start Approval.

## 3. The capture that answers "which build is live"

Open the published game and read the build SHA. Either route works:

- **The console route.** DevTools, Console tab, reload. The boot line prints the commit.
- **The file route.** Open `build-info.json` from the published bundle in a browser tab.

**Screenshot whichever one you used, showing the SHA legibly.** Any SHA closes it. The value
is not that it matches a particular build, it is that the repository stops inferring.

---

## THE LOOK HALF: three things that are new, about two minutes

None of these is a test you can fail. They are three things to look at, and anything that
looks wrong is worth a screenshot.

### 4. Tap the BET window

**It should open a panel listing every bet level**, with your current one highlighted in
gold, the smallest marked MIN BET and the largest MAX BET. Tap any level and the panel
closes with the BET readout showing it. The little up and down arrows still work as before;
the panel is an addition, not a replacement.

**The one thing worth checking**, because it is the whole point of building it this way:
**the levels in that panel should be the platform's own bet levels for your currency**, not
a list we invented. If you are in a currency where the levels are unusual, that is the
interesting case, and a screenshot of the open panel is exactly what we want.

### 5. Leave a bonus half way through, and come back

**This is the new one, and it is the one thing that needs a real portal to confirm.**

1. Play until you trigger Overdrive Free Spins. A bought entry is the quick way.
2. **Part way through the free spins, reload the page.** Not close and reopen: reload.
3. When the game comes back it should ask **CONTINUE YOUR ROUND**, telling you how many of
   the free spins you already watched, with two buttons: CONTINUE, and WATCH FROM START.

**Both answers are correct and both pay exactly the same.** The choice only decides where the
animation starts. Press CONTINUE and it should carry on from roughly where you left off;
press WATCH FROM START and it plays the whole round again.

**What to send:** a screenshot of that prompt if it appears, and a note of which button you
pressed and whether the balance afterwards looked right.

**If the prompt does NOT appear**, that is the useful result and not a failure. It would mean
a real in-progress round does not carry its event data where we expect it, which is the one
assumption in this feature we have not been able to observe against the live platform. The
round still settles and still pays either way, which is why it is safe to ship unconfirmed.
Tell us it did not appear and we will know exactly what to change.

### 6. A max win, only if one happens

The max-win celebration now waits for you indefinitely: nothing dismisses it but your own
COLLECT or the Enter key. **Do not go hunting for one**, it is a 1 in 100,000 round. If you
happen to see it, leave it on screen for a minute before collecting and tell us whether
anything moved behind it.

---

## 7. Delete the kit

Delete `~/Desktop/FS_UPLOAD_KIT_V8/` when you are done, along with every older kit still
sitting there. Kits are single use. A kit left on the Desktop is a kit that eventually gets
uploaded when it is out of date, and that has already happened once (TR-062).

## 8. Then the owner list

Everything else is in **`OWNER_CHECKLIST.md`** at the repository root. The two that matter
most while you are already in the portal:

- the **twenty Cruise spins** bracketed by session panels, still the only open money item;
- the **Guidelines ticks**, with our self-assessment open beside you.

If the portal's list and our document disagree anywhere, **stop and screenshot it**. A
disagreement is worth more than a tick.

---

# PART 9h: THE v9 VISIT (SUPERSEDED, DO NOT RUN)

**Superseded by PART 9i below.** No V9 upload was ever confirmed (the checklist item stayed
open); V10 replaces it and the destination entry changed to `future-spinner-3`. If you never
ran this visit, that is fine: PART 9i does everything this one did.

**Two things are different this time.**

1. **The kit has a HUMAN VERSION now.** It is **v9**. You will see `v9` in the kit folder's
   README, inside the bundle, and as the first thing the browser console prints. You no
   longer have to read a hash to know which build you are looking at.
2. **You are uploading to `future-spinner-2`**, which is the submission entry. The original
   `future-spinner` entry is superseded and gets deleted once the cooldown allows.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V9/`. Delete every older kit.

## 1. Import the FULL kit contents to `future-spinner-2`

Drag in **everything** in `FS_UPLOAD_KIT_V9/`, not a subset. The portal's sync dialog compares
what you hand it against what it holds and reports four numbers: Upload, Skip, Delete, Move.

**Handing it the full set is what makes the deletions happen.** A partial import can only add
and replace; it can never remove a file that should no longer be there.

**Screenshot the sync dialog before you confirm it.** Those four numbers are the record of
what the portal actually held, and we have been surprised by them before: an early upload
handed the portal 108 files and it stored 104, dropping four with no error shown (TR-061).

## 2. Publish

The maths package stays at V1 and is NOT re-uploaded. Do NOT press Start Approval.

## 3. THE ONE SCREENSHOT THIS VISIT IS FOR

Open the published game with the browser console open, and screenshot the first console line.
It reads:

```
Future Spinner v9 build <sha> built <timestamp>
```

**That single line does three jobs at once**, which is why it is the one capture that matters:

- it tells us **v9** is what is live, in words rather than a hash;
- it carries the **SHA**, which is the exact identity;
- and **if the city background, the car and the rain are all on screen behind it, it proves
  the background files served**. Last visit three of them returned 403 from the platform's
  unpublished area. They were never missing, and they came good six minutes later, but this
  is the frame that confirms it on a clean upload.

**If any background is missing this time, screenshot the console with the red rows expanded.**
That would be new information and we would want it.

## 4. The eyeball list, about three minutes

None of these is a test you can fail. Anything that looks wrong is worth a screenshot.

- **The recomposed surfaces.** The paytable cards, the feature menu and the boot screen. Look
  for anything clipped, overlapping or cut mid-word, especially at Popout S.
- **Tap the BET window.** It should open a panel listing every bet level, current one
  highlighted in gold, smallest marked MIN BET and largest MAX BET. Tap any level and the
  panel closes with the BET readout showing it. **The levels should be the platform's own for
  your currency**, not a list we invented; an unusual currency is the interesting screenshot.
- **The max-win hold, only if you happen to hit one.** Do not go hunting: it is 1 in 100,000.
  If you see it, leave it on screen for a minute before pressing COLLECT and tell us whether
  anything moved behind it. It is supposed to wait for you indefinitely.
- **Feature resume.** Trigger Overdrive Free Spins, and part way through the free spins
  **reload the page**. It should come back asking **CONTINUE YOUR ROUND**, telling you how
  many free spins you already watched. Both buttons pay exactly the same; the choice only
  decides where the animation starts. **If that prompt does not appear, that is the useful
  result and not a failure**, and telling us is worth more than debugging it.

## 5. Delete the kit, and the old entry

Delete `~/Desktop/FS_UPLOAD_KIT_V9/` when you are done, along with every older kit. Kits are
single use. Then, once the platform's cooldown allows, delete the original `future-spinner`
entry so only `future-spinner-2` remains.

## 6. Then the owner list

`OWNER_CHECKLIST.md` at the repository root. Item 0b now says what is already done and where
the proof is, so you are not asked twice. What is left needs you: the Guidelines ticks on
`future-spinner-2`, the USPTO position, confirming the payments model, and the accountant.

---

# PART 9i: THE v10 VISIT

**This is the whole visit and it fits on one page.** You do not need to read anything above
it. PART 9h and everything before it are superseded.

**Two things are different this time.**

1. **The version is v10.** You will see `v10` in the kit folder's README, inside the bundle's
   `build-info.json`, and as the first thing the browser console prints. If anything on the
   portal still says `v9` or shows a bare hash, that is the screenshot we want.
2. **You are uploading to `future-spinner-3`.** This is the clean-baseline entry: one upload,
   one publish, and then which build is live is a known fact rather than owner item 3.

**What you are working from:** `~/Desktop/FS_UPLOAD_KIT_V10/`. Delete every older kit,
including V9, which was never confirmed uploaded. Kits are single use.

## 1. Import the FULL kit contents to `future-spinner-3`

Drag in **everything** in `FS_UPLOAD_KIT_V10/`, not a subset. The portal's sync dialog
compares what you hand it against what it holds and reports four numbers: Upload, Skip,
Delete, Move.

**Handing it the full set is what makes the deletions happen.** A partial import can only add
and replace; it can never remove a file that should no longer be there.

**Screenshot the sync dialog before you confirm it.** Those four numbers are the record of
what the portal actually held, and we have been surprised by them before: an early upload
handed the portal 108 files and it stored 104, dropping four with no error shown (TR-061).

## 2. Publish

The maths package stays at V1 and is NOT re-uploaded. Do NOT press Start Approval.

## 3. THE ONE SCREENSHOT THIS VISIT IS FOR

Open the published game with the browser console open, and screenshot the first console line.
It reads:

```
Future Spinner v10 build <sha> built <timestamp>
```

**That single line does three jobs at once**, which is why it is the one capture that matters:

- it tells us **v10** is what is live, in words rather than a hash, which closes owner item 3
  for good;
- it carries the **SHA**, which is the exact identity;
- and **if the city background, the car and the rain are all on screen behind it, it proves
  the background files served** on a clean upload to a clean entry.

**If any background is missing, screenshot the console with the red rows expanded.** That
would be new information and we would want it.

## 4. One glance at the paytable hero

Open the paytable and look at the hero once: it should read **1,024 WAYS TO WIN**, in
uppercase, in the brand face, with the number and the words styled together. Anything else
there, screenshot it. That is the whole check; close the paytable and move on.

## 5. Delete the kit, and the old entries

Delete `~/Desktop/FS_UPLOAD_KIT_V10/` when you are done, along with every older kit. Kits are
single use. Then, once the platform's cooldown allows, delete the superseded entries so only
`future-spinner-3` remains.

## 6. Then the owner list

`OWNER_CHECKLIST.md` at the repository root. What is left needs you: the Guidelines ticks,
the USPTO position, confirming the payments model, and the accountant. Round three runs with
the ratified prompt once this visit is done.
