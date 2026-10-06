import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import CountUp from '../CountUp'

const INKS = ['#00aeef', '#ec008c', '#ffe600', '#231f20', '#00aeef', '#ec008c', '#ffe600']
const COLS = 150
const ROWS = INKS.length

// A print head's worth of nozzles firing in a wave. Pauses when off screen or when motion is reduced.
function NozzleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const W = 1500
    const H = 190
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    let frame = 0
    let visible = true

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)
      const stepX = W / COLS
      const stepY = H / (ROWS + 1)
      for (let j = 0; j < ROWS; j += 1) {
        for (let i = 0; i < COLS; i += 1) {
          const wave = Math.sin(i * 0.11 - t * 0.0028 + j * 0.55)
          const a = Math.max(0, wave) ** 3
          ctx.globalAlpha = 0.18 + a * 0.82
          ctx.fillStyle = INKS[j]
          ctx.beginPath()
          ctx.arc(stepX * (i + 0.5), stepY * (j + 1) + a * 7, 1.8 + a * 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = (t) => {
      if (visible) draw(t)
      frame = requestAnimationFrame(loop)
    }

    if (still) draw(2200)
    else frame = requestAnimationFrame(loop)

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    observer.observe(canvas)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className="ij-nozzles" aria-hidden="true" />
}

const LINES = Array.from({ length: 34 }, (_, i) => i)
const TEXT = 'Perfect from first to last page. Henle Printing Company, Marshall, Minnesota. '.repeat(6)

function TinyType() {
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState([22, 18])

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setOrigin([((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100])
  }

  return (
    <div className="ij-card">
      <div className="ij-card__head">
        <span className="sp-label">Test 01 · Sharpness</span>
        <h3>Zoom in on 2-point type.</h3>
        <p>That gray block is real small print—set at 2-point. Slide to zoom, and move your cursor to look around.</p>
      </div>
      <div className="ij-sheet" onPointerMove={onMove}>
        <div className="ij-sheet__inner" style={{ transform: `scale(${zoom})`, transformOrigin: `${origin[0]}% ${origin[1]}%` }} aria-hidden="true">
          {LINES.map((line) => <p key={line} style={{ opacity: line % 7 === 3 ? 0.55 : 1 }}>{TEXT}</p>)}
        </div>
        <span className="ij-sheet__badge">{zoom.toFixed(1)}×</span>
      </div>
      <label className="ij-slider">
        <span>1×</span>
        <input type="range" min="1" max="18" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Zoom level" />
        <span>18×</span>
      </label>
    </div>
  )
}

const RUN = [1, 10, 100, 1000, 5000, 10000, 25000, 50000]

function FirstToLast() {
  const [step, setStep] = useState(0)
  const [spot, setSpot] = useState(false)
  const sheet = RUN[step]

  return (
    <div className="ij-card ij-card--run">
      <div className="ij-card__head">
        <span className="sp-label">Test 02 · Consistency</span>
        <h3>Perfect from first to last page.</h3>
        <p>Drag through the run. Then try to spot the difference.</p>
      </div>
      <div className={`ij-proof ${spot ? 'is-spotting' : ''}`}>
        <div className="ij-proof__sheets" aria-hidden="true">
          {(spot ? [1, sheet] : [sheet]).map((n, i) => (
            <div className="ij-proof__sheet" key={`${i}-${n}`}>
              <img src={`${import.meta.env.BASE_URL}pics/new-logo.png`} alt="" />
              <strong>Perfect<br />from first<br />to last.</strong>
              <span className="ij-proof__bars"><i /><i /><i /><i /></span>
              <em>Sheet {n.toLocaleString()}</em>
            </div>
          ))}
        </div>
        <div className="ij-proof__side">
          <b>Sheet {sheet.toLocaleString()}</b>
          <small>looks exactly like sheet 1</small>
          <button type="button" className="ij-spot" aria-pressed={spot} onClick={() => setSpot(!spot)}>
            {spot ? <EyeOff size={16} /> : <Eye size={16} />} {spot ? 'Hide the comparison' : 'Spot the difference'}
          </button>
          {spot && <p className="ij-spot__result" role="status">No difference found. That’s the point.</p>}
        </div>
      </div>
      <label className="ij-slider">
        <span>Sheet 1</span>
        <input type="range" min="0" max={RUN.length - 1} step="1" value={step} onChange={(event) => setStep(Number(event.target.value))} aria-label="Position in the print run" aria-valuetext={`Sheet ${sheet.toLocaleString()}`} />
        <span>50,000</span>
      </label>
    </div>
  )
}

export default function InkjetLab() {
  return (
    <div className="ij">
      <div className="ij-hero">
        <span className="sp-label sp-label--light">Meet the print head</span>
        <div className="ij-hero__count">
          <CountUp end={130000} duration={2600} group suffix="+" label="over 130,000 nozzles" />
          <span>nozzles. Firing in formation.</span>
        </div>
        <NozzleField />
      </div>
      <div className="ij-grid">
        <TinyType />
        <FirstToLast />
      </div>
    </div>
  )
}
