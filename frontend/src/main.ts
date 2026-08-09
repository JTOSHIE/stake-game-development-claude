// Self-hosted Orbitron font weights (Stake Engine CDN-only compliance)
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'

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
