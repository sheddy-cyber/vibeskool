import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { forumApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button, CodeBlock } from '@/components/ui'
import { Plus, X, Send, ArrowLeft } from 'lucide-react'
import { FadeUp } from '@/components/ui/Motion'
import styles from './ForumPage.module.css'

export default function ForumPage() {
  const { classroomId } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  
  useEffect(() => {
    loadPosts()
  }, [classroomId])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await forumApi.getPosts(classroomId)
      setPosts(res.posts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await forumApi.createPost(classroomId, { title, body })
      setTitle('')
      setBody('')
      setShowNew(false)
      loadPosts()
    } catch (err) {
      alert('Failed to post')
    }
  }

  if (selectedPost) {
    return <ThreadView postId={selectedPost} onBack={() => setSelectedPost(null)} />
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Classroom Q&A Forum</h2>
        <Button onClick={() => setShowNew(!showNew)} variant="teal" icon={showNew ? <X size={16} /> : <Plus size={16} />}>
          {showNew ? 'Cancel' : 'Ask a Question'}
        </Button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className={styles.newPostForm}>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Question title..." 
            required 
            className={styles.input}
          />
          <textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            placeholder="Describe your issue or question. You can paste code." 
            required 
            className={styles.textarea}
            rows={5}
          />
          <Button type="submit" icon={<Send size={15} />}>Post Question</Button>
        </form>
      )}

      <div className={styles.postList}>
        {loading ? (
          <p>Loading discussions...</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>No questions yet. Be the first to ask!</p>
        ) : (
          posts.map(p => (
            <div key={p.id} className={styles.postCard} onClick={() => setSelectedPost(p.id)}>
              <div className={styles.postCardLeft}>
                <div className={styles.avatar}>{p.avatar_url || '?'}</div>
              </div>
              <div className={styles.postCardBody}>
                <h4>{p.title}</h4>
                <p className={styles.meta}>
                  Asked by {p.author_name} • {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.replyCount}>
                {p.reply_count} replies
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ThreadView({ postId, onBack }) {
  const [data, setData] = useState(null)
  const [replyBody, setReplyBody] = useState('')

  useEffect(() => {
    load()
  }, [postId])

  async function load() {
    try {
      const res = await forumApi.getPost(postId)
      setData(res)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleReply(e) {
    e.preventDefault()
    try {
      await forumApi.reply(postId, replyBody)
      setReplyBody('')
      load()
    } catch (err) {
      alert('Failed to reply')
    }
  }

  if (!data) return <div className={styles.page}>Loading thread...</div>

  const { post, replies } = data

  return (
    <div className={styles.page}>
      <button onClick={onBack} className={styles.backBtn}>
        <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
        Back to all questions
      </button>
      
      <div className={styles.threadMain}>
        <h3>{post.title}</h3>
        <p className={styles.meta}>Posted by {post.author_name}</p>
        <div className={styles.threadBody}>
          {post.body}
        </div>
      </div>

      <div className={styles.repliesList}>
        <h4>{replies.length} Replies</h4>
        {replies.map(r => (
          <div key={r.id} className={`${styles.replyCard} ${r.author_role === 'teacher' ? styles.teacherReply : ''}`}>
            <div className={styles.replyAvatar}>{r.avatar_url || '?'}</div>
            <div className={styles.replyContent}>
              <div className={styles.replyHeader}>
                <strong>{r.author_name}</strong> {r.author_role === 'teacher' && <span className={styles.badge}>Teacher</span>}
              </div>
              <div className={styles.replyBody}>{r.body}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className={styles.replyForm}>
        <textarea 
          value={replyBody} 
          onChange={e => setReplyBody(e.target.value)} 
          placeholder="Write a reply..." 
          required 
          className={styles.textarea}
          rows={3}
        />
        <Button type="submit" icon={<Send size={15} />}>Submit Reply</Button>
      </form>
    </div>
  )
}
