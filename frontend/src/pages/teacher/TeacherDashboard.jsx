import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { classroomApi } from '@/lib/api'
import { SectionTitle, StatCard } from '@/components/ui'
import { FadeUp, StaggerGroup } from '@/components/ui/Motion'
import styles from './TeacherDashboard.module.css'

export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classroomApi.list().then(res => {
      setClassrooms(res.classrooms || [])
      setLoading(false)
    }).catch(console.error)
  }, [])

  return (
    <div className={styles.page}>
      <FadeUp delay={0}>
        <div className={styles.header}>
          <SectionTitle>Teacher Dashboard</SectionTitle>
          <p className={styles.sub}>Manage your classrooms, build curriculum, and create exercises.</p>
        </div>
      </FadeUp>

      <StaggerGroup className={styles.stats}>
        <StatCard label="Active Classrooms" value={loading ? '...' : classrooms.length} />
        <StatCard label="Total Students" value={loading ? '...' : classrooms.reduce((acc, c) => acc + (c.student_count || 0), 0)} />
      </StaggerGroup>

      <FadeUp delay={100}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Classrooms</h3>
            <p>Create new classrooms, manage student rosters, and generate invite codes.</p>
            <Link to="/app/teacher/classrooms" className={styles.btn}>Manage Classrooms</Link>
          </div>

          <div className={styles.card}>
            <h3>Curriculum CMS</h3>
            <p>Live-edit your lessons and skill paths. Changes are instantly published.</p>
            <Link to="/app/teacher/cms" className={styles.btn}>Open CMS</Link>
          </div>

          <div className={styles.card}>
            <h3>Exercise Builder</h3>
            <p>Create interactive coding challenges and define automated test cases.</p>
            <Link to="/app/teacher/exercises" className={styles.btn}>Build Exercises</Link>
          </div>
        </div>
      </FadeUp>
    </div>
  )
}
