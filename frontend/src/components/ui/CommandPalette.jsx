import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS, useStore } from '@/lib/store'
import styles from './CommandPalette.module.css'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { settings, updateSettings } = useStore()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build searchable items
  const navItems = [
    { id: 'dash', title: 'Dashboard', icon: '📊', path: '/app/dashboard', group: 'Navigation' },
    { id: 'paths', title: 'Curriculum & Skill Paths', icon: '🗺️', path: '/app/paths', group: 'Navigation' },
    { id: 'lab', title: 'Sandbox IDE Lab', icon: '💻', path: '/app/lab', group: 'Navigation' },
    { id: 'profile', title: 'Student Transcript & Profile', icon: '📜', path: '/app/profile', group: 'Navigation' },
    { id: 'settings', title: 'Platform Settings', icon: '⚙️', path: '/app/settings', group: 'Navigation' },
    { id: 'landing', title: 'Academy Homepage', icon: '🏛️', path: '/', group: 'Navigation' },
  ]

  const actionItems = [
    /* Theme controls intentionally removed: the school has one fixed visual system.
    {
      id: 'toggle-theme',
      title: settings.theme === 'dark' ? 'Switch to Light Academic Paper Theme' : 'Switch to Dark Obsidian Theme',
      icon: '🌓',
      action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
      group: 'Actions'
    }, */
    {
      id: 'compact-sidebar',
      title: settings.compactSidebar ? 'Expand Sidebar' : 'Collapse Sidebar to Compact Icons',
      icon: '📐',
      action: () => updateSettings({ compactSidebar: !settings.compactSidebar }),
      group: 'Actions'
    }
  ]

  // Flatten lessons for quick jump
  const lessonItems = []
  PATHS.forEach(p => {
    p.lessons_data?.forEach(l => {
      lessonItems.push({
        id: `lesson-${l.id}`,
        title: l.title,
        sub: p.name,
        icon: '📖',
        path: `/app/lesson/${l.id}`,
        group: 'Curriculum Lessons'
      })
    })
  })

  const allItems = [...navItems, ...actionItems, ...lessonItems]

  const filteredItems = query.trim() === ''
    ? [...navItems, ...actionItems]
    : allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.sub && item.sub.toLowerCase().includes(query.toLowerCase())) ||
        item.group.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredItems[activeIndex]
      if (selected) {
        selectItem(selected)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const selectItem = (item) => {
    onClose()
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Type a command or search lessons, paths, tools..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="kbd">ESC</kbd>
        </div>

        <div className={styles.resultsList}>
          {filteredItems.length === 0 ? (
            <div className={styles.empty}>No matches found for "{query}"</div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <span className={styles.itemText}>{item.title}</span>
                  {item.sub && <span className={styles.itemSub}>({item.sub})</span>}
                </div>
                <span className={styles.itemShortcut}>{item.group}</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerShortcuts}>
            <span className={styles.shortcutHelper}><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> Navigate</span>
            <span className={styles.shortcutHelper}><kbd className="kbd">↵</kbd> Select</span>
            <span className={styles.shortcutHelper}><kbd className="kbd">ESC</kbd> Close</span>
          </div>
          <span>VibeSkool Quick Launch</span>
        </div>
      </div>
    </div>
  )
}
