import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './styles/index.css'

// Feature-detected like WebMCP: without a Clerk key (local dev, forks that
// haven't set one up), the app renders fully functional and unauthenticated
// rather than crashing. Login/subscribe UI hides itself the same way.
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  clerkKey ? <ClerkProvider publishableKey={clerkKey}>{app}</ClerkProvider> : app,
)

// The brand splash (inline in index.html) fades once React has painted.
requestAnimationFrame(() => {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('done')
  setTimeout(() => splash.remove(), 400)
})
