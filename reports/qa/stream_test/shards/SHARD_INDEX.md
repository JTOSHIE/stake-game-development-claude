# Wave 2 shard index

What each discovery squad covered and what state it is in. Rewritten at the
close of the recovery session (2026-07-29, `reports/briefs/FS_STREAM_TEST_RECOVERY_Prompt.md`)
to record the finished state rather than the salvage state it opened with.

Australian English, no em dashes or en dashes.

## Status: discovery COMPLETE, verification NOT RUN

47 shards. Every one of the 519 frames is read by at least one lens. **540
findings, none of them verified.** The adversarial pass did not run; see
`../LEDGER.md` for why that was a deliberate stop rather than an omission.

## Squad status

| Squad group | Lens | Shards | State | Coverage |
|---|---|---|---|---|
| `STC-*-A` / `STC-*-B` | Composition | 16 | **COMPLETE** | All eight en sessions, both halves, 26 frames each. 236 findings. |
| `STT-*-A` / `STT-*-B` | Typography | 16 | **COMPLETE** | All eight en sessions, both halves. 163 findings. |
| `STM-*` | Motion residue | 8 | **COMPLETE** | The 18 `transition_` frames of every en session, judged against their settled endpoints. 77 findings. |
| `STL-DE-*` / `STL-AR-*` | Localisation, all five channels | 4 | **COMPLETE** | `de-desktop` and `ar-desktop`, both halves. 42 findings. |
| `STV` | Voice, desktop modal and menu text | 1 | **COMPLETE** | The trial session's shard. 27 frames, 15 findings. |
| `STV-REST` | Voice, desktop in-play text | 1 | **COMPLETE** | The roughly 25 desktop frames `STV` did not read. 7 findings. |

Sessions: `desktop` 001 to 052, `laptop` 053 to 104, `popout-l` 105 to 156,
`popout-s` 157 to 207, `mobile-l` 208 to 259, `mobile-m` 260 to 311,
`mobile-s` 312 to 363, `stretch` 364 to 415, `de-desktop` 416 to 467,
`ar-desktop` 468 to 519.

## What the next session picks up

1. **The verification pass**, which is the whole of what remains before any
   fix is applied. 540 findings, shared-nothing, one adversarial verifier per
   finding told to REFUTE, defaulting to refuted when uncertain. Size it per
   convention (r): the recorded figure is about 3.1M subagent tokens for 41
   verifiers, so this is a job of its own and not a tail end.
2. **Start with the five clusters in `../LEDGER.md`.** Cluster 1 is reported by
   eleven independent squads across two lenses and seven viewports, so it is
   both the most likely to be real and the cheapest to settle first.
3. **`TR-104`'s remaining half is fix-ready** and was verified first-hand by
   the recovery session rather than by an agent. One line, one existing key.
   Details in `../LEDGER.md`.
4. **Do not re-run anything above**, per convention (q). All 47 shards are
   committed.

## The honest note on the roster

The trial session's squad roster was never recoverable from disk; only `STV.md`'s
own scope line survived. The roster above was DEFINED by the recovery session
from the five channels the original brief names, not reconstructed from a
record. This note is kept because the coverage figures are only checkable if the
reader knows which parts are evidence and which are this session's design.
