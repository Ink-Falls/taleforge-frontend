// Polyfill for 'global' used by sockjs-client
if (typeof global === 'undefined') {
  window.global = window;
}


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Make sure this import is present
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
