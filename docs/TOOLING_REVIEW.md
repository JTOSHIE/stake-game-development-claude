# Community tooling review (Stake Engine)

Assessment of four community resources shared from Discord / Stake Engine, checked
against Future Spinner (Stake Engine slot: Python math-sdk package under
`games/future_spinner/`, Svelte frontend building to `frontend/dist`). Source was
cloned and read; nothing was executed. Australian English, no em dashes or en dashes.

Reviewed 2026-07-04. All three GitHub tools are **community projects, not official
Stake Engine software** - vet the source, pin a release, and prefer a scoped/test
credential before trusting any of them with the live platform.

## Summary

| Resource | What it is | Verdict for us |
|---|---|---|
| **mnemoo/cli (StakeCLI)** | Go single-binary CLI: upload math + front bundles, advisory compliance check, publish | **Adopt** for submission. Our bundles match its contract exactly. Workflow drafted. |
| **simnJS/stake-dev-tool** | Tauri desktop app: local Rust mock of the RGS contract, serves real math-sdk files, force any sim by (mode,eventId), multi-resolution, replay | **Borrow the ideas; optionally run alongside.** It is the closest thing to an RGS spec. Keep our Playwright harness for CI. |
| **mnemoo/tools (LUT analyzer)** | Go + Svelte desktop: recomputes RTP / hit rate / StdDev / tail-risk from the lookup tables + runs Stake's compliance rubric | **Use for an independent math audit.** Plug-and-play on our `library`. |
| **game-replay-requirements** (docs) | The mandatory Bet Replay spec | **Already compliant** (verified). Mirrored in `docs/stake-engine-live/`. |

## 1. StakeCLI (mnemoo/cli) - submission/publish

`stakecli upload --team &lt;slug&gt; --game &lt;slug&gt; --type math|front --path &lt;dir&gt; [--yes] [--publish]`.
Auth is `STAKE_SID` (a stake-engine.com session cookie; treat as a password), API base
`STAKE_API_URL` (default `https://stake-engine.com/api`). It uploads a **directory** (no
zip) as a content-addressed sync to presigned S3 URLs, deleting remote scratch files not
present locally. Skips dotfiles, `node_modules`, `__pycache__`, zero-byte files.

**Our fit (confirmed against our tree):**
- Math bundle: `games/future_spinner/library/publish_files/` - has `index.json` with modes
  `base` (cost 1.0) + `bonus` (cost 100.0), 3-column `lookUpTable_*_0.csv`, and
  `books_*.jsonl.zst` (bonus book ~151 MB uses the multipart path). Matches the contract.
- Front bundle: `frontend/dist/` uploads as-is.

**Watch-outs:**
- The math compliance check (RTP 90-98%, cross-mode &lt;=0.5%, min 100k rows) is **advisory**:
  with `--yes` it warns but still uploads/publishes. For a hard gate, run without `--yes`,
  or pre-validate (see the LUT analyzer below).
- Point `--path` at `publish_files` (index.json at the root), not `library/`.
- Publish is per type - math and front are two publishes / likely two version bumps.
- Pin the CLI release; the `sid` is a full session credential (never echo it, no `set -x`).

**Action taken:** `.github/workflows/publish-stake-engine.yml` drafted - manual dispatch,
**safe by default** (builds + validates + prints the commands; uploads nothing without an
explicit `do_upload=true` and the `STAKE_SID` secret). Set `STAKE_TEAM` and confirm the
platform `--game` slug before a real run.

## 2. stake-dev-tool (simnJS) - local RGS mock + force events

A desktop app whose Rust "LGS" faithfully mocks the Stake Engine RGS from **real math-sdk
output**. Even if we never adopt the GUI, its source is the best available **spec of the
RGS wire contract** - worth diffing our own `rgsService`/mock against:

- Endpoints: `POST /api/rgs/:game/wallet/{authenticate,balance,play,end-round}`,
  `POST /api/rgs/:game/bet/event`, `GET /bet/replay/:game/:version/:mode/:event`.
- Money in micro-units (`x1_000_000`); `payoutMultiplier` serialized as basis-points/100;
  `Round { betID, amount, payout, payoutMultiplier, active, mode, event, state }`.
- **Payout is credited at `/end-round`, not `/play`** (models the spin -> settle window);
  a mock that pays at `/play` hides balance/settlement ordering bugs.
