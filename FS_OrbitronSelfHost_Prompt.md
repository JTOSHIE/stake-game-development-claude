# FS — Orbitron Font Self-Host (Stake Engine XSS Compliance Fix)

**Priority:** 🔴 CRITICAL — blocks Stake Engine submission
**Estimated time:** 30–45 minutes
**Session type:** Single session, contained scope
**Run order:** First. Run this BEFORE the Bet Replay prompt.

---

## Why this is required

Stake Engine Approval / Frontend & RGS Requirements state explicitly:

> *"All images and fonts must be loaded from the Stake Engine Content Delivery Network (CDN)."*
>
> *"Cross-Site-Scripting (XSS): Stake Engine enforces a strict XSS policy. The game build must consist only of static files and cannot reach external sources. Common issues include downloading fonts from external servers, which logs console errors."*

Future Spinner currently loads Orbitron from `fonts.googleapis.com` / `fonts.gstatic.com`. The reviewer's network-tab check will catch this immediately and the game will fail static-files-only review.

The fix: bundle Orbitron with the build using `@fontsource/orbitron` so the `.woff2` files are served from the same origin as the game, with zero external network requests.

---

## Pre-authorisations

- ✅ Overwrite ANY non-locked file without asking
- ✅ Install npm packages without asking (specifically `@fontsource/orbitron`)
- ✅ Run `npm install`, `npm run dev`, `npm run build`, `tsc`, `git` without asking
- ✅ Delete external font references from any non-locked file
- ✅ Edit `index.html`, `App.svelte`, any `.svelte` / `.ts` / `.css` file

## Hard locks — DO NOT MODIFY

- `src/lib/services/rgsService.ts`
- `src/lib/stores/gameStore.ts`
- Anything under `~/math-sdk/games/future_spinner/` (the entire Math SDK)
- `library/publish_files/`

