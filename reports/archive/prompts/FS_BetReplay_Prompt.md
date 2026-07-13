# FS — Bet Replay Implementation (Stake Engine Mandatory Requirement)

**Priority:** 🔴 CRITICAL — blocks Stake Engine submission (mandatory feature)
**Estimated time:** 1–2 sessions (1 dev + 1 polish)
**Session type:** Multi-task, architectural
**Run order:** SECOND. Run AFTER FS_OrbitronSelfHost_Prompt.md is complete.

---

## Why this is required

Stake Engine Approval / Replay Mode states explicitly:

> *"Bet Replay is a **mandatory requirement** for all games seeking approval. Games without replay support will not be approved."*

When a game URL contains `?replay=true&game={uuid}&version={v}&mode={mode}&event={eventId}&rgs_url={url}`, the game must:

1. Skip authenticate / play / end-round entirely (no session is required)
2. Fetch replay data from `GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`
3. Show a simplified UI: no betting, balance hidden, autoplay hidden
4. Show a "Start Replay" button with mode/bet/cost/currency info
5. Play back the round animation exactly as the original
6. Show "Play Again" button after the round completes

---

## Architecture — CRITICAL

**`rgsService.ts` and `gameStore.ts` are HARD LOCKED. Do not modify either.**

Replay mode is implemented as a **parallel system** in NEW files that sit alongside (not on top of) the locked files:

```
src/lib/
├── services/
│   ├── rgsService.ts        ← LOCKED (do not touch)
│   └── replayService.ts     ← NEW (create this)
├── stores/
│   ├── gameStore.ts         ← LOCKED (do not touch)
│   └── replayStore.ts       ← NEW (create this)
└── components/
    └── ReplayMode.svelte    ← NEW (create this)
```

The replay flow is **completely separate** from the live-game flow. App.svelte detects `replay=true` at boot and routes to ReplayMode. ReplayMode never invokes rgsService.

It IS allowed (and required) to call `.set()` on writable stores exported from gameStore (e.g. `boardSymbols.set([...])`) — that's using the public API, not modifying the file. The lock is on file content, not on consumers of its exports.

If you find yourself thinking "I just need to add one tiny thing to gameStore.ts", STOP. Add it to replayStore.ts instead, or use existing gameStore writables via `.set()`.

---

## Pre-authorisations

- ✅ Create new files in src/lib/services, src/lib/stores, src/lib/components
- ✅ Modify `App.svelte` to add the replay branching
- ✅ Modify any non-locked component
- ✅ Run `npm`, `tsc`, `vite build`, `git` without asking
- ✅ Read `rgsService.ts` and `gameStore.ts` (read-only — never write)

## Hard locks — DO NOT MODIFY

- `src/lib/services/rgsService.ts`
- `src/lib/stores/gameStore.ts`
- Anything under `~/math-sdk/games/future_spinner/` (Math SDK)
- `library/publish_files/`

After completing each task, verify lock integrity:

```bash
git diff src/lib/services/rgsService.ts
git diff src/lib/stores/gameStore.ts
```

Both must return empty output.

## Three-Strike Rule

If the same error or build failure occurs three times, STOP, report state, do not attempt a fourth fix.

---

## Tasks

### Task 1 — Inspect the existing event/play flow (READ ONLY)

Read but DO NOT modify:

```bash
cat ~/math-sdk/frontend/src/lib/services/rgsService.ts
cat ~/math-sdk/frontend/src/lib/stores/gameStore.ts
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte
```

Answer these questions in your output before proceeding to Task 2:

1. **Which writable stores get populated after a successful `play()`?** (e.g. `boardSymbols`, `activeWins`, `winMultiplier`, `isWincap`, `scatterCount`, etc.) List every one.
2. **What is the shape of the `events` array returned from `play()`?** (e.g. `{ type: 'reveal', symbols: [...] }`, `{ type: 'win', positions: [...], multiplier: N }`, etc.)
3. **Is there a single function or method that drives the post-play animation pipeline, or is it spread across components?** (Knowing this tells us whether we can reuse it directly in ReplayMode.)
4. **Where exactly is `initRGS()` called in App.svelte?** (We need to ensure it is NOT called when in replay mode.)

