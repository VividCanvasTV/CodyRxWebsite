import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, PerspectiveCamera } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { geoAlbersUsa, geoPath } from 'd3-geo'
import { feature as topojsonFeature } from 'topojson-client'
import statesAtlas from 'us-atlas/states-10m.json'
import './StateLicenseMap3D.css'

const MAP_WIDTH = 1024
const MAP_HEIGHT = 650
const MAP_SCALE = 0.026
const STATE_DEPTH = 0.18
const LABEL_Z = STATE_DEPTH + 0.085
const HIT_EDGE_TOLERANCE = 0.065
const HIT_KEEP_TOLERANCE = 0.12
const MAP_BASE_ROTATION = [-0.18, 0.04, 0]
const POINTER_ZOOM_PULL = 0.62

const STATUS_STYLES = {
  licensed: {
    label: 'Licensed',
    fill: '#210103',
    fillHover: '#470306',
    glow: '#ff2b31',
    flare: '#ff7670',
    softGlow: '#ff6368',
  },
  pending: {
    label: 'Pending',
    fill: '#042322',
    fillHover: '#064a46',
    glow: '#22fff0',
    flare: '#9afff6',
    softGlow: '#80fff6',
  },
  comingSoon: {
    label: 'Coming Soon',
    fill: '#17191b',
    fillHover: '#2b2e32',
    glow: '#f4f7f4',
    flare: '#fff8e7',
    softGlow: '#ffffff',
  },
}

const STATE_META_BY_FIPS = {
  '01': { abbr: 'AL', name: 'Alabama' },
  '02': { abbr: 'AK', name: 'Alaska' },
  '04': { abbr: 'AZ', name: 'Arizona' },
  '05': { abbr: 'AR', name: 'Arkansas' },
  '06': { abbr: 'CA', name: 'California' },
  '08': { abbr: 'CO', name: 'Colorado' },
  '09': { abbr: 'CT', name: 'Connecticut' },
  10: { abbr: 'DE', name: 'Delaware' },
  12: { abbr: 'FL', name: 'Florida' },
  13: { abbr: 'GA', name: 'Georgia' },
  15: { abbr: 'HI', name: 'Hawaii' },
  16: { abbr: 'ID', name: 'Idaho' },
  17: { abbr: 'IL', name: 'Illinois' },
  18: { abbr: 'IN', name: 'Indiana' },
  19: { abbr: 'IA', name: 'Iowa' },
  20: { abbr: 'KS', name: 'Kansas' },
  21: { abbr: 'KY', name: 'Kentucky' },
  22: { abbr: 'LA', name: 'Louisiana' },
  23: { abbr: 'ME', name: 'Maine' },
  24: { abbr: 'MD', name: 'Maryland' },
  25: { abbr: 'MA', name: 'Massachusetts' },
  26: { abbr: 'MI', name: 'Michigan' },
  27: { abbr: 'MN', name: 'Minnesota' },
  28: { abbr: 'MS', name: 'Mississippi' },
  29: { abbr: 'MO', name: 'Missouri' },
  30: { abbr: 'MT', name: 'Montana' },
  31: { abbr: 'NE', name: 'Nebraska' },
  32: { abbr: 'NV', name: 'Nevada' },
  33: { abbr: 'NH', name: 'New Hampshire' },
  34: { abbr: 'NJ', name: 'New Jersey' },
  35: { abbr: 'NM', name: 'New Mexico' },
  36: { abbr: 'NY', name: 'New York' },
  37: { abbr: 'NC', name: 'North Carolina' },
  38: { abbr: 'ND', name: 'North Dakota' },
  39: { abbr: 'OH', name: 'Ohio' },
  40: { abbr: 'OK', name: 'Oklahoma' },
  41: { abbr: 'OR', name: 'Oregon' },
  42: { abbr: 'PA', name: 'Pennsylvania' },
  44: { abbr: 'RI', name: 'Rhode Island' },
  45: { abbr: 'SC', name: 'South Carolina' },
  46: { abbr: 'SD', name: 'South Dakota' },
  47: { abbr: 'TN', name: 'Tennessee' },
  48: { abbr: 'TX', name: 'Texas' },
  49: { abbr: 'UT', name: 'Utah' },
  50: { abbr: 'VT', name: 'Vermont' },
  51: { abbr: 'VA', name: 'Virginia' },
  53: { abbr: 'WA', name: 'Washington' },
  54: { abbr: 'WV', name: 'West Virginia' },
  55: { abbr: 'WI', name: 'Wisconsin' },
  56: { abbr: 'WY', name: 'Wyoming' },
}

