import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { socket } from '@/lib/socket'
import { Button, SectionTitle } from '@/components/ui'
import { FadeUp } from '@/components/ui/Motion'
import styles from './MultiplayerIDE.module.css'

export default function MultiplayerIDE() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState('// Waiting for student...')

  useEffect(() => {
    socket.connect()
    socket.emit('workspace:join', { studentId, role: 'teacher' })
    
    socket.on('workspace:code_update', ({ code }) => {
      setCode(code)
    })

    return () => {
      socket.off('workspace:code_update')
      socket.disconnect()
    }
  }, [studentId])

  return (
    <div className={styles.page}>
      <FadeUp>
        <div className={styles.header}>
          <SectionTitle>Pair Programming</SectionTitle>
          <Button variant="outline" onClick={() => navigate(-1)}>Exit Session</Button>
        </div>
        <p className={styles.sub}>You are live-viewing student {studentId}'s workspace.</p>
        
        <div className={styles.editorWrap}>
          <CodeMirror
            value={code}
            height="400px"
            theme="dark"
            extensions={[javascript()]}
            onChange={(val) => {
              setCode(val)
              socket.emit('workspace:code_change', { studentId, code: val })
            }}
          />
        </div>
      </FadeUp>
    </div>
  )
}
