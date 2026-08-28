import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import PortfolioArt from '../components/PortfolioArt'
import SEO from '../components/SEO'
import { portfolioItems } from '../data'

const filters = ['All', 'Business', 'Mail', 'Large format', 'Hospitality', 'Labels', 'Publications']

export default function Portfolio() {
  const [filter, setFilter] = useState('All')
  const items = filter === 'All' ? portfolioItems : portfolioItems.filter((item) => item.category === filter)

  return (
    <>
      <SEO title="Commercial Print Portfolio" description="See business cards, posters, postcards, labels, menus, and publications printed by Henle." />
      <PageHero eyebrow="Portfolio" title="Color you can almost feel." intro="A sampling of the formats, finishes, and possibilities we bring to life for businesses and organizations across the region." tone="coral" />
      <section className="section portfolio-section">
        <div className="shell">
          <div className="filter-row" role="group" aria-label="Filter portfolio by category">
            {filters.map((item) => (
              <button type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>
            ))}
          </div>
          <div className="portfolio-grid" aria-live="polite">
            {items.map((item) => (
              <article className={`portfolio-item ${item.className}`} key={item.id}>
                <PortfolioArt type={item.type} />
                <div className="portfolio-item__caption">
                  <div><span>{item.category}</span><h2>{item.title}</h2><small>{item.note}</small></div>
                  <Link to={`/quote?project=${item.id}`} aria-label={`Request a project like ${item.title}`}><ArrowUpRight /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="portfolio-note">
        <div className="shell portfolio-note__inner">
          <span>No two jobs run exactly alike.</span>
          <p>These sample pieces show the range. Your format, stock, color, and finishing are built around your goals.</p>
          <Link to="/quote" className="button">Make something of your own <ArrowUpRight /></Link>
        </div>
      </section>
    </>
  )
}
