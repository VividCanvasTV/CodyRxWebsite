import { useEffect, useMemo, useState } from 'react'

const VIEWBOX_SIZE = 720
const VIEWBOX_CENTER = VIEWBOX_SIZE / 2
const GLOBE_RADIUS = 222
const GRID_VISIBILITY_THRESHOLD = -0.06
const ROUTE_VISIBILITY_THRESHOLD = -0.18
const LABEL_VISIBILITY_THRESHOLD = 0.02
const NODE_VISIBILITY_THRESHOLD = -0.22
const INITIAL_ROTATION = -0.46
const AUTO_ROTATION_SPEED = 0.00016

const COVERAGE_GLOBE_NODES = [
  { id: 'seattle', lat: 47.61, lng: -122.33, color: '#18DDE5', size: 0.058 },
  { id: 'san-francisco', lat: 37.77, lng: -122.42, color: '#FF5A70', size: 0.066 },
  { id: 'los-angeles', lat: 34.05, lng: -118.24, color: '#FF445F', size: 0.07 },
  { id: 'phoenix', lat: 33.45, lng: -112.07, color: '#18DDE5', size: 0.056 },
  { id: 'denver', lat: 39.74, lng: -104.99, color: '#3D78FF', size: 0.06 },
  { id: 'dallas', lat: 32.78, lng: -96.8, color: '#FF445F', size: 0.068 },
  { id: 'chicago', lat: 41.88, lng: -87.63, color: '#FF5A70', size: 0.064 },
  { id: 'atlanta', lat: 33.75, lng: -84.39, color: '#18DDE5', size: 0.062 },
  { id: 'miami', lat: 25.76, lng: -80.19, color: '#3D78FF', size: 0.058 },
  { id: 'new-york', lat: 40.71, lng: -74.0, color: '#FF445F', size: 0.074 },
  { id: 'boston', lat: 42.36, lng: -71.06, color: '#18DDE5', size: 0.056 },
]

const COVERAGE_GLOBE_ROUTE_SPECS = [
  { from: 'seattle', to: 'chicago', color: '#FF5167', height: 0.28 },
  { from: 'san-francisco', to: 'denver', color: '#FF6277', height: 0.24 },
  { from: 'los-angeles', to: 'dallas', color: '#FF445F', height: 0.3 },
  { from: 'phoenix', to: 'miami', color: '#18DDE5', height: 0.34 },
  { from: 'denver', to: 'new-york', color: '#3D78FF', height: 0.32 },
  { from: 'dallas', to: 'atlanta', color: '#FF445F', height: 0.2 },
  { from: 'chicago', to: 'new-york', color: '#FF6277', height: 0.16 },
  { from: 'atlanta', to: 'boston', color: '#18DDE5', height: 0.22 },
  { from: 'los-angeles', to: 'new-york', color: '#FF445F', height: 0.38 },
]

