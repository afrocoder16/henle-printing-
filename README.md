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

## Deployment

Every push to `main` builds and deploys the site through GitHub Pages.
