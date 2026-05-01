import { Float, Environment, Lightformer, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'

/* ── Final resting position (where the vial is now — don't change) ── */
const FINAL_POS = { x: 0, y: -0.2, z: 0.5, scale: 2.2, rx: -0.15, ry: 0.12, rz: -0.1 }

/* ── Scroll motion path: hero → center → shrink & twist to show label → drop below ── */
const scrollStops = [
  // 0% — hero position (matches FINAL_POS)
  { p: 0.0,  x: 0,   y: -0.2, z: 0.5, scale: 2.2, rx: -0.15, ry: 0.12,  rz: -0.1 },
  // 5% — immediately start responding to scroll
  { p: 0.05, x: 0,   y: -0.1, z: 0.8, scale: 2.3, rx: -0.1,  ry: 0.3,   rz: -0.05 },
  // 12% — moves to center, spinning
  { p: 0.12, x: 0,   y: 0.2,  z: 1.5, scale: 2.6, rx: 0,     ry: 0.8,   rz: 0 },
  // 20% — centered, going horizontal, label rotating into view
  { p: 0.20, x: 0,   y: 0.3,  z: 2,   scale: 2.8, rx: 0.05,  ry: 1.5,   rz: Math.PI / 2 },
  // 28% — still horizontal, slightly smaller, label facing camera
  { p: 0.28, x: 0,   y: 0.1,  z: 1.2, scale: 2.2, rx: 0.05,  ry: 0,     rz: Math.PI / 2 },
  // 36% — shrinking, tilting back upright, starting to drop
  { p: 0.36, x: 0,   y: -1.5, z: 0.5, scale: 1.6, rx: 0.1,   ry: -0.1,  rz: 0.3 },
  // 45% — drops below viewport (before Expert Care section)
  { p: 0.45, x: 0,   y: -6,   z: 0,   scale: 1.2, rx: 0.2,   ry: -0.2,  rz: 0.05 },
  // Hold below for the rest
  { p: 1.0,  x: 0,   y: -6,   z: 0,   scale: 1.2, rx: 0.2,   ry: -0.2,  rz: 0.05 },
]

function getScrollValue(progress, key) {
  const p = THREE.MathUtils.clamp(progress, 0, 1)
  for (let i = 0; i < scrollStops.length - 1; i++) {
    const a = scrollStops[i], b = scrollStops[i + 1]
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p)
      const eased = easeInOutCubic(t)
      return THREE.MathUtils.lerp(a[key], b[key], eased)
    }
  }
  return scrollStops[scrollStops.length - 1][key]
}

/* ── Intro start position — off-screen left, small, rotated ── */
const INTRO_POS = { x: -4.5, y: -0.8, z: -2, scale: 0.3, rx: -0.6, ry: -1.2, rz: 0.3 }

/* ── Intro duration in seconds ── */
const INTRO_DURATION = 3.5

/* ── Smooth ease-out cubic bezier approximation ── */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

/* ── Smooth ease-in-out for scroll ── */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/* ── Orbital ring ── */
function OrbitalRing({ radius = 1.8, tubeRadius = 0.008, color = '#ffffff', opacity = 0.25, speed = 0.3, tiltX = 0.5, tiltZ = 0.15 }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * speed })
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tubeRadius, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.9} roughness={0.2} transparent opacity={opacity} />
    </mesh>
  )
}

/* ── Background cubes — mouse-reactive, upgraded materials ── */
function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const CUBE_COUNT = 55
const cubeData = Array.from({ length: CUBE_COUNT }, (_, i) => {
  const spread = 20
  const z = -1.5 - seededRandom(i * 3 + 2) * 10
  return {
    x: (seededRandom(i * 3) - 0.5) * spread * 2,
    y: (seededRandom(i * 3 + 1) - 0.5) * spread * 1.2,
    z,
    baseScale: 0.12 + seededRandom(i * 7) * 0.7,
    rx: seededRandom(i * 11) * Math.PI,
    ry: seededRandom(i * 13) * Math.PI,
    rz: seededRandom(i * 17) * Math.PI,
    rotSpeed: (seededRandom(i * 19) - 0.5) * 0.1,
    matType: i % 8,
    mouseStrength: THREE.MathUtils.mapLinear(z, -1.5, -11.5, 0.7, 0.1),
  }
})

