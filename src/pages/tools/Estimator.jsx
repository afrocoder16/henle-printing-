import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, BookOpen, CalendarCheck, Check, ChevronLeft, ClipboardList, Clock3 as Clock, Columns3, FileUp, Flag, IdCard,
  Image as ImageIcon, Info, Mail, Minus, NotebookPen, Plus, RotateCcw, ScrollText, Sparkles, Star, TrendingDown, TriangleAlert,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import {
  COLOR_MODES, DESIGN_FEE_DEMO, FINISHING, PRODUCTS, PRODUCT_LIST, TURNAROUND,
  curveSeries, describeJob, estimate, fmtEach, fmtMoney, fmtQty, fmtQtyShort,
  makeConfig, nearestStepIndex, normalizeConfig, volumeInsights,
} from './pricingData'
import { addDays, fromIso, iso } from './deadlineData'
import { checklist } from './templateData'
import { DESIGN_DAYS, STEPS, cfgFromParams, paramsFor, pieceGeometry, schedule, todayNoon } from './flow/flowLogic'
import PaperStep from './flow/PaperStep'
import ArtworkStep from './flow/ArtworkStep'
import { OrderSheet, SendForm } from './flow/SendStep'
import './estimator.css'
import './flow/flow.css'

const ICONS = { cards: IdCard, flyers: ScrollText, postcards: Mail, brochures: Columns3, booklets: BookOpen, posters: ImageIcon, banners: Flag, notepads: NotebookPen, forms: ClipboardList }

const PRESETS = [
  { label: '500 business cards', product: 'cards', patch: { qty: 500, sides: 2 } },
  { label: '250 flyers', product: 'flyers', patch: { qty: 250, sides: 1 } },
  { label: '1,000 postcards', product: 'postcards', patch: { qty: 1000, size: '5x7' } },
  { label: 'One 3 × 6 ft banner', product: 'banners', patch: { qty: 1 } },
  { label: '500 newsletters', product: 'booklets', patch: { qty: 500, extra: 8 } },
]

const INK_COLORS = { c: 'var(--ink-c)', m: 'var(--ink-m)', y: 'var(--ink-y)', k: 'var(--ink-k)' }
const PART_COLORS = { setup: '#00a6c8', printing: '#f15a4a', paper: '#f2b134', finishing: '#fffefa', minimum: '#8fa5b4', rush: '#ffa89e' }

/* ---------- small hooks ---------- */

/* ---------- small hooks ---------- */

