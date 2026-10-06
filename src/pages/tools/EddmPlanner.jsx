import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Building2, CalendarDays, Check, CircleAlert, House, Info, MapPin, MousePointerClick,
  PenTool, Printer, Scissors, Sparkles, Store, TriangleAlert, Truck, WandSparkles,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import {
  DESIGN_FEE_DEMO, EDDM_MAX_PER_ZIP_DAY, EDDM_MIN_PIECES, EDDM_PAPERS, EDDM_SIZES, IN_HOME_DAYS, MAP_W, POSTAGE_PER_PIECE, TOWNS,
  addBusinessDays, buildTimeline, eddmPrinting, fmtMoney, fmtQty, fromInputDate, generateRoutes, nextBusinessDay, pickBest, toInputDate,
} from './pricingData'
import './eddm.css'

const DENSITY = ['Light', 'Medium', 'Dense', 'Densest']
const STEP_ICONS = { design: PenTool, proof: BadgeCheck, print: Printer, deliver: Truck, homes: House }

const fmtDay = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const money = (n, cents = false) => fmtMoney(n, { cents })
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }

/* ---------- hooks ---------- */

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// Eases a number toward its target (snaps when the visitor prefers reduced motion).
function useTweenNumber(target, ms = 450) {
  const reduce = useMedia('(prefers-reduced-motion: reduce)')
  const [shown, setShown] = useState(target)
  const ref = useRef(target)
  useEffect(() => {
    if (reduce) { ref.current = target; setShown(target); return undefined }
    const from = ref.current
    const start = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const v = from + (target - from) * (1 - (1 - t) ** 3)
      ref.current = v
      setShown(v)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduce, ms])
  return shown
}

/* ---------- the route map ---------- */

