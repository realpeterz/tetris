/**
 * Main entry point for the React application.
 * Sets up the root React component with StrictMode enabled.
 * @module main
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize the React application by mounting it to the root DOM element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
