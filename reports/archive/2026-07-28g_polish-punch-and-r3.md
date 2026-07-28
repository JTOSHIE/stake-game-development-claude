# Session Report - POLISH PUNCH AND ROUND THREE FINALISATION (2026-07-28)

Brief saved verbatim: `reports/briefs/FS_POLISH_PUNCH_AND_R3_Prompt.md`, committed first
(`c375878`). Fresh session on `main`, explicit-path commits, one commit per job, no lock
exceptions taken and none needed: `git diff .claude/settings.json` empty throughout and no
locked path touched. Model: Fable 5. Six briefed jobs in one session per the brief's own
structure; rule 4's justification is that the brief ordered them as one session and each
job closed with its own commit and its own verification before the next began.

**Rule 12 line, refreshed BEFORE this report was written:**

```
OWNER PREVIEW  |  v10 line, main  |  commit e3206c9  |  built 2026-07-28T13:43:08+10:00  |  started 2026-07-28T03:44:25.256Z  |  http://192.168.4.92:5173
```

Curled rather than trusted: `http://192.168.4.92:5173/` answers **HTTP 200** with
`<title>Future Spinner</title>`.

## JOB 1: font shipping safety (`af18e40`)

`assetsInlineLimit: 0` in `frontend/vite.config.ts`, with the comment citing the platform
CSP `font-src 'self'` block observed live 2026-07-28: an inlined data: URI font is refused
by that policy and the system font leaks through silently. `dist_hygiene_gate.mjs` gains
the independent assertion that no data: URI assets ship in any CSS or JS. The predicate is
three-part because pixi.js legitimately ships five short data: capability probes (longest
711 characters, measured): any data: in CSS fails, any font MIME fails at any size, and
any base64 payload of 2048+ characters in JS fails. Seeded per convention (p) with the
exact inlined-woff2 form plus three variants, all caught; negative control is the real
shipped JS including the pixi probes, clean. **Bundle delta: zero.** 109 files,
15,633,167 bytes before and after, because nothing was inlined today; the change exists so
that stays true.

## JOB 2: typography tokens (`eb357d9`)

`--fs-font-display: 'Orbitron', system-ui, sans-serif` and
`--fs-font-numeric: 'Orbitron', 'Courier New', monospace` in `src/app.css`, replacing
**eight hand-typed variant stacks across 78 sites plus the seven bare Courier New sites**
(all seven in the dev-only ThemeSelector). Mapping rule: stacks ending in `monospace` took
the numeric token, stacks ending in `sans-serif` took the display token, so every site's
fallback class is preserved and Orbitron still leads everywhere. The root's scaffold-era
`Avenir, Helvetica, Arial` chain collapsed into the display token (they sat behind
`system-ui` and ahead of the same terminal keyword, so they were unreachable weight).

`machine_tell_gate.mjs` gains the **third-font-stack** class: a literal `font-family`
value that is not `inherit` or one of the two tokens fails; a third `--fs-font-*` token
fails; a redefinition outside `app.css` fails; and a script-side PixiJS `fontFamily:`
fails, because canvas text cannot read CSS custom properties and would otherwise be a
stack the CSS rule cannot see. Four seeds caught, two clean controls, in the gate's
existing self-test frame.

**Zero visual change, proven rather than asserted**: `typography_token_proof.mjs` served
the before-build and the after-build, captured the splash and the HUD at 1200x675 with
animations off and every canvas masked, and counted **0 differing pixels of 810,000 on
both surfaces**. Captures committed at `reports/screens/typography-tokens-2026-07-28/`;
result JSON at `reports/qa/typography_token_proof_2026-07-28.json`.

## JOB 3: composition (`76d0241`), and the finding the brief did not expect

**The briefed +3.4 percent Popout L offset does not reproduce on current main.** Measured
per convention (l.2) before touching anything: frame and grid sit at **exactly 50.0
percent of viewport width, 0.0px off the centreline**, at Desktop 1200x675, Laptop
1024x576 and Popout L 800x450 (the compact landscape profile). The desktop 5.3-percent
figure does not reproduce either. **No centring change was made**, because shifting a
measured-centred stage would introduce the defect the brief asks to remove. The most
probable source of both figures is the live build of unknown version (owner item 3);
re-measure on the portal after the V10 upload. Annotated measurement committed at
`reports/screens/composition-2026-07-28/popout-l-centring-measured.png`, numbers at
`reports/qa/composition_2026-07-28.json`.

