// Bending feel per nation: how particles rise, drift, and react to the cursor.
// rise: vertical loop speed · drift: sideways wobble · push/swirl: cursor force (radial vs tangential)
export const elementConfigs = {
  fire: {
    index: '01',
    title: 'About',
    note: 'Who is building this.',
    accent: '#ff8a3d',
    textAccent: '#3daaff',
    // Light mode darkens each hue until it clears AA twice over: on flat paper,
    // and against the worst composite the phone can produce, where the world
    // shows through at half opacity behind the scrim.
    accentLight: '#82461f',
    textAccentLight: '#205986',
    colorLow: [1.0, 0.35, 0.05],
    colorHigh: [1.0, 0.85, 0.3],
    rise: 0.16,
    driftAmp: 0.15,
    driftFreq: 1.6,
    pushStrength: 0.6,
    pushRadius: 1.4,
    swirl: 0.0,
    sizeBase: 2.0,
    sizeVar: 4.0,
    alphaBase: 0.4,
  },
  water: {
    index: '04',
    title: '3D Projects',
    note: 'Real-time rendering, engine work, and 3D gameplay — ray tracing, camera systems, and physics sandboxes in Unity and Unreal.',
    accent: '#4fb8d6',
    textAccent: '#ffa14f',
    // Light mode darkens each hue until it clears AA twice over: on flat paper,
    // and against the worst composite the phone can produce, where the world
    // shows through at half opacity behind the scrim.
    accentLight: '#275c6b',
    textAccentLight: '#784c25',
    colorLow: [0.05, 0.25, 0.45],
    colorHigh: [0.3, 0.75, 0.9],
    rise: 0.16,
    driftAmp: 0.25,
    driftFreq: 1.6,
    pushStrength: 0.35,
    pushRadius: 1.8,
    swirl: 0.15,
    sizeBase: 1.5,
    sizeVar: 2.5,
    alphaBase: 0.35,
  },
  earth: {
    index: '02',
    title: '2D Projects',
    note: 'Live mobile titles — real players, real retention, and the constraints that come with shipping to a store rather than a showcase.',
    accent: '#8a9a5b',
    textAccent: '#a98ad6',
    // Light mode darkens each hue until it clears AA twice over: on flat paper,
    // and against the worst composite the phone can produce, where the world
    // shows through at half opacity behind the scrim.
    accentLight: '#505935',
    textAccentLight: '#5f4e79',
    colorLow: [0.2, 0.15, 0.05],
    colorHigh: [0.45, 0.55, 0.25],
    rise: 0.16,
    driftAmp: 0.05,
    driftFreq: 1.6,
    pushStrength: 0.15,
    pushRadius: 0.8,
    swirl: 0.0,
    sizeBase: 3.0,
    sizeVar: 3.0,
    alphaBase: 0.5,
  },
  air: {
    index: '03',
    title: 'VR Projects',
    note: 'Hand tracking, haptics, and locomotion — where a wrong frame is not a bug, it is nausea.',
    accent: '#f2e9c9',
    textAccent: '#a9c2f2',
    // Light mode darkens each hue until it clears AA twice over: on flat paper,
    // and against the worst composite the phone can produce, where the world
    // shows through at half opacity behind the scrim.
    accentLight: '#585549',
    textAccentLight: '#4b566c',
    colorLow: [0.85, 0.85, 0.75],
    colorHigh: [1.0, 1.0, 0.95],
    rise: 0.16,
    driftAmp: 0.1,
    driftFreq: 1.6,
    pushStrength: 0.25,
    pushRadius: 1.2,
    swirl: 0.9,
    sizeBase: 1.0,
    sizeVar: 1.5,
    alphaBase: 0.3,
  },
}

// fire is the About chapter; these three are the project categories
export const actOrder = ['earth', 'air', 'water']
