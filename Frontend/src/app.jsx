import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Register from './pages/Register'
import InterviewSetup from './pages/InterviewSetup'
import Interview from './pages/Interview'
import Summary from './pages/Summary'
import SessionDetail from './pages/SessionDetail'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Flow */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Landing />} />
          <Route path="/register" element={<Register />} />

          {/* Setup Routes */}
          <Route path="/setup" element={<InterviewSetup />} />
          <Route path="/interview/setup" element={<InterviewSetup />} />

          {/* Active Interview & Summary Flow */}
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/interview/:sessionId/summary" element={<Summary />} />

          {/* Past History & Transcript Details */}
          <Route path="/session/:sessionId" element={<SessionDetail />} />
          <Route path="/sessions/:sessionId" element={<SessionDetail />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}