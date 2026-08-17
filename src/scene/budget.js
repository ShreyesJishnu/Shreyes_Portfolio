// Environment checks, shared by the world canvas and the HUD.

export const isMobileViewport =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// no hover means the card previews need a visibility trigger instead
export const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

// Stars drawn in the world canvas; the HUD reports this.
export const STAR_COUNT = 137