const SERVED_STATE_MARKERS = [
  { abbr: 'WA', lat: 47.4, lng: -120.7, color: '#18DDE5' },
  { abbr: 'OR', lat: 43.9, lng: -120.6 },
  { abbr: 'CA', lat: 36.7, lng: -119.4, color: '#FF445F' },
  { abbr: 'NV', lat: 39.3, lng: -116.6 },
  { abbr: 'AZ', lat: 34.2, lng: -111.7, color: '#18DDE5' },
  { abbr: 'UT', lat: 39.3, lng: -111.7 },
  { abbr: 'CO', lat: 39.0, lng: -105.5, color: '#3D78FF' },
  { abbr: 'NM', lat: 34.4, lng: -106.1 },
  { abbr: 'TX', lat: 31.0, lng: -99.0, color: '#FF445F' },
  { abbr: 'OK', lat: 35.5, lng: -97.5 },
  { abbr: 'IA', lat: 42.1, lng: -93.5 },
  { abbr: 'MO', lat: 38.5, lng: -92.5 },
  { abbr: 'AR', lat: 34.9, lng: -92.3 },
  { abbr: 'LA', lat: 31.1, lng: -91.9 },
  { abbr: 'MN', lat: 46.3, lng: -94.2 },
  { abbr: 'WI', lat: 44.5, lng: -89.5 },
  { abbr: 'IL', lat: 40.0, lng: -89.2 },
  { abbr: 'IN', lat: 39.9, lng: -86.3 },
  { abbr: 'MI', lat: 44.3, lng: -85.5, color: '#18DDE5' },
  { abbr: 'OH', lat: 40.4, lng: -82.8 },
  { abbr: 'KY', lat: 37.8, lng: -85.8 },
  { abbr: 'TN', lat: 35.8, lng: -86.4 },
  { abbr: 'AL', lat: 32.8, lng: -86.7 },
  { abbr: 'GA', lat: 32.6, lng: -83.4, color: '#18DDE5' },
  { abbr: 'SC', lat: 33.9, lng: -80.9 },
  { abbr: 'NC', lat: 35.5, lng: -79.0 },
  { abbr: 'FL', lat: 28.0, lng: -81.7, color: '#3D78FF' },
  { abbr: 'WV', lat: 38.6, lng: -80.6 },
  { abbr: 'VA', lat: 37.5, lng: -78.7 },
  { abbr: 'MD', lat: 39.0, lng: -76.7 },
  { abbr: 'PA', lat: 41.2, lng: -77.2 },
  { abbr: 'NJ', lat: 40.1, lng: -74.5 },
  { abbr: 'NY', lat: 42.9, lng: -75.5, color: '#FF445F' },
  { abbr: 'CT', lat: 41.6, lng: -72.7 },
  { abbr: 'MA', lat: 42.3, lng: -71.8, color: '#18DDE5' },
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function degToRad(value) {
  return (value * Math.PI) / 180
}

function latLngToCartesian(lat, lng, radius = 1) {
  const latRad = degToRad(lat)
  const lngRad = degToRad(lng)
  const cosLat = Math.cos(latRad)

  return {
    x: Math.sin(lngRad) * cosLat * radius,
    y: Math.sin(latRad) * radius,
    z: Math.cos(lngRad) * cosLat * radius,
  }
}

function normalizePoint(point) {
  const length = Math.hypot(point.x, point.y, point.z) || 1
  return {
    x: point.x / length,
    y: point.y / length,
    z: point.z / length,
  }
}

function rotateAroundYAxis(point, angle) {
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)

  return {
    x: point.x * cos - point.z * sin,
    y: point.y,
    z: point.x * sin + point.z * cos,
  }
}

function projectPoint(point) {
  return {
    x: VIEWBOX_CENTER + point.x * GLOBE_RADIUS,
    y: VIEWBOX_CENTER - point.y * GLOBE_RADIUS,
    z: point.z,
  }
}

function buildLatitudeRing(lat) {
  const points = []

  for (let lng = -180; lng <= 180; lng += 6) {
    points.push(latLngToCartesian(lat, lng))
  }

  return points
}

function buildLongitudeRing(lng) {
  const points = []

  for (let lat = -88; lat <= 88; lat += 4) {
    points.push(latLngToCartesian(lat, lng))
  }

  return points
}

function buildArcPoints(startNode, endNode, height = 0.26) {
  const start = latLngToCartesian(startNode.lat, startNode.lng)
  const end = latLngToCartesian(endNode.lat, endNode.lng)
  const points = []

  for (let step = 0; step <= 36; step += 1) {
    const t = step / 36
    const blend = normalizePoint({
      x: start.x * (1 - t) + end.x * t,
      y: start.y * (1 - t) + end.y * t,
      z: start.z * (1 - t) + end.z * t,
    })
    const lift = 1 + Math.sin(Math.PI * t) * height

    points.push({
      x: blend.x * lift,
      y: blend.y * lift,
      z: blend.z * lift,
    })
  }

  return points
}

function pointsToPath(points) {
  if (points.length < 2) return ''

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')
}

function buildVisiblePathSegments(points, threshold) {
  const segments = []
  let current = []

  points.forEach((point) => {
    if (point.z > threshold) {
      current.push(point)
      return
    }

    if (current.length > 1) {
      segments.push(pointsToPath(current))
    }

    current = []
  })

  if (current.length > 1) {
    segments.push(pointsToPath(current))
  }

  return segments
}

