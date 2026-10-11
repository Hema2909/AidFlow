import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import ReportEmergency from './pages/ReportEmergency'
import TrackCase from './pages/TrackCase'
import ControlRoom from './pages/ControlRoom'
import HospitalsPage from './pages/HospitalsPage'
import { AlertsPage, DeliveryPatrol, LiveTracking } from './pages/OperationsPages'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/emergency" element={<ReportEmergency />} />
        <Route path="/track/:caseId" element={<TrackCase />} />
        <Route path="/control-room" element={<ControlRoom />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/delivery-patrol" element={<DeliveryPatrol />} />
        <Route path="/live-tracking" element={<LiveTracking />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
