import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import InterviewSetup from './pages/InterviewSetup'
import Interview from './pages/Interview'
import Summary from './pages/Summary'
import SessionDetail from './pages/SessionDetail'

// Route protection
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Landing />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes: authentication required */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview/setup" element={<InterviewSetup />} />

            <Route
              path="/interview/:sessionId"
              element={<Interview />}
            />

            <Route
              path="/interview/:sessionId/summary"
              element={<Summary />}
            />

            <Route
              path="/session/:sessionId"
              element={<SessionDetail />}
            />

            <Route
              path="/sessions/:sessionId"
              element={<SessionDetail />}
            />
          </Route>

          {/* Unknown routes */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}