// `youtube` is the bare video id. The detail sheet renders a click-to-play
// facade, so YouTube's iframe only loads if a visitor actually hits play.
// `playStore` / `appStore` are store urls for the live mobile titles; a
// project with either renders store buttons instead of a video frame.
//
// `tier` is how far a project actually got, not how hard it was — shipped and
// live outranks impressive-but-a-prototype. Drives the card frame colour:
//   legendary  shipped and live      hero  strong prototype
//   intermediate  solid build        noob  early work

export const projects = [
  // 3D projects — rendering, engines, spatial systems
  {
    slug: 'stanford-dragon-raytracer',
    tier: 'hero',
    youtube: 'J513nnZyh5o',
    element: 'water',
    title: 'Stanford Dragon RayTracer Realtime',
    blurb:
      'Real-time GPU ray tracer using GLSL compute shaders with OpenTK (C# OpenGL bindings). Evolved from simple primitives to rendering 6M+ triangles in a BVH wavefront-style pipeline with multiple materials and textures at 60 FPS on an NVIDIA RTX 1080.',
    features: [
      'Whitted-style ray tracer',
      'Wavefront approach',
      'Persistent while-while traversal algorithm',
      'Optional early-exit intersection shader',
      'BVH construction',
      'GPU architecture',
    ],
    skills: ['C#', 'OpenTK', 'GLSL', 'GPU Programming', 'Ray Tracing', 'BVH'],
    highlights: [
      'Awarded "Best Simulation" in class showcase',
      'Demonstrated deep understanding of real-time rendering, shader programming, and GPU-based acceleration',
    ],
  },
  {
    slug: 'reality-rip',
    tier: 'hero',
    youtube: 'bUZ3hsKs1bw',
    element: 'water',
    title: 'Reality Rip',
    blurb:
      'Short cinematic film in Unreal Engine 4, focused on storytelling through animation, sound, and visual composition. Built detailed environments using Blender-modeled assets, integrated motion capture data for character animation, and implemented VFX and sound design to enhance mood and narrative.',
    features: [
      'Cinematic environments',
      'Camera rigging and sequencing systems',
      'Motion capture animations, particle effects, and soundscapes',
    ],
    skills: [
      'Unreal Engine 4',
      'Blender',
      'Motion Capture Integration',
      'Cinematic Lighting',
      'Camera Rigging',
      'VFX & Sound Design',
    ],
  },


  {
    slug: '3d-runner-prototype',
    tier: 'noob',
    youtube: 'p3frrQnwZK4',
    element: 'water',
    title: '3D Runner - Prototype',
    blurb:
      'A side project exploring procedural content generation and player feedback systems. Endless sequence of dynamically generated platforms where the player jumps over obstacles and collects coins while responding to animation and music cues.',
    features: [
      'Endless platform generation',
      'Responsive movement and jump system',
      'Animation and audio cues',
      'Score tracking and in-game feedback',
    ],
    skills: ['Unity', 'C#', 'Procedural Generation', 'Gameplay Programming', 'Animation & Audio Integration', 'UI Design'],
  },
  {
    slug: 'music-runner',
    tier: 'intermediate',
    youtube: 'LyC_XwXKXJg',
    element: 'water',
    title: 'Music Runner',
    blurb:
      'An educational endless runner designed to help players develop music recognition skills through interactive gameplay. Instead of penalizing mistakes, the game provides real-time auditory guidance, matching the correct sounds of various musical instruments.',
    features: ['Instrument recognition system', 'Modular framework', 'Optimized for mobile and desktop'],
    skills: ['Gameplay Programming', 'Learning Systems Design', 'Audio Integration', 'UX for Serious Games', 'Unity', 'C#'],
  },
  {
    slug: 'realmrush-tower-defence',
    tier: 'intermediate',
    youtube: 'iHXCSTEHGSU',
    element: 'water',
    title: 'RealmRush - Tower Defence Game',
    blurb:
      '2D isometric tower defense game focused on gameplay loop design, enemy AI, and strategic player interaction. Defend a base as waves of enemies advance while strategically placing towers that fire projectiles.',
    features: [
      'Wave progression systems',
      'Modular tower mechanics',
      'Loop balancing offense/defense management',
      'Collision handling and projectile logic',
    ],
    skills: ['Unity', 'C#', 'Gameplay Programming', 'AI Pathfinding', 'Game Loop Design', 'Object Interaction Systems'],
  },
  {
    slug: 'warehouse-destructor',
    tier: 'intermediate',
    youtube: '3dpeB9H_OIo',
    element: 'water',
    title: 'Warehouse Destructor',
    blurb:
      'A physics-based sandbox experiment in Unreal Engine 5, built for fun and exploration. Fly freely through a 3D warehouse environment, picking up and throwing heavy cement spheres to interact dynamically with the surroundings.',
    features: [
      'Physics-based interaction mechanics',
      'Free-flight movement system',
      "Unreal Engine 5's Chaos Physics",
      'Niagara effects',
      'Scene lighting',
    ],
    skills: ['Unreal Engine 5', 'C++', 'Physics Simulation', 'Chaos Physics', 'Player Movement Systems', 'Gameplay Experimentation'],
  },
  {
    slug: 'project-boost',
    tier: 'noob',
    youtube: 'fBl6Gy_Csrc',
    element: 'water',
    title: 'Project Boost',
    blurb:
      "My first complete game, built as a hands-on introduction to Unity's core systems and fundamental gameplay mechanics. Six progressively challenging levels where the player pilots a small craft through obstacle-filled environments to reach the target platform.",
    features: ['Level progression loop', 'Particle system', 'Collision detection', 'Scene management & game loop structure'],
    skills: ['Unity Fundamentals', 'Physics & Movement Systems', 'Particle Systems', 'Level Design', 'Gameplay Loop Design', 'C#'],
  },

  // VR projects
  {
    slug: 'boxing',
    tier: 'legendary',
    youtube: 'bdCX0R6PWlQ',
    element: 'air',
    title: 'Boxing',
    blurb:
      'A VR prototype focused on exploring immersive interaction systems, edge-of-the-seat action, tutorial-driven gameplay, and timed event handling in virtual reality.',
    features: [
      'Tutorial guide system',
      'Point-based scoring system',
      'Collision-based failure states',
      'Controller input and player experience design',
    ],
    skills: ['Unity', 'C#', 'VR Development', 'Meta Quest SDK', 'Interactive Systems', 'Gameplay Scripting', 'Event & Animation System'],
  },
  {
    slug: 'kayaking',
    tier: 'legendary',
    youtube: 'FnLLU3R1FaQ',
    element: 'air',
    title: 'Kayaking',
    blurb:
      'An immersive VR kayaking prototype simulating the calm and meditative experience of paddling through a serene stream, blending technical implementation with experiential design.',
    features: [
      'Paddle-based locomotion system',
      'Tranquil environment',
      'Custom water shaders',
      'Soundscapes and visual feedback loops',
      'VR physics & haptic feedback',
    ],
    skills: ['Unity', 'C#', 'VR Development', 'Shader Programming', 'Environmental Design', 'Physics Simulation', 'Audio-Visual Integration'],
  },
  {
    slug: 'track-the-snitch',
    tier: 'legendary',
    youtube: 'wxkBp9qPe38',
    element: 'air',
    title: 'Track The Snitch',
    blurb:
      'An interactive VR prototype centered on gesture-based activation and object tracking. The player holds their hand in position for five seconds to activate the snitch, then collects coins to reach the final target.',
    features: ['Hand-position detection', 'Real-time snitch tracking', 'Coin collection mechanics', 'Gesture recognition & event sequencing'],
    skills: ['Unity', 'C#', 'VR Development', 'Hand Tracking', 'Event Systems', 'Gameplay Programming', 'Interaction Design'],
  },

  // 2D projects — current commercial mobile work
  {
    slug: 'ludo-superstar',
    tier: 'legendary',
    playStore: 'https://play.google.com/store/apps/details?id=com.blacklightsw.ludo',
    appStore: 'https://apps.apple.com/in/app/ludo-superstar/id1314264574',
    element: 'earth',
    title: 'Ludo Superstar',
    blurb:
      'A live multiplayer mobile title on Google Play and the App Store, built at Blacklight Studio Works. I ship features across release branches — animation work, side games embedded inside the main app, and the live online services that keep a real player base connected.',
    features: [
      'Real-time online multiplayer sync',
      'Leaderboards and in-game chat',
      'Side games embedded within the main app',
      'Animation and UI feature work',
      'Live-ops release cadence across branches',
    ],
    skills: ['Unity 6', 'C#', 'Multiplayer Sync', 'Live Services', 'Android & iOS'],
  },
  {
    slug: 'parchisi-superstar',
    tier: 'legendary',
    playStore: 'https://play.google.com/store/apps/details?id=com.bsw.parchisi',
    appStore: 'https://apps.apple.com/in/app/parchisi-superstar/id6759275686',
    element: 'earth',
    title: 'Parchisi Superstar',
    blurb:
      'The second live multiplayer title I work on at Blacklight Studio Works, shipping to a live player base on mobile. Feature delivery spans gameplay, animation, and the shared online services layer used across both titles.',
    features: [
      'Online multiplayer state sync',
      'Reconnect and session lifecycle handling',
      'Leaderboards and social features',
      'Asset store pipeline work',
      'Cross-team feature delivery',
    ],
    skills: ['Unity 6', 'C#', 'Multiplayer Sync', 'Live Services', 'Android & iOS'],
  },
  {
    slug: 'snake-prototype',
    tier: 'intermediate',
    youtube: '1z8bZxn2y1k',
    element: 'earth',
    title: 'Snake Prototype',
    blurb:
      'A reimagining of the classic Snake game with unique control mechanics. Steered using keyboard input or a virtual steering wheel for a more tactile experience — cover all grid spaces, turning them green to complete each area.',
    features: ['Custom rotation-based movement system', 'Core gameplay loop', 'UI menu system', 'Visual feedback systems'],
    skills: ['Unity', 'C#', 'Gameplay Programming', 'Custom Input Systems', 'UI & Menu Design', 'Game Loop Architecture'],
  },
]