This step is essential — the rest of the implementation depends on getting the playback exactly right.

### Task 2 — Create `src/lib/services/replayService.ts`

Create the file with the full content below. It is a NEW file, not a modification of an existing one.

```typescript
// File: src/lib/services/replayService.ts
// Purpose: Stake Engine Bet Replay support.
//          Parallel to (not modifying) rgsService.ts.
//          Used only when URL contains ?replay=true.
//
// Responsibilities:
//   - Parse replay-specific URL params
//   - Fetch round data from {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}
//   - Expose a typed response for ReplayMode.svelte to consume
//   - Helpers for currency/amount display per Stake Engine spec

export interface ReplayParams {
  replay: true
  game: string         // UUID
  version: string      // e.g. "1"
  mode: string         // e.g. "BASE"
  event: string        // simulation/event ID
  rgsUrl: string       // already-prefixed with https://
  currency: string     // ISO 4217 code or 'SC' (social)
  amount: number       // raw integer micros
  lang: string         // ISO 639-1 code, default 'en'
  device: 'mobile' | 'desktop'
  social: boolean
}

export interface ReplayResponse {
  payoutMultiplier: number   // multiplier applied to the bet amount for total payout
  costMultiplier: number     // multiplier applied to the bet for cost (1.0 for base mode)
  state: any                 // game-specific replay state — events / board / wins
}

const CURRENCY_SCALE = 1_000_000

/**
 * Returns null if the current URL is NOT in replay mode.
 * Returns a fully-typed ReplayParams object if replay=true.
 *
 * Default behaviour per Stake Engine spec:
 *   - currency: 'USD' (non-social) or 'SC' (social) if not provided
 *   - amount: 1_000_000 (1 USD or 1 SC) if not provided
 *   - lang: 'en'
 *   - device: 'desktop'
 *   - social: false
 *
 * Throws if replay=true is present but any of game/version/mode/event/rgs_url
 * is missing — these are mandatory.
 */
export function parseReplayParams(): ReplayParams | null {
  const params = new URLSearchParams(window.location.search)

  if (params.get('replay') !== 'true') return null

  const game = params.get('game')
  const version = params.get('version')
  const mode = params.get('mode')
  const event = params.get('event')
  const rgsUrlRaw = params.get('rgs_url')

  if (!game || !version || !mode || !event || !rgsUrlRaw) {
    throw new Error(
      'Replay mode requires game, version, mode, event, and rgs_url query parameters.',
    )
  }

  const rgsUrl = rgsUrlRaw.startsWith('http')
    ? rgsUrlRaw
    : `https://${rgsUrlRaw}`

  const social = params.get('social') === 'true'
  const currency = params.get('currency') ?? (social ? 'SC' : 'USD')

  const rawAmount = params.get('amount')
  const amount = rawAmount ? parseInt(rawAmount, 10) : CURRENCY_SCALE

  return {
    replay: true,
    game,
    version,
    mode,
    event,
    rgsUrl,
    currency,
    amount,
    lang: params.get('lang') ?? 'en',
    device: (params.get('device') ?? 'desktop') as 'mobile' | 'desktop',
    social,
  }
}

/**
 * Fetch the replay data from the RGS replay endpoint.
 * No session is required — replay URLs are publicly shareable.
 */
export async function fetchReplay(p: ReplayParams): Promise<ReplayResponse> {
  const url = `${p.rgsUrl}/bet/replay/${p.game}/${p.version}/${p.mode}/${p.event}`

  if (import.meta.env.DEV) {
    console.log('[replay] GET', url)
  }

  const response = await fetch(url, { method: 'GET' })

  if (!response.ok) {
    throw new Error(
      `Replay fetch failed (${response.status} ${response.statusText}). URL: ${url}`,
    )
  }

  const data = (await response.json()) as ReplayResponse

  if (import.meta.env.DEV) {
    console.log('[replay] response:', data)
  }

  return data
}

