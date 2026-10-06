import { useMemo } from 'react'
import { ArrowRight, ArrowUpRight, Phone } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import CountUp from '../CountUp'
import SEO from '../SEO'
import Testimonials from '../Testimonials'
import { tools } from '../../toolsData'
import { getService, serviceOrder, servicePages } from '../../serviceData'
import { Photo, VideoSlot } from './media'
import InkjetLab from './InkjetLab'
import OffsetLab from './OffsetLab'
import DigitalLab from './DigitalLab'
import DesignLab from './DesignLab'
import FinishLab from './FinishLab'
import MailLab from './MailLab'
import '../../servicePages.css'

const labs = {
  inkjet: () => <InkjetLab />,
  offset: () => <OffsetLab />,
  digital: () => <DigitalLab />,
  design: () => <DesignLab />,
  finishing: () => <FinishLab />,
  mailing: (service) => <MailLab shipping={service.shipping} />,
}

// Which customer tools to feature on each service page.
const serviceTools = {
  inkjet: ['artwork', 'estimator', 'deadline'],
  offset: ['paper', 'estimator', 'artwork'],
  digital: ['estimator', 'deadline', 'artwork'],
  design: ['artwork', 'paper', 'estimator'],
  finishing: ['paper', 'estimator', 'deadline'],
  mailing: ['eddm', 'deadline', 'estimator'],
}

const labIntro = {
  inkjet: { eyebrow: 'See it for yourself', title: 'Don’t take our word for it.' },
  offset: { eyebrow: 'One-color to six', title: 'Build a sheet, ink by ink.' },
  digital: { eyebrow: 'Big results. Small price.', title: 'Try the part nobody else does.' },
  design: { eyebrow: 'Got a great idea? Need one?', title: 'Either way, we start where you are.' },
  finishing: { eyebrow: 'No detail left out', title: 'Choose the finishing touch.' },
  mailing: { eyebrow: 'Making the deadlines', title: 'Follow a mailing from start to finish.' },
}

