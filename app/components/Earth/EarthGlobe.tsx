'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CountryPin, GlobeMode, Location } from './types'

function latLngToVector3(lat: number, lng: number, radius = 2.002): THREE.Vector3 {
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

function getFocusRotation(lat: number, lng: number) {
  const target = latLngToVector3(lat, lng, 1).normalize()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(target, new THREE.Vector3(0, 0, 1))
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ')

  return {
    x: euler.x,
    y: euler.y,
  }
}

const COUNTRY_PINS: CountryPin[] = [
  { id: 'india', name: 'India', countryCode: 'IN', lat: 20.59, lng: 78.96, locationCount: 7 },
  { id: 'cambodia', name: 'Cambodia', countryCode: 'KH', lat: 12.56, lng: 104.99, locationCount: 0 },
  { id: 'japan', name: 'Japan', countryCode: 'JP', lat: 36.2, lng: 138.25, locationCount: 0 },
  { id: 'italy', name: 'Italy', countryCode: 'IT', lat: 41.87, lng: 12.56, locationCount: 0 },
  { id: 'peru', name: 'Peru', countryCode: 'PE', lat: -9.19, lng: -75.02, locationCount: 0 },
]

const PRIMARY_COUNTRY = COUNTRY_PINS[0]

interface EarthGlobeProps {
  locations: Location[]
  onLocationSelect: (location: Location) => void
  initialLocationId?: string
}

export default function EarthGlobe({ locations, onLocationSelect, initialLocationId }: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const earthGroupRef = useRef<THREE.Group | null>(null)
  const pinMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const labelDivsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const frameRef = useRef<number>(0)

  const isDraggingRef = useRef(false)
  const isPointerDownRef = useRef(false)
  const suppressClickRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const initialRotation = getFocusRotation(PRIMARY_COUNTRY.lat, PRIMARY_COUNTRY.lng)
  const rotationRef = useRef(initialRotation)
  const targetRotationRef = useRef(initialRotation)
  const cameraZRef = useRef(9)
  const targetCameraZRef = useRef(9)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerRef = useRef<THREE.Vector2 | null>(null)
  const hoveredPinIdRef = useRef<string | null>(null)
  const locationsRef = useRef(locations)
  const onSelectRef = useRef(onLocationSelect)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const modeRef = useRef<GlobeMode>('global')

  const [mode, setMode] = useState<GlobeMode>('global')

  useEffect(() => {
    locationsRef.current = locations
  }, [locations])

  useEffect(() => {
    onSelectRef.current = onLocationSelect
  }, [onLocationSelect])

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 9
    cameraRef.current = camera

    scene.add(new THREE.AmbientLight(0xffffff, 0.3))

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.8)
    sun.position.set(5, 3, 5)
    scene.add(sun)

    const rim = new THREE.PointLight(0x3b82f6, 0.8, 20)
    rim.position.set(-5, 0, -5)
    scene.add(rim)

    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(6000 * 3)
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 200
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.8 }),
      ),
    )

    const earthGroup = new THREE.Group()
    earthGroup.rotation.x = initialRotation.x
    earthGroup.rotation.y = initialRotation.y
    scene.add(earthGroup)
    earthGroupRef.current = earthGroup

    const earthMat = new THREE.MeshPhongMaterial({ color: 0x2244aa, specular: 0x334466, shininess: 25 })
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 64), earthMat)
    earthGroup.add(earth)

    new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', (tex) => {
      earthMat.map = tex
      earthMat.color.set(0xffffff)
      earthMat.needsUpdate = true
    })

    const atmosMat = new THREE.ShaderMaterial({
      vertexShader:
        'varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'varying vec3 vNormal; void main() { float i = pow(0.65 - dot(vNormal, vec3(0,0,1)), 3.5); gl_FragColor = vec4(0.25,0.55,1.0,1.0)*i; }',
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    })
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.08, 64, 64), atmosMat))

    const onResize = () => {
      if (!mountRef.current) return
      const nextWidth = mountRef.current.clientWidth
      const nextHeight = mountRef.current.clientHeight
      renderer.setSize(nextWidth, nextHeight)
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', onResize)

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      rotationRef.current.x = lerp(rotationRef.current.x, targetRotationRef.current.x, 0.06)
      rotationRef.current.y = lerp(rotationRef.current.y, targetRotationRef.current.y, 0.06)
      earthGroup.rotation.x = rotationRef.current.x
      earthGroup.rotation.y = rotationRef.current.y

      cameraZRef.current = lerp(cameraZRef.current, targetCameraZRef.current, 0.05)
      camera.position.z = cameraZRef.current

      renderer.render(scene, camera)

      const labelsContainer = labelsRef.current
      if (labelsContainer) {
        const rect = renderer.domElement.getBoundingClientRect()
        labelDivsRef.current.forEach((div, pinId) => {
          const mesh = pinMeshesRef.current.get(pinId)
          if (!mesh) {
            div.style.display = 'none'
            return
          }

          const worldPos = new THREE.Vector3()
          mesh.getWorldPosition(worldPos)
          worldPos.project(camera)

          if (worldPos.z >= 1) {
            div.style.display = 'none'
            return
          }

          const sx = (worldPos.x * 0.5 + 0.5) * rect.width
          const sy = (-worldPos.y * 0.5 + 0.5) * rect.height
          const shouldShowLabel = modeRef.current === 'country' ? hoveredPinIdRef.current === pinId : false
          div.style.display = shouldShowLabel ? 'block' : 'none'
          div.style.left = `${sx}px`
          div.style.top = `${sy - 20}px`
        })
      }

      if (modeRef.current === 'country' && pointerRef.current && cameraRef.current) {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(pointerRef.current, cameraRef.current)
        const meshes = Array.from(pinMeshesRef.current.values())
        const hits = raycaster.intersectObjects(meshes, false)
        hoveredPinIdRef.current = hits.length > 0 ? (hits[0].object.userData.pinId as string) : null
      } else {
        hoveredPinIdRef.current = null
      }

      pinMeshesRef.current.forEach((mesh, pinId) => {
        const visibleMarker = mesh.children[0] as THREE.Mesh | undefined
        if (!visibleMarker) return
        const material = visibleMarker.material as THREE.MeshBasicMaterial
        const isHovered = hoveredPinIdRef.current === pinId
        const isCountryPin = Boolean(mesh.userData.isCountry)
        const targetOpacity =
          modeRef.current === 'country'
            ? isHovered
              ? 0.96
              : 0
            : isCountryPin
              ? 0.9
              : 0.72
        material.opacity = lerp(material.opacity, targetOpacity, 0.18)
      })
    }

    animate()

    const introTimer = setTimeout(() => {
      targetRotationRef.current = initialRotation
      targetCameraZRef.current = 3.8
    }, 500)

    let locationTimer: ReturnType<typeof setTimeout>
    if (initialLocationId) {
      locationTimer = setTimeout(() => {
        const loc = locationsRef.current.find((item) => item.id === initialLocationId)
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
  }, [initialLocationId])

  useEffect(() => {
    const earthGroup = earthGroupRef.current
    const labelsContainer = labelsRef.current
    if (!earthGroup || !labelsContainer) return

    pinMeshesRef.current.forEach((mesh) => earthGroup.remove(mesh))
    pinMeshesRef.current.clear()
    labelDivsRef.current.forEach((div) => div.remove())
    labelDivsRef.current.clear()

    const pinsToRender =
      mode === 'global'
        ? COUNTRY_PINS.filter((pin) => pin.locationCount > 0).map((pin) => ({
            id: pin.id,
            label: pin.name,
            lat: pin.lat,
            lng: pin.lng,
            isCountry: true,
          }))
        : locations.map((loc) => ({
            id: loc.id,
            label: loc.name,
            lat: loc.coordinates.lat,
            lng: loc.coordinates.lng,
            isCountry: false,
          }))

    pinsToRender.forEach((pin) => {
      const pos = latLngToVector3(pin.lat, pin.lng)
      const pinMesh = new THREE.Mesh(
        new THREE.SphereGeometry(pin.isCountry ? 0.085 : 0.065, 12, 12),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
        }),
      )

      pinMesh.position.copy(pos)
      pinMesh.userData = { pinId: pin.id, isCountry: pin.isCountry }

      const visibleMarker = new THREE.Mesh(
        new THREE.SphereGeometry(pin.isCountry ? 0.03 : 0.024, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0xf8fafc,
          transparent: true,
          opacity: pin.isCountry ? 0.9 : 0,
        }),
      )

      visibleMarker.position.set(0, 0, 0)
      pinMesh.add(visibleMarker)
      earthGroup.add(pinMesh)
      pinMeshesRef.current.set(pin.id, pinMesh)

      const label = document.createElement('div')
      label.style.cssText = `
        position: absolute;
        pointer-events: none;
        white-space: nowrap;
        background: rgba(10,14,28,0.78);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.82);
        font-size: 11px;
        font-family: Inter, sans-serif;
        font-weight: 500;
        padding: 3px 8px;
        border-radius: 999px;
        transform: translateX(-50%);
        display: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.24);
        letter-spacing: 0.01em;
      `
      label.textContent = pin.label
      labelsContainer.appendChild(label)
      labelDivsRef.current.set(pin.id, label)
    })
  }, [locations, mode])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!rendererRef.current || !cameraRef.current) return
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }

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
        const country = COUNTRY_PINS.find((item) => item.id === pinId)
        if (!country || country.locationCount === 0) return

        targetRotationRef.current = getFocusRotation(country.lat, country.lng)
        targetCameraZRef.current = 3.8
        modeRef.current = 'country'
        setMode('country')
        return
      }

      const loc = locations.find((item) => item.id === pinId)
      if (!loc) return

      targetRotationRef.current = getFocusRotation(loc.coordinates.lat, loc.coordinates.lng)
      onLocationSelect(loc)
    },
    [locations],
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isPointerDownRef.current = true
    isDraggingRef.current = false
    suppressClickRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rendererRef.current) {
      const rect = rendererRef.current.domElement.getBoundingClientRect()
      pointerRef.current = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
    }

    if (!isPointerDownRef.current) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 4) {
      isDraggingRef.current = true
      suppressClickRef.current = true
    }

    if (!isDraggingRef.current) return

    const rdx = e.clientX - prevMouseRef.current.x
    const rdy = e.clientY - prevMouseRef.current.y
    targetRotationRef.current.y += rdx * 0.005
    targetRotationRef.current.x = Math.max(
      -Math.PI / 2.5,
      Math.min(Math.PI / 2.5, targetRotationRef.current.x + rdy * 0.005),
    )
    prevMouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => {
    isPointerDownRef.current = false
    setTimeout(() => {
      isDraggingRef.current = false
    }, 10)
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
    targetRotationRef.current.x = Math.max(
      -Math.PI / 2.5,
      Math.min(Math.PI / 2.5, targetRotationRef.current.x + dy * 0.005),
    )
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleBack = useCallback(() => {
    modeRef.current = 'global'
    setMode('global')
    targetCameraZRef.current = 3.8
    targetRotationRef.current = initialRotation
  }, [])

  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="absolute inset-0"
        style={{ cursor: 'grab' }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          pointerRef.current = null
          handleMouseUp()
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          touchStartRef.current = null
          isDraggingRef.current = false
          isPointerDownRef.current = false
        }}
      />

      <div ref={labelsRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

      {mode === 'country' && (
        <button
          onClick={handleBack}
          className="absolute right-4 top-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/75 transition-colors hover:text-white pointer-events-auto md:right-6 md:top-24"
          style={{
            background: 'rgba(10,14,28,0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Global View
        </button>
      )}
    </div>
  )
}
