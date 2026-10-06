import { useEffect, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
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
  const long = review.text.length > 150

  useEffect(() => {
    if (paused || reviews.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setTimeout(() => setIndex((i) => (i + 1) % reviews.length), 5500 + review.text.length * 30)
    return () => clearTimeout(timer)
  }, [paused, index, review.text.length])

  const step = (dir) => setIndex((i) => (i + dir + reviews.length) % reviews.length)

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

        <figure className={`rv__card ${long ? 'is-long' : ''}`} key={review.id}>
          <Quote className="rv__mark" aria-hidden="true" />
          <blockquote>
            {review.text}{review.truncated ? '…' : ''}
          </blockquote>
          <figcaption>
            {review.stars ? <Stars count={review.stars} /> : null}
            <b>{review.name}</b>
            <small>{review.detail}</small>
            {review.truncated && <a href={reviewSummary.googleReviewsUrl} target="_blank" rel="noreferrer">Read the full review on Google <ArrowUpRight aria-hidden="true" /></a>}
          </figcaption>
        </figure>

        <div className="rv__nav">
          <button type="button" onClick={() => step(-1)} aria-label="Previous review"><ChevronLeft aria-hidden="true" /></button>
          <span aria-live="polite"><b>{index + 1}</b> / {reviews.length}</span>
          <button type="button" onClick={() => step(1)} aria-label="Next review"><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  )
}
