import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'

const TOWNS = ['Marshall', 'Tracy', 'Minneota', 'Lynd', 'Ghent', 'Balaton', 'Russell', 'Cottonwood']
const NAMES = ['Pat', 'Jordan', 'Sam', 'Casey', 'Riley', 'Morgan', 'Alex', 'Taylor', 'Jamie', 'Drew', 'Avery', 'Quinn']
const RECORDS = 500

const pad = (n) => String(n).padStart(4, '0')

function Postcard({ variable, name, town, record }) {
  return (
    <div className="dx-card" aria-live="polite">
      <div className="dx-card__art" aria-hidden="true">
        <i /><i /><i />
        <span>FALL SALE</span>
      </div>
      <div className="dx-card__copy">
        <small>{variable ? `A note for ${town}` : 'A note for our neighbors'}</small>
        <strong>{variable ? `Hi, ${name}.` : 'Hi, neighbor.'}</strong>
        <p>{variable ? `Your ${town} order gets 15% off through October.` : 'Your order gets 15% off through October.'}</p>
        <div className="dx-card__foot">
          <span>{variable ? `Your code: FALL-${pad(record)}` : 'Code: FALL'}</span>
          <span>{variable ? `${name} · ${town}, MN` : 'Current Resident'}</span>
        </div>
      </div>
    </div>
  )
}

function VdpDemo() {
  const [name, setName] = useState('Pat')
  const [town, setTown] = useState('Marshall')
  const [variable, setVariable] = useState(true)
  const [running, setRunning] = useState(false)
  const [record, setRecord] = useState(1)
  const timer = useRef(0)

  useEffect(() => () => clearInterval(timer.current), [])

  const run = () => {
    if (running) return
    setRunning(true)
    let i = 1
    timer.current = setInterval(() => {
      i += 1
      if (i > 24) {
        clearInterval(timer.current)
        setRecord(RECORDS)
        setRunning(false)
        return
      }
      setRecord(i)
    }, 130)
  }

  const shownName = running ? NAMES[(record - 1) % NAMES.length] : (name.trim() || 'friend')
  const shownTown = running ? TOWNS[(record * 3) % TOWNS.length] : town

  return (
    <div className="dx-vdp">
      <div className="dx-vdp__controls">
        <span className="sp-label">Variable Data Processing</span>
        <h3>One design. A different piece for everyone.</h3>
        <p>Type a name and pick a town. Then press the run button and watch the data change on every card.</p>

        <div className="dx-toggle" role="group" aria-label="Printing mode">
          <button type="button" className={!variable ? 'active' : ''} aria-pressed={!variable} onClick={() => setVariable(false)}>Same piece to everyone</button>
          <button type="button" className={variable ? 'active' : ''} aria-pressed={variable} onClick={() => setVariable(true)}>Variable data</button>
        </div>

        <div className="dx-fields" aria-disabled={!variable}>
          <label>First name
            <input value={name} maxLength={14} onChange={(event) => setName(event.target.value)} disabled={!variable || running} />
          </label>
          <label>Town
            <select value={town} onChange={(event) => setTown(event.target.value)} disabled={!variable || running}>
              {TOWNS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <button type="button" className="button button--dark dx-run" onClick={run} disabled={!variable || running}>
          {running ? 'Printing…' : <>Print the run <Play size={16} fill="currentColor" /></>}
        </button>
        {record === RECORDS && !running && (
          <p className="dx-done" role="status">{RECORDS} unique pieces. One pass. <button type="button" onClick={() => setRecord(1)}><RotateCcw size={13} /> Reset</button></p>
        )}
      </div>

      <div className="dx-stack">
        <div className="dx-stack__shadow dx-stack__shadow--2" aria-hidden="true" />
        <div className="dx-stack__shadow dx-stack__shadow--1" aria-hidden="true" />
        <Postcard variable={variable} name={shownName} town={shownTown} record={record} />
        <div className="dx-counter" aria-hidden="true">
          <small>Record</small>
          <b>{variable ? pad(record) : '0001'}</b>
          <small>of {pad(RECORDS)}</small>
        </div>
      </div>
    </div>
  )
}

const SIZES = [
  { id: 'letter', label: 'Letter', size: '8.5 × 11 in', w: 8.5, h: 11 },
  { id: 'tabloid', label: 'Tabloid', size: '11 × 17 in', w: 11, h: 17 },
]

function SheetSizes() {
  const [active, setActive] = useState('tabloid')

  return (
    <div className="dx-sizes">
      <div className="dx-sizes__copy">
        <span className="sp-label">Letter to tabloid</span>
        <h3>Double-sided. Folded. Collated. Stapled.</h3>
        <p>From letter to tabloid-sized sheets, we print double-sided, fold, collate, and staple your documents. In a rush? We deliver the fastest turnaround.</p>
        <ul>
          {['Double-sided', 'Fold', 'Collate', 'Staple'].map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="dx-sizes__sheets" role="group" aria-label="Sheet size">
        {SIZES.map((s) => (
          <button type="button" key={s.id} className={active === s.id ? 'active' : ''} aria-pressed={active === s.id} onClick={() => setActive(s.id)} style={{ '--w': s.w, '--h': s.h }}>
            <span className="dx-sizes__paper"><i /><i /><i /><i /></span>
            <b>{s.label}</b>
            <small>{s.size}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DigitalLab() {
  return (
    <div className="dx">
      <VdpDemo />
      <SheetSizes />
    </div>
  )
}
