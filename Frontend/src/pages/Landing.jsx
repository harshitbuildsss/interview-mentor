import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import api from '../api/axios'
import AboutModal from '../components/AboutModal'

const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const ACCENT_DARK = '#9c2a52'
const BG = '#fdf7f5'
const BORDER = '#eee0e2'
const PINK = '#fbf0f2'


const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Dancing+Script:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    .mentor-page {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: ${INK};
    }

    .mentor-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }

    .mentor-script {
      font-family: 'Dancing Script', cursive;
    }

    .mentor-card {
      transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
      box-shadow:
        0 24px 70px rgba(124, 29, 63, .08),
        0 4px 18px rgba(124, 29, 63, .03);
    }

    .mentor-card:hover {
      box-shadow:
        0 30px 90px rgba(124, 29, 63, .14),
        0 10px 30px rgba(124, 29, 63, .06);
      border-color: rgba(124, 29, 63, .2);
    }

    .mentor-float {
      box-shadow: 0 15px 40px rgba(124, 29, 63, .075);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .mentor-float:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 20px 50px rgba(124, 29, 63, .12);
    }

    .mentor-input {
      transition: border-color .18s ease, box-shadow .18s ease;
    }

    .mentor-input:focus {
      border-color: ${ACCENT} !important;
      box-shadow: 0 0 0 3px rgba(124, 29, 63, .07);
    }

    .mentor-pill {
      transition: transform .18s ease, background .18s ease;
    }

    .mentor-pill:hover {
      transform: translateY(-1px);
      background: #f8ecee !important;
    }

    .mentor-button {
      transition: transform .18s ease, box-shadow .18s ease;
    }

    .mentor-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 28px rgba(124, 29, 63, .22);
    }

    @media (min-height: 950px) and (min-width: 1101px) {
      .mentor-wordmark-interview { font-size: 82px !important; }
      .mentor-wordmark-script { font-size: 94px !important; }
    }

    @media (max-width: 1100px) {
      .mentor-main {
        grid-template-columns: 1fr 430px !important;
      }
      .mentor-right {
        display: none !important;
      }
    }

    @media (max-width: 820px) {
      .mentor-main {
        grid-template-columns: 1fr !important;
        max-width: 520px !important;
      }
      .mentor-left {
        display: none !important;
      }
      .mentor-wordmark {
        margin-top: 10px;
      }
    }

    @media (max-width: 560px) {
      .mentor-nav {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .mentor-main {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .mentor-wordmark-interview {
        font-size: 52px !important;
      }
      .mentor-wordmark-script {
        font-size: 64px !important;
      }
    }
  `}</style>
)

function BotIcon({ size = 22, color = ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="15" rx="5" fill={color} />
      <circle cx="9" cy="12.5" r="1.6" fill="white" />
      <circle cx="15" cy="12.5" r="1.6" fill="white" />
      <path d="M12 2v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.2" fill={color} />
    </svg>
  )
}

function Icon({ children, size = 15, stroke = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

const PILLS = [
  {
    label: 'Technical',
    icon: <Icon><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" /></Icon>
  },
  {
    label: 'Behavioral',
    icon: <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></Icon>
  },
  {
    label: 'DSA',
    icon: <Icon><path d="M6 4v5a3 3 0 003 3h6a3 3 0 003-3V4M6 20v-5a3 3 0 013-3h6a3 3 0 013 3v5" /></Icon>
  },
  {
    label: 'System Design',
    icon: <Icon><path d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4" /></Icon>
  },
  {
    label: 'Communication',
    icon: <Icon><path d="M20 11.5a8 8 0 01-8.5 8.5 8.5 8.5 0 01-8.1-5.9L2 21l6.7-1.4A8.5 8.5 0 1020 11.5z" /></Icon>
  },
]

function Spark({ x, y, size = 18, opacity = .55 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none' }}
      fill={ACCENT}
    >
      <path d="M12 1.5l1.9 7 7 2-7 1.9-1.9 7-1.9-7-7-1.9 7-2 1.9-7z" />
    </svg>
  )
}

function BackgroundDoodles() {
  return (
    <>
      <div style={{
        position: 'absolute', left: -150, top: 165, width: 320, height: 390,
        borderRadius: '52% 48% 58% 42%', background: '#f8ecee',
        transform: 'rotate(12deg)', opacity: .82, pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute', right: -150, top: -110, width: 420, height: 300,
        borderRadius: '50%', background: '#f8ecee',
        transform: 'rotate(-12deg)', opacity: .8, pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute', left: 390, bottom: -180, width: 430, height: 260,
        borderRadius: '50%', background: '#f8ecee',
        transform: 'rotate(-12deg)', opacity: .65, pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute', right: -80, bottom: -150, width: 420, height: 250,
        borderRadius: '50%', background: '#f8ecee',
        opacity: .65, pointerEvents: 'none'
      }} />

      <svg
        width="48" height="48" viewBox="0 0 48 48"
        style={{ position: 'absolute', left: '31%', top: 345, transform: 'rotate(-12deg)', opacity: .9, pointerEvents: 'none' }}
      >
        <path d="M5 24L42 5 29 42 22 28 5 24Z" fill="none" stroke={ACCENT} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M22 28L42 5" fill="none" stroke={ACCENT} strokeWidth="1.4" />
        <path d="M22 28l-1 9" fill="none" stroke={ACCENT} strokeWidth="1.4" />
      </svg>

      <Spark x="33%" y="39px" size={18} opacity={.7} />
      <Spark x="39%" y="69px" size={10} opacity={.55} />
      <Spark x="73%" y="61px" size={16} opacity={.65} />
      <Spark x="79%" y="365px" size={22} opacity={.7} />
      <Spark x="68%" y="520px" size={12} opacity={.6} />
      <Spark x="27%" y="401px" size={13} opacity={.55} />
      <Spark x="11%" y="147px" size={12} opacity={.55} />

      <span style={{
        position: 'absolute', left: '2%', bottom: 36, width: 17, height: 17,
        border: `1.4px solid ${ACCENT}`, borderRadius: '50%', opacity: .45
      }} />
      <span style={{
        position: 'absolute', right: '4%', top: 142, width: 8, height: 8,
        border: `1.2px solid ${ACCENT}`, borderRadius: '50%', opacity: .4
      }} />
    </>
  )
}

function SocialIcon({ type }) {
  if (type === 'google') {
    return <span style={{ fontSize: 20, fontWeight: 700, color: '#4285F4' }}>G</span>
  }

  if (type === 'github') {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill={INK}>
        <path d="M12 .7A11.3 11.3 0 006.4 21.8c.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 015.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.8 5.5-5.4 5.8.4.3.7 1 .7 1.9v2.8c0 .3.2.7.8.6A11.3 11.3 0 0012 .7z" />
      </svg>
    )
  }

  return <span style={{ fontSize: 18, fontWeight: 800, color: '#0a66c2' }}>in</span>
}

export default function Landing() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.data.token, res.data.userId, res.data.name)
      navigate('/setup')
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="mentor-page min-h-screen relative overflow-hidden"
      style={{ background: BG }}
    >
      <FontImport />
      <BackgroundDoodles />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* NAV */}
      <header
        className="mentor-nav relative z-20 flex items-center justify-between"
        style={{ padding: '10px 38px' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 43,
              height: 43,
              background: '#f8ecee',
              border: `1px solid ${BORDER}`
            }}
          >
            <BotIcon size={23} />
          </div>

          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.035em' }}>
            Interview{' '}
            <span
              className="mentor-script"
              style={{ color: ACCENT, fontSize: 28, fontWeight: 400 }}
            >
              Mentor
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-haspopup="dialog"
          style={{
            padding: '10px 24px',
            borderRadius: 15,
            background: 'rgba(255,255,255,.65)',
            border: `1px solid ${BORDER}`,
            color: ACCENT_DARK,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          About
        </button>
      </header>

      {/* HERO WORDMARK */}
      <section className="mentor-wordmark relative z-10 text-center" style={{ padding: '0px 20px 4px' }}>
        <div className="inline-flex items-end justify-center">
          <span
            className="mentor-serif mentor-wordmark-interview"
            style={{
              color: INK,
              fontSize: 60,
              lineHeight: .86,
              fontWeight: 500,
              letterSpacing: '-.075em',
              transform: 'scaleX(.93)',
              transformOrigin: 'right bottom'
            }}
          >
            INTERVIEW
          </span>

          <span
            className="mentor-script mentor-wordmark-script"
            style={{
              color: ACCENT,
              fontSize: 70,
              lineHeight: .72,
              fontWeight: 400,
              marginLeft: 7,
              transform: 'rotate(-2.5deg)',
              transformOrigin: 'left bottom',
              whiteSpace: 'nowrap'
            }}
          >
            Mentor
          </span>
        </div>

        <div
          style={{
            marginTop: 4,
            color: '#8b8790',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.42em'
          }}
        >
          PRACTICE&nbsp;&nbsp;•&nbsp;&nbsp;IMPROVE&nbsp;&nbsp;•&nbsp;&nbsp;GET HIRED
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main
        className="mentor-main relative z-10 max-w-[1420px] mx-auto grid items-start"
        style={{
          gridTemplateColumns: 'minmax(310px,1fr) 500px minmax(310px,1fr)',
          gap: 50,
          padding: '4px 52px 14px'
        }}
      >
        {/* LEFT */}
        <section className="mentor-left relative pt-3">
          <h1
            className="mentor-serif"
            style={{
              margin: 0,
              color: INK,
              fontSize: 'clamp(45px, 3.9vw, 62px)',
              lineHeight: .92,
              letterSpacing: '-.06em',
              fontWeight: 500
            }}
          >
            <span>Practice.</span><br />
            <span style={{ color: ACCENT, fontStyle: 'italic' }}>Improve.</span><br />
            <span style={{ color: INK, fontStyle: 'italic' }}>Get Hired.</span>
          </h1>

          <p
            style={{
              color: MUTED,
              fontSize: 15,
              lineHeight: 1.55,
              maxWidth: 390,
              marginTop: 23,
              marginBottom: 17
            }}
          >
            Your AI interview coach that remembers you and{' '}
            <span style={{ color: INK, fontWeight: 700 }}>helps you grow</span>.
          </p>

          <div className="flex flex-wrap gap-2 mb-6" style={{ maxWidth: 430 }}>
            {PILLS.map((pill) => (
              <span
                key={pill.label}
                className="mentor-pill inline-flex items-center gap-2 rounded-full"
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,.62)',
                  border: `1px solid ${BORDER}`,
                  color: ACCENT,
                  fontSize: 12,
                  fontWeight: 500
                }}
              >
                {pill.icon}
                {pill.label}
              </span>
            ))}
          </div>

          <div
            className="rounded-[20px]"
            style={{
              maxWidth: 405,
              padding: '20px 22px',
              background: 'rgba(255,255,255,.78)',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 10px 30px rgba(124,29,63,.035)'
            }}
          >
            <div
              className="mentor-serif"
              style={{
                color: ACCENT,
                fontSize: 30,
                lineHeight: .6,
                marginBottom: 12
              }}
            >
              “
            </div>

            <p style={{ margin: 0, color: INK, fontSize: 14, lineHeight: 1.6 }}>
              The more you practice; the more confident you become.
            </p>

            <p style={{ margin: '8px 0 0', color: MUTED, fontSize: 12 }}>
              — Interview Mentor
            </p>
          </div>
        </section>

        {/* LOGIN CARD */}
        <section className="w-full">
          <div
            className="mentor-card rounded-[27px] bg-white"
            style={{
              padding: '22px 28px 19px',
              border: `1px solid ${BORDER}`,
              minHeight: 485
            }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="flex items-center justify-center rounded-[19px] mb-3"
                style={{ width: 54, height: 54, background: PINK }}
              >
                <BotIcon size={26} />
              </div>

              <h2
                className="mentor-serif"
                style={{
                  margin: 0,
                  color: INK,
                  fontSize: 23,
                  lineHeight: 1,
                  fontWeight: 500,
                  letterSpacing: '-.025em'
                }}
              >
                Welcome back
              </h2>

              <p style={{ margin: '5px 0 0', color: MUTED, fontSize: 13 }}>
                Glad to see you again!
              </p>
            </div>

            {error && (
              <div
                className="rounded-xl mb-4"
                style={{
                  padding: '10px 12px',
                  background: '#fff0f2',
                  border: '1px solid #f2cbd4',
                  color: '#a33',
                  fontSize: 12
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    color: INK,
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 7
                  }}
                >
                  Email
                </label>

                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: MUTED }}
                  >
                    <Icon size={16}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </Icon>
                  </span>

                  <input
                    className="mentor-input w-full rounded-xl outline-none"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      height: 43,
                      padding: '0 13px 0 40px',
                      border: `1px solid ${BORDER}`,
                      color: INK,
                      fontSize: 14,
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
                  <label style={{ color: INK, fontSize: 12, fontWeight: 500 }}>
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    style={{ color: ACCENT, fontSize: 12, fontWeight: 500 }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: MUTED }}
                  >
                    <Icon size={16}>
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" />
                    </Icon>
                  </span>

                  <input
                    className="mentor-input w-full rounded-xl outline-none"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={{
                      height: 43,
                      padding: '0 42px 0 40px',
                      border: `1px solid ${BORDER}`,
                      color: INK,
                      fontSize: 14,
                      background: '#fff'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: MUTED }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <Icon size={17}>
                      {showPw ? (
                        <>
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                          <path d="M9.4 5.5A10 10 0 0112 5c5 0 9 4 10 7-.4 1.1-1 2.2-1.9 3.2" />
                          <path d="M6.6 6.6C4.7 8 3.4 9.9 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7" />
                        </>
                      ) : (
                        <>
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </Icon>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mentor-button w-full rounded-xl flex items-center justify-center gap-2 text-white"
                style={{
                  height: 44,
                  border: 0,
                  background: `linear-gradient(135deg, ${ACCENT_DARK}, ${ACCENT})`,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? .65 : 1
                }}
              >
                {loading ? 'Signing in…' : (
                  <>
                    Sign in
                    <Icon size={16} stroke="#fff">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </Icon>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3" style={{ margin: '21px 0 17px' }}>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
              <span style={{ color: MUTED, fontSize: 12, whiteSpace: 'nowrap' }}>
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: BORDER }} />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {['google', 'github', 'linkedin'].map(type => (
                <button
                  key={type}
                  type="button"
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    height: 43,
                    background: '#fff',
                    border: `1px solid ${BORDER}`
                  }}
                  aria-label={`Continue with ${type}`}
                >
                  <SocialIcon type={type} />
                </button>
              ))}
            </div>

            <p
              className="text-center"
              style={{ margin: '17px 0 0', color: MUTED, fontSize: 12 }}
            >
              New here?{' '}
              <Link
                to="/register"
                style={{ color: ACCENT, fontWeight: 700 }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>

        {/* RIGHT PREVIEW CARDS - LONG DEEPLY CURVED WAVY STRING GARLAND EFFECT */}
        <section
          className="mentor-right relative flex flex-col items-center"
          style={{
            minHeight: 580,
            paddingTop: 15,
            paddingBottom: 20
          }}
        >
          {/* SVG Deeply Curved Wavy S-Curve Twine String Background */}
          <svg
            style={{
              position: 'absolute',
              top: -10,
              bottom: -10,
              left: 0,
              right: 0,
              width: '100%',
              height: '105%',
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <path
              d="M 155 -10 C 90 140, 220 220, 155 330 C 90 440, 220 520, 155 640"
              fill="none"
              stroke="#d4b2be"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(124,29,63,0.15))' }}
            />
            {/* PIN — centred on the string's start point (155, -10) */}
            <g transform="translate(155 -10)" aria-hidden="true">
              <ellipse cx="2.5" cy="8" rx="10" ry="4" fill="rgba(0,0,0,.14)" />
              <circle r="9" fill={ACCENT} />
              <circle r="9" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="1" />
              <ellipse cx="-3" cy="-3.5" rx="3.4" ry="2.2" fill="rgba(255,255,255,.6)" />
              <circle r="2.4" fill="rgba(0,0,0,.28)" />
            </g>
          </svg>

          <div className="flex flex-col w-full" style={{ gap: 26, zIndex: 2, position: 'relative' }}>
            
            {/* 1. AI Mentor Card (Tilts Left) */}
            <div
              className="mentor-float rounded-2xl bg-white"
              style={{
                width: 315,
                padding: '14px 18px',
                border: `1px solid ${BORDER}`,
                alignSelf: 'flex-start',
                marginLeft: 10,
                transform: 'rotate(-3deg)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <BotIcon size={17} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>AI Mentor</span>
                <span className="ml-auto rounded-full" style={{ width: 9, height: 9, background: '#5bb879' }} />
              </div>

              <p style={{ margin: '9px 0 5px', color: MUTED, fontSize: 12 }}>
                Let's start with a warm-up question.
              </p>

              <div className="flex items-center justify-between">
                <span style={{ color: ACCENT, fontSize: 12, fontWeight: 700 }}>
                  Tell me about yourself.
                </span>
                <span className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: '#f8ecee', color: ACCENT }}>
                  <Icon size={15}><path d="M9 6l6 6-6 6" /></Icon>
                </span>
              </div>
            </div>

            {/* 2. Progress Card (Tilts Right) */}
            <div
              className="mentor-float rounded-2xl bg-white"
              style={{
                width: 315,
                padding: '14px 18px',
                border: `1px solid ${BORDER}`,
                alignSelf: 'flex-end',
                marginRight: 10,
                transform: 'rotate(2.5deg)',
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 14, fontWeight: 700 }}>Your progress</span>
                <span style={{ color: '#22814b', background: '#e9f7ed', borderRadius: 999, padding: '5px 8px', fontSize: 11, fontWeight: 700 }}>
                  ↑ 18%
                </span>
              </div>

              <svg width="100%" height="34" viewBox="0 0 270 50" preserveAspectRatio="none" style={{ marginTop: 4 }}>
                <defs>
                  <linearGradient id="chartFillV5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f39abb" stopOpacity=".35" />
                    <stop offset="100%" stopColor="#f39abb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 36 L42 30 L78 33 L116 23 L154 30 L191 12 L230 18 L270 13 L270 50 L0 50Z" fill="url(#chartFillV5)" />
                <polyline points="0,36 42,30 78,33 116,23 154,30 191,12 230,18 270,13" fill="none" stroke={ACCENT} strokeWidth="2.2" />
              </svg>

              <p style={{ margin: '0', color: MUTED, fontSize: 12 }}>
                Keep it up! You're getting better.
              </p>
            </div>

            {/* 3. Skills Overview Card (Tilts Left) */}
            <div
              className="mentor-float rounded-2xl bg-white"
              style={{
                width: 315,
                padding: '14px 18px 11px',
                border: `1px solid ${BORDER}`,
                alignSelf: 'flex-start',
                marginLeft: 10,
                transform: 'rotate(-2.2deg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Skills overview</span>
                <Icon size={15} stroke={ACCENT}>
                  <path d="M4 19V9M10 19V5M16 19v-8M22 19V3" />
                </Icon>
              </div>

              {[
                ['Java', 91],
                ['DSA', 84],
                ['System Design', 76],
                ['Communication', 71]
              ].map(([name, value], index, arr) => (
                <div key={name} className="flex items-center gap-2.5" style={{ marginBottom: index === arr.length - 1 ? 0 : 5 }}>
                  <span style={{ width: 88, color: MUTED, fontSize: 12, flexShrink: 0 }}>{name}</span>
                  <div className="flex-1 rounded-full" style={{ height: 7, background: '#f8ecee' }}>
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${ACCENT_DARK}, #9c2a52)` }} />
                  </div>
                  <span style={{ width: 32, textAlign: 'right', color: INK, fontSize: 12, fontWeight: 500 }}>{value}%</span>
                </div>
              ))}
            </div>

            {/* 4. Recent Session Card (Tilts Right) */}
            <div
              className="mentor-float rounded-2xl bg-white flex items-center justify-between"
              style={{
                width: 290,
                padding: '11px 18px',
                border: `1px solid ${BORDER}`,
                alignSelf: 'flex-end',
                marginRight: 15,
                transform: 'rotate(2.8deg)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={15} stroke={ACCENT}>
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                  </Icon>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Recent session</span>
                </div>
                <p style={{ margin: 0, color: MUTED, fontSize: 12 }}>Behavioral Interview</p>
                <p style={{ margin: '2px 0 0', color: MUTED, fontSize: 12 }}>Today, 9:30 PM</p>
              </div>

              <div className="flex items-baseline">
                <span style={{ color: ACCENT, fontSize: 29, fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>84</span>
                <span style={{ color: MUTED, fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>/100</span>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}