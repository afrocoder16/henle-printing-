import { useEffect, useState } from 'react'
import { ArrowDownWideNarrow, ArrowRight, ListChecks, MailPlus, MapPinned, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const stations = [
  { id: 'clean', icon: ListChecks, label: 'Clean', line: 'We clean your list—supply your own, or let us create one for you.' },
  { id: 'standardize', icon: MapPinned, label: 'Standardize', line: 'We standardize every address so it meets postal requirements.' },
  { id: 'presort', icon: ArrowDownWideNarrow, label: 'Presort', line: 'We presort to qualify for the best prices on postage.' },
  { id: 'insert', icon: MailPlus, label: 'Insert', line: 'Our insertion equipment assembles bills with a return envelope—and a promotional document, if you choose.' },
  { id: 'ship', icon: Truck, label: 'Deliver', line: 'Local clients get fast, free delivery. We ship daily everywhere else.' },
]

function Journey() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setActive((i) => (i + 1) % stations.length), 3200)
    return () => clearInterval(timer)
  }, [auto])

  const pick = (i) => { setAuto(false); setActive(i) }

  return (
    <div className="ml-journey">
      <div className="ml-journey__head">
        <span className="sp-label">The route from file to mailbox</span>
        <h3>One team, start to finish.</h3>
      </div>

      <div className="ml-track" style={{ '--n': stations.length, '--a': active }}>
        <div className="ml-track__line"><i style={{ width: `${(active / (stations.length - 1)) * 100}%` }} /></div>
        <span className="ml-track__envelope" aria-hidden="true"><MailPlus /></span>
        {stations.map((station, i) => {
          const Icon = station.icon
          return (
            <button type="button" key={station.id} className={`ml-station ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`} aria-pressed={i === active} onClick={() => pick(i)}>
              <span className="ml-station__dot"><Icon aria-hidden="true" /></span>
              <b>{station.label}</b>
            </button>
          )
        })}
      </div>

      <p className="ml-journey__line" aria-live="polite" key={active}>
        <span>{String(active + 1).padStart(2, '0')}</span> {stations[active].line}
      </p>
    </div>
  )
}

const ROWS = 5
const COLS = 9
const BLOCKS = Array.from({ length: ROWS * COLS }, (_, i) => i)

function RoutePicker() {
  const [picked, setPicked] = useState(() => new Set([10, 11, 12, 19, 20, 21]))

  const toggle = (id) => setPicked((set) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <div className="ml-routes">
      <div className="ml-routes__copy">
        <span className="sp-label">Every Door Direct Mail</span>
        <h3>Pick your routes. Skip the list.</h3>
        <p>We are experts with Every Door Direct Mailings (EDDM) and make sure your promotions arrive on time. Tap the map to see how a mailing could be planned.</p>
        <div className="ml-routes__count" aria-live="polite">
          <b>{picked.size}</b> <span>{picked.size === 1 ? 'route' : 'routes'} selected</span>
        </div>
        <div className="ml-routes__actions">
          <button type="button" onClick={() => setPicked(new Set(BLOCKS))}>Select all</button>
          <button type="button" onClick={() => setPicked(new Set())}>Clear</button>
        </div>
        <Link className="button button--dark" to={`/quote?service=mailing&project=${encodeURIComponent(`an EDDM mailing covering ${picked.size || 'several'} postal routes`)}`}>
          Plan this mailing <ArrowRight />
        </Link>
        <small>Illustration only—we’ll pull your real routes and counts.</small>
      </div>

      <div className="ml-map" role="group" aria-label="Sample route map">
        <span className="ml-map__road ml-map__road--h" aria-hidden="true" />
        <span className="ml-map__road ml-map__road--v" aria-hidden="true" />
        <span className="ml-map__pin" aria-hidden="true"><Truck size={16} /> Henle</span>
        {BLOCKS.map((id) => (
          <button type="button" key={id} className={picked.has(id) ? 'on' : ''} aria-pressed={picked.has(id)} aria-label={`Route ${id + 1}`} onClick={() => toggle(id)}>
            <span>{id + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MailLab({ shipping }) {
  return (
    <div className="ml">
      <Journey />
      <RoutePicker />
      <div className="ml-ship">
        <Truck aria-hidden="true" />
        <div>
          <span className="sp-label">Shipping</span>
          <p>{shipping}</p>
        </div>
      </div>
    </div>
  )
}
