import React from 'react'
import { StockThresholdProvider } from './contexts/StockThresholdContext'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <StockThresholdProvider>
      <App />
    </StockThresholdProvider>
  </BrowserRouter>
)
