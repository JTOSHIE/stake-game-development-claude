Set up the WRS workflow conventions on a new branch claude/workflow-setup from up-to-date main:

1. Create .claude/settings.json with exactly:
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(git status*)", "Bash(git add *)", "Bash(git commit *)", "Bash(git push*)",
      "Bash(git checkout *)", "Bash(git pull*)", "Bash(git fetch*)", "Bash(git diff*)",
      "Bash(git log*)", "Bash(git branch*)", "Bash(git rm *)", "Bash(git show*)",
      "Bash(npm *)", "Bash(npx *)", "Bash(node *)",
      "Bash(python3 *)", "Bash(pip *)", "Bash(pip3 *)",
      "Bash(ffmpeg *)", "Bash(ffprobe *)", "Bash(shasum *)",
      "Bash(ls*)", "Bash(cat *)", "Bash(cp *)", "Bash(mkdir *)", "Bash(grep *)",
      "Bash(find *)", "Bash(du *)", "Bash(head *)", "Bash(tail *)", "Bash(wc *)",
      "Bash(diff *)", "Bash(sed *)", "Bash(brew install *)", "Bash(gh *)",
      "WebFetch(domain:stake-engine.com)"
    ],
    "ask": ["Bash(rm *)"],
    "deny": [
      "Edit(frontend/src/lib/services/rgsService.ts)",
      "Write(frontend/src/lib/services/rgsService.ts)",
      "Edit(frontend/src/lib/stores/gameStore.ts)",
      "Write(frontend/src/lib/stores/gameStore.ts)",
      "Edit(games/future_spinner/**)",
      "Write(games/future_spinner/**)",
      "Bash(git push * --force*)",
      "Bash(sudo *)"
    ]
  }
}

2. Rewrite CLAUDE.md so it is fully current, keeping it concise. It must state:
the locked files (also machine-enforced by the deny rules above, with
owner-sanctioned exceptions granted only via .claude/settings.local.json for that
session); the integer micros rule; the TRUE game facts (scatter 1x/3x/10x instant
multiplier, base game only, single mode, RTP 96.3500% at 4dp, hit rate 33.5724%,
max 5,000x, volatility 16.23x, scatter trigger 6.37%, scatter average 97.6x);
Manus is retired and all assets are produced in-house from vector masters via the
asset pipeline; the theme selector is dev-only in production; and a Session
Conventions section: (a) at the end of every session write
reports/SESSION_REPORT.md summarising what ran, what changed, verification
results and anything needing owner attention, copy it to
reports/archive/<date>_<topic>.md, and commit and push both; (b) when executing a
pasted brief, first save it verbatim as its named prompt file in the repo root
and include it in the session's commits; (c) status doc still copies to
~/Desktop/; (d) periodically refresh the live Stake Engine docs pages
(approval-guidelines, jurisdiction-requirements, quality rankings, changelog,
bet-replay) via the headless browser into docs/stake-engine-live/ and update
COMPLIANCE_WATCH.md with any differences found.

3. Create reports/ with a short README, and create COMPLIANCE_WATCH.md seeded
with: build verified against current requirements (stateless, no prohibited
features, original IP, no Stake branding); portal Developer Testing Tool to be
used post-upload; upcoming platform features noted: provably fair and stateful
games. Then perform the first headless-browser docs refresh per convention (d).

4. Generate CLAUDE_PROJECT_INSTRUCTIONS_v5.md in the repo root: a full rewrite of
the v4 operating manual reflecting the actual current state, derived from the
repo plus these decisions: canonical base-only maths package merged and verified
(bonus mode removed, PAR regenerated, no reviewer notes needed); scatter is
1x/3x/10x everywhere; Manus retired, replaced by the in-house vector design
system (SVG masters in repo, deterministic exact-size rendering via an asset
pipeline, front-facing text-free symbols, engine-and-skin architecture where
future games are new skin packages through the same pipeline); approved symbol
lineup H1 Spinning Rim, H2 Boost Gauge, M1 Steering Wheel, M2 Gear, M3 Headlight,
L1 Lug Nut, L2 Spark Plug, L3 Piston; WRS brand layer to be specified in the
design system; pass sequence remaining: AssetForge v2 (after design batch
approvals), Motion Polish v2, Build Diet v2, then submission with the portal
Developer Testing Tool and live RGS check; the workflow conventions from item 2;
Australian English, metric, no em or en dashes anywhere. Mark v4 as superseded.

5. Write reports/SESSION_REPORT.md for this session, commit everything, push,
and open a PR into main titled "Workflow conventions: permissions, session
reports, compliance watch, v5 operating manual" (if gh is not authenticated,
print the branch name and stop; the owner will create the PR from the GitHub
app).
