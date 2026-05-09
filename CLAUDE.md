
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
