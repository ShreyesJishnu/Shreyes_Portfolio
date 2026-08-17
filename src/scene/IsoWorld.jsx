import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion, STAR_COUNT } from './budget'
import { PATH_LENGTH, pathAt, samplePath } from './path'
import { MOTE_COUNT, ruleFor } from './motes'

// A minimal isometric world: real 3D geometry under an orthographic camera at
// the classic iso angle. Scroll drives how far the cube has travelled along a
// route that turns across the ground plane, and the camera follows it.
//
// Kept deliberately spare: flat forms, one accent colour, no textures.

const TILE = 1.6
const CUBE = 1

function useScrollProgress() {
  const progress = useRef(0)
  useFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  })
  return progress
}

// Tiles laid along the route, plus sparse blocks either side so the world reads
// as terrain rather than a ribbon.
//
// Instanced: there are several hundred tiles and earth needs to shake the ones
// near the cube every frame, which is far too much for individual meshes.
function Ground({ element, progress }) {
  const tilesRef = useRef(null)
  const scatterRef = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const focus = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const lastDist = useRef(0)
  const shake = useRef(0)

  const { tiles, scatter } = useMemo(() => {
    const samples = samplePath(TILE * 0.85)
    const scatterOut = []
    samples.forEach((s, i) => {
      if (i % 5 !== 0) return
      const side = i % 10 === 0 ? 1 : -1
      const off = TILE * (1.7 + (i % 3) * 0.9)
      scatterOut.push({
        x: s.x + Math.cos(s.angle) * off * side,
        z: s.z - Math.sin(s.angle) * off * side,
        h: 0.14 + ((i * 37) % 7) * 0.18,
      })
    })
    return { tiles: samples, scatter: scatterOut }
  }, [])

  useFrame((state) => {
    const mesh = tilesRef.current
    if (!mesh) return
    const travelled = progress.current * PATH_LENGTH
    const speed = Math.min(1, Math.abs(travelled - lastDist.current) / 0.6)
    lastDist.current = travelled
    pathAt(travelled, focus, dir)

    // earth breaks up under the cube; other elements leave the ground still
    const wanted = element === 'earth' ? speed : 0
    shake.current += (wanted - shake.current) * 0.12
    const t = state.clock.elapsedTime

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      let y = 0
      if (shake.current > 0.01) {
        const d = Math.hypot(tile.x - focus.x, tile.z - focus.z)
        // only the ground near the cube reacts, falling off with distance
        const near = Math.max(0, 1 - d / 9)
        y = Math.sin(t * 22 + i * 1.7) * 0.09 * near * shake.current
      }
      dummy.position.set(tile.x, y, tile.z)
      dummy.rotation.set(0, tile.angle, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  // scatter blocks are static, so they are placed once
  const placeScatter = (mesh) => {
    if (!mesh) return
    scatterRef.current = mesh
    scatter.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2 - 0.06, b.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, b.h / 0.5, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    dummy.scale.set(1, 1, 1)
  }

  return (
    <group>
      <instancedMesh ref={tilesRef} args={[undefined, undefined, tiles.length]} frustumCulled={false}>
        <boxGeometry args={[TILE * 0.9, 0.12, TILE * 0.9]} />
        <meshStandardMaterial color="#1c1c22" roughness={0.9} flatShading />
      </instancedMesh>

      <instancedMesh ref={placeScatter} args={[undefined, undefined, scatter.length]} frustumCulled={false}>
        <boxGeometry args={[TILE * 0.72, 0.5, TILE * 0.72]} />
        <meshStandardMaterial color="#141418" roughness={1} flatShading />
      </instancedMesh>
    </group>
  )
}

// One pillar per chapter, standing beside the route at that chapter's distance.
function Markers({ markers, accent, progress }) {
  const group = useRef(null)

  const placed = useMemo(
    () =>
      markers.map((m) => {
        const d = m.progress * PATH_LENGTH
        const { position, direction } = pathAt(d, new THREE.Vector3(), new THREE.Vector3())
        return {
          key: m.key,
          d,
          x: position.x + direction.z * TILE * 1.7,
          z: position.z - direction.x * TILE * 1.7,
        }
      }),
    [markers]
  )

  useFrame(() => {
    if (!group.current) return
    const travelled = progress.current * PATH_LENGTH
    group.current.children.forEach((pillar, i) => {
      const reached = travelled >= (placed[i]?.d ?? 0) - TILE
      const mat = pillar.material
      mat.emissiveIntensity += ((reached ? 1.2 : 0.05) - mat.emissiveIntensity) * 0.08
    })
  })

  return (
    <group ref={group}>
      {placed.map((p) => (
        <mesh key={p.key} position={[p.x, 1.1, p.z]}>
          <boxGeometry args={[0.22, 2.2, 0.22]} />
          <meshStandardMaterial
            color="#0e0e12"
            emissive={accent}
            emissiveIntensity={0.05}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}

// Rolls along the route rather than sliding. Rotation is accumulated about the
// axis perpendicular to the current heading, so it keeps rolling correctly
// through corners instead of spinning on one fixed axis.
function Cube({ accent, progress }) {
  const ref = useRef(null)
  const spin = useRef(new THREE.Quaternion())
  const travelled = useRef(0)
  const rolled = useRef(0)

  const pos = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const axis = useMemo(() => new THREE.Vector3(), [])
  const step = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    if (!ref.current) return
    const target = progress.current * PATH_LENGTH
    const prev = travelled.current
    travelled.current += (target - prev) * 0.1
    const delta = travelled.current - prev

    pathAt(travelled.current, pos, dir)

    // a quarter turn per cube length, about the horizontal axis ⟂ to heading
    if (Math.abs(delta) > 1e-5) {
      axis.set(dir.z, 0, -dir.x).normalize()
      const dTheta = (delta / CUBE) * (Math.PI / 2)
      step.setFromAxisAngle(axis, dTheta)
      spin.current.premultiply(step)
      rolled.current += dTheta
    }

    // the corner lift a real cube has as it pivots over its leading edge
    const a = ((rolled.current % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2)
    const lift = (CUBE / 2) * (Math.SQRT2 * Math.sin(a + Math.PI / 4) - 1)

    ref.current.position.set(pos.x, CUBE / 2 + lift + 0.06, pos.z)
    ref.current.quaternion.copy(spin.current)
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[CUBE, CUBE, CUBE]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} flatShading />
    </mesh>
  )
}

function Stars() {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = -20 + Math.random() * 170
      pos[i * 3 + 1] = 5 + Math.random() * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  return (
    <points geometry={geometry}>
      <pointsMaterial size={1.6} color="#ffffff" transparent opacity={0.55} sizeAttenuation={false} />
    </points>
  )
}


// Motes rising off the ground. One pool, four behaviours — see motes.js. They
// spawn around wherever the cube is, so they are always in frame.
function ElementMotes({ accent, element, progress }) {
  const matRef = useRef(null)
  const focus = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Color(), [])
  const lastDist = useRef(0)
  const elapsed = useRef(0)

  const { geometry, vel, seed } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(MOTE_COUNT * 3)
    const v = new Float32Array(MOTE_COUNT)
    const sd = new Float32Array(MOTE_COUNT)
    for (let i = 0; i < MOTE_COUNT; i++) {
      // start dead below the floor; the first frames seed them properly
      pos[i * 3 + 1] = -1
      sd[i] = Math.random() * 100
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geometry: g, vel: v, seed: sd }
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const t = elapsed.current
    const rule = ruleFor(element)

    const travelled = progress.current * PATH_LENGTH
    // how fast the cube is rolling right now, normalised
    const speed = Math.min(1, Math.abs(travelled - lastDist.current) / 0.6)
    lastDist.current = travelled
    pathAt(travelled, focus, dir)

    // earth only throws debris while the cube is actually moving
    const emission = rule.emitAtRest ? 1 : speed
    const arr = geometry.attributes.position.array

    for (let i = 0; i < MOTE_COUNT; i++) {
      const ix = i * 3
      const iy = ix + 1
      const iz = ix + 2

      if (arr[iy] < 0) {
        // dead: respawn only if this element is emitting
        if (Math.random() > emission * 0.06) continue
        arr[ix] = focus.x + (Math.random() - 0.5) * rule.spread * 2
        arr[iy] = 0
        arr[iz] = focus.z + (Math.random() - 0.5) * rule.spread * 2
        vel[i] = rule.rise[0] + Math.random() * (rule.rise[1] - rule.rise[0])
        continue
      }

      vel[i] -= rule.gravity * dt
      arr[iy] += vel[i] * dt
      // lateral motion is what separates a wave from an ember
      arr[ix] += Math.sin(t * rule.swayFreq + seed[i]) * rule.sway * dt
      arr[iz] += Math.cos(t * rule.swayFreq * 0.7 + seed[i]) * rule.sway * dt

      if (arr[iy] > rule.ceiling || arr[iy] < -0.05) arr[iy] = -1
    }

    geometry.attributes.position.needsUpdate = true

    if (matRef.current) {
      matRef.current.color.lerp(target.set(accent), 0.06)
      matRef.current.size += (rule.size - matRef.current.size) * 0.06
      matRef.current.opacity += (rule.opacity - matRef.current.opacity) * 0.06
    }
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={(m) => {
          if (m && !matRef.current) {
            matRef.current = m
            m.color.set(accent)
          }
        }}
        size={3}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        // three ignores sizeAttenuation under an orthographic camera, so size
        // here is in pixels
        sizeAttenuation={false}
      />
    </points>
  )
}

// Orthographic camera holding the iso angle while tracking the cube through its
// turns — the offset is fixed, so the projection itself never rotates.
function IsoCamera({ progress }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3())
  const pos = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    pathAt(progress.current * PATH_LENGTH, pos, dir)
    look.current.lerp(pos, 0.08)
    camera.position.set(look.current.x + 15, 13, look.current.z + 15)
    camera.lookAt(look.current)
    camera.zoom = Math.max(26, Math.min(46, size.width / 26))
    camera.updateProjectionMatrix()
  })

  return null
}

function Scene({ accent, element, markers }) {
  const progress = useScrollProgress()
  return (
    <>
      <IsoCamera progress={progress} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 6]} intensity={1.4} />
      <Stars />
      <Ground element={element} progress={progress} />
      <ElementMotes accent={accent} element={element} progress={progress} />
      <Markers markers={markers} accent={accent} progress={progress} />
      <Cube accent={accent} progress={progress} />
    </>
  )
}

export default function IsoWorld({ accent, element, markers }) {
  if (prefersReducedMotion) {
    return (
      <div
        className="world"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(70% 60% at 50% 70%, var(--accent) 0%, transparent 70%)',
          opacity: 0.12,
        }}
      />
    )
  }

  return (
    <div className="world" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [15, 13, 15], zoom: 38, near: -100, far: 300 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <Scene accent={accent} element={element} markers={markers} />
      </Canvas>
    </div>
  )
}
