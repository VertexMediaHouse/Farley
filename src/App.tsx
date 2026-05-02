import React, { useEffect, useRef } from 'react'

const stats = [
  {
    value: '25+',
    label: 'Years Experience',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.2 14.2 6l4.3.9-2.9 3.3.4 4.4-4-1.8-4 1.8.4-4.4-2.9-3.3 4.3-.9L12 2.2Z" />
        <path d="m8.4 14.3-1.3 5.5 3.5-1.7 1.4 3.7 1.4-3.7 3.5 1.7-1.3-5.5" />
      </svg>
    ),
  },
  {
    value: '1300+',
    label: 'Projects Completed',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5h4.2l2.3-3.6 2.8 6.7 2.1-3.1H21" />
        <path d="M4 4h5v5H4zM15 3h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z" />
      </svg>
    ),
  },
  {
    value: '350+',
    label: 'Outlets Served',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h16l-1.2-4H5.2L4 9Z" />
        <path d="M6 9v10h12V9M9 19v-6h6v6" />
        <path d="M3.2 9h17.6" />
      </svg>
    ),
  },
  {
    value: '4000+',
    label: 'Vendor Network',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="2.3" />
        <circle cx="5" cy="18" r="2.3" />
        <circle cx="19" cy="18" r="2.3" />
        <path d="M12 7.5v5.1M7 16.7l4.1-3.5M17 16.7l-4.1-3.5" />
      </svg>
    ),
  },
]

const services = [
  {
    img: '/images/img4.jpeg',
    title: 'Drywall Installation Services',
    copy: 'From drywall installation to facility maintenance, we provide reliable support for every stage of your project.',
  },
  {
    img: '/images/img5.jpeg',
    title: 'Drywall Repair Services',
    copy: 'From drywall installation to facility maintenance, we provide reliable support for every stage of your project.',
  },
  {
    img: '/images/img6.jpeg',
    title: 'Drywall Painting & Finishing Services',
    copy: 'From drywall installation to facility maintenance, we provide reliable support for every stage of your project.',
  },
]

const steps = [
  { n: '1', title: 'Consult', copy: 'We discuss your goals, needs, and project requirements.' },
  { n: '2', title: 'Estimate', copy: 'Detailed transparent estimate with no hidden costs.' },
  { n: '3', title: 'Planning', copy: 'We plan every detail to ensure smooth execution.' },
  { n: '4', title: 'Execution', copy: 'Skilled teams deliver top-quality work safely and efficiently.' },
  { n: '5', title: 'Completion', copy: 'Final walkthrough and complete satisfaction.' },
]

const benefits = [
  {
    title: 'Expert Craftsmanship',
    copy: 'Skilled teams focused on clean execution.',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m14.6 5.4 4 4M3 21l5.1-1.2L20.2 7.7a2.8 2.8 0 0 0-4-4L4.1 15.8 3 21Z" />
        <path d="m12.4 7.6 4 4M3 12h4M4 7l3 3M12 3v4" />
      </svg>
    ),
  },
  {
    title: 'Trusted & Reliable',
    copy: 'Clear timelines and dependable delivery.',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4 7v5.6c0 4.1 3.2 6.8 8 8.4 4.8-1.6 8-4.3 8-8.4V7l-8-4Z" />
        <path d="m8.2 12.1 2.5 2.5 5.1-5.1" />
      </svg>
    ),
  },
  {
    title: 'Safety First',
    copy: 'Safety-focused planning and site practices.',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4.5 6.4v5.2c0 4.6 3.1 7.9 7.5 9.4 4.4-1.5 7.5-4.8 7.5-9.4V6.4L12 3Z" />
        <path d="M12 8v4.2M12 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Client Focused',
    copy: 'Responsive support built around your needs.',
    svg: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="7" r="3" />
        <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M17.5 10.2v5.6M14.7 13h5.6" />
      </svg>
    ),
  },
]

const projects = [
  { img: '/images/img7.jpeg', tag: 'Retail', title: 'Retail Outlet Build-Out', location: 'Vaughan, ON' },
  { img: '/images/img8.jpeg', tag: 'Commercial', title: 'Commercial Office Drywall', location: 'Mississauga, ON' },
  { img: '/images/img9.jpeg', tag: 'Industrial', title: 'Industrial Facility Maintenance', location: 'Brampton, ON' },
  { img: '/images/img10.jpeg', tag: 'Painting', title: 'Interior Painting Project', location: 'Toronto, ON' },
]

const testimonials = [
  { name: 'Michael T.', role: 'Retail Developer', stars: 5, review: 'Farley Construction exceeded expectations. Their attention to detail were outstanding.' },
  { name: 'Sarah L.', role: 'Property Manager', stars: 5, review: 'Reliable, on time, and on budget. We have trusted Farley for multiple projects.' },
  { name: 'James R.', role: 'Contractor', stars: 5, review: 'Their drywall and finishing work is second to none. Highly recommend.' },
]

