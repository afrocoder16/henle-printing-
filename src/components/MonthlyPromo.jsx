import { ArrowRight, CalendarDays, Check, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { monthlyPromo } from '../monthlyPromo'

export default function MonthlyPromo() {
  return (
    <section className="monthly-promo" id="monthly-update" aria-labelledby="monthly-promo-title">
      <div className="shell monthly-promo__card">
        <div className="monthly-promo__edition" aria-label={`${monthlyPromo.edition} promotion`}>
          <Megaphone aria-hidden="true" />
          <span>{monthlyPromo.edition}</span>
        </div>

        <div className="monthly-promo__copy">
          <span className="eyebrow">{monthlyPromo.kicker}</span>
          <h2 id="monthly-promo-title">{monthlyPromo.title}</h2>
          <p>{monthlyPromo.description}</p>
          <div className="monthly-promo__highlights" aria-label="Featured September projects">
            {monthlyPromo.highlights.map((item) => <span key={item}><Check /> {item}</span>)}
          </div>
          <div className="monthly-promo__offer">
            <span>{monthlyPromo.offerLabel}</span>
            <strong>{monthlyPromo.offer}</strong>
          </div>
          <Link className="button" to={monthlyPromo.ctaLink}>{monthlyPromo.ctaLabel} <ArrowRight /></Link>
        </div>

        <div className="monthly-promo__art" aria-hidden="true">
          <div className="promo-calendar">
            <span>{monthlyPromo.calendar.month}</span>
            <strong>{monthlyPromo.calendar.day}</strong>
            <small>{monthlyPromo.calendar.label}</small>
            <CalendarDays />
          </div>
          <div className="promo-postcard promo-postcard--back"><i /><b>FALL</b></div>
          <div className="promo-postcard promo-postcard--front"><small>A timely note</small><strong>{monthlyPromo.notice}</strong><i>→</i></div>
        </div>
      </div>
      <div className="monthly-promo__footer">
        <div className="shell"><span>NEW EACH MONTH</span><p>Seasonal ideas, production reminders, and useful ways to make your next print run work harder.</p></div>
      </div>
    </section>
  )
}
