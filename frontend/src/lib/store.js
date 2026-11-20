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
  lessonCache: {},

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

  fetchLesson: async (id) => {
    if (get().lessonCache[id]) return get().lessonCache[id]
    try {
      const data = await contentApi.getLesson(id)
      set(s => ({ lessonCache: { ...s.lessonCache, [id]: data.lesson } }))
      return data.lesson
    } catch(err) {
      console.error('Failed to fetch lesson:', err)
      return null
    }
  },

  // Settings
  settings: {
    dailyGoal:      2,        // lessons a day the home page tracks
    showStats:      true,     // learning stats on your public profile
    ...getSavedSettings(),
    theme:          getSavedSettings()?.theme || getStoredTheme() || 'dark',
  },

  // Active lesson
  activeLesson: null,
  setActiveLesson: (id) => set({ activeLesson: id }),

  // Sidebar
  sidebarOpen: false, // mobile drawer only; the sidebar is always shown on wide screens
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Wide screens: full sidebar or a narrow icon rail. Remembered per browser.
  sidebarCollapsed: (() => {
    try { return localStorage.getItem('vibeskool_sidebar_collapsed') === '1' } catch { return false }
  })(),
  toggleSidebarCollapsed: () => set((s) => {
    const next = !s.sidebarCollapsed
    try { localStorage.setItem('vibeskool_sidebar_collapsed', next ? '1' : '0') } catch {}
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
