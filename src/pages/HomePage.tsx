import React from 'react'
import { Counter, FadeSection, SectionLabel, StaggerRow } from '../utils'
import { featuredProjects, stats, testimonials } from '../data'

const services = [
  {
    img: '/images/img14.jpeg',
    title: 'Drywall Repair',
    copy: 'Repairing holes, cracks, dents, water damage, and damaged drywall surfaces.',
    href: '/services#drywall-repair',
  },
  {
    img: '/images/img13.jpeg',
    title: 'Drywall Installation & Finishing',
    copy: 'Complete hang, tape, mud, texture, and smooth finish services.',
    href: '/services#drywall-installation-finishing',
  },
  {
    img: '/images/img20.jpeg',
    title: 'Ceiling Repair & Texture Matching',
    copy: 'Ceiling drywall repair, texture blending, and acoustic ceiling repair.',
    href: '/services#ceiling-repair-texture-matching',
  },
  {
    img: '/images/img12.jpeg',
    title: 'Patchwork & Small Repairs',
    copy: 'Professional drywall patch repair and wall restoration services.',
    href: '/services#patchwork-small-repairs',
  },
  {
    img: '/images/img5.jpeg',
    title: 'Interior Painting & Surface Prep',
    copy: 'Painting, prep work, touch-ups, and finishing services.',
    href: '/services#interior-painting-surface-prep',
  },
  {
    img: '/images/img17.jpeg',
    title: 'Residential & Commercial Maintenance',
    copy: 'General interior maintenance and repair support for homes and businesses.',
    href: '/services#residential-commercial-maintenance',
  },
]

const steps = [
  { n: '1', title: 'Contact Us', copy: 'Call or request a free estimate online.' },
  { n: '2', title: 'Inspection', copy: 'We review the project and provide clear recommendations.' },
  { n: '3', title: 'Estimate', copy: 'Receive a detailed quote for drywall repair or maintenance work.' },
  { n: '4', title: 'Scheduling', copy: 'Fast scheduling and dependable communication.' },
  { n: '5', title: 'Completion', copy: 'Clean, professional results completed on time.' },
]

