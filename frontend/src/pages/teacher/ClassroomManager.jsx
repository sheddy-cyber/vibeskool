import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { classroomApi } from '@/lib/api'
import { Button, SectionTitle } from '@/components/ui'
import { FadeUp } from '@/components/ui/Motion'
import styles from './ClassroomManager.module.css'

export default function ClassroomManager() {
  const navigate = useNavigate()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [activeAnalytics, setActiveAnalytics] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  async function fetchClassrooms() {
    try {
      setLoading(true)
      const res = await classroomApi.list()
      setClassrooms(res.classrooms || [])
    } catch (err) {
      console.error('Failed to fetch classrooms', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAnalytics(id) {
    setActiveAnalytics(id)
    setAnalyticsData(null)
    try {
      const data = await classroomApi.getAnalytics(id)
      setAnalyticsData(data)
    } catch (err) {
      console.error(err)
      alert("Failed to load analytics")
      setActiveAnalytics(null)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name) return
    try {
      setCreating(true)
      const res = await classroomApi.create({ name, description })
      setClassrooms([res.classroom, ...classrooms])
      setName('')
      setDescription('')
    } catch (err) {
      alert('Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this classroom? All data will be lost.')) return
    try {
      await classroomApi.delete(id)
      setClassrooms(classrooms.filter(c => c.id !== id))
    } catch (err) {
      alert('Failed to delete classroom')
    }
  }

  return (
    <div className={styles.page}>
      <FadeUp delay={0}>
        <div className={styles.header}>
          <SectionTitle>Classroom Manager</SectionTitle>
          <p className={styles.sub}>Create and manage your classrooms, invite students, and track their progress.</p>
        </div>
      </FadeUp>

      <FadeUp delay={50}>
        <form onSubmit={handleCreate} className={styles.createForm}>
          <h3>Create New Classroom</h3>
          <div className={styles.formGroup}>
            <label>Classroom Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Fall 2026 Intro to Web Dev"
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description (optional)</label>
            <input 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Short description..." 
            />
          </div>
          <Button type="submit" disabled={creating || !name} variant="primary">
            {creating ? 'Creating...' : 'Create Classroom'}
          </Button>
        </form>
      </FadeUp>

      <div className={styles.list}>
        {loading ? (
          <p>Loading classrooms...</p>
        ) : classrooms.length === 0 ? (
          <p className={styles.empty}>You haven't created any classrooms yet.</p>
        ) : (
          classrooms.map(c => (
            <FadeUp key={c.id}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>{c.name}</h4>
                  <Badge>{c.member_count} Students</Badge>
                </div>
                {c.description && <p className={styles.desc}>{c.description}</p>}
                
                <div className={styles.inviteBox}>
                  <span>Invite Code:</span>
                  <code className={styles.code}>{c.invite_code}</code>
                </div>

                <div className={styles.actions}>
                  {activeAnalytics === c.id ? (
                    <Button variant="outline" onClick={() => setActiveAnalytics(null)}>Close Analytics</Button>
                  ) : (
                    <Button variant="outline" onClick={() => fetchAnalytics(c.id)}>View Analytics</Button>
                  )}
                  <Button variant="outline" onClick={() => {
                    const sid = prompt('Enter Student ID to pair program:')
                    if (sid) navigate('/app/teacher/workspace/' + sid)
                  }}>Pair Program</Button>
                  <Button variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
                </div>

                {activeAnalytics === c.id && analyticsData && (
                  <div className={styles.analyticsPanel}>
                    <h4>Classroom Analytics</h4>
                    <div className={styles.statsRow}>
                      <div className={styles.statBox}>
                        <span>Total Students</span>
                        <strong>{analyticsData.totalStudents}</strong>
                      </div>
                      <div className={styles.statBox}>
                        <span>Avg XP</span>
                        <strong>{analyticsData.avgXp}</strong>
                      </div>
                    </div>
                    {analyticsData.difficultExercises && analyticsData.difficultExercises.length > 0 && (
                      <div className={styles.difficulties}>
                        <h5>Most Difficult Exercises</h5>
                        <ul>
                          {analyticsData.difficultExercises.map((ex, i) => (
                            <li key={i}>
                              <span className={styles.exTitle}>{ex.title}</span>
                              <span className={styles.exStats}>{ex.passRate}% pass rate ({ex.passed}/{ex.attempts})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FadeUp>
          ))
        )}
      </div>
    </div>
  )
}

function Badge({ children }) {
  return (
    <span style={{
      background: 'var(--bg-accent)',
      color: 'var(--accent)',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 600
    }}>
      {children}
    </span>
  )
}
