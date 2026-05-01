import { useState } from 'react'

const navItems = [
  { label: 'Services', target: 'services' },
  { label: 'About', target: 'protocol' },
  { label: 'Technology', target: 'science' },
  { label: 'Patients', target: 'review' },
  { label: 'Physicians', target: 'review' },
  { label: 'Login / Register', target: 'review' },
]

function scrollToSection(target) {
  document.getElementById(target)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav">
      <button className="brand-lockup" type="button" onClick={() => scrollToSection('top')}>
        <span className="brand-lockup__name">
          Cody R<sub>x</sub>
        </span>
      </button>

      <div className="nav-menu-wrapper">
        <button
          className="nav-chevron"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
        </button>

        {open && (
          <nav className="nav-dropdown" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="nav-dropdown__link"
                type="button"
                onClick={() => {
                  scrollToSection(item.target)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