const benefits = [
  {
    title: 'Texture Matching ',
    svg: <img src="/images/carpentry.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Drywall Patch Repair',
    svg: <img src="/images/trustworthiness (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Ceiling Drywall Repair',
    svg: <img src="/images/drywall (1).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hole in Wall Repair',
    svg: <img src="/images/worker.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Drywall Crack Repair',
    svg: <img src="/images/drywall (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hang, Tape & Texture',
    svg: <img src="/images/trustworthiness (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Hand Textures & Smooth Finish',
    svg: <img src="/images/shield (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Residential & Commercial Service',
    svg: <img src="/images/user-avatar.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Property Maintenance Support',
    svg: <img src="/images/property (2).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
  {
    title: 'Fast & Reliable Turnaround',
    svg: <img src="/images/clock (5).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />,
  },
]

const heroSlides = [
  { img: '/images/img1.jpeg', alt: 'Drywall workers finishing a ceiling' },
  { img: '/images/img2.jpeg', alt: 'Construction crew installing drywall panels' },
  { img: '/images/img4.jpeg', alt: 'Drywall finishing work in progress' },
  { img: '/images/img5.jpeg', alt: 'Interior drywall repair project' },
  { img: '/images/img6.jpeg', alt: 'Fresh drywall and finishing work on a construction site' },
]

export default function HomePage() {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const [sliderPaused, setSliderPaused] = React.useState(false)
  const touchStartX = React.useRef<number | null>(null)

  const showSlide = React.useCallback((index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length)
  }, [])

  const nextSlide = React.useCallback(() => {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
  }, [])

  const prevSlide = React.useCallback(() => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  React.useEffect(() => {
    if (sliderPaused) return undefined
    const timer = window.setInterval(nextSlide, 3800)
    return () => window.clearInterval(timer)
  }, [nextSlide, sliderPaused])

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - (event.changedTouches[0]?.clientX ?? touchStartX.current)
    touchStartX.current = null
    if (Math.abs(delta) < 36) return
    if (delta > 0) nextSlide()
    else prevSlide()
  }

  return (
    <>
      <section id="home" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy fade-in-up">
            <p className="hero-eyebrow">Residential &amp; Commercial</p>
            <h1 className="home-hero-title">
              <span className="hero-title-line typing-line typing-line--first">Drywall Repairs</span>
              <span className="hero-title-line typing-line typing-line--second">Specialists</span>
            </h1>
            <p className="hero-sub">
            Professional drywall repair, texture matching, ceiling repair, patchwork,  drywall installation, and interior maintenance services for homes, offices, retail spaces, apartments, and commercial properties.
            </p>
            <div className="btn-row">
              <a href="#contact" className="btn btn-orange">Get a Free Estimate<span aria-hidden="true">→</span></a>
              <a href="tel:+19497924283" className="btn btn-glass">Call Now<span aria-hidden="true">→</span></a>
            </div>
            <div className="hero-avatars">
              <img src="/images/image3.png" alt="Customer review avatars" className="review-img" />
              <div className="hero-trust">
                <span className="trust-top"> 5 <span aria-hidden="true">★</span> Verified</span>
                <span className="trust-bot">Google Reviews</span>
              </div>
            </div>
          </div>
          <div
            className="hero-img-wrap hero-slider-wrap fade-in-right hero-img-float"
            onMouseEnter={() => setSliderPaused(true)}
            onMouseLeave={() => setSliderPaused(false)}
          >
            <div
              className="hero-slider"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-roledescription="carousel"
              aria-label="Featured construction project images"
            >
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.img}
                  src={slide.img}
                  alt={slide.alt}
                  className={`hero-img hero-slide${index === activeSlide ? ' hero-slide--active' : ''}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  aria-hidden={index !== activeSlide}
                />
              ))}
              <button type="button" className="hero-slider-arrow hero-slider-arrow--prev" onClick={prevSlide} aria-label="Previous image">
                <span aria-hidden="true">‹</span>
              </button>
              <button type="button" className="hero-slider-arrow hero-slider-arrow--next" onClick={nextSlide} aria-label="Next image">
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <div className="hero-slider-dots" aria-label="Hero image navigation">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.img}
                  type="button"
                  className={`hero-slider-dot${index === activeSlide ? ' hero-slider-dot--active' : ''}`}
                  onClick={() => showSlide(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === activeSlide}
                />
              ))}
            </div>
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
            <h2 className="about-split-h2">
              <span className="about-h2-top">Reliable Drywall Repair</span>
              <span className="about-h2-bottom">
                <span className="about-h2-amp">&amp;</span> Property Maintenance Services.
              </span>
            </h2>
            <p className="body-text">
              We specialize in drywall repair, drywall installation, texture matching, ceiling repair, patchwork,
              and interior maintenance services for residential and commercial properties.
            </p>
            <div className="about-clients-block">
              <p className="about-clients-label">We proudly work with:</p>
              <div className="about-client-pills">
                {[
                  { label: 'Homeowners',                icon: '🏠' },
                  { label: 'Property Managers',         icon: '🏢' },
                  { label: 'Commercial Facilities',     icon: '🏗️' },
                  { label: 'Retail Spaces',             icon: '🛍️' },
                  { label: 'Offices',                   icon: '💼' },
                  { label: 'Apartment Complexes',       icon: '🏘️' },
                  { label: 'Real Estate Professionals', icon: '🤝' },
                ].map((c, i) => (
                  <span
                    key={c.label}
                    className="about-client-pill"
                    style={{ '--pill-i': i } as React.CSSProperties}
                  >
                    <span className="pill-icon" aria-hidden="true">{c.icon}</span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <a href="/about" className="btn btn-orange">Learn More About Us <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </FadeSection>

      <FadeSection id="services" className="section bg-light">
        <div className="container">
          <header className="services-section-head">
            <SectionLabel text="Our Services" light />
            <div className="services-section-lead">
              <h2 className="services-section-title">
                Complete Drywall &amp; Interior Repair Services.
              </h2>
              <p className="services-intro">
              We provide professional drywall repair, texture matching, installation, and finishing for residential and commercial spaces — delivering clean, reliable results built to last
              </p>
            </div>
          </header>
          <div className="cards-3 stagger-cards services-cards-grid">
            {services.map((s, i) => (
              <article key={s.title} className="service-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
                <div className="card-img-wrap">
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="card-body">
                  <h3>{s.title}</h3>
                  <p className="body-text service-card-desc">{s.copy}</p>
                  <a href={s.href} className="btn btn-orange service-card-cta">
                    Learn More <span aria-hidden="true">→</span>
                  </a>
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
            <h2>Drywall Services<br />Built Around<br />Your Needs.</h2>
            <p className="body-text">
            From patch repairs and texture matching to complete finishing work, we deliver the drywall services property owners rely on most
            </p>
            <div className="why-trust-chips">
              {['Fast Response', 'Clean Work',  'Small Jobs Welcome'].map((label) => (
                <span key={label} className="why-trust-chip">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#3AABF0" /><path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {label}
                </span>
              ))}
            </div>
            <a href="#contact" className="btn btn-orange">Discuss Your Project <span aria-hidden="true">→</span></a>
          </div>
          <div className="benefit-grid stagger-cards">
            {benefits.map((b, i) => (
              <article key={b.title} className="benefit-card card-hover" style={{ '--stagger-i': i } as React.CSSProperties}>
                <span className="benefit-icon">{b.svg}</span>
                <h3>{b.title}</h3>
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
            {featuredProjects.map((p, i) => (
              <article key={p.title} className="project-card" style={{ '--stagger-i': i } as React.CSSProperties}>
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
              Whether you need drywall patch repair, ceiling drywall repair, texture matching, or general interior maintenance services, we’re ready to help.
              </p>
            </div>
            <a href="#contact" className="btn btn-orange btn-lg">Request a Free Estimate <span aria-hidden="true">→</span></a>
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
                <div><strong>Phone</strong><span>(949) 792-4283</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/mail (3).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Email</strong><span>andrew@farleycdinc.com</span></div>
              </li>
              <li>
                <span className="ci-icon" aria-hidden="true">
                  <img src="/images/location (6).png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
                <div><strong>Location</strong><span>27401 Los Altos<br />Mission Viejo, CA 92691</span></div>
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
              <label>Property Type<input type="text" placeholder="Select property type" /></label>
              <label>Service Needed<input type="text" placeholder="Select service needed" /></label>
            </div>
            <label className="msg-label">
            Project Details
              <textarea rows={4} placeholder="Tell us about your project details" />
            </label>
            <button type="submit" className="btn btn-blue full-btn">
              Request Your Free Estimate Today <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </form>
        </div>
      </FadeSection>
    </>
  )
}
