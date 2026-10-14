

import { Link } from 'react-router-dom'
import {
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiFlag,
  FiList,
  FiMoon,
  FiSearch,
  FiSun,
  FiTrendingUp,
} from 'react-icons/fi'

function HomePage({ theme, onToggleTheme }) {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand" aria-label="Wuod Atieno">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>Wuod Atieno</span>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </header>

      <main className="main-content home-content">
        <section className="welcome-section">
          <div className="welcome-copy">
            <p className="eyebrow">YOUR DAY, ORGANIZED</p>
            <h1>Make room for what matters.</h1>
            <p className="welcome-description">
              Plan your day, focus on your priorities, and see your progress
              one task at a time.
            </p>
            <div className="welcome-actions">
              <Link className="primary-button" to="/register">Get started</Link>
              <Link className="secondary-button" to="/login">I already have an account</Link>
            </div>
          </div>

          <div className="hero-preview" role="group" aria-label="Task list preview">
            <div className="preview-heading">
              <span className="preview-icon"><FiCheckSquare aria-hidden="true" /></span>
              <div>
                <strong>Today’s focus</strong>
                <span>Small steps add up</span>
              </div>
              <span className="preview-count">3 / 5</span>
            </div>
            <div className="preview-progress"><span /></div>
            <div className="preview-task is-complete"><span className="preview-check">✓</span><span>Plan the week</span></div>
            <div className="preview-task is-complete"><span className="preview-check">✓</span><span>Review priorities</span></div>
            <div className="preview-task"><span className="preview-check" /><span>Finish the important work</span></div>
          </div>
        </section>

        <section className="features-section">
          <h2>Everything in one place</h2>

          <div className="features-grid">
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
              <span className="feature-icon"><FiTrendingUp aria-hidden="true" /></span>
              <h3>Track progress</h3>
              <p>Keep track of your work as you complete your tasks.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiCalendar aria-hidden="true" /></span>
              <h3>Stay ahead of deadlines</h3>
              <p>Add due dates so upcoming work stays on your radar.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiSearch aria-hidden="true" /></span>
              <h3>Find tasks quickly</h3>
              <p>Search your tasks and filter them by status or priority.</p>
            </article>

            <article className="feature-card">
              <span className="feature-icon"><FiCheckCircle aria-hidden="true" /></span>
              <h3>Keep tasks up to date</h3>
              <p>Edit details, mark work complete, or remove tasks you no longer need.</p>
            </article>
          </div>
        </section>
      </main>

    </div>
  )
}

export default HomePage
