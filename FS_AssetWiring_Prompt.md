# FUTURE SPINNER — CLAUDE CODE SESSION: Wire All New Assets
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — READ FIRST, APPLY FOR THE ENTIRE SESSION

- ✅ Overwrite ANY existing file without asking
- ✅ Create ANY new file without asking
- ✅ Fix TypeScript errors autonomously without asking
- ✅ Run `npm run build`, `npx tsc --noEmit`, `npm run dev` without asking
- ✅ Run `git add`, `git commit`, `git push` without asking

**⚠ HARD LOCKS — never modify:**
- `~/math-sdk/games/future_spinner/` (Math SDK)
- `~/math-sdk/frontend/public/lookUpTable_base.csv`
- `rgsService.ts`
- `gameStore.ts`

**Working directory:** `~/math-sdk/frontend/`
**Branch:** main

Execute every task in order without stopping. Three-Strike Rule applies.

---

## STANDING PROTOCOL

After every task, update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`
and commit. This file is read between sessions — never skip it.

---

## STEP 0 — ORIENTATION

```bash
# Confirm all assets are present
ls ~/math-sdk/frontend/public/assets/frames/
ls ~/math-sdk/frontend/public/assets/videos/
ls ~/math-sdk/frontend/public/assets/sounds/
ls ~/math-sdk/frontend/public/assets/symbols/

# Read the files we are about to modify
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/services/soundService.ts
```

Report exact filenames found in each directory before proceeding.

---

## TASK 1 — Wire the background video (App.svelte)

The `<video>` element exists in App.svelte but has no `<source>` tag.
Add the source pointing to the first video file.

Find the `<video>` element in App.svelte that looks like this:
```svelte
<video class="bg-video" autoplay loop muted playsinline aria-hidden="true">
  <!-- Source added when video assets are available -->
</video>
```

Replace the comment with an actual source tag using the first video
filename confirmed in Step 0:
```svelte
<video class="bg-video" autoplay loop muted playsinline aria-hidden="true">
  <source src="assets/videos/1000062179.mp4" type="video/mp4" />
</video>
```

Also verify the `.bg-video` CSS has `opacity: 0.35` and the `.bg-overlay`
has `background: rgba(0,0,0,0.65)`. If the opacity is set to 0 or the
element is hidden, fix it now.

**Verification:** Run `npm run dev`, open browser, confirm a video is
playing in the background at low opacity behind the game.

Update status doc and commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "feat(assets): wire background video source" && git push origin main
```

---

## TASK 2 — Wire the cyberpunk frame image (App.svelte)

The `.game-frame` is currently a CSS-only `<div>` with a neon border.
Replace it with the actual frame PNG image.

Find this in App.svelte:
```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gridRef} />
  <div class="game-frame" aria-hidden="true"></div>
</div>
```

Replace with:
```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gridRef} />
  <img
    src="assets/frames/1000062174.png"
    class="game-frame"
    alt=""
    aria-hidden="true"
  />
</div>
```

Update the `.game-frame` CSS to work with an `<img>` tag:
```css
.game-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-glow 3s ease-in-out infinite;
}

@keyframes frame-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(0,255,255,0.4)); }
  50%       { filter: drop-shadow(0 0 18px rgba(0,255,255,0.8)); }
}
```

**Verification:** Confirm the frame PNG renders over the grid in the browser.
Symbols must still be visible through the transparent centre of the frame.

Update status doc and commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "feat(assets): wire cyberpunk frame PNG overlay" && git push origin main
```

---

## TASK 3 — Fix sound service (soundService.ts)

Read `soundService.ts` in full. The sounds are currently playing a beep
because either:
a) The file paths don't match the actual sound filenames, OR
b) The Audio objects are being constructed incorrectly, OR
c) Web Audio API is being used with placeholder oscillators instead of
   real audio files

The actual sound files that exist are:
- `assets/sounds/bgm_loop.mp3`
- `assets/sounds/spin.mp3`
- `assets/sounds/reel_stop.mp3`
- `assets/sounds/win.mp3`
- `assets/sounds/ui_click.mp3`
- `assets/sounds/scatter.mp3`

Rewrite `soundService.ts` completely to use these actual files via the
HTML5 Audio API. Keep it simple and reliable:

```typescript
// soundService.ts — Audio for Future Spinner
// Uses HTML5 Audio API with actual MP3 files

