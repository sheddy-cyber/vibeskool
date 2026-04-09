import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Geist Mono — bundled at build time, no CDN dependency
import '@fontsource/geist-mono/300.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
