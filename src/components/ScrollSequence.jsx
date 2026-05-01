import { useRef, useEffect, useState, useCallback } from 'react'

export default function ScrollSequence({
  totalFrames,
  framePath,
  height = '300vh',
  sticky = true,
  startFrame = 1,
  endFrame,
  triggerMode = 'viewport',
  holdStart = 0,   // 0-1, portion of the scroll where frame stays on startFrame before advancing
  holdEnd = 0,     // 0-1, portion of the scroll at the END where frame stays on endFrame
  prePlay = 0,     // vh units of scroll before sticky starts where playback already advances
  children,
  onProgress,
}) {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(-1)
  const rafRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [zoomExtra, setZoomExtra] = useState(0)

  const minFrame = Math.max(0, startFrame - 1)
  const maxFrame = endFrame ? Math.min(endFrame, totalFrames) : totalFrames
  const frameRange = maxFrame - minFrame

  useEffect(() => {
    let mounted = true
    const images = []
    let loadedCount = 0

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image()
      const num = String(i).padStart(4, '0')
      img.src = `${framePath}${num}.webp`
      img.onload = () => {
        loadedCount++
        if (loadedCount === totalFrames && mounted) setLoaded(true)
      }
      images.push(img)
    }
    imagesRef.current = images
    return () => { mounted = false }
  }, [totalFrames, framePath])

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = imagesRef.current[frameIndex]
    if (!img || !img.complete) return
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
  }, [])

  useEffect(() => {
    if (!loaded) return
    drawFrame(minFrame)

    const onScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight

      let p
      if (triggerMode === 'top') {
        /* prePlay shifts the start earlier so the video begins playing
           while the section is still below viewport top (visible but not
           yet sticky). prePlay is in units of vh (e.g., 0.7 = 70vh). */
        const prePlayPx = prePlay * vh
        const effectiveTop = rect.top - prePlayPx
        const scrollableHeight = rect.height - vh + prePlayPx
        if (scrollableHeight <= 0) p = 0
        else p = Math.max(0, Math.min(1, -effectiveTop / scrollableHeight))
      } else {
        p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)))
      }

      setProgress(p)
      if (onProgress) onProgress(p)

      // Continue zoom beyond section end — track how far past the section bottom we've scrolled
      if (rect.bottom < vh) {
        const extra = Math.min(1, (vh - rect.bottom) / (vh * 2))
        setZoomExtra(extra)
      } else {
        setZoomExtra(0)
      }

      /* Apply holds: frames hold on startFrame until progress > holdStart,
         then advance, and hold on endFrame when progress > (1 - holdEnd). */
      const playWindow = 1 - holdStart - holdEnd
      const playProgress = playWindow <= 0
        ? 0
        : Math.max(0, Math.min(1, (p - holdStart) / playWindow))
      const frameIndex = Math.min(maxFrame - 1, minFrame + Math.floor(playProgress * frameRange))
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex))
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loaded, drawFrame, maxFrame, minFrame, frameRange, triggerMode, holdStart, holdEnd, prePlay, onProgress])

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
      }}
    >
      <div
        style={{
          position: sticky ? 'sticky' : 'relative',
          top: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            transform: `scale(${1 + Math.max(0, (progress - 0.4) / 0.6) * 0.4 + zoomExtra * 0.5})`,
            willChange: 'transform',
          }}
        />
        {/* Overlay content on top of the video */}
        {children && typeof children === 'function' ? children(progress) : children}
        {!loaded && (
          <div style={{
            position: 'absolute',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            letterSpacing: '2px',
            fontFamily: 'Inter, sans-serif',
          }}>
            LOADING...
          </div>
        )}
      </div>
    </div>
  )
}
