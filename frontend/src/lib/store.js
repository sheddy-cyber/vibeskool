import { create } from 'zustand'
import { contentApi } from '@/lib/api'
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
    fontSize:       'md',
    terminalSound:  false,
    showMekBar:     true,
    compactSidebar: false,
    anthropicKey:   '',       // Anthropic API key
    dailyGoal:      2,        // daily lesson goal target
    ...getSavedSettings(),
    theme:          getSavedSettings()?.theme || getStoredTheme() || 'light',
  },

  // Active lesson
  activeLesson: null,
  setActiveLesson: (id) => set({ activeLesson: id }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

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
