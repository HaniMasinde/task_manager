import { Link } from 'react-router-dom'
import {
  FiArrowLeft, FiArrowRight, FiBell, FiCalendar, FiCheckSquare,
  FiClock, FiCompass, FiFlag, FiLayers, FiShield, FiTarget,
} from 'react-icons/fi'

const steps = [
  { number: '01', title: 'Capture the task', description: 'Add a clear title, choose a priority, and set a due date when timing matters.', icon: FiCheckSquare },
  { number: '02', title: 'Plan your day', description: 'Use the dashboard, calendar, and reminders to see what needs attention next.', icon: FiCalendar },
  { number: '03', title: 'Make steady progress', description: 'Pick one task, set a daily intention, and use a focus session to get started.', icon: FiTarget },
]

const features = [
  { title: 'Tasks & priorities', description: 'Create tasks, set due dates, choose a priority, and mark work complete.', icon: FiCheckSquare, to: '/tasks', action: 'Open tasks' },
  { title: 'Calendar planning', description: 'Review dated tasks by month and open a day to see its agenda.', icon: FiCalendar, to: '/calendar', action: 'Open calendar' },
  { title: 'Reminders', description: 'Keep overdue, due today, and upcoming tasks visible in one place.', icon: FiBell, to: '/reminders', action: 'View reminders' },
  { title: 'Focus tools', description: 'Use the 25-minute focus and 5-minute break timer, plus a daily intention.', icon: FiClock, to: '/#focus-title', action: 'Start focusing' },
  { title: 'Dashboard & progress', description: 'See task totals, completion progress, and upcoming work at a glance.', icon: FiLayers, to: '/dashboard', action: 'Open dashboard' },
  { title: 'Account & security', description: 'Update your name, email, profile picture, or password in account settings.', icon: FiShield, to: '/account', action: 'Manage account' },
]

function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-shell">
        <Link className="about-back-link" to="/"><FiArrowLeft aria-hidden="true" /> Back to workspace</Link>

        <header className="about-hero">
          <div className="about-hero-copy">
            <span className="about-kicker"><FiCompass aria-hidden="true" /> YOUR WORKSPACE GUIDE</span>
            <h1>Make room for what matters.</h1>
            <p>A simple guide to planning tasks, staying on track, and building a little momentum each day.</p>
            <Link className="about-hero-cta" to="/tasks">Add your first task <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="about-hero-art" aria-hidden="true"><span><FiFlag /></span><i /><b /><em /></div>
        </header>

        <section className="about-section" aria-labelledby="about-start-heading">
          <div className="about-section-heading"><div><p className="about-eyebrow">A SIMPLE ROUTINE</p><h2 id="about-start-heading">Get started in three steps</h2></div><p>Keep it light. You can adjust your plan as the day changes.</p></div>
          <div className="about-steps">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <article className="about-step-card" key={number}>
                <div className="about-step-top"><span>{number}</span><Icon aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-features-heading">
          <div className="about-section-heading"><div><p className="about-eyebrow">TOOLS FOR YOUR DAY</p><h2 id="about-features-heading">What you can do here</h2></div><p>Jump straight to any part of your workspace.</p></div>
          <div className="about-feature-grid">
            {features.map(({ title, description, icon: Icon, to, action }) => (
              <article className="about-feature-card" key={title}>
                <span className="about-feature-icon"><Icon aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{description}</p><Link to={to}>{action}<FiArrowRight aria-hidden="true" /></Link></div>
              </article>
            ))}
          </div>
        </section>

        <aside className="about-tip" aria-label="Planning tip"><span><FiFlag aria-hidden="true" /></span><div><strong>A helpful way to prioritize</strong><p>Choose one important task to move forward today. A short, clear list is easier to act on than a perfect plan.</p></div></aside>
      </div>
    </main>
  )
}

export default AboutPage