function BackgroundCube({ data, mouseRef }) {
  const ref = useRef()
  const basePos = useRef(new THREE.Vector3(data.x, data.y, data.z))

  useFrame((state, delta) => {
    if (!ref.current) return
    const mx = mouseRef.current.x, my = mouseRef.current.y, s = data.mouseStrength
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, basePos.current.x + mx * s * 1.5, 2.5, delta)
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, basePos.current.y + my * s * 1.2 + Math.sin(state.clock.elapsedTime * 0.3 + data.rx) * 0.08, 2.5, delta)
    const dist = Math.sqrt(mx * mx + my * my)
    ref.current.scale.z = THREE.MathUtils.damp(ref.current.scale.z, data.baseScale * (1 + dist * s * 0.4), 3, delta)
    ref.current.rotation.x += data.rotSpeed * delta
    ref.current.rotation.y += data.rotSpeed * 0.7 * delta
  })

  const material = useMemo(() => {
    switch (data.matType) {
      case 0:
        // Matte obsidian
        return <meshStandardMaterial color="#1a1a1f" roughness={0.85} metalness={0.15} emissive="#08080a" emissiveIntensity={0.1} />
      case 1:
        // Glossy crimson — glows
        return <meshPhysicalMaterial color="#aa1018" roughness={0.12} metalness={0.6} clearcoat={1} clearcoatRoughness={0.08} emissive="#E50914" emissiveIntensity={0.45} envMapIntensity={2.5} />
      case 2:
        // Dark chrome mirror
        return <meshPhysicalMaterial color="#2a2a32" roughness={0.03} metalness={0.99} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={4} emissive="#0a0608" emissiveIntensity={0.08} />
      case 3:
        // Clear glass — refractive
        return <meshPhysicalMaterial color="#ffffff" roughness={0.05} metalness={0.0} roughness={0.15} opacity={0.25} thickness={2} ior={1.5} opacity={0.2} transparent envMapIntensity={3} clearcoat={1} clearcoatRoughness={0.05} />
      case 4:
        // Deep burgundy satin
        return <meshPhysicalMaterial color="#3a0a10" roughness={0.35} metalness={0.7} clearcoat={0.6} clearcoatRoughness={0.15} emissive="#1a0508" emissiveIntensity={0.2} envMapIntensity={1.8} />
      case 5:
        // Bright white matte
        return <meshStandardMaterial color="#f0f0f0" roughness={0.6} metalness={0.05} emissive="#ffffff" emissiveIntensity={0.05} />
      case 6:
        // Frosted white glass
        return <meshPhysicalMaterial color="#ffffff" roughness={0.25} metalness={0.0} roughness={0.3} opacity={0.45} thickness={1} ior={1.3} opacity={0.4} transparent envMapIntensity={2} />
      case 7:
        // Glossy white ceramic
        return <meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={3} emissive="#ffffff" emissiveIntensity={0.03} />
      default:
        return <meshStandardMaterial color="#222228" roughness={0.75} metalness={0.2} />
    }
  }, [data.matType])

  return (
    <mesh ref={ref} position={[data.x, data.y, data.z]} rotation={[data.rx, data.ry, data.rz]} scale={data.baseScale}>
      <boxGeometry args={[1, 1, 1]} />
      {material}
    </mesh>
  )
}

function BackgroundCubes({ mouseRef }) {
  return <group>{cubeData.map((d, i) => <BackgroundCube key={i} data={d} mouseRef={mouseRef} />)}</group>
}

/* ── Subtle bloom ── */
function BloomEffect() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef()

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.setSize(size.width, size.height)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.15, 0.4, 0.78)
    composer.addPass(bloom)
    const bokeh = new BokehPass(scene, camera, {
      focus: 8.5,
      aperture: 0.0012,
      maxblur: 0.005,
    })
    composer.addPass(bokeh)
    composer.addPass(new OutputPass())
    composerRef.current = composer
    return () => composer.dispose()
  }, [gl, scene, camera, size])

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.1
  }, [gl])

  useFrame(() => { if (composerRef.current) composerRef.current.render() }, 1)
  return null
}

