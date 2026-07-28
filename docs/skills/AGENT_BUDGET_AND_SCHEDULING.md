# AGENT BUDGET AND SCHEDULING

**How to forecast an autonomous session: what an agent costs, how long it runs, how many
you can afford, and when to stop launching them.**

Written 2026-07-29 from the measured figures of the stream test recovery session, which
ran 93 agents across 8 workflow runs and spent roughly a whole five hour allowance. Owner
ordered, so that a work order can be written against a budget rather than against hope.

Australian English, metric, no em dashes or en dashes.

Companion to `FULL_AUDIT_METHOD.md`, which owns what an audit DOES. This document owns
what it COSTS.

---

## 0. The one paragraph version

An agent's cost is almost perfectly predictable from one number: **how many distinct
artefacts you tell it to open.** Across 36 agents in three independent runs the spend was
**183,380 tokens per agent with a 1.6 per cent spread**, because every agent was given
the same shaped job. Cost is `15,000 + artefacts x 4,700` tokens and duration is
`artefacts x 80` seconds. The dangerous number is not the agent, it is the
**verification multiplier**: verifying what one discovery agent finds costs about **5.7
times what the discovery agent itself cost**, so a wave sized to fit the budget will
produce a findings list that does not. Budget backwards from verification, not forwards
from discovery.

---

## 1. The measured base, from this session

Three runs completed and reported usage. These are cited, not estimated.

| Run | Agents | Tokens | Tokens per agent | Tool calls | Calls per agent | Tokens per call | Wall clock |
|---|---|---|---|---|---|---|---|
| Composition remainder | 7 | 1,318,122 | 188,303 | 457 | 65.3 | 2,884 | 54.6 min |
| Typography | 16 | 2,912,044 | 182,002 | 1,288 | 80.5 | 2,261 | 91.8 min |
| Motion, localisation, voice | 13 | 2,371,525 | 182,425 | 905 | 69.6 | 2,620 | 80.8 min |
| **Total** | **36** | **6,601,691** | **183,380** | **2,650** | **73.6** | **2,491** | |

**The spread on tokens per agent is 1.6 per cent across three independent runs.** That is
the single most useful fact in this document. It is not a coincidence and it is not luck:
every agent was given one lens and one half session, so every agent opened about the same
number of artefacts. **Uniform job shape gives uniform cost, and uniform cost is what
makes forecasting possible.** A wave of mixed-size agents cannot be forecast; a wave of
same-size agents can be forecast to within a couple of per cent.

Each agent in these runs was given: 26 frame images, plus about 4 orientation documents,
plus about 6 source files located during its second pass. Call that **36 artefacts**.

---

## 2. The two equations

### 2.1 Cost

```
tokens per agent  =  15,000  +  (artefacts x 4,700)
```

Check against measurement: `15,000 + 36 x 4,700 = 184,200` against a measured 183,380.
Within 0.5 per cent.

The 15,000 is fixed overhead: the system prompt, the squad preamble, the orientation
reads, the closing `git status`. **You pay it once per agent no matter how small the
agent is**, which is why splitting work too finely is wasteful. Two agents of 18
artefacts cost 199,200 against one agent of 36 artefacts at 184,200: the split costs
15,000 tokens.

The 4,700 per artefact is not the artefact's own size. A 1200x675 frame is only about
1,100 tokens of image data. The rest is what the agent DOES with it: the thinking it
generates about that artefact, the tool result envelope, and the output it eventually
writes. **Roughly a quarter of the marginal cost is the thing you opened and three
quarters is the model reasoning about it.** That ratio is why a cheaper model is not four
times cheaper on this kind of work, and why reasoning effort is a bigger cost lever than
input size.

### 2.2 Time

```
tool calls per agent  =  artefacts x 2      (measured 73.6 calls for 36 artefacts)
duration              =  tool calls x latency
latency               =  35 s per call solo, 50 s per call under heavy concurrency
duration              =  artefacts x 80 s   (using the contended figure)
```

