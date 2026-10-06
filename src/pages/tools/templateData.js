// Print sizes used by the Artwork Help Center. Keep ids/sizes in sync with scripts/make-templates.py,
// which generates the downloadable PDFs in public/templates/.

export const BLEED = 0.125
export const SAFE = 0.125
export const PPI = 300

export const templates = [
  { id: 'business-card', title: 'Business card', w: 3.5, h: 2, folds: [] },
  { id: 'postcard-4x6', title: 'Postcard 4 × 6', w: 6, h: 4, folds: [] },
  { id: 'postcard-5x7', title: 'Postcard 5 × 7', w: 7, h: 5, folds: [] },
  { id: 'eddm-postcard', title: 'EDDM postcard 6.5 × 9', w: 9, h: 6.5, folds: [] },
  { id: 'rack-card', title: 'Rack card 4 × 9', w: 4, h: 9, folds: [] },
  { id: 'flyer-letter', title: 'Flyer / letter 8.5 × 11', w: 8.5, h: 11, folds: [] },
  { id: 'trifold', title: 'Tri-fold brochure (flat)', w: 11, h: 8.5, folds: [1 / 3, 2 / 3] },
  { id: 'tabloid', title: 'Tabloid 11 × 17', w: 11, h: 17, folds: [] },
  { id: 'door-hanger', title: 'Door hanger 4.25 × 11', w: 4.25, h: 11, folds: [] },
]

export const templateHref = (id) => `${import.meta.env.BASE_URL}templates/henle-${id}-template.pdf`

export const pixels = (inches, bleed = BLEED) => Math.round((inches + 2 * bleed) * PPI)

export const checklist = [
  { id: 'size', title: 'Document set to the trim size plus bleed', hint: 'For a 3.5 × 2 in card, make the file 3.75 × 2.25 in (0.125 in of bleed on every side).' },
  { id: 'bleed', title: 'Backgrounds and photos extend to the bleed edge', hint: 'Anything that touches the edge of the page must run all the way to the red line, or a white sliver can show after trimming.' },
  { id: 'safe', title: 'Text and logos sit inside the safe zone', hint: 'Keep important content at least 0.125 in inside the trim line so it can’t be cut off.' },
  { id: 'color', title: 'Color mode is CMYK (not RGB)', hint: 'Screens show colors printers can’t reproduce. CMYK shows you how bright the print will really be.' },
  { id: 'images', title: 'Images are 300 ppi at final size', hint: 'A picture pulled from a website is usually 72 ppi and prints soft and pixelated.' },
  { id: 'fonts', title: 'Fonts are embedded or converted to outlines', hint: 'This keeps your type from being swapped for a different font at the press.' },
  { id: 'black', title: 'Small black text uses 100% black only', hint: 'Small text built from four colors can look fuzzy if the plates shift slightly.' },
  { id: 'export', title: 'Exported as a press-ready PDF', hint: 'PDF keeps everything together. Hide the guide layers first, and check the PDF at 100% before you send it.' },
]

export const faqs = [
  { q: 'What is bleed, in plain English?', a: 'Paper is cut after printing, and no cut is perfect. Bleed is the extra 1/8 inch of background that runs past the final size, so the trimmed edge is color all the way to the edge instead of a thin white line.' },
  { q: 'Which file types can I upload?', a: 'PDF is best. We also accept AI, EPS, PNG, JPG, and TIFF. If you aren’t sure, send what you have and we’ll tell you what’s needed.' },
  { q: 'My file isn’t ready. Can Henle fix it?', a: 'Yes. Henle’s graphic designers specialize in printed materials, and they are pros at taking your finished document designs and preparing them for error-free printing. Tick “I would like help with design or file preparation” on the quote form.' },
  { q: 'Do I need to send my file as CMYK?', a: 'CMYK is the safest choice because it shows what the ink can really do. If your file is RGB, we can convert it, but the colors may look different from your screen.' },
  { q: 'Will I see a proof before you print?', a: 'We’ll confirm the details with you before the presses roll. Ask about a proof when you request your quote.' },
]
