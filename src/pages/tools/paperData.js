// Paper & Finish Guide data. These are general print-industry recommendations, not a price list or a stock list.
// Henle's specialists confirm stock and finishes per job. Finishes marked `ask: true` are not in Henle's
// published finishing list (coatings, die cuts, embossing, stapling to hardcover binding, laminating, folding),
// so the guide tells the customer to ask.

export const goals = [
  { id: 'premium', label: 'Premium feel', line: 'Built to feel substantial and look expensive.' },
  { id: 'budget', label: 'Smart budget', line: 'The best balance of quality and cost.' },
  { id: 'durable', label: 'Tough & durable', line: 'Made to survive handling, weather, and time.' },
  { id: 'natural', label: 'Natural & tactile', line: 'Warm, textured, and honest, with a handmade feel.' },
]

export const finishes = [
  { id: 'coating', label: 'Protective coating', purposes: ['Protect', 'Shine'], blurb: 'A thin clear layer over the ink that guards against scuffs and fingerprints. Comes in gloss or satin.', best: 'Postcards, covers, brochures', ask: false },
  { id: 'laminate', label: 'Laminating', purposes: ['Protect', 'Feel'], blurb: 'A film bonded to the sheet: gloss for pop, matte for calm, or soft-touch for a velvety feel. The most durable surface.', best: 'Business cards, menus, signs', ask: false },
  { id: 'emboss', label: 'Embossing', purposes: ['Feel', 'Shape'], blurb: 'Pressing a design up from the back so a logo or pattern rises off the sheet. You can feel it with a thumb.', best: 'Business cards, invitations, covers', ask: false },
  { id: 'diecut', label: 'Die cutting', purposes: ['Shape'], blurb: 'A custom steel die cuts the piece into any shape, or adds a window, slot, or pocket.', best: 'Folders, tags, special mailers', ask: false },
  { id: 'fold', label: 'Folding & scoring', purposes: ['Shape'], blurb: 'Crisp, accurate folds, with scoring on heavier stock so the color doesn’t crack.', best: 'Brochures, menus, cards', ask: false },
  { id: 'staple', label: 'Stapling to hardcover binding', purposes: ['Bind'], blurb: 'From simple stapling and booklet-making to hardcover binding, depending on the page count and how long it needs to last.', best: 'Booklets, reports, books', ask: false },
  { id: 'spotuv', label: 'Spot UV', purposes: ['Shine', 'Feel'], blurb: 'Gloss applied only to chosen areas, like a logo, so it catches the light against a matte surface.', best: 'Premium cards and covers', ask: true },
  { id: 'foil', label: 'Foil stamping', purposes: ['Shine'], blurb: 'A thin metallic layer pressed on in gold, silver, or color for a mirror-bright accent.', best: 'Invitations, cards, packaging', ask: true },
]

export const finishById = Object.fromEntries(finishes.map((f) => [f.id, f]))