If a font reference appears to be inside a locked file (it shouldn't be), STOP and report.

## Three-Strike Rule

If the same TypeScript or build error occurs three times, STOP, report what was tried, and do not attempt a fourth fix.

---

## Tasks

### Task 1 — Audit current external font usage

Run from `~/math-sdk/frontend/`:

```bash
cd ~/math-sdk/frontend
echo "=== Google Fonts <link> tags ==="
grep -rn "fonts.googleapis.com" --include="*.html" --include="*.svelte" --include="*.ts" --include="*.js" --include="*.css" .
echo "=== Google Fonts @import & gstatic ==="
grep -rn "fonts.gstatic.com\|@import.*fonts" --include="*.svelte" --include="*.ts" --include="*.css" --include="*.html" .
echo "=== Direct Orbitron family references (these stay — informational only) ==="
grep -rn "Orbitron" --include="*.html" --include="*.svelte" --include="*.ts" --include="*.css" .
```

Report every file path returned by the first two greps. These are the files needing edits.

The third grep (Orbitron family references) is informational — `font-family: 'Orbitron'` declarations stay; they will resolve to the bundled font once Fontsource is installed.

### Task 2 — Install Fontsource Orbitron

```bash
cd ~/math-sdk/frontend
npm install @fontsource/orbitron
```

This package ships self-hosted `.woff2` files for all Orbitron weights, with `@font-face` declarations included as importable CSS files. Vite bundles these into `dist/assets/` automatically with content hashing.

### Task 3 — Import the required weights in the entry point

Future Spinner uses Orbitron weights **400, 700, 900** (per CLAUDE_PROJECT_INSTRUCTIONS_v4 §7).

First identify the entry file:

```bash
cat src/main.ts 2>/dev/null | head -10 || cat src/main.js 2>/dev/null | head -10
```

At the very top of the entry file (`src/main.ts` or `src/main.js`), BEFORE any other imports, add:

```ts
// Self-hosted Orbitron font weights (Stake Engine CDN-only compliance)
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
```

These imports are CSS-side-effect imports — they register `@font-face` rules with the browser. The `font-family: 'Orbitron'` declarations elsewhere in the codebase will then resolve to the bundled font.

### Task 4 — Remove every external Orbitron reference

For each file the audit in Task 1 returned, remove the external reference:

**`index.html`** (likely at `~/math-sdk/frontend/index.html`):

Remove every line matching any of these patterns:
- `<link href="https://fonts.googleapis.com/...">` (the actual Orbitron stylesheet link)
- `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`

**Any `.svelte`, `.ts`, `.js`, `.css` file:**

Remove every line matching:
- `@import url('https://fonts.googleapis.com/...');`
- `@import url("https://fonts.googleapis.com/...");`

**DO NOT remove** `font-family: 'Orbitron'`, `font-family: Orbitron, sans-serif`, or similar family declarations. Those still apply to the bundled font and must remain.

After each edit, run `npx tsc --noEmit` to confirm no TypeScript regressions.

### Task 5 — Verify no external font references remain

Re-run the audit from Task 1:

```bash
echo "=== POST-FIX: Google Fonts <link> tags ==="
grep -rn "fonts.googleapis.com" --include="*.html" --include="*.svelte" --include="*.ts" --include="*.js" --include="*.css" .
echo "=== POST-FIX: Google Fonts @import & gstatic ==="
grep -rn "fonts.gstatic.com\|@import.*fonts" --include="*.svelte" --include="*.ts" --include="*.css" --include="*.html" .
```

Both must return ZERO matches. If either still has hits, repeat Task 4 for those files.

### Task 6 — Build and verify network tab

```bash
cd ~/math-sdk/frontend
npm run build
```

Verify the build completes with zero errors. Confirm the bundled font files made it into the dist:

```bash
find dist -name "*orbitron*" -type f
```

You should see `.woff2` files (filenames will be hashed, e.g. `orbitron-latin-400-normal-abc123.woff2`).

Then test the dev server:

```bash
npm run dev
```

Open the localhost URL in Chrome. Open DevTools:

1. **Network tab** → filter by "Font" → refresh the page
   - **PASS:** zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`. All font requests go to localhost only.
   - **FAIL:** any request to either external domain. Repeat Task 4.

2. **Console tab**
   - **PASS:** no warnings or errors mentioning fonts, `@font-face`, or CORS related to fonts.
   - **FAIL:** any font-related console output. Investigate and resolve.

3. **Visual check**
   - Numbers (balance, win, bet) display in Orbitron as before. If they now render in a fallback font, the `font-family` declaration may be lowercase-mismatched (e.g. `'orbitron'` vs `'Orbitron'`) or the import didn't run. Verify the imports in main.ts.

### Task 7 — Update CLAUDE.md to prevent regression

Append this block to the bottom of `~/math-sdk/CLAUDE.md`:

```markdown

## FONTS POLICY (Stake Engine compliance — DO NOT REGRESS)

All fonts must be self-hosted via @fontsource. External font URLs are
forbidden and will fail Stake Engine XSS / static-files-only review.

### Forbidden patterns

- `<link href="https://fonts.googleapis.com/...">` in HTML
- `@import url('https://fonts.googleapis.com/...')` in CSS
- Any reference to fonts.googleapis.com, fonts.gstatic.com, or any
  external font CDN
- Loading font files from any URL not on the same origin as the build

### Adding a new font weight

1. Confirm the font/weight exists at https://fontsource.org
2. Install: `npm install @fontsource/<font-name>`
3. Import in src/main.ts: `import '@fontsource/<font-name>/<weight>.css'`
4. Reference normally with `font-family: '<Font Name>', sans-serif;`

### Verification before commit

Run from frontend/:
```bash
grep -rn "fonts.googleapis.com\|fonts.gstatic.com" --include="*.html" --include="*.svelte" --include="*.ts" --include="*.css" .
```
Output must be empty. If anything matches, fix before committing.
```

### Task 8 — Git commit

```bash
cd ~/math-sdk
git add -A
git status
git commit -m "fix(frontend): self-host Orbitron font for Stake Engine XSS compliance

Replace Google Fonts external link/imports with @fontsource/orbitron
bundled weights (400, 700, 900). Removes all external font network
requests which would fail Stake Engine static-files-only review.

Updated CLAUDE.md with fonts policy block to prevent regression."
git push origin main
```

### Task 9 — Update status doc

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

Then edit the local copy at `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

1. Mark the Orbitron self-host item as ✅ Complete with today's date
2. Move it from Outstanding to Resolved
3. Update the Stake Engine Compliance section to show fonts as compliant

Re-copy to Desktop after editing:

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

---

## Final checklist

- [ ] `grep -rn "fonts.googleapis.com" .` returns zero matches
- [ ] `grep -rn "fonts.gstatic.com" .` returns zero matches
- [ ] `@fontsource/orbitron` installed (visible in package.json)
- [ ] Imports added to src/main.ts (or main.js)
- [ ] `npm run build` completes with zero errors
- [ ] `find dist -name "*orbitron*"` shows bundled .woff2 files
- [ ] Network tab shows zero external font requests in dev server
- [ ] Console shows zero font-related errors or warnings
- [ ] Numbers still render in Orbitron (visual check)
- [ ] CLAUDE.md updated with fonts policy
- [ ] rgsService.ts NOT modified (verify with `git diff src/lib/services/rgsService.ts` — should be empty)
- [ ] gameStore.ts NOT modified (verify with `git diff src/lib/stores/gameStore.ts` — should be empty)
- [ ] Git committed and pushed
- [ ] Status doc copied to ~/Desktop/

When all items are checked, report completion and stand by for the next prompt (FS_BetReplay_Prompt.md).
