import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll the window to top on every route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // Also scroll any overflow containers (the app main panel)
    const main = document.querySelector('main')
    if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
