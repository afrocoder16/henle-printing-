import { ArrowRight, BadgeCheck, Boxes, ListChecks, MailCheck, Map, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import RegistrationMark from '../components/RegistrationMark'
import SEO from '../components/SEO'

const capabilities = [
  { icon: MailCheck, title: 'Bulk mailing', copy: 'Postal preparation, presorting, addressing, and paperwork handled with the same care as the printed piece.' },
  { icon: Map, title: 'Every Door Direct Mail', copy: 'Reach homes and businesses by route—without building an individual address list.' },
  { icon: ListChecks, title: 'List management', copy: 'We help clean, organize, deduplicate, and prepare your data for an accurate, efficient campaign.' },
  { icon: Boxes, title: 'Statement insertion', copy: 'Dependable billing statement printing, matching, insertion, and mail preparation.' },
  { icon: PackageCheck, title: 'Shipping & delivery', copy: 'We pack, route, and coordinate delivery to one location or many.' },
]

export default function Mailing() {
  return (
    <>
      <SEO title="Bulk Mailing and EDDM Services" description="Bulk mail, EDDM, list management, statement insertion, shipping, and delivery from Henle in Marshall." />
      <PageHero eyebrow="Mailing services" title="Printed here. Delivered everywhere it needs to go." intro="One team takes your campaign from data and design through press, postal preparation, and final delivery." tone="gold" />
      <section className="mail-intro section">
        <div className="shell mail-intro__grid">
          <div className="mail-route reveal" aria-hidden="true">
            <div className="envelope envelope--one"><span>703</span><i /></div>
            <div className="envelope envelope--two"><span>EDDM</span><i /></div>
            <div className="route-line"><i /><i /><i /><i /></div>
            <RegistrationMark />
          </div>
          <div className="mail-intro__copy reveal">
            <span className="eyebrow">Less handoff. More certainty.</span>
            <h2>A smoother route from message to mailbox.</h2>
            <p>When the printer and mailing partner are the same team, there are fewer gaps to manage. We design around postal requirements, coordinate production with your in-home date, and keep you informed along the way.</p>
            <div className="mail-benefit"><BadgeCheck /><span><strong>Postal-smart from the start</strong>Format and production choices planned with mailing in mind.</span></div>
            <Link to="/quote?service=mailing" className="button">Plan a mailing <ArrowRight /></Link>
          </div>
        </div>
      </section>
      <section className="mail-capabilities section">
        <div className="shell">
          <div className="section-heading reveal"><div><span className="eyebrow">Mailroom capabilities</span><h2>The details are handled.</h2></div><p>From a neighborhood postcard to recurring statements, we build the right workflow for the job.</p></div>
          <div className="mailing-grid">
            {capabilities.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className="mailing-card reveal"><span>0{index + 1}</span><Icon /><h3>{title}</h3><p>{copy}</p><Link to={`/quote?service=${title.toLowerCase().replaceAll(' ', '-')}`}>Request details <ArrowRight /></Link></article>
            ))}
          </div>
        </div>
      </section>
      <section className="eddm-band">
        <div className="shell eddm-band__grid">
          <div className="reveal"><span className="eyebrow eyebrow--light">EDDM</span><h2>Your message, on every door.</h2></div>
          <div className="reveal"><p>Every Door Direct Mail can put your offer into every mailbox on selected postal routes—ideal for grand openings, seasonal services, menus, and local campaigns.</p><ul><li>No individual mailing list required</li><li>Choose routes by neighborhood</li><li>Print and postal prep in one place</li></ul></div>
        </div>
      </section>
    </>
  )
}
