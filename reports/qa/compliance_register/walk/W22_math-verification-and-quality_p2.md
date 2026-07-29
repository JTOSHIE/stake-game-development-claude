# W22: walk 7 requirements on the math-verification-and-quality surface (part 2 of 2)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-048 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:44` | 3-star rating only: verify rendering across a range of devices and screen sizes, with no lag and no low-quality audio. |
| REQ-049 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:45` | 3-star rating only: keep the shipped bundle small, with no oversized assets slowing first load. |
| REQ-050 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:46` | 3-star rating only: animations and art must be clean, cohesive and professionally executed. |
| REQ-051 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:47` | 3-star rating and Burst-category games only: the concept itself must have depth and execution, benchmarked upstream against Cut n Crash, Angry Balls and Drop the Boss. Does not bind a non-Burst slot submission. |
| REQ-157 | PROCESS | NO | `approval_guidelines_math_verification.md:24` | Treat the two size caps as publish-time blockers, so the size check happens before upload rather than after a failed publish. |
| REQ-158 | PROCESS | NO | `approval_guidelines_math_verification.md:38` | Report the count of non-zero weight payouts as part of the submitted maths evidence. |
| REQ-159 | PROCESS | NO | `approval_guidelines_game_quality_rankings.md:31` | A 1-star outcome blocks publication and forces a rework and resubmission cycle, so the submission must clear 1 star to ship at all. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-048

- source: `approval_guidelines_game_quality_rankings.md:44`
- platform text, verbatim: "Tested on a range of devices — renders correctly across screen sizes with no laggy or low-quality sounds."
- what it requires: 3-star rating only: verify rendering across a range of devices and screen sizes, with no lag and no low-quality audio.

### REQ-049

- source: `approval_guidelines_game_quality_rankings.md:45`
- platform text, verbatim: "Optimised bundle size — avoid large assets; games that take a long time to load create poor experiences for players."
- what it requires: 3-star rating only: keep the shipped bundle small, with no oversized assets slowing first load.

### REQ-050

- source: `approval_guidelines_game_quality_rankings.md:46`
- platform text, verbatim: "Clean animations and art — cohesive visual style with polished, professional execution."
- what it requires: 3-star rating only: animations and art must be clean, cohesive and professionally executed.

### REQ-051

- source: `approval_guidelines_game_quality_rankings.md:47`
- platform text, verbatim: "A Burst game must be well-executed in concept to achieve 3 stars."
- what it requires: 3-star rating and Burst-category games only: the concept itself must have depth and execution, benchmarked upstream against Cut n Crash, Angry Balls and Drop the Boss. Does not bind a non-Burst slot submission.

### REQ-157

- source: `approval_guidelines_math_verification.md:24`
- platform text, verbatim: "Files/modes exceeding this size will fail on publish."
- what it requires: Treat the two size caps as publish-time blockers, so the size check happens before upload rather than after a failed publish.

### REQ-158

- source: `approval_guidelines_math_verification.md:38`
- platform text, verbatim: "List the number of non-zero weight payouts."
- what it requires: Report the count of non-zero weight payouts as part of the submitted maths evidence.

### REQ-159

- source: `approval_guidelines_game_quality_rankings.md:31`
- platform text, verbatim: "Not published. The developer will be asked to resubmit once improvements have been made."
- what it requires: A 1-star outcome blocks publication and forces a rework and resubmission cycle, so the submission must clear 1 star to ship at all.

