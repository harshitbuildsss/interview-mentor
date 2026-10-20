import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('Overview')
  const [dashboard, setDashboard] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [dashboardError, setDashboardError] = useState('')

  const userId = user?.id ?? user?.userId

  const features = [
    {
      number: '01',
      title: 'Technical Interview',
      description:
        'Test your knowledge of programming, data structures, databases, and core computer science.',
      tag: 'TECHNICAL',
      icon: '</>',
      color: 'lavender',
    },
    {
      number: '02',
      title: 'Behavioral Interview',
      description:
        'Practise answering questions about teamwork, challenges, leadership, and your experience.',
      tag: 'BEHAVIORAL',
      icon: '✳',
      color: 'rose',
    },
    {
      number: '03',
      title: 'DSA Practice',
      description:
        'Strengthen your problem-solving approach and explain your solutions with confidence.',
      tag: 'PROBLEM SOLVING',
      icon: '⌘',
      color: 'peach',
    },
  ]

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || 'there'

  // Load dashboard statistics and the user's saved sessions.
  const loadDashboard = useCallback(async () => {
    if (!userId) {
      setDashboardError(
        'Your user ID is missing from the login context. Please sign out and sign in again.'
      )
      setLoading(false)
      return
    }

    setLoading(true)
    setDashboardError('')
    setHistoryError('')

    try {
      const [dashboardResult, sessionsResult] =
        await Promise.allSettled([
          api.get(`/api/dashboard/${userId}`),
          api.get(`/api/sessions/user/${userId}`),
        ])

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value.data)
      } else {
        setDashboard(null)

        setDashboardError(
          dashboardResult.reason?.response?.data?.message ||
            dashboardResult.reason?.response?.data?.error ||
            'Could not load your dashboard statistics.'
        )
      }

      if (sessionsResult.status === 'fulfilled') {
        const data = sessionsResult.value.data
        setSessions(Array.isArray(data) ? data : [])
      } else {
        setSessions([])

        setHistoryError(
          sessionsResult.reason?.response?.data?.message ||
            sessionsResult.reason?.response?.data?.error ||
            'Could not load your interview history. Please try again.'
        )
      }
    } catch (error) {
      console.error('Dashboard loading error:', error)
      setDashboardError('An unexpected error occurred while loading your dashboard.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Scroll to a dashboard section without leaving the page.
  const scrollToSection = (sectionId, tab) => {
    setActiveTab(tab)

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleTabClick = (tab) => {
    if (tab === 'Overview') {
      setActiveTab('Overview')
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else if (tab === 'Practice') {
      scrollToSection('practice-section', 'Practice')
    } else if (tab === 'History') {
      scrollToSection('interview-history', 'History')
    }
  }

  // Format dates safely.
  const formatDate = (dateValue) => {
    if (!dateValue || dateValue === 'null') {
      return 'Date unavailable'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable'
    }

    return date.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatMode = (mode) => {
    if (!mode) return 'Interview'

    return String(mode)
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  const formatDifficulty = (difficulty) => {
    if (!difficulty) return 'Not specified'

    return String(difficulty)
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  // Return null when no evaluation score exists.
  const getScore = (session) => {
    const score = session?.overallScore

    if (
      score === null ||
      score === undefined ||
      score === '' ||
      score === 'null'
    ) {
      return null
    }

    const parsedScore = Number(score)

    return Number.isFinite(parsedScore) ? parsedScore : null
  }

  const openSession = (sessionId) => {
    if (sessionId === null || sessionId === undefined) {
      return
    }

    navigate(`/session/${sessionId}`)
  }

  const completedSessions = sessions.filter(
    (session) => getScore(session) !== null
  )

  const averageScore =
    dashboard?.averageScore !== null &&
    dashboard?.averageScore !== undefined
      ? Number(dashboard.averageScore)
      : null

  const topicProficiency = Array.isArray(
    dashboard?.topicProficiency
  )
    ? dashboard.topicProficiency
    : []

  const recentSessions = Array.isArray(dashboard?.recentSessions)
    ? dashboard.recentSessions
    : []

  return (
    <div className="dashboard-page">
      {/* Decorative background */}
      <div className="dashboard-orb dashboard-orb-one" />
      <div className="dashboard-orb dashboard-orb-two" />

      {/* Persistent dashboard navigation */}
      <header className="dashboard-header">
        <button
          className="dashboard-brand"
          onClick={() => navigate('/dashboard')}
          aria-label="Interview Mentor home"
        >
          <span className="brand-icon">✳</span>

          <span>
            Interview
            <span className="brand-script">Mentor</span>
          </span>
        </button>

        <nav
          className="dashboard-nav"
          aria-label="Dashboard navigation"
        >
          {['Overview', 'Practice', 'History'].map((tab) => (
            <button
              key={tab}
              className={`dashboard-nav-link ${
                activeTab === tab ? 'active' : ''
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="dashboard-account">
          <div className="dashboard-avatar">
            {firstName.charAt(0).toUpperCase()}
          </div>

          <div className="dashboard-account-name">
            <span>{user?.name || 'Your account'}</span>
            <small>Interview candidate</small>
          </div>

          <button
            className="dashboard-logout"
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
          >
            ↗
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome section */}
        <section
          className="dashboard-welcome"
          id="overview-section"
        >
          <div className="dashboard-welcome-copy">
            <span className="dashboard-eyebrow">
              <span className="eyebrow-dot" />
              YOUR PERSONAL INTERVIEW SPACE
            </span>

            <h1>
              Your next chapter
              <br />
              starts <span>here.</span>
            </h1>

            <p>
              Welcome back, {firstName}. Every interview is an
              opportunity to grow. Let's make your next one count.
            </p>

            <button
              className="dashboard-primary-button"
              onClick={() => navigate('/setup')}
            >
              Start practising
              <span>↗</span>
            </button>

            <div className="dashboard-welcome-note">
              <span>✳</span>
              Practice. Improve. Get hired.
            </div>
          </div>

          {/* Decorative hero card */}
          <div className="dashboard-hero-card">
            <div className="hero-card-top">
              <span className="hero-card-label">
                A NOTE FOR YOU
              </span>
              <span className="hero-card-star">✳</span>
            </div>

            <div className="hero-illustration">
              <div className="hero-circle">
                <div className="hero-document">
                  <span className="hero-document-line long" />
                  <span className="hero-document-line" />
                  <span className="hero-document-line short" />
                  <span className="hero-check">✓</span>
                </div>
              </div>

              <span className="hero-spark spark-one">✳</span>
              <span className="hero-spark spark-two">✦</span>
              <span className="hero-spark spark-three">·</span>
            </div>

            <div className="hero-card-bottom">
              <h2>Confidence is built,</h2>
              <h2 className="hero-script">
                one answer at a time.
              </h2>

              <p>
                Your journey doesn't need to be perfect. Just keep going.
              </p>
            </div>

            <div className="hero-card-decoration">M.</div>
          </div>
        </section>

        {/* Statistics overview */}
        <section
          className="dashboard-section"
          id="statistics-section"
        >
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR PROGRESS SO FAR
              </span>

              <h2>Every session moves you forward.</h2>

              <p>
                Your interview statistics, calculated from your saved sessions.
              </p>
            </div>

            <span className="dashboard-section-number">
              01 / OVERVIEW
            </span>
          </div>

          {dashboardError && (
            <div className="history-empty-state" role="alert">
              <div>
                <h3>Statistics unavailable</h3>
                <p>{dashboardError}</p>
              </div>

              <button
                className="history-action"
                onClick={loadDashboard}
              >
                Try again <span>↻</span>
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="dashboard-feature-grid">
            <article className="dashboard-feature-card">
              <div className="feature-card-top">
                <span className="feature-icon lavender">✳</span>
                <span className="feature-number">01</span>
              </div>

              <span className="feature-tag">COMPLETED</span>

              <h3>
                {loading
                  ? '…'
                  : dashboard?.totalSessions ??
                    completedSessions.length}
              </h3>

              <p>
                Interview sessions with recorded evaluation scores.
              </p>
            </article>

            <article className="dashboard-feature-card">
              <div className="feature-card-top">
                <span className="feature-icon rose">↗</span>
                <span className="feature-number">02</span>
              </div>

              <span className="feature-tag">AVERAGE SCORE</span>

              <h3>
                {loading
                  ? '…'
                  : averageScore !== null &&
                      Number.isFinite(averageScore)
                    ? `${averageScore.toFixed(1)}/10`
                    : '—'}
              </h3>

              <p>
                Your average score across completed interview sessions.
              </p>
            </article>

            <article className="dashboard-feature-card">
              <div className="feature-card-top">
                <span className="feature-icon peach">⌘</span>
                <span className="feature-number">03</span>
              </div>

              <span className="feature-tag">TOPICS TRACKED</span>

              <h3>
                {loading ? '…' : topicProficiency.length}
              </h3>

              <p>
                Topics for which your interview performance is being tracked.
              </p>
            </article>
          </div>

          {/* Topic proficiency */}
          {!loading && topicProficiency.length > 0 && (
            <div className="dashboard-history-section">
              <div className="history-heading">
                <div>
                  <span className="dashboard-eyebrow">
                    SKILLS OVERVIEW
                  </span>

                  <h2>Your topic proficiency.</h2>

                  <p>
                    Based on the topic scores recorded by your interviews.
                  </p>
                </div>
              </div>

              <div className="dashboard-topic-list">
                {topicProficiency.map((topic, index) => {
                  const score = Number(topic.averageScore)

                  const percentage = Number.isFinite(score)
                    ? Math.max(0, Math.min(100, (score / 10) * 100))
                    : 0

                  return (
                    <div
                      className="dashboard-topic-row"
                      key={topic.topic || index}
                    >
                      <span>{topic.topic || 'Unknown topic'}</span>

                      <div
                        className="dashboard-topic-track"
                        role="progressbar"
                        aria-label={`${topic.topic} average score`}
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-valuenow={
                          Number.isFinite(score) ? score : 0
                        }
                      >
                        <div
                          className="dashboard-topic-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <strong>
                        {Number.isFinite(score)
                          ? `${score.toFixed(1)}/10`
                          : '—'}
                      </strong>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* Practice section */}
        <section
          className="dashboard-section"
          id="practice-section"
        >
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                MAKE EVERY SESSION COUNT
              </span>

              <h2>How would you like to practise?</h2>

              <p>
                Choose an area and start working towards your next opportunity.
              </p>
            </div>

            <span className="dashboard-section-number">
              02 / PRACTICE
            </span>
          </div>

          <div className="dashboard-feature-grid">
            {features.map((feature) => (
              <article
                className="dashboard-feature-card"
                key={feature.number}
              >
                <div className="feature-card-top">
                  <span
                    className={`feature-icon ${feature.color}`}
                  >
                    {feature.icon}
                  </span>

                  <span className="feature-number">
                    {feature.number}
                  </span>
                </div>

                <span className="feature-tag">
                  {feature.tag}
                </span>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <button
                  className="feature-action"
                  onClick={() => navigate('/setup')}
                  aria-label={`Start ${feature.title}`}
                >
                  Explore practice <span>↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Interview history */}
        <section
          className="dashboard-history-section"
          id="interview-history"
        >
          <div className="history-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR PROGRESS, YOUR PACE
              </span>

              <h2>Pick up where you left off.</h2>

              <p>
                Review previous interviews, scores and saved session details.
              </p>
            </div>

            <span className="history-decoration">✳</span>
          </div>

          {loading ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">↻</div>

              <div>
                <h3>Loading your interviews…</h3>
                <p>Retrieving your saved sessions.</p>
              </div>
            </div>
          ) : historyError ? (
            <div className="history-empty-state" role="alert">
              <div className="history-empty-icon">!</div>

              <div>
                <h3>Couldn't load interview history</h3>
                <p>{historyError}</p>
              </div>

              <button
                className="history-action"
                onClick={loadDashboard}
              >
                Try again <span>↻</span>
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">↗</div>

              <div>
                <h3>Your interview journey starts here.</h3>

                <p>
                  No sessions were returned for this account. If you've
                  already completed an interview, check that you're signed
                  in to the same account you used to take it.
                </p>
              </div>

              <button
                className="history-action"
                onClick={() => navigate('/setup')}
              >
                Begin a session <span>→</span>
              </button>
            </div>
          ) : (
            <div className="dashboard-session-list">
              {sessions.map((session, index) => {
                const score = getScore(session)
                const completed = score !== null

                return (
                  <article
                    className="dashboard-session-card"
                    key={session.sessionId ?? index}
                  >
                    <div className="dashboard-session-icon">
                      {completed ? '✓' : '↗'}
                    </div>

                    <div className="dashboard-session-info">
                      <h3>{formatMode(session.mode)}</h3>

                      <p>
                        {formatDifficulty(session.difficulty)}
                        {' · '}
                        {formatDate(
                          session.completedAt || session.createdAt
                        )}
                      </p>

                      <span
                        className={`dashboard-session-status ${
                          completed ? 'completed' : 'in-progress'
                        }`}
                      >
                        {completed
                          ? 'Evaluation recorded'
                          : 'No final score recorded'}
                      </span>
                    </div>

                    <div className="dashboard-session-result">
                      <strong>
                        {score !== null
                          ? score.toFixed(1)
                          : '—'}
                      </strong>

                      <small>
                        {score !== null ? 'Score' : 'Unscored'}
                      </small>
                    </div>

                    <button
                      className="history-action"
                      onClick={() => openSession(session.sessionId)}
                      aria-label={`Open ${formatMode(session.mode)} session`}
                    >
                      View session <span>→</span>
                    </button>
                  </article>
                )
              })}
            </div>
          )}

          {!loading &&
            !historyError &&
            sessions.length > 0 && (
              <p className="dashboard-history-footnote">
                Showing {sessions.length} session
                {sessions.length === 1 ? '' : 's'} returned by your
                session history endpoint.
              </p>
            )}

          {!loading &&
            !historyError &&
            completedSessions.length > 0 && (
              <button
                className="feature-action dashboard-refresh-button"
                onClick={loadDashboard}
              >
                Refresh statistics and history <span>↻</span>
              </button>
            )}
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <button
            className="dashboard-footer-brand"
            onClick={() => navigate('/dashboard')}
          >
            Interview<span>Mentor</span>
          </button>

          <p>
            Practice with purpose. Walk in with confidence.
          </p>

          <span>MADE FOR YOUR NEXT CHAPTER ✳</span>
        </footer>
      </main>
    </div>
  )
}