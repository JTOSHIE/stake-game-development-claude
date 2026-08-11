# frontend/scripts: gates and proofs

Every gate and headless proof for the shipped frontend lives here. This file
documents the RUNNER and the EXIT CONTRACT, because both have now been earned
the hard way (TR-123). Australian English, no em dashes or en dashes.

## The runner is `npx tsx`, from `frontend/`

```
npx tsx scripts/<gate>.mjs               the real run
npx tsx scripts/<gate>.mjs --self-test   convention (p) seeded self-test
```

tsx and not node, for one reason with two halves: several gates evaluate the
LIVE TypeScript modules the app itself uses (`kit_basis_gate.mjs` imports the
locale tables, `social_dom_conformance.mjs` imports
`src/lib/i18n/vocabulary.ts`, `locale_prose_conformance.mjs` evaluates the
locale modules), and plain `node` cannot load those imports on the Node 22 CI
runner; and a family that documents ONE runner cannot drift into the class
where a script's header says `node`, its import list says otherwise, and the
first person to notice is a CI leg (that is precisely how social_dom and
social_string carried a never-existed import to 2026-08-10 unseen: nothing ran
them). Scripts with no TypeScript import run identically under tsx, so the
uniform run line costs nothing.

`.github/workflows/checks.yml` is the wiring truth: which gates run in CI, in
which job, with which flags. This file deliberately carries no wired-gate
count, per convention (s); read the count from the workflow.

## The exit contract (TR-123, closed 2026-08-11)

Every gate and proof here:

- exits 0 on PASS, non-zero on FAIL, and TERMINATES;
- kills anything it spawned (dev server, browser) as a process group, and
  makes its final exit explicitly, because a surviving vite grandchild holds
  the parent open on inherited pipes after the verdict has already printed.
  That lingering-handle class kept three finished proofs out of CI for two
  weeks: they printed PASS and never exited, so nothing could wire them.

The four runners TR-123 named, now all under this contract and CI-wired:

| Script | Seeded self-test plants |
|---|---|
| `kit_basis_gate.mjs` | a superseded basis phrase in a built asset, and en-form figures in comma-decimal locales |
| `popout_conformance.mjs` | the Continue button forced outside the 400x225 viewport, the exact R14 defect |
| `social_dom_conformance.mjs` | a prohibited term from the app's own vocabulary table, rendered visible in the social DOM |
| `social_string_conformance.mjs` | the word Buy inside the social feature menu cards |

The three browser proofs' self-tests re-invoke the gate with
`FS_SEED_VIOLATION=1` in a child process and demand BOTH the red verdict AND a
real non-zero exit within a timeout. That second demand is deliberate: it is
the exit contract itself under permanent guard, so a reintroduced hang fails
the self-test rather than hanging a CI leg.

## Ports, environment, durations

- Most gates and proofs bind an EPHEMERAL free port each (they ask the OS via
  a throwaway listener), so they cannot collide and parallelise cleanly.
- The two exceptions share FIXED port 4541 and must NEVER run concurrently:
  `r043_settle_failure_proof.mjs` and `r042_wording_proof.mjs` (VERIFIED by
  direct read of both `const PORT = 4541` lines, 2026-08-11).
- `FS_SEED_VIOLATION=1` makes a TR-123 gate run with its violation planted, so
  the invocation must FAIL and exit non-zero; this is what the self-tests
  spawn, and it is the deliberately failing invocation convention (p) asks a
  session report to show.
- `FS_WRITE_EVIDENCE=1` opts a run into writing committed evidence
  (convention h.1, below). Leave it unset for every plain run.
- Durations, measured locally 2026-08-11 on the owner's machine as a dated
  record rather than a promise: kit_basis about 5s, popout about 20s,
  social_string about 20s, social_dom about 56s for the full walk. CI runner
  contention multiplies these; judge a leg against the range in CLAUDE.md
  protocol rule 10.

## The preview language parameter is `lang`

`parseSessionParams` reads the locale from the `lang` query parameter
(`src/lib/services/rgsService.ts:531`, default `en`). Every play-test or
evidence drive selects its locale that way and no other:

```
http://127.0.0.1:<port>/?sessionID=<id>&rgs_url=<rgs>&lang=de
```

Recorded per R047 TASK 7 so no future play-test instruction gets it wrong
again.

## Evidence paths (convention h.1)

Gates write reports and screenshots to the gitignored scratch tree via
`lib/evidencePaths.mjs` by default. Committed evidence under `reports/` is
regenerated only when a job that says so sets `FS_WRITE_EVIDENCE=1`. A plain
local run must never dirty committed evidence.
