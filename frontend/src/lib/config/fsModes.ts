// fsModes.ts - SINGLE SOURCE OF TRUTH for Future Spinner's bet modes.
//
// The FEATURES menu (FeatureMenu.svelte) AND the paytable BET MODES page (in
// PaytableModal.svelte) BOTH render every card and row from this one array, so
// adding, removing or renaming a mode is a one-line edit here - nothing else in
// the UI needs to change.
//
// FeatureMath v2 shipped (2026-07-07): all five modes are now runtime-live.
// Cruise, OVERBOOST and NITRO OVERDRIVE are served by games/future_spinner
// (see FUTURE_SPINNER_PAR_SHEET.md); `available: true` reflects that.
//
// ---------------------------------------------------------------------------
// HOW TO PROMOTE A PLACEHOLDER TO LIVE (kept for the next mode added)
//   1. Ship the matching BetMode in games/future_spinner so the server prices
//      and serves the mode's serverMode id.
//   2. Widen BetMode in stores/betMode.ts if the serverMode is new.
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
  /** Social-casino (stake.us) override for `label`, per Fable's wording
   *  ruling (2026-07-14b, ITEM C). Omit when the real-money label has no
   *  prohibited-term conflict - the base label is used in social mode too. */
  socialLabel?: string
  /** Social-casino (stake.us) override for `blurb`, per the same ruling.
   *  Real-money `blurb` is never changed; consumers branch on `isSocial`. */
  socialBlurb?: string
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
    socialBlurb: 'A smoother ride: more frequent smaller prizes, same 96.35% RTP.',
    available: true,
    serverMode: 'cruise',
  },
  {
    id: 'overboost',
    label: 'OVERBOOST',
    kind: 'enhancer',
    cost: 1.25,
    volatility: 'High',
    blurb: 'Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.',
    socialBlurb: 'Double-chance: about 1.6x the feature trigger rate. Costs 1.25x every spin while ON.',
    available: true,
    serverMode: 'antelite',
  },
  {
    id: 'bonus',
    label: 'Buy Overdrive',
    kind: 'buy',
    cost: 100,
    volatility: 'Very High',
    blurb: 'Buy a guaranteed Overdrive Free Spins entry.',
    socialLabel: 'Get Overdrive',
    socialBlurb: 'Get a guaranteed Overdrive Free Spins entry.',
    available: true,
    serverMode: 'bonus',
  },
  {
    id: 'super',
    label: 'NITRO OVERDRIVE',
    kind: 'buy',
    cost: 400,
    volatility: 'Extreme',
    blurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.',
    socialBlurb: 'Get a rich entry with the Overdrive meter pre-revved to 5x.',
    available: true,
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

/** Cost multiplier per server mode id (the server applies the real debit; this
 * is for the UI to show/compute the correct price BEFORE the spin request). */
export const MODE_COST = FS_MODES.reduce(
  (acc, m) => ((acc[m.serverMode] = m.cost), acc),
  {} as Record<FsServerMode, number>,
)

/** Shared RTP + max win, identical across all modes (see game_config.py). */
export const FS_RTP_LABEL = '96.35%'
export const FS_MAX_WIN_LABEL = '5,000×'

/**
 * OWNER AUDIT ROUND 4, item 4 (market-convention ruling, 2026-07-26).
 *
 * Where the cap is quoted next to a MODE COST it must be unambiguous about what
 * the multiplier applies to, because the buy tiers cost 100x and 400x and a bare
 * "5,000x" invites the reading "5,000x the 400x I just paid". Market convention
 * is to state the base bet explicitly. Used by the two buy confirmation dialogs
 * and the paytable mode cards.
 *
 * Deliberately NOT used by the in-feature MAX WIN element or the paytable's
 * general rules row: those sit alone rather than beside a cost multiplier, and
 * the ruling keeps the short "MAX WIN 5,000x" form there.
 *
 * "bet" is on the stake.us prohibited-terms table, so the social variant says
 * "base play". Both forms route through here so the pair cannot drift.
 */
export function maxWinVsBaseBetLabel(social: boolean): string {
  return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet`
}

/**
 * TR-037 (2026-07-25). The per-mode cards rendered the whole phrase as the VALUE
 * and clipped it to "5,000x ba..." on every card at 1280x720, so the one figure
 * of the required three that a player could not read was the max win. The
 * platform requires cost, RTP and max win to be DISPLAYED to the player, and a
 * value truncated mid-word is not displayed.
 *
 * The qualifier moves to the stat label, where it has a whole line to itself,
 * and the value becomes the bare figure, which is the same width class as the
 * cost values beside it and so cannot clip. Both social forms still route
 * through one place so the pair cannot drift, which is why this is a function
 * rather than a literal in the component.
 */
export function maxWinStatLabel(): string {
  return 'Max Win'
}

/**
 * The qualifier as a single footnote under the mode grid, rather than repeated
 * in five column labels.
 *
 * The first attempt at TR-037 moved "base bet" from the value into the label and
 * simply moved the truncation with it: the value read in full at last, and the
 * label clipped to "MAX WIN (BASE BE". A four-column stat row has no room for a
 * qualified label, and repeating the same six words five times was never the
 * right shape anyway. One footnote reads better and cannot clip.
 */
export function maxWinFootnote(social: boolean): string {
  return social
    ? 'Max win is quoted against the base play amount.'
    : 'Max win is quoted against the base bet.'
}

/** OWNER AUDIT ROUND 3, item 2 (naming uniformity): the single source of
 * truth for the in-feature HUD field labels, so portrait/compact-landscape/
 * desktop templates render the exact same string instead of independently
 * hand-typed copies that can silently drift (portrait previously said
 * "OVERDRIVE FREE SPINS", desktop said just "FREE SPINS" - same field). */
// REMOVED 2026-07-28 (TR-091): HUD_LABEL_FREE_SPINS and HUD_LABEL_TOTAL_WIN.
// They were second copies of strings that already exist in all sixteen locales
// as `overdriveFreeSpins` and `totalWin` in the feature block of
// src/lib/i18n/translations.ts, and being constants in a .ts module they were
// unreachable by the locale gate, which only opened .svelte files. The one
// consumer, BonusInstrumentColumn, now asks the tr layer like everything else.

/** Resolves a mode's displayed label/blurb for the current social-mode
 * state - the single place both FeatureMenu.svelte and PaytableModal.svelte
 * branch on `isSocial`, so the two consumers can never drift out of sync.
 * Real-money strings (`label`/`blurb`) are always the fallback; the social
 * override is used only when one exists AND social mode is active. */
export function modeLabel(m: FsMode, social: boolean): string {
  return social && m.socialLabel ? m.socialLabel : m.label
}
export function modeBlurb(m: FsMode, social: boolean): string {
  return social && m.socialBlurb ? m.socialBlurb : m.blurb
}