function useFadeIn() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.unobserve(el)
        }
      },
      { threshold: 0.12 },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return ref
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < n ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

function SectionLabel({ text, light }: { text: string; light?: boolean }) {
  return <p className={`sec-label${light ? ' sec-label--light' : ''}`}>{text}</p>
}

function FadeSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useFadeIn()
  return (
    <section id={id} ref={ref as React.RefObject<HTMLElement>} className={`fade-section ${className}`.trim()}>
      {children}
    </section>
  )
}

export default function App() {
  return (
    <div className="site">
      <header className="header">
        <div className="container nav-inner">
          <a href="#home" className="logo" aria-label="Farley Construction & Development Inc.">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 44 44">
                <path d="M5 34h7V19l10-7 10 7v15h7" />
                <path d="M14 34V21l8-5.5 8 5.5v13" />
                <path d="M18 24h8M18 28h8M18 32h8" />
                <path d="M6 17 22 6l16 11" />
              </svg>
            </span>
            <span className="logo-text">Farley Construction<br />&amp; Development Inc.</span>
          </a>
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              <li><a href="#home" className="nav-link active">Home</a></li>
              <li><a href="#about" className="nav-link">About</a></li>
              <li><a href="#services" className="nav-link">Services <span aria-hidden="true">v</span></a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
          </nav>
          <a href="#contact" className="btn btn-blue btn-sm">Get Quote</a>
        </div>
      </header>

      <section id="home" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy fade-in-up">
            <h1>Drywall Repairs<br />&amp; Finishing</h1>
            <p className="hero-sub">
              Premium drywall, repair, finishing, painting, construction support, and facility
              maintenance solutions delivered with precision, safety, and integrity.
            </p>
            <div className="btn-row">
              <a href="#contact" className="btn btn-orange">Get a Free Quote <span aria-hidden="true">-&gt;</span></a>
              <a href="#services" className="btn btn-glass">Explore Services <span aria-hidden="true">-&gt;</span></a>
            </div>
            <div className="hero-avatars">
              <img src="/images/img3.jpeg" alt="Customer review avatars" className="review-img" />
              <div className="hero-trust">
                <span className="trust-top"><span aria-hidden="true">★</span> 5 Verified</span>
                <span className="trust-bot">Google Reviews</span>
              </div>
            </div>
          </div>
          <div className="hero-img-wrap fade-in-right">
            <img src="/images/img1.jpeg" alt="Drywall workers finishing a ceiling" className="hero-img" />
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Company statistics">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.svg}</span>
              <div className="stat-text">
                <strong className="stat-val">{s.value}</strong>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FadeSection id="about" className="section">
        <div className="container two-col">
          <div className="about-img-wrap">
            <img src="/images/img2.jpeg" alt="Farley construction team on site" className="about-img" />
            <div className="integrity-badge">
              <strong>Built on Integrity</strong>
              <span>25+ Years Serving Ontario</span>
            </div>
          </div>
          <div className="about-copy">
            <SectionLabel text="About Farley Construction" />
            <h2>Building Spaces,<br />Strengthening Communities.</h2>
            <p className="body-text">
              With over 25 years of experience, Farley Construction &amp; Development Inc.
              delivers dependable craftsmanship and reliable service across commercial,
              retail, and industrial projects.
            </p>
            <div className="chip-row">
              <span className="chip">Licensed &amp; Insured</span>
              <span className="chip">Safety Focused</span>
              <span className="chip">Customer Driven</span>
            </div>
            <a href="#contact" className="btn btn-orange">Learn More About Us <span aria-hidden="true">-&gt;</span></a>
          </div>
        </div>
      </FadeSection>

      <FadeSection id="services" className="section bg-light">
        <div className="container">
          <SectionLabel text="Our Services" />
          <h2 className="center-text">Complete Solutions. Superior Results.</h2>
          <p className="section-sub center-text">
            From drywall installation to facility maintenance, we provide reliable support for every stage of your project.
          </p>
          <div className="cards-3">
            {services.map((s) => (
              <article key={s.title} className="service-card card-hover">
                <div className="card-img-wrap">
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="card-body">
                  <h3>{s.title}</h3>
                  <p className="body-text">{s.copy}</p>
                  <a href="#contact" className="btn btn-orange btn-sm">Get a Quote <span aria-hidden="true">-&gt;</span></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section process-section">
        <div className="container">
          <SectionLabel text="Our Process" />
          <h2 className="center-text">A Clear Process. Proven Results.</h2>
          <div className="process-row">
            {steps.map((s, i) => (
              <div key={s.n} className="process-step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p className="body-text">{s.copy}</p>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section why-section">
        <div className="container two-col">
          <div className="why-copy">
            <SectionLabel text="Why Choose Us" />
            <h2>Experience.<br />Reliability.<br />Results.</h2>
            <p className="body-text">
            We combine skilled craftsmanship, clear communication, and dependable project execution to deliver work clients can trust.
            </p>
            <a href="#contact" className="btn btn-orange">Discuss Your Project <span aria-hidden="true">-&gt;</span></a>
          </div>
          <div className="benefit-grid">
            {benefits.map((b) => (
              <article key={b.title} className="benefit-card card-hover">
                <span className="benefit-icon">{b.svg}</span>
                <h3>{b.title}</h3>
                <p>{b.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection id="projects" className="section project-section">
        <div className="container">
          <SectionLabel text="Featured Projects" />
          <h2>Quality Work. Real Results.</h2>
          <div className="cards-4">
            {projects.map((p) => (
              <article key={p.title} className="project-card card-hover">
                <div className="project-img-wrap">
                  <img src={p.img} alt={p.title} />
                  <div className="project-overlay">
                    <span className="proj-tag">{p.tag}</span>
                    <h3>{p.title}</h3>
                    <p className="proj-loc">{p.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section testimonials-section">
        <div className="container">
          <SectionLabel text="What Our Clients Say" />
          <h2 className="center-text">Trusted by Clients Who Value Quality</h2>
          <div className="cards-3">
            {testimonials.map((t) => (
              <article key={t.name} className="testi-card card-hover">
                <Stars n={t.stars} />
                <p className="testi-review">{t.review}</p>
                <div className="testi-footer">
                  <strong>{t.name}</strong>
                  <span className="body-text">{t.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>Ready to Start Your Project?</h2>
              <p className="body-text">
                Let us build something great together with a team focused on precision, safety, and quality.
              </p>
            </div>
            <a href="#contact" className="btn btn-orange btn-lg">Get Your Free Quote <span aria-hidden="true">-&gt;</span></a>
          </div>
        </div>
      </FadeSection>

      <FadeSection id="contact" className="section contact-section">
        <div className="container two-col contact-col">
          <div className="contact-info">
            <SectionLabel text="Get In Touch" />
            <h2>Let's Talk About<br />Your Project</h2>
            <p className="body-text">Tell us what you need and our team will get back to you with next steps.</p>
            <ul className="contact-list">
              <li>
                <span className="ci-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" /></svg></span>
                <div><strong>Phone</strong><span>(905) 458-8960</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="m4 7 8 6 8-6" /></svg></span>
                <div><strong>Email</strong><span>info at farleyconstruction dot ca</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
                <div><strong>Location</strong><span>Brampton, Ontario, Canada</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
                <div><strong>Hours</strong><span>Mon - Fri: 7 AM - 5 PM</span></div>
              </li>
            </ul>
          </div>
          <form className="quote-form" onSubmit={(e) => e.preventDefault()}>
            <h3 className="form-title">Request a Quote</h3>
            <div className="form-grid">
              <label>Full Name<input type="text" placeholder="Your full name" /></label>
              <label>Company Name<input type="text" placeholder="Company or organization" /></label>
              <label>Email Address<input type="email" placeholder="your@email.com" /></label>
              <label>Phone Number<input type="tel" placeholder="Phone number" /></label>
              <label>Project Type<input type="text" placeholder="Select project type" /></label>
              <label>Budget Range<input type="text" placeholder="Select budget range" /></label>
            </div>
            <label className="msg-label">
              Message
              <textarea rows={4} placeholder="Tell us about your project" />
            </label>
            <button type="submit" className="btn btn-blue full-btn">Submit Request <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>→</span></button>
          </form>
        </div>
      </FadeSection>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <a href="#home" className="logo footer-logo" aria-label="Farley Construction & Development Inc.">
              <span className="logo-mark" aria-hidden="true">
                <svg viewBox="0 0 44 44">
                  <path d="M5 34h7V19l10-7 10 7v15h7" />
                  <path d="M14 34V21l8-5.5 8 5.5v13" />
                  <path d="M18 24h8M18 28h8M18 32h8" />
                  <path d="M6 17 22 6l16 11" />
                </svg>
              </span>
              <span className="logo-text">Farley Construction<br />&amp; Development Inc.</span>
            </a>
            <p className="footer-lead">
            Building strong. Finishing right. Delivering dependable construction, drywall, repair, and maintenance solutions.
            </p>
          </div>

          <nav className="footer-col" aria-label="Footer quick links">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              {/* <li><a href="#projects">Projects</a></li> */}
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </nav>

          <div className="footer-col footer-col--stacked">
            <div className="footer-sub">
              <h4>Services</h4>
              <ul className="footer-links">
                <li><a href="#services">Drywall Installation</a></li>
                <li><a href="#services">Drywall Repair</a></li>
                <li><a href="#services">Drywall Painting &amp; Finishing</a></li>
              </ul>
            </div>
            <div className="footer-sub">
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
              <div className="footer-contact-row">
                <span className="footer-contact-label">Hours</span>
                <span className="footer-contact-value">Mon – Fri: 7 AM – 5 PM</span>
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
              <li><a href="#" rel="noopener noreferrer">Privacy</a></li>
              <li><a href="#" rel="noopener noreferrer">Terms</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
