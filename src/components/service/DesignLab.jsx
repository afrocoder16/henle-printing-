import { useState } from 'react'
import { ArrowRight, FileCheck2, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'

const base = import.meta.env.BASE_URL

const paths = {
  file: {
    id: 'file',
    icon: FileCheck2,
    label: 'I have a finished file',
    kicker: 'Got a great idea?',
    line: 'We’re pros at taking your finished document designs and preparing them for error-free printing.',
    steps: ['Send us the file you have', 'We check it and prepare it for press', 'You get error-free printing'],
    cta: { label: 'Upload your file', to: '/quote#upload' },
  },
  idea: {
    id: 'idea',
    icon: Lightbulb,
    label: 'I only have a rough idea',
    kicker: 'Need one?',
    line: 'If all you have is a rough idea of what you want to achieve, let our inspiration bring it to life.',
    steps: ['Tell us what you want to achieve', 'We involve you through the entire process', 'You get a finished product that helps you grow your business'],
    cta: { label: 'Start with an idea', to: '/quote?project=a%20new%20design&design=1' },
  },
}

function SketchToPress() {
  const [pos, setPos] = useState(50)
  const src = `${base}press-run/brigadoon.webp`

  return (
    <div className="dg-compare">
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <filter id="pencil-sketch" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" divisor="1" bias="0" preserveAlpha="true" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="-4" intercept="1.05" />
            <feFuncG type="linear" slope="-4" intercept="1.05" />
            <feFuncB type="linear" slope="-4" intercept="1.05" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div
        className="dg-compare__frame"
        role="group"
        aria-label="Before and after: a rough sketch becomes a finished theater poster"
      >
        <img className="dg-compare__after" src={src} alt="Finished Brigadoon theater poster printed by Henle" draggable="false" />
        <div className="dg-compare__before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={src} alt="" draggable="false" style={{ filter: 'url(#pencil-sketch)' }} />
          <span className="dg-compare__grid" />
        </div>
        <span className="dg-compare__tag dg-compare__tag--l">The rough idea</span>
        <span className="dg-compare__tag dg-compare__tag--r">Press-ready</span>
        <div className="dg-compare__handle" style={{ left: `${pos}%` }}><i aria-hidden="true">⇄</i></div>
        <input
          className="dg-compare__range"
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={pos}
          onChange={(event) => setPos(Number(event.target.value))}
          aria-label="Reveal the finished piece"
        />
      </div>
      <p className="dg-compare__hint">Drag to turn a sketch into a finished piece.</p>
    </div>
  )
}

export default function DesignLab() {
  const [active, setActive] = useState('idea')
  const path = paths[active]
  const Icon = path.icon

  return (
    <div className="dg">
      <SketchToPress />

      <div className="dg-paths">
        <span className="sp-label">Where are you starting?</span>
        <div className="dg-paths__tabs" role="group" aria-label="Choose how you’re starting">
          {Object.values(paths).map((p) => (
            <button type="button" key={p.id} className={active === p.id ? 'active' : ''} aria-pressed={active === p.id} onClick={() => setActive(p.id)}>
              <p.icon aria-hidden="true" /> {p.label}
            </button>
          ))}
        </div>

        <div className="dg-paths__panel" key={path.id}>
          <Icon className="dg-paths__icon" aria-hidden="true" />
          <h3>{path.kicker}</h3>
          <p>{path.line}</p>
          <ol>
            {path.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <Link className="button button--dark" to={path.cta.to}>{path.cta.label} <ArrowRight /></Link>
        </div>
      </div>
    </div>
  )
}
