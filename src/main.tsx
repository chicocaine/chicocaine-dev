import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { initTheme } from './scripts/themes'
import { initFont } from './scripts/fonts'
import App from './App.tsx'

initTheme()
initFont()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
