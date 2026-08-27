R137: COMMIT PLACEHOLDERS + SUBMISSION KIT + PRE-UPLOAD SWEEP
Sole live brief. Unattended. Review lane. High care. Overnight. Use subagents.
Owner ruling for this session:

* The 30 working-tree placeholders may now be committed if they pass ingest and look-pass gates.
* After they match HEAD, build a test kit the owner can upload / run locally.
* Audio stems are out of scope. Do not invent cues. Do not ship silence as finished sound.
* Idle stays planted. Feature perimeter stays gone. Live text stays live.

THE FENCE

* No new image generation.
* No audio generation.
* No idle sway / dissolve / glance revival.
* No feature-border revival.
* Do not weaken asset guards.
* Do not fake reviewer scores or tick “51/51”.
* Do not change locked maths.
* Do not commit a raster that fails aspect, alpha, or ingest.
* Emblem / BR-01 KEEP stays KEEP.
* Kit packaging is forbidden until the placeholder set that is intended to ship is committed and the working tree’s shipped rasters match HEAD.

PRECONDITIONS

1. On main, up to date. Confirm R135 / PR #175 state.
2. Save this brief verbatim first.
3. Fingerprint the current dirty rasters before any file operation.
4. Read CLAUDE.md, HUD_SPEC.md, RESKIN_BOUNDARY.md, docs/art/art_manifest_arc2.csv, the latest placeholder map, AUDIO_TRUTH_MAP.md, and the project’s Stake / approval / submission docs.
5. Rebuild the local static-gates runner. Also list every browser-matrix job (R135 missed splash-calm because the runner was static-only). Both must be runnable locally before push.
6. Confirm arc2-baseline still resolves.

OWNER SCREENSHOT NOTES (treat as look-pass, not code truth)

* Epic banner chrome is accepted in direction.
* HUD WIN matching the banner on settled epic is accepted.
* During feature play, HUD WIN at $0 with feature TOTAL live is accepted.
* Gauge still looks wrong / old. Prefer the needle-free face + single needle if those files pass ingest.
* Tree is dirty. Kit is not ready until that is resolved honestly.

WORKSTREAM 0 — INVENTORY THE DIRTY SET
List every modified / untracked raster under the theme and anywhere else.
For each file:

* path
* HEAD vs working size / hash
* manifest id or NONE
* shipped target dimensions
* candidate source if a scratch master exists
* KEEP / REPLACE / REGEN
* WIP-clobber risk

Separate:

* A. intended ship set (symbols, plate, backgrounds, gauge, UI that the live game actually loads)
* B. paytable-only / dead / no-row
* C. forbidden (emblem KEEP, generated-not-cleared, wrong aspect)

Do not git add anything in this workstream.
WORKSTREAM 1 — INGEST, THEN SWAP
Use the real ingest path. No raw drop-in that bypasses aspect / alpha / despill.
Accept only if:

* exact target aspect or documented non-square target
* alpha clean / key handled
* 64px silhouette still reads for symbols
* H1 layers still register
* M2 / L3 idle headroom still holds where those contracts exist
* gauge face has zero baked needles; needle is a separate raster at the rest angle
* backgrounds stay a matched pair if SC-01 / SC-02 must crossfade

Refuse and record WRONG-SPEC rather than squash.
After accepted swaps, the shipped rasters that are meant to go in the kit must be staged explicitly by path.
Commit message must name provider + ticket 456254 + “owner-authorised placeholder adoption”, and must not sweep .scratch or output/imagegen.
Re-fingerprint. Working tree for shipped theme rasters should then match the commit.
WORKSTREAM 2 — LIVE HUD / CSS CONTROLS
If a swapped raster is only used in the paytable guide, say so.
Do not rewrite the live HUD from rasters unless a control already loads a theme PNG.
Regen interface-guide icons only after the tree is clean enough for asset_guard --require-clean, or use the documented override after proving the script writes only the nine guide files.
WORKSTREAM 3 — VIEWPORT MATRIX
Prove the game at the layouts Stake and this repo actually ship:

* 1280×720 desktop
* 1024 and one mid width
* 390×844 / 430 portrait
* landscape phone if the project has a compact-landscape HUD
* social / replay / embedded if those routes exist

