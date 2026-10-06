import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import '../pressrun.css'

const base = `${import.meta.env.BASE_URL}press-run/`

// Five real jobs from the 2023 Henle portfolio. Images come from scripts/render-press-run.py.
const jobs = [
  {
    id: 'brigadoon',
    client: 'Marshall High School',
    title: 'Brigadoon',
    piece: 'Theater poster',
    blurb: 'A show poster has one job: stop a busy hallway. Deep navy, an illustrated Highland valley, and dates big enough to read from the end of the corridor.',
    pieces: ['Theater posters', 'Sport programs', 'Vinyl banners', 'Event tickets', 'Shirt (design only)'],
    page: 20,
    size: [1240, 854],
  },
  {
    id: 'county-fair',
    client: 'Lyon County Fair',
    title: 'Fair week, door to door',
    piece: 'EDDM schedule postcard',
    blurb: 'Every Door Direct Mail put the whole fair—grandstand, rodeo, auction, kids’ events—into mailboxes on selected routes. No mailing list required.',
    pieces: ['Schedule & events postcard', 'Every Door Direct Mail'],
    page: 6,
    size: [1400, 1013],
  },
  {
    id: 'farm-management',
    client: 'Northwestern Farm Management Co.',
    title: 'One company, six pieces',
    piece: 'Brand stationery system',
    blurb: 'Big sky, green rows, and one consistent mark across every piece a client touches—so the firm looks the same on a desk, in a folder, or in the mail.',
    pieces: ['Letterhead', '#10 envelope', 'Business card', 'Pocket folder', 'Postcard', '13 × 10 envelope'],
    page: 13,
    size: [1400, 877],
  },
  {
    id: 'fall-guide',
    client: 'City of Marshall',
    title: 'Fall, in full color',
    piece: 'Area community guide book',
    blurb: 'A seasonal guide for the whole town—cooking, football, driver education—behind a cover that puts every ink on the press to work.',
    pieces: ['Community guide book'],
    page: 18,
    size: [724, 1108],
  },
  {
    id: 'go-fish',
    client: 'United Way',
    title: 'Go Fish',
    piece: 'Children’s card deck',
    blurb: 'A full deck of illustrated counting cards—bright, numbered, and cut clean so small hands can actually play with them.',
    pieces: ['Go Fish cards'],
    page: 17,
    size: [1400, 505],
  },
]

// Where each plate starts before it is pulled into register (vw/vh, degrees, mm shown on the readout).
const plates = [
  { ink: 'c', name: 'Cyan', x: -11, y: -17, r: -8, mm: 3.20 },
  { ink: 'm', name: 'Magenta', x: 10, y: -14, r: 7, mm: 2.75 },
  { ink: 'y', name: 'Yellow', x: -8, y: 16, r: 6, mm: 4.10 },
  { ink: 'k', name: 'Black', x: 9, y: 14, r: -6, mm: 1.85 },
]

const clamp = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - (1 - t) ** 3

