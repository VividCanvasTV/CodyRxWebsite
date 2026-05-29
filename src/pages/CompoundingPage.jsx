import { useEffect, useState } from 'react'

const PORTAL_REGISTER_URL = 'https://portal.codydrugrx.com/provider/register.php'

const trustCards = [
  {
    title: 'A Real Relationship',
    copy: "At Cody Drug, you're not a number. We take the time to get to know your practice, the patients, and design our process around how you work.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="17" cy="17" r="6" />
        <circle cx="31" cy="17" r="6" />
        <path d="M7 38c1.6-8 6.1-12 13.5-12 4.5 0 7.7 1.5 9.7 4.4" />
        <path d="M25 37c1.4-6.8 5.1-10.2 11-10.2 3.7 0 6.6 1.5 8.7 4.4" />
      </svg>
    ),
  },
  {
    title: 'Speed & Reliability',
    copy: 'Same-day turnaround on sterile compounds. Live status tracking. Individual support, every time.',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="26" cy="25" r="13" />
        <path d="M26 25l7-7M26 7v5M12 10l4 4M6 25h6M10 39l4-4" />
        <path d="M4 16h9M2 24h8M5 32h8" />
      </svg>
    ),
  },
  {
    title: 'Compliance First',
    copy: 'We over-test and over-deliver when it comes to safety. We never cut corners on quality ingredients, process, or compliance.',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5l16 6v11c0 10-6.3 17-16 21C14.3 39 8 32 8 22V11l16-6Z" />
        <path d="M17 24l5 5 10-12" />
      </svg>
    ),
  },
]

const services = [
  {
    name: 'Weight Loss',
    copy: 'Cody Drug supports weight loss providers who need more than a vendor. From personalized GLP-1 therapies to responsive support, we help clinics deliver better patient outcomes with less friction.',
    accent: 'Metabolic support',
  },
  {
    name: "Men's Health",
    copy: "Cody Drug supports men's health providers who treat the individual, not the average. Providers trust Cody Drug to deliver results.",
    accent: 'Performance care',
  },
  {
    name: "Women's Health",
    copy: "Cody Drug supports women's health providers who know every patient's needs are different. From hormone therapies to personalized compounds, we help providers deliver care built around the individual.",
    accent: 'Tailored support',
  },
  {
    name: 'Wellness',
    copy: 'Cody Drug partners with wellness providers who believe healthcare should feel personal. We help clinics deliver customized therapies with speed, precision, and service that patients can actually feel.',
    accent: 'Whole-body care',
  },
  {
    name: 'Peptides',
    copy: 'Cody Drug supports forward-thinking providers bringing peptide therapies into modern care plans. We combine precision compounding with real partnership to help clinics move faster and care deeper.',
    accent: 'Specialty protocols',
  },
  {
    name: 'Dermatology',
    copy: 'Cody Drug supports dermatology providers who need treatments tailored to the patient, not pulled off a shelf. From customized compounds to responsive support, we help practices deliver care with precision, speed, and confidence.',
    accent: 'Skin-focused care',
  },
  {
    name: 'MedSync',
    copy: 'Cody Drug helps patients and providers simplify medication routines with synchronized refills, clearer coordination, and support that keeps care moving on schedule.',
    accent: 'Medication coordination',
  },
  {
    name: 'Vaccines',
    copy: 'Cody Drug supports accessible vaccine care with dependable service, patient-centered guidance, and a pharmacy team focused on protecting what matters.',
    accent: 'Preventive care',
  },
]

const certifications = [
  { label: 'NABP*', detail: 'In Process' },
  { label: 'LegitScript', detail: 'Certified' },
  { label: 'USP 797', detail: 'Certified' },
  { label: 'Meets USP', detail: '795 & 800 Standards' },
]

