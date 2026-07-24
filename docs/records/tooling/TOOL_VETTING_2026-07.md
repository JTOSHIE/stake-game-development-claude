# Tool vetting, 2026-07-25

Standing discipline applied: everything cloned to `~/sandbox/stake-tools/`, code
reviewed before anything was run, licence and real-money-gambling compatibility
recorded, and **nothing adopted or installed into the repository**. Every verdict
below is a recommendation awaiting a Fable ruling.

Sandbox location: `~/sandbox/stake-tools/` (outside the repository, not committed).

## Summary

| # | Tool | Licence | Ran it | Verdict |
|---|---|---|---|---|
| a | Stake-Dev-Tool/stake-dev-tool | MIT, file present | no | **RECOMMEND, self-hosted only** |
| b | StakeEngine/ts-client | ISC declared, no LICENSE file | no | **DO NOT ADOPT as a dependency. Mine it as a reference.** |
| c | StakeEngine/docs mcp-server | MIT declared in its package.json | **yes, built and ran** | **DO NOT ADOPT as a docs authority. Fast-track reversed, see below.** |
| d | mnemoo/tools | **NONE. All rights reserved** | no, deliberately | **CANNOT ADOPT. Reimplement the concept in-house.** |
| e | egorfedorov/claude-context-optimizer | MIT, file present | no | **DEFER. No need established.** |

---

## (c) StakeEngine/docs mcp-server. FAST-TRACK REVERSED.

The brief fast-tracked this as adopt-lean, "install and run it locally so builder
sessions can query live official docs". I installed it, built it and ran it. **It
does not serve live docs, and the content it does serve is materially wrong on the
exact figures this project is governed by.**

### Setup, as requested. It works.

```
cd ~/sandbox/stake-tools/stakeengine-docs/mcp-server
npm install
npx tsx scripts/build-index.ts     # Found 88 .svx files -> data/docs-index.json
npx tsc                            # -> dist/
node dist/index.js                 # stdio MCP server
```

Handshake verified. Server identifies as `stake-engine-docs` v1.0.0 and exposes four
tools: `search_docs`, `get_page`, `list_pages`, `get_section_tree`.

Security review before running, 876 lines total: **no network calls, no
`child_process`, no `exec`, no runtime filesystem writes**. The only write in the
codebase is `build-index.ts` emitting the index at build time. Clean, small, and
does exactly what it says.

### Why it must not be adopted as a docs authority

`build-index.ts` walks `../../src/routes` for `+page.svx` files. The index is built
**offline from the repository's own content**. There is no fetch. "Live official
docs" is not what this serves; it serves a snapshot of a repository whose last commit
is **2026-03-17**, four months stale, and which Part 1 of this pass proved is also
structurally diverged from the deployed site.

Measured against the built index:

| Term | In the index |
|---|---|
| `90.0%` and `98.0` (the OLD RTP range) | **YES** |
| `96.70` (the ACTUAL current ceiling) | **no** |
| `CVaR` | **no** |
| `Expected Tail Liability` | **no** |
| `Maximum Exposure` | **no** |
| `4.2GB` / file size restrictions | **no** |
| route `math-verification` (live) | **no** |
| route `math-requirements` (stale) | yes |

Queried directly, `search_docs("CVaR expected tail liability maximum exposure")`
returns three irrelevant pages with scores of 5, 4 and 4. It has no knowledge that
the automated bet-level limits exist at all.

**The concrete hazard.** A builder session asking this server for the RTP ceiling is
told **90.0 to 98.0 percent**. We ship at 96.3500 percent precisely because the real
ceiling is 96.70. An agent trusting that answer would conclude we have 1.65pp of
headroom when we have 0.35pp, and would see no reason the CVaR, ETL or exposure
limits need considering, because as far as it knows they do not exist. `CLAUDE.md`
already records that a stale artefact sitting beside the live one cost a star at
external audit. This is that same failure mode, wired directly into the builder's
context.

### Recommendation

1. **Do not** register this MCP server as a documentation source for builder
   sessions in its shipped form.
2. It remains genuinely useful for **slow-moving structural material**: math SDK
   architecture, game format, event structure, RGS endpoint shapes. Those have not
   materially changed and the tool is a fast way to search them. If adopted for that,
   it must carry an explicit scope note: **never the authority on approval criteria,
   limits, or anything in COMPLIANCE_WATCH.md.**
