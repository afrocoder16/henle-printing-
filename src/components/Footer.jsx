import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-cta shell">
        <div>
          <span className="eyebrow eyebrow--light">Put it on paper</span>
          <h2>Have something worth printing?</h2>
        </div>
        <Link to="/quote" className="button button--paper">
          Start a project <ArrowUpRight />
        </Link>
      </div>
      <div className="footer-grid shell">
        <div className="footer-brand">
          <Logo footer />
          <p>Southwest Minnesota’s printer of choice since 1980.</p>
        </div>
        <div>
          <h3>Visit</h3>
          <a href="https://maps.google.com/?q=703+Ontario+Rd+Marshall+MN+56258" target="_blank" rel="noreferrer">
            703 Ontario Rd<br />Marshall, MN 56258
          </a>
        </div>
        <div>
          <h3>Talk to us</h3>
          <a href="tel:+15075324493">507-532-4493</a>
          <a href="mailto:info@henleprinting.com">info@henleprinting.com</a>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/services">Services</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/mailing">Mailing</Link>
        </div>
      </div>
      <div className="footer-bottom shell">
        <span>© {new Date().getFullYear()} Henle Printing Company</span>
        <span>Family & locally owned · Marshall, Minnesota</span>
      </div>
    </footer>
  )
}
