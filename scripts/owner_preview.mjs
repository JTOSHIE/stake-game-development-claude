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
//
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, openSync, closeSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

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
  try {
    const doc = readFileSync(join(REPO, 'docs/records/upload-kit/00_READ_ME_FIRST.md'), 'utf-8')
    const live = [...doc.matchAll(/^# PART 9[a-z]?:([^\n]*)$/gm)]
      .filter((m) => !/SUPERSEDED/i.test(m[1]))
    // Matches `(V8)` and `v9` alike. The heading style changed from
    // "THE FIRST PLAYER-VISIBLE VISIT (V8)" to "THE v9 VISIT" and the
    // parenthesised-only pattern silently degraded the label to a bare "main",
    // which is the quiet kind of wrong: it still printed a line, and the line
    // still looked fine.
    const v = live.length === 1 ? /\bv(\d+)\b/i.exec(live[0][1]) : null
    return v ? `v${v[1]} line, main` : 'main'
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

function statusLine(sha, commitDate, startedAt) {
  return `OWNER PREVIEW  |  ${versionLabel()}  |  commit ${sha}  |  built ${commitDate}`
    + `  |  started ${startedAt}  |  http://192.168.4.92:${PORT}`
}

// ── main ─────────────────────────────────────────────────────────────────────
;(async () => {
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

  say('')
  say(statusLine(sha, commitDate, new Date().toISOString()))
  say('')
  process.exit(0)
})()
