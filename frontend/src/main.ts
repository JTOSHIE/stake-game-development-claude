// Self-hosted font faces (Stake Engine CDN-only compliance: @fontsource bundles
// the woff2 into dist and serves it same-origin, which is what that rule asks).
//
// TWO FACES, TWO JOBS, R071 TASK 4 on the owner's ruling.
//
// ORBITRON stays the BRAND and HEADING face. It is the identity.
//
// EXO 2 takes every MONEY and COUNTING surface, because Orbitron cannot hold a
// counter still: measured at 100px its ten digits span 44.30px, `0` at 83.4
// against `1` at 39.1, and it carries no OpenType `tnum` to correct them, so
// `font-variant-numeric: tabular-nums` is inert on it (TR-089, re-measured in
// reports/screens/fonts-2026-08-15/SPECIMEN.md). Exo 2 has a real `tnum`: the
// same measurement takes its digits from a 21.69 spread to 0.50.
//
// SUBSETS ARE EXPLICIT rather than taking the package's default bundle, which
// would pull vietnamese and cyrillic-ext as well. latin and latin-ext carry the
// twelve Latin-script locales; cyrillic carries ru, which Orbitron never could.
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/exo-2/latin-400.css'
import '@fontsource/exo-2/latin-700.css'
import '@fontsource/exo-2/latin-900.css'
import '@fontsource/exo-2/latin-ext-400.css'
import '@fontsource/exo-2/latin-ext-700.css'
import '@fontsource/exo-2/latin-ext-900.css'
import '@fontsource/exo-2/cyrillic-400.css'
import '@fontsource/exo-2/cyrillic-700.css'
import '@fontsource/exo-2/cyrillic-900.css'

import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { installWalletTimeout } from './lib/services/walletTimeout'


// Before the app mounts, so the very first wallet call (authenticate, issued
// from App's onMount) is already covered. See walletTimeout.ts: a stalled wallet
// endpoint otherwise leaves the game locked with the stake gone and no banner.
installWalletTimeout()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
