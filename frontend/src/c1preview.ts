// C1 preview harness entry (dev/screenshot only). NOT wired into the production
// build inputs, so `npm run build` output is unaffected. Run via `vite` dev and
// navigate to /c1preview.html?tier=big|mega|epic|max.
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'

import { mount } from 'svelte'
import './app.css'
import C1Preview from './C1Preview.svelte'

const app = mount(C1Preview, {
  target: document.getElementById('app')!,
})

export default app