- Reads `index.json` -> lookup CSV (`eventId,weight,payoutMultiplier`) -> zstd books
  (`{"id":N,"events":[...]}` per line). **Critical quirk:** math-sdk writes
  `library[sim+1] = Book(sim)`, so books are addressed by the `"id"` field, not line index.
- **Force by (mode, eventId):** the next `/play` returns that exact simulation deterministically
  (real payout + real event stream). Plus auto-bucketed "notable" events (zero/low/med/big/max)
  and saved-round bookmarks.

**Recommendation - borrow, don't replace.** Keep our Playwright harness (CI-friendly; the tool
is a GUI). Borrow into our own tooling: (a) read the real lookup tables to auto-derive test
cases instead of hand-maintaining `sample_rounds.json`; (b) force by `(mode, eventId)` off the
real zstd books so the frontend renders byte-identical-to-production rounds; (c) match the
contract quirks above in our mock (micro-units, bp/100, pay-at-end-round, the `sim+1` id
mapping). Feeding **real** math files catches event-schema drift, the id/line off-by-one, real
cost/payout math (bonus cost&gt;1), and rare max-win/zero-win events that curated fixtures miss -
i.e. exactly the integration failures that otherwise only surface after upload.

## 3. mnemoo/tools (LUT analyzer) - independent math audit

Recomputes, straight from the lookup-table CSV weights (zero trust in the PAR): RTP, hit rate,
mean/median payout, variance/StdDev, max win, payout distribution + log buckets, and tail-risk
(CVaR@0.1%, ETL@40x/10000x, P(win&gt;=5000x), max-win hit rate). Ships a **compliance checker**
against Stake's star-tier rubric (RTP 90-98%, cross-mode &lt;=0.5%, base hit-rate 5-33%, min
100k outcomes, volatility band). Run headless: `go run ./cmd -dir games/future_spinner/library/publish_files`
(HTTP :7754), or the Wails launcher; hit `/api/compliance` and `/api/compare`.

**Our fit:** plug-and-play - our `library/publish_files` is the exact schema it consumes. It
will confirm base 96.35% / bonus 96.35% (cost-adjusted), base hit-rate 29.11% inside 5-33%,
100k rows at the boundary, and max win 5000x under the ceiling.

**Two naming caveats before comparing:** our stated "volatility 17.28x" is a StdDev in
bet-multiples -> compare to the tool's **StdDev** field, not its **Volatility** field (which is
StdDev/mean, a unitless CV). Bonus RTP is cost-adjusted (divides by cost 100).

**Recommendation:** use it now for a one-off independent audit + the tail-risk/compliance view.
The numeric core is ~115 lines; porting RTP/hit-rate/StdDev to a small Python check over
`lookUpTable_*_0.csv` gives us the same gate in CI without a Go+Node+Wails dependency. Worth
doing so a non-compliant table cannot slip through StakeCLI's `--yes`.

## 4. Bet replay requirements - already compliant

The mandatory spec (mirrored at `docs/stake-engine-live/game-replay-requirements.md`, unchanged
2026-07-04). Verified our implementation matches: we parse `replay/game/version/mode/event/rgs_url`
(+ optional currency/amount/lang/device/social), call
`${rgs_url}/bet/replay/${game}/${version}/${mode}/${event}`, handle payout/cost multipliers and
the wincap case, and (per CLAUDE.md) hide Balance/ControlBar/AutoPlay/ThemeSelector, make no
session/wallet calls, and use the public endpoint. Remaining prep is operational: capture real
event IDs for normal/big/wincap/loss/bonus per mode - see `REPLAY_TEST_EVENTS.md`.

## Recommended next actions

1. **Independent math audit** (this session or next): run the LUT analyzer on
   `games/future_spinner/library` and confirm RTP/hit-rate/StdDev/tail-risk against our stated
   facts; optionally add a small Python CI check porting its formulas.
2. **Harden our mock** (optional, high value pre-submission): adopt read-real-lookup-tables +
   force-by-(mode,eventId) + the pay-at-end-round contract quirk from stake-dev-tool, so we
   test against the truth, not curated fixtures.
3. **Submission:** finish `STAKE_TEAM`/game-slug in the publish workflow; run it once in dry-run,
   then with a scoped `STAKE_SID` when ready.
4. **Trust:** these are community binaries. Review/pin before running anything that touches a
   real credential (StakeCLI) or installs a local trust CA (stake-dev-tool).
