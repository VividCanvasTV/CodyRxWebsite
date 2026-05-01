import { useEffect, useRef, useState, useCallback } from 'react'
import './TreatmentAnimation.css'

const model1 = `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="14" /><rect x="32" y="55" width="36" height="55" rx="8" /><rect x="16" y="55" width="10" height="50" rx="5" /><rect x="74" y="55" width="10" height="50" rx="5" /><rect x="37" y="115" width="10" height="60" rx="5" /><rect x="53" y="115" width="10" height="60" rx="5" /></svg>`
const model2 = `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="13" /><rect x="34" y="55" width="32" height="55" rx="8" /><rect x="18" y="55" width="10" height="50" rx="5" /><rect x="72" y="55" width="10" height="50" rx="5" /><rect x="37" y="115" width="10" height="60" rx="5" /><rect x="53" y="115" width="10" height="60" rx="5" /></svg>`
const model3 = `<svg viewBox="0 0 100 200"><circle cx="50" cy="30" r="12" /><rect x="36" y="55" width="28" height="55" rx="8" /><rect x="20" y="55" width="10" height="50" rx="5" /><rect x="70" y="55" width="10" height="50" rx="5" /><rect x="37" y="115" width="10" height="60" rx="5" /><rect x="53" y="115" width="10" height="60" rx="5" /></svg>`

const cycles = [
  {
    name: 'SEMAGLUTIDE',
    color: '#d32020',
    glow: 'rgba(211,32,32,0.8)',
    disclaimer: 'OPTIMIZED FOR CONTINUOUS METABOLIC CONTROL',
    svg: model1,
  },
  {
    name: 'TIRZEPATIDE',
    color: '#00f2fe',
    glow: 'rgba(0,242,254,0.8)',
    disclaimer: 'ADVANCED DUAL-ACTION RECEPTOR AGONIST',
    svg: model2,
  },
  {
    name: 'LIPO-B INJECTION',
    color: '#20d366',
    glow: 'rgba(32,211,102,0.8)',
    disclaimer: 'BOOSTS ENERGY & ENHANCES FAT METABOLISM',
    svg: model3,
  },
]

export default function TreatmentAnimation() {
  const sceneRef = useRef(null)
  const personRef = useRef(null)
  const indexRef = useRef(0)
  const [cycle, setCycle] = useState(cycles[0])
  const [playing, setPlaying] = useState(false)

  const playNext = useCallback(() => {
    const data = cycles[indexRef.current]
    setCycle(data)
    setPlaying(false)

    // Force reflow then play
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPlaying(true)
      })
    })

    indexRef.current = (indexRef.current + 1) % cycles.length
  }, [])

  useEffect(() => {
    playNext()
  }, [playNext])

  // Listen for person animation end to trigger next cycle
  useEffect(() => {
    const el = personRef.current
    if (!el) return
    const handler = (e) => {
      if (e.animationName === 'ta-modelTimeline') {
        playNext()
      }
    }
    el.addEventListener('animationend', handler)
    return () => el.removeEventListener('animationend', handler)
  }, [playNext])

  // Hover slowdown
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const enter = () => document.getAnimations().forEach((a) => { if (el.contains(a.effect?.target)) a.playbackRate = 0.25 })
    const leave = () => document.getAnimations().forEach((a) => { if (el.contains(a.effect?.target)) a.playbackRate = 1 })
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave) }
  }, [])

  return (
    <div
      className={`ta-container${playing ? ' ta-play' : ''}`}
      ref={sceneRef}
      style={{ '--ta-color': cycle.color, '--ta-glow': cycle.glow }}
    >
      {/* Header */}
      <div className="ta-header-wrapper">
        <h2 className="ta-header">CODY DRUG RX</h2>
        <svg className="ta-header-tracer" viewBox="0 0 440 70">
          <rect x="2" y="2" width="436" height="66" rx="33" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <g filter="url(#ta-glow)">
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
            <circle cx="0" cy="0" r="6" fill={cycle.color} opacity="0.6" />
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              path="M 35,2 L 405,2 A 33,33 0 0 1 438,35 A 33,33 0 0 1 405,68 L 35,68 A 33,33 0 0 1 2,35 A 33,33 0 0 1 35,2 Z"
            />
          </g>
          <defs>
            <filter id="ta-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Left: Vial */}
      <div className="ta-vial-section">
        <div className="ta-vial-wrapper">
          <div className="ta-pipette">
            <div className="ta-pipette-bulb" />
            <div className="ta-pipette-glass">
              <div className="ta-pipette-fill" />
            </div>
          </div>
          <div className="ta-drop" />
          <div className="ta-vial">
            <div className="ta-liquid">
              <div className="ta-bubble ta-b1" />
              <div className="ta-bubble ta-b2" />
              <div className="ta-bubble ta-b3" />
            </div>
          </div>
        </div>
        <div className="ta-label-container">
          <div className="ta-drug-label">
            <div className="ta-hover-pop">
              {cycle.name}
              <br />
              <span style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', fontWeight: 300 }}>
                CUSTOM <span style={{ color: '#ff4b4b', fontWeight: 600 }}>FORMULATION</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Connection */}
      <div className="ta-connection">
        <div className="ta-line">
          <div className="ta-pulse" />
          <div className="ta-pulse-spark ta-p1" />
          <div className="ta-pulse-spark ta-p2" />
          <div className="ta-pulse-spark ta-p3" />
        </div>
        <div className="ta-disclaimer">{cycle.disclaimer}</div>
      </div>

      {/* Right: Person */}
      <div className="ta-person-section">
        <div className="ta-person" ref={personRef}>
          <div className="ta-person-glow" />
          <div className="ta-model-svg" dangerouslySetInnerHTML={{ __html: cycle.svg }} />
        </div>
        <div className="ta-label-container">
          <div className="ta-drug-label" style={{ opacity: 0.7 }}>
            <div className="ta-hover-pop">
              TARGETED
              <br />
              <span style={{ fontSize: '11px', color: '#fff', letterSpacing: '2px', fontWeight: 300 }}>
                WEIGHT LOSS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
