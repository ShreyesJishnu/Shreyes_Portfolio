import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Preloader from './components/Preloader'
import ProjectSheet from './components/ProjectSheet'

// Three.js is ~2/3 of the bundle. Splitting it out lets the type and content
// paint immediately while the field streams in behind the preloader.
const FieldBackground = lazy(() => import('./scene/FieldBackground'))
import { elementConfigs, actOrder } from './scene/elementConfigs'
import { projects } from './data/projects'

const stats = [
  { num: '6M+ Triangles', cap: 'Ray-traced @ 60 FPS' },
  { num: '25→60 FPS', cap: 'Optimization on Meta Quest 3' },
  { num: '03', cap: 'Shipped projects' },
  { num: '05', cap: 'VR modules built' },
]

export default function App() {
  const [active, setActive] = useState('fire')
  const [open, setOpen] = useState(null)
  const energy = useRef(0)
  const actRefs = useRef({})

  // Which act is in the middle of the viewport drives the whole palette.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.dataset.element)
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    Object.values(actRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const c = elementConfigs[active]
    document.documentElement.style.setProperty('--accent', c.accent)
    // text uses the opposing hue so it reads against the field instead of
    // dissolving into it
    document.documentElement.style.setProperty('--text-accent', c.textAccent)
  }, [active])

  // Scroll velocity feeds the shader's turbulence — the phone's replacement
  // for cursor bending, and a free second layer of life on desktop.
  useEffect(() => {
    let last = window.scrollY
    let raf
    const onScroll = () => {
      const now = window.scrollY
      energy.current = Math.min(1, energy.current + Math.abs(now - last) / 900)
      last = now
    }
    const decay = () => {
      energy.current *= 0.94
      raf = requestAnimationFrame(decay)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(decay)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <Preloader />
      <Suspense fallback={null}>
        <FieldBackground config={elementConfigs[active]} energy={energy} />
      </Suspense>
      <div className="scrim" aria-hidden="true" />

      <main className="shell">
        {/* observed like an act, so scrolling back to the top restores fire
            instead of stranding the palette on whichever act fired last */}
        <header
          className="hero"
          data-element="fire"
          ref={(node) => (actRefs.current.hero = node)}
        >
          <div className="hero__top">
            <span className="label">Shreyes Jishnu</span>
            <span className="label">Real-time graphics / gameplay</span>
          </div>

          <div>
            <h1 className="hero__title">
              Worlds that hold up <span className="accent">at 60 fps or more</span>
            </h1>
            <p className="hero__sub">
              I build applications that render real-time graphics, VR, 3D and mobile gameplay
              systems: games, graphics, ray-tracers, hand-tracked prototypes, and physics sandboxes
              that survive real hardware.
            </p>
          </div>
        </header>

        <section className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.cap}>
              <span className="stat__num">{s.num}</span>
              <span className="stat__cap label">{s.cap}</span>
            </div>
          ))}
        </section>

        {/* About carries the fire element; the three project acts follow */}
        <section
          className="about"
          data-element="fire"
          ref={(node) => (actRefs.current.about = node)}
        >
          <div>
            <span className="label accent">// 01 — Who’s building this</span>
            <p className="about__lead">
              I’m Shreyes, I build the parts of a game you feel rather than see.
            </p>
            <p>
              Most of my work sits close to the metal: two mobile applications shipped and live on the Play Store and App Store, alongside hand-tracked VR prototypes where a dropped frame is nausea rather than a bug. In the middle of that, I’ve built GPU ray tracers pushing 6M+ triangles at 60 FPS, and physics sandboxes in both Unity and Unreal’s Chaos. Unity and C# are home; Unreal, C++, GLSL and Blender are where I go when the problem asks for them. I also build AI-assisted development workflows to accelerate prototyping, iteration, tooling and content pipelines without losing control of the underlying systems.
            </p>

            <div className="about__meta">
              <div>
                <span className="label">Currently</span>
                <strong>Blacklight Studio Works</strong>
              </div>
              <div>
                <span className="label">Based in</span>
                <strong>Noida, UP, India</strong>
              </div>
              <div>
                <span className="label">Education</span>
                <strong>M.Sc. Game &amp; Media Technology, Utrecht University, 2024</strong>
              </div>
            </div>
          </div>
        </section>

        {actOrder.map((el) => {
          const config = elementConfigs[el]
          const items = projects.filter((p) => p.element === el)
          return (
            <section
              className="act"
              key={el}
              data-element={el}
              ref={(node) => (actRefs.current[el] = node)}
            >
              <div className="act__head">
                <span className="label accent">// {config.index}</span>
                <h2 className="act__title">{config.title}</h2>
                <p className="act__note">{config.note}</p>
              </div>

              {items.map((p, i) => (
                <button
                  className="row"
                  key={p.slug}
                  onClick={() => setOpen(p)}
                  aria-haspopup="dialog"
                >
                  <span className="row__idx">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="row__title">{p.title}</h3>
                  <span className="row__meta">{p.skills.slice(0, 2).join(' / ')}</span>
                </button>
              ))}
            </section>
          )
        })}

        <footer className="contact">
          <span className="label">Get in touch</span>
          <p className="contact__lead">
            Got something ambitious? <span className="accent">Let’s build it.</span>
          </p>
          <div className="links">
            <a className="link" href="mailto:shreyesjishnu@gmail.com">
              Email
            </a>
            <a className="link" href={`${import.meta.env.BASE_URL}resume.pdf`} download>
              Resume
            </a>
            <a className="link" href="https://www.linkedin.com/in/shreyes-jishnu" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="link" href="https://github.com/ShreyesJishnu" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </footer>
      </main>

      {open && <ProjectSheet project={open} onClose={() => setOpen(null)} />}
    </>
  )
}
