// trademark_variant_scan_au.mjs — TRADEMARK VARIANT SCAN SPEC, 2026-07-18.
//
// Runs the AU (IP Australia) leg of the variant scan: advanced search for
// "spinner", "spinners", "future spin", "we roll", each filtered to classes
// 9 and 41 (strict/Single class-match mode, not the default "Associated"
// mode which silently broadens to related classes), status group "Pending
// and Registered". Captures a full-page screenshot per results page, and
// for every hit visits its detail page for owner + goods/services (polite
// single queries with a delay between each, no bulk crawling).
//
// This script only gathers data. It makes no clearance/similarity judgment.
//
// Run (from frontend/): node scripts/trademark_variant_scan_au.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'docs', 'records', 'trademark', '2026-07-18', 'au')
mkdirSync(OUT_DIR, { recursive: true })

const TERMS = process.argv.slice(2).length ? process.argv.slice(2) : ['spinner', 'spinners', 'future spin', 'we roll']
const DETAIL_DELAY_MS = 1500
const SEARCH_DELAY_MS = 2000

function slug(term) {
  return term.replace(/\s+/g, '-')
}

async function clickCustomOption(page, buttonSel, exactLabel) {
  await page.click(buttonSel)
  await page.waitForTimeout(300)
  const target = await page.evaluate((label) => {
    const all = Array.from(document.querySelectorAll('span, label, li, a, div'))
    const match = all.find(
      (el) => el.children.length === 0 && el.textContent.trim() === label && (el.offsetWidth || el.offsetHeight),
    )
    if (!match) return null
    const r = match.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, exactLabel)
  if (!target) throw new Error(`option not found: ${exactLabel}`)
  await page.mouse.click(target.x, target.y)
  await page.waitForTimeout(400)
}

async function runSearch(page, term) {
  await page.goto('https://search.ipaustralia.gov.au/trademarks/search/advanced', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })
  await page.waitForTimeout(800)
  if (term.includes(' ')) {
    await page.click('#wordPhrase')
    await page.type('#wordPhrase', term, { delay: 20 })
  } else {
    await page.click('#wordSearchTerms1')
    await page.type('#wordSearchTerms1', term, { delay: 20 })
  }
  await page.click('#classNumbers')
  await page.type('#classNumbers', '9,41', { delay: 20 })
  await page.waitForTimeout(300)
  await clickCustomOption(page, '#s_ct', '2. Single')
  await clickCustomOption(page, '#s_upperStatus', '3. Pending and Registered')
  await page.mouse.click(900, 300)
  await page.waitForTimeout(SEARCH_DELAY_MS)

  const submitClass = await page.evaluate(() => document.querySelector('#qa-search-submit')?.className || '')
  if (submitClass.includes('disabled')) {
    return { blocked: true, reason: 'submit button remained disabled after field setup' }
  }
  const attention = await page.evaluate(() => document.body.innerText.includes('Attention'))
  if (attention) {
    return { blocked: true, reason: 'form validation error (Attention banner) present before submit' }
  }

  await page.click('#qa-search-submit')
  await page.waitForTimeout(3000)

  const url = page.url()
  if (/\/search\/view\//.test(url)) {
    // Single-hit searches skip the list page and redirect straight to that
    // hit's own record page.
    return { blocked: false, url, singleHitRedirect: true }
  }
  if (/\/search\/result/.test(url)) {
    return { blocked: false, url }
  }
  const bodyText = await page.evaluate(() => document.body.innerText)
  if (/zero results/i.test(bodyText)) {
    // 0-hit searches render inline on the advanced-search URL rather than
    // navigating to a results page.
    return { blocked: false, url, zeroResults: true }
  }
  return { blocked: true, reason: `did not reach a results page (stayed at ${url})` }
}

function parseCount(text) {
  const m = text.match(/([\d,]+)\s*results?\b/i)
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null
}

async function extractRows(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr.mark-line.result'))
    return rows.map((row) => {
      const number = row.querySelector('td.number a')?.textContent.trim() || null
      const markText = row.querySelector('td.trademark.words')?.textContent.trim() || null
      const classes = row.querySelector('td.classes')?.textContent.trim() || null
      const status = row.querySelector('td.status span')?.textContent.trim() || null
      return { number, markText, classes, status }
    })
  })
}

