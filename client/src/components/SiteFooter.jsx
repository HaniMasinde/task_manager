import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa'
import { FiMessageCircle, FiPhone } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: FaFacebookF },
  { label: 'WhatsApp', href: 'https://wa.me/254102678336', icon: FaWhatsapp },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: FaInstagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: FaLinkedinIn },
  { label: 'GitHub', href: 'https://github.com/', icon: FaGithub },
]

function SiteFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link className="footer-brand" to="/" aria-label="Wuod Atieno home">
              <span className="brand-mark" aria-hidden="true">W</span>
              <span>Wuod Atieno</span>
            </Link>
            <p>Make a plan that feels manageable. Keep moving, one task at a time.</p>
          </div>
          <div className="footer-connect">
            <h2>Stay connected</h2>
            <nav className="footer-socials" aria-label="Social media and contact">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  className={`footer-social-link footer-social-${label.toLowerCase()}`}
                  href={href}
                  aria-label={label}
                  title={label}
                  data-tooltip={label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
              <a className="footer-social-link footer-social-phone" href="tel:0113745958" aria-label="Call" title="Call" data-tooltip="Call">
                <FiPhone aria-hidden="true" />
              </a>
              <a className="footer-social-link footer-social-message" href="sms:0794358892" aria-label="Message" title="Message" data-tooltip="Message">
                <FiMessageCircle aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Wuod Atieno. Keep making progress.</span>
          <nav aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