const providerStageCards = [
  {
    copy: 'USP 797-certified sterile compounding',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 6 51 14v16c0 13.2-7.5 22.1-19 28C20.5 52.1 13 43.2 13 30V14l19-8Z" />
        <path d="m23 32 6 6 13-16" />
      </svg>
    ),
  },
  {
    copy: 'Trusted by 1,000+ providers',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="23" r="8" />
        <circle cx="18" cy="27" r="6" />
        <circle cx="46" cy="27" r="6" />
        <path d="M18 37c-7.2 0-11 4.6-11 12v5h22" />
        <path d="M46 37c7.2 0 11 4.6 11 12v5H35" />
        <path d="M32 36c-8.3 0-14 5.2-14 14v4h28v-4c0-8.8-5.7-14-14-14Z" />
      </svg>
    ),
  },
  {
    copy: 'Prescriptions ship same day with 24 to 48-hour nationwide delivery',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 22h30v24H6z" />
        <path d="M36 29h10l10 10v7H36z" />
        <circle cx="19" cy="49" r="5" />
        <circle cx="47" cy="49" r="5" />
        <path d="M11 15h25M4 29h16M2 36h18" />
      </svg>
    ),
  },
  {
    copy: 'Licensed in AZ, CO, DC, DE, FL, HI, IN, KS, MN, MO, OK, PA, TX, WI',
    icon: (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M11 24l6-4 6 1 5-3 8 2 5-2 6 5 6 1-2 6 4 5-5 4 1 6-8 1-6 5-7-3-7 4-5-5-8-1 2-8-4-5 3-5Z" />
        <path d="M15 28h5M26 24h7M40 27h8M22 39h9M37 42h8" />
      </svg>
    ),
  },
]

function ServicesNav() {
  return (
    <header className="cr-nav about-nav" id="top">
      <div className="cr-nav-inner">
        <a href="/" className="cr-nav-logo" aria-label="Cody Drug Rx home">
          <img className="cr-nav-logo-image" src="/pages/assets/cody-drug-logo-red.png" alt="Cody Drug Rx" />
        </a>
        <nav aria-label="Primary">
          <ul className="cr-nav-menu">
            <li className="cr-nav-item">
              <a href="/pages/about.html" className="cr-nav-trigger">
                About Us
                <svg className="cr-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </a>
              <div className="cr-nav-mega cr-nav-mega--sitemap cr-nav-mega--simple">
                <div className="cr-nav-col">
                  <p className="cr-nav-col-title">About Us</p>
                  <a href="/services/compounding" className="cr-nav-mlink">Services</a>
                  <a href="/pages/careers.html" className="cr-nav-mlink">Careers</a>
                  <a href="/pages/events.html" className="cr-nav-mlink">Events</a>
                  <a href="/pages/credentials.html" className="cr-nav-mlink">Credentials</a>
                  <a href="/pages/about.html#quality-standards" className="cr-nav-mlink">Quality Standards</a>
                </div>
              </div>
            </li>
            <li className="cr-nav-item"><a href="/services/compounding" className="cr-nav-link is-active" aria-current="page">Services</a></li>
            <li className="cr-nav-item"><a href="/pages/providers.html" className="cr-nav-link">Providers</a></li>
            <li className="cr-nav-item">
              <a href="/pages/resources.html" className="cr-nav-trigger">
                Resources
                <svg className="cr-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </a>
              <div className="cr-nav-mega cr-nav-mega--sitemap cr-nav-mega--simple">
                <div className="cr-nav-col">
                  <p className="cr-nav-col-title">Resources</p>
                  <a href="/pages/resources.html" className="cr-nav-mlink">Patient Resources</a>
                  <a href="/pages/resources.html#compounding-news" className="cr-nav-mlink">Compounding News</a>
                </div>
              </div>
            </li>
            <li className="cr-nav-item">
              <a href="/pages/providers.html#pricing-catalog" className="cr-nav-trigger">
                Products
                <svg className="cr-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </a>
              <div className="cr-nav-mega cr-nav-mega--sitemap cr-nav-mega--simple">
                <div className="cr-nav-col">
                  <p className="cr-nav-col-title">Products</p>
                  <a href="/pages/providers.html#pricing-catalog-compounds" className="cr-nav-mlink">Compounds</a>
                  <a href="/pages/providers.html#pricing-catalog-supplements" className="cr-nav-mlink">Supplements</a>
                </div>
              </div>
            </li>
            <li className="cr-nav-item"><a href="/pages/contact.html" className="cr-nav-link">Contact</a></li>
          </ul>
        </nav>
        <div className="cr-nav-actions">
          <a href="https://portal.codydrugrx.com/" className="cr-nav-shortcut" target="_blank" rel="noreferrer">Provider Portal</a>
          <a href="/pages/virtual-consult.html" className="cr-nav-shortcut">Live Rx Consult</a>
          <a href="/#review" className="cr-nav-shortcut">Refill</a>
        </div>
      </div>
    </header>
  )
}

