import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import ScrollToTop from '@/components/layout/ScrollToTop'
import SmoothScroll from '@/components/layout/SmoothScroll'
import { ProtectedRoute, AdminRoute, TeacherRoute } from '@/components/layout/ProtectedRoute'

import LandingPage from '@/pages/LandingPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'
import DashboardPage from '@/pages/DashboardPage'
import PathsPage from '@/pages/PathsPage'
import LessonPage from '@/pages/LessonPage'
import LabPage from '@/pages/LabPage'
import SkillCheckPage from '@/pages/SkillCheckPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import ClassroomsPage from '@/pages/classroom/ClassroomsPage'
import ClassroomPage from '@/pages/classroom/ClassroomPage'
import AssignmentPage from '@/pages/classroom/AssignmentPage'
import ShowcasePage from '@/pages/community/ShowcasePage'

import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import ExerciseBuilder from '@/pages/teacher/ExerciseBuilder'
import MultiplayerIDE from '@/pages/teacher/MultiplayerIDE'
import AdminCMSPage from '@/pages/AdminCMSPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import DialogHost from '@/components/ui/DialogHost'

function ToClass() {
  const { classroomId } = useParams()
  return <Navigate to={`/app/classrooms/${classroomId}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <ScrollToTop />
        <DialogHost />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected app shell */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Courses / Curriculum */}
            <Route path="paths" element={<PathsPage />} />
            <Route path="paths/:pathId" element={<PathsPage />} />
            <Route path="paths/:pathId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="paths/:pathId/modules/:moduleId/skill-check" element={<SkillCheckPage />} />
            
            {/* Direct lesson and skillcheck aliases */}
            <Route path="lesson/:id" element={<LessonPage />} />
            <Route path="skillcheck/:moduleId" element={<SkillCheckPage />} />
            
            {/* Interactive features */}
            <Route path="lab" element={<LabPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="classrooms/:classroomId" element={<ClassroomPage />} />
            <Route path="classrooms/:classroomId/assignments/:assignmentId" element={<AssignmentPage />} />
            <Route path="showcase" element={<ShowcasePage />} />
            {/* The class forum became the class stream */}
            <Route path="forum/:classroomId" element={<ToClass />} />
            <Route path="classrooms/:classroomId/forum" element={<ToClass />} />
            
            {/* User account */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Teacher routes */}
            <Route path="teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
            <Route path="teacher/classrooms" element={<Navigate to="/app/classrooms" replace />} />
            <Route path="teacher/cms" element={<TeacherRoute><AdminCMSPage /></TeacherRoute>} />
            <Route path="teacher/exercises" element={<TeacherRoute><ExerciseBuilder /></TeacherRoute>} />
            <Route path="teacher/workspace/:studentId" element={<TeacherRoute><MultiplayerIDE /></TeacherRoute>} />
            <Route path="teacher/multiplayer/:sessionId" element={<TeacherRoute><MultiplayerIDE /></TeacherRoute>} />

            {/* Admin routes */}
            <Route path="admin/cms" element={<AdminRoute><AdminCMSPage /></AdminRoute>} />

            {/* Inside app fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Legacy / Top-level Teacher aliases */}
          <Route path="/teacher/dashboard" element={<Navigate to="/app/teacher/dashboard" replace />} />
          <Route path="/teacher/classrooms" element={<Navigate to="/app/classrooms" replace />} />
          <Route path="/teacher/cms" element={<Navigate to="/app/teacher/cms" replace />} />
          <Route path="/teacher/exercises" element={<Navigate to="/app/teacher/exercises" replace />} />

          {/* Global Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  )
}
