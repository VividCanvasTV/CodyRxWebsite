import { useRef, useEffect, useState, useCallback } from 'react'

const SCROLL_EPSILON = 0.0015
const IDLE_BATCH_SIZE = 6

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function isImageReady(img) {
  return Boolean(img?.complete && img.naturalWidth > 0)
}

function requestIdle(callback) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout: 1200 })
  }

  return window.setTimeout(() => callback({ didTimeout: true, timeRemaining: () => 0 }), 80)
}

function cancelIdle(handle) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle)
    return
  }

  window.clearTimeout(handle)
}

export default function ScrollSequence({
  totalFrames,
  framePath,
  frameExtension = 'webp',
  height = '300vh',
  sticky = true,
  startFrame = 1,
  endFrame,
  triggerMode = 'viewport',
  holdStart = 0,   // 0-1, portion of the scroll where frame stays on startFrame before advancing
  holdEnd = 0,     // 0-1, portion of the scroll at the END where frame stays on endFrame
  prePlay = 0,     // vh units of scroll before sticky starts where playback already advances
  frameIndexForProgress,
  children,
  onProgress,
}) {
  const canvasRef = useRef(null)
  const sectionRef = useRef(null)
  const imagesRef = useRef([])
  const readyFramesRef = useRef(new Set())
  const pendingLoadsRef = useRef(new Map())
  const currentFrameRef = useRef(-1)
  const requestedFrameRef = useRef(-1)
  const ctxRef = useRef(null)
  const drawRafRef = useRef(null)
  const scrollRafRef = useRef(null)
  const idleLoadRef = useRef(null)
  const mountedRef = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const [visualState, setVisualState] = useState({ progress: 0, zoomExtra: 0 })
  const visualStateRef = useRef(visualState)

  const minFrame = Math.max(0, startFrame - 1)
  const maxFrame = endFrame ? Math.min(endFrame, totalFrames) : totalFrames
  const frameRange = maxFrame - minFrame

  const getFrameSrc = useCallback((frameIndex) => {
    const frameNumber = String(frameIndex + 1).padStart(4, '0')
    return `${framePath}${frameNumber}.${frameExtension}`
  }, [framePath, frameExtension])

  const loadFrame = useCallback((frameIndex, priority = 'low') => {
    if (frameIndex < minFrame || frameIndex >= maxFrame) return Promise.resolve(null)

    const existing = imagesRef.current[frameIndex]
    if (isImageReady(existing)) {
      readyFramesRef.current.add(frameIndex)
      return Promise.resolve(existing)
    }

    const pending = pendingLoadsRef.current.get(frameIndex)
    if (pending) return pending

    const img = existing || new Image()
    img.decoding = 'async'
    if ('fetchPriority' in img) {
      img.fetchPriority = priority
    }

    imagesRef.current[frameIndex] = img

    const promise = new Promise((resolve) => {
      img.onload = () => {
        readyFramesRef.current.add(frameIndex)
        pendingLoadsRef.current.delete(frameIndex)
        resolve(img)
      }
      img.onerror = () => {
        pendingLoadsRef.current.delete(frameIndex)
        resolve(null)
      }

      if (!img.src) {
        img.src = getFrameSrc(frameIndex)
      }
    })

    pendingLoadsRef.current.set(frameIndex, promise)
    return promise
  }, [getFrameSrc, maxFrame, minFrame])

  const loadFrameWindow = useCallback((centerFrame, priority = 'low') => {
    for (let offset = -2; offset <= 2; offset++) {
      loadFrame(centerFrame + offset, priority)
    }
  }, [loadFrame])

  const findNearestReadyFrame = useCallback((frameIndex) => {
    if (readyFramesRef.current.has(frameIndex)) return frameIndex

    for (let offset = 1; offset < frameRange; offset++) {
      const previous = frameIndex - offset
      const next = frameIndex + offset

      if (previous >= minFrame && readyFramesRef.current.has(previous)) return previous
      if (next < maxFrame && readyFramesRef.current.has(next)) return next
    }

    return null
  }, [frameRange, maxFrame, minFrame])

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let drawableFrame = frameIndex
    let img = imagesRef.current[drawableFrame]

    if (!isImageReady(img)) {
      loadFrame(drawableFrame, 'high').then(() => {
        if (mountedRef.current && requestedFrameRef.current === frameIndex) {
          drawFrame(frameIndex)
        }
      })
      drawableFrame = findNearestReadyFrame(frameIndex)
      if (drawableFrame === null) return
      img = imagesRef.current[drawableFrame]
    }

    if (!isImageReady(img) || drawableFrame === currentFrameRef.current) return

    const ctx = ctxRef.current ?? canvas.getContext('2d', { alpha: false, desynchronized: true })
    ctxRef.current = ctx
    if (!ctx) return

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
    }
    currentFrameRef.current = drawableFrame
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
  }, [findNearestReadyFrame, loadFrame])

  useEffect(() => {
    mountedRef.current = true
    imagesRef.current = Array(totalFrames)
    readyFramesRef.current = new Set()
    pendingLoadsRef.current = new Map()
    currentFrameRef.current = -1
    requestedFrameRef.current = minFrame
    ctxRef.current = null
    setLoaded(false)
    setVisualState({ progress: 0, zoomExtra: 0 })
    visualStateRef.current = { progress: 0, zoomExtra: 0 }

    let cancelled = false
    const primeFrames = []
    for (let frame = minFrame; frame < Math.min(maxFrame, minFrame + 8); frame++) {
      primeFrames.push(frame)
    }

    loadFrame(minFrame, 'high').then(() => {
      if (cancelled) return
      setLoaded(true)
      drawFrame(minFrame)
    })

    primeFrames.forEach((frame) => loadFrame(frame, 'high'))

    const remainingFrames = []
    for (let frame = minFrame + 8; frame < maxFrame; frame++) {
      remainingFrames.push(frame)
    }

    let cursor = 0
    const scheduleIdleLoad = () => {
      idleLoadRef.current = requestIdle(() => {
        if (cancelled) return

        for (let count = 0; count < IDLE_BATCH_SIZE && cursor < remainingFrames.length; count++) {
          loadFrame(remainingFrames[cursor])
          cursor++
        }

        if (cursor < remainingFrames.length) {
          scheduleIdleLoad()
        }
      })
    }

    scheduleIdleLoad()

    return () => {
      cancelled = true
      mountedRef.current = false
      if (idleLoadRef.current) cancelIdle(idleLoadRef.current)
      pendingLoadsRef.current.clear()
    }
  }, [drawFrame, loadFrame, maxFrame, minFrame, totalFrames])

  useEffect(() => {
    if (!loaded) return
    drawFrame(minFrame)

    const updateFromScroll = () => {
      scrollRafRef.current = null
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
        p = clamp01((vh - rect.top) / (vh + rect.height))
      }

      if (onProgress) onProgress(p)

      // Continue zoom beyond section end — track how far past the section bottom we've scrolled
      const zoomExtra = rect.bottom < vh ? Math.min(1, (vh - rect.bottom) / (vh * 2)) : 0
      const previous = visualStateRef.current
      if (
        Math.abs(previous.progress - p) > SCROLL_EPSILON ||
        Math.abs(previous.zoomExtra - zoomExtra) > SCROLL_EPSILON
      ) {
        const nextVisualState = { progress: p, zoomExtra }
        visualStateRef.current = nextVisualState
        setVisualState(nextVisualState)
      }

      /* Apply holds: frames hold on startFrame until progress > holdStart,
         then advance, and hold on endFrame when progress > (1 - holdEnd). */
      let frameIndex
      if (frameIndexForProgress) {
        frameIndex = Math.round(frameIndexForProgress(p, {
          minFrame,
          maxFrame,
          frameRange,
          totalFrames,
        }))
        frameIndex = Math.max(minFrame, Math.min(maxFrame - 1, frameIndex))
      } else {
        const playWindow = 1 - holdStart - holdEnd
        const playProgress = playWindow <= 0
          ? 0
          : Math.max(0, Math.min(1, (p - holdStart) / playWindow))
        frameIndex = Math.min(maxFrame - 1, minFrame + Math.floor(playProgress * frameRange))
      }
      requestedFrameRef.current = frameIndex
      loadFrameWindow(frameIndex, 'high')

      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current)
      drawRafRef.current = requestAnimationFrame(() => {
        drawRafRef.current = null
        drawFrame(frameIndex)
      })
    }

    const onScroll = () => {
      if (scrollRafRef.current) return
      scrollRafRef.current = requestAnimationFrame(updateFromScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
      if (drawRafRef.current) {
        cancelAnimationFrame(drawRafRef.current)
        drawRafRef.current = null
      }
    }
  }, [loaded, drawFrame, maxFrame, minFrame, frameRange, totalFrames, triggerMode, holdStart, holdEnd, prePlay, frameIndexForProgress, onProgress, loadFrameWindow])

  const { progress, zoomExtra } = visualState

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
