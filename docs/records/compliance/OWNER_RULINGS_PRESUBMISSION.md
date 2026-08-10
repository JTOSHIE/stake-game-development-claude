# Pre-submission rulings the builder cannot make

Written 2026-08-10. Every item here was verified from source before being written
down, and each states the evidence rather than a recommendation dressed as one.

Two classes:

- **A. Rules text that disagrees with the maths.** These are disclosure claims
  about the maths package, so convention (l.8) sends them to the owner and Fable
  rather than letting a builder rewrite them.
- **B. Player-facing English that never reached the translation layer.** Fixing
  any of these needs real text in fifteen locales. Convention forbids inventing
  translations, and this project has already had a fabricated attribution
  retracted once, so they are listed for a translator rather than guessed at.

---

## A1. The rules say the 5,000x cap is "per spin". The maths caps the ROUND.

**What the player reads**, `frontend/src/lib/i18n/prose.ts:118`, and the fifteen
localised siblings:

> Maximum win per spin is capped at 5,000× your total bet.

**What the maths does**, `games/future_spinner/game_config.py:52`:

> `_WINCAP = 5000.0     # Maximum payout multiplier (x bet amount), hard cap both modes`

and line 28 describes the wincap band as *"maximum-win rounds (free spins
reaching 5,000x)"*, i.e. a property of the ROUND.

**Confirmed against the shipped books, not just the config.** The payout
reconciliation gate built on 2026-08-09 decoded all five books. `books_base`
round 1020 presents wins totalling **977,560 centibets** and pays
**`payoutMultiplier` = 500,000**, the cap. The round was capped, not the spin.

The cap is in fact applied at BOTH levels: each individual win is
`min(formula, 5000x)`, and the round is `min(sum of those, 5000x)`.

**Why the wording matters.** "Per spin" invites a player to conclude that a
sixteen-spin feature could pay up to sixteen times the cap. It cannot: the whole
round stops at 5,000x. The current sentence understates the constraint on the one
figure a maths reviewer checks first.

**RULED AND EXECUTED, 2026-08-10, R041 TASK 1.** Fable supplied replacement text
for all sixteen locales. The English now reads:

> Maximum win per game round is capped at 5,000× your total bet. A game round includes the triggering spin and any free spins it awards.

**The quotes above are the SUPERSEDED text, kept as the evidence for the finding
rather than as a description of what ships.** What ships is verifiable in one
command: `cd frontend && npx tsx scripts/r041_verify.mjs` compares all 210 ruled
strings against the live modules and names any divergence.

**One thing this did NOT fix, and it is now the more serious half:** the figure is
pinned as the English-grouped `5,000×` in every locale, by explicit instruction
("keep the figure exactly 5,000× in every locale this pass"). See section F.

---

## A2. The scatter rule describes a multiplier. The maths adds an award.

**What the player reads**, `frontend/src/lib/i18n/prose.ts` (`rulesScatterMult`),
and its fifteen localised siblings:

> 3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.

**What the maths does**, `games/future_spinner/game_config.py`, the
`scatter_multiplier_table` and the comment directly above it:

> `3: 1.0, 4: 3.0, 5: 10.0`
> "Awards are multiples of TOTAL BET, paid on the spin the scatters land."

**Confirmed against the shipped books.** The reconciliation gate computes a
scatter win as `award x globalMult x 100` centibets, with **no reference to any
other win on the board**, and that formula reconciles all 3,618,404 wins across
the five books with zero disagreements. It is an INSTANT AWARD, added
independently. It is not a multiplier applied to a win.

**Why the wording matters.** As written, a player with no other win on the board
could reasonably read "1x multiplier to your total bet win" as multiplying zero
and paying nothing. The game pays them 1x their total bet.

**RULED AND EXECUTED, 2026-08-10, R041 TASK 2.** Fable supplied replacement text
for all sixteen locales plus the social variant. The English now reads:

> 3, 4, or 5 SCATTERs anywhere award an instant win of 1×, 3×, or 10× your total bet, added to any other wins.

**The quote above is the SUPERSEDED text**, kept as the evidence for the finding.
Verified against the maths a second time while executing: the reconciliation gate
computes a scatter win with no reference to any other win on the board, and that
formula reconciles all 3,618,404 wins across the five books. The new wording
matches what the maths does.

---

## B. Eleven player-facing strings that render English to all sixteen locales

Frozen in `frontend/scripts/hardcoded_string_baseline.json` and held by
`frontend/scripts/hardcoded_string_gate.mjs`, which fails on any NEW one. They
are listed here with their English text so a translator can work from one page.

