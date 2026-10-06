import { useEffect, useState } from 'react'
import { ArrowUpRight, Quote, Star } from 'lucide-react'
import { reviews, reviewSummary } from '../reviews'
import './testimonials.css'

function Stars({ count }) {
  return (
    <span className="rv-stars" role="img" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={n <= count ? 'on' : ''} aria-hidden="true" />)}
    </span>
  )
}

// A rotating customer-quote card. `compact` is the slimmer version used on service pages.
export default function Testimonials({ compact = false }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const review = reviews[index]

  useEffect(() => {
    if (paused || reviews.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 6500)
    return () => clearInterval(timer)
  }, [paused])

  return (
    <section className={`rv ${compact ? 'rv--compact' : ''}`} aria-label="What customers say" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="shell rv__grid">
        <div className="rv__summary">
          <span className="eyebrow">{compact ? 'Neighbors say' : 'What customers say'}</span>
          {!compact && <h2>Printed here. Praised here.</h2>}
          <div className="rv__rating">
            <b>{reviewSummary.rating}</b>
            <div><Stars count={5} /><small>Customer rating</small></div>
          </div>
          <a className="text-link" href={reviewSummary.googleReviewsUrl} target="_blank" rel="noreferrer">Read or leave a Google review <ArrowUpRight /></a>
        </div>

        <figure className={`rv__card ${review.sample ? 'is-sample' : ''}`} key={review.id}>
          <Quote className="rv__mark" aria-hidden="true" />
          {review.sample && <span className="rv__tag">Sample slot</span>}
          <blockquote>{review.text}</blockquote>
          <figcaption>
            <Stars count={review.stars} />
            <b>{review.name}</b>
            <small>{review.detail}</small>
          </figcaption>
        </figure>

        <div className="rv__dots" role="group" aria-label="Choose a review">
          {reviews.map((r, i) => (
            <button type="button" key={r.id} className={i === index ? 'active' : ''} aria-pressed={i === index} aria-label={`Show review ${i + 1} of ${reviews.length}`} onClick={() => setIndex(i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
