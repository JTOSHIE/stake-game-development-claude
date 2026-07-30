// prose.ts, the sentence-case player prose layer. JOB 2 of
// reports/briefs/FS_FINAL_MILE_Prompt.md, 2026-07-28.
//
// WHY THIS FILE EXISTS, and why it is a third layer rather than 71 more keys
// inside each of the sixteen blocks in translations.ts.
//
// Round three found the same thing twice, independently. Reviewer 2's F2: "a
// German session shows translated chrome around fully English feature
// descriptions, rules text and mode blurbs". Reviewer 3's finding 1: "This is
// not a missing decorative translation; it affects rules, costs, feature
// explanations and the game's most prominent win surface." Both are right, and
// the cause was structural: `translations.ts` carried the CONTROL vocabulary
// (short, ALL-CAPS, one or two words) and every gate we had was shaped to that.
// Sentence-case prose was never keyed at all, so no gate could miss it, because
// there was nothing to miss.
//
// This layer holds exactly that prose: the mode blurbs, the paytable rules, the
// interface guide, the accessibility labels and the celebration tier words.
// `translations.ts` keeps the control vocabulary. `featureI18n` keeps the
// Overdrive feature strings. `t()` consults all three, so a component still
// makes one call and does not care which layer answered.
//
// The `featureI18n` layer in translations.ts is the precedent for the shape; it
// is the same pattern applied to a different class of string.

import type { Locale } from './translations'

export type ProseKey =
  // ── Celebration tier words. The banner previously hardcoded these in a
  //    component-script ternary, which is the exact form reviewer 3 cited at
  //    WinBanner.svelte:195-207 and which no regex gate could see. ────────────
  | 'tierBigWin' | 'tierMegaWin' | 'tierEpicWin'
  | 'maxWinHint'
  // ── Mode labels and blurbs. Previously English-only literals in
  //    config/fsModes.ts:59-115, a config file no locale gate read. ───────────
  | 'modeNormalLabel'    | 'modeNormalBlurb'
  | 'modeCruiseLabel'    | 'modeCruiseBlurb'
  | 'modeOverboostLabel' | 'modeOverboostBlurb'
  | 'modeBonusLabel'     | 'modeBonusBlurb'
  | 'modeSuperLabel'     | 'modeSuperBlurb'
  // ── Paytable prose ────────────────────────────────────────────────────────
  | 'waysHeading' | 'waysBody' | 'waysDiagramCaption'
  | 'symbolPayoutsHeading' | 'wildSubstitutes'
  | 'colFreeSpins' | 'colInstantAward' | 'costLabel'
  | 'interfaceGuideHeading' | 'rtpAllModes' | 'maxWinLabel'
  | 'responsiblePlayHeading' | 'disclaimerHeading'
  | 'rulesWaysPay' | 'rulesSymbolValues' | 'rulesWildSub' | 'rulesScatterMult' | 'rulesMaxWin' | 'rulesMalfunction'
  | 'comingSoonLower' | 'waysLabel' | 'scatterSummary'
  | 'disclaimerBody' | 'replayLoadError' | 'replayPlaybackError'
  // ── Interface guide, eight controls, each a name and a description ────────
  | 'guideSpinName'      | 'guideSpinDesc'
  | 'guideBetPlusName'   | 'guideBetPlusDesc'
  | 'guideBetMinusName'  | 'guideBetMinusDesc'
  | 'guideFeaturesName'  | 'guideFeaturesDesc'
  | 'guideAutoplayName'  | 'guideAutoplayDesc'
  | 'guideMenuName'      | 'guideMenuDesc'
  | 'guideTurboName'     | 'guideTurboDesc'
  | 'guideMaxName'       | 'guideMaxDesc'
  // ── Autoplay limits ───────────────────────────────────────────────────────
  | 'stopOnWin' | 'singleWinLimit' | 'stopOnFeature' | 'lossLimit'
  // ── Replay status lines ───────────────────────────────────────────────────
  | 'replayLoading' | 'replayFailed' | 'replayingRound'
  // ── Loading ───────────────────────────────────────────────────────────────
  | 'loadingCybernetics'
  // ── Accessibility labels. Player-facing text, per R4/TR-012: a blind player
  //    is a player, and these were English in fifteen locales. ───────────────
  | 'a11yFeatures' | 'a11yClose' | 'a11yMenu'
  | 'a11yMusicVolume' | 'a11ySfxVolume' | 'a11yCycleSpeed'
  | 'a11yMaxWinReached' | 'a11yCollectMaxWin'
  | 'a11yWaysDiagram' | 'a11yOverdriveTable' | 'a11ySelectTheme'