3. **The genuinely attractive option.** `build-index.ts` is content-source agnostic:
   it walks a directory for `.svx` files. Pointing it at **our own dated live mirror**
   (`docs/stake-engine-live/`) instead of the upstream repository would give us an
   MCP server serving the docs we actually verified, on the date we verified them,
   with our own delta notes alongside. That inverts the tool from a staleness hazard
   into an enforcement mechanism for convention (d). It is a small piece of work and
   I recommend it as the adopt path, but it is a change of purpose, so it needs a
   Fable ruling rather than a quiet adoption.

Licence: `mcp-server/package.json` declares MIT. Note the **parent repository has no
LICENSE file at all**, so the MIT claim exists only as a package field. For a
build-time dev tool that is a low practical risk, but it should be recorded rather
than assumed.

---

## (a) Stake-Dev-Tool/stake-dev-tool. RECOMMEND, self-hosted only.

Priority candidate, and it earns the priority.

**Licence: MIT confirmed.** `LICENSE` present, "MIT License, Copyright (c) 2026
simnJS". MIT carries no field-of-use restriction, so real-money gambling use is
permitted. Third party, explicitly non-affiliated with Stake (the most recent commit
is literally a non-affiliation notice on the login page), actively maintained
(2026-07-23).

Architecture: one Rust engine, three surfaces. Desktop app, hosted web workbench, and
share links.

### What it would replace in our workflow

| Their feature | What it displaces here |
|---|---|
| Drop-in Rust RGS speaking the wallet contract, fed directly from `index.json`, lookup tables and zstd books | `rgsService.ts`'s dev mock. This is the big one: a **real** authenticate response means real bet levels, real currency and real jurisdiction flags, which is exactly the fidelity JOB 2's bet-level and currency conformance work has been simulating by hand |
| Multi-resolution test view, 7 built-in resolutions plus custom, each frame its own session, live SSE event stream | The manual eyeball half of our per-profile Playwright sweeps. It does **not** replace the asserts in `portrait_layout_conformance.mjs` or `hud_banner_spec_check.mjs`, which are machine-enforced specs and must stay |
| Force, replay, bookmark by `(mode, eventId)`, auto-picking min/avg/max per mode | Substantial overlap with `REPLAY_TEST_EVENTS.md` and `docs/REVIEW_EVENTS_PLAN.md`, including the same auto-selection idea as (d)'s Event Finder |
| Share links: a real hosted instance on its own subdomain, real server-side RGS | The "LAN preview URL for the owner" step at the end of JOB 1. Josh is frequently phone-only, so a real link beats a LAN URL substantially |
| Math revisions: immutable snapshots, content-addressed dedup, automatic per-push changelog (RTP per mode, max win, modes changed) | Nothing we have. This is a genuine addition and it aligns well with the frozen-tables discipline |

### The condition, and it is not negotiable

**Cloud and share links would upload our frozen lookup tables to a third party.**
Those tables are the commercially sensitive core of the product, they are frozen
truth under `CLAUDE.md`, and the vendor's own pitch is that hosting is the paid
product. Their "your math files never leave the server" means *their* server.

The **self-hosted Docker route is therefore the only acceptable deployment**, and it
is fully supported with every feature included: one Linux box, Docker, Postgres and
Caddy, via `deploy/docker-compose.prod.yml`.

Egress review of the Rust engine found no analytics or telemetry SDKs (no PostHog,
Sentry, Mixpanel, Amplitude, GA). Real outbound hosts are tied to explicit opt-in
features: `discord.com` and `api.github.com` are OAuth login providers for the cloud
server, and `api.github.com` is additionally used by the desktop app to **publish
preview builds to GitHub Pages**.

That last one is worth stating plainly: the desktop app contains a path that
publishes a build to a public GitHub Pages site. It must never be pointed at our
repository or our build without an explicit owner decision.

### Recommendation

Adopt for the dev loop, **self-hosted only**, with the cloud and share-link surfaces
switched off until the owner rules on whether our math may leave the machine. Trial
it against the existing publish files without displacing any current gate: the
Playwright asserts remain the source of truth for conformance.

---

## (b) StakeEngine/ts-client. Do not adopt as a dependency. Mine it as a reference.

Official beta SDK, `stake-engine` v0.1.32, last commit **2025-10-26**, nine months
old. 666 lines across four files. Zero runtime dependencies.

**Licence: ISC declared in `package.json`, but there is no LICENSE file in the
repository.** For an official first-party package that is a documentation gap rather
than a real risk, but it is recorded rather than assumed.

