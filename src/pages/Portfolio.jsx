import { useState } from 'react'
import { ArrowRight, ArrowUpRight, BookOpen, Download } from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PortfolioViewer from '../components/PortfolioViewer'
import RegistrationMark from '../components/RegistrationMark'
import SEO from '../components/SEO'
import { clientCount, collections, industries, pageImage, pages, portfolioPdf, projects, tags } from '../portfolioData'
import '../portfolio.css'

export default function Portfolio() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [tag, setTag] = useState('All')
  const [industry, setIndustry] = useState('All')

  const openNumber = Number(params.get('page'))
  const viewerOpen = pages.some((p) => p.number === openNumber)
  const highlight = params.get('job')

  const openPage = (number, job) => {
    setParams(job ? { page: number, job } : { page: number }, { state: { viewer: true }, preventScrollReset: true })
  }
  const turnPage = (number) => setParams({ page: number }, { replace: true, state: location.state, preventScrollReset: true })
  const closeViewer = () => {
    if (location.state?.viewer) navigate(-1)
    else setParams({}, { replace: true, preventScrollReset: true })
  }

  const visibleProjects = projects.filter((p) => (tag === 'All' || p.tags.includes(tag)) && (industry === 'All' || p.industry === industry))

  return (
    <>
      <SEO title="Commercial Print Portfolio" description={`${projects.length} real print projects for ${clientCount} organizations across southwest Minnesota—direct mail, stationery, event printing, and specialty work.`} />

      <section className="pf-hero">
        <div className="shell pf-hero__grid">
          <div className="pf-hero__copy reveal">
            <span className="eyebrow eyebrow--light">The Henle portfolio</span>
            <h1>Real clients.<em>Real ink.</em></h1>
            <p>Twelve pages pulled from our portfolio: {projects.length} projects for {clientCount} businesses, schools, and organizations across southwest Minnesota. Open any page and lean in—the loupe shows the detail the way we check it at the press.</p>
            <div className="pf-hero__actions">
              <button type="button" className="button button--paper" onClick={() => openPage(pages[0].number)}>Open the portfolio <BookOpen /></button>
              <a className="pf-hero__download" href={portfolioPdf} download><Download size={16} /> Full PDF · 34 MB</a>
            </div>
            <dl className="pf-stats">
              <div><dt>Pages</dt><dd>{pages.length}</dd></div>
              <div><dt>Projects</dt><dd>{projects.length}</dd></div>
              <div><dt>Clients</dt><dd>{clientCount}</dd></div>
            </dl>
          </div>

          <div className="pf-table reveal reveal--delay">
            {collections.map((collection, i) => (
              <button
                type="button"
                key={collection.id}
                className={`pf-proof pf-proof--${i + 1}`}
                onClick={() => openPage(collection.pages[0].number)}
                aria-label={`Open ${collection.title}`}
              >
                <img src={pageImage(collection.pages[0].number)} alt="" width="1100" height="1424" />
                <span className={`pf-proof__tab pf-proof__tab--${collection.color}`}>{collection.short}</span>
              </button>
            ))}
            <RegistrationMark className="pf-table__mark" />
          </div>
        </div>
        <div className="color-bar" aria-hidden="true"><i /><i /><i /><i /></div>
      </section>

      <section className="pf-collections section">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">Four collections</span><h2>Pick a stack. Pull a proof.</h2></div>
            <p>Each collection opens right here in the browser—no downloads, no waiting on a 34 MB file.</p>
          </div>

          {collections.map((collection, i) => {
            const clients = [...new Set(collection.pages.flatMap((p) => p.projects.map((project) => project.client)))]
            return (
              <article key={collection.id} className={`pf-collection pf-collection--${collection.color} ${i % 2 ? 'pf-collection--reverse' : ''} reveal`}>
                <div className="pf-collection__photo">
                  <img src={collection.photo} alt={collection.photoAlt} loading="lazy" width="1084" height="1400" />
                  <span className="pf-collection__num">0{i + 1}</span>
                </div>
                <div className="pf-collection__copy">
                  <span className="eyebrow">{collection.kicker}</span>
                  <h3>{collection.title}</h3>
                  <p>{collection.blurb}</p>
                  <p className="pf-collection__clients"><b>Featuring</b> {clients.slice(0, 4).join(' · ')}{clients.length > 4 ? ` + ${clients.length - 4} more` : ''}</p>
                  <div className="pf-collection__proofs">
                    {collection.pages.map((page, n) => (
                      <button type="button" key={page.number} onClick={() => openPage(page.number)} aria-label={`Open ${collection.title}, page ${n + 1}`}>
                        <img src={pageImage(page.number, '-thumb')} alt="" loading="lazy" width="360" height="466" />
                      </button>
                    ))}
                  </div>
                  <button type="button" className="button button--dark" onClick={() => openPage(collection.pages[0].number)}>
                    Open collection <ArrowRight />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="pf-index section">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">Project index</span><h2>Find work like yours.</h2></div>
            <p>Every job in the collections, sorted by industry and by format. Pick one to jump straight to the page it’s printed on.</p>
          </div>
          <p className="pf-filter-label">Industry</p>
          <div className="filter-row" role="group" aria-label="Filter projects by industry">
            {[{ industry: 'All', count: projects.length }, ...industries].map((item) => (
              <button type="button" key={item.industry} className={industry === item.industry ? 'active' : ''} aria-pressed={industry === item.industry} onClick={() => setIndustry(item.industry)}>
                {item.industry} <span>{item.count}</span>
              </button>
            ))}
          </div>
          <p className="pf-filter-label">Format</p>
          <div className="filter-row" role="group" aria-label="Filter projects by format">
            {[{ tag: 'All', count: projects.length }, ...tags].map((item) => (
              <button type="button" key={item.tag} className={tag === item.tag ? 'active' : ''} aria-pressed={tag === item.tag} onClick={() => setTag(item.tag)}>
                {item.tag} <span>{item.count}</span>
              </button>
            ))}
          </div>
          <p className="pf-filter-count" role="status">{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}</p>
          <ul className="pf-tickets" aria-live="polite">
            {visibleProjects.map((project) => (
              <li key={project.id}>
                <button type="button" className={`pf-ticket pf-ticket--${project.page.collection.color}`} onClick={() => openPage(project.page.number, project.id)}>
                  <span className="pf-ticket__stub">
                    <small>Job</small>
                    <b>{project.id.replace('p', '').replace('-', '·')}</b>
                  </span>
                  <span className="pf-ticket__body">
                    <small>{project.industry}</small>
                    <strong>{project.client}</strong>
                    <span>{project.pieces.join(' · ')}</span>
                  </span>
                  <ArrowUpRight className="pf-ticket__go" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="portfolio-note">
        <div className="shell portfolio-note__inner">
          <span>Your project could be the next page.</span>
          <p>Every piece here started as a conversation. Tell us what you’re making and we’ll show you similar work, stocks, and finishes.</p>
          <Link to="/quote" className="button">Start your project <ArrowUpRight /></Link>
        </div>
      </section>

      {viewerOpen && <PortfolioViewer pageNumber={openNumber} highlight={highlight} onNavigate={turnPage} onClose={closeViewer} />}
    </>
  )
}