export type ProseStrings = Record<ProseKey, string>

// ── English, the source of truth every other locale is translated from ───────
//
// Australian English, no em dashes or en dashes, per the CLAUDE.md header. The
// multiplication sign is U+00D7 everywhere, matching QUALITY_CHARTER Q-12.

export const en: ProseStrings = {
  tierBigWin:  'BIG WIN',
  tierMegaWin: 'MEGA WIN',
  tierEpicWin: 'EPIC WIN',
  maxWinHint:  'Press COLLECT or hit Enter to continue',

  modeNormalLabel:    'Normal',
  modeNormalBlurb:    'Standard play. Overdrive Free Spins trigger on 3+ scatters.',
  modeCruiseLabel:    'Cruise',
  modeCruiseBlurb:    'A smoother ride: more frequent smaller wins, same 96.35% RTP.',
  modeOverboostLabel: 'OVERBOOST',
  modeOverboostBlurb: 'Double-chance: about 1.6× the feature trigger rate. Debits 1.25× every spin while ON.',
  modeBonusLabel:     'Buy Overdrive',
  modeBonusBlurb:     'Buy a guaranteed Overdrive Free Spins entry.',
  modeSuperLabel:     'NITRO OVERDRIVE',
  modeSuperBlurb:     'Buy a rich entry with the Overdrive meter pre-revved to 5×.',

  waysHeading:          'Match symbols on adjacent reels starting from reel 1 (left to right).',
  waysBody:             'All matching symbol positions count, with no fixed paylines.',
  waysDiagramCaption:   'Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.',
  symbolPayoutsHeading: 'Symbol Payouts',
  wildSubstitutes:      'Substitutes for all symbols except SCATTER',
  colFreeSpins:         'Free Spins',
  colInstantAward:      'Instant Award',
  costLabel:            'Cost',
  interfaceGuideHeading:  'Interface Guide',
  rtpAllModes:            'RTP (All 5 Modes)',
  maxWinLabel:            'Max Win',
  responsiblePlayHeading: 'Responsible Play',
  disclaimerHeading:      'Disclaimer',
  rulesWaysPay:     'Wins pay left to right on adjacent reels starting from reel 1.',
  rulesSymbolValues: 'Symbol values shown are per matching way; the total is that value times the number of ways times your bet.',
  rulesWildSub:     'WILD substitutes for all symbols except SCATTER.',
  rulesScatterMult: '3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.',
  rulesMaxWin:      'Maximum win per spin is capped at 5,000× your total bet.',
  rulesMalfunction: 'Malfunctions void all pays and plays.',
  comingSoonLower:  'coming soon',
  waysLabel:        'WAYS TO WIN',
  scatterSummary:   '3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins',
  disclaimerBody:   'Malfunction voids all wins and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Winnings are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.',
  replayLoadError:     'Failed to load replay.',
  replayPlaybackError: 'Playback failed.',

  guideSpinName:      'Spin',
  guideSpinDesc:      'Start a spin at the current bet.',
  guideBetPlusName:   'Increase Bet',
  guideBetPlusDesc:   'Raise your bet to the next level.',
  guideBetMinusName:  'Decrease Bet',
  guideBetMinusDesc:  'Lower your bet to the previous level.',
  guideFeaturesName:  'Features',
  guideFeaturesDesc:  'Open the FEATURES menu to pick a bet mode or buy the feature.',
  guideAutoplayName:  'Autoplay',
  guideAutoplayDesc:  'Spin automatically with optional loss and win limits.',
  guideMenuName:      'Menu',
  guideMenuDesc:      'Open the menu for the paytable and sound settings.',
  guideTurboName:     'Turbo',
  guideTurboDesc:     'Speed up spins. The bolt brightens at each of the three speeds: normal, turbo, super turbo.',
  guideMaxName:       'Max Bet',
  guideMaxDesc:       'Bet the maximum.',

  stopOnWin:      'Stop on win',
  singleWinLimit: 'Single win limit',
  stopOnFeature:  'Stop on feature',
  lossLimit:      'Loss limit',

  replayLoading:  'Loading replay...',
  replayFailed:   'Replay failed to load',
  replayingRound: 'Replaying round...',

  loadingCybernetics: 'LOADING CYBERNETICS...',

  a11yFeatures:       'Features',
  a11yClose:          'Close',
  a11yMenu:           'Menu',
  a11yMusicVolume:    'Music volume',
  a11ySfxVolume:      'Sound effects volume',
  a11yCycleSpeed:     'Cycle speed (Normal / Turbo / Super Turbo)',
  a11yMaxWinReached:  'Max Win reached',
  a11yCollectMaxWin:  'Collect max win',
  a11yWaysDiagram:    'A matching way reads left to right across adjacent reels, starting from reel 1',
  a11yOverdriveTable: 'Overdrive trigger table',
  a11ySelectTheme:    'Select game theme',
}

