import { ArrowRight, CalendarDays, Check, Hourglass, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { monthlyPromo } from '../monthlyPromo'
import NewsletterSignup from './NewsletterSignup'

const MAPLE = 'M50 2 58 22 70 14 66 38 84 30 78 46 96 50 80 60 86 72 64 68 62 82 53 74 52 98 48 98 47 74 38 82 36 68 14 72 20 60 4 50 22 46 16 30 34 38 30 14 42 22Z'
const OAK = 'M50 4C78 22 86 66 52 94L50 99 48 94C14 66 22 22 50 4Z'

// Position, timing, and color for each falling leaf (kept fixed so the layout is stable).
const leaves = [
  { left: 6, size: 30, delay: 0, duration: 11, color: 'orange', shape: MAPLE },
  { left: 18, size: 22, delay: 4.5, duration: 13, color: 'gold', shape: OAK },
  { left: 31, size: 36, delay: 2, duration: 12, color: 'red', shape: MAPLE },
  { left: 44, size: 18, delay: 7, duration: 10, color: 'gold', shape: MAPLE },
  { left: 56, size: 28, delay: 1, duration: 14, color: 'brown', shape: OAK },
  { left: 68, size: 34, delay: 5.5, duration: 11.5, color: 'orange', shape: MAPLE },
  { left: 79, size: 20, delay: 3, duration: 12.5, color: 'red', shape: OAK },
  { left: 90, size: 26, delay: 8, duration: 13.5, color: 'gold', shape: MAPLE },
  { left: 38, size: 16, delay: 9.5, duration: 10.5, color: 'orange', shape: OAK },
  { left: 84, size: 30, delay: 6.5, duration: 15, color: 'brown', shape: MAPLE },
]

function daysUntil(date) {
  const target = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export default function MonthlyPromo() {
  const { theme, countdown } = monthlyPromo
  const days = countdown ? daysUntil(countdown.date) : 0

  return (
    <section className={`monthly-promo ${theme ? `monthly-promo--${theme}` : ''}`} id="monthly-update" aria-labelledby="monthly-promo-title">
      <div className="shell monthly-promo__card">
        <div className="monthly-promo__edition" aria-label={`${monthlyPromo.edition} promotion`}>
          <Megaphone aria-hidden="true" />
          <span>{monthlyPromo.edition}</span>
        </div>

        <div className="monthly-promo__copy">
          <span className="eyebrow">{monthlyPromo.kicker}</span>
          <h2 id="monthly-promo-title">{monthlyPromo.title}</h2>
          <p>{monthlyPromo.description}</p>
          <div className="monthly-promo__highlights" aria-label={`Featured ${monthlyPromo.edition} projects`}>
            {monthlyPromo.highlights.map((item) => <span key={item}><Check /> {item}</span>)}
          </div>
          <div className="monthly-promo__offer">
            <span>{monthlyPromo.offerLabel}</span>
            <strong>{monthlyPromo.offer}</strong>
          </div>
          <Link className="button" to={monthlyPromo.ctaLink}>{monthlyPromo.ctaLabel} <ArrowRight /></Link>
        </div>

        <div className="monthly-promo__art" aria-hidden="true">
          {theme === 'fall' && (
            <div className="falling-leaves">
              {leaves.map((leaf, i) => (
                <span
                  key={i}
                  className={`falling-leaf falling-leaf--${leaf.color}`}
                  style={{ left: `${leaf.left}%`, width: leaf.size, height: leaf.size, animationDelay: `-${leaf.delay}s`, animationDuration: `${leaf.duration}s` }}
                >
                  <svg viewBox="0 0 100 100" style={{ animationDuration: `${leaf.duration / 3}s` }}><path d={leaf.shape} /></svg>
                </span>
              ))}
            </div>
          )}
          <div className="promo-calendar">
            <span>{monthlyPromo.calendar.month}</span>
            <strong>{monthlyPromo.calendar.day}</strong>
            <small>{monthlyPromo.calendar.label}</small>
            <CalendarDays />
          </div>
          <div className="promo-postcard promo-postcard--back">
            {theme === 'fall' ? <svg className="promo-postcard__leaf" viewBox="0 0 100 100"><path d={MAPLE} /></svg> : <i />}
            <b>FALL</b>
          </div>
          <div className="promo-postcard promo-postcard--front"><small>A timely note</small><strong>{monthlyPromo.notice}</strong><i>→</i></div>
          {countdown && days > 0 && (
            <div className="promo-countdown">
              <Hourglass />
              <strong>{days}</strong>
              <span>days {countdown.label}</span>
            </div>
          )}
        </div>
      </div>
      <div className="monthly-promo__footer">
        <div className="shell"><div className="monthly-promo__footer-copy"><span>NEW EACH MONTH</span><p>Seasonal ideas, production reminders, and useful ways to make your next print run work harder.</p></div><NewsletterSignup variant="band" id="promo-press-note" /></div>
      </div>
    </section>
  )
}
