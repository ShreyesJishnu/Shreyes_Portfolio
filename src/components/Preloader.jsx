import { useEffect, useState } from 'react'

// Counts to 100 while fonts + first frame settle, then fades out.
export default function Preloader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let raf
    const start = performance.now()
    const DURATION = 1400

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease-out so it decelerates into 100 instead of running linear
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => setDone(true), 250)
    }
    raf = requestAnimationFrame(tick)

    // rAF is throttled in background tabs, so guarantee the curtain lifts on
    // wall-clock time too — otherwise a tab loaded in the background can be
    // returned to with the preloader still sitting at 0%.
    const safety = setTimeout(() => {
      setPct(100)
      setDone(true)
    }, DURATION + 600)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = done ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [done])

  return (
    <div className="preloader" data-done={done} aria-hidden={done}>
      <p className="preloader__name">SHREYES JISHNU</p>
      <div className="preloader__rule">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p className="preloader__pct">{String(pct).padStart(3, '0')}%</p>
    </div>
  )
}
