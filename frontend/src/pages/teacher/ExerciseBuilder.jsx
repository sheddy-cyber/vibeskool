import React, { useState, useEffect } from 'react'
import { exerciseApi, contentApi } from '@/lib/api'
import { SectionTitle, Button, CodeBlock } from '@/components/ui'
import { FadeUp } from '@/components/ui/Motion'
import styles from './ExerciseBuilder.module.css'

export default function ExerciseBuilder() {
  const [lessons, setLessons] = useState([])
  const [exercises, setExercises] = useState([])
  
  const [selectedLesson, setSelectedLesson] = useState('')
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [starterCode, setStarterCode] = useState('')
  const [solutionCode, setSolutionCode] = useState('')
  const [testCases, setTestCases] = useState([{ input: '', expected_output: '' }])
  
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    contentApi.getLessons().then(res => {
      setLessons(res.lessons || [])
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedLesson) {
      exerciseApi.list(selectedLesson).then(res => {
        setExercises(res.exercises || [])
      }).catch(console.error)
    } else {
      setExercises([])
    }
  }, [selectedLesson])

  async function handleSave(e) {
    e.preventDefault()
    if (!selectedLesson || !title) return alert('Lesson and Title are required')
    
    try {
      setSaving(true)
      const payload = {
        lesson_id: selectedLesson,
        type: 'coding',
        title,
        instructions,
        language,
        starter_code: starterCode,
        solution_code: solutionCode,
        test_cases: testCases.filter(tc => tc.input || tc.expected_output)
      }
      
      const res = await exerciseApi.create(payload)
      setExercises([...exercises, res.exercise])
      
      setTitle('')
      setInstructions('')
      setStarterCode('')
      setSolutionCode('')
      setTestCases([{ input: '', expected_output: '' }])
      alert('Exercise created successfully!')
    } catch (err) {
      alert(err.message || 'Failed to create exercise')
    } finally {
      setSaving(false)
    }
  }

  function addTestCase() {
    setTestCases([...testCases, { input: '', expected_output: '' }])
  }

  function updateTestCase(idx, field, val) {
    const newCases = [...testCases]
    newCases[idx][field] = val
    setTestCases(newCases)
  }

  function removeTestCase(idx) {
    setTestCases(testCases.filter((_, i) => i !== idx))
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this exercise?')) return
    try {
      await exerciseApi.delete(id)
      setExercises(exercises.filter(e => e.id !== id))
    } catch (err) {
      alert('Failed to delete')
    }
  }

  return (
    <div className={styles.page}>
      <FadeUp delay={0}>
        <div className={styles.header}>
          <SectionTitle>Exercise Builder</SectionTitle>
          <p className={styles.sub}>Create interactive coding challenges mapped to specific lessons.</p>
        </div>
      </FadeUp>

      <div className={styles.layout}>
        <div className={styles.formPanel}>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Select Target Lesson</label>
              <select 
                value={selectedLesson} 
                onChange={e => setSelectedLesson(e.target.value)}
                required
              >
                <option value="">-- Choose a lesson --</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title} ({l.pathName})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Exercise Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Write a sum function" />
            </div>

            <div className={styles.formGroup}>
              <label>Instructions (Markdown supported)</label>
              <textarea rows={4} value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Starter Code (shown to student)</label>
              <textarea rows={6} className={styles.codeArea} value={starterCode} onChange={e => setStarterCode(e.target.value)} spellCheck={false} />
            </div>

            <div className={styles.formGroup}>
              <label>Solution Code (hidden)</label>
              <textarea rows={6} className={styles.codeArea} value={solutionCode} onChange={e => setSolutionCode(e.target.value)} spellCheck={false} />
            </div>

            <div className={styles.testCases}>
              <div className={styles.tcHeader}>
                <h3>Automated Test Cases</h3>
                <button type="button" className={styles.addTcBtn} onClick={addTestCase}>+ Add Test Case</button>
              </div>
              <p className={styles.hint}>For JS, the input will be appended to the user code inside a console.log. Example: input = `sum(1, 2)`, expected output = `3`.</p>
              
              {testCases.map((tc, i) => (
                <div key={i} className={styles.tcRow}>
                  <div className={styles.tcInputs}>
                    <input 
                      placeholder="Input / Function call" 
                      value={tc.input} 
                      onChange={e => updateTestCase(i, 'input', e.target.value)} 
                    />
                    <input 
                      placeholder="Expected Output (stdout)" 
                      value={tc.expected_output} 
                      onChange={e => updateTestCase(i, 'expected_output', e.target.value)} 
                    />
                  </div>
                  <button type="button" className={styles.removeTcBtn} onClick={() => removeTestCase(i)}>X</button>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={saving} variant="primary">
              {saving ? 'Saving...' : 'Create Exercise'}
            </Button>
          </form>
        </div>

        <div className={styles.listPanel}>
          <h3>Existing Exercises for Lesson</h3>
          {!selectedLesson ? (
            <p className={styles.empty}>Select a lesson to view its exercises.</p>
          ) : exercises.length === 0 ? (
            <p className={styles.empty}>No exercises yet.</p>
          ) : (
            <div className={styles.exerciseList}>
              {exercises.map(e => (
                <div key={e.id} className={styles.exCard}>
                  <div className={styles.exHeader}>
                    <h4>{e.title}</h4>
                    <button onClick={() => handleDelete(e.id)} className={styles.delBtn}>Delete</button>
                  </div>
                  <span className={styles.badge}>{e.language}</span>
                  <p className={styles.exTests}>{e.test_cases?.length || 0} test cases</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
