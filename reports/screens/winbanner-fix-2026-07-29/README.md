# WinBanner fix, before and after, 2026-07-29

Proof for **TR-117** (ledger MID-02 plus TR-104's remaining half), per convention (h).

| Frame | Renders |
|---|---|
| `before_en_015_desktop_bigwin_settled.png` | `16x BET`, ASCII `x` (U+0078) |
| `after_en_015_desktop_bigwin_settled.png` | `16× BET`, multiplication sign (U+00D7) |
| `before_de_430_bigwin_settled.png` | `GROSSER GEWINN` beside an English `16x BET` |
| `after_de_015_bigwin_settled.png` | `GROSSER GEWINN` beside `16× EINSATZ` |

The `after` frames are freshly captured from a production build of the fix, not
re-rendered from the old ledger, per `FULL_AUDIT_METHOD.md` 2.2. The full 52-frame
captures they were taken from are regeneratable and were moved to the gitignored
`.evidence-scratch/`; these four are the evidence.

Both halves were verified first-hand from source and frames rather than by an agent, so
neither went to a verification panel. See `reports/qa/stream_test/CLUSTERS.md`.
