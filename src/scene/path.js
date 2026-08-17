import * as THREE from 'three'

export const TILE = 1.6

// The route, in whole tiles. Keeping waypoints on a grid — and every segment
// axis-aligned — is what lets the tiles butt up flush and turn at a clean 90°.
// Sampling by arc length and rotating each tile to the heading cannot do that:
// at a corner the heading flips instantly and the tiles gap or overlap.
const WAYPOINTS_GRID = [
  [0, 0],
  [11, 0],
  [11, 8],
  [25, 8],
  [25, -6],
  [39, -6],
  [39, 6],
  [55, 6],
  [55, -4],
  [70, -4],
  [70, 6],
  [84, 6],
]

const WAYPOINTS = WAYPOINTS_GRID.map(([gx, gz]) => [gx * TILE, gz * TILE])

// Arc-length table so distance maps evenly along the route — without it, long
// segments would be crossed at the same rate as short ones.
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

// Every tile the route covers, on the grid, deduped so corners get exactly one
// tile instead of two stacked ones. Tiles are axis-aligned, never rotated.
export function tileGrid() {
  const seen = new Set()
  const out = []
  const add = (gx, gz) => {
    const key = `${gx},${gz}`
    if (seen.has(key)) return
    seen.add(key)
    out.push({ x: gx * TILE, z: gz * TILE, gx, gz })
  }

  for (let i = 0; i < WAYPOINTS_GRID.length - 1; i++) {
    const [x0, z0] = WAYPOINTS_GRID[i]
    const [x1, z1] = WAYPOINTS_GRID[i + 1]
    const stepX = Math.sign(x1 - x0)
    const stepZ = Math.sign(z1 - z0)
    let x = x0
    let z = z0
    add(x, z)
    while (x !== x1 || z !== z1) {
      if (x !== x1) x += stepX
      else z += stepZ
      add(x, z)
    }
  }
  return out
}

// Distance from a point to the route's centre line — used to keep environment
// particles off the path.
export function distanceToPath(x, z) {
  let best = Infinity
  for (const s of segments) {
    const dx = s.x1 - s.x0
    const dz = s.z1 - s.z0
    const len2 = dx * dx + dz * dz
    let t = len2 > 0 ? ((x - s.x0) * dx + (z - s.z0) * dz) / len2 : 0
    t = Math.min(1, Math.max(0, t))
    const px = s.x0 + dx * t
    const pz = s.z0 + dz * t
    const d = Math.hypot(x - px, z - pz)
    if (d < best) best = d
  }
  return best
}
