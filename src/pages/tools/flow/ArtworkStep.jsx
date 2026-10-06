import { useEffect, useRef, useState } from 'react'
import { Check, CircleAlert, Download, ExternalLink, FileUp, Info, Lightbulb, PenTool, Scissors, ShieldCheck, TriangleAlert, UploadCloud, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DESIGN_FEE_DEMO, fmtMoney } from '../pricingData'
import { checklist } from '../templateData'
import { BleedDiagram } from '../ArtworkHelp'
import { ACCEPT, DESIGN_DAYS, FREE_TOOLS, MAX_FILE_MB, checkFile, downloadText, formatBytes, inchLabel, makeTemplateSvg, matchTemplate } from './flowLogic'
import { templateHref } from '../templateData'

const PATHS = [
  { id: 'file', icon: FileUp, title: 'I have a file', text: 'A finished design (PDF, image, or similar). We’ll show you how to set it up and check it.' },
  { id: 'design', icon: PenTool, title: 'I need design help', text: 'A rough idea, a logo, or just a goal. Henle’s designers take it from there.' },
  { id: 'later', icon: Lightbulb, title: 'I’ll send it later', text: 'Get your quote now and send the artwork when it’s ready.' },
]

const ICON = { good: Check, warn: TriangleAlert, bad: CircleAlert, info: Info }

