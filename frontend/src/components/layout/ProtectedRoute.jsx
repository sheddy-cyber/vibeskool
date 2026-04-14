import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

/** Redirects to /signin if not authenticated */
export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/signin" replace />
  return children
}

/** Redirects to /app/dashboard if not admin */
export function AdminRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/signin" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/app/dashboard" replace />
  return children
}
