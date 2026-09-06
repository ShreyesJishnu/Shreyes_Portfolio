import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Preloader from './components/Preloader'
import ProjectSheet from './components/ProjectSheet'
import CardRail from './components/CardRail'
import Hud from './components/Hud'
import { useVisited } from './data/visited'
import { useTheme } from './theme'

// three is the whole 3D layer; lazy so type and content paint first
const IsoWorld = lazy(() => import('./scene/IsoWorld'))
import { elementConfigs, actOrder } from './scene/elementConfigs'
import { projects } from './data/projects'

// every chapter the HUD map plots, in reading order
const hudSections = ['fire', ...actOrder].map((key) => ({
  key,
  index: elementConfigs[key].index,
  title: elementConfigs[key].title,
}))

const stats = [
  { num: '6M+ Triangles', cap: 'Ray-traced @ 60 FPS' },
  { num: '25→60 FPS', cap: 'Optimization on Meta Quest 3' },
  { num: '03', cap: 'Shipped projects' },
  { num: '05', cap: 'VR modules built' },
]

export default function App() {
  const [active, setActive] = useState('fire')
  const [open, setOpen] = useState(null)
  const { visited, markVisited } = useVisited()

  // opening a project is what counts as exploring it
  const openProject = (p) => {
    markVisited(p.slug)
    setOpen(p)
  }


  const { theme, toggle: toggleTheme } = useTheme()
  const actRefs = useRef({})
  // observed alongside the acts, but kept out of actRefs so it never becomes a marker
  const tailRef = useRef(null)

  // Which act is in the middle of the viewport drives the whole palette. The
  // banner is a separate question: the footer borrows air's colours so the world
  // keeps a palette down there, but calling that chapter "VR Projects" is wrong,
  // so a section can carry its own label.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          setActive(e.target.dataset.element)
          setChapter(
            e.target.dataset.chapter
              ? { title: e.target.dataset.chapter, index: e.target.dataset.chapterIndex }
              : null
          )
        })
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    Object.values(actRefs.current).forEach((el) => el && observer.observe(el))
    if (tailRef.current) observer.observe(tailRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const c = elementConfigs[active]
    // the dark pair is tuned against black; on paper the same hues have to be
    // darkened or they fail contrast outright
    const light = theme === 'light'
    document.documentElement.style.setProperty('--accent', light ? c.accentLight : c.accent)
    // text uses the opposing hue so it reads against the field instead of
    // dissolving into it
    document.documentElement.style.setProperty(
      '--text-accent',
      light ? c.textAccentLight : c.textAccent
    )
  }, [active, theme])

  // Where each chapter sits along the page, so the world can plant a marker at
  // the same point the cube reaches it.
  const [markers, setMarkers] = useState([])
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      setMarkers(
        hudSections
          .map(({ key, title }) => {
            const el = actRefs.current[key]
            return el ? { key, label: title, progress: el.offsetTop / max } : null
          })
          .filter(Boolean)
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const [paused, setPaused] = useState(false)
  // a section can label the HUD without owning an element of its own
  const [chapter, setChapter] = useState(null)

  return (
    <>
      <Preloader />
      <Suspense fallback={null}>
        <IsoWorld
          accent={elementConfigs[active].accent}
          element={active}
          markers={markers}
          // chapters with a card grid dim the particles behind it
          dim={active === 'fire' ? 1 : 0.85}
          paused={paused}
          theme={theme}
        />
      </Suspense>
      <div className="scrim" aria-hidden="true" />

      {/* first in the DOM as well as at the top of the screen: getting in touch
          should not cost a scroll to the bottom, or a tab through every card */}
      <a className="hud-contact" href="#contact">
        <span className="hud-contact__label">Get in touch</span>
        <span className="hud-contact__mark" aria-hidden="true">
          ↓
        </span>
      </a>

      <main className="shell">
        {/* observed like an act, so scrolling back to the top restores fire
            instead of stranding the palette on whichever act fired last */}
        <header
          className="hero"
          data-element="fire"
          ref={(node) => (actRefs.current.hero = node)}
        >
          <div>
            {/* the HUD carries the name visually; keep it in the document too */}
            <span className="sr-only">Shreyes Jishnu — real-time graphics and gameplay engineer</span>
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
                {/* the HUD banner carries the chapter visually; the document
                    still needs the heading to keep its outline */}
                <h2 className="sr-only">{config.title}</h2>
                <p className="act__note">{config.note}</p>
              </div>

              {/* three across, the rest a wheel away */}
              <CardRail
                label={config.title}
                items={items}
                visited={visited}
                onOpen={openProject}
                paused={paused}
              />
            </section>
          )
        })}

        <footer
          className="contact"
          id="contact"
          data-element="air"
          data-chapter="Get in touch"
          data-chapter-index="05"
          ref={tailRef}
        >
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
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="link" href="https://github.com/ShreyesJishnu" target="_blank" rel="noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </footer>
      </main>

      <Hud
        act={chapter?.title ?? elementConfigs[active].title}
        actIndex={chapter?.index ?? elementConfigs[active].index}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {open && <ProjectSheet project={open} onClose={() => setOpen(null)} />}
    </>
  )
}
