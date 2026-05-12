import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo" aria-label="Farley Construction & Development Inc.">
            <img src="/images/logo1.png" alt="Farley Construction & Development Inc." className="logo-img" />
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
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </nav>

        <div className="footer-col footer-col--services">
          <h4>Services</h4>
          <ul className="footer-links footer-links--services">
            <li><Link to="/services">Drywall Repair</Link></li>
            <li><Link to="/services">Drywall Installation &amp; Finishing</Link></li>
            <li><Link to="/services">Ceiling Repair &amp; Texture Matching</Link></li>
            <li><Link to="/services">Patchwork &amp; Small Repairs</Link></li>
            <li><Link to="/services">Interior Painting &amp; Surface Prep</Link></li>
            <li><Link to="/services">Residential &amp; Commercial Maintenance</Link></li>
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
              Developed by  <a href="https://vertexmediahouse.com/" target="_blank" rel="noopener noreferrer">Vertexmediahouse</a>
            </span>
          </ul>
        </div>
      </div>
    </footer>
  )
}
