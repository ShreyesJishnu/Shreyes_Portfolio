// How each element behaves once it leaves the ground. Same particle pool for
// all four — only the motion rules change, so switching chapters is a
// behaviour swap rather than a rebuild.
//
//   fire   rise   embers: fast, tight to the cube, flickering upward
//   water  wave   an ocean surface that swells, with spray thrown off the crests
//   earth  rise   debris: launched and pulled back down by gravity, while moving
//   air    gust   wind streaming along the cube's heading, faster as it moves
//
// `mode` picks the motion model; everything else tunes it.

import { isMobileViewport } from './budget'

// Phones run the same shader on a fraction of the pool: the field still reads
// as an environment, without spending the frame budget the headline claims.
export const MOTE_COUNT = isMobileViewport ? 850 : 2200

// Particles are the environment, not an effect on the player. They spawn in the
// terrain flanking the route — never on it — so the cube travels through them.
// `clearance` is how far off the path centre line they start; `along` is how far
// ahead and behind the cube the band extends.
export const PATH_CLEARANCE = 2.6

export const MOTE_RULES = {
  fire: {
    key: 'fire',
    mode: 'rise',
    // fires burning in the terrain either side of the route, low enough to sit
    // under the content rather than pull the eye off it
    spread: 16,
    along: 34,
    ceiling: 2.6,
    rise: [0.9, 1.9],
    gravity: 0,
    sway: 0.5,
    swayFreq: 6,
    // flames narrow as they rise; 0 keeps a column, 1 pinches to a point
    taper: 0.85,
    size: 21,
    opacity: 1,
    hot: '#ffd9a0',
    cool: '#ff4d10',
    // embers keep coming whether or not the cube is moving
    emitAtRest: 1,
  },
  water: {
    key: 'water',
    mode: 'wave',
    // open water on both sides of the causeway
    spread: 30,
    along: 46,
    ceiling: 6,
    // the swell itself: two crossing waves so it never looks like one sine
    waveAmp: 0.5,
    waveFreq: 0.5,
    waveFreq2: 0.31,
    waveSpeed: 1.5,
    // every Nth particle is thrown off a crest instead of riding the surface
    sprayEvery: 3,
    spray: [1.4, 3.0],
    gravity: 6.5,
    taper: 0,
    size: 11,
    opacity: 1,
    hot: '#d6f4ff',
    cool: '#1c6f9c',
    emitAtRest: 1,
  },
  earth: {
    key: 'earth',
    mode: 'rise',
    taper: 0.1,
    spread: 18,
    along: 32,
    ceiling: 7,
    rise: [2.2, 4.2],
    // thrown up, then pulled back — debris, not smoke
    gravity: 9,
    sway: 0.1,
    swayFreq: 3,
    size: 12,
    opacity: 1,
    // only kicks up when the cube is actually rolling
    emitAtRest: 0,
  },
  air: {
    key: 'air',
    mode: 'gust',
    // Wind is the one element that reads by passing *through* the scene, so it
    // ignores the path clearance every other element respects. Kept off the
    // road it only ever blew past in the margins, which is why it read as
    // barely there.
    crossesPath: true,
    // spawn box around the cube: wide and low, so wind crosses the frame
    spread: 26,
    along: 58,
    height: [0.2, 5.5],
    ceiling: 12,
    // base drift with no input, plus a boost that tracks how fast it rolls —
    // still air when parked, gusting when moving
    flow: [2.2, 4.5],
    boost: 11,
    // long enough to start upwind and still be alive well past the cube
    lifetime: [1.3, 2.8],
    // a little lift and wander so it is wind, not a conveyor belt
    rise: [0.15, 0.5],
    sway: 0.7,
    swayFreq: 1.6,
    gravity: 0,
    taper: 0,
    size: 9,
    opacity: 0.95,
    hot: '#ffffff',
    cool: '#e2dcc6',
    emitAtRest: 1,
  },
}

export const ruleFor = (element) => MOTE_RULES[element] || MOTE_RULES.air

// Elements without their own pair take the chapter accent for both ends, so the
// ramp simply fades out instead of shifting hue.
export const heatFor = (rule, accent) => ({
  hot: rule.hot || accent,
  cool: rule.cool || accent,
})

// Light mode is not a token swap for the particles. They are drawn with additive
// blending, which means "add light" — on a pale ground every colour saturates to
// white and the field disappears. Light mode draws them normally instead, and
// the hues have to be dark enough to register against paper rather than bright
// enough to glow against black.
export const MOTE_LIGHT = {
  fire: { hot: '#c2410c', cool: '#7c2d12' },
  water: { hot: '#0e7490', cool: '#164e63' },
  earth: { hot: '#4d7c0f', cool: '#3f6212' },
  air: { hot: '#78716c', cool: '#57534e' },
}

export const heatForTheme = (rule, accent, theme) =>
  theme === 'light'
    ? MOTE_LIGHT[rule.key] || MOTE_LIGHT.air
    : { hot: rule.hot || accent, cool: rule.cool || accent }
