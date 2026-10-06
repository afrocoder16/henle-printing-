import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, Download, Scissors, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import { BLEED, SAFE, PPI, checklist, faqs, pixels, templateHref, templates } from './templateData'
import './tools.css'

const U = 100 // SVG units per inch

// A to-scale diagram of a print file: bleed, trim, and safe zone, with a sample design.
function BleedDiagram({ tpl, bleed, extend, risky, trimmed, layers }) {
  const b = bleed * U
  const W = tpl.w * U
  const H = tpl.h * U
  const pad = 64
  const docW = W + 2 * b
  const docH = H + 2 * b
  const x0 = pad
  const y0 = pad
  const tx = x0 + b
  const ty = y0 + b
  const safe = SAFE * U
  const drift = 8
  const r = Math.min(W, H) * 0.3
  const fontBig = Math.min(W * 0.2, H * 0.3)

  const art = (
    <g clipPath={extend ? undefined : 'url(#clip-trim)'}>
      <rect x={x0} y={y0} width={docW} height={docH} fill="#f15a4a" />
      <rect x={x0} y={ty + H * 0.72} width={docW} height={H * 0.28 + b} fill="#102a43" />
      <circle cx={tx + W - r * 0.35} cy={ty + r * 0.35} r={r} fill="#f2b134" />
      <circle cx={tx + W - r * 0.35} cy={ty + r * 0.35} r={r * 0.55} fill="none" stroke="#102a43" strokeWidth="5" />
    </g>
  )

  const content = (
    <g>
      <text x={tx + safe + 6} y={ty + safe + fontBig * 0.82} fontSize={fontBig} fontWeight="700" fill="#fffefa" fontFamily="Fraunces, Georgia, serif" letterSpacing="-3">Henle</text>
      <text x={tx + safe + 6} y={ty + H * 0.72 + (H * 0.28) / 2 + 6} fontSize={Math.max(14, Math.min(W, H) * 0.08)} fontWeight="800" fill="#fffefa" letterSpacing="3">PRINTING COMPANY</text>
      {risky && (
        <text x={tx + 5} y={ty + H * 0.5} fontSize={Math.max(13, Math.min(W, H) * 0.07)} fontWeight="800" fill="#fffefa">Marshall, Minnesota ←</text>
      )}
    </g>
  )

  if (trimmed) {
    const px = tx + drift
    const py = ty + drift
    return (
      <svg className="tl-diagram" viewBox={`0 0 ${docW + pad * 2} ${docH + pad * 2}`} role="img" aria-label={`The ${tpl.title} after trimming${extend ? '' : ', with a white sliver visible on the right and bottom edges because the background did not extend into the bleed'}${risky ? ', with a line of text cut off at the left edge' : ''}`}>
        <defs>
          <clipPath id="clip-trim"><rect x={tx} y={ty} width={W} height={H} /></clipPath>
          <clipPath id="clip-cut"><rect x={px} y={py} width={W} height={H} /></clipPath>
          <filter id="drop" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity=".35" /></filter>
        </defs>
        <rect x="0" y="0" width={docW + pad * 2} height={docH + pad * 2} fill="#1b3b57" />
        <g filter="url(#drop)">
          <rect x={px} y={py} width={W} height={H} fill="#fffefa" />
          <g clipPath="url(#clip-cut)">{art}{content}</g>
        </g>
        <text x={(docW + pad * 2) / 2} y={docH + pad * 2 - 20} textAnchor="middle" fontSize="20" fontWeight="800" fill="#93a5b3" letterSpacing="3">AFTER TRIMMING</text>
      </svg>
    )
  }

  return (
    <svg className="tl-diagram" viewBox={`0 0 ${docW + pad * 2} ${docH + pad * 2}`} role="img" aria-label={`${tpl.title} file diagram: ${tpl.w} by ${tpl.h} inch trim, ${bleed} inch bleed, ${SAFE} inch safe zone`}>
      <defs>
        <clipPath id="clip-trim"><rect x={tx} y={ty} width={W} height={H} /></clipPath>
      </defs>
      <rect x={x0} y={y0} width={docW} height={docH} fill="#fffefa" />
      {art}
      {content}
      {layers.bleed && <rect x={x0} y={y0} width={docW} height={docH} fill="none" stroke="#f15a4a" strokeWidth="3" />}
      {layers.trim && <rect x={tx} y={ty} width={W} height={H} fill="none" stroke="#fffefa" strokeWidth="5" />}
      {layers.trim && <rect x={tx} y={ty} width={W} height={H} fill="none" stroke="#0a1d30" strokeWidth="2.5" />}
      {layers.safe && <rect x={tx + safe} y={ty + safe} width={W - 2 * safe} height={H - 2 * safe} fill="none" stroke="#7dffb0" strokeWidth="3" strokeDasharray="12 8" />}
      {tpl.folds.map((f) => <line key={f} x1={tx + W * f} y1={y0 - 14} x2={tx + W * f} y2={y0 + docH + 14} stroke="#00a6c8" strokeWidth="2.5" strokeDasharray="10 7" />)}
      <g fontSize="19" fontWeight="800" letterSpacing="1">
        <text x={x0 + docW / 2} y={y0 - 20} textAnchor="middle" fill="#bdc9d2">{(tpl.w + 2 * bleed).toFixed(3).replace(/\.?0+$/, '')} in with bleed</text>
        <text x={x0 - 22} y={y0 + docH / 2} textAnchor="middle" fill="#bdc9d2" transform={`rotate(-90 ${x0 - 22} ${y0 + docH / 2})`}>{(tpl.h + 2 * bleed).toFixed(3).replace(/\.?0+$/, '')} in</text>
      </g>
    </svg>
  )
}

