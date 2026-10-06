import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { servicePages } from '../serviceData'

export default function ServiceCard({ service }) {
  const Icon = service.icon
  return (
    <article className={`service-card service-card--${service.color} reveal`}>
      <div className="service-card__top">
        <span>{service.number}</span>
        <Icon aria-hidden="true" />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link to={servicePages[service.slug].path}>
        Explore service <ArrowUpRight size={17} />
      </Link>
    </article>
  )
}