| Where | English shown to every locale | Note |
|---|---|---|
| `HudOverlay.svelte`, 4 sites | **Mute** / **Unmute** | The nearest shipped key is `hudSound` = "SOUND", a noun. This is a toggle verb, so it cannot be reused. |
| `FeatureMenu.svelte`, 2 sites | **per spin** / **bet** | The cost line, as `{$isSocial ? 'per spin' : 'bet'}`. |
| `PaytableModal.svelte` | **Scatters** | A column header beside two keyed siblings, `colFreeSpins` = "Free Spins" and `colInstantAward`. `symbolScatter` = "SCATTER" exists but is UPPERCASE and would break the casing of that header row. |
| `ReplayMode.svelte` | **Bet** / **Play** | The replay cost line. |
| `ReplayMode.svelte` | **Currency** / **Token** | |
| `ReplayMode.svelte` | **Mode:** | |
| `FreeSpinsPresentation.svelte` | **Overdrive Free Spins** | An `aria-label`, so a screen reader announces English over correctly translated content. |
| `WinBreakdown.svelte` | **N ways** | No `ways` key exists anywhere. |
| `fsModes.ts` | **base bet** / **base play** | The trailing words of `maxWinVsBaseBetLabel`. The NUMBER in that label was made locale-aware on 2026-08-10; only these two words remain. |

**RULED AND EXECUTED, 2026-08-10, R041 TASK 4.** All eleven were translated into
sixteen locales and rewired; the frozen baseline went 11 to 0. **It is back to 1,
and the new entry is not a regression:** the RESPONSIBLE PLAY paragraph in
`PaytableModal.svelte` is 281 characters of English rendering to all sixteen
locales under a translated heading, and the gate could never see it, because rule
3 excluded newlines and the candidate length was capped at 140 characters. Both
constraints are now removed and the class is seeded. **That paragraph needs a real
translation in fifteen locales and is section G below.**

**THE SOCIAL CONDITIONALS ARE NOT THE COMPLIANCE LAYER**, and this is the part
most likely to be misread by whoever picks this up. `{$isSocial ? 'per spin' :
'bet'}` looks like the sweepstakes vocabulary substitution doing its job. It is
not. That layer is `sv()` in `frontend/src/lib/i18n/vocabulary.ts`, driven by the
platform's own 39-row prohibited-terms table. These are hand-rolled copies of it,
English in BOTH branches, so they are untranslated AND bypassing the compliance
layer. `FeatureMenu.svelte`'s own comment says exactly this about a sibling that
was already corrected the same way.

---

## A3. A blocked-settle banner reuses a message whose middle sentence is false

Added 2026-08-10, and it is a wording call rather than a defect.

When a recovered round is presented and its `end-round` then fails, the game now
engages the live guard: every bet route is blocked and the existing translated
banner is shown. Before this it was SILENT, which was strictly worse: the player
saw their winning round, the balance never moved, nothing said so, and SPIN could
place a real bet on top of a round the platform was still holding open.

The banner reuses `errSessionUnavailable`, the only keyed message of its kind and
the only one that ships in all sixteen locales:

> Game unavailable. Your session could not be verified. Please reload or contact support.

Sentences one and three are true and are the correct instruction: reloading
re-runs recovery, and `end-round` is idempotent on the session's active round, so
a reload really can settle it. **Sentence two is false in this case.** The session
authenticated perfectly well; what failed was the settle.

It was shipped anyway, deliberately, because the alternative was continuing to
say nothing at all, and because inventing a new sentence in fifteen locales is
exactly what convention forbids a builder from doing. But under (l.3) and the
standing mandate that nothing player-visible may read as machine-generated, a
wrong explanation is a real defect and it is recorded here rather than left in a
commit message.

**RULED AND EXECUTED, 2026-08-10, R041 TASK 3.** Fable authored a distinct
message, `errRoundIncomplete`, in all sixteen locales. The English reads:

> Game unavailable. Your last round could not be completed. Please reload or contact support.

`settle-failed` and `wallet-stalled` render it; `auth-failed` and `missing-params`
keep `errSessionUnavailable`. The map is a derived store in `liveGuard.ts` so it
is assertable without a browser, and `r041_stall_banner_proof.mjs` hangs a wallet
for the real fifteen seconds and asserts the German string on screen.

