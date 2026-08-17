import { useEffect, useRef } from 'react'
import ProjectCard from './ProjectCard'
import { isMobileViewport } from '../scene/budget'

// A horizontal rail of project cards: three across, the rest a wheel away.
export default function CardRail({ label, items, visited, onOpen, paused }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    // the tab list is an ordinary block; there is nothing to scroll sideways
    if (!el || isMobileViewport) return

    // A vertical wheel over the rail moves it sideways — but only while it has
    // somewhere to go. At either end the event is left alone so the page scrolls
    // on, which is what keeps this a rail and not a trap.
    const onWheel = (e) => {
      // trackpads already send horizontal deltas; don't fight them
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return

      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return

      const next = el.scrollLeft + e.deltaY
      if (next < 0 || next > max) return

      e.preventDefault()
      el.scrollLeft = next
    }

    // React attaches wheel handlers passively, so preventDefault needs its own
    // listener registered non-passive.
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      className="cards"
      ref={ref}
      data-layout={isMobileViewport ? 'tabs' : 'rail'}
      // only a scrollable region needs to be reachable without a pointer
      tabIndex={isMobileViewport ? undefined : 0}
      role="group"
      aria-label={label}
    >
      {items.map((p, i) => (
        <ProjectCard
          key={p.slug}
          project={p}
          index={i}
          visited={visited.has(p.slug)}
          onOpen={onOpen}
          paused={paused}
          scrollRoot={ref}
          compact={isMobileViewport}
        />
      ))}
    </div>
  )
}
