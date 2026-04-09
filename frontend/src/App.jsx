import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout    from '@/components/layout/AppLayout'
import ScrollToTop  from '@/components/layout/ScrollToTop'
import LandingPage  from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import PathsPage    from '@/pages/PathsPage'
import LessonPage   from '@/pages/LessonPage'
import LabPage      from '@/pages/LabPage'
import SkillCheckPage from '@/pages/SkillCheckPage'
import ProfilePage  from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import AdminCMSPage from '@/pages/AdminCMSPage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Scrolls to top on every route change */}
      <ScrollToTop />

      <Routes>
        {/* Public landing */}
        <Route path="/" element={<LandingPage />} />

        {/* App shell — persistent sidebar + topbar */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="paths"      element={<PathsPage />} />
          <Route path="lesson/:id" element={<LessonPage />} />
          <Route path="lab"        element={<LabPage />} />
          <Route path="skillcheck" element={<SkillCheckPage />} />
          <Route path="profile"    element={<ProfilePage />} />
          <Route path="settings"   element={<SettingsPage />} />
          <Route path="admin/cms"   element={<AdminCMSPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
