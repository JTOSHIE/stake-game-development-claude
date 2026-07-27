# games/

**`future_spinner/` is the shipping maths package. It is the only one, and it is locked.**

This repository is a fork of the Stake Engine `math-sdk`, which ships six `0_0_*` sample
games plus a `template/` and a `fifty_fifty/` demo. Those nine entries were removed on
2026-07-28 (TR-088, owner ruling) so that a reviewer cloning this repository sees a studio
with one game rather than a forked SDK carrying ten maths packages. The `Makefile`'s own
`test_run` target went with them.

**What went with them, found by a second reference check after the deletion and fixed
2026-07-28.** The first check searched three of the nine names and reported clean; a wider one
found six upstream developer utilities under `utils/` whose example defaults named the
samples. Four were executable defaults that would have failed on first run
(`decompress_zstd.py`, `analysis/challenge_sheets.py`, `search_tool/forcetool_example.py`,
`merge_luts/merge_lookups.py`) and two were documentation only (`get_file_hash.py`'s usage
block, a commented line in `analysis/plot_distribution.py`). All are repointed at
`future_spinner`, **except `merge_luts/merge_lookups.py`, which WRITES merged lookup tables**
and is therefore left explicitly unset with a comment, for the same reason the Makefile's
`test_run` was deleted rather than repointed: defaulting a writer at the locked package is
how frozen truth gets overwritten by accident.

The `docs/math_docs/` pages still describe the samples. They are upstream SDK documentation
and are left as they are rather than rewritten; this note is the pointer that the packages
they describe are no longer in this fork.

Not-for-release prototypes and forks live on their own branches, never here: a second maths
package sitting beside the shipping one is the stale-artefact misread that has previously
cost a star at external audit. See `CLAUDE.md`, "Reference / prototype branches".
