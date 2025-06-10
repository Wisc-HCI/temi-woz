// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import WizardPage from './pages/Wizard'
import ParticipantPage from './pages/Participant'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/wizard" element={<WizardPage />} />
      <Route path="/participant" element={<ParticipantPage />} />
    </Routes>
  )
}

export default App
