# FUTURE SPINNER — FIX BACKGROUND VIDEO
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — DIAGNOSE

```bash
# Check what the bg video section looks like in App.svelte
grep -n "bg-video\|bgVideo\|bg_animated\|bg-media\|activeTheme\|future-spinner\|crossfade\|bgVideo1Active" \
  ~/math-sdk/frontend/src/App.svelte | head -30

# Check the video file exists
ls -lh ~/math-sdk/frontend/public/assets/videos/
```

Report findings.

---

## FIX — Restore background video

The dual-video crossfade system was working but has broken — most
likely the `bgVideo1Active` reactive variable or the `loadedmetadata`
event listener was lost during a recent App.svelte edit.

Read the full background video section of App.svelte, then apply
whichever of these is missing:

**1. If the video elements are missing from the template**, restore:

```svelte
{#if $activeTheme.id === 'future-spinner'}
  <div class="bg-video-container">
    <video
      bind:this={bgVideo1}
      class="bg-video"
      class:active={bgVideo1Active}
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
    </video>
    <video
      bind:this={bgVideo2}
      class="bg-video"
      class:active={!bgVideo1Active}
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/videos/bg_animated_loop.mp4" type="video/mp4" />
    </video>
  </div>
{:else}
  <img
    class="bg-media"
    src="{$themeAssets.background}"
    alt=""
    aria-hidden="true"
  />
{/if}
```

**2. If the script variables are missing**, add to the script section:

```typescript
let bgVideo1: HTMLVideoElement
let bgVideo2: HTMLVideoElement
let bgVideo1Active = true
let crossfadeInterval: ReturnType<typeof setInterval> | null = null
```

**3. If the onMount crossfade logic is missing**, add inside onMount:

```typescript
// Crossfade — offset video2 by half duration to eliminate loop jump
setTimeout(() => {
  if (bgVideo1 && bgVideo2) {
    const startCrossfade = () => {
      if (bgVideo1.duration > 0) {
        bgVideo2.currentTime = bgVideo1.duration / 2
        crossfadeInterval = setInterval(() => {
          if (!bgVideo1 || !bgVideo2) return
          if (bgVideo1Active && bgVideo1.duration > 0 &&
              bgVideo1.currentTime > bgVideo1.duration - 1.5) {
            bgVideo1Active = false
          } else if (!bgVideo1Active && bgVideo2.duration > 0 &&
                     bgVideo2.currentTime > bgVideo2.duration - 1.5) {
            bgVideo1Active = true
          }
        }, 100)
      }
    }
    if (bgVideo1.readyState >= 1) {
      startCrossfade()
    } else {
      bgVideo1.addEventListener('loadedmetadata', startCrossfade, { once: true })
    }
  }
}, 100)
```

**4. If onDestroy cleanup is missing**, add:

```typescript
onDestroy(() => {
  if (crossfadeInterval) clearInterval(crossfadeInterval)
})
```

**5. Confirm the CSS exists:**

```css
.bg-video-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.5s ease;
  pointer-events: none;
}

.bg-video.active {
  opacity: 0.85;
}
```

**6. Confirm :global(body) has no background-image set:**

```bash
grep -n "background-image\|background.*url\|bg1_main\|CYBER" \
  ~/math-sdk/frontend/src/App.svelte | head -10
```

If any background-image is found on body, remove it.

---

## BUILD + COMMIT

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(bg): restore background video — crossfade system"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
BACKGROUND VIDEO RESTORED
═══════════════════════════════════════════════════════════════════
TSC: [ 0 errors ] | BUILD: [ pass ] | COMMIT: [ pushed ]
═══════════════════════════════════════════════════════════════════
