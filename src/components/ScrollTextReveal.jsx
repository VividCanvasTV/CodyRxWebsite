import { useRef, useEffect, useState } from 'react'
import './ScrollTextReveal.css'

const LEFT_TEXT = "PRECISION COMPOUNDING"
const RIGHT_TEXT = "PERSONALIZED MEDICINE"
const SUB_LEFT = "State-of-the-art formulations crafted with clinical precision for every patient."
const SUB_RIGHT = "Custom therapies designed around your unique biochemistry and health goals."

export default function ScrollTextReveal() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollableHeight = rect.height - vh
      if (scrollableHeight <= 0) return
      const p = Math.max(0, Math.min(1, -rect.top / scrollableHeight))
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Phase 1: 0-0.35 — letters animate in
  // Phase 2: 0.35-0.65 — hold, sub-text fades in
  // Phase 3: 0.65-1.0 — everything fades out and slides away
  const letterReveal = Math.min(1, progress / 0.35)
  const subReveal = Math.max(0, Math.min(1, (progress - 0.3) / 0.2))
  const exitProgress = Math.max(0, Math.min(1, (progress - 0.65) / 0.35))

  const containerStyle = {
    opacity: 1 - exitProgress,
    transform: `translateY(${-exitProgress * 80}px)`,
  }

  return (
    <section ref={sectionRef} className="str-section">
      <div className="str-sticky">
        <div className="str-container" style={containerStyle}>
          <div className="str-side str-left">
            <div className="str-heading">
              {LEFT_TEXT.split('').map((char, i) => {
                const charProgress = Math.max(0, Math.min(1, (letterReveal * LEFT_TEXT.length - i) / 1))
                return (
                  <span
                    key={i}
                    className="str-char"
                    style={{
                      opacity: charProgress,
                      transform: `translateY(${(1 - charProgress) * 40}px) rotateX(${(1 - charProgress) * -90}deg)`,
                      filter: `blur(${(1 - charProgress) * 4}px)`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )
              })}
            </div>
            <p className="str-sub" style={{
              opacity: subReveal,
              transform: `translateY(${(1 - subReveal) * 20}px)`,
            }}>
              {SUB_LEFT}
            </p>
          </div>

          <div className="str-divider" style={{
            scaleY: letterReveal,
            opacity: letterReveal * 0.6,
          }} />

          <div className="str-side str-right">
            <div className="str-heading">
              {RIGHT_TEXT.split('').map((char, i) => {
                const charProgress = Math.max(0, Math.min(1, (letterReveal * RIGHT_TEXT.length - i) / 1))
                return (
                  <span
                    key={i}
                    className="str-char"
                    style={{
                      opacity: charProgress,
                      transform: `translateY(${(1 - charProgress) * 40}px) rotateX(${(1 - charProgress) * -90}deg)`,
                      filter: `blur(${(1 - charProgress) * 4}px)`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                )
              })}
            </div>
            <p className="str-sub" style={{
              opacity: subReveal,
              transform: `translateY(${(1 - subReveal) * 20}px)`,
            }}>
              {SUB_RIGHT}
            </p>
          </div>
        </div>

        <div className="str-brand" style={{
          opacity: subReveal * (1 - exitProgress),
          transform: `translateY(${(1 - subReveal) * 30 - exitProgress * 60}px)`,
        }}>
          Cody Drug R<sub>x</sub>
        </div>
      </div>
    </section>
  )
}
