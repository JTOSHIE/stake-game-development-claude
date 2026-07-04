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
    // LUMEN side-project reskin. The theme id stays 'future-spinner' on purpose:
    // App.svelte and several components gate the whole free-spins feature, the
    // bonus instrument column, the background stills and the feature button on
    // `$activeTheme.id === 'future-spinner'`, so repointing this entry (rather
    // than adding a new id) keeps the feature and HUD wired while swapping the
    // art, palette and wordmark to LUMEN. See the LUMEN notes in the reskin.
    id: 'future-spinner',
    name: 'LUMEN',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Bioluminescent life in the crushing dark of the deep-sea abyss.',
    palette: {
      // LUMEN bio-glow palette: cyan primary, magenta secondary, abyss base.
      primary:    '#00e5ff',  // bio-glow cyan
      secondary:  '#ff3df0',  // bio-glow magenta
      background: '#05070f',  // deep-blue-black abyss
      text:       '#ffffff',
    },
    assetBase: 'assets/lumen',
    videoBackground: false,
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
