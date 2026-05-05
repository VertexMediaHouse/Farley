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
    <header className={`header${open ? ' header--menu-open' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="logo" aria-label="Farley Construction & Development Inc." onClick={close}>
          <img src="/images/logo.png" alt="Farley Construction & Development Inc." className="logo-img" />
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
              <NavLink to="/services" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
                Services
              </NavLink>
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