Check: `36 x 80 = 2,880 s = 48 minutes`, against measured agent durations of 40 to 55
minutes. Good.

The multiplier of 2 on tool calls is real and worth knowing: an agent given 36 artefacts
made 74 calls, not 36. The extra calls are the greps, the `sed` ranges, the re-checks and
the two shard writes. **Assume every artefact you name costs two tool calls, not one.**

---

## 3. Why these agents ran for 45 minutes when a normal agent runs for 10

Four compounding reasons, in order of size.

1. **Tool call count, which is the whole story.** A typical agent that finishes in 10
   minutes makes 15 to 20 tool calls. These made 65 to 80. Four times the calls, four
   times the clock. Nothing exotic is happening; the agents were simply given four times
   as much to open.

2. **Per call latency is 35 to 50 seconds, not 5.** This is Opus with extended thinking
   carrying a large and growing context. Each call is a full model turn that reasons
   before and after the tool result. A cheap agent on small context turns in 5 to 10
   seconds. **The latency is a property of the model tier and the context size, not of
   the tool.**

3. **Concurrency contention, about a 40 per cent penalty.** I ran three workflows at
   once, roughly 30 agents in flight. Per call latency rose from about 35 seconds to
   about 50. This is the same lesson `CLAUDE.md` already records for CI: seven concurrent
   gate jobs each ran slower than they do alone, and parallelism on a shared resource does
   not divide cleanly. **20 agents in flight is the sweet spot; 30 works but you pay
   about 40 per cent on latency.**

4. **Images specifically.** A frame is one tool call whose payload never leaves the
   agent's context. Text can be read with a bounded `sed` range; an image cannot be read
   partially. Image heavy agents are therefore both the slowest and the ones that die.

### The death threshold, measured rather than guessed

- **26 images per agent: 36 of 36 agents survived.**
- **52 images per agent: 3 agents died** after opening every frame and before writing
  anything, losing everything they had seen.

So the rule is: **cap an image heavy agent at about 30 images and about 40 artefacts.**
For text only agents the ceiling is higher because reads can be bounded, but the same
80 to 90 tool call figure is where risk starts.

---

## 4. The verification multiplier, which is the number that ruins plans

This is the finding that explains why this session could not finish, and it generalises.

- Discovery agents produced **540 findings from 36 agents**, so **15 findings per agent**.
- A verifier opens one finding plus three to five files, about 8 artefacts, so
  `15,000 + 8 x 4,700 = 52,600`. The recorded figure from the previous audit is
  3.1M for 41 verifiers, or **75,600 each**, because real verifiers read more widely than
  the minimum. **Plan on 70,000 per verifier.**

Therefore, per discovery agent:

| | Cost |
|---|---|
| The discovery agent itself | 185,000 |
| Verifying its 15 findings, one verifier each | 15 x 70,000 = **1,050,000** |
| **All in, per discovery agent** | **1,235,000** |

**Verification costs 5.7 times discovery.** A 3-vote adversarial panel, which is what the
method recommends for anything load bearing, makes it 17 times.

The consequence is stark. A budget that buys 36 discovery agents buys only **11 discovery
agents that you can actually verify.** This session launched 36 and could verify none,
which was the correct call given where the budget stood but was avoidable by budgeting
backwards in the first place.

### The fix: verify the class, not the instance

540 findings cluster into roughly 40 distinct defects. The largest cluster in this
session's ledger is one defect reported by eleven independent squads. Verifying it once
settles all eleven.

| Verification policy | Verifier count | Cost | When to use |
|---|---|---|---|
| Per finding, single vote | 540 | 37.8M | Never affordable at this scale |
| Per finding, 3-vote panel | 1,620 | 113M | Only for a handful of load bearing claims |
| **Per cluster, single vote** | **~40** | **2.8M** | **The default** |
| Per cluster, 3-vote panel | ~120 | 8.4M | When the fix is expensive or irreversible |
| STREAM severity only, 3-vote | 129 | 9.0M | When you must ship and can only defend the worst |

