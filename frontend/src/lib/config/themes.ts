// src/lib/config/themes.ts
// Theme registry — We Roll Spinners multi-theme system
// Adding a new theme: add entry here + drop assets in themes/[id]/ folder

export interface ThemeConfig {
  id: string
  name: string
  subtitle: string
  description: string
  palette: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  assetBase: string
  videoBackground: boolean   // true = .mp4, false = .jpg
  available: boolean
  comingSoon?: boolean
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'future-spinner',
    name: 'FUTURE SPINNER',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Cyberpunk spinners in a rain-soaked neon megacity. High-octane automotive chaos.',
    palette: {
      primary:    '#00FFFF',
      secondary:  '#FF00FF',
      background: '#0a0a1a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/future-spinner',
    videoBackground: true,
    available: true,
  },
  {
    id: 'trap-lane',
    name: 'TRAP LANE',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Six greyhounds. One winner. The fastest sport on four legs. Your bet, your call.',
    palette: {
      primary:    '#39FF14',
      secondary:  '#FF6600',
      background: '#0a1a0a',
      text:       '#FFFDD0',
    },
    assetBase: 'assets/themes/trap-lane',
    videoBackground: false,
    available: true,
  },
  {
    id: 'oil-and-fire',
    name: 'OIL & FIRE',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Black gold and global power. The world runs on who controls the straits.',
    palette: {
      primary:    '#FF6600',
      secondary:  '#C19A6B',
      background: '#1A0A00',
      text:       '#F5F5DC',
    },
    assetBase: 'assets/themes/oil-and-fire',
    videoBackground: false,
    available: true,
  },
  {
    id: 'beautiful-game',
    name: 'BEAUTIFUL GAME',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Ninety minutes. One ball. The world\'s game on the biggest stage.',
    palette: {
      primary:    '#228B22',
      secondary:  '#FFD700',
      background: '#0a1a0a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/beautiful-game',
    videoBackground: false,
    available: true,
  },
  {
    id: 'valhalla-rising',
    name: 'VALHALLA RISING',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Norse gods and Viking warriors battle for glory. Enter the realm of Odin.',
    palette: {
      primary:    '#FFD700',
      secondary:  '#8B0000',
      background: '#1a0a0a',
      text:       '#F5F5DC',
    },
    assetBase: 'assets/themes/valhalla-rising',
    videoBackground: false,
    available: false,
    comingSoon: true,
  },
  {
    id: 'apex-racing',
    name: 'APEX RACING',
    subtitle: 'WE ROLL SPINNERS',
    description: 'The fastest machines on earth. Championship glory at 300km/h.',
    palette: {
      primary:    '#FF0000',
      secondary:  '#FFD700',
      background: '#0a0a0a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/apex-racing',
    videoBackground: false,
    available: false,
    comingSoon: true,
  },
]

export const DEFAULT_THEME_ID = 'future-spinner'

export function getTheme(id: string): ThemeConfig {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

export function getActiveTheme(): ThemeConfig {
  const saved = typeof localStorage !== 'undefined'
    ? localStorage.getItem('wrs_theme') ?? DEFAULT_THEME_ID
    : DEFAULT_THEME_ID
  return getTheme(saved)
}

export function saveTheme(id: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wrs_theme', id)
  }
}
