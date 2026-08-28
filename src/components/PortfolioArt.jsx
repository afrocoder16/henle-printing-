export default function PortfolioArt({ type }) {
  if (type === 'cards') {
    return (
      <div className="art art--cards" aria-hidden="true">
        <div className="mock-card mock-card--back"><span>H</span></div>
        <div className="mock-card mock-card--front"><b>North Star</b><small>CONSULTING CO.</small><i /></div>
      </div>
    )
  }

  if (type === 'poster') {
    return (
      <div className="art art--poster" aria-hidden="true">
        <span className="poster-kicker">MARSHALL ARTS</span>
        <strong>MAKE<br />SOME<br /><em>NOISE</em></strong>
        <span className="poster-date">09.14 — 7PM</span>
        <i className="poster-circle" />
      </div>
    )
  }

  if (type === 'postcard') {
    return (
      <div className="art art--postcard" aria-hidden="true">
        <div className="sun"><i /><i /><i /></div>
        <strong>Here’s to<br />wide open<br />summers.</strong>
        <small>SOUTHWEST MINNESOTA</small>
      </div>
    )
  }

  if (type === 'menu') {
    return (
      <div className="art art--menu" aria-hidden="true">
        <div className="menu-fold menu-fold--left">
          <small>LOCAL / SEASONAL</small><strong>FIELD<br /><em>&</em> TABLE</strong>
        </div>
        <div className="menu-fold menu-fold--right">
          <b>SUMMER MENU</b><span /><span /><span /><span /><span />
        </div>
      </div>
    )
  }

  if (type === 'labels') {
    return (
      <div className="art art--labels" aria-hidden="true">
        <div className="label label--round"><small>PRAIRIE</small><b>HONEY</b><i>MN</i></div>
        <div className="label label--arch"><small>SMALL BATCH</small><b>APPLE<br />BUTTER</b><i>1987</i></div>
      </div>
    )
  }

  return (
    <div className="art art--booklet" aria-hidden="true">
      <div className="book-shadow" />
      <div className="book-cover">
        <small>LYON COUNTY</small>
        <strong>ROOTED<br />HERE</strong>
        <span>ANNUAL REPORT / 2025</span>
        <i /><i /><i />
      </div>
    </div>
  )
}
