import { useState } from 'react'
import { ArrowRight, Check, CircleCheck, Lock, Phone, Printer, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SendForm({ onSubmit, art, file, summary, Step }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', company: '', notes: '', reach: 'email' })
  const set = (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value }))

  return (
    <>
      <Step n="A" id="es-s-review" title="Review your project" hint="This is what Henle will see. Use the steps above to change anything.">
        <ul className="es-review">
          {summary.map(([label, value]) => <li key={label}><span>{label}</span><b>{value}</b></li>)}
        </ul>
      </Step>

      <Step n="B" id="es-s-contact" title="Where should we send your exact quote?" hint="A real person in Marshall reviews your request and follows up with the right questions.">
        <form className="es-form" id="es-send-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }}>
          <div className="es-form__row">
            <label className="es-field">Your name <span>*</span>
              <input name="name" required autoComplete="name" value={values.name} onChange={set('name')} />
            </label>
            <label className="es-field">Company
              <input name="company" autoComplete="organization" value={values.company} onChange={set('company')} />
            </label>
          </div>
          <div className="es-form__row">
            <label className="es-field">Email <span>*</span>
              <input name="email" type="email" required autoComplete="email" value={values.email} onChange={set('email')} />
            </label>
            <label className="es-field">Phone
              <input name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} />
            </label>
          </div>
          <fieldset className="es-reach">
            <legend>Best way to reach you</legend>
            {[['email', 'Email'], ['phone', 'Phone call']].map(([id, label]) => (
              <label key={id}><input type="radio" name="reach" value={id} checked={values.reach === id} onChange={set('reach')} /> {label}</label>
            ))}
          </fieldset>
          <label className="es-field es-field--wide">Anything else we should know?
            <textarea name="notes" rows="4" value={values.notes} onChange={set('notes')} placeholder="Deadlines, delivery, artwork questions, or anything that didn’t fit above." />
          </label>
          {art === 'file' && file && <p className="es-form__file"><Check aria-hidden="true" /> Your file <b>{file.name}</b> goes with this request.</p>}
          <button type="submit" className="button es-submit">Get my exact quote <ArrowRight aria-hidden="true" /></button>
          <p className="es-form__fine"><Lock aria-hidden="true" /> Your information is used only to prepare your quote. Prefer to talk? <a href="tel:+15075324493">507-532-4493</a></p>
        </form>
      </Step>
    </>
  )
}

// The confirmation, plus a one-page order sheet that prints cleanly.
export function OrderSheet({ order, onReset }) {
  const date = order.at.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <section className="es-done" aria-live="polite">
      <div className="es-done__banner">
        <CircleCheck aria-hidden="true" />
        <div>
          <h2>Your quote request has been submitted.</h2>
          <p>Thank you, {order.contact.name.split(' ')[0]}. A member of the Henle team will review your project and follow up by {order.contact.reach === 'phone' ? 'phone' : 'email'}. Order sheet <b>No. {order.number}</b>.</p>
        </div>
      </div>

      <div className="es-done__actions">
        <button type="button" className="button" onClick={() => window.print()}><Printer aria-hidden="true" /> Print or save your order sheet</button>
        <button type="button" className="button es-btn-ghost" onClick={onReset}><RotateCcw aria-hidden="true" /> Start another project</button>
        <a className="es-done__call" href="tel:+15075324493"><Phone aria-hidden="true" /> Need it sooner? 507-532-4493</a>
      </div>

      <article className="es-sheet es-print" aria-label="Order sheet">
        <header>
          <div>
            <b className="es-sheet__brand">Henle Printing Company</b>
            <span>703 Ontario Rd · Marshall, MN 56258 · 507-532-4493</span>
          </div>
          <div className="es-sheet__no"><small>Order sheet</small><b>No. {order.number}</b><span>{date}</span></div>
        </header>
        <h3>{order.title}</h3>
        <dl>
          {order.summary.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <div className="es-sheet__money">
          <div><small>Ballpark range</small><b>{order.range}</b></div>
          <div><small>Per piece</small><b>{order.each}</b></div>
        </div>
        <div className="es-sheet__contact">
          <h4>Contact</h4>
          <p>{order.contact.name}{order.contact.company ? `, ${order.contact.company}` : ''}<br />{order.contact.email}{order.contact.phone ? ` · ${order.contact.phone}` : ''}<br />Best reached by {order.contact.reach === 'phone' ? 'phone' : 'email'}</p>
          {order.contact.notes && <p className="es-sheet__notes"><b>Notes:</b> {order.contact.notes}</p>}
        </div>
        <footer>Demo rates for the sample website. Henle’s real price list replaces them. A Henle specialist confirms stock, finishing, and timing before any price is final.</footer>
      </article>

      <p className="es-done__alt">Rather just ask? <Link to="/quote">Send a quick quote request</Link> instead.</p>
    </section>
  )
}