const LICENSED_STATES = [
  'AZ',
  'CO',
  'DE',
  'FL',
  'GA',
  'IA',
  'ID',
  'IN',
  'KS',
  'MN',
  'MO',
  'NY',
  'OK',
  'PA',
  'TX',
  'WI',
  'WY',
]

const PENDING_STATES = [
  'AR',
  'CA',
  'CT',
  'IL',
  'KY',
  'LA',
  'MA',
  'MD',
  'MS',
  'MT',
  'NC',
  'ND',
  'NH',
  'NJ',
  'NM',
  'OR',
  'RI',
  'SC',
  'TN',
  'WA',
]

const STATUS_BY_STATE = {
  ...Object.fromEntries(LICENSED_STATES.map((state) => [state, 'licensed'])),
  ...Object.fromEntries(PENDING_STATES.map((state) => [state, 'pending'])),
}

const LABEL_OFFSETS = {
  CT: [1.2, -0.16],
  DE: [1.35, -0.62],
  MA: [1.45, 0.36],
  MD: [1.26, -0.88],
  NJ: [1.26, -0.42],
  RI: [1.62, 0.08],
  VT: [0.6, 0.28],
}

const TINY_LABELS = new Set(['CT', 'DE', 'MA', 'MD', 'NH', 'NJ', 'RI', 'VT'])

const EXTRUDE_SETTINGS = {
  depth: STATE_DEPTH,
  bevelEnabled: true,
  bevelSegments: 2,
  bevelSize: 0.018,
  bevelThickness: 0.018,
  curveSegments: 2,
}

const noopRaycast = () => {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function createEmptyBounds() {
  return {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
}

function expandBounds(bounds, point) {
  bounds.minX = Math.min(bounds.minX, point.x)
  bounds.minY = Math.min(bounds.minY, point.y)
  bounds.maxX = Math.max(bounds.maxX, point.x)
  bounds.maxY = Math.max(bounds.maxY, point.y)
}

function boundsContainPoint(bounds, x, y, padding = 0) {
  return (
    x >= bounds.minX - padding &&
    x <= bounds.maxX + padding &&
    y >= bounds.minY - padding &&
    y <= bounds.maxY + padding
  )
}

function getRingArea(ring) {
  let area = 0

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    area += ring[previous].x * ring[index].y - ring[index].x * ring[previous].y
  }

  return Math.abs(area / 2)
}

function pointInRing(x, y, ring) {
  let inside = false

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const currentPoint = ring[index]
    const previousPoint = ring[previous]
    const crossesY = currentPoint.y > y !== previousPoint.y > y

    if (!crossesY) continue

    const xAtY = ((previousPoint.x - currentPoint.x) * (y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x
    if (x < xAtY) inside = !inside
  }

  return inside
}

function pointInPolygon(x, y, rings) {
  if (!rings[0] || !pointInRing(x, y, rings[0])) return false

  return rings.slice(1).every((holeRing) => !pointInRing(x, y, holeRing))
}

function getSegmentDistanceSq(x, y, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSq = dx * dx + dy * dy

  if (lengthSq === 0) {
    const px = x - start.x
    const py = y - start.y
    return px * px + py * py
  }

  const t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSq))
  const projectedX = start.x + t * dx
  const projectedY = start.y + t * dy
  const px = x - projectedX
  const py = y - projectedY

  return px * px + py * py
}

function getPolygonDistanceSq(x, y, rings) {
  let minDistanceSq = Infinity

  rings.forEach((ring) => {
    for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
      minDistanceSq = Math.min(minDistanceSq, getSegmentDistanceSq(x, y, ring[previous], ring[index]))
    }
  })

  return minDistanceSq
}

function pointInState(state, x, y) {
  return boundsContainPoint(state.hitBounds, x, y) && state.hitPolygons.some((polygon) => pointInPolygon(x, y, polygon))
}

function getStateDistanceSq(state, x, y) {
  if (!boundsContainPoint(state.hitBounds, x, y, HIT_KEEP_TOLERANCE)) return Infinity

  return state.hitPolygons.reduce(
    (minDistanceSq, polygon) => Math.min(minDistanceSq, getPolygonDistanceSq(x, y, polygon)),
    Infinity
  )
}

