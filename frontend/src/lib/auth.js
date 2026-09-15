import { create } from 'zustand'
import { authApi, setToken, getToken, clearToken } from '@/lib/api'

function mapUser(backendUser, extras = {}) {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.display_name,
    role: backendUser.role,
    avatar: backendUser.avatar_url || backendUser.display_name?.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?',
    settings: backendUser.settings || {},
    joinedAt: backendUser.created_at,
    mekScore: extras.mekScore ?? 0,
    xp: backendUser.xp ?? 0,
    badges: backendUser.badges ?? [],
    lessonsCompleted: extras.lessonsCompleted ?? 0,
    passedModules: extras.passedModules ?? [],
    currentStreak: extras.currentStreak ?? 0,
    longestStreak: extras.longestStreak ?? 0,
    progress: extras.progress ?? {},
    ...extras,
  }
}

export const useAuth = create((set, get) => {
  // Initialize user if token exists
  const token = getToken()
  if (token) {
    authApi.getMe()
      .then((data) => {
        set({ currentUser: mapUser(data.user, data) })
      })
      .catch(() => {
        clearToken()
        set({ currentUser: null })
      })
  }

  return {
    currentUser: null,
    authError: null,
    authLoading: false,

    signUp: async ({ name, displayName, email, password, role }) => {
      set({ authLoading: true, authError: null })
      try {
        const resolvedName = (displayName || name || '').trim()
        if (!resolvedName || !email?.trim() || !password?.trim()) {
          throw new Error('Please fill in all fields.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }

        const data = await authApi.signup({
          email: email.toLowerCase().trim(),
          password,
          displayName: resolvedName,
          role: role || 'student',
        })
        
        setToken(data.token)
        set({ currentUser: mapUser(data.user), authLoading: false })
      } catch (err) {
        set({ 
          authError: err.response?.data?.error || err.message || 'Sign up failed.', 
          authLoading: false 
        })
      }
    },

    signIn: async ({ email, password }) => {
      set({ authLoading: true, authError: null })
      try {
        if (!email?.trim() || !password?.trim()) {
          throw new Error('Please enter your email and password.')
        }

        const data = await authApi.login({
          email: email.toLowerCase().trim(),
          password,
        })
        
        setToken(data.token)
        // Note: the login endpoint might not return full progress data
        // For a full app, you might await authApi.getMe() here as well,
        // but falling back to data.user and defaults for now.
        set({ currentUser: mapUser(data.user), authLoading: false })
      } catch (err) {
        set({ 
          authError: err.response?.data?.error || err.message || 'Sign in failed.', 
          authLoading: false 
        })
      }
    },

    signOut: () => {
      clearToken()
      set({ currentUser: null })
    },

    refreshUser: async () => {
      try {
        const data = await authApi.getMe()
        set({ currentUser: mapUser(data.user, data) })
      } catch (err) {
        clearToken()
        set({ currentUser: null })
      }
    },

    updateProgress: (pathId) => {
      // Local state update since progress backend isn't fully migrated yet
      const { currentUser } = get()
      if (!currentUser) return

      const progress = { ...currentUser.progress }
      progress[pathId] = (progress[pathId] || 0) + 1

      const updated = {
        ...currentUser,
        progress,
        lessonsCompleted: currentUser.lessonsCompleted + 1,
        mekScore: Math.min(100, currentUser.mekScore + 3),
        xp: currentUser.xp + 10,
      }
      
      set({ currentUser: updated })
    },

    passModule: (moduleId) => {
      // Local state update since progress backend isn't fully migrated yet
      const { currentUser } = get()
      if (!currentUser) return

      const passedModules = [...(currentUser.passedModules || [])]
      if (!passedModules.includes(moduleId)) {
        passedModules.push(moduleId)
      }

      const updated = {
        ...currentUser,
        passedModules,
        mekScore: Math.min(100, currentUser.mekScore + 10),
        xp: currentUser.xp + 50,
      }
      
      set({ currentUser: updated })
    },

    updateUserSettings: async (patch) => {
      const { currentUser } = get()
      if (!currentUser) return

      // Optimistic update
      const newSettings = { ...currentUser.settings, ...patch }
      set({ currentUser: { ...currentUser, settings: newSettings } })

      try {
        await authApi.updateProfile({ settings: newSettings })
      } catch (err) {
        console.error('Failed to update settings remotely', err)
        // In a strict environment, we might revert the optimistic update here.
      }
    },

    clearError: () => set({ authError: null }),

    isAdmin: () => get().currentUser?.role === 'admin',
    isTeacher: () => get().currentUser?.role === 'teacher',
  }
})
