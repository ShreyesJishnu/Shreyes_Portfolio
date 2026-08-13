import * as THREE from 'three'

// The canvas is pointer-events:none, so R3F never sees pointer events. One
// window listener feeds every system that needs the cursor.
export const pointerNDC = new THREE.Vector2(0, 0)
export const pointerState = { engaged: false }

let started = false

export function startPointerTracking() {
  if (started || typeof window === 'undefined') return
  started = true

  const onMove = (e) => {
    pointerNDC.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    )
    pointerState.engaged = true
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onMove, { passive: true })
  document.addEventListener('pointerleave', () => {
    pointerState.engaged = false
  })
}
