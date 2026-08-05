# 2026-08-05c: THE BACKLOG CLOSED FROM THE CHAT SEAT

Archive copy per convention (a). The live section is in reports/SESSION_REPORT.md.

---

# 2026-08-05c: THE BACKLOG CLOSED FROM THE CHAT SEAT, and the gates were wrong before the code was

**Head of Engineering seat, working directly rather than by brief.** The owner ruled part way
through that the remaining rows were "small and not worth running in a separate session", so
this work ran in the chat context with the same discipline a session carries: convention (p) on
every gate, convention (s) on every corrected claim, rule 10 on every push.

**22 commits, `46dc783` to `6cf498a`.** Tree clean, local equals origin, every push green.

## THE HEADLINE

**The 57-row candidate set is closed except one row that belongs to the owner.**
`S2-C056` awaits his confirmation of the `future-spinner-3` destination. Everything else is
fixed, refused with a measurement, or parked for signature.

**Four new instruments landed, each proven twice**: a seeded self-test, and then an END TO END
red on the real artefact. The second proof is the one that counts, and it is what this project
learned the hard way across four gates that printed PASS over live defects.

| Gate | Catches what nothing else could |
|---|---|
| `frontend/scripts/brand_token_gate.mjs` | A Stake brand token in a FILE NAME, 323 paths across three roots |
| `frontend/scripts/round_logic_currency_gate.mjs` | A round whose SHAPE depends on the wallet |
| `frontend/scripts/stake_mark_gate.mjs` | A brand mark inside an asset's BYTES, 97 files, 13.96 MB |
| `frontend/scripts/prohibited_mechanic_gate.mjs` | Jackpot, gamble, cashout, by three separate doors |

Plus a sixth class in `scripts/qa/doc_currency_gate.mjs`, `SUPERSEDED_CITED`, which catches
something `DEAD_PATH` structurally cannot: the file EXISTS, the citation resolves perfectly,
and it still sends a reader into retired material.

## THE THING WORTH READING: THE GATE WAS WRONG BEFORE THE CODE WAS, THREE TIMES

Each time the honest move was to fix the instrument rather than the tree, and each is recorded
in the gate's own header so the next person does not repeat it.

**A rule of `/gambl(e|ing)/` flagged `gamblingLimitReached: "Gambling limit reached."`** That is
responsible-gambling wording, supplied verbatim by Fable, required in all sixteen locales.
**Shipping that rule would have pressured someone to delete a mandatory player-protection
message to make a check go green**, which is worse than having no gate at all. The prohibited
MECHANIC is a gamble FEATURE. The rule now matches `gamble` and deliberately not `gambling`,
and the real message ships as a negative control.

**A naive single-quoted-literal pattern died on French.** `n\'importe` terminates
`/'([^']+)'/` at the escaped quote, so a widened parity parser reported the French rules string
as stating NO scatter multipliers when it states three. That read exactly like a live defect in
a shipped locale and was a bug in the reader.

**CHECK anchors written into `docs/stake-engine-live/` were completely inert.** Seeding the
claim false left the gate GREEN, because that tree is out of the currency gate's scope. They
were moved into a scanned document and re-proven. **An anchor nobody has watched fail is
decorative**, and this one was found only because it was tested rather than trusted.

## THE PATTERN THAT HELD ALL DAY

**Every row's own recorded prescription was wrong or partly wrong**, continuing the run
Sessions 8 and 9 measured. Two would have introduced defects if applied literally:

- **`S2-C005`** asked for audio in replay. `App.svelte` branches `{#if isReplay}` to
  `ReplayMode` INSTEAD of the game tree, and the mute control lives inside `HudOverlay`, which
  therefore never renders. The fix would have shipped sound with **no way to turn it off**,
  regressing working sound disable. REFUSED, recorded as PROPOSAL 8.
- **`S2-C218`** asked to flip the unknown-currency fallback to amount-first. Correct, per the
  platform's own reference. But `currencySymbolTrailing`, added hours earlier the same day,
  defaulted unknown codes to LEADING. Flipping one without the other would have **recreated the
  exact S2-C013 defect** that accessor exists to prevent. Both moved together.

And the smaller ones: `S2-C045` wanted FAIL 0 when two items still fail; it wanted OWNER 8 when
the rows say 7 and a dated recount already said so. `S2-C084` proposed "89 records over 40
categories" against 89 over 28. `S2-C217` said four sites; there are eleven, six of them live.
`S2-C103` cited the wrong line of `COMPLIANCE_WATCH.md`. **Four separate rows carried line
citations that had already drifted.**

## WHAT WAS FIXED, BY TIER

**Documentation, sixteen rows.** The two that matter most:

- **`S2-C086`**, under the heading "The one sentence that matters", told a reader **"nothing
  player-facing has changed since V7 was built"**, citing a diff against a MOVING `HEAD`. Run
  today that range returns **1,169 files, 84 under `frontend/`**. Both halves false, in a claim
  that tells someone the kit in their hands carries every player-visible fix. Restated as a
  dated record against the pinned commit: 18 files, none under `frontend/`.
