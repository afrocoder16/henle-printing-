import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import Logo from './Logo'

const nav = [
  ['About', '/#about'],
  ['Services', '/services'],
  ['Portfolio', '/portfolio'],
  ['Mailing', '/mailing'],
  ['Contact', '/contact'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    if (location.hash) {
      window.requestAnimationFrame(() => {
        document.getElementById(location.hash.slice(1))?.scrollIntoView()
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.hash])

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Logo />
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav id="main-nav" className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => (isActive && (path !== '/#about' || location.hash === '#about') ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
          <Link className="button button--small" to="/quote">
            Get a quote <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
