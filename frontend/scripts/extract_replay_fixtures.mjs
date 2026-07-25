// extract_replay_fixtures.mjs - R2R JOB 5 (2026-07-25).
//
// Builds the replay fixture set from the SHIPPED BOOKS, one round per category
// per mode, and writes src/lib/services/__fixtures__/replay_rounds.json.
//
// WHY A SCRIPT AND NOT HAND-WRITTEN FIXTURES. Round-two reviewer 3's second
// BLOCKER is that replay searched for `board`, `win` and `scatter` events that
// occur zero times in the shipped books. A hand-written fixture would let the
// same class of mistake back in immediately: someone writes the events they
// believe exist, the test agrees with them, and the books are never consulted.
// Every fixture here is a verbatim book round, copied out of
// games/future_spinner/library/publish_files/books_<mode>.jsonl.zst.
//
// THE BOOKS ARE GITIGNORED (.gitignore:9, `**/library/**`), so this script
// cannot run in CI and is not asked to. It is run locally when the fixtures need
// regenerating, and its OUTPUT is committed. That is the same arrangement the
// existing live_rounds.json fixture uses. If the books are absent the script
// says so and exits non-zero rather than writing a smaller file quietly, which
// is the same fail-closed rule JOB 7 applies to the verifier.
//
// Run (from frontend/):  node scripts/extract_replay_fixtures.mjs

import { spawn } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'

const PUBLISH = resolve('../games/future_spinner/library/publish_files')
const OUT = resolve('src/lib/services/__fixtures__/replay_rounds.json')
const MODES = ['base', 'cruise', 'antelite', 'bonus', 'super']

const CENTIBET_CAP = 500_000 // 5,000.00x, matching roundInterpreter.CENTIBET_CAP
const BIG_WIN_CENTIBETS = 1_000 // 10x the bet, the conventional "big win" line

/**
 * The five categories the brief names. `feature` is decided on the round's own
 * `freeSpinTrigger` event rather than on `criteria`, because the event is what
 * the interpreter branches on and the fixture exists to exercise that branch.
 */
function categorise(round) {
  const pm = round.payoutMultiplier
  const triggered = round.events.some((e) => e.type === 'freeSpinTrigger')
  if (pm >= CENTIBET_CAP) return 'cap'
  if (triggered) return 'feature'
  if (pm === 0) return 'loss'
  if (pm >= BIG_WIN_CENTIBETS) return 'bigWin'
  return 'win'
}
const CATEGORIES = ['loss', 'win', 'bigWin', 'cap', 'feature']

async function scanMode(mode) {
  const path = `${PUBLISH}/books_${mode}.jsonl.zst`
  if (!existsSync(path)) return { missing: true }

  const zstd = spawn('zstd', ['-dc', path], { stdio: ['ignore', 'pipe', 'inherit'] })
  const rl = createInterface({ input: zstd.stdout, crlfDelay: Infinity })

  const found = {}
  let rows = 0
  for await (const line of rl) {
    if (!line.trim()) continue
    rows++
    const round = JSON.parse(line)
    const cat = categorise(round)
    // First match wins, so the choice is deterministic: re-running the script
    // against the same book produces byte-identical fixtures.
    if (!found[cat]) found[cat] = round
    if (CATEGORIES.every((c) => found[c])) break
  }
  rl.close()
  zstd.kill()
  return { found, rows }
}

const out = {}
let anyMissing = false

for (const mode of MODES) {
  const { missing, found, rows } = await scanMode(mode)
  if (missing) {
    console.error(`MISSING books_${mode}.jsonl.zst - the private book package is not present`)
    anyMissing = true
    continue
  }
  out[mode] = {}
  const have = []
  const absent = []
  for (const cat of CATEGORIES) {
    if (found[cat]) { out[mode][cat] = found[cat]; have.push(cat) }
    else absent.push(cat)
  }
  console.log(`${mode.padEnd(9)} scanned ${rows} rounds: ${have.join(', ')}` +
    (absent.length ? `  |  none in this mode: ${absent.join(', ')}` : ''))
}

if (anyMissing) {
  console.error('\nFIXTURE EXTRACTION: FAIL. Books absent; nothing written.')
  process.exit(1)
}

writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
console.log(`\nwrote ${OUT}`)
