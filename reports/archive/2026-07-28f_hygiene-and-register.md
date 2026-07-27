# 2026-07-28f: HYGIENE AND REGISTER

**Brief:** `reports/briefs/FS_HYGIENE_AND_REGISTER_Prompt.md`, saved verbatim and committed with
JOB 1 per conventions (b) and (f).

**Posture:** on `main`, integrator, explicit paths, commit per job, no lock exceptions taken and
none needed.

## Headline

**Two things were nearly published that should never be.** The owner's captures for this
session included the full USDT payout address, twice. Neither was committed, the privacy rule
is now written into the register head rather than held in someone's judgement, and the
repository was checked afterwards to confirm the string appears nowhere.

**And a live Arabic capture found a defect four gates had missed.** The win banner renders
`BIG WIN` and `11x BET` in English on a fully Arabic HUD, and `locale_completeness_check.mjs`
reports PASS over it.

## JOB 1: branch hygiene

Four remote branches deleted: `fix/R2R-wallet-contract`, `track/screenshot-analyst`,
`track/docs-reskin`, `track/quality-sweep`.

**Verified mechanically before any deletion**, by two independent commands per branch, both of
which had to pass: zero unique commits against main, AND the tip is itself an ancestor of main.
The two are not the same question, and agreeing answers from different commands is the point.

**The verification is recorded, not merely performed.** A deletion is not auditable once the
head is gone, so `docs/records/BRANCH_HYGIENE_2026-07-28.md` carries the table with every tip
SHA. Any of the four can be resurrected with `git branch <name> <tip>`.

**A new BRANCHES section in `CLAUDE.md`** names the six that remain and why each is still here.

**IT ALSO RECORDS A TRAP I NEARLY WALKED INTO.** `claude/collect-prototype` reports **zero**
unique commits and its tip **is** an ancestor of main, which reads as "fully merged, safe to
delete". But its tree holds **sixteen files** under `games/future_spinner_collect/` that main's
tip does not. Both facts are true and answer different questions: it carries no unique COMMIT,
because it points at an old commit on main's own history from before those files were removed.
It is a named handle on a tree state. **So the section states the general rule: a branch with
zero unique commits is not automatically deletable. Ask what its tree holds as well as what its
log holds.** The four that were deleted were checked on both counts.

## JOB 2: the company register, privacy first

**The rule is written at the head of section 1 and binds future sessions**: this repository is
PUBLIC, the register carries facts only, and where a value exists but must not be published the
register records that it exists and where it is held, and nothing more.

**Applied the day it was written.** Of six new captures, **two showed the full USDT payout
address**, one beside an empty Home/Work Address field. Neither was committed. The four
carrying no personal data were, after each was individually viewed. Verified afterwards: the
address string appears nowhere in the repository.

Facts recorded: ASIC business name registered 27 July 2026, **renewal 28 July 2027**, entity's
ABN offline; `werollspinners.com` live; **Profit Share 10 percent GGR** with the frame as
evidence; payout wallet configured, ERC-20 USDT, address offline only. Two facts kept from the
platform's own wallet page because they bite later: payouts run at the start of each month for
the previous month, and **failed payments cannot be recovered**.

**Trademark row updated to searches complete, evidence summarised, gate satisfied.** What the
committed frames show is recorded rather than summarised from memory, and **one qualification is
stated plainly**: the owner also reports a LIVE `SPINNERS` registration in IC 028, and that
record is not visible in the committed frames, so it is recorded as the owner's observation
rather than as something this register verified. The conclusion is unchanged; the provenance of
each half is now visible.

## The real find: TR-104

The owner's Arabic capture shows the win banner reading **`BIG WIN`** and **`11x BET`** in
English across a fully Arabic HUD. At source, `WinBanner.svelte:195` builds the tier label from
a hand-rolled social ternary with hardcoded English on **both** branches, and `:207` does the
same for the unit.

**This is the TR-091 defect exactly**: the social swap works, which is why `BIG PRIZE` exists as
the other branch, and the locale swap does not exist.

**Why no gate caught it.** `locale_completeness_check.mjs` reads four shapes, and these literals
are none of them: they sit in the component's **own script block**, assigned to a variable, and
the markup interpolates the variable. Confirmed by running it: **PASS**. TR-091 widened the gate
to the shapes that had been seen rather than to the shape of the problem, and this is the
fourth.

**Not fixed here, and surfaced rather than deferred.** A sixteen-locale change on a celebration
surface is the size of job TR-091 was, and that ran under a Fable ruling. Recorded at HIGH so it
is the first thing the next pass sees.

## JOB 3: the checklist

**398 lines down to 160.** Exactly the five outstanding items Fable enumerated, plus a DONE
table where everything finished carries its evidence path. `MONEY_DISPLAY_EXPLAINED` stays as
item zero and now says why it earns the slot.

The wallet item carries the rule in the owner's own direction: **never send that address to us
and never put it in the repository.**

## Self-audit against the brief

| The brief asked | Done |
|---|---|
| Brief saved verbatim, explicit paths, commit per job, no dashes, no lock exceptions | Yes, four commits, zero dashes verified per file |
| Verify each of four branches mechanically, record it, then delete | Yes, two commands each, table kept with tip SHAs |
| Keep `chore/wip-backgrounds` and the four `claude/` branches | Yes, all five untouched |
| BRANCHES section in CLAUDE.md naming what remains and why | Yes, plus the zero-unique-commits trap |
| Register updated with facts only, nothing personal ever committed | Yes, and two captures were refused on that basis |
| Trademark row to searches complete, evidence summarised, gate satisfied | Yes |
| Commit the owner's USPTO captures as evidence | Already committed 2026-07-28e; four further safe frames added |
| Checklist becomes the five items, DONE section dated with evidence, item zero kept | Yes |

**One deviation, and it is a refusal.** The brief asked that the register record "a live
SPINNERS registration (IC 028, different goods)". **The committed frames do not show it**; they
show two DEAD/CANCELLED SPINNER marks. The claim is recorded as the owner's observation with
that distinction stated, rather than asserted as verified. Convention (l.3): every claim carries
a source a reader could check, and this one's source is the owner rather than a frame.

### FOR THE NEXT SESSION

**Fable's benchmark polish review and round-three ratification are his next dedicated turn, then
round three runs.** The capture packs are committed and current, including
`reports/screens/live-portal-2026-07-28/` with its catalogue.

**Ahead of round three, two rows now compete for first.** **TR-104**, the untranslated win
banner, is player-visible in fifteen of sixteen locales on the surface a player looks at
hardest. **TR-096**, the infinite-autoplay option staying visible under a jurisdiction cap, is a
responsible-gambling control failing open. TR-104 is the bigger player-facing defect; TR-096 is
the bigger compliance one. Both want a ruling rather than a builder's choice.

**Cheap and worth doing together:** TR-097, TR-098, TR-093, and collapsing the duplicated TR-081
row.
