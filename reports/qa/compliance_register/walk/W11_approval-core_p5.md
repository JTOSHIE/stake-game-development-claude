# W11: walk 10 requirements on the approval-core surface (part 5 of 5)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-037 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:58` | In social mode, never render "place your bets"; use "come and play" or "join in the game". |
| REQ-038 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:62` | In social mode, never render "currency"; use "token". |
| REQ-149 | PROCESS | NO | `approval_guidelines.md:18` | Name the exact frontend build and maths version in the approval request, and expect approval to bind to that pair only. |
| REQ-150 | PROCESS | NO | `approval_guidelines.md:20` | Write and submit a short theme-and-mechanics blurb alongside the approval request. |
| REQ-151 | PROCESS | NO | `approval_guidelines.md:32` | Submit only a finished build; work-in-progress submissions are out of order. |
| REQ-152 | PROCESS | NO | `approval_guidelines.md:34` | Treat the maths model, the mode list and the gameplay mechanics as frozen at approval; post-approval changes are limited to minor visual fixes. |
| REQ-153 | PROCESS | NO | `approval_guidelines_submission_checklist.md:18` | Clear every requirement before submitting; a partial submission is held rather than reviewed. |
| REQ-154 | PROCESS | NO | `approval_guidelines_submission_checklist.md:28` | The itemised approval criteria are behind a platform login and are NOT in this capture. The actual checklist items are UNKNOWN to this register and must be retrieved from a logged-in session before any squad claims coverage of them. |
| REQ-155 | PROCESS | NO | `approval_guidelines_submission_checklist.md:24` | Retrieve the criteria list that applies to this team's own trust level, because the applicable set is not fixed across teams. |
| REQ-156 | PROCESS | NO | `approval_guidelines_submission_checklist.md:32,34,35` | The build must average at least 1 star over three independent reviewers across design, gameplay and maths compliance, or it is rejected. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-037

- source: `approval_guidelines_jurisdiction_requirements.md:58`
- platform text, verbatim: "place your bets" "come and play / join in the game"
- what it requires: In social mode, never render "place your bets"; use "come and play" or "join in the game".

### REQ-038

- source: `approval_guidelines_jurisdiction_requirements.md:62`
- platform text, verbatim: "currency" "token"
- what it requires: In social mode, never render "currency"; use "token".

### REQ-149

- source: `approval_guidelines.md:18`
- platform text, verbatim: "Approval requests will be actioned for a specific frontend and math version."
- what it requires: Name the exact frontend build and maths version in the approval request, and expect approval to bind to that pair only.

### REQ-150

- source: `approval_guidelines.md:20`
- platform text, verbatim: "Approval requests must be accompanied by a short blurb describing your game theme and mechanics for use in promotional material and the game description tag."
- what it requires: Write and submit a short theme-and-mechanics blurb alongside the approval request.

### REQ-151

- source: `approval_guidelines.md:32`
- platform text, verbatim: "Ensure that when submitting a review request, the game is finalized and ready for publication."
- what it requires: Submit only a finished build; work-in-progress submissions are out of order.

### REQ-152

- source: `approval_guidelines.md:34`
- platform text, verbatim: "Once a game has been approved for publication on Stake/Stake-US, only minor updates to address visual issues are permitted, unless otherwise requested by the Stake Engine team. Changes to the underlying math model, the addition of new game modes, or modifications to gameplay mechanics will not be allowed."
- what it requires: Treat the maths model, the mode list and the gameplay mechanics as frozen at approval; post-approval changes are limited to minor visual fixes.

### REQ-153

- source: `approval_guidelines_submission_checklist.md:18`
- platform text, verbatim: "Incomplete submissions cause delays — games that do not meet all requirements will be held until the issues are resolved, which may push your go-live date back significantly." (em dash is upstream)
- what it requires: Clear every requirement before submitting; a partial submission is held rather than reviewed.

### REQ-154

- source: `approval_guidelines_submission_checklist.md:28`
- platform text, verbatim: "You must be logged in to view the approval guidelines."
- what it requires: The itemised approval criteria are behind a platform login and are NOT in this capture. The actual checklist items are UNKNOWN to this register and must be retrieved from a logged-in session before any squad claims coverage of them.

### REQ-155

- source: `approval_guidelines_submission_checklist.md:24`
- platform text, verbatim: "The checklist below reflects the exact criteria your game will be reviewed against. Requirements may vary based on your team’s trust level."
- what it requires: Retrieve the criteria list that applies to this team's own trust level, because the applicable set is not fixed across teams.

### REQ-156

- source: `approval_guidelines_submission_checklist.md:32,34,35`
- platform text, verbatim: "Each reviewer rates your game from 0 to 3 stars across design, gameplay, and math compliance." "Average ≥ 1 star → Game is approved for production." "Average < 1 star → Game is rejected." (three sentences joined from lines 32, 34 and 35 with single spaces)
- what it requires: The build must average at least 1 star over three independent reviewers across design, gameplay and maths compliance, or it is rejected.

