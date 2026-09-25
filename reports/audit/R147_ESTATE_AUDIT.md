# R147 estate audit

**Session R147, 2026-09-26, branch `claude/r147-overnight-audit`.** Brief:
`reports/briefs/FS_R147_OvernightCloseEstateAudit_Prompt.md`, Phase 2 (sections 2.1 to 2.7) and the
Phase 3 fixes that fell out of it. Review lane.

## How this was produced, and what "first-hand" means here

- **Discovery:** one read-only workflow, eight section auditors (2.4 split into rows and animation),
  each followed by an adversarial verifier told to refute, then a completeness critic: 17 agents,
  0 lost. The verifiers confirmed 139 claims and corrected 28; the critic marked 44 of 59
  questions answered, 13 partly and 2 unanswered (the deletions and this file, both done in
  Phase 3), and listed 11 contradictions between sections. All 11 are resolved below.
- **Every figure in this file was re-derived by the R147 session itself after the workflow
  returned**, with its own scripts (git, ffprobe and ffmpeg ebur128, pyloudnorm, PIL, Playwright),
  not copied from an agent. Where an instrument was an agent's, it was read first, rebuilt against
  the current source, and re-run with its control arm. Anything not re-derived is marked
  **REPORTED** with its source.
- **Anchors.** Phase 2 started at `7463593a` with a clean tree (fingerprint: 4,881 index rows, 465
  raster SHA-256s). It ended at `1c335cdd` with 0 porcelain lines, 465 of 465 rasters unchanged
  and exactly one index row changed: `frontend/public/assets/themes/future-spinner/sounds/README.md`,
  the session's own Phase 1 record commit `1c335cdd`, made while the auditors ran. **No auditor wrote a
  tracked file.** One side effect is declared: `scripts/qa/doc_currency_gate.mjs` fetches from origin
  when a cited SHA does not resolve, so its runs wrote hidden `refs/prefetch/pull/*` refs and
  `FETCH_HEAD`. No branch, tag or tracked file changed as a result.
- **5173 was never bound.** The dev server for this session ran on 5174 (`fs-dev`); audio_verify
  chose its own ephemeral port (57646).

---

## 2.1 Git estate

