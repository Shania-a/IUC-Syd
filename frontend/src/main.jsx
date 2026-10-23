// main.jsx
// Startpunkten för hela appen. Här kopplas React till sidan.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // NY: routern
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter gör att appen kan ha flera adresser, t.ex. /admin/foretag */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)