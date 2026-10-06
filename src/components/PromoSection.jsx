import { useRef, useState } from 'react'
import { ArrowRight, Check, Gem, Hand, Layers3, PackageOpen, RotateCcw, Sparkles, Stamp } from 'lucide-react'
import { Link } from 'react-router-dom'
import RegistrationMark from './RegistrationMark'

const options = [
  {
    id: 'precise',
    label: 'Clean & precise',
    short: 'Coated stocks · crisp folds · soft-touch',
    stock: 'Coated cover',
    feel: 'Smooth, bright, crisp',
    recommendation: 'Brand collateral, presentations, and premium leave-behinds',
  },
  {
    id: 'tactile',
    label: 'Natural & tactile',
    short: 'Uncoated stocks · recycled fibers · rich ink',
    stock: 'Uncoated cover',
    feel: 'Warm, toothy, natural',
    recommendation: 'Invitations, community pieces, and story-led brands',
  },
  {
    id: 'durable',
    label: 'Bold & durable',
    short: 'Vinyl · weather-ready media · rigid display',
    stock: 'Synthetic / vinyl',
    feel: 'Tough, saturated, weatherproof',
    recommendation: 'Banners, signs, labels, and high-traffic campaigns',
  },
]

const finishes = [
  { id: 'softtouch', label: 'Soft-touch', note: 'Velvety, glare-free', icon: Hand },
  { id: 'spotuv', label: 'Spot UV', note: 'Gloss that catches light', icon: Sparkles },
  { id: 'foil', label: 'Gold foil', note: 'Metallic that moves', icon: Gem },
  { id: 'emboss', label: 'Emboss', note: 'Raised, you can feel it', icon: Stamp },
]

