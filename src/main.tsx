import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!

// If the root has prerendered content AND the prerendered route matches the current path,
// hydrate it to preserve the HTML. Otherwise fall back to createRoot.
// This prevents React Hydration Error #418 when Cloudflare Pages serves the 
// prerendered index.html as a fallback for un-prerendered SPA routes (like /estimate).
const prerenderedRoute = rootElement.getAttribute('data-prerendered')

if (rootElement.childNodes.length > 0 && prerenderedRoute === window.location.pathname) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
} else {
  // If there's a mismatch, clear out the incorrect prerendered DOM first
  if (rootElement.childNodes.length > 0) {
    rootElement.innerHTML = ''
  }
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}
