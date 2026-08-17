// Environment checks, shared by the world canvas and the HUD.

import { useSyncExternalStore } from 'react'

const match = (q) => (typeof window !== 'undefined' ? window.matchMedia(q) : null)

const mobileQuery = match('(max-width: 768px)')
const motionQuery = match('(prefers-reduced-motion: reduce)')
const touchQuery = match('(hover: none)')

// Viewport class and input type are read once: they decide how much geometry to
// build, and rebuilding the world mid-session would cost more than it saves.
export const isMobileViewport = Boolean(mobileQuery?.matches)
export const isTouch = Boolean(touchQuery?.matches)

export const prefersReducedMotion = Boolean(motionQuery?.matches)

// Motion preference, unlike the other two, can change while the page is open —
// someone turns it on precisely because what they are looking at is moving. So
// components subscribe rather than reading the load-time value.
const subscribe = (onChange) => {
  motionQuery?.addEventListener('change', onChange)
  return () => motionQuery?.removeEventListener('change', onChange)
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => Boolean(motionQuery?.matches),
    () => false // server/prerender: assume motion is fine, the client corrects it
  )
}

// Stars drawn in the world canvas; the HUD reports this. Phones get a lighter
// field — the whole point of the budget is that it is actually applied.
export const STAR_COUNT = isMobileViewport ? 70 : 137
