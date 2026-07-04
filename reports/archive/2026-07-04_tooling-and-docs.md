# Session Report: community tooling review + docs refresh + submission prep

- **Date:** 2026-07-04
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/tooling-and-docs` (from `main`).
- **Source:** owner shared four community resources (Discord / Stake Engine) and asked
  us to review them and see if they help. Owner authorised downloading them as trusted
  community sources.

Reviewed the four resources (cloned source, did NOT execute any binary), refreshed the
live Stake Engine docs, and produced three submission-prep artifacts.

## The four resources

- **mnemoo/cli (StakeCLI)** - Go CLI to upload math + front bundles to Stake Engine, run
  an advisory compliance check, and publish. Our bundles match its contract exactly
  (`games/future_spinner/library/publish_files` for math, `frontend/dist` for front).
  **Adopt for submission.**
- **simnJS/stake-dev-tool** - Tauri desktop app: a Rust mock of the RGS wire contract that
  serves our real math-sdk files and can force any simulation by `(mode, eventId)`. Its
  source is effectively the RGS spec (endpoints, micro-unit money, payoutMultiplier as
  bp/100, payout credited at `/end-round`, the `library[sim+1]=Book(sim)` id mapping).
  **Borrow the ideas; keep our Playwright harness for CI.**
- **mnemoo/tools (LUT analyzer)** - Go+Svelte: recomputes RTP / hit-rate / StdDev / tail-risk
  from the lookup tables and runs Stake's compliance rubric. Plug-and-play on our `library`.
  **Use for an independent math audit.**
- **game-replay-requirements** (docs) - the mandatory Bet Replay spec. **We are already
  compliant** (verified our params/endpoint/slim-UI against it).

Full write-up with exact commands, contract shapes and use-vs-rebuild calls:
`docs/TOOLING_REVIEW.md`.

## Deliverables

1. **`docs/TOOLING_REVIEW.md`** (new) - the assessment above, actionable.
2. **Docs refresh** - re-rendered the five live Stake Engine docs into
   `docs/stake-engine-live/` via headless Chrome. **No content changes** vs the 2026-07-03
   snapshot (all four substantive pages identical SHA-256; changelog page still not
   rendering, a known gap). Logged in `COMPLIANCE_WATCH.md`.
3. **`REPLAY_TEST_EVENTS.md`** (rewritten) - the old scaffold wrongly said "no bonus mode".
   Now maps each required review scenario (normal/big/wincap/loss/trigger) to a **real event
   ID derived from the shipped lookup tables**, for BOTH modes, plus local-mock reproduction.
   Derived IDs: base loss=5, normal=0, big=1, wincap=1020; bonus normal=130, big=0,
   wincap=124 (bonus has no zero-payout outcome). Flags the possible +1 sim-id/event-id
   offset to verify on staging.
4. **`.github/workflows/publish-stake-engine.yml`** (new) - StakeCLI publish workflow, manual
   dispatch, **safe by default** (builds frontend + validates bundles + prints the exact
   commands; uploads nothing without `do_upload=true` and the `STAKE_SID` secret). Needs
   `STAKE_TEAM` and the platform game-slug filled in before a real run.

## Notes / owner attention

- These are **community tools, not official Stake Engine software**. I read the source but
  ran nothing. Before using StakeCLI for real, pin its release and use a scoped/test
  `STAKE_SID`; stake-dev-tool installs a local trust CA - review before running.
- **Recommended next:** run the LUT analyzer on `games/future_spinner/library` for an
  independent RTP/hit-rate/tail-risk audit (confirm it matches our stated 96.35% / 29.11% /
  17.28x StdDev), and optionally port its core formulas into a small Python CI check so a
  non-compliant table cannot slip past StakeCLI's advisory `--yes`.
- The math bundle exposes real structure worth remembering:
  `games/future_spinner/library/publish_files/` = `index.json` + `lookUpTable_{base,bonus}_0.csv`
  (100k rows each) + `books_{base,bonus}.jsonl.zst` (bonus book ~151 MB).

No frontend code changed; no build required. Locked files untouched.

## Follow-on: math verified + RGS contract captured

Acting on the review's recommendations (owner agreed; nothing live):

- **`scripts/validate_math.py`** (new, stdlib only, CI-ready) - independently recomputes the
  maths from the shipped lookup tables and gates on Stake's rubric. **Ran it: ALL CHECKS PASS
  and every stated fact is confirmed to the decimal:** RTP 96.350000% both modes (cross-mode
  variation 0.0000%), base hit rate 29.11%, base SD 17.28x, bonus SD 206.63x, max win 5000x,
  wincap odds exactly 1 in 100,000 (base) / 1 in 1,000 (bonus), 100k rows each. Bonus buy has
  no zero-payout outcome (100% hit, min 1.4x). Captured in **`MATH_VALIDATION.md`**.
- **`docs/RGS_CONTRACT_REFERENCE.md`** (new) - the Stake Engine RGS wire contract extracted
  from stake-dev-tool (endpoints, micro-unit money, payoutMultiplier bp/100, payout-at-end-round
  timing, the `library[sim+1]=Book(sim)` mapping), cross-checked against our locked
  `rgsService.ts` / `replayService.ts` / mock. **No misalignments found** - same endpoints,
  micros, and play -> end-round settle order. Only operational item: the sim_id vs event-id +1
  offset to verify on staging.

Net: our maths is independently proven correct and compliant, and our RGS integration is
proven to match the platform contract - both now documented on file for the submission.
