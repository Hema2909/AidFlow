import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ReportEmergency from './pages/ReportEmergency'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/emergency" element={<ReportEmergency />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
