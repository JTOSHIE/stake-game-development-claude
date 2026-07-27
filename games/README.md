# games/

**`future_spinner/` is the shipping maths package. It is the only one, and it is locked.**

This repository is a fork of the Stake Engine `math-sdk`, which ships six `0_0_*` sample
games plus a `template/` and a `fifty_fifty/` demo. Those nine entries were removed on
2026-07-28 (TR-088, owner ruling) so that a reviewer cloning this repository sees a studio
with one game rather than a forked SDK carrying ten maths packages. Nothing referenced them
outside the `Makefile`'s own `test_run` target, which went with them.

Not-for-release prototypes and forks live on their own branches, never here: a second maths
package sitting beside the shipping one is the stale-artefact misread that has previously
cost a star at external audit. See `CLAUDE.md`, "Reference / prototype branches".
