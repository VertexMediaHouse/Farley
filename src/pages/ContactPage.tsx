import React, { useState } from 'react'
import { FadeSection, SectionLabel } from '../utils'
import SuccessModal from '../components/SuccessModal'

const contactCards = [
  {
    label: 'andrew@farleycdinc.com',
    href: 'mailto:andrew@farleycdinc.com',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v14H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
  {
    label: '(949) 792-4283',
    href: 'tel:+19497924283',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" />
      </svg>
    ),
  },
  {
    label: '27401 Los Altos,',
    sublabel: 'Mission Viejo, CA 92691',
    href: 'https://maps.google.com/?q=27401+Los+Altos,+Mission+Viejo,+CA+92691',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
]

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    text: 'f',
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    text: 't',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    text: 'in',
  },
]

const galleryImages = [
  '/images/img1.jpeg',
  '/images/img2.jpeg',
  '/images/img4.jpeg',
  '/images/img5.jpeg',
  '/images/img6.jpeg',
]

export default function ContactPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  return (
    <>
      <section className="cp-hero">
        <div className="cp-hero-rings" aria-hidden="true" />
        <div className="container cp-hero-inner">
          <span className="page-hero-kicker">Contact Us</span>
          <h1>Get a Free Estimate</h1>
          <p className="cp-hero-lead">
            Drywall repair, ceiling repair, patchwork, and interior maintenance for residential and commercial properties
          </p>
          <p className="cp-hero-subtext">
            Reach out today for a free estimate and clear next steps, with fast response times and reliable communication from start to finish.
          </p>
        </div>
      </section>

      <section className="cp-contact-cards" aria-label="Contact methods">
        <div className="container cp-contact-card-wrap">
          {contactCards.map((card) => (
            <a key={card.label} href={card.href} className="cp-contact-card" target={card.href.startsWith('http') ? '_blank' : undefined} rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
              <span className="cp-contact-icon">{card.icon}</span>
              <strong>
                {card.label}
                {'sublabel' in card && <><br />{(card as typeof card & { sublabel: string }).sublabel}</>}
              </strong>
            </a>
          ))}
        </div>
      </section>

      <FadeSection className="cp-quote-section">
        <div className="container cp-quote-layout">
          <div className="cp-map-col">
            <div className="cp-map" aria-label="Map illustration">
              <svg viewBox="0 0 520 430" aria-hidden="true">
                <path d="M-20 74 88 118 184 80 260 138 344 102 534 145" />
                <path d="M20 240 122 192 192 288 306 252 520 316" />
                <path d="M68 -20 56 128 112 280 86 448" />
                <path d="M206 -20 252 102 226 222 270 444" />
                <path d="M390 -20 350 92 402 188 362 450" />
                <path d="M-24 364 116 332 202 356 332 330 540 370" />
                <path d="M-28 180 92 222 180 198 264 238 380 218 542 244" />
                <path className="cp-map-route" d="M120 258 176 220 214 284 314 232 366 196" />
              </svg>
              <span className="cp-pin cp-pin--start" aria-hidden="true" />
              <span className="cp-pin cp-pin--end" aria-hidden="true" />
            </div>
            <div className="cp-socials" aria-label="Social links">
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} aria-label={item.label} target="_blank" rel="noopener noreferrer">
                  {item.text}
                </a>
              ))}
            </div>
          </div>

          <form
            className="cp-form"
            onSubmit={async (e) => {
              e.preventDefault()

              const form = e.currentTarget

              const formData = new FormData()

              formData.append('entry.415223274', form.fullName.value)
              formData.append('entry.1096735123', form.companyName.value)
              formData.append('entry.715839994', form.email.value)
              formData.append('entry.1507681476', form.phone.value)
              formData.append('entry.738519468', form.propertyType.value)
              formData.append('entry.2083865356', form.serviceNeeded.value)
              formData.append('entry.4913284', form.projectDetails.value)

              await fetch(
                'https://docs.google.com/forms/d/e/1FAIpQLScYT08-Ck8LXE9IIbPppSWM0IBnKrH1Qs3sjSDcaAD6X-WgrQ/formResponse',
                {
                  method: 'POST',
                  mode: 'no-cors',
                  body: formData,
                }
              )

              setShowSuccess(true)
              form.reset()
            }}>
            <h2>Request a Quote</h2>
            <div className="cp-form-grid">
              <label>Full Name<input type="text" placeholder="Your full name" name="fullName" /></label>
              <label>Company Name<input type="text" placeholder="Company or organization" name="companyName" /></label>
              <label>Email Address<input type="email" placeholder="your@email.com" name="email" /></label>
              <label>Phone Number<input type="tel" placeholder="Phone number" name="phone" /></label>
              <label>Property Type<input type="text" placeholder="Select property type" name="propertyType" /></label>
              <label>Service Needed<input type="text" placeholder="Select service needed" name="serviceNeeded" /></label>
            </div>
            <label className="cp-message-label">
              Project Details
              <textarea rows={5} placeholder="Tell us about your project details" name="projectDetails" />
            </label>
            <button type="submit" className="btn btn-blue cp-submit">
              Request Your Free Estimate Today<span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </FadeSection>

      <FadeSection className="cp-gallery-section">
        <div className="container">
          <SectionLabel text="Gallery" />
          <h2>Our Work Samples</h2>
        </div>
        <div className="cp-gallery-track">
          {[...galleryImages, ...galleryImages].map((src, index) => (
            <figure key={`${src}-${index}`} className="cp-gallery-card">
              <img src={src} alt={`Construction work sample ${index + 1}`} />
            </figure>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="cp-cta-section">
        <div className="container">
          <div className="cp-cta">
            <div>
              <h2>Do you want to know more<br />about the company?</h2>
              <p>Let us build something great together with a team focused on precision, safety, and quality.</p>
            </div>
            <a href="https://farleycdinc.com/" target="_blank" rel="noopener noreferrer" className="btn btn-orange btn-lg">
              Our Main Website <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </FadeSection>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} />
    </>
  )
}
