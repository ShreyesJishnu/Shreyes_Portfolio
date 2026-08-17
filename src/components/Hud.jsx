import { useEffect, useState } from 'react'
import { STAR_COUNT } from '../scene/budget'

const NAME = 'Shreyes Jishnu'

// An engine-style readout: real numbers from the running page, not decoration.
// Always on — it carries the name while the hero is in view, then hands over to
// the current chapter once you start moving through the work.
export default function Hud({ act, actIndex }) {
  const [fps, setFps] = useState(0)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [atHero, setAtHero] = useState(true)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf

    const loop = (now) => {
      frames += 1
      // sample on a window rather than per-frame so the number is readable
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onScroll = () => setAtHero(window.scrollY < window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`' || e.key === '~') {
        // ignore while typing, in case a form ever lands on the page
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        setConsoleOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setConsoleOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const stars = STAR_COUNT
  const heading = atHero ? NAME : act

  return (
    <>
      <div className="hud-title" aria-hidden="true">
        {!atHero && <span className="hud-title__idx">{actIndex}</span>}
        {/* keyed so each change replays the entry animation */}
        <span className="hud-title__name" key={heading}>
          {heading}
        </span>
      </div>

      <div className="hud-stack">
        <div className="hud">
          <div className="hud__stats" aria-hidden="true">
            <span className="hud__row">
              <span>FPS</span>
              <b>{fps || '--'}</b>
            </span>
            <span className="hud__row">
              <span>Stars</span>
              <b>{stars}</b>
            </span>
          </div>

          <button
            className="hud__play"
            onClick={() => setConsoleOpen((v) => !v)}
            aria-expanded={consoleOpen}
          >
            <span className="hud__playIcon" aria-hidden="true">
              ▶
            </span>
            <span className="hud__playLabel">Play</span>
            <span className="hud__playKey" aria-hidden="true">
              `
            </span>
          </button>
        </div>
      </div>

      {consoleOpen && (
        <div className="console" role="dialog" aria-label="Console">
          <div className="console__bar">
            <span>CONSOLE</span>
            <button className="console__close" onClick={() => setConsoleOpen(false)}>
              ESC
            </button>
          </div>
          <div className="console__body">
            {/* placeholder: a small playable game goes here */}
            <p className="console__line">&gt; loading module...</p>
            <p className="console__line console__line--dim">
              &gt; MINI-GAME — not implemented yet
            </p>
            <p className="console__line console__line--dim">&gt; check back soon</p>
          </div>
        </div>
      )}
    </>
  )
}
