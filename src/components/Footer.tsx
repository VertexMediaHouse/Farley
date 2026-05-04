import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo" aria-label="Farley Construction & Development Inc.">
            <img src="/images/logo-1.png" alt="Farley Construction & Development Inc." className="logo-img" />
          </Link>
          <p className="footer-lead">
            Building strong. Finishing right. Delivering dependable construction, drywall, repair, and maintenance solutions.
          </p>
        </div>

        <nav className="footer-col" aria-label="Footer quick links">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><a href="/#services">Services</a></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </nav>

        <div className="footer-col">
          <h4>Services</h4>
          <ul className="footer-links">
            <li><a href="/#services">Drywall Installation</a></li>
            <li><a href="/#services">Drywall Repair</a></li>
            <li><a href="/#services">Drywall Painting &amp; Finishing</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Other Links</h4>
          <ul className="footer-links">
            <li><a href="#" rel="noopener noreferrer">Privacy Policy</a></li>
            <li>
              <a href="https://farleyconstruction.ca" target="_blank" rel="noopener noreferrer">
                Main Website
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col footer-contact">
          <h4>Contact Info</h4>
          <div className="footer-contact-rows">
            <div className="footer-contact-row">
              <span className="footer-contact-label">Phone</span>
              <a className="footer-contact-value" href="tel:+19054588960">(905) 458-8960</a>
            </div>
            <div className="footer-contact-row">
              <span className="footer-contact-label">Email</span>
              <a className="footer-contact-value" href="mailto:info@farleyconstruction.ca">info@farleyconstruction.ca</a>
            </div>
            <div className="footer-contact-row">
              <span className="footer-contact-label">Location</span>
              <span className="footer-contact-value">Brampton, ON, Canada</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <p>
            © {new Date().getFullYear()} Farley Construction &amp; Development Inc. All Rights Reserved.
          </p>
          <ul className="footer-legal">
            <span className="footer-credits">
              Developed by <a href="https://hetang-madhu.vercel.app/" target="_blank" rel="noopener noreferrer">Hetang Madhu</a> &amp; <a href="https://vertexmediahouse.com/" target="_blank" rel="noopener noreferrer">Dhrumil Sanghvi</a>
            </span>
          </ul>
        </div>
      </div>
    </footer>
  )
}
