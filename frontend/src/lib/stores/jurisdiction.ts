// jurisdiction.ts — non-locked store for RGS jurisdiction flags.
//
// The locked rgsService.initRGS() writes the flags surfaced by the authenticate
// response here (sanctioned additive passthrough, mirroring rgsBetLevels). The
// buy UI and rules hide the bonus buy entirely when disabledBuyFeature is true.
// Defaults keep the buy visible where no restriction is present (dev/mock).

import { writable, derived } from 'svelte/store'

export interface JurisdictionFlags {
  disabledBuyFeature?: boolean
  [k: string]: unknown
}

export const jurisdictionFlags = writable<JurisdictionFlags>({})

/** True when the bonus buy must be fully hidden (feature-buy jurisdictions). */
export const buyFeatureDisabled = derived(
  jurisdictionFlags,
  ($f) => $f.disabledBuyFeature === true,
)
