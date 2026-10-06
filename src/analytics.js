// Optional Google Analytics 4. Nothing loads unless VITE_GA_ID is set at build time, for example:
//   VITE_GA_ID=G-XXXXXXXXXX npm run build
// Henle's own Google Analytics and Search Console accounts are needed for real data.

const id = import.meta.env.VITE_GA_ID

export function initAnalytics() {
  if (!id || typeof document === 'undefined' || document.getElementById('ga-script')) return
  const script = document.createElement('script')
  script.id = 'ga-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

export function trackPageView(path) {
  if (id && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_title: document.title })
}
