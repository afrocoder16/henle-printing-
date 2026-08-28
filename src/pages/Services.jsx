import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
import { services } from '../data'

export default function Services() {
  return (
    <>
      <SEO title="Commercial Printing Services" description="Explore Henle's inkjet, offset, digital, graphic design, finishing, and mailing services." />
      <PageHero eyebrow="Services" title="Every process. One accountable team." intro="The best print job is the one that feels easy. Our team manages the decisions, details, and deadlines from concept through delivery." />
      <section className="section service-detail-section">
        <div className="shell service-detail-list">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <article id={service.slug} className={`service-detail service-detail--${service.color} ${index % 2 ? 'service-detail--reverse' : ''}`} key={service.slug}>
                <div className="service-detail__visual reveal">
                  <span className="service-detail__number">{service.number}</span>
                  <Icon aria-hidden="true" />
                  <div className="service-detail__pattern" aria-hidden="true"><i /><i /><i /><i /><i /></div>
                </div>
                <div className="service-detail__copy reveal">
                  <span className="eyebrow">{service.title}</span>
                  <h2>{service.tagline}</h2>
                  <p>{service.detail}</p>
                  <ul>
                    {service.applications.map((item) => <li key={item}><Check size={17} /> {item}</li>)}
                  </ul>
                  <Link to={service.slug === 'mailing' ? '/mailing' : `/quote?service=${service.slug}`} className="button button--dark">
                    {service.slug === 'mailing' ? 'Explore mailing' : `Quote ${service.title.toLowerCase()}`} <ArrowRight />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <section className="stock-callout">
        <div className="shell stock-callout__inner reveal">
          <span className="eyebrow eyebrow--light">Not sure which process?</span>
          <h2>That’s our job.</h2>
          <p>Tell us what the piece needs to do, how many you need, and when. We’ll recommend the smartest way to produce it.</p>
          <Link to="/quote" className="button button--paper">Talk through a project <ArrowRight /></Link>
        </div>
      </section>
    </>
  )
}
