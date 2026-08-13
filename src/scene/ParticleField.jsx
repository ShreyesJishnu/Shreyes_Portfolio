import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerNDC, pointerState, startPointerTracking } from './pointer'

// Mobile GPUs are tile-based: additive blending with big sprites is a fillrate
// problem long before it is a vertex-count problem. So phones get fewer AND
// smaller particles, and the Canvas caps dpr (see FieldBackground).
const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
const COUNT = isMobile ? 500 : 1500
const SIZE_SCALE = isMobile ? 0.5 : 1

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uRise;
  uniform float uDriftAmp;
  uniform float uDriftFreq;
  uniform float uPushStrength;
  uniform float uPushRadius;
  uniform float uSwirl;
  uniform float uSizeBase;
  uniform float uSizeVar;
  uniform float uEnergy;
  attribute float aSeed;
  varying float vSeed;
  varying float vHeight;

  void main() {
    vec3 pos = position;

    float speed = 0.5 + aSeed * 0.5;
    pos.y = mod(pos.y + uTime * uRise * speed + 2.0, 4.0) - 2.0;

    // uEnergy is scroll velocity: flick the page and the field churns.
    float turb = uDriftAmp * (1.0 + uEnergy * 2.5);
    float t = uTime * uDriftFreq * 0.3 + aSeed * 10.0;
    pos.x += sin(t + pos.y * 2.0) * turb;
    pos.z += cos(t * 1.3 + pos.y * 1.7) * turb;

    vec2 toParticle = pos.xy - uMouse.xy;
    float dist = length(toParticle);
    float falloff = smoothstep(uPushRadius, 0.0, dist);
    vec2 radial = normalize(toParticle + 0.0001);
    vec2 tangential = vec2(-radial.y, radial.x);
    pos.xy += radial * falloff * uPushStrength;
    pos.xy += tangential * falloff * uSwirl;

    vSeed = aSeed;
    vHeight = (pos.y + 2.0) / 4.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (uSizeBase + aSeed * uSizeVar) * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform float uAlphaBase;
  varying float vSeed;
  varying float vHeight;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    vec3 color = mix(uColorLow, uColorHigh, vHeight);
    float alpha = smoothstep(0.5, 0.0, d) * (uAlphaBase + (1.0 - uAlphaBase) * vSeed);
    gl_FragColor = vec4(color, alpha);
  }
`

const LERP_SPEED = 1.4

export default function ParticleField({ config, energy }) {
  const materialRef = useRef()
  const { camera } = useThree()
  const mouseWorld = useMemo(() => new THREE.Vector3(10, 10, 10), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const colorLow = useMemo(() => new THREE.Color(), [])
  const colorHigh = useMemo(() => new THREE.Color(), [])

  startPointerTracking()

  // Built once and never replaced. An inline object here would be a new
  // uniforms object on every render, so each act change would reset uTime to 0
  // (snapping every particle back to its origin, which reads as a respawn) and
  // overwrite the in-flight colour lerp with an instant jump.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(10, 10, 10) },
      uRise: { value: config.rise },
      uDriftAmp: { value: config.driftAmp },
      uDriftFreq: { value: config.driftFreq },
      uPushStrength: { value: config.pushStrength },
      uPushRadius: { value: config.pushRadius },
      uSwirl: { value: config.swirl },
      uSizeBase: { value: config.sizeBase * SIZE_SCALE },
      uSizeVar: { value: config.sizeVar * SIZE_SCALE },
      uAlphaBase: { value: config.alphaBase },
      uEnergy: { value: 0 },
      uColorLow: { value: new THREE.Color(...config.colorLow) },
      uColorHigh: { value: new THREE.Color(...config.colorHigh) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded once; useFrame lerps every later change
    []
  )

  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3
      seed[i] = Math.random()
    }
    return [pos, seed]
  }, [])

  useFrame((state, delta) => {
    const m = materialRef.current
    if (!m) return
    const u = m.uniforms
    u.uTime.value = state.clock.elapsedTime

    // park the force far off-screen until the pointer has actually moved,
    // otherwise the field opens a hole before the user has touched anything
    if (pointerState.engaged) {
      raycaster.setFromCamera(pointerNDC, camera)
      raycaster.ray.intersectPlane(plane, mouseWorld)
    } else {
      mouseWorld.set(999, 999, 0)
    }
    u.uMouse.value.lerp(mouseWorld, Math.min(1, delta * 8))
    u.uEnergy.value = THREE.MathUtils.lerp(u.uEnergy.value, energy.current, Math.min(1, delta * 4))

    const k = Math.min(1, delta * LERP_SPEED)
    u.uRise.value = THREE.MathUtils.lerp(u.uRise.value, config.rise, k)
    u.uDriftAmp.value = THREE.MathUtils.lerp(u.uDriftAmp.value, config.driftAmp, k)
    u.uDriftFreq.value = THREE.MathUtils.lerp(u.uDriftFreq.value, config.driftFreq, k)
    u.uPushStrength.value = THREE.MathUtils.lerp(u.uPushStrength.value, config.pushStrength, k)
    u.uPushRadius.value = THREE.MathUtils.lerp(u.uPushRadius.value, config.pushRadius, k)
    u.uSwirl.value = THREE.MathUtils.lerp(u.uSwirl.value, config.swirl, k)
    u.uSizeBase.value = THREE.MathUtils.lerp(u.uSizeBase.value, config.sizeBase * SIZE_SCALE, k)
    u.uSizeVar.value = THREE.MathUtils.lerp(u.uSizeVar.value, config.sizeVar * SIZE_SCALE, k)
    u.uAlphaBase.value = THREE.MathUtils.lerp(u.uAlphaBase.value, config.alphaBase, k)
    u.uColorLow.value.lerp(colorLow.setRGB(...config.colorLow), k)
    u.uColorHigh.value.lerp(colorHigh.setRGB(...config.colorHigh), k)
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
