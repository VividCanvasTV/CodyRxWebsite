# Home Map Backup: Interactive 3D Version

Created: 2026-05-21

Purpose: keep the previous Home page interactive 3D map implementation available in case Lillian meant to keep this version instead of switching Home to the static About page map image.

Current active Home map:
- Uses `/pages/assets/about-service-area-map-blue.png`.
- Uses the new Lillian copy: "National coverage. Home town care." and "Expanding, state by state."
- Removes the old `35` and `100%` stat tiles.
- Uses `EXPRESS INTEREST` linking to `/pages/contact.html#contact-form`.

Use this backup only if Lillian confirms she wants the previous interactive 3D map back.

## Restore Instructions

1. Open `src/components/BrighterHome.jsx`.
2. Restore the import/dependency lines from the JSX backup below:
   - Add `lazy` and `Suspense` back to the React import.
   - Add `const StateLicenseMap3D = lazy(() => import('./StateLicenseMap3D'))`.
   - Add the `useNearViewport` helper back near the top of the file.
3. Replace the current `CoverageMap` implementation with the old JSX backup below.
4. Open `src/components/BrighterHome.css`.
5. Replace the current map CSS block, from `.bh-map-section` through the map responsive media queries, with the old CSS backup below.
6. Run `npm run build`.
7. Open the Home page at `/#coverage` and verify the old interactive map, old legend, old stat tiles, and old button are back.

## Old JSX Setup

```jsx
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, lazy, Suspense } from 'react'
import ScrollSequence from './ScrollSequence'
import './BrighterHome.css'

const ease = [0.16, 1, 0.3, 1]
const StateLicenseMap3D = lazy(() => import('./StateLicenseMap3D'))

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
```

## Old CoverageMap JSX

```jsx
const SERVED_STATES = new Set([
  'CA','TX','FL','NY','PA','IL','OH','GA','NC','MI','NJ','VA','WA','AZ','MA',
  'TN','IN','MO','MD','WI','CO','MN','SC','AL','LA','KY','OR','OK','CT','IA',
  'AR','NV','UT','NM','WV',
])

function CoverageMap() {
  const servedCount = SERVED_STATES.size
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
          <div className="bh-map-copy-kicker">
            <span className="bh-map-copy-rule" />
            Licensed coverage
          </div>
          <div className="bh-map-copy-main">
            <p className="bh-overline bh-cyan bh-map-overline">NATIONAL REACH. PREMIUM SIGNAL.</p>
            <h2 className="bh-section-title bh-text-white">
              State by state,<br />
              <span className="bh-red">built for Cody RX.</span>
            </h2>
            <p className="bh-map-desc">
              Cody Rx coverage stays clear across licensed states, pending licenses, and coming-soon markets.
            </p>
          </div>

          <div className="bh-map-support">
            <div className="bh-map-stats" aria-label="Coverage statistics">
              <div className="bh-map-stat bh-map-stat--primary">
                <span className="bh-map-stat-num">{servedCount}</span>
                <span className="bh-map-stat-label">States served</span>
              </div>
              <div className="bh-map-stat">
                <span className="bh-map-stat-num">100<span className="bh-map-stat-pct">%</span></span>
                <span className="bh-map-stat-label">Compliant & licensed</span>
              </div>
            </div>

            <div className="bh-map-legend" aria-label="Map legend">
              <span className="bh-map-legend-item">
                <span className="bh-map-dot bh-map-dot-active" /> Served states
              </span>
              <span className="bh-map-legend-item">
                <span className="bh-map-dot bh-map-dot-cyan" /> Pending licensure
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

            <a href="#review" className="bh-btn bh-btn-primary bh-map-cta">
              CHECK ELIGIBILITY
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

## Old Map CSS

```css
.bh-map-section {
  background:
    radial-gradient(circle at 16% 18%, rgba(24, 221, 229, 0.15) 0%, transparent 24%),
    radial-gradient(circle at 74% 14%, rgba(255, 68, 95, 0.24) 0%, transparent 30%),
    radial-gradient(circle at 54% 52%, rgba(61, 120, 255, 0.1) 0%, transparent 36%),
    linear-gradient(180deg, #07070A 0%, #09060A 52%, #040508 100%);
  padding: 12rem 0 9rem;
  margin-top: -5.5rem;
  position: relative;
  z-index: 5;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.12) 2rem, rgba(0, 0, 0, 0.46) 5rem, #000000 9rem, #000000 100%);
  mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.12) 2rem, rgba(0, 0, 0, 0.46) 5rem, #000000 9rem, #000000 100%);
  isolation: isolate;
}

