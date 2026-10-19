

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import {
  FiHome,
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiEdit3,
  FiFlag,
  FiList,
  FiMoon,
  FiLogOut,
  FiSettings,
  FiSun,
  FiTrendingUp,
  FiUser,
  FiTarget,
  FiZap,
  FiPause,
  FiPlay,
  FiRotateCcw,
  FiCoffee,
  FiMenu,
  FiX,
} from 'react-icons/fi'

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function HomePage({ theme, onToggleTheme }) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [timerMode, setTimerMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [intention, setIntention] = useState(() => {
    try { return localStorage.getItem('task-manager-daily-intention') || '' } catch { return '' }
  })

  useEffect(() => {
    if (!timerRunning) return undefined
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval)
          setTimerRunning(false)
          return 0
        }
        return seconds - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timerRunning])

  function selectTimerMode(mode) {
    setTimerMode(mode)
    setTimerRunning(false)
    setSecondsLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  function updateIntention(event) {
    const value = event.target.value
    setIntention(value)
    try { localStorage.setItem('task-manager-daily-intention', value) } catch { /* Keep the intention for this session. */ }
  }

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Could not log out. Please try again.')
      setLoggingOut(false)
    }
  }

  if (loading) {
    return <main className="home-loading" role="status">Loading your workspace…</main>
  }

  if (user) {
    return (
      <div className="home-workspace">
        {sidebarOpen && (
          <button
            className="home-sidebar-backdrop"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`home-sidebar${sidebarOpen ? ' is-mobile-open' : ''}`} aria-label="Main navigation">
          <button
            className="home-sidebar-toggle"
            type="button"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="home-sidebar-navigation"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
          <Link className="home-sidebar-brand" to="/" aria-label="Wuod Atieno home">
            <span className="home-sidebar-brand-mark" aria-hidden="true">W</span>
            <span>Wuod Atieno</span>
          </Link>
          <div className="home-sidebar-section-label">Workspace</div>
          <nav id="home-sidebar-navigation" className="home-sidebar-nav" aria-label="Workspace navigation">
            <Link className="is-active" to="/" aria-current="page" title="Home" onClick={() => setSidebarOpen(false)}><FiHome aria-hidden="true" /><span>Home</span></Link>
            <Link to="/dashboard" title="Dashboard" onClick={() => setSidebarOpen(false)}><FiBarChart2 aria-hidden="true" /><span>Dashboard</span></Link>
            <Link to="/tasks" title="My Tasks" onClick={() => setSidebarOpen(false)}><FiCheckSquare aria-hidden="true" /><span>My Tasks</span></Link>
            <Link to="/account" title="Account settings" onClick={() => setSidebarOpen(false)}><FiSettings aria-hidden="true" /><span>Account settings</span></Link>
          </nav>
          <div className="home-sidebar-bottom">
            <Link className="home-sidebar-profile" to="/account" onClick={() => setSidebarOpen(false)}>
              {user.profile_picture
                ? <img src={user.profile_picture} alt="" />
                : <span className="home-sidebar-avatar-fallback"><FiUser aria-hidden="true" /></span>}
              <span><strong>{user.name || user.username || 'My account'}</strong><small>Personal workspace</small></span>
            </Link>
            {logoutError && <p className="home-sidebar-error" role="alert">{logoutError}</p>}
            <button className="home-sidebar-logout" type="button" onClick={handleLogout} disabled={loggingOut}>
              <FiLogOut aria-hidden="true" /><span>{loggingOut ? 'Signing out…' : 'Log out'}</span>
            </button>
          </div>
        </aside>
        <main className="home-portal">
          <header className="home-portal-header">
            <div><p className="eyebrow">YOUR PERSONAL WORKSPACE</p><p className="home-portal-date">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' })}</p></div>
            <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
            </button>
          </header>
          <section className="home-portal-hero home-focus-hero">
            <div className="home-portal-hero-copy">
              <span className="home-portal-kicker"><FiSun aria-hidden="true" /> A LITTLE SPACE TO FOCUS</span>
              <h1>Welcome back, {user.name?.trim().split(/\s+/)[0] || user.username || 'there'}.</h1>
              <p>Give your attention to one thing at a time. Set an intention, settle into a short focus session, and let the rest wait.</p>
            </div>
            <div className="home-portal-illustration" aria-hidden="true"><div className="home-portal-illustration-ring" /><FiZap /></div>
          </section>
          <div className="home-focus-layout">
            <section className="home-focus-card" aria-labelledby="focus-title">
              <div className="home-focus-card-heading"><div><p className="eyebrow">MAKE A LITTLE PROGRESS</p><h2 id="focus-title">Focus session</h2></div><span className="home-focus-session-badge"><FiTarget aria-hidden="true" /> {timerMode === 'focus' ? 'FOCUS' : 'RESET'}</span></div>
              <div className={`home-focus-clock${timerRunning ? ' is-running' : ''}`} aria-live="off"><span>{formatTimer(secondsLeft)}</span><small>{secondsLeft === 0 ? 'Session complete' : timerRunning ? 'Stay with it' : 'Ready when you are'}</small></div>
              <div className="home-focus-mode-switch" role="group" aria-label="Timer mode">
                <button type="button" className={timerMode === 'focus' ? 'is-selected' : ''} onClick={() => selectTimerMode('focus')}><FiTarget aria-hidden="true" /> Focus · 25 min</button>
                <button type="button" className={timerMode === 'break' ? 'is-selected' : ''} onClick={() => selectTimerMode('break')}><FiCoffee aria-hidden="true" /> Break · 5 min</button>
              </div>
              <div className="home-focus-controls">
                <button className="home-focus-start" type="button" onClick={() => { if (secondsLeft === 0) setSecondsLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60); setTimerRunning(!timerRunning) }}>
                  {timerRunning ? <><FiPause aria-hidden="true" /> Pause session</> : <><FiPlay aria-hidden="true" /> {secondsLeft === 0 ? 'Start again' : 'Start focus'}</>}
                </button>
                <button className="home-focus-reset" type="button" onClick={() => { setTimerRunning(false); setSecondsLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60) }} aria-label="Reset timer"><FiRotateCcw aria-hidden="true" /></button>
              </div>
            </section>
            <div className="home-focus-side">
              <section className="home-intention-card"><span className="home-focus-side-icon"><FiEdit3 aria-hidden="true" /></span><p className="eyebrow">SET YOUR DIRECTION</p><h2>What would make today feel meaningful?</h2><label className="home-intention-label" htmlFor="daily-intention">Your intention</label><textarea id="daily-intention" value={intention} onChange={updateIntention} maxLength={180} placeholder="For example: finish the first draft…" /><div className="home-intention-footer"><span>{intention.length}/180</span><span><FiCheckCircle aria-hidden="true" /> Saved on this device</span></div></section>
              <section className="home-focus-tip"><span><FiZap aria-hidden="true" /></span><div><strong>A gentle reminder</strong><p>You don’t need to finish everything today. Just decide what deserves your attention next.</p></div></section>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app landing-page">
      <header className="app-header landing-header">
        <Link className="brand" to="/" aria-label="Wuod Atieno home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>Wuod Atieno</span>
        </Link>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <Link className="landing-signin" to="/login">Login</Link>
          <Link className="landing-nav-cta" to="/register">Register</Link>
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
          </button>
        </nav>
      </header>

      <main className="main-content home-content">
        <section className="welcome-section">
          <div className="welcome-copy">
            <p className="eyebrow">A CALMER WAY TO GET THINGS DONE</p>
            <h1>Less juggling.<br /><span>More doing.</span></h1>
            <p className="welcome-description">
              Bring your tasks, priorities, and deadlines into one clear view. Make a plan that feels manageable, then move through it one step at a time.
            </p>
            <div className="welcome-actions">
              <Link className="primary-button" to="/register">Start planning for free <FiArrowRight aria-hidden="true" /></Link>
              <Link className="landing-text-link" to="/login">I already have an account</Link>
            </div>
            <div className="landing-benefits"><span><FiCheckCircle aria-hidden="true" /> Easy to get started</span><span><FiCheckCircle aria-hidden="true" /> Your work, clearly organized</span></div>
          </div>

          <div className="landing-visual">
            <div className="landing-visual-orb landing-visual-orb-one" />
            <div className="landing-visual-orb landing-visual-orb-two" />
            <div className="hero-preview" role="group" aria-label="Example task dashboard">
              <div className="preview-topline"><span>MY WORKSPACE</span><span className="preview-live-dot">YOUR DAY AT A GLANCE</span></div>
              <div className="preview-heading">
                <span className="preview-icon"><FiCheckSquare aria-hidden="true" /></span>
                <div>
                  <strong>Today’s focus</strong>
                  <span>Tuesday · Keep your momentum</span>
                </div>
                <span className="preview-count">2 / 5</span>
              </div>
              <div className="preview-progress-label"><span>Daily progress</span><strong>40%</strong></div>
              <div className="preview-progress"><span /></div>
              <div className="preview-task is-complete"><span className="preview-check">✓</span><span>Plan the week</span><small>DONE</small></div>
              <div className="preview-task is-complete"><span className="preview-check">✓</span><span>Review priorities</span><small>DONE</small></div>
              <div className="preview-task"><span className="preview-check" /><span>Finish the important work</span><small className="preview-due">DUE TODAY</small></div>
              <div className="preview-bottom"><span><i /> 2 tasks completed</span><span>Keep it going <FiArrowRight aria-hidden="true" /></span></div>
            </div>
            <div className="landing-float-card"><span className="landing-float-icon"><FiTrendingUp aria-hidden="true" /></span><span><strong>Making progress</strong><small>Every task counts</small></span><FiCheckCircle aria-hidden="true" /></div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="features-intro">
            <p className="eyebrow">BUILT FOR YOUR EVERYDAY</p>
            <h2>Everything in one place</h2>
            <p>Simple tools that help you move from planning to done.</p>
          </div>

          <div className="features-grid landing-features-grid">
            <article className="feature-card">
              <span className="feature-icon"><FiList aria-hidden="true" /></span>
              <h3>Organize tasks</h3>
              <p>Keep your daily activities organized in one place.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiFlag aria-hidden="true" /></span>
              <h3>Set priorities</h3>
              <p>Identify which tasks need your attention first.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiCalendar aria-hidden="true" /></span>
              <h3>Stay ahead of deadlines</h3>
              <p>Add due dates so upcoming work stays on your radar.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiBarChart2 aria-hidden="true" /></span>
              <h3>See your progress</h3>
              <p>Get a clear snapshot of completed work and what still needs attention.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiEdit3 aria-hidden="true" /></span>
              <h3>Adapt as plans change</h3>
              <p>Edit task details, update status, or remove tasks when priorities shift.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiClock aria-hidden="true" /></span>
              <h3>Know what’s next</h3>
              <p>Review tasks due today and see upcoming deadlines from your dashboard.</p>
            </article>

          </div>
        </section>

        <section className="landing-bottom-cta">
          <div><p className="eyebrow">START WITH ONE TASK</p><h2>A little structure can change your whole day.</h2></div>
          <Link className="primary-button" to="/register">Create your account <FiArrowRight aria-hidden="true" /></Link>
        </section>
      </main>

    </div>
  )
}

export default HomePage