function getStateAtPoint(states, point, preferredAbbr) {
  const x = point.x
  const y = point.y
  const preferredState = preferredAbbr ? states.find((state) => state.abbr === preferredAbbr) : null

  if (preferredState && pointInState(preferredState, x, y)) return preferredState

  const containingStates = states.filter((state) => pointInState(state, x, y))
  if (containingStates.length > 0) {
    return containingStates.sort((a, b) => a.hitArea - b.hitArea)[0]
  }

  if (preferredState && getStateDistanceSq(preferredState, x, y) <= HIT_KEEP_TOLERANCE * HIT_KEEP_TOLERANCE) {
    return preferredState
  }

  let nearestState = null
  let nearestDistanceSq = Infinity

  states.forEach((state) => {
    const distanceSq = getStateDistanceSq(state, x, y)

    if (distanceSq < nearestDistanceSq) {
      nearestDistanceSq = distanceSq
      nearestState = state
    }
  })

  return nearestDistanceSq <= HIT_EDGE_TOLERANCE * HIT_EDGE_TOLERANCE ? nearestState : null
}

function toWorldPoint(projectedPoint) {
  return new THREE.Vector2(
    (projectedPoint[0] - MAP_WIDTH / 2) * MAP_SCALE,
    (MAP_HEIGHT / 2 - projectedPoint[1]) * MAP_SCALE
  )
}

function geometryToPolygons(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

function createProjectedRings(polygon, projection) {
  return polygon
    .map((ring) =>
      ring
        .map((coordinate) => projection(coordinate))
        .filter(Boolean)
        .map(toWorldPoint)
    )
    .filter((ring) => ring.length >= 3)
}

function createShapeFromRings(rings) {
  if (rings.length === 0) return null

  const shape = new THREE.Shape(rings[0])

  rings.slice(1).forEach((holeRing) => {
    const hole = new THREE.Path(holeRing)
    shape.holes.push(hole)
  })

  return shape
}

function createStateGeometry(stateFeature, projection) {
  const parts = []
  const outlines = []
  const hitPolygons = []
  const hitBounds = createEmptyBounds()
  let hitArea = 0

  geometryToPolygons(stateFeature.geometry).forEach((polygon) => {
    const rings = createProjectedRings(polygon, projection)
    const shape = createShapeFromRings(rings)

    if (!shape) return

    const geometry = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS)
    geometry.computeVertexNormals()
    parts.push({
      geometry,
      edgeGeometry: new THREE.EdgesGeometry(geometry, 18),
    })

    rings.forEach((ring) => {
      outlines.push(ring.map((point) => new THREE.Vector3(point.x, point.y, STATE_DEPTH + 0.026)))
      ring.forEach((point) => expandBounds(hitBounds, point))
    })

    hitPolygons.push(rings)
    hitArea += getRingArea(rings[0])
  })

  return { parts, outlines, hitPolygons, hitBounds, hitArea }
}

function createMapData() {
  const states = topojsonFeature(statesAtlas, statesAtlas.objects.states)
  const projection = geoAlbersUsa().fitSize([MAP_WIDTH, MAP_HEIGHT], states)
  const path = geoPath(projection)

  return states.features
    .map((stateFeature) => {
      const fips = String(stateFeature.id).padStart(2, '0')
      const meta = STATE_META_BY_FIPS[fips]

      if (!meta) return null

      const centroid = path.centroid(stateFeature)
      const anchor = toWorldPoint(centroid)
      const labelOffset = LABEL_OFFSETS[meta.abbr] ?? [0, 0]
      const labelPosition = new THREE.Vector3(
        anchor.x + labelOffset[0],
        anchor.y + labelOffset[1],
        LABEL_Z
      )

      const stateGeometry = createStateGeometry(stateFeature, projection)

      return {
        ...meta,
        status: STATUS_BY_STATE[meta.abbr] ?? 'comingSoon',
        parts: stateGeometry.parts,
        outlines: stateGeometry.outlines,
        hitPolygons: stateGeometry.hitPolygons,
        hitBounds: stateGeometry.hitBounds,
        hitArea: stateGeometry.hitArea,
        anchor: new THREE.Vector3(anchor.x, anchor.y, LABEL_Z),
        labelPosition,
        hasLeader: labelOffset[0] !== 0 || labelOffset[1] !== 0,
        isTinyLabel: TINY_LABELS.has(meta.abbr),
      }
    })
    .filter(Boolean)
}