function CompoundingPage() {
  const [activeService, setActiveService] = useState(0)

  useEffect(() => {
    document.body.classList.add('compounding-page')
    document.title = 'Cody Drug Rx | Services'

    const sharedNavHref = '/pages/shared-nav.css'
    const sharedNavLink = document.querySelector(`link[href="${sharedNavHref}"]`) || document.createElement('link')
    const pageHref = '/services/compounding/compounding.css'
    const pageLink = document.querySelector(`link[href="${pageHref}"]`) || document.createElement('link')

    sharedNavLink.rel = 'stylesheet'
    sharedNavLink.href = sharedNavHref
    pageLink.rel = 'stylesheet'
    pageLink.href = pageHref

    if (!sharedNavLink.parentNode) document.head.appendChild(sharedNavLink)
    if (!pageLink.parentNode) document.head.appendChild(pageLink)

    return () => {
      document.body.classList.remove('compounding-page')
      if (pageLink.parentNode) pageLink.parentNode.removeChild(pageLink)
      if (sharedNavLink.parentNode) sharedNavLink.parentNode.removeChild(sharedNavLink)
    }
  }, [])

  const selectedService = services[activeService]

  return (
    <>
      <ServicesNav />

      <main className="services-page">
        <section className="services-hero" aria-labelledby="services-hero-title">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-copy reveal">
            <h1 id="services-hero-title">
              <span>Pharmacy Services.</span>
              <span>Designed For You.</span>
            </h1>
            <p>
              From serving our community to supporting the growth of medical practices,
              our pharmacy services are designed with one purpose. To put people above
              products.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="/pages/providers.html">Providers</a>
              <a className="btn btn-secondary" href="/pages/playbook.html">Patients</a>
            </div>
          </div>

          <div className="hero-vial-wrap hero-photo-wrap reveal" aria-label="Cody Drug Rx pharmacy team">
            <div className="hero-photo-shell">
              <img src="/pages/assets/services-pharmacist-group.jpg" alt="Cody Drug Rx pharmacy team" className="hero-team-photo" />
            </div>
            <div className="hero-photo-reflection" aria-hidden="true" />
          </div>
        </section>

        <section className="trust-card-row" aria-label="Cody Drug Rx service commitments">
          {trustCards.map((card) => (
            <article className="trust-card reveal" key={card.title}>
              <div className="trust-icon" aria-hidden="true">{card.icon}</div>
              <h2>{card.title}</h2>
              <p>{card.copy}</p>
            </article>
          ))}
        </section>

        <section className="quality-feature" aria-labelledby="quality-title">
          <div className="quality-copy reveal">
            <p className="eyebrow">Real people. Real solutions.</p>
            <h2 id="quality-title">
              <span>The Cody Drug</span>
              <span className="quality-red-line">Difference</span>
            </h2>
            <p>
              Since 2010, Cody Drug has been more than just a pharmacy - it's a place
              where customers always come first. Founded by Stacy Cody and located in a
              replica 1950s diner, we combine friendly service with modern care. Our
              compounding pharmacy offers custom &amp; sterile personalized medications,
              plus services like vaccinations, telehealth solutions, medication packaging,
              &amp; wellness supplements.
            </p>
            <a className="btn btn-secondary" href="#certifications">Provider Sign-Up</a>
          </div>

          <div className="lab-pill-stack reveal" aria-label="Sterile Cody Drug Rx lab">
            <div className="lab-pill lab-pill-one" />
            <div className="lab-pill lab-pill-two" />
            <div className="lab-pill lab-pill-three" />
          </div>
        </section>

        <section className="services-asset-stage reveal" aria-labelledby="provider-stage-title">
          <div className="services-asset-stage-bg" aria-hidden="true" />
          <div className="provider-stage-copy">
            <h2 id="provider-stage-title">
              <span>Elevated Service.</span>
              <em>Better Outcomes.</em>
            </h2>
            <p>
              When your pharmacy is a partner instead of a roadblock, outcomes improve,
              practices grow, and providers stay.
            </p>
          </div>
          <div className="provider-stage-cards" aria-label="Provider trust highlights">
            {providerStageCards.map((card) => (
              <article className="provider-stage-card" key={card.copy}>
                <span className="provider-stage-icon" aria-hidden="true">{card.icon}</span>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-showcase" id="our-services" aria-labelledby="services-title">
          <div className="section-intro reveal">
            <p className="eyebrow">Take a Look At Our</p>
            <h2 id="services-title">Our Services</h2>
            <p>Compounded care categories built around real patient needs.</p>
          </div>

          <div className="service-browser reveal">
            <div className="service-list" role="tablist" aria-label="Browse service categories">
              {services.map((service, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeService === index}
                  className={activeService === index ? 'is-active' : ''}
                  onClick={() => setActiveService(index)}
                  key={service.name}
                >
                  {service.name}
                </button>
              ))}
            </div>

            <article className="service-feature" aria-live="polite">
              <div className="service-media">
                <img src="/pages/assets/services-office-wide.jpg" alt="Cody Drug Rx team member supporting providers from a pharmacy workstation" />
              </div>
              <div className="service-detail">
                <p className="service-kicker">{selectedService.accent}</p>
                <h3>{selectedService.name}</h3>
                <p>{selectedService.copy}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="certifications" id="certifications" aria-labelledby="certifications-title">
          <p className="eyebrow">Certifications &amp; Trust</p>
          <h2 id="certifications-title" className="sr-only">Certifications and trust signals</h2>
          <div className="cert-grid">
            {certifications.map((cert) => (
              <article className="cert-card reveal" key={cert.label}>
                {cert.label === 'NABP*' ? (
                  <>
                    <img className="nabp-logo" src="/pages/assets/nabp-white.png" alt="" aria-hidden="true" />
                    <div>
                      <strong>{cert.label}</strong>
                      <span>{cert.detail}</span>
                    </div>
                  </>
                ) : cert.label === 'LegitScript' ? (
                  <>
                    <img className="legitscript-logo" src="/pages/assets/legitscript-certified.png" alt="" aria-hidden="true" />
                    <div>
                      <strong>{cert.label}</strong>
                      <span>{cert.detail}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cert-seal" aria-hidden="true">
                      <svg viewBox="0 0 48 48">
                        <path d="M24 5l16 7v11c0 10-6.2 16.7-16 20-9.8-3.3-16-10-16-20V12l16-7Z" />
                        <path d="M17 24l5 5 10-12" />
                      </svg>
                    </div>
                    <div>
                      <strong>{cert.label}</strong>
                      <span>{cert.detail}</span>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="services-cta" aria-labelledby="cta-title">
          <div className="cta-copy">
            <h2 id="cta-title">Ready to partner with <em>Cody Drug?</em></h2>
            <p>Access our provider portal to self-register, manage your account, and start working with our compounding team today.</p>
          </div>
          <div className="cta-action">
            <a className="btn btn-primary" href={PORTAL_REGISTER_URL} target="_blank" rel="noreferrer">Get Started</a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="site-footer">
        <div className="footer-grid">
          <div>
            <a className="footer-brand" href="/" aria-label="Cody Drug Rx home">
              <img src="/pages/assets/cody-drug-logo-red.png" alt="Cody Drug Rx" />
            </a>
            <p>Personalized medicine. Precision science. Patient-centered support.</p>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            <a href="/pages/about.html">About Us</a>
            <a href="/services/compounding">Services</a>
            <a href="/pages/providers.html">Providers</a>
          </div>
          <div className="footer-col">
            <h3>Actions</h3>
            <a href="https://portal.codydrugrx.com/" target="_blank" rel="noreferrer">Provider Portal</a>
            <a href="/#review">Refill</a>
            <a href="/pages/providers.html#consultation">Price List</a>
          </div>
          <div className="footer-col">
            <h3>Contact</h3>
            <a href="tel:+19038852639">(903) 885-2639</a>
            <a href="mailto:Lillian@codydrugrx.com">Lillian@codydrugrx.com</a>
            <span>Details pending final approval.</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Cody Drug Rx. All rights reserved.</p>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </>
  )
}

export default CompoundingPage
