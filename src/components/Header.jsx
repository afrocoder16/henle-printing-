import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import Logo from './Logo'
import { servicePages, serviceOrder } from '../serviceData'
import { tools } from '../toolsData'

const nav = [
  ['About', '/about'],
  ['Services', '/services', serviceOrder.map((slug) => [servicePages[slug].title, servicePages[slug].path])],
  ['Tools', '/tools', tools.map((tool) => [tool.title, tool.path])],
  ['Portfolio', '/portfolio'],
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
          {nav.map(([label, path, children]) => (
            <div key={path} className={children ? 'nav-group' : 'nav-item'}>
              <NavLink to={path} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
              {children && (
                <div className="nav-sub" aria-label={`${label} pages`}>
                  {children.map(([childLabel, childPath]) => (
                    <NavLink key={childPath} to={childPath} className={({ isActive }) => (isActive ? 'active' : '')}>{childLabel}</NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="button button--small" to="/quote">
            Get a quote <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
