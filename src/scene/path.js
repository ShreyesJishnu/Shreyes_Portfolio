import * as THREE from 'three'

// The route the cube travels, as waypoints on the ground plane. It turns in both
// axes rather than running straight, so the world reads as a place you move
// through rather than a corridor.
const WAYPOINTS = [
  [0, 0],
  [18, 0],
  [18, 13],
  [40, 13],
  [40, -9],
  [62, -9],
  [62, 9],
  [88, 9],
  [88, -6],
  [112, -6],
  [112, 10],
  [134, 10],
]

// Arc-length table so distance travelled maps evenly along the route — without
// it, long segments would be crossed at the same rate as short ones.
const segments = []
let total = 0
for (let i = 0; i < WAYPOINTS.length - 1; i++) {
  const [x0, z0] = WAYPOINTS[i]
  const [x1, z1] = WAYPOINTS[i + 1]
  const length = Math.hypot(x1 - x0, z1 - z0)
  segments.push({ x0, z0, x1, z1, length, start: total })
  total += length
}

export const PATH_LENGTH = total

const _pos = new THREE.Vector3()
const _dir = new THREE.Vector3()

// Position and heading at a given distance along the route.
export function pathAt(distance, outPos = _pos, outDir = _dir) {
  const d = Math.min(Math.max(distance, 0), total)
  let seg = segments[segments.length - 1]
  for (const s of segments) {
    if (d <= s.start + s.length) {
      seg = s
      break
    }
  }
  const t = seg.length > 0 ? (d - seg.start) / seg.length : 0
  outPos.set(seg.x0 + (seg.x1 - seg.x0) * t, 0, seg.z0 + (seg.z1 - seg.z0) * t)
  outDir.set(seg.x1 - seg.x0, 0, seg.z1 - seg.z0).normalize()
  return { position: outPos, direction: outDir }
}

// Evenly spaced samples, used to lay the tiles.
export function samplePath(step) {
  const out = []
  for (let d = 0; d <= total; d += step) {
    const { position, direction } = pathAt(d, new THREE.Vector3(), new THREE.Vector3())
    out.push({
      x: position.x,
      z: position.z,
      angle: Math.atan2(direction.x, direction.z),
    })
  }
  return out
}
