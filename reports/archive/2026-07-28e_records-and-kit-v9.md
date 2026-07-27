# 2026-07-28e: RECORDS AND KIT V9

**Brief:** `reports/briefs/FS_RECORDS_KIT_V9_Prompt.md` (v2), saved verbatim and committed with
JOB 1 per conventions (b) and (f). It supersedes `FS_RECORDS_AND_KIT_V8_Prompt.md` and its own
v1, both dead unrun.

**Posture:** on `main`, integrator, explicit paths, commit per job, no lock exceptions taken
and none needed.

## Headline

**The reported defect was refuted and a real one was found underneath it.** The three
background 403s are not a missing asset: the files are in dist and in the uploaded kit,
measured both ways, and the failing path is under the platform's unpublished `scratch/front/`
area. But the gate written to close that class found a genuine dangling reference on its first
run, and that one was ours.

**TR-075 closed on exact arithmetic.** Cruise is the fifth and last mode to get a real wallet
proof, and it was the project's only open money item.

## JOB 1: the 403 backgrounds

**Refuted by measurement, on both halves the brief asked for.** All three files are in the
current dist (`bg-1.jpg` 886,477 bytes, `bg_base.jpg` 273,173, `bg_overdrive.jpg` 269,186) and
all three are in the uploaded 110-file V8 kit. `PRUNED_PREFIXES` names `bg-1.mp4` and nothing
else under `backgrounds/`.

**The root cause is in the URL:** `/api/file/game/we-roll-spinners/future-spinner-2/`**`scratch/front/`**`/assets/...`.
That is the platform's unpublished staging area. Six minutes later, on the same entry, the
background, the car and the rain all render. It resolved with no code change. Per the brief's
own second branch, the paths were scratch and **TR-102** is that record.

**One correlation recorded without over-claiming:** the three failures are exactly the three
`.jpg` files in the bundle and no non-`.jpg` failed, while `.png`, `.woff`, `.js` and `.css`
served from the same prefix. Whether the platform rejects `.jpg` from scratch, or the upload
was still settling, is NOT determined and is not claimed.

**THE GATE FOUND A REAL ONE ON ITS FIRST RUN. TR-103.** `themeStore.ts` derived
`backgroundVideo: ${b}/backgrounds/bg-1.mp4`, pointing at the 6,083,487-byte retired video the
build prunes BY NAME. The field had **zero consumers**, so nothing requested it and no runtime
gate could see it: `build_diet_verify` fails a REQUEST into a pruned path, which cannot catch a
reference nothing requests. That is the half of the missing-asset class the brief asked to
close, and it was the half that was populated. Deleted rather than shipped.

`asset_reference_gate.mjs` resolves every `${b}/...` path the store derives against the
shipping theme plus every literal `assets/...` string in the source, and requires each to exist
in dist. 36 checked. In CI and in `kit_build`'s in-clone set. **The gate taught something about
itself on the way:** the first version flagged its own explanatory comment, because a comment
recording why `bg-1.mp4` was removed necessarily quotes the path. A gate that punishes writing
down the reason teaches people to delete the reason, so the reader strips comments first.

## JOB 2: the human version

`v9`, from **one source**, the repository-root `VERSION` file. `vite.config.ts` stamps it into
`build-info.json` and inlines it, so the boot line opens `Future Spinner v9 build ...`;
`kit_build.mjs` reads the same file. A file rather than a constant because the kit builder must
agree with the build, and **this pair already failed that way once**: the kit version was
hardcoded to V3 while a V4 shipped.

## JOB 3: intake, and the money

Eighteen frames committed at `reports/screens/live-portal-2026-07-28/` with a catalogue that
keeps what each frame SHOWS apart from what it PROVES.

**TR-075 CLOSED, on three independent inputs** per convention (l.4) rather than one figure
restated: the opening balance from the launch URL (`balance=1000000000` micros, EUR 1000.00),
the per-bet cost from the platform's own Bets table (EUR 1.00), and the closing balance from
the HUD. One bet: 1000.00 minus 1.00 = **999.00**, shown. Five bets with payouts 0, 0, 0, 0,
0.84: 1000.00 minus 5.00 plus 0.84 = **995.84**, shown. Both resolve to the cent, at exactly
1.00x.

**The red authenticate is NOT recorded, because the frames do not show one.** The wallet log
shows eight entries and all eight are 200. TR-081's multiple-authenticate half is confirmed;
its red half is absent, and an error is not recorded on the strength of a frame that does not
contain it. **That row is also DUPLICATED in the tracker**, which is noted rather than silently
collapsed.

**The trademark frames are evidence, not a clearance.** The search turned up **FUTURE SPIN**,
serial 88852459, **Class 041 online games**, owner **Light & Wonder, Inc.**, status
DEAD/ABANDONED: a near-identical wordmark in our own class. That is exactly what the checklist
item exists to surface, and whether it clears our use is a legal question for the owner's
adviser. The builder does not rule on it.

## JOB 4: already done, verified clause by clause

The brief specifies work this arc had already completed under Fable's ruling, so the honest
action was verification, not a second implementation. Every clause checked: the in-process
server exists beside `evidencePaths.mjs`; a grep for a `vite preview` spawn across
`frontend/scripts` returns **zero**; port-reaping was never written because the migration
completed in one pass; the assertion is on all nine CI gates plus its own seeded gate. **The
corpses are gone**, and the owner's old dev server was folded in through rule 12's adoption
path rather than killed behind the script's back.

## JOB 5: records to HEAD

