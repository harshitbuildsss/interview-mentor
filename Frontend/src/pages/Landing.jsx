import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

// ---- Shared "marketing zone" theme (Landing + Register only) ----
// The logged-in app (Dashboard/InterviewSetup/SessionDetail/Summary)
// stays on its own dark flat-card theme — these tokens are intentionally
// page-local, not global, so the two zones don't bleed into each other.
const INK      = '#1f2333'
const MUTED    = '#6b7280'
const ACCENT   = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const BG       = '#fdf7f5'
const CARD_BD  = '#eee0e2'

// Real Google Fonts import — Playfair Display for the serif headline/
// wordmark, Dancing Script for the cursive "Mentor" treatment. This
// replaces the italic-serif stand-in from the first pass.
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Dancing+Script:wght@600;700&display=swap');
  `}</style>
)

function BotIcon({ size = 22, color = ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="15" rx="5" fill={color} />
      <circle cx="9"  cy="12.5" r="1.6" fill="#fff" />
      <circle cx="15" cy="12.5" r="1.6" fill="#fff" />
      <path d="M12 2v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.2" fill={color} />
    </svg>
  )
}

const PillIcon = ({ path }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const PILLS = [
  { label: 'Technical',     path: 'M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12' },
  { label: 'Behavioral',    path: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
  { label: 'DSA',           path: 'M6 3v6a3 3 0 003 3h6a3 3 0 003-3V3M6 21v-6a3 3 0 013-3h6a3 3 0 013 3v6' },
  { label: 'System Design', path: 'M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4' },
  { label: 'Communication', path: 'M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 010-17 8.38 8.38 0 018.5 8.5z' },
]

// Tiny decorative primitives — sparkle + hollow dot, low-opacity accent.
const Sparkle = ({ style }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={ACCENT} style={{ position: 'absolute', opacity: 0.35, ...style }}>
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  </svg>
)
const Dot = ({ style }) => (
  <span style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${ACCENT}`, opacity: 0.3, ...style }} />
)