**Harness fit: poor, and adopting it would be a regression.** `rgsService.ts` is a
**hard-locked file** under `CLAUDE.md` and already implements this contract, plus
four owner-sanctioned passthroughs the SDK does not have (bet levels published to
`rgsBetLevels`, selected bet mode in `play()`, jurisdiction flags published to
`jurisdictionFlags`, and raw round events published to `lastRoundEvents`). Swapping
in a nine-month-old beta SDK would mean a locked-file rewrite to lose functionality.

**Where it is genuinely valuable is as an independent cross-check**, and it earned
its keep immediately in this pass. Its `helpers.ts` carries a first-party currency
metadata table:

```
XGC: { symbol: 'GC', decimals: 0, symbolAfter: true },
XSC: { symbol: 'SC', decimals: 2, symbolAfter: true },
```

Three findings fall straight out of that, all feeding Part 3:

1. **`symbolAfter: true` again.** This is now the **second independent first-party
   source** stating that sweepstakes amounts render trailing, "10.00 SC", after the
   docs repository currency page. The brief specifies leading, "SC 1,000". Two
   sources against the brief materially raises the priority of that open ruling.
   Part 3 shipped the brief's leading form behind a single `VIRTUAL_SYMBOL_TRAILING`
   constant precisely so this can be flipped in one line.
2. **XGC decimals disagree between the two official sources.** The SDK says
   `decimals: 0`; the docs currency page says 2. We implement 2. GC is not our target
   currency so this is minor, but it means the two first-party sources are not
   internally consistent and neither can be trusted alone.
3. **No XEC.** The SDK's `Currency` union lists 34 fiat codes plus `XGC` and `XSC`,
   and nothing else. This is the **third** independent source with no trace of XEC,
   after the live site and the docs repository.

Recommendation: do not add as a dependency. Keep the clone in the sandbox as a
reference for contract cross-checks, which is how it has already paid for itself.

---

## (d) mnemoo/tools. Cannot adopt. Reimplement the concept.

**Licence: NONE.** No LICENSE file, no COPYING, no licence statement in the README,
no `package.json` licence field, nothing in `.github/`. Under the Berne Convention
the default is **all rights reserved**: absence of a licence is not permission. The
brief's instruction to treat it as all-rights-reserved is confirmed correct.

**Deliberately not run.** Two independent reasons. First, no licence means no right
to use it. Second, the distribution route is an **unsigned macOS binary that requires
`xattr -cr` to strip the quarantine flag**, which is precisely the pattern our
standing discipline exists to stop, and doubly so for a tool whose purpose is to read
our lookup tables. Code was reviewed statically only.

What it is: a Go backend plus SvelteKit frontend for analysing lookup tables. The
Event Finder concept lives in `backend/internal/lut/events.go` with
`EventViewerPanel.svelte` and `EventModal.svelte` on the front.

**The concept is worth having; the code is not needed.** One-click export of review
event IDs per mode is a genuine cross-check against `REPLAY_TEST_EVENTS.md`, and it
is a trivial amount of in-house work: `scripts/qa/bet_level_compliance.py`, written
this pass, already parses exactly these lookup tables and already sorts outcomes by
payout per mode. Selecting representative event IDs (min, median, max, wincap,
first natural trigger) is a small extension of code we own, under a licence we
control, with no unsigned binaries.

Recommendation: **do not adopt, do not run, do not contact for terms.** Chasing a
licence grant is effort spent on something we can reproduce in well under an hour
from code we already have. Recorded here so the question is not reopened cold.
If the owner wants the concept, raise it as a small in-house task.

---

## (e) egorfedorov/claude-context-optimizer. Defer.

**Licence: MIT confirmed**, LICENSE file present, "Copyright (c) 2026 Egor Fedorov".
v4.6.0, active (2026-07-06). Zero runtime dependencies. Claims no telemetry.

A Claude Code plugin that tracks token usage and flags redundant file reads. It does
not touch game math, player-facing code, or anything that ships, so
gambling-compatibility does not arise.

Low priority in the brief, and nothing found here raises it. It is a
builder-productivity tool with no bearing on submission. The one consideration worth
recording: it instruments our sessions and observes file-access patterns, which is a
small confidentiality surface for a pre-submission commercial project, mitigated by
its zero dependencies and local-only operation.

Recommendation: **defer.** No demonstrated need. Revisit only if session token cost
becomes an actual constraint.

---

## Cross-cutting note

Three of the five candidates are either stale or unlicensed, and the one the brief
fast-tracked turned out to be the one that would have done real damage. The pattern
worth carrying forward: **a tool's freshness is a compliance property, not a
convenience property.** For anything that will answer questions about platform rules,
the vetting question is not only "may we use it" but "what date is its content, and
what does it say about the numbers we are actually governed by".
