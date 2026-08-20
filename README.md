# Future Spinner

A 5x4, 1,024-ways video slot with a free-spins feature, built by **We Roll Spinners**
for the Stake Engine platform.

---

## The game

**Overdrive Free Spins.** Three, four or five scatters award 8, 12 or 16 free spins and
pay an instant 1x, 3x or 10x total bet. During free spins an Overdrive meter starts at 1x
and rises by 1x after every winning spin, applied to all subsequent free-spin wins and
never resetting. Three or more scatters during the feature retrigger it for five more
spins and pay their instant award at the current meter.

The game is **stateless**: a round resolves completely within one server response. There
is no jackpot, no gamble, no continuation and no early cashout.

### Five modes, one RTP

| Mode | Name | Cost | Volatility |
|---|---|---|---|
| `base` | Normal | 1.0x | standard |
| `cruise` | Cruise | 1.0x | low |
| `antelite` | OVERBOOST | 1.25x | ante, raised trigger rate |
| `bonus` | Buy Overdrive | 100x | guaranteed feature entry |
| `super` | NITRO OVERDRIVE | 400x | meter pre-revved to 5x |

**RTP is 96.35% in all five modes.** Maximum win is capped at 5,000x in every mode.
Base-mode hit rate is 29.11%, weighted volatility 17.28x, and the feature triggers once
in 184.7 spins.

Full figures, including the per-mode tables and their verification, are in
[`GAME_FACTS.md`](GAME_FACTS.md) and [`SUBMISSION_DOSSIER.md`](SUBMISSION_DOSSIER.md).

---

## Technology

**Frontend.** Svelte 5 and TypeScript, built with Vite. PixiJS drives the reel and
particle layers. There is no runtime framework beyond that, and no external CDN: fonts are
self-hosted through `@fontsource`, and the production bundle is fully self-contained.

**Maths.** Python, built on the Stake Engine `math-sdk`. The simulation stage is
deterministic and seeded; published lookup tables are frozen and are never regenerated
outside a sanctioned pass.

**Money.** All currency arithmetic is integer micros, with zero float tolerance. One
display unit is 1,000,000 micros, and there is exactly one declaration of that constant in
the codebase.

**Internationalisation.** Sixteen locales, with a parallel social-casino vocabulary that
switches on the platform's own `social` flag or a virtual currency code. Screen-reader
text is translated on the same footing as visible text.

### Layout

```
frontend/          Svelte + PixiJS client, its own scripts/ holding the verification suite
games/             the maths package: config, simulation, and the published lookup tables
tools/             repository-level verification, including the books/lookup equality proof
docs/              platform documentation mirror, records, and staging protocols
reports/           QA evidence, session reports, and the archive of briefs and handovers
design-system/     brand, tile and asset masters
```

---

## Verification

Correctness is held by gates rather than by convention. Every pull request runs a static
suite covering type safety, dead wiring, integer-micros discipline, money-path constant
drift, locale completeness, social-safe accessibility strings, the authenticated bet
ladder, responsible-gambling enforcement, modal safety, live event schema alignment and
the currency display contract.

Beyond the static suite, browser-driven proofs are committed as evidence under
`reports/qa/`, and the maths package carries its own independent verification:

- **Book-to-lookup equality** is proven for **every row of every mode**: 500,000 rounds,
  4,455,829 assertions, zero failures. See `tools/verify_books_lookup_equality.py` and
  [`BOOKS_MANIFEST.md`](BOOKS_MANIFEST.md).

---

## Repository conventions

Working practice, the locked-file policy and the standing conventions live in
[`CLAUDE.md`](CLAUDE.md). Live platform requirements and the dated documentation mirror
live in [`COMPLIANCE_WATCH.md`](COMPLIANCE_WATCH.md).

Historical briefs, handovers and superseded documents are retained under
`reports/archive/`, each with its own index. Nothing is deleted.

---

## Licence and IP

All game design, artwork, audio and code in this repository are original works of
We Roll Spinners. The visual and audio assets are produced in-house from vector masters.

Every mark in the game is We Roll Spinners' own, with the single exception the platform
itself requires: the General Disclaimer shown on the rules screen is Stake Engine's own
mandated wording, shipped byte-exact as the platform specifies, and it closes with the
platform's mark. That mark is carried by mandate, not adopted. No other Stake branding
appears in any shipped asset or string.

The repository carries no open-source licence grant: it is published for platform review
and audit, not for reuse. See `LICENSE`, which grants nothing over that original work.

**Third party components.** This repository was created from the Stake Engine math SDK,
which its authors publish under the MIT licence so that studios can build titles on it.
Those components remain MIT licensed and their notice is retained verbatim at
`THIRD_PARTY_LICENSES.md`, which lists exactly which paths they cover. That grant reaches
the SDK and nothing else. Note that `games/future_spinner/` is We Roll Spinners' own maths
package despite sitting inside a directory the SDK defines.
