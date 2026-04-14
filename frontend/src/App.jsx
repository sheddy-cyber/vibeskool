import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout      from '@/components/layout/AppLayout'
import ScrollToTop    from '@/components/layout/ScrollToTop'
import { ProtectedRoute, AdminRoute } from '@/components/layout/ProtectedRoute'

import LandingPage    from '@/pages/LandingPage'
import SignInPage     from '@/pages/SignInPage'
import SignUpPage     from '@/pages/SignUpPage'
import DashboardPage  from '@/pages/DashboardPage'
import PathsPage      from '@/pages/PathsPage'
import LessonPage     from '@/pages/LessonPage'
import LabPage        from '@/pages/LabPage'
import SkillCheckPage from '@/pages/SkillCheckPage'
import ProfilePage    from '@/pages/ProfilePage'
import SettingsPage   from '@/pages/SettingsPage'
import AdminCMSPage   from '@/pages/AdminCMSPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />}  />
        <Route path="/signup" element={<SignUpPage />}  />

        {/* Protected app shell */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />}  />
          <Route path="paths"      element={<PathsPage />}      />
          <Route path="lesson/:id" element={<LessonPage />}     />
          <Route path="lab"        element={<LabPage />}        />
          <Route path="skillcheck" element={<SkillCheckPage />} />
          <Route path="profile"    element={<ProfilePage />}    />
          <Route path="settings"   element={<SettingsPage />}   />

          {/* Admin-only */}
          <Route path="admin/cms" element={
            <AdminRoute>
              <AdminCMSPage />
            </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
