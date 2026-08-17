// How each element behaves once it leaves the ground. Same particle pool for
// all four — only the motion rules change, so switching chapters is a
// behaviour swap rather than a rebuild.
//
//   fire   embers: fast, tight to the cube, flickering upward
//   water  waves: slow, wide, strong lateral sway
//   earth  debris: launched and pulled back down by gravity, only while moving
//   air    drift: sparse, slow, wandering sideways

export const MOTE_COUNT = 420

export const MOTE_RULES = {
  fire: {
    spread: 7,
    ceiling: 9,
    rise: [1.4, 3.4],
    gravity: 0,
    sway: 0.35,
    swayFreq: 7,
    size: 3,
    opacity: 0.9,
    // embers keep coming whether or not the cube is moving
    emitAtRest: 1,
  },
  water: {
    spread: 15,
    ceiling: 6,
    rise: [0.25, 0.7],
    gravity: 0,
    sway: 1.5,
    swayFreq: 1.4,
    size: 2.6,
    opacity: 0.75,
    emitAtRest: 1,
  },
  earth: {
    spread: 4.5,
    ceiling: 7,
    rise: [2.2, 4.2],
    // thrown up, then pulled back — debris, not smoke
    gravity: 9,
    sway: 0.1,
    swayFreq: 3,
    size: 4,
    opacity: 0.95,
    // only kicks up when the cube is actually rolling
    emitAtRest: 0,
  },
  air: {
    spread: 18,
    ceiling: 12,
    rise: [0.4, 1.1],
    gravity: 0,
    sway: 0.9,
    swayFreq: 0.8,
    size: 2.2,
    opacity: 0.6,
    emitAtRest: 1,
  },
}

export const ruleFor = (element) => MOTE_RULES[element] || MOTE_RULES.air
