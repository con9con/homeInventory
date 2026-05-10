import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StackProvider, StackTheme } from '@stackframe/stack'
import { stackClient } from './lib/stack.js'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StackProvider app={stackClient}>
      <StackTheme>
        <App />
      </StackTheme>
    </StackProvider>
  </StrictMode>,
)
