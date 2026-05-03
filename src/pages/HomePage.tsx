import React from 'react'
import { Counter, FadeSection, SectionLabel, StaggerRow } from '../utils'
import { stats, testimonials } from '../data'

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
    svg: <img src="/images/carpentry.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Trusted & Reliable',
    copy: 'Clear timelines and dependable delivery.',
    svg: <img src="/images/trustworthiness (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Safety First',
    copy: 'Safety-focused planning and site practices.',
    svg: <img src="/images/shield (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Client Focused',
    copy: 'Responsive support built around your needs.',
    svg: <img src="/images/user-avatar.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,

  },
]

const projects = [
  { img: '/images/img7.jpeg', tag: 'Retail', title: 'Retail Outlet Build-Out', location: 'Vaughan, ON' },
  { img: '/images/img8.jpeg', tag: 'Commercial', title: 'Commercial Office Drywall', location: 'Mississauga, ON' },
  { img: '/images/img9.jpeg', tag: 'Industrial', title: 'Industrial Facility Maintenance', location: 'Brampton, ON' },
  { img: '/images/img10.jpeg', tag: 'Painting', title: 'Interior Painting Project', location: 'Toronto, ON' },
]

export default function HomePage() {
  return (
    <>
      <section id="home" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy fade-in-up">
            <h1>
              <span className="hero-title-line">Drywall Repairs</span>
              <span className="hero-title-line">&amp; Finishing</span>
            </h1>
            <p className="hero-sub">
              Premium drywall, repair, finishing, painting, construction support, and facility
              maintenance solutions delivered with precision, safety, and integrity.
            </p>
            <div className="btn-row">
              <a href="#contact" className="btn btn-orange">Get a Free Quote <span aria-hidden="true">-&gt;</span></a>
              <a href="#services" className="btn btn-glass">Explore Services <span aria-hidden="true">-&gt;</span></a>
            </div>
            <div className="hero-avatars">
              <img src="/images/image3.png" alt="Customer review avatars" className="review-img" />
              <div className="hero-trust">
                <span className="trust-top"> 5 <span aria-hidden="true">★</span> Verified</span>
                <span className="trust-bot">Google Reviews</span>
              </div>
            </div>
          </div>
          <div className="hero-img-wrap fade-in-right hero-img-float">
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
                <strong className="stat-val"><Counter value={s.value} /></strong>
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
              <strong>Built on Integrity.</strong>
              <span>Focused on Excellence.</span>
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
            <div className="chip-row stagger-chips">
              <span className="chip">Licensed &amp; Insured</span>
              <span className="chip">Safety Focused</span>
              <span className="chip">Customer Driven</span>
            </div>
            <a href="/about" className="btn btn-orange">Learn More About Us <span aria-hidden="true">-&gt;</span></a>
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
          <div className="cards-3 stagger-cards">
            {services.map((s, i) => (
              <article key={s.title} className="service-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
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
          <StaggerRow className="process-row">
            {steps.map((s, i) => (
              <div key={s.n} className="process-step" style={{ '--stagger-i': i } as React.CSSProperties}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p className="body-text">{s.copy}</p>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </StaggerRow>
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
          <div className="benefit-grid stagger-cards">
            {benefits.map((b, i) => (
              <article key={b.title} className="benefit-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
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
          <div className="cards-4 stagger-cards">
            {projects.map((p, i) => (
              <article key={p.title} className="project-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
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

      <section className="testimonials-section">
        <div className="container">
          <SectionLabel text="Testimonials" />
          <h2 className="left-text">What Our Clients Say</h2>
          <p className="section-subtitle">
            Trusted by homeowners, investors, and businesses for quality construction and reliable project delivery.
          </p>
        </div>

        <div className="marquee-container">
          {/* Row 1: Right to Left */}
          <div className="marquee-track" style={{ '--speed': '50s' } as React.CSSProperties}>
            {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((t, i) => (
              <div key={`t1-${i}`} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} aria-hidden="true">★</span>
                  ))}
                </div>
                <p className="testi-content">{t.review}</p>
                <div className="testi-profile">
                  <div className="testi-avatar">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="testi-info">
                    <span className="testi-name">{t.name}</span>
                    <span className="testi-role">{t.role} • {t.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Left to Right */}
          <div className="marquee-track reverse" style={{ '--speed': '45s' } as React.CSSProperties}>
            {[...testimonials.slice(4, 8), ...testimonials.slice(4, 8)].map((t, i) => (
              <div key={`t2-${i}`} className="testi-card">
                <div className="testi-stars">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} aria-hidden="true">★</span>
                  ))}
                </div>
                <p className="testi-content">{t.review}</p>
                <div className="testi-profile">
                  <div className="testi-avatar">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="testi-info">
                    <span className="testi-name">{t.name}</span>
                    <span className="testi-role">{t.role} • {t.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/telephone.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Phone</strong><span>(905) 458-8960</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/mail (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Email</strong><span>info@farleyconstruction.ca</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/location (6).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Location</strong><span>Brampton, Ontario, Canada</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/time.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
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
            <button type="submit" className="btn btn-blue full-btn">
              Submit Request <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </form>
        </div>
      </FadeSection>
    </>
  )
}
