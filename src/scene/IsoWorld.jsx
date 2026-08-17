import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isMobileViewport, useReducedMotion, STAR_COUNT } from './budget'
import { PATH_LENGTH, TILE, pathAt, tileGrid, distanceToPath } from './path'
import { MOTE_COUNT, PATH_CLEARANCE, ruleFor, heatFor } from './motes'

// A minimal isometric world: real 3D geometry under an orthographic camera at
// the classic iso angle. Scroll drives how far the cube has travelled along a
// route that turns across the ground plane, and the camera follows it.
//
// Kept deliberately spare: flat forms, one accent colour, no textures.

const CUBE = 1

function useScrollProgress() {
  const progress = useRef(0)
  useFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  })
  return progress
}

// Single source of truth for where the cube is this frame. Every system — cube,
// camera, particles, ground — reads this instead of easing the raw scroll
// separately, which previously left them at three different points on the route.
function TravelDriver({ progress, travel }) {
  useFrame(() => {
    const target = progress.current * PATH_LENGTH
    const prev = travel.current.dist
    const next = prev + (target - prev) * 0.1
    travel.current.dist = next
    travel.current.delta = next - prev
    travel.current.speed = Math.min(1, Math.abs(next - prev) / 0.6)
  })
  return null
}

// Tiles laid along the route, plus sparse blocks either side so the world reads
// as terrain rather than a ribbon.
//
// Instanced: there are several hundred tiles and earth needs to shake the ones
// near the cube every frame, which is far too much for individual meshes.
function Ground({ element, travel }) {
  const tilesRef = useRef(null)
  const scatterRef = useRef(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const focus = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const shake = useRef(0)

  const { tiles, scatter } = useMemo(() => {
    const grid = tileGrid()
    const occupied = new Set(grid.map((t) => `${t.gx},${t.gz}`))
    const scatterOut = []
    // rubble sitting off the path, snapped to the same grid so it reads as part
    // of the same world
    grid.forEach((t, i) => {
      if (i % 4 !== 0) return
      for (const off of [3, -3, 5]) {
        const gx = t.gx + (i % 8 === 0 ? off : 0)
        const gz = t.gz + (i % 8 === 0 ? 0 : off)
        if (occupied.has(`${gx},${gz}`)) continue
        occupied.add(`${gx},${gz}`)
        scatterOut.push({
          x: gx * TILE,
          z: gz * TILE,
          h: 0.16 + ((i * 37) % 7) * 0.2,
        })
      }
    })
    return { tiles: grid, scatter: scatterOut }
  }, [])

  useFrame((state) => {
    const mesh = tilesRef.current
    if (!mesh) return
    const travelled = travel.current.dist
    const speed = travel.current.speed
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
      // axis-aligned: grid tiles butt up flush and corners stay square
      dummy.position.set(tile.x, y, tile.z)
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
        <boxGeometry args={[TILE, 0.12, TILE]} />
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
function Markers({ markers, accent, travel }) {
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
    const travelled = travel.current.dist
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
function Cube({ accent, travel }) {
  const ref = useRef(null)
  const spin = useRef(new THREE.Quaternion())
  const rolled = useRef(0)

  const pos = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const axis = useMemo(() => new THREE.Vector3(), [])
  const step = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    if (!ref.current) return
    const delta = travel.current.delta
    pathAt(travel.current.dist, pos, dir)

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


// Environment particles belong to the terrain, not the cube: they spawn in a
// band alongside the route and are rejected if they land on it, so the cube
// rolls through them rather than trailing them.
function sideOffset(rule) {
  const span = rule.spread - PATH_CLEARANCE
  const lateral = PATH_CLEARANCE + Math.random() * Math.max(1, span)
  return Math.random() < 0.5 ? -lateral : lateral
}

// Returns null when it cannot find a clear spot — near a corner a lateral push
// can land on another leg of the route. The caller just waits a frame, which is
// invisible at these spawn rates and keeps the path genuinely clear.
function offPath(focus, dir, rule, relative = false) {
  const along = (Math.random() - 0.5) * (rule.along || rule.spread * 2)
  for (let attempt = 0; attempt < 6; attempt++) {
    const side = sideOffset(rule)
    const x = focus.x + dir.x * along - dir.z * side
    const z = focus.z + dir.z * along + dir.x * side
    if (distanceToPath(x, z) >= PATH_CLEARANCE) {
      return relative ? [x - focus.x, z - focus.z] : [x, z]
    }
  }
  return null
}

// Points shader: per-particle size and life, so a mote can taper and cool as
// it rises. PointsMaterial applies one size and one colour to the whole pool,
// which cannot express a flame.
const MOTE_VERT = /* glsl */ `
  attribute float aLife;   // 1 at the ground, 0 at the ceiling
  attribute float aSize;
  uniform float uSize;
  varying float vLife;

  void main() {
    vLife = aLife;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // shrink as it dies; dead motes collapse to nothing
    gl_PointSize = uSize * aSize * smoothstep(0.0, 0.35, aLife) * (0.45 + 0.55 * aLife);
    gl_Position = projectionMatrix * mv;
  }
`

const MOTE_FRAG = /* glsl */ `
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  varying float vLife;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    // soft round falloff, hottest at the core
    float falloff = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uCool, uHot, vLife * vLife);
    gl_FragColor = vec4(col, falloff * vLife * uOpacity);
  }
`

// Motes rising off the ground. One pool, four behaviours — see motes.js. They
// spawn around wherever the cube is, so they are always in frame.
function ElementMotes({ accent, element, travel, dim }) {
  const matRef = useRef(null)
  const focus = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const hotTarget = useMemo(() => new THREE.Color(), [])
  const coolTarget = useMemo(() => new THREE.Color(), [])
  const elapsed = useRef(0)

  const { geometry, vel, seed, originX, originZ, age, span } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(MOTE_COUNT * 3)
    const life = new Float32Array(MOTE_COUNT)
    const size = new Float32Array(MOTE_COUNT)
    const v = new Float32Array(MOTE_COUNT)
    const sd = new Float32Array(MOTE_COUNT)
    const ox = new Float32Array(MOTE_COUNT)
    const oz = new Float32Array(MOTE_COUNT)
    const ag = new Float32Array(MOTE_COUNT)
    const lf = new Float32Array(MOTE_COUNT)
    for (let i = 0; i < MOTE_COUNT; i++) {
      pos[i * 3 + 1] = -1 // start dead below the floor
      sd[i] = Math.random() * 100
      size[i] = 0.55 + Math.random() * 0.9
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    return { geometry: g, vel: v, seed: sd, originX: ox, originZ: oz, age: ag, span: lf }
  }, [])

  const uniforms = useMemo(
    () => ({
      uSize: { value: 7 },
      uOpacity: { value: 0.6 },
      uHot: { value: new THREE.Color('#ffd9a0') },
      uCool: { value: new THREE.Color('#ff4d10') },
    }),
    []
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const t = elapsed.current
    const rule = ruleFor(element)

    const speed = travel.current.speed
    pathAt(travel.current.dist, focus, dir)

    const emission = rule.emitAtRest ? 1 : speed
    const arr = geometry.attributes.position.array
    const life = geometry.attributes.aLife.array

    if (rule.mode === 'wave') {
      // Ocean: most particles ride a surface built from two crossing swells, so
      // they warp along the wave rather than rising and dying. The rest are
      // spray, thrown off the crests and pulled back by gravity.
      const amp = rule.waveAmp
      for (let i = 0; i < MOTE_COUNT; i++) {
        const ix = i * 3
        const iy = ix + 1
        const iz = ix + 2

        if (arr[iy] < 0) {
          // originX/Z hold an offset from the cube here, so the sea follows it
          const spot = offPath(focus, dir, rule, true)
          if (!spot) continue
          originX[i] = spot[0]
          originZ[i] = spot[1]
          arr[iy] = 0
          vel[i] = 0
        }

        const ox = originX[i]
        const oz = originZ[i]
        const surfaceX = focus.x + ox
        const surfaceZ = focus.z + oz
        const swell =
          Math.sin(ox * rule.waveFreq + t * rule.waveSpeed) * amp +
          Math.sin(oz * rule.waveFreq2 + t * rule.waveSpeed * 0.8 + ox * 0.3) * amp

        const isSpray = i % rule.sprayEvery === 0

        if (isSpray && vel[i] > 0) {
          // airborne: keep its own arc until it falls back to the surface
          vel[i] -= rule.gravity * dt
          arr[iy] += vel[i] * dt
          arr[ix] += Math.sin(t * 1.7 + seed[i]) * 0.4 * dt
          arr[iz] += Math.cos(t * 1.3 + seed[i]) * 0.4 * dt
          life[i] = Math.min(1, 0.35 + arr[iy] / rule.ceiling)
          if (arr[iy] <= 0.12 + swell) {
            vel[i] = 0
            arr[iy] = 0.12 + swell
          }
        } else {
          arr[ix] = surfaceX
          arr[iz] = surfaceZ
          arr[iy] = 0.12 + swell
          // crests read as foam, troughs sink toward the deep colour
          life[i] = Math.min(1, Math.max(0, (swell + amp * 2) / (amp * 4)))
          // launch spray off a rising crest
          if (isSpray && swell > amp * 0.9 && Math.random() < 0.04) {
            vel[i] = rule.spray[0] + Math.random() * (rule.spray[1] - rule.spray[0])
          }
        }

        // recycle anything that drifted too far from the cube
        if (Math.abs(surfaceX - focus.x) > rule.spread * 1.4) arr[iy] = -1
      }
    } else if (rule.mode === 'gust') {
      // Wind: each mote is advected along the heading it was born under, so a
      // gust curves with the route instead of snapping direction at a corner.
      // Flow scales with how fast the cube is rolling — calm when parked.
      const flowBoost = speed * rule.boost
      for (let i = 0; i < MOTE_COUNT; i++) {
        const ix = i * 3
        const iy = ix + 1
        const iz = ix + 2

        if (arr[iy] < 0) {
          // upwind and off to the side, so wind crosses the terrain, not the path
          const back = -(0.2 + Math.random() * 0.8) * (rule.along || rule.spread)
          const side = sideOffset(rule)
          const sx = focus.x + dir.x * back - dir.z * side
          const sz = focus.z + dir.z * back + dir.x * side
          if (distanceToPath(sx, sz) < PATH_CLEARANCE) continue
          arr[ix] = sx
          arr[iz] = sz
          arr[iy] = rule.height[0] + Math.random() * (rule.height[1] - rule.height[0])
          originX[i] = dir.x
          originZ[i] = dir.z
          vel[i] = rule.flow[0] + Math.random() * (rule.flow[1] - rule.flow[0])
          age[i] = 0
          span[i] = rule.lifetime[0] + Math.random() * (rule.lifetime[1] - rule.lifetime[0])
          life[i] = 0
          continue
        }

        const travel = (vel[i] + flowBoost) * dt
        arr[ix] += originX[i] * travel
        arr[iz] += originZ[i] * travel
        arr[iy] += (rule.rise[0] + seed[i] * 0.004) * dt
        arr[ix] += Math.sin(t * rule.swayFreq + seed[i]) * rule.sway * dt
        arr[iz] += Math.cos(t * rule.swayFreq * 0.8 + seed[i]) * rule.sway * dt

        age[i] += dt
        const k = age[i] / span[i]
        // fade in and out so gusts arrive and leave rather than blinking
        life[i] = Math.max(0, Math.min(1, Math.min(k * 4, (1 - k) * 2.2)))
        if (k >= 1) {
          arr[iy] = -1
          life[i] = 0
        }
      }
    } else {
      for (let i = 0; i < MOTE_COUNT; i++) {
        const ix = i * 3
        const iy = ix + 1
        const iz = ix + 2

        if (arr[iy] < 0) {
          if (Math.random() > emission * 0.06) continue
          const spot = offPath(focus, dir, rule)
          if (!spot) continue
          const [ox, oz] = spot
          arr[ix] = ox
          arr[iy] = 0
          arr[iz] = oz
          originX[i] = ox
          originZ[i] = oz
          vel[i] = rule.rise[0] + Math.random() * (rule.rise[1] - rule.rise[0])
          life[i] = 1
          continue
        }

        vel[i] -= rule.gravity * dt
        arr[iy] += vel[i] * dt

        const climb = Math.min(1, Math.max(0, arr[iy] / rule.ceiling))
        arr[ix] += Math.sin(t * rule.swayFreq + seed[i]) * rule.sway * dt
        arr[iz] += Math.cos(t * rule.swayFreq * 0.7 + seed[i]) * rule.sway * dt
        const pull = rule.taper * climb * 2.2 * dt
        arr[ix] += (originX[i] - arr[ix]) * pull
        arr[iz] += (originZ[i] - arr[iz]) * pull

        life[i] = 1 - climb
        if (arr[iy] > rule.ceiling || arr[iy] < -0.05) {
          arr[iy] = -1
          life[i] = 0
        }
      }
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.aLife.needsUpdate = true

    const heat = heatFor(rule, accent)
    const u = matRef.current?.uniforms
    if (u) {
      u.uSize.value += (rule.size - u.uSize.value) * 0.06
      u.uOpacity.value += (rule.opacity * dim - u.uOpacity.value) * 0.06
      u.uHot.value.lerp(hotTarget.set(heat.hot), 0.06)
      u.uCool.value.lerp(coolTarget.set(heat.cool), 0.06)
    }
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={MOTE_VERT}
        fragmentShader={MOTE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Fraction of the viewport width the world is pushed right by, so it sits clear
// of the left content column.
const WORLD_SHIFT = 0.26

// Orthographic camera holding the iso angle while tracking the cube through its
// turns — the offset is fixed, so the projection itself never rotates.
function IsoCamera({ travel }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3())
  const pos = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    // travel is already eased, so the camera tracks it directly
    pathAt(travel.current.dist, pos, dir)
    look.current.copy(pos)
    camera.position.set(look.current.x + 15, 13, look.current.z + 15)
    camera.lookAt(look.current)
    camera.zoom = Math.max(26, Math.min(46, size.width / 26))

    // Push the route into the right-hand band so it never runs under the
    // content column. Offsetting the frustum rather than the canvas keeps the
    // star field full-bleed — only the world moves.
    const shift = size.width >= 1000 ? size.width * WORLD_SHIFT : 0
    if (shift) camera.setViewOffset(size.width, size.height, -shift, 0, size.width, size.height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  })

  return null
}

function Scene({ accent, element, markers, dim }) {
  const progress = useScrollProgress()
  const travel = useRef({ dist: 0, delta: 0, speed: 0 })
  return (
    <>
      {/* must come first: everything below reads the value it writes */}
      <TravelDriver progress={progress} travel={travel} />
      <IsoCamera travel={travel} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 6]} intensity={1.4} />
      <Stars />
      <Ground element={element} travel={travel} />
      <ElementMotes accent={accent} element={element} travel={travel} dim={dim} />
      <Markers markers={markers} accent={accent} travel={travel} />
      <Cube accent={accent} travel={travel} />
    </>
  )
}

export default function IsoWorld({ accent, element, markers, dim = 1, paused = false }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
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
        frameloop={paused ? 'never' : 'always'}
        orthographic
        camera={{ position: [15, 13, 15], zoom: 38, near: -100, far: 300 }}
        dpr={isMobileViewport ? [1, 1.25] : [1, 1.5]}
        gl={{
          // MSAA is the first thing worth dropping on a phone GPU
          antialias: !isMobileViewport,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <Scene accent={accent} element={element} markers={markers} dim={dim} />
      </Canvas>
    </div>
  )
}
