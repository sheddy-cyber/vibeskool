import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Geist Mono — bundled via @fontsource so it works on Vercel/Netlify
// with no external CDN dependency at runtime
import '@fontsource/geist-mono/300.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
