import { FileCheck2, LockKeyhole, UploadCloud } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
import { services } from '../data'

export default function Quote() {
  const [params] = useSearchParams()
  const selectedService = params.get('service') || ''
  const selectedProject = params.get('project') || ''
  const selectedFeel = params.get('feel') || ''
  const projectLabels = {
    'business-cards': 'business cards',
    'direct-mail': 'a direct mail campaign',
    banners: 'a banner or large-format project',
    'sample-pack': 'a curated Henle sample pack',
    'fall-campaign': 'a fall campaign',
  }
  const feelLabels = {
    precise: 'clean and precise',
    tactile: 'natural and tactile',
    durable: 'bold and durable',
  }
  const starterDescription = selectedProject
    ? `I’m interested in ${projectLabels[selectedProject] || selectedProject}${selectedFeel ? ` with a ${feelLabels[selectedFeel] || selectedFeel} direction` : ''}. `
    : ''

  return (
    <>
      <SEO title="Get a Printing Quote and Upload Files" description="Describe your printing project, request a quote, and upload PDF, AI, EPS, PNG, JPG, or TIFF artwork." />
      <PageHero eyebrow="Get a quote" title="Let’s put your project in motion." intro="Share the basics below. A real member of our Marshall team will review your project and follow up with the right questions." tone="cyan" />
      <section className="quote-section section" id="upload">
        <div className="shell quote-grid">
          <aside className="quote-aside reveal">
            <span className="eyebrow">What happens next</span>
            <h2>Helpful, human, and no pressure.</h2>
            <ol>
              <li><span>1</span><div><strong>We review the details</strong><p>A print specialist looks at your specs and file.</p></div></li>
              <li><span>2</span><div><strong>We fill in the gaps</strong><p>We may call to confirm stock, finish, or timing.</p></div></li>
              <li><span>3</span><div><strong>You get a clear quote</strong><p>Pricing and production recommendations, explained.</p></div></li>
            </ol>
            <div className="quote-contact"><small>Prefer to talk?</small><a href="tel:+15075324493">507-532-4493</a><span>Mon–Thu 8–5 · Fri 8–noon</span></div>
          </aside>

          <form className="project-form reveal" action="https://formsubmit.co/info@henleprinting.com" method="POST" encType="multipart/form-data">
            <input type="hidden" name="_subject" value="New Henle Printing website quote request" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input className="form-honeypot" type="text" name="_honey" aria-label="Leave this field blank" tabIndex="-1" autoComplete="off" />
            <fieldset>
              <legend>About you</legend>
              <div className="form-row">
                <label>First name <span>*</span><input name="First name" autoComplete="given-name" required /></label>
                <label>Last name <span>*</span><input name="Last name" autoComplete="family-name" required /></label>
              </div>
              <div className="form-row">
                <label>Email <span>*</span><input type="email" name="Email" autoComplete="email" required /></label>
                <label>Phone<input type="tel" name="Phone" autoComplete="tel" /></label>
              </div>
              <label>Company<input name="Company" autoComplete="organization" /></label>
            </fieldset>
            <fieldset>
              <legend>About the project</legend>
              <div className="form-row">
                <label>Service<select name="Service" defaultValue={selectedService}>
                  <option value="">Not sure yet</option>
                  {services.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}
                </select></label>
                <label>Quantity<input type="number" name="Quantity" min="1" placeholder="e.g. 500" /></label>
              </div>
              <div className="form-row">
                <label>Finished size<input name="Finished size" placeholder="e.g. 8.5 × 11 in" /></label>
                <label>Needed by<input type="date" name="Needed by" /></label>
              </div>
              <label>Tell us about the project <span>*</span><textarea name="Project description" rows="5" defaultValue={starterDescription} placeholder="Format, color, paper, finishing, mailing, or anything else you know…" required /></label>
              <label className="file-drop">
                <UploadCloud />
                <strong>Upload a print-ready file <span>(optional)</span></strong>
                <small>PDF, AI, EPS, PNG, JPG, or TIFF · Maximum 10 MB</small>
                <input type="file" name="attachment" accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.tif,.tiff,application/pdf,image/png,image/jpeg,image/tiff,application/postscript" />
              </label>
              <label className="checkbox-label"><input type="checkbox" name="Design help requested" value="Yes" /> <span>I would like help with design or file preparation.</span></label>
            </fieldset>
            <button className="button button--submit" type="submit">Send my project <FileCheck2 /></button>
            <p className="privacy-note"><LockKeyhole size={14} /> Your information and files are used only to prepare your quote.</p>
          </form>
        </div>
      </section>
    </>
  )
}