- **`S2-C217`**, six live documents credited the platform with **"the platform's published tile
  geometry"** for 408x546. The platform publishes no tile dimension at all; it is a de facto
  convention we measured from 81 of 87 decoded tiles. Same class as the fabricated Fable
  attribution this seat had to retract in entry 031.

**Component, three rows, all STREAM.** `S2-C013` found two money readouts on one screen
disagreeing about their own currency: on a Danish session the balance rendered `10.00 KR` while
the loss limit beside it rendered `KR10.00`, because placement was computed from the virtual
flag alone and fourteen platform codes are marked `symbolAfter`. `S2-C012` removed the Vite
starter's article layout, measured before and after at seven presets. `S2-C005` refused.

**Gate, four new instruments**, plus `S2-C050`, which found the paytable parity gate reading
**one English string out of seventeen**: fifteen localised strings and the English social
variant stated the scatter multipliers to a player and none was checked. A translator writing
the pre-FeatureMath-v2 `5x, 15x, 50x` would have passed.

## VERIFICATION

**Every push green. Rule 10 satisfied per push, not per session.**

| Commit | Run | Result |
|---|---|---|
| `6cf498a` | `30981677009` | success, 15 of 15, **13 browser legs** |
| `0cab5fc` | `30979779643` | success, 15 of 15, 13 browser legs |
| `cb52af2` | `30976610461` | success, 15 of 15, 13 browser legs |
| `e634a42` | `30975262295` | success, 15 of 15, 13 browser legs |

**THE STEP RESULTS WERE READ, NOT THE RUN CONCLUSION**, which is the failure Session 8 made and
this seat found afterwards. All eight new gate steps were confirmed `success` in the static-job
step list on run `30981677009`, rather than inferred from a green tick.

**Rule 12**, and the line is quoted because the script now derives and probes it:

```
OWNER PREVIEW  |  v10 line, main  |  commit 6cf498a  |  built 2026-08-05T16:31:43+10:00  |  http://192.168.4.95:5173/
  address derived from interface en0 and confirmed reachable (1 candidate probed)
```

Curled independently: **HTTP 200**. That address was `192.168.4.92` this morning in two places,
answering nothing, and both were corrected.

**Document currency gate: PASS at 338 frozen**, and **the ratchet SHRANK by one**. Removing a
paragraph in `S2-C084` burned a frozen `DEAD_DOCREF`, the gate refused to pass until the
baseline was updated in the same commit, and that single entry was removed by hand rather than
by a blanket refreeze so nothing could ride along.

## FOR THE OWNER

1. **Eight park proposals** at `reports/qa/session9/OWNER_PARK_PROPOSALS.md`. Nothing closes
   until signed, and the standing mandate leaves a refused half in neither category meanwhile.
2. **Self-assessment items 15 and 46 are still FAILING**, both re-derived from source today and
   escalated per convention (l.8). Item 15's `overflow-y: auto` is unchanged; item 46 still
   passes `$locale` through regardless of social mode, so **a social session launched with
   `lang=de` still renders German**.
3. **`S2-C056`** needs the `future-spinner-3` confirmation.
4. **`CLAUDE.md` convention (c)** instructs every session to copy a document that lives under
   `reports/archive/superseded/` to the Desktop. Either it should not be superseded or the
   convention is dead. Frozen and raised rather than rewritten, because it is a standing
   convention.
5. **`S2-C075`**, how the five books files reach the publish runner. The workflow goes red until
   chosen; nothing on a push is blocked.

**And one that is not a decision but should be seen.** The 58 item texts in
`STAKE_GUIDELINES_SELF_ASSESSMENT.md` are REPORTED from a single owner transcription with no
mirror in the repository and none obtainable here, because the criteria page is login-gated. The
evidence column is ours and stands; what rests on one unmirrored source is **the wording of each
requirement**. Capturing that page on the next portal login is the only thing that upgrades it.

## FOR THE NEXT SESSION

**Model and effort**: Opus, high, chat seat rather than a briefed session.

**Approach**: derive from source before acting on any recorded row; treat every prescription as
a hypothesis; prove each gate twice; commit per row or per coherent cluster with the reasoning
in the message rather than in a separate document.

**Alternatives tried and rejected**: a pixel before-and-after comparison for `S2-C012` was
attempted and REFUTED rather than dropped. Screenshots differed, but they also differed between
two captures of the SAME build, and on one preset that control delta was LARGER than the
before-and-after delta. The surface animates, so a screenshot hash cannot distinguish a CSS
change from animation phase. The geometric gates are the instrument there, and they read zero
change across seven presets, 374 paytable cards and 50 scrim edges.

**Open threads**:
- The file census generator is still not committed, so 34 files cannot be named.
- `S2-C050`'s three `PaytableModal` assertions and its `rulesMaxWin` parser are not done.
- The tile-geometry survey is OUR measurement filed under `docs/stake-engine-live/`, a tree the
  currency gate deliberately does not scan, so it is excluded from the gate by where it sits.
  Moving it is a rename touching every citation.
- The browser matrix runs 13 legs; `CLAUDE.md`'s table no longer states a count, by design.
