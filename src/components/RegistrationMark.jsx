export default function RegistrationMark({ className = '' }) {
  return (
    <span className={`registration-mark ${className}`} aria-hidden="true">
      <i className="ring ring--c" />
      <i className="ring ring--m" />
      <i className="ring ring--y" />
      <i className="cross cross--h" />
      <i className="cross cross--v" />
    </span>
  )
}
