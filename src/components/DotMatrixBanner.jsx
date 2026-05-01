import { useRef, useEffect, useCallback } from 'react'
import './DotMatrixBanner.css'

export default function DotMatrixBanner() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const scrollRevealRef = useRef(0)
  const dotsRef = useRef([])
  const rafRef = useRef(null)

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

    const spacing = w < 600 ? 14 : 18
    const cols = Math.floor(w / spacing)
    const rows = Math.floor(h / spacing)
    const offsetX = (w - (cols - 1) * spacing) / 2
    const offsetY = (h - (rows - 1) * spacing) / 2

    const dots = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isAccent = Math.random() < 0.1
        dots.push({
          x: offsetX + col * spacing,
          y: offsetY + row * spacing,
          col, row,
          baseRadius: isAccent ? 2.5 : 1.8,
          radius: 0,
          isAccent,
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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    const onLeave = () => { mouseRef.current.x = -9999; mouseRef.current.y = -9999 }
    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    return () => { container.removeEventListener('mousemove', onMove); container.removeEventListener('mouseleave', onLeave) }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onScroll = () => {
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight
      scrollRevealRef.current = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)
    let startTime = null

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const mx = mouseRef.current.x * dpr
      const my = mouseRef.current.y * dpr
      const hoverR = 80 * dpr
      const hoverSoft = 40 * dpr
      const scroll = scrollRevealRef.current
      const dots = dotsRef.current

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const dx = dot.x * dpr, dy = dot.y * dpr

        const waveDelay = dot.col * 0.025
        const waveT = Math.max(0, Math.min(1, (scroll * 3.5 - waveDelay)))

        const dist = Math.sqrt((dx - mx) ** 2 + (dy - my) ** 2)
        let ms = 1
        if (dist < hoverR) ms = 0.05
        else if (dist < hoverR + hoverSoft) ms = 0.05 + ((dist - hoverR) / hoverSoft) * 0.95

        const targetR = dot.baseRadius * dpr * waveT * ms
        dot.radius += (targetR - dot.radius) * 0.15
        if (dot.radius < 0.2) continue

        const fx = Math.sin(elapsed * 0.7 + dot.col * 0.4) * 0.8 * dpr
        const fy = Math.cos(elapsed * 0.5 + dot.row * 0.3) * 0.8 * dpr

        ctx.beginPath()
        ctx.arc(dx + fx, dy + fy, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = dot.isAccent
          ? `rgba(229, 9, 20, ${0.6 * waveT * ms})`
          : `rgba(255, 255, 255, ${0.35 * waveT * ms})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="dot-banner" ref={containerRef}>
      <div className="dot-banner__content">
        <span className="dot-banner__text">Cody Drug R<sub>x</sub></span>
      </div>
      <canvas ref={canvasRef} className="dot-banner__canvas" />
    </div>
  )
}
