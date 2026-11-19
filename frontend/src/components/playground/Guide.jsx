import React, { useState } from 'react'
import Icon from '@/components/icons/Icons'
import { TRACKS } from '@/lib/shell/missions'
import styles from './Playground.module.css'

/* Three short tracks of tasks. Each task ticks itself off by checking the
   workspace, so there's nothing to mark by hand. */
export default function Guide({ done, onType, onResetProgress }) {
  const firstOpen = TRACKS.find((t) => t.missions.some((m) => !done.has(m.id)))?.id || TRACKS[0].id
  const [openTrack, setOpenTrack] = useState(firstOpen)
  const total = TRACKS.reduce((n, t) => n + t.missions.length, 0)
  const completed = TRACKS.reduce((n, t) => n + t.missions.filter((m) => done.has(m.id)).length, 0)

  return (
    <div className={styles.guide}>
      <div className={styles.guideIntro}>
        <p>Short tasks that tick themselves off as you work. Do them in the terminal, the editor, or both.</p>
        <div className={styles.guideMeter} aria-label={`${completed} of ${total} tasks done`}>
          <span style={{ transform: `scaleX(${completed / total})` }} />
        </div>
        <span className={styles.guideCount}>{completed} of {total} done</span>
      </div>

      {TRACKS.map((t) => {
        const n = t.missions.filter((m) => done.has(m.id)).length
        const open = openTrack === t.id
        const current = t.missions.find((m) => !done.has(m.id))
        return (
          <section key={t.id} className={styles.track} data-open={open}>
            <button type="button" className={styles.trackHead} onClick={() => setOpenTrack(open ? null : t.id)} aria-expanded={open}>
              <span className={styles.trackRing} style={{ '--frac': n / t.missions.length }} data-done={n === t.missions.length}>
                {n === t.missions.length ? <Icon name="check" size={12} /> : null}
              </span>
              <span className={styles.trackText}>
                <span className={styles.trackTitle}>{t.title}</span>
                <span className={styles.trackSub}>{n === t.missions.length ? 'All done' : `${n} of ${t.missions.length} · ${t.blurb}`}</span>
              </span>
              <Icon name="chevronDown" size={16} className={styles.trackChev} />
            </button>
            {open && (
              <ol className={styles.missions}>
                {t.missions.map((m) => {
                  const isDone = done.has(m.id)
                  const isCurrent = current?.id === m.id
                  return (
                    <li key={m.id} className={styles.mission} data-state={isDone ? 'done' : isCurrent ? 'now' : 'todo'}>
                      <span className={styles.mDot} aria-hidden="true">{isDone && <Icon name="check" size={11} />}</span>
                      <div className={styles.mBody}>
                        <span className={styles.mTitle}>{m.title}</span>
                        {isCurrent && (
                          <>
                            <span className={styles.mDetail}>{m.detail}</span>
                            {m.cmd && (
                              <button type="button" className={styles.mCmd} onClick={() => onType(m.cmd)} title="Put this in the terminal">
                                <code><span>$</span>{m.cmd}</code>
                                <span className={styles.mCmdGo}>Type it <Icon name="arrowRight" size={13} /></span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        )
      })}

      {completed > 0 && (
        <button type="button" className={styles.guideReset} onClick={onResetProgress}>Start the tasks again</button>
      )}
    </div>
  )
}