function useReducedMotion() {
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

// Eases a list of numbers toward a new target list. Snaps when motion is reduced or the length changes.
function useTween(target, ms = 520) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(target)
  const ref = useRef(target)
  useEffect(() => {
    if (reduce || ref.current.length !== target.length) {
      ref.current = target
      setShown(target)
      return undefined
    }
    const from = ref.current
    const start = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const e = 1 - (1 - t) ** 3
      const next = target.map((v, i) => from[i] + (v - from[i]) * e)
      ref.current = next
      setShown(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduce, ms])
  return shown
}

/* ---------- the price-per-piece curve ---------- */

function PriceCurve({ series, vShown, qty, steps, compare, sweet, unitWord, productId }) {
  const wrap = useRef(null)
  const [width, setWidth] = useState(640)
  const uid = useId().replace(/:/g, '')
  useEffect(() => {
    const el = wrap.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const compact = width < 520
  const h = compact ? 236 : 292
  const m = { l: compact ? 46 : 56, r: compact ? 12 : 18, t: 30, b: 34 }
  const lo = steps[0]
  const hi = steps.at(-1)
  const span = Math.log(hi) - Math.log(lo)
  const xOf = (q) => m.l + ((Math.log(q) - Math.log(lo)) / span) * (width - m.l - m.r)
  const vmax = Math.max(...vShown) * 1.08
  const yOf = (v) => m.t + (1 - v / vmax) * (h - m.t - m.b)
  const valueAt = (q) => {
    const pos = ((Math.log(q) - Math.log(lo)) / span) * (series.length - 1)
    const i = Math.min(series.length - 2, Math.max(0, Math.floor(pos)))
    const f = Math.min(1, Math.max(0, pos - i))
    return vShown[i] + (vShown[i + 1] - vShown[i]) * f
  }

  const pts = series.map((s, i) => [xOf(s.q), yOf(vShown[i])])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${pts.at(-1)[0].toFixed(1)},${h - m.b} L${pts[0][0].toFixed(1)},${h - m.b} Z`

  const mx = xOf(qty)
  const my = yOf(valueAt(qty))
  const axisMoney = (v) => (v >= 10 ? `$${Math.round(v)}` : v >= 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(2)}`)

  // Greedy x labels, keeping the first and last when there is room.
  const labelSteps = []
  steps.forEach((s, i) => {
    const x = xOf(s)
    const last = labelSteps.at(-1)
    if (!last || x - xOf(last) >= 38) labelSteps.push(s)
    if (i === steps.length - 1 && labelSteps.at(-1) !== s) {
      if (x - xOf(labelSteps.at(-1)) < 38) labelSteps.pop()
      labelSteps.push(s)
    }
  })

  const other = compare ? (qty === compare.big ? compare.small : compare.big) : null
  const ox = other ? xOf(other) : 0
  const oy = other ? yOf(valueAt(other)) : 0
  const sweetShow = sweet !== qty && sweet !== other
  const sx = xOf(sweet)
  const sy = yOf(valueAt(sweet))

  const bubble = `${fmtQty(qty)} · ${fmtEach(valueAt(qty) / 1)}`
  const bw = bubble.length * 6.6 + 18
  const bx = Math.min(width - m.r - bw / 2, Math.max(m.l + bw / 2, mx))
  const above = my > m.t + 46
  const by = above ? my - 40 : my + 14

  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => (vmax / 1.08) * f)
  const summary = `Price per ${unitWord} drops from ${fmtEach(vShown[0])} at ${fmtQty(lo)} to ${fmtEach(vShown.at(-1))} at ${fmtQty(hi)}. At your quantity of ${fmtQty(qty)} it is about ${fmtEach(valueAt(qty))} each.`

  return (
    <div className="est-curve" ref={wrap}>
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} role="img" aria-label={summary} data-product={productId}>
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#00a6c8" stopOpacity=".34" />
            <stop offset="1" stopColor="#00a6c8" stopOpacity=".03" />
          </linearGradient>
          <clipPath id={`${uid}-ink`}><rect x="0" y="0" width={Math.max(0, mx)} height={h} /></clipPath>
        </defs>

        {gridVals.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={width - m.r} y1={yOf(v)} y2={yOf(v)} className="est-curve__grid" />
            <text x={m.l - 8} y={yOf(v) + 4} textAnchor="end" className="est-curve__tick">{axisMoney(v)}</text>
          </g>
        ))}
        <line x1={m.l} x2={width - m.r} y1={h - m.b} y2={h - m.b} className="est-curve__axis" />
        {steps.map((s) => <line key={s} x1={xOf(s)} x2={xOf(s)} y1={h - m.b} y2={h - m.b + 5} className="est-curve__axis" />)}
        {labelSteps.map((s) => <text key={s} x={xOf(s)} y={h - m.b + 19} textAnchor="middle" className="est-curve__tick">{fmtQtyShort(s)}</text>)}
        <text x={m.l} y={14} className="est-curve__axislabel">Price per {unitWord}</text>
        <text x={width - m.r} y={h - 2} textAnchor="end" className="est-curve__axislabel">Quantity (log scale)</text>

        <path d={area} fill={`url(#${uid}-fill)`} />
        <path d={line} className="est-curve__line" />
        <path d={line} className="est-curve__line est-curve__line--ink" clipPath={`url(#${uid}-ink)`} />
        {steps.map((s) => <circle key={s} cx={xOf(s)} cy={yOf(valueAt(s))} r="3" className="est-curve__step" />)}

        {other && Math.abs(oy - my) > 8 && (() => {
          const left = ox < mx ? { x: ox, y: oy } : { x: mx, y: my }
          const right = ox < mx ? { x: mx, y: my } : { x: ox, y: oy }
          return (
            <g className="est-curve__compare">
              <line x1={left.x} y1={left.y} x2={right.x} y2={left.y} className="est-curve__dash" />
              <line x1={right.x} y1={left.y} x2={right.x} y2={right.y} className="est-curve__dash" />
              <circle cx={ox} cy={oy} r="6" className="est-curve__ghost" />
              {right.x - left.x > 120 && (
                <g transform={`translate(${(left.x + right.x) / 2} ${left.y})`}>
                  <rect x="-25" y="-11" width="50" height="22" className="est-curve__badge" />
                  <text textAnchor="middle" y="4" className="est-curve__badgetext">{`−${compare.pct}%`}</text>
                </g>
              )}
            </g>
          )
        })()}

        {sweetShow && (
          <g transform={`translate(${sx} ${sy})`}>
            <path d="M0 -9 L2.6 -3 L9 -2.4 L4.2 1.9 L5.6 8.2 L0 4.9 L-5.6 8.2 L-4.2 1.9 L-9 -2.4 L-2.6 -3 Z" className="est-curve__star" />
            {Math.abs(sx - mx) > 70 && <text y="24" textAnchor="middle" className="est-curve__sweet">Sweet spot</text>}
          </g>
        )}

        <line x1={mx} x2={mx} y1={my} y2={h - m.b} className="est-curve__drop" />
        <line x1={m.l} x2={mx} y1={my} y2={my} className="est-curve__drop" />
        <circle cx={mx} cy={my} r="15" className="est-curve__pulse" />
        <circle cx={mx} cy={my} r="8" className="est-curve__marker" />
        <g transform={`translate(${bx} ${by})`}>
          <rect x={-bw / 2} y="0" width={bw} height="24" className="est-curve__bubble" />
          <text y="16" textAnchor="middle" className="est-curve__bubbletext">{bubble}</text>
        </g>
      </svg>
    </div>
  )
}

