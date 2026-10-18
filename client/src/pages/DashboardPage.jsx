
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowUpRight, FiBarChart2, FiCalendar, FiCheckCircle, FiClock, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { getDashboard } from '../services/dashboardService';
import { useAuth } from '../context/useAuth.js';

function formatDueDate(value) {
  const dateOnly = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value || '').slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return 'Date unavailable';

  const date = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}

function TaskList({ tasks, emptyMessage }) {
  if (tasks.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="dashboard-task-list">
      {tasks.map((task) => (
        <li key={task.id} className="dashboard-task-item">
          <span className="dashboard-task-marker" aria-hidden="true"><FiCheckCircle /></span>
          <div className="dashboard-task-copy">
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}
          </div>
          <div className="dashboard-task-meta">
            <span className={`dashboard-priority priority-${String(task.priority || 'medium').toLowerCase()}`}>{task.priority || 'Medium'}</span>
            <time dateTime={String(task.due_date || '').slice(0, 10)}>{formatDueDate(task.due_date)}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DashboardPage({ theme, onToggleTheme, embedded = false }) {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getDashboard();

        if (active) {
          setDashboard(data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className={`dashboard-page${embedded ? ' dashboard-page-embedded' : ''}`}>
        <div className="dashboard-frame"><div className="dashboard-canvas dashboard-state-panel"><p role="status">Loading your dashboard...</p></div></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`dashboard-page${embedded ? ' dashboard-page-embedded' : ''}`}>
        <div className="dashboard-frame"><div className="dashboard-canvas dashboard-state-panel">
          <h1>Dashboard</h1>
          <p role="alert">{error}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </div></div>
      </main>
    );
  }

  const stats = dashboard.stats;

  const statisticCards = [
    { label: 'Total tasks', value: stats.total_tasks, detail: 'All your tasks', icon: <FiBarChart2 aria-hidden="true" />, tone: 'blue' },
    { label: 'Completed', value: stats.completed_tasks, detail: 'Finished tasks', icon: <FiCheckCircle aria-hidden="true" />, tone: 'coral' },
    { label: 'Pending', value: stats.pending_tasks, detail: 'Still in progress', icon: <FiClock aria-hidden="true" />, tone: 'lavender' },
    { label: 'Overdue', value: stats.overdue_tasks, detail: 'Need your attention', icon: <FiAlertCircle aria-hidden="true" />, tone: 'rose' },
  ];
  const todayLabel = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Nairobi',
  });
  const firstName = user?.name?.trim().split(/\s+/)[0] || user?.username || 'there';
  const currentHour = Number(new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Africa/Nairobi',
  }).format(new Date()));
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <main className={`dashboard-page${embedded ? ' dashboard-page-embedded' : ''}`}>
      <div className="dashboard-frame">
        <div className="dashboard-canvas">
          <header className="dashboard-header dashboard-header-hero">
            <div className="dashboard-welcome">
              <p className="dashboard-eyebrow"><FiCalendar aria-hidden="true" /> <span>{todayLabel}</span></p>
              <h1>{greeting}, {firstName}!</h1>
              <p className="dashboard-description">Here’s your day at a glance. Keep your priorities moving.</p>
            </div>
            <div className="dashboard-header-side">
              <div className="dashboard-user-actions">
                <button
                  type="button"
                  className="theme-toggle"
                  onClick={onToggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                >
                  {theme === 'dark'
                    ? <><FiSun aria-hidden="true" /><span>Light</span></>
                    : <><FiMoon aria-hidden="true" /><span>Dark</span></>}
                </button>
                <div className="dashboard-profile">
                  {user?.profile_picture
                    ? <img src={user.profile_picture} alt="" />
                    : <FiUser aria-hidden="true" />}
                  <span>{user?.name || user?.username || 'My account'}</span>
                </div>
              </div>
              <div className="dashboard-header-progress">
                <div
                  className="dashboard-header-progress-ring"
                  role="img"
                  aria-label={`${stats.completion_rate}% of tasks completed`}
                  style={{ '--completion-rate': `${stats.completion_rate}%` }}
                >
                  <span>{stats.completion_rate}%</span>
                </div>
                <div className="dashboard-header-progress-copy">
                  <strong>Your progress</strong>
                  <span>{stats.completed_tasks} of {stats.total_tasks} tasks complete</span>
                </div>
                <Link className="dashboard-header-link" to="/tasks" aria-label="Go to all tasks">
                  <FiArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </header>

          <div className="dashboard-main-grid">
            <div className="dashboard-primary-column">
              <section className="dashboard-section dashboard-overview" aria-labelledby="dashboard-overview-title">
                <div className="dashboard-section-header">
                  <div>
                    <h2 id="dashboard-overview-title">My Tasks</h2>
                    <p>Your workload, organized at a glance.</p>
                  </div>
                  <Link className="dashboard-view-all" to="/tasks">View all <FiArrowUpRight aria-hidden="true" /></Link>
                </div>
                <div className="dashboard-stat-grid" aria-label="Task statistics">
                  {statisticCards.map((stat) => (
                    <article className={`dashboard-stat-card tone-${stat.tone}`} key={stat.label}>
                      <span className="dashboard-stat-icon">{stat.icon}</span>
                      <h3>{stat.label}</h3>
                      <strong>{stat.value}</strong>
                      <p>{stat.detail}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="dashboard-section dashboard-progress-section" aria-labelledby="dashboard-progress-title">
                <div className="dashboard-section-header">
                  <div>
                    <h2 id="dashboard-progress-title">Task Progress</h2>
                    <p>Every completed task moves you forward.</p>
                  </div>
                  <span className="dashboard-progress-rate">{stats.completion_rate}%</span>
                </div>
                <div className="dashboard-progress-track" role="progressbar" aria-label="Overall task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stats.completion_rate}>
                  <span style={{ width: `${stats.completion_rate}%` }} />
                </div>
                <div className="dashboard-progress-caption">
                  <span>{stats.completed_tasks} of {stats.total_tasks} tasks completed</span>
                  <span>{stats.pending_tasks} remaining</span>
                </div>
                <Link to="/tasks" className="dashboard-progress-link">Continue working <FiArrowUpRight aria-hidden="true" /></Link>
              </section>
            </div>

            <aside className="dashboard-task-column" aria-label="Tasks that need attention">
              <section className="dashboard-section dashboard-task-panel">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Due today</h2>
                    <p>Make time for these today.</p>
                  </div>
                  <span className="dashboard-count">{dashboard.dueToday.length}</span>
                </div>
                <TaskList tasks={dashboard.dueToday} emptyMessage="You have no pending tasks due today." />
              </section>

              <section className="dashboard-section dashboard-task-panel">
                <div className="dashboard-section-header">
                  <div>
                    <h2>Upcoming tasks</h2>
                    <p>Your next five pending tasks.</p>
                  </div>
                  <span className="dashboard-count">{dashboard.upcoming.length}</span>
                </div>
                <TaskList tasks={dashboard.upcoming} emptyMessage="No upcoming tasks. You're all caught up." />
              </section>
            </aside>
          </div>

          <footer className="dashboard-actions">
            <Link to="/tasks" className="dashboard-primary-link">Manage all tasks</Link>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
