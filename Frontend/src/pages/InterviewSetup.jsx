import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AppHeader from '../components/AppHeader'
const INK = '#1f2333'
const MUTED = '#6b7280'
const ACCENT = '#7c1d3f'
const ACCENT_2 = '#9c2a52'
const CARD_BD = '#eee0e2'

export default function InterviewSetup() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [resumes,          setResumes]          = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [uploadingResume,  setUploadingResume]  = useState(false)
  const [uploadError,      setUploadError]      = useState('')
  const [jdText,           setJdText]           = useState('')
  const [mode,             setMode]             = useState('TECHNICAL')
  const [difficulty,       setDifficulty]       = useState('INTERMEDIATE')
  const [starting,         setStarting]         = useState(false)
  const [startError,       setStartError]       = useState('')

  useEffect(() => {
    const currentUserId = user?.userId || localStorage.getItem('userId')
    if (!currentUserId) return

    api.get(`/api/resumes/user/${currentUserId}`)
      .then(res => {
        setResumes(res.data)
        if (res.data && res.data.length > 0) {
          setSelectedResumeId(res.data[0].resumeId)
        }
      })
      .catch((err) => console.error('Error loading user resumes:', err))
  }, [user?.userId])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const currentUserId = user?.userId || localStorage.getItem('userId')
    if (!currentUserId) {
      setUploadError('User session expired. Please sign in again.')
      return
    }

    setUploadingResume(true)
    setUploadError('')

    const fd = new FormData()
    fd.append('userId', parseInt(currentUserId, 10))
    fd.append('file', file)

    try {
      const res = await api.post('/api/resumes/upload', fd)

      const r = {
        resumeId: res.data.resumeId,
        fileName: res.data.fileName || file.name,
        uploadedAt: res.data.uploadedAt || new Date().toISOString()
      }

      setResumes(prev => [r, ...prev])
      setSelectedResumeId(r.resumeId)
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to upload PDF. Check server connection.'
      )
    } finally {
      setUploadingResume(false)
      e.target.value = ''
    }
  }

  const handleStart = async () => {
    const currentUserId = user?.userId || localStorage.getItem('userId')
    if (!selectedResumeId) {
      setStartError('Select or upload a resume first.')
      return
    }
    if (!jdText.trim()) {
      setStartError('Paste a job description.')
      return
    }

    setStarting(true)
    setStartError('')

    try {
      const res = await api.post('/api/sessions/start', {
        userId: parseInt(currentUserId, 10),
        resumeId: selectedResumeId,
        jdText: jdText.trim(),
        mode,
        difficulty,
      })

      navigate(`/interview/${res.data.sessionId}`, {
        state: { questions: res.data.questions },
      })
    } catch (err) {
      console.error('Session start error:', err)
      setStartError(err.response?.data?.error || err.response?.data?.message || 'Failed to start session')
      setStarting(false)
    }
  }

  const Section = ({ num, title, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-4" style={{ border: `1px solid ${CARD_BD}` }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: MUTED }}>
        <span style={{ color: ACCENT }}>{num}</span>{'  '}{title}
      </p>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#fdf7f5]">
      <AppHeader />

      <main className="flex-1 overflow-y-auto px-6 py-8 flex justify-center">
        <div className="w-full max-w-xl">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: INK }} className="mb-1">
            New Interview Setup
          </h1>
          <p className="text-xs mb-6" style={{ color: MUTED }}>
            The AI generates questions personalized to your resume and target job description.
          </p>

          <div>
            {/* 01 Resume */}
            <Section num="01" title="Your Resume">
              {resumes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {resumes.map(r => (
                    <button
                      key={r.resumeId}
                      type="button"
                      onClick={() => setSelectedResumeId(r.resumeId)}
                      className="w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex justify-between items-center"
                      style={{
                        background: selectedResumeId === r.resumeId ? '#fbf0f2' : '#ffffff',
                        border: `1.5px solid ${selectedResumeId === r.resumeId ? ACCENT : CARD_BD}`,
                        color: selectedResumeId === r.resumeId ? ACCENT : INK,
                      }}
                    >
                      <span className="font-semibold truncate pr-2">{r.fileName}</span>
                      {selectedResumeId === r.resumeId && (
                        <span className="text-xs font-bold shrink-0" style={{ color: ACCENT }}>✓ Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <label
                className="flex items-center justify-center h-16 rounded-xl cursor-pointer transition-all text-xs font-medium"
                style={{ border: `1.5px dashed ${CARD_BD}`, color: MUTED, background: '#faf6f6' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = ACCENT
                  e.currentTarget.style.color = ACCENT
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = CARD_BD
                  e.currentTarget.style.color = MUTED
                }}
              >
                {uploadingResume
                  ? 'Uploading PDF…'
                  : resumes.length > 0
                    ? 'Upload another resume (PDF)'
                    : 'Upload resume (PDF)'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingResume}
                />
              </label>

              {uploadError && (
                <p className="text-xs mt-2 text-red-600 font-medium">{uploadError}</p>
              )}
            </Section>

            {/* 02 JD */}
            <Section num="02" title="Job Description">
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={5}
                placeholder="Paste the requirements or job description here…"
                className="w-full rounded-xl px-4 py-3 text-xs outline-none resize-none transition"
                style={{ background: '#fff', border: `1px solid ${CARD_BD}`, color: INK }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = CARD_BD)}
              />
            </Section>

            {/* 03 Settings */}
            <Section num="03" title="Interview Settings">
              <div className="mb-4">
                <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>Mode</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { v: 'TECHNICAL', l: 'Technical Round', d: 'Java, DSA, SQL, System Design' },
                    { v: 'HR',        l: 'HR / Behavioral', d: 'Behavior, STAR stories, Culture fit' },
                  ].map(m => (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => setMode(m.v)}
                      className="p-3.5 rounded-xl text-left transition-all"
                      style={{
                        background: mode === m.v ? '#fbf0f2' : '#ffffff',
                        border: `1.5px solid ${mode === m.v ? ACCENT : CARD_BD}`,
                      }}
                    >
                      <div className="text-xs font-bold mb-0.5" style={{ color: mode === m.v ? ACCENT : INK }}>{m.l}</div>
                      <div className="text-xs" style={{ color: MUTED }}>{m.d}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'BEGINNER',     l: 'Beginner',     c: '#15803d' },
                    { v: 'INTERMEDIATE', l: 'Intermediate', c: '#b45309' },
                    { v: 'ADVANCED',     l: 'Advanced',     c: '#b91c1c' },
                  ].map(d => (
                    <button
                      key={d.v}
                      type="button"
                      onClick={() => setDifficulty(d.v)}
                      className="py-2.5 rounded-xl text-center text-xs font-bold transition-all"
                      style={{
                        background: difficulty === d.v ? '#fbf0f2' : '#ffffff',
                        border: `1.5px solid ${difficulty === d.v ? ACCENT : CARD_BD}`,
                        color: d.c,
                      }}
                    >
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {startError && (
              <div className="text-xs rounded-xl px-4 py-2.5 mb-4 font-medium"
                   style={{ background: '#fdeeee', border: '1px solid #f4c6c6', color: '#a33' }}>
                {startError}
              </div>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})` }}
            >
              {starting ? 'Generating your personalized interview… (8–12s)' : 'Start Interview Round →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}