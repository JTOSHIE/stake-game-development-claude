// fsModes.ts - SINGLE SOURCE OF TRUTH for Future Spinner's bet modes.
//
// The FEATURES menu (FeatureMenu.svelte) AND the paytable BET MODES page (in
// PaytableModal.svelte) BOTH render every card and row from this one array, so
// adding, removing or renaming a mode is a one-line edit here - nothing else in
// the UI needs to change.
//
// `available: false` marks a mode whose maths is not shipped yet. Cruise,
// Overboost and Super all await FeatureMath v2; they render as dimmed "coming
// soon" placeholders and are never interactive. Flip `available: true` for a
// mode ONLY once the RGS actually serves its serverMode. Today only Normal
// (base) and Buy Overdrive (bonus) are runtime-live.
//
// NOTE: "Super Buy" is a PLACEHOLDER name pending the owner's final choice.
//
// ---------------------------------------------------------------------------
// HOW TO PROMOTE A PLACEHOLDER TO LIVE
//   1. Ship the matching BetMode in games/future_spinner so the server prices
//      and serves the mode's serverMode id.
//   2. Widen BetMode in stores/betMode.ts if the serverMode is new (already
//      done: base | bonus | cruise | antelite | super).
//   3. Flip `available: true` on the entry below.
//   The menu and the info page pick it up for free.
// ---------------------------------------------------------------------------

export type FsModeId = 'normal' | 'cruise' | 'overboost' | 'bonus' | 'super'

/** How a mode behaves in the FEATURES menu UI:
 *  - 'standing'  : a base spin mode you can select (Normal, Cruise).
 *  - 'enhancer'  : a persistent ON/OFF toggle that raises the standing bet.
 *  - 'buy'       : a one-shot purchase that guarantees Overdrive entry.
 */
export type FsModeKind = 'standing' | 'enhancer' | 'buy'

/** The maths mode ids the RGS understands (server prices the debit). */
export type FsServerMode = 'base' | 'bonus' | 'cruise' | 'antelite' | 'super'

export interface FsMode {
  /** Stable UI id - must stay in sync with the FsModeId union. */
  id: FsModeId
  /** Human-readable name shown on cards and the info page. */
  label: string
  /** UI behaviour class (see FsModeKind). */
  kind: FsModeKind
  /** Cost as a multiple of the base bet (server applies this). */
  cost: number
  /** Volatility tag shown on the card. */
  volatility: 'Low' | 'High' | 'Very High' | 'Extreme'
  /** One-line description for the card and the BET MODES info page. */
  blurb: string
  /** false = maths not shipped yet; render dimmed + "coming soon", non-interactive. */
  available: boolean
  /** Maths mode id sent to the RGS (via the selectedBetMode store). */
  serverMode: FsServerMode
}

export const FS_MODES: FsMode[] = [
  {
    id: 'normal',
    label: 'Normal',
    kind: 'standing',
    cost: 1.0,
    volatility: 'High',
    blurb: 'Standard play. Overdrive Free Spins trigger on 3+ scatters.',
    available: true,
    serverMode: 'base',
  },
  {
    id: 'cruise',
    label: 'Cruise',
    kind: 'standing',
    cost: 1.0,
    volatility: 'Low',
    blurb: 'A smoother ride: more frequent smaller wins, same 96.35% RTP.',
    available: false,
    serverMode: 'cruise',
  },
  {
    id: 'overboost',
    label: 'Overboost',
    kind: 'enhancer',
    cost: 1.25,
    volatility: 'High',
    blurb: 'Double-chance: about 1.6x the feature trigger rate.',
    available: false,
    serverMode: 'antelite',
  },
  {
    id: 'bonus',
    label: 'Buy Overdrive',
    kind: 'buy',
    cost: 100,
    volatility: 'Very High',
    blurb: 'Buy a guaranteed Overdrive Free Spins entry.',
    available: true,
    serverMode: 'bonus',
  },
  {
    id: 'super',
    label: 'Super Buy',
    kind: 'buy',
    cost: 400,
    volatility: 'Extreme',
    blurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.',
    available: false,
    serverMode: 'super',
  },
]

// ── Derived views (all read from FS_MODES; never duplicate the data) ─────────

/** Standing (base) modes - the modes you can set as your spin mode. */
export const STANDING_MODES = FS_MODES.filter((m) => m.kind === 'standing')
/** Enhancer toggles (persistent bet modifiers). */
export const ENHANCER_MODES = FS_MODES.filter((m) => m.kind === 'enhancer')
/** Buy tiers (guaranteed Overdrive entry). */
export const BUY_MODES = FS_MODES.filter((m) => m.kind === 'buy')

/** Shared RTP + max win, identical across all modes (see game_config.py). */
export const FS_RTP_LABEL = '96.35%'
export const FS_MAX_WIN_LABEL = '5,000×'
