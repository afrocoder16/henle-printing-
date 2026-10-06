import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import RegistrationMark from '../components/RegistrationMark'
import ServiceCard from '../components/ServiceCard'
import PromoSection from '../components/PromoSection'
import CountUp from '../components/CountUp'
import MonthlyPromo from '../components/MonthlyPromo'
import Testimonials from '../components/Testimonials'
import { services } from '../data'
import { pageImage, pages } from '../portfolioData'

const featuredWork = [
  { number: 20, title: 'Marshall High School' },
  { number: 6, title: 'Pioneer Public Television' },
  { number: 18, title: 'Community events & guides' },
].map(({ number, title }) => ({ page: pages.find((p) => p.number === number), title }))

export default function Home() {
  return (
    <>
      <SEO
        title="Commercial Printing in Marshall, MN"
        description="Award-winning inkjet, offset, digital, design, finishing, and mailing for southwest Minnesota since 1980."
      />
      <section className="home-hero">
        <div className="shell home-hero__grid">
          <div className="home-hero__copy reveal">
            <div className="hero-proof"><span className="rating">★ 4.7</span><span>Trusted across southwest Minnesota</span></div>
            <h1><span>Your idea.</span><em><span>Beautifully</span><span>printed.</span></em></h1>
            <p className="hero-services">Digital • Offset • Inkjet • Mailing • Design</p>
            <p className="hero-lede">From first sketch to final delivery, Henle pairs 45+ years of craftsmanship with the equipment to make every piece count.</p>
            <div className="hero-actions">
              <Link className="button" to="/quote">Get a quote <ArrowUpRight /></Link>
              <Link className="text-link" to="/quote#upload">Upload your file <ArrowRight /></Link>
            </div>
            <div className="hero-starters" aria-label="Popular project shortcuts">
              <span>Popular starts</span>
              <Link to="/quote?project=business-cards">Business cards</Link>
              <Link to="/quote?project=direct-mail">Direct mail</Link>
              <Link to="/quote?project=banners">Banners</Link>
            </div>
            <a className="scroll-cue" href="#monthly-update"><ArrowDown size={17} /> See this month’s note</a>
          </div>
          <div className="home-hero__visual reveal reveal--delay">
            <div className="hero-image-wrap">
              <img src={`${import.meta.env.BASE_URL}assets/henle-print-suite.png`} alt="A colorful arrangement of professionally printed posters, cards, labels, brochures, and booklets" />
              <span className="trim-mark trim-mark--tl" /><span className="trim-mark trim-mark--br" />
            </div>
            <div className="hero-sticker">PRESS<br /><strong>READY</strong><small>MARSHALL, MN</small></div>
            <RegistrationMark className="hero-registration" />
          </div>
        </div>
        <div className="ink-stripes" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <MonthlyPromo />

      <section className="proof-strip" id="proof">
        <div className="shell proof-grid">
          <div><CountUp end={45} duration={5000} suffix="+" label="45 plus years" /><span>Years at the craft</span></div>
          <div><CountUp start={1900} end={1980} duration={5000} label="Founded in 1980" /><span>Founded in Marshall</span></div>
          <div><CountUp end={20} duration={5000} prefix="~" label="Approximately 20 team members" /><span>Local team members</span></div>
          <div><CountUp end={4.7} decimals={1} duration={5000} suffix=" ★" label="4.7 star customer rating" /><span>Customer rating</span></div>
        </div>
      </section>

      <section className="section services-preview">
        <div className="shell">
          <div className="section-heading reveal">
            <div><span className="eyebrow">What we do</span><h2>One shop. Every step.</h2></div>
            <p>Ideas, ink, paper, finishing, postage—we keep the entire job moving under one roof.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => <ServiceCard key={service.slug} service={service} />)}
          </div>
        </div>
      </section>

      <PromoSection />

      <section className="story-section section" id="about">
        <div className="shell story-grid">
          <div className="story-art reveal">
            <div className="story-sheet story-sheet--one">
              <img src={`${import.meta.env.BASE_URL}history/main-street.jpg`} alt="A vintage photograph of Marshall’s Main Street with a Henle Printing sign over the sidewalk" loading="lazy" />
              <span>H</span>
            </div>
            <div className="story-sheet story-sheet--two">
              <img src={`${import.meta.env.BASE_URL}history/linotype.jpg`} alt="A.J. Henle at a Linotype machine" loading="lazy" />
              <strong>45</strong><small>YEARS OF<br />GOOD IMPRESSIONS</small>
            </div>
            <div className="story-sheet story-sheet--three">
              <img src={`${import.meta.env.BASE_URL}pics/mike.jpg`} alt="Mike Henle in a blue Henle Printing polo, standing in front of framed family photographs" loading="lazy" />
              <div className="story-sheet__strip">
                <span>Mike Henle<small>Third-generation owner</small></span>
                <i /><i /><i /><i />
              </div>
            </div>
          </div>
          <div className="story-copy reveal">
            <span className="eyebrow">About Henle</span>
            <h2>A family printing tradition, still moving forward.</h2>
            <p>Henle began in Marshall in 1980. Three generations of family heritage later, we remain family- and locally owned—about 20 people who know the press, know the community, and know that deadlines matter.</p>
            <ul className="check-list">
              <li><Check /> Modern pressroom technology</li>
              <li><Check /> Experienced, local guidance</li>
              <li><Check /> Award-winning service and quality</li>
            </ul>
            <div className="about-timeline" aria-label="Henle Printing Company history">
              <div><span>1980</span><strong>Founded in Marshall</strong></div>
              <div><span>3 generations</span><strong>Family printing heritage</strong></div>
              <div><span>Today</span><strong>Family & locally owned</strong></div>
            </div>
            <Link to="/about" className="text-link">Meet your local printer <ArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="section work-preview">
        <div className="shell">
          <div className="section-heading section-heading--center reveal">
            <div><span className="eyebrow">Fresh off the press</span><h2>Work made to be held.</h2></div>
            <Link to="/portfolio" className="text-link">View the portfolio <ArrowRight /></Link>
          </div>
          <div className="home-work-grid">
            {featuredWork.map(({ page, title }) => (
              <Link className="home-work-item reveal" key={page.number} to={`/portfolio?page=${page.number}`}>
                <div className="home-work-item__sheet"><img src={pageImage(page.number)} alt="" loading="lazy" width="1100" height="1424" /></div>
                <div><span>{page.collection.short}</span><h3>{title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="process section">
        <div className="shell process-grid">
          <div className="process-intro reveal"><span className="eyebrow eyebrow--light">A smooth run</span><h2>From “what if?”<br />to “wow.”</h2></div>
          <ol className="process-steps">
            <li className="reveal"><span>01</span><div><h3>Tell us the idea</h3><p>Share specs, a rough concept, or a press-ready file.</p></div></li>
            <li className="reveal"><span>02</span><div><h3>We make it press-smart</h3><p>We confirm stock, color, finish, schedule, and cost.</p></div></li>
            <li className="reveal"><span>03</span><div><h3>We print and deliver</h3><p>Your project is produced, finished, checked, and shipped.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  )
}
