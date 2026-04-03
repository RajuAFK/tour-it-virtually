'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import type { Location, CountryPin, GlobeMode } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────

function latLngToVector3(lat: number, lng: number, radius = 2.01): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// ── Country pins ──────────────────────────────────────────────────────────

const COUNTRY_PINS: CountryPin[] = [
  { id: 'india', name: 'India', countryCode: 'IN', lat: 20.59, lng: 78.96, locationCount: 7 },
  { id: 'cambodia', name: 'Cambodia', countryCode: 'KH', lat: 12.56, lng: 104.99, locationCount: 0 },
  { id: 'japan', name: 'Japan', countryCode: 'JP', lat: 36.20, lng: 138.25, locationCount: 0 },
  { id: 'italy', name: 'Italy', countryCode: 'IT', lat: 41.87, lng: 12.56, locationCount: 0 },
  { id: 'peru', name: 'Peru', countryCode: 'PE', lat: -9.19, lng: -75.02, locationCount: 0 },
]

// ── Component ─────────────────────────────────────────────────────────────

interface EarthGlobeProps {
  locations: Location[]
  onLocationSelect: (location: Location) => void
  initialLocationId?: string
}

export default function EarthGlobe({ locations, onLocationSelect, initialLocationId }: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const labelDivsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const earthGroupRef = useRef<THREE.Group | null>(null)
  const pinMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const frameRef = useRef<number>(0)

  const isDraggingRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0.3, y: -1.38 })
  const targetRotationRef = useRef({ x: 0.3, y: -1.38 })
  const cameraZRef = useRef(9)
  const targetCameraZRef = useRef(9)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // props refs for use in timeouts/closures
  const locationsRef = useRef(locations)
  const onSelectRef = useRef(onLocationSelect)
  useEffect(() => { locationsRef.current = locations }, [locations])
  useEffect(() => { onSelectRef.current = onLocationSelect }, [onLocationSelect])

  const [mode, setMode] = useState<GlobeMode>('global')
  const modeRef = useRef<GlobeMode>('global')

  // ── Scene init ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.z = 9
    cameraRef.current = camera

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.8)
    sun.position.set(5, 3, 5)
    scene.add(sun)
    const rim = new THREE.PointLight(0x3b82f6, 0.8, 20)
    rim.position.set(-5, 0, -5)
    scene.add(rim)

    // Stars
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(6000 * 3)
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 200
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8 })))

    // Earth group — everything (earth + pins) lives inside this group so rotation is shared
    const earthGroup = new THREE.Group()
    earthGroup.rotation.x = 0.3
    earthGroup.rotation.y = -1.38
    scene.add(earthGroup)
    earthGroupRef.current = earthGroup

    // Earth mesh
    const earthMat = new THREE.MeshPhongMaterial({ color: 0x2244aa, specular: 0x334466, shininess: 25 })
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 64), earthMat)
    earthGroup.add(earth)

    new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      (tex) => {
        earthMat.map = tex
        earthMat.color.set(0xffffff)
        earthMat.needsUpdate = true
      },
    )

    // Atmosphere
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vNormal; void main() { float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 3.5); gl_FragColor = vec4(0.25,0.55,1.0,1.0)*i; }`,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    })
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.08, 64, 64), atmosMat))

    // Resize
    const onResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth
      const h = mountRef.current.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Animate loop
    const labelsContainer = labelsRef.current
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      // Smooth rotation
      rotationRef.current.x = lerp(rotationRef.current.x, targetRotationRef.current.x, 0.06)
      rotationRef.current.y = lerp(rotationRef.current.y, targetRotationRef.current.y, 0.06)
      earthGroup.rotation.x = rotationRef.current.x
      earthGroup.rotation.y = rotationRef.current.y

      // Smooth zoom
      cameraZRef.current = lerp(cameraZRef.current, targetCameraZRef.current, 0.05)
      camera.position.z = cameraZRef.current

      // Auto-rotate in global mode when idle
      if (!isDraggingRef.current && modeRef.current === 'global') {
        targetRotationRef.current.y += 0.0006
      }

      renderer.render(scene, camera)

      // Update label positions — direct DOM manipulation for performance
      if (labelsContainer) {
        const rect = renderer.domElement.getBoundingClientRect()
        labelDivsRef.current.forEach((div, pinId) => {
          const mesh = pinMeshesRef.current.get(pinId)
          if (!mesh) { div.style.display = 'none'; return }
          const worldPos = new THREE.Vector3()
          mesh.getWorldPosition(worldPos)
          worldPos.project(camera)
          if (worldPos.z >= 1) { div.style.display = 'none'; return }
          const sx = (worldPos.x * 0.5 + 0.5) * rect.width
          const sy = (-worldPos.y * 0.5 + 0.5) * rect.height
          div.style.display = 'block'
          div.style.left = `${sx}px`
          div.style.top = `${sy - 38}px`
        })
      }
    }
    animate()

    // Intro: zoom from z=9 to z=5.5 after short delay
    const introTimer = setTimeout(() => {
      targetCameraZRef.current = 5.5
    }, 500)

    // If initialLocationId: after zoom completes, open that location's modal
    let locationTimer: ReturnType<typeof setTimeout>
    if (initialLocationId) {
      locationTimer = setTimeout(() => {
        const loc = locationsRef.current.find((l) => l.id === initialLocationId)
        if (loc) onSelectRef.current(loc)
      }, 2400)
    }

    return () => {
      cancelAnimationFrame(frameRef.current)
      clearTimeout(introTimer)
      clearTimeout(locationTimer)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pins + Labels ─────────────────────────────────────────────────────

  useEffect(() => {
    const earthGroup = earthGroupRef.current
    const scene = sceneRef.current
    const labelsContainer = labelsRef.current
    if (!earthGroup || !scene || !labelsContainer) return

    // Remove old pin meshes from earthGroup
    pinMeshesRef.current.forEach((mesh) => earthGroup.remove(mesh))
    pinMeshesRef.current.clear()

    // Remove old ring meshes (added directly to scene)
    const toRemove: THREE.Object3D[] = []
    scene.traverse((obj) => { if (obj.userData.isPinRing) toRemove.push(obj) })
    toRemove.forEach((obj) => scene.remove(obj))

    // Remove old label divs
    labelDivsRef.current.forEach((div) => div.remove())
    labelDivsRef.current.clear()

    // Determine which pins to show
    const pinsToRender =
      mode === 'global'
        ? COUNTRY_PINS.map((cp) => ({
            id: cp.id,
            name: cp.name,
            label: cp.locationCount > 0 ? `${cp.name} · ${cp.locationCount} tours` : `${cp.name} · Coming soon`,
            lat: cp.lat,
            lng: cp.lng,
            isCountry: true,
            hasData: cp.locationCount > 0,
          }))
        : locations.map((loc) => ({
            id: loc.id,
            name: loc.name,
            label: loc.name,
            lat: loc.coordinates.lat,
            lng: loc.coordinates.lng,
            isCountry: false,
            hasData: true,
          }))

    pinsToRender.forEach((pin) => {
      const pos = latLngToVector3(pin.lat, pin.lng)

      // Pin sphere — added as child of earthGroup so it rotates with the earth
      const pinGeo = new THREE.SphereGeometry(pin.isCountry ? 0.055 : 0.042, 12, 12)
      const pinColor = pin.isCountry ? (pin.hasData ? 0x38bdf8 : 0x64748b) : 0xfbbf24
      const emitColor = pin.isCountry ? (pin.hasData ? 0x0ea5e9 : 0x334455) : 0xf59e0b
      const pinMat = new THREE.MeshPhongMaterial({
        color: pinColor,
        emissive: emitColor,
        emissiveIntensity: 0.6,
        shininess: 80,
      })
      const pinMesh = new THREE.Mesh(pinGeo, pinMat)
      pinMesh.position.copy(pos)
      pinMesh.userData = { pinId: pin.id, isCountry: pin.isCountry }
      earthGroup.add(pinMesh)
      pinMeshesRef.current.set(pin.id, pinMesh)

      // Pulse ring (also child of earthGroup)
      if (pin.hasData) {
        const ringMat = new THREE.MeshBasicMaterial({
          color: pin.isCountry ? 0x38bdf8 : 0xfbbf24,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.105, 24), ringMat)
        ring.position.copy(pos)
        ring.lookAt(new THREE.Vector3(0, 0, 0))
        ring.rotateX(Math.PI / 2)
        ring.userData = { isPinRing: true }
        earthGroup.add(ring)
      }

      // HTML label for this pin
      const div = document.createElement('div')
      const isCountryWithData = pin.isCountry && pin.hasData
      div.style.cssText = `
        position: absolute;
        pointer-events: none;
        white-space: nowrap;
        background: ${isCountryWithData ? 'rgba(14,165,233,0.85)' : 'rgba(10,14,28,0.80)'};
        backdrop-filter: blur(8px);
        border: 1px solid ${isCountryWithData ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.12)'};
        color: white;
        font-size: 11px;
        font-family: Inter, sans-serif;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 20px;
        transform: translateX(-50%);
        display: none;
        transition: opacity 0.2s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        letter-spacing: 0.02em;
      `
      div.textContent = pin.label
      labelsContainer.appendChild(div)
      labelDivsRef.current.set(pin.id, div)
    })
  }, [mode, locations])

  // ── Click / Raycast ───────────────────────────────────────────────────

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!rendererRef.current || !cameraRef.current || !earthGroupRef.current) return
      if (isDraggingRef.current) return

      const rect = rendererRef.current.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, cameraRef.current)

      const meshes = Array.from(pinMeshesRef.current.values())
      const hits = raycaster.intersectObjects(meshes, false)

      if (hits.length === 0) return

      const { pinId, isCountry } = hits[0].object.userData as { pinId: string; isCountry: boolean }

      if (isCountry) {
        const cp = COUNTRY_PINS.find((c) => c.id === pinId)
        if (!cp || cp.locationCount === 0) return

        const phi = (90 - cp.lat) * (Math.PI / 180)
        const theta = (cp.lng + 180) * (Math.PI / 180)
        targetRotationRef.current = {
          x: -(phi - Math.PI / 2) * 0.5,
          y: -(theta - Math.PI),
        }
        targetCameraZRef.current = 3.8
        modeRef.current = 'country'
        setMode('country')
      } else {
        const loc = locations.find((l) => l.id === pinId)
        if (!loc) return
        const phi = (90 - loc.coordinates.lat) * (Math.PI / 180)
        const theta = (loc.coordinates.lng + 180) * (Math.PI / 180)
        targetRotationRef.current = {
          x: -(phi - Math.PI / 2) * 0.5,
          y: -(theta - Math.PI),
        }
        onLocationSelect(loc)
      }
    },
    [locations, onLocationSelect],
  )

  // ── Mouse drag ────────────────────────────────────────────────────────

  const dragStartRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 4) isDraggingRef.current = true

    if (!isDraggingRef.current) return
    const rdx = e.clientX - prevMouseRef.current.x
    const rdy = e.clientY - prevMouseRef.current.y
    targetRotationRef.current.y += rdx * 0.005
    targetRotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationRef.current.x + rdy * 0.005))
    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => {
    setTimeout(() => { isDraggingRef.current = false }, 10)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    targetCameraZRef.current = Math.max(2.8, Math.min(9, targetCameraZRef.current + e.deltaY * 0.005))
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.touches[0].clientX - touchStartRef.current.x
    const dy = e.touches[0].clientY - touchStartRef.current.y
    targetRotationRef.current.y += dx * 0.005
    targetRotationRef.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationRef.current.x + dy * 0.005))
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  // ── Back ──────────────────────────────────────────────────────────────

  const handleBack = () => {
    modeRef.current = 'global'
    setMode('global')
    targetCameraZRef.current = 5.5
    targetRotationRef.current = { x: 0.3, y: -1.38 }
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="absolute inset-0"
        style={{ cursor: 'grab' }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { touchStartRef.current = null; isDraggingRef.current = false }}
      />

      {/* HTML label overlay — positioned over canvas */}
      <div
        ref={labelsRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      {/* Mode indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{
            background: 'rgba(10,14,28,0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <span className={`w-2 h-2 rounded-full ${mode === 'global' ? 'bg-sky-400' : 'bg-amber-400'}`} />
          <span className="text-white/75">
            {mode === 'global' ? 'Global View — click a country pin' : `India — ${locations.length} destinations`}
          </span>
        </div>
      </div>

      {/* Back button */}
      {mode === 'country' && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/75 hover:text-white transition-colors pointer-events-auto"
          style={{
            background: 'rgba(10,14,28,0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Global View
        </button>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 p-3 rounded-xl text-xs space-y-1.5 pointer-events-none"
        style={{
          background: 'rgba(10,14,28,0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {mode === 'global' ? (
          <>
            <div className="flex items-center gap-2 text-white/65">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
              Country with tours
            </div>
            <div className="flex items-center gap-2 text-white/35">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Coming soon
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-white/65">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            Click a pin to explore
          </div>
        )}
        <div className="text-white/35 pt-0.5">Drag · Scroll to zoom</div>
      </div>
    </div>
  )
}
