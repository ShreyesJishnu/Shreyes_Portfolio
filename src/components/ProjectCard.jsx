import { useEffect, useRef, useState } from 'react'
import {
  posterFor,
  posterFallbackFor,
  previewFor,
  PLACEHOLDER_MAX_WIDTH,
} from '../data/media'
import { useReducedMotion, isTouch } from '../scene/budget'

export default function ProjectCard({ project, index, visited, onOpen, paused, scrollRoot, compact }) {
  const reducedMotion = useReducedMotion()
  const poster = posterFor(project)
  const preview = previewFor(project)
  const [src, setSrc] = useState(poster)
  const [active, setActive] = useState(false)
  const frameRef = useRef(null)
  const hasStore = Boolean(project.playStore || project.appStore)

  // Touch devices have no hover, so drive the loop from visibility instead.
  // Measured against the rail's own centre band rather than the viewport: three
  // cards share a row, so a viewport test would start all three at once.
  useEffect(() => {
    if (compact || !preview || reducedMotion || paused || !isTouch || !frameRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { root: scrollRoot?.current || null, rootMargin: '0px -40% 0px -40%' }
    )
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [preview, reducedMotion, paused, scrollRoot, compact])

  const canPreview = Boolean(preview) && !reducedMotion && !paused
  const engage = () => canPreview && !isTouch && setActive(true)
  const disengage = () => !isTouch && setActive(false)

  return (
    <button
      className="card"
      data-tier={project.tier}
      data-compact={compact || undefined}
      data-visited={visited || undefined}
      onClick={() => onOpen(project)}
      onPointerEnter={engage}
      onPointerLeave={disengage}
      onFocus={engage}
      onBlur={disengage}
      aria-haspopup="dialog"
    >
      {!compact && (
      <span className="card__frame" ref={frameRef}>
        {src ? (
          <img
            className="card__img"
            src={src}
            // A missing thumbnail size arrives as 200 + grey placeholder rather
            // than an error, so detect it by size; keep onError as a second net.
            onLoad={(e) => {
              if (e.currentTarget.naturalWidth < PLACEHOLDER_MAX_WIDTH) {
                setSrc(posterFallbackFor(project))
              }
            }}
            onError={() => setSrc(posterFallbackFor(project))}
            alt=""
            loading="lazy"
          />
        ) : (
          // Projects with no capture yet still need a deliberate-looking tile
          // rather than an empty box.
          <span className="card__blank">
            <span className="card__blankMark">{project.title.charAt(0)}</span>
          </span>
        )}

        {canPreview && active && (
          // mounts only while active, so nothing is fetched until the card is
          // hovered or scrolled to; autoPlay handles start once data arrives
          <video
            className="card__video"
            src={preview}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        )}

        <span className="card__badge" aria-hidden="true">
          {project.youtube ? '▶' : hasStore ? '↗' : '—'}
        </span>
      </span>
      )}

      <span className="card__body">
        <span className="card__idx">{String(index + 1).padStart(2, '0')}</span>
        <span className="card__title">{project.title}</span>
        <span className="card__meta">
          {project.skills.slice(0, compact ? 2 : 3).join(' · ')}
        </span>
        {compact && (
          <span className="card__go" aria-hidden="true">
            {project.youtube ? '▶' : hasStore ? '↗' : '→'}
          </span>
        )}
      </span>
    </button>
  )
}
