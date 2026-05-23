import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useRef, useState, useEffect } from 'react'
import ScrollSequence from './ScrollSequence'
import './BrighterHome.css'

const ease = [0.16, 1, 0.3, 1]
const StateLicenseMap3D = lazy(() => import('./StateLicenseMap3D'))

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease },
  viewport: { once: true, margin: '-80px' },
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ─────────────────────────────────────────────
   NAVBAR — consolidated mega menu
───────────────────────────────────────────── */
const PROVIDER_PORTAL_URL = 'https://portal.codydrugrx.com/'
const PROVIDERS_PAGE_URL = '/pages/providers.html'
const PROVIDERS_CONSULT_URL = '/pages/providers.html#consultation'
const LIVE_RX_CONSULT_URL = '/pages/virtual-consult.html'
const REFILL_URL = '/#review'
const ABOUT_PAGE_URL = '/pages/about.html'
const SERVICES_PAGE_URL = '/services/compounding'
const COMPOUNDING_PAGE_URL = '/services/compounding'
const CAREERS_URL = '/pages/careers.html'
const LICENSES_URL = '/pages/about.html#licenses'
const EVENTS_URL = '/pages/events.html'
const RESOURCES_URL = '/pages/resources.html'
const PRODUCTS_URL = '/#products'
const CONTACT_URL = '/pages/contact.html'
const MEGA_PANEL_WIDTH = 360
const MEGA_PANEL_GUTTER = 28
const HERO_SEQUENCE_FRAMES = 265
const HERO_SEQUENCE_SPLIT_FRAME = 50
const HERO_SEQUENCE_PATH = '/assets/holding-vial-dark/frame_'
const HERO_SEQUENCE_EXTENSION = 'png'
const HERO_SEQUENCE_INTRO_HEIGHT_VH = 220
const HERO_SEQUENCE_FULL_HEIGHT_VH = 560
const HERO_SEQUENCE_HEIGHT = `${HERO_SEQUENCE_FULL_HEIGHT_VH}vh`
const HERO_SEQUENCE_INTRO_PROGRESS = (HERO_SEQUENCE_INTRO_HEIGHT_VH - 100) / (HERO_SEQUENCE_FULL_HEIGHT_VH - 100)

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function getHomeSequenceFrameIndex(progress) {
  const splitIndex = HERO_SEQUENCE_SPLIT_FRAME - 1
  const maxIndex = HERO_SEQUENCE_FRAMES - 1

  if (progress <= HERO_SEQUENCE_INTRO_PROGRESS) {
    const localProgress = clamp01(progress / HERO_SEQUENCE_INTRO_PROGRESS)
    const playProgress = clamp01((localProgress - 0.05) / 0.95)
    return Math.min(splitIndex, Math.floor(playProgress * HERO_SEQUENCE_SPLIT_FRAME))
  }

  const extensionProgress = clamp01((progress - HERO_SEQUENCE_INTRO_PROGRESS) / (1 - HERO_SEQUENCE_INTRO_PROGRESS))
  return Math.min(maxIndex, splitIndex + Math.floor(extensionProgress * (maxIndex - splitIndex + 1)))
}

function getHeroExtensionProgress(progress) {
  return clamp01((progress - HERO_SEQUENCE_INTRO_PROGRESS) / (1 - HERO_SEQUENCE_INTRO_PROGRESS))
}

function getHeroEndCoverStyle(progress) {
  const raw = clamp01((progress - 0.9) / 0.1)
  const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2

  return {
    opacity: eased,
    transform: `translateY(${(1 - eased) * 110}px)`,
  }
}

function useNearViewport(ref, rootMargin = '1000px 0px') {
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (isNear) return undefined

    const node = ref.current
    if (!node) return undefined

    if (!('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setIsNear(true), 0)
      return () => window.clearTimeout(fallbackTimer)
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsNear(true)
      observer.disconnect()
    }, { rootMargin })

    observer.observe(node)

    return () => observer.disconnect()
  }, [isNear, ref, rootMargin])

  return isNear
}

const MEGA_MENU_CONTENT = {
  'about-us': {
    columns: [
      {
        title: 'About Us',
        links: [
          { href: SERVICES_PAGE_URL, label: 'Services' },
          { href: CAREERS_URL, label: 'Careers' },
          { href: EVENTS_URL, label: 'Events' },
          { href: LICENSES_URL, label: 'Licenses' },
        ],
      },
    ],
  },
  services: {
    columns: [
      {
        title: 'Services',
        links: [
          { href: COMPOUNDING_PAGE_URL, label: 'Compounding' },
          { href: SERVICES_PAGE_URL, label: 'Vaccines' },
          { href: SERVICES_PAGE_URL, label: 'Medicine' },
        ],
      },
    ],
  },
  providers: {
    columns: [
      {
        title: 'Providers',
        links: [
          { href: PROVIDER_PORTAL_URL, label: 'Provider Portal', external: true },
          { href: PROVIDERS_CONSULT_URL, label: 'Provider Inquiry' },
        ],
      },
    ],
  },
  products: {
    columns: [
      {
        title: 'Products',
        links: [
          { href: PRODUCTS_URL, label: 'Supplements' },
          { href: COMPOUNDING_PAGE_URL, label: 'Compounds' },
        ],
      },
    ],
  },
}

function MegaMenuPanel({ sectionId, variant = 'top' }) {
  const section = MEGA_MENU_CONTENT[sectionId]

  if (!section) return null

  return (
    <div className={`bh-mega-inner bh-mega-sitemap bh-mega-sitemap--simple ${variant === 'side' ? 'bh-mega-inner--side' : ''}`}>
      {section.columns.map((column) => (
        <div key={column.title} className="bh-mega-col">
          <p className="bh-mega-col-title">{column.title}</p>
          {column.links.map((link) => (
            <a
              key={`${column.title}-${link.label}`}
              href={link.href}
              className="bh-mega-link"
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
            >
              {link.label}
              {link.chip ? <span className="bh-mega-chip">{link.chip}</span> : null}
            </a>
          ))}
        </div>
      ))}
    </div>
  )
}

function SplitMenuGlyph({ className = '' }) {
  return (
    <span className={`bh-split-glyph ${className}`.trim()} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  )
}