**The desktop side-by-side is committed for the eye-call** at
`reports/screens/composition-2026-07-28/desktop-side-by-side-annotated.png`: as shipped
(grid at 50.0 percent, feature rail at 81.1 percent, grid-plus-rail ensemble midpoint at
58.1 percent) versus optically centred (whole stage 97.65px left so the ensemble midpoint
sits at 50.0 percent, grid then at 41.9 percent). The optical construction is stated on
the image; no change without the owner's word, and the shipped build is unchanged.

**Paytable hero casing verified NOT mixed**: the callout renders the uppercase literal
`WAYS TO WIN` (`PaytableModal.svelte:196`) and the section heading renders the same
`waysLabel` through `text-transform: uppercase` (`:204`, `.fs-heading` at `:610`), so
both surfaces read identically in both modes. No vocabulary-layer rerouting was needed;
nothing was changed.

## JOB 4: the round-three prompt is RATIFIED (`f0e5866`)

`docs/records/reviews/round3_reviewer_prompt_RATIFIED.md` (renamed from `_DRAFT` so the
filename cannot contradict the status). The three binding edits, applied and listed in the
document's own header:

1. **No prior scores anywhere in reviewer-facing text.** Sections C and D disclose the
   findings and never the numbers, taking section E decision 2's recorded alternative.
   The scores stay in section B, which is studio-side context and is not pasted at a
   reviewer.
2. **`future-spinner-3` and the v9 build line named**, in C and in stage 4, tied to the
   `VERSION` file and `build-info.json` so which build is under review is checkable
   rather than assumed. Phrased against the mechanism (the line format) rather than one
   number, because the version live at round-three time will be v10; see the note for
   Fable below.
3. **The live confirmations added as verifiable**: stage 4 now lists the DTT publication,
   the boot line, the quoted RGS shapes, the ACP capture and the live Bet Replay
   confirmation as items the reviewer opens and verdicts, not claims they accept.

The header also records that **the round-two reviewer instrument survives in the owner's
chat archive** and may be committed later for lineage without affecting this document's
validity.

## JOB 5: Kit V10 (`e3206c9`)

`VERSION` moves to 10; `~/Desktop/FS_UPLOAD_KIT_V10/` built by `kit_build.mjs` from a
**fresh clone of `e3206c90`**, clean tree, **110 files, 15,633,367 bytes (14.91 MB)**,
frontend only (the maths package stays at V1 and is not re-uploaded), single use, all
dist gates run in the clone and green, walkthrough live section derived as **PART 9i**.
`build-info.json` inside the kit stamps `v10` from the one source.

A process near-miss worth recording: the kit was first built one commit early, before the
VERSION bump had been pushed, so the folder said V10 while the clone's bundle stamped v9.
The builder's own warning line named the two dirty paths that could not reach the kit,
which is what made the mismatch visible. That kit was deleted and rebuilt from the pushed
commit; the shipped kit is the second one and its stamp is verified above.

PART 9h is marked superseded in the walkthrough (no V9 upload was ever confirmed; the
destination entry changed). **PART 9i is the one-page v10 visit**: full import to
`future-spinner-3`, publish (no Start Approval), the one v10 console-line screenshot, and
one glance at the paytable hero reading `1,024 WAYS TO WIN`. `OWNER_CHECKLIST.md` item 3
updated to match.

## Self-audit (facts discipline 4)

- Brief executed job for job; the one deviation is JOB 3, where the ordered change was
  not made because the measurement contradicted the brief's premise, per (l.2) and (l.6),
  and the evidence is committed in its place. Surfaced in FABLE_COMMS 021 rather than
  decided quietly, per (n).
- Locked paths untouched; no lock exceptions; `.claude/settings.json` diff empty.
- Every gate added this session ships a seeded self-test that was seen to fail before its
  pass counted (convention p): four data: URI seeds, four font-stack seeds, all caught,
  negative controls clean.
