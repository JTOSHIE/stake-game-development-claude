#!/usr/bin/env node
//
// owner_preview.mjs: the owner's local preview is always current main.
//
// Owner's order, 2026-07-28 (reports/briefs/FS_OWNER_PREVIEW_RULE_Prompt.md):
//
//     whenever main changes, the owner's local copy is already fresh, never
//     stale, never his job to refresh.
//
// Run it as `npm run owner:preview` from frontend/, or directly with node. It
// is idempotent: running it twice in a row is safe and leaves exactly one
// server up.
//
// WHY THIS SPAWNS A SURVIVING CHILD WHEN TR-101 JUST DELETED THEM ALL
// -------------------------------------------------------------------
// TR-101 removed every `vite preview` child from the GATE family, because a
// gate is a short-lived measurement and a server that outlives it is pure leak.
// This is the opposite requirement: the whole point is a server that outlives
// the script, because the owner looks at it hours later.
//
// The difference is not the lifetime, it is the BOOKKEEPING. A leaked gate
// server was untracked and unowned, so nothing could ever reclaim it, and they
// accumulated: fourteen processes and eighteen held ports by the end of one
// session. This one writes a pidfile and the NEXT run stops exactly what the
// PREVIOUS run started. One owner, one server, one record of it.
//
// WHAT IT WILL NOT DO, and each of these is a refusal rather than a best effort
// ----------------------------------------------------------------------------
//   - It will not run anywhere but the PRIMARY checkout. A linked worktree is
//     refused by inspection, not by convention, because multi-track rule 11
//     makes the primary checkout the integrator's alone and the owner's preview
//     belongs to it.
//   - It will not kill a process it did not start. The pidfile carries the pid
//     AND the process start time, and both must match before anything is
//     signalled: pids are recycled, and a script that guesses at processes
//     eventually kills someone else's.
//   - It will not touch a dirty tree. A hard sync would DISCARD uncommitted
//     work, so a dirty tree is reported in full and the run stops. Never
//     discard.
//   - It will not leave anything half-started. Any failure after the server is
//     spawned reaps it and clears the pidfile before exiting non-zero.
//
// USAGE
//   node scripts/owner_preview.mjs
//   node scripts/owner_preview.mjs --status        report, change nothing
//   node scripts/owner_preview.mjs --stop          stop the tracked instance
//   node scripts/owner_preview.mjs --adopt <pid>   record an existing server as
//                                                  the tracked instance, so the
//                                                  next run stops it properly
//   node scripts/owner_preview.mjs --self-test     convention (p): plant the
//                                                  address defects and require
//                                                  the refusal. Starts no server,
//                                                  changes no git state.
//
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, openSync, closeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import { createServer } from 'node:http'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..')
const FRONTEND = join(REPO, 'frontend')
const STATE_DIR = join(REPO, '.owner-preview')
const PIDFILE = join(STATE_DIR, 'preview.json')
const LOGFILE = join(STATE_DIR, 'preview.log')

const PORT = 5173                 // the port the owner already uses
const HOST = '0.0.0.0'            // bind on the LAN, not just loopback
const READY_TIMEOUT_MS = 90_000

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)

const say = (s = '') => console.log(s)
const loud = (s) => {
  console.error('')
  console.error('  ' + '!'.repeat(72))
  for (const line of String(s).split('\n')) console.error('  !! ' + line)
  console.error('  ' + '!'.repeat(72))
  console.error('')
}

const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf-8' }).trim()

// ── the designated checkout ──────────────────────────────────────────────────

/**
 * The primary checkout, or an explanation of why this one is not it.
 *
 * In the primary checkout `--git-dir` and `--git-common-dir` resolve to the same
 * place. In a linked worktree `--git-dir` is `.git/worktrees/<name>` while the
 * common dir is the original. That is the check, rather than a path allowlist,
 * because it stays true if the repository is ever moved or cloned.
 */
