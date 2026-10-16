
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiClock, FiList, FiTrendingUp } from 'react-icons/fi';
import { getDashboard } from '../services/dashboardService';

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
          <div>
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}
          </div>
          <div className="dashboard-task-meta">
            <span>{task.priority}</span>
            <time dateTime={String(task.due_date || '').slice(0, 10)}>
              Due {formatDueDate(task.due_date)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DashboardPage({ theme, onToggleTheme }) {
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
      <main className="dashboard-page">
        <p role="status">Loading your dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Dashboard</h1>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  const stats = dashboard.stats;

  const statisticCards = [
    { label: 'Total tasks', value: stats.total_tasks, icon: <FiList aria-hidden="true" /> },
    { label: 'Completed', value: stats.completed_tasks, icon: <FiCheckCircle aria-hidden="true" /> },
    { label: 'Pending', value: stats.pending_tasks, icon: <FiClock aria-hidden="true" /> },
    { label: 'Overdue', value: stats.overdue_tasks, icon: <FiAlertCircle aria-hidden="true" /> },
    { label: 'Due today', value: stats.due_today, icon: <FiCalendar aria-hidden="true" /> },
    { label: 'Completion rate', value: `${stats.completion_rate}%`, icon: <FiTrendingUp aria-hidden="true" />, progress: stats.completion_rate },
  ];
  const todayLabel = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Nairobi',
  });

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">DAILY TASK MANAGER</p>
          <h1>Your Dashboard</h1>
          <p className="dashboard-description">Review your progress and focus on what needs attention.</p>
          <span className="dashboard-date"><FiCalendar aria-hidden="true" /> {todayLabel}</span>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
        </button>
      </header>

      <section className="dashboard-stat-grid" aria-label="Task statistics">
        {statisticCards.map((stat) => (
          <article className="dashboard-stat-card" key={stat.label}>
            <div className="dashboard-stat-label"><p>{stat.label}</p><span className="dashboard-stat-icon">{stat.icon}</span></div>
            <strong>{stat.value}</strong>
            {stat.progress !== undefined && <div className="dashboard-progress" role="progressbar" aria-label="Task completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stat.progress}><span style={{ width: `${stat.progress}%` }} /></div>}
          </article>
        ))}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Due today</h2>
            <p>Tasks that need your attention today.</p>
          </div>
          <span className="dashboard-count">
            {dashboard.dueToday.length}
          </span>
        </div>

        <TaskList
          tasks={dashboard.dueToday}
          emptyMessage="You have no pending tasks due today."
        />
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Upcoming tasks</h2>
            <p>Your next five pending tasks.</p>
          </div>
          <span className="dashboard-count">
            {dashboard.upcoming.length}
          </span>
        </div>

        <TaskList
          tasks={dashboard.upcoming}
          emptyMessage="No upcoming tasks. You're all caught up."
        />
      </section>

      <footer className="dashboard-actions">
        <Link to="/tasks" className="dashboard-primary-link">
          Manage all tasks
        </Link>
        <Link to="/account" className="dashboard-secondary-link">
          Account settings
        </Link>
      </footer>
    </main>
  );
}

export default DashboardPage;