**A LARGER DEFECT OF THE SAME FAMILY WAS FOUND ON 2026-08-10 AND IS NOT FIXED.**
The guard is engaged when a RECOVERED round fails to settle. It is NOT engaged
when a settle fails during ORDINARY LIVE PLAY. See section H.

---

## D. The wallet deadline constant, which has no upstream number to inherit

Added 2026-08-10, alongside A3.

`frontend/src/lib/services/walletTimeout.ts:40`:

> `export const WALLET_TIMEOUT_MS = 15_000`

**The defect it closes**, measured against the shipped dist with a stub whose
`/wallet/play` never responds: the spin control held its spinning state for **90
seconds** with the stake gone from the displayed balance, no banner, no error,
and a second click doing nothing because `handleSpin` returns early while
`$isSpinning`. `_withRetry` could not help, because it retries REJECTIONS and a
stall never rejects.

**Why the number is ours rather than inherited.** The pinned official client sets
no deadline on its wallet calls at all, so there is no platform figure to adopt
and nothing in `docs/stake-engine-live/` states an expected latency.

**The trade it makes, stated plainly because it is a real cost.** A wallet merely
SLOW past 15s has its round abandoned client-side while the server settles it,
and the player is blocked until they reload. That was chosen deliberately: the
outcome of the round is UNKNOWN at that point, and blocking every bet route is
what stops a second stake going out against a wallet whose state we can no longer
see. Reloading re-authenticates and `recoverSession` settles whatever round was
left open, which is what the banner asks for.

**The ruling needed:** whether 15s is right, measured against whatever p99 the
platform quotes for `/wallet/play`. One constant, tuned in one place.

**RULED 2026-08-10, R041. 15s STANDS.** The ruling confirms there is no platform
p99 and no client deadline to inherit, so the figure is ours by absence rather
than by preference. **It carries a replacement rule:** if the platform ever
publishes either figure, the constant becomes the GREATER of 3x the published
p99 or the published deadline. That condition is recorded beside the constant in
`walletTimeout.ts` as well as here, so a reader of the code finds it without
needing to know a ruling exists.

---

## E. R041's apostrophe instruction cannot be obeyed in French, and the two halves disagree

Raised 2026-08-10 while executing R041. **The ratified wording shipped exactly as
written; only the typography is in question, and no builder resolved it.**

**The instruction**, R041 TASK 1, quoted verbatim:

> Escape apostrophes per each file's existing convention; typographic apostrophes below are intentional.

**Why both halves cannot hold for `fr`.** R041's French replacements for
`rulesMaxWin` and `rulesScatterMult` use the typographic apostrophe U+2019
("qu’il accorde", "n’importe où"). The rest of the `fr` block in
`prose.locales.ts` uses the escaped straight form U+0027. Honouring the second
half therefore breaks the first.

**Measured, not assumed.** After applying the ruling, the `fr` block carries
U+2019 at lines 374 and 375 and escaped U+0027 at lines 366, 372, 380 and 396.
Only `fr` is affected: `tr` carries no typographic apostrophe at all, and no
other locale mixes.

**It is player-visible in one view**, which is what makes it a defect rather
than a tidiness question. `rulesSymbolValues` (straight, line 372) renders two
lines above `rulesScatterMult` and `rulesMaxWin` (curly, 374 and 375) in the
same French paytable rules block. The standing mandate names this exact class:
*"straight and curly quotes mixed in one view"*.

**A gate should have caught it and could not.** `machine_tell_gate.mjs` encodes
mixed apostrophes per locale, and its own block regex has always matched
`prose.locales.ts`'s `  fr: {` shape, but the file was never passed in: the scan
read `translations.ts` alone. So the longest player-facing sentences in the
product, the paytable rules and the disclaimer, were never scanned for the one
defect class most likely to appear in them. **That blind spot is now closed**,
the `fr` mixing is frozen as a single named entry, and both directions are
checked, so when this is ruled on the entry must be removed or the gate fails.

**The ruling needed, and it is one line.** Either:

- **convert R041's two French strings to the escaped straight form**, which
  changes no word and makes the block self-consistent; or
- **convert the whole `fr` block to typographic apostrophes**, which is
  consistent the other way but edits prose R041 did not rule on.

**RULED AND EXECUTED, 2026-08-10, R042 TASK A1: the first option.** The French
strings use the escaped straight form; no word changed. The frozen exemption was
retired, and the both-directions check is what forced that rather than leaving a
stale entry behind. Standing direction recorded in CLAUDE.md, with
TYPOGRAPHIC_APOSTROPHE_PASS queued as a POST-APPROVAL cosmetic candidate.

