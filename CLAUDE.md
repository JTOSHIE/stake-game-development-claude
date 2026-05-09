
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
