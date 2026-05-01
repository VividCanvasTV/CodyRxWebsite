import { useEffect, useRef } from 'react'
import './SiteCursor.css'

export default function SiteCursor() {
  const ringRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const ring = ringRef.current
    let targetX = -100
    let targetY = -100
    let ringX = -100
    let ringY = -100
    let rafId = null

    const interactive = 'a, button, [role="button"], input, textarea, select, label, .bh-btn, .bh-float-card'

    const onMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    const onOver = (e) => {
      if (e.target.closest(interactive)) {
        ring.classList.add('is-hover')
      }
    }

    const onOut = (e) => {
      if (e.target.closest(interactive)) {
        ring.classList.remove('is-hover')
      }
    }

    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const onLeave = () => {
      ring.style.opacity = '0'
    }
    const onEnter = () => {
      ring.style.opacity = '1'
    }

    const tick = () => {
      ringX += (targetX - ringX) * 0.28
      ringY += (targetY - ringY) * 0.28
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    document.documentElement.classList.add('has-custom-cursor')
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
      cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={ringRef} className="site-cursor-ring" aria-hidden="true" />
}
