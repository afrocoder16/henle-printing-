import {
  BookOpen,
  Boxes,
  Brush,
  Mail,
  Printer,
  ScanLine,
} from 'lucide-react'

export const services = [
  {
    slug: 'inkjet',
    number: '01',
    title: 'Inkjet Printing',
    tagline: 'Sharp from first sheet to last.',
    description:
      'High-speed inkjet brings striking detail, consistent color, and economical production to books, newsletters, statements, and personalized campaigns.',
    detail:
      'With more than 130,000 nozzles, Henle’s Fujifilm J Press renders fine type and crisp imagery at production speed. It is an ideal balance of offset-level quality and digital flexibility.',
    icon: ScanLine,
    color: 'cyan',
    applications: ['Newsletters', 'Books & booklets', 'Variable data', 'Statements'],
  },
  {
    slug: 'offset',
    number: '02',
    title: 'Offset Printing',
    tagline: 'Built for volume. Tuned for color.',
    description:
      'For long runs and exacting color, our offset pressroom delivers reliable quality across coated, uncoated, specialty stocks, and custom formats.',
    detail:
      'Five presses, each with its own specialty, give the team the flexibility to handle one- through six-color work, letterpress, and die-cut projects without compromising the sheet.',
    icon: Printer,
    color: 'coral',
    applications: ['Brochures', 'Folders', 'Forms', 'Long-run publications'],
  },
  {
    slug: 'digital',
    number: '03',
    title: 'Digital Printing',
    tagline: 'Fast turnarounds. Full-impact color.',
    description:
      'Short runs, quick changes, and deadline-driven projects come off our digital presses crisp, vibrant, and ready for finishing.',
    detail:
      'From envelopes and postcards to collated, folded, and stapled documents, digital production keeps smaller quantities cost-effective. Variable data makes every piece more relevant.',
    icon: Boxes,
    color: 'gold',
    applications: ['Postcards', 'Envelopes', 'Flyers', 'Short-run collateral'],
  },
  {
    slug: 'design',
    number: '04',
    title: 'Graphic Design',
    tagline: 'A good idea, made press-ready.',
    description:
      'Bring a finished file or a sketch on a napkin. Our print-minded designers shape the concept, prepare the artwork, and remove surprises before press.',
    detail:
      'Because our designers work beside the people who print and finish your job, creative decisions account for stock, folds, trim, color, and production from the very start.',
    icon: Brush,
    color: 'cyan',
    applications: ['Brand collateral', 'Layout & typesetting', 'Prepress', 'Campaign creative'],
  },
  {
    slug: 'finishing',
    number: '05',
    title: 'Finishing',
    tagline: 'The details people can feel.',
    description:
      'Folding, binding, die cutting, laminating, and specialty coatings turn a printed sheet into a piece worth keeping.',
    detail:
      'We guide you toward finishing choices that improve function and make an impression—without adding complexity where it does not earn its place.',
    icon: BookOpen,
    color: 'coral',
    applications: ['Binding', 'Folding', 'Die cutting', 'Laminating'],
  },
  {
    slug: 'mailing',
    number: '06',
    title: 'Mailing',
    tagline: 'From our press to their mailbox.',
    description:
      'We manage lists, postal preparation, insertion, EDDM, and delivery so your campaign moves as one coordinated job.',
    detail:
      'Henle handles the details between finished piece and final delivery, including bulk-mail preparation, billing statement insertion, Every Door Direct Mail, and shipping.',
    icon: Mail,
    color: 'gold',
    applications: ['Bulk mail', 'EDDM', 'List management', 'Insertion & shipping'],
  },
]

