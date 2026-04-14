/**
 * VibeSkool Auth Store
 * localStorage-persisted auth with role support.
 * In production this would validate against a real API.
 * For now: demo users in localStorage, password hashed client-side with btoa.
 */
import { create } from 'zustand'

// ─── Seed admin account (bootstrapped on first load) ─────────────────────────
const ADMIN_EMAIL    = 'admin@vibeskool.com'
const ADMIN_PASSWORD = 'vibeskool2025'

function seedAdminIfNeeded() {
  const existing = JSON.parse(localStorage.getItem('vs_users') || '[]')
  if (!existing.find(u => u.email === ADMIN_EMAIL)) {
    existing.push({
      id:        'admin-001',
      email:     ADMIN_EMAIL,
      password:  btoa(ADMIN_PASSWORD),
      name:      'Admin',
      role:      'admin',
      avatar:    'A',
      mekScore:  100,
      lessonsCompleted: 47,
      buildsUnlocked:   5,
      joinedAt:  new Date().toISOString(),
      progress:  {},
    })
    localStorage.setItem('vs_users', JSON.stringify(existing))
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('vs_users') || '[]')
}
function saveUsers(users) {
  localStorage.setItem('vs_users', JSON.stringify(users))
}
function getSession() {
  try { return JSON.parse(localStorage.getItem('vs_session') || 'null') }
  catch { return null }
}
function saveSession(user) {
  localStorage.setItem('vs_session', JSON.stringify(user))
}
function clearSession() {
  localStorage.removeItem('vs_session')
}
function makeAvatar(name) {
  return name?.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

// ─── Auth store ───────────────────────────────────────────────────────────────
export const useAuth = create((set, get) => {
  seedAdminIfNeeded()
  const session = getSession()

  return {
    currentUser: session || null,
    authError:   null,
    authLoading: false,

    // ── Sign up ────────────────────────────────────────────────────────────────
    signUp: ({ name, email, password }) => {
      set({ authLoading: true, authError: null })

      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return set({ authError: 'Please fill in all fields.', authLoading: false })
      }
      if (password.length < 6) {
        return set({ authError: 'Password must be at least 6 characters.', authLoading: false })
      }

      const users = getUsers()
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return set({ authError: 'An account with this email already exists.', authLoading: false })
      }

      const newUser = {
        id:               `user-${Date.now()}`,
        email:            email.toLowerCase().trim(),
        password:         btoa(password),
        name:             name.trim(),
        role:             'student',
        avatar:           makeAvatar(name),
        mekScore:         0,
        lessonsCompleted: 0,
        buildsUnlocked:   0,
        joinedAt:         new Date().toISOString(),
        progress:         {},
        settings: {
          theme: 'dark', fontSize: 'md',
          terminalSound: false, showMekBar: true, compactSidebar: false,
        },
      }
      users.push(newUser)
      saveUsers(users)

      const { password: _, ...safeUser } = newUser
      saveSession(safeUser)
      set({ currentUser: safeUser, authLoading: false, authError: null })
    },

    // ── Sign in ────────────────────────────────────────────────────────────────
    signIn: ({ email, password }) => {
      set({ authLoading: true, authError: null })

      if (!email?.trim() || !password?.trim()) {
        return set({ authError: 'Please enter your email and password.', authLoading: false })
      }

      const users = getUsers()
      const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())

      if (!user || user.password !== btoa(password)) {
        return set({ authError: 'Incorrect email or password.', authLoading: false })
      }

      const { password: _, ...safeUser } = user
      saveSession(safeUser)
      set({ currentUser: safeUser, authLoading: false, authError: null })
    },

    // ── Sign out ───────────────────────────────────────────────────────────────
    signOut: () => {
      clearSession()
      set({ currentUser: null })
    },

    // ── Update progress (persisted) ────────────────────────────────────────────
    updateProgress: (pathId) => {
      const { currentUser } = get()
      if (!currentUser) return

      const users = getUsers()
      const idx   = users.findIndex(u => u.id === currentUser.id)
      if (idx === -1) return

      const user     = users[idx]
      const progress = { ...user.progress }
      progress[pathId] = (progress[pathId] || 0) + 1

      const updated = {
        ...user,
        progress,
        lessonsCompleted: user.lessonsCompleted + 1,
        mekScore: Math.min(100, user.mekScore + 3),
      }
      users[idx] = updated
      saveUsers(users)

      const { password: _, ...safeUser } = updated
      saveSession(safeUser)
      set({ currentUser: safeUser })
    },

    // ── Update settings (persisted) ────────────────────────────────────────────
    updateUserSettings: (patch) => {
      const { currentUser } = get()
      if (!currentUser) return

      const users = getUsers()
      const idx   = users.findIndex(u => u.id === currentUser.id)
      if (idx === -1) return

      const updated = {
        ...users[idx],
        settings: { ...users[idx].settings, ...patch },
      }
      users[idx] = updated
      saveUsers(users)

      const { password: _, ...safeUser } = updated
      saveSession(safeUser)
      set({ currentUser: safeUser })
    },

    clearError: () => set({ authError: null }),

    isAdmin: () => get().currentUser?.role === 'admin',
  }
})
