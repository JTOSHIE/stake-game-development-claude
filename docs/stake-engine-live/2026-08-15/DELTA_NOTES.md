# LIVE DOCS DELTA, 2026-08-15

Convention (d) docs watch, run as TASK 1 and TASK 2 of
`reports/briefs/FS_FABLE_R070_DOCS_MIRROR_Prompt.md`.

Australian English, no em dashes or en dashes in this note. Upstream quotations carry
whatever punctuation upstream used, per convention (l.7).

---

## THE HEADLINE: ZERO DELTA, ACROSS THE WHOLE TREE

**All 64 routes the live docs navigation lists are byte-identical to the 2026-08-11
capture.** Not the RGS family alone: every page, including the approval guidelines
family, the developer sub-trees, payments and the legal set.

The brief's TASK 1 condition is therefore met on its zero-delta branch: **the
submission-morning refresh of the RGS family stands done early**, and nothing is
escalated, because there is nothing to escalate.

**Proven twice, on independent transports**, because a single reading of a live page is
one instrument and convention (l.4) does not accept one instrument as corroboration:

| Route | Transport A, the logged-in browser pane | Transport B, headless Playwright | 2026-08-11 record |
|---|---|---|---|
| `/docs/rgs` | 12,025 chars, `cefad0fd2ed1a789e4b50cea9f0a2266d1ab5d0f04428f3d1889531a31a24580` | identical | identical |
| `/docs/rgs/wallet` | 2,537 chars, `15d774ea4c8781026f62d68848b78f0e8b7d8c89e50216b5af5f89b88c0cc546` | identical | identical |
| `/docs/rgs/example` | 2,273 chars, `0abf0a75716b792ae57c9060bd375ded48f4e7bd40d1d918fb32397d3c6c0836` | identical | identical |

Transport A ran `document.querySelector('main').innerText`, trimmed, hashed in the page
with `crypto.subtle`, at the pane's own 1280x720 viewport. Transport B is the recorded
convention (d) instrument, headless chromium at 1440x900. The two agree with each other
and with a capture taken on a different date by a different session, which is the
corroboration (l.4) asks for.

**The RGS trio has now been byte-identical since 2026-07-29**, the first complete
capture: `rgs.md` reads 12,025 characters and `cefad0fd` in the 2026-07-29, 2026-08-10,
2026-08-11 and 2026-08-15 sets. Seventeen days, four captures, no change.

---

## WHAT WAS CAPTURED, AND HOW THE ROUTE LIST WAS BUILT

The route list is the live sidebar's own, read from `/docs` rather than carried forward
from a previous pass, so a route added upstream would appear here rather than be missed
by a stale list.

- **71 anchors in the navigation, 64 unique routes.** The seven repeats are section
  headings that also link to their own first page (`/docs`, `/docs/payments`,
  `/docs/front-end`, `/docs/math`, `/docs/math/game-state-structure/setup/configs`,
  `/docs/approval-guidelines`, `/docs/terms`).
- **Zero non `/docs` links in the navigation**, recorded because the 2026-07-29 note
  named one (see the PDF entry below).
- The navigation's own text, section labels and order, is committed beside this note at
  `_nav.txt`, so the enumeration is auditable rather than asserted.
- Every route was rendered and captured. No page returned the client-render placeholder,
  and no route was sampled or skipped.

**Four routes render their child page rather than an index of their own**, and this is
upstream behaviour rather than a capture fault: it reproduces byte for byte in the
2026-08-10 and 2026-08-11 sets as well.

| Route captured | Renders the same page as |
|---|---|
| `/docs/math/high-level-structure` | `/docs/math/high-level-structure/state-machine` |
| `/docs/math/game-state-structure` | `/docs/math/game-state-structure/simulation-acceptance` |
| `/docs/math/source-files` | `/docs/math/source-files/config` |
| `/docs/math/source-files/calculations` | `/docs/math/source-files/calculations/board` |

---

## A PREMISE THE BRIEF CARRIED, RECOUNTED UNDER RULE 16

The brief instructs that the developer sub-trees, "front-end, math, payments,
getting-started, legal", be "captured first-time and indexed".

**VERIFIED 2026-08-15 by listing the 2026-08-11 manifest against the live route list:
none of them is first-time.** All 64 live routes already had a dated predecessor, and
the two sets cover exactly the same 64 URLs with no route on either side that the other
lacks. The complete corpus was first captured on 2026-07-29 and recaptured on 2026-08-10
and 2026-08-11.

This makes the work stronger rather than weaker, so it was done that way and recorded
here rather than performed as instructed: **every page was DIFFED against its dated
predecessor**, which is a higher standard than indexing a first-time capture, and the
result is the zero delta above.

