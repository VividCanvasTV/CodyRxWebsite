import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect } from 'react'
import TreatmentAnimation from './TreatmentAnimation'
import DotMatrix from './DotMatrix'
import DotMatrixBanner from './DotMatrixBanner'
import ScrollSequence from './ScrollSequence'
import ScrollTextReveal from './ScrollTextReveal'

/* Reusable scroll parallax wrapper — moves Y and fades based on scroll position */
function ParallaxSection({ children, yRange = [-30, 30], opacityRange = [0.4, 1, 0.4] }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [yRange[0], 0, yRange[1]])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], opacityRange)
  return (
    <motion.div ref={ref} style={{ y, opacity }}>
      {children}
    </motion.div>
  )
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  viewport: { once: true, margin: "-100px" }
}

/* Slow stagger for services section (quarter original speed) */
const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1, transition: { staggerChildren: 0.6 } },
  viewport: { once: true, margin: "-100px" }
}

const staggerItem = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 2.8, ease: [0.22, 1, 0.36, 1] } }
}

/* Floating glass data panels — moved below the hero branding */
const glassCards = [
  {
    id: 'formulation',
    position: 'mid-left',
    label: 'FORMULATION ID',
    lines: ['CRX-9021-BETA', 'STATUS: ACTIVE COMPOUNDING'],
  },
  {
    id: 'dosage',
    position: 'mid-left-low',
    label: 'DOSAGE READOUT',
    value: '10.0',
    unit: 'MG / ML',
    target: '10',
    hasChart: true,
  },
  {
    id: 'synthesis',
    position: 'mid-right',
    label: 'SYNTHESIS PROGRESS',
    percentage: '87%',
    subline: 'Estimated time remaining',
  },
  {
    id: 'quality',
    position: 'bottom-right',
    label: 'QUALITY CONTROL',
    lines: ['PASSED - SPECTROSCOPY, HPLC, MICROBIOLOGY'],
  },
]

const serviceCards = [
  {
    title: 'PRECISION LABS',
    copy: 'State-of-the-art facilities dedicated to your unique needs.',
    image: '/sterile_lab.webp',
  },
  {
    title: 'CUSTOM FORMULATIONS',
    copy: 'Tailored dosages and delivery systems for optimal efficacy.',
    image: '/science_powder.webp',
  },
  {
    title: 'EXPERT PHARMACISTS',
    copy: 'Collaborative care with top-tier medical professionals.',
    image: '/professional_health.webp',
  },
]

const processSteps = [
  {
    step: '01',
    title: 'Private review',
    copy: 'Start with goals, background, and eligibility so the formulation path is clear before anything is prepared.',
  },
  {
    step: '02',
    title: 'Protocol shaping',
    copy: 'Dose logic, preparation details, and fulfillment requirements are tightened into one coherent plan.',
  },
  {
    step: '03',
    title: 'Delivery and follow-through',
    copy: 'Support continues through storage guidance, refill timing, and the questions that appear after arrival.',
  },
]

const assuranceCards = [
  {
    title: 'Eligibility first',
    copy: 'Not every inquiry should become a product. Review exists to protect fit, expectations, and long-term trust.',
  },
  {
    title: 'Clear communication',
    copy: 'Storage, next steps, and follow-up timing should never arrive as an afterthought once the vial lands.',
  },
  {
    title: 'Premium presentation',
    copy: 'The vial, the packaging, and the information surrounding it should all communicate the same level of care.',
  },
  {
    title: 'Longer-horizon support',
    copy: 'When a protocol continues, the cadence for review, refill, and questions should remain dependable.',
  },
]

function scrollToSection(target) {
  document.getElementById(target)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

/* Mini chart SVG for dosage panel */
function MiniChart() {
  return (
    <svg viewBox="0 0 120 40" className="glass-card__chart" fill="none">
      <polyline
        points="0,35 15,28 30,30 45,18 60,22 75,12 90,15 105,8 120,5"
        stroke="#E50914"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E50914" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#E50914" stopOpacity="0" />
      </linearGradient>
      <polygon
        points="0,40 0,35 15,28 30,30 45,18 60,22 75,12 90,15 105,8 120,5 120,40"
        fill="url(#chartGrad)"
      />
    </svg>
  )
}

/* Circular progress ring for synthesis panel */
function ProgressRing({ percentage = 87 }) {
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg viewBox="0 0 44 44" className="glass-card__ring">
      <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
      <circle
        cx="22" cy="22" r="18"
        stroke="#E50914"
        strokeWidth="3"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </svg>
  )
}

