import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/utils/dayjs'
import '@/assets/styles/globals.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
