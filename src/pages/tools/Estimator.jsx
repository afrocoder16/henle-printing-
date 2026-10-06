import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Check, ClipboardList, Columns3, Flag, IdCard, Image as ImageIcon, Info, Mail,
  Minus, NotebookPen, Plus, RotateCcw, ScrollText, Sparkles, Star, TrendingDown,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import {
  COLOR_MODES, FINISHING, PAPER_IDS, PRODUCTS, PRODUCT_LIST, TURNAROUND,
  curveSeries, describeJob, estimate, fmtEach, fmtMoney, fmtQty, fmtQtyShort,
  makeConfig, nearestStepIndex, normalizeConfig, volumeInsights,
} from './pricingData'
import './estimator.css'

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
        <span className="est-step__n" aria-hidden="true">{String(n).padStart(2, '0')}</span>
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

/* ---------- page ---------- */

export default function Estimator() {
  const [cfg, setCfg] = useState(() => makeConfig('flyers', { qty: 1000, sides: 2 }))
  const p = PRODUCTS[cfg.product]
  const size = p.sizes.find((s) => s.id === cfg.size)

  const update = (patch) => setCfg((c) => normalizeConfig({ ...c, ...patch }))
  const pickProduct = (id) => setCfg((c) => makeConfig(id, { color: c.color, paper: c.paper, turn: c.turn }))
  const idx = nearestStepIndex(p.qtySteps, cfg.qty)
  const unitWord = cfg.qty === 1 ? p.unit : p.noun

  const est = useMemo(() => estimate(cfg), [cfg])
  const insights = useMemo(() => volumeInsights(cfg), [cfg])
  const series = useMemo(() => curveSeries(cfg, 64), [cfg])
  const seriesV = useMemo(() => series.map((s) => s.v), [series])
  const vShown = useTween(seriesV)
  const [low, high, each] = useTween(useMemo(() => [est.low, est.high, est.perPiece], [est]), 420)

  const job = describeJob(est)
  const quoteTo = `/quote?service=${job.service}&project=${encodeURIComponent(job.text)}`
  const ticketNo = 1000 + (hashString(JSON.stringify(cfg)) % 9000)
  const total = est.breakdown.reduce((a, b) => a + b.amount, 0)
  const range = `${fmtMoney(est.low)} – ${fmtMoney(est.high)}`
  const eachLabel = est.perSqFt && p.kind === 'large' ? `${fmtEach(est.perSqFt)} / sq ft` : null

  const groups = p.exclusive || []
  const binding = groups[0]
  const chips = p.finishing.filter((f) => !(binding || []).includes(f))
  const hasExtraFinish = cfg.finishing.some((f) => chips.includes(f))
  const toggleFinish = (id) => update({ finishing: cfg.finishing.includes(id) ? cfg.finishing.filter((f) => f !== id) : [...cfg.finishing, id] })
  const setBinding = (id) => update({ finishing: [...cfg.finishing.filter((f) => !binding.includes(f)), id] })

  const { compare, nudge, sweet, ladder } = insights
  const compareUnit = p.unit

  return (
    <>
      <SEO title="Printing Price Estimator" description="Build a business card, flyer, postcard, brochure, booklet, poster, banner, notepad, or form job and see an instant ballpark price range with volume discounts." path="/estimator" />
      <PageHero eyebrow="Ballpark estimator" title="Know the number before you call." intro="Build your job below and watch the price settle into a realistic range. It takes a minute, it’s a ballpark rather than a bid, and the quantity curve shows exactly where your money works hardest." tone="gold" />

      <section className="est section">
        <div className="shell">
          <div className="est-presets">
            <span>Start from a common job</span>
            {PRESETS.map((preset) => (
              <button type="button" key={preset.label} onClick={() => setCfg(makeConfig(preset.product, preset.patch))}>
                <Sparkles aria-hidden="true" /> {preset.label}
              </button>
            ))}
          </div>

          <div className="est__layout">
            <div className="est__steps">
              <Step n={1} id="est-s-product" title="What are we printing?" hint="Pick the closest match. You can fine-tune everything below.">
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

              <Step n={2} id="est-s-size" title="What size?" hint={p.extra ? `${p.extra.label}: ${p.extra.help}` : 'Finished size, after trimming.'}>
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

              <Step n={3} id="est-s-qty" title="How many?" hint="Drag the slider. The curve shows what each piece costs as the run grows." className="est-step--qty">
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
                      Order <b>{fmtQty(compare.big)}</b> and each {compareUnit} costs <b className="est-insight__pct">{compare.pct}% less</b> than {fmtQty(compare.small)}.
                      <span>{fmtEach(ladder.find((r) => r.q === compare.small).per)} → {fmtEach(ladder.find((r) => r.q === compare.big).per)} each</span>
                    </p>
                  ) : <p>Quantity changes the price per {compareUnit}. Move the slider to see it.</p>}
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

              <Step n={4} id="est-s-ink" title="Ink & sides" hint="How much color, and how many sides.">
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

              <Step n={5} id="est-s-paper" title="Paper" hint="The stock changes the feel and the price.">
                <div className="est-papers" role="radiogroup" aria-labelledby="est-s-paper">
                  {PAPER_IDS.map((id) => (
                    <Choice key={id} name="est-paper" value={id} checked={cfg.paper === id} onChange={(v) => update({ paper: v })} className="est-choice--paper">
                      <span className={`est-swatch est-swatch--${id}`} aria-hidden="true" />
                      <strong>{p.papers[id].label}</strong>
                      <small>{p.papers[id].detail}</small>
                    </Choice>
                  ))}
                </div>
              </Step>

              <Step n={6} id="est-s-finish" title="Finishing" hint={p.includedNote || 'Optional extras, added after printing.'}>
                {binding && (
                  <div className="est-extra est-extra--binding">
                    <span id="est-bind-label">Binding</span>
                    <div role="radiogroup" aria-labelledby="est-bind-label" className="est-seg est-seg--long">
                      {binding.map((id) => {
                        const off = (id === 'perfect' && cfg.extra < 28) || (id === 'staple' && cfg.extra > 64)
                        return (
                          <Choice key={id} name="est-binding" value={id} checked={cfg.finishing.includes(id)} onChange={setBinding} disabled={off} className="est-choice--seg est-choice--wide">
                            {FINISHING[id].label}
                          </Choice>
                        )
                      })}
                    </div>
                    <small className="est-extra__note">{cfg.extra > 64 ? 'Over 64 pages, we bind with a spine.' : cfg.extra < 28 ? 'Perfect binding needs 28 pages or more.' : FINISHING[cfg.finishing.find((f) => binding.includes(f)) || 'staple'].blurb}</small>
                  </div>
                )}
                {chips.length > 0 && (
                  <div className="est-chips" role="group" aria-label="Finishing options">
                    <button type="button" className={`est-chip-btn ${hasExtraFinish ? '' : 'is-on'}`} aria-pressed={!hasExtraFinish} onClick={() => update({ finishing: cfg.finishing.filter((f) => !chips.includes(f)) })}>
                      <Check aria-hidden="true" /> None
                    </button>
                    {chips.map((id) => (
                      <Choice key={id} type="checkbox" name="est-finish" value={id} checked={cfg.finishing.includes(id)} onChange={toggleFinish} className="est-choice--finish">
                        <Check aria-hidden="true" />
                        <strong>{FINISHING[id].label}</strong>
                        <small>{FINISHING[id].blurb}</small>
                      </Choice>
                    ))}
                  </div>
                )}
              </Step>

              <Step n={7} id="est-s-turn" title="How soon?" hint="Standard is best value. Rush jumps the line.">
                <div className="est-turns" role="radiogroup" aria-labelledby="est-s-turn">
                  {TURNAROUND.map((t) => (
                    <Choice key={t.id} name="est-turn" value={t.id} checked={cfg.turn === t.id} onChange={(v) => update({ turn: v })} className="est-choice--turn">
                      <strong>{t.label}</strong>
                      <small>{t.detail}</small>
                      <em>{t.pct ? `+${Math.round(t.pct * 100)}%` : 'Base price'}</em>
                    </Choice>
                  ))}
                </div>
              </Step>
            </div>

            <aside className="est-ticket" id="est-result" aria-label="Your ballpark estimate">
              <div className="est-ticket__head">
                <span>Ballpark estimate</span>
                <span>No. {ticketNo}</span>
              </div>
              <div className="est-ticket__body">
                <p className="est-ticket__label">Your range</p>
                <p className="est-ticket__range" style={{ '--len': range.length - 1 }} aria-hidden="true">{fmtMoney(Math.round(low))}<i>–</i>{fmtMoney(Math.round(high))}</p>
                <p className="sr-only" role="status">Ballpark {range}, about {fmtEach(est.perPiece)} each.</p>
                <p className="est-ticket__each">
                  <b>≈ {fmtEach(each)}</b> each
                  <span>{fmtEach(est.perLow)}–{fmtEach(est.perHigh)} · {fmtQty(est.qty)} {est.qty === 1 ? p.unit : p.noun}</span>
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

                <div className="est-break">
                  <h3>Where the money goes</h3>
                  <div className="est-break__bar" aria-hidden="true">
                    {est.breakdown.filter((b) => b.amount > 0).map((b) => <i key={b.key} style={{ flexGrow: b.amount, background: PART_COLORS[b.key] }} />)}
                  </div>
                  <ul>
                    {est.breakdown.map((b) => (
                      <li key={b.key}>
                        <i style={{ background: PART_COLORS[b.key] }} aria-hidden="true" />
                        <span>{b.label}</span>
                        <b>{fmtMoney(b.amount, { cents: est.total < 100 })}</b>
                      </li>
                    ))}
                    <li className="est-break__total"><span>Midpoint estimate</span><b>{fmtMoney(total, { cents: est.total < 100 })}</b></li>
                  </ul>
                  {est.minApplied && <p className="est-break__note">Small runs hit Henle’s job minimum, so the per-{p.unit} price is higher here.</p>}
                </div>
              </div>
              <div className="est-ticket__foot">
                <Link className="button est-cta" to={quoteTo}>Get an exact quote <ArrowRight aria-hidden="true" /></Link>
                <p>No obligation. A real person in Marshall reviews your request. Prefer to talk? <a href="tel:+15075324493">507-532-4493</a></p>
                <button type="button" className="est-reset" onClick={() => setCfg(makeConfig(cfg.product))}><RotateCcw aria-hidden="true" /> Reset this job</button>
              </div>
            </aside>

            <div className="est-dock">
              <div>
                <b>{range}</b>
                <span>≈ {fmtEach(est.perPiece)} each · {fmtQty(est.qty)} {est.qty === 1 ? p.unit : p.noun}</span>
              </div>
              <a className="button button--small est-dock__link" href="#est-result">Breakdown</a>
              <Link className="button button--small est-dock__cta" to={quoteTo}>Exact quote <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="est-notes">
        <div className="shell est-notes__grid">
          <div>
            <span className="eyebrow eyebrow--light">Behind the number</span>
            <h2>A ballpark you can plan around.</h2>
          </div>
          <article><h3>What’s in the range</h3><p>Press setup, file check, printing, paper, trimming, and any finishing you chose. We hold the range to roughly 10–15% either side of the midpoint.</p></article>
          <article><h3>What can move it</h3><p>Artwork that needs cleanup, design time, heavy ink coverage, special stock, delivery or shipping, and sales tax. None of those are in this estimate.</p></article>
          <article><h3>From ballpark to exact</h3><p>Send your quote request and a Henle specialist confirms stock, finishing, and timing, then follows up with a firm price.</p></article>
        </div>
      </section>
    </>
  )
}