.bh-map-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.14;
  pointer-events: none;
}

.bh-map-section::after {
  content: '';
  position: absolute;
  width: 46rem;
  height: 46rem;
  right: -10rem;
  top: -14rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 68, 95, 0.18) 0%, transparent 70%);
  filter: blur(8px);
  pointer-events: none;
}

.bh-map-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.68fr);
  gap: clamp(1.75rem, 3.6vw, 4rem);
  align-items: center;
  position: relative;
  z-index: 2;
}

.bh-map-copy {
  max-width: 34rem;
  justify-self: end;
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 1.55rem;
  padding-left: clamp(1.2rem, 2vw, 1.8rem);
}

.bh-map-copy::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.6rem;
  bottom: 0.6rem;
  width: 1px;
  background: linear-gradient(180deg, rgba(24, 221, 229, 0.78) 0%, rgba(61, 120, 255, 0.12) 100%);
}

.bh-map-copy-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.58);
}

.bh-map-copy-rule {
  width: 2.65rem;
  height: 1px;
  background: linear-gradient(90deg, #18DDE5, rgba(255, 255, 255, 0.06));
}

.bh-map-copy-main {
  display: grid;
  gap: 1.1rem;
}

.bh-map-overline {
  margin-bottom: 0;
}

.bh-map-copy .bh-section-title {
  font-size: clamp(3.3rem, 5.3vw, 5.2rem);
  margin-bottom: 0;
  line-height: 0.98;
}

.bh-map-desc {
  max-width: 29rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.65;
  margin: 0;
}

.bh-map-support {
  display: grid;
  gap: 1.45rem;
  justify-items: start;
}

.bh-map-stats {
  display: grid;
  grid-template-columns: minmax(8rem, 0.8fr) minmax(10rem, 1fr);
  gap: 1rem;
  width: min(100%, 27rem);
}

.bh-map-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 7rem;
  gap: 0.45rem;
  padding: 1rem 1.05rem;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
}

.bh-map-stat--primary {
  border-top-color: rgba(255, 70, 94, 0.42);
}

.bh-map-stat-num {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.8rem;
  line-height: 1;
  color: #FF556D;
  font-weight: 500;
  letter-spacing: -1px;
  text-shadow: 0 0 20px rgba(255, 68, 95, 0.18);
}

.bh-map-stat-pct {
  font-size: 1.5rem;
  vertical-align: super;
  margin-left: 2px;
}

