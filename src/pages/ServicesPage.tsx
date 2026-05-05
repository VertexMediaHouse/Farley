import React from 'react'
import { FadeSection, SectionLabel, StaggerRow } from '../utils'
import { servicesPageData } from '../data'

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
              <a href="/contact" className="btn btn-orange">
                Request a Quote <span aria-hidden="true">-&gt;</span>
              </a>
              <a href="#services-gallery" className="btn btn-glass">
                View Our Work <span aria-hidden="true">-&gt;</span>
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

        <div className="container services-hero-stats" aria-label="Services page statistics">
          {servicesPageData.heroStats.map((stat) => (
            <article key={stat.label} className="services-hero-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <FadeSection className="section services-overview-section">
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
      </FadeSection>

      <FadeSection className="section services-detail-section">
        <div className="container services-detail-stack">
          {servicesPageData.serviceDetails.map((detail, index) => (
            <section
              key={detail.title}
              className={`services-detail-row${index % 2 === 1 ? ' services-detail-row--reverse' : ''}`}
            >
              <div className="services-detail-media">
                <img src={detail.image} alt={detail.title} />
              </div>
              <div className="services-detail-copy">
                <SectionLabel text={`Featured Service 0${index + 1}`} />
                <h2>{detail.title}</h2>
                <p className="body-text">{detail.intro}</p>
                <ul className="services-deliverable-list">
                  {detail.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="services-trust-note">
                  <strong>Trust note</strong>
                  <span>{detail.trustNote}</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </FadeSection>

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
          <h2 className="center-text">A compact process that keeps projects clear and moving.</h2>
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

      <FadeSection id="services-gallery" className="section services-gallery-section">
        <div className="container">
          <SectionLabel text="Selected Work" />
          <h2>Project visuals that show the level of finish clients expect from Farley.</h2>
        </div>
        <div className="container services-gallery-grid">
          {servicesPageData.gallery.map((item, index) => (
            <article key={`${item.title}-${index}`} className={`services-gallery-card services-gallery-card--${(index % 4) + 1}`}>
              <img src={item.image} alt={item.title} />
              <div className="services-gallery-overlay">
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="section services-cta-section">
        <div className="container">
          <div className="services-cta-banner">
            <div className="services-cta-copy">
              <SectionLabel text="Next Step" />
              <h2>Need drywall, finishing, repair, or maintenance support for an upcoming project?</h2>
              <p>
                Talk with Farley about your scope, timeline, and site conditions, and we will
                help you move toward a cleaner handoff.
              </p>
            </div>
            <div className="services-cta-actions">
              <a href="/contact" className="btn btn-orange btn-lg">
                Discuss Your Project <span aria-hidden="true">-&gt;</span>
              </a>
              <a href="tel:+19054588960" className="services-cta-link">(905) 458-8960</a>
              <a href="mailto:info@farleyconstruction.ca" className="services-cta-link">info@farleyconstruction.ca</a>
            </div>
          </div>
        </div>
      </FadeSection>
    </>
  )
}