**IT WAS BIGGER THAN THE TWO STRINGS, AND ONLY A RENDER PROOF FOUND THAT.** After
the two were converted, `r042_wording_proof.mjs` read the RENDERED French rules
block and still saw three typographic apostrophes. `translations.ts` held seven in
its `fr` blocks while `prose.locales.ts` held seven straight ones, so each file
was internally consistent and BOTH RENDER INTO THE SAME MODAL. The per-file scan
passed on a defect a player could see. All fourteen now use the straight form,
and `machine_tell_gate` gained a cross-table check that judges a locale across the
three tables rather than one file at a time.

---

## F. THE MATHS DISCLOSURE IS WRONG BY ORDERS OF MAGNITUDE IN TEN LOCALES

Found 2026-08-10 by a fresh-context review pass, AFTER R041 landed. **This is the
most serious open item in this document.** It is not a consistency preference; it
is a published figure that reads as a different number.

**Two figures are written into the prose layer with ENGLISH punctuation and no
locale awareness at all:**

| Key | Text, every locale | Reads in de, es, fi, fr, id, pl, pt, ru, tr, vi as |
|---|---|---|
| `rulesMaxWin` | `5,000×` | **five**, because the comma is the decimal separator |
| `modeCruiseBlurb` | `96.35%` | **9,635%**, because the period is the thousands separator |

**The second is the worse one.** A Cruise mode card and the BET MODES page tell a
German or Turkish player the return to player is over nine thousand per cent.

**The same paytable modal already gets it RIGHT elsewhere, which is what makes
this indefensible rather than merely wrong.** In German, one line of the modal
reads, verbatim from `translations.ts`:

> Basisspiel und Bonuskauf zahlen beide 96,35 % RTP. Maximalgewinn 5.000× Einsatz.

Locale-correct: comma decimal, period thousands. Two lines away, from
`prose.locales.ts`, the same two quantities appear as `96.35%` and `5,000×`.
**One screen states the RTP two ways and the max win two ways.**

**How it survived.** A previous pass corrected exactly this class and corrected
only `translations.ts`; the prose layer was created separately and never had a
locale-aware numeral. `fsModes.ts` already does it correctly via
`fsMaxWinLabel(locale)` using `toLocaleString`, so the mechanism exists and is
proven, it simply was never applied to the prose strings.

**Why the builder has not fixed it.** R041 TASK 1 instructed, verbatim: *"Keep the
figure exactly 5,000× in every locale this pass"*, and queued
PROSE_NUMERAL_LOCALE_PASS as a later brief. That instruction was followed. But the
instruction was given as a CONSISTENCY deferral, and the measurement says it is a
WRONG NUMBER on a maths disclosure, which convention (l.8) sends to the owner and
Fable rather than to a builder's judgement.

**A THIRD SITE, AND ITS OWN COMMENT NAMES THE DEFECT.** `MaxWinCelebration.svelte`
renders a hardcoded `5,000` literal, and the comment directly above it reads:

> Same quantity, two glyphs, two screens: the mandate's "decimal or currency formats that disagree". QUALITY_CHARTER.md Q-12.

So the class was identified in a source comment, beside the literal, and shipped
anyway. `modeOverboostBlurb` carries the same problem. **Thirty values across ten
locales plus two component literals**, on current count.

**RULED AND EXECUTED, 2026-08-10, R042 TASK A2.** Fixed now, per locale, by the
committed `frontend/scripts/numeral_locale_pass.mjs`: 20 strings across the ten
comma-decimal locales, with `en, ar, hi, ja, ko, zh` ruled unchanged and
PROSE_SOCIAL untouched. German now reads `5.000×` and `96,35 %`, Turkish `%96,35`
with the sign in front, Finnish, French and Russian a space-grouped `5 000×`.
Change report at `reports/qa/r042_numeral_locale_pass.json`.

`machine_tell_gate` gained an `en-form-figure` scan over the ten locales, seeded
both ways, including a negative control proving the CORRECT German forms pass:
the first draft flagged `5.000×` as a period decimal and would have reported the
very strings the ruling had just fixed. Deriving both figures at render time from one locale-aware
formatter changes no wording in any locale and adds no new prose, which is why it
can be executed without new translations once ruled.

---

## G. One player-facing paragraph still renders English to all sixteen locales

Found 2026-08-10, same review. **The gate that exists to catch this could not see
it**, and that is the interesting part.

`PaytableModal.svelte`, under the correctly translated `responsiblePlayHeading`,
281 characters, quoted verbatim:

