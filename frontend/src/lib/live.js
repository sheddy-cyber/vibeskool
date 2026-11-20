import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getToken } from '@/lib/api'

/* Live class updates over a WebSocket.

     <LiveProvider classroomId={id}> … </LiveProvider>
     useLive(['stream'], () => reload())      // runs when the stream changes

   The server sends small "something changed" events (ids only); pages
   refetch through the normal API. If the socket is down, useLive falls back
   to polling, and after a reconnect every subscriber refetches once in case
   it missed something. */

const LiveContext = createContext(null)

const MAX_BACKOFF = 30000
const HEARTBEAT = 25000
const NO_RETRY = new Set([4001, 4003]) // bad token, not in this class

export function socketUrl(path) {
  const base = import.meta.env.VITE_API_URL
  if (base) {
    const u = new URL(base)
    return `${u.protocol === 'https:' ? 'wss' : 'ws'}://${u.host}${path}`
  }
  return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${path}`
}

function useClassroomSocket(classroomId) {
  const [status, setStatus] = useState('connecting') // connecting | live | offline | off
  const listeners = useRef(new Set())

  const emit = useCallback((event) => {
    for (const l of listeners.current) {
      if (event.topic === '*' || l.topics.includes(event.topic)) l.cb(event)
    }
  }, [])

  const subscribe = useCallback((topics, cb) => {
    const entry = { topics, cb }
    listeners.current.add(entry)
    return () => listeners.current.delete(entry)
  }, [])

  useEffect(() => {
    if (!classroomId || typeof WebSocket === 'undefined') { setStatus('off'); return undefined }
    let ws = null
    let retry = null
    let beat = null
    let attempts = 0
    let everLive = false
    let stopped = false

    const connect = () => {
      clearTimeout(retry)
      setStatus((s) => (s === 'live' ? s : 'connecting'))
      ws = new WebSocket(socketUrl(`/ws/classrooms/${classroomId}/`))
      ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token: getToken() }))
      ws.onmessage = (m) => {
        let msg
        try { msg = JSON.parse(m.data) } catch { return }
        if (msg.type === 'ready') {
          attempts = 0
          setStatus('live')
          if (everLive) emit({ topic: '*', action: 'resync' }) // catch up on anything missed
          everLive = true
          clearInterval(beat)
          beat = setInterval(() => { if (ws?.readyState === 1) ws.send('{"type":"ping"}') }, HEARTBEAT)
        } else if (msg.type === 'event') {
          emit(msg)
        }
      }
      ws.onclose = (e) => {
        clearInterval(beat)
        if (stopped) return
        if (NO_RETRY.has(e.code)) { setStatus('off'); return }
        setStatus('offline')
        attempts += 1
        const wait = Math.min(MAX_BACKOFF, 1000 * 2 ** Math.min(attempts - 1, 5)) * (0.75 + Math.random() * 0.5)
        retry = setTimeout(connect, wait)
      }
    }

    // Come back quickly when the network or the tab returns
    const wake = () => {
      if (document.visibilityState === 'visible' && ws && ws.readyState > 1) { attempts = 0; connect() }
    }
    window.addEventListener('online', wake)
    document.addEventListener('visibilitychange', wake)
    connect()

    return () => {
      stopped = true
      clearTimeout(retry)
      clearInterval(beat)
      window.removeEventListener('online', wake)
      document.removeEventListener('visibilitychange', wake)
      if (ws) { ws.onclose = null; ws.close() }
    }
  }, [classroomId, emit])

  return useMemo(() => ({ status, subscribe }), [status, subscribe])
}

export function LiveProvider({ classroomId, children }) {
  const live = useClassroomSocket(classroomId)
  return createElement(LiveContext.Provider, { value: live }, children)
}

export function useLiveStatus() {
  return useContext(LiveContext)?.status || 'off'
}

/**
 * Run `cb(event)` when one of `topics` changes in this class.
 * Bursts are merged (one call per `debounceMs`). While the socket is down
 * it polls every `fallbackMs` instead, so the page never goes stale.
 */
export function useLive(topics, cb, { fallbackMs = 30000, debounceMs = 250 } = {}) {
  const live = useContext(LiveContext)
  const cbRef = useRef(cb)
  cbRef.current = cb
  const key = topics.join(',')

  useEffect(() => {
    if (!live) return undefined
    let timer = null
    let last = null
    const off = live.subscribe(key.split(','), (event) => {
      last = event
      clearTimeout(timer)
      timer = setTimeout(() => cbRef.current(last), debounceMs)
    })
    return () => { clearTimeout(timer); off() }
  }, [live?.subscribe, key, debounceMs])

  const status = live?.status
  useEffect(() => {
    if (!fallbackMs || status === 'live') return undefined
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') cbRef.current({ topic: 'poll', action: 'poll' })
    }, fallbackMs)
    return () => clearInterval(t)
  }, [status, fallbackMs])
}
