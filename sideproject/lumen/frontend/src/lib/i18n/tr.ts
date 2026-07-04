// tr.ts — shared, social-aware translate store.
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

export const tr = derived(
  [locale, isSocial],
  ([$locale, $social]) =>
    (key: keyof Translations): string =>
      t($locale, key, $social ? 'social' : 'real'),
)
