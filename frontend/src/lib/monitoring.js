/* Error reports from people's browsers (sentry.io). Off unless
   VITE_SENTRY_DSN is set, and loaded after the page so it never slows the
   first paint. No personal data: no IPs, no form contents, no session replays. */
export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || import.meta.env.DEV) return
  const start = () => import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_RELEASE || undefined,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      // Noise from browser extensions and flaky networks, not our bugs
      ignoreErrors: ['ResizeObserver loop', 'Failed to fetch', 'NetworkError', 'Load failed'],
      denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-extension:\/\//],
    })
  }).catch(() => {})
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 4000 })
  else setTimeout(start, 2000)
}