/**
 * Compute the total amount spent on the bet for display on the Start Replay
 * button. Per Stake Engine spec: amount × costMultiplier.
 * Returns the result in raw micros.
 */
export function totalBetSpentMicros(
  amountMicros: number,
  costMultiplier: number,
): number {
  return Math.floor(amountMicros * costMultiplier)
}

/**
 * Convert raw micros to display dollars.
 */
export function microsToDisplay(micros: number): number {
  return micros / CURRENCY_SCALE
}

/**
 * Resolve a currency symbol for display. Supports the most common Stake Engine
 * currencies plus the social-mode SC. Falls back to "{CODE} " for unknown codes.
 */
export function currencySymbol(code: string): string {
  const map: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    CAD: 'CA$',
    AUD: 'A$',
    SC: 'SC ',
  }
  return map[code] ?? `${code} `
}
```

### Task 3 — Create `src/lib/stores/replayStore.ts`

```typescript
// File: src/lib/stores/replayStore.ts
// Purpose: Replay-specific state. Parallel to (not modifying) gameStore.ts.

import { writable } from 'svelte/store'
import type { ReplayParams, ReplayResponse } from '../services/replayService'

/** Current replay params parsed from URL, or null if not in replay mode */
export const replayParams = writable<ReplayParams | null>(null)

/** Replay endpoint response, populated after fetchReplay() succeeds */
export const replayResponse = writable<ReplayResponse | null>(null)

/** UI phase of the replay flow */
export type ReplayPhase =
  | 'loading'   // Fetching replay data from RGS
  | 'ready'     // Data loaded; waiting for user to press Start Replay
  | 'playing'   // Animation in progress
  | 'complete'  // Animation finished; showing Play Again
  | 'error'     // Fetch or playback failed

export const replayPhase = writable<ReplayPhase>('loading')

