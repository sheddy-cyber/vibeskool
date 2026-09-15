import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { classroomApi } from '@/lib/api'
import { Button } from '@/components/ui'
import styles from './JoinClassroom.module.css'

export default function JoinClassroom() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

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

  async function handleJoin(e) {
    e.preventDefault()
    if (!inviteCode) return
    try {
      setJoining(true)
      const res = await classroomApi.join(inviteCode)
      setClassrooms([res.classroom, ...classrooms])
      setInviteCode('')
      alert('Successfully joined classroom!')
    } catch (err) {
      alert(err.message || 'Failed to join classroom')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Classrooms</h1>
        <p className={styles.sub}>Join a classroom using an invite code from your teacher.</p>
      </div>

      <form onSubmit={handleJoin} className={styles.joinForm}>
        <h3 className={styles.formTitle}>Join a Classroom</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Invite Code</label>
          <div className={styles.inputRow}>
            <input 
              className={styles.input}
              value={inviteCode} 
              onChange={e => setInviteCode(e.target.value.toUpperCase())} 
              placeholder="e.g. VIBE-A1B2"
              required 
            />
            <Button type="submit" disabled={joining || !inviteCode} variant="primary">
              {joining ? 'Joining...' : 'Join'}
            </Button>
          </div>
        </div>
      </form>

      <div className={styles.list}>
        <h3 className={styles.listTitle}>Enrolled Classrooms</h3>
        {loading ? (
          <p className={styles.empty}>Loading classrooms...</p>
        ) : classrooms.length === 0 ? (
          <p className={styles.empty}>You haven't joined any classrooms yet.</p>
        ) : (
          <div className={styles.grid}>
            {classrooms.map(c => (
              <div key={c.id} className={styles.classCard}>
                <h4 className={styles.className}>{c.name}</h4>
                <p className={styles.classTeacher}>Teacher: {c.teacher?.displayName || 'Unknown'}</p>
                <div className={styles.cardActions}>
                  <Link to={`/app/forum/${c.id}`} className={styles.actionLink}>
                    View Forum →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