**Cluster verification is 13 times cheaper than per finding and loses very little**,
because the clustering itself is done by the marshal in the main loop for nearly nothing.
Adopt it as the default and reserve per finding verification for claims that will drive
an expensive or irreversible fix.

### The backwards budgeting formula

```
total  =  A x ( 185,000  +  Y x V x 70,000 )

  A = number of discovery agents
  Y = findings per discovery agent      (measured: 15)
  V = verification policy multiplier    (1.0 per finding, 0.075 per cluster, x3 for a panel)
```

With cluster verification, `V = 0.075`, the all in cost per discovery agent falls from
1,235,000 to **263,000**, and a budget that bought 11 verifiable agents now buys 53.

---

## 5. Agent classes and standard timings

Use these as the menu when writing a work order. Duration assumes 20 agents in flight.

| Class | Artefacts | Tool calls | Duration | Tokens | What it is for |
|---|---|---|---|---|---|
| **Probe** | 2 to 4 | 5 to 8 | 3 to 6 min | 25 to 34k | Locate a symbol, confirm one fact, check one file |
| **Scout** | 6 to 10 | 12 to 20 | 8 to 14 min | 43 to 62k | Map a subsystem, answer a bounded question |
| **Verifier** | 6 to 10 | 15 to 25 | 10 to 18 min | 55 to 75k | Refute one finding or one cluster |
| **Analyst** | 15 to 22 | 30 to 45 | 20 to 30 min | 86 to 118k | Review a module, audit a document, judge a design |
| **Deep squad** | 26 to 36 | 55 to 75 | 40 to 55 min | 137 to 184k | One lens over one surface. This session's frame squads |
| **Danger zone** | 45+ | 90+ | 60+ min | 230k+ | Context death risk. Split it |

**Rule of thumb for a work order: budget a Deep squad at 185k and 50 minutes, a Verifier
at 70k and 15 minutes, a Scout at 55k and 12 minutes.** Those three cover most work.

---

## 6. What a five hour allowance actually buys

Observed cap: about **18M tokens** in a five hour window (this session spent roughly 17M
and had about 1M left).

| Line | Tokens |
|---|---|
| Hard cap | 18.0M |
| Less 10 per cent reserve so the session can always close | 1.8M |
| Less main loop: reading, committing, marshalling, report, waiting | 2.5M |
| **Available for agents** | **13.7M** |

At 185k per deep agent that is **74 deep agents**, or the equivalent mixed.

**Time is not the binding constraint; tokens are.** 74 deep agents at 20 in flight is 4
batches of 50 minutes, or 3 hours 20 minutes of agent time, inside a 4.5 hour session.
You will run out of budget before you run out of clock, which means **the schedule should
be built from the token budget and the clock checked afterwards**, not the other way
round.

---

## 7. A 4.5 hour work order template

Target: 4 hours 30 minutes, 13.7M agent tokens, close cleanly with reserve intact.

| Window | Phase | Agents | In flight | Tokens | Cumulative |
|---|---|---|---|---|---|
| 0:00 to 0:20 | Orientation, survey, save the brief, first commit | 0 | | 0.3M main loop | 0.3M |
| 0:20 to 1:10 | **Discovery wave 1**, 20 deep squads | 20 | 20 | 3.7M | 4.0M |
| 1:10 to 1:25 | Commit shards, marshal into clusters | 0 | | 0.3M | 4.3M |
| 1:25 to 2:15 | **Discovery wave 2**, 20 deep squads | 20 | 20 | 3.7M | 8.0M |
| 2:15 to 2:35 | Commit, cluster the full set | 0 | | 0.4M | 8.4M |
| 2:35 to 3:00 | **Verification**, 40 cluster verifiers | 40 | 20 | 2.8M | 11.2M |
| 3:00 to 3:30 | **Fix batch**, 8 analysts on unlocked smalls | 8 | 8 | 0.9M | 12.1M |
| 3:30 to 3:55 | **Re-proof** from fresh frames, 6 scouts | 6 | 6 | 0.4M | 12.5M |
| 3:55 to 4:20 | Gates, session report, archive | 0 | | 0.8M | 13.3M |
| 4:20 to 4:30 | Push, CI verify, owner preview, close | 0 | | 0.2M | 13.5M |
| | **RESERVE UNSPENT** | | | | **4.5M** |

