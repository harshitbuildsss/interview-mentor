import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function BotIcon({ size = 20, color = '#7c1d3f' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="15" rx="5" fill={color} />
      <circle cx="9" cy="12.5" r="1.6" fill="#fff" />
      <circle cx="15" cy="12.5" r="1.6" fill="#fff" />
      <path d="M12 2v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.2" fill={color} />
    </svg>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="w-full bg-[#fdf7f5] border-b border-[#eee0e2] px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/setup" className="flex items-center gap-2">
          <BotIcon size={22} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: '#1f2333' }}>
            INTERVIEW
          </span>
          <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: '24px', color: '#7c1d3f', marginLeft: '-2px' }}>
            Mentor
          </span>
        </Link>
        <Link 
          to="/setup" 
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={{ color: '#7c1d3f', background: '#f8ecee' }}
        >
          + New Interview
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-[#6b7280]">
          {user?.name || user?.email || 'Candidate'}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs px-3.5 py-1.5 rounded-lg border border-[#eee0e2] bg-white hover:bg-[#fbf0f2] text-[#7c1d3f] font-semibold transition shadow-sm"
        >
          Logout
        </button>
      </div>
    </header>
  )
}