import { Link } from 'react-router-dom'

export default function Logo({ footer = false }) {
  return (
    <Link to="/" className={`logo ${footer ? 'logo--footer' : ''}`} aria-label="Henle Printing Company home">
      <span className="logo__mark" aria-hidden="true">
        <i className="mark-c" />
        <i className="mark-m" />
        <i className="mark-y" />
      </span>
      <span className="logo__type">
        <strong>Henle</strong>
        <small>Printing Company</small>
      </span>
    </Link>
  )
}
