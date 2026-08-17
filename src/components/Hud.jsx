import { useEffect, useRef, useState } from 'react'
import { STAR_COUNT } from '../scene/budget'

const NAME = 'Shreyes Jishnu'

// The console is a shell waiting on a game. Shipping "not implemented yet" to
// visitors reads worse than shipping nothing, so the entry points stay hidden
// until there is something behind them — flip this to true once there is.
const CONSOLE_ENABLED = false

// An engine-style readout: real numbers from the running page, not decoration.
// Always on — it carries the name while the hero is in view, then hands over to
// the current chapter once you start moving through the work.
export default function Hud({ act, actIndex, paused, onTogglePause }) {
  const [fps, setFps] = useState(0)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [atHero, setAtHero] = useState(true)
  const consoleRef = useRef(null)

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
    // No console, no shortcut: a bare single-character key with nothing behind
    // it is a WCAG 2.1.4 liability for no benefit.
    if (!CONSOLE_ENABLED) return

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

  // Opening it from the keyboard should land the caret inside it, not leave
  // focus behind on the button that is now covered.
  useEffect(() => {
    if (consoleOpen) consoleRef.current?.focus()
  }, [consoleOpen])

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
              <b>{STAR_COUNT}</b>
            </span>
          </div>

          {CONSOLE_ENABLED && (
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
          )}
        </div>

        {/* Sits outside .hud so it survives the phone breakpoint that hides the
            stats — the one control here that every visitor must be able to
            reach (WCAG 2.2.2). */}
        <button
          className="hud__motion"
          onClick={onTogglePause}
          aria-pressed={paused}
          title={paused ? 'Resume motion' : 'Pause motion'}
        >
          <span className="hud__motionIcon" aria-hidden="true">
            {paused ? '▶' : '❚❚'}
          </span>
          <span className="hud__motionLabel">{paused ? 'Resume motion' : 'Pause motion'}</span>
        </button>
      </div>

      {CONSOLE_ENABLED && consoleOpen && (
        <div
          className="console"
          ref={consoleRef}
          tabIndex={-1}
          role="region"
          aria-label="Console"
        >
          <div className="console__bar">
            <span>CONSOLE</span>
            <button className="console__close" onClick={() => setConsoleOpen(false)}>
              ESC
            </button>
          </div>
          <div className="console__body">
            <p className="console__line">&gt; loading module...</p>
          </div>
        </div>
      )}
    </>
  )
}
