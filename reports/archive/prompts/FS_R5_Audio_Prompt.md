# FUTURE SPINNER — R5 AUDIO WIRING
## Read this file and execute all tasks in order without stopping.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## STEP 0 — CONFIRM FILES ON DISK

```bash
ls ~/math-sdk/frontend/public/assets/sounds/
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

Confirm ALL of these exist before proceeding:
- bgm_loop.mp3 (~932KB)
- bgm_tension.mp3 (~288KB)
- spin.mp3 (~68KB)
- reel_stop.mp3 (~11KB)
- reel_stop_anticipation.mp3 (~48KB)
- win_small.mp3 (~36KB)
- win_medium.mp3 (~53KB)
- win_big.mp3 (~81KB)
- win_epic.mp3 (~107KB)
- scatter_land.mp3 (~78KB)
- anticipation_build.mp3 (~111KB)
- ui_click.mp3 (~5KB)

If any are missing, STOP and report which ones are absent.

---

## TASK 1 — Rewrite soundService.ts with full R5 audio system

Read the current soundService.ts in full, then replace it entirely
with this upgraded version that uses all 12 R5 sound files:

```typescript
// soundService.ts — Future Spinner R5 Audio System
// Full tiered audio: 5 win tiers, anticipation, scatter events

const BASE = 'assets/sounds/'

// All 12 audio files
const sounds: Record<string, HTMLAudioElement> = {
  bgm:                  new Audio(`${BASE}bgm_loop.mp3`),
  bgmTension:           new Audio(`${BASE}bgm_tension.mp3`),
  spin:                 new Audio(`${BASE}spin.mp3`),
  reelStop:             new Audio(`${BASE}reel_stop.mp3`),
  reelStopAnticipation: new Audio(`${BASE}reel_stop_anticipation.mp3`),
  winSmall:             new Audio(`${BASE}win_small.mp3`),
  winMedium:            new Audio(`${BASE}win_medium.mp3`),
  winBig:               new Audio(`${BASE}win_big.mp3`),
  winEpic:              new Audio(`${BASE}win_epic.mp3`),
  scatterLand:          new Audio(`${BASE}scatter_land.mp3`),
  anticipationBuild:    new Audio(`${BASE}anticipation_build.mp3`),
  uiClick:              new Audio(`${BASE}ui_click.mp3`),
}

// Volume levels
sounds.bgm.loop              = true
sounds.bgm.volume            = 0.30
sounds.bgmTension.volume     = 0.50
sounds.spin.volume           = 0.70
sounds.reelStop.volume       = 0.85
sounds.reelStopAnticipation.volume = 0.90
sounds.winSmall.volume       = 0.65
sounds.winMedium.volume      = 0.75
sounds.winBig.volume         = 0.85
sounds.winEpic.volume        = 0.95
sounds.scatterLand.volume    = 0.80
sounds.anticipationBuild.volume = 0.60
sounds.uiClick.volume        = 0.60

let bgmStarted = false
let muted = false
let anticipationActive = false

// Sync with isMuted store
import { isMuted as isMutedStore } from '../stores/gameStore'
isMutedStore.subscribe(val => setMuted(val))

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
}

// ── BGM ─────────────────────────────────────────────────────────────────────

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().catch(() => {
    document.addEventListener('click', () => {
      if (!bgmStarted) {
        sounds.bgm.play().catch(() => {})
        bgmStarted = true
      }
    }, { once: true })
  })
  bgmStarted = true
}

// ── SPIN ────────────────────────────────────────────────────────────────────

export function playSpinStart(): void {
  if (muted) return
  sounds.spin.currentTime = 0
  sounds.spin.play().catch(() => {})
  // Duck BGM during spin
  sounds.bgm.volume = 0.12
  setTimeout(() => {
    if (!muted) sounds.bgm.volume = 0.30
  }, 1800)
}

// ── REEL STOPS ──────────────────────────────────────────────────────────────

/**
 * Play reel stop sound for a given reel index (0-4).
 * If anticipation is active on reel 4 (last reel), use heavy version.
 */
export function playReelStop(reelIndex: number = 0): void {
  if (muted) return
  if (anticipationActive && reelIndex === 4) {
    // Last reel during anticipation — use the heavy anticipation stop
    sounds.reelStopAnticipation.currentTime = 0
    sounds.reelStopAnticipation.play().catch(() => {})
    stopAnticipation()
  } else {
    const clone = sounds.reelStop.cloneNode() as HTMLAudioElement
    clone.volume = sounds.reelStop.volume
    clone.play().catch(() => {})
  }
}

// ── ANTICIPATION ────────────────────────────────────────────────────────────

/**
 * Start anticipation audio — rising tension during slow reel.
 * Call this when reels 1-4 have matched high-value symbols.
 */
export function playAnticipation(): void {
  if (muted) return
  anticipationActive = true
  // Duck normal BGM
  sounds.bgm.volume = 0.08
  // Play tension build
  sounds.anticipationBuild.currentTime = 0
  sounds.anticipationBuild.play().catch(() => {})
}

export function stopAnticipation(): void {
  anticipationActive = false
  sounds.anticipationBuild.pause()
  sounds.anticipationBuild.currentTime = 0
  // Restore BGM
  if (!muted) sounds.bgm.volume = 0.30
}

