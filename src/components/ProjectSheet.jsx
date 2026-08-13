import { useEffect, useRef, useState } from 'react'

const FOCUSABLE = 'a[href], button, iframe, [tabindex]:not([tabindex="-1"])'

export default function ProjectSheet({ project, onClose }) {
  const panelRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const hasStore = Boolean(project.playStore || project.appStore)

  useEffect(() => {
    // Remember where focus came from so closing returns the user to the row
    // they opened, rather than dumping them at the top of the document.
    const opener = document.activeElement
    const panel = panelRef.current
    panel?.querySelector(FOCUSABLE)?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel) return

      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]

      // Wrap focus inside the dialog instead of letting it escape to the page
      // behind, which is still visible through the backdrop.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <div className="sheet" onClick={onClose} role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="sheet__panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <button className="sheet__close" onClick={onClose}>
          Close ✕
        </button>

        <h2 className="sheet__title">{project.title}</h2>

        {(project.youtube || !hasStore) && (
        <div className="media">
          {project.youtube ? (
            playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${project.youtube}?autoplay=1&rel=0`}
                title={`${project.title} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // Facade: a thumbnail until clicked, so YouTube's player never
              // loads (and sets nothing) for visitors who don't watch.
              <button className="media__play" onClick={() => setPlaying(true)}>
                <img
                  // maxres is true 16:9 but many uploads lack it. YouTube answers
                  // a missing size with a 404 whose BODY is a 120x90 grey
                  // placeholder, which the browser happily renders instead of
                  // firing onError — so detect that by natural size, not by error.
                  src={`https://i.ytimg.com/vi/${project.youtube}/maxresdefault.jpg`}
                  onLoad={(e) => {
                    if (e.currentTarget.naturalWidth < 200) {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${project.youtube}/sddefault.jpg`
                    }
                  }}
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${project.youtube}/sddefault.jpg`
                  }}
                  alt=""
                  loading="lazy"
                />
                <span className="media__badge" aria-hidden="true">
                  ▶
                </span>
                <span className="sr-only">Play {project.title} video on YouTube</span>
              </button>
            )
          ) : (
            <span className="label">Capture coming soon</span>
          )}
        </div>
        )}

        {hasStore && (
          <div className="stores">
            <span className="label">Live now</span>
            <div className="stores__links">
              {project.playStore && (
                <a className="store-btn" href={project.playStore} target="_blank" rel="noreferrer">
                  Google Play ↗
                </a>
              )}
              {project.appStore && (
                <a className="store-btn" href={project.appStore} target="_blank" rel="noreferrer">
                  App Store ↗
                </a>
              )}
            </div>
          </div>
        )}

        <p style={{ color: 'var(--muted)', margin: 0 }}>{project.blurb}</p>

        <div className="spec">
          <span className="label">Key features</span>
          <ul>
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="spec">
          <span className="label">Stack</span>
          <div className="chips">
            {project.skills.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {project.highlights && (
          <div className="spec">
            <span className="label">Highlights</span>
            <ul>
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
