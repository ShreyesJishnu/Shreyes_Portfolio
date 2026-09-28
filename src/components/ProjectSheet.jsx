import { useEffect, useRef } from 'react'
import { posterFor } from '../data/media'
const FOCUSABLE = 'a[href], button, iframe, [tabindex]:not([tabindex="-1"])'

export default function ProjectSheet({ project, onClose }) {
  const panelRef = useRef(null)
  const hasStore = Boolean(project.playStore || project.appStore)
  // A project's own page is either shipped alongside this one or hosted
  // elsewhere. A relative path takes BASE_URL so it resolves under the /repo/
  // subpath on Pages; an absolute URL is already complete and prefixing it
  // would produce /repo/https://…
  const site = project.site
    ? /^https?:\/\//.test(project.site)
      ? project.site
      : `${import.meta.env.BASE_URL}${project.site}`
    : null
  const poster = posterFor(project)

  useEffect(() => {
    // Remember where focus came from so closing returns the user to the row
    // they opened, rather than dumping them at the top of the document.
    const opener = document.activeElement
    const panel = panelRef.current
    panel?.querySelector(FOCUSABLE)?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        // the console sits above the sheet; let the topmost overlay take the
        // key rather than collapsing both at once
        if (document.querySelector('.console')) return
        return onClose()
      }
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
    <div className="sheet" onClick={onClose}>
      <div
        className="sheet__panel"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <button className="sheet__close" onClick={onClose}>
          Close ✕
        </button>

        <h2 className="sheet__title">{project.title}</h2>

        {(project.youtube || poster || !(hasStore || site)) && (
          <div className="media">
            {project.youtube ? (
              // Loads straight away: opening a project is itself the intent to
              // watch, so a facade would only add a second click.
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${project.youtube}?autoplay=1&rel=0`}
                title={`${project.title} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : poster ? (
              // the live titles have no video, so the store capture stands in
              <img src={poster} alt={`${project.title} gameplay`} loading="lazy" />
            ) : (
              <span className="label">Capture coming soon</span>
            )}
          </div>
        )}

        {site && (
          <div className="stores">
            <span className="label">Live now</span>
            <div className="stores__links">
              <a className="store-btn" href={site} target="_blank" rel="noreferrer">
                Open the site ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            {project.siteNote && <p className="sheet__blurb">{project.siteNote}</p>}
          </div>
        )}

        {hasStore && (
          <div className="stores">
            <span className="label">Live now</span>
            <div className="stores__links">
              {project.playStore && (
                <a className="store-btn" href={project.playStore} target="_blank" rel="noreferrer">
                  Google Play ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {project.appStore && (
                <a className="store-btn" href={project.appStore} target="_blank" rel="noreferrer">
                  App Store ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        )}

        <p className="sheet__blurb">{project.blurb}</p>

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
