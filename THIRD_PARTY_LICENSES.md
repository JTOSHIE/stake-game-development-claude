# Third party licences

This repository contains components from the Stake Engine math SDK, which its authors
publish under the MIT licence precisely so that studios can build titles on it. Those
components remain under that licence and their notice is retained here as the licence
itself requires.

**Nothing in this file grants any right over We Roll Spinners' own work.** The original
game, its art, audio, frontend and maths package are covered by `LICENSE` at the
repository root, which grants nothing.

Australian English, no em dashes or en dashes.

---

## The MIT licensed components

Inherited from the Stake Engine math SDK when this repository was created from it. Paths
verified against `git ls-files` on 2026-07-29:

| Path | Tracked files | What it is |
|---|---|---|
| `src/` | 35 | The SDK core: calculations, state machine, events, win manager |
| `utils/` | 23 | SDK utilities |
| `optimization_program/` | 9 | The weight fitting optimiser |
| `tests/` | 7 | SDK tests |
| `uploads/` | 5 | SDK upload helpers |
| `setup.py` | 1 | The `stakeengine` package definition, author `CarrotRGS` |
| `stakeengine.egg-info/` | metadata | Build metadata for the above |

`games/` holds the SDK's directory convention. **`games/future_spinner/` is We Roll
Spinners' own maths package and is NOT third party**, notwithstanding that it sits inside
a directory the SDK defines.

## The licence, retained verbatim as MIT requires

MIT License

Copyright (c) 2025 Stake Engine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Why this file exists rather than the licence simply being deleted

The MIT text above was the repository's ROOT `LICENSE` from its first commits until
2026-07-29. It arrived with the SDK at fork time and was never revisited, so for the
repository's whole public life a maximally permissive grant, naming Stake Engine as the
copyright holder, sat at the root of a tree that had come to contain an entire original
commercial title.

**It could not simply be deleted.** Substantial portions of the MIT licensed SDK are still
present, listed above, and the licence's own terms require the notice to be retained with
them. Deleting it would have breached the licence the project relies on. So it is scoped
here rather than removed, and the root `LICENSE` now states the position for the original
work.

Found by the Session 2 compliance sweep and recorded as a decision for the owner rather
than resolved by a builder, since ownership of the work is not a builder's call.