/* ── Main Scene ── */
export default function Scene({ scrollProgressRef }) {
  const { scene } = useGLTF('/models/hallucinogenic-vial.glb')
  const vialRig = useRef()
  const glowPlane = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const introProgress = useRef(0)

  // Mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Auto-center & enhance materials
  const modelFit = useMemo(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return
      const name = (child.name || '').toLowerCase()
      if (name === 'cube' || name.includes('cube')) {
        child.visible = false
        return
      }
      const mat = child.material
      if (!mat) return
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if (m.envMapIntensity !== undefined) m.envMapIntensity = 2.5
          m.needsUpdate = true
        })
      } else {
        if (mat.envMapIntensity !== undefined) mat.envMapIntensity = 2.5
        mat.needsUpdate = true
      }
    })

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1

    return {
      scale: 2.7 / maxDim,
      center: [center.x, center.y, center.z],
    }
  }, [scene])

  // Animation loop — intro + scroll-driven motion path
  useFrame((state, delta) => {
    const drift = Math.sin(state.clock.elapsedTime * 0.55) * 0.08
    const scroll = scrollProgressRef?.current ?? 0

    // Advance intro progress
    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + delta / INTRO_DURATION)
    }
    const introT = easeOutQuart(introProgress.current)

    if (vialRig.current) {
      // During intro: lerp from INTRO_POS → FINAL_POS
      // After intro: follow scroll stops
      const introComplete = introT >= 0.99

      let targetX, targetY, targetZ, targetScale, targetRx, targetRy, targetRz

      if (!introComplete) {
        targetX = THREE.MathUtils.lerp(INTRO_POS.x, FINAL_POS.x, introT)
        targetY = THREE.MathUtils.lerp(INTRO_POS.y, FINAL_POS.y, introT) + drift
        targetZ = THREE.MathUtils.lerp(INTRO_POS.z, FINAL_POS.z, introT)
        targetScale = THREE.MathUtils.lerp(INTRO_POS.scale, FINAL_POS.scale, introT)
        targetRx = THREE.MathUtils.lerp(INTRO_POS.rx, FINAL_POS.rx, introT)
        targetRy = THREE.MathUtils.lerp(INTRO_POS.ry, FINAL_POS.ry, introT)
        targetRz = THREE.MathUtils.lerp(INTRO_POS.rz, FINAL_POS.rz, introT)
      } else {
        targetX = getScrollValue(scroll, 'x')
        targetY = getScrollValue(scroll, 'y') + (scroll < 0.4 ? drift : 0)
        targetZ = getScrollValue(scroll, 'z')
        targetScale = getScrollValue(scroll, 'scale')
        targetRx = getScrollValue(scroll, 'rx')
        targetRy = getScrollValue(scroll, 'ry')
        targetRz = getScrollValue(scroll, 'rz')
      }

      const d = 4
      vialRig.current.position.x = THREE.MathUtils.damp(vialRig.current.position.x, targetX, d, delta)
      vialRig.current.position.y = THREE.MathUtils.damp(vialRig.current.position.y, targetY, d, delta)
      vialRig.current.position.z = THREE.MathUtils.damp(vialRig.current.position.z, targetZ, d, delta)
      vialRig.current.rotation.x = THREE.MathUtils.damp(vialRig.current.rotation.x, targetRx, d, delta)
      vialRig.current.rotation.y = THREE.MathUtils.damp(vialRig.current.rotation.y, targetRy, d, delta)
      vialRig.current.rotation.z = THREE.MathUtils.damp(vialRig.current.rotation.z, targetRz, d, delta)
      const s = THREE.MathUtils.damp(vialRig.current.scale.x, targetScale, 3.6, delta)
      vialRig.current.scale.setScalar(s)
    }

    if (glowPlane.current) {
      // Glow peaks at center, fades as vial drops
      const glowT = scroll < 0.3 ? scroll / 0.3 : scroll < 0.45 ? 1 - (scroll - 0.3) / 0.15 : 0
      glowPlane.current.material.opacity = THREE.MathUtils.damp(
        glowPlane.current.material.opacity,
        0.22 * introT + glowT * 0.2,
        2.8, delta
      )
    }
  })

  return (
    <>
      <BloomEffect />
      <BackgroundCubes mouseRef={mouseRef} />

      {/* Smooth fog ramp — dark to deep red */}
      <fog attach="fog" args={['#1a0508', 6, 22]} />

      {/* ── Rim-heavy lighting rig ── */}
      <ambientLight intensity={0.25} color="#fff5f0" />

      {/* Front key — pulled back, lower intensity so rim dominates */}
      <spotLight angle={0.5} color="#ffffff" intensity={18} penumbra={1} position={[0, 4, 8]} distance={25} />

      {/* Soft fill left — low */}
      <spotLight angle={0.5} color="#ffe8e0" intensity={8} penumbra={1} position={[-5, 2, 4]} distance={20} />

      {/* Soft fill right — low */}
      <spotLight angle={0.5} color="#ffe8e0" intensity={8} penumbra={1} position={[5, 2, 4]} distance={20} />

      {/* Red wash from below */}
      <pointLight color="#E50914" distance={20} intensity={15} position={[0, -4, 0]} />

      {/* Top fill for cubes */}
      <pointLight color="#ffffff" distance={30} intensity={8} position={[0, 8, -5]} />

      {/* Rim light — back-left, strong */}
      <spotLight angle={0.35} color="#ffffff" intensity={60} penumbra={0.7} position={[-5, 3, -4]} distance={18} />

      {/* Rim light — back-right, strong */}
      <spotLight angle={0.35} color="#ffffff" intensity={60} penumbra={0.7} position={[5, 3, -4]} distance={18} />

      {/* Center backlight — hero glow behind the vial */}
      <pointLight color="#ffffff" distance={16} intensity={50} position={[0, 1, -3]} />

      {/* Red center backlight accent */}
      <pointLight color="#E50914" distance={12} intensity={25} position={[0, 0, -4]} />

      <Environment preset="night" background={false}>
        <Lightformer color="#3a0a10" form="rect" intensity={2} position={[0, -3, -8]} rotation-x={-Math.PI / 6} scale={[30, 8, 1]} />
        <Lightformer color="#E50914" form="ring" intensity={1} position={[-3, 2, -6]} scale={5} />
        <Lightformer color="#ffffff" form="rect" intensity={0.8} position={[4, 5, 3]} rotation-y={Math.PI / 4} scale={[10, 4, 1]} />
        <Lightformer color="#ffffff" form="rect" intensity={0.6} position={[-4, 4, 3]} rotation-y={-Math.PI / 4} scale={[10, 4, 1]} />
        <Lightformer color="#ffffff" form="circle" intensity={0.5} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={4} />
      </Environment>

      {/* ── Smooth red gradient backdrop ── */}
      <mesh position={[0, 0, -12]} ref={glowPlane}>
        <planeGeometry args={[40, 24]} />
        <shaderMaterial
          transparent
          uniforms={{
            uColor1: { value: new THREE.Color('#0a0a0c') },
            uColor2: { value: new THREE.Color('#3a0a10') },
            uColor3: { value: new THREE.Color('#1a0508') },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            varying vec2 vUv;
            void main() {
              vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, vUv.y));
              color = mix(color, uColor3, smoothstep(0.5, 1.0, vUv.y));
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      {/* ── Ground plane — dark reflective surface ── */}
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshPhysicalMaterial color="#0a0a0c" roughness={0.3} metalness={0.8} envMapIntensity={1} />
      </mesh>

      {/* ── Ground-extruding shapes — composed for widescreen ── */}
      {/* Left cluster */}
      <mesh position={[-10, -2.5, -4]}><boxGeometry args={[0.6, 2, 0.6]} /><meshPhysicalMaterial color="#1a1a20" roughness={0.7} metalness={0.3} /></mesh>
      <mesh position={[-9.2, -2.0, -3.5]}><boxGeometry args={[0.4, 3, 0.4]} /><meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.05} transmission={0.7} thickness={1.5} ior={1.4} transparent /></mesh>
      <mesh position={[-8.5, -2.8, -5]}><boxGeometry args={[0.8, 1.4, 0.8]} /><meshPhysicalMaterial color="#E50914" roughness={0.2} metalness={0.5} emissive="#E50914" emissiveIntensity={0.15} clearcoat={1} /></mesh>
      <mesh position={[-11, -2.2, -6]}><boxGeometry args={[0.5, 2.6, 0.5]} /><meshPhysicalMaterial color="#f0f0f0" roughness={0.4} metalness={0.1} /></mesh>
      <mesh position={[-7.5, -3.0, -3]}><boxGeometry args={[0.35, 1, 0.35]} /><meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={3} /></mesh>

      {/* Far left accent */}
      <mesh position={[-13, -2.6, -7]}><boxGeometry args={[0.7, 1.8, 0.7]} /><meshPhysicalMaterial color="#1a1a20" roughness={0.6} metalness={0.4} /></mesh>
      <mesh position={[-12, -1.8, -5.5]}><boxGeometry args={[0.3, 3.4, 0.3]} /><meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.0} transmission={0.8} thickness={2} ior={1.5} transparent /></mesh>

      {/* Right cluster */}
      <mesh position={[9, -2.3, -3.5]}><boxGeometry args={[0.5, 2.4, 0.5]} /><meshPhysicalMaterial color="#f0f0f0" roughness={0.3} metalness={0.1} /></mesh>
      <mesh position={[10, -1.8, -4.5]}><boxGeometry args={[0.4, 3.4, 0.4]} /><meshPhysicalMaterial color="#1a1a20" roughness={0.65} metalness={0.35} /></mesh>
      <mesh position={[8.2, -2.7, -5]}><boxGeometry args={[0.7, 1.6, 0.7]} /><meshPhysicalMaterial color="#E50914" roughness={0.15} metalness={0.5} emissive="#E50914" emissiveIntensity={0.12} clearcoat={1} /></mesh>
      <mesh position={[11, -2.5, -6]}><boxGeometry args={[0.6, 2, 0.6]} /><meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.05} transmission={0.75} thickness={1.8} ior={1.45} transparent /></mesh>
      <mesh position={[7.5, -3.0, -3]}><boxGeometry args={[0.3, 1, 0.3]} /><meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.1} clearcoat={1} /></mesh>

      {/* Far right accent */}
      <mesh position={[13, -2.4, -7.5]}><boxGeometry args={[0.5, 2.2, 0.5]} /><meshPhysicalMaterial color="#f0f0f0" roughness={0.5} metalness={0.15} /></mesh>
      <mesh position={[12.5, -1.5, -5]}><boxGeometry args={[0.35, 4, 0.35]} /><meshPhysicalMaterial color="#1a1a20" roughness={0.7} metalness={0.3} /></mesh>

      {/* Center-back subtle columns */}
      <mesh position={[-3, -2.0, -8]}><boxGeometry args={[0.35, 3, 0.35]} /><meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.0} transmission={0.6} thickness={1} ior={1.3} transparent /></mesh>
      <mesh position={[3, -2.2, -9]}><boxGeometry args={[0.4, 2.6, 0.4]} /><meshPhysicalMaterial color="#1a1a20" roughness={0.8} metalness={0.2} /></mesh>
      <mesh position={[0.5, -2.8, -10]}><boxGeometry args={[0.5, 1.4, 0.5]} /><meshPhysicalMaterial color="#E50914" roughness={0.25} metalness={0.4} emissive="#E50914" emissiveIntensity={0.1} /></mesh>
      <mesh position={[-5, -2.5, -9.5]}><boxGeometry args={[0.6, 2, 0.6]} /><meshPhysicalMaterial color="#f0f0f0" roughness={0.35} metalness={0.1} /></mesh>
      <mesh position={[5.5, -2.6, -8.5]}><boxGeometry args={[0.45, 1.8, 0.45]} /><meshPhysicalMaterial color="#ffffff" roughness={0.06} metalness={0.1} clearcoat={1} envMapIntensity={3} /></mesh>

      {/* ── Vial ── */}
      <Float floatIntensity={0.18} rotationIntensity={0.08} speed={1.3}>
        <group ref={vialRig} position={[INTRO_POS.x, INTRO_POS.y, INTRO_POS.z]} scale={INTRO_POS.scale}>
          <OrbitalRing radius={2.0} tubeRadius={0.006} color="#ffffff" opacity={0.18} speed={0.2} tiltX={0.6} tiltZ={0.1} />
          <OrbitalRing radius={2.4} tubeRadius={0.004} color="#E50914" opacity={0.12} speed={-0.15} tiltX={0.9} tiltZ={-0.2} />
          <OrbitalRing radius={1.6} tubeRadius={0.005} color="#ff6666" opacity={0.1} speed={0.25} tiltX={0.3} tiltZ={0.3} />

          <group scale={modelFit.scale} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
            <group position={[-modelFit.center[0], -modelFit.center[1], -modelFit.center[2]]}>
              <primitive object={scene} />
            </group>
          </group>
        </group>
      </Float>
    </>
  )
}

useGLTF.preload('/models/hallucinogenic-vial.glb')