function checkPrimaryCheckout() {
  const top = git(['rev-parse', '--show-toplevel'])
  const gitDir = resolve(top, git(['rev-parse', '--git-dir']))
  const commonDir = resolve(top, git(['rev-parse', '--git-common-dir']))
  if (gitDir !== commonDir) {
    return { ok: false, why: `this is a linked WORKTREE (${top}).\n`
      + `Its git dir is ${gitDir}\nand the primary one is ${commonDir}.\n`
      + 'The owner preview belongs to the primary checkout alone, per multi-track rule 11.' }
  }
  if (resolve(top) !== REPO) {
    return { ok: false, why: `this script lives in ${REPO} but git reports the checkout root as ${top}.` }
  }
  return { ok: true, top }
}

// ── the tracked instance ─────────────────────────────────────────────────────

/** When a pid started, as the kernel reports it. Empty string when it is gone. */
function processStartedAt(pid) {
  try {
    return execFileSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

function processCommand(pid) {
  try {
    return execFileSync('ps', ['-o', 'command=', '-p', String(pid)], { encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

function readRecord() {
  if (!existsSync(PIDFILE)) return null
  try {
    const r = JSON.parse(readFileSync(PIDFILE, 'utf-8'))
    return (typeof r.pid === 'number' && typeof r.startedAt === 'string') ? r : null
  } catch {
    return null
  }
}

function writeRecord(rec) {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(PIDFILE, JSON.stringify(rec, null, 2) + '\n')
}

/**
 * Stop ONLY the instance this script previously started.
 *
 * THE FINGERPRINT IS THE POINT. A pid alone is not an identity: the kernel
 * recycles them, and a stale pidfile plus an unlucky reuse is how a script kills
 * a database. The record carries the process START TIME as the kernel reported
 * it at spawn, and both must still match before anything is signalled. If they
 * do not, the record is stale, it is discarded, and NOTHING is killed.
 */
function stopTracked() {
  const rec = readRecord()
  if (!rec) return { stopped: false, reason: 'no tracked instance' }

  const liveStart = processStartedAt(rec.pid)
  if (!liveStart) {
    rmSync(PIDFILE, { force: true })
    return { stopped: false, reason: `tracked pid ${rec.pid} is already gone` }
  }
  if (liveStart !== rec.startedAt) {
    rmSync(PIDFILE, { force: true })
    return {
      stopped: false,
      reason: `tracked pid ${rec.pid} is NOT our process any more `
        + `(started ${liveStart}, we recorded ${rec.startedAt}). The pid was recycled. `
        + 'Nothing was killed and the stale record has been discarded.',
    }
  }

  const cmd = processCommand(rec.pid)
  try { process.kill(rec.pid, 'SIGTERM') } catch { /* raced with its own exit */ }
  for (let i = 0; i < 40 && processStartedAt(rec.pid); i++) {
    try { execFileSync('sleep', ['0.1']) } catch { /* ignore */ }
  }
  if (processStartedAt(rec.pid)) {
    try { process.kill(rec.pid, 'SIGKILL') } catch { /* ignore */ }
    try { execFileSync('sleep', ['0.3']) } catch { /* ignore */ }
  }
  rmSync(PIDFILE, { force: true })
  return { stopped: true, pid: rec.pid, cmd }
}

// ── the version label ────────────────────────────────────────────────────────

/**
 * The kit generation this preview belongs to, read from the walkthrough's own
 * live section heading, which is kept current per kit by `kit_build.mjs`'s
 * derived cross-reference (TR-100).
 *
 * It names the GENERATION, not that this exact commit was kitted. The commit SHA
 * on the same line is the exact identity, and that is the field the owner is
 * asked to compare against the session report.
 */
function versionLabel() {
  // READ THE `VERSION` FILE, corrected 2026-07-30. This used to regex a version
  // number out of the walkthrough's live PART 9 HEADING, which is prose, and it
  // is the exact defect the same day's kit-naming change was made to remove: a
  // value that changes, derived from a place that is not its source.
  //
  // Its own comment already recorded the failure mode. When the heading style
  // moved from "THE FIRST PLAYER-VISIBLE VISIT (V8)" to "THE v9 VISIT", the
  // pattern silently degraded the label to a bare "main", and the quiet kind of
  // wrong is the dangerous kind: it still printed a line and the line still
  // looked fine. Widening the regex fixed that instance and left the design.
  //
  // `VERSION` is the same source `kit_build.mjs` and `vite.config.ts` read, so
  // the banner, the kit and the boot line cannot now disagree. Restructuring the
  // walkthrough can no longer change what the owner's preview claims to be.
  try {
    const n = Number(readFileSync(join(REPO, 'VERSION'), 'utf-8').trim())
    return Number.isInteger(n) && n > 0 ? `v${n} line, main` : 'main'
  } catch {
    return 'main'
  }
}

// ── steps ────────────────────────────────────────────────────────────────────

function lockHash() {
  const lock = join(FRONTEND, 'package-lock.json')
  if (!existsSync(lock)) return ''
  return createHash('sha256').update(readFileSync(lock)).digest('hex')
}

async function waitForReady(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(2500) })
      if (r.ok) return true
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

// ── the owner's actual address ───────────────────────────────────────────────
//
// THE DEFECT THIS REPLACED, recorded because it is convention (s) inside the one
// script that exists to serve rule 12's evidence. This line used to read:
//
//     + `  |  started ${startedAt}  |  http://192.168.4.92:${PORT}`
//
// A dotted quad written into an instruction. The host answered on .95 by the time
// anyone checked, so the owner's preview printed a green line pointing at an
// address that was nobody's. Nothing derived it and nothing probed it.
//
// TWO FAULTS, and the second is the one that matters:
//
//   1. The address was STORED rather than DERIVED. Convention (s): a value that
//      changes is never written into an instruction. A DHCP lease is the purest
//      possible example of a value that changes.
//   2. The address was never REACHED. Rule 12 already carries this lesson in its
//      own words, earned on this script's first run: PRINTING A URL IS NOT
//      EVIDENCE THE URL WORKS. The readiness probe below answers on 127.0.0.1,
//      which proves the server is alive but proves NOTHING about the LAN address
//      the owner actually types. Loopback was checked; the printed address was
//      not. Deriving it correctly and still not probing it would fix the stale
//      quad and leave the unevidenced claim.
//
// So the address is now derived at print time AND fetched before it is printed,
// and a line that could not be reached is refused rather than printed.

/**
 * Every non-internal IPv4 address this host has, in a stable order.
 *
 * Sorted by interface name then address so two runs on an unchanged machine
 * derive the same candidate first. An unsorted walk of networkInterfaces() is
 * insertion-ordered by the OS, which is stable in practice and not by contract,
 * and a preview address that reorders between runs is a support question.
 */
function lanCandidates() {
  const found = []
  const ifaces = networkInterfaces()
  for (const iface of Object.keys(ifaces)) {
    for (const ni of ifaces[iface] || []) {
      // Node reports family as 'IPv4' on current releases and as 4 on some older
      // ones. Accept both rather than pinning to whichever this machine happens
      // to return, because the owner's machine is not this machine.
      if (ni.family !== 'IPv4' && ni.family !== 4) continue
      if (ni.internal) continue
      found.push({ iface, address: ni.address })
    }
  }
  found.sort((a, b) => a.iface.localeCompare(b.iface) || a.address.localeCompare(b.address))
  return found
}

/** True when the URL answered. Any failure at all is a false, never a throw. */
async function probeUrl(url, timeoutMs = 2000) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    return r.ok
  } catch {
    return false
  }
}

/**
 * The first candidate address that actually ANSWERS on the port, with the full
 * record of what was tried so a refusal can explain itself.
 *
 * It keeps going past a failure deliberately. A machine with a VPN or a docker
 * bridge up has several non-internal IPv4 addresses and only some of them are on
 * the network the owner's laptop is on; stopping at the first miss would refuse a
 * preview that was working fine on the second interface.
 *
 * `probe` is injectable so the self-test below drives the REAL resolver rather
 * than a copy of it. A self-test that exercises a reimplementation of the
 * predicate proves nothing about the predicate, which is the trap convention (p)
 * exists to close.
 */
async function resolveOwnerAddress(candidates, port, probe = probeUrl) {
  const tried = []
  for (const c of candidates) {
    const url = `http://${c.address}:${port}/`
    const ok = await probe(url)
    tried.push({ iface: c.iface, address: c.address, url, ok })
    if (ok) return { ok: true, address: c.address, url, iface: c.iface, tried }
  }
  return { ok: false, address: null, url: null, iface: null, tried }
}

/**
 * Occurrences of a hardcoded dotted-quad address in a source text.
 *
 * This is the regression guard for the exact defect that shipped, and the
 * self-test seeds the literal line that shipped rather than a paraphrase of it.
 * Loopback and the RFC 5737 documentation ranges are exempt: 127.0.0.1 is the
 * readiness probe and is correct, and 192.0.2.x is what the seeds themselves use.
 */
function hardcodedAddressFindings(source) {
  const findings = []
  const re = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g
  const lines = String(source).split('\n')
  lines.forEach((line, i) => {
    // Only flag an address that is being BUILT INTO A URL, which is the defect.
    // A dotted quad in prose is a record of what happened and history does not
    // go stale; convention (s) is about instructions, not about records.
    if (!/http:\/\//.test(line)) return
    re.lastIndex = 0
    let m
    while ((m = re.exec(line)) !== null) {
      const quad = m[0]
      if (quad === '127.0.0.1') continue
      if (quad.startsWith('192.0.2.')) continue
      if (/^\s*\/\/|^\s*\*|^\s*#/.test(line)) continue
      findings.push({ line: i + 1, quad, text: line.trim() })
    }
  })
  return findings
}

function statusLine(sha, commitDate, startedAt, ownerUrl) {
  return `OWNER PREVIEW  |  ${versionLabel()}  |  commit ${sha}  |  built ${commitDate}`
    + `  |  started ${startedAt}  |  ${ownerUrl}`
}

// ── the seeded self-test, convention (p) ─────────────────────────────────────
//
// A preview line that has never been seen to FAIL is the same class of
// unevidenced claim as a gate that has never gone RED. This plants the defect in
// the form it really occurred and requires the refusal.
//
// Every seed drives the REAL functions above. Nothing here reimplements the
// predicate, because a self-test over a copy of the logic is the failure mode
// convention (p) was written about: the dash gate was widened, declared closed,
// and was still wrong, and a seeded violation would have exposed that in one run.
//
// Paired controls throughout: a seed that goes red proves nothing unless the
// control that must stay green does.

/** A throwaway HTTP server on loopback, so a control can be genuinely reachable. */
function scratchServer() {
  return new Promise((res) => {
    const srv = createServer((_req, r) => { r.writeHead(200); r.end('ok') })
    srv.listen(0, '127.0.0.1', () => res({ port: srv.address().port, close: () => srv.close() }))
  })
}

async function selfTest() {
  const results = []
  const check = (name, pass, detail) => {
    results.push({ name, pass, detail })
    say(`  ${pass ? 'pass' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  }

  say('OWNER PREVIEW SELF-TEST')
  say('')

  const live = await scratchServer()

  // SEED 1: the defect in the form it really occurs. An address that is derived
  // or written down but does not answer. 192.0.2.1 is RFC 5737 TEST-NET-1 and is
  // guaranteed never to be routable, so this seed cannot pass by accident on
  // somebody's network.
  const seed1 = await resolveOwnerAddress([{ iface: 'seed0', address: '192.0.2.1' }], live.port)
  check('SEED unreachable address is REFUSED, not printed', seed1.ok === false,
    `tried ${seed1.tried.length}, ok=${seed1.ok}`)

  // CONTROL 1: the same real resolver, over an address that genuinely answers.
  // Without this, SEED 1 would also pass if the resolver simply always refused.
  const ctl1 = await resolveOwnerAddress([{ iface: 'lo-seed', address: '127.0.0.1' }], live.port)
  check('CONTROL reachable address is ACCEPTED', ctl1.ok === true && ctl1.address === '127.0.0.1',
    `url=${ctl1.url}`)

  // SEED 2: no non-internal interface at all, which is a laptop with the wifi
  // off. The old code printed its stored quad regardless.
  const seed2 = await resolveOwnerAddress([], live.port)
  check('SEED no candidate addresses is REFUSED', seed2.ok === false, `tried ${seed2.tried.length}`)

  // CONTROL 2: a bad candidate ahead of a good one. Proves the resolver does not
  // stop at the first miss, which would refuse a working preview on a host with
  // a VPN or a docker bridge up.
  const ctl2 = await resolveOwnerAddress(
    [{ iface: 'seed0', address: '192.0.2.1' }, { iface: 'lo-seed', address: '127.0.0.1' }], live.port)
  check('CONTROL a later candidate is still reached', ctl2.ok === true && ctl2.address === '127.0.0.1',
    `tried ${ctl2.tried.length}, chose ${ctl2.address}`)

  // SEED 3: THE LINE THAT ACTUALLY SHIPPED, planted verbatim. This is the
  // convention (p) requirement in its strictest form: seed the form that really
  // occurred, not a form the check happens to handle.
  //
  // THE QUAD IS ASSEMBLED FROM PARTS, AND THAT IS DELIBERATE. Do not tidy it back
  // into one literal. Written literally, this seed IS a hardcoded address in this
  // file, so CONTROL 3 below would find it and go red for the seed rather than for
  // a defect. The alternative was an allowlist exempting the seed's own line, and
  // an exemption mechanism is a way to silence a real finding later. Assembling it
  // means CONTROL 3 keeps ZERO exceptions while the string handed to the predicate
  // is still byte-identical to the line that shipped, which is the only property
  // convention (p) actually cares about: the predicate must meet the real form.
  const shippedQuad = ['192', '168', '4', '92'].join('.')
  const shippedDefect = 'function statusLine(sha, commitDate, startedAt) {\n'
    + '  return `OWNER PREVIEW  |  ${versionLabel()}  |  commit ${sha}  |  built ${commitDate}`\n'
    + '    + `  |  started ${startedAt}  |  http://' + shippedQuad + ':${PORT}`\n'
    + '}\n'
  const seed3 = hardcodedAddressFindings(shippedDefect)
  check('SEED the shipped hardcoded quad is CAUGHT', seed3.length >= 1,
    seed3.length ? `found ${seed3[0].quad} at seeded line ${seed3[0].line}` : 'found nothing')

  // CONTROL 3: this file as it stands now. If this ever goes red, the address has
  // been written back into the source and the whole repair has been undone.
  const selfSource = readFileSync(fileURLToPath(import.meta.url), 'utf-8')
  const ctl3 = hardcodedAddressFindings(selfSource)
  check('CONTROL this script carries no hardcoded quad', ctl3.length === 0,
    ctl3.length ? `${ctl3.length} at line(s) ${ctl3.map((f) => f.line).join(', ')}` : 'clean')

  // CONTROL 4: the derivation is real and excludes loopback. Asserted as a
  // property rather than against a count, because a runner with no LAN interface
  // legitimately derives an empty list and that must not be a failure.
  const cands = lanCandidates()
  const anyInternal = cands.some((c) => c.address.startsWith('127.'))
  check('CONTROL derived candidates exclude loopback', anyInternal === false,
    `${cands.length} candidate(s): ${cands.map((c) => `${c.iface}=${c.address}`).join(', ') || 'none'}`)

  live.close()

  const failed = results.filter((r) => !r.pass)
  say('')
  say(`OWNER PREVIEW SELF-TEST: ${failed.length ? 'FAIL' : 'PASS'} `
    + `(${results.length - failed.length}/${results.length}, 3 seeds, 4 paired controls)`)
  return failed.length === 0
}

// ── main ─────────────────────────────────────────────────────────────────────
;(async () => {
  // --self-test runs FIRST and before the primary-checkout refusal, because it
  // starts no server, touches no git state and reads only this file. It has to be
  // runnable from a worktree and from CI, which is where a self-test earns its
  // keep; gating it behind the primary-checkout check would make the one mode
  // that proves the script can fail the one mode most callers cannot run.
  if (has('--self-test')) {
    process.exit((await selfTest()) ? 0 : 1)
  }

  const primary = checkPrimaryCheckout()
  if (!primary.ok) {
    loud('OWNER PREVIEW REFUSED\n\n' + primary.why)
    process.exit(1)
  }

  // --adopt: take ownership of a server that is already running, so the normal
  // stop path can retire it on the next run. Used once, to fold in a dev server
  // that predates this script.
  if (has('--adopt')) {
    const pid = Number(argv[argv.indexOf('--adopt') + 1])
    if (!Number.isInteger(pid) || pid <= 0) {
      loud('OWNER PREVIEW: --adopt needs a pid, for example --adopt 24622')
      process.exit(1)
    }
    const startedAt = processStartedAt(pid)
    if (!startedAt) {
      loud(`OWNER PREVIEW: pid ${pid} is not running, so there is nothing to adopt.`)
      process.exit(1)
    }
    writeRecord({ pid, startedAt, cmd: processCommand(pid), port: PORT, adopted: true,
                  adoptedAt: new Date().toISOString() })
    say(`adopted pid ${pid} as the tracked owner preview`)
    say(`  ${processCommand(pid)}`)
    say('  the next run will stop it the same way it stops its own.')
    process.exit(0)
  }

  if (has('--status')) {
    const rec = readRecord()
    if (!rec) { say('owner preview: nothing tracked'); process.exit(0) }
    const live = processStartedAt(rec.pid)
    const same = live && live === rec.startedAt
    say(`owner preview: pid ${rec.pid}, ${same ? 'RUNNING' : 'not ours any more (stale record)'}`)
    if (same) say(`  ${rec.cmd || processCommand(rec.pid)}`)
    process.exit(0)
  }

  if (has('--stop')) {
    const r = stopTracked()
    say(r.stopped ? `stopped tracked owner preview, pid ${r.pid}` : `nothing stopped: ${r.reason}`)
    process.exit(0)
  }

  say('OWNER PREVIEW')
  say(`  checkout ${primary.top}`)

  // 1. STOP the previous instance, and only that one.
  const stop = stopTracked()
  say(stop.stopped
    ? `  stopped the previous preview, pid ${stop.pid}`
    : `  nothing to stop: ${stop.reason}`)

  // 2. REFUSE a dirty tree. Reported in full, never discarded.
  const dirty = git(['status', '--porcelain'])
  if (dirty) {
    loud('OWNER PREVIEW REFUSED: the checkout has uncommitted changes.\n\n'
      + 'A hard sync to origin/main would DISCARD them, so nothing was done.\n'
      + 'Commit, stash or clean these first, then run it again:\n\n'
      + dirty.split('\n').map((l) => '    ' + l).join('\n'))
    process.exit(1)
  }

  // 2b. REFUSE UNPUSHED COMMITS. Added 2026-07-30 after this script DESTROYED
  // FOUR COMMITTED-BUT-UNPUSHED COMMITS, recovered only from the reflog.
  //
  // The dirty-tree guard above was written believing "committed" meant "safe".
  // It does not. Step 3 runs `git reset --hard origin/main`, and a commit that
  // exists only locally is discarded by that just as surely as an uncommitted
  // edit, while passing the check above in silence.
  //
  // Rule 12 makes every session run this at close, so the one command the
  // protocol MANDATES at the most dangerous moment of a session was the one
  // that could eat its work.
  //
  // The comparison is made deliberately BEFORE the fetch, against the last
  // known origin/main: a remote that has moved ahead cannot then mask local
  // commits, and being wrong in the direction of refusing is free while being
  // wrong the other way costs work.
  //
  // The fix is a guard rather than a line in the protocol telling people to
  // push first. A prompt is a request; a path is a guarantee.
  const unpushed = git(['rev-list', 'origin/main..HEAD'])
  if (unpushed) {
    const shas = unpushed.split('\n').filter(Boolean)
    loud(`OWNER PREVIEW REFUSED: ${shas.length} commit(s) here are not on origin/main.\n\n`
      + 'The sync below is `git reset --hard origin/main`, which would DESTROY them.\n'
      + 'They are committed rather than dirty, so the check above cannot see them.\n\n'
      + shas.map((sha) => '    ' + git(['log', '-1', '--oneline', sha])).join('\n')
      + '\n\nPush first, then run it again. If you meant to discard them, do that\n'
      + 'explicitly with git rather than through a preview script.')
    process.exit(1)
  }

  // 3. FETCH and hard-sync to origin/main.
  const before = git(['rev-parse', 'HEAD'])
  const beforeLock = lockHash()
  say('  fetching origin')
  try {
    execFileSync('git', ['fetch', '--quiet', 'origin', 'main'], { cwd: REPO, stdio: 'inherit' })
  } catch {
    loud('OWNER PREVIEW FAILED: could not fetch origin. Nothing was changed and nothing started.')
    process.exit(1)
  }
  const target = git(['rev-parse', 'origin/main'])
  if (target !== before) {
    say(`  syncing ${before.slice(0, 8)} to ${target.slice(0, 8)}`)
    try {
      execFileSync('git', ['checkout', '--quiet', 'main'], { cwd: REPO, stdio: 'inherit' })
      execFileSync('git', ['reset', '--hard', '--quiet', 'origin/main'], { cwd: REPO, stdio: 'inherit' })
    } catch {
      loud('OWNER PREVIEW FAILED: the sync to origin/main did not complete. Nothing started.')
      process.exit(1)
    }
  } else {
    say('  already at origin/main')
  }

  // 4. INSTALL only when the lockfile actually moved.
  if (lockHash() !== beforeLock || !existsSync(join(FRONTEND, 'node_modules'))) {
    say('  lockfile changed (or node_modules missing), running npm ci')
    try {
      execFileSync('npm', ['ci', '--ignore-scripts'], { cwd: FRONTEND, stdio: 'inherit' })
    } catch {
      loud('OWNER PREVIEW FAILED: npm ci did not complete. Nothing started.')
      process.exit(1)
    }
  } else {
    say('  dependencies unchanged')
  }

  // 5. START, bound to the LAN on the fixed port.
  //
  // TWO THINGS HERE ARE DELIBERATE AND BOTH WERE LEARNED THE HARD WAY ON THE
  // FIRST RUN, when the server came up, answered the readiness probe, and then
  // DIED the moment this script exited.
  //
  // (a) STDIO GOES TO A FILE, NOT A PIPE. A detached child whose stdout is a
  //     pipe to its parent gets that pipe closed when the parent exits, and the
  //     next write kills it. The log file is an fd the child owns outright, so
  //     it survives, and it is also where a failed start's output is read from.
  // (b) VITE IS SPAWNED DIRECTLY, NOT THROUGH `npm run dev`. `npm` would be the
  //     tracked pid while the real server sat underneath it, which is exactly
  //     the wrapper-orphans-the-child shape TR-101 was about. The pid in the
  //     pidfile is now the server itself.
  mkdirSync(STATE_DIR, { recursive: true })
  const logFd = openSync(LOGFILE, 'w')
  const viteBin = join(FRONTEND, 'node_modules', '.bin', 'vite')
  if (!existsSync(viteBin)) {
    loud(`OWNER PREVIEW FAILED: ${viteBin} is missing. Run npm ci in frontend/ and try again.`)
    process.exit(1)
  }
  const child = spawn(viteBin, ['--host', HOST, '--port', String(PORT), '--strictPort'], {
    cwd: FRONTEND, detached: true, stdio: ['ignore', logFd, logFd],
  })
  child.unref()
  closeSync(logFd)
  const readLog = () => { try { return readFileSync(LOGFILE, 'utf-8') } catch { return '' } }

  const startedAt = processStartedAt(child.pid)
  writeRecord({ pid: child.pid, startedAt, cmd: `vite dev --host ${HOST} --port ${PORT}`,
                port: PORT, startedIso: new Date().toISOString() })

  say(`  starting dev server on ${HOST}:${PORT}, pid ${child.pid}`)
  const ready = await waitForReady(`http://127.0.0.1:${PORT}/`, READY_TIMEOUT_MS)

  if (!ready) {
    // NOTHING HALF-STARTED. Reap what was spawned before reporting the failure,
    // so a failed run leaves the machine exactly as it found it.
    stopTracked()
    loud(`OWNER PREVIEW FAILED: the dev server did not answer on port ${PORT} `
      + `within ${READY_TIMEOUT_MS / 1000}s.\n`
      + 'It has been stopped, so nothing is half-started.\n'
      + `Its output is in ${LOGFILE}\n\n`
      + readLog().split('\n').slice(-12).map((l) => '    ' + l).join('\n'))
    process.exit(1)
  }

  const sha = git(['rev-parse', '--short', 'HEAD'])
  const commitDate = git(['show', '-s', '--format=%cI', 'HEAD'])

  // 6. REACH THE OWNER'S ACTUAL ADDRESS BEFORE CLAIMING IT.
  //
  // The readiness probe above answered on 127.0.0.1, which proves the server is
  // alive. It proves nothing about the address the owner types into his browser,
  // and those are different claims: a bind that did not reach the LAN, a firewall,
  // a changed lease and a wrong interface all leave loopback perfectly healthy.
  const owner = await resolveOwnerAddress(lanCandidates(), PORT)

  if (!owner.ok) {
    // REFUSE THE LINE, KEEP THE SERVER.
    //
    // Not a contradiction of the no-half-started rule above, and the distinction
    // is worth writing down because the obvious "fix" is to reap here and it
    // would be wrong. Half-started meant spawned, unrecorded and not answering.
    // This server is spawned, RECORDED in the pidfile and ANSWERING; the next run
    // retires it exactly as it retires any other. What failed is not the server,
    // it is the EVIDENCE, so the evidence is what is withheld.
    //
    // Non-zero is deliberate. Rule 12 requires a session that could not refresh
    // the preview to say so in its own line, and the only reliable way to make
    // that happen is for the command to fail rather than to print a caveat that
    // a hurried close would paste over.
    const tried = owner.tried.length
      ? owner.tried.map((t) => `    ${t.iface.padEnd(10)} ${t.url}  no answer`).join('\n')
      : '    (this host reports no non-internal IPv4 address at all)'
    loud('OWNER PREVIEW: NO ADDRESS LINE PRINTED, because none could be reached.\n\n'
      + `The server IS up and answering on http://127.0.0.1:${PORT}/, and it has been\n`
      + 'left running and tracked, so nothing is half-started and the next run will\n'
      + 'retire it normally.\n\n'
      + 'What was derived and probed:\n\n' + tried + '\n\n'
      + 'Printing a URL is not evidence the URL works, so no URL was printed.\n'
      + 'Per rule 12 the session report states in its own line that the preview\n'
      + 'address could not be confirmed.')
    process.exit(1)
  }

  say('')
  say(statusLine(sha, commitDate, new Date().toISOString(), owner.url))
  say(`  address derived from interface ${owner.iface} and confirmed reachable `
    + `(${owner.tried.length} candidate${owner.tried.length === 1 ? '' : 's'} probed)`)
  say('')
  process.exit(0)
})()
