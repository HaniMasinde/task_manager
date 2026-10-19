import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiBell, FiCalendar, FiCheck, FiCheckCircle, FiClock, FiHome } from 'react-icons/fi'
import { useAuth } from '../context/useAuth.js'
import { completeTask, getTasks } from '../services/taskService.js'
import { recordTaskCompletion } from '../services/focusHistory.js'

function getNairobiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function formatDueDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`)
  return date.toLocaleDateString('en-KE', {
    timeZone: 'Africa/Nairobi', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function RemindersPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [completingId, setCompletingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    async function loadTasks() {
      setLoading(true)
      setError('')
      try {
        const data = await getTasks()
        if (active) setTasks(Array.isArray(data) ? data : [])
      } catch (err) {
        if (active) setError(err.message || 'Could not load your reminders.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadTasks()
    return () => { active = false }
  }, [user, reloadKey])

  const { overdue, dueToday, upcoming, today } = useMemo(() => {
    const currentDate = getNairobiDateKey()
    const pending = tasks.filter((task) => task.status !== 'completed' && task.due_date)
      .map((task) => ({ ...task, dueDateKey: String(task.due_date).slice(0, 10) }))
      .sort((first, second) => first.dueDateKey.localeCompare(second.dueDateKey))
    return {
      overdue: pending.filter((task) => task.dueDateKey < currentDate),
      dueToday: pending.filter((task) => task.dueDateKey === currentDate),
      upcoming: pending.filter((task) => task.dueDateKey > currentDate),
      today: currentDate,
    }
  }, [tasks])

  const filteredTasks = activeFilter === 'overdue'
    ? overdue
    : activeFilter === 'today'
      ? dueToday
      : activeFilter === 'upcoming'
        ? upcoming
        : [...overdue, ...dueToday, ...upcoming]

  async function handleComplete(task) {
    setActionError('')
    setCompletingId(task.id)
    try {
      await completeTask(task.id)
      recordTaskCompletion(user?.id || user?.email || user?.username, task)
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: 'completed' } : item))
    } catch (err) {
      setActionError(err.message || 'Could not complete this task. Please try again.')
    } finally {
      setCompletingId(null)
    }
  }

  const filters = [
    { id: 'all', label: 'All reminders', count: overdue.length + dueToday.length + upcoming.length },
    { id: 'overdue', label: 'Overdue', count: overdue.length },
    { id: 'today', label: 'Due today', count: dueToday.length },
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
  ]

  return (
    <main className="reminders-page">
      <div className="reminders-shell">
        <header className="reminders-header">
          <Link className="reminders-back-link" to="/" aria-label="Back home"><FiArrowLeft aria-hidden="true" /><span>Home</span></Link>
          <div className="reminders-header-icon"><FiBell aria-hidden="true" /></div>
          <p className="reminders-eyebrow">STAY ON TOP OF YOUR TASKS</p>
          <h1>Reminders</h1>
          <p className="reminders-intro">See what needs your attention today and what’s coming up.</p>
          <div className="reminders-header-links">
            <Link to="/dashboard"><FiHome aria-hidden="true" /> Dashboard</Link>
            <Link to="/tasks"><FiArrowRight aria-hidden="true" /> All tasks</Link>
          </div>
        </header>

        <section className="reminders-overview" aria-label="Reminder counts">
          <article className="reminders-overview-card is-overdue"><span><FiAlertCircle aria-hidden="true" /></span><div><strong>{loading ? '—' : overdue.length}</strong><small>Overdue</small></div></article>
          <article className="reminders-overview-card is-today"><span><FiClock aria-hidden="true" /></span><div><strong>{loading ? '—' : dueToday.length}</strong><small>Due today</small></div></article>
          <article className="reminders-overview-card is-upcoming"><span><FiCalendar aria-hidden="true" /></span><div><strong>{loading ? '—' : upcoming.length}</strong><small>Upcoming</small></div></article>
        </section>

        <section className="reminders-list-panel" aria-labelledby="reminders-list-heading">
          <div className="reminders-list-heading">
            <div><p className="reminders-eyebrow">YOUR TASK SCHEDULE</p><h2 id="reminders-list-heading">Task reminders</h2></div>
            <span>{loading ? 'Loading…' : `${overdue.length + dueToday.length + upcoming.length} active`}</span>
          </div>
          <div className="reminders-filters" role="group" aria-label="Filter reminders">
            {filters.map((filter) => (
              <button key={filter.id} type="button" aria-pressed={activeFilter === filter.id} className={activeFilter === filter.id ? 'is-active' : ''} onClick={() => setActiveFilter(filter.id)}>
                {filter.label}<span>{loading ? '—' : filter.count}</span>
              </button>
            ))}
          </div>
          {error ? (
            <div className="reminders-state"><p role="alert">{error}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button></div>
          ) : actionError ? <p className="reminders-action-error" role="alert">{actionError}</p> : null}
          {loading ? (
            <p className="reminders-state" role="status">Loading task reminders…</p>
          ) : !error && filteredTasks.length === 0 ? (
            <div className="reminders-empty"><span><FiCheckCircle aria-hidden="true" /></span><h3>{activeFilter === 'all' ? 'You’re all caught up' : 'No tasks in this view'}</h3><p>{activeFilter === 'all' ? 'There are no overdue or upcoming tasks right now.' : 'Try another filter or enjoy the extra breathing room.'}</p><Link to="/tasks">Open My Tasks <FiArrowRight aria-hidden="true" /></Link></div>
          ) : !error ? (
            <ul className="reminders-task-list">
              {filteredTasks.map((task) => {
                const overdueTask = task.dueDateKey < today
                const statusLabel = overdueTask ? 'Overdue' : task.dueDateKey === today ? 'Due today' : 'Upcoming'
                return (
                  <li className="reminders-task-card" key={task.id}>
                    <span className={`reminders-task-icon${overdueTask ? ' is-overdue' : task.dueDateKey === today ? ' is-today' : ''}`}>{overdueTask ? <FiAlertCircle aria-hidden="true" /> : <FiCalendar aria-hidden="true" />}</span>
                    <div className="reminders-task-copy"><div className="reminders-task-chips"><span className={`task-status-chip task-status-${overdueTask ? 'overdue' : task.dueDateKey === today ? 'today' : 'upcoming'}`}>{statusLabel}</span><span className={`task-priority-chip task-priority-${String(task.priority || 'medium').toLowerCase()}`}>{task.priority || 'Medium'} priority</span></div><h3>{task.title}</h3><p><FiClock aria-hidden="true" /> Due {formatDueDate(task.due_date)}</p></div>
                    <button className="reminders-complete-button" type="button" disabled={completingId === task.id} onClick={() => handleComplete(task)} aria-label={`Mark ${task.title} complete`}><FiCheck aria-hidden="true" /><span>{completingId === task.id ? 'Saving…' : 'Complete'}</span></button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default RemindersPage
