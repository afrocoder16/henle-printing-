import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Phone, Quote as QuoteIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import CountUp from '../components/CountUp'
import SEO from '../components/SEO'
import RegistrationMark from '../components/RegistrationMark'
import { crew, crewGroups, eras, heritage, mike, promises, timeline } from '../aboutData'
import '../about.css'

// A photo with a graceful stand-in: a red-backdrop monogram until the real portrait file exists.
function Portrait({ src, name, className = '', position }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return (
      <div className={`ab-portrait ab-portrait--empty ${className}`} role="img" aria-label={`Photo of ${name} coming soon`}>
        <span aria-hidden="true">{name.replace(/^The /, '').charAt(0)}</span>
        <small>Photo coming soon</small>
      </div>
    )
  }
  return <img className={`ab-portrait ${className}`} src={src} alt={name} loading="lazy" onError={() => setFailed(true)} style={position ? { objectPosition: position } : undefined} />
}

function ArchivePhoto({ entry }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="ab-archive ab-archive--empty" role="img" aria-label={`Archive photo placeholder: ${entry.caption}`}>
        <span>Photo coming soon</span><small>public/history/{entry.file}</small>
      </div>
    )
  }
  return (
    <figure className="ab-archive">
      <img src={entry.photo} alt={entry.photoAlt} loading="lazy" onError={() => setFailed(true)} />
      <figcaption>{entry.caption}</figcaption>
    </figure>
  )
}

// Adds .is-in to each entry as it scrolls into view (everything shows at once when motion is reduced).
function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const items = root.querySelectorAll('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' })
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const H_PIXELS = ['1000001', '1000001', '1000001', '1111111', '1000001', '1000001', '1000001']

function EraSpecimen({ id }) {
  if (id === 'digital') {
    return (
      <svg className="ab-spec ab-spec--digital" viewBox="0 0 7 7" role="img" aria-label="The letter H built from square pixels">
        {H_PIXELS.flatMap((row, y) => [...row].map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width=".92" height=".92" /> : null)))}
      </svg>
    )
  }
  return <span className={`ab-spec ab-spec--${id}`} role="img" aria-label="The letter H">H</span>
}

function ThenAndNow() {
  const [active, setActive] = useState(0)
  const era = eras[active]

  return (
    <div className="ab-eras">
      <div className="ab-eras__stage" aria-hidden="false">
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
          <filter id="ink-squash"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="7" /></filter>
        </svg>
        <div className={`ab-eras__glyph ab-eras__glyph--${era.id}`} key={era.id}>
          <EraSpecimen id={era.id} />
        </div>
        <span className="ab-eras__tool">{era.tool}</span>
      </div>
      <div className="ab-eras__copy">
        <div className="ab-eras__tabs" role="tablist" aria-label="Eras of printing">
          {eras.map((e, i) => (
            <button type="button" role="tab" id={`era-tab-${e.id}`} aria-selected={i === active} aria-controls="era-panel" key={e.id} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
              <b>{String(i + 1).padStart(2, '0')}</b><span>{e.name}</span>
            </button>
          ))}
        </div>
        <div className="ab-eras__panel" id="era-panel" role="tabpanel" aria-labelledby={`era-tab-${era.id}`} key={era.id}>
          <span className="ab-label">{era.years}</span>
          <h3>{era.name}</h3>
          <p>{era.text}</p>
          <small>{era.source}</small>
        </div>
      </div>
    </div>
  )
}

