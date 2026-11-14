import { useEffect, useRef, useState, type ReactNode } from 'react'
import IntroImage from './IntroImage'
import './intro.css'

/** A cut-out layer. `depth` is how far it drifts with scrolling (parallax); `float` adds the idle bob. */
function Layer({ file, pos, depth = 0.15, float = false, eager = false }: { file: string; pos: string; depth?: number; float?: boolean; eager?: boolean }) {
  return (
    <div className={`intro-layer ${pos}`} data-depth={depth}>
      <div className={float ? 'intro-float' : ''}>
        <IntroImage file={file} eager={eager} />
      </div>
    </div>
  )
}

function Section({ id, bg, bgAlt, eager, className = '', children }: { id: string; bg: string; bgAlt: string; eager?: boolean; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`intro-section ${className}`}>
      <div className="intro-bg" data-depth={0.06}>
        <IntroImage file={bg} alt={bgAlt} eager={eager} />
      </div>
      {children}
    </section>
  )
}

function Panel({ side, title, children }: { side: 'left' | 'right'; title: string; children: ReactNode }) {
  return (
    <div className={`intro-panel ${side}`}>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  )
}

interface Props { onStart: () => void; onCollection: () => void; onAbout: () => void }

// The intro: seven full-screen story sections, ending on the title and the Start mission button.
export default function Intro({ onStart, onCollection, onAbout }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Reveal each section's text as it enters the viewport
    const sections = [...root.querySelectorAll<HTMLElement>('.intro-section')]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in') }),
      { root, threshold: 0.35 },
    )
    sections.forEach((s) => io.observe(s))

    // Parallax: each layer drifts by its depth as its section passes the middle of the screen
    const layers = [...root.querySelectorAll<HTMLElement>('[data-depth]')].map((el) => ({
      el, depth: Number(el.dataset.depth), section: el.closest<HTMLElement>('.intro-section')!,
    }))
    let raf = 0
    const update = () => {
      raf = 0
      setScrolled(root.scrollTop > 40)
      if (reduce) return
      const h = root.clientHeight
      for (const l of layers) {
        const offset = l.section.offsetTop - root.scrollTop // 0 when the section fills the screen
        if (offset > h * 1.2 || offset < -h * 1.2) continue
        l.el.style.setProperty('--py', `${(offset * l.depth).toFixed(1)}px`)
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    root.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { io.disconnect(); root.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  const skip = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('intro-cta')?.scrollIntoView({ behavior: 'auto' })
    document.getElementById('intro-start')?.focus()
  }

  return (
    <div className="intro" ref={scroller}>
      <a className="intro-skip" href="#intro-cta" onClick={skip}>Skip intro</a>

      {/* 1. Hero: team brand */}
      <Section id="intro-hero" bg="hero-sky.jpg" bgAlt="The Milky Way over a grey, rocky lunar landscape with dark mountains on the horizon" eager className="hero in">
        <Layer file="hero-moon.png" pos="pos-tl corner" depth={0.1} eager />
        <Layer file="hero-mars.png" pos="pos-tr corner" depth={0.1} eager />
        <Layer file="hero-satellite.png" pos="pos-left-mid" depth={0.22} float eager />
        <Layer file="hero-dish.png" pos="pos-right-low" depth={0.14} eager />
        <Layer file="hero-astronaut.png" pos="pos-centre-low" depth={0.3} float eager />
        <div className="intro-brand">
          <span className="intro-glow" aria-hidden="true" />
          <p className="intro-logo">AETERNA</p>
          <p className="intro-tagline">Beyond time, beyond stars</p>
        </div>
        <div className={`intro-scroll-hint ${scrolled ? 'gone' : ''}`} aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </Section>

      {/* 2. Something is out there */}
      <Section id="intro-2" bg="s2-lander.jpg" bgAlt="An Apollo Lunar Module descent stage on the lunar surface, with a small rover in the distance">
        <p className="intro-kicker">Left Behind: Intro Story</p>
        <Panel side="right" title="Something is out there">
          Hundreds of man-made objects sit on the Moon and Mars. Rovers. Landers. Machines that once moved, listened and sent back data. Now they are still, and their reasons are unknown.
        </Panel>
      </Section>

      {/* 3. A question */}
      <Section id="intro-3" bg="s3-bg.jpg" bgAlt="Black space over a lunar horizon, with a lunar lander on the surface on the right">
        <Layer file="s3-astronaut.png" pos="pos-left-mid tall" depth={0.26} float />
        <Layer file="s3-probe.png" pos="pos-tr" depth={0.18} float />
        <Panel side="left" title="A question?">
          Why is a rover parked forever? Why is a lander still where it touched down? Were they forgotten, or did someone decide?
        </Panel>
      </Section>

      {/* 4. The clue */}
      <Section id="intro-4" bg="s4-earthrise.jpg" bgAlt="Earth rising over the lunar horizon, with a dusty track running toward it">
        <Layer file="s4-rocket.png" pos="pos-tl" depth={0.2} float />
        <Layer file="s4-capsule.png" pos="pos-tr" depth={0.2} float />
        <Layer file="s4-lander.png" pos="pos-left-ground" depth={0.12} />
        <Layer file="s4-rover.png" pos="pos-right-ground" depth={0.14} />
        <Panel side="left" title="The clue">
          Every space mission faced the same problem: a rocket can only carry so much. Crews had to choose what returned and what stayed. Some objects stayed on purpose, and a few are still working.
        </Panel>
      </Section>

      {/* 5. Your mission */}
      <Section id="intro-5" bg="s5-bg.jpg" bgAlt="Black space with Earth's curved horizon glowing blue along the bottom">
        <Layer file="s5-moon.png" pos="pos-left-high" depth={0.12} />
        <Layer file="s5-mars.png" pos="pos-centre-high big" depth={0.16} />
        <Layer file="s5-astronaut.png" pos="pos-right-mid tall" depth={0.28} float />
        <Panel side="left" title="Your mission!">
          You are a junior space archaeologist. Visit real sites, find each object, and work out why it was left there.
        </Panel>
      </Section>

      {/* 6. Objectives */}
      <Section id="intro-6" bg="s6-nebula.jpg" bgAlt="A deep blue nebula and star field, with Earth's horizon curving along the bottom" className="objectives">
        <Layer file="s6-craft-1.png" pos="pos-tl" depth={0.2} float />
        <Layer file="s6-craft-2.png" pos="pos-tr" depth={0.2} float />
        <Layer file="s6-craft-3.png" pos="pos-bl" depth={0.14} float />
        <Layer file="s6-craft-4.png" pos="pos-right-mid" depth={0.24} float />
        <Layer file="s6-craft-5.png" pos="pos-br" depth={0.18} float />
        <div className="intro-objectives">
          <h2>Objectives</h2>
          <ul>
            <li>Walk to your ship on Earth and take off.</li>
            <li>Fly the solar system (WASD, drag to look). Select the Moon or Mars, warp there, and land at a site.</li>
            <li>Explore on foot, find the equipment marked ??? on your map (press M for the full Moon and Mars map), then clean the dust and debris off its nameplate.</li>
          </ul>
        </div>
      </Section>

      {/* 7. Title and call to action */}
      <Section id="intro-cta" bg="s7-bg.jpg" bgAlt="A star field with Earth's glowing horizon across the top and the cratered lunar surface across the bottom" className="cta">
        <Layer file="s7-astronaut.png" pos="pos-bl tall" depth={0.22} float />
        <Layer file="s7-shuttle.png" pos="pos-br tall" depth={0.16} />
        <div className="intro-cta">
          <h1 aria-label="Left Behind">
            <svg className="intro-title arched" viewBox="0 0 1000 300" aria-hidden="true">
              <path id="intro-arc" d="M 30 262 Q 500 128 970 262" fill="none" />
              <text textAnchor="middle"><textPath href="#intro-arc" startOffset="50%">LEFT BEHIND</textPath></text>
            </svg>
            <svg className="intro-title flat" viewBox="0 0 1000 170" aria-hidden="true">
              <text x="500" y="135" textAnchor="middle">LEFT BEHIND</text>
            </svg>
          </h1>
          <p className="intro-premise">
            You are a young space archaeologist. Fly to the Moon and Mars, find the hardware NASA left behind, and work out why it was left.
          </p>
          <button id="intro-start" className="intro-start" onClick={onStart}>Start mission</button>
          <div className="intro-secondary">
            <button className="intro-ghost" onClick={onCollection}>Collection</button>
            <button className="intro-ghost" onClick={onAbout}>About</button>
          </div>
        </div>
      </Section>
    </div>
  )
}
