// modalGuard.ts - one shared answer to "is a blocking surface open?" (R8/TR-016)
//
// WHY THIS EXISTS
//
// App.svelte's spacebar handler and the autoplay scheduler each carried their
// own hand-maintained list of things that should suppress them. The spacebar
// list named six surfaces:
//
//   showPaytable, showThemeSelector, isWincap, featureActive,
//   showIntroSplash, showHeroSplash
//
// Every blocking surface whose open state is COMPONENT-LOCAL was missing from
// it, because a local `let` cannot be named from App.svelte at all: the buy
// confirm dialog, the FEATURES menu, the autoplay menu, the HUD menu, the
// session panel and the reality check. So spacebar span the reels underneath an
// open buy dialog, and autoplay kept scheduling while a reality check sat on
// screen waiting to be acknowledged.
//
// A hand-maintained list in one file cannot see private state in another, so it
// was always going to drift. Surfaces now REGISTER themselves, which inverts the
// dependency: a new modal announces itself rather than needing App.svelte to be
// told about it.

import { writable, derived } from 'svelte/store'

/** Ids of every blocking surface currently open. */
const openModals = writable<Set<string>>(new Set())

/**
 * Declare whether a blocking surface is open. Call reactively from the owning
 * component, e.g. `$: setModalOpen('buy-confirm', showConfirm)`. Idempotent, so
 * a reactive statement re-running with the same value costs nothing.
 */
export function setModalOpen(id: string, open: boolean): void {
  openModals.update((s) => {
    if (open === s.has(id)) return s
    const next = new Set(s)
    if (open) next.add(id)
    else next.delete(id)
    return next
  })
}

/** True while ANY registered blocking surface is open. */
export const anyModalOpen = derived(openModals, ($s) => $s.size > 0)

/** The open ids, for diagnostics and for the conformance proof. */
export const openModalIds = derived(openModals, ($s) => [...$s].sort())

/** Test helper: clear all registrations. Not used by production code. */
export function resetModalGuard(): void {
  openModals.set(new Set())
}
