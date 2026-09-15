import React, { useEffect, useState } from 'react'
import { projectApi } from '@/lib/api'
import { Button, CodeBlock } from '@/components/ui'
import { Heart, Plus, X, Sparkles } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import styles from './ShowcasePage.module.css'

export default function ShowcasePage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const res = await projectApi.list()
      setProjects(res.projects)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await projectApi.create({ title, description, code, language })
      setTitle('')
      setDescription('')
      setCode('')
      setShowNew(false)
      loadProjects()
      alert('Project published! You earned +30 XP.')
    } catch (err) {
      alert('Failed to publish project')
    }
  }

  async function handleLike(id) {
    try {
      await projectApi.toggleLike(id)
      loadProjects()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2>Project Showcase</h2>
          <p className={styles.sub}>Check out what other students are building!</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} variant="teal" icon={showNew ? <X size={16} /> : <Plus size={16} />}>
          {showNew ? 'Cancel' : 'Publish a Project'}
        </Button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className={styles.newForm}>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Project Title" 
            required 
            className={styles.input}
          />
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="What does it do?" 
            className={styles.textarea}
            rows={2}
          />
          <select value={language} onChange={e => setLanguage(e.target.value)} className={styles.input}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <div className={styles.editorWrap}>
            <CodeMirror
              value={code}
              height="200px"
              theme="dark"
              extensions={language === 'python' ? [python()] : [javascript()]}
              onChange={(val) => setCode(val)}
            />
          </div>
          <Button type="submit" icon={<Sparkles size={16} />}>Publish</Button>
        </form>
      )}

      <div className={styles.grid}>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects published yet.</p>
        ) : (
          projects.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{p.avatar_url || '?'}</div>
                <div className={styles.cardMeta}>
                  <h4>{p.title}</h4>
                  <span>by {p.author_name}</span>
                </div>
              </div>
              {p.description && <p className={styles.desc}>{p.description}</p>}
              <div className={styles.codeWrap}>
                <CodeBlock code={p.code} />
              </div>
              <div className={styles.cardFooter}>
                <button 
                  className={`${styles.likeBtn} ${p.liked_by_me ? styles.liked : ''}`}
                  onClick={() => handleLike(p.id)}
                  aria-label="Like project"
                >
                  <Heart 
                    size={15} 
                    fill={p.liked_by_me ? "var(--red, #D93025)" : "none"} 
                    stroke={p.liked_by_me ? "var(--red, #D93025)" : "currentColor"} 
                  />
                  <span>{p.likes_count}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
