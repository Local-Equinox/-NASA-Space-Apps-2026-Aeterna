import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initDevice } from './lib/device'
import './styles.css'

initDevice()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
