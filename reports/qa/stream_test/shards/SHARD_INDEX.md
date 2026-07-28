# Wave 2 shard index

What each discovery squad covered, what it did not, and where the remaining
surfaces are. Written by the recovery session (2026-07-28) as JOB 2 of
`reports/briefs/FS_STREAM_TEST_RECOVERY_Prompt.md`, before any new discovery
ran, so the resume state is committed rather than remembered.

Australian English, no em dashes or en dashes.

## The honest note on the roster

**The prior session's squad roster is not recoverable from disk.** Only one
shard reached the working tree, and the only surviving record of any squad's
assignment is `STV.md`'s own `scope:` line. The roster below is therefore
DEFINED by this session from the five channels the brief names
(`reports/briefs/FS_STREAM_TEST_Prompt.md`, WAVE 2: composition, typography,
motion residue, localisation, voice), not reconstructed from a record. The
`ST<lens-initial>` prefix scheme is inferred from `STV` and is the one thing
here the prior session did fix.

Stating this rather than presenting a tidy roster is the point: an invented
roster presented as a recovered one would make every coverage figure below
unverifiable.

## Frame set

519 frames, ten sessions, catalogued in
`reports/screens/stream-test-2026-07-28/MANIFEST.json`.

| Session slug | Viewport | Lang | Frames |
|---|---|---|---|
| `desktop` | 1200x675 | en | 52 |
| `laptop` | 1024x576 | en | 52 |
| `popout-l` | 800x450 | en | 52 |
| `popout-s` | 400x225 | en | 51 |
| `mobile-l` | 425x812 | en | 52 |
| `mobile-m` | 375x667 | en | 52 |
| `mobile-s` | 320x568 | en | 52 |
| `stretch` | 1920x800 | en | 52 |
| `de-desktop` | 1200x675 | de | 52 |
| `ar-desktop` | 1200x675 | ar | 52 |

## Squad status

| Squad | Lens | Shard | State | Last known coverage |
|---|---|---|---|---|
| **STV** | Voice: strings judged as written prose | `shards/STV.md`, 20,358 bytes | **PARTIAL** | `desktop` (en) text surfaces only. 27 frames read of 519. 15 findings (STV-01 to STV-15), four KNOWN matches, explicit signed absences. Nine other sessions unread by this lens. |
| **STC** | Composition: off-balance, cramped or dead space | none | **PARTIAL, zero coverage** | No shard on disk. No frame read. |
| **STT** | Typography: case, weight, spacing, family, numbers that shimmy or clip | none | **PARTIAL, zero coverage** | No shard on disk. No frame read. |
| **STM** | Motion residue: wrong overlap, pops, elements caught mid-teleport | none | **PARTIAL, zero coverage** | No shard on disk. No frame read. The 208 `transition_` frames are this lens's primary material and are entirely unread. |
| **STL** | Localisation: English words and LTR artefacts on localised frames | none | **PARTIAL, zero coverage** | No shard on disk. `de-desktop` and `ar-desktop`, 104 frames, entirely unread. |

**Aggregate: 27 of 519 frames read by any lens, 5.2 per cent.** One lens of
five is part-run; four have not started.

## What STV's coverage note tells the resuming squads

Read `shards/STV.md` before auditing any `desktop` frame. Its scope line names
the exact surfaces it read and its closing section signs two explicit
absences (the mode-name casing, and the `H1`/`M3`/`L2` symbol ids) that are
deliberate and must not be re-reported as findings. Its KNOWN matches already
attach frame evidence to `Q-26`, `Q-16 park`, `Q-34` and `Q-07`, so those rows
want fresh evidence from OTHER sessions rather than a repeat from `desktop`.

STV also leaves a note the localisation squads are the only ones who can
answer: several strings it recorded under the Q-16 park now have keys in
`prose.ts`, and an en-only session cannot tell a keyed string from a hardcoded
one. That question is assigned to STL.

## Remaining work, as JOB 3 will run it

Twelve discovery squads under workflow-container orchestration, one coherent
surface each per convention (r), each reading this index and the existing
shard's coverage notes first and auditing only what remains:

| Squad | Sessions |
|---|---|
| `STC-DESK`, `STT-DESK`, `STM-DESK` | `desktop`, `laptop`, `stretch` |
| `STC-POP`, `STT-POP`, `STM-POP` | `popout-l`, `popout-s` |
| `STC-MOB`, `STT-MOB`, `STM-MOB` | `mobile-l`, `mobile-m`, `mobile-s` |
| `STL-DE` | `de-desktop` |
| `STL-AR` | `ar-desktop` |
| `STV-REST` | the seven en sessions STV did not read |

Consolidation target for every shard: `reports/qa/stream_test/LEDGER.md`.
