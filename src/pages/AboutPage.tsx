import React from "react";
import { Counter, FadeSection, SectionLabel } from "../utils";
import { stats, testimonials } from "../data";

const trustPoints = [
  {
    title: "Experienced field team",
    copy: "Skilled professionals with hands-on construction knowledge.",
  },
  {
    title: "Clear project communication",
    copy: "Clients understand timeline, scope, and next steps.",
  },
  {
    title: "Clean, respectful work",
    copy: "Job sites are handled safely and professionally.",
  },
];



export default function AboutPage() {
  return (
    <>
      {/* ── Page Hero ─────────────────────────────────────── */}
      <section className="page-hero about-hero">
        <div className="page-hero-bg" aria-hidden="true" />
        <div className="container page-hero-inner">
          <span className="page-hero-kicker">About Farley Construction</span>
          <h1 className="page-hero-title about-hero-title">
            <span>Built on Trust.</span>
            <span className="typing-line">Finished with Precision.</span>
          </h1>
          <p className="page-hero-sub">
          We provide professional drywall repair, drywall installation, patchwork, ceiling repair, texture matching, and interior maintenance services for residential and commercial properties.
          </p>
          <div className="btn-row">
            <a href="/#contact" className="btn btn-orange">
              Get a Free Estimate <span aria-hidden="true">→</span>
            </a>
            <a href="tel:+19497924283" className="btn btn-glass">
              Call Now <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="hero-avatars">
            <img
              src="/images/image3.png"
              alt="Customer review avatars"
              className="review-img"
            />
            <div className="hero-trust">
              <span className="trust-top">
                {" "}
                5 <span aria-hidden="true">★</span> Verified
              </span>
              <span className="trust-bot">Google Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <section
        className="stats-strip about-stats"
        aria-label="Company statistics"
      >
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.svg}</span>
              <div className="stat-text">
                <strong className="stat-val">
                  <Counter value={s.value} />
                </strong>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────── */}
      <FadeSection id="our-story" className="section">
        <div className="container about-story-col">
          <div className="about-photo-grid">
            <img
              src="/images/img11.jpeg"
              alt="Farley Construction team at work"
              className="about-photo"
            />
          </div>
          <div className="about-copy">
            <SectionLabel text="Who We Are" />
            <h2>
              A team built for quality, clarity, and dependable execution.
            </h2>
            <p className="body-text">
              Farley Construction &amp; Development Inc. supports commercial,
              retail, industrial, and residential spaces with drywall repair,
              finishing, painting, construction support, and facility
              maintenance. The brand is built around practical problem solving,
              clean communication, and results that last.
            </p>
            <div className="btn-row" style={{ marginTop: "28px" }}>
              <a href="/#contact" className="btn btn-orange">
                Discuss Your Project <span aria-hidden="true">→</span>
              </a>
              <a href="/services" className="btn btn-outline-dark">
                Explore Services <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── Mission & Vision ──────────────────────────────── */}
      <FadeSection className="section bg-light mission-vision-section">
        <div className="container mission-vision-layout">
          <div className="mission-vision-copy">
            <SectionLabel text="Mission & Vision" />
            <h2>
              Purpose-led work.
              <br />
              Built around trust.
            </h2>
            <p>
              This section explains why clients can trust Farley before they
              request a quote.
            </p>
          </div>
          <div className="mission-grid stagger-cards">
            <div
              className="mission-card"
              style={{ "--stagger-i": 0 } as React.CSSProperties}
            >
              <div className="mission-card-icon" aria-hidden="true">
                <svg viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="13" />
                  <circle cx="20" cy="20" r="6" />
                  <path d="M20 20 31 9" />
                  <path d="M27 9h4v4" />
                </svg>
              </div>
              <h3>Mission</h3>
              <p>
                To deliver dependable construction and drywall services with
                quality workmanship, clear communication, and long-lasting
                results.
              </p>
            </div>
            <div
              className="mission-card mission-card--accent"
              style={{ "--stagger-i": 1 } as React.CSSProperties}
            >
              <div className="mission-card-icon" aria-hidden="true">
                <svg viewBox="0 0 40 40">
                  <path d="M24 6c4.5 1.2 7.6 4.3 8.8 8.8L25 22.6l-7.6-7.6L24 6Z" />
                  <path d="M16.8 15.6 11 14l1.8 6.1" />
                  <path d="M24.4 23.2 26 29l-6.1-1.8" />
                  <path d="M14 26c-2.6.8-4.2 2.4-5 5 2.6-.8 4.2-2.4 5-5Z" />
                  <circle cx="25" cy="14" r="1.8" />
                </svg>
              </div>
              <h3>Vision</h3>
              <p>
                To become a trusted contractor known for professionalism,
                reliability, safety, and excellent customer experience.
              </p>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── Why Clients Trust Us ──────────────────────────── */}
      <FadeSection className="section trust-section">
        <div className="container trust-layout">
          <div className="trust-copy">
            <SectionLabel text="Why Clients Trust Us" />
            <h2>
              Professional execution
              <br />
              from first call to final
              <br />
              walkthrough.
            </h2>
            {/* <p className="trust-intro">
              This page makes Farley feel organized, experienced, and safe to
              hire. The layout uses trust points and clean visuals.
            </p> */}
            <div className="trust-list">
              {trustPoints.map((point, i) => (
                <article
                  key={point.title}
                  className="trust-point"
                  style={{ "--stagger-i": i } as React.CSSProperties}
                >
                  <span className="trust-dot" aria-hidden="true" />
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="trust-image-wrap">
            <img
              src="/images/img12.jpeg"
              alt="Drywall installation team working on interior walls"
              className="trust-image"
            />
          </div>
        </div>
      </FadeSection>



      {/* ── Testimonials ──────────────────────────────────── */}
      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="testimonials-section">
        <div className="container">
          <SectionLabel text="Testimonials" />
          <h2 className="left-text">What Our Clients Say</h2>
          <p className="section-subtitle">
            Trusted by homeowners, investors, and businesses for quality
            construction and reliable project delivery.
          </p>
        </div>

        <div className="marquee-container">
          {/* Row 1: Right to Left */}
          <div
            className="marquee-track"
            style={{ "--speed": "50s" } as React.CSSProperties}
          >
            {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map(
              (t, i) => (
                <div key={`t1-${i}`} className="testi-card">
                  <div className="testi-stars">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <span key={si} aria-hidden="true">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="testi-content">{t.review}</p>
                  <div className="testi-profile">
                    <div className="testi-avatar">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="testi-info">
                      <span className="testi-name">{t.name}</span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Row 2: Left to Right */}
          <div
            className="marquee-track reverse"
            style={{ "--speed": "45s" } as React.CSSProperties}
          >
            {[...testimonials.slice(4, 8), ...testimonials.slice(4, 8)].map(
              (t, i) => (
                <div key={`t2-${i}`} className="testi-card">
                  <div className="testi-stars">
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <span key={si} aria-hidden="true">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="testi-content">{t.review}</p>
                  <div className="testi-profile">
                    <div className="testi-avatar">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="testi-info">
                      <span className="testi-name">{t.name}</span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <FadeSection className="section cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>Ready to Start Your Project?</h2>
              <p className="body-text">
              Whether you need drywall patch repair, ceiling drywall repair, texture matching, or general interior maintenance services, we’re ready to help.
              </p>
            </div>
            <a href="/#contact" className="btn btn-orange btn-lg">
              Get Your Free Estimate <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </FadeSection>
    </>
  );
}
