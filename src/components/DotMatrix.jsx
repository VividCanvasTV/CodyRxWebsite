import { useRef, useEffect, useCallback } from 'react'
import './DotMatrix.css'

const STEPS = [
  { num: '01', title: 'Private review', copy: 'Start with goals, background, and eligibility so the formulation path is clear before anything is prepared.' },
  { num: '02', title: 'Protocol shaping', copy: 'Dose logic, preparation details, and fulfillment requirements are tightened into one coherent plan.' },
  { num: '03', title: 'Delivery and follow-through', copy: 'Support continues through storage guidance, refill timing, and the questions that appear after arrival.' },
]

export default function DotMatrix() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const scrollRevealRef = useRef(0) // 0-1 how revealed via scroll
  const dotsRef = useRef([])
  const rafRef = useRef(null)
  const inViewRef = useRef(false)

  // Build dot grid on mount & resize
  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'

    const spacing = w < 600 ? 18 : 24
    const cols = Math.floor(w / spacing)
    const rows = Math.floor(h / spacing)
    const offsetX = (w - (cols - 1) * spacing) / 2
    const offsetY = (h - (rows - 1) * spacing) / 2

    const dots = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isAccent = Math.random() < 0.12
        dots.push({
          x: offsetX + col * spacing,
          y: offsetY + row * spacing,
          col,
          row,
          baseRadius: isAccent ? 3.5 : 2.5,
          radius: 0, // starts hidden, animates in
          targetRadius: isAccent ? 3.5 : 2.5,
          isAccent,
          wave: 0, // wave-in progress 0-1
        })
      }
    }
    dotsRef.current = dots
  }, [])

  useEffect(() => {
    buildGrid()
    window.addEventListener('resize', buildGrid)
    return () => window.removeEventListener('resize', buildGrid)
  }, [buildGrid])

  // Mouse tracking
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Scroll observer — detect when in view + scroll progress for reveal
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(container)

    const onScroll = () => {
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight
      // Progress: 0 when top enters viewport bottom, 1 when top reaches viewport top
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
      scrollRevealRef.current = progress
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)

    let startTime = null

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x * dpr
      const my = mouseRef.current.y * dpr
      const hoverRadius = 100 * dpr
      const hoverSoft = 50 * dpr
      const scrollProgress = scrollRevealRef.current
      const dots = dotsRef.current

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const dx = dot.x * dpr
        const dy = dot.y * dpr

        // Wave-in animation: stagger by column
        const waveDelay = dot.col * 0.03 + dot.row * 0.01
        const waveT = Math.max(0, Math.min(1, (scrollProgress * 3 - waveDelay)))
        dot.wave = waveT

        // Mouse proximity — shrink dots near cursor
        const distToMouse = Math.sqrt((dx - mx) ** 2 + (dy - my) ** 2)
        let mouseScale = 1
        if (distToMouse < hoverRadius) {
          mouseScale = 0.05
        } else if (distToMouse < hoverRadius + hoverSoft) {
          mouseScale = 0.05 + ((distToMouse - hoverRadius) / hoverSoft) * 0.95
        }

        // Combine wave-in + mouse shrink
        const targetR = dot.baseRadius * dpr * waveT * mouseScale
        // Smooth lerp
        dot.radius += (targetR - dot.radius) * 0.15

        if (dot.radius < 0.3) continue // skip invisible dots

        // Subtle float animation
        const floatX = Math.sin(elapsed * 0.8 + dot.col * 0.5) * 1.2 * dpr
        const floatY = Math.cos(elapsed * 0.6 + dot.row * 0.4) * 1.2 * dpr

        ctx.beginPath()
        ctx.arc(dx + floatX, dy + floatY, dot.radius, 0, Math.PI * 2)

        if (dot.isAccent) {
          ctx.fillStyle = `rgba(229, 9, 20, ${0.7 * waveT * mouseScale})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * waveT * mouseScale})`
        }
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="dot-matrix" ref={containerRef}>
      {/* Content layer — sits behind dots */}
      <div className="dot-matrix__content">
        {STEPS.map((step) => (
          <div key={step.num} className="dot-matrix__step">
            <span className="dot-matrix__num">{step.num}</span>
            <h3 className="dot-matrix__title">{step.title}</h3>
            <p className="dot-matrix__copy">{step.copy}</p>
          </div>
        ))}
      </div>

      {/* Canvas dot overlay */}
      <canvas ref={canvasRef} className="dot-matrix__canvas" />
    </div>
  )
}
