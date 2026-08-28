import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFound() {
  return <section className="not-found"><SEO title="Page Not Found" description="The requested page could not be found." /><span className="eyebrow">Misprint / 404</span><h1>This page missed the trim.</h1><p>Let’s get you back to a clean sheet.</p><Link className="button" to="/"><ArrowLeft /> Back to home</Link></section>
}
