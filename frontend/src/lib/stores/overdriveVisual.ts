import { writable } from 'svelte/store'

// Shared Overdrive visual flag. App.svelte mirrors its local
// overdriveVisualActive into this store so both the HUD (fs-hud--overdrive)
// and the paytable (fs-pt--overdrive) flip from one source of truth.
export const overdriveVisual = writable(false)
