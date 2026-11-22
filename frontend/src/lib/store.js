import { create } from 'zustand'
import { contentApi, progressApi } from '@/lib/api'
import { applyTheme, getStoredTheme } from '@/lib/theme'

// ─── Store ─────────────────────────────────────────────────────────────────────

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('vibeskool_settings')
    return saved ? JSON.parse(saved) : {}
  } catch (e) {
    return {}
  }
}

export const useStore = create((set, get) => ({
  // Content State
  paths: [],
  pathsLoading: true,

  fetchPaths: async () => {
    try {
      set({ pathsLoading: true })
      const data = await contentApi.getPaths()
      set({ paths: data.paths, pathsLoading: false })
    } catch(err) {
      console.error('Failed to fetch paths:', err)
      set({ pathsLoading: false })
    }
  },

  // Learner progress (from /api/progress)
  progress: {},
  passedModules: [],
  completions: [],
  streak: { current: 0, longest: 0 },
  progressLoaded: false,

  fetchProgress: async () => {
    try {
      const data = await progressApi.get()
      set({
        progress: data.progress || {},
        passedModules: data.passedModules || [],
        completions: data.completions || [],
        streak: { current: data.currentStreak || 0, longest: data.longestStreak || 0 },
        progressLoaded: true,
      })
    } catch (err) {
      console.error('Failed to fetch progress:', err)
      set({ progressLoaded: true })
    }
  },

  // Settings
  settings: {
    dailyGoal:      2,        // lessons a day the home page tracks
    showStats:      true,     // learning stats on your public profile
    ...getSavedSettings(),
    theme:          getSavedSettings()?.theme || getStoredTheme() || 'dark',
  },

  // Sidebar
  sidebarOpen: false, // mobile drawer only; the sidebar is always shown on wide screens
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Wide screens: full sidebar or a narrow icon rail. The full sidebar is the
  // default on every visit; collapsing it is remembered only until the tab is
  // closed, so it never stays collapsed by accident (Ctrl+B is easy to hit).
  sidebarCollapsed: (() => {
    try {
      localStorage.removeItem('vibeskool_sidebar_collapsed') // the old, permanent setting
      return sessionStorage.getItem('vibeskool_sidebar_collapsed') === '1'
    } catch { return false }
  })(),
  toggleSidebarCollapsed: () => set((s) => {
    const next = !s.sidebarCollapsed
    try { sessionStorage.setItem('vibeskool_sidebar_collapsed', next ? '1' : '0') } catch {}
    return { sidebarCollapsed: next }
  }),

  // Update settings
  updateSettings: (patch) => set((s) => {
    const nextSettings = { ...s.settings, ...patch }
    if (patch.theme) {
      applyTheme(patch.theme)
    }
    try {
      localStorage.setItem('vibeskool_settings', JSON.stringify(nextSettings))
    } catch (e) {}
    return { settings: nextSettings }
  }),
}))
