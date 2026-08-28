import RegistrationMark from './RegistrationMark'

export default function PageHero({ eyebrow, title, intro, tone = 'navy' }) {
  return (
    <section className={`page-hero page-hero--${tone}`}>
      <div className="shell page-hero__inner reveal">
        <span className="eyebrow eyebrow--light">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <RegistrationMark className="page-hero__mark" />
      <div className="color-bar" aria-hidden="true"><i /><i /><i /><i /></div>
    </section>
  )
}
