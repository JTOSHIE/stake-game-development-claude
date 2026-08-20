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
import { DISCLAIMER_MANDATED } from './disclaimer'

export type ProseKey =
  // ── Celebration tier words. The banner previously hardcoded these in a
  //    component-script ternary, which is the exact form reviewer 3 cited at
  //    WinBanner.svelte:195-207 and which no regex gate could see. ────────────
  | 'tierBigWin' | 'tierMegaWin' | 'tierEpicWin'
  | 'maxWinHint'
  // The qualifier that stops 5,000× reading as a multiple of the 400× buy COST.
  // It was an English literal in config/fsModes.ts, so the disambiguation the
  // owner's ROUND 4 ruling made mandatory did not exist in fifteen locales.
  | 'maxWinFootnote'
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
  | 'responsiblePlayHeading' | 'responsiblePlayBody' | 'disclaimerHeading'
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
  maxWinFootnote: 'Max win is quoted against the base bet.',

  modeNormalLabel:    'Normal',
  modeNormalBlurb:    'Standard play. Overdrive Free Spins trigger on 3+ scatters.',
  modeCruiseLabel:    'Cruise',
  modeCruiseBlurb:    'A smoother ride: more frequent smaller wins, same 96.35% RTP.',
  modeOverboostLabel: 'OVERBOOST',
  modeOverboostBlurb: 'Raises the feature trigger rate to about 1.6× Normal. Debits 1.25× every spin while ON.',
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
  responsiblePlayBody:    'Autoplay can be set to stop automatically on any win, when the Overdrive feature triggers, or once a loss limit you choose is reached, and can always be stopped manually at any time. A session summary (time played, spins, net result) is available from the menu.',
  disclaimerHeading:      'Disclaimer',
  rulesWaysPay:     'Wins pay left to right on adjacent reels starting from reel 1.',
  rulesSymbolValues: 'Symbol values shown are per matching way; the total is that value times the number of ways times your bet.',
  rulesWildSub:     'WILD substitutes for all symbols except SCATTER.',
  rulesScatterMult: '3, 4, or 5 SCATTERs anywhere award an instant win of 1×, 3×, or 10× your base bet, added to any other wins.',
  rulesMaxWin:      'Maximum win per game round is capped at 5,000× your base bet. A game round includes the triggering spin and any free spins it awards.',
  rulesMalfunction: 'Malfunctions void all pays and plays.',
  comingSoonLower:  'coming soon',
  waysLabel:        'WAYS TO WIN',
  scatterSummary:   '3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins',
  disclaimerBody:   DISCLAIMER_MANDATED,
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
// Filled by JOB 2. Every locale carries every key; the gate that asserts that
// is `scripts/locale_prose_conformance.mjs` (PART 1 walks every prose key
// across all sixteen locales, PART 2 drives the resolver, PART 3 reads the
// rendered DOM including the opened paytable), wired into CI as its own
// browser leg. This comment previously credited `locale_completeness_check`,
// which never scanned the prose layer; naming the wrong guard left the real
// one unwired and RED for a fortnight (fresh-context major 6, fixed by R043
// PHASE 3c).

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
  // SOCIAL DIFFERS FROM THE MASTER BY EXACTLY ONE WORD, and that word is the
  // whole reason this entry exists. "Debits" is a prohibited term in social
  // mode: it names a real-money movement, and stake.us surfaces must not.
  // "Costs" is what the superseded social blurb used and it is kept, so the
  // register change is invisible to a player and the compliance property is not.
  // The file's rule above, that a string reading identically in both modes is
  // absent rather than repeated, is honoured: these two are NOT identical.
  modeOverboostBlurb: 'Raises the feature trigger rate to about 1.6× Normal. Costs 1.25× every spin while ON.',
  modeBonusLabel: 'Get Overdrive',
  modeBonusBlurb: 'Get a guaranteed Overdrive Free Spins entry.',
  modeSuperBlurb: 'Get a rich entry with the Overdrive meter pre-revved to 5×.',
  rulesWaysPay: 'Prizes are awarded left to right on adjacent reels starting from reel 1.',
  rulesSymbolValues: 'Symbol values shown are per matching way; the total is that value times the number of ways times your play.',
  rulesScatterMult: '3, 4, or 5 SCATTERs anywhere award an instant prize of 1×, 3×, or 10× your base play, added to any other prizes.',
  rulesMaxWin: 'Maximum prize per game round is capped at 5,000× your base play. A game round includes the triggering spin and any free spins it awards.',
  rulesMalfunction: 'Malfunctions void all wins and plays.',
  maxWinLabel: 'Max Prize',
  maxWinFootnote: 'Max win is quoted against the base play amount.',
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
  // disclaimerBody is deliberately ABSENT since R076, and R077 confirms it:
  // the platform-mandated disclaimer ships word for word in both modes and is
  // the whole of what the disclaimer says (disclaimer.ts is the one source),
  // so a key reading identically in both modes is absent rather than
  // repeated, per this file's own rule above. The social prohibited-term
  // exemption for the mandated block is scoped in the scanners, not here.
}