function RouteMap({ map, selected, onToggle, town }) {
  const wrap = useRef(null)
  const tiles = useRef({})
  const [px, setPx] = useState(700)
  useEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => setPx(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = px / MAP_W

  const move = (event, route) => {
    const keys = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }
    const dir = keys[event.key]
    if (!dir) return
    event.preventDefault()
    const cx = route.x + route.w / 2
    const cy = route.y + route.h / 2
    let best = null
    let bestScore = Infinity
    map.routes.forEach((r) => {
      if (r.id === route.id) return
      const dx = r.x + r.w / 2 - cx
      const dy = r.y + r.h / 2 - cy
      const along = dx * dir[0] + dy * dir[1]
      if (along <= 4) return
      const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0])
      const score = along + across * 1.6
      if (score < bestScore) { bestScore = score; best = r }
    })
    if (best) tiles.current[best.id]?.focus()
  }

  const pct = (v, total) => `${(v / total) * 100}%`
  const { width: W, height: H } = map

  return (
    <div className="eddm-mapframe">
      <div
        className="eddm-map"
        ref={wrap}
        style={{ aspectRatio: `${W} / ${H}` }}
        role="group"
        aria-label={`Route map for ${town.name}, ZIP ${town.zip}. Each block is a postal route. Tab or use the arrow keys to move between routes, and press Space or Enter to add or remove one.`}
      >
        <svg className="eddm-map__base" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <pattern id="eddm-sections" width="125" height="125" patternUnits="userSpaceOnUse">
              <path d="M125 0H0V125" fill="none" stroke="#c9c19a" strokeWidth="1.5" strokeDasharray="6 7" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="#ece6cf" />
          <rect width={W} height={H} fill="url(#eddm-sections)" />
          <rect x={map.ring} y={map.ring} width={W - map.ring * 2} height={H - map.ring * 2} fill="#f6f3e8" />
        </svg>

        {map.routes.map((r) => {
          const on = selected.has(r.id)
          const wpx = r.w * scale
          const hpx = r.h * scale
          const detail = wpx >= 74 && hpx >= 58
          const showBiz = r.biz >= 20 && wpx >= 74 && hpx >= 74
          const gx = r.kind === 'rural' ? 46 : 24 + ((r.hh + r.biz) % 3) * 6
          const gy = r.kind === 'rural' ? 46 : 22 + ((r.hh * 7) % 3) * 6
          const label = `Route ${r.id}, ${r.kind === 'city' ? 'city' : 'rural'} route, ${fmtQty(r.hh)} households and ${r.biz} businesses, ${DENSITY[r.tier - 1].toLowerCase()} density${r.downtown ? ', downtown' : ''}`
          return (
            <button
              type="button"
              key={r.id}
              ref={(el) => { tiles.current[r.id] = el }}
              className={`eddm-tile eddm-tile--${r.kind} eddm-tile--d${r.tier} ${on ? 'is-on' : ''}`}
              style={{ left: pct(r.x, W), top: pct(r.y, H), width: pct(r.w, W), height: pct(r.h, H), '--gx': `${gx}px`, '--gy': `${gy}px` }}
              aria-pressed={on}
              aria-label={label}
              onClick={() => onToggle(r.id)}
              onKeyDown={(e) => move(e, r)}
            >
              <span className="eddm-tile__id">{r.id}</span>
              {detail && <span className="eddm-tile__hh">{fmtQty(r.hh)}<small> homes</small></span>}
              {showBiz && <span className="eddm-tile__biz"><Store aria-hidden="true" />{r.biz}</span>}
              {on && (
                <>
                  <i className="eddm-crop eddm-crop--tl" /><i className="eddm-crop eddm-crop--tr" />
                  <i className="eddm-crop eddm-crop--bl" /><i className="eddm-crop eddm-crop--br" />
                  <svg className="eddm-reg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 1v22M1 12h22" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </>
              )}
            </button>
          )
        })}

        <svg className="eddm-map__over" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <path d={map.highway} fill="none" stroke="#7c8791" strokeWidth="19" strokeLinecap="round" />
          <path d={map.highway} fill="none" stroke="#fffefa" strokeWidth="13" strokeLinecap="round" />
          <path d={map.highway} fill="none" stroke="#f2b134" strokeWidth="2.4" strokeDasharray="14 12" />
          <path d={map.river} fill="none" stroke="#5fb5cd" strokeWidth="30" strokeLinecap="round" opacity=".85" />
          <path d={map.river} fill="none" stroke="#a9dbe8" strokeWidth="19" strokeLinecap="round" opacity=".9" />
        </svg>

        <span className="eddm-pin" style={{ left: pct(map.pin.x, W), top: pct(map.pin.y, H) }}>
          <b><Truck aria-hidden="true" /></b>
          <em><span className="long">{town.hub ? 'Henle · 703 Ontario Rd' : 'Henle delivers to the Post Office'}</span><span className="short">{town.hub ? 'Henle' : 'Post Office'}</span></em>
        </span>
        <span className="eddm-compass" aria-hidden="true"><i>N</i></span>
      </div>
      <div className="eddm-colorbar" aria-hidden="true"><i /><i /><i /><i /></div>
    </div>
  )
}

/* ---------- small pieces ---------- */

function PieceDiagram({ size }) {
  const max = 12
  const w = (size.w / max) * 56
  const h = (size.h / max) * 56
  return (
    <span className="eddm-piece" aria-hidden="true">
      <i style={{ width: w, height: h }} />
    </span>
  )
}

