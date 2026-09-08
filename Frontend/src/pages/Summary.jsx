import { useLocation, useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const BG = '#fdf7f5'
const CARD_BD = '#eee0e2'

export default function Summary() {
  const { sessionId } = useParams()
  const { state }     = useLocation()
  const navigate      = useNavigate()
  const summary       = state?.summary

  const scoreColour = s => (s >= 8 ? 'text-emerald-700' : s >= 5 ? 'text-amber-700' : 'text-rose-700')
  const barColour   = s => (s >= 8 ? '#059669' : s >= 5 ? '#d97706' : '#e11d48')

  if (!summary) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BG }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium" style={{ color: MUTED }}>No summary found for this session.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-white px-5 py-2.5 rounded-xl shadow transition"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ background: BG }}>
      <Navbar />

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-12">

          {/* Header + Score */}
          <div
            className="bg-white rounded-3xl p-7 shadow-sm flex items-center justify-between gap-6"
            style={{ border: `1px solid ${CARD_BD}` }}
          >
            <div>
              <p className="text-xs font-mono font-semibold" style={{ color: ACCENT }}>
                Session #{sessionId} · Completed
              </p>
              <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: "'Playfair Display', serif", color: INK }}>
                Interview Summary
              </h1>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                Here is how you performed across technical depth and conceptual accuracy.
              </p>
            </div>

            <div
              className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl flex-shrink-0 shadow-inner"
              style={{ background: '#fcf4f5', border: `1.5px solid ${ACCENT}` }}
            >
              <span className="text-3xl font-black" style={{ color: ACCENT }}>
                {summary.overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: MUTED }}>
                out of 10
              </span>
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: ACCENT }}>
              Interviewer's Assessment
            </p>
            <p className="text-sm leading-relaxed" style={{ color: INK }}>
              {summary.summaryParagraph}
            </p>
          </div>

          {/* Topic Breakdown */}
          {summary.topicScores && summary.topicScores.length > 0 && (
            <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: ACCENT }}>
                Topic Breakdown
              </p>
              <div className="space-y-3.5">
                {[...summary.topicScores]
                  .sort((a, b) => b.score - a.score)
                  .map((ts, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: '#faf6f6' }}>
                      <div className="flex justify-between text-xs mb-1.5 font-semibold">
                        <span style={{ color: INK }}>{ts.topic}</span>
                        <span className={scoreColour(ts.score)}>{ts.score}/10</span>
                      </div>
                      <div className="h-1.5 rounded-full w-full" style={{ background: '#ecd8db' }}>
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(Math.max((ts.score / 10) * 100, 0), 100)}%`,
                            background: barColour(ts.score)
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Strengths & Weak Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-emerald-800">
                ✓ Strengths
              </p>
              {summary.strengths?.length > 0 ? (
                <ul className="space-y-2 text-xs font-medium">
                  {summary.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-2"
                    >
                      <span className="font-bold">✓</span> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs" style={{ color: MUTED }}>Keep practicing.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-rose-800">
                ⚠ Needs Work
              </p>
              {summary.weakAreas?.length > 0 ? (
                <ul className="space-y-2 text-xs font-medium">
                  {summary.weakAreas.map((w, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 flex items-center gap-2"
                    >
                      <span className="font-bold">⚠</span> {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs" style={{ color: MUTED }}>No major weak areas identified.</p>
              )}
            </div>
          </div>

          {/* Action Items Before Next Round */}
          {summary.reviseBeforeNext && summary.reviseBeforeNext.length > 0 && (
            <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: ACCENT }}>
                Before Your Next Interview
              </p>
              <div className="space-y-2.5">
                {summary.reviseBeforeNext.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start px-4 py-3 rounded-xl text-xs"
                    style={{ background: '#faf6f6', border: `1px solid ${CARD_BD}` }}
                  >
                    <span
                      className="font-mono font-bold flex-shrink-0 px-2 py-0.5 rounded text-[11px]"
                      style={{ background: '#f8ecee', color: ACCENT }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-relaxed font-medium" style={{ color: INK }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate('/setup')}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-white shadow transition"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
            >
              Start Another Round →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-2xl text-xs font-bold bg-white shadow-sm transition"
              style={{ border: `1px solid ${CARD_BD}`, color: INK }}
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}