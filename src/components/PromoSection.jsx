import { useState } from 'react'
import { ArrowRight, Check, Layers3, PackageOpen, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import RegistrationMark from './RegistrationMark'

const options = [
  {
    id: 'precise',
    label: 'Clean & precise',
    short: 'Coated stocks · crisp folds · soft-touch',
    recommendation: 'Brand collateral, presentations, and premium leave-behinds',
  },
  {
    id: 'tactile',
    label: 'Natural & tactile',
    short: 'Uncoated stocks · recycled fibers · rich ink',
    recommendation: 'Invitations, community pieces, and story-led brands',
  },
  {
    id: 'durable',
    label: 'Bold & durable',
    short: 'Vinyl · weather-ready media · rigid display',
    recommendation: 'Banners, signs, labels, and high-traffic campaigns',
  },
]

export default function PromoSection() {
  const [selected, setSelected] = useState(options[0])

  return (
    <section className={`sample-promo sample-promo--${selected.id}`} id="sample-kit">
      <div className="sample-promo__ticker" aria-hidden="true">
        <span>FEEL THE STOCK</span><i>◆</i><span>SEE THE COLOR</span><i>◆</i><span>CHOOSE THE FINISH</span><i>◆</i><span>PRINT WITH CONFIDENCE</span>
      </div>
      <div className="shell sample-promo__grid">
        <div className="sample-promo__visual reveal" aria-hidden="true">
          <div className="sample-box">
            <span className="sample-box__lid"><small>HENLE PRINTING CO.</small><strong>THE<br />SAMPLE<br />PACK</strong><i>MARSHALL, MN</i></span>
            <span className="sample-box__base" />
          </div>
          <div className="stock-card stock-card--one"><span>01</span><b>COATED</b><small>SMOOTH / BRIGHT</small></div>
          <div className="stock-card stock-card--two"><span>02</span><b>UNCOATED</b><small>TACTILE / WARM</small></div>
          <div className="stock-card stock-card--three"><span>03</span><b>SPECIALTY</b><small>BOLD / DURABLE</small></div>
          <RegistrationMark className="sample-promo__mark" />
        </div>

        <div className="sample-promo__copy reveal">
          <div className="promo-badge"><Sparkles size={15} /> Complimentary sample experience</div>
          <span className="eyebrow eyebrow--light">Feel before you print</span>
          <h2>Choose it with your hands—not your screen.</h2>
          <p>Tell us what your piece should feel like. We’ll curate real stocks, finishes, and production samples so your team can make the final call with confidence.</p>

          <div className="sample-chooser" role="group" aria-label="Choose a sample pack direction">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={selected.id === option.id ? 'active' : ''}
                aria-pressed={selected.id === option.id}
                onClick={() => setSelected(option)}
              >
                <span>{option.label}</span>
                <small>{option.short}</small>
                <i><Check size={14} /></i>
              </button>
            ))}
          </div>

          <div className="sample-result" aria-live="polite">
            <Layers3 />
            <span><small>Best starting point for</small><strong>{selected.recommendation}</strong></span>
          </div>

          <div className="sample-promo__actions">
            <Link className="button button--paper" to={`/quote?project=sample-pack&feel=${selected.id}`}>
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
