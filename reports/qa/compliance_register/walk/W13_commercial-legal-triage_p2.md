# W13: walk 9 requirements on the commercial-legal-triage surface (part 2 of 4)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-142 | ARTEFACT | YES | `terms.md:263+273` | Nothing in the shipped game may embarrass Carrot or Stake; this is the clause a machine-generated-looking string, a placeholder or an off-brand asset would be judged under. |
| REQ-143 | ARTEFACT | NO | `terms.md:355` | Prove no GPL or other copyleft dependency is bundled into, compiled with or linked to the shipped build, and that every third-party licence in the tree is complied with. |
| REQ-144 | ARTEFACT | NO | `terms.md:353` | Same conformance obligation as R9-03, stated as a warranty with a remedy: on written notice we must change the game to match the documentation. |
| REQ-145 | ARTEFACT | NO | `terms.md:301+305` | The game's software must not obstruct the operator's source-of-funds and identity checks, so wallet and session handling has to leave those platform processes intact. |
| REQ-146 | ARTEFACT | NO | `terms.md:666` | The shipped game must not collect, store or transmit player personal data to us: no studio-side analytics, telemetry or logging endpoint carrying player data. |
| REQ-147 | ARTEFACT | YES | `giveaway_terms.md:46` | The submitted game must be original, guideline-compliant, non-infringing and free of unlawful, offensive or defamatory content; the competition rules re-impose the terms' content standard as an entry condition. |
| REQ-148 | ARTEFACT | YES | `giveaway_terms.md:80` | An entry that reads as produced by unauthorised automated tooling, AI generation or plagiarism can be disqualified on SUSPICION, so machine-generated tells in shipped strings and assets are a disqualification risk, not merely a quality one. |
| REQ-177 | PROCESS | NO | `terms.md:295` | Budget for a fix-or-workaround loop during acceptance testing, at our own cost. |
| REQ-178 | PROCESS | NO | `terms.md:293` | Written notification to Carrot the moment we detect a defect, including ones we find ourselves after submission. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-142

- source: `terms.md:263+273`
- platform text, verbatim: "a. The Developer shall not under any circumstances: (v) knowingly include in the Game any material that could adversely affect Carrot or any of its Affiliate's name, image or reputation." (JOINED from lines 263 and 273 with a single space)
- what it requires: Nothing in the shipped game may embarrass Carrot or Stake; this is the clause a machine-generated-looking string, a placeholder or an off-brand asset would be judged under.

### REQ-143

- source: `terms.md:355`
- platform text, verbatim: "to the extent that the Game includes any third-party software, including software licensed under licenses known as \"free\" or \"open source\" (or equivalent), the Developer warrants that it fully complies with all terms of such third-party licenses; the Developer has not included or used any software licensed under the General Public Licence or any similar open source licence containing a \"copyleft\" requirement (\"Restrictive Open Source Code\") in, or in the development, or, the Game, nor does the Game operate in such a way that it is compiled with or linked to any Restrictive Open Source Code."
- what it requires: Prove no GPL or other copyleft dependency is bundled into, compiled with or linked to the shipped build, and that every third-party licence in the tree is complied with.

### REQ-144

- source: `terms.md:353`
- platform text, verbatim: "the Game will operate in accordance with the Game Documentation. In the event that it does not, and upon receiving written notice from Carrot, the Developer will modify and / or update the Game to make it perform in accordance with the Game Documentation;"
- what it requires: Same conformance obligation as R9-03, stated as a warranty with a remedy: on written notice we must change the game to match the documentation.

### REQ-145

- source: `terms.md:301+305`
- platform text, verbatim: "a. The Developer shall: ii. ensure that the Game's underlying software facilitates all necessary processes to enable Stake (or relevant third-party provider) to determine the source of funds of Players and verify the identity of such individuals;" (JOINED from lines 301 and 305 with a single space)
- what it requires: The game's software must not obstruct the operator's source-of-funds and identity checks, so wallet and session handling has to leave those platform processes intact.

### REQ-146

- source: `terms.md:666`
- platform text, verbatim: "The Developer shall not process any personal data of Players of the Game and shall have no access to such data in the course of this Agreement, except where such access or processing is strictly necessary for the purpose of performing maintenance, updates, or corrections to the Game. In such limited cases, the Developer shall act as a data processor on behalf of Carrot and/or its Affiliates and shall comply with its obligations under Data Protection Legislation applicable to processors."
- what it requires: The shipped game must not collect, store or transmit player personal data to us: no studio-side analytics, telemetry or logging endpoint carrying player data.

### REQ-147

- source: `giveaway_terms.md:46`
- platform text, verbatim: "Submitted games must: (a) be an original work created by you; (b) comply with Stake Engine's content and technical submission guidelines; (c) not infringe any third-party intellectual property rights; and (d) not contain unlawful, offensive or defamatory content or otherwise breach the Stake Engine Terms and Conditions."
- what it requires: The submitted game must be original, guideline-compliant, non-infringing and free of unlawful, offensive or defamatory content; the competition rules re-impose the terms' content standard as an entry condition.

### REQ-148

- source: `giveaway_terms.md:80`
- platform text, verbatim: "The Promoter reserves the right to: (b) disqualify any entry suspected of being created using unauthorized automated tools, AI generation or plagiarism without the original creator's consent;" (clause stem and sub-item (b) are both on line 80; the intervening sub-item (a), which disqualifies entrants whose conduct brings Stake Engine into disrepute, is elided and nothing else is altered)
- what it requires: An entry that reads as produced by unauthorised automated tooling, AI generation or plagiarism can be disqualified on SUSPICION, so machine-generated tells in shipped strings and assets are a disqualification risk, not merely a quality one.

### REQ-177

- source: `terms.md:295`
- platform text, verbatim: "The Developer shall, in line with Good Industry Practice, correct any Errors discovered during acceptance testing. If this is not reasonably possible, the Developer shall work around the Error at its own expense. If the Error is so significant that, due to the Error, the purpose of the Agreement remains essentially unfulfilled, then clause 7.1 applies."
- what it requires: Budget for a fix-or-workaround loop during acceptance testing, at our own cost.

### REQ-178

- source: `terms.md:293`
- platform text, verbatim: "The Developer shall immediately notify Carrot in writing of any Errors it has detected in the services."
- what it requires: Written notification to Carrot the moment we detect a defect, including ones we find ourselves after submission.

