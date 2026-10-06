import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Search, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pageImage, pages, portfolioPdf } from '../portfolioData'

const LOUPE_SIZE = 230
const LOUPE_ZOOM = 2.6

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

export default function PortfolioViewer({ pageNumber, highlight, onNavigate, onClose }) {
  const index = Math.max(0, pages.findIndex((p) => p.number === pageNumber))
  const page = pages[index]
  const { collection } = page
  const pageInCollection = collection.pages.findIndex((p) => p.number === page.number)

  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const lensRef = useRef(null)
  const stripRef = useRef(null)
  const swipeRef = useRef(null)
  const indexRef = useRef(index)
  const pendingRef = useRef(null)
  const [direction, setDirection] = useState('in')
  const [hover] = useState(canHover)
  const [loupe, setLoupe] = useState(true)
  const [zoomed, setZoomed] = useState(false)

  // Read the index from a ref so rapid key presses don't reuse a stale page.
  const go = (step) => {
    const nextIndex = (indexRef.current + step + pages.length) % pages.length
    indexRef.current = nextIndex
    pendingRef.current = nextIndex
    const next = pages[nextIndex]
    setDirection(step > 0 ? 'next' : 'prev')
    setZoomed(false)
    onNavigate(next.number)
  }

  const jump = (number) => {
    if (number === page.number) return
    const nextIndex = pages.findIndex((p) => p.number === number)
    setDirection(nextIndex > index ? 'next' : 'prev')
    indexRef.current = nextIndex
    pendingRef.current = nextIndex
    setZoomed(false)
    onNavigate(number)
  }

  // Lock page scroll, move focus in, and give it back on close.
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'l') hover ? setLoupe((v) => !v) : setZoomed((v) => !v)
      if (event.key === 'Tab') {
        const focusable = dialogRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Router updates land as transitions; ignore intermediate pages until the last requested one arrives.
  useEffect(() => {
    if (pendingRef.current === null || pendingRef.current === index) {
      pendingRef.current = null
      indexRef.current = index
    }
  }, [index])

  // Warm the cache: neighbours for paging, this page's HD scan for the loupe.
  useEffect(() => {
    const neighbours = [pages[(index + 1) % pages.length], pages[(index - 1 + pages.length) % pages.length]]
    neighbours.forEach((p) => { new Image().src = pageImage(p.number) })
    new Image().src = pageImage(page.number, '-hd')
    stripRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index, page.number])

  const moveLens = (event) => {
    const lens = lensRef.current
    if (!lens || !hover || !loupe || zoomed) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const half = LOUPE_SIZE / 2
    lens.style.opacity = '1'
    lens.style.transform = `translate(${x - half}px, ${y - half}px)`
    lens.style.backgroundSize = `${rect.width * LOUPE_ZOOM}px ${rect.height * LOUPE_ZOOM}px`
    lens.style.backgroundPosition = `${half - x * LOUPE_ZOOM}px ${half - y * LOUPE_ZOOM}px`
  }

  const hideLens = () => { if (lensRef.current) lensRef.current.style.opacity = '0' }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' && !zoomed) swipeRef.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event) => {
    const start = swipeRef.current
    swipeRef.current = null
    if (!start) return
    const dx = event.clientX - start.x
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(event.clientY - start.y)) go(dx < 0 ? 1 : -1)
  }

  const quoteIdea = page.projects.length === 1
    ? `something like the ${page.projects[0].client} ${page.projects[0].pieces[0].toLowerCase()} in your portfolio`
    : `work like the ${collection.title.toLowerCase()} in your portfolio`

  return (
    <div className={`viewer viewer--${collection.color}`} role="dialog" aria-modal="true" aria-labelledby="viewer-title" ref={dialogRef}>
      <header className="viewer__bar">
        <div className="viewer__title">
          <span className="viewer__chip">{collection.title}</span>
          <h2 id="viewer-title">Page {pageInCollection + 1} of {collection.pages.length}</h2>
        </div>
        <div className="viewer__tools">
          <span className="viewer__count" aria-label={`Sheet ${index + 1} of ${pages.length}`}>
            <b>{String(index + 1).padStart(2, '0')}</b> / {String(pages.length).padStart(2, '0')}
          </span>
          {hover ? (
            <button type="button" className={`viewer__tool ${loupe ? 'is-on' : ''}`} aria-pressed={loupe} onClick={() => setLoupe(!loupe)}>
              <Search size={17} /> <span>Loupe</span>
            </button>
          ) : (
            <button type="button" className={`viewer__tool ${zoomed ? 'is-on' : ''}`} aria-pressed={zoomed} onClick={() => setZoomed(!zoomed)}>
              {zoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />} <span>{zoomed ? 'Fit' : 'Zoom'}</span>
            </button>
          )}
          <button type="button" className="viewer__close" onClick={onClose} ref={closeRef} aria-label="Close portfolio viewer"><X /></button>
        </div>
      </header>

      <div className="viewer__body">
        <div className={`viewer__stage ${zoomed ? 'is-zoomed' : ''}`} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <button type="button" className="viewer__nav viewer__nav--prev" onClick={() => go(-1)} aria-label="Previous page"><ChevronLeft /></button>
          <figure
            key={page.number}
            className={`viewer__sheet viewer__sheet--${direction}`}
            onPointerMove={moveLens}
            onPointerLeave={hideLens}
          >
            <img
              src={pageImage(page.number, zoomed ? '-hd' : '')}
              alt={`Portfolio page ${page.number}: ${page.projects.map((p) => `${p.client} ${p.pieces.join(', ')}`).join('; ')}`}
              width="1100"
              height="1424"
              draggable="false"
            />
            <i className="crop crop--tl" /><i className="crop crop--tr" /><i className="crop crop--bl" /><i className="crop crop--br" />
            {hover && loupe && !zoomed && (
              <span className="viewer__lens" ref={lensRef} aria-hidden="true" style={{ width: LOUPE_SIZE, height: LOUPE_SIZE, backgroundImage: `url(${pageImage(page.number, '-hd')})` }} />
            )}
          </figure>
          <button type="button" className="viewer__nav viewer__nav--next" onClick={() => go(1)} aria-label="Next page"><ChevronRight /></button>
          <p className="viewer__hint" aria-hidden="true">{hover ? (loupe ? 'Hover the page to look closer' : 'Loupe off · press L to turn it on') : zoomed ? 'Drag to explore · tap Fit to return' : 'Swipe to turn · tap Zoom to look closer'}</p>
        </div>

        <aside className="viewer__panel" aria-label="Projects on this page">
          <span className="viewer__eyebrow">On this page</span>
          <ol className="viewer__jobs">
            {page.projects.map((project) => (
              <li key={project.id} className={highlight === project.id ? 'is-highlight' : ''}>
                <strong>{project.client}</strong>
                <span>{project.pieces.join(' · ')}</span>
                {project.specs && <small>{project.specs}</small>}
                <div className="viewer__tags">{project.tags.map((tag) => <em key={tag}>{tag}</em>)}</div>
              </li>
            ))}
          </ol>
          <div className="viewer__actions">
            <Link className="button button--paper" to={`/quote?service=${collection.service}&project=${encodeURIComponent(quoteIdea)}`}>
              Quote something like this <ArrowUpRight />
            </Link>
            <a className="viewer__download" href={portfolioPdf} download>
              <Download size={15} /> Full 2023 portfolio PDF · 34 MB
            </a>
          </div>
        </aside>
      </div>

      <nav className="viewer__strip" aria-label="All portfolio pages" ref={stripRef}>
        {pages.map((p, i) => (
          <Fragment key={p.number}>
            {(i === 0 || pages[i - 1].collection !== p.collection) && (
              <span className={`viewer__strip-label viewer__strip-label--${p.collection.color}`}>{p.collection.short}</span>
            )}
            <button type="button" aria-current={p.number === page.number} aria-label={`${p.collection.title}, page ${p.collection.pages.findIndex((cp) => cp.number === p.number) + 1}`} onClick={() => jump(p.number)}>
              <img src={pageImage(p.number, '-thumb')} alt="" loading="lazy" width="360" height="466" />
            </button>
          </Fragment>
        ))}
      </nav>
    </div>
  )
}