**94 agents, 13.5M tokens, 4.5 hours, finishing with 4.5M of the 18M unspent.** That is
deliberately conservative: the reserve absorbs one bad wave without ending the session.

Note what changed against this session: **two discovery waves of 20 instead of one of 36,
with a commit and a marshal between them.** The gap between waves is the checkpoint, and
it is what lets you abandon wave 2 and still ship wave 1.

---

## 8. Starting and stopping: the gates

### 8.1 The launch gate

Do not launch a wave unless BOTH hold:

```
wave_duration   =  ceil(N / in_flight) x (artefacts x 80 s)
wave_duration   <  time_to_cap  -  30 min close reserve

wave_cost       =  N x (15,000 + artefacts x 4,700)
wave_cost       <  remaining_budget  -  1.8M reserve
```

The time gate is the one people skip. **An agent cannot be paused.** Once launched it
runs to completion or is killed. So the launch decision is the only decision, and it must
be made against the agent's FULL expected duration, not against how much time feels
available.

### 8.2 The three stop lines

- **T minus 60 minutes, or 4M remaining: no new discovery waves.** Only verification, fixes
  and closing work from here.
- **T minus 45 minutes, or 2.5M remaining: no new agents of any class.** Main loop only.
- **T minus 30 minutes, or 1.8M remaining: close.** Commit, report, push, verify CI,
  refresh preview.

### 8.3 The checkpoint rule, which makes stopping survivable

**Every agent must write its durable artefact at about 60 per cent of its expected life,
not at the end.**

This session's squads were ordered to write their shard the moment they finished looking
at frames and BEFORE opening any source file, with `Where fixable: UNKNOWN` allowed. The
source pass then rewrote the shard with `file:line` filled in.

The effect was measured: **before the change, three agents died and produced nothing.
After it, zero agents were lost across 36, and four late shards landed as step three
rewrites after the wave had already been committed.** A kill now costs the enrichment
pass, not the work.

Without this rule, stopping a wave costs everything in flight. With it, stopping costs at
most 40 per cent of one agent.

---

## 9. Idling: it is nearly free, so use it

**The main loop can idle for almost nothing. Agents cannot idle at all.**

An idle wait is one Bash call holding an `until` loop with a sleep inside:

```bash
T=$(date +%s); until <condition> || [ $(( $(date +%s) - T )) -gt 570 ]; do sleep 20; done
```

That is **one tool call per wait window**, about 1 to 2k tokens. Idling a full hour with
six such windows costs about 10k tokens, which is **0.06 per cent of a five hour
allowance**. Compare one deep agent at 185k.

So the answer to "can we idle for an hour" is yes, easily, and it is the cheapest thing
in the system. What you cannot do is idle an agent: there is no pause, only run or kill.

**Therefore the pause protocol is:**

1. Stop launching. This is the only real control.
2. `TaskStop` every running workflow. In flight agents die; checkpointed ones have already
   written their artefacts.
3. Commit everything on disk immediately, including partial shards, clearly labelled.
4. Idle the main loop in long windows (10 to 20 minutes each) until told to resume.
5. On resume, re-launch only the agents that did not check in, using the skip list
   pattern: a hardcoded list of completed ids filtered out of the squad build.

Wait windows should match what you are waiting for. Waiting on a workflow: 10 minutes.
Waiting on CI: 20 seconds inside an `until` on `gh run list`. Waiting on a human: 20 to
30 minutes. **Never poll a background task you will be notified about; use a long
fallback instead.**

