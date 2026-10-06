import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
import { tools } from '../toolsData'
import '../toolsHub.css'

export default function ToolsHub() {
  return (
    <>
      <SEO title="Printing Tools: Artwork, Paper, Deadlines, Pricing & Mailing" description="Free tools from Henle Printing: an artwork help center, paper and finish guide, deadline planner, price estimator, and EDDM mailing planner." path="/tools" />
      <PageHero eyebrow="Tools" title="Print smarter, before you even call." intro="Working together… we can get your project done! These free tools handle the questions we hear most, so your quote starts with the right details." tone="navy" />
      <section className="section th">
        <div className="shell">
          <ul className="th__grid">
            {tools.map((tool, i) => {
              const Icon = tool.icon
              return (
                <li key={tool.id} className={`th__item th__item--${tool.tone} ${i === 0 ? 'th__item--lead' : ''}`}>
                  <Link to={tool.path}>
                    <span className="th__num">{String(i + 1).padStart(2, '0')}</span>
                    <Icon aria-hidden="true" />
                    <h2>{tool.title}</h2>
                    <p className="th__pitch">{tool.pitch}</p>
                    <p className="th__detail">{tool.detail}</p>
                    <b>{tool.cta} <ArrowRight /></b>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