function BleedExplorer() {
  const [id, setId] = useState('business-card')
  const [extend, setExtend] = useState(true)
  const [risky, setRisky] = useState(false)
  const [trimmed, setTrimmed] = useState(false)
  const [layers, setLayers] = useState({ bleed: true, trim: true, safe: true })
  const tpl = templates.find((t) => t.id === id)
  const fmt = (n) => Number(n.toFixed(3)).toString()

  return (
    <div className="tl-bleed">
      <div className="tl-bleed__stage">
        <BleedDiagram tpl={tpl} bleed={BLEED} extend={extend} risky={risky} trimmed={trimmed} layers={layers} />
        <div className="tl-bleed__legend" aria-hidden="true">
          <span><i style={{ background: '#f15a4a' }} />Bleed</span>
          <span><i style={{ background: '#fffefa', boxShadow: 'inset 0 0 0 2px #0a1d30' }} />Trim</span>
          <span><i style={{ background: '#7dffb0' }} />Safe zone</span>
        </div>
      </div>

      <div className="tl-bleed__panel">
        <span className="tl-label tl-label--light">Try it</span>
        <h3>See what the cutter sees.</h3>
        <label className="tl-field">Piece
          <select value={id} onChange={(event) => { setId(event.target.value); setTrimmed(false) }}>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>

        <dl className="tl-specs">
          <div><dt>Set up your file at</dt><dd>{fmt(tpl.w + 2 * BLEED)} × {fmt(tpl.h + 2 * BLEED)} in<small>{pixels(tpl.w)} × {pixels(tpl.h)} px at {PPI} ppi</small></dd></div>
          <div><dt>Final trimmed size</dt><dd>{fmt(tpl.w)} × {fmt(tpl.h)} in</dd></div>
          <div><dt>Keep text inside</dt><dd>{fmt(tpl.w - 2 * SAFE)} × {fmt(tpl.h - 2 * SAFE)} in</dd></div>
        </dl>

        <div className="tl-switches">
          <label className="tl-switch"><input type="checkbox" checked={extend} onChange={(event) => { setExtend(event.target.checked); setTrimmed(false) }} /><span /> Extend the background into the bleed</label>
          <label className="tl-switch"><input type="checkbox" checked={risky} onChange={(event) => { setRisky(event.target.checked); setTrimmed(false) }} /><span /> Put a line of text too close to the edge</label>
        </div>

        {!trimmed && (
          <fieldset className="tl-layers">
            <legend>Show guides</legend>
            {[['bleed', 'Bleed'], ['trim', 'Trim'], ['safe', 'Safe']].map(([key, label]) => (
              <label key={key}><input type="checkbox" checked={layers[key]} onChange={(event) => setLayers({ ...layers, [key]: event.target.checked })} /> {label}</label>
            ))}
          </fieldset>
        )}

        <button type="button" className="button tl-trim" onClick={() => setTrimmed(!trimmed)} aria-pressed={trimmed}>
          <Scissors /> {trimmed ? 'Back to the file' : 'Trim it'}
        </button>
        <p className="tl-bleed__result" role="status" aria-live="polite">
          {trimmed
            ? [!extend && 'White slivers appear where there was no bleed.', risky && 'The text near the edge got clipped.', extend && !risky && 'Clean edges. Nothing important was lost.'].filter(Boolean).join(' ')
            : 'No cut is perfectly exact. Press “Trim it” to see a cutter that’s a hair off.'}
        </p>
      </div>
    </div>
  )
}