.bh-map-stat-label {
  font-size: 0.65rem;
  letter-spacing: 1.7px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.bh-map-legend {
  display: grid;
  gap: 0.78rem;
  width: min(100%, 27rem);
}

.bh-map-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.65rem;
  letter-spacing: 1.35px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.bh-map-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.bh-map-dot-active { background: #FF465E; box-shadow: 0 0 0 3px rgba(255, 70, 94, 0.2); }
.bh-map-dot-cyan { background: #18DDE5; box-shadow: 0 0 0 3px rgba(24, 221, 229, 0.18); }
.bh-map-dot-blue { background: #3D78FF; box-shadow: 0 0 0 3px rgba(61, 120, 255, 0.18); }

.bh-map-cta { align-self: flex-start; }

.bh-map-visual {
  position: relative;
  min-height: clamp(40rem, 47vw, 48rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  z-index: 2;
  margin-left: clamp(-2.25rem, -2vw, -1rem);
}

.bh-map-license-shell {
  position: relative;
  width: 100%;
  min-height: clamp(40rem, 47vw, 48rem);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
}

.bh-map-license-shell::before {
  content: '';
  position: absolute;
  inset: 12% 8% 14%;
  border-radius: 8px;
  background:
    radial-gradient(circle at 38% 48%, rgba(255, 68, 95, 0.42) 0%, rgba(255, 68, 95, 0.08) 34%, transparent 62%),
    radial-gradient(circle at 62% 44%, rgba(24, 221, 229, 0.22) 0%, transparent 48%);
  filter: blur(30px);
  pointer-events: none;
  opacity: 0.74;
}

.bh-map-license-shell::after {
  content: '';
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 3%;
  height: 52%;
  background: radial-gradient(ellipse at center, rgba(255, 68, 95, 0.2) 0%, rgba(61, 120, 255, 0.1) 26%, transparent 72%);
  filter: blur(20px);
  pointer-events: none;
  opacity: 0.86;
}

.bh-map-license-canvas {
  position: relative;
  width: min(110%, 74.8rem);
  height: clamp(44rem, 51.7vw, 52.8rem);
  margin: 0 auto;
  z-index: 1;
  left: 3rem;
  top: -2rem;
  filter:
    drop-shadow(0 42px 90px rgba(0, 0, 0, 0.54))
    drop-shadow(0 0 44px rgba(255, 68, 95, 0.12));
}

.bh-map-license-fallback {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background:
    radial-gradient(circle at 44% 40%, rgba(255, 68, 95, 0.3) 0%, rgba(255, 68, 95, 0.08) 24%, transparent 48%),
    radial-gradient(circle at 60% 52%, rgba(24, 221, 229, 0.14) 0%, transparent 32%),
    radial-gradient(circle at 50% 78%, rgba(61, 120, 255, 0.16) 0%, transparent 30%);
}

.bh-map-drag-pill {
  position: absolute;
  left: 1rem;
  bottom: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.78rem 1rem;
  border-radius: 999px;
  background: rgba(7, 8, 14, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 1.9px;
  text-transform: uppercase;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  pointer-events: none;
}

.bh-map-drag-orb {
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #18DDE5 0%, #3D78FF 45%, #FF445F 100%);
  box-shadow: 0 0 14px rgba(24, 221, 229, 0.45);
}

.bh-map-shield {
  margin-top: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  width: auto;
  padding: 0.78rem 0;
  border-radius: 999px;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.62rem;
  letter-spacing: 1.55px;
  font-weight: 700;
  text-transform: uppercase;
}

.bh-map-shield svg { color: #18DDE5; }

@media (max-width: 900px) {
  .bh-map-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .bh-map-visual {
    min-height: 33rem;
  }

  .bh-map-copy {
    max-width: 100%;
    justify-self: start;
    padding-left: 0;
  }

  .bh-map-copy::before {
    display: none;
  }

  .bh-map-license-shell {
    min-height: 33rem;
  }

  .bh-map-license-canvas {
    width: min(106%, 61.5rem);
    height: clamp(34rem, 72vw, 44.5rem);
    left: 0;
    top: -1rem;
  }
}

@media (max-width: 640px) {
  .bh-map-section {
    padding: 8rem 0 6rem;
    margin-top: -3.5rem;
    -webkit-mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.14) 1.5rem, rgba(0, 0, 0, 0.48) 3.5rem, #000000 6.5rem, #000000 100%);
    mask-image: linear-gradient(180deg, transparent 0, rgba(0, 0, 0, 0.14) 1.5rem, rgba(0, 0, 0, 0.48) 3.5rem, #000000 6.5rem, #000000 100%);
  }

  .bh-map-divider {
    height: 8.5rem;
    opacity: 0.88;
  }

  .bh-map-stats {
    gap: 1.25rem;
    flex-wrap: wrap;
  }

  .bh-map-stat-num { font-size: 2.2rem; }

  .bh-map-visual {
    min-height: 25rem;
  }

  .bh-map-license-shell {
    min-height: 25rem;
  }

  .bh-map-license-canvas,
  .bh-map-license-fallback {
    width: 100%;
    height: 25rem;
    left: 0;
    top: 0;
  }

  .bh-map-drag-pill {
    left: 0.8rem;
    bottom: 0.8rem;
    padding: 0.68rem 0.82rem;
    font-size: 0.58rem;
    letter-spacing: 1.5px;
  }

  .bh-map-shield {
    margin-top: 0;
    font-size: 0.54rem;
    letter-spacing: 1.4px;
  }
}
```
