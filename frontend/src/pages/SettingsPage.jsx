import React from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import styles from './SettingsPage.module.css'

const SIZES = [
  { id: 'sm', label: 'Compact', sample: 'A a', detail: '13 px base text' },
  { id: 'md', label: 'Standard', sample: 'A a', detail: '14 px base text' },
  { id: 'lg', label: 'Spacious', sample: 'A a', detail: '16 px base text' }
]

export default function SettingsPage() {
  const { settings: storedSettings, updateSettings } = useStore()
  const { currentUser, updateUserSettings } = useAuth()
  const settings = currentUser?.settings || storedSettings
  const update = patch => {
    updateSettings(patch)
    updateUserSettings(patch)
  }
  const reset = () => update({ fontSize: 'md', reduceMotion: false })

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div><p className={styles.eyebrow}>Student workspace / preferences</p><h1>Set up a space<br />for close reading.</h1></div>
        <p>These controls affect this browser only. The course interface has one visual identity; preferences make that identity more comfortable to use.</p>
      </header>

      <section className={styles.sheet} aria-labelledby="reading-title">
        <header><p className={styles.eyebrow}>01 / Reading</p><h2 id="reading-title">How the course is set on the page.</h2></header>
        <div className={styles.preference}><div><h3>Text scale</h3><p>Set the base size for course prose, annotations, and interface labels. Code remains intentionally compact.</p></div><div className={styles.sizeChoices} role="group" aria-label="Text scale">{SIZES.map(size => <button key={size.id} aria-pressed={(settings.fontSize || 'md') === size.id} className={(settings.fontSize || 'md') === size.id ? styles.sizeActive : ''} onClick={() => update({ fontSize: size.id })}><span className={styles.sample}>{size.sample}</span><b>{size.label}</b><small>{size.detail}</small></button>)}</div></div>
        <div className={styles.preference}><div><h3>Movement</h3><p>Reduce transitions and entrance effects. This preference works alongside your operating system’s reduced-motion setting.</p></div><button className={`${styles.switch} ${settings.reduceMotion ? styles.switchOn : ''}`} onClick={() => update({ reduceMotion: !settings.reduceMotion })} aria-pressed={Boolean(settings.reduceMotion)}><span>{settings.reduceMotion ? 'Reduced' : 'Standard'}</span><i /></button></div>
      </section>

      <section className={styles.sheet} aria-labelledby="record-title">
        <header><p className={styles.eyebrow}>02 / Record keeping</p><h2 id="record-title">A clear account of what stays here.</h2></header>
        <dl className={styles.record}><div><dt>Course progress</dt><dd>Stored with your signed-in student record and used to continue the syllabus in sequence.</dd></div><div><dt>Studio annotations</dt><dd>Held only for the current browser session. They are prompts for your lesson review, not submitted work.</dd></div><div><dt>Display preferences</dt><dd>Stored locally on this device and applied when you return to the workspace.</dd></div></dl>
      </section>

      <footer className={styles.footer}><p>Resetting restores the standard reading scale and movement setting. It does not alter your transcript or lesson progress.</p><button onClick={reset}>Restore standard preferences <span>→</span></button></footer>
    </div>
  )
}
