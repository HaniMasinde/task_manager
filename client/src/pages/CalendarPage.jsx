import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiCalendar, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi'
import { getTasks } from '../services/taskService.js'

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(date, options) {
  const stableDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12))
  return stableDate.toLocaleDateString('en-KE', { ...options, timeZone: 'Africa/Nairobi' })
}

function CalendarPage() {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today))
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadTasks() {
      setLoading(true)
      setError('')
      try {
        const data = await getTasks()
        if (active) setTasks(data)
      } catch (err) {
        if (active) setError(err.message || 'Unable to load your calendar.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTasks()
    return () => { active = false }
  }, [reloadKey])

  const tasksByDate = useMemo(() => tasks.reduce((groupedTasks, task) => {
    const dateKey = String(task.due_date || '').slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return groupedTasks
    groupedTasks[dateKey] ||= []
    groupedTasks[dateKey].push(task)
    return groupedTasks
  }, {}), [tasks])

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7
    const firstCell = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - mondayOffset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + index)
      return { date, key: toDateKey(date), inMonth: date.getMonth() === visibleMonth.getMonth() }
    })
  }, [visibleMonth])

  const selectedDay = new Date(`${selectedDate}T12:00:00`)
  const selectedTasks = tasksByDate[selectedDate] || []
  const scheduledTaskCount = Object.values(tasksByDate).reduce((count, dayTasks) => count + dayTasks.length, 0)
  const monthLabel = formatDate(visibleMonth, { month: 'long', year: 'numeric' })

  function changeMonth(offset) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(toDateKey(nextMonth))
  }

  function goToToday() {
    const now = new Date()
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(toDateKey(now))
  }

  return (
    <main className="calendar-page">
      <div className="calendar-shell">
        <header className="calendar-page-heading">
          <div className="calendar-page-icon"><FiCalendar aria-hidden="true" /></div>
          <div>
            <p className="calendar-eyebrow">YOUR SCHEDULE</p>
            <h1>Calendar</h1>
            <p className="calendar-intro">See your tasks and deadlines by day.</p>
          </div>
          <Link className="calendar-tasks-link" to="/tasks">All tasks <FiArrowUpRight aria-hidden="true" /></Link>
        </header>

        {error ? (
          <section className="calendar-state-card">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
          </section>
        ) : (
          <div className="calendar-layout">
            <section className="calendar-month-card" aria-label="Task calendar">
              <div className="calendar-month-toolbar">
                <div>
                  <h2>{monthLabel}</h2>
                  <p>{loading ? 'Loading scheduled tasks…' : `${scheduledTaskCount} scheduled ${scheduledTaskCount === 1 ? 'task' : 'tasks'}`}</p>
                </div>
                <div className="calendar-month-controls" aria-label="Change month">
                  <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month"><FiChevronLeft aria-hidden="true" /></button>
                  <button type="button" className="calendar-today-button" onClick={goToToday}>Today</button>
                  <button type="button" onClick={() => changeMonth(1)} aria-label="Next month"><FiChevronRight aria-hidden="true" /></button>
                </div>
              </div>

              <div className="calendar-weekdays" aria-hidden="true">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="calendar-days">
                {calendarDays.map(({ date, key, inMonth }) => {
                  const dayTasks = tasksByDate[key] || []
                  const isToday = key === toDateKey(today)
                  return (
                    <button
                      className={`calendar-day${inMonth ? '' : ' is-outside-month'}${key === selectedDate ? ' is-selected' : ''}${isToday ? ' is-today' : ''}${dayTasks.length ? ' has-tasks' : ''}`}
                      type="button"
                      key={key}
                      aria-pressed={key === selectedDate}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${dayTasks.length} ${dayTasks.length === 1 ? 'task' : 'tasks'}`}
                      onClick={() => {
                        setSelectedDate(key)
                        if (!inMonth) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                      }}
                    >
                      <span className="calendar-day-number">{date.getDate()}</span>
                      {dayTasks.length > 0 && <span className="calendar-day-count">{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>}
                      {dayTasks.length > 0 && <span className="calendar-day-dot" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </section>

            <aside className="calendar-agenda" aria-live="polite">
              <div className="calendar-agenda-heading">
                <span className="calendar-agenda-icon"><FiClock aria-hidden="true" /></span>
                <div>
                  <p>SELECTED DAY</p>
                  <h2>{formatDate(selectedDay, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                </div>
              </div>
              {loading ? (
                <p className="calendar-empty" role="status">Loading tasks…</p>
              ) : selectedTasks.length ? (
                <ul className="calendar-agenda-list">
                  {selectedTasks.map((task) => (
                    <li key={task.id} className={`calendar-agenda-item${task.status === 'completed' ? ' is-complete' : ''}`}>
                      <span className="calendar-agenda-marker" aria-hidden="true" />
                      <div>
                        <strong>{task.title}</strong>
                        <span className={`calendar-priority priority-${String(task.priority || 'medium').toLowerCase()}`}>{task.priority || 'Medium'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="calendar-empty">Nothing scheduled for this day.</p>
              )}
              <Link className="calendar-agenda-link" to="/tasks">Plan a task <FiArrowUpRight aria-hidden="true" /></Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

export default CalendarPage
