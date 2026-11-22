import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

/** Redirects to /signin if not authenticated */
export function ProtectedRoute({ children }) {
  const { currentUser, authReady } = useAuth()
  if (!authReady) return null
  if (!currentUser) return <Navigate to="/signin" replace />
  return children
}

/** Redirects to /app/dashboard if not teacher or admin */
export function TeacherRoute({ children }) {
  const { currentUser, authReady } = useAuth()
  if (!authReady) return null
  if (!currentUser) return <Navigate to="/signin" replace />
  if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />
  }
  return children
}
