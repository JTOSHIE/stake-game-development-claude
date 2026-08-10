// splash_proof.mjs - OWNER AUDIT ROUND 4 item 2 before/after proofs.
// Captures the splash at two profiles, at three points in its animation window,
// so a stepped flicker (if any) is visible in the capture rather than averaged away.
// Run (from frontend/): node scripts/splash_proof.mjs <label>
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { qaTmpDir } from './lib/evidencePaths.mjs'
const __dirname = dirname(fileURLToPath(import.meta.url))
const LABEL = process.argv[2] || 'after'
const OUT = qaTmpDir('screens', 'owner-audit-v4')
mkdirSync(OUT,{recursive:true})
const port = await new Promise(res=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>res(p))})})
const proc = spawn('npx',['vite','--port',String(port),'--strictPort'],{cwd:join(__dirname,'..'),stdio:['ignore','pipe','pipe']})
await new Promise((res,rej)=>{const on=d=>{if(/Local|localhost/.test(d.toString()))res()};proc.stdout.on('data',on);proc.stderr.on('data',on);setTimeout(rej,20000)})
const b=await chromium.launch()
for (const p of [{n:'desktop',w:1280,h:720},{n:'portrait',w:390,h:844}]) {
  const page=await b.newPage({viewport:{width:p.w,height:p.h}})
  await page.goto(`http://localhost:${port}/`,{waitUntil:'domcontentloaded'})
  await page.waitForSelector('[data-testid="hero-splash"]',{timeout:15000})
  for (const t of [150, 450, 1400]) {
    await page.waitForTimeout(t===150?150:300)
    await page.screenshot({path:join(OUT,`splash-${LABEL}-${p.n}-t${t}.png`)})
  }
  const layers = await page.evaluate(()=>({
    emblemLayers: document.querySelectorAll('[data-testid="hero-splash"] .emblem-layer').length,
    hasRain: !!document.querySelector('[data-testid="hero-splash"] .rain-layer'),
  }))
  console.log(`${LABEL} ${p.n}`, JSON.stringify(layers))
  await page.close()
}
await b.close(); proc.kill()
