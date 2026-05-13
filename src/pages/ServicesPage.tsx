import React from 'react'
import { Link } from 'react-router-dom'
import { Counter, FadeSection, SectionLabel, StaggerRow } from '../utils'
import { featuredProjects, servicesPageData, stats, testimonials } from '../data'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function ServiceSpotlight({
  detail,
  index,
  id,
}: {
  detail: (typeof servicesPageData.serviceDetails)[number]
  index: number
  id: string
}) {
  const spotlightRef = React.useRef<HTMLElement | null>(null)
  const cardRef = React.useRef<HTMLElement | null>(null)
  const isReversed = index % 2 === 1

  React.useEffect(() => {
    const spotlight = spotlightRef.current
    const card = cardRef.current
    if (!spotlight || !card) return

    let frame = 0

    const update = () => {
      frame = 0

      if (window.innerWidth <= 900) {
        card.style.setProperty('--service-reveal', '1')
        card.style.setProperty('--service-shift', '0')
        card.classList.add('is-active')
        return
      }

      const rect = spotlight.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2
      const normalized = clamp(centerOffset / (viewportHeight * 0.72), -1, 1)
      const reveal = clamp(1 - Math.abs(normalized), 0, 1)

      card.style.setProperty('--service-reveal', reveal.toFixed(3))
      card.style.setProperty('--service-shift', normalized.toFixed(3))
      card.classList.toggle('is-active', reveal > 0.56)
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={spotlightRef} id={id} className="services-spotlight">
      <div className="services-spotlight-stage">
        <article
          ref={cardRef}
          className={`services-detail-row${isReversed ? ' services-detail-row--reverse' : ''}`}
          style={
            {
              '--service-reveal': 0,
              '--service-shift': 1,
              '--image-dir': isReversed ? 1 : -1,
              '--text-dir': isReversed ? -1 : 1,
            } as React.CSSProperties
          }
        >
          <div className="services-detail-media">
            <img src={detail.image} alt={detail.title} />
          </div>
          <div className="services-detail-copy">
            <SectionLabel text={`Featured Service 0${index + 1}`} />
            <h2>{detail.title}</h2>
            <p className="body-text">{detail.intro}</p>
            <ul className="services-deliverable-list">
              {detail.deliverables.map((item, itemIndex) => (
                <li key={item} style={{ '--stagger-i': itemIndex } as React.CSSProperties}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero services-hero">
        <div className="page-hero-bg services-hero-bg" aria-hidden="true" />
        <div className="container services-hero-inner">
          <div className="services-hero-copy">
            <span className="page-hero-kicker">Our Services</span>
            <h1 className="page-hero-title services-hero-title">
              <span>Construction Services</span>
              <span className="typing-line">Built for Clean Execution.</span>
            </h1>
            <p className="page-hero-sub services-hero-sub">
              Farley delivers drywall, finishing, painting, repair, and maintenance
              support for spaces that need organized crews, dependable scheduling,
              and polished results.
            </p>
            <div className="btn-row">
              <Link to="/contact" className="btn btn-orange">
              Get a Free Estimate<span aria-hidden="true">→</span>
              </Link>
              <a href="tel:+19497924283" className="btn btn-glass">
              Call Now<span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="services-hero-visual">
            <div className="services-hero-collage">
              <figure className="services-collage-main">
                <img src="/images/img4.jpeg" alt="Drywall installation work in progress" />
              </figure>
              <figure className="services-collage-side">
                <img src="/images/img6.jpeg" alt="Detailed drywall finishing work" />
              </figure>
              <div className="services-hero-badge">
                <strong>Built for busy sites</strong>
                <span>Organized crews. Clean results. Reliable follow-through.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip services-stats" aria-label="Company statistics">
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

      {/* <FadeSection className="section services-overview-section">
        <div className="container">
          <SectionLabel text="Service Categories" />
          <h2>Practical field support for spaces that need to look finished and stay operational.</h2>
          <p className="section-sub services-overview-sub">
            The page leads with the services clients ask for most, then backs them up
            with visuals, proof points, and a cleaner explanation of how Farley works.
          </p>
          <div className="services-card-grid stagger-cards">
            {servicesPageData.serviceCards.map((service, index) => (
              <article key={service.title} className="services-overview-card card-hover" style={{ '--stagger-i': index } as React.CSSProperties}>
                <div className="services-overview-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="services-overview-body">
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                  <div className="services-tag-row" aria-label={`${service.title} service tags`}>
                    {service.tags.map((tag) => (
                      <span key={tag} className="services-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </FadeSection> */}

      <section className="section services-detail-section">
        <div className="container services-detail-stack">
          {servicesPageData.serviceDetails.map((detail, index) => (
            <ServiceSpotlight
              key={detail.title}
              detail={detail}
              index={index}
              id={detail.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
            />
          ))}
        </div>
      </section>

      <FadeSection className="section services-sector-section">
        <div className="container services-sector-layout">
          <div className="services-sector-copy">
            <SectionLabel text="Where We Work" />
            <h2>Support built for the kinds of spaces that cannot afford sloppy execution.</h2>
            <p className="body-text">
              Farley supports a range of project environments, with an approach centered on
              communication, clean finishes, and work that fits real operating conditions.
            </p>
          </div>
          <div className="services-sector-grid">
            {servicesPageData.sectors.map((sector) => (
              <article key={sector} className="services-sector-card">
                <span aria-hidden="true" className="services-sector-mark" />
                <h3>{sector}</h3>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="section services-process-section">
        <div className="container">
          <SectionLabel text="How We Work" />
          <h2 className="center-text">A lean workflow that ensures clarity and sustains project momentum.</h2>
          <StaggerRow className="services-process-grid">
            {servicesPageData.processSteps.map((step, index) => (
              <article key={step.title} className="services-process-card" style={{ '--stagger-i': index } as React.CSSProperties}>
                <span className="services-process-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </StaggerRow>

          <div className="services-trust-grid stagger-cards">
            {servicesPageData.trustCards.map((card, index) => (
              <article key={card.title} className="services-trust-card" style={{ '--stagger-i': index } as React.CSSProperties}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection id="services-gallery" className="section project-section">
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
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="testi-info">
                    <span className="testi-name">{t.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                    {t.name.split(' ').map((n) => n[0]).join('')}
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

      <FadeSection className="section services-cta-section">
        <div className="container">
          <div className="services-cta-banner">
            <div className="services-cta-copy">
              <SectionLabel text="Next Step" />
              <h2>Need drywall or interior repair support for your next project?</h2>
              <p>
                Talk with Farley about your scope, timeline, and site conditions, and we will
                help you move toward a cleaner handoff.
              </p>
            </div>
            <div className="services-cta-actions">
              <Link to="/contact" className="btn btn-orange btn-lg">
                Discuss Your Project <span aria-hidden="true">→</span>
              </Link>
              <a href="tel:+19497924283" className="services-cta-link">(949) 792-4283</a>
              <a href="mailto:andrew@farleycdinc.com" className="services-cta-link">andrew@farleycdinc.com</a>
            </div>
          </div>
        </div>
      </FadeSection>
    </>
  )
}
