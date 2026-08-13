import { useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import ParticleField from './ParticleField'
import CameraRig from './CameraRig'

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function FieldBackground({ config, energy }) {
  // Start at the capped ceiling and let measured frame rate walk it down —
  // a guessed device tier is always wrong for someone.
  const [dpr, setDpr] = useState(1.5)

  // Reduced motion (or no WebGL) still gets an on-brand ground, just static.
  if (reducedMotion) {
    return (
      <div
        className="field-canvas"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(60% 60% at 50% 60%, var(--accent) 0%, transparent 70%)',
          opacity: 0.14,
        }}
      />
    )
  }

  // Canvas sets its own inline width/height/position, so the fixed layer has
  // to be a wrapper around it rather than the canvas element itself.
  return (
    <div className="field-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.2, 6], fov: 50 }}
        dpr={dpr}
        // ACES (the R3F default) rolls saturated accents toward white, the same
        // way AgX did in Blender — off, so the palette renders true
        gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.5)}
          flipflops={3}
          onFallback={() => setDpr(0.75)}
        />
        <CameraRig />
        <ParticleField config={config} energy={energy} />
      </Canvas>
    </div>
  )
}