function MeetMike() {
  const [active, setActive] = useState(0)
  const quote = mike.quotes[active]

  return (
    <section className="ab-mike section" aria-labelledby="mike-title">
      <div className="shell ab-mike__grid">
        <figure className="ab-mike__photo">
          <img src={mike.photo} alt="Mike Henle in a blue Henle Printing polo, standing in front of framed family photographs" loading="lazy" />
          <figcaption><b>Mike Henle</b> Third-generation Henle · at the shop since {mike.started}, when he was {mike.startedAge}</figcaption>
        </figure>
        <div className="ab-mike__copy">
          <span className="ab-label">Meet Mike</span>
          <h2 id="mike-title">“What he loves most about working at Henle Printing is the customers.”</h2>
          <p className="ab-mike__lede">Mike Henle owned and led Henle Printing Company until he passed it to Charlie Stark in early 2020. His own words about the work still describe the shop.</p>
          <div className="ab-mike__tabs" role="tablist" aria-label="Mike Henle in his own words">
            {mike.quotes.map((q, i) => (
              <button type="button" role="tab" id={`mike-tab-${q.id}`} aria-selected={i === active} aria-controls="mike-panel" key={q.id} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>{q.label}</button>
            ))}
          </div>
          <blockquote className="ab-mike__quote" id="mike-panel" role="tabpanel" aria-labelledby={`mike-tab-${quote.id}`} key={quote.id}>
            <QuoteIcon aria-hidden="true" />
            <p>{quote.text}</p>
            <footer>Mike Henle · {quote.source}</footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

function Crew() {
  const [group, setGroup] = useState('All')
  const people = group === 'All' ? crew : crew.filter((p) => p.group === group)
  const bySince = [...crew].sort((a, b) => a.since - b.since)
  const min = 1978
  const max = 2022

  return (
    <section className="ab-crew section" id="crew" aria-labelledby="crew-title">
      <div className="shell">
        <div className="section-heading reveal">
          <div><span className="eyebrow">The crew</span><h2 id="crew-title">The people behind every job.</h2></div>
          <p>“The people behind Henle Printing Company make us successful.” Meet the faces you’ll see at the counter, on the press, and at the designer’s desk.</p>
        </div>

        <div className="ab-ruler" role="img" aria-label={`When the crew joined Henle: ${crew.map((p) => `${p.name} ${p.since}`).join(', ')}`}>
          <div className="ab-ruler__line" />
          {[1980, 1990, 2000, 2010, 2020].map((y) => (
            <span key={y} className="ab-ruler__tick" style={{ left: `${((y - min) / (max - min)) * 100}%` }}>{y}</span>
          ))}
          {bySince.map((p, i) => (
            <span key={p.id} className={`ab-ruler__dot ${group === 'All' || p.group === group ? 'is-on' : ''}`} style={{ left: `${((p.since - min) / (max - min)) * 100}%`, '--lift': `${bySince.slice(0, i).filter((q) => p.since - q.since < 5).length * 26}px` }}>
              <i />
              <b>{p.name.split(' ')[0]}</b>
            </span>
          ))}
        </div>

        <div className="filter-row" role="group" aria-label="Filter the crew">
          {crewGroups.map((g) => (
            <button type="button" key={g} className={group === g ? 'active' : ''} aria-pressed={group === g} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>

        <ul className="ab-crew__grid">
          {people.map((person) => (
            <li key={person.id}>
              <article className="ab-card">
                <div className="ab-card__photo">
                  <Portrait src={`${import.meta.env.BASE_URL}team/${person.file}`} name={person.name} />
                  <span className="ab-card__since">{person.sinceLabel || `Since ${person.since}`}</span>
                </div>
                <div className="ab-card__body">
                  <h3>{person.name}</h3>
                  <b>{person.role}</b>
                  <p>{person.bio}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="ab-crew__note">Roster from Henle’s Facebook team photo and the Marshall Independent. Portraits arrive as the crew’s photos are collected.</p>
      </div>
    </section>
  )
}

export default function About() {
  const timelineRef = useRef(null)
  useReveal(timelineRef)

  return (
    <div className="ab">
      <SEO
        title="About Henle Printing: Three Generations in Marshall, MN"
        description="Making first impressions for three generations. The Henle family’s printing story began in Lyon County in 1926, and the crew in Marshall still treats every job like the first."
        path="/about"
      />

      <section className="ab-hero">
        <div className="ab-hero__dots" aria-hidden="true" />
        <div className="shell ab-hero__grid">
          <div className="ab-hero__copy reveal">
            <span className="eyebrow eyebrow--light">About Henle Printing Company</span>
            <h1>Making first impressions for <em>three generations.</em></h1>
            <p>A Marshall printing family since 1926, and a crew that still treats every job like it’s the first.</p>
            <div className="ab-hero__actions">
              <Link className="button button--paper" to="/quote">Start a project <ArrowUpRight /></Link>
              <a className="ab-hero__link" href="#story">Read the story <ArrowRight size={16} /></a>
            </div>
          </div>
          <div className="ab-hero__wall reveal reveal--delay" aria-hidden="true">
            <img className="ab-print ab-print--1" src={timeline.find((t) => t.id === 'main-street').photo} alt="" />
            <img className="ab-print ab-print--2" src={timeline.find((t) => t.id === 'linotype').photo} alt="" />
            <img className="ab-print ab-print--3" src={timeline.find((t) => t.id === '1950s').photo} alt="" />
            <RegistrationMark className="ab-hero__mark" />
          </div>
        </div>
        <div className="color-bar" aria-hidden="true"><i /><i /><i /><i /></div>
      </section>

      <section className="ab-stats" aria-label="Henle at a glance">
        <div className="shell ab-stats__grid">
          <div><CountUp start={1900} end={1926} duration={2400} label="1926" /><span>The Henle family’s printing story begins</span></div>
          <div><CountUp end={3} duration={1400} label="3" /><span>Generations of Henle printers</span></div>
          <div><CountUp start={1950} end={1980} duration={2400} label="1980" /><span>Mike and Marc join the shop</span></div>
          <div><CountUp end={179} duration={2400} suffix="+" label="179 plus" /><span>Years of combined crew experience (2018)</span></div>
        </div>
      </section>

      <section className="ab-story section" id="story" ref={timelineRef} aria-labelledby="story-title">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">The Henle story</span><h2 id="story-title">From hot metal to high speed inkjet.</h2></div>
            <p>Almost a century of Marshall printing, told from the family’s own posts and the local paper.</p>
          </div>
          <ol className="ab-timeline">
            {timeline.map((entry, i) => (
              <li key={entry.id} className={`ab-entry ${i % 2 ? 'ab-entry--right' : ''} ${entry.photo ? 'ab-entry--photo' : ''}`} data-reveal>
                <span className="ab-entry__node" aria-hidden="true"><i /></span>
                <div className="ab-entry__card">
                  <span className="ab-label">{entry.year}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.text}</p>
                  {entry.link && <Link className="text-link" to={entry.link.to}>{entry.link.label} <ArrowRight /></Link>}
                  <small>{entry.source}</small>
                </div>
                {entry.photo && <ArchivePhoto entry={entry} />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <MeetMike />

      <section className="ab-gens section" aria-labelledby="gens-title">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">Three generations</span><h2 id="gens-title">One family. One trade.</h2></div>
            <p>From the Monthly Magnet to the J-Press, the Henle name has been on Lyon County print for nearly a century.</p>
          </div>
          <ul className="ab-gens__row">
            {heritage.map((person, i) => (
              <li key={person.id} className={`ab-gens__item ab-gens__item--${i + 1}`}>
                <Portrait src={person.photo} name={person.name} position={person.position} className="ab-gens__photo" />
                <span className="ab-label">{person.generation}</span>
                <h3>{person.name}</h3>
                <p>{person.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ab-then section" aria-labelledby="then-title">
        <div className="shell">
          <div className="ab-then__head reveal">
            <span className="eyebrow eyebrow--light">Printing, then and now</span>
            <h2 id="then-title">The same letter, four ways.</h2>
          </div>
          <ThenAndNow />
        </div>
      </section>

      <Crew />

      <section className="ab-promise section" aria-labelledby="promise-title">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">What you can count on</span><h2 id="promise-title">Exceptional printing. Outstanding service.</h2></div>
            <p>Henle’s own goal, and what the crew says it takes.</p>
          </div>
          <ul className="ab-promise__grid">
            {promises.map((item, i) => (
              <li key={item.id}><b>{String(i + 1).padStart(2, '0')}</b><h3>{item.title}</h3><p>{item.text}</p></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ab-visit">
        <div className="shell ab-visit__grid">
          <div>
            <span className="eyebrow eyebrow--light">Come meet us</span>
            <h2>Working together… we can get your project done!</h2>
          </div>
          <ul className="ab-visit__list">
            <li><MapPin /><span>703 Ontario Rd<br />Marshall, MN 56258</span></li>
            <li><Phone /><a href="tel:+15075324493">507-532-4493</a></li>
            <li><Clock3 /><span>Mon–Thu 8am–5pm<br />Friday 8am–noon</span></li>
          </ul>
          <div className="ab-visit__actions">
            <Link className="button button--paper" to="/quote">Request a quote <ArrowUpRight /></Link>
            <Link className="button button--outline" to="/contact">Contact the crew</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
