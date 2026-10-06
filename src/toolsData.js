import { FileCheck2, MapPinned, PackageSearch } from 'lucide-react'

// The two customer tools, shown in the menu, footer, and service pages.
export const tools = [
  {
    id: 'estimator',
    path: '/estimator',
    title: 'Project Estimator',
    short: 'Project Estimator',
    icon: PackageSearch,
    tone: 'gold',
    pitch: 'Price it, pick the paper, check your artwork, and send it.',
    detail: 'Build your job and see a ballpark price. Choose paper and finishing, see the date your files are due, check your artwork, and send it, all in one place.',
    cta: 'Start estimating',
  },
  {
    id: 'eddm',
    path: '/eddm-planner',
    title: 'EDDM Planner',
    short: 'EDDM Planner',
    icon: MapPinned,
    tone: 'coral',
    pitch: 'Pick routes in your town and plan a mailing.',
    detail: 'Choose postal routes, see the households you’ll reach, and get printing, postage, and delivery timing in one plan.',
    cta: 'Plan a mailing',
  },
]

// A reference page, not a tool: kept for search traffic and linked from the estimator’s artwork step.
export const guides = [
  {
    id: 'artwork',
    path: '/artwork-help',
    title: 'Artwork Help Center',
    short: 'Artwork Help',
    icon: FileCheck2,
    tone: 'cyan',
    pitch: 'Bleed, safe zones, a file checklist, and free templates.',
    cta: 'Read the guide',
  },
]

export const toolById = Object.fromEntries([...tools, ...guides].map((t) => [t.id, t]))