export default function PromoSection() {
  const [selected, setSelected] = useState(options[0])
  const [active, setActive] = useState(['foil'])
  const [flipped, setFlipped] = useState(false)
  const [touched, setTouched] = useState(false)
  const sheetRef = useRef(null)
  const frame = useRef(0)

  const toggleFinish = (id) => setActive((list) => (list.includes(id) ? list.filter((f) => f !== id) : [...list, id]))
  const chosen = finishes.filter((f) => active.includes(f.id))

  // Tilt the sheet toward the pointer and move the light with it.
  const onMove = (event) => {
    const sheet = sheetRef.current
    if (!sheet) return
    const rect = sheet.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      sheet.style.setProperty('--mx', `${x * 100}%`)
      sheet.style.setProperty('--my', `${y * 100}%`)
      sheet.style.setProperty('--ry', `${(x - 0.5) * 22}deg`)
      sheet.style.setProperty('--rx', `${(0.5 - y) * 18}deg`)
    })
    if (!touched) setTouched(true)
  }

  const onLeave = () => {
    cancelAnimationFrame(frame.current)
    const sheet = sheetRef.current
    if (!sheet) return
    ;['--mx', '--my', '--rx', '--ry'].forEach((prop) => sheet.style.removeProperty(prop))
    setTouched(false)
  }

  const finishParam = active.length ? `&finish=${active.join(',')}` : ''

  return (
    <section className={`sample-promo sample-promo--${selected.id}`} id="sample-kit">
      <div className="sample-promo__ticker" aria-hidden="true">
        <span>FEEL THE STOCK</span><i>◆</i><span>SEE THE COLOR</span><i>◆</i><span>CHOOSE THE FINISH</span><i>◆</i><span>PRINT WITH CONFIDENCE</span>
      </div>
      <div className="shell sample-promo__grid">
        <div className="sample-lab reveal">
          <div className="sample-lab__swatches" aria-hidden="true">
            {options.map((option, i) => (
              <span key={option.id} className={`lab-swatch lab-swatch--${option.id} ${selected.id === option.id ? 'is-active' : ''}`} style={{ '--n': i }}>
                <b>{option.stock}</b>
              </span>
            ))}
          </div>

          <div className={`lab-stage ${touched ? '' : 'is-idle'}`} onPointerMove={onMove} onPointerLeave={onLeave}>
            <button
              type="button"
              ref={sheetRef}
              className={`lab-sheet lab-sheet--${selected.id} ${active.map((f) => `has-${f}`).join(' ')} ${flipped ? 'is-flipped' : ''}`}
              onClick={() => setFlipped(!flipped)}
              aria-label={`Sample sheet: ${selected.stock}${chosen.length ? ` with ${chosen.map((f) => f.label).join(', ')}` : ''}. Click to ${flipped ? 'see the front' : 'flip it over'}.`}
            >
              <span className="lab-flipper">
              <span className="lab-sheet__face lab-sheet__front">
                <span className="lab-sheet__paper" />
                <span className="lab-sheet__uv" />
                <span className="lab-sheet__top"><small>Henle Printing Co.</small><small>Sample Nº 0{options.indexOf(selected) + 1}</small></span>
                <span className="lab-sheet__mark">H</span>
                <span className="lab-sheet__headline">Feel the<br />difference.</span>
                <span className="lab-sheet__bottom"><small>{selected.stock}</small><small>{chosen.length ? chosen.map((f) => f.label).join(' + ') : 'No finish'}</small></span>
                <span className="lab-sheet__glare" />
              </span>
              <span className="lab-sheet__face lab-sheet__back">
                <small>Your sample kit</small>
                <strong>{selected.label}</strong>
                <span className="lab-kit">
                  <span><b>Stock</b>{selected.stock}</span>
                  <span><b>Feel</b>{selected.feel}</span>
                  <span><b>Finishes</b>{chosen.length ? chosen.map((f) => f.label).join(', ') : 'Your call'}</span>
                  <span><b>Best for</b>{selected.recommendation}</span>
                </span>
                <em><RotateCcw size={13} /> Tap to flip back</em>
              </span>
              </span>
            </button>
          </div>
          <p className="lab-hint" aria-hidden="true">{flipped ? 'Click the sheet to flip it back' : 'Hover or drag across the sheet to catch the light · tap to flip'}</p>
          <RegistrationMark className="sample-promo__mark" />
        </div>

        <div className="sample-promo__copy reveal">
          <div className="promo-badge"><Sparkles size={15} /> Complimentary sample experience</div>
          <span className="eyebrow eyebrow--light">Feel before you print</span>
          <h2>Choose it with your hands—not your screen.</h2>
          <p>Pick a direction and stack the finishes—watch them land on the sheet. Then we’ll send real stocks and finishes so your team can make the final call in hand.</p>

          <span className="sample-step">1 · Choose the stock</span>
          <div className="sample-chooser" role="group" aria-label="Choose a sample pack direction">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={selected.id === option.id ? 'active' : ''}
                aria-pressed={selected.id === option.id}
                onClick={() => { setSelected(option); setFlipped(false) }}
              >
                <span>{option.label}</span>
                <small>{option.short}</small>
                <i><Check size={14} /></i>
              </button>
            ))}
          </div>

          <span className="sample-step">2 · Add finishes</span>
          <div className="finish-chooser" role="group" aria-label="Add finishes to the sample">
            {finishes.map(({ id, label, note, icon: Icon }) => (
              <button key={id} type="button" className={active.includes(id) ? 'active' : ''} aria-pressed={active.includes(id)} onClick={() => { toggleFinish(id); setFlipped(false) }}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
                <small>{note}</small>
              </button>
            ))}
          </div>

          <div className="sample-result" aria-live="polite">
            <Layers3 />
            <span>
              <small>Best starting point for</small>
              <strong>{selected.recommendation}</strong>
            </span>
          </div>

          <div className="sample-promo__actions">
            <Link className="button button--paper" to={`/quote?project=sample-pack&feel=${selected.id}${finishParam}`}>
              Request my sample pack <PackageOpen />
            </Link>
            <Link className="sample-promo__link" to="/contact">Talk through a project <ArrowRight /></Link>
          </div>
        </div>
      </div>
      <div className="sample-promo__includes">
        <div className="shell">
          <span><Check /> Curated paper samples</span>
          <span><Check /> Real finishing examples</span>
          <span><Check /> A recommendation from a print specialist</span>
        </div>
      </div>
    </section>
  )
}
