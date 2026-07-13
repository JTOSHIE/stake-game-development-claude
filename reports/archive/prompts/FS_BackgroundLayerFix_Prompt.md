# FUTURE SPINNER — BACKGROUND LAYER FIX
## Read this file completely before touching any code.
## Execute every task in order. April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## THE PROBLEM

The cyberpunk rain street video (Future Spinner background) is bleeding
through underneath ALL themes. Every theme shows the rain street video
ghosted behind its own background image.

Root cause: The `<video>` element is ALWAYS mounted in the DOM and
always playing. The JPG image for other themes is being layered ON TOP
of the video rather than REPLACING it. The video is never destroyed.

---

## STEP 0 — READ App.svelte

```bash
cat ~/math-sdk/frontend/src/App.svelte
```

Find the background section. Look for ALL of:
- `<video>` elements
- `bg-video` class references
- `bg-layer` or `bg-wrapper` divs
- Any reference to `bg_rain_street_v2.mp4`
- Any reference to `prefersReducedMotion`

Report exactly what you find. There may be MORE THAN ONE video element
or background layer — find every single one before making any changes.

---

## TASK 1 — REMOVE VIDEO FROM DOM FOR NON-FUTURE-SPINNER THEMES

Find the background rendering block in App.svelte. The correct
implementation is to use Svelte's `{#if}` to conditionally mount OR
unmount the entire video element — not show/hide with CSS.

Replace the entire background section with this exact block:

```svelte
<!-- ── Background layer ─────────────────────────────────────────────────── -->
<div class="bg-layer">
  {#if $activeTheme.id === 'future-spinner'}
    <!-- Video background — only mounted for future-spinner -->
    <video
      class="bg-media"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    >
      <source src="assets/themes/future-spinner/backgrounds/bg-1.mp4" type="video/mp4" />
      <source src="assets/videos/bg_rain_street_v2.mp4" type="video/mp4" />
    </video>
  {:else}
    <!-- Static image background — all other themes -->
    <!-- Image is ONLY element, video is NOT in DOM -->
    <img
      class="bg-media"
      src="{$themeAssets.background}"
      alt=""
      aria-hidden="true"
    />
  {/if}
  <!-- Dark overlay to ensure game readability -->
  <div class="bg-overlay" aria-hidden="true"></div>
</div>
```

**CRITICAL:** The `{#if}` / `{:else}` ensures the `<video>` element is
completely removed from the DOM when another theme is active. It is NOT
just hidden with CSS — it is unmounted entirely so it cannot play or
bleed through.

---

## TASK 2 — CHECK FOR ANY SECOND VIDEO ELEMENT

After making Task 1's change, search the entire App.svelte for any
other video references:

```bash
grep -n "video\|bg_rain\|mp4\|prefersReducedMotion" \
  ~/math-sdk/frontend/src/App.svelte
```

If ANY additional `<video>` elements or `.mp4` references are found
outside the block you just wrote, remove them completely.

Also check main.ts and any other top-level files:
```bash
grep -rn "video\|bg_rain\|\.mp4" \
  ~/math-sdk/frontend/src/ \
  --include="*.svelte" \
  --include="*.ts" \
  | grep -v "themeStore\|themes.ts\|node_modules"
```

Remove any stray video elements found. There must be ZERO `<video>`
elements in the DOM when a non-future-spinner theme is active.

---

## TASK 3 — VERIFY CSS FOR bg-media AND bg-overlay

Find the CSS for `.bg-media` and `.bg-layer` in App.svelte.
Ensure these styles exist and are correct:

```css
/* Background layer — sits behind everything */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* bg-media covers the full viewport — works for both img and video */
.bg-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  pointer-events: none;
  display: block;
}

/* Dark overlay so game grid is always readable */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}
```

Remove any OLD CSS that referenced `.bg-video` by class if it still
exists, to avoid conflicts.

---

## TASK 4 — TSC + BUILD + COMMIT

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any TypeScript errors autonomously.

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(themes): unmount video element for non-future-spinner themes — no bleed-through"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
BACKGROUND LAYER FIX COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1 — Video replaced with {#if}/{:else} — not CSS hide:  [ done ]
TASK 2 — Zero stray video elements in non-FS themes:        [ done ]
TASK 3 — CSS bg-media correct for both img and video:       [ done ]
TASK 4 — Build clean, committed:                            [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

RESULT:
  future-spinner → video plays, rain street background ✅
  trap-lane      → video REMOVED from DOM, stadium JPG only ✅
  oil-and-fire   → video REMOVED from DOM, UN building JPG only ✅
  beautiful-game → video REMOVED from DOM, stadium crowd JPG only ✅

═══════════════════════════════════════════════════════════════════
