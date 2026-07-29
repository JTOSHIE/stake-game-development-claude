# W21: walk 9 requirements on the math-verification-and-quality surface (part 1 of 2)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-039 | ARTEFACT | YES | `approval_guidelines_math_verification.md:29` | State each mode's cost in the in-game rules and make it match the maths package cost for that mode. |
| REQ-040 | ARTEFACT | YES | `approval_guidelines_math_verification.md:30` | Make the max win figure printed in the game rules equal the maths package max win, per mode. |
| REQ-041 | ARTEFACT | YES | `approval_guidelines_math_verification.md:69` | Never submit a bet above 500,000 USD, so the bet ladder and any buy cost must stay at or under that ceiling or the round errors with 400. |
| REQ-042 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:23` | 3-star rating only: the build must read as studio quality on creativity, uniqueness and detail, which is the gate to the looser 3-star maths limits and to featured placement. |
| REQ-043 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:26` | 2-star rating only: the build must show considerable creativity or originality plus strong development quality, with polish allowed to trail established studios. |
| REQ-044 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:36` | Provide enough gameplay depth that a player keeps betting past the first spin or two; shallow depth is a named cause of a 1-star or lower rating. |
| REQ-045 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:37` | Do not ship generic machine-made looking assets: no default fonts, plain gradients, emoji icons or border effects standing in for real art. |
| REQ-046 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:38` | Keep one coherent art style across every surface and hold animation quality up; mismatched styles are a named cause of a low rating. |
| REQ-047 | ARTEFACT | YES | `approval_guidelines_game_quality_rankings.md:39` | Ship at least one real bonus mode plus additional mechanics; their absence is a named cause of a low rating. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-039

- source: `approval_guidelines_math_verification.md:29`
- platform text, verbatim: "Verify the mode cost is correctly represented in the game rules for each mode."
- what it requires: State each mode's cost in the in-game rules and make it match the maths package cost for that mode.

### REQ-040

- source: `approval_guidelines_math_verification.md:30`
- platform text, verbatim: "Ensure the maximum win amount matches the description in the game rules for each mode."
- what it requires: Make the max win figure printed in the game rules equal the maths package max win, per mode.

### REQ-041

- source: `approval_guidelines_math_verification.md:69`
- platform text, verbatim: "The maximum bet-size accepted by the RGS is $500,000 USD, any bet size beyond this limit will return error code: 400 ("invalid bet amount")"
- what it requires: Never submit a bet above 500,000 USD, so the bet ladder and any buy cost must stay at or under that ceiling or the round errors with 400.

### REQ-042

- source: `approval_guidelines_game_quality_rankings.md:23`
- platform text, verbatim: "Awarded only to studio-quality games showing exceptional creativity, uniqueness and attention to detail."
- what it requires: 3-star rating only: the build must read as studio quality on creativity, uniqueness and detail, which is the gate to the looser 3-star maths limits and to featured placement.

### REQ-043

- source: `approval_guidelines_game_quality_rankings.md:26`
- platform text, verbatim: "Given to games that show considerable creativity or originality. While they may lack polish compared to more established studios, they still demonstrate strong development quality and attention to detail."
- what it requires: 2-star rating only: the build must show considerable creativity or originality plus strong development quality, with polish allowed to trail established studios.

### REQ-044

- source: `approval_guidelines_game_quality_rankings.md:36`
- platform text, verbatim: "Shallow gameplay with limited depth — players typically place only 1–2 bets before losing interest."
- what it requires: Provide enough gameplay depth that a player keeps betting past the first spin or two; shallow depth is a named cause of a 1-star or lower rating.

### REQ-045

- source: `approval_guidelines_game_quality_rankings.md:37`
- platform text, verbatim: "Over-reliance on generic AI-generated assets — standard fonts, gradients, emoji icons, and border effects are not sufficient for a quality release."
- what it requires: Do not ship generic machine-made looking assets: no default fonts, plain gradients, emoji icons or border effects standing in for real art.

### REQ-046

- source: `approval_guidelines_game_quality_rankings.md:38`
- platform text, verbatim: "Inconsistent or low-quality visual design — mismatched art styles and poor animation quality significantly impact the player experience."
- what it requires: Keep one coherent art style across every surface and hold animation quality up; mismatched styles are a named cause of a low rating.

### REQ-047

- source: `approval_guidelines_game_quality_rankings.md:39`
- platform text, verbatim: "Missing engaging features — bonus modes and additional game mechanics significantly enhance player retention and are expected in competitive submissions."
- what it requires: Ship at least one real bonus mode plus additional mechanics; their absence is a named cause of a low rating.

