import { writable } from 'svelte/store'

/** Texture preload progress, 0–100.  Updated by GameGrid during Assets.load(). */
export const assetLoadProgress = writable<number>(0)
