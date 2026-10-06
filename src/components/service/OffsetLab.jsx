import { useState } from 'react'

const base = `${import.meta.env.BASE_URL}press-run/`
const PLATES = ['k', 'c', 'm', 'y']

const steps = [
  { n: 1, title: 'One color', note: 'Black ink on its own. Clean, quick, and cost-effective.', plates: ['Black'] },
  { n: 2, title: 'Two colors', note: 'Add a second ink. The cyan lays down over the black.', plates: ['Black', 'Cyan'] },
  { n: 3, title: 'Three colors', note: 'Magenta joins in and the picture starts to warm up.', plates: ['Black', 'Cyan', 'Magenta'] },
  { n: 4, title: 'Four-color process', note: 'Cyan, magenta, yellow, and black combine into full color.', plates: ['Black', 'Cyan', 'Magenta', 'Yellow'] },
  { n: 5, title: 'Five colors', note: 'A fifth unit adds a spot ink or a metallic—see the gold edge.', plates: ['Four-color process', 'Spot ink'] },
  { n: 6, title: 'Six colors', note: 'A sixth unit puts down a coating or a second spot. Watch it shine.', plates: ['Four-color process', 'Spot ink', 'Coating'] },
]

export default function OffsetLab() {
  const [n, setN] = useState(1)
  const step = steps[n - 1]
  const shown = PLATES.slice(0, Math.min(n, 4))

  return (
    <div className="ox">
      <div className="ox-grid">
        <div className="ox-stage">
          <div className={`ox-sheet ox-sheet--${n}`}>
            {PLATES.map((plate) => (
              <img
                key={plate}
                className={`ox-plate ox-plate--${plate} ${shown.includes(plate) ? 'is-on' : ''}`}
                src={`${base}fall-guide-${plate}.webp`}
                alt=""
                width="724"
                height="1108"
                draggable="false"
              />
            ))}
            {n >= 5 && <span className="ox-spot" />}
            {n >= 6 && <span className="ox-coat" />}
          </div>
          <div className="ox-colorbar" aria-hidden="true">
            {['#00aeef', '#ec008c', '#ffe600', '#231f20', '#c9a043', '#dfe9ee'].map((color, i) => (
              <i key={color} style={{ background: color, opacity: i < n ? 1 : 0.14 }} />
            ))}
          </div>
        </div>

        <div className="ox-copy">
          <span className="sp-label">Run it through the press</span>
          <h3 aria-live="polite"><span>{n}</span> {step.title}</h3>
          <p aria-live="polite">{step.note}</p>

          <div className="ox-dial">
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={n}
              onChange={(event) => setN(Number(event.target.value))}
              aria-label="Number of colors"
              aria-valuetext={`${n} ${n === 1 ? 'color' : 'colors'}: ${step.title}`}
            />
            <div className="ox-dial__ticks" aria-hidden="true">
              {steps.map((s) => <button type="button" key={s.n} tabIndex="-1" className={s.n <= n ? 'on' : ''} onClick={() => setN(s.n)}>{s.n}</button>)}
            </div>
          </div>

          <ul className="ox-inks" aria-label="Inks on this sheet">
            {step.plates.map((plate) => <li key={plate}>{plate}</li>)}
          </ul>

          <div className="ox-presses">
            <span className="sp-label">Five presses · one pressroom</span>
            <div className="ox-presses__row" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((press) => (
                <span key={press} style={{ '--i': press }}><i /><i /><i />{press}</span>
              ))}
            </div>
            <p>Each with its own specialty—and even letterpress and die cuts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
