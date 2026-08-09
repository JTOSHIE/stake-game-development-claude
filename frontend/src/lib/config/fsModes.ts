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
import { t, type Locale } from '../i18n/translations'
import type { ProseKey } from '../i18n/prose'

export type FsServerMode = 'base' | 'bonus' | 'cruise' | 'antelite' | 'super'

export interface FsMode {
  /** Stable UI id - must stay in sync with the FsModeId union. */
  id: FsModeId
  /** Prose key for the name shown on cards and the info page. Resolved through
   *  `t()` so the label is localised in all sixteen locales and picks up its
   *  social variant from the same table as every other string. Was a literal
   *  English `label` until JOB 2 (2026-07-28); round three reviewer 3 cited
   *  `config/fsModes.ts:59-115` by name as English-only mode descriptions. */
  labelKey: ProseKey
  /** UI behaviour class (see FsModeKind). */
  kind: FsModeKind
  /** Cost as a multiple of the base bet (server applies this). */
  cost: number
  /** Volatility tag shown on the card. */
  volatility: 'Low' | 'High' | 'Very High' | 'Extreme'
  /** Prose key for the one-line description on the card and the BET MODES info
   *  page. Same treatment as `labelKey`. */
  blurbKey: ProseKey
  //
  // `socialLabel` and `socialBlurb` are GONE. They were a second social
  // mechanism living beside `SOCIAL_OVERRIDES`, and a second mechanism is a
  // second thing to forget: these five modes were the only strings in the game
  // whose social variant did NOT come from the i18n layer, and they were also
  // English-only in all sixteen locales. Both facts had the same cause. The
  // social variants now live in `PROSE_SOCIAL` beside every other social
  // string, keyed by the same `blurbKey`/`labelKey`.
  /** false = maths not shipped yet; render dimmed + "coming soon", non-interactive. */
  available: boolean
  /** Maths mode id sent to the RGS (via the selectedBetMode store). */
  serverMode: FsServerMode
}

export const FS_MODES: FsMode[] = [
  {
    id: 'normal',
    labelKey: 'modeNormalLabel',
    kind: 'standing',
    cost: 1.0,
    volatility: 'High',
    blurbKey: 'modeNormalBlurb',
    available: true,
    serverMode: 'base',
  },
  {
    id: 'cruise',
    labelKey: 'modeCruiseLabel',
    kind: 'standing',
    cost: 1.0,
    volatility: 'Low',
    blurbKey: 'modeCruiseBlurb',
    available: true,
    serverMode: 'cruise',
  },
  {
    id: 'overboost',
    labelKey: 'modeOverboostLabel',
    kind: 'enhancer',
    cost: 1.25,
    volatility: 'High',
    blurbKey: 'modeOverboostBlurb',
    available: true,
    serverMode: 'antelite',
  },
  {
    id: 'bonus',
    labelKey: 'modeBonusLabel',
    kind: 'buy',
    cost: 100,
    volatility: 'Very High',
    blurbKey: 'modeBonusBlurb',
    available: true,
    serverMode: 'bonus',
  },
  {
    id: 'super',
    labelKey: 'modeSuperLabel',
    kind: 'buy',
    cost: 400,
    volatility: 'Extreme',
    blurbKey: 'modeSuperBlurb',
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

/**
 * THE NUMBERS, which are the source of truth. The LABELS below are derived.
 *
 * These used to be English-formatted string literals, and that is a maths
 * disclosure defect rather than a cosmetic one. Measured on the shipped build,
 * the paytable rendered "5,000×" and "96.35%" IDENTICALLY in all sixteen
 * locales. In German, French, Spanish, Russian and Turkish the comma is the
 * DECIMAL separator and the period groups thousands, so a reviewer checking
 * maths compliance in German read:
 *
 *     MAX. GEWINN 5,000×      as a max win of FIVE
 *     RTP 96.35%              as an RTP of 9,635%
 *
 * Both wrong by three orders of magnitude, on the screen whose whole job is
 * stating the maths. 2026-08-09.
 */
export const FS_MAX_WIN = 5000
export const FS_RTP_PERCENT = 96.35

/**
 * Locale-aware forms. Callers pass the RESOLVED launch locale, the same value
 * every money readout now takes, so one session never mixes conventions.
 *
 * The English constants are kept because non-localised callers exist (gates,
 * and the social/real label helper below), and because a bare fallback is
 * better than a raw number if a caller forgets the locale.
 */
export const FS_RTP_LABEL = '96.35%'
export const FS_MAX_WIN_LABEL = '5,000×'

export function fsRtpLabel(locale?: string): string {
  return `${FS_RTP_PERCENT.toLocaleString(locale, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}%`
}

export function fsMaxWinLabel(locale?: string): string {
  return `${FS_MAX_WIN.toLocaleString(locale)}×`
}

/**
 * A mode COST multiplier, locale-aware. Same defect class as the max win: the
 * OVERBOOST tier is 1.25x and rendered "1.25×" in every locale, which in German
 * and Turkish reads with the period as a THOUSANDS separator. Up to two decimals
 * so 1x and 100x stay clean and 1.25x keeps its fraction.
 */
export function fsCostLabel(cost: number, locale?: string): string {
  return `${cost.toLocaleString(locale, { maximumFractionDigits: 2 })}×`
}

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
export function maxWinVsBaseBetLabel(social: boolean, locale?: string): string {
  const n = fsMaxWinLabel(locale)
  // The trailing words are still hardcoded English and are frozen in
  // scripts/hardcoded_string_baseline.json's sibling list for translation; the
  // NUMBER is fixed here because it needs no translation, only a locale.
  return social ? `${n} base play` : `${n} base bet`
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
export function modeLabel(m: FsMode, social: boolean, locale: Locale): string {
  return t(locale, m.labelKey, social ? 'social' : 'real')
}
export function modeBlurb(m: FsMode, social: boolean, locale: Locale): string {
  return t(locale, m.blurbKey, social ? 'social' : 'real')
}
