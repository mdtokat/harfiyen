import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/rubik/latin-500.css'
import '@fontsource/rubik/latin-ext-500.css'
import '@fontsource/rubik/latin-700.css'
import '@fontsource/rubik/latin-ext-700.css'
import '@fontsource/rubik/latin-800.css'
import '@fontsource/rubik/latin-ext-800.css'
import './styles.css'
import App from './App'
import { gorunumuUygula } from './lib/ayarlar'

gorunumuUygula()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
