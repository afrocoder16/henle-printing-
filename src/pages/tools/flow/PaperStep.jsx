import { useMemo } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FINISHING, PAPER_IDS, estimate, fmtMoney } from '../pricingData'
import { finishById, goals, projects as paperProjects } from '../paperData'
import { GOAL_MAP, PAPER_GUIDE_ID } from './flowLogic'

// "+$18", "-$12", or "Included"
function delta(amount) {
  const rounded = Math.round(amount)
  if (Math.abs(amount) < 0.5) return { text: 'No change', tone: 'same' }
  return rounded > 0 ? { text: `+${fmtMoney(rounded)}`, tone: 'up' } : { text: `−${fmtMoney(-rounded)}`, tone: 'down' }
}

function Meter({ label, value }) {
  return (
    <div className="es-meter">
      <span>{label}</span>
      <div className="es-meter__bars" role="img" aria-label={`${label}: ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= value ? 'on' : ''} />)}
      </div>
    </div>
  )
}

export default function PaperStep({ cfg, est, p, update, goal, setGoal, Choice, Step }) {
  const guide = paperProjects.find((x) => x.id === PAPER_GUIDE_ID[cfg.product])
  const spec = goal && guide ? guide.specs[goal] : null
  const goalInfo = goals.find((g) => g.id === goal)
  const binding = (p.exclusive || [])[0] || []
  const chips = p.finishing.filter((f) => !binding.includes(f))

  const applyGoal = () => {
    const map = GOAL_MAP[goal]
    const keep = cfg.finishing.filter((f) => binding.includes(f))
    update({ paper: map.paper, finishing: [...keep, ...map.fin.filter((f) => chips.includes(f))] })
  }

  const paperDeltas = useMemo(() => Object.fromEntries(PAPER_IDS.map((id) => [id, estimate({ ...cfg, paper: id }).total - est.total])), [cfg, est.total])
  const finishDeltas = useMemo(() => Object.fromEntries(chips.map((id) => {
    const on = cfg.finishing.includes(id)
    const next = on ? cfg.finishing.filter((f) => f !== id) : [...cfg.finishing, id]
    const diff = estimate({ ...cfg, finishing: next }).total - est.total
    return [id, on ? -diff : diff]
  })), [cfg, est.total]) // eslint-disable-line react-hooks/exhaustive-deps

  const recommendedPaper = goal ? GOAL_MAP[goal].paper : null
  const toggleFinish = (id) => update({ finishing: cfg.finishing.includes(id) ? cfg.finishing.filter((f) => f !== id) : [...cfg.finishing, id] })
  const hasChip = cfg.finishing.some((f) => chips.includes(f))

  return (
    <>
      <Step n="A" id="es-s-goal" title="What matters most?" hint="Tell us the goal and we’ll suggest a paper and finish. You can change anything afterward.">
        <div className="es-goals" role="group" aria-labelledby="es-s-goal">
          {goals.map((g) => (
            <button type="button" key={g.id} className={g.id === goal ? 'active' : ''} aria-pressed={g.id === goal} onClick={() => setGoal(g.id === goal ? '' : g.id)}>
              <b>{g.label}</b><small>{g.line}</small>
            </button>
          ))}
        </div>

        {spec && (
          <div className="es-rec" key={`${cfg.product}-${goal}`}>
            <span className="es-rec__tag"><Sparkles aria-hidden="true" /> Our suggestion for {p.label.toLowerCase()}</span>
            <h3>{spec[0]}</h3>
            <p className="es-rec__weight">{spec[1]}</p>
            <p className="es-rec__why"><b>{goalInfo.label}.</b> {goalInfo.line} {guide.note}</p>
            <div className="es-rec__meters">
              <Meter label="Shine" value={spec[3].gloss} />
              <Meter label="Stiffness" value={spec[3].stiffness} />
              <Meter label="Texture" value={spec[3].texture} />
            </div>
            {spec[2].length > 0 && (
              <ul className="es-rec__fin">
                {spec[2].map((id) => <li key={id}><b>{finishById[id].label}</b>{finishById[id].ask ? ' · ask us about availability' : ''}</li>)}
              </ul>
            )}
            <button type="button" className="button button--small es-rec__apply" onClick={applyGoal}>Use this recipe <Check aria-hidden="true" /></button>
          </div>
        )}
      </Step>

      <Step n="B" id="es-s-paper" title="Paper" hint="The stock changes the feel and the price. The prices show what each choice does to your total.">
        <div className="est-papers" role="radiogroup" aria-labelledby="es-s-paper">
          {PAPER_IDS.map((id) => {
            const d = delta(paperDeltas[id])
            return (
              <Choice key={id} name="es-paper" value={id} checked={cfg.paper === id} onChange={(v) => update({ paper: v })} className="est-choice--paper">
                <span className={`est-swatch est-swatch--${id}`} aria-hidden="true" />
                <strong>{p.papers[id].label}</strong>
                <small>{p.papers[id].detail}</small>
                <em className={`es-delta es-delta--${cfg.paper === id ? 'here' : d.tone}`}>{cfg.paper === id ? 'Selected' : d.text}</em>
                {recommendedPaper === id && <i className="es-badge">Suggested</i>}
              </Choice>
            )
          })}
        </div>
      </Step>

      <Step n="C" id="es-s-finish" title="Finishing" hint={p.includedNote || 'Optional extras, added after printing.'}>
        {binding.length > 0 && (
          <div className="est-extra est-extra--binding">
            <span id="es-bind-label">Binding</span>
            <div role="radiogroup" aria-labelledby="es-bind-label" className="est-seg est-seg--long">
              {binding.map((id) => {
                const off = (id === 'perfect' && cfg.extra < 28) || (id === 'staple' && cfg.extra > 64)
                return (
                  <Choice key={id} name="es-binding" value={id} checked={cfg.finishing.includes(id)} onChange={(v) => update({ finishing: [...cfg.finishing.filter((f) => !binding.includes(f)), v] })} disabled={off} className="est-choice--seg est-choice--wide">
                    {FINISHING[id].label}
                  </Choice>
                )
              })}
            </div>
          </div>
        )}
        {chips.length > 0 ? (
          <div className="est-chips" role="group" aria-label="Finishing options">
            <button type="button" className={`est-chip-btn ${hasChip ? '' : 'is-on'}`} aria-pressed={!hasChip} onClick={() => update({ finishing: cfg.finishing.filter((f) => !chips.includes(f)) })}>
              <Check aria-hidden="true" /> None
            </button>
            {chips.map((id) => {
              const d = delta(finishDeltas[id])
              return (
                <Choice key={id} type="checkbox" name="es-finish" value={id} checked={cfg.finishing.includes(id)} onChange={toggleFinish} className="est-choice--finish">
                  <Check aria-hidden="true" />
                  <strong>{FINISHING[id].label}</strong>
                  <small>{FINISHING[id].blurb}</small>
                  <em className={`es-delta es-delta--${cfg.finishing.includes(id) ? 'here' : d.tone}`}>{cfg.finishing.includes(id) ? `Adds ${fmtMoney(Math.round(Math.abs(finishDeltas[id])))}` : d.text}</em>
                </Choice>
              )
            })}
          </div>
        ) : <p className="es-none">No finishing options for this product. It prints and trims as is.</p>}
        <p className="es-aside">Not sure what a finish looks like? <Link to="/#sample-kit">Try the sample lab</Link> or <Link to="/quote?project=sample-pack&feel=precise">request a sample pack <ArrowRight aria-hidden="true" /></Link></p>
      </Step>
    </>
  )
}
