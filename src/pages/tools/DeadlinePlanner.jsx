import { useMemo, useState } from 'react'
import { ArrowUpRight, CalendarCheck, Phone, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import { addDays, addBusinessDays, addons, fromIso, holidays, iso, isBusinessDay, plan, products, quantities } from './deadlineData'
import './tools.css'

const fmtLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const fmtShort = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const STAGE_COLOR = {
  design: 'var(--cyan)', proof: 'var(--gold)', print: 'var(--coral)', finish: 'var(--navy)',
  mailprep: 'var(--cyan)', transit: 'var(--gold)', ship: 'var(--coral)', deliver: 'var(--coral)',
}

const STATUS = {
  comfortable: { label: 'Plenty of room', tone: 'ok', line: 'You have plenty of time. We can take good care of your project, and there’s room for a proof or a second look.' },
  good: { label: 'On schedule', tone: 'ok', line: 'Right on schedule. Send your final files by the date below and you’re set.' },
  tight: { label: 'Tight, but doable', tone: 'warn', line: 'It’s tight, but doable. Send your files as early as you can and call us so we can plan press time.' },
  rush: { label: 'This is a rush', tone: 'hot', line: '“I know this is last minute, but can I still get it by…” is a question Henle hears all the time. Call us. We work hard to deliver all projects on time, sometimes even taking what seems impossible.' },
}

function Runway({ result, today, goal }) {
  const start = result.startBy < today ? result.startBy : today
  const days = []
  for (let d = new Date(start); d <= goal; d = addDays(d, 1)) days.push(new Date(d))
  const submitIso = iso(result.submitBy)
  const todayIso = iso(today)
  const goalIso = iso(goal)

  const stageFor = (day) => result.steps.find((s) => s.days > 0 && day > s.start && day <= s.end)

  return (
    <div className="tl-runway" role="img" aria-label={`Schedule from ${fmtShort(start)} to ${fmtShort(goal)}. Final files due ${fmtShort(result.submitBy)}.`}>
      <div className="tl-runway__cells">
        {days.map((day) => {
          const key = iso(day)
          const stage = stageFor(day)
          const off = !isBusinessDay(day)
          return (
            <span key={key} className={`tl-runway__cell ${off ? 'is-off' : ''} ${key === todayIso ? 'is-today' : ''} ${key === goalIso ? 'is-goal' : ''} ${key === submitIso ? 'is-submit' : ''}`} style={stage ? { '--c': STAGE_COLOR[stage.id] } : undefined}>
              {key === todayIso && <b>Today</b>}
              {key === submitIso && <b className="is-submit">Files</b>}
              {key === goalIso && <b className="is-goal">Goal</b>}
            </span>
          )
        })}
      </div>
      <div className="tl-runway__legend" aria-hidden="true">
        <span><i /> Weekend or holiday</span>
        <span><i className="is-work" /> Working day</span>
      </div>
    </div>
  )
}

export default function DeadlinePlanner() {
  const today = useMemo(() => { const d = new Date(); d.setHours(12, 0, 0, 0); return d }, [])
  const [productId, setProductId] = useState('flyers')
  const [qty, setQty] = useState(1)
  const [picked, setPicked] = useState(['proof'])
  const [mode, setMode] = useState('local')
  const [goalIso, setGoalIso] = useState(() => iso(addBusinessDays(addDays(today, 21), 0)))

  const goal = fromIso(goalIso)
  const result = useMemo(() => plan({ productId, qty, picked, mode, goal, today }), [productId, qty, picked, mode, goal, today])
  const status = STATUS[result.status]
  const mailing = picked.includes('mail')
  const product = result.product
  const closed = Object.entries(holidays).filter(([key]) => { const d = fromIso(key); return d >= today && d <= goal }).map(([key, name]) => `${name} (${fmtShort(fromIso(key))})`)

  const toggle = (id) => setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  const goalPast = goal <= today
  const quoteText = `${product.label.toLowerCase()} (${quantities[qty].label.toLowerCase()}) needed by ${fmtShort(goal)}`

  return (
    <div className="tl">
      <SEO
        title="Deadline Planner: When Do I Need to Send My Files?"
        description="Tell us when you need your printing and we’ll work backward to the date your files are due, counting business days, holidays, and mail time."
        path="/deadline-planner"
      />
      <PageHero eyebrow="Deadline planner" title="When do you need it? We’ll work backward." intro="The business world is full of deadlines. Tell us when you need your project and what’s involved, and see the date your files are due." tone="coral" />

      <section className="tl-section tl-section--dark tl-plan">
        <div className="shell tl-plan__grid">
          <div className="tl-plan__form">
            <fieldset>
              <legend><b>1</b> What are you printing?</legend>
              <div className="tl-tiles tl-tiles--sm">
                {products.map((p) => (
                  <button type="button" key={p.id} className={p.id === productId ? 'active' : ''} aria-pressed={p.id === productId} onClick={() => setProductId(p.id)}><span>{p.label}</span></button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><b>2</b> How many?</legend>
              <div className="tl-seg" role="group" aria-label="Quantity">
                {quantities.map((q) => (
                  <button type="button" key={q.id} className={q.id === qty ? 'active' : ''} aria-pressed={q.id === qty} onClick={() => setQty(q.id)}><span>{q.label}</span><small>{q.hint}</small></button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><b>3</b> What’s involved?</legend>
              <div className="tl-addons">
                {addons.map((a) => (
                  <label key={a.id} className={picked.includes(a.id) ? 'is-on' : ''}>
                    <input type="checkbox" checked={picked.includes(a.id)} onChange={() => toggle(a.id)} />
                    <span><b>{a.label}</b><small>{a.hint}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><b>4</b> When do you need it?</legend>
              <label className="tl-date">{mailing ? 'In mailboxes by' : 'In my hands by'}
                <input type="date" value={goalIso} min={iso(addDays(today, 1))} onChange={(event) => event.target.value && setGoalIso(event.target.value)} />
              </label>
              {!mailing && (
                <div className="tl-seg tl-seg--two" role="group" aria-label="Delivery">
                  <button type="button" className={mode === 'local' ? 'active' : ''} aria-pressed={mode === 'local'} onClick={() => setMode('local')}><span>Pickup or local delivery</span><small>Fast and free</small></button>
                  <button type="button" className={mode === 'ship' ? 'active' : ''} aria-pressed={mode === 'ship'} onClick={() => setMode('ship')}><span><Truck size={14} /> We ship it</span><small>Add shipping time</small></button>
                </div>
              )}
            </fieldset>
          </div>

          <div className="tl-plan__result" aria-live="polite">
            <span className="tl-label tl-label--light">Send us your final files by</span>
            <h2 className="tl-plan__date">{fmtLong(result.submitBy)}</h2>
            <p className={`tl-status tl-status--${status.tone}`}><CalendarCheck size={16} /> {status.label}</p>
            <p className="tl-plan__line">{goalPast ? 'Pick a date after today to see your schedule.' : status.line}</p>

            {result.status === 'rush' && (
              <div className="tl-rush">
                <span>If your files were ready today, the earliest finish is <b>{fmtLong(result.earliest)}</b>.</span>
                <a className="button button--paper" href="tel:+15075324493"><Phone size={16} /> Call 507-532-4493</a>
              </div>
            )}

            <Runway result={result} today={today} goal={goal} />

            <ol className="tl-steps">
              {result.steps.map((s) => (
                <li key={s.id} style={{ '--c': STAGE_COLOR[s.id] || 'var(--gold)' }} className={s.id === 'submit' ? 'is-key' : ''}>
                  <i aria-hidden="true" />
                  <div>
                    <b>{s.label}</b>
                    <span>{s.days > 0 ? `${fmtShort(s.start)} → ${fmtShort(s.end)} · ${s.days} business ${s.days === 1 ? 'day' : 'days'}` : fmtShort(s.end)}</span>
                    <small>{s.note}</small>
                  </div>
                </li>
              ))}
            </ol>

            {closed.length > 0 && <p className="tl-plan__note"><b>Holidays in your window:</b> {closed.join(', ')}. We counted them as non-working days.</p>}

            <div className="tl-plan__actions">
              <Link className="button button--paper" to={`/quote?service=${product.service}&project=${encodeURIComponent(quoteText)}&needed=${goalIso}`}>Request a quote for this timeline <ArrowUpRight /></Link>
            </div>
            <p className="tl-plan__fine">Typical turnaround estimates. {product.note} Your specialist confirms the real schedule with your quote.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
