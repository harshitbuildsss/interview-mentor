import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

// Same tokens as Landing.jsx — kept page-local on purpose, see note there.
const INK      = '#1f2333'
const MUTED    = '#6b7280'
const ACCENT   = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const BG       = '#fdf7f5'
const CARD_BD  = '#eee0e2'

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Dancing+Script:wght@600;700&display=swap');
  `}</style>
)

function BotIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="15" rx="5" fill={ACCENT} />
      <circle cx="9"  cy="12.5" r="1.6" fill="#fff" />
      <circle cx="15" cy="12.5" r="1.6" fill="#fff" />
      <path d="M12 2v3" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.2" fill={ACCENT} />
    </svg>
  )
}

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4" style={{ background: BG }}>
      <FontImport />

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BotIcon size={22} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '22px', color: INK }}>
            Interview
          </span>
          <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: '30px', color: ACCENT }}>
            Mentor
          </span>
        </div>
        <p className="text-sm" style={{ color: MUTED }}>Create your account</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: INK }}>Register</h2>

        {error && (
          <div className="text-xs rounded-lg px-3 py-2 mb-3" style={{ background: '#fdeeee', border: '1px solid #f4c6c6', color: '#a33' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {['name', 'email', 'password'].map(field => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1 capitalize" style={{ color: INK }}>{field}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={{ background: '#fff', border: `1px solid ${CARD_BD}`, color: INK }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = CARD_BD)}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all mt-1 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: MUTED }}>
          Already have an account?{' '}
          <Link to="/" className="font-medium" style={{ color: ACCENT }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