> Autoplay can be set to stop automatically on any win, when the Overdrive feature triggers, or once a loss limit you choose is reached, and can always be stopped manually at any time. A session summary (time played, spins, net result) is available from the menu.

**Two independent constraints hid it**, and R041 TASK 5 removed neither because
neither was the shape it was aimed at. Rule 3 of `hardcoded_string_gate.mjs`
excluded `\n`, so a text node was disqualified the moment it WRAPPED; and
`LABEL_SHAPE` capped candidates at 140 characters, which is a label's length, not
a paragraph's. **Player-facing prose is precisely the text that wraps and runs
long**, so the gate was blind to its own subject. Both constraints are removed,
the class is seeded in the form it really occurs, and the paragraph is frozen as
the single baseline entry.

**RULED AND EXECUTED, 2026-08-10, R042 TASK A4.** Fable supplied all fifteen. The
paragraph is now the prose key `responsiblePlayBody`, `PaytableModal` renders it
through the translation layer, and the frozen baseline entry was burned. The
gate's own header claim, which said every string it listed was fixed while two
still shipped English, was corrected as B10 rather than quietly edited.

---

## H. The settle-failure guard covers RECOVERY and not ORDINARY PLAY

Found 2026-08-10, same review. A money-path defect, and the guard added on
2026-08-09 does not reach it.

**What is guarded.** A round recovered at boot whose `end-round` fails sets
`liveGuardReason` to `settle-failed`, blocks every bet route and shows the new
banner.

**What is not.** During ordinary live play, `_rgsSpinReal` calls `endRound` INSIDE
the same `try` as `play` (`rgsService.ts:800-803`). If the settle fails, the whole
spin rejects, and `App.svelte:1817` hands the optimistic debit BACK:

> `if (optimisticDebit && get(liveGuardReason) !== 'wallet-stalled') { balance.update((b) => b + optimisticDebit) }`

The reason is not `wallet-stalled`, so the refund runs. Nothing sets the guard.
**The result: the platform has taken the stake and holds an open round, the
player's displayed balance is restored as though nothing happened, betting is not
blocked, and the next SPIN places a real bet on top of an unsettled round.** That
is the same failure the recovery guard was written to prevent, on the commoner
path.

**Why it is not fixed in this pass.** `rgsService.ts` is LOCKED, so the guard
cannot be set at the throw site, and the correct seam needs design rather than a
patch: the client cannot currently tell App which leg failed. Protocol rule 6
says a genuinely hard bounded problem is extracted as its own surgical brief
rather than absorbed into the session that found it, and the money path is the one
place the protocol still mandates serial care.

**Needed: a brief, and a decision on the seam.** The non-locked candidate is
`walletTimeout.ts`, which already wraps every `/wallet/` fetch and can see that it
was `end-round` that failed.

---

## I. THE MAX-WIN RULE AND ITS OWN FOOTNOTE STATE DIFFERENT BASES

Found 2026-08-10 by the review. **It is in the sentence R041 ratified**, which is why it
goes to Fable rather than being quietly reworded.

Two strings render on the same paytable screen:

> `rulesMaxWin`: Maximum win per game round is capped at 5,000× your **total bet**.
>
> `maxWinFootnote`: Max win is quoted against the **base bet**.

**They are different quantities for three of the five modes.** The costs are 1.0, 1.0,
**1.25**, **100** and **400** times the base bet (`fsModes.ts:73-113`). A player who buys
NITRO OVERDRIVE pays 400 base bets and is capped at 5,000 base bets, which is **12.5 times
what they staked, not 5,000 times**. Read against "your total bet", the rule overstates the
cap by a factor of 400 on that mode.

**The project already knows this ambiguity exists.** `maxWinFootnote` was created by an
OWNER AUDIT ROUND 4 ruling for exactly this reason, and `fsModes.ts:189-201` records it:
*"Where the cap is quoted next to a MODE COST it must be unambiguous about what the
multiplier applies to, because the buy tiers cost 100x and 400x and a bare 5,000x invites
the reading 'is that 5,000x the 400x I just paid'."* The footnote fixed the MODE CARDS. The
general rules sentence still says "total bet".

**R041 did not introduce this**, the superseded sentence said "your total bet" too. But the
rewrite was the occasion to fix it and the phrase survived, so it is raised now rather than
after a reviewer finds it.

**The platform requires this per mode**, from the dated mirror:

> Verify the mode cost is correctly represented in the game rules for each mode.