export default function PressRun() {
  const sceneRefs = useRef([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const update = () => {
      frame = 0
      let current = -1
      sceneRefs.current.forEach((scene, i) => {
        if (!scene) return
        const rect = scene.getBoundingClientRect()
        const travel = rect.height - window.innerHeight
        const progress = still ? 1 : clamp(-rect.top / travel)
        const p = easeOut(clamp(progress / 0.6))
        const d = clamp((progress - 0.64) / 0.18)
        scene.style.setProperty('--p', p.toFixed(4))
        scene.style.setProperty('--d', d.toFixed(4))
        scene.dataset.registered = p > 0.985 ? 'true' : 'false'
        scene.dataset.details = d > 0.5 ? 'true' : 'false'
        scene.querySelectorAll('[data-mm]').forEach((el) => {
          const mm = Number(el.dataset.mm) * (1 - p)
          el.textContent = mm < 0.005 ? '0.00 mm' : `${mm.toFixed(2)} mm`
        })
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) current = i
      })
      setActive(current)
    }

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const scrollToJob = (i) => sceneRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="run">
      <SEO title="The Press Run — Henle Portfolio" description="Five real Henle print jobs, pulled into register one plate at a time." />

      <section className="run-intro">
        <div className="run-intro__inks" aria-hidden="true">
          <i className="ink ink--c" /><i className="ink ink--m" /><i className="ink ink--y" /><i className="ink ink--k" />
        </div>
        <div className="shell run-intro__copy">
          <span className="run-label">Henle portfolio · Concept B</span>
          <h1><span>The</span> <span>Press</span> <span>Run.</span></h1>
          <p>Every full-color piece starts as four separate plates—cyan, magenta, yellow, and black—that have to land on the sheet within a hair of each other. Here are five real Henle jobs. Scroll, and run them through.</p>
          <button type="button" className="run-cue" onClick={() => scrollToJob(0)}>
            <ArrowDown size={16} /> Start the press
          </button>
        </div>
        <div className="run-intro__queue" aria-label="Jobs on this run">
          {jobs.map((job, i) => (
            <button type="button" key={job.id} onClick={() => scrollToJob(i)}>
              <b>{String(i + 1).padStart(2, '0')}</b><span>{job.client}</span><small>{job.piece}</small>
            </button>
          ))}
        </div>
      </section>

      <nav className={`run-rail ${active >= 0 ? 'is-visible' : ''}`} aria-label="Jump to job">
        {jobs.map((job, i) => (
          <button type="button" key={job.id} className={active === i ? 'is-active' : ''} aria-current={active === i} onClick={() => scrollToJob(i)} aria-label={`Job ${i + 1}: ${job.client}`}>
            <span>{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </nav>

      {jobs.map((job, i) => (
        <section
          key={job.id}
          className={`run-scene run-scene--${plates[i % 4].ink}`}
          ref={(el) => { sceneRefs.current[i] = el }}
          aria-labelledby={`job-${job.id}`}
          data-registered="false"
          data-details="false"
          style={{ '--ratio': job.size[0] / job.size[1] }}
        >
          <div className="run-scene__pin">
            <span className="run-scene__ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>

            <div className="run-scene__info">
              <span className="run-label">Job {String(i + 1).padStart(2, '0')} / {String(jobs.length).padStart(2, '0')} · {job.piece}</span>
              <h2 id={`job-${job.id}`}><small>{job.client}</small>{job.title}</h2>

              <div className="run-swap">
              <div className="run-readout">
              <ul className="run-plates" aria-label="Plate registration">
                {plates.map((plate) => (
                  <li key={plate.ink} className={`run-plates__row run-plates__row--${plate.ink}`}>
                    <i aria-hidden="true" />
                    <span>{plate.name}</span>
                    <b data-mm={plate.mm}>{plate.mm.toFixed(2)} mm</b>
                    <Check className="run-plates__ok" aria-hidden="true" />
                  </li>
                ))}
              </ul>
              <p className="run-status">
                <span className="run-status__off">Pulling plates into register…</span>
                <span className="run-status__on"><Check size={15} /> In register</span>
              </p>
              </div>

              <div className="run-details">
                <p>{job.blurb}</p>
                <ul>{job.pieces.map((piece) => <li key={piece}>{piece}</li>)}</ul>
                <div className="run-details__actions">
                  <Link className="button" to={`/quote?project=${encodeURIComponent(`something like the ${job.client} ${job.piece.toLowerCase()}`)}`}>Quote one like it <ArrowUpRight /></Link>
                  <Link className="run-link" to={`/portfolio?page=${job.page}`}>See it in the portfolio <ArrowRight /></Link>
                </div>
              </div>
              </div>
            </div>

            <div className="run-stage">
              <div className="run-piece">
                {plates.map((plate) => (
                  <div
                    key={plate.ink}
                    className={`run-plate run-plate--${plate.ink}`}
                    style={{ '--x': `${plate.x}vw`, '--y': `${plate.y}vh`, '--r': `${plate.r}deg` }}
                    aria-hidden="true"
                  >
                    <img src={`${base}${job.id}-${plate.ink}.webp`} alt="" width={job.size[0]} height={job.size[1]} loading={i ? 'lazy' : 'eager'} draggable="false" />
                    <span className="run-plate__tab">{plate.name}</span>
                  </div>
                ))}
                <img className="run-piece__final" src={`${base}${job.id}.webp`} alt={`${job.client} ${job.piece.toLowerCase()}`} width={job.size[0]} height={job.size[1]} loading={i ? 'lazy' : 'eager'} />
                <i className="run-crop run-crop--tl" /><i className="run-crop run-crop--tr" /><i className="run-crop run-crop--bl" /><i className="run-crop run-crop--br" />
                <span className="run-stamp" aria-hidden="true"><b>In register</b><small>Henle · Marshall MN</small></span>
              </div>
            </div>

            <div className="run-colorbar" aria-hidden="true">
              {['c', 'm', 'y', 'k'].flatMap((ink, n) => [25, 50, 75, 100].map((tint, t) => (
                <i key={`${ink}${tint}`} className={`run-colorbar__${ink}`} style={{ '--tint': tint / 100, '--i': n * 4 + t }} />
              )))}
            </div>
          </div>
        </section>
      ))}

      <section className="run-outro">
        <div className="run-intro__inks run-intro__inks--set" aria-hidden="true">
          <i className="ink ink--c" /><i className="ink ink--m" /><i className="ink ink--y" /><i className="ink ink--k" />
        </div>
        <div className="shell run-outro__copy">
          <span className="run-label">Next on press</span>
          <h2>Yours.</h2>
          <p>Bring a file, a sketch, or just the idea. We’ll match the stock, the finish, and the plates—and send it out in register.</p>
          <div className="run-outro__actions">
            <Link className="button" to="/quote">Start your project <ArrowUpRight /></Link>
            <Link className="run-link" to="/portfolio">Browse the full portfolio <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
