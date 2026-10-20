

import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import {
  FiHome,
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiCheckCircle,
  FiCheckSquare,
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiEdit3,
  FiFileText,
  FiFlag,
  FiFolder,
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
  FiPlus,
  FiRotateCcw,
  FiCoffee,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { createTask, getTasks } from '../services/taskService.js'
import { getFocusHistory } from '../services/focusHistory.js'
import TaskReminderBell from '../components/TaskReminderBell.jsx'

function getNairobiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function formatTaskDueDate(value) {
  if (!value) return 'No due date'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  return date.toLocaleDateString('en-KE', {
    timeZone: 'Africa/Nairobi',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function getFocusWeekDays(date = new Date()) {
  const todayKey = getNairobiDateKey(date)
  const today = new Date(`${todayKey}T00:00:00Z`)
  const mondayOffset = (today.getUTCDay() + 6) % 7
  const monday = new Date(today)
  monday.setUTCDate(today.getUTCDate() - mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setUTCDate(monday.getUTCDate() + index)
    return {
      key: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-KE', { weekday: 'short', timeZone: 'Africa/Nairobi' }),
    }
  })
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

function HomePage({ theme, onToggleTheme }) {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [timerMode, setTimerMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(30 * 60)
  const [focusMinutes, setFocusMinutes] = useState(30)
  const [plannedTaskIds, setPlannedTaskIds] = useState([])
  const [focusTaskToAdd, setFocusTaskToAdd] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [homeTasks, setHomeTasks] = useState([])
  const [focusHistory, setFocusHistory] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')
  const [quickTaskTitle, setQuickTaskTitle] = useState('')
  const [quickTaskDueDate, setQuickTaskDueDate] = useState(() => getNairobiDateKey())
  const [quickTaskPriority, setQuickTaskPriority] = useState('medium')
  const [quickTaskError, setQuickTaskError] = useState('')
  const [quickTaskSaved, setQuickTaskSaved] = useState(false)
  const [savingQuickTask, setSavingQuickTask] = useState(false)
  const [intention, setIntention] = useState(() => {
    try { return localStorage.getItem('task-manager-daily-intention') || '' } catch { return '' }
  })
  const focusPlanKey = `task-manager-focus-plan:${user?.id || user?.email || user?.username || 'guest'}`

  useEffect(() => {
    try {
      const savedPlan = JSON.parse(localStorage.getItem(focusPlanKey) || '[]')
      setPlannedTaskIds(Array.isArray(savedPlan) ? savedPlan.map(String) : [])
    } catch {
      setPlannedTaskIds([])
    }
    setTimerRunning(false)
  }, [focusPlanKey])

  useEffect(() => {
    if (!user) return undefined
    let active = true

    async function loadHomeTasks() {
      setTasksLoading(true)
      try {
        const data = await getTasks()
        if (active) {
          const tasks = Array.isArray(data) ? data : []
          setHomeTasks(tasks)
          const pendingIds = new Set(tasks.filter((task) => task.status !== 'completed').map((task) => String(task.id)))
          setPlannedTaskIds((current) => {
            const nextIds = current.filter((id) => pendingIds.has(id))
            try { localStorage.setItem(focusPlanKey, JSON.stringify(nextIds)) } catch { /* Keep the plan for this session. */ }
            return nextIds
          })
          setTasksError('')
        }
      } catch (error) {
        if (active) setTasksError(error.message || 'Could not load your task overview.')
      } finally {
        if (active) setTasksLoading(false)
      }
    }

    loadHomeTasks()
    return () => { active = false }
  }, [user, focusPlanKey])

  useEffect(() => {
    const userId = user?.id || user?.email || user?.username
    setFocusHistory(getFocusHistory(userId))
  }, [user])

  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#weekly-focus' || loading || !user) return undefined
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('weekly-focus')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, location.hash, loading, user])

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
    setSecondsLeft(mode === 'focus' ? focusMinutes * 60 : 5 * 60)
  }

  function saveFocusPlan(nextIds) {
    const normalizedIds = nextIds.map(String)
    setPlannedTaskIds(normalizedIds)
    try { localStorage.setItem(focusPlanKey, JSON.stringify(normalizedIds)) } catch { /* Keep the plan for this session. */ }
  }

  function addTaskToFocusPlan() {
    if (!focusTaskToAdd || plannedTaskIds.includes(String(focusTaskToAdd))) return
    saveFocusPlan([...plannedTaskIds, String(focusTaskToAdd)])
    setFocusTaskToAdd('')
  }

  function prioritizeFocusTask(taskId) {
    const normalizedId = String(taskId)
    saveFocusPlan([normalizedId, ...plannedTaskIds.filter((id) => id !== normalizedId)])
  }

  function removeTaskFromFocusPlan(taskId) {
    saveFocusPlan(plannedTaskIds.filter((id) => id !== String(taskId)))
  }

  function chooseFocusDuration(minutes) {
    setFocusMinutes(minutes)
    setTimerMode('focus')
    setTimerRunning(false)
    setSecondsLeft(minutes * 60)
  }

  function updateIntention(event) {
    const value = event.target.value
    setIntention(value)
    try { localStorage.setItem('task-manager-daily-intention', value) } catch { /* Keep the intention for this session. */ }
  }

  async function handleQuickTaskSubmit(event) {
    event.preventDefault()
    setQuickTaskError('')
    setQuickTaskSaved(false)
    if (!quickTaskTitle.trim()) {
      setQuickTaskError('Add a task name first.')
      return
    }

    setSavingQuickTask(true)
    try {
      const task = await createTask({
        title: quickTaskTitle.trim(),
        description: '',
        dueDate: quickTaskDueDate,
        priority: quickTaskPriority,
      })
      setHomeTasks((currentTasks) => [task, ...currentTasks])
      setQuickTaskTitle('')
      setQuickTaskSaved(true)
      window.setTimeout(() => setQuickTaskSaved(false), 2800)
    } catch (error) {
      setQuickTaskError(error.message || 'Could not save this task.')
    } finally {
      setSavingQuickTask(false)
    }
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
    const todayKey = getNairobiDateKey()
    const pendingTasks = homeTasks.filter((task) => task.status !== 'completed')
    const plannedTasks = plannedTaskIds.map((id) => pendingTasks.find((task) => String(task.id) === id)).filter(Boolean)
    const availableFocusTasks = pendingTasks.filter((task) => !plannedTaskIds.includes(String(task.id)))
    const focusTask = plannedTasks[0]
    const completedTasks = homeTasks.filter((task) => task.status === 'completed')
    const todayTasks = pendingTasks.filter((task) => String(task.due_date || '').slice(0, 10) === todayKey)
    const upcomingTasks = pendingTasks.filter((task) => String(task.due_date || '').slice(0, 10) > todayKey)
    const nextTask = pendingTasks
      .filter((task) => task.due_date)
      .sort((first, second) => String(first.due_date).localeCompare(String(second.due_date)))[0]
    const completionRate = homeTasks.length ? Math.round((completedTasks.length / homeTasks.length) * 100) : 0
    const focusWeekDays = getFocusWeekDays()
    const focusDayCounts = focusWeekDays.map((day) => ({
      ...day,
      count: focusHistory.filter((event) => getNairobiDateKey(new Date(event.completedAt)) === day.key).length,
    }))
    const weeklyCompletions = focusDayCounts.reduce((total, day) => total + day.count, 0)
    const maxDailyCompletions = Math.max(1, ...focusDayCounts.map((day) => day.count))

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
            <Link className={location.pathname === '/' ? 'is-active' : undefined} to="/" aria-current={location.pathname === '/' ? 'page' : undefined} title="Home" onClick={() => setSidebarOpen(false)}><FiHome aria-hidden="true" /><span>Home</span></Link>
            <Link className={location.pathname === '/dashboard' ? 'is-active' : undefined} to="/dashboard" aria-current={location.pathname === '/dashboard' ? 'page' : undefined} title="Dashboard" onClick={() => setSidebarOpen(false)}><FiBarChart2 aria-hidden="true" /><span>Dashboard</span></Link>
            <Link className={location.pathname === '/tasks' ? 'is-active' : undefined} to="/tasks" aria-current={location.pathname === '/tasks' ? 'page' : undefined} title="My Tasks" onClick={() => setSidebarOpen(false)}><FiCheckSquare aria-hidden="true" /><span>My Tasks</span></Link>
            <Link className={location.pathname === '/calendar' ? 'is-active' : undefined} to="/calendar" aria-current={location.pathname === '/calendar' ? 'page' : undefined} title="Calendar" onClick={() => setSidebarOpen(false)}><FiCalendar aria-hidden="true" /><span>Calendar</span></Link>
          </nav>
          <div className="home-sidebar-section-label">Daily tools</div>
          <nav className="home-sidebar-nav" aria-label="Daily tools">
            <Link to="/#focus-title" title="Focus session" onClick={() => setSidebarOpen(false)}><FiTarget aria-hidden="true" /><span>Focus session</span></Link>
            <Link to="/#daily-intention" title="Daily intention" onClick={() => setSidebarOpen(false)}><FiEdit3 aria-hidden="true" /><span>Daily intention</span></Link>
            <Link to="/#weekly-focus" title="Weekly focus" onClick={() => setSidebarOpen(false)}><FiTrendingUp aria-hidden="true" /><span>Weekly focus</span></Link>
            <Link className={location.pathname === '/reminders' ? 'is-active' : undefined} to="/reminders" aria-current={location.pathname === '/reminders' ? 'page' : undefined} title="Reminders" onClick={() => setSidebarOpen(false)}><FiBell aria-hidden="true" /><span>Reminders</span></Link>
          </nav>
          <div className="home-sidebar-section-label">Account</div>
          <nav className="home-sidebar-nav" aria-label="Account navigation">
            <Link className={location.pathname === '/account' ? 'is-active' : undefined} to="/account" aria-current={location.pathname === '/account' ? 'page' : undefined} title="Account settings" onClick={() => setSidebarOpen(false)}><FiSettings aria-hidden="true" /><span>Account settings</span></Link>
            <Link className={location.pathname === '/about' ? 'is-active' : undefined} to="/about" aria-current={location.pathname === '/about' ? 'page' : undefined} title="About & guide" onClick={() => setSidebarOpen(false)}><FiBookOpen aria-hidden="true" /><span>About &amp; guide</span></Link>
          </nav>
          <div className="home-sidebar-section-label">Coming soon</div>
          <div className="home-sidebar-nav home-sidebar-upcoming" role="list" aria-label="Planned features">
            <div className="home-sidebar-upcoming-item" role="listitem" title="Projects is planned for a future update"><FiFolder aria-hidden="true" /><span>Projects</span><small>Soon</small></div>
            <div className="home-sidebar-upcoming-item" role="listitem" title="Notes is planned for a future update"><FiFileText aria-hidden="true" /><span>Notes</span><small>Soon</small></div>
          </div>
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
            <div className="home-header-actions">
              <button className="home-header-menu" type="button" aria-label="Open navigation menu" aria-expanded={sidebarOpen} aria-controls="home-sidebar-navigation" onClick={() => setSidebarOpen(true)}>
                <FiMenu aria-hidden="true" />
              </button>
              <TaskReminderBell />
              <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                {theme === 'light' ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
              </button>
            </div>
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
            <div className="home-focus-planner">
              <section className="home-plan-card" aria-labelledby="focus-plan-heading">
                <div className="home-plan-heading"><div><p className="eyebrow">MAKE A REALISTIC PLAN</p><h2 id="focus-plan-heading">Plan your tasks</h2></div><span className="home-plan-count">{plannedTasks.length} planned</span></div>
                <p className="home-plan-intro">Choose a few tasks to work through, one at a time.</p>
                <div className="home-plan-add-row">
                  <label className="visually-hidden" htmlFor="focus-plan-task">Choose a task to add to your focus plan</label>
                  <select id="focus-plan-task" value={focusTaskToAdd} onChange={(event) => setFocusTaskToAdd(event.target.value)} disabled={availableFocusTasks.length === 0 || tasksLoading}>
                    <option value="">{tasksLoading ? 'Loading your tasks…' : availableFocusTasks.length ? 'Choose a task…' : 'No more open tasks'}</option>
                    {availableFocusTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                  </select>
                  <button type="button" onClick={addTaskToFocusPlan} disabled={!focusTaskToAdd}><FiPlus aria-hidden="true" /><span>Add</span></button>
                </div>
                {tasksError && <p className="home-plan-empty" role="status">Your tasks could not be loaded.</p>}
                {!tasksLoading && !tasksError && plannedTasks.length === 0 && <p className="home-plan-empty">Add an open task above to build today’s focus plan.</p>}
                {plannedTasks.length > 0 && <ol className="home-plan-list" aria-label="Planned focus tasks">
                  {plannedTasks.map((task, index) => <li key={task.id} className={index === 0 ? 'is-up-next' : undefined}>
                    <button className="home-plan-task-select" type="button" onClick={() => prioritizeFocusTask(task.id)} aria-label={index === 0 ? `${task.title} is up next` : `Move ${task.title} to the top of the plan`}>
                      <span className="home-plan-task-number">{index === 0 ? <FiPlay aria-hidden="true" /> : index + 1}</span>
                      <span className="home-plan-task-copy"><strong>{task.title}</strong><small>{index === 0 ? 'Up next' : `${String(task.priority || 'medium')} priority`}</small></span>
                    </button>
                    <button className="home-plan-remove" type="button" onClick={() => removeTaskFromFocusPlan(task.id)} aria-label={`Remove ${task.title} from focus plan`}><FiX aria-hidden="true" /></button>
                  </li>)}
                </ol>}
                <Link className="home-plan-view-all" to="/tasks">Manage tasks <FiArrowRight aria-hidden="true" /></Link>
              </section>

              <section className="home-focus-card" aria-labelledby="focus-title">
                <div className="home-focus-card-heading"><div><p className="eyebrow">ONE THING AT A TIME</p><h2 id="focus-title">Focus timer</h2></div><span className="home-focus-session-badge"><FiTarget aria-hidden="true" /> {timerMode === 'focus' ? 'FOCUS' : 'BREAK'}</span></div>
                <div className="home-focus-up-next"><small>{focusTask ? 'UP NEXT' : 'READY WHEN YOU ARE'}</small><strong>{focusTask?.title || 'Choose a task to begin'}</strong>{focusTask && <span className={`home-next-task-priority priority-${String(focusTask.priority || 'medium').toLowerCase()}`}>{focusTask.priority || 'medium'} priority</span>}</div>
                <div className={`home-focus-clock${timerRunning ? ' is-running' : ''}`} aria-live="off"><span>{formatTimer(secondsLeft)}</span><small>{secondsLeft === 0 ? 'Session complete' : timerRunning ? 'Stay with it' : 'Take it one step at a time'}</small></div>
                <div className="home-focus-duration" role="group" aria-label="Focus session length">
                  {[15, 30, 60].map((minutes) => <button key={minutes} type="button" className={timerMode === 'focus' && focusMinutes === minutes ? 'is-selected' : ''} aria-pressed={timerMode === 'focus' && focusMinutes === minutes} onClick={() => chooseFocusDuration(minutes)}>{minutes} min</button>)}
                  <button type="button" className={`home-focus-break${timerMode === 'break' ? ' is-selected' : ''}`} aria-pressed={timerMode === 'break'} onClick={() => selectTimerMode('break')}><FiCoffee aria-hidden="true" /> Break</button>
                </div>
                <div className="home-focus-controls">
                  <button className="home-focus-start" type="button" onClick={() => { if (secondsLeft === 0) setSecondsLeft(timerMode === 'focus' ? focusMinutes * 60 : 5 * 60); setTimerRunning(!timerRunning) }} disabled={timerMode === 'focus' && !focusTask}>
                    {timerRunning ? <><FiPause aria-hidden="true" /> Pause session</> : <><FiPlay aria-hidden="true" /> {secondsLeft === 0 ? 'Start again' : timerMode === 'break' ? 'Start break' : 'Start focus'}</>}
                  </button>
                  <button className="home-focus-reset" type="button" onClick={() => { setTimerRunning(false); setSecondsLeft(timerMode === 'focus' ? focusMinutes * 60 : 5 * 60) }} aria-label="Reset timer"><FiRotateCcw aria-hidden="true" /></button>
                </div>
              </section>
            </div>
            <div className="home-focus-side">
              <section className="home-intention-card"><span className="home-focus-side-icon"><FiEdit3 aria-hidden="true" /></span><p className="eyebrow">SET YOUR DIRECTION</p><h2>What would make today feel meaningful?</h2><label className="home-intention-label" htmlFor="daily-intention">Your intention</label><textarea id="daily-intention" value={intention} onChange={updateIntention} maxLength={180} placeholder="For example: finish the first draft…" /><div className="home-intention-footer"><span>{intention.length}/180</span><span><FiCheckCircle aria-hidden="true" /> Saved on this device</span></div></section>
              <section className={`home-quick-task-card${quickTaskSaved ? ' is-saved' : ''}`} aria-labelledby="quick-task-heading">
                <div className="home-quick-task-heading"><span><FiPlus aria-hidden="true" /></span><div><p className="eyebrow">CATCH IT WHILE IT'S FRESH</p><h2 id="quick-task-heading">Quick add</h2></div></div>
                <form onSubmit={handleQuickTaskSubmit}>
                  <label className="visually-hidden" htmlFor="quick-task-title">Task name</label>
                  <input id="quick-task-title" type="text" value={quickTaskTitle} onChange={(event) => setQuickTaskTitle(event.target.value)} maxLength={150} placeholder="What needs to get done?" required />
                  <div className="home-quick-task-submit-row">
                    <label htmlFor="quick-task-date">Due</label>
                    <input id="quick-task-date" type="date" min={todayKey} value={quickTaskDueDate} onChange={(event) => setQuickTaskDueDate(event.target.value)} required />
                    <label className="visually-hidden" htmlFor="quick-task-priority">Priority</label>
                    <select id="quick-task-priority" value={quickTaskPriority} onChange={(event) => setQuickTaskPriority(event.target.value)} aria-label="Task priority">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <button type="submit" disabled={savingQuickTask}>{savingQuickTask ? 'Adding…' : <><FiPlus aria-hidden="true" /> Add</>}</button>
                  </div>
                  {quickTaskError && <p className="home-quick-task-error" role="alert">{quickTaskError}</p>}
                  {quickTaskSaved && <p className="home-quick-task-success" role="status"><FiCheckCircle aria-hidden="true" /> Added to your tasks</p>}
                </form>
              </section>
              <section className="home-focus-tip"><span><FiZap aria-hidden="true" /></span><div><strong>A gentle reminder</strong><p>You don’t need to finish everything today. Just decide what deserves your attention next.</p></div></section>
            </div>
          </div>
          <section className="home-next-task" aria-labelledby="home-next-task-heading">
            <div className="home-next-task-icon"><FiFlag aria-hidden="true" /></div>
            <div className="home-next-task-copy">
              <p className="eyebrow">NEXT UP</p>
              <h2 id="home-next-task-heading">{tasksLoading ? 'Finding your next task…' : tasksError ? 'Could not load your next task' : nextTask?.title || 'You’re all caught up'}</h2>
              {!tasksLoading && nextTask && <p>Due {formatTaskDueDate(nextTask.due_date)}</p>}
              {!tasksLoading && !tasksError && !nextTask && <p>Add a due date to a task and it’ll show up here.</p>}
            </div>
            {!tasksLoading && nextTask && <span className={`home-next-task-priority priority-${String(nextTask.priority || 'medium').toLowerCase()}`}>{nextTask.priority || 'medium'} priority</span>}
            <Link to="/tasks" className="home-next-task-link" aria-label={nextTask ? `Open tasks to work on ${nextTask.title}` : 'Open tasks'}><FiArrowRight aria-hidden="true" /></Link>
          </section>
          <section className="home-task-snapshot" aria-labelledby="home-task-snapshot-heading">
            <div className="home-task-snapshot-heading">
              <div><p className="eyebrow">A QUICK LOOK</p><h2 id="home-task-snapshot-heading">Your task pulse</h2></div>
              <Link to="/dashboard">Open dashboard <FiArrowRight aria-hidden="true" /></Link>
            </div>
            {tasksError ? (
              <p className="home-task-snapshot-message" role="alert">{tasksError}</p>
            ) : (
              <>
                <div className="home-task-snapshot-stats">
                  <div><span>Due today</span><strong>{tasksLoading ? '—' : todayTasks.length}</strong></div>
                  <div><span>Upcoming</span><strong>{tasksLoading ? '—' : upcomingTasks.length}</strong></div>
                  <div><span>Completed</span><strong>{tasksLoading ? '—' : completedTasks.length}</strong></div>
                  <div className="home-task-snapshot-progress"><div><span>Overall progress</span><strong>{tasksLoading ? '—' : `${completionRate}%`}</strong></div><span className="home-task-progress-track" role="progressbar" aria-label="Task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={tasksLoading ? 0 : completionRate}><span style={{ width: tasksLoading ? '0%' : `${completionRate}%` }} /></span></div>
                </div>
                {!tasksLoading && todayTasks.length > 0 && (
                  <ul className="home-task-snapshot-list">
                    {todayTasks.slice(0, 3).map((task) => <li key={task.id}><span aria-hidden="true" /><span>{task.title}</span></li>)}
                    {todayTasks.length > 3 && <li className="home-task-more">+{todayTasks.length - 3} more due today</li>}
                  </ul>
                )}
                {!tasksLoading && todayTasks.length === 0 && <p className="home-task-snapshot-message">Nothing due today. A good day to get ahead or take a breather.</p>}
              </>
            )}
          </section>
          <section id="weekly-focus" className="home-weekly-focus" aria-labelledby="home-weekly-focus-heading">
            <div className="home-weekly-focus-heading">
              <div><p className="eyebrow">SMALL WINS ADD UP</p><h2 id="home-weekly-focus-heading">Your week in focus</h2></div>
              <div className="home-weekly-focus-total"><strong>{weeklyCompletions}</strong><span>{weeklyCompletions === 1 ? 'task' : 'tasks'} completed</span></div>
            </div>
            <div className="home-weekly-focus-chart" role="img" aria-label={`${weeklyCompletions} tasks completed this week. Daily totals: ${focusDayCounts.map((day) => `${day.label} ${day.count}`).join(', ')}.`}>
              {focusDayCounts.map((day) => (
                <div className="home-weekly-focus-day" key={day.key}>
                  <span className="home-weekly-focus-count">{day.count || ''}</span>
                  <div className="home-weekly-focus-track"><span style={{ height: `${day.count ? Math.max(12, (day.count / maxDailyCompletions) * 100) : 0}%` }} /></div>
                  <span className="home-weekly-focus-label">{day.label}</span>
                </div>
              ))}
            </div>
            <p className="home-weekly-focus-note">Progress is tracked on this device from the moment you complete a task.</p>
          </section>
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
