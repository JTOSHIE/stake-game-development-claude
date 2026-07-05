// lumenModes.ts — SINGLE SOURCE OF TRUTH for LUMEN's bet modes.
//
// This is the base-template placeholder architecture: the FEATURES menu
// (FeatureMenu.svelte) and the BET MODES info page (in PaytableModal.svelte)
// BOTH render from this one array, and the betMode store derives its selectable
// modes + costs from it. To add or remove a playable mode you edit ONLY this
// array (and widen the LumenModeId union below to match) — nothing else needs to
// change in the UI.
//
// LUMEN ships EXACTLY the four modes defined in games/lumen/game_config.py:
//   surface (base 1.0x) · deepdive (enhancer 1.5x) · bloom (buy 100x) ·
//   abyssalbloom (buy 300x). All four return the same 96.35% RTP.
//
// ── HOW TO ADD A PLACEHOLDER MODE ──────────────────────────────────────────
//   1. Add the id to the LumenModeId union below, e.g. `| 'tidalbloom'`.
//   2. Append an entry to LUMEN_MODES, e.g.:
//        { id: 'tidalbloom', label: 'Tidal Bloom', kind: 'buy', cost: 500,
//          volatility: 'Extreme', blurb: 'Buy the richest guaranteed entry.' },
//   3. Add the matching BetMode to games/lumen (maths) so the server prices it.
//   That is the whole change — the menu and the info page pick it up for free.
// ---------------------------------------------------------------------------

/** How a mode behaves in the UI:
 *  - 'standing'  : the default spin mode (the base game).
 *  - 'enhancer'  : a persistent ON/OFF toggle that raises the standing bet.
 *  - 'buy'       : a one-shot purchase that guarantees feature entry.
 */
export type ModeKind = 'standing' | 'enhancer' | 'buy'

/** The maths mode ids, verbatim from games/lumen/game_config.py. */
export type LumenModeId = 'surface' | 'deepdive' | 'bloom' | 'abyssalbloom'

export interface LumenMode {
  /** Maths mode id — must match games/lumen and the betMode store. */
  id: LumenModeId
  /** Human-readable name shown on cards and the info page. */
  label: string
  /** UI behaviour class (see ModeKind). */
  kind: ModeKind
  /** Cost as a multiple of the base bet (server applies this). */
  cost: number
  /** Volatility tag shown on the card. */
  volatility: 'High' | 'Very High' | 'Extreme'
  /** One-line description for the card and the BET MODES info page. */
  blurb: string
}

export const LUMEN_MODES: LumenMode[] = [
  {
    id: 'surface',
    label: 'Surface',
    kind: 'standing',
    cost: 1.0,
    volatility: 'High',
    blurb: 'Standard play. The Bloom triggers on 3+ Spore Scatters.',
  },
  {
    id: 'deepdive',
    label: 'Deep Dive',
    kind: 'enhancer',
    cost: 1.5,
    volatility: 'High',
    blurb: 'Descend deeper - roughly double the chance to trigger The Bloom.',
  },
  {
    id: 'bloom',
    label: 'Bloom',
    kind: 'buy',
    cost: 100,
    volatility: 'Very High',
    blurb: 'Buy guaranteed entry into The Bloom free spins.',
  },
  {
    id: 'abyssalbloom',
    label: 'Abyssal Bloom',
    kind: 'buy',
    cost: 300,
    volatility: 'Extreme',
    blurb: 'Buy a rich guaranteed entry (more scatters, higher starting GLOW).',
  },
]

// ── Derived views (all read from LUMEN_MODES; never duplicate the data) ──────

/** The one standing (base) mode. */
export const STANDING_MODE = LUMEN_MODES.find((m) => m.kind === 'standing') as LumenMode
/** Enhancer toggles (persistent bet modifiers). LUMEN ships one: Deep Dive. */
export const ENHANCER_MODES = LUMEN_MODES.filter((m) => m.kind === 'enhancer')
/** Buy tiers (guaranteed feature entry). */
export const BUY_MODES = LUMEN_MODES.filter((m) => m.kind === 'buy')

/** Cost multiplier per mode id (server applies the real debit). */
export const MODE_COST = LUMEN_MODES.reduce(
  (acc, m) => ((acc[m.id] = m.cost), acc),
  {} as Record<LumenModeId, number>,
)

/** Shared RTP + max win, identical across all modes (see game_config.py). */
export const LUMEN_RTP_LABEL = '96.35%'
export const LUMEN_MAX_WIN_LABEL = '10,000×'
