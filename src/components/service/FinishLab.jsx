import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const finishes = [
  { id: 'coating', label: 'Protective coatings', line: 'Armor for the surface. Scuffs, fingerprints, and wear stay away.', tip: 'Left: bare. Right: coated.' },
  { id: 'diecut', label: 'Die cuts', line: 'A custom shape, cut clean—so the piece stands out before it’s even read.', tip: 'Watch the shape lift out.' },
  { id: 'emboss', label: 'Embossing', line: 'Raised detail you can feel with your thumb.', tip: 'Light from the top left.' },
  { id: 'staple', label: 'Stapling & booklets', line: 'Simple stapling—made on our Horizon booklet maker.', tip: 'Pages fold, the staple goes in.' },
  { id: 'hardcover', label: 'Hardcover binding', line: 'The top of our list: bound to last.', tip: 'Open it.' },
]

function Scene({ id }) {
  switch (id) {
    case 'coating':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="A card, bare on the left and coated on the right">
          <rect x="50" y="26" width="220" height="168" fill="#f4ecd6" stroke="#102a43" strokeOpacity=".15" />
          <text x="160" y="132" textAnchor="middle" className="fx-h">H</text>
          <g stroke="#102a43" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round">
            <path d="M62 52 92 70M74 150 112 138M66 98 88 104M98 176 124 160M120 60 140 78" />
          </g>
          <clipPath id="fx-coat"><rect x="160" y="26" width="110" height="168" /></clipPath>
          <g clipPath="url(#fx-coat)">
            <rect x="160" y="26" width="110" height="168" fill="#fff" opacity=".18" />
            <rect className="fx-shine" x="-40" y="10" width="38" height="200" fill="#fff" opacity=".75" transform="skewX(-18)" />
          </g>
          <line x1="160" y1="22" x2="160" y2="198" stroke="#00aeef" strokeWidth="2" strokeDasharray="5 4" />
        </svg>
      )
    case 'diecut':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="A die-cut shape lifting out of a card">
          <rect x="50" y="26" width="220" height="168" fill="#f4ecd6" stroke="#102a43" strokeOpacity=".15" />
          <path className="fx-trace" d="M160 62c26 0 46 18 46 44 0 30-24 52-46 62-22-10-46-32-46-62 0-26 20-44 46-44Z" fill="none" stroke="#f15a4a" strokeWidth="3" strokeDasharray="6 6" />
          <g className="fx-lift">
            <path d="M160 62c26 0 46 18 46 44 0 30-24 52-46 62-22-10-46-32-46-62 0-26 20-44 46-44Z" fill="#f15a4a" />
            <text x="160" y="124" textAnchor="middle" className="fx-h fx-h--small">H</text>
          </g>
        </svg>
      )
    case 'emboss':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="A raised letter H embossed into a card">
          <rect x="50" y="26" width="220" height="168" fill="#efe4cc" stroke="#102a43" strokeOpacity=".15" />
          <g className="fx-raise">
            <text x="160" y="134" textAnchor="middle" className="fx-h fx-h--shadow">H</text>
            <text x="160" y="134" textAnchor="middle" className="fx-h fx-h--light">H</text>
            <text x="160" y="134" textAnchor="middle" className="fx-h fx-h--paper">H</text>
          </g>
        </svg>
      )
    case 'staple':
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="Pages folding into a stapled booklet">
          <g className="fx-book">
            <rect x="94" y="40" width="132" height="150" fill="#e9e2d3" />
            <rect x="100" y="34" width="132" height="150" fill="#f7f6f1" />
            <rect className="fx-page" x="160" y="28" width="76" height="150" fill="#fffefa" />
            <rect x="104" y="30" width="56" height="150" fill="#102a43" />
            <text x="132" y="116" textAnchor="middle" className="fx-h fx-h--small fx-h--light2">H</text>
            <rect className="fx-staple" x="157" y="64" width="6" height="22" fill="#9aa5ae" />
            <rect className="fx-staple" x="157" y="126" width="6" height="22" fill="#9aa5ae" />
          </g>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 320 220" role="img" aria-label="A hardcover book opening">
          <rect x="84" y="36" width="160" height="150" fill="#e9e2d3" />
          <rect x="84" y="186" width="160" height="6" fill="#102a43" opacity=".25" />
          <g className="fx-cover">
            <rect x="70" y="30" width="166" height="158" fill="#102a43" />
            <rect x="70" y="30" width="12" height="158" fill="#0a1d30" />
            <rect x="104" y="64" width="98" height="3" fill="#f2b134" />
            <text x="153" y="116" textAnchor="middle" className="fx-h fx-h--gold">H</text>
            <rect x="104" y="150" width="98" height="3" fill="#f2b134" />
          </g>
        </svg>
      )
  }
}

export default function FinishLab() {
  const [active, setActive] = useState('coating')
  const current = finishes.find((f) => f.id === active)

  return (
    <div className="fx">
      <div className="fx-bench">
        <div className="fx-stage" key={active}>
          <Scene id={active} />
          <span className="fx-tip">{current.tip}</span>
        </div>
        <div className="fx-copy">
          <span className="sp-label">Pick a finish</span>
          <h3>{current.label}</h3>
          <p aria-live="polite">{current.line}</p>
          <Link className="button button--dark" to="/quote?service=finishing">Add it to my quote <ArrowRight /></Link>
        </div>
      </div>
      <div className="fx-tabs" role="group" aria-label="Finishing options">
        {finishes.map((f, i) => (
          <button type="button" key={f.id} className={active === f.id ? 'active' : ''} aria-pressed={active === f.id} onClick={() => setActive(f.id)}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