function Choice({ name, value, checked, onChange, className = '', children }) {
  return (
    <label className={`eddm-choice ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} />
      <span className="eddm-choice__body">{children}</span>
    </label>
  )
}

function Card({ n, id, title, hint, children, className = '' }) {
  return (
    <section className={`eddm-card ${className}`} aria-labelledby={id}>
      <header className="eddm-card__head">
        <span className="eddm-card__n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <div>
          <h2 id={id}>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

/* ---------- page ---------- */

const defaultInHomes = () => toInputDate(addBusinessDays(startOfToday(), 22))

export default function EddmPlanner() {
  const wide = useMedia('(min-width: 720px)')
  const [zip, setZip] = useState('56258')
  const town = TOWNS.find((t) => t.zip === zip)
  const [includeBiz, setIncludeBiz] = useState(true)
  const [sizeId, setSizeId] = useState('6.5x9')
  const [paper, setPaper] = useState('standard')
  const [designHelp, setDesignHelp] = useState(false)
  const [budget, setBudget] = useState(2000)
  const [inHomes, setInHomes] = useState(defaultInHomes)
  const budgetId = useId()

  const map = useMemo(() => generateRoutes(zip, wide), [zip, wide])
  const designFee = designHelp ? DESIGN_FEE_DEMO : 0
  const best = (routes, b) => pickBest({ routes, count: 5, budget: b, includeBiz, size: sizeId, paper, designFee })
  const [selected, setSelected] = useState(() => new Set(best(generateRoutes('56258', true).routes, 2000)))

  const size = EDDM_SIZES.find((s) => s.id === sizeId)
  const chosen = map.routes.filter((r) => selected.has(r.id)).sort((a, b) => a.id.localeCompare(b.id))
  const households = chosen.reduce((a, r) => a + r.hh, 0)
  const businesses = chosen.reduce((a, r) => a + r.biz, 0)
  const pieces = households + (includeBiz ? businesses : 0)
  const townDoors = map.routes.reduce((a, r) => a + r.hh + (includeBiz ? r.biz : 0), 0)
  const printing = pieces > 0 ? eddmPrinting({ pieces, size: sizeId, paper }) : 0
  const postage = Math.round(pieces * POSTAGE_PER_PIECE * 100) / 100
  const total = printing + postage + designFee
  const perDoor = pieces ? total / pieces : 0
  const status = pieces === 0 ? 'empty' : pieces < EDDM_MIN_PIECES ? 'under' : pieces > EDDM_MAX_PER_ZIP_DAY ? 'over' : 'ok'
  const reach = townDoors ? Math.min(1, pieces / townDoors) : 0

  // Split plan for oversized mailings: fill each drop day up to the daily limit.
  const drops = useMemo(() => {
    if (status !== 'over') return []
    const out = [{ routes: [], pieces: 0 }]
    chosen.forEach((r) => {
      const n = r.hh + (includeBiz ? r.biz : 0)
      let cur = out.at(-1)
      if (cur.pieces + n > EDDM_MAX_PER_ZIP_DAY && cur.routes.length) { cur = { routes: [], pieces: 0 }; out.push(cur) }
      cur.routes.push(r.id)
      cur.pieces += n
    })
    return out
  }, [status, chosen, includeBiz])

  const today = startOfToday()
  const inHomesDate = fromInputDate(inHomes)
  const timeline = useMemo(() => buildTimeline({ inHomesBy: inHomesDate, designHelp, pieces }), [inHomes, designHelp, pieces])
  const tight = timeline.start < today
  const earliest = addBusinessDays(nextBusinessDay(today), timeline.totalDays - 1)

  const pickTown = (value) => {
    setZip(value)
    setSelected(new Set(best(generateRoutes(value, wide).routes, budget)))
  }
  const toggle = (id) => setSelected((set) => { const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); return next })
  const idsLabel = chosen.length > 6 ? `${chosen.slice(0, 6).map((r) => r.id).join(', ')} +${chosen.length - 6}` : chosen.map((r) => r.id).join(', ')

  const doors = useTweenNumber(pieces)
  const totalShown = useTweenNumber(total, 500)
  const reachShown = useTweenNumber(reach, 500)

  const dropLabel = drops.length > 1 ? `${drops.length} drops` : 'one drop'
  const project = `an EDDM mailing in ${town.name} (${town.zip}) covering ${chosen.length} postal route${chosen.length === 1 ? '' : 's'} (${chosen.map((r) => r.id).join(', ') || 'to be chosen'}), about ${fmtQty(pieces)} pieces at ${size.label} on ${EDDM_PAPERS.find((p) => p.id === paper).detail}${designHelp ? ', with design help' : ''}, ${status === 'over' ? `split across ${dropLabel}, ` : ''}in homes by ${fmtDay(inHomesDate)} (website estimate ${money(total)})`
  const quoteTo = `/quote?service=mailing&project=${encodeURIComponent(project)}${designHelp ? '&design=1' : ''}`
  const statusMsg = {
    empty: 'Tap routes on the map to start your mailing.',
    under: `Add ${fmtQty(EDDM_MIN_PIECES - pieces)} more doors to reach the ${EDDM_MIN_PIECES}-piece EDDM minimum.`,
    over: `Over the ${fmtQty(EDDM_MAX_PER_ZIP_DAY)} per ZIP per day limit by ${fmtQty(pieces - EDDM_MAX_PER_ZIP_DAY)}. Split it into ${dropLabel}.`,
    ok: 'Within the USPS EDDM limits. Ready for takeoff.',
  }[status]

  const barcode = useMemo(() => Array.from({ length: 34 }, (_, i) => ((parseInt(zip, 10) * (i + 3) * 7919) % 5) + 1), [zip])

  return (
    <>
      <SEO title="EDDM Mailing Planner" description="Plan an Every Door Direct Mail campaign in southwest Minnesota: pick a town, tap postal routes, and see households reached, printing, postage, and an in-homes timeline." path="/eddm-planner" />
      <PageHero eyebrow="EDDM planner" title="Every door in town, planned in minutes." intro="We are experts with Every Door Direct Mailings and make sure your promotions arrive on time. Pick a town, tap the routes you want, and watch your mailing take shape: doors, postage, and the day it lands in homes." tone="coral" />

      <section className="eddm">
        <div className="shell">
          <div className="eddm__layout">
            <div className="eddm__cards">
              <Card n={1} id="eddm-s-town" title="Where are we mailing?" hint="Southwest Minnesota towns Henle serves. Pick one to load its postal routes.">
                <div className="eddm-towns" role="radiogroup" aria-labelledby="eddm-s-town">
                  {TOWNS.map((t) => (
                    <Choice key={t.zip} name="eddm-town" value={t.zip} checked={zip === t.zip} onChange={pickTown} className="eddm-choice--town">
                      <strong>{t.name}</strong>
                      <small>{t.zip}</small>
                    </Choice>
                  ))}
                </div>
              </Card>

              <Card n={2} id="eddm-s-map" title="Tap your routes" hint="Each block is a carrier route. Darker blue means more homes packed in.">
                <div className="eddm-tools">
                  <button type="button" onClick={() => setSelected(new Set(map.routes.map((r) => r.id)))}><MousePointerClick aria-hidden="true" /> Select all</button>
                  <button type="button" onClick={() => setSelected(new Set())}>Clear</button>
                  <button type="button" className="is-magic" onClick={() => setSelected(new Set(best(map.routes, budget)))}><WandSparkles aria-hidden="true" /> Pick the best 5 for my budget</button>
                </div>
                <div className="eddm-budget">
                  <label htmlFor={budgetId}>Budget for the whole mailing</label>
                  <output htmlFor={budgetId}>{money(budget)}</output>
                  <input id={budgetId} type="range" min="500" max="6000" step="100" value={budget} style={{ '--pct': `${((budget - 500) / 5500) * 100}%` }} onChange={(e) => setBudget(Number(e.target.value))} aria-valuetext={money(budget)} />
                </div>

                <RouteMap map={map} selected={selected} onToggle={toggle} town={town} />

                <div className="eddm-legend">
                  <ul aria-label="Map legend">
                    <li><i className="lg lg--d1" />Light</li>
                    <li><i className="lg lg--d3" />Dense</li>
                    <li><i className="lg lg--d4" />Densest</li>
                    <li><i className="lg lg--rural" />Rural route (R)</li>
                    <li><i className="lg lg--on" />Selected</li>
                    <li><i className="lg lg--river" />{town.river || 'River'}</li>
                    <li><i className="lg lg--hwy" />Highway</li>
                  </ul>
                  <p className="eddm-chip"><Info aria-hidden="true" /> Demo data · real USPS routes plug in here</p>
                </div>

                <p className="eddm-count" role="status" aria-live="polite">
                  <b>{chosen.length}</b> of {map.routes.length} routes selected · <b>{fmtQty(households)}</b> households{businesses ? <> · <b>{fmtQty(businesses)}</b> businesses</> : null}
                </p>
                <label className="eddm-switch">
                  <input type="checkbox" checked={includeBiz} onChange={(e) => setIncludeBiz(e.target.checked)} />
                  <span className="eddm-switch__box" aria-hidden="true"><Check /></span>
                  <span>Include business addresses on these routes</span>
                </label>

                <details className="eddm-sheet" open>
                  <summary>Route sheet <small>(the same routes as a list)</small></summary>
                  <div className="eddm-sheet__scroll" tabIndex={0} role="region" aria-label="Route sheet, scrollable">
                    <table>
                      <thead>
                        <tr><th scope="col">Use</th><th scope="col">Route</th><th scope="col">Type</th><th scope="col" className="num">Homes</th><th scope="col" className="num">Biz</th><th scope="col">Density</th></tr>
                      </thead>
                      <tbody>
                        {map.routes.map((r) => (
                          <tr key={r.id} className={selected.has(r.id) ? 'is-on' : ''}>
                            <td><label className="eddm-check"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Include route ${r.id}`} /><span aria-hidden="true"><Check /></span></label></td>
                            <th scope="row">{r.id}{r.downtown ? <small> downtown</small> : null}</th>
                            <td>{r.kind === 'city' ? 'City' : 'Rural'}</td>
                            <td className="num">{fmtQty(r.hh)}</td>
                            <td className="num">{r.biz}</td>
                            <td>{DENSITY[r.tier - 1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </Card>

              <Card n={3} id="eddm-s-piece" title="Your mailer" hint="Pick a size that qualifies as a USPS flat, a stock, and whether we design it.">
                <div className="eddm-sizes" role="radiogroup" aria-labelledby="eddm-s-piece">
                  {EDDM_SIZES.map((s) => (
                    <Choice key={s.id} name="eddm-size" value={s.id} checked={sizeId === s.id} onChange={setSizeId} className="eddm-choice--size">
                      <PieceDiagram size={s} />
                      <strong>{s.label}</strong>
                      <small>{s.note}</small>
                      <em className={s.flat ? 'is-flat' : 'is-letter'}>{s.flat ? <><Check aria-hidden="true" /> USPS flat</> : <><TriangleAlert aria-hidden="true" /> Under flat size</>}</em>
                    </Choice>
                  ))}
                </div>
                {!size.flat && (
                  <p className="eddm-warn" role="status">
                    <TriangleAlert aria-hidden="true" />
                    <span><b>{size.label} is smaller than an EDDM Retail flat.</b> A flat must be taller than 6.125 in or longer than 11.5 in. Henle can advise on letter-size marketing mail, but the postage below assumes a flat.</span>
                  </p>
                )}
                <div className="eddm-pair">
                  <div>
                    <span id="eddm-paper-l" className="eddm-label">Paper</span>
                    <div className="eddm-seg" role="radiogroup" aria-labelledby="eddm-paper-l">
                      {EDDM_PAPERS.map((p) => (
                        <Choice key={p.id} name="eddm-paper" value={p.id} checked={paper === p.id} onChange={setPaper} className="eddm-choice--seg">
                          <strong>{p.label}</strong><small>{p.detail}</small>
                        </Choice>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span id="eddm-design-l" className="eddm-label">Design</span>
                    <div className="eddm-seg" role="radiogroup" aria-labelledby="eddm-design-l">
                      <Choice name="eddm-design" value="no" checked={!designHelp} onChange={() => setDesignHelp(false)} className="eddm-choice--seg">
                        <strong>I have art</strong><small>Print-ready file</small>
                      </Choice>
                      <Choice name="eddm-design" value="yes" checked={designHelp} onChange={() => setDesignHelp(true)} className="eddm-choice--seg">
                        <strong>Design it for me</strong><small>+{money(DESIGN_FEE_DEMO)} demo fee</small>
                      </Choice>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <aside className="eddm-pass-wrap" aria-label="Campaign summary">
              <div className={`eddm-pass eddm-pass--${status}`} id="eddm-pass">
                <div className="eddm-pass__head">
                  <span>EDDM boarding pass</span>
                  <span>Henle Printing Co.</span>
                </div>
                <div className="eddm-pass__route">
                  <div><small>From</small><b>Marshall</b><span>MN 56258</span></div>
                  <Truck aria-hidden="true" />
                  <div><small>To</small><b>{town.name}</b><span>MN {town.zip}</span></div>
                </div>

                <p className={`eddm-pass__status eddm-pass__status--${status}`} role="status">
                  {status === 'ok' ? <BadgeCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
                  {statusMsg}
                </p>

                <div className="eddm-pass__main">
                  <div className="eddm-pass__doors">
                    <div>
                      <small>Doors reached</small>
                      <b aria-hidden="true">{fmtQty(Math.round(doors))}</b>
                      <span className="sr-only">{fmtQty(pieces)} doors reached</span>
                    </div>
                    <svg viewBox="0 0 44 44" className="eddm-ring" aria-hidden="true" focusable="false">
                      <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(16,42,67,.14)" strokeWidth="6" />
                      <circle cx="22" cy="22" r="17" fill="none" stroke="var(--coral)" strokeWidth="6" strokeDasharray={`${reachShown * 106.8} 106.8`} transform="rotate(-90 22 22)" />
                      <text x="22" y="26" textAnchor="middle">{Math.round(reachShown * 100)}%</text>
                    </svg>
                  </div>
                  <dl className="eddm-pass__grid">
                    <div><dt>Routes</dt><dd>{chosen.length}</dd></div>
                    <div><dt>Households</dt><dd>{fmtQty(households)}</dd></div>
                    <div><dt>Businesses</dt><dd>{includeBiz ? fmtQty(businesses) : 'Skipped'}</dd></div>
                    <div><dt>Pieces</dt><dd>{fmtQty(pieces)}</dd></div>
                    <div><dt>Mailer</dt><dd>{size.label}</dd></div>
                    <div><dt>In homes by</dt><dd>{fmtDay(inHomesDate)}</dd></div>
                  </dl>
                  {chosen.length > 0 && <p className="eddm-pass__ids"><small>Routes</small>{idsLabel}</p>}
                </div>

                <div className="eddm-pass__tear" aria-hidden="true" />

                <div className="eddm-pass__cost">
                  <ul>
                    <li><span>Printing</span><b>{money(printing)}</b></li>
                    <li><span>Postage <small>{fmtQty(pieces)} × ${POSTAGE_PER_PIECE.toFixed(2)}</small></span><b>{money(postage)}</b></li>
                    {designHelp && <li><span>Design help</span><b>{money(designFee)}</b></li>}
                  </ul>
                  <div className="eddm-pass__total">
                    <span>Estimated total</span>
                    <b>{money(Math.round(totalShown))}</b>
                    <small>{pieces ? `${money(perDoor, true)} per door` : 'Select routes to price'}</small>
                  </div>
                  <p className="eddm-chip eddm-chip--light"><Info aria-hidden="true" /> Demo data · real USPS routes plug in here</p>
                </div>

                {status === 'over' && (
                  <div className="eddm-split">
                    <b>Suggested split</b>
                    <ol>
                      {drops.map((d, i) => <li key={i}><span>Drop {i + 1}</span> {fmtQty(d.pieces)} pieces <small>{d.routes.length > 5 ? `${d.routes.slice(0, 5).join(', ')} +${d.routes.length - 5}` : d.routes.join(', ')}</small></li>)}
                    </ol>
                    <p>Each drop goes to the Post Office on a different day.</p>
                  </div>
                )}

                <div className="eddm-pass__foot">
                  {status === 'ok' || status === 'over' ? (
                    <Link className="button eddm-cta" to={quoteTo}>{status === 'over' ? `Plan a ${drops.length}-drop mailing with Henle` : 'Plan this mailing with Henle'} <ArrowRight aria-hidden="true" /></Link>
                  ) : (
                    <button type="button" className="button eddm-cta" disabled>Plan this mailing with Henle <ArrowRight aria-hidden="true" /></button>
                  )}
                  <div className="eddm-barcode" aria-hidden="true">
                    {barcode.map((w, i) => <i key={i} style={{ flexBasis: `${w * 2}px` }} />)}
                  </div>
                  <small className="eddm-pass__fine">ZIP {town.zip} · postage {money(POSTAGE_PER_PIECE, true)} per piece, verify against the current USPS rate</small>
                </div>
              </div>
            </aside>

            <div className="eddm-dock">
              <div>
                <b>{money(total)}</b>
                <span>{fmtQty(pieces)} doors · {chosen.length} routes</span>
              </div>
              <a className="button button--small eddm-dock__link" href="#eddm-pass">Boarding pass</a>
              {status === 'ok' || status === 'over' ? (
                <Link className="button button--small eddm-dock__cta" to={quoteTo}>Plan it <ArrowRight aria-hidden="true" /></Link>
              ) : (
                <span className="eddm-dock__hint">{status === 'empty' ? 'Pick routes' : `${fmtQty(EDDM_MIN_PIECES - pieces)} more`}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="eddm-time section">
        <div className="shell">
          <div className="eddm-time__head">
            <div>
              <span className="eyebrow">Delivery timeline</span>
              <h2>Work backward from the day you want it in homes.</h2>
            </div>
            <div className="eddm-date">
              <label htmlFor="eddm-date">In homes by</label>
              <input id="eddm-date" type="date" value={inHomes} min={toInputDate(addBusinessDays(today, 1))} onChange={(e) => e.target.value && setInHomes(e.target.value)} />
              <div className="eddm-date__quick" role="group" aria-label="Quick dates">
                {[2, 3, 4].map((w) => (
                  <button type="button" key={w} onClick={() => setInHomes(toInputDate(addBusinessDays(today, w * 5)))}>{w} weeks</button>
                ))}
              </div>
            </div>
          </div>

          {tight && (
            <p className="eddm-warn eddm-warn--light" role="status">
              <TriangleAlert aria-hidden="true" />
              <span><b>That date is tighter than our usual schedule.</b> Starting today, the earliest in-homes date is about {fmtDay(earliest)}. Ask Henle about rush options. <button type="button" onClick={() => setInHomes(toInputDate(earliest))}>Use {fmtDay(earliest)}</button></span>
            </p>
          )}

          <ol className="eddm-track" key={inHomes}>
            {timeline.steps.map((s, i) => {
              const Icon = STEP_ICONS[s.id]
              return (
                <li key={s.id} className={`eddm-track__step eddm-track__step--${s.id}`} style={{ '--i': i }}>
                  <span className="eddm-track__dot" aria-hidden="true"><Icon /></span>
                  <h3>{s.label}</h3>
                  <p className="eddm-track__date">{s.days > 1 ? `${fmtDay(s.start)} to ${fmtDay(s.end)}` : fmtDay(s.end)}</p>
                  <p className="eddm-track__days">{s.days} business day{s.days > 1 ? 's' : ''}</p>
                  <p className="eddm-track__note">{s.note}</p>
                </li>
              )
            })}
          </ol>
          <p className="eddm-time__fine">
            <CalendarDays aria-hidden="true" /> <span>Start by <b>{fmtLong(timeline.start)}</b> and drop at the Post Office by <b>{fmtLong(timeline.drop)}</b>. Dates count business days only and skip weekends, not holidays. Mail typically lands in homes within {IN_HOME_DAYS} business days of the drop; confirm with Henle.</span>
          </p>
        </div>
      </section>

      <section className="eddm-rules">
        <div className="shell">
          <div className="eddm-rules__intro">
            <span className="eyebrow eyebrow--light">Rules of the road</span>
            <h2>The three numbers USPS cares about.</h2>
          </div>
          <div className="eddm-rules__grid">
            <article className={status === 'under' ? 'is-hit' : ''}>
              <Scissors aria-hidden="true" />
              <b>{EDDM_MIN_PIECES}</b>
              <h3>Piece minimum</h3>
              <p>EDDM Retail needs at least {EDDM_MIN_PIECES} pieces in a mailing. {status === 'under' ? 'You are under it right now. Add a route.' : 'Easy to clear with even one route.'}</p>
            </article>
            <article className={status === 'over' ? 'is-hit' : ''}>
              <MapPin aria-hidden="true" />
              <b>{fmtQty(EDDM_MAX_PER_ZIP_DAY)}</b>
              <h3>Per ZIP, per day</h3>
              <p>No more than {fmtQty(EDDM_MAX_PER_ZIP_DAY)} pieces go to one ZIP Code on a single drop day. {status === 'over' ? 'Yours is over, so we would split it across two days.' : 'Bigger plans split cleanly into two drop days.'}</p>
            </article>
            <article>
              <Building2 aria-hidden="true" />
              <b>{IN_HOME_DAYS}</b>
              <h3>Days to homes, typically</h3>
              <p>Mail usually lands a few days after the drop. Delivery is up to the Post Office, so confirm timing with Henle.</p>
            </article>
          </div>
          <div className="eddm-rules__cta">
            <Sparkles aria-hidden="true" />
            <p>Henle’s mailing specialists can also target specific customers, demographics, or postal routes.</p>
            <Link className="button button--paper" to={quoteTo}>Plan this mailing with Henle <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  )
}