function Checklist() {
  const [done, setDone] = useState(() => new Set())
  const total = checklist.length
  const pct = done.size / total
  const circumference = 2 * Math.PI * 44

  const toggle = (id) => setDone((set) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <div className="tl-check">
      <div className="tl-check__ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(16,42,67,.12)" strokeWidth="9" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={pct === 1 ? '#1c8a4a' : '#f15a4a'} strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset .5s ease, stroke .3s ease' }} />
        </svg>
        <div><b>{done.size}</b><span>of {total}</span></div>
      </div>
      <div className="tl-check__list">
        <ul>
          {checklist.map((item) => (
            <li key={item.id} className={done.has(item.id) ? 'is-done' : ''}>
              <label>
                <input type="checkbox" checked={done.has(item.id)} onChange={() => toggle(item.id)} />
                <span className="tl-check__box" aria-hidden="true"><Check /></span>
                <span className="tl-check__text"><b>{item.title}</b><small>{item.hint}</small></span>
              </label>
            </li>
          ))}
        </ul>
        <div className={`tl-check__done ${pct === 1 ? 'is-on' : ''}`} role="status" aria-live="polite">
          {pct === 1 ? (
            <>
              <ShieldCheck /> <span><b>Your file is ready to send.</b> Upload it with your quote request.</span>
              <Link className="button" to="/quote#upload">Upload your file <ArrowUpRight /></Link>
            </>
          ) : (
            <span>Check everything off and we’ll tell you when it’s ready. Not sure about one? <Link to="/graphic-design">Our designers can prepare your file.</Link></span>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniTemplate({ tpl }) {
  const scale = 100 / Math.max(tpl.w, tpl.h)
  const w = tpl.w * scale
  const h = tpl.h * scale
  const b = BLEED * scale
  return (
    <svg viewBox="-6 -6 112 112" aria-hidden="true" className="tl-mini">
      <rect x={50 - w / 2 - b} y={50 - h / 2 - b} width={w + 2 * b} height={h + 2 * b} fill="#fbe0dc" stroke="#f15a4a" strokeWidth=".8" />
      <rect x={50 - w / 2} y={50 - h / 2} width={w} height={h} fill="#fff" stroke="#102a43" strokeWidth="1" />
      <rect x={50 - w / 2 + b * 1.6} y={50 - h / 2 + b * 1.6} width={w - b * 3.2} height={h - b * 3.2} fill="none" stroke="#1c8a4a" strokeWidth=".7" strokeDasharray="3 2" />
      {tpl.folds.map((f) => <line key={f} x1={50 - w / 2 + w * f} y1={50 - h / 2 - 3} x2={50 - w / 2 + w * f} y2={50 + h / 2 + 3} stroke="#00a6c8" strokeWidth=".8" strokeDasharray="3 2" />)}
    </svg>
  )
}

const BLOCKY_H = ['1000001', '1000001', '1111111', '1000001', '1000001']

function Mistakes() {
  return (
    <div className="tl-mistakes">
      <article className="tl-mistake">
        <h3>Too close to the edge</h3>
        <div className="tl-mistake__pair">
          <figure><div className="tl-mistake__card tl-mistake__card--bad"><span>Henle Printing Com</span></div><figcaption><b>✕</b> Text hugs the edge and gets clipped.</figcaption></figure>
          <figure><div className="tl-mistake__card tl-mistake__card--good"><span>Henle Printing</span><i /></div><figcaption><b>✓</b> Inside the safe zone.</figcaption></figure>
        </div>
      </article>
      <article className="tl-mistake">
        <h3>Low-resolution images</h3>
        <div className="tl-mistake__pair">
          <figure>
            <div className="tl-mistake__tile">
              <svg viewBox="0 0 7 5" aria-hidden="true" className="tl-pix">{BLOCKY_H.flatMap((row, y) => [...row].map((c, x) => (c === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}</svg>
            </div>
            <figcaption><b>✕</b> 72 ppi from a website: blocky and soft.</figcaption>
          </figure>
          <figure><div className="tl-mistake__tile tl-mistake__tile--sharp"><span>H</span></div><figcaption><b>✓</b> 300 ppi at final size: crisp.</figcaption></figure>
        </div>
      </article>
      <article className="tl-mistake">
        <h3>RGB color on screen</h3>
        <div className="tl-mistake__pair">
          <figure><div className="tl-mistake__swatch tl-mistake__swatch--rgb"><span>On screen (RGB)</span></div><figcaption><b>✕</b> Neon colors the press can’t print.</figcaption></figure>
          <figure><div className="tl-mistake__swatch tl-mistake__swatch--cmyk"><span>On paper (CMYK)</span></div><figcaption><b>✓</b> Set to CMYK to see the real result.</figcaption></figure>
        </div>
      </article>
    </div>
  )
}

export default function ArtworkHelp() {
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }), [])

  return (
    <div className="tl">
      <SEO
        title="Artwork Help Center: Bleed, Safe Zones & Print Templates"
        description="Send us art that prints right. A bleed and safe-zone explorer, a file-prep checklist, and free downloadable print templates."
        path="/artwork-help"
        schema={schema}
      />
      <PageHero eyebrow="Artwork help center" title="Send us art that prints right." intro="Bleed, safe zones, color modes, and the details that decide whether your piece comes off the press looking the way you imagined." tone="cyan" />

      <section className="tl-section tl-section--dark">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow eyebrow--light">Bleed &amp; safe zone</span>
            <h2>Why the file is a little bigger than the card.</h2>
            <p>Print the file, cut the paper, and you’ll never cut exactly where you meant to. A little extra on every side, plus a margin for your text, keeps the result clean.</p>
          </div>
          <BleedExplorer />
        </div>
      </section>

      <section className="tl-section">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow">File-prep checklist</span>
            <h2>Check it before you send it.</h2>
            <p>Eight quick checks that prevent most delays. Tick them off as you go.</p>
          </div>
          <Checklist />
        </div>
      </section>

      <section className="tl-section tl-section--white" id="templates">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow">Free templates</span>
            <h2>Start from the right size.</h2>
            <p>Each PDF has bleed, trim, and safe-zone guides already drawn. Place your artwork over it, then hide the guides before exporting.</p>
          </div>
          <ul className="tl-templates">
            {templates.map((tpl) => (
              <li key={tpl.id}>
                <a href={templateHref(tpl.id)} download className="tl-template">
                  <MiniTemplate tpl={tpl} />
                  <b>{tpl.title}</b>
                  <small>{tpl.w} × {tpl.h} in trim · {pixels(tpl.w)} × {pixels(tpl.h)} px</small>
                  <span><Download size={15} /> Download PDF</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tl-section">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow">Common mistakes</span>
            <h2>Three things that cost people a reprint.</h2>
          </div>
          <Mistakes />
        </div>
      </section>

      <section className="tl-section tl-section--white">
        <div className="shell tl-faq">
          <div className="tl-head">
            <span className="eyebrow">Questions</span>
            <h2>Quick answers.</h2>
          </div>
          <div className="tl-faq__list">
            {faqs.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="tl-cta">
        <div className="shell tl-cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Not sure it’s ready?</span>
            <h2>Send it anyway. We’ll check it.</h2>
            <p>Henle’s graphic designers specialize in printed materials. They’re pros at taking your finished document designs and preparing them for error-free printing.</p>
          </div>
          <div className="tl-cta__actions">
            <Link className="button button--paper" to="/quote#upload">Upload your file <ArrowUpRight /></Link>
            <Link className="button button--outline" to="/graphic-design">Meet our designers <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
