import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')!
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// (opcional) si por alguna razon queda el boot, lo removemos
queueMicrotask(() => document.getElementById('boot')?.remove())