`OWNER_CHECKLIST` gains item 0b, ticking off what is done with evidence paths, and item 3b,
deleting the old entry once the cooldown allows. The dossier gains **5b0: the submission entry
is `future-spinner-2`**, with the original recorded as superseded, and with the two things a
reviewer will meet in a console capture and should not misread: the approvals 404, expected
until Start Approval, and the background 403s, diagnosed. `FIX_LIST` is reconciled by
APPENDING, because it is a dated record and editing it in place would destroy that.

## JOB 6: kit V9

`~/Desktop/FS_UPLOAD_KIT_V9/`, fresh clone at `cce4ac15`, clean tree, **110 files,
15,633,545 bytes**, all four dist gates green IN THE CLONE including the new asset-reference
gate. **Verified independently of the builder's own report:** measured on disk at 110 files and
15,633,545 bytes, and `build-info.json` says 109 files and 15,633,145 bytes excluding itself,
which reconciles exactly once its own 400 bytes are added back. `version` reads `v9`, and the
built bundle contains the inlined string `Future Spinner v9 build`.

PART 9h is the walkthrough section, and the one screenshot it asks for does three jobs at once:
names v9 in words, carries the SHA, and proves the backgrounds served.

## Self-audit against the brief

| The brief asked | Done |
|---|---|
| Brief saved verbatim, superseding two dead ones | Yes, with JOB 1 |
| Explicit paths, commit per job, no dashes, no lock exceptions | Yes, seven commits, zero dashes verified per file |
| 403 root-caused with evidence: dist, kit, publish state | Yes, all three, measured |
| Fix at root or record the publish-state explanation | Paths were scratch, so the second branch. TR-102 |
| Dist gate that every referenced asset exists, seeded per (p) | Yes, and it found TR-103 on its first run |
| future-spinner-2 recorded as the submission entry; approvals 404 expected | Yes, in the dossier and the catalogue |
| v9 in build-info, boot line and kit README | Yes, from one source |
| Captures committed, catalogued, money reconciled | Yes, 18 frames |
| TR-075 closed if the arithmetic holds at exactly 1x | Yes, it holds |
| Red authenticate recorded observed-once | **Deviation, stated below** |
| JOB 4 harness leak per the ruling | Already done; verified clause by clause |
| Records to HEAD, dossier staging names the entry | Yes |
| Kit V9, fresh clone, all gates in clone, v9 labelled | Yes |

**One deviation, and it is a refusal rather than an omission.** The brief asked that the red
authenticate be recorded observed-once with frames. **The frames do not contain one**: every
wallet call in them is 200. Recording an error I cannot see would put an unverifiable claim
into a compliance record, which convention (l.3) forbids. What IS in the frames is recorded,
and TR-081 keeps the observation open with the exact capture that would settle it.

**A second, smaller one:** five of the eighteen frames are marked *not individually
catalogued* rather than described from a guess.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Fable's turn, and it is four things.** Verify this arc at git level. Take the benchmark
polish review against the committed capture packs, which now include
`reports/screens/live-portal-2026-07-28/`. Ratify
`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, whose section E lists five
sub-decisions. Then **round three runs**.

**Ahead of round three in severity: TR-096**, the infinite-autoplay option staying visible
under a jurisdiction cap. Pre-existing, attributed by measurement against a stashed tree, not
covered by CI, and a responsible-gambling control failing open. Convention (l.8) sends it to
the owner and Fable rather than to a builder's judgement.

**Cheap and worth doing together:** TR-097, TR-098, TR-093, and collapsing the duplicated
TR-081 row.

**Owner actions:** PART 9h with kit V9, then the checklist remainder, which item 0b has now
narrowed to the Guidelines ticks, USPTO, confirming payments, the accountant, and deleting the
old entry.

## Rule 10 closing

**Final push, run 30312119731 on `00620bf`, GREEN on all eleven jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30312119731

    static gates                    76s      browser: contrast            74s
    browser: win count-up steady    73s      browser: bet selector        76s
    browser: preview server         79s      browser: layout fit          80s
    browser: turbo intensity        87s      browser: paytable card fill 115s
    browser: max-win hold          130s      browser: splash calm        159s
    browser: scrim coverage        161s

**ONE RED ON THE RECORD, and it is mine.** Run **30311834071** failed on `static gates`.
I placed the two new asset-reference legs near the top of that job, which runs its production
build much further down, so in CI there was no `dist/` and the self-test's **negative control**
failed while everything passed locally.

That is exactly the placement failure this workflow's own header records about `layout_fit_gate`
and `contrast_gate` being added to the browser-free job: **a gate must run in an environment
that can execute it, or its placement is the failure.** Moved to sit with the other
dist-consuming gates after the build, and green on the next run. No new work started in
between.

**Worth naming: the self-test caught it, not the gate.** The leg that went red was the negative
control, the assertion whose whole job is to prove the checker is looking at something real. A
gate without one would have reported a cheerful PASS over an empty directory.

## Rule 12 closing

```
OWNER PREVIEW  |  v9 line, main  |  commit e3f9952  |  built 2026-07-28T08:45:07+10:00  |  started 2026-07-27T22:45:18.841Z  |  http://192.168.4.92:5173
```

Curled rather than trusted: `http://192.168.4.92:5173/` answers **HTTP 200** with
`<title>Future Spinner</title>`.

**A second small thing the reading caught.** The label first printed as a bare `main`, because
it is derived from the walkthrough's live PART heading and the regex only matched a
parenthesised `(V8)`, while PART 9h's heading reads "THE v9 VISIT". It still printed a line and
the line still looked fine, which is the quiet kind of wrong. Widened to match both. **Both of
this session's rule 12 findings came from reading the line rather than assuming it**, which is
the discipline the rule was given the day the preview server itself turned out to be dead.

Per rule 12's own one-commit-lag clause, the preview is refreshed once more after this final
push, so the owner's machine ends on the tip.
