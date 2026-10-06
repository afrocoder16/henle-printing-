/* =====================================================================
   DEMO DATA  -  DEMO DATA  -  DEMO DATA  -  DEMO DATA  -  DEMO DATA
   ---------------------------------------------------------------------
   Every rate, minimum, setup charge, route, household count and business
   count in this file is INVENTED for the sales demo. None of it comes from
   Henle Printing Company.

   REPLACE BEFORE LAUNCH:
     1. Price model  -> swap the numbers in PRODUCTS / FINISHING /
                        TURNAROUND for Henle's real price list (or replace
                        estimate() with a call to their quoting system).
     2. EDDM routes  -> replace generateRoutes() with real USPS EDDM route
                        data (carrier route IDs, residential + business
                        counts) from the USPS EDDM mapping tool / API.
     3. Postage      -> verify POSTAGE_PER_PIECE against the current USPS
                        EDDM Retail rate before launch.
   The estimator and planner components only call the functions exported
   here, so nothing else needs to change.
   ===================================================================== */

/* ---------- formatting helpers ---------- */

export const fmtQty = (n) => Number(n).toLocaleString('en-US')

export function fmtQtyShort(n) {
  if (n >= 1000) {
    const k = n / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return String(n)
}

/** Whole dollars unless `cents: true` is passed. */
export function fmtMoney(n, { cents } = {}) {
  const useCents = cents ?? false
  return `$${Number(n).toLocaleString('en-US', {
    minimumFractionDigits: useCents ? 2 : 0,
    maximumFractionDigits: useCents ? 2 : 0,
  })}`
}

/** Per-piece prices: two decimals from $1, three decimals below. */
export function fmtEach(n) {
  if (n >= 10) return `$${n.toFixed(2)}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(3)}`
}

/* ---------- shared price-model constants (DEMO) ---------- */

// Ink cost in dollars per square inch per printed side, at the 1,000-piece reference tier.
const INK = { bw: 0.00032, spot: 0.00068, full: 0.00105 }
// The second side of a sheet costs this fraction of the first (one pass, same sheet).
const SECOND_SIDE = 0.7
const PAPER_MUL = { standard: 1, premium: 1.55, specialty: 2.4 }

// Unit-cost multiplier by quantity, relative to the 1,000-piece reference. Interpolated on a log scale.
// Each doubling of quantity saves a little less than the one before (about 18% down to 7%), so the curve flattens.
const TIERS_SHEET = [[25, 2.46], [50, 2.02], [100, 1.675], [200, 1.407], [400, 1.196], [800, 1.04], [1600, 0.915], [3200, 0.824], [6400, 0.75], [12800, 0.69], [25600, 0.641]]
const TIERS_LARGE = [[1, 1], [2, 0.95], [3, 0.92], [5, 0.88], [10, 0.8], [25, 0.7], [50, 0.62], [100, 0.55], [250, 0.5], [500, 0.45], [1000, 0.4]]

export const COLOR_MODES = [
  { id: 'bw', label: 'Black & white', detail: 'One ink: black', inks: ['k'] },
  { id: 'spot', label: '1–2 color', detail: 'Black plus a spot color', inks: ['k', 'm'] },
  { id: 'full', label: 'Full color', detail: 'Four-color process', inks: ['c', 'm', 'y', 'k'] },
]

export const TURNAROUND = [
  { id: 'standard', label: 'Standard', detail: '5–7 business days', pct: 0 },
  { id: 'rush', label: 'Rush', detail: '2–3 business days', pct: 0.25 },
  { id: 'asap', label: 'Next day', detail: 'Next business day', pct: 0.5 },
]

export const PAPER_IDS = ['standard', 'premium', 'specialty']

/* ---------- finishing catalog (DEMO) ---------- */
// perPiece() returns dollars per piece at the reference tier. ctx: { area (sq in), w, h, sqft, perimeterFt, pages, kind }
export const FINISHING = {
  fold: { label: 'Fold', blurb: 'Crisp machine fold', setup: 0, perPiece: (c) => 0.015 + c.area * 0.00006 },
  laminate: { label: 'Laminate / UV coat', blurb: 'Wipe-clean, extra-glossy surface', setup: 8, perPiece: (c) => (c.kind === 'large' ? c.sqft * 1.9 : 0.012 + c.area * 0.0022) },
  diecut: { label: 'Die cut / rounded corners', blurb: 'Custom shape or soft corners', setup: 55, perPiece: (c) => 0.025 + c.area * 0.0004 },
  foil: { label: 'Emboss / foil stamp', blurb: 'Raised or metallic accent', setup: 80, perPiece: (c) => 0.06 + c.area * 0.0015 },
  staple: { label: 'Saddle-stitch', blurb: 'Stapled on the fold, up to 64 pages', setup: 0, perPiece: (c) => 0.07 + c.pages * 0.0025 },
  perfect: { label: 'Perfect bound', blurb: 'Glued spine, 28 pages and up', setup: 25, perPiece: (c) => 0.22 + c.pages * 0.006 },
  grommets: { label: 'Hems & grommets', blurb: 'Reinforced edge, metal eyelets', setup: 0, perPiece: (c) => c.perimeterFt * 0.38 },
  pocket: { label: 'Pole pockets', blurb: 'Sleeves top and bottom for hanging', setup: 0, perPiece: (c) => c.w * 2 * 0.85 },
  mount: { label: 'Foam-board mount', blurb: 'Rigid, ready for an easel', setup: 0, perPiece: (c) => c.sqft * 3.4 },
  perfnum: { label: 'Perforate & number', blurb: 'Tear-off lines, sequential numbers', setup: 14, perPiece: () => 0.018 },
}

/* ---------- products (DEMO) ---------- */
// kind: sheet = priced on sheet area; booklet = pages; pad = sheets per pad; forms = parts per set; large = per square foot.
const sheetPapers = (std, prem, spec) => ({
  standard: { label: std[0], detail: std[1] },
  premium: { label: prem[0], detail: prem[1] },
  specialty: { label: spec[0], detail: spec[1] },
})

const SIZE = (id, w, h, note) => ({ id, w, h, label: `${w} × ${h} in`, note })
const SIZE_FT = (id, w, h, note, label) => ({ id, w, h, label: label || `${w} × ${h} ft`, note })

const STEPS_ALL = [25, 50, 100, 250, 500, 750, 1000, 1500, 2500, 5000, 7500, 10000, 15000, 25000]

export const PRODUCTS = {
  cards: {
    id: 'cards', label: 'Business cards', blurb: 'Make a first impression', noun: 'cards', unit: 'card',
    kind: 'sheet', setup: 12, min: 25, areaFloor: 16, paperRate: 0.002, handling: 0.02, tiers: TIERS_SHEET,
    sizes: [SIZE('std', 3.5, 2, 'Standard'), SIZE('square', 2.5, 2.5, 'Square'), SIZE('folded', 3.5, 4, 'Folded, 3.5 × 2 flat')],
    defaultSize: 'std', qtySteps: STEPS_ALL, defaultQty: 500,
    papers: sheetPapers(['14 pt gloss card stock', 'The everyday workhorse'], ['16 pt soft-touch or uncoated', 'Thicker, velvety hand-feel'], ['Linen, kraft or 32 pt triplex', 'The ones people keep']),
    finishing: ['laminate', 'diecut', 'foil'], defaultFinishing: [], sidesMode: 'free', defaultSides: 2, defaultColor: 'full',
    service: (q) => (q > 5000 ? 'offset' : 'digital'),
  },
  flyers: {
    id: 'flyers', label: 'Flyers', blurb: 'Hand out, post up, mail', noun: 'flyers', unit: 'flyer',
    kind: 'sheet', setup: 20, min: 30, areaFloor: 0, paperRate: 0.00048, handling: 0.015, tiers: TIERS_SHEET,
    sizes: [SIZE('half', 5.5, 8.5, 'Half sheet'), SIZE('letter', 8.5, 11, 'Letter'), SIZE('legal', 8.5, 14, 'Legal'), SIZE('tabloid', 11, 17, 'Tabloid')],
    defaultSize: 'letter', qtySteps: STEPS_ALL, defaultQty: 1000,
    papers: sheetPapers(['100# gloss text', 'Bright, glossy, great for color'], ['80# cover or uncoated', 'Sturdier, writable surface'], ['Recycled, textured or bright white', 'Something with character']),
    finishing: ['fold', 'laminate', 'diecut', 'foil'], defaultFinishing: [], sidesMode: 'free', defaultSides: 1, defaultColor: 'full',
    service: (q) => (q > 1000 ? 'offset' : 'digital'),
  },
  postcards: {
    id: 'postcards', label: 'Postcards', blurb: 'Mailers and handouts', noun: 'postcards', unit: 'postcard',
    kind: 'sheet', setup: 22, min: 30, areaFloor: 0, paperRate: 0.001, handling: 0.02, tiers: TIERS_SHEET,
    sizes: [SIZE('4x6', 4, 6, 'Classic'), SIZE('5x7', 5, 7, 'Generous'), SIZE('6x9', 6, 9, 'Mailer'), SIZE('6x11', 6, 11, 'Jumbo')],
    defaultSize: '4x6', qtySteps: STEPS_ALL, defaultQty: 500,
    papers: sheetPapers(['14 pt gloss', 'Slick and saturated'], ['16 pt silk or uncoated', 'Premium feel in the mailbox'], ['Kraft, linen or 32 pt', 'Stand-out stock']),
    finishing: ['laminate', 'diecut', 'foil'], defaultFinishing: [], sidesMode: 'free', defaultSides: 2, defaultColor: 'full',
    service: (q) => (q > 1000 ? 'offset' : 'digital'),
  },
  brochures: {
    id: 'brochures', label: 'Brochures', blurb: 'Tri-fold, folded for you', noun: 'brochures', unit: 'brochure',
    kind: 'sheet', setup: 28, min: 40, areaFloor: 0, paperRate: 0.00048, handling: 0.075, tiers: TIERS_SHEET,
    sizes: [SIZE('letter', 8.5, 11, 'Folds to 3.67 × 8.5'), SIZE('legal', 8.5, 14, 'Folds to 3.67 × 8.5 plus'), SIZE('tabloid', 11, 17, 'Folds to 3.67 × 11')],
    defaultSize: 'letter', qtySteps: [50, 100, 250, 500, 750, 1000, 1500, 2500, 5000, 7500, 10000, 15000, 25000], defaultQty: 500,
    papers: sheetPapers(['100# gloss text', 'Bright and glossy'], ['100# silk or 80# cover', 'Smooth, upscale finish'], ['Recycled or textured stock', 'Natural, tactile feel']),
    finishing: ['laminate', 'diecut', 'foil'], includedNote: 'Tri-fold included', defaultFinishing: [], sidesMode: 'locked2', defaultSides: 2, defaultColor: 'full',
    sidesNote: 'Brochures print on both sides of the sheet.',
    service: (q) => (q > 1000 ? 'offset' : 'digital'),
  },
  booklets: {
    id: 'booklets', label: 'Booklets & newsletters', blurb: 'Stapled or perfect bound', noun: 'booklets', unit: 'booklet',
    kind: 'booklet', setup: 45, min: 60, areaFloor: 0, paperRate: 0.00048, handling: 0.18, tiers: TIERS_SHEET,
    sizes: [SIZE('half', 5.5, 8.5, 'Digest'), SIZE('letter', 8.5, 11, 'Newsletter')],
    defaultSize: 'letter', qtySteps: [25, 50, 100, 250, 500, 750, 1000, 1500, 2500, 5000, 7500, 10000], defaultQty: 500,
    papers: sheetPapers(['80# gloss text, 100# cover', 'The standard newsletter build'], ['100# silk text, 100# cover', 'Heavier, smoother pages'], ['Recycled uncoated text', 'Warm, natural pages']),
    extra: { id: 'pages', label: 'Pages', word: 'pages', options: [8, 12, 16, 20, 24, 32, 48, 64, 96], default: 16, help: 'Counts the cover. Pages come in fours.' },
    finishing: ['staple', 'perfect', 'laminate', 'foil'], exclusive: [['staple', 'perfect']], defaultFinishing: ['staple'], sidesMode: 'locked2', defaultSides: 2, defaultColor: 'full',
    sidesNote: 'Every page of a booklet prints on both sides of the sheet.',
    service: (q) => (q >= 500 ? 'offset' : 'digital'),
  },
  posters: {
    id: 'posters', label: 'Posters', blurb: 'Big, bright, one at a time', noun: 'posters', unit: 'poster',
    kind: 'large', setup: 8, min: 15, tiers: TIERS_LARGE, inkPerSqFt: 2.1,
    mediaRate: { standard: 1.0, premium: 1.9, specialty: 3.8 },
    sizes: [SIZE_FT('11x17', 0.917, 1.417, 'Tabloid', '11 × 17 in'), SIZE_FT('18x24', 1.5, 2, 'Small display', '18 × 24 in'), SIZE_FT('24x36', 2, 3, 'The standard', '24 × 36 in'), SIZE_FT('36x48', 3, 4, 'Big and bold', '36 × 48 in')],
    defaultSize: '24x36', qtySteps: [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000], defaultQty: 5,
    papers: sheetPapers(['Satin poster paper', 'Rich color, low glare'], ['Photo gloss paper', 'Deep blacks, vivid color'], ['Backlit film, canvas or adhesive vinyl', 'For light boxes and walls']),
    finishing: ['laminate', 'mount'], defaultFinishing: [], sidesMode: 'locked1', defaultSides: 1, defaultColor: 'full',
    sidesNote: 'Posters print on one side.',
    service: () => 'inkjet',
  },
  banners: {
    id: 'banners', label: 'Banners (vinyl)', blurb: 'Priced by the square foot', noun: 'banners', unit: 'banner',
    kind: 'large', setup: 12, min: 30, tiers: TIERS_LARGE, inkPerSqFt: 2.0,
    mediaRate: { standard: 1.6, premium: 2.6, specialty: 3.4 },
    sizes: [SIZE_FT('2x4', 2, 4, 'Door or table'), SIZE_FT('3x6', 3, 6, 'The classic'), SIZE_FT('4x8', 4, 8, 'Fence or wall'), SIZE_FT('3x10', 3, 10, 'Street banner')],
    defaultSize: '3x6', qtySteps: [1, 2, 3, 5, 10, 25, 50, 100], defaultQty: 1,
    papers: sheetPapers(['13 oz scrim vinyl', 'Weatherproof, all-purpose'], ['18 oz heavy-duty vinyl', 'Long-run outdoor use'], ['Mesh, blockout or fabric', 'Wind-through or double-sided']),
    finishing: ['grommets', 'pocket'], defaultFinishing: ['grommets'], sidesMode: 'free', defaultSides: 1, defaultColor: 'full',
    sidesNote: '',
    service: () => 'inkjet',
  },
  notepads: {
    id: 'notepads', label: 'Notepads', blurb: 'Padded and backed', noun: 'pads', unit: 'pad',
    kind: 'pad', setup: 18, min: 35, areaFloor: 0, paperRate: 0.00022, handling: 0.4, tiers: TIERS_SHEET,
    sizes: [SIZE('4x5', 4.25, 5.5, 'Quarter sheet'), SIZE('5x8', 5.5, 8.5, 'Half sheet'), SIZE('8x11', 8.5, 11, 'Full sheet')],
    defaultSize: '5x8', qtySteps: [10, 25, 50, 100, 250, 500, 750, 1000, 2500, 5000], defaultQty: 100,
    papers: sheetPapers(['20# bond with chipboard back', 'Classic desk pad'], ['24# bright bond, card cover', 'Smoother writing, sturdier cover'], ['Recycled or textured bond', 'Natural feel']),
    extra: { id: 'sheets', label: 'Sheets per pad', word: 'sheets', options: [25, 50, 100], default: 50, help: 'The top sheet carries your print.' },
    finishing: ['diecut', 'foil'], includedNote: 'Padding and chipboard back included', defaultFinishing: [], sidesMode: 'locked1', defaultSides: 1, defaultColor: 'spot',
    sidesNote: 'Pads print on the top sheet only.',
    service: () => 'offset',
  },
  forms: {
    id: 'forms', label: 'Carbonless forms', blurb: 'Two-, three- or four-part sets', noun: 'sets', unit: 'set',
    kind: 'forms', setup: 38, min: 55, areaFloor: 0, paperRate: 0.00058, handling: 0.12, tiers: TIERS_SHEET,
    sizes: [SIZE('4x5', 4.25, 5.5, 'Quarter sheet'), SIZE('5x8', 5.5, 8.5, 'Half sheet'), SIZE('8x11', 8.5, 11, 'Full sheet')],
    defaultSize: '8x11', qtySteps: [50, 100, 250, 500, 750, 1000, 1500, 2500, 5000, 10000], defaultQty: 500,
    papers: sheetPapers(['White and canary sets', 'The standard carbonless pair'], ['Multi-color sets (white, canary, pink)', 'Easy to tell the copies apart'], ['Heavy top sheet, colored copies', 'Built for the shop floor']),
    extra: { id: 'parts', label: 'Parts per set', word: 'parts', options: [2, 3, 4], default: 2, help: 'Each part is a separate carbonless sheet.' },
    finishing: ['perfnum'], includedNote: 'Collated and padded in sets', defaultFinishing: [], sidesMode: 'free', defaultSides: 1, defaultColor: 'spot',
    service: () => 'offset',
  },
  // Not listed in the estimator: used by the EDDM planner for printing cost.
  eddm: {
    id: 'eddm', label: 'EDDM mailer', hidden: true, noun: 'mailers', unit: 'mailer',
    kind: 'sheet', setup: 40, min: 90, areaFloor: 0, paperRate: 0.0009, handling: 0.05, tiers: TIERS_SHEET,
    sizes: [SIZE('4x6', 4, 6), SIZE('5x7', 5, 7), SIZE('5.5x8.5', 5.5, 8.5), SIZE('6.5x9', 6.5, 9), SIZE('8.5x11', 8.5, 11), SIZE('6.5x12', 6.5, 12), SIZE('9x12', 9, 12)],
    defaultSize: '6.5x9', qtySteps: [200, 500, 1000, 2500, 5000], defaultQty: 1000,
    papers: sheetPapers(['14 pt gloss', ''], ['16 pt silk or uncoated', ''], ['Specialty', '']),
    finishing: [], defaultFinishing: [], sidesMode: 'locked2', defaultSides: 2, defaultColor: 'full',
    service: () => 'mailing',
  },
}

export const PRODUCT_LIST = Object.values(PRODUCTS).filter((p) => !p.hidden)

/* ---------- config handling ---------- */

export function nearestStepIndex(steps, qty) {
  let best = 0
  let gap = Infinity
  steps.forEach((s, i) => {
    const g = Math.abs(Math.log(s) - Math.log(qty))
    if (g < gap) { gap = g; best = i }
  })
  return best
}

/** Build a fully valid config for a product, with optional overrides. */
export function makeConfig(productId, overrides = {}) {
  const p = PRODUCTS[productId]
  return normalizeConfig({
    product: productId,
    size: p.defaultSize,
    qty: p.defaultQty,
    color: p.defaultColor,
    sides: p.defaultSides,
    paper: 'standard',
    finishing: [...p.defaultFinishing],
    turn: 'standard',
    extra: p.extra ? p.extra.default : null,
    ...overrides,
  })
}

/** Coerce any config into one the pricing model can safely price. */
export function normalizeConfig(cfg) {
  const p = PRODUCTS[cfg.product]
  const size = p.sizes.some((s) => s.id === cfg.size) ? cfg.size : p.defaultSize
  const qty = p.qtySteps[nearestStepIndex(p.qtySteps, cfg.qty)]
  const sides = p.sidesMode === 'locked1' ? 1 : p.sidesMode === 'locked2' ? 2 : (cfg.sides === 2 ? 2 : 1)
  const extra = p.extra ? (p.extra.options.includes(cfg.extra) ? cfg.extra : p.extra.default) : null
  let finishing = (cfg.finishing || []).filter((f) => p.finishing.includes(f))
  if (p.id === 'booklets') {
    // Too many pages for a staple, too few for a spine.
    if (extra > 64) finishing = finishing.map((f) => (f === 'staple' ? 'perfect' : f))
    if (extra < 28) finishing = finishing.map((f) => (f === 'perfect' ? 'staple' : f))
    if (!finishing.includes('staple') && !finishing.includes('perfect')) finishing.push(extra > 64 ? 'perfect' : 'staple')
  }
  finishing = [...new Set(finishing)]
  ;(p.exclusive || []).forEach((group) => {
    const hits = finishing.filter((f) => group.includes(f))
    if (hits.length > 1) finishing = finishing.filter((f) => !group.includes(f) || f === hits.at(-1))
  })
  return {
    product: cfg.product,
    size,
    qty,
    color: COLOR_MODES.some((c) => c.id === cfg.color) ? cfg.color : p.defaultColor,
    sides,
    paper: PAPER_IDS.includes(cfg.paper) ? cfg.paper : 'standard',
    finishing,
    turn: TURNAROUND.some((t) => t.id === cfg.turn) ? cfg.turn : 'standard',
    extra,
  }
}

/* ---------- the price model ---------- */

function tierMult(tiers, q) {
  if (q <= tiers[0][0]) return tiers[0][1]
  for (let i = 1; i < tiers.length; i += 1) {
    const [q1, m1] = tiers[i]
    if (q <= q1) {
      const [q0, m0] = tiers[i - 1]
      const t = (Math.log(q) - Math.log(q0)) / (Math.log(q1) - Math.log(q0))
      return m0 + (m1 - m0) * t
    }
  }
  return tiers.at(-1)[1]
}

const sizeSqIn = (p, size) => (p.kind === 'large' ? size.w * size.h * 144 : size.w * size.h)

// Per-piece printing and paper cost at the reference tier.
function unitParts(p, size, cfg) {
  const paperMul = PAPER_MUL[cfg.paper]
  const sidesF = cfg.sides === 2 ? 1 + SECOND_SIDE : 1
  const area = sizeSqIn(p, size)
  switch (p.kind) {
    case 'large': {
      const sqft = size.w * size.h
      const colorMul = { bw: 0.55, spot: 0.8, full: 1 }[cfg.color]
      const sideMul = cfg.sides === 2 ? 1.8 : 1
      return { print: sqft * p.inkPerSqFt * colorMul * sideMul, paper: sqft * p.mediaRate[cfg.paper] * (cfg.sides === 2 ? 1.25 : 1) }
    }
    case 'booklet': {
      const pages = cfg.extra
      return {
        print: area * pages * INK[cfg.color] * ((1 + SECOND_SIDE) / 2) + p.handling,
        paper: (area * (pages / 2) + area * 2 * 0.8) * p.paperRate * paperMul,
      }
    }
    case 'pad': {
      const sheets = cfg.extra
      return { print: area * INK[cfg.color] + p.handling, paper: area * sheets * p.paperRate * paperMul }
    }
    case 'forms': {
      const parts = cfg.extra
      return { print: area * INK[cfg.color] * sidesF * parts + p.handling, paper: area * parts * p.paperRate * paperMul }
    }
    default: {
      const eff = Math.max(area, p.areaFloor || 0)
      return { print: eff * INK[cfg.color] * sidesF + p.handling, paper: eff * p.paperRate * paperMul }
    }
  }
}

function finishingCost(p, size, cfg) {
  const area = sizeSqIn(p, size)
  const ctx = {
    area,
    w: size.w,
    h: size.h,
    sqft: p.kind === 'large' ? size.w * size.h : area / 144,
    perimeterFt: 2 * (size.w + size.h),
    pages: cfg.extra || 0,
    kind: p.kind,
  }
  let setup = 0
  let perPiece = 0
  cfg.finishing.forEach((id) => {
    const f = FINISHING[id]
    setup += f.setup
    perPiece += f.perPiece(ctx)
  })
  return { setup, perPiece }
}

// Largest-remainder rounding so the breakdown always adds up to the rounded total.
function roundToSum(values, unit) {
  const target = Math.round(values.reduce((a, b) => a + b, 0) / unit)
  const scaled = values.map((v) => v / unit)
  const floors = scaled.map(Math.floor)
  let remainder = target - floors.reduce((a, b) => a + b, 0)
  const order = scaled.map((v, i) => [v - floors[i], i]).sort((a, b) => b[0] - a[0])
  for (let k = 0; remainder > 0 && k < order.length; k += 1, remainder -= 1) floors[order[k][1]] += 1
  return floors.map((v) => v * unit)
}

const niceStep = (n) => (n < 60 ? 1 : n < 500 ? 5 : n < 5000 ? 10 : 50)

/**
 * Deterministic ballpark estimate.
 * total = (setup + qty * unitCost * tier + finishing) with a job minimum, then a rush surcharge.
 */
export function estimate(input) {
  const cfg = normalizeConfig(input)
  const p = PRODUCTS[cfg.product]
  const size = p.sizes.find((s) => s.id === cfg.size)
  const qty = cfg.qty
  const tier = tierMult(p.tiers, qty)
  const parts = unitParts(p, size, cfg)
  const fin = finishingCost(p, size, cfg)
  const turn = TURNAROUND.find((t) => t.id === cfg.turn)

  const printing = qty * parts.print * tier
  const paper = qty * parts.paper * tier
  const finishing = fin.setup + qty * fin.perPiece * tier
  const setup = p.setup
  const base = setup + printing + paper + finishing
  const minimum = Math.max(0, p.min - base)
  const subtotal = base + minimum
  const rush = subtotal * turn.pct
  const total = subtotal + rush

  const unit = total < 100 ? 0.01 : 1
  const keys = [
    ['setup', 'Setup & file check', setup],
    ['printing', 'Printing & trimming', printing],
    ['paper', 'Paper & stock', paper],
    ['finishing', 'Finishing', finishing],
    ['minimum', 'Job minimum top-up', minimum],
    ['rush', `Rush (+${Math.round(turn.pct * 100)}%)`, rush],
  ]
  const rounded = roundToSum(keys.map((k) => k[2]), unit)
  const breakdown = keys.map(([key, label, raw], i) => ({ key, label, amount: rounded[i], raw }))
    .filter((row) => (row.key !== 'minimum' && row.key !== 'rush') || row.raw > 0.005)
    .filter((row) => row.key !== 'finishing' || cfg.finishing.length > 0 || row.raw > 0)
  const roundedTotal = rounded.reduce((a, b) => a + b, 0)

  let spread = 0.1
  if (cfg.paper === 'specialty') spread += 0.015
  if (cfg.finishing.includes('diecut') || cfg.finishing.includes('foil')) spread += 0.015
  if (cfg.turn !== 'standard') spread += 0.01
  if (qty > 5000 || p.kind === 'booklet' || p.kind === 'forms') spread += 0.01
  spread = Math.min(spread, 0.15)

  const step = niceStep(total)
  const low = Math.max(step, Math.floor((total * (1 - spread)) / step) * step)
  const high = Math.max(low + step, Math.ceil((total * (1 + spread)) / step) * step)
  const sqft = p.kind === 'large' ? size.w * size.h : null

  return {
    cfg, product: p, size, qty, total, roundedTotal, low, high, spread, tier, breakdown,
    perPiece: total / qty, perLow: low / qty, perHigh: high / qty,
    perSqFt: sqft ? total / (qty * sqft) : null,
    minApplied: minimum > 0.005,
    turn,
  }
}

export const perPieceAt = (cfg, qty) => estimate({ ...cfg, qty }).perPiece

/** Per-piece cost sampled on a log grid across the product's quantity range (for the curve chart). */
export function curveSeries(cfg, points = 64) {
  const p = PRODUCTS[cfg.product]
  const lo = p.qtySteps[0]
  const hi = p.qtySteps.at(-1)
  const series = []
  for (let i = 0; i < points; i += 1) {
    const q = Math.exp(Math.log(lo) + ((Math.log(hi) - Math.log(lo)) * i) / (points - 1))
    // Evaluate at the real (unsnapped) quantity so the curve is smooth.
    const est = estimateRaw(cfg, q)
    series.push({ q, v: est })
  }
  return series
}

// Same model as estimate() but accepts any quantity (no snapping) and returns per-piece cost only.
function estimateRaw(input, q) {
  const cfg = normalizeConfig(input)
  const p = PRODUCTS[cfg.product]
  const size = p.sizes.find((s) => s.id === cfg.size)
  const tier = tierMult(p.tiers, q)
  const parts = unitParts(p, size, cfg)
  const fin = finishingCost(p, size, cfg)
  const turn = TURNAROUND.find((t) => t.id === cfg.turn)
  const base = p.setup + q * (parts.print + parts.paper) * tier + fin.setup + q * fin.perPiece * tier
  return (Math.max(base, p.min) * (1 + turn.pct)) / q
}

/** Volume-discount insights: comparison, sweet spot and an "order more" nudge. */
export function volumeInsights(cfg) {
  const p = PRODUCTS[cfg.product]
  const steps = p.qtySteps
  const ladder = steps.map((q) => {
    const e = estimate({ ...cfg, qty: q })
    return { q, per: e.perPiece, total: e.total, low: e.low, high: e.high }
  })
  const at = (q) => ladder.find((r) => r.q === q)
  const cur = at(cfg.qty)

  // Comparison: roughly a 3x-4x quantity jump.
  let big
  let small
  const lower = steps.filter((s) => s <= cfg.qty / 3)
  if (lower.length) { big = cfg.qty; small = lower.at(-1) } else {
    const upper = steps.find((s) => s >= cfg.qty * 3) ?? steps.at(-1)
    if (upper > cfg.qty) { big = upper; small = cfg.qty } else { big = cfg.qty; small = steps[Math.max(0, steps.indexOf(cfg.qty) - 1)] }
  }
  const compare = big === small ? null : { big, small, pct: Math.round((1 - at(big).per / at(small).per) * 100) }

  // Sweet spot: first quantity where each further doubling saves under 12% per piece.
  let sweet = steps.at(-1)
  for (let i = 0; i < steps.length - 1; i += 1) {
    const doublings = Math.log2(steps[i + 1] / steps[i])
    const gain = 1 - (ladder[i + 1].per / ladder[i].per) ** (1 / doublings)
    if (gain < 0.12) { sweet = steps[i]; break }
  }
  // Keep the sweet spot a couple of steps in so it is a useful suggestion.
  sweet = Math.max(sweet, steps[Math.min(2, steps.length - 1)])

  let nudge = null
  if (cfg.qty >= sweet) {
    nudge = { kind: 'there', sweet, savingPct: 0 }
  } else {
    const ceiling = cfg.qty * 4
    const candidates = steps.filter((s) => s > cfg.qty && s <= Math.min(sweet, ceiling))
    const target = candidates.length ? candidates.at(-1) : steps.find((s) => s > cfg.qty)
    const t = at(target)
    nudge = {
      kind: 'more',
      sweet,
      target,
      extra: t.total - cur.total,
      extraPct: Math.round(((t.total - cur.total) / cur.total) * 100),
      per: t.per,
      times: target / cfg.qty,
      savingPct: Math.round((1 - t.per / cur.per) * 100),
    }
  }
  return { ladder, compare, sweet, nudge }
}

/* ---------- quote hand-off ---------- */

const COLOR_PHRASE = { bw: 'black-and-white', spot: '1–2 color', full: 'full-color' }

/** Text that follows "I'm interested in " on the quote form, plus the service param. */
export function describeJob(est) {
  const { cfg, product: p, size, qty } = est
  const bits = []
  bits.push(`${fmtQty(qty)} ${COLOR_PHRASE[cfg.color]}`)
  if (p.sidesMode === 'free') bits[0] += `, ${cfg.sides}-sided`
  let noun = p.noun
  if (p.kind === 'booklet') noun = `${cfg.extra}-page booklets`
  else if (p.kind === 'pad') noun = `${cfg.extra}-sheet notepads`
  else if (p.kind === 'forms') noun = `${cfg.extra}-part carbonless forms`
  else if (p.id === 'brochures') noun = 'tri-fold brochures'
  const paper = p.papers[cfg.paper].label
  const fin = cfg.finishing.map((f) => FINISHING[f].label.toLowerCase())
  const finText = fin.length > 1 ? `${fin.slice(0, -1).join(', ')} and ${fin.at(-1)}` : fin[0]
  const turn = est.turn.id === 'standard' ? 'standard turnaround' : `${est.turn.label.toLowerCase()} turnaround (${est.turn.detail})`
  const text = `${bits[0]} ${size.label} ${noun} on ${paper}${finText ? `, with ${finText}` : ''}, ${turn}. Website ballpark: ${fmtMoney(est.low)}–${fmtMoney(est.high)}`
  return { text, service: p.service(qty) }
}

/* =====================================================================
   EDDM planner data (DEMO)
   ===================================================================== */

export const POSTAGE_PER_PIECE = 0.26 // verify against current USPS EDDM Retail rate
export const EDDM_MIN_PIECES = 200 // USPS EDDM Retail minimum per mailing
export const EDDM_MAX_PER_ZIP_DAY = 5000 // USPS EDDM Retail maximum per ZIP Code per day
export const DESIGN_FEE_DEMO = 175 // flat demo design fee
export const IN_HOME_DAYS = 3 // typical in-home window after the Post Office drop; confirm with Henle

// Balaton's real ZIP Code is 56115 (56101 is Windom): change here if the client wants 56101 as originally supplied.
export const TOWNS = [
  { zip: '56258', name: 'Marshall', county: 'Lyon', city: 16, rural: 5, hh: 520, scale: 1.15, river: 'Redwood River', hub: true },
  { zip: '56175', name: 'Tracy', county: 'Lyon', city: 8, rural: 4, hh: 300, scale: 0.8 },
  { zip: '56264', name: 'Minneota', county: 'Lyon', city: 6, rural: 3, hh: 250, scale: 0.7 },
  { zip: '56157', name: 'Lynd', county: 'Lyon', city: 4, rural: 3, hh: 170, scale: 0.5 },
  { zip: '56239', name: 'Ghent', county: 'Lyon', city: 4, rural: 2, hh: 140, scale: 0.5 },
  { zip: '56115', name: 'Balaton', county: 'Lyon', city: 4, rural: 3, hh: 160, scale: 0.5 },
  { zip: '56169', name: 'Russell', county: 'Lyon', city: 3, rural: 2, hh: 120, scale: 0.45 },
  { zip: '56229', name: 'Cottonwood', county: 'Lyon', city: 5, rural: 3, hh: 200, scale: 0.6 },
  { zip: '56241', name: 'Granite Falls', county: 'Yellow Medicine', city: 10, rural: 4, hh: 330, scale: 0.9, river: 'Minnesota River' },
  { zip: '56283', name: 'Redwood Falls', county: 'Redwood', city: 11, rural: 4, hh: 330, scale: 0.9, river: 'Redwood River' },
]

export const EDDM_SIZES = [
  { id: '6.5x9', w: 6.5, h: 9, label: '6.5 × 9 in', note: 'The EDDM classic' },
  { id: '8.5x11', w: 8.5, h: 11, label: '8.5 × 11 in', note: 'Full-sheet flyer' },
  { id: '6.5x12', w: 6.5, h: 12, label: '6.5 × 12 in', note: 'Long and eye-catching' },
  { id: '9x12', w: 9, h: 12, label: '9 × 12 in', note: 'Big and bold' },
  { id: '5.5x8.5', w: 5.5, h: 8.5, label: '5.5 × 8.5 in', note: 'Half sheet' },
  { id: '4x6', w: 4, h: 6, label: '4 × 6 in', note: 'Classic postcard' },
].map((s) => ({
  ...s,
  // USPS flat: taller than 6.125 in or longer than 11.5 in, within 15 x 12 in. Verify against current standards.
  flat: (Math.min(s.w, s.h) > 6.125 || Math.max(s.w, s.h) > 11.5) && Math.max(s.w, s.h) <= 15 && Math.min(s.w, s.h) <= 12,
}))

export const EDDM_PAPERS = [
  { id: 'standard', label: 'Standard', detail: '14 pt gloss' },
  { id: 'premium', label: 'Premium', detail: '16 pt silk or uncoated' },
]

/** Printing cost for a mailing (full color, both sides). */
export function eddmPrinting({ pieces, size, paper }) {
  const sizeId = PRODUCTS.eddm.sizes.some((s) => s.id === size) ? size : '6.5x9'
  const p = PRODUCTS.eddm
  const sz = p.sizes.find((s) => s.id === sizeId)
  const cfg = { product: 'eddm', size: sizeId, qty: p.defaultQty, color: 'full', sides: 2, paper, finishing: [], turn: 'standard', extra: null }
  const tier = tierMult(p.tiers, Math.max(pieces, 1))
  const parts = unitParts(p, sz, cfg)
  const q = Math.max(pieces, 1)
  const total = Math.max(p.setup + q * (parts.print + parts.paper) * tier, p.min)
  return Math.round(total)
}

/* ---------- seeded demo routes ---------- */

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const MAP_W = 1000

/**
 * Deterministic DEMO route map for a ZIP Code. Same ZIP => same routes every time.
 * Returns { width, height, routes[], river, highway, pin, farm } in a 1000-unit-wide coordinate space.
 * REPLACE with real USPS EDDM route data (route IDs, residential and business counts).
 */
export function generateRoutes(zip, wide = true) {
  const town = TOWNS.find((t) => t.zip === zip) || TOWNS[0]
  const rng = mulberry32(parseInt(zip, 10) * 2654435761)
  const W = MAP_W
  const H = wide ? 640 : 880
  const ring = wide ? 108 : 150
  const core = { x: ring, y: ring, w: W - ring * 2, h: H - ring * 2 }

  // City routes: binary-split the town core, keeping every block big enough to tap.
  const MIN = 140
  const leaves = [core]
  let guard = 0
  while (leaves.length < town.city && guard < 200) {
    guard += 1
    leaves.sort((a, b) => b.w * b.h - a.w * a.h)
    const at = leaves.findIndex((r) => r.w >= MIN * 2 || r.h >= MIN * 2)
    if (at < 0) break
    const [r] = leaves.splice(at, 1)
    const canW = r.w >= MIN * 2
    const canH = r.h >= MIN * 2
    const splitW = canW && (!canH || r.w >= r.h * (wide ? 1 : 0.8))
    const ratio = 0.38 + rng() * 0.24
    if (splitW) {
      const w1 = Math.min(r.w - MIN, Math.max(MIN, Math.round(r.w * ratio)))
      leaves.push({ x: r.x, y: r.y, w: w1, h: r.h }, { x: r.x + w1, y: r.y, w: r.w - w1, h: r.h })
    } else {
      const h1 = Math.min(r.h - MIN, Math.max(MIN, Math.round(r.h * ratio)))
      leaves.push({ x: r.x, y: r.y, w: r.w, h: h1 }, { x: r.x, y: r.y + h1, w: r.w, h: r.h - h1 })
    }
  }
  leaves.sort((a, b) => (Math.abs(a.y - b.y) < 40 ? a.x - b.x : a.y - b.y))

  const cx = W / 2
  const cy = H / 2
  const distances = leaves.map((r) => Math.hypot(r.x + r.w / 2 - cx, r.y + r.h / 2 - cy))
  const downtown = distances.indexOf(Math.min(...distances))
  const avgArea = (core.w * core.h) / leaves.length

  const routes = leaves.map((r, i) => {
    const areaF = 0.75 + 0.5 * Math.min(1.6, (r.w * r.h) / avgArea) / 1.6
    const hh = Math.round(town.hh * (0.6 + rng() * 0.8) * areaF * town.scale ** 0.35)
    const biz = i === downtown ? Math.round((40 + rng() * 40) * town.scale) : Math.round(rng() * 22 * town.scale)
    return { ...r, kind: 'city', hh, biz, downtown: i === downtown, density: hh / (r.w * r.h) }
  })
  routes.forEach((r, i) => { r.id = `C${String(i + 1).padStart(3, '0')}` })

  // Rural routes: strips around the core (bottom, right, top, left), skipping sides when there are fewer routes.
  const sides = [
    { name: 'bottom', x: 0, y: H - ring, w: W, h: ring, long: 'w' },
    { name: 'right', x: W - ring, y: ring, w: ring, h: H - ring * 2, long: 'h' },
    { name: 'top', x: 0, y: 0, w: W, h: ring, long: 'w' },
    { name: 'left', x: 0, y: ring, w: ring, h: H - ring * 2, long: 'h' },
  ]
  const order = town.rural >= 4 ? sides : [sides[0], sides[1], sides[2], sides[3]].slice(0, Math.max(2, town.rural))
  const per = order.map(() => Math.floor(town.rural / order.length))
  for (let k = 0; k < town.rural - per.reduce((a, b) => a + b, 0); k += 1) per[k % per.length] += 1
  const rural = []
  order.forEach((side, si) => {
    const n = per[si]
    if (!n) return
    const weights = Array.from({ length: n }, () => 0.75 + rng() * 0.5)
    const sum = weights.reduce((a, b) => a + b, 0)
    let used = 0
    weights.forEach((wt, k) => {
      const len = k === n - 1 ? side[side.long] - used : Math.round((side[side.long] * wt) / sum)
      const rect = side.long === 'w' ? { x: side.x + used, y: side.y, w: len, h: side.h } : { x: side.x, y: side.y + used, w: side.w, h: len }
      used += len
      const hh = Math.round(town.hh * 0.42 * (0.55 + rng() * 0.9) * (0.7 + (len / side[side.long]) * n * 0.3))
      rural.push({ ...rect, kind: 'rural', hh, biz: Math.round(rng() * 9), downtown: false, density: hh / (rect.w * rect.h) * 0.35 })
    })
  })
  rural.forEach((r, i) => { r.id = `R${String(i + 1).padStart(3, '0')}` })

  const all = [...routes, ...rural]
  // Density tiers by quartile within each kind so every map shows a spread of tints.
  ;['city', 'rural'].forEach((kind) => {
    const list = all.filter((r) => r.kind === kind).sort((a, b) => a.density - b.density)
    list.forEach((r, i) => { r.tier = Math.min(4, 1 + Math.floor((i / list.length) * 4)) })
  })

  // River: a sinuous cubic path left to right (or top to bottom for tall maps).
  const ry = H * (0.52 + rng() * 0.22)
  const wob = () => (rng() - 0.5) * H * 0.34
  const river = wide
    ? `M -20 ${ry} C ${W * 0.22} ${ry + wob()}, ${W * 0.38} ${ry + wob()}, ${W * 0.55} ${ry + wob() * 0.5} S ${W * 0.85} ${ry + wob()}, ${W + 20} ${ry + wob() * 0.6}`
    : `M -20 ${ry} C ${W * 0.2} ${ry + wob()}, ${W * 0.4} ${ry + wob()}, ${W * 0.55} ${ry + wob() * 0.5} S ${W * 0.85} ${ry + wob()}, ${W + 20} ${ry + wob() * 0.6}`
  const hx = W * (0.3 + rng() * 0.12)
  const highway = `M ${hx} -20 L ${hx + (rng() - 0.5) * 120} ${H * 0.5} L ${hx + (rng() - 0.5) * 220} ${H + 20}`
  const pin = { x: W - ring, y: H - ring }

  return { width: W, height: H, routes: all, river, highway, pin, ring, town }
}

/** Every route the "best N for my budget" picker may choose, ranked by households per dollar. */
export function pickBest({ routes, count = 5, budget, includeBiz, size, paper, designFee }) {
  const ranked = [...routes].sort((a, b) => {
    const va = a.hh / (a.hh + (includeBiz ? a.biz : 0))
    const vb = b.hh / (b.hh + (includeBiz ? b.biz : 0))
    return vb - va || b.hh - a.hh
  })
  const chosen = []
  let pieces = 0
  for (const r of ranked) {
    if (chosen.length >= count) break
    const nextPieces = pieces + r.hh + (includeBiz ? r.biz : 0)
    if (nextPieces > EDDM_MAX_PER_ZIP_DAY) continue
    const cost = eddmPrinting({ pieces: nextPieces, size, paper }) + nextPieces * POSTAGE_PER_PIECE + designFee
    if (cost > budget && chosen.length > 0) continue
    chosen.push(r)
    pieces = nextPieces
  }
  return chosen.map((r) => r.id)
}

/* ---------- business-day math ---------- */

export const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6

export function addBusinessDays(date, n) {
  const d = new Date(date)
  let left = Math.abs(n)
  const dir = n < 0 ? -1 : 1
  while (left > 0) {
    d.setDate(d.getDate() + dir)
    if (!isWeekend(d)) left -= 1
  }
  return d
}

/** Roll a weekend date back to the previous Friday. */
export function prevBusinessDay(date) {
  const d = new Date(date)
  while (isWeekend(d)) d.setDate(d.getDate() - 1)
  return d
}

export function nextBusinessDay(date) {
  const d = new Date(date)
  while (isWeekend(d)) d.setDate(d.getDate() + 1)
  return d
}

export const toInputDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const fromInputDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

/**
 * Working backward from the "in homes by" date.
 * Each step lasts `days` business days; the next step ends the business day before this one starts.
 */
export function buildTimeline({ inHomesBy, designHelp, pieces }) {
  const steps = [
    { id: 'design', label: designHelp ? 'Design' : 'Artwork check', days: designHelp ? 4 : 1, note: designHelp ? 'Our designer builds your mailer.' : 'We check your file against EDDM layout rules.' },
    { id: 'proof', label: 'Proof & approval', days: 2, note: 'You review a proof and sign off.' },
    { id: 'print', label: 'Print & bundle', days: pieces > 2500 ? 4 : 3, note: 'Printed, cut, and bundled by route.' },
    { id: 'deliver', label: 'Deliver to Post Office', days: 1, note: 'Henle drops the bundles with the postage paperwork.' },
    { id: 'homes', label: 'In homes', days: IN_HOME_DAYS, note: 'Typically a few days after drop; confirm with Henle.' },
  ]
  let cursor = prevBusinessDay(inHomesBy)
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i]
    step.end = new Date(cursor)
    step.start = step.days > 1 ? addBusinessDays(step.end, -(step.days - 1)) : new Date(step.end)
    cursor = addBusinessDays(step.start, -1)
  }
  const totalDays = steps.reduce((a, s) => a + s.days, 0)
  return { steps, start: steps[0].start, drop: steps[3].end, totalDays }
}