---

## 10. Where this session's tokens actually went

The honest accounting, because it is the strongest argument in this document.

Measured: 6.60M across the three completed runs. The five abandoned runs reported no
usage, so their cost is derived from transcript bytes at **18,492 tokens per MB**,
calibrated on the three measured runs (357 MB against 6,601,691 tokens).

| | Agents | Tokens | Outcome |
|---|---|---|---|
| Final runs | 36 | **6.60M measured** | 47 shards, 540 findings |
| Attempt 1, context exhaustion | 23 | ~6.06M derived | **0 shards** |
| Attempt 2, the args bug | 33 | ~4.88M derived | 9 shards kept, ~1.33M of it useful |
| **Unrecoverable waste** | **56** | **~9.6M** | |

**Roughly 58 per cent of the session's agent spend produced nothing.** Two orchestration
errors, both preventable, both caught by reading transcripts rather than by anything
failing loudly:

1. **Agents sized at 52 frames instead of 26.** Cost about 6.06M. Preventable by the
   death threshold in section 3, which now exists because of it.
2. **A parameter that silently did not arrive**, so three workflows ran identical squads
   against identical shard paths. Cost about 3.55M net. Preventable by baking
   configuration in as a constant and by the verification step in section 11.

**Had neither happened, the same deliverable would have cost about 8M and left 10M for
verification**, which at cluster rates would have covered the verification pass, the fix
batch and the re-proof with room to spare. The session would have completed the brief.

That is the real lesson for forecasting: **the budget was never too small. It was spent
twice on the same work.**

---

## 11. The pre-launch checklist, which is cheap and would have saved 9.6M

Run this before every wave. It costs a minute and one tool call.

- [ ] **Artefact count per agent is stated and is under 40** (under 30 if images).
- [ ] **Expected cost computed** as `N x (15,000 + artefacts x 4,700)` and checked against
      remaining budget minus reserve.
- [ ] **Expected duration computed** as `ceil(N / in_flight) x artefacts x 80 s` and checked
      against time to cap minus 30 minutes.
- [ ] **The checkpoint instruction is in the prompt**: write the artefact at 60 per cent,
      before the expensive tail.
- [ ] **Per agent retry is wrapped**, and a lost agent is returned as LOST rather than
      omitted.
- [ ] **Configuration is baked in, not passed.** If a wave is parameterised, verify the
      parameter arrived: wait two minutes after launch and check that the running agents
      carry the ids you expect. **This single check would have caught the 3.55M error in
      under two minutes.**
- [ ] **Verification is budgeted at launch**, using section 4's formula, not discovered
      afterwards.

---

## 12. Quick reference card

```
COST      tokens   = 15,000 + artefacts x 4,700
TIME      duration = artefacts x 80 s          (at 20 agents in flight)
CALLS     calls    = artefacts x 2
DEATH     cap at 30 images / 40 artefacts / 90 tool calls

DEEP SQUAD   36 artefacts   185k   50 min
ANALYST      18 artefacts    99k   24 min
VERIFIER      8 artefacts    70k   15 min
SCOUT         8 artefacts    53k   11 min
PROBE         3 artefacts    29k    4 min

FIVE HOUR CAP        18.0M
  reserve 10%         1.8M
  main loop           2.5M
  AGENTS             13.7M   = 74 deep, or 195 verifiers, or a mix

VERIFICATION   15 findings per discovery agent
               70k per verifier
               per finding  = 5.7x the discovery cost
               per cluster  = 0.4x the discovery cost   <- use this

STOP LINES     no new waves   at T-60 min or 4.0M left
               no new agents  at T-45 min or 2.5M left
               close          at T-30 min or 1.8M left

IDLE           1 to 2k tokens per wait window. Effectively free.
               Agents cannot idle. Launch is the only control.
```