export function BrighterNavbar({ logoHref = '#top', logoScroll = true } = {}) {
  const [navMode, setNavMode] = useState('top')
  const [openMenu, setOpenMenu] = useState(null)
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [sideSection, setSideSection] = useState('about-us')
  const [megaAnchorX, setMegaAnchorX] = useState(null)
  const closeTimer = useRef(null)
  const navRef = useRef(null)

  const primaryMenuSections = [
    { id: 'about-us', label: 'About Us', href: ABOUT_PAGE_URL },
    { id: 'services', label: 'Services', href: SERVICES_PAGE_URL },
    { id: 'providers', label: 'Providers', href: PROVIDERS_PAGE_URL },
  ]
  const productSection = { id: 'products', label: 'Products', href: PRODUCTS_URL }
  const sideSections = [
    {
      id: 'about-us',
      label: 'About Us',
      eyebrow: 'Core company pages',
      description: 'Keep About Us focused on the company layer and the pages Lillian called out under it.',
      links: [
        { href: SERVICES_PAGE_URL, label: 'Services' },
        { href: CAREERS_URL, label: 'Careers' },
        { href: EVENTS_URL, label: 'Events' },
        { href: LICENSES_URL, label: 'Licenses' },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      eyebrow: 'Service breakdown',
      description: 'This lane is now just the three service labels you asked for, with no extra filler links.',
      links: [
        { href: COMPOUNDING_PAGE_URL, label: 'Compounding' },
        { href: SERVICES_PAGE_URL, label: 'Vaccines' },
        { href: SERVICES_PAGE_URL, label: 'Medicine' },
      ],
    },
    {
      id: 'providers',
      label: 'Providers',
      eyebrow: 'Provider access',
      description: 'Provider traffic now stays limited to the portal and the price list route.',
      links: [
        { href: PROVIDER_PORTAL_URL, label: 'Provider Portal', external: true },
        { href: PROVIDERS_CONSULT_URL, label: 'Provider Inquiry' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      eyebrow: 'Standalone section',
      description: 'Resources stays by itself instead of growing another submenu.',
      links: [
        { href: RESOURCES_URL, label: 'Resources' },
      ],
    },
    {
      id: 'products',
      label: 'Products',
      eyebrow: 'Supplements and compounds',
      description: 'Products is now just the two product lanes you called out.',
      links: [
        { href: PRODUCTS_URL, label: 'Supplements' },
        { href: COMPOUNDING_PAGE_URL, label: 'Compounds' },
      ],
    },
    {
      id: 'contact',
      label: 'Contact',
      eyebrow: 'Direct contact',
      description: 'Contact stays clean and direct instead of turning into a utility cluster.',
      links: [
        { href: CONTACT_URL, label: 'Contact' },
      ],
    },
  ]
  const flatLinks = [
    { href: RESOURCES_URL, label: 'Resources' },
  ]
  const topRedirects = [
    { href: PROVIDER_PORTAL_URL, label: 'Provider Portal', external: true, className: 'bh-nav-shortcut' },
    { href: LIVE_RX_CONSULT_URL, label: 'Live Rx Consult', className: 'bh-nav-shortcut' },
    { href: REFILL_URL, label: 'Refill', className: 'bh-btn bh-btn-primary bh-nav-cta' },
  ]
  const activeSideSection = sideSections.find(({ id }) => id === sideSection) ?? sideSections[0]

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const positionMegaMenu = (target) => {
    if (!target || !navRef.current) return

    const navRect = navRef.current.getBoundingClientRect()
    const triggerRect = target.getBoundingClientRect()
    const center = triggerRect.left + triggerRect.width / 2 - navRect.left
    const min = MEGA_PANEL_GUTTER + MEGA_PANEL_WIDTH / 2
    const max = navRect.width - MEGA_PANEL_GUTTER - MEGA_PANEL_WIDTH / 2
    const nextAnchor = navRect.width <= MEGA_PANEL_WIDTH + MEGA_PANEL_GUTTER * 2
      ? navRect.width / 2
      : Math.min(Math.max(center, min), max)

    setMegaAnchorX(nextAnchor)
  }

  const open = (menu, event) => {
    if (navMode !== 'top') return
    cancelClose()
    setSideMenuOpen(false)
    positionMegaMenu(event?.currentTarget)
    setOpenMenu(menu)
  }

  const scheduleClose = () => {
    if (navMode !== 'top') return
    cancelClose()
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null)
      setMegaAnchorX(null)
      closeTimer.current = null
    }, 260)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paramMode = params.get('nav')
    const paramMenu = params.get('menu')
    const paramSection = params.get('section')
    const hasParamMode = paramMode === 'top' || paramMode === 'side'

    if (hasParamMode) {
      setNavMode(paramMode)
    } else {
      const storedMode = window.localStorage.getItem('bh-nav-mode')
      if (storedMode === 'top' || storedMode === 'side') {
        setNavMode(storedMode)
      }
    }

    if (sideSections.some(({ id }) => id === paramSection)) {
      setSideSection(paramSection)
    }

    if (paramMode === 'side' && paramMenu === 'open') {
      setSideMenuOpen(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('bh-nav-mode', navMode)
  }, [navMode])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMegaAnchorX(null)
        setSideMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const changeNavMode = (mode) => {
    setNavMode(mode)
    setOpenMenu(null)
    setMegaAnchorX(null)
    setSideMenuOpen(false)
    if (mode === 'side') setSideSection('about-us')
  }

  const toggleSideMenu = () => {
    setOpenMenu(null)
    setMegaAnchorX(null)
    setSideMenuOpen((current) => !current)
  }

  const handleSidePanelClick = (e) => {
    if (e.target.closest('a')) {
      setSideMenuOpen(false)
    }
  }

  const renderMenuContent = (id, variant = 'top') => {
    return <MegaMenuPanel sectionId={id} variant={variant} />
  }

  return (
    <>
    <nav
      ref={navRef}
      className={`bh-navbar ${navMode === 'top' && openMenu ? 'is-mega-open' : ''} ${navMode === 'side' ? 'is-side-mode' : ''}`}
      onMouseEnter={navMode === 'top' ? cancelClose : undefined}
      onMouseLeave={navMode === 'top' ? scheduleClose : undefined}
    >
      <div className="bh-nav-container">
        <a
          href={logoHref}
          className="bh-logo"
          onClick={(e) => {
            if (logoScroll) {
              e.preventDefault()
              scrollToId('top')
            }
            setOpenMenu(null)
            setSideMenuOpen(false)
          }}
          onMouseEnter={() => setOpenMenu(null)}
        >
          <img className="bh-logo-img" src="/pages/assets/cody-drug-logo-red.png" alt="Cody Drug Rx" />
        </a>

        {navMode === 'top' ? (
          <div className="bh-nav-links">
            {primaryMenuSections.map((section) => (
              section.href ? (
                <a
                  key={section.id}
                  href={section.href}
                  className={`bh-nav-trigger ${openMenu === section.id ? 'is-open' : ''}`}
                  onMouseEnter={(e) => open(section.id, e)}
                  aria-expanded={openMenu === section.id}
                >
                  {section.label}
                  <svg className="bh-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </a>
              ) : (
                <button
                  key={section.id}
                  type="button"
                  className={`bh-nav-trigger ${openMenu === section.id ? 'is-open' : ''}`}
                  onMouseEnter={(e) => open(section.id, e)}
                  onClick={(e) => open(section.id, e)}
                  aria-expanded={openMenu === section.id}
                >
                  {section.label}
                  <svg className="bh-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )
            ))}
            {flatLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="bh-nav-link"
                onMouseEnter={() => setOpenMenu(null)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={productSection.href}
              className={`bh-nav-trigger ${openMenu === productSection.id ? 'is-open' : ''}`}
              onMouseEnter={(e) => open(productSection.id, e)}
              aria-expanded={openMenu === productSection.id}
            >
              {productSection.label}
              <svg className="bh-nav-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
            <a
              href={CONTACT_URL}
              className="bh-nav-link"
              onMouseEnter={() => setOpenMenu(null)}
            >
              Contact
            </a>
          </div>
        ) : (
          <div className="bh-nav-side-anchor">
            <button
              type="button"
              className={`bh-nav-side-open ${sideMenuOpen ? 'is-open' : ''}`}
              onClick={toggleSideMenu}
              aria-expanded={sideMenuOpen}
              aria-controls="bh-side-nav-panel"
            >
              <SplitMenuGlyph className="bh-nav-side-open-mark" />
              <span>{sideMenuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        )}

        <div className="bh-nav-actions">
          <div className="bh-nav-shortcuts">
            {topRedirects.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={link.className}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            className={`bh-nav-mode-toggle ${navMode === 'side' ? 'is-side' : ''}`}
            onClick={() => changeNavMode(navMode === 'top' ? 'side' : 'top')}
            aria-label={navMode === 'top' ? 'Switch to side menu layout' : 'Switch to top bar layout'}
            aria-pressed={navMode === 'side'}
            title={navMode === 'top' ? 'Switch to side menu' : 'Switch to top bar'}
          >
            <span className="bh-nav-mode-toggle-icon" aria-hidden="true">
              {navMode === 'top' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="18" y2="18" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {navMode === 'top' && openMenu && (
          <motion.div
            key={openMenu}
            className="bh-mega-panel"
            style={megaAnchorX ? { left: `${megaAnchorX}px` } : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {renderMenuContent(openMenu)}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {navMode === 'top' && openMenu && (
          <motion.div
            className="bh-mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

    </nav>
      <AnimatePresence>
        {navMode === 'side' && sideMenuOpen && (
          <>
            <motion.button
              type="button"
              className="bh-side-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease }}
              onClick={() => setSideMenuOpen(false)}
              aria-label="Close side menu"
            />
            <motion.aside
              id="bh-side-nav-panel"
              className="bh-side-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.34, ease }}
            >
              <div className="bh-side-shell">
                <div className="bh-side-rail">
                  <button
                    type="button"
                    className="bh-side-close"
                    onClick={() => setSideMenuOpen(false)}
                    aria-label="Close side menu"
                  >
                    Close
                  </button>

                  <div className="bh-side-rail-spacer" aria-hidden="true" />

                  <div className="bh-side-rail-footer">
                    <p className="bh-side-rail-label">Cody Drug Rx</p>
                    <p className="bh-side-rail-note">Personalized medicine. Precision science.</p>
                    <div className="bh-side-rail-actions">
                      {topRedirects.map((link) => (
                        <a
                          key={`side-${link.label}`}
                          href={link.href}
                          className={`bh-side-direct-link ${link.className.includes('bh-btn') ? 'is-primary' : ''}`}
                          onClick={() => setSideMenuOpen(false)}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noreferrer' : undefined}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                    <a href="mailto:info@codyrx.com" className="bh-side-direct-link" onClick={() => setSideMenuOpen(false)}>
                      info@codyrx.com
                    </a>
                    <a href="tel:8005550199" className="bh-side-direct-link" onClick={() => setSideMenuOpen(false)}>
                      (800) 555-0199
                    </a>
                    <button
                      type="button"
                      className="bh-side-return"
                      onClick={() => changeNavMode('top')}
                    >
                      Switch to top bar
                    </button>
                  </div>
                </div>

                <div className="bh-side-stage" onClickCapture={handleSidePanelClick}>
                  <div className="bh-side-stage-head">
                    <p className="bh-side-panel-kicker">Side navigation</p>
                    <p className="bh-side-panel-title">Cody Rx menu</p>
                  </div>

                  <div className="bh-side-section-list">
                    {sideSections.map((section) => {
                      const isActive = activeSideSection.id === section.id

                      return (
                        <div
                          key={section.id}
                          className={`bh-side-section ${isActive ? 'is-active' : ''}`}
                        >
                          <button
                            type="button"
                            className="bh-side-section-trigger"
                            onClick={() => setSideSection(section.id)}
                          >
                            {isActive ? <SplitMenuGlyph className="bh-side-section-mark" /> : <span className="bh-side-section-mark bh-side-section-mark--ghost" aria-hidden="true" />}
                            <span className="bh-side-section-name">{section.label}</span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.div
                                className="bh-side-section-detail"
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.24, ease }}
                              >
                                <p className="bh-side-section-eyebrow">{section.eyebrow}</p>
                                <p className="bh-side-section-copy">{section.description}</p>
                                <div className="bh-side-section-links">
                                  {section.links.map((link) => (
                                    <a
                                      key={`${section.id}-${link.label}`}
                                      href={link.href}
                                      className="bh-side-section-link"
                                      onClick={() => setSideMenuOpen(false)}
                                      target={link.external ? '_blank' : undefined}
                                      rel={link.external ? 'noreferrer' : undefined}
                                    >
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bh-side-stage-foot">
                    <span className="bh-side-stage-line" aria-hidden="true" />
                    <a href="#review" className="bh-side-stage-cta" onClick={() => setSideMenuOpen(false)}>
                      Start a private review
                    </a>
                    <span className="bh-side-stage-copy">National reach. Premium signal.</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────────
   HERO — Video 1 background + scroll-driven word animations
───────────────────────────────────────────── */
function HeroWithVideo() {
  return (
    <div className="bh-hero-sequence-wrapper">
      <ScrollSequence
        totalFrames={HERO_SEQUENCE_FRAMES}
        framePath={HERO_SEQUENCE_PATH}
        frameExtension={HERO_SEQUENCE_EXTENSION}
        height={HERO_SEQUENCE_HEIGHT}
        triggerMode="top"
        startFrame={1}
        endFrame={HERO_SEQUENCE_FRAMES}
        baseScale={1.14}
        baseTranslateX="-7%"
        baseTranslateY="5%"
        scrollZoomAmount={0.46}
        postZoomAmount={0.54}
        frameIndexForProgress={getHomeSequenceFrameIndex}
      >
        {(progress) => (
          <>
            <div className="bh-hero-overlay-layer">
              <Hero />
            </div>
            <PillarsProgressOverlay progress={getHeroExtensionProgress(progress)} />
            <div className="bh-hero-bottom-parallax" style={getHeroEndCoverStyle(getHeroExtensionProgress(progress))} />
          </>
        )}
      </ScrollSequence>
    </div>
  )
}


function Hero() {
  /* Each element has a 4-point range: [before, start, end, after].
     LEFT-side content (text, buttons, reviews) all slides LEFT.
     RIGHT-side content (glass cards) all slides RIGHT.
     Compressed ranges so everything completes within ~300px of scroll,
     matching the shorter 125vh hero. */
  const { scrollY } = useScroll()

  /* ── LEFT SIDE (all slide LEFT, staggered timing) ── */
  const overlineX = useTransform(scrollY, [0, 300, 620, 9999], [0, 0, -260, -260])
  const overlineOpacity = useTransform(scrollY, [0, 300, 600, 9999], [1, 1, 0, 0])

  const word1X = useTransform(scrollY, [0, 340, 660, 9999], [0, 0, -500, -500])
  const word1Opacity = useTransform(scrollY, [0, 340, 640, 9999], [1, 1, 0, 0])

  const word2X = useTransform(scrollY, [0, 360, 680, 9999], [0, 0, -450, -450])
  const word2Opacity = useTransform(scrollY, [0, 360, 660, 9999], [1, 1, 0, 0])

  const word3X = useTransform(scrollY, [0, 380, 700, 9999], [0, 0, -550, -550])
  const word3Opacity = useTransform(scrollY, [0, 380, 680, 9999], [1, 1, 0, 0])

  const descLine1X = useTransform(scrollY, [0, 320, 640, 9999], [0, 0, -320, -320])
  const descLine1Opacity = useTransform(scrollY, [0, 320, 620, 9999], [1, 1, 0, 0])

  const descLine2X = useTransform(scrollY, [0, 340, 660, 9999], [0, 0, -360, -360])
  const descLine2Opacity = useTransform(scrollY, [0, 340, 640, 9999], [1, 1, 0, 0])

  const btn1X = useTransform(scrollY, [0, 360, 680, 9999], [0, 0, -400, -400])
  const btn1Opacity = useTransform(scrollY, [0, 360, 660, 9999], [1, 1, 0, 0])

  const btn2X = useTransform(scrollY, [0, 380, 700, 9999], [0, 0, -440, -440])
  const btn2Opacity = useTransform(scrollY, [0, 380, 680, 9999], [1, 1, 0, 0])

  const reviewsX = useTransform(scrollY, [0, 400, 720, 9999], [0, 0, -300, -300])
  const reviewsOpacity = useTransform(scrollY, [0, 400, 700, 9999], [1, 1, 0, 0])

  return (
    <section className="bh-hero" id="top">
      <div id="providers" className="bh-section-anchor" aria-hidden="true" />
      <div id="provider-signup" className="bh-section-anchor" aria-hidden="true" />
      <div className="bh-container bh-hero-container">
        <div className="bh-hero-content">
          <div className="bh-hero-enter-left" style={{ animationDelay: '0.2s' }}>
            <motion.p
              className="bh-overline bh-red"
              style={{ x: overlineX, opacity: overlineOpacity }}
            >
              PERSONALIZED MEDICINE. PRECISION SCIENCE.
            </motion.p>
          </div>
          <div className="bh-hero-enter-left" style={{ animationDelay: '0.38s' }}>
            <h1 className="bh-hero-title">
              <motion.span
                className="bh-hero-word"
                style={{ x: word1X, opacity: word1Opacity }}
              >
                Compounded
              </motion.span>
              <br />
              <motion.span
                className="bh-hero-word"
                style={{ x: word2X, opacity: word2Opacity }}
              >
                for
              </motion.span>
              {' '}
              <motion.span
                className="bh-hero-word bh-red"
                style={{ x: word3X, opacity: word3Opacity }}
              >
                You.
              </motion.span>
            </h1>
          </div>
          <div className="bh-hero-buttons bh-hero-enter-left" style={{ animationDelay: '0.56s' }}>
            <motion.a
              href={PROVIDERS_CONSULT_URL}
              className="bh-btn bh-btn-primary"
              style={{ x: btn1X, opacity: btn1Opacity }}
            >
              SIGN UP AS A PROVIDER
            </motion.a>
            <motion.a
              href={RESOURCES_URL}
              className="bh-btn bh-btn-outline"
              style={{ x: btn2X, opacity: btn2Opacity }}
            >
              LEARN MORE
            </motion.a>
          </div>
          <div className="bh-hero-enter-left" style={{ animationDelay: '0.74s' }}>
            <motion.div className="bh-reviews" style={{ x: reviewsX, opacity: reviewsOpacity }}>
              <div className="bh-stars">★★★★★</div>
              <p><strong>4.9/5</strong> From 10,000+ Patients</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PILLAR SHOWCASE — scroll-driven dramatic pillar panels
───────────────────────────────────────────── */
const PILLARS = [
  {
    key: 'compounding',
    eyebrow: '01',
    title: 'TAILORED COMPOUNDS',
    desc: 'Medication centered around patients, not products.',
    side: 'right',
  },
  {
    key: 'retention',
    eyebrow: '02',
    title: '95%',
    desc: 'provider retention rate',
    side: 'right',
  },
  {
    key: 'processing',
    eyebrow: '03 — PROCESSING TIME COMPARISON',
    title: '10x faster',
    desc: 'Cody Drug: 24hr avg processing. Industry Average: 10 days.',
    side: 'right',
  },
  {
    key: 'standards',
    eyebrow: '04',
    title: 'Best-practice sterile and non-sterile safety standards.',
    desc: '',
    side: 'right',
  },
  {
    key: 'account-management',
    eyebrow: '05',
    title: '24/7 accessible account management',
    desc: '',
    side: 'right',
  },
]

/* Pillars driven by a 0..1 progress value (passed from ScrollSequence's
   function-as-children). The windows slightly overlap, but outgoing cards fade
   before the next card becomes readable so the glass text does not ghost. */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)
const PILLAR_TIMING = [
  { start: 0.06, end: 0.32, y: 0 },
  { start: 0.31, end: 0.54, y: 0 },
  { start: 0.53, end: 0.72, y: -24, exitY: 120 },
  { start: 0.7, end: 0.86, y: -18 },
  { start: 0.84, end: 0.98, y: -52 },
]

function computePillarStyle(progress, index, total, sideMult) {
  const timing = PILLAR_TIMING[index] ?? {
    start: index / total,
    end: (index + 1) / total,
    y: 0,
  }
  const { start, end, y, exitY = 0 } = timing
  const localProgress = (progress - start) / (end - start)
  const enterEnd = 0.34
  const exitStart = 0.64

  let opacity, x, rotate, scale, blur, exitProgress, zIndex
  if (localProgress < 0) {
    opacity = 0; x = 580 * sideMult; rotate = 3 * sideMult; scale = 0.97; blur = 10; exitProgress = 0; zIndex = 1
  } else if (localProgress < enterEnd) {
    const raw = localProgress / enterEnd
    const tOpacity = easeInOutCubic(raw)
    const tMove = easeOutQuart(raw)
    opacity = tOpacity
    x = 580 * sideMult * (1 - tMove)
    rotate = 3 * sideMult * (1 - tMove)
    scale = 0.97 + 0.03 * tMove
    blur = 10 * (1 - tOpacity)
    exitProgress = 0
    zIndex = 3
  } else if (localProgress < exitStart) {
    opacity = 1; x = 0; rotate = 0; scale = 1; blur = 0; exitProgress = 0; zIndex = 3
  } else if (localProgress < 1) {
    const raw = (localProgress - exitStart) / (1 - exitStart)
    const t = easeInOutCubic(raw)
    opacity = Math.max(0, 1 - t * 1.35)
    x = -360 * sideMult * t
    rotate = -2 * sideMult * t
    scale = 1 - 0.04 * t
    blur = 12 * t
    exitProgress = t
    zIndex = 2
  } else {
    opacity = 0; x = -360 * sideMult; rotate = -2 * sideMult; scale = 0.96; blur = 12; exitProgress = 1; zIndex = 1
  }

  const yOffset = y + exitY * exitProgress

  return {
    opacity,
    zIndex,
    transform: `translateY(-50%) translateY(${yOffset}px) translateX(${x}px) rotate(${rotate}deg) scale(${scale})`,
    filter: `blur(${blur}px)`,
  }
}

function PillarsProgressOverlay({ progress }) {
  return (
    <div className="bh-ps-overlay">
      {PILLARS.map((pillar, index) => {
        const sideMult = pillar.side === 'right' ? 1 : -1
        const style = computePillarStyle(progress, index, PILLARS.length, sideMult)
        if (style.opacity <= 0.001) return null
        return (
          <div
            key={pillar.key}
            className={`bh-ps-card bh-ps-card--${pillar.side} bh-ps-card--${pillar.key}`}
            style={style}
          >
            <h3 className="bh-ps-title">{pillar.title}</h3>
            {pillar.desc ? <p className="bh-ps-desc">{pillar.desc}</p> : null}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   CINEMATIC VIDEO 1 — vial-fall-2, 88 frames
───────────────────────────────────────────── */
function CinematicVial() {
  return (
    <section className="bh-cinematic-section">
      <ScrollSequence
        totalFrames={88}
        framePath="/assets/vial-fall-2/frame_"
        height="180vh"
      >
        {(progress) => (
          <div className="bh-cinematic-overlay">
            <motion.p
              className="bh-overline bh-red bh-cinematic-eyebrow"
              style={{
                opacity: progress > 0.1 && progress < 0.85 ? 1 : 0,
                transform: `translateY(${(1 - Math.min(1, progress * 3)) * 20}px)`,
              }}
            >
              PRECISION IN EVERY DROP
            </motion.p>
          </div>
        )}
      </ScrollSequence>
    </section>
  )
}

/* ─────────────────────────────────────────────
   THREE CARD PANELS
───────────────────────────────────────────── */
function ThreePanels() {
  return (
    <section className="bh-panels-section" id="services">
      <div id="products" className="bh-section-anchor" aria-hidden="true" />
      <div className="bh-panels-grid">
        <motion.div
          className="bh-panel bh-panel-dark"
          {...fadeUp}
        >
          <h3 className="bh-panel-title">
            Precision in<br />Every Dose
          </h3>
          <p className="bh-panel-copy">
            Cody Drug Rx provides reliable, high-quality pharmaceutical solutions. Our commitment to excellence ensures superior healthcare.
          </p>
          <span className="bh-panel-tag">PHARMACEUTICAL EXCELLENCE</span>
        </motion.div>

        <motion.div
          className="bh-panel bh-panel-light"
          {...fadeUp}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <h3 className="bh-panel-title bh-panel-title-dark">
            Advanced Rx<br />Formulations
          </h3>
          <p className="bh-panel-copy bh-panel-copy-dark">
            Explore our specialized range of compounded medications and prescription services tailored for patient health.
          </p>
          <a href="#protocol" className="bh-btn bh-btn-primary bh-panel-cta">LEARN MORE</a>
        </motion.div>

        <motion.div
          className="bh-panel bh-panel-red"
          {...fadeUp}
          transition={{ duration: 0.9, delay: 0.3, ease }}
        >
          <h3 className="bh-panel-title">
            Contact &amp;<br />Services
          </h3>
          <p className="bh-panel-copy">
            Experience expert pharmaceutical guidance and dedicated support. Reach our team for personalized prescription management.
          </p>
          <div className="bh-panel-contact">
            CALL: (800) 555-0199<br />
            EMAIL: info@codyrx.com<br />
            NEW YORK, NY
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   TWO PANEL FEATURE
───────────────────────────────────────────── */
function TwoPanel() {
  return (
    <section className="bh-two-panel-section" id="wellness">
      <motion.div className="bh-two-panel" {...fadeUp}>
        <div className="bh-two-panel-left">
          <div className="bh-two-panel-left-content">
            <h4 className="bh-two-panel-left-title">PRECISION IN<br />EVERY DOSE</h4>
            <p className="bh-two-panel-left-text">Cody Drug Rx — compounded with care.</p>
          </div>
        </div>
        <div className="bh-two-panel-right">
          <div className="bh-two-panel-right-content">
            <span className="bh-overline bh-two-panel-eyebrow">ADVANCED THERAPY</span>
            <h2 className="bh-two-panel-title">The Future<br />of Skin<br />Wellness</h2>
            <p className="bh-two-panel-body">
              Precision LED light therapy, custom-compounded serums, and clinical-grade formulations — tailored to your skin.
            </p>
            <a href="#services" className="bh-two-panel-cta">EXPLORE TREATMENTS</a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FEATURES (Science-Backed, Patient-Focused)
───────────────────────────────────────────── */
function Features() {
  const items = [
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="3" />
          <path d="M3.4 8.6c.9-2.2 2.8-4.2 5.6-5 4-.8 8.1 1.7 8.9 5.8s-1.8 8-5.8 8.8c-2.8.6-5.7-.3-7.5-2.2" />
          <path d="M20.6 15.4c-.9 2.2-2.8 4.2-5.6 5-4 .8-8.1-1.7-8.9-5.8s1.8-8 5.8-8.8c2.8-.6 5.7.3 7.5 2.2" />
        </svg>
      ),
      title: 'Premium Quality',
      copy: 'Rigorous testing. Proven purity. Every formulation cleared before it leaves the lab.',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      title: 'Personalized Care',
      copy: 'Protocols tailored to your labs, your goals, your pace — reviewed by humans, not templates.',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" />
          <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
      title: 'Expert Support',
      copy: 'Guidance from pharmacists and peptide specialists who actually answer the phone.',
    },
  ]

  return (
    <section className="bh-features-section">
      <div className="bh-features-shell">
        <motion.div className="bh-features-display" {...fadeUp}>
          <div className="bh-features-kicker">
            <span className="bh-red">/</span> WHY <span className="bh-kicker-slash">//</span> CODY DRUG RX
          </div>

          <div className="bh-features-brutal" aria-label="Science-Backed. Patient-Focused.">
            <span className="bh-brutal-row">
              <span className="bh-brutal-index">01</span>
              <span className="bh-brutal-word">Science—</span>
            </span>
            <span className="bh-brutal-row">
              <span className="bh-brutal-word">Backed.</span>
            </span>
            <span className="bh-brutal-row bh-brutal-red">
              <span className="bh-brutal-index">02</span>
              <span className="bh-brutal-word">Patient—</span>
            </span>
            <span className="bh-brutal-row bh-brutal-red">
              <span className="bh-brutal-word">Focused.</span>
            </span>
          </div>

          <div className="bh-features-mark">
            <span>EST. 2010</span>
            <span className="bh-mark-rule" aria-hidden="true" />
            <span>SULPHUR SPRINGS · NATIONWIDE</span>
          </div>
        </motion.div>

        <motion.div
          className="bh-features-stack"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            initial: { opacity: 0 },
            whileInView: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {items.map((f, i) => (
            <motion.article
              key={i}
              className={`bh-feature-card bh-feature-card-${i}`}
              variants={{
                initial: { opacity: 0, x: 40 },
                whileInView: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
              }}
            >
              <div className="bh-feature-card-head">
                <span className="bh-feature-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="bh-feature-icon">{f.icon}</span>
              </div>
              <div className="bh-feature-card-body">
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
              </div>
              <div className="bh-feature-card-foot" aria-hidden="true">
                <span className="bh-feature-foot-bar" />
                <span className="bh-feature-foot-label">CODY / Rx</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   EXPERT CARE (3-column)
───────────────────────────────────────────── */
function ExpertCare() {
  return (
    <section className="bh-expert-section" id="about">
      <div className="bh-expert-wrapper">
        <motion.div className="bh-expert-left" {...fadeUp}>
          <h2 className="bh-expert-heading">EXPERT CARE &amp;<br />WELLNESS SOLUTIONS</h2>
          <p className="bh-expert-subheading">
            Personalized pharmaceutical services tailored for your health journey.
          </p>
          <a href="#services" className="bh-btn bh-btn-primary">OUR PHARMACY SERVICES</a>
          <ul className="bh-expert-services-list">
            <li>Prescriptions</li>
            <li>Consultations</li>
            <li>Compounding</li>
            <li>Screenings</li>
          </ul>
        </motion.div>

        <motion.div className="bh-expert-middle" {...fadeUp} transition={{ duration: 0.9, delay: 0.15, ease }}>
          <h2 className="bh-expert-mid-heading">
            COMPREHENSIVE<br />PHARMACEUTICAL<br />CARE
          </h2>
          <p className="bh-expert-mid-body">
            At Cody Drug Rx, we prioritize your health with exceptional service, precision, and dedication. Our highly qualified team ensures accurate prescriptions and personalized attention.
          </p>
          <div className="bh-expert-features">
            <div className="bh-expert-feature-item">
              <div className="bh-expert-feature-icon">⚕</div>
              <div className="bh-expert-feature-text">
                <h4>Medication Management</h4>
                <p>Personalized guidance and adherence support</p>
              </div>
            </div>
            <div className="bh-expert-feature-item">
              <div className="bh-expert-feature-icon">♥</div>
              <div className="bh-expert-feature-text">
                <h4>Wellness Screenings</h4>
                <p>In-depth health assessments and monitoring</p>
              </div>
            </div>
          </div>
          <a href="#review" className="bh-btn bh-btn-outline">SCHEDULE CONSULTATION</a>
        </motion.div>

        <motion.div className="bh-expert-right" {...fadeUp} transition={{ duration: 0.9, delay: 0.3, ease }}>
          <h3 className="bh-expert-right-heading">YOUR HEALTH,<br />OUR PRIORITY</h3>
          <p className="bh-expert-right-text">Trusted care, personalized attention, always.</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PROCESS STEPS
───────────────────────────────────────────── */
function Process() {
  const steps = [
    { num: '01', title: 'Private review', copy: 'Start with goals, background, and eligibility so the formulation path is clear before anything is prepared.' },
    { num: '02', title: 'Protocol shaping', copy: 'Dose logic, preparation details, and fulfillment requirements are tightened into one coherent plan.' },
    { num: '03', title: 'Delivery & follow-through', copy: 'Support continues through storage guidance, refill timing, and the questions that appear after arrival.' },
  ]

  return (
    <section className="bh-process-section" id="protocol">
      <div id="resources" className="bh-section-anchor" aria-hidden="true" />
      <div className="bh-container">
        <motion.div className="bh-process-header" {...fadeUp}>
          <p className="bh-overline bh-red">HOW IT WORKS</p>
          <h2 className="bh-section-title">The Protocol</h2>
        </motion.div>
        <div className="bh-process-grid">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="bh-process-step"
              {...fadeUp}
              transition={{ duration: 0.9, delay: i * 0.15, ease }}
            >
              <span className="bh-step-num">{s.num}</span>
              <h3 className="bh-step-title">{s.title}</h3>
              <p className="bh-step-copy">{s.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   CTA — dark with founder signature
───────────────────────────────────────────── */
const ORDER_PILLARS = [
  {
    title: '24hr Turnaround',
    alt: 'Prescription package with red light trails moving behind it',
    media: {
      type: 'hover-video',
      src: '/assets/hover-video-main-page/rapid-turnaround-hover-late-loop.mp4',
      poster: '/new-pics/rapid-turnaround.png',
    },
    width: '92%',
  },
  {
    title: 'Above/Beyond Testing',
    alt: 'Glossy red and white capsule pouring into a liquid droplet sculpture',
    media: {
      type: 'hover-video',
      src: '/assets/hover-video-main-page/above-beyond-testing-hover-full.mp4',
      poster: '/new-pics/custom-compounding.png',
    },
    width: '92%',
  },
  {
    title: 'Human-Centered Service',
    alt: 'Metallic handshake icon with a transparent teal accent',
    media: {
      type: 'hover-video',
      src: '/assets/hover-video-main-page/dedicated-partnership-hover-full.mp4',
      poster: '/new-pics/dedicated-partnership.png',
    },
    width: '92%',
  },
]

function getPillarHoverVideo(event) {
  return event.currentTarget.querySelector('[data-pillar-hover-video]')
}

function stopPillarHoverCard(card) {
  const video = card.querySelector('[data-pillar-hover-video]')

  card.classList.remove('is-hovering')

  if (!video) return

  video.pause()
  video.currentTime = 0
}

function stopOtherPillarHoverCards(activeCard) {
  const grid = activeCard.parentElement

  if (!grid) return

  grid.querySelectorAll('.bh-pillars-card.is-hovering').forEach((card) => {
    if (card !== activeCard) {
      stopPillarHoverCard(card)
    }
  })
}

function playPillarHoverVideo(event) {
  const video = getPillarHoverVideo(event)

  if (!video) return

  stopOtherPillarHoverCards(event.currentTarget)

  const alreadyHovering = event.currentTarget.classList.contains('is-hovering')
  event.currentTarget.classList.add('is-hovering')

  if (!alreadyHovering) {
    video.currentTime = 0
  }

  if (video.readyState === 0) {
    video.load()
  }

  video.play().catch(() => {})
}

function ensurePillarHoverVideo(event) {
  const video = getPillarHoverVideo(event)

  if (!video) return

  stopOtherPillarHoverCards(event.currentTarget)

  event.currentTarget.classList.add('is-hovering')

  if (video.readyState === 0) {
    video.load()
  }

  if (!video.paused) return

  video.play().catch(() => {})
}

function stopPillarHoverVideo(event) {
  stopPillarHoverCard(event.currentTarget)
}

function stopAllPillarHoverVideos(event) {
  event.currentTarget.querySelectorAll('.bh-pillars-card').forEach(stopPillarHoverCard)
}


function PillarMedia({ pillar }) {
  const mediaClassName = 'bh-pillar-image'

  if (pillar.media.type === 'video') {
    return (
      <video
        className={mediaClassName}
        src={pillar.media.src}
        poster={pillar.media.poster}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  if (pillar.media.type === 'hover-video') {
    return (
      <div className="bh-pillar-media-stack">
        <img
          className={`${mediaClassName} bh-pillar-still`}
          src={pillar.media.poster}
          alt={pillar.alt}
          loading="lazy"
        />
        <video
          className={`${mediaClassName} bh-pillar-hover-video`}
          src={pillar.media.src}
          poster={pillar.media.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          data-pillar-hover-video
        />
      </div>
    )
  }

  return (
    <img
      className={mediaClassName}
      src={pillar.media.src}
      alt={pillar.alt}
      loading="lazy"
    />
  )
}

function FounderCTA() {
  return (
    <section className="bh-pillars-section" id="order">
      <svg
        className="bh-pillars-section-divider"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="#020202"
          d="M0,0 L1440,0 L1440,40 C1296,78 1152,14 1008,42 C864,70 720,20 576,46 C432,72 288,22 144,44 C96,51 48,48 0,42 Z"
        />
      </svg>
      <div
        className="bh-pillars-grid"
        onPointerLeave={stopAllPillarHoverVideos}
        onMouseLeave={stopAllPillarHoverVideos}
      >
        {ORDER_PILLARS.map((pillar, index) => (
          <motion.article
            key={pillar.title}
            className="bh-pillars-card"
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: index * 0.12, ease }}
            viewport={{ once: true, margin: '-80px' }}
            tabIndex={pillar.media.type === 'hover-video' ? 0 : undefined}
            onPointerOver={ensurePillarHoverVideo}
            onPointerEnter={playPillarHoverVideo}
            onPointerLeave={stopPillarHoverVideo}
            onPointerMove={ensurePillarHoverVideo}
            onMouseOver={ensurePillarHoverVideo}
            onMouseEnter={playPillarHoverVideo}
            onMouseLeave={stopPillarHoverVideo}
            onMouseMove={ensurePillarHoverVideo}
            onFocus={playPillarHoverVideo}
            onBlur={stopPillarHoverVideo}
          >
            <div
              className="bh-pillar-media"
              style={{
                '--pillar-media-width': pillar.width,
                '--pillar-shift-x': pillar.shiftX ?? '0%',
                '--pillar-shift-y': pillar.shiftY ?? '0%',
              }}
            >
              <PillarMedia pillar={pillar} />
            </div>

            <div className="bh-pillar-footer">
              <p className="bh-pillar-title">{pillar.title}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bh-footer" id="contact">
      <div className="bh-container bh-footer-inner">
        <div className="bh-footer-left">
          <h3 className="bh-footer-brand">
            <span>CODY</span><span>DRUG <span className="bh-red">RX</span></span>
          </h3>
          <p className="bh-footer-tagline">Personalized medicine crafted with precision science — for the patients who expect more.</p>
          <div className="bh-footer-socials">
            <a href="#" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="X / Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="bh-footer-col">
          <h4 className="bh-footer-col-title">Navigate</h4>
          <a href="#top" className="bh-footer-link">Home</a>
          <a href={SERVICES_PAGE_URL} className="bh-footer-link">Services</a>
          <a href="#protocol" className="bh-footer-link">Protocol</a>
          <a href="#about" className="bh-footer-link">About</a>
        </div>
        <div className="bh-footer-col">
          <h4 className="bh-footer-col-title">Patients</h4>
          <a href="#review" className="bh-footer-link">Private Review</a>
          <a href="#order" className="bh-footer-link">Refill</a>
          <a href="#" className="bh-footer-link">FAQ</a>
          <a href="#" className="bh-footer-link">Support</a>
        </div>
        <div className="bh-footer-col">
          <h4 className="bh-footer-col-title">Contact</h4>
          <p className="bh-footer-contact">
            (800) 555-0199<br />
            info@codyrx.com<br />
            New York, NY
          </p>
        </div>
      </div>
      <div className="bh-footer-bottom">
        <p className="bh-footer-copyright">© 2026 Cody Drug Rx. All rights reserved.</p>
        <div className="bh-footer-legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">HIPAA</a>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */

function TestimonialCard({ story, index }) {
  return (
    <div
      className="bh-testimonial-card-wrap"
      style={{
        '--card-width': story.width,
        '--card-offset': `${story.offset}px`,
        '--card-tilt': story.tilt,
        '--float-duration': `${8.5 + index * 0.8}s`,
        '--float-delay': `${index * 0.55}s`,
      }}
    >
    <article className="bh-testimonial-card">
      <div className={`bh-testimonial-logo bh-testimonial-logo--${story.logoTone}`} aria-label={`${story.practice} logo`}>
        <img
          src={story.logo}
          alt={`${story.practice} logo`}
          className={`bh-testimonial-logo-img bh-testimonial-logo-img--${story.logoTone}`}
          loading="lazy"
        />
        <span className="bh-testimonial-logo-text" aria-hidden="true">{story.logoLabel}</span>
      </div>

      <p className="bh-testimonial-copy">{story.copy}</p>

      <div className="bh-testimonial-footer">
        <div className="bh-testimonial-meta">
          <h3>{story.practice}</h3>
          <p>{story.attribution}</p>
          <p>{story.location}</p>
        </div>

        <span className="bh-testimonial-quote-mark" aria-hidden="true">
          ''
        </span>
      </div>
    </article>
    </div>
  )
}

function FeaturedTestimonials() {
  const testimonials = [
    {
      practice: 'Rhoades Family Practice',
      attribution: 'Dusty Rhoades, MSN, APRN, FNP-C',
      location: 'SULPHUR SPRINGS, TX',
      logo: '/assets/testimonials/rhoades-family-practice.png',
      logoTone: 'rhoades',
      logoLabel: 'Rhoades Family Practice',
      copy: "Cody Drug shares our vision of healthcare as it should be. Their team delivers exceptional service, fast turnaround, and treats my patients like family.",
      width: '18.5rem',
      offset: 14,
      tilt: '-0.8deg',
    },
    {
      practice: 'Restorative Injectables',
      attribution: 'Jason R. Henderson, Co-Founder',
      location: 'OKLAHOMA CITY, OK + DENVER, CO',
      logo: '/assets/testimonials/restorative-injectables.png',
      logoTone: 'restorative',
      logoLabel: 'RESTORATIVE INJECTABLES',
      copy: "Cody Drug has transformed our clinics' ability to provide top tier compounded treatments with quality, innovation, and exceptional service.",
      width: '22rem',
      offset: 62,
      tilt: '0.45deg',
    },
    {
      practice: "Gameday Men's Health",
      attribution: 'Alonso Osorio, M.D.',
      location: 'TYLER + LONGVIEW, TX',
      logo: '/assets/testimonials/gameday-mens-health.svg',
      logoTone: 'gameday',
      logoLabel: "GAMEDAY MEN'S HEALTH",
      copy: "Cody Drug's professionalism, precision, and prompt service ensure my patients receive exactly what they need safely and efficiently.",
      width: '21rem',
      offset: 28,
      tilt: '-0.35deg',
    },
  ]

  return (
    <section className="bh-testimonials-section" id="peptides">
      <div className="bh-container">
        <motion.div className="bh-testimonials-header" {...fadeUp}>
          <p className="bh-testimonials-kicker">[ Provider Testimonials ]</p>
          <h2 className="bh-testimonials-title">
            Providers Trust Cody Drug
          </h2>
          <p className="bh-testimonials-subtitle">
            Real feedback from clinical partners
          </p>
        </motion.div>
      </div>

      <div className="bh-testimonials-stage" aria-label="Animated provider testimonials">
        <div className="bh-testimonials-track">
          {[0, 1].map((copyIndex) => (
            <div
              key={copyIndex}
              className="bh-testimonials-rail"
              aria-hidden={copyIndex === 1}
            >
              {testimonials.map((story, index) => (
                <TestimonialCard
                  key={`${copyIndex}-${story.name}-${story.location}`}
                  story={story}
                  index={index}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   COVERAGE MAP — Personalized Care, Where You Are
───────────────────────────────────────────── */
function MapTransitionDivider({ shellY, mistY, accentOneY, accentTwoY }) {
  return (
    <motion.div className="bh-map-divider" aria-hidden="true" style={{ y: shellY }}>
      <svg className="bh-map-divider__svg" viewBox="0 0 1440 240" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bhMapDividerRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 96, 122, 0)" />
            <stop offset="18%" stopColor="rgba(255, 96, 122, 0.32)" />
            <stop offset="52%" stopColor="rgba(255, 96, 122, 0.9)" />
            <stop offset="82%" stopColor="rgba(255, 96, 122, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 96, 122, 0)" />
          </linearGradient>
          <linearGradient id="bhMapDividerCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(117, 216, 227, 0)" />
            <stop offset="24%" stopColor="rgba(117, 216, 227, 0.22)" />
            <stop offset="58%" stopColor="rgba(117, 216, 227, 0.76)" />
            <stop offset="86%" stopColor="rgba(117, 216, 227, 0.24)" />
            <stop offset="100%" stopColor="rgba(117, 216, 227, 0)" />
          </linearGradient>
          <linearGradient id="bhMapDividerMist" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 244, 238, 0)" />
            <stop offset="38%" stopColor="rgba(255, 228, 224, 0.38)" />
            <stop offset="72%" stopColor="rgba(115, 44, 58, 0.18)" />
            <stop offset="100%" stopColor="rgba(10, 7, 10, 0)" />
          </linearGradient>
          <filter id="bhMapDividerBlur" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <motion.g style={{ y: mistY }}>
          <path
            className="bh-map-divider__mist"
            d="M0 152C139 145 268 104 396 98C526 92 634 124 760 128C888 132 1015 101 1136 90C1258 79 1361 94 1440 108V240H0Z"
            fill="url(#bhMapDividerMist)"
          />
        </motion.g>

        <motion.g style={{ y: accentOneY }}>
          <path
            className="bh-map-divider__line bh-map-divider__line--glow"
            d="M0 128C126 116 252 91 391 98C529 105 649 149 773 154C898 159 1027 120 1158 104C1288 88 1380 94 1440 103"
            stroke="url(#bhMapDividerRed)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#bhMapDividerBlur)"
          />
          <path
            className="bh-map-divider__line bh-map-divider__line--red"
            d="M0 128C126 116 252 91 391 98C529 105 649 149 773 154C898 159 1027 120 1158 104C1288 88 1380 94 1440 103"
            stroke="url(#bhMapDividerRed)"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        <motion.g style={{ y: accentTwoY }}>
          <path
            className="bh-map-divider__line bh-map-divider__line--glow"
            d="M0 148C106 143 226 130 345 136C465 142 578 171 697 170C815 169 952 134 1088 121C1223 108 1343 112 1440 122"
            stroke="url(#bhMapDividerCyan)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#bhMapDividerBlur)"
          />
          <path
            className="bh-map-divider__line bh-map-divider__line--cyan"
            d="M0 148C106 143 226 130 345 136C465 142 578 171 697 170C815 169 952 134 1088 121C1223 108 1343 112 1440 122"
            stroke="url(#bhMapDividerCyan)"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </svg>
    </motion.div>
  )
}

function CoverageMap() {
  const sectionRef = useRef(null)
  const shouldLoadMap = useNearViewport(sectionRef)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const mapY = useTransform(scrollYProgress, [0, 1], [18, -28])
  const copyY = useTransform(scrollYProgress, [0, 1], [8, -28])
  const dividerShellY = useTransform(scrollYProgress, [0, 1], [-16, 22])
  const dividerMistY = useTransform(scrollYProgress, [0, 1], [-12, 18])
  const dividerAccentOneY = useTransform(scrollYProgress, [0, 1], [-24, 12])
  const dividerAccentTwoY = useTransform(scrollYProgress, [0, 1], [14, -10])

  return (
    <section ref={sectionRef} className="bh-map-section" id="coverage">
      <div id="review" className="bh-section-anchor" aria-hidden="true" />
      <MapTransitionDivider
        shellY={dividerShellY}
        mistY={dividerMistY}
        accentOneY={dividerAccentOneY}
        accentTwoY={dividerAccentTwoY}
      />
      <div className="bh-container bh-map-wrapper">
        <motion.div className="bh-map-visual" {...fadeUp} style={{ y: mapY }} transition={{ duration: 1, delay: 0.15, ease }}>
          <div className="bh-map-license-shell">
            <div className="bh-map-license-canvas">
              {shouldLoadMap ? (
                <Suspense fallback={<div className="bh-map-license-fallback" />}>
                  <StateLicenseMap3D embedded />
                </Suspense>
              ) : (
                <div className="bh-map-license-fallback" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div className="bh-map-copy" {...fadeUp} style={{ y: copyY }}>
          <div className="bh-map-copy-main">
            <p className="bh-overline bh-cyan bh-map-overline">National coverage. Home town care.</p>
            <h2 className="bh-section-title bh-text-white">
              Expanding,{' '}<br />
              <span className="bh-red">state by state.</span>
            </h2>
            <p className="bh-map-desc">
              Expanding our coverage, so that no matter where your patients live, they have access to the same exceptional service.
            </p>
          </div>

          <div className="bh-map-support">
            <div className="bh-map-legend" aria-label="Map legend">
              <span className="bh-map-legend-item">
                <span className="bh-map-dot bh-map-dot-active" /> Now serving
              </span>
              <span className="bh-map-legend-item">
                <span className="bh-map-dot bh-map-dot-cyan" /> Pending
              </span>
              <span className="bh-map-legend-item">
                <span className="bh-map-dot bh-map-dot-blue" /> Coming soon
              </span>
            </div>

            <div className="bh-map-shield">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Fully licensed · state compliant · patient protected
            </div>

            <a href="/pages/contact.html#contact-form" className="bh-btn bh-btn-primary bh-map-cta">
              EXPRESS INTEREST
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────── */
export default function BrighterHome() {
  return (
    <div className="bh-shell">
      <BrighterNavbar />
      <HeroWithVideo />
      <FounderCTA />
      <FeaturedTestimonials />
      <CoverageMap />
      <Footer />
    </div>
  )
}
