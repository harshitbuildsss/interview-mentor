import { useEffect, useRef } from 'react'

const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const BORDER = '#eee0e2'
const PINK = '#fbf0f2'

// ✏️ Edit this block — it's the only part you need to change.
const BUILDER = {
  name: 'Harshit Kumar Singh',
  line: 'Final-year B.Tech CSE student.',
  github: 'https://github.com/harshitbuildsss',
  linkedin: '' // paste your LinkedIn URL here; the button stays hidden while this is empty
}

// Only list what you can explain end to end in an interview.
const FEATURES = [
  'Resume-aware questions: upload a PDF and get questions based on your experience, skills, and projects',

  'Job description-based preparation: tailor interview questions to the role’s requirements and expected skills',

  'HR and technical interview modes, with adjustable difficulty',

  'Adaptive follow-ups that build on your earlier answers in the session',

  'Answer evaluation and scoring, with a summary at the end of every session',

  'Topic proficiency tracking, so you can identify your strengths and areas for improvement over time'
]

const STACK = [
  'Java', 'Spring Boot', 'MySQL / JPA', 'JWT auth', 'Apache PDFBox',
  'Groq (Llama 3.3 70B)', 'React', 'Vite'
]

const label = {
  margin: '0 0 10px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
  textTransform: 'uppercase', color: ACCENT
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 3 }}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export default function AboutModal({ open, onClose }) {
  const ref = useRef(null)

  // Native <dialog>: gives focus trapping, Escape-to-close and a backdrop for free.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  const linkStyle = {
    display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 16px', borderRadius: 12,
    border: `1px solid ${BORDER}`, color: ACCENT, fontSize: 14, fontWeight: 600, textDecoration: 'none',
    background: '#fff'
  }

  return (
    <dialog
      ref={ref}
      className="mentor-about"
      aria-labelledby="about-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }} // click on the backdrop
    >
      <style>{`
        .mentor-about {
          padding: 0; border: 1px solid ${BORDER}; border-radius: 24px; color: ${INK};
          width: min(640px, calc(100vw - 32px)); max-height: calc(100vh - 40px);
          box-shadow: 0 30px 90px rgba(124, 29, 63, .2);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .mentor-about::backdrop { background: rgba(31, 35, 51, .38); }
        .mentor-about button:focus-visible, .mentor-about a:focus-visible { outline: 3px solid #1f6fb2; outline-offset: 2px; }
        @media (prefers-reduced-motion: no-preference) {
          .mentor-about[open] { animation: mentor-about-in .22s ease-out; }
          @keyframes mentor-about-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        }
      `}</style>

      <div style={{ position: 'relative', padding: '28px 30px 26px' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 10,
            border: 0, background: PINK, color: ACCENT, cursor: 'pointer', fontSize: 20, lineHeight: 1
          }}
        >
          ×
        </button>

        <h2
          id="about-title"
          style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 600, letterSpacing: '-.02em' }}
        >
          About Interview <span style={{ fontFamily: "'Dancing Script', cursive", color: ACCENT, fontSize: 36 }}>Mentor</span>
        </h2>

        <p style={{ margin: '12px 0 22px', color: MUTED, fontSize: 15, lineHeight: 1.6 }}>
          Interview Mentor is an AI interview coach that uses your resume and target job description to prepare you for interviews. It generates relevant questions, evaluates your answers, and tracks your progress so you can walk into the real interview prepared.
        </p>

        <h3 style={label}>What it does</h3>
        <ul style={{ margin: '0 0 22px', padding: 0, listStyle: 'none', display: 'grid', gap: 9 }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.5 }}>
              <Check />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <h3 style={label}>Built with</h3>
        <ul style={{ margin: '0 0 22px', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STACK.map((s) => (
            <li key={s} style={{ padding: '6px 12px', borderRadius: 999, background: PINK, border: `1px solid ${BORDER}`, color: ACCENT, fontSize: 13, fontWeight: 600 }}>
              {s}
            </li>
          ))}
        </ul>

        <h3 style={label}>Built by</h3>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.6 }}>
          <strong>{BUILDER.name}</strong>. {BUILDER.line}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          {BUILDER.github && <a href={BUILDER.github} target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>}
          {BUILDER.linkedin && <a href={BUILDER.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>LinkedIn</a>}
        </div>

        <p style={{ margin: 0, color: MUTED, fontSize: 12 }}>
          The progress, skills and session cards on the sign-in page show sample data.
        </p>
      </div>
    </dialog>
  )
}