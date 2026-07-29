# W12: walk 9 requirements on the commercial-legal-triage surface (part 1 of 4)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-133 | ARTEFACT | YES | `terms.md:363+365` | The shipped game must be fully functional at the activation date, with no non-working feature or dead control. |
| REQ-134 | ARTEFACT | UNKNOWN | `terms.md:363+367` | Build to every written Stake Engine technical specification, and treat later written specs as binding on the shipped game. |
| REQ-135 | ARTEFACT | NO | `terms.md:363+369` | The game's runtime behaviour must match the documentation handed to Carrot, so the docs and the build cannot diverge. |
| REQ-136 | ARTEFACT | NO | `terms.md:363+371` | Ship free of malware and of defects affecting proper functioning, and actually run anti-virus and anti-malware screening over the artefact before submission. |
| REQ-137 | ARTEFACT | YES | `terms.md:363+373` | No Prohibited Content anywhere in the game, including references to it; see R9-06 for the definition that binds this. |
| REQ-138 | ARTEFACT | YES | `terms.md:112` | Audit every shipped string, symbol, sound and marketing asset against these four categories, including third-party IP infringement. |
| REQ-139 | ARTEFACT | NO | `terms.md:363+375` | Run and record a security pass over the shipped bundle and its dependencies, and remove what it finds. |
| REQ-140 | ARTEFACT | YES | `terms.md:363+377` | What the player sees on the reels, in win presentation and on the paytable must be the same event the maths package emitted, with no drift between the two. |
| REQ-141 | ARTEFACT | YES | `terms.md:363+379` | The submitted title must be materially distinct from anything already uploaded, not a reskin; also blocks submitting a second near-identical build of our own. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-133

- source: `terms.md:363+365`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: i. is fully functional;" (JOINED from lines 363 and 365 with a single space)
- what it requires: The shipped game must be fully functional at the activation date, with no non-working feature or dead control.

### REQ-134

- source: `terms.md:363+367`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: ii. is compliant with all technical specifications advised by Carrot and / or its Affiliates from time to time in writing;" (JOINED from lines 363 and 367 with a single space)
- what it requires: Build to every written Stake Engine technical specification, and treat later written specs as binding on the shipped game.

### REQ-135

- source: `terms.md:363+369`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: iii. operates in conformance with the Game Documentation;" (JOINED from lines 363 and 369 with a single space)
- what it requires: The game's runtime behaviour must match the documentation handed to Carrot, so the docs and the build cannot diverge.

### REQ-136

- source: `terms.md:363+371`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: iv. is not affected by any Disabling Devices or Errors, and the Developer has, in accordance with Good Industry Practice, used all anti-virus and anti-malware software to screen the Game to ensure that it is not subject to any Disabling Devices or Errors;" (JOINED from lines 363 and 371 with a single space)
- what it requires: Ship free of malware and of defects affecting proper functioning, and actually run anti-virus and anti-malware screening over the artefact before submission.

### REQ-137

- source: `terms.md:363+373`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: v. does not incorporate, contain or refer to any Prohibited Content;" (JOINED from lines 363 and 373 with a single space)
- what it requires: No Prohibited Content anywhere in the game, including references to it; see R9-06 for the definition that binds this.

### REQ-138

- source: `terms.md:112`
- platform text, verbatim: "means advertising or content that: (a) promotes pornographic material or is lewd, profane, obscene, unlawful; (b) is defamatory, libellous, discriminatory or constitutes \"hate speech\"; (c) infringes the rights (including the Intellectual Property Rights) of third parties; and/or (d) incites or encourages racism." (definition of the term "Prohibited Content"; the capture's table pipe before "means" is trimmed)
- what it requires: Audit every shipped string, symbol, sound and marketing asset against these four categories, including third-party IP infringement.

### REQ-139

- source: `terms.md:363+375`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: vi. does not contain any known vulnerabilities or latent vulnerabilities and that all reasonable efforts have been made to identify and remove any such issues in accordance with Good Industry Practice;" (JOINED from lines 363 and 375 with a single space)
- what it requires: Run and record a security pass over the shipped bundle and its dependencies, and remove what it finds.

### REQ-140

- source: `terms.md:363+377`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: vii. visuals align and are synchronised with the Game math; and" (JOINED from lines 363 and 377 with a single space)
- what it requires: What the player sees on the reels, in win presentation and on the paytable must be the same event the maths package emitted, with no drift between the two.

### REQ-141

- source: `terms.md:363+379`
- platform text, verbatim: "a. The Developer warrants that at the Commencement Date, the Game: viii. is not substantially similar to any game previously uploaded to the Website, including without limitation games that differ only in minor respects such as visual elements or cosmetic changes." (JOINED from lines 363 and 379 with a single space)
- what it requires: The submitted title must be materially distinct from anything already uploaded, not a reskin; also blocks submitting a second near-identical build of our own.

