// ─── Theme Manager (VibeSkool) ─────────────────────────────────────────────────
// Supports: 'light' (The Luminous Atelier), 'dark' (The Obsidian Nocturne), and 'system'

let systemMediaListener = null

export function getStoredTheme() {
  try {
    const directTheme = localStorage.getItem('vibeskool_theme')
    if (directTheme) return directTheme

    const savedSettings = localStorage.getItem('vibeskool_settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (parsed.theme) return parsed.theme
    }
  } catch (e) {
    // ignore
  }
  return 'light'
}

export function getResolvedTheme(themePreference) {
  const pref = themePreference || getStoredTheme()
  if (pref === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return pref === 'dark' ? 'dark' : 'light'
}

export function applyTheme(themePreference) {
  const theme = themePreference || 'light'
  const resolved = getResolvedTheme(theme)

  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.setAttribute('data-theme', resolved)
    root.style.colorScheme = resolved

    // Update meta theme-color for mobile address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolved === 'dark' ? '#090A0F' : '#FFFFFF')
    }

    try {
      localStorage.setItem('vibeskool_theme', theme)
    } catch (e) {}

    // Setup or cleanup system preference listener
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      
      if (systemMediaListener) {
        try {
          media.removeEventListener('change', systemMediaListener)
        } catch (e) {
          media.removeListener(systemMediaListener)
        }
        systemMediaListener = null
      }

      if (theme === 'system') {
        systemMediaListener = (e) => {
          const nextResolved = e.matches ? 'dark' : 'light'
          root.setAttribute('data-theme', nextResolved)
          root.style.colorScheme = nextResolved
          if (metaThemeColor) {
            metaThemeColor.setAttribute('content', nextResolved === 'dark' ? '#090A0F' : '#FFFFFF')
          }
        }
        try {
          media.addEventListener('change', systemMediaListener)
        } catch (e) {
          media.addListener(systemMediaListener)
        }
      }
    }
  }

  return resolved
}

export function initTheme() {
  const stored = getStoredTheme()
  return applyTheme(stored)
}