/* ---------- a scaled "proof" of the piece ---------- */

function PiecePreview({ product, size, cfg }) {
  const large = product.kind === 'large'
  const inches = (v) => (large ? v * 12 : v)
  const pw = inches(size.w)
  const ph = inches(size.h)
  const ref = { w: 8.5, h: 11 }
  const box = 132
  const scale = box / Math.max(ph, ref.h, pw, ref.w)
  const mode = COLOR_MODES.find((c) => c.id === cfg.color)
  const dims = { width: Math.max(14, pw * scale), height: Math.max(14, ph * scale) }
  return (
    <figure className={`est-proof est-proof--${product.kind} est-proof--${product.id}`} aria-hidden="true">
      <div className="est-proof__stage" style={{ '--box': `${box}px` }}>
        <span className="est-proof__ref" style={{ width: ref.w * scale, height: ref.h * scale }} />
        <span className="est-proof__sheet" style={dims}>
          {cfg.sides === 2 && <span className="est-proof__back" />}
          <span className="est-proof__front">
            <span className="est-proof__bars"><i /><i /><i /></span>
            <span className="est-proof__ink">
              {mode.inks.map((k) => <b key={k} style={{ background: INK_COLORS[k] }} />)}
            </span>
          </span>
          <em className="est-proof__crop est-proof__crop--tl" /><em className="est-proof__crop est-proof__crop--tr" />
          <em className="est-proof__crop est-proof__crop--bl" /><em className="est-proof__crop est-proof__crop--br" />
        </span>
      </div>
      <figcaption>{size.label}<small>{size.note} · dashed outline is a letter sheet</small></figcaption>
    </figure>
  )
}

/* ---------- form primitives ---------- */

