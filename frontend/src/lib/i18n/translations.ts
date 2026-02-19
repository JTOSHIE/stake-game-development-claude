// translations.ts — i18n strings for Future Spinner

export type Locale = 'en' | 'de' | 'es' | 'ja'

export interface Translations {
  spin: string
  stop: string
  bet: string
  balance: string
  win: string
  maxBet: string
  minBet: string
  autoPlay: string
  loading: string
  error: string
  scatter3: string
  scatter4: string
  scatter5: string
  wincap: string
  buyBonus: string
  buyBonusDesc: string
}

const en: Translations = {
  spin:        'SPIN',
  stop:        'STOP',
  bet:         'BET',
  balance:     'BALANCE',
  win:         'WIN',
  maxBet:      'MAX BET',
  minBet:      'MIN BET',
  autoPlay:    'AUTO',
  loading:     'Loading…',
  error:       'Connection error. Please try again.',
  scatter3:    '3 SCATTERS — 1× MULTIPLIER',
  scatter4:    '4 SCATTERS — 3× MULTIPLIER',
  scatter5:    '5 SCATTERS — 10× MULTIPLIER!',
  wincap:      '🏆 MAXIMUM WIN — 5,000×!',
  buyBonus:    'BUY BONUS',
  buyBonusDesc:'Guaranteed scatter spin — 100× bet',
}

const de: Translations = {
  spin:        'DREHEN',
  stop:        'STOPP',
  bet:         'EINSATZ',
  balance:     'GUTHABEN',
  win:         'GEWINN',
  maxBet:      'MAX EINSATZ',
  minBet:      'MIN EINSATZ',
  autoPlay:    'AUTO',
  loading:     'Laden…',
  error:       'Verbindungsfehler. Bitte versuche es erneut.',
  scatter3:    '3 SCATTER — 1-FACH',
  scatter4:    '4 SCATTER — 3-FACH',
  scatter5:    '5 SCATTER — 10-FACH!',
  wincap:      '🏆 MAXIMALER GEWINN — 5.000×!',
  buyBonus:    'BONUS KAUFEN',
  buyBonusDesc:'Garantierter Scatter-Spin — 100× Einsatz',
}

const es: Translations = {
  spin:        'GIRAR',
  stop:        'PARAR',
  bet:         'APUESTA',
  balance:     'SALDO',
  win:         'GANANCIA',
  maxBet:      'APUESTA MAX',
  minBet:      'APUESTA MIN',
  autoPlay:    'AUTO',
  loading:     'Cargando…',
  error:       'Error de conexión. Inténtalo de nuevo.',
  scatter3:    '3 SCATTER — MULTIPLICADOR 1×',
  scatter4:    '4 SCATTER — MULTIPLICADOR 3×',
  scatter5:    '5 SCATTER — ¡MULTIPLICADOR 10×!',
  wincap:      '🏆 ¡GANANCIA MÁXIMA — 5.000×!',
  buyBonus:    'COMPRAR BONUS',
  buyBonusDesc:'Giro scatter garantizado — 100× apuesta',
}

const ja: Translations = {
  spin:        'スピン',
  stop:        'ストップ',
  bet:         'ベット',
  balance:     '残高',
  win:         '勝利',
  maxBet:      'MAX BET',
  minBet:      'MIN BET',
  autoPlay:    'オート',
  loading:     '読み込み中…',
  error:       '接続エラー。再試行してください。',
  scatter3:    '3スキャッター — 1倍',
  scatter4:    '4スキャッター — 3倍',
  scatter5:    '5スキャッター — 10倍！',
  wincap:      '🏆 最大勝利 — 5,000倍！',
  buyBonus:    'ボーナス購入',
  buyBonusDesc:'スキャッタースピン確定 — ベット×100',
}

export const locales: Record<Locale, Translations> = { en, de, es, ja }

export function t(locale: Locale, key: keyof Translations): string {
  return locales[locale]?.[key] ?? locales.en[key]
}