function createRingPoints(radiusX, radiusY, z, segments = 180) {
  const points = []

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, z))
  }

  return points
}

function seededRandom(seed) {
  let value = seed

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function createLabelMaterial(label) {
  const canvas = document.createElement('canvas')
  const size = 192
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, size, size)
  context.font = '700 82px Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.lineJoin = 'round'
  context.strokeStyle = 'rgba(2, 4, 6, 0.92)'
  context.lineWidth = 16
  context.strokeText(label, size / 2, size / 2 + 4)
  context.fillStyle = '#f8fbff'
  context.fillText(label, size / 2, size / 2 + 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  return new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  })
}

function StateLabel({ state, compactScale }) {
  const material = useMemo(() => createLabelMaterial(state.abbr), [state.abbr])
  const labelScale = (state.isTinyLabel ? 0.58 : 0.72) / compactScale

  useEffect(() => {
    return () => {
      material.map?.dispose()
      material.dispose()
    }
  }, [material])

  return (
    <sprite
      position={state.labelPosition}
      scale={[labelScale, labelScale, 1]}
      material={material}
      renderOrder={10}
      raycast={noopRaycast}
    />
  )
}

function DataField() {
  const groupRef = useRef(null)
  const rings = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) =>
        createRingPoints(7.8 + index * 0.78, 3.9 + index * 0.42, -0.72 - index * 0.012)
      ),
    []
  )
  const pointsGeometry = useMemo(() => {
    const random = seededRandom(9427)
    const positions = new Float32Array(900 * 3)

    for (let index = 0; index < 900; index += 1) {
      const angle = random() * Math.PI * 2
      const radius = 6.8 + random() * 12.8
      const arcBias = 0.72 + random() * 0.44

      positions[index * 3] = Math.cos(angle) * radius * 1.22
      positions[index * 3 + 1] = Math.sin(angle) * radius * arcBias
      positions[index * 3 + 2] = -1.15 - random() * 0.65
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z += delta * 0.012
  })

  return (
    <group ref={groupRef} position={[0, -0.25, -0.35]}>
      {rings.map((points, index) => (
        <Line
          key={`ring-${index}`}
          points={points}
          color={index % 4 === 0 ? '#20f7ec' : '#1388b6'}
          lineWidth={index % 4 === 0 ? 0.52 : 0.34}
          transparent
          opacity={index % 4 === 0 ? 0.24 : 0.12}
          depthWrite={false}
        />
      ))}
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#18d9ff"
          size={0.035}
          transparent
          opacity={0.68}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function DynamicLighting() {
  const cyanLight = useRef(null)
  const redLight = useRef(null)
  const whiteLight = useRef(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (cyanLight.current) {
      cyanLight.current.position.x = -7.6 + Math.sin(time * 0.5) * 1.35
      cyanLight.current.position.y = 3.6 + Math.cos(time * 0.38) * 0.75
      cyanLight.current.intensity = 30 + Math.sin(time * 0.9) * 5
    }

    if (redLight.current) {
      redLight.current.position.x = 8.2 + Math.cos(time * 0.46) * 1.25
      redLight.current.position.y = -2.1 + Math.sin(time * 0.34) * 0.95
      redLight.current.intensity = 28 + Math.cos(time * 0.82) * 4
    }

    if (whiteLight.current) {
      whiteLight.current.position.x = Math.sin(time * 0.28) * 2
      whiteLight.current.intensity = 3.8 + Math.sin(time * 0.52) * 0.55
    }
  })

  return (
    <>
      <pointLight ref={cyanLight} position={[-7.6, 3.6, 5]} intensity={32} color="#1ffff2" distance={19} />
      <pointLight ref={redLight} position={[8.2, -2.1, 5]} intensity={28} color="#ff2e35" distance={19} />
      <spotLight
        ref={whiteLight}
        position={[0, -9, 14]}
        angle={0.55}
        penumbra={0.72}
        intensity={4}
        color="#fff8e7"
        castShadow={false}
      />
    </>
  )
}

function StateObject({ state, compactScale, hovered }) {
  const style = STATUS_STYLES[state.status]
  const fillMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: hovered ? style.fillHover : style.fill,
        emissive: style.glow,
        emissiveIntensity: hovered ? 0.82 : 0.24,
        metalness: 0.22,
        roughness: 0.42,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [hovered, style]
  )
  const edgeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: hovered ? style.softGlow : style.glow,
        transparent: true,
        opacity: hovered ? 0.66 : 0.24,
        depthWrite: false,
        toneMapped: false,
      }),
    [hovered, style]
  )
  const leaderPoints = useMemo(
    () =>
      state.hasLeader
        ? [
            state.anchor,
            new THREE.Vector3(
              state.labelPosition.x - Math.sign(state.labelPosition.x - state.anchor.x) * 0.26,
              state.labelPosition.y,
              LABEL_Z
            ),
          ]
        : null,
    [state]
  )

  return (
    <group>
      {state.parts.map((part, index) => (
        <mesh
          key={`${state.abbr}-mesh-${index}`}
          geometry={part.geometry}
          material={fillMaterial}
          renderOrder={hovered ? 5 : 1}
          raycast={noopRaycast}
        />
      ))}

      {state.parts.map((part, index) => (
        <lineSegments
          key={`${state.abbr}-edge-${index}`}
          geometry={part.edgeGeometry}
          material={edgeMaterial}
          renderOrder={hovered ? 8 : 4}
          raycast={noopRaycast}
        />
      ))}

      {state.outlines.map((points, index) => (
        <group key={`${state.abbr}-outline-${index}`}>
          <Line
            points={points}
            color={hovered ? style.flare : style.glow}
            lineWidth={hovered ? 7.4 : 3.35}
            transparent
            opacity={hovered ? 0.34 : 0.16}
            depthWrite={false}
            renderOrder={hovered ? 8 : 5}
            raycast={noopRaycast}
          />
          <Line
            points={points}
            color={hovered ? style.softGlow : style.glow}
            lineWidth={hovered ? 2.9 : 1.42}
            transparent
            opacity={hovered ? 1 : 0.94}
            depthWrite={false}
            renderOrder={hovered ? 9 : 6}
            raycast={noopRaycast}
          />
        </group>
      ))}

      {leaderPoints ? (
        <Line
          points={leaderPoints}
          color={style.glow}
          lineWidth={hovered ? 1.05 : 0.72}
          transparent
          opacity={hovered ? 0.88 : 0.58}
          depthWrite={false}
          raycast={noopRaycast}
        />
      ) : null}

      <StateLabel state={state} compactScale={compactScale} />
    </group>
  )
}