// ── SCATTER ─────────────────────────────────────────────────────────────────

/**
 * Play the scatter landing sound each time a scatter symbol appears.
 * Call once per scatter as each reel stops.
 */
export function playScatterLand(): void {
  if (muted) return
  const clone = sounds.scatterLand.cloneNode() as HTMLAudioElement
  clone.volume = sounds.scatterLand.volume
  clone.play().catch(() => {})
}

// ── WIN SOUNDS ──────────────────────────────────────────────────────────────

/**
 * Play tiered win sound based on multiplier (winAmount / betAmount).
 * 0         = dead spin, no sound
 * 0.01–1.9× = small win
 * 2×–9.9×   = medium win
 * 10×–19.9× = big win
 * 20×+      = epic win
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return

  if (multiplier >= 20) {
    sounds.winEpic.currentTime = 0
    sounds.winEpic.play().catch(() => {})
  } else if (multiplier >= 10) {
    sounds.winBig.currentTime = 0
    sounds.winBig.play().catch(() => {})
  } else if (multiplier >= 2) {
    sounds.winMedium.currentTime = 0
    sounds.winMedium.play().catch(() => {})
  } else {
    sounds.winSmall.currentTime = 0
    sounds.winSmall.play().catch(() => {})
  }
}

// ── UI ───────────────────────────────────────────────────────────────────────

export function playUIClick(): void {
  if (muted) return
  sounds.uiClick.currentTime = 0
  sounds.uiClick.play().catch(() => {})
}

/** Alias for backward compatibility with any existing call sites */
export const playClick = playUIClick

export function playScatter(): void {
  // Legacy alias — now use playScatterLand for individual scatter events
  playScatterLand()
}
```

After writing the file, run TSC to check for errors. Fix any import
issues — the `isMuted` import at the top may need adjustment if the
store is in a different location.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(audio): R5 full audio system — 12 tracks, tiered wins, anticipation"
git push origin main
```

---

## TASK 2 — Wire playAnticipation and playScatterLand into GameGrid

Read `src/lib/components/GameGrid.svelte` in full. Find:
1. The import line for soundService functions
2. Where `playSpinStart()` / `playSpin()` is called
3. Where `playReelStop()` is called (per reel)
4. The anticipation logic added in the R4 session

Update the import to include new functions:
```typescript
import {
  playSpinStart,
  playReelStop,
  playAnticipation,
  playScatterLand
} from '../services/soundService'
```

**Wire playAnticipation:**
Find where the anticipation is triggered (when reels 1-4 match).
After the check that triggers visual anticipation effects, add:
```typescript
playAnticipation()
```

**Wire playScatterLand:**
Find where scatter symbols are detected as reels stop. In the reel
stop loop, after each reel lands, check if that reel's symbols contain
a scatter ('S'). If yes, call `playScatterLand()`:

```typescript
// After reel [r] stops — check for scatter
const reelSymbols = result.board[r]  // or however board is accessed
if (reelSymbols.some(sym => sym === 'S')) {
  playScatterLand()
}
```

Look at the actual board data structure from the spin result to get
the correct access pattern. Use the real field names.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(audio): wire anticipation and scatter land sounds in GameGrid"
git push origin main
```

---

## TASK 3 — TSC + build + status update + copy to Downloads

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

Add to CURRENT STATE:
```
R5 audio system active. 12 tracks wired. Tiered win sounds (small/
medium/big/epic). Dedicated scatter land sound. Anticipation audio
(tension build + heavy reel stop). New BGM (932KB, 33s loop).
```

Add to SOUNDS row in component table:
```
| Sounds | ✅ Wired | R5: 12 tracks, 5 win tiers, anticipation, scatter land |
```

Add to SESSIONS LOG:
```
| R5 audio | 2026-04-04 | 12-track audio system, tiered wins, anticipation, scatter land |
```

Then copy to Downloads and commit:
```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md
echo "✅ Status copied to Downloads"

cd ~/math-sdk && git add -A
git commit -m "chore: R5 audio wiring complete"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════
FUTURE SPINNER — R5 AUDIO COMPLETE
═══════════════════════════════════════════════════════════

TASK 1 — soundService.ts rewritten (12 tracks): [ done ]
TASK 2 — Anticipation + scatter wired:          [ done ]
TASK 3 — Build passing:                         [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

New sounds active:
  bgm_loop.mp3 (932KB, 33s)         ✅
  bgm_tension.mp3 (288KB, 10s)      ✅
  spin.mp3 (68KB, 1.8s)             ✅
  reel_stop.mp3 (11KB, 0.4s)        ✅
  reel_stop_anticipation.mp3 (48KB) ✅
  win_small.mp3 (36KB, 1.5s)        ✅
  win_medium.mp3 (53KB, 2.2s)       ✅
  win_big.mp3 (81KB, 2.8s)          ✅
  win_epic.mp3 (107KB, 4.5s)        ✅
  scatter_land.mp3 (78KB, 2.5s)     ✅
  anticipation_build.mp3 (111KB)    ✅
  ui_click.mp3 (5KB, 0.2s)          ✅

═══════════════════════════════════════════════════════════