**RULED AND EXECUTED, 2026-08-10, R042 TASK A3: the BASE bet.** Both `rulesMaxWin`
and `rulesScatterMult` now state the base bet in all sixteen locales and in both
social strings, with every other word of the R041 sentences standing.
`maxWinFootnote` was already correct and is unchanged.

**Fable's derivation, recorded because it is the reason and not just the answer:**
the cap constant is 500,000 centibets in all five published books against the BET
parameter, so modes costing 1.25x, 100x and 400x cap at 4,000x, 50x and 12.5x of
outlay. The base bet is the only uniformly true basis, and it is the one the
footnote and the mode cards already used.

**ONE SUBSTITUTION DID NOT MATCH AND IS FLAGGED RATHER THAN BURIED.** The brief's
Japanese phrase was 合計ベットの; `rulesScatterMult` actually reads 合計ベット額の,
"total bet AMOUNT". The ruled STEM was applied, 合計 to 基本, leaving 額 and every
other character untouched. That is mechanical application of the ruling rather
than new wording, and the alternative was leaving one of 32 strings stating the
wrong basis while a particle was resolved.

---

## J. TWO MORE EN-FORM FIGURES THE NUMERAL RULING DID NOT NAME

Raised 2026-08-10 while executing R042 TASK A2, by the scan that ruling asked for.

TASK A2 ruled the figure tokens `5,000` and `96.35`. **`modeOverboostBlurb`
carries two more in the same file and the same ten comma-decimal locales**, and
the scan catches them correctly:

> Double-chance: about **1.6×** the feature trigger rate. Debits **1.25×** every spin while ON.

In German that reads as sixteen times the trigger rate and a debit of one hundred
and twenty five times the bet. It is the same defect class as section F, on a
string the ruling did not enumerate.

**What was done, and what was refused.** The scan is honest and catches them; the
findings are FROZEN as one named entry in `machine_tell_gate.mjs`, checked in both
directions, so main stays green under rule 10 and the entry cannot outlive the
defect. **They were NOT converted.** Deciding the wording of a maths-adjacent
disclosure is not a builder's call under convention (l.8), and narrowing the scan
to hide what it can see would be the worse of the two failures.

**The ruling needed:** one line extending TASK A2's per-locale forms to `1.6` and
`1.25`. The mechanism already exists and is committed.

---

## K. THE SAME SCATTER CLAIM SURVIVES ON THE OLD BASIS, AND NOW CONTRADICTS ITSELF

Found 2026-08-10 while verifying R042 A3 against the SHIPPED KIT rather than the
source. **A3 was scoped, in terms, to "rulesMaxWin and rulesScatterMult only".
That scope was followed. The claim those keys make also lives in a third string.**

`rulesOverdriveTrigger`, in the feature layer of `translations.ts`, sixteen
locales plus the social variant, quoted verbatim:

> 3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.

**Both strings render in the same paytable modal.** After A3, German reads:

> `rulesScatterMult`: ...einen Sofortgewinn von 1×, 3× oder 10× deines **Basiseinsatzes**...
>
> `rulesOverdriveTrigger`: ...zahlen sofort 1×, 3× oder 10× des **Gesamteinsatzes**.

**One screen now states the same award against two different bases**, which is
worse than the original defect: before A3 both were wrong in the same direction,
and a reviewer comparing them saw consistency. Now they disagree in terms.

**By the derivation Fable recorded for A3**, the base bet is the only uniformly
true basis, so `rulesOverdriveTrigger` is the one that is wrong.

**Not fixed, and the reason is the same as section J.** A3's scope was explicit,
this is a maths-adjacent disclosure, and a builder rewording it is exactly what
convention (l.8) forbids. It is raised the moment it was found rather than left
for a reviewer.

**The ruling needed:** the corrected phrase for `rulesOverdriveTrigger` in sixteen
locales plus the social variant, or a confirmation that it is out of scope and
should ship as it stands. **Note this string was NOT flagged by any gate**: the
basis is a claim about meaning, not a form, so nothing mechanical can see it. It
was found by grepping the built kit for the German word A3 had just removed.

---

## C. One thing that cannot be settled from this repository at all

`rgsService.ts` maps a platform error to a player-facing message by reading a
field of the 400 response body. WHICH field a real RGS uses decides whether
players ever see the correct session and authentication messages, and nothing in
`docs/stake-engine-live/` states it. One captured 400 body from a real
`/wallet/authenticate` or `/wallet/play` settles it in a single line. Until then
it is UNKNOWN rather than assumed, per rule 16.