// ── The other fifteen locales ────────────────────────────────────────────────
//
// Filled by JOB 2. Every locale carries every key; `locale_completeness_check`
// asserts that rather than trusting it, so a key added here and forgotten in a
// locale is a build failure and not a Japanese player reading English.

import { proseLocales } from './prose.locales'

export const proseI18n: Record<Locale, ProseStrings> = {
  en,
  ...proseLocales,
}

// ── Social variants of the prose keys, per locale ────────────────────────────
//
// Only the keys whose WORDING changes in social mode appear here. A key that
// reads identically in both modes is deliberately absent rather than repeated,
// because a copy that merely restates the master is a second thing to drift.
// `translations.ts` merges these into `SOCIAL_I18N` alongside the control
// vocabulary, so `t()` consults one social table per locale rather than two.

export const PROSE_SOCIAL: Partial<Record<ProseKey, string>> = {
  tierBigWin: 'BIG PRIZE',
  tierMegaWin: 'MEGA PRIZE',
  tierEpicWin: 'EPIC PRIZE',
  modeCruiseBlurb: 'A smoother ride: more frequent smaller prizes, same 96.35% RTP.',
  modeOverboostBlurb: 'Double-chance: about 1.6× the feature trigger rate. Costs 1.25× every spin while ON.',
  modeBonusLabel: 'Get Overdrive',
  modeBonusBlurb: 'Get a guaranteed Overdrive Free Spins entry.',
  modeSuperBlurb: 'Get a rich entry with the Overdrive meter pre-revved to 5×.',
  rulesWaysPay: 'Prizes are awarded left to right on adjacent reels starting from reel 1.',
  rulesSymbolValues: 'Symbol values shown are per matching way; the total is that value times the number of ways times your play.',
  rulesScatterMult: '3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total play prize.',
  rulesMaxWin: 'Maximum prize per play is capped at 5,000× your total play.',
  rulesMalfunction: 'Malfunctions void all wins and plays.',
  maxWinLabel: 'Max Prize',
  guideSpinDesc: 'Start a play at the current play level.',
  guideBetPlusName: 'Increase Play',
  guideBetPlusDesc: 'Raise your play to the next level.',
  guideBetMinusName: 'Decrease Play',
  guideBetMinusDesc: 'Lower your play to the previous level.',
  guideFeaturesDesc: 'Open the FEATURES menu to pick a play mode or get the feature.',
  guideAutoplayDesc: 'Play automatically with optional loss and prize limits.',
  guideMaxName: 'Max Play',
  guideMaxDesc: 'Play the maximum.',
  a11yCollectMaxWin: 'Collect max prize',
  a11yMaxWinReached: 'Max Prize reached',
  waysLabel: 'WAYS',
  disclaimerBody: 'Malfunction voids all prizes and plays. A stable internet connection is required to play. If your connection drops during a round, reload the game to finish any uncompleted round. The theoretical return to player is calculated over many thousands of plays and does not guarantee any result in a single session. This game display is for illustrative purposes only and does not represent a physical device. Prizes are settled according to the result returned by the Remote Game Server, not from events shown in the web browser.',
}