function StateHitPlane({ stateData, hoveredState, interactionRef, onClearHover, onHover, onLeave }) {
  const handlePointerMove = useCallback(
    (event) => {
      event.stopPropagation()
      const localPoint = event.object.worldToLocal(event.point.clone())
      const nextState = getStateAtPoint(stateData, localPoint, hoveredState?.abbr)
      const halfWidth = (MAP_WIDTH * MAP_SCALE) / 2
      const halfHeight = (MAP_HEIGHT * MAP_SCALE) / 2

      interactionRef.current = {
        x: clamp(localPoint.x / halfWidth, -1, 1),
        y: clamp(localPoint.y / halfHeight, -1, 1),
        active: true,
        anchor: nextState?.anchor ?? null,
      }

      if (nextState) {
        onHover(nextState, event)
      } else {
        onClearHover()
      }
    },
    [hoveredState?.abbr, interactionRef, onClearHover, onHover, stateData]
  )

  const handlePointerOut = useCallback(
    (event) => {
      event.stopPropagation()
      interactionRef.current = {
        ...interactionRef.current,
        active: false,
        anchor: null,
      }
      onLeave()
    },
    [interactionRef, onLeave]
  )

  return (
    <mesh
      position={[0, 0, STATE_DEPTH + 0.035]}
      onPointerMove={handlePointerMove}
      onPointerOver={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry args={[MAP_WIDTH * MAP_SCALE, MAP_HEIGHT * MAP_SCALE]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

function ResponsiveMapRig({ stateData, hoveredState, interactionRef, compactScale, cameraRef, cameraZ, onClearHover, onHover, onLeave }) {
  const groupRef = useRef(null)
  const lookAtRef = useRef(new THREE.Vector3(0, -0.25, 0))

  useFrame((_, delta) => {
    const camera = cameraRef.current
    if (!camera) return

    const focus = interactionRef.current
    const active = focus.active ? 1 : 0
    const pointerX = focus.x * active
    const pointerY = focus.y * active
    const pointerDistance = clamp(Math.hypot(pointerX, pointerY), 0, 1)
    const anchorX = focus.anchor ? clamp(focus.anchor.x / 7.8, -1, 1) * active : 0
    const anchorY = focus.anchor ? clamp(focus.anchor.y / 4.8, -1, 1) * active : 0

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        MAP_BASE_ROTATION[0] + pointerY * 0.034,
        4.4,
        delta
      )
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        MAP_BASE_ROTATION[1] - pointerX * 0.058,
        4.4,
        delta
      )
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        pointerX * 0.012,
        4,
        delta
      )
    }

    const targetCameraX = pointerX * 0.36 + anchorX * 0.26
    const targetCameraY = -0.2 + pointerY * 0.22 + anchorY * 0.14
    const targetCameraZ = cameraZ - active * (0.28 + pointerDistance * POINTER_ZOOM_PULL)

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCameraX, 3.8, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCameraY, 3.8, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCameraZ, 4.2, delta)
    lookAtRef.current.set(targetCameraX * 0.18, -0.25 + (targetCameraY + 0.2) * 0.16, 0)
    camera.lookAt(lookAtRef.current)
  })

  return (
    <group
      ref={groupRef}
      scale={compactScale}
      rotation={MAP_BASE_ROTATION}
      onPointerMissed={onLeave}
    >
      <StateHitPlane
        stateData={stateData}
        hoveredState={hoveredState}
        interactionRef={interactionRef}
        onClearHover={onClearHover}
        onHover={onHover}
        onLeave={onLeave}
      />
      {stateData.map((state) => (
        <StateObject
          key={state.abbr}
          state={state}
          compactScale={compactScale}
          hovered={hoveredState?.abbr === state.abbr}
        />
      ))}
    </group>
  )
}