export default function Landing() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // 1. Check your endpoint - if axios baseURL already has '/api', use '/auth/login'. 
      // If axios baseURL is 'http://localhost:8080', use '/api/auth/login'.
      const res = await api.post('/api/auth/login', { email, password })
      
      console.log('Login response:', res.data)
      login(res.data.token, res.data.userId, res.data.name)
      
      // 2. CRITICAL FIX: Navigate to '/setup' because '/dashboard' doesn't exist in App.jsx
      navigate('/setup')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    // overflow-y-auto, not overflow-hidden — a clipped card is a worse
    // bug than an occasional scrollbar on a short window. Spacing below
    // is still tuned to fit ~800px+ viewports without scrolling at all.
    <div className="min-h-screen w-full overflow-y-auto relative" style={{ background: BG }}>
      <FontImport />

      <Sparkle style={{ top: 24, left: '34%' }} />
      <Sparkle style={{ top: 46, left: '38%' }} />
      <Sparkle style={{ top: 30, right: '18%' }} />
      <Dot style={{ bottom: 24, left: 24 }} />
      <Dot style={{ top: 120, right: 16 }} />

      {/* Top logo bar */}
      <div className="flex items-center gap-2 px-8 py-4">
        <BotIcon size={22} />
        <span className="text-sm font-semibold" style={{ color: INK }}>Interview Mentor</span>
      </div>

      {/* Hero wordmark row */}
      <div className="text-center pb-4 px-4">
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '40px', color: INK, letterSpacing: '1px' }}>
          INTERVIEW
        </span>
        <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: '52px', color: ACCENT, marginLeft: '10px' }}>
          Mentor
        </span>
      </div>

      <div className="max-w-7xl w-full mx-auto px-8 pb-10 grid gap-8 items-start"
           style={{ gridTemplateColumns: 'minmax(0,1fr) 400px minmax(0,1fr)' }}>

        {/* ---------------- LEFT: marketing column ---------------- */}
        <div className="hidden lg:block relative pt-2">
          {/* Dashed circle + arrow doodle pointing at "Improve." */}
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: 'absolute', top: -6, left: 210, opacity: 0.5 }}>
            <ellipse cx="40" cy="35" rx="28" ry="22" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeDasharray="4,4" />
            <path d="M32 58 Q18 72 10 66" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeDasharray="4,4" />
            <path d="M10 66l-2 6 7-1" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeLinecap="round" />
          </svg>

          <h1 style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.05, fontSize: '46px', marginBottom: '16px' }}>
            <span style={{ color: INK, fontWeight: 700 }}>Practice.</span><br />
            <span style={{ color: ACCENT, fontStyle: 'italic', fontWeight: 600 }}>Improve.</span><br />
            <span style={{ color: '#5b2338', fontStyle: 'italic', fontWeight: 600 }}>Get Hired.</span>
          </h1>

          <p className="text-sm mb-4 max-w-xs" style={{ color: MUTED }}>
            Your AI interview coach that remembers you and{' '}
            <span style={{ color: INK, fontWeight: 600 }}>helps you grow</span>.
          </p>

          <div className="flex flex-wrap gap-2 mb-5 max-w-sm">
            {PILLS.map(p => (
              <span key={p.label}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}>
                <PillIcon path={p.path} />
                {p.label}
              </span>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 max-w-xs" style={{ border: `1px solid ${CARD_BD}` }}>
            <p className="text-xl leading-none mb-1.5" style={{ color: ACCENT }}>&ldquo;</p>
            <p className="text-sm mb-2" style={{ color: INK }}>The more you practice; the more confident you become.</p>
            <p className="text-xs" style={{ color: MUTED }}>— Interview Mentor</p>
          </div>
        </div>

        {/* ---------------- CENTER: sign-in card ---------------- */}
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5" style={{ background: '#f6e9ed' }}>
                <BotIcon size={20} />
              </div>
              <h2 className="text-base font-semibold" style={{ color: INK }}>Welcome back</h2>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>Glad to see you again!</p>
            </div>

            {error && (
              <div className="text-xs rounded-lg px-3 py-2 mb-3" style={{ background: '#fdeeee', border: '1px solid #f4c6c6', color: '#a33' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: INK }}>Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                    </svg>
                  </span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                         placeholder="Enter your email"
                         className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all"
                         style={{ background: '#fff', border: `1px solid ${CARD_BD}`, color: INK }}
                         onFocus={e => (e.target.style.borderColor = ACCENT)}
                         onBlur={e => (e.target.style.borderColor = CARD_BD)} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium" style={{ color: INK }}>Password</label>
                  {/* TODO: no /forgot-password route yet — wire once backend supports reset. */}
                  <Link to="/forgot-password" className="text-xs font-medium" style={{ color: ACCENT }}>Forgot password?</Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" />
                    </svg>
                  </span>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                         placeholder="Enter your password"
                         className="w-full rounded-lg pl-9 pr-9 py-2 text-sm outline-none transition-all"
                         style={{ background: '#fff', border: `1px solid ${CARD_BD}`, color: INK }}
                         onFocus={e => (e.target.style.borderColor = ACCENT)}
                         onBlur={e => (e.target.style.borderColor = CARD_BD)} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }}
                          aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.5A9.9 9.9 0 0112 5c5 0 9 4 10 7-.4 1.1-1 2.2-1.9 3.2M6.6 6.6C4.7 8 3.4 9.9 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}>
                {loading ? 'Signing in…' : (
                  <>Sign in
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-3.5">
              <div className="flex-1 h-px" style={{ background: CARD_BD }} />
              <span className="text-xs" style={{ color: MUTED }}>or continue with</span>
              <div className="flex-1 h-px" style={{ background: CARD_BD }} />
            </div>

            {/* TODO: no OAuth routes yet — visual placeholders only. */}
            <div className="grid grid-cols-3 gap-2">
              {['google', 'github', 'linkedin'].map(p => (
                <button key={p} type="button" className="flex items-center justify-center py-2 rounded-lg"
                        style={{ border: `1px solid ${CARD_BD}` }} aria-label={`Continue with ${p}`}>
                  <span className="text-xs" style={{ color: MUTED }}>{p[0].toUpperCase()}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs mt-4" style={{ color: MUTED }}>
              New here? <Link to="/register" className="font-medium" style={{ color: ACCENT }}>Create an account</Link>
            </p>
          </div>
        </div>

        {/* ---------------- RIGHT: floating cards + connectors ---------------- */}
        <div className="hidden lg:block relative" style={{ minHeight: '520px' }}>

          {/* Dashed connector lines (drawn first, sit behind the cards) */}
          <svg width="100%" height="520" viewBox="0 0 340 520" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path d="M40 90 Q10 140 40 175" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeDasharray="4,4" opacity="0.4" />
            <path d="M60 200 Q30 260 55 300" fill="none" stroke={ACCENT} strokeWidth="1.3" strokeDasharray="4,4" opacity="0.4" />
          </svg>

          {/* Floating bot-avatar badge, sits between the top two cards */}
          <div className="absolute flex items-center justify-center rounded-full"
               style={{ top: '78px', left: '4px', width: 46, height: 46, background: '#fff', border: `1.5px dashed ${ACCENT}` }}>
            <BotIcon size={20} />
          </div>
          {/* Small floating chat-bubble icon */}
          <div className="absolute flex items-center justify-center rounded-full shadow-sm"
               style={{ top: '4px', right: '4px', width: 30, height: 30, background: '#fff', border: `1px solid ${CARD_BD}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 010-17 8.38 8.38 0 018.5 8.5z" />
            </svg>
          </div>

          <div className="absolute bg-white rounded-xl p-3 w-60 shadow-sm" style={{ top: '0px', right: 0, border: `1px solid ${CARD_BD}` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <BotIcon size={16} />
              <span className="text-xs font-semibold" style={{ color: INK }}>AI Mentor</span>
            </div>
            <p className="text-xs mb-0.5" style={{ color: MUTED }}>Let's start with a warm-up question.</p>
            <p className="text-xs font-medium" style={{ color: ACCENT }}>Tell me about yourself.</p>
          </div>

          <div className="absolute bg-white rounded-xl p-3 w-56 shadow-sm" style={{ top: '115px', right: '16px', border: `1px solid ${CARD_BD}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: INK }}>Your progress</span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#e8f5ec', color: '#1e8a4a' }}>↑ 18%</span>
            </div>
            <svg width="100%" height="32" viewBox="0 0 200 32">
              <polyline points="0,24 30,20 60,22 90,12 120,16 150,6 180,10" fill="none" stroke={ACCENT} strokeWidth="2" />
            </svg>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Keep it up! You're getting better.</p>
          </div>

          {/* Small floating bar-chart icon */}
          <div className="absolute flex items-center justify-center rounded-full shadow-sm"
               style={{ top: '235px', left: '0px', width: 30, height: 30, background: '#fff', border: `1px solid ${CARD_BD}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2">
              <path d="M4 20V10M12 20V4M20 20v-6" />
            </svg>
          </div>

          <div className="absolute bg-white rounded-xl p-3 w-60 shadow-sm" style={{ top: '235px', right: 0, border: `1px solid ${CARD_BD}` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: INK }}>Skills overview</p>
            {[['Java', 91], ['DSA', 84], ['System Design', 76], ['Communication', 71]].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <span className="text-xs shrink-0 whitespace-nowrap" style={{ color: MUTED }}>{k}</span>
                <div className="flex-1 h-1.5 rounded-full min-w-[20px]" style={{ background: '#f1e4e7' }}>
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: ACCENT }} />
                </div>
                <span className="text-xs w-8 text-right shrink-0" style={{ color: INK }}>{v}%</span>
              </div>
            ))}
          </div>

          <div className="absolute bg-white rounded-xl p-3 w-52 shadow-sm flex items-center justify-between"
               style={{ top: '405px', right: '24px', border: `1px solid ${CARD_BD}` }}>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: INK }}>Recent session</p>
              <p className="text-xs" style={{ color: MUTED }}>Behavioral Interview</p>
              <p className="text-xs" style={{ color: MUTED }}>Today, 9:30 PM</p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold" style={{ color: ACCENT }}>84</span>
              <span className="text-xs" style={{ color: MUTED }}>/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