const COVERAGE_GLOBE_NODE_MAP = Object.fromEntries(
  COVERAGE_GLOBE_NODES.map((node) => [node.id, node])
)

const COVERAGE_GLOBE_POINTS = COVERAGE_GLOBE_NODES.map((node) => ({
  ...node,
  point: latLngToCartesian(node.lat, node.lng),
}))

const COVERAGE_GLOBE_LATITUDE_RINGS = [-60, -30, 0, 30, 60].map(buildLatitudeRing)
const COVERAGE_GLOBE_LONGITUDE_RINGS = [-150, -110, -70, -30, 10, 50, 90, 130].map(buildLongitudeRing)

const COVERAGE_GLOBE_ROUTES = COVERAGE_GLOBE_ROUTE_SPECS.map((route) => ({
  ...route,
  points: buildArcPoints(COVERAGE_GLOBE_NODE_MAP[route.from], COVERAGE_GLOBE_NODE_MAP[route.to], route.height),
}))

const COVERAGE_STATE_LABELS = SERVED_STATE_MARKERS.map((state) => ({
  ...state,
  color: state.color ?? '#FF5A70',
  point: latLngToCartesian(state.lat, state.lng, 1.06),
}))

function buildScene(rotation) {
  const latitudeRings = COVERAGE_GLOBE_LATITUDE_RINGS.map((ring, index) => {
    const projected = ring.map((point) => projectPoint(rotateAroundYAxis(point, rotation)))

    return {
      id: `lat-${index}`,
      color: index === 2 ? '#18DDE5' : '#FF596E',
      opacity: index === 2 ? 0.52 : 0.2,
      width: index === 2 ? 2.2 : 1.2,
      segments: buildVisiblePathSegments(projected, GRID_VISIBILITY_THRESHOLD),
    }
  })

  const longitudeRings = COVERAGE_GLOBE_LONGITUDE_RINGS.map((ring, index) => {
    const projected = ring.map((point) => projectPoint(rotateAroundYAxis(point, rotation)))

    return {
      id: `lng-${index}`,
      color: index % 3 === 0 ? '#3D78FF' : '#FF596E',
      opacity: 0.18,
      width: 1.05,
      segments: buildVisiblePathSegments(projected, GRID_VISIBILITY_THRESHOLD),
    }
  })

  const routes = COVERAGE_GLOBE_ROUTES.map((route) => {
    const projected = route.points.map((point) => projectPoint(rotateAroundYAxis(point, rotation)))
    const averageDepth =
      projected.reduce((sum, point) => sum + point.z, 0) / Math.max(projected.length, 1)

    return {
      ...route,
      ghostPath: pointsToPath(projected),
      segments: buildVisiblePathSegments(projected, ROUTE_VISIBILITY_THRESHOLD),
      opacity: clamp(0.28 + (averageDepth + 1) * 0.22, 0.22, 0.72),
    }
  })

  const nodes = COVERAGE_GLOBE_POINTS.map((point) => {
    const projected = projectPoint(rotateAroundYAxis(point.point, rotation))

    return {
      ...point,
      projected,
      visible: projected.z > NODE_VISIBILITY_THRESHOLD,
      glowOpacity: clamp((projected.z + 0.35) / 1.4, 0.16, 0.75),
      radius: point.size * 118,
    }
  }).sort((left, right) => left.projected.z - right.projected.z)

  const states = COVERAGE_STATE_LABELS.map((state) => {
    const projected = projectPoint(rotateAroundYAxis(state.point, rotation))

    return {
      ...state,
      projected,
      visible: projected.z > LABEL_VISIBILITY_THRESHOLD,
      opacity: clamp((projected.z + 0.15) / 1.15, 0.32, 0.92),
    }
  })

  return {
    latitudeRings,
    longitudeRings,
    routes,
    nodes,
    states,
  }
}