function extractDetailFields(text) {
  const ownerMatch = text.match(/\nOwners?\n(.+?)\nAddress for service/s)
  const owner = ownerMatch
    ? ownerMatch[1]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !/^See full address/i.test(l))
        .join('; ')
    : null

  const gsMatch = text.match(
    /Goods & Services\n(.+?)(?:\nConvention details|\nOpposition details|\nHistory and Publications|\nOwners?\n)/s,
  )
  const goodsServices = gsMatch ? gsMatch[1].trim().replace(/\s+/g, ' ') : null

  return { owner, goodsServices }
}

async function runDetail(page, number) {
  await page.goto(`https://search.ipaustralia.gov.au/trademarks/search/view/${number}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  })
  await page.waitForTimeout(800)
  const text = await page.evaluate(() => document.body.innerText)
  return extractDetailFields(text)
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const report = { generatedFrom: 'search.ipaustralia.gov.au/trademarks/search/advanced', terms: [] }

  for (const term of TERMS) {
    console.log(`[AU] searching: "${term}"`)
    const searchResult = await runSearch(page, term)
    const termEntry = { term, classes: '9,41', classMode: 'Single', statusGroup: 'Pending and Registered' }

    if (searchResult.blocked) {
      termEntry.gap = searchResult.reason
      termEntry.hitCount = null
      termEntry.hits = []
      report.terms.push(termEntry)
      console.log(`[AU] "${term}": BLOCKED/GAP - ${searchResult.reason}`)
      continue
    }

    if (searchResult.zeroResults) {
      termEntry.hitCount = 0
      termEntry.hits = []
      const screenshotPath = join(OUT_DIR, `${slug(term)}-results.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      termEntry.screenshot = screenshotPath
      report.terms.push(termEntry)
      console.log(`[AU] "${term}": 0 result(s)`)
      continue
    }

    if (searchResult.singleHitRedirect) {
      // Single-hit searches land directly on that hit's own record page,
      // which already carries mark text/number/classes/status/owner/G&S -
      // no separate list page or detail visit needed.
      await page.waitForTimeout(800)
      const screenshotPath = join(OUT_DIR, `${slug(term)}-results.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      termEntry.screenshot = screenshotPath
      termEntry.note = 'AU register auto-redirected straight to the single hit\'s own record page (no intermediate results list for a 1-hit search)'

      const text = await page.evaluate(() => document.body.innerText)
      const numberMatch = text.match(/Number\s+(\d+)/)
      const wordsMatch = text.match(/Words\s+(.+?)\s+Status/)
      const statusMatch = text.match(/Status\s+●\s*(.+?)\s+Priority date/)
      const classesMatch = text.match(/Class(?:es)?\s+([\d,\s]+?)\s+Kind/)
      const detail = extractDetailFields(text)

      termEntry.hitCount = 1
      termEntry.hits = [
        {
          number: numberMatch ? numberMatch[1] : null,
          markText: wordsMatch ? wordsMatch[1].trim() : null,
          classes: classesMatch ? classesMatch[1].trim() : null,
          status: statusMatch ? statusMatch[1].trim() : null,
          owner: detail.owner,
          goodsServices: detail.goodsServices,
        },
      ]
      report.terms.push(termEntry)
      console.log(`[AU] "${term}": 1 result (single-hit redirect)`)
      continue
    }

    const bodyText = await page.evaluate(() => document.body.innerText)
    const count = parseCount(bodyText)
    termEntry.hitCount = count

    const screenshotPath = join(OUT_DIR, `${slug(term)}-results.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    termEntry.screenshot = screenshotPath

    const rows = await extractRows(page)
    if (count !== null && rows.length !== count) {
      termEntry.gap = `results-page row count (${rows.length}) did not match reported total (${count}); possible pagination or truncation, capturing only what loaded on the single results page reached`
    }

    termEntry.hits = []
    for (const row of rows) {
      const hit = { ...row }
      if (row.number) {
        await page.waitForTimeout(DETAIL_DELAY_MS)
        try {
          const detail = await runDetail(page, row.number)
          hit.owner = detail.owner
          hit.goodsServices = detail.goodsServices
          if (!detail.owner) hit.ownerGap = 'owner field not found on detail page'
          if (!detail.goodsServices) hit.goodsServicesGap = 'goods/services field not found on detail page'
        } catch (err) {
          hit.detailGap = `detail page fetch failed: ${err.message}`
        }
      } else {
        hit.detailGap = 'no trade mark number captured on results row'
      }
      termEntry.hits.push(hit)
    }

    report.terms.push(termEntry)
    console.log(`[AU] "${term}": ${count} result(s), ${rows.length} row(s) captured`)
  }

  await browser.close()
  const jsonPath = join(OUT_DIR, 'au_variant_scan_data.json')
  writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`\nWrote ${jsonPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
