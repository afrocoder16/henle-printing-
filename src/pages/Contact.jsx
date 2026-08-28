import { Clock3, Mail, MapPin, Phone } from 'lucide-react'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'

export default function Contact() {
  return (
    <>
      <SEO title="Contact Henle Printing Company" description="Call, email, or visit Henle Printing Company in Marshall, Minnesota." />
      <PageHero eyebrow="Contact" title="Come by. Call us. Bring the idea." intro="Questions, unusual formats, tight timelines—we’re always glad to talk through a print project." />
      <section className="contact-section section">
        <div className="shell contact-grid">
          <div className="contact-details reveal">
            <span className="eyebrow">Henle Printing Company</span>
            <h2>Your local pressroom.</h2>
            <div className="contact-list">
              <a href="https://maps.google.com/?q=703+Ontario+Rd+Marshall+MN+56258" target="_blank" rel="noreferrer"><MapPin /><span><strong>Visit us</strong>703 Ontario Rd<br />Marshall, MN 56258</span></a>
              <a href="tel:+15075324493"><Phone /><span><strong>Call us</strong>507-532-4493<br /><small>Toll-free: 800-491-4493</small></span></a>
              <a href="mailto:info@henleprinting.com"><Mail /><span><strong>Email us</strong>info@henleprinting.com</span></a>
              <div><Clock3 /><span><strong>Business hours</strong>Monday–Thursday: 8am–5pm<br />Friday: 8am–noon<br /><small>Saturday & Sunday: closed</small></span></div>
            </div>
          </div>
          <form className="contact-form reveal" action="https://formsubmit.co/info@henleprinting.com" method="POST">
            <input type="hidden" name="_subject" value="New Henle Printing website contact message" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input className="form-honeypot" type="text" name="_honey" aria-label="Leave this field blank" tabIndex="-1" autoComplete="off" />
            <span className="eyebrow">Send a note</span>
            <div className="form-row"><label>Name <span>*</span><input name="Name" autoComplete="name" required /></label><label>Email <span>*</span><input type="email" name="Email" autoComplete="email" required /></label></div>
            <label>Phone<input type="tel" name="Phone" autoComplete="tel" /></label>
            <label>How can we help? <span>*</span><textarea name="Message" rows="6" required /></label>
            <button className="button" type="submit">Send message <Mail /></button>
          </form>
        </div>
        <div className="shell map-wrap reveal">
          <iframe title="Map showing Henle Printing Company at 703 Ontario Road in Marshall, Minnesota" src="https://www.google.com/maps?q=703%20Ontario%20Rd%2C%20Marshall%2C%20MN%2056258&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div className="map-label"><span>Find us on Highway 59</span><strong>703 Ontario Rd</strong><small>Marshall, Minnesota 56258</small></div>
        </div>
      </section>
    </>
  )
}