const BASE = 'assets/sounds/'

// Preload all audio files
const sounds: Record<string, HTMLAudioElement> = {
  bgm:      new Audio(`${BASE}bgm_loop.mp3`),
  spin:     new Audio(`${BASE}spin.mp3`),
  reelStop: new Audio(`${BASE}reel_stop.mp3`),
  win:      new Audio(`${BASE}win.mp3`),
  uiClick:  new Audio(`${BASE}ui_click.mp3`),
  scatter:  new Audio(`${BASE}scatter.mp3`),
}

// BGM loops
sounds.bgm.loop = true
sounds.bgm.volume = 0.3

// Set volumes
sounds.spin.volume     = 0.7
sounds.reelStop.volume = 0.85
sounds.win.volume      = 0.8
sounds.uiClick.volume  = 0.6
sounds.scatter.volume  = 0.9

let bgmStarted = false
let muted = false

export function setMuted(val: boolean): void {
  muted = val
  Object.values(sounds).forEach(s => { s.muted = val })
}

export function playBGM(): void {
  if (muted || bgmStarted) return
  sounds.bgm.play().catch(() => {
    // Autoplay blocked — will start on first user interaction
    document.addEventListener('click', () => {
      if (!bgmStarted) {
        sounds.bgm.play().catch(() => {})
        bgmStarted = true
      }
    }, { once: true })
  })
  bgmStarted = true
}

export function playSpin(): void {
  if (muted) return
  sounds.spin.currentTime = 0
  sounds.spin.play().catch(() => {})
}

export function playReelStop(reelIndex: number): void {
  if (muted) return
  // Clone for overlapping stops on multiple reels
  const clone = sounds.reelStop.cloneNode() as HTMLAudioElement
  clone.volume = sounds.reelStop.volume
  clone.play().catch(() => {})
}

export function playWin(multiplier: number): void {
  if (muted) return
  if (multiplier >= 5) {
    // Big win — play scatter/celebration sound
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
  } else if (multiplier > 0) {
    sounds.win.currentTime = 0
    sounds.win.play().catch(() => {})
  }
}

export function playScatter(): void {
  if (muted) return
  sounds.scatter.currentTime = 0
  sounds.scatter.play().catch(() => {})
}

export function playUIClick(): void {
  if (muted) return
  sounds.uiClick.currentTime = 0
  sounds.uiClick.play().catch(() => {})
}
```

After writing the file, read the existing imports in `App.svelte`,
`GameGrid.svelte`, and `ControlBar.svelte` to find every call to the
old soundService functions. Update those call sites to match the new
exported function names above. Do not break any existing calls.

Also call `playBGM()` in App.svelte's `onMount` after `initRGS()`.

**Verification:** Run `npm run dev`, spin the reels — you should hear:
- Background music playing softly
- Spin whoosh on spin button press
- Reel stop click for each reel landing
- Win sound on winning spins

Update status doc and commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "feat(sounds): wire real MP3 files, replace beep placeholders" && git push origin main
```

---

## TASK 4 — Fix win display green border (WinDisplay.svelte)

The win display has a green border/glow showing. This is old CSS that
needs to be cleaned up.

Read `WinDisplay.svelte` in full. Find any CSS that produces a green
colour on the win panel and remove or replace it:

- Remove any `border: ... green` or `border-color: green`
- Remove any `box-shadow` with green values
- Remove any `color: green` on the win panel container itself
- The `.win-green` class (for small wins ≤1×) should only colour the
  **text/number** — not the panel border or background

