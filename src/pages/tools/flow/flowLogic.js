// Logic for the Project Estimator flow: URL state, deadlines, templates, and the in-browser file check.
// Prices come from ../pricingData.js (DEMO DATA). Production times below are estimates, not Henle's real schedule.

import { PRODUCTS, makeConfig } from '../pricingData'
import { addBusinessDays, businessDaysBetween, fromIso, iso, prevBusinessDay, subtractBusinessDays } from '../deadlineData'
import { BLEED, templates } from '../templateData'

export const STEPS = [
  { id: 'project', label: 'Project', next: 'Next: Paper & finish' },
  { id: 'paper', label: 'Paper & finish', next: 'Next: Artwork' },
  { id: 'artwork', label: 'Artwork', next: 'Next: Send' },
  { id: 'send', label: 'Send', next: 'Get my exact quote' },
]

/* ---------- URL <-> state ---------- */

export function cfgFromParams(params) {
  const id = params.get('product')
  const product = PRODUCTS[id] && !PRODUCTS[id].hidden ? id : 'flyers'
  const over = product === 'flyers' ? { qty: 1000, sides: 2 } : {}
  const size = params.get('size')
  if (size) over.size = size
  const qty = Number(params.get('qty'))
  if (qty) over.qty = qty
  ;['color', 'paper', 'turn'].forEach((k) => { const v = params.get(k); if (v) over[k] = v })
  const sides = Number(params.get('sides'))
  if (sides) over.sides = sides
  const extra = Number(params.get('extra'))
  if (extra) over.extra = extra
  if (params.has('fin')) over.finishing = params.get('fin').split(',').filter(Boolean)
  return makeConfig(product, over)
}

export function paramsFor(cfg, extras = {}) {
  const next = new URLSearchParams()
  next.set('product', cfg.product)
  next.set('size', cfg.size)
  next.set('qty', String(cfg.qty))
  next.set('color', cfg.color)
  next.set('sides', String(cfg.sides))
  next.set('paper', cfg.paper)
  if (cfg.finishing.length) next.set('fin', cfg.finishing.join(','))
  next.set('turn', cfg.turn)
  if (cfg.extra != null) next.set('extra', String(cfg.extra))
  Object.entries(extras).forEach(([k, v]) => { if (v) next.set(k, v) })
  return next
}

/* ---------- deadlines ---------- */

export const TURN_DAYS = { standard: 7, rush: 3, asap: 1 }
const TURN_ORDER = ['standard', 'rush', 'asap']
export const DESIGN_DAYS = 2

export const todayNoon = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d }

// Works backward from the date the customer needs the job (or forward from today if there is no date).
export function schedule({ turn, neededIso, today, designDays = 0 }) {
  const days = TURN_DAYS[turn]
  if (!neededIso) return { mode: 'open', earliest: addBusinessDays(today, days + designDays), days, designDays }

  const goal = prevBusinessDay(fromIso(neededIso))
  const submitBy = subtractBusinessDays(goal, days)
  const startBy = designDays ? subtractBusinessDays(submitBy, designDays) : submitBy
  const late = iso(startBy) < iso(today)
  const slack = late ? -1 : businessDaysBetween(today, startBy)
  const status = late ? 'late' : slack <= 1 ? 'tight' : slack <= 4 ? 'good' : 'roomy'

  let suggestion = null
  if (status === 'late' || status === 'tight') {
    for (const t of TURN_ORDER.slice(TURN_ORDER.indexOf(turn) + 1)) {
      const s = subtractBusinessDays(goal, TURN_DAYS[t])
      const start = designDays ? subtractBusinessDays(s, designDays) : s
      if (iso(start) >= iso(today)) { suggestion = { turn: t }; break }
    }
  }
  return { mode: 'date', goal, submitBy, startBy, slack, status, suggestion, days, designDays }
}

/* ---------- geometry, templates ---------- */

const quarter = (v) => Math.round(v * 4) / 4