- Evidence written to committed directories only under `FS_WRITE_EVIDENCE=1` in the two
  jobs that regenerate evidence (h.1); everything else went to scratch.
- No em or en dashes introduced; dash gate and machine-tell gate green in CI on every
  push.

## For Fable / the owner: three items

1. **JOB 3's premise did not reproduce** (above). If the +3.4 and 5.3 figures came from
   the live portal, the V10 upload resets the baseline and the re-measure is one
   screenshot; if they came from somewhere else, the source is worth naming so it can be
   reconciled.
2. **The ratified prompt names the v9 build line while V10 will be live at round-three
   time.** The applied edit names the line's mechanism and format with v9 as the example,
   and the verifiable list ties the reviewer to the `VERSION` file rather than a number,
   so the prompt stays true across the upload. If the ratification intended the literal
   string v9, say so and it is a one-line change.
3. **Owner actions are unchanged and now unblocked**: PART 9i with kit V10, then the
   Guidelines ticks, then round three runs with the ratified prompt.

## Rule 10 and rule 12 closings

Filled by the closing commit after the final push's remote result was read; the
closing section is appended at the end of this report.

## FOR THE NEXT SESSION

- **Model and effort used**: Fable 5, default effort, single session, six jobs plus the
  brief save, one commit per job.
- **Approach**: verification-first throughout. JOB 1 measured the shipped data: URI
  inventory before writing the gate (which is what surfaced the pixi probes and shaped
  the three-part predicate); JOB 2 derived the token mapping from each site's terminal
  keyword and proved zero visual change by pixel equality rather than by review; JOB 3
  re-measured the briefed figures before changing anything and shipped evidence instead
  of a change when they did not reproduce; JOB 5 rebuilt the kit after catching the
  one-commit-early build.
- **Alternatives tried and rejected**: a blanket no-data:-URI rule for JOB 1 (false
  positives on pixi's five capability probes; replaced with the three-part predicate); a
  computed-style comparison for JOB 2's proof (the fallback chains differ by design, so
  rendered-pixel equality is the honest claim); centring "fix" for JOB 3 (the stage is
  already centred; a shift would create the defect).
- **Files touched**: `frontend/vite.config.ts`, `frontend/scripts/dist_hygiene_gate.mjs`,
  `frontend/src/app.css`, `frontend/src/App.svelte`, 22 component files under
  `frontend/src/lib/components/`, `frontend/scripts/machine_tell_gate.mjs`, new
  `frontend/scripts/typography_token_proof.mjs` and
  `frontend/scripts/composition_evidence.mjs`, evidence under
  `reports/screens/typography-tokens-2026-07-28/` and
  `reports/screens/composition-2026-07-28/` and `reports/qa/`,
  `docs/records/reviews/round3_reviewer_prompt_RATIFIED.md` (renamed), `VERSION`,
  `docs/records/upload-kit/00_READ_ME_FIRST.md`, `OWNER_CHECKLIST.md`.
- **Open threads**: the owner uploads V10 per PART 9i and finishes the Guidelines ticks;
  round three runs with the ratified prompt; redo nominations are decided from round
  three's quality findings; the JOB 3 premise reconciliation and the v9-versus-v10
  prompt wording are the two waiting-on-a-word items above; the composition re-measure
  on the portal after the V10 upload closes the loop on the owner's figures.

## Rule 10 and rule 12 closings, filled

**Rule 10.** The session's report push (`f2f1ef4`) ran remote CI as run
**30326922866** and it is **green**:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30326922866
Every earlier push this session was green on its own run (30325530938 JOB 1,
30326057767 JOB 2, 30326529342 JOB 4, 30326703254 JOB 5); the two runs marked
cancelled (30325407524, 30326397510) were superseded by the next push under the
workflow's concurrency rule, not failures, and their commits' gates all ran green in
the runs that replaced them. No reds this session, expected or otherwise.

**Rule 12.** The owner preview was refreshed BEFORE this report was written and the
line pasted above; the address was curled and answered HTTP 200 with the Future
Spinner title. Per the one-commit-lag clause, the preview is refreshed once more as
the last action of the close, after this commit's push, so the owner's machine ends
on the true tip.
