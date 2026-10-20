import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from 'react-icons/fa'
import { FiMessageCircle, FiPhone } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61592740528794', icon: FaFacebookF },
  { label: 'WhatsApp', href: 'https://wa.me/254102678336', icon: FaWhatsapp },
  { label: 'Instagram', href: 'https://www.instagram.com/haningtone_caroline/', icon: FaInstagram },
  { label: 'Tiktok', href: 'https://tiktok.com/@wuod_atieno01', icon: FaTiktok },
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
            <div className="footer-connect-groups">
              <div className="footer-link-group">
                <h3>Follow</h3>
                <nav className="footer-socials" aria-label="Social media">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      className={`footer-social-link footer-social-${label.toLowerCase()}`}
                      href={href}
                      aria-label={label}
                      title={label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon aria-hidden="true" />
                    </a>
                  ))}
                </nav>
              </div>
              <div className="footer-link-group">
                <h3>Contact</h3>
                <nav className="footer-contact-links" aria-label="Contact Wuod Atieno">
                  <a className="footer-contact-link footer-social-phone" href="tel:0113745958" aria-label="Call Wuod Atieno at 0113745958">
                    <FiPhone aria-hidden="true" /><span>Call</span>
                  </a>
                  <a className="footer-contact-link footer-social-message" href="sms:0794358892" aria-label="Send an SMS to Wuod Atieno at 0794358892">
                    <FiMessageCircle aria-hidden="true" /><span>Message</span>
                  </a>
                </nav>
              </div>
            </div>
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