/** Error message if fetch or playback failed */
export const replayError = writable<string | null>(null)
```

### Task 4 — Create `src/lib/components/ReplayMode.svelte`

This component owns the entire replay UX. It:

1. Calls `parseReplayParams` + `fetchReplay` on mount
2. Shows a loading state, then a Start Replay button
3. On Start Replay: drives the existing animation pipeline by populating gameStore writables with the replay state
4. After playback: shows Play Again
5. Hides bet controls, balance, autoplay — only the grid, win amount, currency, and replay buttons are visible

**Adapt the playback logic in `startReplay()` to match the writables and event shape you found in Task 1.** The skeleton below assumes a typical structure; modify as required.

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import {
    parseReplayParams,
    fetchReplay,
    microsToDisplay,
    totalBetSpentMicros,
    currencySymbol,
  } from '../services/replayService'
  import {
    replayParams,
    replayResponse,
    replayPhase,
    replayError,
  } from '../stores/replayStore'
  import GameGrid from './GameGrid.svelte'
  import WinDisplay from './WinDisplay.svelte'
  import WinPod from './WinPod.svelte'

  // Import the gameStore writables you need to populate to drive the animation.
  // (DO NOT import from gameStore.ts and modify it — only consume the writables.)
  // Adjust this list based on what Task 1 identified.
  import {
    boardSymbols,
    activeWins,
    winMultiplier,
    isWincap,
    // ... add any others identified in Task 1
  } from '../stores/gameStore'

  import type { ReplayParams, ReplayResponse } from '../services/replayService'

  let params: ReplayParams | null = null
  let response: ReplayResponse | null = null
  let phase: 'loading' | 'ready' | 'playing' | 'complete' | 'error' = 'loading'
  let error: string | null = null

  onMount(async () => {
    try {
      const p = parseReplayParams()
      if (!p) {
        // Should never happen — App.svelte should only render this in replay mode.
        throw new Error('ReplayMode rendered outside of replay mode.')
      }
      params = p
      replayParams.set(p)

      const r = await fetchReplay(p)
      response = r
      replayResponse.set(r)
      phase = 'ready'
      replayPhase.set('ready')
    } catch (e: any) {
      error = e?.message ?? 'Failed to load replay.'
      phase = 'error'
      replayPhase.set('error')
      replayError.set(error)
    }
  })

  async function startReplay() {
    if (!response) return
    phase = 'playing'
    replayPhase.set('playing')

    // Drive the same animation pipeline the live game uses.
    // The exact code here depends on what response.state contains — fill this
    // in based on Task 1 findings.
    //
    // PATTERN A — events array (most common):
    //   if (Array.isArray(response.state.events)) {
    //     for (const ev of response.state.events) {
    //       await dispatchEvent(ev)
    //     }
    //   }
    //
    // PATTERN B — board snapshot:
    //   if (response.state.board) {
    //     boardSymbols.set(response.state.board)
    //     activeWins.set(response.state.wins ?? [])
    //     winMultiplier.set(response.payoutMultiplier)
    //     isWincap.set(response.payoutMultiplier >= 5000)
    //     await new Promise(r => setTimeout(r, 1500)) // animation duration
    //   }
    //
    // The implementation will likely combine both — a board reveal then a
    // sequence of win-line highlights.

    // === PLACEHOLDER: replace with actual playback driven by response.state ===
    if (response.state?.board) {
      boardSymbols.set(response.state.board)
    }
    if (Array.isArray(response.state?.wins)) {
      activeWins.set(response.state.wins)
    }
    winMultiplier.set(response.payoutMultiplier)
    isWincap.set(response.payoutMultiplier >= 5000)

    // Wait for the animation to play out — adjust to match the live game's
    // total spin animation duration.
    await new Promise((r) => setTimeout(r, 2500))
    // === END PLACEHOLDER ===

    phase = 'complete'
    replayPhase.set('complete')
  }

  function playAgain() {
    // Reset the visual state and let the user trigger startReplay again.
    activeWins.set([])
    winMultiplier.set(0)
    isWincap.set(false)
    phase = 'ready'
    replayPhase.set('ready')
  }

  // Display helpers
  $: baseBet = params ? microsToDisplay(params.amount) : 0
  $: totalSpent = params && response
    ? microsToDisplay(totalBetSpentMicros(params.amount, response.costMultiplier))
    : 0
  $: showCostMultiplier = response ? response.costMultiplier !== 1.0 : false
</script>

<div class="replay-container">
  {#if phase === 'loading'}
    <div class="replay-status loading">Loading replay…</div>
  {:else if phase === 'error'}
    <div class="replay-status error">
      <div class="error-title">Replay failed to load</div>
      <div class="error-detail">{error}</div>
    </div>
  {:else if params && response}
    <!-- Game grid is always shown so the user can see the result -->
    <div class="grid-area">
      <GameGrid />
    </div>

    <!-- Win amount display when replay has played out -->
    {#if phase === 'complete' || phase === 'playing'}
      <div class="win-area">
        <WinDisplay />
        <WinPod />
      </div>
    {/if}

    <!-- Replay controls (compliant with Stake Engine spec) -->
    <div class="replay-controls">
      {#if phase === 'ready'}
        <button class="replay-btn start-replay" on:click={startReplay}>
          <div class="btn-line-1">START REPLAY</div>
          <div class="btn-line-2">Mode: <strong>{params.mode}</strong></div>
          <div class="btn-line-3">
            Bet: <strong>{currencySymbol(params.currency)}{baseBet.toFixed(2)}</strong>
            {#if showCostMultiplier}
              × {response.costMultiplier} cost =
              <strong>{currencySymbol(params.currency)}{totalSpent.toFixed(2)}</strong>
            {/if}
          </div>
        </button>
      {:else if phase === 'playing'}
        <div class="replay-status playing">Replaying round…</div>
      {:else if phase === 'complete'}
        <button class="replay-btn play-again" on:click={playAgain}>
          PLAY AGAIN
        </button>
      {/if}
    </div>

    <!-- Currency display (kept per Stake Engine spec — Show: Currency display) -->
    <div class="currency-display">
      Currency: <strong>{params.currency}</strong>
    </div>
  {/if}
</div>

<style>
  .replay-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 2rem 1rem;
    box-sizing: border-box;
    background: #060610;
    font-family: 'Orbitron', sans-serif;
    color: #00FFFF;
  }

  .grid-area {
    position: relative;
    flex: 0 0 auto;
  }

  .win-area {
    position: relative;
  }

  .replay-controls {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .replay-btn {
    background: linear-gradient(135deg, #00FFFF, #FF00FF);
    color: #060610;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    border: none;
    border-radius: 12px;
    padding: 1.25rem 2.5rem;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 0 24px rgba(0, 255, 255, 0.4);
    text-align: center;
    min-width: 280px;
  }

  .replay-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 32px rgba(255, 0, 255, 0.5);
  }

  .replay-btn:active {
    transform: translateY(0);
  }

  .btn-line-1 {
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    letter-spacing: 0.1em;
  }

  .btn-line-2,
  .btn-line-3 {
    font-size: 0.875rem;
    font-weight: 400;
    margin-top: 0.25rem;
  }

  .play-again {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    padding: 1rem 3rem;
  }

  .replay-status {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.25rem;
    text-align: center;
  }

  .replay-status.loading {
    color: #00FFFF;
  }

  .replay-status.error {
    color: #FF6666;
  }

  .replay-status.playing {
    color: #FF00FF;
    font-weight: 700;
  }

  .error-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .error-detail {
    font-size: 0.875rem;
    font-weight: 400;
    opacity: 0.85;
    max-width: 480px;
  }

  .currency-display {
    font-size: 0.875rem;
    color: #FFD700;
    opacity: 0.8;
  }

  /* Mobile adjustments per Stake Engine viewport spec
     (Mobile S 320×568 is the smallest required size) */
  @media (max-width: 480px) {
    .replay-container {
      padding: 1rem 0.5rem;
      gap: 1rem;
    }
    .replay-btn {
      min-width: 240px;
      padding: 1rem 1.5rem;
    }
    .btn-line-1 {
      font-size: 1.25rem;
    }
  }
</style>
```

