import { useEffect } from 'react'

const base = '703 Ontario Rd, Marshall, MN 56258'

export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = `${title} | Henle Printing Company | ${base}`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = `${description} Visit Henle Printing Company at ${base}.`
  }, [title, description])

  return null
}