**"getting-started" is a navigation SECTION, not a route.** The sidebar's first section
is titled "Getting Started" and contains Introduction (`/docs`), RGS Details
(`/docs/rgs`), Wallet Endpoints (`/docs/rgs/wallet`) and Basic RGS Example
(`/docs/rgs/example`). There is no `/docs/getting-started` page; the only route with that
name is `/docs/front-end/getting-started`, inside the front-end sub-tree. Recorded so the
next brief does not go looking for a page that does not exist.

---

## THE FALSE DELTA THIS PASS NEARLY REPORTED, AND WHAT IT FOUND IN OUR OWN RECORD

**Eight pages first read as CHANGED, each by exactly one character.** front_end_context,
front_end_flowchart, math_game_state_structure_setup_betmode,
math_game_state_structure_symbols, math_high_level_structure_game_structure,
math_optimization_algorithm, math_setup, math_source_files_win_manager.

The uniformity was the tell, exactly as it was on 2026-07-29 when the sidebar inflated
every page by about a thousand characters. Eight independent upstream edits do not each
remove exactly one character.

**The cause is a normalisation difference in OUR OWN RECORD, not a platform change.**
The 2026-08-11 manifest recorded `sha256` and `chars` over the RAW `innerText`. The
committed `.md` file beside it holds the TRIMMED text. Those eight pages end in a
newline, because each ends in a code block, so for those eight the manifest describes a
string one character longer than the file it sits beside. The other 56 pages have no
trailing whitespace and the two readings coincide, which is why the inconsistency stayed
invisible.

**Settled by measurement rather than by argument.** The raw, untrimmed `innerText` was
captured fresh for all eight pages today and hashed:

| Page | 2026-08-11 manifest sha256 | 2026-08-15 RAW sha256 |
|---|---|---|
| front_end_context | `79f990e2facf...` | `79f990e2facf...` |
| front_end_flowchart | `7561bbd2ebed...` | `7561bbd2ebed...` |
| math_game_state_structure_setup_betmode | `7633ae35e8cf...` | `7633ae35e8cf...` |
| math_game_state_structure_symbols | `3243da2519d3...` | `3243da2519d3...` |
| math_high_level_structure_game_structure | `db97147fb2e6...` | `db97147fb2e6...` |
| math_optimization_algorithm | `d6818b0bdcd8...` | `d6818b0bdcd8...` |
| math_setup | `e382817a7f6e...` | `e382817a7f6e...` |
| math_source_files_win_manager | `11150305e127...` | `11150305e127...` |

Every one matches. The pages are unchanged under BOTH normalisations, and the committed
file bodies are identical as well, so the eight are as unchanged as the other 56.

**Fixed forward rather than argued about.** This set's `_manifest.json` records both
readings for every page: `sha256` and `chars` over the raw text, the figure every prior
dated manifest recorded, and `sha256_body` and `chars_body` over the trimmed text, which
is what the `.md` file holds. A `normalisation_note` field says so in the manifest
itself. The next pass can compare either column and cannot produce this false delta.

**THE LESSON, which is not the one it looks like.** The 2026-08-11 record was not wrong
about the platform; it was inconsistent with itself, and nothing in the estate could
notice, because a manifest is only ever read against the site rather than against the
files it describes. **A record that describes a file should be checkable against that
file.** The check costs one loop and it is the check that turned eight alarming deltas
into a closed question in a single command.

---

## THE PDF, AND A CORRECTION TO WHERE IT LIVES

The 2026-07-29 note recorded `https://stake-engine.com/docs-content/distribution_optimization.pdf`
as "linked from the docs navigation" and NOT captured, because it is a binary rather than
a rendered page.

**VERIFIED 2026-08-15 by reading the anchors first-hand: it is not linked from the
navigation and was not on that date either.** The navigation carries zero non `/docs`
anchors. The PDF is linked from the BODY of `/docs/math/optimization-algorithm`, on the
words "downloading this paper".

**The gap itself stands and is restated rather than quietly dropped:** the paper is not
mirrored in this repository. It is upstream reference material for the optimisation
algorithm, our lookup tables are frozen published truth that no session regenerates, and
nothing in the submission depends on it. Named here so its absence stays a stated gap.

---

## MATERIALITY SKIM

Ordered by the brief for the first-time pages. Since no page is first-time, the skim was
run over the full developer sub-trees anyway, front-end, math, payments and the legal
set, which is the brief's intent read against what the tree actually holds. The result
and any escalations are recorded in the session report and in the tracker row for this
pass. Nothing was actioned, per the brief.
