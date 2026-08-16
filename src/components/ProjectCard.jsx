import { useEffect, useRef, useState } from 'react'
import {
  posterFor,
  posterFallbackFor,
  previewFor,
  PLACEHOLDER_MAX_WIDTH,
} from '../data/media'

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

export default function ProjectCard({ project, index, onOpen }) {
  const poster = posterFor(project)
  const preview = previewFor(project)
  const [src, setSrc] = useState(poster)
  const [active, setActive] = useState(false)
  const frameRef = useRef(null)
  const hasStore = Boolean(project.playStore || project.appStore)

  // Touch devices have no hover, so drive the loop from visibility instead —
  // one card at a time, and never all of them at once.
  useEffect(() => {
    if (!preview || reducedMotion || !isTouch || !frameRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '-35% 0px -35% 0px' }
    )
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [preview])

  const canPreview = Boolean(preview) && !reducedMotion
  const engage = () => canPreview && !isTouch && setActive(true)
  const disengage = () => !isTouch && setActive(false)

  return (
    <button
      className="card"
      onClick={() => onOpen(project)}
      onPointerEnter={engage}
      onPointerLeave={disengage}
      onFocus={engage}
      onBlur={disengage}
      aria-haspopup="dialog"
    >
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

      <span className="card__body">
        <span className="card__idx">{String(index + 1).padStart(2, '0')}</span>
        <span className="card__title">{project.title}</span>
        <span className="card__meta">{project.skills.slice(0, 3).join(' · ')}</span>
      </span>
    </button>
  )
}
