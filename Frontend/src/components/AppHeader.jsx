import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AppHeader.css'

export default function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const activeTab = location.pathname.startsWith('/setup') ||
    location.pathname.startsWith('/interview/setup')
    ? 'Practice'
    : location.pathname.startsWith('/session') ||
      location.pathname.startsWith('/sessions')
      ? 'History'
      : location.pathname.startsWith('/dashboard')
        ? 'Overview'
        : ''

  return (
    <header className="app-header">
      <button
        className="app-header-brand"
        onClick={() => navigate('/dashboard')}
        aria-label="Go to dashboard"
      >
        <span className="app-header-brand-icon">✳</span>
        <span>
          Interview<span className="app-header-script">Mentor</span>
        </span>
      </button>

      <nav className="app-header-nav">
        <button
          className={activeTab === 'Overview' ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
        >
          Overview
        </button>

        <button
          className={activeTab === 'Practice' ? 'active' : ''}
          onClick={() => navigate('/setup')}
        >
          Practice
        </button>

        <button
          className={activeTab === 'History' ? 'active' : ''}
          onClick={() => navigate('/dashboard#interview-history')}
        >
          History
        </button>
      </nav>

      <div className="app-header-account">
        <div className="app-header-avatar">
          {(user?.name?.trim()?.[0] || 'U').toUpperCase()}
        </div>

        <div className="app-header-user">
          <span>{user?.name || 'Your account'}</span>
          <small>Interview candidate</small>
        </div>

        <button
          className="app-header-logout"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
        >
          ↗
        </button>
      </div>
    </header>
  )
}