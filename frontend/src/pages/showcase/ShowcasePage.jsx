import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '@/components/icons/Icons'
import { Empty, Segmented, Skeleton } from '@/components/classroom/Parts'
import ProjectCard, { Byline, ProjectMedia } from '@/components/showcase/ProjectCard'
import { showcaseApi } from '@/lib/api'
import { errorText } from '@/lib/classroom'
import ui from '../classroom/Classroom.module.css'
import styles from './Showcase.module.css'

const SCOPES = [
  { value: 'all', label: 'Everyone' },
  { value: 'classes', label: 'My classes' },
  { value: 'mine', label: 'Mine' },
]

function FeaturedHero({ project }) {
  const href = `/app/showcase/${project.id}`
  return (
    <section className={styles.hero} aria-labelledby="featured-title">
      <Link to={href} className={styles.heroMedia} tabIndex={-1} aria-hidden="true">
        <ProjectMedia project={project} priority />
      </Link>
      <div className={styles.heroBody}>
        <span className={styles.heroLabel}><Icon name="flag" size={14} /> Featured by a tutor</span>
        <h2 id="featured-title" className={styles.heroTitle}><Link to={href}>{project.title}</Link></h2>
        {project.tagline && <p className={styles.heroTagline}>{project.tagline}</p>}
        <div className={styles.heroFoot}>
          <Byline members={project.members} size={28} />
          <div className={styles.heroActions}>
            <Link to={href} className={ui.btnPrimary}>See the project</Link>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={ui.btnGhost}>
                Visit site <Icon name="arrowUpRight" size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function ShowcasePage() {
  const [params, setParams] = useSearchParams()
  const scope = SCOPES.some((s) => s.value === params.get('scope')) ? params.get('scope') : 'all'
  const tag = params.get('tag') || ''
  const sort = params.get('sort') === 'popular' ? 'popular' : 'new'
  const [q, setQ] = useState(params.get('q') || '')
  const query = useDebounced(q.trim(), 300)

  const [state, setState] = useState({ loading: true, projects: [], featured: [], tags: [], hasMore: false, page: 1, error: null })
  const [loadingMore, setLoadingMore] = useState(false)
  const request = useRef(0)

  const setParam = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (!value || (key === 'scope' && value === 'all') || (key === 'sort' && value === 'new')) next.delete(key)
      else next.set(key, value)
      return next
    }, { replace: true })
  }, [setParams])

  useEffect(() => { setParam('q', query) }, [query, setParam])

  useEffect(() => {
    const id = ++request.current
    setState((s) => ({ ...s, loading: true, error: null }))
    showcaseApi.list({ scope, tag, sort, q: query })
      .then((d) => {
        if (id !== request.current) return
        setState({ loading: false, projects: d.projects, featured: d.featured || [], tags: d.tags || [], hasMore: d.hasMore, page: 1, error: null })
      })
      .catch((err) => { if (id === request.current) setState((s) => ({ ...s, loading: false, error: errorText(err) })) })
  }, [scope, tag, sort, query])

  const more = async () => {
    setLoadingMore(true)
    try {
      const d = await showcaseApi.list({ scope, tag, sort, q: query, page: state.page + 1 })
      setState((s) => ({ ...s, projects: [...s.projects, ...d.projects], hasMore: d.hasMore, page: d.page }))
    } finally {
      setLoadingMore(false)
    }
  }

  const filtered = Boolean(query || tag)
  const hero = !filtered && scope === 'all' && sort === 'new' ? state.featured[0] : null
  const list = hero ? state.projects.filter((p) => p.id !== hero.id) : state.projects

  const clear = () => { setQ(''); setParams(scope === 'all' ? {} : { scope }, { replace: true }) }

  let empty = null
  if (!state.loading && !state.error && state.projects.length === 0) {
    if (filtered) {
      empty = <Empty icon="search" title="Nothing matches that" action={<button type="button" className={ui.btnGhost} onClick={clear}>Clear search</button>}>Try another word, or a different tag.</Empty>
    } else if (scope === 'mine') {
      empty = (
        <Empty icon="showcase" title="You haven't shared anything yet" action={<Link to="/app/showcase/new" className={ui.btnPrimary}><Icon name="plus" size={16} /> Share a project</Link>}>
          Built something, even something small? Share the live link or the code. Unfinished is fine: save it as a draft.
        </Empty>
      )
    } else if (scope === 'classes') {
      empty = <Empty icon="classroom" title="Nothing from your classes yet">When classmates or your tutor share a project, it shows up here.</Empty>
    } else {
      empty = (
        <Empty icon="showcase" title="Be the first to share something" action={<Link to="/app/showcase/new" className={ui.btnPrimary}><Icon name="plus" size={16} /> Share a project</Link>}>
          The showcase fills up as people share what they build.
        </Empty>
      )
    }
  }

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <div className={ui.headText}>
          <h1 className={ui.title}>Showcase</h1>
          <p className={ui.lead}>What people at VibeSkool have built. Look around for ideas, cheer each other on, and share your own when it's ready.</p>
        </div>
        <Link to="/app/showcase/new" className={ui.btnPrimary}><Icon name="plus" size={17} /> Share a project</Link>
      </header>

      {hero && <FeaturedHero project={hero} />}

      <div className={styles.toolbar}>
        <Segmented value={scope} onChange={(v) => setParam('scope', v)} options={SCOPES} label="Whose projects" />
        <label className={styles.search}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            className={ui.input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, people or tags"
            aria-label="Search the showcase"
          />
        </label>
        <select className={`${ui.select} ${styles.sort}`} value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort">
          <option value="new">Newest</option>
          <option value="popular">Most appreciated</option>
        </select>
      </div>

      {state.tags.length > 0 && (
        <div className={styles.tags} role="toolbar" aria-label="Filter by tag">
          <button type="button" className={styles.tagChip} aria-pressed={!tag} onClick={() => setParam('tag', '')}>All</button>
          {state.tags.map((t) => (
            <button key={t.name} type="button" className={styles.tagChip} aria-pressed={tag === t.name} onClick={() => setParam('tag', tag === t.name ? '' : t.name)}>
              {t.name}<span className={styles.tagCount}>{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {filtered && !state.loading && state.projects.length > 0 && (
        <p className={styles.resultLine} aria-live="polite">
          {state.projects.length}{state.hasMore ? '+' : ''} project{state.projects.length === 1 ? '' : 's'}
          {tag && <> tagged <strong>{tag}</strong></>}
          {query && <> matching “{query}”</>}
          <button type="button" className={ui.textBtn} onClick={clear}>Clear</button>
        </p>
      )}

      {state.loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={ui.card} style={{ overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16 / 10', background: 'var(--bg-raised)' }} />
              <div style={{ padding: 18 }}><Skeleton lines={3} /></div>
            </div>
          ))}
        </div>
      ) : state.error ? (
        <div className={ui.card}><Empty icon="close" title="Couldn't load the showcase">{state.error}</Empty></div>
      ) : empty ? (
        <div className={ui.card}>{empty}</div>
      ) : (
        <>
          <div className={styles.grid}>
            {list.map((p, i) => <ProjectCard key={p.id} project={p} priority={i < 3} />)}
          </div>
          {state.hasMore && (
            <div className={styles.more}>
              <button type="button" className={ui.btnGhost} onClick={more} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Show more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
