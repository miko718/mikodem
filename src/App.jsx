import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ShareLocation from './pages/ShareLocation'
import RespondLate from './pages/RespondLate'

function App() {
  return (
    <div className="app" dir="rtl">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/share/:eventId" element={<ShareLocation />} />
        <Route path="/respond/:eventId/:choice" element={<RespondLate />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
