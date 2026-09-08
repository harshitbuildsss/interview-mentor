import { useState, useRef, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const BG = '#fdf7f5'
const SIDEBAR = '#f8ecee'
const CARD_BD = '#eee0e2'

function FormattedText({ text, className = '', style = {} }) {
  if (!text) return null

  // Splits on **bold** and `code` markers
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

function BotIcon({ size = 18, color = ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="15" rx="5" fill={color} />
      <circle cx="9" cy="12.5" r="1.6" fill="#fff" />
      <circle cx="15" cy="12.5" r="1.6" fill="#fff" />
      <path d="M12 2v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="1.2" r="1.2" fill={color} />
    </svg>
  )
}

export default function Interview() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const questions = state?.questions || []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [conversation, setConversation] = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isFinished = currentIndex >= questions.length

  const chatBottomRef = useRef(null)
  const chatScrollRef = useRef(null)
  const sidebarItemRefs = useRef([])

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation, evaluation, currentIndex])

  useEffect(() => {
    sidebarItemRefs.current[currentIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }, [currentIndex])

  const scoreColour = (score) => {
    if (score >= 8) return 'text-emerald-700'
    if (score >= 5) return 'text-amber-700'
    return 'text-rose-700'
  }

  const scoreLabel = (score) => {
    if (score >= 8) return 'Strong'
    if (score >= 5) return 'Partial'
    return 'Needs Work'
  }

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !currentQuestion?.id) return
    setSubmitting(true)
    setEvaluation(null)
    setErrorMsg('')

    try {
      const res = await api.post('/api/answers/submit', {
        questionId: currentQuestion.id,
        sessionId: parseInt(sessionId, 10),
        userAnswer: userAnswer.trim()
      })
      setEvaluation(res.data)
    } catch (err) {
      console.error('Submit failed:', err.response?.data || err)
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit answer. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    setConversation(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        userAnswer: userAnswer.trim(),
        interviewerResponse: evaluation.interviewerResponse,
        score: evaluation.score
      }
    ])
    setEvaluation(null)
    setUserAnswer('')
    setErrorMsg('')
    setCurrentIndex(prev => prev + 1)
  }

  const handleComplete = async () => {
    const activeUserId = user?.userId || localStorage.getItem('userId')
    if (!activeUserId) {
      setErrorMsg('User ID not found. Please re-login.')
      return
    }

    setConversation(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        topic: currentQuestion.topic,
        userAnswer: userAnswer.trim(),
        interviewerResponse: evaluation.interviewerResponse,
        score: evaluation.score
      }
    ])
    setCompleting(true)
    setErrorMsg('')

    try {
      const res = await api.post('/api/answers/complete-session', {
        sessionId: parseInt(sessionId, 10),
        userId: parseInt(activeUserId, 10)
      })
      navigate(`/interview/${sessionId}/summary`, {
        state: { summary: res.data }
      })
    } catch (err) {
      console.error('Complete failed:', err.response?.data || err)
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to complete session.'
      )
      setCompleting(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex w-full" style={{ background: BG }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside
        className="w-72 flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto"
        style={{ background: SIDEBAR, borderRight: `1px solid ${CARD_BD}` }}
      >
        <div className="p-5 flex-shrink-0" style={{ borderBottom: `1px solid ${CARD_BD}` }}>
          <div className="flex items-center gap-2 mb-1">
            <BotIcon size={20} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '17px', color: INK }}>
              Interview Round
            </h2>
          </div>
          <p className="text-xs font-mono" style={{ color: MUTED }}>
            Session #{sessionId}
          </p>
        </div>

        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${CARD_BD}` }}>
          <div className="flex justify-between text-xs mb-2 font-medium" style={{ color: MUTED }}>
            <span>Progress</span>
            <span>
              {Math.min(currentIndex, questions.length)}/{questions.length}
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: '#ecd8db' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(Math.min(currentIndex, questions.length) / (questions.length || 1)) * 100}%`,
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {questions.map((q, idx) => {
            const committed = conversation[idx]
            const isCurrent = idx === currentIndex
            return (
              <div
                key={q.id || idx}
                ref={el => (sidebarItemRefs.current[idx] = el)}
                className="px-3.5 py-3 rounded-xl text-xs transition-all shadow-sm"
                style={{
                  background: isCurrent ? '#ffffff' : committed ? '#fcf7f8' : 'transparent',
                  border: `1.5px solid ${isCurrent ? ACCENT : committed ? CARD_BD : 'transparent'}`,
                  color: isCurrent ? INK : MUTED
                }}
              >
                <div className="font-bold mb-0.5 truncate" style={{ color: isCurrent ? ACCENT : INK }}>
                  {q.topic}
                </div>
                <div className="truncate text-xs opacity-80">
                  {q.question?.substring(0, 38)}...
                </div>
                {committed && (
                  <div className={`mt-1.5 font-bold text-xs ${scoreColour(committed.score)}`}>
                    {committed.score}/10 · {scoreLabel(committed.score)}
                  </div>
                )}
                {isCurrent && !committed && (
                  <div className="mt-1.5 text-xs font-bold" style={{ color: ACCENT }}>
                    ● In Progress
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen" style={{ background: BG }}>

        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-8 py-8 space-y-6"
        >
          {conversation.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex gap-3 items-start">
                <Avatar label="AI" type="ai" />
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
                  <div className="text-xs font-bold mb-1.5" style={{ color: ACCENT }}>
                    {item.topic}
                  </div>
                  <FormattedText text={item.question} className="text-sm" style={{ color: INK }} />
                </div>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div
                  className="rounded-2xl rounded-tr-sm px-5 py-4 max-w-2xl text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
                >
                  <p className="text-sm leading-relaxed text-white whitespace-pre-line">
                    {item.userAnswer}
                  </p>
                </div>
                <Avatar label="You" type="user" />
              </div>

              <div className="flex gap-3 items-start">
                <Avatar label="AI" type="ai" />
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
                  <ScoreBadge
                    score={item.score}
                    scoreColour={scoreColour}
                    scoreLabel={scoreLabel}
                  />
                  <FormattedText
                    text={item.interviewerResponse}
                    className="text-sm mt-2"
                    style={{ color: INK }}
                  />
                </div>
              </div>
            </div>
          ))}

          {!isFinished && !evaluation && currentQuestion && (
            <div className="flex gap-3 items-start">
              <Avatar label="AI" type="ai" />
              <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl shadow-sm" style={{ border: `1.5px solid ${ACCENT}` }}>
                <div className="text-xs font-bold mb-1.5" style={{ color: ACCENT }}>
                  {currentQuestion?.topic} · Q{currentIndex + 1} of {questions.length}
                </div>
                <FormattedText
                  text={currentQuestion?.question}
                  className="text-sm font-medium"
                  style={{ color: INK }}
                />
              </div>
            </div>
          )}

          {evaluation && !isFinished && currentQuestion && (
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Avatar label="AI" type="ai" />
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
                  <div className="text-xs font-bold mb-1.5" style={{ color: ACCENT }}>
                    {currentQuestion?.topic} · Q{currentIndex + 1} of {questions.length}
                  </div>
                  <FormattedText
                    text={currentQuestion?.question}
                    className="text-sm"
                    style={{ color: INK }}
                  />
                </div>
              </div>

              <div className="flex gap-3 items-start justify-end">
                <div
                  className="rounded-2xl rounded-tr-sm px-5 py-4 max-w-2xl text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
                >
                  <p className="text-sm leading-relaxed text-white whitespace-pre-line">
                    {userAnswer}
                  </p>
                </div>
                <Avatar label="You" type="user" />
              </div>

              <div className="flex gap-3 items-start">
                <Avatar label="AI" type="ai" />
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-2xl shadow-sm" style={{ border: `1px solid ${CARD_BD}` }}>
                  <ScoreBadge
                    score={evaluation.score}
                    scoreColour={scoreColour}
                    scoreLabel={scoreLabel}
                  />
                  <FormattedText
                    text={evaluation.interviewerResponse}
                    className="text-sm mt-2"
                    style={{ color: INK }}
                  />
                  <div className="mt-4 pt-3.5" style={{ borderTop: `1px solid ${CARD_BD}` }}>
                    {isLastQuestion ? (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
                      >
                        {completing ? 'Generating summary...' : '✓ Finish Interview'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
                      >
                        Next Question →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl text-xs font-medium" style={{ background: '#fdeeee', border: '1px solid #f4c6c6', color: '#a33' }}>
              {errorMsg}
            </div>
          )}

          <div ref={chatBottomRef} className="h-4" />
        </div>

        {/* ── ANSWER INPUT ── */}
        {!evaluation && !isFinished && (
          <div
            className="flex-shrink-0 px-8 py-5"
            style={{ background: BG, borderTop: `1px solid ${CARD_BD}` }}
          >
            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={3}
              placeholder="Type your response here..."
              disabled={submitting}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none shadow-sm transition"
              style={{ background: '#ffffff', border: `1.5px solid ${CARD_BD}`, color: INK }}
              onFocus={e => (e.target.style.borderColor = ACCENT)}
              onBlur={e => (e.target.style.borderColor = CARD_BD)}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs" style={{ color: MUTED }}>
                Press <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-100 font-mono text-[10px]">Ctrl+Enter</kbd> to submit
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !userAnswer.trim()}
                className="text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition text-xs disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
              >
                {submitting ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Avatar({ label, type }) {
  const isAi = type === 'ai'
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm"
      style={{
        background: isAi ? '#f8ecee' : '#ffffff',
        border: `1.5px solid ${isAi ? ACCENT : CARD_BD}`,
        color: isAi ? ACCENT : INK
      }}
    >
      {label}
    </div>
  )
}

function ScoreBadge({ score, scoreColour, scoreLabel }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${score >= 8 ? 'bg-emerald-50 text-emerald-700' : score >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
        {scoreLabel(score)}
      </span>
      <span className="text-xs font-bold" style={{ color: INK }}>
        {score}/10
      </span>
    </div>
  )
}