The win panel container `.win-panel` should have NO visible border or
coloured outline in its default state. Only the amount text changes
colour based on win tier.

If there is a background image (`background-image: url(...)`) on
`.win-panel`, make sure it is still present — do not remove it.

After fixing, the win tiers should look like this:
- 0 wins: Panel dim/invisible, no number shown
- Small (0–1×): Amount text in green `#00cc44`, no panel glow
- Gold (1–10×): Amount text in gold `#ffcc00`, mild text glow only
- Big (10–49×): Amount text magenta `#ff00ff`, "BIG WIN!" label
- Mega (50×+): Amount text cyan `#00ffff`, "MEGA WIN!" label

Update status doc and commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "fix(ui): remove green border from win display panel" && git push origin main
```

---

## TASK 5 — Final TypeScript check + build + full status update

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

```bash
cd ~/math-sdk
git add -A
git commit -m "chore: final build check — all assets wired"
git push origin main
```

Write the final status to `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
# FUTURE SPINNER — PROJECT STATUS
## Last updated: 2026-04-04 | Asset wiring session complete

## CURRENT STATE
All assets wired. Background video playing, frame PNG overlay active,
real MP3 sounds playing, win display green border fixed.
Production build passing with 0 TypeScript errors.

## COMPONENT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Math SDK | ✅ LOCKED | 96.35% RTP, 100k sim |
| rgsService.ts | ✅ LOCKED | Mock mode |
| gameStore.ts | ✅ LOCKED | |
| GameGrid.svelte | ✅ Complete | PNG sprites, blur tumble, win highlights |
| LoadingScreen.svelte | ✅ Complete | Logo, rings, progress bar |
| WinDisplay.svelte | ✅ Complete | Count-up, colour tiers, no green border |
| WinCelebration.svelte | ✅ Complete | small/big/mega/epic + particles |
| ControlBar.svelte | ✅ Complete | Hover effects |
| App.svelte | ✅ Complete | Frame PNG, video BG, mobile layout |
| soundService.ts | ✅ Complete | Real MP3s — bgm/spin/reelStop/win/scatter/ui |
| translations.ts | ✅ Complete | 16 languages |
| Background video | ✅ Wired | 1000062179.mp4 playing at 35% opacity |
| Frame overlay | ✅ Wired | 1000062174.png over grid |
| Symbol PNGs | ✅ Wired | 10 symbols, 256×256 RGBA |
| Sounds | ✅ Wired | 6 MP3 files active |
| PAR Sheet | ✅ Complete | submission-package/FUTURE_SPINNER_PAR_SHEET.html |
| Submission package | ✅ Complete | Checklist + blurb |

## OUTSTANDING (manual steps only)
1. Upload artwork to Google Drive/Dropbox with public link
2. Upload dist/ + math publish files to Stake Engine portal
3. IP/trademark review — "Future Spinner" / "We Roll Spinners"
4. Test against real RGS endpoint (currently mock mode)
5. Optional: brew install --cask basictex → PDF version of PAR sheet

## SESSIONS LOG
| Session | Date | What was done |
|---------|------|--------------|
| Asset wiring | 2026-04-04 | Video, frame, sounds, win display fix |
| Full polish | 2026-04-03 | All visual tasks, loading screen, reel tumble |
| Bugfix | 2026-04-03 | Win display flicker fixed |
| Symbol Integration | 2026-04-03 | PNG sprites, hover, count-up |

## REPOSITORY
- Repo: https://github.com/JTOSHIE/stake-game-development-claude
- Frontend: ~/math-sdk/frontend/
- Branch: main
- Last commit: [git log --oneline -1]
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════
FUTURE SPINNER — ASSET WIRING SESSION COMPLETE
═══════════════════════════════════════════════════

TASK 1 — Background video wired:     [ done ]
TASK 2 — Frame PNG wired:            [ done ]
TASK 3 — Real sounds wired:          [ done ]
TASK 4 — Win display green fixed:    [ done ]
TASK 5 — Build passing:              [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════
