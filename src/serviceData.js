// Content for the six individual service pages. Wording comes from Henle's current site
// (henleprinting.com). Text in `words` is quoted verbatim; everything else is summarized.
//
// PHOTOS: drop files into public/services/ using the `file` names below. Until a file exists, a slot
// shows its `fallback` (a real photo from the 2023 portfolio) or a labeled placeholder.
// VIDEOS: paste a YouTube video ID into `video.youtubeId` (the part after v= in the URL).

const base = import.meta.env.BASE_URL
const stock = (name) => `${base}portfolio/photos/${name}.webp`

export const serviceOrder = ['inkjet', 'offset', 'digital', 'design', 'finishing', 'mailing']

export const servicePages = {
  inkjet: {
    slug: 'inkjet',
    path: '/inkjet-printing',
    title: 'Inkjet Printing',
    seoTitle: 'State of the Art Inkjet Printing in Marshall, MN',
    seoDescription: 'Henle was the first printer in Minnesota with high speed inkjet. A Fuji Film J-Press with over 130,000 nozzles—perfect from the first sheet to the last.',
    tone: 'cyan',
    eyebrow: 'Inkjet printing',
    headline: 'State of the Art InkJet Printing',
    subhead: 'Perfect from First to Last Page',
    lede: 'The first printer in Minnesota with high speed Ink Jet printing capabilities.',
    words: [
      'Henle Printing is the first printer in Minnesota with high speed Ink Jet printing capabilities. Our Fuji Film J-Press has over 130,000 nozzles and produces sharp lines down to 2-point fonts, with the same quality from the first sheet to the last sheet.',
    ],
    wordsNote: 'Summarized from our current inkjet page.',
    facts: [
      { value: 130000, suffix: '+', label: 'nozzles on the Fuji Film J-Press' },
      { value: 2, suffix: '-pt', label: 'sharp type, down to 2-point fonts' },
      { value: 1, prefix: '#', label: 'in Minnesota with high speed inkjet' },
    ],
    equipment: [{ name: 'Fuji Film J-Press', note: 'High speed inkjet press' }],
    prints: ['Booklets', 'Brochures', 'Calendars', 'Newsletters', 'Reports', 'Custom Journals'],
    photos: [
      { key: 'hero', file: 'inkjet-hero.jpg', fallback: stock('press'), caption: 'High speed inkjet: ink placed nozzle by nozzle.', need: 'Wide shot of the J-Press running in the pressroom (landscape, ideally with a sheet coming off).' },
      { key: 'detail', file: 'inkjet-detail.jpg', caption: 'Fine type, printed to 2-point.', need: 'Macro close-up of printed small type or a fine-detail image on a fresh sheet.' },
      { key: 'operator', file: 'inkjet-operator.jpg', caption: 'Every sheet gets checked.', need: 'A press operator inspecting a sheet at the J-Press.' },
    ],
    video: { youtubeId: '1coD8sg11uE', title: 'High speed inkjet, in action', note: 'Fujifilm J Press 750S announcement (Fujifilm Print US). Swap in Henle’s own J-Press video when available.' },
    related: [
      { slug: 'mailing', pitch: 'Personalized pieces can go straight into the mail—one team, one deadline.' },
      { slug: 'finishing', pitch: 'Booklets and books are finished in-house on our Horizon booklet maker.' },
    ],
  },

  offset: {
    slug: 'offset',
    path: '/offset-printing',
    title: 'Offset Printing',
    seoTitle: 'Professional Offset Printing in Marshall, MN',
    seoDescription: 'Five presses, one-color to six, letterpress and die cuts. Worry free. Surprise free. Professional offset printing from Henle Printing in Marshall, Minnesota.',
    tone: 'coral',
    eyebrow: 'Offset printing',
    headline: 'Professional Offset Printing',
    subhead: 'Worry free. Surprise free.',
    lede: 'Five presses, each with its own specialty—together a complete commercial printing facility.',
    words: [
      'Henle Printing Company operates five presses, each with its own specialty and together creating a comprehensive commercial printing facility. Small or large, one-color to six, we can meet any printing request, even letterpress and die cuts.',
      'Yet, our greatest asset in the pressroom is the talent of our staff. Our team of printing professionals is experienced and committed to your satisfaction. They will skillfully manage your job throughout the entire process, insuring that every sheet looks just as good as the first, and better than you expect.',
    ],
    facts: [
      { value: 5, label: 'presses, each with its own specialty' },
      { value: 6, label: 'colors, one-color to six' },
      { value: 2, label: 'specialties: letterpress & die cuts' },
    ],
    equipment: [{ name: 'Four-color offset press', note: 'One of our five presses' }],
    prints: ['Announcements', 'Booklets', 'Brochures', 'Business Cards', 'Calendars', 'Envelopes', 'Folded Cards', 'Letterhead', 'Newsletters', 'Postcards', 'Wedding Announcements and Cards'],
    photos: [
      { key: 'hero', file: 'offset-hero.jpg', caption: 'One of the five presses in the Henle pressroom.', need: 'Wide shot of an offset press running (landscape). A four-color press is ideal.' },
      { key: 'ink', file: 'offset-ink.jpg', caption: 'Ink, rollers, and a steady hand.', need: 'Close-up of ink rollers or the ink fountain with color on the rollers.' },
      { key: 'sheets', file: 'offset-sheets.jpg', caption: 'Every sheet as good as the first.', need: 'A stack or fan of printed sheets, ideally with the press color bar visible on the edge.' },
      { key: 'crew', file: 'offset-crew.jpg', caption: 'The talent of our staff is our greatest asset.', need: 'A press operator pulling a proof or checking a sheet against the approved copy.' },
    ],
    video: { youtubeId: 'czQ0d0DvGIg', title: 'Inside a modern pressroom', note: 'Heidelberg Speedmaster XL 106 (Heidelberg official). Example of an offset press; swap in Henle’s own.' },
    related: [
      { slug: 'finishing', pitch: 'Die cuts, coatings, and embossing finish the job without leaving our building.' },
      { slug: 'design', pitch: 'Our designers work next to the press, so files are built to print right.' },
    ],
  },

  digital: {
    slug: 'digital',
    path: '/digital-printing',
    title: 'Digital Printing & Copying',
    seoTitle: 'Digital Printing & Copying in Marshall, MN',
    seoDescription: 'Big results. Small price. One color to full color copies, booklets, brochures, newsletters, and envelopes—fast—with variable data printing from Henle in Marshall, MN.',
    tone: 'gold',
    eyebrow: 'Digital printing',
    headline: 'Digital Printing & Copying',
    subhead: 'Big results. Small price.',
    lede: 'Henle Printing is an area leader in digital printing, giving us the ability to make all your commercial printing deadlines.',
    words: [
      'One color to full color copies, booklets, brochures, newsletters, and even envelopes can be run quickly with high quality all at a cost and time savings to you. Henle Printing is an area leader in digital printing, giving us the ability to make all your commercial printing deadlines.',
      'Whether its your original or we design a new file, we can print quality documents with high-resolution images, brilliant color, and crisp text. From letter to tabloid-sized sheets, we can print double-sided, fold, collate, and staple your documents. In a rush? We deliver the fastest turnaround and highest quality copying, so you can impress your customers.',
      'Another feature we offer is VDP (Variable Data Processing). Let us customize your print projects for great marketing results!',
    ],
    facts: [
      { label: 'One color to full color copies', text: 'Full color' },
      { label: 'Letter to tabloid-sized sheets', text: '8.5 × 11 to 11 × 17' },
      { label: 'Variable Data Processing for great marketing results', text: 'VDP' },
    ],
    equipment: [
      { name: 'Versant Xerox 3100', note: 'Digital press' },
      { name: 'Xante envelope printer', note: 'Printed envelopes' },
    ],
    prints: ['Black and White Copies', 'Black and White Printing', 'Color Copies', 'Color Printing', 'Booklets', 'Brochures', 'Carbon-less Forms', 'Door Hangers', 'Employment Forms', 'Envelopes', 'Flyers', 'Folded Cards', 'Labels', 'Memo and Notepads', 'Multi part Forms', 'Newsletters', 'Postcards', 'Presentations', 'Reports', 'Sell Sheets', 'Table Tents'],
    alsoPrints: { label: 'Large format, scanning & more', items: ['Architectural Plans/Prints', 'Banners', 'Large Color Posters', 'Posters', 'Vinyl Lettering', 'Window Clings', 'Wide Format Scanning and Prints', 'Document Scanning', 'Faxing', 'Self Service'] },
    photos: [
      { key: 'hero', file: 'digital-hero.jpg', fallback: stock('press'), caption: 'Quick turnaround, high quality.', need: 'The Versant digital press with a sheet coming out (landscape).' },
      { key: 'envelope', file: 'digital-envelope.jpg', caption: 'Even envelopes, printed in-house.', need: 'The Xante envelope printer running with a printed envelope in the tray.' },
      { key: 'stack', file: 'digital-stack.jpg', caption: 'Folded, collated, and stapled.', need: 'A neat stack of collated, stapled documents or booklets.' },
    ],
    video: { youtubeId: 'tyEMxXwmF1w', title: 'Digital printing in action', note: 'Xerox Versant 280 walkthrough from a Xerox reseller (ABD Office Solutions). Example only; swap in Henle’s own.' },
    related: [
      { slug: 'mailing', pitch: 'Variable data works best when the mailing is done by the same team.' },
      { slug: 'design', pitch: 'Don’t have a file? We design a new one.' },
    ],
  },

  design: {
    slug: 'design',
    path: '/graphic-design',
    title: 'Graphic Design',
    seoTitle: 'Graphic Design for Print in Marshall, MN',
    seoDescription: 'Got a great idea? Need one? Henle’s graphic designers specialize in printed materials—from error-free file prep to a rough idea brought to life.',
    tone: 'cyan',
    eyebrow: 'Graphic design',
    headline: 'Graphic Design',
    subhead: 'Got a great idea? Need one?',
    lede: 'Designers who specialize in printed materials.',
    words: [
      'Henle Printing Company employs talented graphic designers who specialize in printed materials. We are pros at taking your finished document designs and preparing them for error-free printing. Or, if all you have is a rough idea of what you want to achieve, let our inspiration bring it to life. We’ll involve you through the entire process and present you with finished products that will help your grow your business.',
    ],
    facts: [
      { label: 'Designers who specialize in printed materials', text: 'Print-first' },
      { label: 'Finished files prepared for error-free printing', text: 'Error-free' },
      { label: 'You’re involved through the entire process', text: 'Together' },
    ],
    equipment: [],
    prints: ['Announcements', 'Brochures', 'Business Cards', 'Calendars', 'Flyers', 'Letterhead', 'Newsletters', 'Postcards', 'Sell Sheets', 'Retouching', 'Wedding Announcements and Cards'],
    photos: [
      { key: 'hero', file: 'design-hero.jpg', caption: 'From rough idea to finished piece.', need: 'A designer at a screen with a printed proof beside them (landscape).' },
      { key: 'sketch', file: 'design-sketch.jpg', caption: 'All you need is a rough idea.', need: 'A hand-drawn sketch or napkin layout, ideally next to the finished printed piece.' },
      { key: 'proofs', file: 'design-proofs.jpg', caption: 'You’ll know what you’re getting before the presses roll.', need: 'Proofs, color swatches, and paper samples spread across a table.' },
    ],
    video: { youtubeId: null, title: 'Design to press', note: 'Optional video' },
    related: [
      { slug: 'offset', pitch: 'Designed beside the press means no surprises at press time.' },
      { slug: 'finishing', pitch: 'Plan die cuts, coatings, and embossing from the very first sketch.' },
    ],
  },

  finishing: {
    slug: 'finishing',
    path: '/finishing',
    title: 'Finishing & Binding',
    seoTitle: 'Finishing & Binding in Marshall, MN',
    seoDescription: 'No detail left out. Protective coatings, die cuts, embossing, stapling, and hardcover binding from Henle Printing in Marshall, Minnesota.',
    tone: 'coral',
    eyebrow: 'Finishing & binding',
    headline: 'Finishing & Binding',
    subhead: 'No detail left out.',
    lede: 'From protective coatings to die cuts to embossing—and stapling to hardcover binding.',
    words: [
      'When you’ve made the choice to commercially print your project, you did so because you want it to look its best. Working within your budget, Henle Printing Company will guide you with the best choices from protective coatings to die cuts to embossing. Or, maybe your project needs binding. Our list of options includes simple stapling to hardcover binding. Rest assured, we will deliver materials that you’ll be proud of.',
    ],
    facts: [
      { label: 'Protective coatings', text: 'Coat' },
      { label: 'Die cuts', text: 'Cut' },
      { label: 'Embossing', text: 'Raise' },
      { label: 'Stapling to hardcover binding', text: 'Bind' },
    ],
    equipment: [{ name: 'Horizon booklet maker', note: 'Press operator making newsletters' }],
    prints: ['Booklets', 'Binding', 'Laminating', 'Folded Cards', 'Custom Journals', 'Calendars', 'Brochures', 'Reports'],
    photos: [
      { key: 'hero', file: 'finishing-hero.jpg', fallback: stock('finishing'), caption: 'Press operator making newsletters on the Horizon booklet maker.', need: 'The Horizon booklet maker in action (their site already has this photo).' },
      { key: 'diecut', file: 'finishing-diecut.jpg', caption: 'Die cuts that make a piece stand out.', need: 'A die-cut piece (unusual shape or window) held up or on a table.' },
      { key: 'emboss', file: 'finishing-emboss.jpg', caption: 'Embossing and foil you can feel.', need: 'Raking-light close-up of an embossed or foil-stamped surface.' },
      { key: 'binding', file: 'finishing-binding.jpg', caption: 'From stapling to hardcover binding.', need: 'A bound book or booklet, ideally a hardcover next to a stapled booklet.' },
    ],
    video: { youtubeId: '1CylGvk33yc', title: 'Booklet making, start to finish', note: 'Horizon booklet-making system demo (Horizon International). A newer model than Henle’s; swap in their own.' },
    related: [
      { slug: 'offset', pitch: 'Pair a six-color press run with the right coating.' },
      { slug: 'inkjet', pitch: 'Inkjet booklets finish on the Horizon booklet maker.' },
    ],
  },

  mailing: {
    slug: 'mailing',
    path: '/mailing',
    title: 'Bulk Mailing & Shipping',
    seoTitle: 'Bulk Mailing, EDDM & Shipping in Marshall, MN',
    seoDescription: 'Making the deadlines. Bulk mailing, list cleaning, presorting, bill insertion, Every Door Direct Mail, and fast, free local delivery from Henle in Marshall, MN.',
    tone: 'gold',
    eyebrow: 'Mailing & shipping',
    headline: 'Bulk Mailing & Shipping',
    subhead: 'Making the deadlines.',
    lede: 'There’s a reason we lead the region in mailing solutions.',
    words: [
      'Save time and money with our bulk mailing services. Whether it is a project we’ve printed or documents you produce, our mailing specialists can clean, standardize, and presort your lists to qualify for the best prices on postage.',
      'For companies who send out monthly billing statements, our insertion equipment can assemble your prepared bills with a return envelope and even a promotional document if you choose.',
      'Reach your customers with direct mailings. Our specialists can help your business marketing reach specific customers, demographics, or postal routes. Supply your own list or let us create one for you. We are experts with Every Door Direct Mailings (EDDM) and make sure your promotions arrive on time.',
    ],
    shipping: 'The business world is full of deadlines. Henle Printing Company delivers to local clients, fast and free. But don’t worry if you are out of the area or want your project delivered directly to your customers. We ship daily to ensure your packages will arrive on time.',
    facts: [
      { label: 'We lead the region in mailing solutions', text: 'Region’s #1' },
      { label: 'Local delivery, fast and free', text: 'Free' },
      { label: 'We ship daily', text: 'Daily' },
    ],
    equipment: [{ name: 'Insertion equipment', note: 'Bills, return envelopes, and promotional pieces' }],
    prints: ['Postcards', 'Envelopes', 'Newsletters', 'Flyers', 'Brochures', 'Announcements', 'Door Hangers'],
    photos: [
      { key: 'hero', file: 'mailing-hero.jpg', fallback: stock('mailroom'), caption: 'Mail moving through the Henle mailroom.', need: 'Mailpieces running through the inserter or on the sorting table (landscape).' },
      { key: 'delivery', file: 'mailing-delivery.jpg', caption: 'Local delivery, fast and free.', need: 'A Henle van or a delivery staff member handing off packages.' },
      { key: 'eddm', file: 'mailing-eddm.jpg', caption: 'Direct mail that gets opened.', need: 'Bundled EDDM postcards in trays at the post office dock or on the shop table.' },
    ],
    video: { youtubeId: 'Uj8vNN23zOI', title: 'How Every Door Direct Mail works', note: 'USPS official explainer, part 1 of 5.' },
    related: [
      { slug: 'digital', pitch: 'Variable Data Processing makes every piece personal before it mails.' },
      { slug: 'design', pitch: 'We design the piece with postal requirements in mind.' },
    ],
  },
}

export const getService = (slug) => servicePages[slug]