function GlassCard({ card, delay = 0 }) {
  return (
    <motion.div
      className={`glass-card glass-card--${card.position}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.8 + delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Connector line */}
      <div className={`glass-card__connector glass-card__connector--${card.position}`} />

      <div className="glass-card__label">{card.label}</div>

      {card.hasChart && (
        <div className="glass-card__dosage">
          <div className="glass-card__dosage-row">
            <span className="glass-card__dosage-label">TARGET:</span>
            <span className="glass-card__dosage-value">{card.target} <small>MG / ML</small></span>
          </div>
          <div className="glass-card__dosage-row">
            <span className="glass-card__dosage-label">CURRENT:</span>
            <span className="glass-card__dosage-value glass-card__dosage-value--large">{card.value} <small>{card.unit}</small></span>
          </div>
          <MiniChart />
        </div>
      )}

      {card.percentage && (
        <div className="glass-card__synthesis">
          <ProgressRing percentage={parseInt(card.percentage)} />
          <div className="glass-card__synthesis-text">
            <span className="glass-card__percentage">{card.percentage}</span>
            <span className="glass-card__percentage-label">COMPLETE</span>
          </div>
        </div>
      )}

      {card.lines && !card.hasChart && !card.percentage && (
        <div className="glass-card__lines">
          {card.lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      )}

      {card.subline && (
        <div className="glass-card__subline">{card.subline}</div>
      )}
    </motion.div>
  )
}


export default function Overlay() {
  return (
    <main className="page-shell">
      {/* ===== HERO SECTION ===== */}
      <section className="section hero-section hero-section--intro" id="top">
        {/* Top-right branding block */}
        <motion.div
          className="hero-branding"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="hero-branding__name">
            Cody Drug<br />R<span className="hero-branding__rx">x</span>
          </h2>
          <p className="hero-branding__tagline">
            Personalized Medicine, Precision Science.<br />
            Experience the future of pharmaceutical care.
          </p>
          <div className="hero-branding__actions">
            <button className="button button--solid" type="button" onClick={() => scrollToSection('review')}>
              Request Private Review
            </button>
            <button className="button button--ghost" type="button" onClick={() => scrollToSection('services')}>
              Our Services
            </button>
          </div>
        </motion.div>

        {/* Floating glass panels — lower area */}
        <div className="glass-cards-layer">
          {glassCards.map((card, i) => (
            <GlassCard key={card.id} card={card} delay={i * 0.12} />
          ))}
        </div>

        <motion.div className="hero-bottom" {...fadeUp}>
          <h1 className="hero-headline">
            Compounded<br />for You.
          </h1>
        </motion.div>
      </section>

      {/* ===== LOGO TICKER ===== */}
      <section className="section section--logo-ticker">
        <div className="logo-ticker-track">
          <div className="logo-ticker-slide">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="ticker-logo">CodyDrug R<sub>x</sub></span>
            ))}
          </div>
          <div className="logo-ticker-slide" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span key={`d-${i}`} className="ticker-logo">CodyDrug R<sub>x</sub></span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CODY PANELS — full width ===== */}
      <section className="section section--panels" id="panels">
        <div className="cody-panels-wrapper">
          {/* Card 1: Precision (Black) — enters from left */}
          <motion.div
            className="cody-card card-black"
            initial={{ opacity: 0, y: 120, scale: 0.88 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >PRECISION IN<br />EVERY DOSE</motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >Cody Drug Rx provides reliable, high-quality pharmaceutical solutions. Our commitment to excellence ensures superior healthcare.</motion.p>
            <motion.div
              className="cody-side-label"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              PHARMACEUTICAL<br />EXCELLENCE
            </motion.div>
            <motion.img
              src="/assets/vial-1.webp" alt="Precision Vial" className="cody-vial-img"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            />
          </motion.div>

          {/* Card 2: Advanced Rx (White) — enters from bottom, text from right */}
          <motion.div
            className="cody-card card-white"
            initial={{ opacity: 0, y: 120, scale: 0.88 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.h2
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >ADVANCED RX<br />FORMULATIONS</motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >Explore our specialized range of compounded medications and prescription services tailored for patient health.</motion.p>
            <motion.img
              src="/assets/vial-2.webp" alt="Advanced Formulary Vial" className="cody-vial-img"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            />
            <motion.div
              className="cody-card-bottom"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <button className="cody-btn-red" type="button" onClick={() => scrollToSection('protocol')}>
                LEARN MORE &gt;
              </button>
              <span className="cody-bottom-tag">STATE-OF-THE-ART CARE</span>
            </motion.div>
          </motion.div>

          {/* Card 3: Contact (Red) — enters from right */}
          <motion.div
            className="cody-card card-red"
            initial={{ opacity: 0, y: 120, scale: 0.88 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >CONTACT &amp;<br />SERVICES</motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >Experience expert pharmaceutical guidance and dedicated support. Reach our team for personalized prescription management.</motion.p>
            <motion.img
              src="/assets/vial-3.webp" alt="Global Reach Vial" className="cody-vial-img"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            />
            <motion.div
              className="cody-contact-info"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              CALL: (800) 555-0199<br />
              EMAIL: info@codyrx.com<br />
              LOCATION: NEW YORK, NY
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== STRIPE DIVIDER ===== */}
      <div className="stripe-divider">
        <motion.div
          className="stripe-divider__bar stripe-divider__bar--white"
          initial={{ x: '-100%' }}
          whileInView={{ x: '0%' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        />
        <motion.div
          className="stripe-divider__bar stripe-divider__bar--red"
          initial={{ x: '100%' }}
          whileInView={{ x: '0%' }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        />
        <motion.div
          className="stripe-divider__bar stripe-divider__bar--white-thin"
          initial={{ x: '-100%' }}
          whileInView={{ x: '0%' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-50px' }}
        />
      </div>

      {/* ===== TWO-PANEL FEATURE ===== */}
      <section className="section section--two-panel">
        <motion.div
          className="two-panel"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <div className="two-panel__left">
            <img src="/assets/panel-black.webp" alt="Cody Drug Rx - Precision in Every Dose" className="two-panel__img" />
          </div>
          <div className="two-panel__right two-panel__right--hero" style={{ backgroundImage: 'url(/assets/panel-red.webp)', backgroundSize: 'cover', backgroundPosition: 'right center' }}>
            <div className="two-panel__right-content">
              <span className="two-panel__eyebrow">ADVANCED THERAPY</span>
              <h2 className="two-panel__title">The Future<br />of Skin<br />Wellness</h2>
              <p className="two-panel__body">Precision LED light therapy, custom-compounded serums, and clinical-grade formulations — tailored to your skin.</p>
              <a href="#services" className="two-panel__cta">EXPLORE TREATMENTS</a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== DOT MATRIX BANNER — Cody Drug Rx reveal ===== */}
      <DotMatrixBanner />

      {/* ===== SCROLL SEQUENCE 2 — Vial fall above Expert Care ===== */}
      <div style={{ position: 'relative', marginTop: '-100vh', zIndex: 0 }}>
        <ScrollSequence
          totalFrames={89}
          framePath="/assets/vial-fall-1/frame_"
          height="450vh"
          startFrame={40}
          triggerMode="top"
        >
          {(progress) => {
            // Video plays 0-0.5, text appears 0.5-0.8, text fades 0.8-1.0
            const textIn = Math.max(0, Math.min(1, (progress - 0.45) / 0.2))
            const textOut = Math.max(0, Math.min(1, (progress - 0.8) / 0.2))
            const textOpacity = textIn * (1 - textOut)
            if (textOpacity <= 0) return null

            return (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6vw',
                pointerEvents: 'none',
                zIndex: 2,
              }}>
                {/* Left text */}
                <div style={{
                  textAlign: 'right',
                  opacity: textOpacity,
                  transform: `translateX(${(1 - textIn) * -60 - textOut * 60}px)`,
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(18px, 2.5vw, 36px)',
                    fontWeight: 500,
                    letterSpacing: '3px',
                    lineHeight: 1.2,
                    marginBottom: '16px',
                    whiteSpace: 'nowrap',
                  }}>
                    <span className="luxury-word" style={{ color: '#111111', textShadow: '0 2px 15px rgba(255,255,255,0.3)' }}>PRECISION</span>
                    {'\u00A0'}
                    <span className="luxury-word luxury-word--delayed" style={{ color: '#E50914', textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}>COMPOUNDING</span>
                  </div>
                </div>

                {/* Right text */}
                <div style={{
                  textAlign: 'left',
                  opacity: textOpacity,
                  transform: `translateX(${(1 - textIn) * 60 + textOut * 60}px)`,
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(18px, 2.5vw, 36px)',
                    fontWeight: 500,
                    letterSpacing: '3px',
                    lineHeight: 1.2,
                    marginBottom: '16px',
                    whiteSpace: 'nowrap',
                  }}>
                    <span className="luxury-word luxury-word--delayed" style={{ color: '#E50914', textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}>PERSONALIZED</span>
                    {'\u00A0'}
                    <span className="luxury-word" style={{ color: '#111111', textShadow: '0 2px 15px rgba(255,255,255,0.3)' }}>MEDICINE</span>
                  </div>
                </div>
              </div>
            )
          }}
        </ScrollSequence>
      </div>

      {/* ===== SERVICES PANEL — Expert Care ===== */}
      <section className="section section--services-panel" id="expert-care">
        <motion.div
          className="services-panel-wrapper"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Left Section (Pharmacy Image Bg) */}
          <div className="sp-left">
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >EXPERT CARE &amp;<br />WELLNESS SOLUTIONS</motion.h2>
            <motion.p
              className="sp-subheading"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >Personalized pharmaceutical services tailored for your health journey.</motion.p>
            <motion.button
              className="sp-btn-red"
              type="button"
              onClick={() => scrollToSection('services')}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >OUR PHARMACY SERVICES</motion.button>
            <motion.ul
              className="sp-services-list"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <li>Prescriptions</li>
              <li>Consultations</li>
              <li>Compounding</li>
              <li>Screenings</li>
            </motion.ul>
          </div>

          {/* Middle Section */}
          <div className="sp-middle">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >COMPREHENSIVE<br />PHARMACEUTICAL<br />CARE</motion.h2>
            <motion.p
              className="sp-body-text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >At Cody Drug Rx, we prioritize your health with exceptional service, precision, and dedication. Our highly qualified team ensures accurate prescriptions and personalized attention.</motion.p>

            <motion.div
              className="sp-features"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <div className="sp-feature-item">
                <div className="sp-feature-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 6V8H20V6H4ZM6 10V14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14V10H6ZM17 4H7V2H17V4Z" fill="white"/></svg>
                </div>
                <div className="sp-feature-content">
                  <h4>Medication Management</h4>
                  <p>Personalized guidance and adherence support</p>
                </div>
              </div>
              <div className="sp-feature-item">
                <div className="sp-feature-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="white"/></svg>
                </div>
                <div className="sp-feature-content">
                  <h4>Wellness Screenings</h4>
                  <p>In-depth health assessments and monitoring</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              className="sp-btn-black"
              type="button"
              onClick={() => scrollToSection('review')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >BOOK A CONSULTATION</motion.button>
          </div>

          {/* Right Section (Doctor Portrait) */}
          <div className="sp-right">
            <motion.div
              className="sp-doctor-img"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <img src="/assets/doctor-portrait.webp" alt="Doctor providing expert care" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >YOUR PARTNER<br />IN HEALTH</motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >Explore our resources and expert support for a healthier life.</motion.p>
            <motion.button
              className="sp-btn-red-full"
              type="button"
              onClick={() => scrollToSection('review')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >VISIT PATIENT PORTAL</motion.button>
          </div>
        </motion.div>
      </section>

      {/* ===== ICON SHOWCASE — Red with white line icons ===== */}
      <section className="section section--icon-showcase">
        <div className="icon-showcase">
          {[
            { label: 'SPECIALTY\nMEDICATIONS', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="24" y="12" width="22" height="38" rx="4" /><rect x="28" y="26" width="14" height="10" /><line x1="35" y1="8" x2="35" y2="12" /><line x1="31" y1="50" x2="31" y2="54" /><line x1="39" y1="50" x2="39" y2="54" />
                <ellipse cx="52" cy="58" rx="7" ry="14" transform="rotate(-30 52 58)" /><line x1="48" y1="58" x2="56" y2="58" />
              </svg>
            )},
            { label: 'CUSTOM\nCOMPOUNDING', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M25 18h20v8l10 30a6 6 0 01-6 8H21a6 6 0 01-6-8l10-30v-8z" /><line x1="25" y1="18" x2="45" y2="18" /><path d="M22 48c5-3 11-3 16 0s11 3 16 0" />
              </svg>
            )},
            { label: 'PRESCRIPTION\nDELIVERY', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="12" y="28" width="42" height="28" rx="3" /><path d="M54 40h10l8 10v6h-18" /><circle cx="24" cy="58" r="6" /><circle cx="58" cy="58" r="6" /><line x1="30" y1="56" x2="52" y2="56" />
              </svg>
            )},
            { label: 'QUALITY\nASSURANCE', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M40 10l8 3c6 2 12 2 18-1v24c0 14-10 24-26 30-16-6-26-16-26-30V12c6 3 12 3 18 1z" /><polyline points="28,40 36,48 52,32" />
              </svg>
            )},
            { label: 'PATIENT\nCONSULTATIONS', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="32" cy="28" r="10" /><path d="M14 58c0-10 8-18 18-18s18 8 18 18" /><circle cx="56" cy="32" r="7" /><path d="M52 58c0-7 4-13 10-15" />
              </svg>
            )},
            { label: 'LAB\nTESTING', icon: (
              <svg viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M30 12v22l-14 26a5 5 0 004 8h40a5 5 0 004-8L50 34V12" /><line x1="28" y1="12" x2="52" y2="12" /><path d="M26 52h28" /><circle cx="36" cy="46" r="2" fill="#fff" /><circle cx="46" cy="56" r="2.5" fill="#fff" />
              </svg>
            )},
          ].map((item, i) => (
            <motion.div
              className="icon-showcase__item"
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: '-40px' }}
            >
              <div className="icon-showcase__icon">{item.icon}</div>
              <h3 className="icon-showcase__label">{item.label.split('\n').map((line, j) => <span key={j}>{line}<br /></span>)}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SERVICES CARDS ===== */}
      <section className="section section--services" id="services">
        <div className="section-shell">
          <motion.div
            className="services-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {serviceCards.map((card) => (
              <motion.article key={card.title} className="service-card" variants={staggerItem}>
                <div
                  className="service-card__image"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(9,9,11,0) 40%, rgba(9,9,11,0.95) 100%), url(${card.image})`,
                  }}
                />
                <div className="service-card__body">
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Carousel dots */}
          <div className="carousel-dots">
            <span className="carousel-dot carousel-dot--active" />
            <span className="carousel-dot carousel-dot--active" />
            <span className="carousel-dot carousel-dot--active" />
            <span className="carousel-dot" />
          </div>
        </div>
      </section>

      {/* ===== TREATMENT ANIMATION ===== */}
      <section className="section section--treatment-anim">
        <div style={{ position: 'absolute', inset: 0, background: '#09090b', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <TreatmentAnimation />
        </div>
      </section>

      {/* ===== PROCESS — Dot Matrix ===== */}
      <section className="section section--process" id="protocol" style={{ padding: 0 }}>
        <DotMatrix />
      </section>

      {/* ===== ASSURANCE ===== */}
      <section className="section section--assurance" id="review">
        <div className="section-shell">
          <motion.div className="section-header" {...fadeUp}>
            <p className="section-kicker">Review + Assurance</p>
            <h2>Built on precision, trust, and clinical seriousness.</h2>
          </motion.div>

          <motion.div
            className="assurance-grid"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
          >
            {assuranceCards.map((card) => (
              <motion.article key={card.title} className="surface-card assurance-card" variants={staggerItem}>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== VIAL LANDING — scroll-driven centering ===== */}
      <section className="section section--vial-landing" id="vial-landing">
        <div className="vial-landing-content">
          <motion.p
            className="vial-landing-kicker"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >CUSTOM COMPOUNDING</motion.p>
          <motion.h2
            className="vial-landing-headline"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >Your Formula.<br />Precision-Built.</motion.h2>
          <motion.p
            className="vial-landing-body"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >Every compound is prepared to exact specifications — your protocol, your dosage, delivered with clinical precision.</motion.p>
          <motion.button
            className="vial-landing-btn"
            type="button"
            onClick={() => scrollToSection('review')}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >BEGIN YOUR PROTOCOL</motion.button>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section footer-cta">
        <div className="section-shell">
          <motion.div className="surface-card footer-panel" {...fadeUp}>
            <div className="footer-panel__copy">
              <p className="section-kicker">Private Intake</p>
              <h2>Begin with a calmer review process.</h2>
              <p>
                The final step is a private, premium intake designed around
                your specific protocol needs.
              </p>
            </div>

            <div className="cta-form">
              <input type="email" placeholder="name@email.com" aria-label="Email address" />
              <button className="button button--solid" type="button" style={{ width: '100%' }}>
                Request Access
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="section-shell site-footer__inner">
          <span className="site-footer__copy">Cody Rx | &copy; {new Date().getFullYear()} All Rights Reserved</span>
          <div className="site-footer__socials">
            <a href="#" aria-label="X / Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