function Dropzone({ file, onFile, result, busy, label = 'Drop your file here' }) {
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  const take = (list) => { const f = list && list[0]; if (f) onFile(f) }

  return (
    <div className="es-drop-wrap">
      <label
        className={`es-drop ${over ? 'is-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); take(event.dataTransfer.files) }}
      >
        <UploadCloud aria-hidden="true" />
        <strong>{file ? file.name : label}</strong>
        <small>{file ? `${formatBytes(file.size)} · click to choose a different file` : `or click to browse · PDF, AI, EPS, PNG, JPG, or TIFF · up to ${MAX_FILE_MB} MB`}</small>
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={(event) => take(event.target.files)} />
      </label>

      {busy && <p className="es-check__busy" role="status">Checking your file…</p>}
      {result && !busy && (
        <div className={`es-check es-check--${result.level}`} role="status" aria-live="polite">
          <div className="es-check__head">
            <b>{result.level === 'good' ? 'Looks good' : result.level === 'warn' ? 'Almost there' : 'Needs attention'}</b>
            <button type="button" className="es-check__clear" onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = '' }}><X aria-hidden="true" /> Remove file</button>
          </div>
          <ul>
            {result.lines.map((line, i) => {
              const Icon = ICON[line.level]
              return <li key={i} className={`is-${line.level}`}><Icon aria-hidden="true" /><span>{line.text}</span></li>
            })}
          </ul>
          <p className="es-check__note">Checked on your device. Nothing has been uploaded. Henle’s team does a full check on your real file.</p>
        </div>
      )}
    </div>
  )
}

export default function ArtworkStep({ cfg, p, geo, art, setArt, checks, setChecks, file, setFile, fileResult, setFileResult, brief, setBrief, sched, Step }) {
  const [busy, setBusy] = useState(false)
  const [trimmed, setTrimmed] = useState(false)
  const [toolOpen, setToolOpen] = useState('canva')
  const tpl = matchTemplate(geo)
  const fullW = geo.w + 2 * geo.bleed
  const fullH = geo.h + 2 * geo.bleed
  const ppi = geo.large ? 100 : 300
  const pixels = `${Math.round(fullW * ppi).toLocaleString()} × ${Math.round(fullH * ppi).toLocaleString()} px at ${ppi} ppi`

  // Re-run the check whenever the file or the chosen size changes.
  useEffect(() => {
    let cancelled = false
    if (!file) { setFileResult(null); return undefined }
    setBusy(true)
    checkFile(file, geo, cfg).then((r) => { if (!cancelled) { setFileResult(r); setBusy(false) } })
    return () => { cancelled = true }
  }, [file, geo.w, geo.h, geo.bleed, cfg.sides]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCheck = (id) => setChecks((set) => { const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const downloadTemplate = () => downloadText(`henle-${cfg.product}-${geo.w}x${geo.h}-template.svg`, makeTemplateSvg(geo))

  return (
    <>
      <Step n="A" id="es-s-art" title="How will your artwork reach us?" hint="Pick the one that fits. You can change your mind.">
        <div className="es-paths" role="radiogroup" aria-labelledby="es-s-art">
          {PATHS.map(({ id, icon: Icon, title, text }) => (
            <label key={id} className={`es-path ${art === id ? 'is-on' : ''}`}>
              <input type="radio" name="es-art" value={id} checked={art === id} onChange={() => setArt(id)} />
              <Icon aria-hidden="true" />
              <b>{title}</b>
              <small>{text}</small>
              {id === 'design' && <em>From {fmtMoney(DESIGN_FEE_DEMO)} (demo)</em>}
            </label>
          ))}
        </div>
      </Step>

      {art === 'file' && (
        <>
          <Step n="B" id="es-s-setup" title="Set up your file" hint={`This is exactly what your ${p.label.toLowerCase()} file should look like.`}>
            <div className="es-setup">
              <div className="es-setup__diagram">
                <BleedDiagram tpl={{ title: geo.title, w: geo.w, h: geo.h, folds: geo.folds }} bleed={geo.bleed} extend risky={false} trimmed={trimmed} layers={{ bleed: true, trim: true, safe: true }} />
                <button type="button" className="es-trim" aria-pressed={trimmed} onClick={() => setTrimmed(!trimmed)}><Scissors aria-hidden="true" /> {trimmed ? 'Back to the file' : 'Show me the trim'}</button>
              </div>
              <div className="es-setup__facts">
                <dl>
                  <div><dt>Set your file up at</dt><dd>{inchLabel(fullW, fullH)}<small>{pixels}</small></dd></div>
                  <div><dt>Final trimmed size</dt><dd>{inchLabel(geo.w, geo.h)}</dd></div>
                  <div><dt>Keep text inside</dt><dd>{inchLabel(geo.w - 2 * geo.safe, geo.h - 2 * geo.safe)}</dd></div>
                  {cfg.sides === 2 && !geo.perPage && <div><dt>Pages</dt><dd>2<small>front and back</small></dd></div>}
                </dl>
                <p className="es-setup__why"><b>Why the extra {geo.bleed} in?</b> Paper is cut after printing, and no cut is perfect. Bleed makes sure a cut that’s a hair off leaves color to the edge instead of a white sliver.</p>
                <div className="es-setup__dl">
                  {tpl && <a className="button button--small" href={templateHref(tpl.id)} download><Download aria-hidden="true" /> Template (PDF)</a>}
                  <button type="button" className="button button--small es-btn-ghost" onClick={downloadTemplate}><Download aria-hidden="true" /> Template (SVG)</button>
                </div>
                <p className="es-setup__tiny">Templates are drawn at your exact size. Place your design over them, then hide the guides before you export.</p>
              </div>
            </div>
          </Step>

          <Step n="C" id="es-s-check" title="Check your file" hint="Drop it in and we’ll look at the file type, resolution, and page size right in your browser.">
            <Dropzone file={file} onFile={setFile} result={fileResult} busy={busy} />
          </Step>

          <Step n="D" id="es-s-list" title="Before you send it" hint="The eight things that cause most delays. Tick them as you go.">
            <ul className="es-list">
              {checklist.map((item) => (
                <li key={item.id} className={checks.has(item.id) ? 'is-done' : ''}>
                  <label>
                    <input type="checkbox" checked={checks.has(item.id)} onChange={() => toggleCheck(item.id)} />
                    <span className="es-list__box" aria-hidden="true"><Check /></span>
                    <span className="es-list__text"><b>{item.title}</b><small>{item.hint}</small></span>
                  </label>
                </li>
              ))}
            </ul>
            <p className={`es-list__status ${checks.size === checklist.length ? 'is-on' : ''}`} role="status" aria-live="polite">
              {checks.size === checklist.length ? <><ShieldCheck aria-hidden="true" /> Your file is ready to send.</> : <>{checks.size} of {checklist.length} checked. Not sure about one? <Link to="/graphic-design">Our designers can prepare your file.</Link></>}
            </p>
          </Step>

          <Step n="E" id="es-s-tools" title="No design software?" hint="Free tools that can make a print-ready file. Features change, so check each app.">
            <div className="es-tools" role="tablist" aria-label="Free design tools">
              {FREE_TOOLS.map((tool) => (
                <button type="button" role="tab" id={`es-tool-${tool.id}`} aria-selected={toolOpen === tool.id} aria-controls="es-tool-panel" key={tool.id} className={toolOpen === tool.id ? 'active' : ''} onClick={() => setToolOpen(tool.id)}>
                  <b>{tool.name}</b><small>{tool.best}</small>
                </button>
              ))}
            </div>
            {FREE_TOOLS.filter((t) => t.id === toolOpen).map((tool) => (
              <div className="es-tool-panel" id="es-tool-panel" role="tabpanel" aria-labelledby={`es-tool-${tool.id}`} key={tool.id}>
                <p>{tool.tip}</p>
                <p className="es-tool-panel__size">Your size to enter: <b>{inchLabel(fullW, fullH)}</b> with bleed ({pixels}).</p>
                <a className="text-link" href={tool.url} target="_blank" rel="noreferrer">Open {tool.name} <ExternalLink aria-hidden="true" /></a>
              </div>
            ))}
          </Step>
        </>
      )}

      {art === 'design' && (
        <Step n="B" id="es-s-design" title="Tell us about your idea" hint="“Got a great idea? Need one?” Henle’s graphic designers specialize in printed materials, and they’ll involve you through the entire process.">
          <label className="es-field es-field--wide">What should it say or do?
            <textarea rows="5" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Who is it for? What should people do when they see it? Colors, mood, or examples you like…" />
          </label>
          <p className="es-field__hint">Have a logo, photos, or text? Drop them here (optional).</p>
          <Dropzone file={file} onFile={setFile} result={fileResult} busy={busy} label="Drop a logo or inspiration here" />
          <ul className="es-facts">
            <li><b>{fmtMoney(DESIGN_FEE_DEMO)}</b><span>Design fee in this estimate (demo number). Your specialist confirms it.</span></li>
            <li><b>+{DESIGN_DAYS} days</b><span>Design time. The “files due” date on your order card already counts it.</span></li>
            <li><b>Proof first</b><span>You see it and approve it before the presses roll.</span></li>
          </ul>
        </Step>
      )}

      {art === 'later' && (
        <Step n="B" id="es-s-later" title="No problem. Send it when it’s ready." hint="We’ll confirm your quote now and send an upload link.">
          <div className="es-later">
            <Info aria-hidden="true" />
            <div>
              <p>{sched.mode === 'date' ? <>To make your date, we need final artwork by <b>{sched.submitBy.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</b>.</> : <>Your timeline starts when final artwork arrives. Turnaround is counted from that day.</>}</p>
              <p>Want to get it right the first time? Read the <Link to="/artwork-help">Artwork Help Center</Link> or pick “I have a file” above for your exact setup and templates.</p>
            </div>
          </div>
        </Step>
      )}
    </>
  )
}