For each:

* no clipped amount
* no overlapping SPIN / BET / BALANCE
* banner does not bury the HUD row
* hero absent in portrait is acceptable if that is the spec
* feature column readable
* paytable usable
* no console errors
* tap targets still meet the project’s current 44px rule

Fix layout bugs. Do not “scale the whole stage until it fits” if that breaks HUD_SPEC geometry.
WORKSTREAM 4 — LOCALES
Run every shipped locale, including RTL if present.
Prove:

* HUD labels
* banner BIG / MEGA / EPIC / MAX strings
* paytable
* feature title / TAP TO CONTINUE / FEATURE COMPLETE
* no baked English in celebration art
* no overflow that clips translated strings
* RTL does not break the HUD plates

Fix wrapping / font / direction bugs. Do not rewrite copy unless a string is truncated by CSS.
WORKSTREAM 5 — SOCIAL / REPLAY / DEMO MODES
Trace every mode the kit must support:

* normal play
* replay / Bet Replay
* social / demo if flagged
* muted boot
* reduced motion
* feature buy
* max-win collect

Prove money surfaces stay non-negative.
 Prove WinDisplay replay count-up uses the shared clamp.
 Prove a muted-then-unmute path does not leave BGM dead if that hook exists.
 Do not add audio files.
WORKSTREAM 6 — STAKE / PROJECT CHECKLIST ALIGNMENT
Do not fill reviewer stars.
Build a readiness table from the project’s own approval / submission / dossier docs and the platform’s published common-fail list:

1. No emoji / badge / gradient-wash tells in shipped art
2. One visual language across symbols, scene, frame, UI
3. Animations: idle planted, win/feature present, no ticking hero
4. Sound: list missing stems honestly; kit may ship with current audio
5. Maths / RTP / max-win cap untouched
6. Locale coverage
7. Reduced motion
8. Replay / social
9. HUD values live, not baked
10. Dist budget ≤ 25MB
11. No console errors / missing assets
12. Version / kit stamp clean (not dirty)
13. Secrets / provider marks
14. Feature presentation does not cover hero/car with the old perimeter
15. Win banner live text + through-band art
16. Gauge needle count = 1
17. Interface guide matches live controls
18. Kit hash / README source SHA recorded

If the repo has an explicit 51-item internal list, walk that list and mark PASS / FAIL / OWNER / N/A with evidence.
 If it does not, say so and use the alignment table above. Never invent a 51/51 score.
WORKSTREAM 7 — BUILD THE OWNER TEST KIT
Only after shipped rasters are committed and the theme tree is clean.
Produce the real kit the owner uploads / sideloads:

* filename
* sha256
* source SHA
* byte size
* included / excluded paths
* note that audio is incomplete
* note dirty-tree stamp must be gone

Follow the project’s existing pack script. Do not hand-zip random folders.
Write the submission-record stub the conventions already require:

* kit filename
* kit sha256
* source SHA
* timestamp placeholder for the owner’s portal upload

Do not upload. The owner uploads.
WORKSTREAM 8 — QA BATTERY
Must pass locally, including browser-matrix jobs that burned R135:

* static gates
* splash calm
* replay contract
* money-negative gate
* hero idle planted
* raf clock mixing
* count-up steady
* css liveness
* dist hygiene / budget
* locale smoke
* 1280 + portrait + one narrow
* feature entry / feature-end lockstep
* ?mockCategory=super_win_small
* max-win collect
* reduced motion
* interface guide vs live FEATURES control

If a browser job is too long for one loop, run it, record the SHA, do not skip it.
WORKSTREAM 9 — ADVERSARIAL PASS
Attack:

* rasters staged that are not the intended ship set
* ingest bypass
* kit built while dirty
* emblem replaced
* overclaimed 51/51
* silent audio described as complete
* layout pass that only tested 1280
* gates that still probe reconstructions

CLOSE
Report:

* how many rasters committed / refused
* gauge needle count on the shipped face
* kit filename + sha256 + source SHA + size
* viewport / locale / mode matrix
* alignment table
* remaining OWNER list: audio stems, any refused art, SC-03 if still open

PR on review lane. Owner look-pass of the kit is the next human step. Audio is the session after that.
