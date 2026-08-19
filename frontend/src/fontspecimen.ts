// FONT SPECIMEN ENTRY. DEV AND SCREENSHOT ONLY, NEVER SHIPPED.
//
// Same mechanism as src/c1preview.ts, which has carried a dev-only harness since
// R14 without ever reaching dist: `vite build` takes index.html as its single
// entry, so an html file that nothing imports is not in the build graph and
// neither are its imports. scripts/dist_hygiene_gate.mjs and the build diet
// verifier both read the built dist, and reports/screens/fonts-2026-08-15/
// SPECIMEN.md records the before-and-after dist measurement that proves it.
//
// Run: npx vite (dev), then open /fontspecimen.html
//
// THE CANDIDATE FACES ARE IMPORTED HERE AND NOWHERE ELSE. Every one is a
// devDependency. --fs-font-display and --fs-font-numeric are untouched by this
// file and by everything it mounts: the specimen sets its own font-family on its
// own subtree only, so nothing about the shipped typography changes.
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/oxanium/400.css'
import '@fontsource/oxanium/700.css'
import '@fontsource/chakra-petch/400.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource/saira/400.css'
import '@fontsource/saira/700.css'
import '@fontsource/saira/900.css'
import '@fontsource/exo-2/400.css'
import '@fontsource/exo-2/700.css'
import '@fontsource/exo-2/900.css'
import '@fontsource/rajdhani/400.css'
import '@fontsource/rajdhani/700.css'
import '@fontsource/michroma/400.css'

import { mount } from 'svelte'
import './app.css'
import FontSpecimen from './FontSpecimen.svelte'

const app = mount(FontSpecimen, {
  target: document.getElementById('app')!,
})

export default app
