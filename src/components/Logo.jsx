import { Link } from 'react-router-dom'

export default function Logo({ footer = false }) {
  return (
    <Link to="/" className={`logo ${footer ? 'logo--footer' : ''}`} aria-label="Henle Printing Company home">
      <img className="logo__mark" src={`${import.meta.env.BASE_URL}pics/new-logo.png`} alt="" width="1254" height="1254" />
      <span className="logo__type">
        <strong>Henle</strong>
        <small>Printing Company</small>
      </span>
    </Link>
  )
}
