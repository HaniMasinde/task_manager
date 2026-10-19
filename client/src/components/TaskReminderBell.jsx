import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertCircle, FiBell, FiCheckCircle, FiClock, FiX } from 'react-icons/fi'
import { useAuth } from '../context/useAuth.js'
import { getTasks } from '../services/taskService.js'

function getNairobiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function TaskReminderBell() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    let active = true
    async function loadReminders() {
      setLoading(true)
      try {
        const data = await getTasks()
        if (active) {
          setTasks(Array.isArray(data) ? data : [])
          setError('')
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not load reminders.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadReminders()
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!open) return undefined
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const reminders = useMemo(() => {
    const today = getNairobiDateKey()
    return tasks
      .filter((task) => task.status !== 'completed' && task.due_date)
      .map((task) => ({ ...task, dueDateKey: String(task.due_date).slice(0, 10) }))
      .filter((task) => task.dueDateKey <= today)
      .sort((first, second) => first.dueDateKey.localeCompare(second.dueDateKey))
  }, [tasks])

  return (
    <div className="task-reminder" ref={menuRef}>
      <button
        className="task-reminder-trigger"
        type="button"
        aria-label={reminders.length ? `${reminders.length} task reminders` : 'Task reminders'}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        <FiBell aria-hidden="true" />
        {reminders.length > 0 && <span className="task-reminder-count" aria-hidden="true">{reminders.length > 9 ? '9+' : reminders.length}</span>}
      </button>
      {open && (
        <section className="task-reminder-panel" aria-label="Task reminders">
          <header className="task-reminder-panel-heading">
            <div><span className="task-reminder-panel-icon"><FiBell aria-hidden="true" /></span><div><strong>Reminders</strong><small>Overdue and due today</small></div></div>
            <button type="button" className="task-reminder-close" aria-label="Close reminders" onClick={() => setOpen(false)}><FiX aria-hidden="true" /></button>
          </header>
          {loading ? (
            <p className="task-reminder-empty" role="status">Checking your tasks…</p>
          ) : error ? (
            <p className="task-reminder-empty" role="alert">{error}</p>
          ) : reminders.length ? (
            <ul className="task-reminder-list">
              {reminders.slice(0, 6).map((task) => {
                const overdue = task.dueDateKey < getNairobiDateKey()
                return (
                  <li key={task.id}>
                    <span className={`task-reminder-item-icon${overdue ? ' is-overdue' : ''}`}>{overdue ? <FiAlertCircle aria-hidden="true" /> : <FiClock aria-hidden="true" />}</span>
                    <Link to="/tasks" onClick={() => setOpen(false)}>
                      <strong>{task.title}</strong>
                      <small>{overdue ? 'Overdue' : 'Due today'} · {String(task.priority || 'medium').toLowerCase()} priority</small>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="task-reminder-empty"><FiCheckCircle aria-hidden="true" /> You’re all caught up. No tasks are overdue or due today.</p>
          )}
          <Link className="task-reminder-view-all" to="/reminders" onClick={() => setOpen(false)}>Open reminders <span aria-hidden="true">→</span></Link>
        </section>
      )}
    </div>
  )
}

export default TaskReminderBell
