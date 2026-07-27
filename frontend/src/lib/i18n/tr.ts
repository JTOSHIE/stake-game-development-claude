// tr.ts, shared, social-aware translate store.
//
// Wires the i18n helper t(locale, key, mode) to the active locale (gameStore)
// and the social-mode flag (socialMode store) in one place, so components do
// not each need bespoke social logic. Use it as `$tr('bet')`: it returns the
// social variant of a label when social mode is active, otherwise the standard
// label.

import { derived } from 'svelte/store'
import { locale } from '../stores/gameStore'
import { isSocial } from '../stores/socialMode'
import { t, type Translations } from './translations'

// `params` added 2026-07-28 (TR-099). `t()` has always interpolated `{name}`
// placeholders and this store simply never passed them through, so any string
// with a value in it had to be assembled in markup instead, which is how a
// player-visible sentence ends up half translated. Optional, so every existing
// `$tr('key')` call is unchanged.
export const tr = derived(
  [locale, isSocial],
  ([$locale, $social]) =>
    (key: keyof Translations, params?: Record<string, string | number>): string =>
      t($locale, key, $social ? 'social' : 'real', params),
)
