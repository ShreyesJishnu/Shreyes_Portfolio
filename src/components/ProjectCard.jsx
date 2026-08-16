import { useState } from 'react'
import { posterFor, posterFallbackFor, PLACEHOLDER_MAX_WIDTH } from '../data/media'

export default function ProjectCard({ project, index, onOpen }) {
  const poster = posterFor(project)
  const [src, setSrc] = useState(poster)
  const hasStore = Boolean(project.playStore || project.appStore)

  return (
    <button className="card" onClick={() => onOpen(project)} aria-haspopup="dialog">
      <span className="card__frame">
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