function MapScene({ embedded = false, hoveredState, interactionRef, onClearHover, onHover, onLeave }) {
  const stateData = useMemo(() => createMapData(), [])
  const cameraRef = useRef(null)
  const { size } = useThree()
  const compactScale = size.width < 560 ? 0.56 : size.width < 820 ? 0.62 : size.width < 1100 ? 0.82 : 1
  const cameraZ = size.width < 560 ? 29 : size.width < 820 ? 27.2 : size.width < 1100 ? 24 : 22.5
  const cameraFov = size.width < 560 ? 48 : size.width < 820 ? 45 : 42

  useEffect(() => {
    const camera = cameraRef.current
    if (!camera) return

    camera.position.set(0, -0.2, cameraZ)
    camera.fov = cameraFov
    camera.updateProjectionMatrix()
  }, [cameraFov, cameraZ])

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={cameraFov} near={0.1} far={90} />
      {embedded ? null : <color attach="background" args={['#010203']} />}
      <fog attach="fog" args={[embedded ? '#050407' : '#010203', 21, 52]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={['#eafff9', '#190608', 0.62]} />
      <directionalLight position={[-4, -6, 12]} intensity={1.7} color="#fff8e8" />
      <DynamicLighting />

      {embedded ? null : <DataField />}

      <ResponsiveMapRig
        stateData={stateData}
        hoveredState={hoveredState}
        interactionRef={interactionRef}
        compactScale={compactScale}
        cameraRef={cameraRef}
        cameraZ={cameraZ}
        onClearHover={onClearHover}
        onHover={onHover}
        onLeave={onLeave}
      />

      {embedded ? null : (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.35}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.46}
            mipmapBlur
            radius={0.68}
          />
          <Vignette eskil={false} offset={0.18} darkness={0.74} />
        </EffectComposer>
      )}
    </>
  )
}

