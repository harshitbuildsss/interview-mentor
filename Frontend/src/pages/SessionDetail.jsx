import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const BG = '#fdf7f5'
const CARD_BD = '#eee0e2'

function FormattedText({ text, className = '', style = {} }) {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)

  return (
    <p className={`whitespace-pre-line leading-relaxed ${className}`} style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-[#7c1d3f]">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 font-mono text-xs text-[#7c1d3f] border border-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        return part
      })}
    </p>
  )
}

export default function SessionDetail() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get(`/api/sessions/${sessionId}/detail`)
      .then(r => setData(r.data))
      .catch(err => {
        console.error('Failed to load session detail:', err)
        setError('Unable to load session details.')
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  const scoreColour = s => (s >= 8 ? 'text-emerald-700' : s >= 5 ? 'text-amber-700' : 'text-rose-700')
  const scoreLabel  = s => (s >= 8 ? 'Strong' : s >= 5 ? 'Partial' : 'Needs work')
  const barColour   = s => (s >= 8 ? '#059669' : s >= 5 ? '#d97706' : '#e11d48')

  const formatDate = str =>
    str
      ? new Date(str).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BG }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-rose-800 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BG }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium text-rose-700">{error || 'Session not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-white px-5 py-2.5 rounded-xl shadow transition"
            style={{ background: ACCENT }}
          >
            Back to Dashboard
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

          {/* Header */}
          <div
            className="bg-white rounded-3xl p-7 shadow-sm flex items-center justify-between gap-6"
            style={{ border: `1px solid ${CARD_BD}` }}
          >
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-semibold mb-2 flex items-center gap-1 transition-colors"
                style={{ color: ACCENT }}
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: INK }}>
                Session Review
              </h1>
              <p className="text-xs font-medium mt-1" style={{ color: MUTED }}>
                {data.mode === 'HR' ? 'HR Round' : 'Technical Round'} ·{' '}
                {data.difficulty?.charAt(0) + data.difficulty?.slice(1).toLowerCase()} ·{' '}
                {formatDate(data.completedAt)}
              </p>
            </div>

            <div
              className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl flex-shrink-0 shadow-inner"
              style={{ background: '#fcf4f5', border: `1.5px solid ${ACCENT}` }}
            >
              <span className="text-3xl font-black" style={{ color: ACCENT }}>
                {data.overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: MUTED }}>
                / 10
              </span>
            </div>
          </div>

          {/* Topic Scores */}
          {data.topicScores?.length > 0 && (
            <div className="bg-white rounded-3xl p-7 shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: ACCENT }}>
                Topic Breakdown
              </p>
              <div className="space-y-3">
                {[...data.topicScores]
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

          {/* Q&A Accordion */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: ACCENT }}>
              Full Transcript ({data.qaList?.length || 0} Questions)
            </p>

            <div className="space-y-3">
              {data.qaList?.map((qa, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all"
                  style={{ border: `1px solid ${CARD_BD}` }}
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left transition"
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono font-bold text-xs flex-shrink-0" style={{ color: ACCENT }}>
                        Q{qa.orderIndex}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: '#f8ecee', color: ACCENT }}
                      >
                        {qa.topic}
                      </span>
                      <span className="text-xs font-medium truncate" style={{ color: INK }}>
                        {qa.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      {qa.score !== null && (
                        <span className={`text-xs font-bold ${scoreColour(qa.score)}`}>
                          {qa.score}/10
                        </span>
                      )}
                      <span className="text-xs font-bold" style={{ color: MUTED }}>
                        {open === i ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {open === i && (
                    <div
                      className="px-5 py-5 space-y-4 text-xs"
                      style={{ borderTop: `1px solid ${CARD_BD}`, background: '#faf6f6' }}
                    >
                      <div>
                        <p className="font-bold mb-1" style={{ color: ACCENT }}>Question</p>
                        <FormattedText text={qa.question} style={{ color: INK }} />
                      </div>

                      {qa.userAnswer && (
                        <div>
                          <p className="font-bold mb-1 text-slate-700">Your Answer</p>
                          <p className="whitespace-pre-line p-3 rounded-xl bg-white border border-slate-200" style={{ color: INK }}>
                            {qa.userAnswer}
                          </p>
                        </div>
                      )}

                      {qa.interviewerResponse && (
                        <div
                          className="rounded-xl p-4 bg-white shadow-sm"
                          style={{ borderLeft: `3px solid ${ACCENT}`, border: `1px solid ${CARD_BD}` }}
                        >
                          <div className="flex items-center gap-2 mb-1.5 font-bold">
                            <span className={scoreColour(qa.score)}>{scoreLabel(qa.score)}</span>
                            <span style={{ color: MUTED }}>· {qa.score}/10</span>
                          </div>
                          <FormattedText text={qa.interviewerResponse} style={{ color: INK }} />
                        </div>
                      )}

                      {(qa.whatWasGood || qa.whatWasMissing) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-100">
                            <p className="font-bold text-emerald-800 mb-0.5">What was good</p>
                            <p className="text-emerald-900">{qa.whatWasGood || '—'}</p>
                          </div>
                          <div className="rounded-xl p-3 bg-rose-50 border border-rose-100">
                            <p className="font-bold text-rose-800 mb-0.5">What was missing</p>
                            <p className="text-rose-900">{qa.whatWasMissing || '—'}</p>
                          </div>
                        </div>
                      )}

                      {qa.aiFeedback && (
                        <div className="rounded-xl p-3.5 bg-white border border-slate-200">
                          <p className="font-bold mb-1" style={{ color: MUTED }}>Detailed Feedback</p>
                          <p style={{ color: INK }}>{qa.aiFeedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-3">
            <button
              onClick={() => navigate('/setup')}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-white shadow transition"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
            >
              Start New Round →
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