import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="container nav-inner">
        <Link to="/" className="logo" aria-label="Farley Construction & Development Inc." onClick={close}>
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 44 44">
              <path d="M5 34h7V19l10-7 10 7v15h7" />
              <path d="M14 34V21l8-5.5 8 5.5v13" />
              <path d="M18 24h8M18 28h8M18 32h8" />
              <path d="M6 17 22 6l16 11" />
            </svg>
          </span>
          <span className="logo-text">Farley Construction<br />&amp; Development Inc.</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className={`nav-list${open ? ' nav-list--open' : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
                About
              </NavLink>
            </li>
            <li>
              <a href="/#services" className="nav-link" onClick={close}>
                Services <span aria-hidden="true">▼</span>
              </a>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="nav-right">
          <Link to="/contact" className="btn btn-blue btn-sm" onClick={close}>Get Quote</Link>
          <button
            className={`hamburger${open ? ' hamburger--open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
