import puppeteer from 'puppeteer-core'
import axe from 'axe-core'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
})

const cases = [
  { name: 'home-mobile', url: '/', width: 390, height: 844 },
  { name: 'home-desktop', url: '/', width: 1440, height: 1000 },
  { name: 'monthly-desktop', url: '/#monthly-update', width: 1440, height: 1000 },
  { name: 'monthly-mobile', url: '/#monthly-update', width: 390, height: 844 },
  { name: 'promo-desktop', url: '/#sample-kit', width: 1440, height: 1000 },
  { name: 'promo-mobile', url: '/#sample-kit', width: 390, height: 844 },
  { name: 'about-desktop', url: '/#about', width: 1440, height: 1000 },
  { name: 'services-desktop', url: '/services', width: 1440, height: 1000 },
  { name: 'portfolio-desktop', url: '/portfolio', width: 1440, height: 1000 },
  { name: 'mailing-mobile', url: '/mailing', width: 390, height: 844 },
  { name: 'quote-mobile', url: '/quote', width: 390, height: 844 },
  { name: 'contact-desktop', url: '/contact', width: 1440, height: 1000 },
]

for (const shot of cases) {
  const page = await browser.newPage()
  await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`http://127.0.0.1:5173${shot.url}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
    header: document.querySelector('.site-header')?.getBoundingClientRect().toJSON(),
    menu: document.querySelector('.menu-toggle')?.getBoundingClientRect().toJSON(),
  }))
  await page.addScriptTag({ content: axe.source })
  const accessibility = await page.evaluate(() => window.axe.run())
  await page.screenshot({ path: `${shot.name}.png` })
  process.stdout.write(`${shot.name}: ${JSON.stringify(layout)} · ${accessibility.violations.length} accessibility violations\n`)
  for (const violation of accessibility.violations) {
    process.stdout.write(`  ${violation.impact}: ${violation.id} — ${violation.help}\n`)
    for (const node of violation.nodes) {
      process.stdout.write(`    ${node.target.join(' ')} · ${node.failureSummary}\n`)
    }
  }
  await page.close()
}

const countPage = await browser.newPage()
await countPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await countPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
const beforeCount = await countPage.$$eval('.count-up > span[aria-hidden="true"]', (nodes) => nodes.map((node) => node.textContent.trim()))
await countPage.$eval('#proof', (element) => element.scrollIntoView({ block: 'center' }))
await new Promise((resolve) => setTimeout(resolve, 5300))
const afterCount = await countPage.$$eval('.count-up > span[aria-hidden="true"]', (nodes) => nodes.map((node) => node.textContent.trim()))
if (!afterCount.includes('45+') || !afterCount.includes('1980') || !afterCount.includes('~20') || !afterCount.some((value) => value.startsWith('4.7'))) {
  throw new Error(`Count-up check failed: ${JSON.stringify({ beforeCount, afterCount })}`)
}
process.stdout.write(`count-up: ${beforeCount.join(' / ')} → ${afterCount.join(' / ')}\n`)
await countPage.close()

await browser.close()