export default function CoverageGlobe() {
  const [rotation, setRotation] = useState(INITIAL_ROTATION)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return undefined

    let frameId = 0
    let startTime = performance.now()

    const animate = (now) => {
      setRotation(INITIAL_ROTATION + (now - startTime) * AUTO_ROTATION_SPEED)
      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  const scene = useMemo(() => buildScene(rotation), [rotation])

  return (
    <div className="bh-coverage-globe" aria-hidden="true">
      <svg
        className="bh-coverage-globe__svg"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bhCoverageCore" cx="36%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#2A0F16" />
            <stop offset="40%" stopColor="#15060B" />
            <stop offset="72%" stopColor="#0A0B13" />
            <stop offset="100%" stopColor="#05070C" />
          </radialGradient>
          <radialGradient id="bhCoverageSurfaceGlow" cx="38%" cy="36%" r="62%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="34%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="bhCoverageHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,68,95,0.26)" />
            <stop offset="58%" stopColor="rgba(61,120,255,0.14)" />
            <stop offset="100%" stopColor="rgba(24,221,229,0)" />
          </radialGradient>
          <filter id="bhCoverageBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="bhCoverageSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <ellipse
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER + GLOBE_RADIUS + 64}
          rx={GLOBE_RADIUS - 38}
          ry={46}
          fill="rgba(10, 16, 24, 0.72)"
          filter="url(#bhCoverageSoftGlow)"
        />
        <circle
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER}
          r={GLOBE_RADIUS + 74}
          fill="url(#bhCoverageHalo)"
          opacity="0.88"
          filter="url(#bhCoverageBlur)"
        />
        <circle
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER}
          r={GLOBE_RADIUS}
          fill="url(#bhCoverageCore)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.4"
        />
        <circle
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER}
          r={GLOBE_RADIUS - 2}
          fill="url(#bhCoverageSurfaceGlow)"
          opacity="0.72"
        />

        {scene.latitudeRings.map((ring) =>
          ring.segments.map((segment, index) => (
            <path
              key={`${ring.id}-${index}`}
              d={segment}
              fill="none"
              stroke={ring.color}
              strokeWidth={ring.width}
              strokeOpacity={ring.opacity}
              strokeLinecap="round"
            />
          ))
        )}

        {scene.longitudeRings.map((ring) =>
          ring.segments.map((segment, index) => (
            <path
              key={`${ring.id}-${index}`}
              d={segment}
              fill="none"
              stroke={ring.color}
              strokeWidth={ring.width}
              strokeOpacity={ring.opacity}
              strokeLinecap="round"
            />
          ))
        )}

        {scene.routes.map((route) => (
          <g key={`${route.from}-${route.to}`}>
            <path
              d={route.ghostPath}
              fill="none"
              stroke={route.color}
              strokeWidth="1.8"
              strokeOpacity="0.12"
              strokeLinecap="round"
            />
            {route.segments.map((segment, index) => (
              <path
                key={`${route.from}-${route.to}-${index}`}
                d={segment}
                fill="none"
                stroke={route.color}
                strokeWidth="2.6"
                strokeOpacity={route.opacity}
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}

        {scene.states.map((state) =>
          state.visible ? (
            <g
              key={state.abbr}
              transform={`translate(${state.projected.x.toFixed(2)} ${state.projected.y.toFixed(2)})`}
              opacity={state.opacity}
            >
              <circle cx="0" cy="0" r="4.6" fill={state.color} />
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill={state.color}
                fontSize="12"
                fontWeight="700"
                letterSpacing="1.5"
              >
                {state.abbr}
              </text>
            </g>
          ) : null
        )}

        {scene.nodes.map((point) =>
          point.visible ? (
            <g
              key={point.id}
              transform={`translate(${point.projected.x.toFixed(2)} ${point.projected.y.toFixed(2)})`}
              opacity={clamp((point.projected.z + 0.2) / 1.2, 0.36, 1)}
            >
              <circle
                r={(point.radius * 2.25).toFixed(2)}
                fill={point.color}
                opacity={point.glowOpacity}
                filter="url(#bhCoverageSoftGlow)"
              />
              <circle
                r={point.radius.toFixed(2)}
                fill={point.color}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
              />
            </g>
          ) : null
        )}

        <circle
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER}
          r={GLOBE_RADIUS + 4}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
