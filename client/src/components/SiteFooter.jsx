import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa'
import { FiMessageCircle, FiPhone } from 'react-icons/fi'

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
      <p className="footer-credit">
        Developed and designed by :: <strong>Haningtone Omondi</strong>
      </p>
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
    </footer>
  )
}

export default SiteFooter