After creating the file, replace the placeholder playback logic in `startReplay()` with code that genuinely drives the animation pipeline based on what Task 1 found.

### Task 5 — Modify App.svelte to branch on replay mode

`App.svelte` is NOT locked. Add early branching at the top of the `<script lang="ts">` block:

```ts
import { parseReplayParams } from './lib/services/replayService'
import ReplayMode from './lib/components/ReplayMode.svelte'

// Determine mode at boot. Synchronous — no async needed yet.
const isReplay = (() => {
  try {
    return parseReplayParams() !== null
  } catch {
    // If params are malformed, treat as replay mode so ReplayMode can show
    // the error state — better than silently falling back to live game with
    // a half-formed URL.
    return new URLSearchParams(window.location.search).get('replay') === 'true'
  }
})()
```

In the markup, wrap the existing top-level game content with the conditional:

```svelte
{#if isReplay}
  <ReplayMode />
{:else}
  <!-- existing live-game render — UNCHANGED -->
  <!-- (LoadingScreen, GameGrid, ControlBar, BalanceDisplay, WinDisplay, etc.) -->
{/if}
```

**Critical gates when `isReplay === true`:**

1. Do NOT call `initRGS()` or any rgsService function
2. Do NOT render BalanceDisplay
3. Do NOT render ControlBar (bet selector, autoplay, spin button)
4. Do NOT render AutoPlayModal
5. Do NOT render ThemeSelector (replay should match the original round's visual)
6. The background video and frame can still render — they're decorative only

Verify by reading the current App.svelte and identifying every component import. Anything in the list above must be inside the `{:else}` branch. ReplayMode handles all visible UI in replay mode.

### Task 6 — Test with a mock replay URL

In dev, you can simulate replay mode by appending fake params. The actual fetch will fail with a 404 (the fake game UUID won't resolve), but you can verify the UI branches correctly and the error state renders.

```bash
cd ~/math-sdk/frontend
npm run dev
```

Open in browser:

```
http://localhost:5174/?replay=true&game=00000000-0000-0000-0000-000000000000&version=1&mode=BASE&event=1&rgs_url=rgs.stake-engine.com&currency=USD&amount=1000000&lang=en
```

(Adjust the port if Vite picks a different one — check the terminal output.)

Verify each step in turn:

1. ✅ Page loads in ReplayMode (no balance, no bet controls, no autoplay)
2. ✅ Loading indicator appears briefly
3. ✅ After fetch fails (expected — fake UUID), the error state renders cleanly with the error message visible
4. ✅ Console has no unexpected errors beyond the expected fetch failure
5. ✅ Console shows zero font errors (carry-over verification from Orbitron prompt)
6. ✅ The grid background, frame, and theme assets render — only the live-game UI is hidden

Now test the live-game flow to confirm no regression:

```
http://localhost:5174/
```

Verify:
1. ✅ Regular game loads exactly as before
2. ✅ Authenticate / play / end-round flow works
3. ✅ ControlBar, BalanceDisplay, AutoPlayModal all render
4. ✅ Spin works
5. ✅ No console errors

### Task 7 — Scaffold REPLAY_TEST_EVENTS.md

This file is what you'll provide to the reviewer at submission time. The actual event IDs can only be captured after deployment to staging, but scaffolding the file now means there's nothing to forget later.

Create `~/math-sdk/REPLAY_TEST_EVENTS.md`:

```markdown
# Future Spinner — Replay Test Event IDs

**Game:** Future Spinner
**Studio:** We Roll Spinners
**Status:** SCAFFOLD — fill in after staging deployment

## How to populate

1. Deploy game to Stake Engine staging
2. Run rounds to produce each scenario below
3. Capture the event ID from each round (visible in the network tab on /wallet/play response, or in the round history)
4. Build the replay URL using the captured event ID
5. Test each replay URL — must show the correct round
6. Provide this completed file to the Stake Engine reviewer

## Test scenarios (per Stake Engine spec)

| Scenario       | Mode | Event ID  | Replay URL |
|----------------|------|-----------|------------|
| Normal win     | BASE | _pending_ | _pending_  |
| Big win        | BASE | _pending_ | _pending_  |
| Win cap (5000×)| BASE | _pending_ | _pending_  |
| Loss (zero)    | BASE | _pending_ | _pending_  |

## Replay URL template

```
https://werollspinners.live.stake-engine.com/future-spinner/v1/?replay=true&game={GAME_UUID}&version=1&mode=BASE&event={EVENT_ID}&currency=USD&amount=1000000&lang=en&rgs_url=rgs.stake-engine.com
```

## Notes

- "Bonus trigger" scenario does not apply — Future Spinner has no bonus mode (instant scatter multiplier only, stateless per Stake Engine requirements)
- All test rounds should be at the default bet level (1.00 USD = 1,000,000 micros)
- Win cap rounds are rare (1 in 100,000) — may need the Stake Engine team to seed a specific simulation for this
```

### Task 8 — Update CLAUDE.md to document replay architecture

Append this block to `~/math-sdk/CLAUDE.md`:

```markdown

## REPLAY MODE (Stake Engine compliance — DO NOT REGRESS)

Bet Replay is mandatory for Stake Engine approval. Implementation lives in:

- `src/lib/services/replayService.ts` (NEW — DO NOT merge into rgsService.ts)
- `src/lib/stores/replayStore.ts` (NEW — DO NOT merge into gameStore.ts)
- `src/lib/components/ReplayMode.svelte` (NEW)
- `App.svelte` (branches on `parseReplayParams() !== null`)

### Architectural constraints

- Replay mode NEVER calls rgsService or wallet endpoints
- Replay mode uses the public /bet/replay/ endpoint (no session required)
- Replay mode drives the animation pipeline by setting gameStore writables
  via their public .set() API — does NOT modify gameStore.ts
- When in replay mode, BalanceDisplay, ControlBar, AutoPlayModal, and
  ThemeSelector are NOT rendered

### Verification before commit

When making future changes to the live-game flow, test replay mode still works:

```
http://localhost:<PORT>/?replay=true&game=00000000-0000-0000-0000-000000000000&version=1&mode=BASE&event=1&rgs_url=rgs.stake-engine.com&currency=USD&amount=1000000&lang=en
```

The page must:
1. Show ReplayMode UI (no betting controls)
2. Show loading indicator, then error state (expected — fake UUID)
3. Have zero unexpected console errors
```

### Task 9 — Build and commit

```bash
cd ~/math-sdk/frontend
npm run build
```

Verify zero TypeScript errors and zero build errors. Then verify the locks held:

```bash
cd ~/math-sdk
git diff frontend/src/lib/services/rgsService.ts
git diff frontend/src/lib/stores/gameStore.ts
```

Both must return empty output. If either has a diff, REVERT it (`git checkout -- <file>`) and re-implement using the parallel-file pattern.

Commit:

```bash
cd ~/math-sdk
git add -A
git status
git commit -m "feat(frontend): implement Stake Engine Bet Replay (mandatory requirement)

- Add replayService.ts (parallel to rgsService, sidesteps locked file)
- Add replayStore.ts (parallel to gameStore, sidesteps locked file)
- Add ReplayMode.svelte with simplified replay UX:
  * Loading / ready / playing / complete / error phases
  * Start Replay button shows mode, bet amount, cost multiplier, currency
  * Play Again button after playback
  * Hides bet controls, balance, autoplay, theme selector
- Branch in App.svelte on ?replay=true
- Scaffold REPLAY_TEST_EVENTS.md for post-deployment event capture
- Document replay architecture in CLAUDE.md

Pending: capture event IDs from staging deployment to provide to reviewer."
git push origin main
```

### Task 10 — Update status doc

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

Then edit `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

1. Mark Bet Replay as ✅ Complete (in dev) with today's date
2. Add new pending item: "Capture replay event IDs from staging deployment (REPLAY_TEST_EVENTS.md)"
3. Update Stake Engine Compliance section to show replay as compliant
4. Re-copy to Desktop:

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

---

## Final checklist

- [ ] `replayService.ts` created and exports `parseReplayParams`, `fetchReplay`, `totalBetSpentMicros`, `microsToDisplay`, `currencySymbol`
- [ ] `replayStore.ts` created with `replayParams`, `replayResponse`, `replayPhase`, `replayError`
- [ ] `ReplayMode.svelte` created with loading / ready / playing / complete / error phases
- [ ] `startReplay()` playback logic adapted to actual gameStore writables / event shape (not the placeholder)
- [ ] Start Replay button shows: mode, bet amount + currency symbol, cost multiplier (if ≠ 1), total spent
- [ ] Play Again button visible after replay completes
- [ ] BalanceDisplay, ControlBar, AutoPlayModal, ThemeSelector NOT rendered in replay mode
- [ ] App.svelte branches on `parseReplayParams() !== null`
- [ ] `git diff` on `rgsService.ts` returns empty
- [ ] `git diff` on `gameStore.ts` returns empty
- [ ] `npm run build` completes with zero errors
- [ ] `npx tsc --noEmit` passes
- [ ] Live-game flow tested: still works as before, no regression
- [ ] Replay flow tested with mock URL: branches correctly, shows loading + error states cleanly
- [ ] CLAUDE.md updated with replay architecture block
- [ ] REPLAY_TEST_EVENTS.md scaffolded with placeholders
- [ ] Git committed and pushed
- [ ] Status doc copied to ~/Desktop/

When all items are checked, report completion. Next steps after this:

1. Verify Game Disclaimer covers all 7 required points (separate small audit prompt)
2. Address remaining theme bugs (oil-and-fire symbols, BGM auto-start, spin button)
3. Run `/ultrareview` #1 across the new replay implementation
4. Deploy to Stake Engine staging
5. Capture event IDs to populate REPLAY_TEST_EVENTS.md
6. Run `/ultrareview` #2 across submission package
7. Submit