// specs[goal] = [paper, weight, [finish ids], { gloss, stiffness, texture } each 0-5]
export const projects = [
  {
    id: 'business-cards', label: 'Business cards', service: 'offset', tag: 'The first handshake',
    note: 'A card gets handled more than almost any other piece you print.',
    specs: {
      premium: ['Heavy cover stock', '16 pt (about 130# cover)', ['laminate', 'emboss', 'foil'], { gloss: 2, stiffness: 5, texture: 3 }],
      budget: ['Coated cover', '14 pt (about 100# cover)', ['coating'], { gloss: 4, stiffness: 4, texture: 1 }],
      durable: ['Laminated cover', '16 pt', ['laminate'], { gloss: 3, stiffness: 5, texture: 1 }],
      natural: ['Uncoated cover', '110–130# uncoated cover', ['emboss'], { gloss: 0, stiffness: 4, texture: 5 }],
    },
  },
  {
    id: 'brochures', label: 'Brochures', service: 'offset', tag: 'Folded and handed out',
    note: 'The sheet has to fold cleanly and stay flat in a rack.',
    specs: {
      premium: ['Silk coated text', '100# silk text', ['fold', 'coating'], { gloss: 2, stiffness: 2, texture: 1 }],
      budget: ['Gloss coated text', '80# gloss text', ['fold'], { gloss: 4, stiffness: 1, texture: 0 }],
      durable: ['Gloss cover with coating', '100# gloss cover', ['fold', 'coating'], { gloss: 4, stiffness: 4, texture: 0 }],
      natural: ['Uncoated text', '70# uncoated text', ['fold'], { gloss: 0, stiffness: 1, texture: 4 }],
    },
  },
  {
    id: 'postcards', label: 'Postcards & direct mail', service: 'mailing', tag: 'Built to survive the mail',
    note: 'It has to survive sorting machines and still look sharp in the mailbox.',
    specs: {
      premium: ['Heavy coated cover', '16 pt (about 130# cover)', ['laminate', 'spotuv'], { gloss: 3, stiffness: 5, texture: 3 }],
      budget: ['Gloss coated cover', '14 pt (about 100# cover)', ['coating'], { gloss: 4, stiffness: 4, texture: 0 }],
      durable: ['Coated cover with laminate', '14 pt', ['laminate'], { gloss: 3, stiffness: 4, texture: 1 }],
      natural: ['Uncoated cover', '100# uncoated cover', [], { gloss: 0, stiffness: 4, texture: 4 }],
    },
  },
  {
    id: 'flyers', label: 'Flyers & posters', service: 'digital', tag: 'Seen for three seconds',
    note: 'They’re posted, handed out, and often thrown in a bag. Cost and impact matter most.',
    specs: {
      premium: ['Silk coated text', '100# silk text', ['coating'], { gloss: 2, stiffness: 2, texture: 1 }],
      budget: ['Gloss text', '80# gloss text', [], { gloss: 4, stiffness: 1, texture: 0 }],
      durable: ['Heavy gloss with coating', '100# gloss cover', ['coating', 'laminate'], { gloss: 4, stiffness: 4, texture: 0 }],
      natural: ['Uncoated text', '70# uncoated text', [], { gloss: 0, stiffness: 1, texture: 4 }],
    },
  },
  {
    id: 'booklets', label: 'Booklets & newsletters', service: 'finishing', tag: 'Pages that turn',
    note: 'Page count decides the binding, and the cover should be sturdier than the pages.',
    specs: {
      premium: ['Silk text with a heavier cover', '100# text inside, 100# cover', ['staple', 'laminate'], { gloss: 2, stiffness: 3, texture: 2 }],
      budget: ['Uncoated or gloss text', '70# text, self-cover', ['staple'], { gloss: 2, stiffness: 1, texture: 2 }],
      durable: ['Coated text with laminated cover', '80# text inside, 100# cover', ['staple', 'laminate'], { gloss: 3, stiffness: 4, texture: 1 }],
      natural: ['Uncoated text and cover', '70# uncoated text, 80# cover', ['staple'], { gloss: 0, stiffness: 2, texture: 4 }],
    },
  },
  {
    id: 'menus', label: 'Menus', service: 'finishing', tag: 'Sticky fingers welcome',
    note: 'Menus get spilled on. Wipeable surfaces last the longest.',
    specs: {
      premium: ['Heavy cover with soft-touch lamination', '100# cover', ['laminate', 'fold'], { gloss: 1, stiffness: 5, texture: 3 }],
      budget: ['Gloss cover', '80–100# cover', ['coating'], { gloss: 4, stiffness: 3, texture: 0 }],
      durable: ['Laminated cover', '100# cover with 3 mil laminate', ['laminate', 'diecut'], { gloss: 4, stiffness: 5, texture: 1 }],
      natural: ['Uncoated cover', '100# uncoated cover', ['fold'], { gloss: 0, stiffness: 4, texture: 5 }],
    },
  },
  {
    id: 'signs', label: 'Banners & signs', service: 'digital', tag: 'Outside, in all weather',
    note: 'Wind, sun, and rain decide the material before the design does.',
    specs: {
      premium: ['Heavy rigid board', 'Mounted board or foam board', ['laminate'], { gloss: 3, stiffness: 5, texture: 1 }],
      budget: ['Poster paper', '100# gloss text', [], { gloss: 4, stiffness: 1, texture: 0 }],
      durable: ['Vinyl', '13 oz vinyl banner', ['laminate'], { gloss: 3, stiffness: 3, texture: 0 }],
      natural: ['Matte poster board', 'Heavy matte poster stock', [], { gloss: 0, stiffness: 3, texture: 2 }],
    },
  },
  {
    id: 'labels', label: 'Labels & stickers', service: 'digital', tag: 'Stick and stay',
    note: 'The adhesive and where it’s going matter as much as the print.',
    specs: {
      premium: ['Matte or soft-touch film label', 'Premium matte film', ['laminate', 'diecut'], { gloss: 1, stiffness: 2, texture: 3 }],
      budget: ['Paper label', 'Gloss or matte paper label', ['diecut'], { gloss: 3, stiffness: 1, texture: 0 }],
      durable: ['Vinyl label', 'Waterproof white vinyl', ['laminate', 'diecut'], { gloss: 3, stiffness: 2, texture: 0 }],
      natural: ['Kraft or uncoated label', 'Natural kraft paper label', ['diecut'], { gloss: 0, stiffness: 1, texture: 5 }],
    },
  },
  {
    id: 'invitations', label: 'Invitations & announcements', service: 'offset', tag: 'Made to be kept',
    note: 'These are kept in a drawer for years, so feel is everything.',
    specs: {
      premium: ['Heavy cotton or textured cover', '130# cover or heavier', ['emboss', 'foil'], { gloss: 2, stiffness: 5, texture: 4 }],
      budget: ['Smooth cover', '100# cover', ['fold'], { gloss: 1, stiffness: 4, texture: 2 }],
      durable: ['Coated cover with laminate', '100# cover', ['laminate'], { gloss: 3, stiffness: 4, texture: 1 }],
      natural: ['Letterpress-friendly uncoated cover', '110–140# uncoated cover', ['emboss'], { gloss: 0, stiffness: 5, texture: 5 }],
    },
  },
  {
    id: 'forms', label: 'Forms & carbonless', service: 'digital', tag: 'Every copy counts',
    note: 'The top sheet and every copy underneath need to stay legible.',
    specs: {
      premium: ['Carbonless sets, padded', '2–4 part sets with a heavy backer', ['staple'], { gloss: 1, stiffness: 3, texture: 2 }],
      budget: ['Carbonless sets', '2-part (white / canary)', [], { gloss: 1, stiffness: 1, texture: 1 }],
      durable: ['Carbonless with a heavy backer', '3-part with 80# cover backer', ['staple'], { gloss: 1, stiffness: 3, texture: 1 }],
      natural: ['Plain recycled bond', '24# recycled bond', [], { gloss: 0, stiffness: 1, texture: 3 }],
    },
  },
]

export const weights = [
  { label: '20# bond', feel: 'Everyday copy paper', t: 1 },
  { label: '70# text', feel: 'A fuller newsletter or brochure page', t: 1.8 },
  { label: '100# gloss text', feel: 'A glossy magazine page', t: 2.3 },
  { label: '80# cover', feel: 'A light postcard or door hanger', t: 3.4 },
  { label: '100# cover · 14 pt', feel: 'A standard postcard', t: 4.3 },
  { label: '130# cover · 16 pt', feel: 'A premium business card', t: 5.3 },
]
