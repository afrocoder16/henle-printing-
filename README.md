# Henle Printing Company website

A responsive sample marketing site for Henle Printing Company in Marshall, Minnesota. Built with React and Vite.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm run qa:visual
```

The visual QA command expects the Vite development server to be running at `http://127.0.0.1:5173`.

## Update the monthly promotion

Edit [`src/monthlyPromo.js`](src/monthlyPromo.js). The homepage component automatically applies the edition, headline, message, offer, notice, highlights, calendar date, and CTA.

## Where things live

| To change… | Edit |
| --- | --- |
| Service page words, facts, photo slots, YouTube video IDs | [`src/serviceData.js`](src/serviceData.js) |
| Photos on service pages | Drop JPGs into `public/services/` using the file names in `serviceData.js` |
| About page story, crew, quotes | [`src/aboutData.js`](src/aboutData.js) (crew portraits go in `public/team/`, 800 × 1000 px) |
| Customer reviews | [`src/reviews.js`](src/reviews.js) (entries marked `sample: true` are placeholders) |
| Portfolio pages and clients | [`src/portfolioData.js`](src/portfolioData.js), images made by `scripts/render-portfolio.py` |
| Project Estimator / EDDM Planner demo rates | [`src/pages/tools/pricingData.js`](src/pages/tools/pricingData.js) (**demo data, not Henle's real prices**) |
| Project Estimator flow (steps, deadlines, file check, free tools) | [`src/pages/tools/flow/flowLogic.js`](src/pages/tools/flow/flowLogic.js) and the step files beside it |
| Production days and holidays used for "files due" dates | [`src/pages/tools/deadlineData.js`](src/pages/tools/deadlineData.js), `TURN_DAYS` in `flowLogic.js` |
| Downloadable artwork templates | `python scripts/make-templates.py` |
| Google Analytics | Build with `VITE_GA_ID=G-XXXXXXXXXX` (nothing loads without it) |

All forms on this sample site are front-end only: they show a success message and send nothing.

## Deployment

Every push to `main` builds and deploys the site through GitHub Pages.