function getTooltipPosition(event, embedded) {
  const margin = 18
  const tooltipWidth = 232
  const tooltipGap = 16
  const clientX = event.nativeEvent.clientX
  const clientY = event.nativeEvent.clientY
  const viewportWidth = window.innerWidth || 1280
  const viewportHeight = window.innerHeight || 800
  const frameRect = document.querySelector('.license-map-frame')?.getBoundingClientRect()
  const copyRect = embedded ? document.querySelector('.bh-map-copy')?.getBoundingClientRect() : null
  const bounds = frameRect
    ? {
        left: Math.max(margin, frameRect.left + margin),
        right: Math.min(
          viewportWidth - margin,
          copyRect ? copyRect.left - tooltipGap : frameRect.right - margin
        ),
      }
    : {
        left: margin,
        right: viewportWidth - margin,
      }
  const constrainedRight = Math.max(bounds.left + tooltipWidth + tooltipGap, bounds.right)
  const shouldOpenLeft =
    clientX + tooltipGap + tooltipWidth > constrainedRight ||
    clientX > constrainedRight - tooltipWidth * 0.55
  const x = shouldOpenLeft
    ? clamp(clientX, bounds.left + tooltipWidth + tooltipGap, constrainedRight)
    : clamp(clientX, bounds.left, constrainedRight - tooltipWidth - tooltipGap)

  return {
    x,
    y: Math.min(Math.max(clientY, margin), viewportHeight - margin),
    horizontal: shouldOpenLeft ? 'left' : 'right',
    vertical: clientY < 165 ? 'below' : 'above',
  }
}

export default function StateLicenseMap3D({ embedded = false }) {
  const hoverSessionRef = useRef(null)
  const interactionRef = useRef({
    x: 0,
    y: 0,
    active: false,
    anchor: null,
  })
  const [hoveredState, setHoveredState] = useState(null)
  const [tooltipMotion, setTooltipMotion] = useState('enter')
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    horizontal: 'right',
    vertical: 'above',
  })

  useEffect(() => {
    if (embedded) return undefined

    document.body.classList.add('license-map-route')
    document.title = 'Cody Rx | United States Licensing Map'

    return () => {
      document.body.classList.remove('license-map-route')
    }
  }, [embedded])

  const handleHover = useCallback((state, event) => {
    const previousState = hoverSessionRef.current
    if (previousState !== state.abbr) {
      setTooltipMotion(previousState ? 'move' : 'enter')
      hoverSessionRef.current = state.abbr
    }
    setHoveredState((currentState) => (currentState?.abbr === state.abbr ? currentState : state))
    setTooltipPosition(getTooltipPosition(event, embedded))
  }, [embedded])

  const clearHover = useCallback(() => {
    hoverSessionRef.current = null
    setTooltipMotion('enter')
    setHoveredState(null)
  }, [])

  const handleLeave = useCallback(() => {
    interactionRef.current = {
      ...interactionRef.current,
      active: false,
      anchor: null,
    }
    clearHover()
  }, [clearHover])

  const hoveredStyle = hoveredState ? STATUS_STYLES[hoveredState.status] : null

  return (
    <section
      className={`license-map-shell${embedded ? ' license-map-shell--embedded' : ''}`}
      aria-label={embedded ? 'Embedded United States licensing map' : 'United States licensing map'}
    >
      <div className="license-map-stage">
        <div className="license-map-frame">
          <div className="license-map-canvas">
            <Canvas
              camera={{ position: [0, -0.2, 24], fov: 42 }}
              dpr={[1, 1.8]}
              gl={{ antialias: true, alpha: embedded, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                if (embedded) gl.setClearColor(0x000000, 0)
              }}
            >
              <Suspense fallback={null}>
                <MapScene
                  embedded={embedded}
                  hoveredState={hoveredState}
                  interactionRef={interactionRef}
                  onClearHover={clearHover}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              </Suspense>
            </Canvas>
          </div>

          <div className="license-map-statusbar" aria-hidden="true">
            <div className="license-map-brand">
              <span>Cody Drug</span>
              <strong>United States Licensing Map</strong>
            </div>
            <div className="license-map-legend">
              {Object.entries(STATUS_STYLES).map(([status, style]) => (
                <span key={status} className="license-map-legend-item">
                  <i style={{ '--legend-color': style.glow }} />
                  {style.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hoveredState ? (
        <div
          className="license-map-tooltip"
          data-horizontal={tooltipPosition.horizontal}
          data-motion={tooltipMotion}
          data-vertical={tooltipPosition.vertical}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            '--status-color': hoveredStyle.glow,
            '--status-flare': hoveredStyle.flare,
          }}
        >
          <div className="license-map-tooltip-card">
            <div key={hoveredState.abbr} className="license-map-tooltip-copy">
              <span className="license-map-tooltip-status">
                <i />
                <span>{hoveredStyle.label}</span>
              </span>
              <div className="license-map-tooltip-title">
                <strong>{hoveredState.name}</strong>
                <b>{hoveredState.abbr}</b>
              </div>
              <em>Cody Rx licensing status</em>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
