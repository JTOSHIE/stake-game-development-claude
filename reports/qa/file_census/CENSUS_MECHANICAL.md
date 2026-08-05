# FILE CENSUS: the mechanical pass

**Generated 2026-07-29 in the main loop by JOB 2 of `reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`.**
Path rules and a reference scan, costing no agent tokens. This is the INPUT to the census
squads, not the census. Every number here is a lead to be judged, not a finding.

Australian English, no em dashes or en dashes.

## Classification by path rule

| class | files | what it means |
|---|---|---|
| `evidence` | 1556 | gate output, ledgers, proof screenshots |
| `skin` | 1249 | the shipped Svelte game and its brand assets |
| `records` | 534 | decision records, method documents, verbatim briefs, doc captures |
| `tooling` | 173 | gates, build config, CI, developer scripts |
| `engine` | 91 | the maths package and the python simulation engine |
| `UNCLASSIFIED` | 27 | no rule matched, a squad must judge these |

**Total tracked files: 3630.**

**CORRECTION, 2026-08-05, appended rather than overwritten because the discrepancy is the
finding.** 3630 is **34 short** of the 3664 files tracked at `f4d03cb^`, the state this census
was taken against. The class counts above **sum exactly to 3630**, so the arithmetic is sound
and the loss is in the INPUT LIST rather than in the tabulation. **The 34 cannot be named**,
because no census generator is committed: the list was produced once and the producer was not
kept, so there is nothing to re-run and diff against. 3630 is therefore left standing as what
was actually counted, and is not silently replaced by 3664, which would assert a coverage this
census never had.

**The durable fix is to commit the generator**, so a later reader can reproduce the list rather
than trust it. That is open work and is not done here.

## The 27 the rules refused to guess at

These are handed over UNCLASSIFIED deliberately rather than forced into a class:

- `CLAUDE_PROJECT_INSTRUCTIONS_v7.md`
- `HANDOVER_2026-07-25_Fable.md`
- `HANDOVER_2026-07-25c_Fable.md`
- `frontend/README.md`
- `frontend/c1preview.html`
- `frontend/index.html`
- `frontend/screens/c1_big.png`
- `frontend/screens/c1_epic.png`
- `frontend/screens/c1_max.png`
- `frontend/screens/c1_mega.png`
- `frontend/screens/fs_paytable_reskin_overdrive.png`
- `frontend/screens/fs_paytable_reskin_rtp.png`
- `frontend/screens/fs_paytable_reskin_symbols.png`
- `frontend/screens/fs_paytable_reskin_top.png`
- `frontend/screens/fsmenu_base.png`
- `frontend/screens/fsmenu_betmodes.png`
- `frontend/screens/fsmenu_open.png`
- `frontend/screens/hud_reskin_base.png`
- `frontend/screens/hud_reskin_overdrive.png`
- `frontend/screens/hud_reskin_paytable_overdrive.png`
- `frontend/screens/rg_autoplay_menu.png`
- `frontend/screens/rg_session_panel.png`
- `frontend/screens/scene_after.png`
- `frontend/screens/scene_character_render.png`
- `frontend/screens/symbol_after.png`
- `frontend/screens/symbol_after_idle.png`
- `frontend/screens/symbol_before.png`

**23 of the 27 are PNGs under `frontend/screens/`.** Convention (h) says visual proof is
committed to `reports/screens/<pass>/`. These sit outside that, in the frontend tree, and
`frontend/public/` is copied verbatim into `dist` by Vite while `frontend/screens/` is not,
so the question is whether they are evidence in the wrong place or something else. A squad
decides; the rules will not.

## Zero-reference candidates: 550

The individual paths are enumerated in full in `orphan_candidates.txt`, one per line, in
this directory. The table below groups them and is not the record of which files they are.

<!--CHECK: exists reports/qa/file_census/orphan_candidates.txt-->

| path prefix (first two segments) | candidates |
|---|---|
| `frontend/public` | 439 |
| `design-system/brand` | 33 |
| `docs/reference` | 19 |
| `docs/assets` | 9 |
| `frontend/scripts` | 8 |
| `frontend/screens` | 5 |
| `tests/win_calculations` | 5 |
| `utils/game_analytics` | 4 |
| `docs/fe_assets` | 3 |
| `docs/records` | 3 |
| `src/calculations` | 3 |
| `src/config` | 3 |
| `src/write_data` | 3 |
| `utils/merge_luts` | 2 |
| `frontend/src` | 1 |
| `optimization_program/run_script.py` | 1 |
| `src/state` | 1 |
| `src/wins` | 1 |
| `uploads/aws_classes.py` | 1 |
| `uploads/aws_constants.py` | 1 |
| `uploads/aws_upload.py` | 1 |
| `utils/analysis` | 1 |
| `utils/rgs_verification.py` | 1 |
| `utils/search_tool` | 1 |
| `utils/swap_lookups.py` | 1 |

### WHAT THIS SCAN CANNOT SEE, stated before anyone trusts it

Per `docs/skills/FULL_AUDIT_METHOD.md` 2.5, when a search returns nothing, ask whether it
could have returned something. This scan matches a file basename or full path literally in
any tracked text file, plus an import-stem form for ts, mjs, js and svelte. **It cannot see
a path composed at runtime.** So a zero means "no literal reference found", never "unused".

### THE WORKED EXAMPLE, because this scan already produced two false findings

The main loop took the two largest leads from this scan and both were REFUTED by opening the
source. They are recorded here so the census squads do not re-derive them and so the failure
mode is visible:

1. **"439 unreferenced files in `frontend/public` and Vite copies `public/` verbatim into
   `dist`, so unused assets ship."** The scan found zero literal `/assets/` references in
   `frontend/src`, which looked damning. In fact assets resolve through an `assetBase` string
   composed at runtime (`frontend/src/lib/config/themes.ts:34`), which is precisely this
   scan's blind spot. **And `vite.config.ts` carries a `pruneLegacyAssets` step**, asserted by
   `frontend/scripts/build_diet_verify.mjs:62-66`, which prunes the non-shipping theme trees
   from `dist` and proves zero requests reach them. REFUTED.

2. **"`themes.ts` registers `valhalla-rising` and `apex-racing` with an `assetBase` pointing
   at directories that do not exist."** The directories genuinely do not exist. But both
   entries carry `available: false` (`themes.ts:96` and `:112`), so they are gated out of the
   selector and nothing can request them. REFUTED.

**Two plausible findings, both dead on contact with the source.** That is the same ratio
Session 1 measured across its panels: the observations were real, the diagnoses were not.
Treat every row above the same way.
