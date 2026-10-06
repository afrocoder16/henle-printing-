import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/PageHero'
import SEO from '../../components/SEO'
import { finishById, finishes, goals, projects, weights } from './paperData'
import './tools.css'

function Meter({ label, value }) {
  return (
    <div className="tl-meter">
      <span>{label}</span>
      <div className="tl-meter__bars" role="img" aria-label={`${label}: ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= value ? 'on' : ''} style={{ '--d': `${n * 60}ms` }} />)}
      </div>
    </div>
  )
}

function Recommender() {
  const [projectId, setProjectId] = useState('postcards')
  const [goalId, setGoalId] = useState('premium')
  const project = projects.find((p) => p.id === projectId)
  const goal = goals.find((g) => g.id === goalId)
  const [paper, weight, finishIds, meters] = project.specs[goalId]
  const finishNames = finishIds.map((id) => finishById[id].label.toLowerCase())
  const summary = `${project.label.toLowerCase()} printed on ${paper.toLowerCase()} (${weight})${finishNames.length ? `, with ${finishNames.join(' and ')}` : ''}`

  return (
    <div className="tl-rec">
      <div className="tl-rec__pick">
        <fieldset>
          <legend><b>1</b> What are you printing?</legend>
          <div className="tl-tiles">
            {projects.map((p) => (
              <button type="button" key={p.id} className={p.id === projectId ? 'active' : ''} aria-pressed={p.id === projectId} onClick={() => setProjectId(p.id)}>
                <span>{p.label}</span><small>{p.tag}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend><b>2</b> What matters most?</legend>
          <div className="tl-goals">
            {goals.map((g) => (
              <button type="button" key={g.id} className={g.id === goalId ? 'active' : ''} aria-pressed={g.id === goalId} onClick={() => setGoalId(g.id)}>
                <span>{g.label}</span><small>{g.line}</small>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="tl-rec__result" key={`${projectId}-${goalId}`}>
        <span className="tl-label tl-label--light"><Sparkles size={14} /> Our suggestion for {project.label.toLowerCase()}</span>
        <h3>{paper}</h3>
        <p className="tl-rec__weight">{weight}</p>
        <p className="tl-rec__why"><b>{goal.label}:</b> {goal.line} {project.note}</p>

        <div className="tl-rec__meters">
          <Meter label="Shine" value={meters.gloss} />
          <Meter label="Stiffness" value={meters.stiffness} />
          <Meter label="Texture" value={meters.texture} />
        </div>

        <div className="tl-rec__finishes">
          <span className="tl-label tl-label--light">Finishes to consider</span>
          {finishIds.length ? (
            <ul>
              {finishIds.map((id) => (
                <li key={id}><b>{finishById[id].label}</b><small>{finishById[id].ask ? 'Ask us about availability.' : finishById[id].blurb.split('. ')[0] + '.'}</small></li>
              ))}
            </ul>
          ) : (
            <p className="tl-rec__none">This one looks best left simple. The paper does the work.</p>
          )}
        </div>

        <div className="tl-rec__actions">
          <Link className="button button--paper" to={`/quote?service=${project.service}&project=${encodeURIComponent(summary)}`}>Quote this spec <ArrowUpRight /></Link>
          <small>General guidance. Our specialists confirm the right stock for your job.</small>
        </div>
      </div>
    </div>
  )
}

function WeightRuler() {
  return (
    <div className="tl-weights">
      <ol>
        {weights.map((w) => (
          <li key={w.label}>
            <span className="tl-weights__sheet" style={{ '--t': w.t }} aria-hidden="true" />
            <b>{w.label}</b>
            <small>{w.feel}</small>
          </li>
        ))}
      </ol>
      <p className="tl-weights__note">Paper weights aren’t directly comparable between “text” and “cover” stocks, so use this as a feel guide, not a measurement. Ask for a sample and feel it in your hands.</p>
    </div>
  )
}

function FinishGrid() {
  const purposes = ['All', 'Protect', 'Feel', 'Shine', 'Shape', 'Bind']
  const [purpose, setPurpose] = useState('All')
  const list = purpose === 'All' ? finishes : finishes.filter((f) => f.purposes.includes(purpose))

  return (
    <div>
      <div className="filter-row" role="group" aria-label="Filter finishes by what they do">
        {purposes.map((p) => <button type="button" key={p} className={purpose === p ? 'active' : ''} aria-pressed={purpose === p} onClick={() => setPurpose(p)}>{p}</button>)}
      </div>
      <ul className="tl-finishes" aria-live="polite">
        {list.map((f) => (
          <li key={f.id} className={`tl-finish tl-finish--${f.id}`}>
            <span className="tl-finish__swatch" aria-hidden="true"><i /></span>
            <h3>{f.label}</h3>
            <p>{f.blurb}</p>
            <div className="tl-finish__meta">
              {f.purposes.map((p) => <em key={p}>{p}</em>)}
              {f.ask && <em className="is-ask">Ask us</em>}
            </div>
            <small>Best for: {f.best}</small>
            <Link to={`/quote?service=finishing&project=${encodeURIComponent(`${f.label.toLowerCase()} on my project`)}`}>Add to a quote <ArrowRight size={15} /></Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PaperGuide() {
  return (
    <div className="tl">
      <SEO
        title="Paper & Finish Guide: Choose the Right Stock and Coating"
        description="Pick your project and what matters most, and get a paper, weight, and finish recommendation. Plus a paper-weight guide and finish comparison from Henle Printing."
        path="/paper-guide"
      />
      <PageHero eyebrow="Paper & finish guide" title="Choose the paper. Feel the difference." intro="From choosing the perfect paper to selecting the ideal colors and coatings, we help you make the best decisions every step of the way. Start here." tone="gold" />

      <section className="tl-section tl-section--dark">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow eyebrow--light">Paper recommender</span>
            <h2>Tell us the job. We’ll suggest the stock.</h2>
            <p>Pick what you’re printing and what matters most. You’ll get a starting point you can bring straight to a quote.</p>
          </div>
          <Recommender />
        </div>
      </section>

      <section className="tl-section">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow">Paper weight</span>
            <h2>What “100 pound” really feels like.</h2>
            <p>Paper weights sound like a secret code. Here’s the same thing in things you’ve held.</p>
          </div>
          <WeightRuler />
        </div>
      </section>

      <section className="tl-section tl-section--white">
        <div className="shell">
          <div className="tl-head">
            <span className="eyebrow">Finishes</span>
            <h2>The details people can feel.</h2>
            <p>Protective coatings to die cuts to embossing, plus stapling to hardcover binding. Filter by what you want the finish to do.</p>
          </div>
          <FinishGrid />
        </div>
      </section>

      <section className="tl-cta">
        <div className="shell tl-cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Still not sure?</span>
            <h2>Feel it before you print it.</h2>
            <p>We’ll send real stocks and finishes so your team can make the final call in hand.</p>
          </div>
          <div className="tl-cta__actions">
            <Link className="button button--paper" to="/quote?project=sample-pack&feel=precise">Request a sample pack <ArrowUpRight /></Link>
            <Link className="button button--outline" to="/#sample-kit">Try the sample lab <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
