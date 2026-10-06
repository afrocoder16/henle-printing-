// Deadline Planner data and date math.
// DEMO ASSUMPTIONS: the production times below are typical estimates, not Henle's real schedule.
// Replace `products` and `addons` with Henle's actual turnaround times.

export const products = [
  { id: 'cards', label: 'Business cards', service: 'offset', print: [1, 2, 3], note: 'Short runs are fast; large runs need press time.' },
  { id: 'flyers', label: 'Flyers & brochures', service: 'digital', print: [1, 2, 3], note: 'Digital runs ship quickly.' },
  { id: 'postcards', label: 'Postcards', service: 'digital', print: [1, 2, 3], note: 'Often paired with a mailing.' },
  { id: 'booklets', label: 'Booklets & newsletters', service: 'finishing', print: [2, 3, 5], note: 'Page count and binding add time.' },
  { id: 'forms', label: 'Forms & carbonless', service: 'digital', print: [3, 4, 6], note: 'Multi-part sets take extra finishing.' },
  { id: 'signs', label: 'Banners & signs', service: 'digital', print: [1, 2, 3], note: 'Large-format jobs print one at a time.' },
]

export const quantities = [
  { id: 0, label: 'Small run', hint: 'Under 500' },
  { id: 1, label: 'Medium run', hint: '500 to 5,000' },
  { id: 2, label: 'Large run', hint: '5,000 and up' },
]

// Extra business days each add-on needs.
export const addons = [
  { id: 'design', label: 'Henle designs it', days: 2, hint: 'Concept, layout, and your edits' },
  { id: 'proof', label: 'I want to approve a proof', days: 1, hint: 'You see it before it prints' },
  { id: 'finish', label: 'Folding, binding, or die cut', days: 1, hint: 'Done in-house after printing' },
  { id: 'mail', label: 'Mailing (bulk or EDDM)', days: 3, hint: 'List prep, presort, and postal drop' },
]

export const DELIVERY_DAYS = { local: 0, ship: 2 }
export const MAIL_TRANSIT_DAYS = 3

// Dates the shop (and USPS) are typically closed. Confirm with Henle each year.
export const holidays = {
  '2026-11-26': 'Thanksgiving',
  '2026-12-25': 'Christmas Day',
  '2027-01-01': 'New Year’s Day',
  '2027-01-18': 'Martin Luther King Jr. Day',
  '2027-02-15': 'Presidents Day',
  '2027-05-31': 'Memorial Day',
  '2027-06-18': 'Juneteenth (observed)',
  '2027-07-05': 'Independence Day (observed)',
  '2027-09-06': 'Labor Day',
  '2027-11-25': 'Thanksgiving',
  '2027-12-24': 'Christmas (observed)',
  '2026-09-07': 'Labor Day',
  '2026-07-03': 'Independence Day (observed)',
}

export const iso = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export const addDays = (d, n) => {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

export const isBusinessDay = (d) => d.getDay() !== 0 && d.getDay() !== 6 && !holidays[iso(d)]

// Move to the nearest business day on or before / after `d`.
export const prevBusinessDay = (d) => {
  let cur = new Date(d)
  while (!isBusinessDay(cur)) cur = addDays(cur, -1)
  return cur
}

export const nextBusinessDay = (d) => {
  let cur = new Date(d)
  while (!isBusinessDay(cur)) cur = addDays(cur, 1)
  return cur
}

// Subtract `n` business days from `d` (n = 0 returns the nearest business day on or before d).
export const subtractBusinessDays = (d, n) => {
  let cur = prevBusinessDay(d)
  let left = n
  while (left > 0) {
    cur = prevBusinessDay(addDays(cur, -1))
    left -= 1
  }
  return cur
}

export const addBusinessDays = (d, n) => {
  let cur = nextBusinessDay(d)
  let left = n
  while (left > 0) {
    cur = nextBusinessDay(addDays(cur, 1))
    left -= 1
  }
  return cur
}

export const businessDaysBetween = (from, to) => {
  let count = 0
  let cur = new Date(from)
  while (cur < to) {
    cur = addDays(cur, 1)
    if (isBusinessDay(cur)) count += 1
  }
  return count
}

// Build the production schedule backward from the goal date.
export function plan({ productId, qty, picked, mode, goal, today }) {
  const product = products.find((p) => p.id === productId)
  const mailing = picked.includes('mail')
  const steps = []

  // Stages in forward order, each with a duration in business days.
  const forward = []
  if (picked.includes('design')) forward.push({ id: 'design', label: 'Design', days: 2, note: 'Layout and your edits' })
  forward.push({ id: 'submit', label: 'Final files in', days: 0, note: 'Your approved artwork arrives' })
  if (picked.includes('proof')) forward.push({ id: 'proof', label: 'Proof approval', days: 1, note: 'You sign off before printing' })
  forward.push({ id: 'print', label: 'Printing', days: product.print[qty], note: 'On the press' })
  if (picked.includes('finish')) forward.push({ id: 'finish', label: 'Finishing', days: 1, note: 'Folding, binding, or die cut' })
  if (mailing) forward.push({ id: 'mailprep', label: 'Mail prep & drop', days: 3, note: 'List cleaning, presort, postal drop' })
  if (mailing) forward.push({ id: 'transit', label: 'In the mail', days: MAIL_TRANSIT_DAYS, note: 'Typical delivery window' })
  else if (mode === 'ship') forward.push({ id: 'ship', label: 'Shipping', days: DELIVERY_DAYS.ship, note: 'We ship daily' })
  else forward.push({ id: 'deliver', label: 'Pickup or local delivery', days: DELIVERY_DAYS.local, note: 'Fast and free locally' })

  const total = forward.reduce((sum, s) => sum + s.days, 0)
  const goalDay = prevBusinessDay(goal)

  // Walk backward to place each stage's end date.
  let end = goalDay
  const placed = [...forward].reverse().map((stage) => {
    const finishDate = end
    const startDate = stage.days > 0 ? subtractBusinessDays(end, stage.days) : end
    end = startDate
    return { ...stage, start: startDate, end: finishDate }
  }).reverse()

  const submitStage = placed.find((s) => s.id === 'submit')
  const startStage = placed[0]
  const submitBy = submitStage.start
  const startBy = startStage.start
  const slack = businessDaysBetween(today, startBy)
  const earliest = addBusinessDays(today, total)

  let status = 'comfortable'
  if (startBy < new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0)) status = 'rush'
  else if (slack <= 1) status = 'tight'
  else if (slack <= 4) status = 'good'

  steps.push(...placed)
  return { steps, total, submitBy, startBy, slack, earliest, status, goalDay, product }
}