function Step({ n, title, hint, id, children, className = '' }) {
  return (
    <section className={`est-step ${className}`} aria-labelledby={id}>
      <header className="est-step__head">
        <span className="est-step__n" aria-hidden="true">{n}</span>
        <div>
          <h2 id={id}>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

function Choice({ type = 'radio', name, value, checked, onChange, disabled, className = '', children }) {
  return (
    <label className={`est-choice ${className}`}>
      <input type={type} name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} />
      <span className="est-choice__body">{children}</span>
    </label>
  )
}

const hashString = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

/* ---------- the Project Estimator ---------- */

const GOAL_IDS = ['premium', 'budget', 'durable', 'natural']
const fmtDay = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtDayLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

function WhenAdvice({ sched, cfg, neededIso, onSwitch }) {
  if (sched.mode === 'open') {
    return (
      <p className="es-when-note es-when-note--ok">
        <Clock aria-hidden="true" />
        <span>No date? No problem. At <b>{cfg.turn === 'standard' ? 'standard' : TURNAROUND.find((t) => t.id === cfg.turn).label.toLowerCase()}</b> turnaround, if your final files arrive today, your project could be ready about <b>{fmtDayLong(sched.earliest)}</b>.</span>
      </p>
    )
  }
  const tone = sched.status === 'late' ? 'hot' : sched.status === 'tight' ? 'warn' : 'ok'
  const switchTo = sched.suggestion ? TURNAROUND.find((t) => t.id === sched.suggestion.turn) : null
  return (
    <div className={`es-when-note es-when-note--${tone}`} role="status" aria-live="polite">
      {tone === 'ok' ? <CalendarCheck aria-hidden="true" /> : <TriangleAlert aria-hidden="true" />}
      <div>
        {sched.status === 'late' && <p><b>That date is too soon for {TURNAROUND.find((t) => t.id === cfg.turn).label.toLowerCase()} turnaround.</b></p>}
        {sched.status === 'tight' && <p><b>Tight, but doable.</b> Send your final files as early as you can.</p>}
        {(sched.status === 'good' || sched.status === 'roomy') && <p><b>{sched.status === 'roomy' ? 'Plenty of room.' : 'Right on schedule.'}</b> Send your final files by <b>{fmtDayLong(sched.submitBy)}</b>.</p>}
        {sched.status === 'tight' && <p>Final files due <b>{fmtDayLong(sched.submitBy)}</b>{sched.designDays ? `, with design starting by ${fmtDay(sched.startBy)}` : ''}.</p>}
        {sched.status === 'late' && switchTo && (
          <p>To make {fmtDay(fromIso(neededIso))}, switch to <b>{switchTo.label}</b> ({switchTo.detail}, +{Math.round(switchTo.pct * 100)}%). <button type="button" className="es-linkbtn" onClick={() => onSwitch(switchTo.id)}>Switch to {switchTo.label}</button></p>
        )}
        {sched.status === 'late' && !switchTo && (
          <p>“I know this is last minute, but can I still get it by…” is a question Henle hears all the time. <a href="tel:+15075324493">Call 507-532-4493</a> and we’ll see what’s possible.</p>
        )}
      </div>
    </div>
  )
}

export default function Estimator() {
  const [params, setParams] = useSearchParams()
  const today = useMemo(todayNoon, [])
  const cfg = useMemo(() => cfgFromParams(params), [params])
  const stepId = STEPS.some((s) => s.id === params.get('step')) ? params.get('step') : 'project'
  const stepIdx = STEPS.findIndex((s) => s.id === stepId)
  const neededIso = params.get('needed') || ''
  const art = ['file', 'design', 'later'].includes(params.get('art')) ? params.get('art') : ''
  const goal = GOAL_IDS.includes(params.get('goal')) ? params.get('goal') : ''

  const p = PRODUCTS[cfg.product]
  const size = p.sizes.find((s) => s.id === cfg.size)
  const geo = useMemo(() => pieceGeometry(cfg), [cfg])

  // Everything lives in the page address, so a project can be shared or resumed.
  const write = (patch = {}, nextCfg = cfg, push = false) => {
    setParams(paramsFor(nextCfg, { step: stepId, needed: neededIso, art, goal, ...patch }), { replace: !push, preventScrollReset: true })
  }
  const update = (patch) => write({}, normalizeConfig({ ...cfg, ...patch }))
  const pickProduct = (id) => write({}, makeConfig(id, { color: cfg.color, paper: cfg.paper, turn: cfg.turn }))

  const [checks, setChecks] = useState(() => new Set())
  const [file, setFile] = useState(null)
  const [fileResult, setFileResult] = useState(null)
  const [brief, setBrief] = useState('')
  const [order, setOrder] = useState(null)
  const [maxStep, setMaxStep] = useState(stepIdx)
  const stepperRef = useRef(null)
  const firstRender = useRef(true)
  const reduce = useReducedMotion()

  useEffect(() => { setMaxStep((m) => Math.max(m, stepIdx)) }, [stepIdx])
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    stepperRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [stepId]) // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (id) => write({ step: id === 'project' ? '' : id }, cfg, true)
  const next = () => { if (stepIdx < STEPS.length - 1) goTo(STEPS[stepIdx + 1].id) }
  const back = () => { if (stepIdx > 0) goTo(STEPS[stepIdx - 1].id) }

  const idx = nearestStepIndex(p.qtySteps, cfg.qty)
  const unitWord = cfg.qty === 1 ? p.unit : p.noun

  const est = useMemo(() => estimate(cfg), [cfg])
  const insights = useMemo(() => volumeInsights(cfg), [cfg])
  const series = useMemo(() => curveSeries(cfg, 64), [cfg])
  const seriesV = useMemo(() => series.map((s) => s.v), [series])
  const vShown = useTween(seriesV)
  const fee = art === 'design' ? DESIGN_FEE_DEMO : 0
  const [low, high, each] = useTween(useMemo(() => [est.low + fee, est.high + fee, (est.total + fee) / est.qty], [est, fee]), 420)

  const sched = useMemo(() => schedule({ turn: cfg.turn, neededIso, today, designDays: art === 'design' ? DESIGN_DAYS : 0 }), [cfg.turn, neededIso, today, art])

  const total = est.breakdown.reduce((a, b) => a + b.amount, 0) + fee
  const range = `${fmtMoney(Math.round(est.low + fee))} – ${fmtMoney(Math.round(est.high + fee))}`
  const eachLabel = est.perSqFt && p.kind === 'large' ? `${fmtEach(est.perSqFt)} / sq ft` : null
  const ticketNo = 1000 + (hashString(JSON.stringify(cfg)) % 9000)

  const binding = (p.exclusive || [])[0]
  const chips = p.finishing.filter((f) => !(binding || []).includes(f))
  void chips
  const { compare, nudge, sweet, ladder } = insights

  const artSummary = art === 'file'
    ? (file ? `${file.name}${fileResult ? ` (${fileResult.level === 'good' ? 'looks good' : fileResult.level === 'warn' ? 'has notes' : 'needs attention'})` : ''}` : 'Will upload a file') + (checks.size ? `, checklist ${checks.size}/${checklist.length}` : '')
    : art === 'design' ? `Henle designs it (${fmtMoney(DESIGN_FEE_DEMO)} demo fee)${brief ? `: “${brief.length > 80 ? `${brief.slice(0, 80)}…` : brief}”` : ''}`
      : art === 'later' ? 'Will send the artwork later' : 'Not chosen yet'

  const dateLine = sched.mode === 'date'
    ? [['Needed by', fmtDayLong(sched.goal)], ['Final files due', sched.status === 'late' ? 'Too soon for this turnaround, so call us' : fmtDayLong(sched.submitBy)]]
    : [['Needed by', 'No date set'], ['Ready about', `${fmtDayLong(sched.earliest)} (if files arrive today)`]]

  const summary = [
    ['Product', p.label],
    ['Size', `${size.label}${p.extra ? ` · ${cfg.extra} ${p.extra.word}` : ''}`],
    ['Quantity', `${fmtQty(cfg.qty)} ${unitWord}`],
    ['Ink', `${COLOR_MODES.find((c) => c.id === cfg.color).label}${p.sidesMode === 'locked1' ? '' : cfg.sides === 2 ? ', 2-sided' : ', 1-sided'}`],
    ['Paper', p.papers[cfg.paper].label],
    ['Finishing', cfg.finishing.length ? cfg.finishing.map((f) => FINISHING[f].label).join(', ') : 'None'],
    ['Turnaround', `${est.turn.label} (${est.turn.detail})`],
    ...dateLine,
    ['Artwork', artSummary],
  ]

  const submit = (contact) => {
    setOrder({ contact, summary, number: ticketNo, at: new Date(), title: `${fmtQty(cfg.qty)} ${p.label.toLowerCase()}`, range, each: `≈ ${fmtEach(est.perPiece)}` })
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }
  const reset = () => { setOrder(null); setFile(null); setFileResult(null); setChecks(new Set()); setBrief(''); setMaxStep(0); setParams(paramsFor(makeConfig('flyers', { qty: 1000, sides: 2 })), { replace: true, preventScrollReset: true }) }

  const quickQuote = `/quote?service=${p.service(cfg.qty)}&project=${encodeURIComponent(describeJob(est).text)}`
  const isLast = stepIdx === STEPS.length - 1

  return (
    <>
      <SEO title="Project Estimator: Price, Paper & Artwork in One Place" description="Build your printing job, see a ballpark price and the date your files are due, pick paper and finishing, check your artwork, and send it to Henle in one guided flow." path="/estimator" />
      <PageHero eyebrow="Project estimator" title="Price it. Pick it. Send it." intro="Build your job and watch the price settle into a realistic range. Choose your paper and finish, check your artwork, and send it, all in one place. Prefer to just ask? Send a quick quote request instead." tone="gold" />

      <section className="est es section">
        <div className="shell">
          {order ? <OrderSheet order={order} onReset={reset} /> : (
            <>
              <nav className="es-stepper" ref={stepperRef} aria-label="Project steps">
                <ol>
                  {STEPS.map((s, i) => (
                    <li key={s.id} className={i === stepIdx ? 'is-current' : i < maxStep || (i < stepIdx) ? 'is-done' : ''}>
                      <button type="button" onClick={() => goTo(s.id)} aria-current={i === stepIdx ? 'step' : undefined}>
                        <span className="es-stepper__n">{i < stepIdx || (i < maxStep && i !== stepIdx) ? <Check aria-hidden="true" /> : i + 1}</span>
                        <b>{s.label}</b>
                      </button>
                    </li>
                  ))}
                </ol>
                <span className="es-stepper__bar" aria-hidden="true"><i style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }} /></span>
              </nav>

              {stepIdx === 0 && (
                <div className="est-presets">
                  <span>Start from a common job</span>
                  {PRESETS.map((preset) => (
                    <button type="button" key={preset.label} onClick={() => write({}, makeConfig(preset.product, preset.patch))}>
                      <Sparkles aria-hidden="true" /> {preset.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="est__layout">
                <div className="est__steps" key={stepId}>
                  {stepId === 'project' && (
                    <>
                      <Step n="A" id="est-s-product" title="What are we printing?" hint="Pick the closest match. You can fine-tune everything below.">
                        <div className="est-products" role="radiogroup" aria-labelledby="est-s-product">
                          {PRODUCT_LIST.map((prod) => {
                            const Icon = ICONS[prod.id]
                            return (
                              <Choice key={prod.id} name="est-product" value={prod.id} checked={cfg.product === prod.id} onChange={pickProduct} className="est-choice--product">
                                <Icon aria-hidden="true" />
                                <strong>{prod.label}</strong>
                                <small>{prod.blurb}</small>
                              </Choice>
                            )
                          })}
                        </div>
                      </Step>

                      <Step n="B" id="est-s-size" title="What size?" hint={p.extra ? `${p.extra.label}: ${p.extra.help}` : 'Finished size, after trimming.'}>
                        <div className="est-sizewrap">
                          <div className="est-sizes" role="radiogroup" aria-labelledby="est-s-size">
                            {p.sizes.map((s) => (
                              <Choice key={s.id} name="est-size" value={s.id} checked={cfg.size === s.id} onChange={(v) => update({ size: v })} className="est-choice--chip">
                                <strong>{s.label}</strong>
                                <small>{s.note}</small>
                              </Choice>
                            ))}
                          </div>
                          <PiecePreview product={p} size={size} cfg={cfg} />
                        </div>
                        {p.extra && (
                          <div className="est-extra">
                            <span id="est-extra-label">{p.extra.label}</span>
                            <div role="radiogroup" aria-labelledby="est-extra-label" className="est-seg">
                              {p.extra.options.map((o) => (
                                <Choice key={o} name="est-extra" value={o} checked={cfg.extra === o} onChange={(v) => update({ extra: Number(v) })} className="est-choice--seg">
                                  {o}
                                </Choice>
                              ))}
                            </div>
                          </div>
                        )}
                      </Step>

                      <Step n="C" id="est-s-qty" title="How many?" hint="Drag the slider. The curve shows what each piece costs as the run grows." className="est-step--qty">
                        <div className="est-qty">
                          <div className="est-qty__readout">
                            <button type="button" className="est-qty__step" aria-label="Fewer" onClick={() => update({ qty: p.qtySteps[Math.max(0, idx - 1)] })} disabled={idx === 0}><Minus aria-hidden="true" /></button>
                            <div className="est-qty__number">
                              <output htmlFor="est-qty-range" aria-hidden="true">{fmtQty(cfg.qty)}</output>
                              <span>{unitWord}</span>
                            </div>
                            <button type="button" className="est-qty__step" aria-label="More" onClick={() => update({ qty: p.qtySteps[Math.min(p.qtySteps.length - 1, idx + 1)] })} disabled={idx === p.qtySteps.length - 1}><Plus aria-hidden="true" /></button>
                          </div>
                          <input
                            id="est-qty-range" className="est-slider" type="range" min="0" max={p.qtySteps.length - 1} step="1" value={idx}
                            aria-label="Quantity" aria-valuetext={`${fmtQty(cfg.qty)} ${unitWord}`}
                            style={{ '--pct': `${(idx / (p.qtySteps.length - 1)) * 100}%` }}
                            onChange={(e) => update({ qty: p.qtySteps[Number(e.target.value)] })}
                          />
                          <div className="est-slider__ends" aria-hidden="true"><span>{fmtQtyShort(p.qtySteps[0])}</span><span>{fmtQtyShort(p.qtySteps.at(-1))}</span></div>
                        </div>

                        <div className="est-chart">
                          <PriceCurve series={series} vShown={vShown} qty={cfg.qty} steps={p.qtySteps} compare={compare} sweet={sweet} unitWord={p.unit} productId={p.id} />
                        </div>

                        <div className="est-insight" aria-live="polite">
                          <TrendingDown aria-hidden="true" />
                          {compare ? (
                            <p>
                              Order <b>{fmtQty(compare.big)}</b> and each {p.unit} costs <b className="est-insight__pct">{compare.pct}% less</b> than {fmtQty(compare.small)}.
                              <span>{fmtEach(ladder.find((r) => r.q === compare.small).per)} → {fmtEach(ladder.find((r) => r.q === compare.big).per)} each</span>
                            </p>
                          ) : <p>Quantity changes the price per {p.unit}. Move the slider to see it.</p>}
                        </div>

                        {nudge.kind === 'more' ? (
                          <div className="est-nudge">
                            <Star aria-hidden="true" />
                            <p>
                              <b>Order more, pay less per {p.unit}.</b> Step up to {fmtQty(nudge.target)} for {fmtMoney(nudge.extra)} more
                              ({nudge.times.toFixed(nudge.times % 1 ? 1 : 0)}× the {p.noun}) and each drops {nudge.savingPct}% to {fmtEach(nudge.per)}.
                              {nudge.sweet > nudge.target && <span> The sweet spot for this job is around {fmtQty(nudge.sweet)}.</span>}
                            </p>
                            <button type="button" className="button button--small button--dark" onClick={() => update({ qty: nudge.target })}>Use {fmtQty(nudge.target)}</button>
                          </div>
                        ) : (
                          <div className="est-nudge est-nudge--ok">
                            <Check aria-hidden="true" />
                            <p><b>You’re in the sweet spot.</b> Past {fmtQty(nudge.sweet)}, each doubling trims under 12% off the price of every {p.unit}.</p>
                          </div>
                        )}

                        <div className="est-ladder" role="group" aria-label="Quantity price ladder">
                          {ladder.map((r) => (
                            <button type="button" key={r.q} aria-pressed={r.q === cfg.qty} className={r.q === sweet ? 'is-sweet' : ''} onClick={() => update({ qty: r.q })}>
                              <b>{fmtQty(r.q)}</b>
                              <span>{fmtEach(r.per)} ea</span>
                              {r.q === sweet && <i>Sweet spot</i>}
                            </button>
                          ))}
                        </div>
                      </Step>

                      <Step n="D" id="est-s-ink" title="Ink & sides" hint="How much color, and how many sides.">
                        <div className="est-colors" role="radiogroup" aria-labelledby="est-s-ink">
                          {COLOR_MODES.map((c) => (
                            <Choice key={c.id} name="est-color" value={c.id} checked={cfg.color === c.id} onChange={(v) => update({ color: v })} className="est-choice--color">
                              <span className="est-dots" aria-hidden="true">{c.inks.map((k) => <i key={k} style={{ background: INK_COLORS[k] }} />)}</span>
                              <strong>{c.label}</strong>
                              <small>{c.detail}</small>
                            </Choice>
                          ))}
                        </div>
                        <div className="est-extra">
                          <span id="est-sides-label">Sides printed</span>
                          <div role="radiogroup" aria-labelledby="est-sides-label" className="est-seg">
                            {[1, 2].map((n) => (
                              <Choice key={n} name="est-sides" value={n} checked={cfg.sides === n} onChange={(v) => update({ sides: Number(v) })} disabled={p.sidesMode !== 'free'} className="est-choice--seg est-choice--wide">
                                {n === 1 ? '1 side' : '2 sides'}
                              </Choice>
                            ))}
                          </div>
                          {p.sidesMode !== 'free' && <small className="est-extra__note">{p.sidesNote}</small>}
                        </div>
                      </Step>

                      <Step n="E" id="est-s-turn" title="When do you need it?" hint="Add a date and we’ll work backward to the day your files are due. Standard is the best value. Rush jumps the line.">
                        <label className="es-field es-field--date">Needed by <span className="es-opt">(optional)</span>
                          <input type="date" value={neededIso} min={iso(addDays(today, 1))} onChange={(event) => write({ needed: event.target.value })} />
                        </label>
                        <div className="est-turns" role="radiogroup" aria-label="Turnaround">
                          {TURNAROUND.map((t) => (
                            <Choice key={t.id} name="est-turn" value={t.id} checked={cfg.turn === t.id} onChange={(v) => update({ turn: v })} className="est-choice--turn">
                              <strong>{t.label}</strong>
                              <small>{t.detail}</small>
                              <em>{t.pct ? `+${Math.round(t.pct * 100)}%` : 'Base price'}</em>
                            </Choice>
                          ))}
                        </div>
                        <WhenAdvice sched={sched} cfg={cfg} neededIso={neededIso} onSwitch={(turn) => update({ turn })} />
                      </Step>
                    </>
                  )}

                  {stepId === 'paper' && (
                    <PaperStep cfg={cfg} est={est} p={p} update={update} goal={goal} setGoal={(g) => write({ goal: g })} Choice={Choice} Step={Step} />
                  )}

                  {stepId === 'artwork' && (
                    <ArtworkStep
                      cfg={cfg} p={p} geo={geo} art={art} setArt={(a) => write({ art: a })}
                      checks={checks} setChecks={setChecks} file={file} setFile={setFile} fileResult={fileResult} setFileResult={setFileResult}
                      brief={brief} setBrief={setBrief} sched={sched} Step={Step}
                    />
                  )}

                  {stepId === 'send' && <SendForm onSubmit={submit} art={art} file={file} summary={summary} Step={Step} />}

                  <div className="es-nav">
                    {stepIdx > 0 ? <button type="button" className="button es-btn-ghost" onClick={back}><ChevronLeft aria-hidden="true" /> Back</button> : <span />}
                    {isLast
                      ? <button type="submit" form="es-send-form" className="button es-nav__next">Get my exact quote <ArrowRight aria-hidden="true" /></button>
                      : <button type="button" className="button es-nav__next" onClick={next}>{STEPS[stepIdx].next} <ArrowRight aria-hidden="true" /></button>}
                  </div>
                </div>

                <aside className="est-ticket" id="est-result" aria-label="Your order card">
                  <div className="est-ticket__head">
                    <span>Your project</span>
                    <span>No. {ticketNo}</span>
                  </div>
                  <div className="est-ticket__body">
                    <p className="est-ticket__label">Your range</p>
                    <p className="est-ticket__range" style={{ '--len': range.length - 1 }} aria-hidden="true">{fmtMoney(Math.round(low))}<i>–</i>{fmtMoney(Math.round(high))}</p>
                    <p className="sr-only" role="status">Ballpark {range}, about {fmtEach(est.perPiece)} each.</p>
                    <p className="est-ticket__each">
                      <b>≈ {fmtEach(each)}</b> each
                      <span>{fmtQty(est.qty)} {est.qty === 1 ? p.unit : p.noun}{fee ? ' · design included' : ''}</span>
                      {eachLabel && <span>{eachLabel} on average</span>}
                    </p>
                    <p className="est-chip"><Info aria-hidden="true" /> Demo rates · Henle’s real price list plugs in here</p>

                    <ul className="est-specs" aria-label="Job summary">
                      <li>{p.label}</li>
                      <li>{size.label}{p.extra ? ` · ${cfg.extra} ${p.extra.word}` : ''}</li>
                      <li>{COLOR_MODES.find((c) => c.id === cfg.color).label}{p.sidesMode === 'locked1' ? '' : ` · ${cfg.sides === 2 ? '2-sided' : '1-sided'}`}</li>
                      <li>{p.papers[cfg.paper].label}</li>
                      {cfg.finishing.length > 0 && <li>{cfg.finishing.map((f) => FINISHING[f].label).join(', ')}</li>}
                      <li>{est.turn.label} · {est.turn.detail}</li>
                    </ul>

                    <div className={`es-when es-when--${sched.mode === 'date' ? sched.status : 'open'}`}>
                      <CalendarCheck aria-hidden="true" />
                      <div>
                        {sched.mode === 'date' ? (
                          <>
                            <small>{sched.status === 'late' ? 'This date needs a faster option' : 'Send final files by'}</small>
                            <b>{sched.status === 'late' ? fmtDay(fromIso(neededIso)) : fmtDayLong(sched.submitBy)}</b>
                            <span>Needed by {fmtDay(sched.goal)}</span>
                          </>
                        ) : (
                          <>
                            <small>If files arrive today</small>
                            <b>Ready about {fmtDay(sched.earliest)}</b>
                            <span>Add a date to plan backward</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={`es-artline es-artline--${art || 'none'}`}>
                      <FileUp aria-hidden="true" />
                      <div><small>Artwork</small><b>{artSummary}</b></div>
                    </div>

                    <div className="est-break">
                      <h3>Where the money goes</h3>
                      <div className="est-break__bar" aria-hidden="true">
                        {[...est.breakdown, ...(fee ? [{ key: 'design', amount: fee }] : [])].filter((b) => b.amount > 0).map((b) => <i key={b.key} style={{ flexGrow: b.amount, background: PART_COLORS[b.key] || '#f15a4a' }} />)}
                      </div>
                      <ul>
                        {est.breakdown.map((b) => (
                          <li key={b.key}>
                            <i style={{ background: PART_COLORS[b.key] }} aria-hidden="true" />
                            <span>{b.label}</span>
                            <b>{fmtMoney(b.amount, { cents: est.total < 100 })}</b>
                          </li>
                        ))}
                        {fee > 0 && <li><i style={{ background: '#f15a4a' }} aria-hidden="true" /><span>Design (demo)</span><b>{fmtMoney(fee)}</b></li>}
                        <li className="est-break__total"><span>Midpoint estimate</span><b>{fmtMoney(total, { cents: est.total < 100 })}</b></li>
                      </ul>
                      {est.minApplied && <p className="est-break__note">Small runs hit Henle’s job minimum, so the per-{p.unit} price is higher here.</p>}
                    </div>
                  </div>
                  <div className="est-ticket__foot">
                    {isLast
                      ? <button type="submit" form="es-send-form" className="button est-cta">Get my exact quote <ArrowRight aria-hidden="true" /></button>
                      : <button type="button" className="button est-cta" onClick={next}>{STEPS[stepIdx].next} <ArrowRight aria-hidden="true" /></button>}
                    <p>No obligation. A real person in Marshall reviews your request. Prefer to talk? <a href="tel:+15075324493">507-532-4493</a></p>
                    <p className="es-ticket__alt">Rather just ask? <Link to={quickQuote}>Send a quick quote request</Link></p>
                    <button type="button" className="est-reset" onClick={reset}><RotateCcw aria-hidden="true" /> Start over</button>
                  </div>
                </aside>

                <div className="est-dock">
                  <div>
                    <b>{range}</b>
                    <span>≈ {fmtEach(est.perPiece + fee / est.qty)} each · {fmtQty(est.qty)} {est.qty === 1 ? p.unit : p.noun}</span>
                  </div>
                  <a className="button button--small est-dock__link" href="#est-result">Card</a>
                  {isLast
                    ? <button type="submit" form="es-send-form" className="button button--small est-dock__cta">Get quote <ArrowRight aria-hidden="true" /></button>
                    : <button type="button" className="button button--small est-dock__cta" onClick={next}>Next <ArrowRight aria-hidden="true" /></button>}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {!order && (
        <section className="est-notes">
          <div className="shell est-notes__grid">
            <div>
              <span className="eyebrow eyebrow--light">Behind the number</span>
              <h2>A ballpark you can plan around.</h2>
            </div>
            <article><h3>What’s in the range</h3><p>Press setup, file check, printing, paper, trimming, and any finishing you chose. We hold the range to roughly 10–15% either side of the midpoint.</p></article>
            <article><h3>What can move it</h3><p>Artwork that needs cleanup, design time, heavy ink coverage, special stock, delivery or shipping, and sales tax. None of those are in this estimate.</p></article>
            <article><h3>From ballpark to exact</h3><p>Send your request and a Henle specialist confirms stock, finishing, and timing, then follows up with a firm price. Prefer to skip the tool? <Link to="/quote">Request a quote directly.</Link></p></article>
          </div>
        </section>
      )}
    </>
  )
}