export function pieceGeometry(cfg) {
  const p = PRODUCTS[cfg.product]
  const s = p.sizes.find((x) => x.id === cfg.size)
  const large = p.kind === 'large'
  let w = quarter(large ? s.w * 12 : s.w)
  let h = quarter(large ? s.h * 12 : s.h)
  let folds = []
  if (p.id === 'brochures') {
    ;[w, h] = [Math.max(w, h), Math.min(w, h)]
    folds = [1 / 3, 2 / 3]
  }
  return {
    title: `${p.label}, ${s.label}`,
    w, h, folds,
    bleed: large ? 0.25 : BLEED,
    safe: large ? 0.5 : 0.125,
    large,
    perPage: p.kind === 'booklet',
  }
}

const sortedKey = (a, b) => [a, b].sort((x, y) => x - y).join('x')

export function matchTemplate(geo) {
  const key = sortedKey(geo.w, geo.h)
  if (geo.folds.length) return templates.find((t) => t.id === 'trifold' && sortedKey(t.w, t.h) === key)
  return templates.find((t) => !t.folds.length && sortedKey(t.w, t.h) === key)
}

const trim = (n) => Number(n.toFixed(3)).toString()
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const inchLabel = (w, h) => `${trim(w)} × ${trim(h)} in`

export function makeTemplateSvg(geo) {
  const U = 100
  const b = geo.bleed * U
  const W = geo.w * U
  const H = geo.h * U
  const safe = geo.safe * U
  const full = { w: W + 2 * b, h: H + 2 * b }
  const font = Math.max(10, Math.min(W, H) / 11)
  const folds = geo.folds.map((f) => `<line x1="${b + W * f}" y1="0" x2="${b + W * f}" y2="${full.h}" stroke="#00a6c8" stroke-width="2" stroke-dasharray="10 7"/>`).join('')
  const lines = [
    [geo.title, font * 1.05, '#102a43', 700],
    [`Trim ${inchLabel(geo.w, geo.h)}   |   With bleed ${inchLabel(geo.w + 2 * geo.bleed, geo.h + 2 * geo.bleed)}`, font * 0.58, '#102a43', 600],
    ['Keep text and logos inside the green line', font * 0.58, '#1c8a4a', 600],
    ['Extend backgrounds and photos to the red line', font * 0.58, '#d6402f', 600],
    ['Hide or delete these guides before you export', font * 0.5, '#666666', 500],
  ]
  const text = lines.map(([t, size, color, weight], i) => `<text x="${full.w / 2}" y="${full.h / 2 + (i - 1.6) * font * 1.15}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size.toFixed(1)}" font-weight="${weight}" fill="${color}">${esc(t)}</text>`).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${trim(geo.w + 2 * geo.bleed)}in" height="${trim(geo.h + 2 * geo.bleed)}in" viewBox="0 0 ${full.w} ${full.h}">
<rect width="${full.w}" height="${full.h}" fill="#ffe7e3"/>
<rect x="${b}" y="${b}" width="${W}" height="${H}" fill="#ffffff" stroke="#102a43" stroke-width="2.5"/>
<rect x="${b + safe}" y="${b + safe}" width="${W - 2 * safe}" height="${H - 2 * safe}" fill="none" stroke="#1c8a4a" stroke-width="2.5" stroke-dasharray="12 8"/>
<rect x="1" y="1" width="${full.w - 2}" height="${full.h - 2}" fill="none" stroke="#f15a4a" stroke-width="2"/>
${folds}
${text}
</svg>
`
}

export function downloadText(filename, content, type = 'image/svg+xml') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------- in-browser file check (nothing is uploaded) ---------- */

export const MAX_FILE_MB = 25
export const ACCEPT = '.pdf,.ai,.eps,.png,.jpg,.jpeg,.tif,.tiff,application/pdf,image/png,image/jpeg,image/tiff'
const EXTENSIONS = ['pdf', 'ai', 'eps', 'png', 'jpg', 'jpeg', 'tif', 'tiff']
const near = (a, b, tol = 0.03) => Math.abs(a - b) <= tol

export const formatBytes = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

function measureImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { reject(new Error('unreadable')); URL.revokeObjectURL(url) }
    img.src = url
  })
}

async function readPdf(file) {
  const buf = await file.slice(0, 8 * 1024 * 1024).arrayBuffer()
  const text = new TextDecoder('latin1').decode(buf)
  const box = text.match(/\/MediaBox\s*\[\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\]/)
  const pages = (text.match(/\/Type\s*\/Page(?![s\w])/g) || []).length
  return {
    size: box ? { w: Math.abs(Number(box[3]) - Number(box[1])) / 72, h: Math.abs(Number(box[4]) - Number(box[2])) / 72 } : null,
    pages,
    hasTrimOrBleedBox: /\/(TrimBox|BleedBox)\s*\[/.test(text),
  }
}

const worst = (lines) => (lines.some((l) => l.level === 'bad') ? 'bad' : lines.some((l) => l.level === 'warn') ? 'warn' : 'good')

export async function checkFile(file, geo, cfg) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const lines = []
  const result = { name: file.name, bytes: file.size, ext }
  const bleedW = geo.w + 2 * geo.bleed
  const bleedH = geo.h + 2 * geo.bleed
  const need = `${inchLabel(bleedW, bleedH)} with bleed`

  if (!EXTENSIONS.includes(ext)) {
    lines.push({ level: 'bad', text: `.${ext || '?'} files aren’t accepted. Send a PDF (best), AI, EPS, PNG, JPG, or TIFF.` })
    return { ...result, level: 'bad', lines }
  }
  if (file.size > MAX_FILE_MB * 1048576) {
    lines.push({ level: 'bad', text: `This file is ${formatBytes(file.size)}, over our ${MAX_FILE_MB} MB limit here. Compress it, or tell us and we’ll arrange a bigger transfer.` })
    return { ...result, level: 'bad', lines }
  }
  lines.push({ level: 'good', text: `${ext.toUpperCase()} · ${formatBytes(file.size)}: an accepted file type.` })

  try {
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      const dims = await measureImage(file)
      result.dims = dims
      const ratio = dims.w / dims.h
      const matchesBleed = near(ratio, bleedW / bleedH, 0.03) || near(ratio, bleedH / bleedW, 0.03)
      const matchesTrim = near(ratio, geo.w / geo.h, 0.03) || near(ratio, geo.h / geo.w, 0.03)
      const widthIn = matchesBleed ? Math.max(bleedW, bleedH) : matchesTrim ? Math.max(geo.w, geo.h) : null
      const longPx = Math.max(dims.w, dims.h)
      const ppi = widthIn ? longPx / widthIn : Math.min(dims.w / geo.w, dims.h / geo.h)
      result.ppi = Math.round(ppi)
      const good = geo.large ? 100 : 300
      const ok = geo.large ? 60 : 200
      const px = `${dims.w.toLocaleString()} × ${dims.h.toLocaleString()} px`
      if (ppi >= good) lines.push({ level: 'good', text: `${px} works out to about ${Math.round(ppi)} ppi at your size. That’s sharp.` })
      else if (ppi >= ok) lines.push({ level: 'warn', text: `${px} works out to about ${Math.round(ppi)} ppi, a little soft up close. ${geo.large ? 'Fine from a distance.' : 'Aim for 300 ppi if you can.'}` })
      else lines.push({ level: 'bad', text: `${px} is only about ${Math.round(ppi)} ppi at your size, so it will print blurry or blocky. Send a larger original.` })
      if (matchesBleed) lines.push({ level: 'good', text: `The proportions match the file size with bleed (${need}).` })
      else if (matchesTrim) lines.push({ level: 'warn', text: `The proportions match your final size (${inchLabel(geo.w, geo.h)}) but not the bleed size. Background that touches the edge needs ${geo.bleed} in extra on every side.` })
      else lines.push({ level: 'warn', text: `The proportions don’t match your piece (${inchLabel(geo.w, geo.h)}). We can crop or place it, or you can resize it.` })
      lines.push({ level: 'info', text: 'JPG and PNG files are RGB. Henle converts to CMYK for press, and bright colors may print a touch duller.' })
    } else if (ext === 'pdf') {
      const pdf = await readPdf(file)
      result.pdf = pdf
      if (pdf.size) {
        const { w, h } = pdf.size
        const asBleed = (near(w, bleedW) && near(h, bleedH)) || (near(w, bleedH) && near(h, bleedW))
        const asTrim = (near(w, geo.w) && near(h, geo.h)) || (near(w, geo.h) && near(h, geo.w))
        if (asBleed) lines.push({ level: 'good', text: `Page size is ${inchLabel(w, h)}: exactly your size with bleed.` })
        else if (asTrim) lines.push({ level: 'warn', text: `Page size is ${inchLabel(w, h)}: your final size, with no bleed. Anything that touches the edge needs ${geo.bleed} in extra on every side (${need}).` })
        else lines.push({ level: 'warn', text: `Page size is ${inchLabel(w, h)}, but your piece is ${inchLabel(geo.w, geo.h)} (${need}). We can resize, but proportions may change.` })
      } else {
        lines.push({ level: 'info', text: 'We couldn’t read the page size automatically. Henle will check it when the file arrives.' })
      }
      if (pdf.hasTrimOrBleedBox) lines.push({ level: 'good', text: 'The PDF includes trim or bleed boxes. That’s a sign it was set up for print.' })
      if (pdf.pages && !geo.perPage) {
        if (cfg.sides === 2 && pdf.pages < 2) lines.push({ level: 'warn', text: 'You chose 2-sided, but this PDF has one page. Add the back as a second page.' })
        else if (cfg.sides === 1 && pdf.pages > 1) lines.push({ level: 'warn', text: `You chose 1-sided, but this PDF has ${pdf.pages} pages.` })
        else lines.push({ level: 'good', text: `${pdf.pages} ${pdf.pages === 1 ? 'page' : 'pages'}, which matches ${cfg.sides === 2 ? '2-sided' : '1-sided'}.` })
      }
    } else {
      lines.push({ level: 'info', text: `${ext.toUpperCase()} files can’t be read in the browser. Henle’s designers will check the size, bleed, and resolution when it arrives.` })
    }
  } catch {
    lines.push({ level: 'info', text: 'We couldn’t read inside this file here. Henle will check it when it arrives.' })
  }
  return { ...result, level: worst(lines), lines }
}

/* ---------- free design tools ---------- */

export const FREE_TOOLS = [
  { id: 'canva', name: 'Canva', best: 'Easiest for most people', url: 'https://www.canva.com', tip: 'Create a design with a custom size (use the “with bleed” size below), turn on “Show print bleed” in the View settings, then download as PDF Print. Exporting in CMYK is usually a paid feature, so Henle can convert an RGB file.' },
  { id: 'scribus', name: 'Scribus', best: 'Free, built for print', url: 'https://www.scribus.net', tip: 'A free page-layout program. Choose a custom page size, set Bleeds to the amount shown below, and export as PDF. It supports CMYK. Takes a bit more time to learn.' },
  { id: 'inkscape', name: 'Inkscape', best: 'Logos and vector art', url: 'https://inkscape.org', tip: 'A free vector editor. Set the document size to the bleed size and save as PDF or SVG. It works in RGB, so Henle converts the colors.' },
  { id: 'gimp', name: 'GIMP', best: 'Photos and image editing', url: 'https://www.gimp.org', tip: 'A free photo editor. Create the image at 300 ppi at the bleed size and export a PNG, or JPG at high quality. Use it for pictures, not page layout.' },
  { id: 'slides', name: 'Google Slides', best: 'A quick, simple piece', url: 'https://slides.google.com', tip: 'Set a custom page size in Page setup and download as PDF. There are no bleed guides and the colors are RGB, so add the extra edge yourself and expect a color shift.' },
]

/* ---------- recommendations ---------- */

export const GOAL_MAP = {
  budget: { paper: 'standard', fin: [] },
  premium: { paper: 'premium', fin: ['laminate'] },
  durable: { paper: 'standard', fin: ['laminate'] },
  natural: { paper: 'specialty', fin: [] },
}

export const PAPER_GUIDE_ID = {
  cards: 'business-cards', flyers: 'flyers', postcards: 'postcards', brochures: 'brochures', booklets: 'booklets',
  posters: 'flyers', banners: 'signs', notepads: 'forms', forms: 'forms',
}
