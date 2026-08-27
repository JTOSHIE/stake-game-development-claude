# Submission record: R137 owner test kit

**Not uploaded.** This record exists so that when the owner does upload, the artefact on the
portal can be tied to a commit. The upload itself is the owner's action; no session performs it.

## The artefact

| field | value |
|---|---|
| kit path | `~/Desktop/FS_UPLOAD_KIT` (the fixed single-use path, convention (s)) |
| kit version | v10 |
| **source SHA** | `578a3a51444f1f08a6def5bb9426abb3055e4305` |
| branch | `claude/r137-placeholders-kit` |
| built at | 2026-08-27T19:59:42Z |
| upload payload | 102 files, 23,455,987 bytes |
| whole kit on disk | 109 files, 24,842,865 bytes (payload plus the two READMEs and BUILD_INFO) |
| **kit manifest sha256** | `e5a879a40471928095d8d5033b6b42b6d53ca8fbabd1ae34a71aa10845129e4c` |
| timestamp of portal upload | *(to be filled by the owner)* |

The kit is a FOLDER, not an archive, so its single sha256 is taken over the sorted per-file
manifest: `find . -type f ! -name .DS_Store -print0 | sort -z | xargs -0 shasum -a 256` then
sha256 of that listing. Reproducible from the kit alone.

## What is in it

- `02_frontend_upload/` the built bundle, which is what goes to the portal
- `03_branding/` the branding set
- `00_READ_ME_FIRST_SECOND_VISIT.md` and `README.md` the owner's own instructions
- `BUILD_INFO.json` version, commit, build time, file and byte counts, and the four gate
  results the builder ran

## What is NOT in it, stated plainly

**AUDIO IS INCOMPLETE.** The kit ships TWELVE sound files. FOUR cues are wired in the code and
have no stem, so those moments are silent:

| cue | fires when | expected path | file |
|---|---|---|---|
| `feature_enter` | the Overdrive feature begins | `sounds/feature_enter.mp3` | **MISSING** |
| `feature_end` | the feature-end celebration | `sounds/feature_end.mp3` | **MISSING** |
| `retrigger` | 3+ scatters during free spins | `sounds/retrigger.mp3` | **MISSING** |
| `win_max` | the 5,000x cap | `sounds/win_max.mp3` | **MISSING** |

Confirmed by direct filesystem check, not inferred from the audio map. No silence is being
described as finished sound, and no stem was generated: audio was out of scope for R137 and
the blocker is a licence decision that has been the owner's since R125.

## The dirty-tree condition, and that it is cleared

The owner's note for this session was: *"Tree is dirty. Kit is not ready until that is resolved
honestly."* It is resolved. `dist/build-info.json` now records `"cleanTree": true`, and
`dist_hygiene_gate` passes, where it had failed on exactly that field in R134 and R135. The
resolution was honest rather than cosmetic: 28 of the 30 placeholders were adopted and
committed, and the two that fail the fence were REFUSED and reverted to HEAD rather than
committed to make the tree look clean.

## Gates behind this kit

Run locally against this exact commit, on a clean tree:

- **static gates: 82 of 82 green**
- **browser matrix: 28 of 28 green**, including `splash calm`, the leg R135 pushed a red on
  because its local runner covered only the static job
- the kit builder's own four refusal checks: dist hygiene, dash gate dist scan, mock
  containment, asset references

## Not done here

The owner uploads. No session uploads. The portal timestamp above is left blank deliberately.
