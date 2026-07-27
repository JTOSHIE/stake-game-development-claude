# Session Report: THE LOCALE AND TYPE PASS, Fable rulings 1 to 3 (2026-07-28)

Brief saved verbatim: `reports/briefs/FS_LOCALE_AND_TYPE_PASS_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, no lock exceptions taken and none needed: no locked
path was touched. One coherent job, six commits, ratchet-first.

## Ruling 1, TR-091: nineteen frozen entries, burned to zero

The brief required each fixed entry to be burned out of the frozen list **in the same commit
as its fix, so the ratchet visibly empties**. It did: 19 to 15 to 13 to 10 to 0.

**Ten were fixed, and the fix was mostly DELETION.** The pattern behind almost all of them
was the same: a hand-rolled ternary reimplementing a layer that already exists.
`SOCIAL_OVERRIDES` maps `bet` to PLAY and `win` to PRIZE, and both `tr` and `t()` consult it
before the locale table, so `{$isSocial ? 'PLAY' : 'BET'}` **is** `{$tr('bet')}` plus fifteen
missing locales. The ternary reproduced the social swap and dropped the locale swap, which is
precisely why it survived: the surface looked right in both modes anyone tested.

- `bet` and `win` reused for the BET/PLAY and WIN/PRIZE sites.
- `overdriveFreeSpins` and `totalWin` reused: `HUD_LABEL_FREE_SPINS` and `HUD_LABEL_TOTAL_WIN`
  were **second copies of strings already present in all sixteen locales**, and being
  constants in a `.ts` module they were unreachable by the gate, which only opened `.svelte`.
  Both deleted from `fsModes.ts`.
- Seven new keys across all sixteen locales: `stateOn`, `stateOff`, `buyFeaturesHeading`,
  `betModesHeading`, `sessionNet`, `symbolWild`, `symbolScatter`, plus `winFlash` and
  `loadingDetail` earlier in the arc. Social variants for the two headings live in
  `SOCIAL_OVERRIDES` rather than in a component ternary.

**`winFlash` is its own key rather than `win` plus an exclamation mark**, and that was not
fussiness: the house bakes punctuation into the value per locale because it is not portable.
Japanese writes the fullwidth mark and Spanish opens with an inverted one, exactly as `bigWin`
already does across all sixteen.

**Two were removed as NOT A DEFECT, and the ratchet caught that itself.**
`{#if sym.name === 'SCAT'}` and `{:else if sym.name === 'WILD'}` are Svelte block CONDITIONS
comparing against data; they render nothing. The gate was reading branch logic as
player-visible text. Excluding block tags is the fix, and **the moment the gate stopped
reporting them the both-directions check went red on two frozen entries matching nothing**.
Freezing a false positive is worse than missing a real one, because it makes the debt list
lie about its own size.

**One more was found while fixing, somewhere no version of this gate can reach.**
`SessionPanel` computed `coinsWord = $isSocial ? 'COINS' : ''` in its SCRIPT block. Same
duplicated-layer shape, hidden where markup scanning cannot go. `SOCIAL_OVERRIDES` already
maps `balance` to COINS in every locale, so it asks for it now.

**A gate fix the first burn forced.** Removing the first four entries turned the gate RED on
the two lines that had just been FIXED, because the house style explains a fix by QUOTING the
code it replaced and the gate was reading HTML comments as markup. Verified before changing
it rather than assumed: Svelte compiles with `preserveComments: false`, and grepping
`dist/assets/*.js` for a distinctive committed comment string returns 0. Comments are now
stripped alongside the script block, and the negative control gained a case that quotes a
defect inside a comment and must pass, so stripping them cannot silently blind the gate
instead.

## Ruling 2, TR-092: the HUD stops shouting

Three `text-transform: uppercase` removed. The badge was the outlier, not the other three:
all four surfaces take the name from one source, `modeLabel()`, and the specification spells
it `Cruise`. `OVERBOOST` and `NITRO OVERDRIVE` were never affected because they are already
capitals, **which is exactly why this hid for so long**: the two loudest mode names looked
identical either way.

**Sweep class 4 gets its first gate.** The charter recorded it as only PARTLY covered because
cross-surface casing needs the rendered DOM. True in general, and NOT true of this instance:
the strings already come from one source, so the divergence was one CSS property and can be
pinned statically. `machine_tell_gate.mjs` gains a `cross-surface-casing` class in the static
job. Convention (p) seed is the exact rule removed, byte for byte; the control is a
`.p-stat-label` carrying the same property, because stat labels are not mode names and must
stay free to be styled.

## Ruling 3, TR-089: the count-up holds still, measured

Per-digit fixed-width boxes at `0.834em`, Orbitron's widest real advance, on the amount only.

**The proof is the deliverable here.** `win_countup_steady_gate.mjs` renders the real markup
at the real class names against the real loaded font, waiting on `document.fonts.status`
first so it cannot measure a fallback face and call it Orbitron, and it reads the box width
OUT of `WinBanner.svelte` rather than restating it.

| | `$1,111.11` | `$8,888.88` | worst character drift |
|---|---|---|---|
| unboxed, as it shipped | 249.11px | 419.27px | **141.80px** |
| boxed | 407.17px | 407.17px | **0.00px** |

Those two strings because `1` is the narrowest digit and `8` the widest, so if anything can
drift, those will. **The convention (p) seed is not invented**: it renders the same markup
with the rule absent, i.e. exactly what shipped, and requires the drift to reproduce. If the
unboxed form ever stops drifting, the font has changed and the gate is measuring nothing, so
it fails rather than passing quietly.

**The remaining seventeen declarations are ACCEPTED, per the ruling.** They sit on readouts
that are static between renders: balance, bet, session totals, paytable figures, mode costs.
An inert property costs nothing where nothing is rolling, because a number that changes once
when the player acts does not shimmy. Only the count-up animates digit by digit and only the
count-up got the boxes. They are left in place so a future face with real `tnum` switches them
on for free.

## Gates

Locale completeness PASS at **71 keys across 16 locales**, 8 seeds caught, control clean, and
the frozen list reading **zero debt**. Machine tell gate self-test PASS with **11 seeds caught
and 9 controls clean**, source and dist PASS. Win count-up self-test PASS with the defect
reproducing, gate PASS. Dash gate source and dist PASS. Social locale 65 assertions PASS,
social vocabulary PASS, a11y social terms PASS, HUD naming uniformity PASS. Layout fit PASS at
all seven presets. `npm run check` 0 errors on the committed 36-warning baseline. Production
build clean.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Approach.** Ratchet-first, one commit per group, each burning its own entries so the count
in the log is the count in the gate. The single most useful habit was reading the EXISTING
layer before writing a new one: four of the ten entries needed no new key at all, and two
needed a deletion rather than an addition.

**Alternatives tried and rejected.**

- *Appending `!` to `win` for the flash.* Rejected on inspecting `bigWin`: punctuation is
  baked per locale because it is not portable.
- *Allowlisting the two PaytableModal entries.* Rejected: they are not defects at all, and
  the gate was wrong to read block conditions as text.
- *Extending `hud_naming_uniformity_check.mjs` for the casing assertion.* Rejected: it needs a
  dev server and is not in CI. A static pin runs on every push.
- *Boxing every character in the amount.* Rejected: only digits need monospacing, and boxing
  the currency symbol and separators spaces them oddly.
- *Deleting the seventeen inert `tabular-nums` declarations.* Rejected per the ruling: they
  cost nothing and would switch on for free under a future face.

**Open threads.** TR-088 (the `games/` presentation question) and TR-090 (two proof scripts
still writing into committed evidence) remain open and are both awaiting a ruling. The
sentence-case half of the hardcoded-string class is still parked at
`docs/QUALITY_CHARTER.md` 4.3, whose completeness claim was corrected. Audio, social-mode
capture, accessibility and animation quality remain unswept, per 5.3.