| Item | Value | How |
|---|---|---|
| origin/main | `0dd8105c`, "Merge pull request #182 from JTOSHIE/claude/r146-wav-intake", parents 394165ca and 9b99a9fc (the R146 tip) | `git rev-list --parents -n1` |
| arc2-baseline | annotated tag, object b11163e4, target commit 618b711e (2026-08-24 11:49 +1000, "R085: STOPPED at TASK 1..."), tagged 2026-08-24 11:59 +1000; an ancestor of main, 186 commits behind | `git for-each-ref`, `merge-base --is-ancestor`, `rev-list --count` |
| Open PRs | **0**. All-time 182: 180 merged, 2 closed unmerged (#125 `controlrow/2026-08-15`, #30 `claude/fs-hud-reskin`) | `gh pr list --state all` |
| Heads on origin at the audit | **59**: main plus 58 | `git ls-remote --heads origin` |

**How "safe to delete" was proven, per head:** the name is a per-session head (`claude/rNNN-...`);
its tip is an ancestor of origin/main with 0 unique commits; it has exactly one PR and that PR is
MERGED; the PR's merge commit is on main **with this tip as its second parent**; GitHub's
`refs/pull/N/head` still equals the tip (a permanent restore handle); and no PR on it is open.
**50 heads passed all six; 8 did not.** The brief (lines 15 to 17 and 107 to 109) allows deleting
merged session branches only; by its letter, line 107 would also cover `analysis/2026-08-15` and
`track/standback-2026-08-15` (merged, no open PR), and arguably the bookmark
`claude/collect-prototype`. They were NOT deleted: they are not session heads, the R071 record in
`reports/SESSION_REPORT.md` holds the first two for the owner's OK under ruling (t.1) rule 3, and the
third is on CLAUDE.md's keep list.

**Not safe (left in place):**

| Head | Tip | Ancestor of main | Unique commits | Why it stays |
|---|---|---|---|---|
| `analysis/2026-08-15` | aed054a1 | yes | 0 | merged (PR #124), 0 unique, but not a session head; held for the owner since R071 |
| `chore/wip-backgrounds` | 88df4f9c | no | 1 | keep list (CLAUDE.md BRANCHES); 1 unique commit |
| `claude/collect-prototype` | 75eff451 | yes | 0 | keep list; 0 unique commits BUT a bookmark: its tree holds 16 files under games/future_spinner_collect/ that main lacks |
| `claude/fs-super-prototype` | d270019f | no | 1 | keep list; 1 unique commit |
| `claude/gap-analysis` | bcbe1522 | no | 18 | keep list; 18 unique commits |
| `claude/lumen-sideproject` | 4f4d6ef8 | no | 38 | keep list; 38 unique commits |
| `controlrow/2026-08-15` | 36562d54 | no | 3 | 3 commits on no other branch; PR #125 CLOSED unmerged (tip kept by `refs/pull/125/head`) |
| `track/standback-2026-08-15` | 7108da98 | yes | 0 | merged (PR #123), 0 unique, but not a session head; held for the owner since R071 |

### Deletion log (Phase 3, brief 2.1)

Deleted in one `git push origin --delete` at 2026-09-25T18:55:21Z (2026-09-26 04:55 AEST), after the tips and
ancestry were re-checked against a fresh `ls-remote` in the same script. Every row was then
re-read: the head is gone, and `refs/pull/N/head` still equals the recorded tip. **Restore any
row with** `git push origin <tip>:refs/heads/<name>` (or fetch `refs/pull/N/head`).

| Branch | Tip | Merge commit on main | PR | Deleted | pull ref still at tip |
|---|---|---|---|---|---|
| `claude/r086-placeholder-integration` | c7dd3185 | 76c29616 | #127 | yes | yes |
| `claude/r087-animfix` | 26e12167 | b67730c3 | #128 | yes | yes |
| `claude/r089-preferred-master-swap` | a1f7fb8e | 509a2902 | #129 | yes | yes |
| `claude/r090-square-rerender-swap` | 43584c9c | 0e607647 | #130 | yes | yes |
| `claude/r091-backgrounds-win-overdrive` | 4d034d96 | 236723e0 | #131 | yes | yes |
| `claude/r092-final-missing-assets` | 5d89bd3b | ba430367 | #132 | yes | yes |
| `claude/r093-hero-title-character` | 2c78658d | 306f2a76 | #133 | yes | yes |
| `claude/r094-corrected-hero-assets` | 4bc33d55 | 040fa8c4 | #134 | yes | yes |
| `claude/r095-brightened-hero` | e6848d84 | 6509c7b8 | #135 | yes | yes |
| `claude/r096-silhouette-restored` | 39c30346 | fa3e7512 | #136 | yes | yes |
| `claude/r097-arc2-audit` | 98dcd0b0 | c00b9dd5 | #137 | yes | yes |
| `claude/r098-openai-ruling` | 5d282426 | 49afc8c4 | #138 | yes | yes |
| `claude/r099-openai-gate-unblock` | 46b3e352 | 05cfd12d | #139 | yes | yes |
| `claude/r101-assets-guard` | 579a2bdc | 5c8f30bf | #141 | yes | yes |
| `claude/r102-hud-spine-safety` | 29ddaf70 | 8d0ddfd4 | #142 | yes | yes |
| `claude/r103-outstanding-work` | 9f7ca65a | dab7d357 | #143 | yes | yes |
| `claude/r104-banner-kit-fx-character` | 156c20f7 | 04d125c2 | #144 | yes | yes |
| `claude/r105-runtime-true-intake` | ac5341ec | 491384f4 | #145 | yes | yes |
| `claude/r106-fx-closure` | 5847d38f | 0a6f5ba7 | #146 | yes | yes |
| `claude/r107-fx-final-closure` | da6b5edb | e73d7230 | #147 | yes | yes |
| `claude/r108-particle-brightness` | 74a4b925 | be5d5ec7 | #148 | yes | yes |
| `claude/r109-art-law-spine-unblock` | 5685c748 | 4cd051c9 | #149 | yes | yes |
| `claude/r110-painted-visor` | 8cbd4b9f | e487b29a | #150 | yes | yes |
| `claude/r111-spine-foundation` | 5807f39f | a93fc7e6 | #151 | yes | yes |
| `claude/r112-crossed-arms-hero` | 29f2b7b4 | 2714d3d1 | #152 | yes | yes |
| `claude/r113-win-celebration` | 687fceca | 97ad8a54 | #153 | yes | yes |
| `claude/r114-hero-reaction` | 831dfc8a | 22fb0525 | #154 | yes | yes |
| `claude/r115-review-closure` | 114bc1bf | 7e292ebf | #155 | yes | yes |
| `claude/r116-factory-audit` | a3729336 | 1093bcf1 | #156 | yes | yes |
| `claude/r117-intake-audio` | b5b659cb | 661fad1e | #157 | yes | yes |
| `claude/r118-perimeter-tone` | 6b61b1ff | 320bef96 | #158 | yes | yes |
| `claude/r119-hud-shell` | c3350832 | d0334aef | #159 | yes | yes |
| `claude/r120-neighbour-consistency` | f90d1d03 | b56f8cc0 | #160 | yes | yes |
| `claude/r121-hero-quality` | bae1a981 | 466c0edc | #161 | yes | yes |
| `claude/r122-pose-strips` | 8f1aa342 | c4a923e7 | #162 | yes | yes |
| `claude/r123-pose-strips-v2` | 04a358d2 | e5b0213e | #163 | yes | yes |
| `claude/r124-review-closure` | 1f92f83f | bf98aa43 | #164 | yes | yes |
| `claude/r125-features-audio` | 3f75b833 | 9ab3a5e0 | #165 | yes | yes |
| `claude/r126-hero-inbetween` | ca3b4818 | 0610b2ce | #166 | yes | yes |
| `claude/r127-parallel-support` | 8b8657f2 | 230a30d4 | #167 | yes | yes |
| `claude/r128-anticipation-symbol-lobby` | 20e597ae | 67d73aee | #168 | yes | yes |
| `claude/r129-smoothness-hardening` | a5d776c5 | 419eace0 | #169 | yes | yes |
| `claude/r130-idle-freeze` | bc008c5c | bb966e19 | #170 | yes | yes |
| `claude/r131-borders-banners` | 568b3a5e | 21040a3e | #171 | yes | yes |
| `claude/r138-idle-float` | 1ca2cc31 | 59db1a08 | #177 | yes | yes |
| `claude/r140-dense-reactions` | cc47268f | 972006b1 | #179 | yes | yes |
| `claude/r141-gauge-needle-0deg` | 8ee42bb6 | 4a9918e5 | #178 | yes | yes |
| `claude/r143-dev-one-round` | db626bcb | 6e451987 | #180 | yes | yes |
| `claude/r145-astra-static-proof` | 82f6fe29 | 394165ca | #181 | yes | yes |
| `claude/r146-wav-intake` | 9b99a9fc | 0dd8105c | #182 | yes | yes |

**origin after the deletions: 9 heads** (the six on CLAUDE.md's keep list, main included, plus
the three 2026-08-15 heads), and 10 while this PR's branch is up.

**Local:** 59 branches, **52 stale** (ancestor of main, not checked out, not main): the same 50
session names, `analysis/2026-08-15` and `track/standback-2026-08-15`. Not stale: main, the current
branch, `controlrow/2026-08-15` and the four keep-list heads that are not ancestors. One worktree.
**Two stashes**, both old: `97140a95` (2026-07-04, on claude/reel-feel-v3, build-diet QA work)
and `ac83c2a6` (2026-07-03, WIP on main). Nothing local was deleted and no stash was dropped: the
brief's clause is origin-only, and a dropped stash is recoverable only from the reflog.

**Process finding.** Ruling (t.1) rule 2 says a session head is deleted when its PR merges. It was
not followed from R086 (PR #127, merged 2026-08-24) to R146, which is how 50 accumulated.
CLAUDE.md's BRANCHES paragraph said "Six branches exist on the remote and that is the whole list",
false at 59 heads and still false at 9; it is corrected in this PR (2.6).

---

## 2.2 Submission and Stake Engine readiness

**The 51-item list** is the verbatim 2026-08-13 logged-in capture,
`docs/stake-engine-live/2026-08-13/submission_checklist_we_roll_spinners.md`: 51 items, `[01]` to
`[51]`, all unique, **0 ticked. 0 of 51 is the correct public state**: reviewers tick, not the
studio. The live portal state today is login-gated and UNKNOWN.

**Walked as a studio checklist at `7463593a`: 41 met, 3 partly, 0 not met, 1 unknown, 6 n.a.**
The walk is the 2.2 squad's, adversarially verified; this session re-counted it and ran every
file citation in it against HEAD (84 resolve; the one that does not is a hashed dist file name). One
citation was wrong and is corrected below (row 15: the layout gate step is `checks.yml:1284`, not
the comment at :1054). "Green on main" means run 36168381090 (push, `0dd8105c`, 30 of 30 jobs).

| # | Item (abridged) | Studio state | Evidence at HEAD | Note |
|---|---|---|---|---|
| 01 | Authenticates with RGS on launch | met | rgsService.ts:555 authenticate, :730 initRGS; docs/stake-engine-live/captures/2026-08-11_wallet_400_2.json | rgsService.ts has an empty diff since 618b711e |
| 02 | Auth fails correctly on invalid rgs_url | met | frontend/scripts/r057_invalid_rgs_proof.mjs; checks.yml:1427 | CI leg green in run 36168381090 |
| 03 | Bet button sends a successful play | met | rgsService.ts:623 play; r042b_autoplay_proof.mjs, checks.yml:1478 | green on main |
| 04 | No Stake Engine Loader | met | frontend/index.html:23 (only /src/main.ts); dist/index.html has 1 script tag, ./assets/index-DgSyi4yB.js | |
| 05 | Title unique, no restricted terms | met | docs/records/legal/TRADEMARK_EVIDENCE_2026-08-13_SIGNOFF.md; social_string_conformance, checks.yml:1410 | |
| 06 | Assets not offensive | met | owner-authorised 578a3a51 and R145 29f967c8; scripts/assets/canonical_sources.json (last aab8cb57, 2026-08-11) | registry predates the ARC 2 art |
| 07 | Distinct from existing titles | partly | DISTINCTNESS_ATTESTATION_2026-08-13.md:1-3 signed; art clause :14, :30-36 | clause describes the pre-ARC-2 art basis; 24 of 59 rasters now gpt-image-1 bytes |
| 08 | Thumbnail meets artwork guidelines | partly | design-system/brand/tile/GENERATION_NOTE_composed_master.md; assets/portal/ last 6dde511a 2026-08-11; capture :134 | tile predates the reskin; live read UNKNOWN |
| 09 | Uses all betting parameters from authenticate | met | stores/betLadder.ts:33, :41; betLadder.test.ts at checks.yml:679 | |
| 10 | Active round restores bet amount | met | stores/sessionRecovery.ts:267-287; test at checks.yml:715 | |
| 11 | Currencies display correctly | met | utils/currency.ts:14, :40; currency.test at checks.yml:786; currency_table_gate at :869-874 | |
| 12 | Sub-cent payouts | met | r057_subcent_proof.mjs, checks.yml:1435 | green on main |
| 13 | Zero-win sends no end-round | met | rgsService.ts:805-806 | active flag, winMicros fallback |
| 14 | Insufficient balance sends no play | met | stores/buyAffordability.ts:106 canAffordSpin; App.svelte:2027 | |
| 15 | Main frame not scrollable | met | layout_fit_gate.mjs:5, :67-73; checks.yml:1284 | green on main |
| 16 | Space bound to bet | met | App.svelte:1979, :2020 (modal guard), :2027 | |
| 17 | RTP and Max Win in rules | met | i18n/prose.ts:120; i18n/translations.ts:2133 (96.35%, 5,000x) | |
| 18 | Payout per symbol | met | paytable_card_fill_gate.mjs, checks.yml:1292 | green on main |
| 19 | Win combinations in rules | met | prose.ts:102-103, :116; PaytableModal.svelte:213-217 | |
| 20 | Modes have description and cost | met | config/fsModes.ts:70-113, :145; fsModes.drift.test at checks.yml:452 | |
| 21 | Free game and retrigger conditions | met | translations.ts:2118, :2120 match game_config.py:142-163 | 8/12/16 spins, 1x/3x/10x, +5 |
| 22 | General disclaimer | met | prose.ts:125 DISCLAIMER_MANDATED; checks.yml:550-555 | |
| 23 | Auto-bet confirmation | met | check_autoplay_confirm_gate.mjs, r042b_autoplay_proof.mjs; checks.yml:1476, :1478 | |
| 24 | High-cost modes confirm | met | BuyBonus.svelte:2, :65; FeatureMenu.svelte:151-160 | Overboost 1.25x toggles with no confirm, FeatureMenu.svelte:142-146 |
| 25 | Desktop/Laptop | met | layout_fit_gate.mjs:67-68 | green on main |
| 26 | Popout S/L | met | layout_fit_gate.mjs:69-70; popout_conformance.mjs, checks.yml:1406 | |
| 27 | Mobile | met | layout_fit_gate.mjs:71-73 | portrait_layout_conformance.mjs is local-only, checks.yml:18 |
| 28 | Double-tap zoom disabled | met | src/app.css:16 touch-action: manipulation | |
| 29 | Interaction guide | met | prose.ts:56-59, :129 | |
| 30 | Option to disable sounds | met | HudOverlay.svelte:275-276, :480-482; soundService.ts:605 | R146 aa02a539 fixed a persisted-mute crash |
| 31 | English supported | met | translations.ts:236 | |
| 32 | Invalid language does not break display | met | stores/socialLocale.ts:62 resolveLaunchLocale; locale_launch_conformance.mjs | harness is local, not in checks.yml |
| 33 | 5 wins per mode vs rules | met | round_payout_reconciliation_gate.mjs:3; maths tree unchanged since d9a6d375 | gate is local and needs books; R074 re-run inputs unchanged |
| 34 | Mystery Mode probabilities | n.a. | game_config.py: 0 matches for 'mystery' | no Mystery Mode |
| 35 | Social translations | met | social_dom and social_string conformance, checks.yml:1408, :1410 | |
| 36 | SC/GC, no $ prefix | met | currency.ts:52 (trailing, '10.00 SC'); checks.yml:786 | |
| 37 | Social Mode terminology | met | i18n/vocabulary.ts; vocabulary.test.ts at checks.yml:505 | |
| 38 | Replay window has no restricted words | met | replay_contract_gate.mjs:740-749; checks.yml:1361 | |
| 39 | English only in Social Mode | met | socialLocale.ts:47; checks.yml:916 | |
| 40 | Replay URLs load and play | met | services/replayService.ts:8; checks.yml:1361 | |
| 41 | Optional replay params | met | replayService.ts:99, :105, :126 | |
| 42 | Replay again after completion | met | ReplayMode.svelte:455, :585 | |
| 43 | Bet cost and multiplier shown | met | replay_contract_gate.mjs:794 assertEndBannerValues | |
| 44 | Replay in Popout S | met | replay_contract_gate.mjs:1095 (400x225); 'browser: replay fit' | |
| 45 | Bet-level templates applied | unknown | portal only; capture :136 'Valid betlevel template found.' (2026-08-13) | login-gated |
| 46 | Provably Fair and Replay enabled | n.a. | platform-managed, GUIDELINES_51_MAPPING_2026-08-13.md:76 | |
| 47 | Front and Math approved | n.a. | reviewer-side; capture :135 (front v9, math v1) | no reskinned front upload recorded, SUBMISSION_RECORD_2026-08-28_R137.md:3 |
| 48 | Posted in approved channel | n.a. | post-approval owner action | |
| 49 | Older mobile devices | partly | reports/qa/r057_throttled_device_2026-08-13.md:7, :12 | predates the ARC 2 art; owner hand test not recorded |
| 50 | Approval request closed, emojis | n.a. | post-live step | |
| 51 | Game Released | n.a. | end state | |

**The three partly items share one cause**: each rests on evidence dated before ARC 2 that the
reskin has overtaken (07's attestation art clause, 08's portal tile of 2026-08-11, 49's
throttled-device pack of 2026-08-13).

### What changed since the 4.3/9 review, and what a reviewer could still tag

The review is attempt 1 (TR-181: reviewers 1.33, 1.33 and 1.67; tags "low quality assets", "poor
animations", "bad sound design"; zero compliance or functional findings). **The submitted build SHA
is UNKNOWN** (the R085R hold), so the comparator is `arc2-baseline` 618b711e. It is a sound proxy for
art and audio (no commit touched the future-spinner theme assets or `soundService.ts` from e65cc0c9,
2026-08-09, to 618b711e) and only a lower bound for code: the reviewed front predates 618b711e by an UNKNOWN margin.

| Tag | Changed since 618b711e (measured to `7463593a`) | What a reviewer could still tag at HEAD |
|---|---|---|
| Assets | Of 59 tracked theme rasters, **37 changed and 12 are new** (10 unchanged). **24 still carry the bytes of `578a3a51`**, the owner-authorised OpenAI gpt-image-1 placeholder adoption (28 files; h2, m3 and scene_character were re-ingested from the same art at R145, gauge_needle at R141). REPLACE coverage is 28 of 30 (2.4). | `frames/frame-2.png` (SC-03, April art, squashed 0.800 x 0.731 on every theme); `symbols/tile_plate.png` (behind every cell) and `ui/feature_button.png`, both July art; art whose own commit calls it placeholder. |
| Animations | frontend/src: **16 files, +2,541 / -373, 49 non-merge commits**: the six-frame hero idle strip and its R130 freeze, the 32-frame win unfold and 16-frame feature brace, the win banner and max-win celebration work. | The hero is sprite strips plus CSS transforms, frozen at rest on frame 01 (no skeletal runtime); the FEATURES menu and win breakdown still use the pre-R119 chrome; two colour divergences (2.4). **Not** the gauge hub (2.4 closes it as invisible). |
| Sound | **15 files for 12 cues became 19 files for 16 cues**; every file but `ui_click.mp3` (same blob) is now the owner's stems; the four formerly silent cues sound; R147 restored the seamless bed, filtered the rumble, laddered the wins and gave a bought max win its cue. | `win_max` sounds 1.81 s against a 5.0 s spec; **at default sliders every win tier plays under the music bed** (2.3 D5); the base bed can stop for the session on a key-first start (2.3 D1); free-spin wins are silent. |

Whether any tag would recur is UNKNOWN until a second review.

### dist against the cap, wav, and the locked maths

- **dist (built at `7463593a`, clean tree):** 106 files, 18,705,465 B on disk; 105 files and
  18,705,041 B excluding build-info.json. The cap in both gates is 25 x 1024 x 1024 = **26,214,400 B**
  (`frontend/scripts/dist_hygiene_gate.mjs:74`), so **7,508,935 B of headroom, 71.36% used** (6,294,535 B
  on a decimal 25,000,000 reading). The cap is the studio's own budget from `SUBMISSION_DOSSIER.md`
  section 5; no platform capture states a size limit. The later commits change no shipped byte
  except comments stripped at build; the final-tree rebuild is recorded in the session report.
- **0 .wav, .aiff or .flac files in dist.** The 15 WAV masters sit gitignored beside their encodes
  (`.gitignore:81`) and the vite prune keeps them out.
- **Locked maths untouched.** Last commit to `games/future_spinner/` is d9a6d375 (2026-07-26, TR-047
  under a sanctioned lock exception; recorded as `d9a6d37` in `reports/qa/session6/shards/GAME_FACTS.md`).
  `git rev-parse <rev>:games/future_spinner` returns one and the same tree id at d9a6d375, 618b711e,
  0dd8105c, 7463593a and HEAD, and `git diff` from main is empty. **All 12 upload files** in `games/future_spinner/library/publish_files/` (7 tracked, 5
  gitignored books) hash to the SHA-256 values recorded in `SUBMISSION_DOSSIER.md`.

---

## 2.3 Audio runtime truth

**All 16 cue keys are live**: 12 eager in `soundService.ts`'s `sounds` object and the four former
pending cues in `AVAILABLE_PENDING_CUES` (`soundService.ts:530`), pathed in
`frontend/src/lib/stores/themeStore.ts:88-107`. Measured on the shipped files:

| Cue | File | Bytes | Duration s | ebur128 LUFS | pyloudnorm LUFS | Sample peak dBFS | Seam dB |
|---|---|---|---|---|---|---|---|
| anticipationBuild | `anticipation_build.mp3` | 263,277 | 10.9091 | -18.2 | -18.26 | -7.6 | 1.76 |
| anticipationBuild | `anticipation_build.webm` | 170,028 | 10.9170 | -18.0 | -18.0 | -7.3 | 1.79 |
| bgm (base bed) | `bgm_loop.mp3` | 263,277 | 10.9091 | -18.2 | -18.26 | -8.9 | 1.47 |
| bgm (base bed) | `bgm_loop.webm` | 208,164 | 10.9170 | -18.0 | -18.0 | -9.1 | 1.5 |
| bgmTension (Overdrive bed) | `bgm_tension.mp3` | 263,277 | 10.9091 | -18.2 | -18.26 | -9.8 | 1.21 |
| bgmTension (Overdrive bed) | `bgm_tension.webm` | 210,949 | 10.9170 | -18.0 | -17.99 | -9.7 | 1.3 |
| featureEnd (pending set) | `feature_end.mp3` | 28,883 | 1.1243 | -26.8 | -26.86 | -3.3 |  |
| featureEnter (pending set) | `feature_enter.mp3` | 32,017 | 1.2563 | -21.3 | -21.38 | -3.2 |  |
| reelStop | `reel_stop.mp3` | 9,448 | 0.3305 | -70.0 (gated, too short) | -19.79 | -3.2 |  |
| reelStopAnticipation | `reel_stop_anticipation.mp3` | 10,989 | 0.4003 | -19.0 | -19.02 | -3.3 |  |
| retrigger (pending set) | `retrigger.mp3` | 20,106 | 0.7790 | -20.0 | -21.71 | -3.0 |  |
| scatterLand | `scatter_land.mp3` | 29,997 | 1.1770 | -15.6 | -15.62 | -3.3 |  |
| spin | `spin.mp3` | 21,360 | 0.8135 | -11.4 | -11.46 | -3.6 |  |
| uiClick | `ui_click.mp3` | 2,551 | 0.0401 | -70.0 (gated, too short) | -25.91 | -3.4 |  |
| winBig | `win_big.mp3` | 25,748 | 1.0130 | -28.2 | -28.22 | -19.5 |  |
| winEpic | `win_epic.mp3` | 35,152 | 1.3856 | -25.9 | -26.46 | -7.4 |  |
| winMax (pending set) | `win_max.mp3` | 45,183 | 1.8096 | -24.7 | -24.72 | -3.3 |  |
| winMedium | `win_medium.mp3` | 21,986 | 0.8482 | -29.9 | -29.91 | -12.1 |  |
| winSmall | `win_small.mp3` | 10,702 | 0.3798 | -70.0 (gated, too short) | -31.72 | -12.8 |  |

pyloudnorm pads clips under 400 ms with silence to one block; ebur128 cannot meter them. The seam
column is audio_verify's own metric (first and last 20 ms RMS), measured offline.

- **Mute** (`setMuted`, `soundService.ts:198-231`): mutes every eager element, pauses one-shot
  clones and the four pending cues, and stops the anticipation riser; unmuting re-applies volumes
  and retries `playBGM()`. A persisted mute is restored at module load (:189-196).
- **Ducks:** spin x0.4 = -7.96 dB for 1,800 ms (:298-303); anticipation x0.27 = -11.37 dB until the
  last reel stops or mute (:330-347).
- **The take A seam, after Phase 1:** HEAD's `bgm_loop` blobs equal the pre-take-A commit 0d060d9f
  (webm fef77037, mp3 a902311d). Seam 1.50 dB webm and 1.47 dB mp3, where take A (main's blobs) reads
  18.61 and 18.67 with the same instrument (recorded at R146: 18.61 and 18.68). **audio_verify: ALL
  CHECKS PASS** (run 2026-09-25T17:56:10Z), `loopSeamsWithinTolerance` included, `bgm_tension` 1.30 /
  1.21 and `anticipation_build` 1.79 / 1.76.

### Remaining silent, wrong-tier and wrong-bed moments

- **D1. The first-gesture warm-up stops the base music bed for the session.** `warmUpAudio()`
  (:249-268) plays and then pauses **every** element in `sounds`, `bgm` included. When the bed is
  already playing, or is started by the same gesture, the deferred pause lands on it and nothing
  restarts it. Proved in real Chromium with the real autoplay policy, on the real `soundService`
  bundle rebuilt from current source, each case with a control arm that skips the warm-up:

  | First gesture | Shipped | Control |
  |---|---|---|
  | Space, Enter, or a letter key | bed PAUSED for all 10 s | playing |
  | Pointer, 100 ms, bed already buffered | playing | playing |
  | Pointer, 100 ms, bed file 4 s late | bed PAUSED | playing |
  | Tap before boot, tap again after | playing, then PAUSED at the second tap | playing |

  Pre-existing: the loop over `sounds` predates R146, which only added the pending-cue prefetch
  after it. A code fix; no new audio.
- **D2. `bgm_tension` stays ducked for a whole feature** that starts within 1,800 ms of the spin cue:
  `setOverdriveBed` ramps it to `musicVol x bgmDuck` (:415, :420) and only `sounds.bgm` is restored (:301-302).
  Real Chromium: feature at +500 or +1,200 ms leaves it at 0.2 against a 0.5 slider; at +2,000 ms,
  0.5. Reachable by a slam-stopped trigger spin (REPORTED by the 2.3 verifier). Code fix.
- **D3. Mute across a feature boundary leaves the wrong bed after unmute.** While muted,
  `setOverdriveBed` records the new state and returns without swapping (:411-412); unmute runs
  `applyVolumes()` and an idempotent `playBGM()` (:222-229), so the bed that was playing stays. Code
  reading; code fix.
- **D4. The spin duck's restore timer lifts the bed mid-riser.** The 1,800 ms timer sets
  `bgmDuck = 1` unconditionally (:300-303), including after `playAnticipation()` set 0.27 inside that
  window. Code reading; code fix.
- **D5. Heard levels at the default sliders** (music 0.5, SFX 0.8, `audioSettings.ts:18-19`): file
  loudness plus `20 log10(BASE x slider)`. The bed is heard at -24.0 LUFS, -32.0 inside the spin duck.

  | Cue | Heard LUFS | Against the bed | Against the ducked bed |
  |---|---|---|---|
  | win_small | -40.6 | -16.6 | -8.6 |
  | win_medium | -36.6 | -12.5 | -4.6 |
  | win_big | -32.8 | -8.7 | -0.8 |
  | win_epic | -28.3 | -4.3 | +3.7 |
  | win_max | -26.6 | **-2.6** | +5.3 |
  | spin | -16.4 | +7.6 | +15.5 |

  **Every win tier, win_max included, is heard under the unducked bed**, and spin.mp3 sits 10.2 LU
  above win_max. **R147's win ladder deepened this**: it could only attenuate (win_max is already
  peak-normalised), and `win_big` came down 16.2 dB. A base-game win at normal speed usually settles
  inside the spin duck, where epic and max clear the bed (a timing reading REPORTED by the 2.3
  verifier); feature totals, bought rounds and wins after
  an anticipation build meet the full bed. An owner listening ruling: raise the BASE win gains, lower
  the music default, or implement the win_max duck (specified in `docs/audio/AUDIO_TRUTH_MAP.md`
  section 4.4, still not implemented).
- **D6. `win_max` is 1.81 s** against the 5.0 s spec and the 2.6 s reveal: OPEN ART.
- **D7. Bet Replay.** The bed does start, on the replay's first tap: the module-load mute
  subscription (:193-196) calls `playBGM()`, which arms a click and keydown starter. A replayed
  feature never swaps to `bgm_tension`: in the game bundle only `App.svelte:632` writes
  `overdriveVisual`, and `ReplayMode.svelte` never binds it. A parity question for the owner.
- **D8. Silent by design or omission:** individual free-spin wins and Overdrive meter increments
  (`FreeSpinsPresentation.svelte` imports only `playReelStop`, `playFeatureEnter`, `playFeatureEnd`
  and `playRetrigger`, line 21); the retrigger ladder sounds reel stops only. Reusing existing cues
  needs call sites only.

---

## 2.4 Visual and animation truth

**Art manifest** (`docs/art/art_manifest_arc2.csv`, 48 rows), blob-compared at 618b711e and HEAD:

| Class | Rows | State at HEAD |
|---|---|---|
| REPLACE | 30 | **28 live, 2 HEAD-old**: SY-13 `symbols/tile_plate.png` and SC-03 `frames/frame-2.png`. All 28 were first replaced by `578a3a51`; 24 still carry its bytes. R137's record says "27 of 30"; its own operands give 28, record drift. |
| REGEN | 11 | 9 regenerated at f90d1d03 (R120), DOC-11 `ui/btn_features.png` new at 3f75b833, DOC-10 `ui/feature_button.png` unchanged since July (candidate refused by class; ledger R103-E5 unanswered). |
| DEAD | 6 | unchanged; 4 still ship in dist: `ui/hero_icon_96.png`, `ui/scene_character_car.png`, `ui/panel_balance.png`, `ui/panel_win.png`, **151,962 B together**. |
| KEEP | 1 | BR-01 `ui/hero_emblem_512.png`, unchanged, live in the splash. |

**Hero at rest: HeroIdle, frame 01 of `ui/hero/hero_crossed_idle_6f.png`.** `App.svelte:2270` mounts
`<SceneGroup haze={hazeLevel} />` with no `heroMode`; `SceneGroup.svelte:46` defaults it to `'idle'`,
and :96-99 draw HeroIdle, which maps the idle sheet at `HeroIdle.svelte:139`. `ui/scene_character.png`
appears only in the `{:else}` branch at `SceneGroup.svelte:99`, so the page never requests it (R145
observed this live), yet it ships (774,813 B).

**Path 1 (hero rest = scene_character.png): a one-line mount exists and is NOT proven safe, so per
the owner ruling it was not done.** `heroMode="static"` at `App.svelte:2270` would draw it, but it
unmounts HeroIdle, deleting the win unfold and the feature brace, and the rest pose would move:
silhouette IoU **0.95647** at alpha 128 and above (0.93313 at any coverage) against idle frame 01 at
the 206x407 render size, best 0.98632 after a 2 px vertical shift, feet 3.9 px higher by bounding box.
The instrument is calibrated: the same method reproduces R122's recorded 0.993 for the old 5f frame
against the 6f frame (0.99297), and self-IoU is 1.0. The IoU 0.9997 identity that
`SceneGroup.svelte` and `docs/art/hero_crossed_idle.provenance.json` still cite does not hold at HEAD
(0.95647 above); the 2.4a verifier measured 0.590 for the pair committed at R112 (REPORTED).

**Still wired:** the idle float (translateY only, 0 to -3 px over 5 s, `SceneGroup.svelte:245`, :275),
the 32-frame win unfold and the 16-frame feature brace (`HeroIdle.svelte:139-141`, stepped n-1 with
jump-none); `hero_idle_planted_gate` passes. **The Overdrive perimeter is removed** (218b1919); its
raster is still tracked (461,912 B) and pruned from dist (`frontend/vite.config.ts:262`).

**HUD tokens against neighbours** (probed on the shipped CSS, index-Dne4rl1D.css, in headless
Chromium): the lit WIN rail fills cyan (`--hud-accent`) but its running keyframe glows `#FF2EC4`
pink (the cyan glow shows only with the animation cancelled); in OVERBOOST the mini-player
FEATURES trigger draws a white border because `--sig-orange` is unset on it (the portrait trigger,
the control, resolves `#ff9a2e`); the paytable panel's rail fills cyan with a gold glow. The
FEATURES menu modal and the win breakdown still use the pre-R119 brushed-metal chrome, and the HUD
labels use the numeric face where the paytable uses the display face (REPORTED by 2.4b, with lines
in its verified claims). Each is a player-visible restyle, so none was changed here.

**Banner geometry:** no `1920` anywhere in `frontend/src` outside JSON fixtures, and none in the built
JS or CSS; the banner spans the 1280 stage.

**Known open art:**
- **SC-03 is open.** `frames/frame-2.png` is 800x640, drawn into 640x468 with `object-fit: fill`
  (`App.svelte:3315`): 0.800 x by 0.731 y. Needs art at 640x468 or a call-site change; owner ruling.
- **Homeless win overlays:** in the tracked `ui/win/` folder, 5 of 6 rasters have call sites and
  `overdrive_perimeter.png` has none. The historical untracked homeless set (R091, R097, R115 and
  `FX_SET_INTAKE_2026-08-25.md`) was **not reconciled** this session; the critic flagged it.
- **The FEATURES glyph is not a bolt:** a car grille on three layouts, a sliders glyph on the
  mini-player; every bolt belongs to the turbo control (REPORTED by 2.4b, verified).
- **Gauge hub: closes as not visible.** The shipped needle's hub disc fits a circle centred at
  (232.16, 231.99 to 232.14), r 24.0, within 0.2 raster px of the CSS pivot (`transform-origin: 50% 50%`
  on a 464 px square; the pre-R141 needle 59db1a08 was within 0.5). R141's "about 4 px" does not
  reproduce. The dial face's printed hub does sit about 2.5 raster px off, but the needle's opaque hub
  (alpha 255 within r 18) covers all 415 of its bright pixels at every angle from -110 to +110 degrees.

**Side finding: the repository-root `env/` Python (3.14.6 with numpy 2.2.5) silently overwrites
named arrays inside functions** (`x.sum()` of 200,000 ones reads 600,000 after `z = x + y`).
`scripts/assets/.venv` (numpy 2.5.1) and `tools/audio_forge/.venv` (Python 3.10, numpy 2.2.6, which
mastered every R146 and R147 encode) are clean on the same repros. Exposure is whatever runs under
`env/bin/python`.

---

## 2.5 Tooling and gates

**CI shape** (`.github/workflows/checks.yml`): 30 jobs, namely `what changed`, `static gates` (83 run
steps) and a 28-leg browser matrix. **Last main run: 36168381090, push on `0dd8105c`, 30 of 30.**

**Final-tree results for this branch:**

Recorded in the R147 section of `reports/SESSION_REPORT.md`, with the remote run on the pushed head. This file is committed before those runs, so they test it too; its own figures above do not depend on them.

**Gates failing for a known, accepted reason: none now.** audio_verify's take A failure is gone
(2.3). Locally, `dist_hygiene_gate` goes red on the build-info stamp whenever HEAD moves past the
last build; CI always builds fresh, so it is a local ordering rule only.

**No gate asserts a fact R146 or R147 made false.** Sound names occur only in `audio_verify.mjs`,
`dist_hygiene_gate.mjs` and `r043_replay_audio_proof.mjs`, and the last already expects `win_max`
at the wincap splash (R146). **Stale, but not made false by R146 or R147:**
- `frontend/scripts/typecheck_baseline.mjs:51` allows 36 warnings where svelte-check reports 3
  (ledger R097-F28).
- `reports/screens/r043-replay-audio/audio_trace.json` (committed evidence, d9819e32) records
  `win_epic` at the wincap splash. **Not regenerated:** the proof rewrites six committed PNGs beside
  it, and this session may stage no raster. Next action, in an evidence job:
  `FS_WRITE_EVIDENCE=1 node scripts/r043_replay_audio_proof.mjs` from `frontend/` after a build.
- `reports/qa/audio_verify_2026-07-13.json` says ALL CHECKS PASS about the July set.
- `frontend/scripts/stake_mark_gate.mjs:27` says 94 files ship; the gate counts 75 (comment only).

**Named historical bugs:**

| Bug | Status | Evidence |
|---|---|---|
| ALPHA_SNAP_FLOOR float compare | **OPEN** | `scripts/assets/assetforge/ingest.py:73` sets `2.0 / 255.0` (float64) and :266 snaps with a strict `<` on float32 alpha; float32(2/255) = 0.0078431377 > 0.0078431373, so alpha 2 is not cleared as :70 promises. Unchanged since d4378f21. |
| ingest JPEG quality on opaque full-size rows | **OPEN** | `quality=92, subsampling=0` hardcoded at `ingest.py:361`; argparse (:396-400) has no override; affects SC-01 and SC-02. |
| `--compare-against-shipped` | **OPEN** | 0 matches in any .py, .mjs, .js, .ts or .json. |
| `npm run assets` guard | **CLOSED for uncommitted work; residual on a clean tree** | The guard refuses while tracked theme files are modified. On a clean tree, `build.py` alone rewrites **18** tracked rasters that are not generator output (15 from `578a3a51`, h2 and m3 from R145 29f967c8, and `ui/gauge_needle.png`, R141's 0-degree ingest). Then `flame_jets.py`'s own guard refuses and prints "Nothing has been written." after build.py already has. With the override, 5 more (23). Derived from `scripts/assets/manifest.json` and each output's last commit; **not run**, because running it would rewrite them. |
| `master.py` overwrite guard (R146) | **CLOSED here; disarmed elsewhere** | `tools/audio_forge/master.py:297-314` refuses any row whose owner WAV is present unless `--july-sources`; the WAVs are gitignored (`.gitignore:81`), so in a fresh clone or worktree the guard sees no owner rows. |

---

## 2.6 Docs drift

Searched outside dated records for the five named patterns. **Fixed in this PR (live instructions
only; every dated record kept as written):**

| Pattern | Where | Fix |
|---|---|---|
| The four cues silent | `FreeSpinsPresentation.svelte` retrigger comment; `soundService.ts` pending-cue doc comment | now say live since R146 |
| Audio Stable Audio only, or in-house | `GAME_FACTS.md` audio bullet; `README.md` Licence and IP (second sentence); `SUBMISSION_DOSSIER.md` R146 audio paragraph (appended, per its own rule) | owner's stems plus one Stable Audio cue; audio_verify passes; take A parked |
| Shipped art in-house | `GAME_FACTS.md` pipeline bullet and external-art note; `COMPLIANCE_WATCH.md` Original IP (the re-check it ordered); `SUBMISSION_DOSSIER.md` section 8 note (appended; four stale 9c hashes named) | dated RE-VERIFIED notes naming `578a3a51` |
| OpenAI BARRED | `scripts/assets/assetforge/generate.py` docstring; `docs/records/reviews/REVIEW_TRACKER.md` ARC2-LICENCE row (appended SUPERSEDED note) | CLEARED since R099 for development-stage art |
| Old Spine ban | `docs/design/SPINE_ROBOT_RIG_SETUP.md` step 1 | the block is recorded as withdrawn by R109 |
| Made false by R147 itself | `docs/audio/AUDIO_TRUTH_MAP.md` (header note, gaps, feature_end, win_max, sections 4.4, 4.5 and 6); `WRS_MASTER_DOCUMENT.md` row and change log; `soundService.ts` playWin comment; sounds README (meters, seam, "quietest cue"); `reports/OUTSTANDING_LEDGER_2026-08-25.md` new section 1C | bought max win plays win_max; ladder figures per meter |
| Branch list (from 2.1) | `CLAUDE.md` BRANCHES | six kept on purpose, three awaiting the owner, session heads die on merge |

**Owner's to amend (legal or ruling text, not the builder's):** CLAUDE.md's Assets preamble ("All
visual and audio assets are produced in-house from vector masters", no amendment covers audio);
`README.md`'s first Licence sentence and `LICENSE` lines 5 to 6 (ownership of work that includes the
owner's stems of UNKNOWN licence, a Stability-licensed click and OpenAI art); COMPLIANCE_WATCH's
"Original IP: verified"; the evidence sentence of
`docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` row 5; the dated OpenAI ruling record
and `docs/licences/PROVIDER_GATE_2026-08-22.md`, which still read BARRED and are what
`provider_gate.json` points a reader at (a supersession pointer is a Fable call).

**Found, not fixed (outside 2.6's five patterns; carried to the next session):** stale hero comments
in `SceneGroup.svelte` (heroMode's mount line, the flipbook and 0.9997 claims) and
`frontend/scripts/scene_proof.mjs`; `docs/design/CHROME_PRIMITIVES.md` still names itself the
paytable's basis; `HUD_SHELL_TEMPLATE.md`'s "every row is now done"; the assetforge README's SC-03
ValueError (fixed in code at R103); the art manifest's `renders_in` citations; `RESKIN_BOUNDARY.md`'s
audio sizes; AUDIO_TRUTH_MAP's inventory durations and some line citations (its new header note
governs); older `soundService.ts` comments (the R115 one-caller notes and "0.4 vol"),
`ReplayMode.svelte`'s cited soundService lines, and `winCountUp.ts`'s importer note.

---

## 2.7 Security and hygiene

- **No secret in the tree, the history or dist.** 15 token patterns (AWS, Anthropic, OpenAI,
  GitHub, Slack, Google, private-key headers, Hugging Face, Replicate, Stripe live, GitLab, npm,
  PyPI), each first proven to fire on a planted control (15 of 15): 0 hits over the tracked tree
  read as text, 0 over all 1,692 reachable commits (`git log --all -G`), 0 literal key assignments
  in history, and 0 in `frontend/dist`. The history control (`ACCESS_KEY *=`) finds d57ffc3e.
  GitHub: public, secret scanning and push protection enabled, 0 alerts. Dependabot alerts are
  disabled (HTTP 403), so dependency posture is UNKNOWN.
- **One live hazard, S2-C142 (still open): `uploads/.env` is tracked** although `.gitignore:24`
  ignores `*.env`, and `uploads/aws_constants.py:7-10` loads AWS keys from it: the designed workflow
  pastes keys into a tracked file of a public repository. Both values are empty now and in both
  historical versions (d57ffc3e, 41b31642, upstream SDK code), so nothing has leaked.
- **Ignore gaps** (repository rules only, global excludes off): `.env.local`, `.env.production`,
  `.env.development`, `frontend/.env.production` and `scripts/assets/.env.local` are NOT ignored;
  `frontend/.claude/settings.local.json`, a per-machine file, is tracked (no secrets).
- **Required ignores hold:** output/ and output/imagegen/ (`.gitignore:75`), .scratch/ (:69), the
  sounds WAV masters (:81) and the owner's MANIFEST (:82); negative controls show the sounds mp3 and
  README are not ignored. 0 files tracked under any of them; 0 untracked-but-unignored files anywhere.
- **Large binaries:** 4,881 tracked files, 1,339,180,347 B; 268 over 1,000,000 B (562,030,914 B);
  `reports/screens` is 842,126,984 B, 62.9%, deliberate evidence. The legacy
  `frontend/public/assets/symbols` (66 files, 89,666,327 B) and `assets/videos` (8 files, 89,244,530 B)
  are pruned from dist and have no consumer in `frontend/src` except comments (`assets/videos` also
  holds one pipeline source, `bg_animated_loop.mp4`); they are **removal** candidates (git rm), not
  ignore candidates, and removal trims checkouts, not history. A 14,862,638 B screen recording of a
  third-party studio's game sits in `docs/reference/competitor-demos/` of a public repository.

---

## Phase 3 changes this audit caused, with restores

| Change | Commit | Restore |
|---|---|---|
| 50 merged session heads deleted from origin | (no commit) | `git push origin <tip>:refs/heads/<name>` per row of the 2.1 log |
| Live-document corrections (2.6) and the CLAUDE.md branch paragraph | this PR | `git revert` of the docs commit |

No raster, WAV, MANIFEST or .scratch file was staged; no maths, HUD geometry or asset_guard
change; no image generation; no kit.