export default function ServicePage({ slug }) {
  const service = getService(slug)
  const [heroPhoto, ...otherPhotos] = service.photos
  const quoteTo = `/quote?service=${service.slug}`
  const featuredTools = serviceTools[slug].map((id) => tools.find((tool) => tool.id === id))

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.title,
        serviceType: service.title,
        description: service.seoDescription,
        url: `https://www.henleprinting.com${service.path}`,
        areaServed: 'Southwest Minnesota',
        provider: { '@type': 'LocalBusiness', '@id': 'https://www.henleprinting.com/#business', name: 'Henle Printing Company' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Services', item: 'https://www.henleprinting.com/services' },
          { '@type': 'ListItem', position: 2, name: service.title, item: `https://www.henleprinting.com${service.path}` },
        ],
      },
    ],
  }), [service])

  return (
    <div className={`sp sp--${service.tone}`}>
      <SEO title={service.seoTitle} description={service.seoDescription} path={service.path} schema={schema} />

      <section className="sp-hero">
        <div className="shell sp-hero__grid">
          <div className="sp-hero__copy reveal">
            <nav className="sp-crumbs" aria-label="Breadcrumb">
              <Link to="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{service.title}</span>
            </nav>
            <span className="eyebrow">{service.eyebrow}</span>
            <h1>{service.headline}</h1>
            <p className="sp-hero__sub">{service.subhead}</p>
            <p className="sp-hero__lede">{service.lede}</p>
            <div className="sp-hero__actions">
              <Link className="button" to={quoteTo}>Get a quote <ArrowUpRight /></Link>
              <a className="sp-hero__call" href="tel:+15075324493"><Phone size={16} /> 507-532-4493</a>
            </div>
            {service.equipment.length > 0 && (
              <ul className="sp-equip" aria-label="Equipment">
                {service.equipment.map((item) => <li key={item.name}><b>{item.name}</b><small>{item.note}</small></li>)}
              </ul>
            )}
          </div>
          <Photo slot={heroPhoto} className="sp-hero__photo reveal reveal--delay" eager />
        </div>
        <div className="color-bar" aria-hidden="true"><i /><i /><i /><i /></div>
      </section>

      <nav className="sp-switcher" aria-label="Henle services">
        <div className="shell sp-switcher__inner">
          {serviceOrder.map((id) => {
            const item = servicePages[id]
            return <NavLink key={id} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>{item.title.replace(' & Copying', '').replace(' & Binding', '').replace('Bulk Mailing & Shipping', 'Mailing')}</NavLink>
          })}
        </div>
      </nav>

      <section className="sp-facts" aria-label={`${service.title} at a glance`}>
        <div className="shell sp-facts__grid">
          {service.facts.map((fact) => (
            <div key={fact.label}>
              {fact.text ? <strong className="sp-facts__text">{fact.text}</strong> : (
                <strong><CountUp end={fact.value} prefix={fact.prefix} suffix={fact.suffix} group duration={1800} label={`${fact.prefix || ''}${fact.value}${fact.suffix || ''}`} /></strong>
              )}
              <span>{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sp-words section">
        <div className="shell sp-words__grid">
          <div className="sp-words__label reveal">
            <span className="eyebrow">{service.wordsNote ? 'The short version' : 'In our own words'}</span>
            <h2>{service.subhead}</h2>
          </div>
          <div className="sp-words__copy reveal">
            {service.words.map((paragraph, i) => <p key={paragraph} className={i === 0 ? 'is-lead' : ''}>{paragraph}</p>)}
            <Link className="text-link" to={quoteTo}>Talk to us about your project <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="sp-lab section">
        <div className="shell">
          <div className="sp-lab__head reveal">
            <span className="eyebrow eyebrow--light">{labIntro[slug].eyebrow}</span>
            <h2>{labIntro[slug].title}</h2>
          </div>
          <div className="sp-lab__body reveal">{labs[slug](service)}</div>
        </div>
      </section>

      <section className="sp-media section">
        <div className={`shell sp-media__grid ${service.video?.youtubeId ? '' : 'sp-media__grid--novideo'}`}>
          {service.video?.youtubeId && <VideoSlot video={service.video} tone={service.tone} />}
          {otherPhotos.map((photo, i) => <Photo key={photo.key} slot={photo} className={`sp-media__photo sp-media__photo--${i + 1}`} />)}
        </div>
      </section>

      <section className="sp-prints section">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">What we print</span><h2>Bring us the project.</h2></div>
            <p>Just a few of the things we print here. Don’t see yours? Ask—we do a host of custom projects.</p>
          </div>
          <ul className="sp-chips">
            {service.prints.map((item) => <li key={item}><Link to={`${quoteTo}&project=${encodeURIComponent(item.toLowerCase())}`}>{item}</Link></li>)}
          </ul>
          {service.alsoPrints && (
            <>
              <h3 className="sp-chips__sub">{service.alsoPrints.label}</h3>
              <ul className="sp-chips sp-chips--quiet">
                {service.alsoPrints.items.map((item) => <li key={item}><Link to={`${quoteTo}&project=${encodeURIComponent(item.toLowerCase())}`}>{item}</Link></li>)}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="sp-tools section">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">Plan it</span><h2>Get ready before you call.</h2></div>
            <p>Free tools that answer the questions we hear most about {service.title.toLowerCase()}.</p>
          </div>
          <ul className="sp-tools__grid">
            {featuredTools.map((tool) => {
              const Icon = tool.icon
              return (
                <li key={tool.id}>
                  <Link to={tool.path} className={`sp-tools__card sp-tools__card--${tool.tone}`}>
                    <Icon aria-hidden="true" />
                    <h3>{tool.title}</h3>
                    <p>{tool.pitch}</p>
                    <b>{tool.cta} <ArrowRight /></b>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <Testimonials compact />

      <section className="sp-related section">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">Better together</span><h2>Add the next step.</h2></div>
            <p>One team keeps your project moving, so you don’t have to hand it off.</p>
          </div>
          <div className="sp-related__grid">
            {service.related.map(({ slug: relatedSlug, pitch }) => {
              const related = servicePages[relatedSlug]
              return (
                <Link key={relatedSlug} to={related.path} className={`sp-related__card sp-related__card--${related.tone}`}>
                  <span>{related.eyebrow}</span>
                  <h3>{related.title}</h3>
                  <p>{pitch}</p>
                  <b>See {related.title.toLowerCase()} <ArrowRight /></b>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="sp-cta">
        <div className="shell sp-cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Working together</span>
            <h2>We can get your project done!</h2>
          </div>
          <div className="sp-cta__actions">
            <Link className="button button--paper" to={quoteTo}>Request a quote <ArrowUpRight /></Link>
            <Link className="button button--outline" to="/quote#upload">Upload your file</Link>
            <a className="sp-cta__phone" href="tel:+15075324493">or call 507-532-4493</a>
          </div>
        </div>
      </section>
    </div>
  )
}
