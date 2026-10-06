import { useEffect } from 'react'

const base = '703 Ontario Rd, Marshall, MN 56258'
const site = 'https://www.henleprinting.com'

// Sets the page title, description, canonical URL, and (optionally) a JSON-LD block for the page.
export default function SEO({ title, description, path, schema }) {
  useEffect(() => {
    document.title = `${title} | Henle Printing Company | ${base}`

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = `${description} Visit Henle Printing Company at ${base}.`

    if (path) {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = `${site}${path}`
    }

    let script = null
    if (schema) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.pageSchema = 'true'
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, path, schema])

  return null
}
